<template>
  <div class="comparative-home">
    <button class="back-btn" @click="router.push('/')">← Inicio</button>

    <div class="comparative-home__hero">
      <h1 class="comparative-home__title">Comparativos</h1>
      <p class="comparative-home__subtitle">Adjetivos, adverbios y frases con чем</p>
    </div>

    <div class="comparative-home__card">
      <p class="mode-label">Modo de juego</p>
      <div class="mode-grid">
        <button
          v-for="mode in modes"
          :key="mode.value"
          class="mode-btn"
          :class="{ 'mode-btn--active': store.selectedMode === mode.value }"
          @click="store.setMode(mode.value)"
        >
          <span class="mode-btn__title">{{ mode.label }}</span>
          <span class="mode-btn__desc">{{ mode.desc }}</span>
        </button>
      </div>

      <button class="start-btn" @click="start">Empezar juego</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useComparativeStore } from '@/store/comparativeStore'
import type { ComparativeGameMode } from '@/generators/comparativeGenerator'

const router = useRouter()
const store = useComparativeStore()

const modes: { value: ComparativeGameMode; label: string; desc: string }[] = [
  { value: 'mixed', label: 'Mixto', desc: 'Combina todos los tipos' },
  { value: 'choose-comparative', label: 'Elegir forma', desc: 'дорогой → дороже' },
  { value: 'complete-sentence', label: 'Completar frase', desc: 'Frases naturales con чем' },
  { value: 'source-form', label: 'Base correcta', desc: 'выше ← высокий / высоко' },
  { value: 'meaning', label: 'Significado', desc: 'Comparativo → español' },
  { value: 'opposite', label: 'Opuesto', desc: 'дороже ↔ дешевле' },
  { value: 'build-comparison', label: 'Ordenar', desc: 'Construye la comparación' },
  { value: 'conversation', label: 'Conversación', desc: 'Respuestas A2 naturales' },
]

function start() {
  store.startSession()
  router.push('/comparatives/game')
}
</script>

<style scoped>
.comparative-home {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #101827 0%, #172554 52%, #312e81 100%);
  padding: 4rem 1rem 1.5rem;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
}

.comparative-home__hero {
  text-align: center;
  margin-bottom: 1.5rem;
}

.comparative-home__title {
  margin: 0 0 0.4rem;
  font-size: 2.4rem;
  font-weight: 800;
  color: #e2e8f0;
}

.comparative-home__subtitle {
  color: #a5b4fc;
  margin: 0;
}

.comparative-home__card {
  width: 100%;
  max-width: 620px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
  padding: 1.25rem;
}

.mode-label {
  margin: 0 0 0.75rem;
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.mode-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}

.mode-btn {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: left;
  background: #0f172a;
  border: 2px solid #334155;
  border-radius: 10px;
  padding: 0.85rem;
  cursor: pointer;
}

.mode-btn--active,
.mode-btn:hover {
  border-color: #818cf8;
  background: #1e1b4b;
}

.mode-btn__title {
  color: #e2e8f0;
  font-weight: 800;
}

.mode-btn__desc {
  color: #94a3b8;
  font-size: 0.8rem;
}

.start-btn {
  width: 100%;
  margin-top: 1rem;
  border: none;
  border-radius: 10px;
  background: #6366f1;
  color: white;
  padding: 0.9rem;
  font-weight: 800;
  cursor: pointer;
}

@media (max-width: 560px) {
  .mode-grid {
    grid-template-columns: 1fr;
  }

  .comparative-home__title {
    font-size: 2rem;
  }
}
</style>
