<template>
  <div class="aspect-game">
    <div class="aspect-game__inner">

      <!-- Header -->
      <div class="aspect-game__header">
        <button class="aspect-game__back" @click="router.push('/aspect')">{{ t('nav.exit') }}</button>
        <div class="aspect-game__stats">
          <span class="stat">⭐ {{ store.score }}</span>
          <span class="stat stat--streak" v-if="store.streak > 1">🔥 {{ store.streak }}</span>
        </div>
        <span class="aspect-game__counter">{{ store.currentIndex + 1 }} / {{ store.total }}</span>
      </div>

      <!-- Progress bar -->
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: store.progress + '%' }" />
      </div>

      <!-- Exercise card -->
      <div class="exercise-card" v-if="ex">

        <!-- ── Guess the Aspect ──────────────────────── -->
        <template v-if="ex.type === 'guess-aspect'">
          <p class="ex__label">{{ t('aspect.game.guessPrompt') }}</p>
          <p class="ex__verb">{{ ex.verb }}</p>
          <p class="ex__hint">{{ ex.meaning_es }}</p>
          <div class="ex__two-btns">
            <button
              class="aspect-btn aspect-btn--nsv"
              :class="btnClass('НСВ', ex.aspect)"
              :disabled="answered"
              @click="submit('НСВ')"
            >НСВ</button>
            <button
              class="aspect-btn aspect-btn--sv"
              :class="btnClass('СВ', ex.aspect)"
              :disabled="answered"
              @click="submit('СВ')"
            >СВ</button>
          </div>
          <div v-if="answered" class="ex__explanation">{{ ex.explanation_es }}</div>
        </template>

        <!-- ── Find the Pair ────────────────────────── -->
        <template v-else-if="ex.type === 'find-pair'">
          <p class="ex__label">
            {{ t('aspect.game.pairPrompt') }}
            <span class="aspect-tag" :class="ex.aspect === 'НСВ' ? 'aspect-tag--nsv' : 'aspect-tag--sv'">{{ ex.aspect }}</span>
          </p>
          <p class="ex__verb">{{ ex.verb }}</p>
          <p class="ex__hint">{{ ex.meaning_es }}</p>
          <div class="ex__options">
            <button
              v-for="opt in ex.options"
              :key="opt"
              class="opt-btn"
              :class="optBtnClass(opt, ex.answer)"
              :disabled="answered"
              @click="submit(opt)"
            >{{ opt }}</button>
          </div>
        </template>

        <!-- ── Complete the Sentence ────────────────── -->
        <template v-else-if="ex.type === 'complete-sentence'">
          <p class="ex__label">{{ t('aspect.game.completePrompt') }}</p>
          <p class="ex__sentence">
            <span v-for="(part, i) in sentenceParts" :key="i">
              <span v-if="part.type === 'text'">{{ part.text }}</span>
              <span v-else class="ex__blank">___</span>
            </span>
          </p>
          <p class="ex__hint">{{ ex.hint_es }}</p>
          <p class="ex__clue">{{ t('aspect.game.clue') }}: <strong>{{ ex.clue }}</strong></p>
          <div class="ex__two-btns">
            <button
              class="opt-btn opt-btn--wide"
              :class="optBtnClass(ex.options[0], ex.answer)"
              :disabled="answered"
              @click="submit(ex.options[0])"
            >{{ ex.options[0] }}<span class="opt-btn__tag opt-btn__tag--nsv">НСВ</span></button>
            <button
              class="opt-btn opt-btn--wide"
              :class="optBtnClass(ex.options[1], ex.answer)"
              :disabled="answered"
              @click="submit(ex.options[1])"
            >{{ ex.options[1] }}<span class="opt-btn__tag opt-btn__tag--sv">СВ</span></button>
          </div>
          <div v-if="answered" class="ex__explanation">{{ ex.explanation_es }}</div>
        </template>

        <!-- ── Feedback ──────────────────────────────── -->
        <div v-if="answered" class="feedback" :class="isCorrect ? 'feedback--correct' : 'feedback--wrong'">
          {{ isCorrect ? t('game.correct') : t('game.incorrect') }}
        </div>
      </div>

      <!-- Next button -->
      <div class="aspect-game__footer" v-if="answered">
        <button class="next-btn" @click="next">
          {{ store.sessionDone ? t('game.toResults') : t('game.next') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAspectStore } from '@/store/aspectStore'
import type { AspectExercise, CompleteSentenceExercise } from '@/generators/aspectTypes'

const { t } = useI18n()
const router = useRouter()
const store  = useAspectStore()

const answered  = ref(false)
const isCorrect = ref(false)
const ex        = ref<AspectExercise | null>(store.currentExercise)

// Split sentence template into text/blank parts
const sentenceParts = computed(() => {
  if (!ex.value || ex.value.type !== 'complete-sentence') return []
  const parts: { type: 'text' | 'blank'; text: string }[] = []
  const chunks = (ex.value as CompleteSentenceExercise).template.split('___')
  chunks.forEach((chunk, i) => {
    if (chunk) parts.push({ type: 'text', text: chunk })
    if (i < chunks.length - 1) parts.push({ type: 'blank', text: '' })
  })
  return parts
})

function submit(userAnswer: string) {
  if (answered.value) return
  const current = store.currentExercise!
  store.submitAnswer(userAnswer)  // advances index internally
  ex.value = current              // keep showing the exercise we just answered
  isCorrect.value = store.answers[store.answers.length - 1]?.correct ?? false
  answered.value = true
}

function next() {
  if (store.sessionDone) {
    router.push('/aspect/results')
    return
  }
  ex.value = store.currentExercise
  answered.value = false
  isCorrect.value = false
}

function btnClass(opt: string, answer: string) {
  if (!answered.value) return ''
  return opt === answer ? 'correct' : 'wrong'
}

function optBtnClass(opt: string, answer: string) {
  if (!answered.value) return ''
  return opt === answer ? 'correct' : 'wrong'
}
</script>

<style scoped>
.aspect-game {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1rem;
}

.aspect-game__inner {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.aspect-game__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.aspect-game__back {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: color 0.15s;
}
.aspect-game__back:hover { color: #e2e8f0; }

.aspect-game__stats { display: flex; gap: 0.75rem; }
.stat { font-size: 1rem; font-weight: 700; color: #fbbf24; }
.stat--streak { color: #f97316; }

.aspect-game__counter { font-size: 0.85rem; color: #475569; font-weight: 600; }

/* Progress */
.progress-track {
  height: 6px;
  background: #1e293b;
  border-radius: 99px;
  overflow: hidden;
  border: 1px solid #334155;
}
.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  border-radius: 99px;
  transition: width 0.4s ease;
}

/* Card */
.exercise-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
}

.ex__label {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #64748b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ex__verb {
  font-size: 2.5rem;
  font-weight: 800;
  color: #e2e8f0;
  text-align: center;
  margin: 0;
  letter-spacing: 0.02em;
}

.ex__sentence {
  font-size: 1.4rem;
  font-weight: 700;
  color: #e2e8f0;
  text-align: center;
  margin: 0;
  line-height: 1.6;
}

.ex__blank {
  color: #6366f1;
  border-bottom: 2px solid #6366f1;
  padding: 0 0.15rem;
}

.ex__hint {
  font-size: 0.9rem;
  color: #64748b;
  text-align: center;
  font-style: italic;
  margin: 0;
}

.ex__clue {
  font-size: 0.85rem;
  color: #94a3b8;
  text-align: center;
  margin: 0;
}
.ex__clue strong { color: #fbbf24; }

.ex__explanation {
  font-size: 0.9rem;
  color: #94a3b8;
  background: #0f172a;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  border-left: 3px solid #6366f1;
}

/* Two big aspect buttons */
.ex__two-btns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.aspect-btn {
  padding: 1.25rem 1rem;
  border: 2px solid #334155;
  border-radius: 12px;
  font-size: 1.5rem;
  font-weight: 800;
  cursor: pointer;
  transition: all 0.15s;
  background: #0f172a;
}
.aspect-btn--nsv { color: #60a5fa; }
.aspect-btn--sv  { color: #f472b6; }
.aspect-btn:hover:not(:disabled) { transform: scale(1.03); border-color: #6366f1; }
.aspect-btn.correct { border-color: #22c55e; background: #14532d; color: #bbf7d0; }
.aspect-btn.wrong   { border-color: #ef4444; background: #450a0a; color: #fecaca; }

/* Options grid (find-pair) */
.ex__options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.opt-btn {
  position: relative;
  padding: 0.85rem 1rem;
  border: 2px solid #334155;
  border-radius: 10px;
  background: #0f172a;
  color: #cbd5e1;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.opt-btn--wide { width: 100%; }
.opt-btn:hover:not(:disabled) { border-color: #6366f1; color: #a5b4fc; }
.opt-btn.correct { border-color: #22c55e; background: #14532d; color: #bbf7d0; }
.opt-btn.wrong   { border-color: #ef4444; background: #450a0a; color: #fecaca; }

.opt-btn__tag {
  position: absolute;
  top: 0.3rem;
  right: 0.4rem;
  font-size: 0.6rem;
  font-weight: 800;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}
.opt-btn__tag--nsv { background: #1e3a5f; color: #60a5fa; }
.opt-btn__tag--sv  { background: #4a1942; color: #f472b6; }

/* Aspect tag inline */
.aspect-tag {
  font-size: 0.75rem;
  font-weight: 800;
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
}
.aspect-tag--nsv { background: #1e3a5f; color: #60a5fa; }
.aspect-tag--sv  { background: #4a1942; color: #f472b6; }

/* Feedback */
.feedback {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1rem;
  text-align: center;
}
.feedback--correct { background: rgba(34,197,94,0.15); color: #86efac; border: 1px solid rgba(34,197,94,0.3); }
.feedback--wrong   { background: rgba(239,68,68,0.12);  color: #fca5a5; border: 1px solid rgba(239,68,68,0.3); }

/* Footer */
.aspect-game__footer { display: flex; justify-content: center; }

.next-btn {
  padding: 0.85rem 2.5rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.next-btn:hover { background: #4f46e5; }
</style>
