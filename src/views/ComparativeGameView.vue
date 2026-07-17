<template>
  <div class="comparative-game">
    <div class="comparative-game__inner">
      <div class="comparative-game__header">
        <button class="ghost-btn" @click="router.push('/comparatives')">← Salir</button>
        <div class="stats">
          <span>⭐ {{ store.score }}</span>
          <span v-if="store.streak > 1">🔥 {{ store.streak }}</span>
        </div>
        <span class="counter">{{ store.currentIndex + 1 }} / {{ store.total }}</span>
      </div>

      <div class="progress-track">
        <div class="progress-fill" :style="{ width: store.progress + '%' }" />
      </div>

      <div class="exercise-card" v-if="ex">
        <p class="exercise-type">{{ typeLabel }}</p>

        <template v-if="ex.type === 'complete-sentence'">
          <p class="sentence">{{ ex.sentence }}</p>
        </template>

        <template v-else-if="ex.type === 'build-comparison'">
          <p class="prompt">{{ ex.prompt }}</p>
          <div class="blocks">
            <button
              v-for="block in ex.blocks"
              :key="block"
              class="block"
              :disabled="answered"
              @click="appendBlock(block)"
            >
              {{ block }}
            </button>
          </div>
          <p class="built">{{ builtAnswer || '...' }}</p>
        </template>

        <template v-else>
          <p class="prompt">{{ ex.prompt }}</p>
        </template>

        <div v-if="ex.type !== 'build-comparison'" class="options">
          <button
            v-for="option in ex.options"
            :key="option"
            class="option-btn"
            :class="optionClass(option)"
            :disabled="answered"
            @click="submit(option)"
          >
            {{ option }}
          </button>
        </div>

        <button
          v-else
          class="submit-btn"
          :disabled="answered || !builtAnswer"
          @click="submit(builtAnswer)"
        >
          Comprobar
        </button>

        <div v-if="answered" class="feedback" :class="isCorrect ? 'feedback--correct' : 'feedback--wrong'">
          <strong>{{ isCorrect ? '✓ ¡Correcto!' : '✗ Incorrecto' }}</strong>
          <span>{{ ex.explanation_es }}</span>
        </div>
      </div>

      <div class="footer" v-if="answered">
        <button class="next-btn" @click="next">
          {{ store.sessionDone ? 'Ver resultados →' : 'Siguiente →' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useComparativeStore } from '@/store/comparativeStore'
import type { ComparativeExercise } from '@/generators/comparativeTypes'

const router = useRouter()
const store = useComparativeStore()

const answered = ref(false)
const isCorrect = ref(false)
const ex = ref<ComparativeExercise | null>(store.currentExercise)
const builtBlocks = ref<string[]>([])

const builtAnswer = computed(() =>
  builtBlocks.value.join(' ').replace(' ,', ',').replace(/\s+\./g, '.')
)

const typeLabel = computed(() => {
  switch (ex.value?.type) {
    case 'choose-comparative': return 'Elige el comparativo'
    case 'complete-sentence': return 'Completa la frase'
    case 'source-form': return 'Adjetivo o adverbio fuente'
    case 'meaning': return 'Significado'
    case 'opposite': return 'Comparativo opuesto'
    case 'build-comparison': return 'Construye la comparación'
    case 'conversation': return 'Conversación'
    default: return ''
  }
})

function appendBlock(block: string) {
  builtBlocks.value.push(block)
}

function submit(userAnswer: string) {
  if (!ex.value || answered.value) return
  const current = store.currentExercise!
  store.submitAnswer(userAnswer)
  ex.value = current
  isCorrect.value = store.answers[store.answers.length - 1]?.correct ?? false
  answered.value = true
}

function next() {
  if (store.sessionDone) {
    router.push('/comparatives/results')
    return
  }
  ex.value = store.currentExercise
  answered.value = false
  isCorrect.value = false
  builtBlocks.value = []
}

function optionClass(option: string) {
  if (!answered.value || !ex.value) return ''
  if (ex.value.type === 'source-form') {
    return ex.value.acceptedAnswers.includes(option) ? 'correct' : 'wrong'
  }
  return option === ex.value.answer ? 'correct' : 'wrong'
}
</script>

<style scoped>
.comparative-game {
  min-height: 100svh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
}

.comparative-game__inner {
  width: 100%;
  max-width: 620px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comparative-game__header,
.stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.ghost-btn {
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

.stats {
  color: #fbbf24;
  font-weight: 800;
}

.counter {
  color: #64748b;
  font-size: 0.85rem;
}

.progress-track {
  height: 6px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #22d3ee);
}

.exercise-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.exercise-type {
  margin: 0;
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.prompt,
.sentence {
  margin: 0;
  color: #e2e8f0;
  font-size: 1.45rem;
  font-weight: 800;
  text-align: center;
  line-height: 1.45;
}

.options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.option-btn,
.block,
.submit-btn,
.next-btn {
  background: #0f172a;
  border: 2px solid #334155;
  border-radius: 10px;
  color: #cbd5e1;
  padding: 0.85rem;
  cursor: pointer;
  font-weight: 700;
}

.option-btn:hover:not(:disabled),
.block:hover:not(:disabled) {
  border-color: #818cf8;
}

.correct {
  border-color: #22c55e;
  background: #14532d;
  color: #bbf7d0;
}

.wrong {
  border-color: #ef4444;
  background: #450a0a;
  color: #fecaca;
}

.blocks {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.built {
  min-height: 2.75rem;
  margin: 0;
  color: #e2e8f0;
  background: #0f172a;
  border-radius: 10px;
  padding: 0.85rem;
}

.submit-btn,
.next-btn {
  background: #6366f1;
  color: white;
  border-color: #6366f1;
}

.feedback {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  border-radius: 10px;
  padding: 0.85rem;
}

.feedback--correct {
  color: #bbf7d0;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
}

.feedback--wrong {
  color: #fecaca;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.footer {
  display: flex;
  justify-content: center;
}

@media (max-width: 520px) {
  .options {
    grid-template-columns: 1fr;
  }
}
</style>
