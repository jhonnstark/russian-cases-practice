<template>
  <div class="game-view">
    <div class="game-view__inner">

      <!-- Header -->
      <div class="game-view__header">
        <button class="game-view__back" @click="$router.push('/')">← Salir</button>
        <div class="game-view__stats">
          <span class="game-view__stat">⭐ {{ store.score }}</span>
          <span class="game-view__stat game-view__stat--streak" v-if="store.streak > 1">
            🔥 {{ store.streak }}
          </span>
        </div>
        <span class="game-view__counter">{{ store.currentIndex + 1 }} / {{ store.total }}</span>
      </div>

      <!-- Progress -->
      <MyProgressBar :progress="store.progress" />

      <!-- Exercise card -->
      <GameCard
        v-if="store.currentExercise && !store.sessionDone"
        :exercise="store.currentExercise"
        @answer="onAnswer"
      />

      <!-- Next button -->
      <div class="game-view__footer" v-if="answered">
        <button class="game-view__next" @click="next">
          {{ store.sessionDone ? 'Ver resultados →' : 'Siguiente →' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../store'
import GameCard from '../components/GameCard.vue'
import MyProgressBar from '../components/ProgressBar.vue'

const store  = useGameStore()
const router = useRouter()
const answered = ref(false)

store.startSession()

function onAnswer(userAnswer: string) {
  store.submitAnswer(userAnswer)
  answered.value = true
}

function next() {
  answered.value = false
  if (store.sessionDone) {
    router.push('/results')
  }
}
</script>

<style scoped>
.game-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1rem;
}

.game-view__inner {
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.game-view__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.game-view__back {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: color 0.15s;
}
.game-view__back:hover { color: #e2e8f0; }

.game-view__stats {
  display: flex;
  gap: 0.75rem;
}

.game-view__stat {
  font-size: 1rem;
  font-weight: 700;
  color: #fbbf24;
}
.game-view__stat--streak { color: #f97316; }

.game-view__counter {
  font-size: 0.85rem;
  color: #475569;
  font-weight: 600;
}

.game-view__footer {
  display: flex;
  justify-content: center;
}

.game-view__next {
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
.game-view__next:hover { background: #4f46e5; }
</style>
