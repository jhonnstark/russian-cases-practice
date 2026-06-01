<template>
  <div class="results-view">
    <div class="results-view__inner">

      <div class="results-view__icon">{{ emoji }}</div>
      <h1 class="results-view__title">{{ title }}</h1>
      <p class="results-view__subtitle">{{ store.score }} / {{ store.total }} correctas</p>

      <div class="results-view__stats">
        <div class="stat-card">
          <div class="stat-card__value">{{ store.score }}</div>
          <div class="stat-card__label">Correctas</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">{{ store.total - store.score }}</div>
          <div class="stat-card__label">Errores</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">🔥 {{ store.bestStreak }}</div>
          <div class="stat-card__label">Mejor racha</div>
        </div>
      </div>

      <!-- Mistakes -->
      <div class="results-view__mistakes" v-if="store.mistakes.length">
        <h2 class="results-view__section-title">Errores cometidos</h2>
        <div v-for="(ex, i) in store.mistakes" :key="i" class="results-view__mistake-item">
          <span class="results-view__mistake-type">{{ ex.type }}</span>
          <span class="results-view__mistake-answer">→ {{ getMistakeAnswer(ex) }}</span>
        </div>
      </div>

      <div class="results-view__actions">
        <Button label="Jugar de nuevo" icon="pi pi-refresh" @click="playAgain" />
        <Button label="Cambiar modo"   icon="pi pi-home"    outlined @click="$router.push('/')" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { useGameStore } from '../store'
import type { Exercise } from '../generators/types'

const store  = useGameStore()
const router = useRouter()

const pct = computed(() => store.total ? Math.round((store.score / store.total) * 100) : 0)

const emoji = computed(() => {
  if (pct.value === 100) return '🏆'
  if (pct.value >= 80)  return '🎉'
  if (pct.value >= 60)  return '👍'
  return '💪'
})

const title = computed(() => {
  if (pct.value === 100) return '¡Perfecto!'
  if (pct.value >= 80)  return '¡Muy bien!'
  if (pct.value >= 60)  return 'Bien hecho'
  return 'Sigue practicando'
})

function getMistakeAnswer(ex: Exercise): string {
  if (ex.type === 'mini-story') return ex.blanks.map(b => b.answer).join(' / ')
  return (ex as any).answer ?? ''
}

function playAgain() {
  store.startSession()
  router.push('/game')
}
</script>

<style scoped>
.results-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.results-view__inner {
  width: 100%;
  max-width: 520px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.results-view__icon { font-size: 4rem; }

.results-view__title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #e2e8f0;
  margin: 0;
}

.results-view__subtitle { color: #94a3b8; margin: 0; font-size: 1.1rem; }

.results-view__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1rem;
}
.stat-card__value { font-size: 2rem; font-weight: 800; color: #a5b4fc; }
.stat-card__label { font-size: 0.8rem; color: #64748b; margin-top: 0.25rem; text-transform: uppercase; }

.results-view__section-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: left;
  margin-bottom: 0.5rem;
}

.results-view__mistakes {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1rem;
  text-align: left;
}

.results-view__mistake-item {
  display: flex;
  justify-content: space-between;
  padding: 0.4rem 0;
  border-bottom: 1px solid #0f172a;
  font-size: 0.9rem;
}
.results-view__mistake-type  { color: #64748b; }
.results-view__mistake-answer { color: #f87171; font-weight: 600; }

.results-view__actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
</style>
