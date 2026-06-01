<template>
  <div class="game-card">

    <!-- ── Ending Choice ─────────────────────────────────────── -->
    <template v-if="ex.type === 'ending-choice'">
      <p class="game-card__prompt">{{ ex.prompt }}</p>
      <p class="game-card__hint">{{ ex.hint_es }}</p>
      <div class="game-card__options">
        <button
          v-for="opt in ex.options"
          :key="opt"
          class="game-card__btn"
          :class="btnClass(opt, ex.answer)"
          :disabled="answered"
          @click="submit(opt)"
        >
          — {{ opt || '∅' }}
        </button>
      </div>
    </template>

    <!-- ── Case Choice ───────────────────────────────────────── -->
    <template v-else-if="ex.type === 'case-choice'">
      <p class="game-card__prompt">{{ ex.prompt }}</p>
      <p class="game-card__hint">{{ ex.hint_es }}</p>
      <div class="game-card__options">
        <button
          v-for="opt in ex.options"
          :key="opt"
          class="game-card__btn"
          :class="btnClass(opt, ex.answer)"
          :disabled="answered"
          @click="submit(opt)"
        >
          {{ opt }}
        </button>
      </div>
    </template>

    <!-- ── Transform ─────────────────────────────────────────── -->
    <template v-else-if="ex.type === 'transform'">
      <p class="game-card__prompt">
        {{ t('game.transformPrompt', { word: ex.nominative }) }}
        <span class="game-card__case-tag">{{ t(`selector.cases.${ex.targetCase}`) }}</span>
      </p>
      <p class="game-card__hint">{{ ex.hint_es }}</p>
      <input
        v-model="textInput"
        class="game-card__input"
        :class="{ correct: answered && isCorrect, wrong: answered && !isCorrect }"
        :placeholder="t('game.check') + '...'"
        :disabled="answered"
        @keyup.enter="submit(textInput)"
      />
      <button class="game-card__submit" :disabled="answered || !textInput" @click="submit(textInput)">
        {{ t('game.check') }}
      </button>
      <p v-if="answered && !isCorrect" class="game-card__answer-reveal">
        {{ t('game.correctAnswer') }} <strong>{{ ex.answer }}</strong>
      </p>
    </template>

    <!-- ── Order Blocks ───────────────────────────────────────── -->
    <template v-else-if="ex.type === 'order-blocks'">
      <p class="game-card__label">{{ t('game.orderPrompt') }}</p>
      <p class="game-card__hint">{{ ex.hint_es }}</p>
      <div class="game-card__drop-zone">
        <span
          v-for="(word, i) in selected"
          :key="i"
          class="game-card__block game-card__block--selected"
          @click="!answered && removeBlock(i)"
        >{{ word }}</span>
      </div>
      <div class="game-card__blocks">
        <span
          v-for="(word, i) in available"
          :key="i"
          class="game-card__block"
          @click="!answered && pickBlock(i)"
        >{{ word }}</span>
      </div>
      <button
        class="game-card__submit"
        :disabled="answered || selected.length === 0"
        @click="submit(selected.join(' '))"
      >{{ t('game.check') }}</button>
      <p v-if="answered && !isCorrect" class="game-card__answer-reveal">
        {{ t('game.correctAnswer') }} <strong>{{ ex.answer }}</strong>
      </p>
    </template>

    <!-- ── Mini Story ─────────────────────────────────────────── -->
    <template v-else-if="ex.type === 'mini-story'">
      <p class="game-card__label">{{ t('game.storyPrompt') }}</p>
      <div class="game-card__story">
        <p v-for="(line, i) in storyLines" :key="i" class="game-card__story-line">
          <template v-for="(part, j) in line" :key="j">
            <span v-if="part.type === 'text'">{{ part.text }}</span>
            <input
              v-else
              v-model="storyInputs[part.blankIndex]"
              class="game-card__inline-input"
              :class="{
                correct: answered && storyInputs[part.blankIndex]?.toLowerCase() === ex.blanks[part.blankIndex].answer.toLowerCase(),
                wrong:   answered && storyInputs[part.blankIndex]?.toLowerCase() !== ex.blanks[part.blankIndex].answer.toLowerCase(),
              }"
              :placeholder="ex.blanks[part.blankIndex].nominative"
              :disabled="answered"
            />
          </template>
        </p>
      </div>
      <button
        class="game-card__submit"
        :disabled="answered || storyInputs.some(s => !s)"
        @click="submit(storyInputs.join('|'))"
      >{{ t('game.check') }}</button>
      <div v-if="answered && !isCorrect" class="game-card__answer-reveal">
        <span v-for="(b, i) in ex.blanks" :key="i">
          {{ b.nominative }} → <strong>{{ b.answer }}</strong>&nbsp;
        </span>
      </div>
    </template>

    <!-- ── Feedback ───────────────────────────────────────────── -->
    <FeedbackBox
      v-if="answered"
      :message="isCorrect ? t('game.correct') : t('game.incorrect')"
      :correct="isCorrect"
      :incorrect="!isCorrect"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import FeedbackBox from './FeedbackBox.vue'
import type { Exercise, MiniStoryExercise, OrderBlocksExercise } from '../generators/types'

const { t } = useI18n()

const props = defineProps<{ exercise: Exercise }>()
const emit  = defineEmits<{ (e: 'answer', userAnswer: string): void }>()

const ex = computed(() => props.exercise)

const answered   = ref(false)
const isCorrect  = ref(false)
const textInput  = ref('')
const available  = ref<string[]>([])
const selected   = ref<string[]>([])
const storyInputs = ref<string[]>([])

// ── Story parser ─────────────────────────────────────────────────────────────
type LinePart = { type: 'text'; text: string } | { type: 'blank'; blankIndex: number }
const storyLines = computed((): LinePart[][] => {
  if (ex.value.type !== 'mini-story') return []
  let blankCount = 0
  return (ex.value as MiniStoryExercise).story.map(sentence => {
    const parts: LinePart[] = []
    const chunks = sentence.split('{blank}')
    chunks.forEach((chunk, i) => {
      if (chunk) parts.push({ type: 'text', text: chunk })
      if (i < chunks.length - 1) parts.push({ type: 'blank', blankIndex: blankCount++ })
    })
    return parts
  })
})

// ── Reset on new exercise ─────────────────────────────────────────────────────
watch(() => props.exercise, () => {
  answered.value  = false
  isCorrect.value = false
  textInput.value = ''
  if (ex.value.type === 'order-blocks') {
    available.value = [...(ex.value as OrderBlocksExercise).blocks]
    selected.value  = []
  }
  if (ex.value.type === 'mini-story') {
    storyInputs.value = Array((ex.value as MiniStoryExercise).blanks.length).fill('')
  }
}, { immediate: true })

// ── Order blocks ──────────────────────────────────────────────────────────────
function pickBlock(i: number) {
  selected.value.push(available.value[i])
  available.value.splice(i, 1)
}
function removeBlock(i: number) {
  available.value.push(selected.value[i])
  selected.value.splice(i, 1)
}

// ── Submit ────────────────────────────────────────────────────────────────────
function submit(userAnswer: string) {
  if (answered.value) return
  const n = (s: string) => s.trim().toLowerCase()
  const e = ex.value
  let correct = false

  if (e.type === 'mini-story') {
    const parts = userAnswer.split('|').map(n)
    correct = (e as MiniStoryExercise).blanks.every((b, i) => parts[i] === n(b.answer))
  } else {
    correct = n(userAnswer) === n((e as any).answer)
  }

  answered.value  = true
  isCorrect.value = correct
  emit('answer', userAnswer)
}

function btnClass(opt: string, answer: string) {
  if (!answered.value) return ''
  return opt === answer ? 'correct' : 'wrong'
}
</script>

<style scoped>
.game-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
}
.game-card__prompt {
  font-size: 1.4rem;
  font-weight: 700;
  color: #e2e8f0;
  text-align: center;
  line-height: 1.6;
}
.game-card__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.game-card__hint {
  font-size: 0.9rem;
  color: #64748b;
  text-align: center;
  font-style: italic;
}
.game-card__case-tag {
  background: #312e81;
  color: #a5b4fc;
  padding: 0.1rem 0.5rem;
  border-radius: 6px;
  font-size: 0.85rem;
}
.game-card__options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.game-card__btn {
  padding: 0.75rem 1rem;
  border: 2px solid #334155;
  border-radius: 10px;
  background: #0f172a;
  color: #cbd5e1;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.game-card__btn:hover:not(:disabled) { border-color: #6366f1; color: #a5b4fc; }
.game-card__btn.correct { border-color: #22c55e; background: #14532d; color: #bbf7d0; }
.game-card__btn.wrong   { border-color: #ef4444; background: #450a0a; color: #fecaca; }

.game-card__input {
  padding: 0.75rem 1rem;
  border: 2px solid #334155;
  border-radius: 10px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 1.1rem;
  width: 100%;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s;
}
.game-card__input:focus  { border-color: #6366f1; }
.game-card__input.correct { border-color: #22c55e; background: #14532d; }
.game-card__input.wrong   { border-color: #ef4444; background: #450a0a; }

.game-card__submit {
  padding: 0.75rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.game-card__submit:hover:not(:disabled) { background: #4f46e5; }
.game-card__submit:disabled { opacity: 0.4; cursor: default; }

.game-card__drop-zone {
  min-height: 3rem;
  border: 2px dashed #475569;
  border-radius: 10px;
  padding: 0.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  background: #0f172a;
}
.game-card__blocks { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.game-card__block {
  padding: 0.4rem 0.75rem;
  background: #1e3a5f;
  border: 2px solid #3b82f6;
  border-radius: 8px;
  color: #93c5fd;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
}
.game-card__block--selected { background: #1e40af; border-color: #60a5fa; }

.game-card__story { display: flex; flex-direction: column; gap: 0.5rem; }
.game-card__story-line { color: #cbd5e1; font-size: 1.05rem; line-height: 2; }
.game-card__inline-input {
  width: 9rem;
  padding: 0.2rem 0.5rem;
  border: 2px solid #475569;
  border-radius: 6px;
  background: #0f172a;
  color: #e2e8f0;
  font-size: 1rem;
  outline: none;
  margin: 0 0.2rem;
}
.game-card__inline-input.correct { border-color: #22c55e; background: #14532d; }
.game-card__inline-input.wrong   { border-color: #ef4444; background: #450a0a; }

.game-card__answer-reveal {
  font-size: 0.9rem;
  color: #94a3b8;
  text-align: center;
}
.game-card__answer-reveal strong { color: #a5b4fc; }
</style>
