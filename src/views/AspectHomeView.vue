<template>
  <div class="aspect-home">
    <button class="back-btn" @click="router.push('/')">{{ t('nav.home') }}</button>
    <div class="aspect-home__hero">
      <h1 class="aspect-home__title">{{ t('aspect.home.title') }}</h1>
      <p class="aspect-home__subtitle">{{ t('aspect.home.subtitle') }}</p>
    </div>

    <div class="aspect-home__card">
      <!-- Mode selector -->
      <div class="mode-selector">
        <p class="mode-selector__label">{{ t('aspect.home.modeLabel') }}</p>
        <div class="mode-selector__options">
          <button
            v-for="m in modes"
            :key="m.value"
            class="mode-btn"
            :class="{ 'mode-btn--active': store.selectedMode === m.value }"
            @click="store.setMode(m.value)"
          >
            <span class="mode-btn__icon">{{ m.icon }}</span>
            <span class="mode-btn__label">{{ t(m.labelKey) }}</span>
            <span class="mode-btn__desc">{{ t(m.descKey) }}</span>
          </button>
        </div>
      </div>

      <button class="start-btn" @click="start">
        {{ t('aspect.home.start') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAspectStore } from '@/store/aspectStore'
import type { AspectMode } from '@/generators/aspectTypes'

const { t } = useI18n()
const router = useRouter()
const store  = useAspectStore()

const modes: { value: AspectMode; icon: string; labelKey: string; descKey: string }[] = [
  { value: 'guess-aspect',      icon: '🔍', labelKey: 'aspect.modes.guessAspect',      descKey: 'aspect.modes.guessAspectDesc'      },
  { value: 'find-pair',         icon: '🔗', labelKey: 'aspect.modes.findPair',          descKey: 'aspect.modes.findPairDesc'          },
  { value: 'complete-sentence', icon: '✏️', labelKey: 'aspect.modes.completeSentence',  descKey: 'aspect.modes.completeSentenceDesc'  },
]

function start() {
  store.startSession()
  router.push('/aspect/game')
}
</script>

<style scoped>
.aspect-home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1a1a2e 50%, #16213e 100%);
  padding: 2rem 1rem;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: color 0.15s;
}
.back-btn:hover { color: #e2e8f0; }

.aspect-home__hero {
  text-align: center;
  margin-bottom: 2rem;
}

.aspect-home__title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #e2e8f0;
  margin: 0 0 0.5rem;
}

.aspect-home__subtitle {
  font-size: 1rem;
  color: #94a3b8;
  margin: 0;
}

.aspect-home__card {
  width: 100%;
  max-width: 500px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.mode-selector__label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
  margin: 0 0 0.75rem;
}

.mode-selector__options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mode-btn {
  display: grid;
  grid-template-columns: 2rem 1fr;
  grid-template-rows: auto auto;
  column-gap: 0.75rem;
  text-align: left;
  padding: 0.85rem 1rem;
  background: #0f172a;
  border: 2px solid #334155;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color 0.15s;
}
.mode-btn:hover { border-color: #6366f1; }
.mode-btn--active { border-color: #6366f1; background: #1e1b4b; }

.mode-btn__icon {
  grid-row: 1 / 3;
  align-self: center;
  font-size: 1.3rem;
}
.mode-btn__label {
  font-size: 0.95rem;
  font-weight: 700;
  color: #e2e8f0;
}
.mode-btn__desc {
  font-size: 0.78rem;
  color: #64748b;
}

.start-btn {
  padding: 0.9rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.start-btn:hover { background: #4f46e5; }
</style>
