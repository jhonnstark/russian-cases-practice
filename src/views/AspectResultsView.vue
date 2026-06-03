<template>
  <div class="aspect-results">
    <div class="aspect-results__inner">

      <div class="aspect-results__icon">{{ emoji }}</div>
      <h1 class="aspect-results__title">{{ title }}</h1>
      <p class="aspect-results__subtitle">{{ t('results.outOf', { score: store.score, total: store.total }) }}</p>

      <!-- Stats -->
      <div class="aspect-results__stats">
        <div class="stat-card">
          <div class="stat-card__value">{{ store.score }}</div>
          <div class="stat-card__label">{{ t('results.correct') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">{{ store.total - store.score }}</div>
          <div class="stat-card__label">{{ t('results.errors') }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-card__value">🔥 {{ store.bestStreak }}</div>
          <div class="stat-card__label">{{ t('results.bestStreak') }}</div>
        </div>
      </div>

      <!-- Mistakes -->
      <div class="aspect-results__mistakes" v-if="store.mistakes.length">
        <h2 class="section-title">{{ t('results.mistakes') }}</h2>

        <div v-for="({ exercise: ex, userAnswer }, i) in store.mistakes" :key="i" class="mistake-card">

          <!-- Guess aspect -->
          <template v-if="ex.type === 'guess-aspect'">
            <div class="mistake-card__verb">{{ ex.verb }}</div>
            <div class="mistake-card__row">
              <div class="mistake-card__col mistake-card__col--wrong">
                <span class="mistake-card__label-small">✗ {{ t('results.youWrote') }}</span>
                <span class="mistake-card__value">{{ userAnswer }}</span>
              </div>
              <div class="mistake-card__col mistake-card__col--correct">
                <span class="mistake-card__label-small">✓ {{ t('results.correct') }}</span>
                <span class="mistake-card__value">{{ ex.aspect }}</span>
              </div>
            </div>
            <p class="mistake-card__explanation">{{ ex.explanation_es }}</p>
          </template>

          <!-- Find pair -->
          <template v-else-if="ex.type === 'find-pair'">
            <div class="mistake-card__verb">{{ ex.verb }}</div>
            <p class="mistake-card__hint">{{ t('aspect.results.pairOf') }} <strong>{{ ex.verb }}</strong></p>
            <div class="mistake-card__row">
              <div class="mistake-card__col mistake-card__col--wrong">
                <span class="mistake-card__label-small">✗ {{ t('results.youWrote') }}</span>
                <span class="mistake-card__value">{{ userAnswer }}</span>
              </div>
              <div class="mistake-card__col mistake-card__col--correct">
                <span class="mistake-card__label-small">✓ {{ t('results.correct') }}</span>
                <span class="mistake-card__value">{{ ex.answer }}</span>
              </div>
            </div>
          </template>

          <!-- Complete sentence -->
          <template v-else-if="ex.type === 'complete-sentence'">
            <div class="mistake-card__sentence">{{ ex.template }}</div>
            <div class="mistake-card__row">
              <div class="mistake-card__col mistake-card__col--wrong">
                <span class="mistake-card__label-small">✗ {{ t('results.youWrote') }}</span>
                <span class="mistake-card__value">{{ userAnswer }}</span>
              </div>
              <div class="mistake-card__col mistake-card__col--correct">
                <span class="mistake-card__label-small">✓ {{ t('results.correct') }}</span>
                <span class="mistake-card__value">{{ ex.answer }}
                  <span class="aspect-tag" :class="ex.aspect === 'НСВ' ? 'aspect-tag--nsv' : 'aspect-tag--sv'">{{ ex.aspect }}</span>
                </span>
              </div>
            </div>
            <p class="mistake-card__explanation">{{ ex.explanation_es }}</p>
          </template>

        </div>
      </div>

      <!-- Actions -->
      <div class="aspect-results__actions">
        <button class="action-btn action-btn--primary" @click="playAgain">
          {{ t('results.playAgain') }}
        </button>
        <button class="action-btn action-btn--outlined" @click="router.push('/aspect')">
          {{ t('results.changeMode') }}
        </button>
        <button class="action-btn action-btn--ghost" @click="router.push('/')">
          {{ t('aspect.results.backHome') }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useAspectStore } from '@/store/aspectStore'

const { t } = useI18n()
const store  = useAspectStore()
const router = useRouter()

const pct = computed(() => store.total ? Math.round((store.score / store.total) * 100) : 0)

const emoji = computed(() => {
  if (pct.value === 100) return '🏆'
  if (pct.value >= 80)  return '🎉'
  if (pct.value >= 60)  return '👍'
  return '💪'
})

const title = computed(() => {
  if (pct.value === 100) return t('results.perfect')
  if (pct.value >= 80)  return t('results.veryGood')
  if (pct.value >= 60)  return t('results.good')
  return t('results.keepGoing')
})

function playAgain() {
  store.startSession()
  router.push('/aspect/game')
}
</script>

<style scoped>
.aspect-results {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1rem;
}

.aspect-results__inner {
  width: 100%;
  max-width: 560px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 3rem;
}

.aspect-results__icon { font-size: 4rem; }
.aspect-results__title { font-size: 2.5rem; font-weight: 800; color: #e2e8f0; margin: 0; }
.aspect-results__subtitle { color: #94a3b8; margin: 0; font-size: 1.1rem; }

.aspect-results__stats {
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

.aspect-results__mistakes { text-align: left; display: flex; flex-direction: column; gap: 0.75rem; }

.section-title {
  font-size: 0.8rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.25rem;
}

.mistake-card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.mistake-card__verb {
  font-size: 1.4rem;
  font-weight: 800;
  color: #93c5fd;
  text-align: center;
}

.mistake-card__sentence {
  font-size: 1rem;
  font-weight: 600;
  color: #e2e8f0;
  font-style: italic;
  text-align: center;
}

.mistake-card__hint { font-size: 0.85rem; color: #94a3b8; margin: 0; text-align: center; }
.mistake-card__hint strong { color: #e2e8f0; }

.mistake-card__explanation {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0;
  border-left: 3px solid #6366f1;
  padding-left: 0.75rem;
}

.mistake-card__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.mistake-card__col {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
}
.mistake-card__col--wrong  { background: rgba(239,68,68,0.12);  border: 1px solid rgba(239,68,68,0.35); }
.mistake-card__col--correct{ background: rgba(110,231,183,0.1); border: 1px solid rgba(110,231,183,0.35); }

.mistake-card__label-small {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
}
.mistake-card__col--wrong  .mistake-card__label-small { color: #f87171; }
.mistake-card__col--correct .mistake-card__label-small { color: #6ee7b7; }

.mistake-card__value {
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.mistake-card__col--wrong  .mistake-card__value { color: #fca5a5; }
.mistake-card__col--correct .mistake-card__value { color: #6ee7b7; }

.aspect-tag {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}
.aspect-tag--nsv { background: #1e3a5f; color: #60a5fa; }
.aspect-tag--sv  { background: #4a1942; color: #f472b6; }

.aspect-results__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.action-btn--primary  { background: #6366f1; color: white; border: none; }
.action-btn--primary:hover { background: #4f46e5; }
.action-btn--outlined { background: transparent; color: #a5b4fc; border: 2px solid #6366f1; }
.action-btn--outlined:hover { background: #1e1b4b; }
.action-btn--ghost    { background: transparent; color: #64748b; border: 2px solid #334155; }
.action-btn--ghost:hover { color: #e2e8f0; border-color: #475569; }
</style>
