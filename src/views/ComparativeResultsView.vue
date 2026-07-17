<template>
  <div class="comparative-results">
    <div class="results-card">
      <div class="icon">{{ emoji }}</div>
      <h1>{{ title }}</h1>
      <p>{{ store.score }} / {{ store.total }} correctas</p>

      <div class="stats-grid">
        <div>
          <strong>{{ store.score }}</strong>
          <span>Correctas</span>
        </div>
        <div>
          <strong>{{ store.mistakes.length }}</strong>
          <span>Errores</span>
        </div>
        <div>
          <strong>{{ store.bestStreak }}</strong>
          <span>Racha</span>
        </div>
      </div>

      <div v-if="store.mistakes.length" class="mistakes">
        <h2>Errores</h2>
        <div v-for="m in store.mistakes" :key="m.exercise.id" class="mistake">
          <span>{{ m.exercise.prompt }}</span>
          <strong>{{ m.exercise.answer }}</strong>
        </div>
      </div>

      <div class="actions">
        <button @click="playAgain">Jugar de nuevo</button>
        <button class="secondary" @click="router.push('/comparatives')">Cambiar modo</button>
        <button class="secondary" @click="router.push('/')">Inicio</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useComparativeStore } from '@/store/comparativeStore'

const router = useRouter()
const store = useComparativeStore()

const pct = computed(() => store.total ? (store.score / store.total) * 100 : 0)
const emoji = computed(() => pct.value >= 80 ? '🏔️' : '📈')
const title = computed(() => {
  if (pct.value === 100) return '¡Perfecto!'
  if (pct.value >= 80) return 'Muy bien'
  if (pct.value >= 60) return 'Buen avance'
  return 'Sigue practicando'
})

function playAgain() {
  store.startSession()
  router.push('/comparatives/game')
}
</script>

<style scoped>
.comparative-results {
  min-height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  padding: 1rem;
}

.results-card {
  width: 100%;
  max-width: 620px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 1.5rem;
  text-align: center;
  color: #e2e8f0;
}

.icon {
  font-size: 3rem;
}

h1 {
  margin: 0.5rem 0;
  font-size: 2rem;
  font-weight: 800;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  margin: 1.25rem 0;
}

.stats-grid div,
.mistake {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 0.85rem;
}

.stats-grid strong,
.stats-grid span {
  display: block;
}

.stats-grid strong {
  font-size: 1.5rem;
}

.stats-grid span,
p {
  color: #94a3b8;
}

.mistakes {
  text-align: left;
}

.mistake {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.5rem;
}

.actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 1rem;
}

button {
  border: none;
  border-radius: 10px;
  background: #6366f1;
  color: white;
  padding: 0.85rem 1rem;
  font-weight: 800;
  cursor: pointer;
}

.secondary {
  background: #334155;
}
</style>
