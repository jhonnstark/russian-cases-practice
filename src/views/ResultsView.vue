<template>
  <div class="results-view">
    <div class="results-view__inner">

      <div class="results-view__icon">{{ emoji }}</div>
      <h1 class="results-view__title">{{ title }}</h1>
      <p class="results-view__subtitle">{{ t('results.outOf', { score: store.score, total: store.total }) }}</p>

      <div class="results-view__stats">
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
      <div class="results-view__mistakes" v-if="store.mistakes.length">
        <h2 class="results-view__section-title">{{ t('results.mistakes') }}</h2>

        <div v-for="({ exercise: ex, userAnswer }, i) in store.mistakes" :key="i" class="mistake-card">

          <!-- Nominative header -->
          <div v-if="getNominative(ex)" class="mistake-card__header">
            <span class="mistake-card__nom-label">{{ t('results.nominative') }}</span>
            <span class="mistake-card__nom-word">{{ getNominative(ex) }}</span>
          </div>

          <!-- Prompt -->
          <div class="mistake-card__prompt">{{ getPrompt(ex) }}</div>

          <!-- You wrote vs correct -->
          <div class="mistake-card__row">
            <div class="mistake-card__col mistake-card__col--wrong">
              <span class="mistake-card__label-small">✗ {{ t('results.youWrote') }}</span>
              <span class="mistake-card__value">{{ getDisplayAnswer(userAnswer, ex) }}</span>
            </div>
            <div class="mistake-card__col mistake-card__col--correct">
              <span class="mistake-card__label-small">✓ {{ t('results.correct') }}</span>
              <span class="mistake-card__value">{{ getCorrectAnswer(ex) }}</span>
            </div>
          </div>

          <!-- Case + rule -->
          <div class="mistake-card__rule">
            <span class="mistake-card__case-tag">{{ t(`selector.cases.${getCase(ex)}`) }}</span>
            <span class="mistake-card__rule-text">{{ getRule(getCase(ex)) }}</span>
          </div>

        </div>
      </div>

      <div class="results-view__actions">
        <Button :label="t('results.playAgain')" icon="pi pi-refresh" @click="playAgain" />
        <Button :label="t('results.changeMode')" icon="pi pi-home" outlined @click="$router.push('/cases')" />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import { useGameStore } from '@/store'
import type { Exercise, Case } from '@/generators'
import caseRules from '@data/russian/case-rules.json'

const { t } = useI18n()
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
  if (pct.value === 100) return t('results.perfect')
  if (pct.value >= 80)  return t('results.veryGood')
  if (pct.value >= 60)  return t('results.good')
  return t('results.keepGoing')
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function getPrompt(ex: Exercise): string {
  switch (ex.type) {
    case 'ending-choice': return ex.prompt.replace('__', '___')
    case 'case-choice':   return ex.prompt
    case 'transform':     return ex.nominative
    case 'order-blocks':  return ex.blocks.join(' — ')
    case 'mini-story':    return ex.story.join(' ')
    default: return ''
  }
}

function getCorrectAnswer(ex: Exercise): string {
  switch (ex.type) {
    case 'ending-choice': return ex.base + ex.answer
    case 'case-choice':   return ex.answer
    case 'transform':     return ex.answer
    case 'order-blocks':  return ex.answer
    case 'mini-story':    return ex.blanks.map(b => b.answer).join(' / ')
    default: return ''
  }
}

// Show what the user actually typed/selected in a readable way
function getDisplayAnswer(userAnswer: string, ex: Exercise): string {
  if (!userAnswer || userAnswer === '__wrong__') return '—'
  if (ex.type === 'ending-choice') {
    // userAnswer is just the ending — show base+ending
    return ex.base + userAnswer
  }
  if (ex.type === 'mini-story') {
    return userAnswer.split('|').join(' / ')
  }
  return userAnswer
}

function getCase(ex: Exercise): Case {
  switch (ex.type) {
    case 'ending-choice': return ex.case
    case 'case-choice':   return ex.case
    case 'transform':     return ex.targetCase
    case 'order-blocks':  return ex.case
    case 'mini-story':    return ex.blanks[0]?.case ?? 'genitive'
    default: return 'genitive'
  }
}

function getNominative(ex: Exercise): string {
  switch (ex.type) {
    case 'ending-choice': return ex.nominative
    case 'case-choice':   return ex.nominative
    case 'transform':     return ex.nominative
    case 'order-blocks':  return ex.nominative
    case 'mini-story':    return ex.blanks.map(b => b.nominative).join(', ')
    default: return ''
  }
}

function getRule(cas: Case): string {
  const rules = caseRules as Record<string, { uses?: string[]; prepositions?: string[]; rule?: string }>
  const r = rules[cas]
  if (!r) return ''
  const uses = r.uses?.slice(0, 3).join(' · ') ?? ''
  const preps = r.prepositions?.length ? r.prepositions.slice(0, 5).join(' ') : ''
  const parts = [uses, preps ? `[${preps}]` : ''].filter(Boolean)
  return parts.join('  ')
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
  align-items: flex-start;
  justify-content: center;
  padding: 2rem 1rem;
}

.results-view__inner {
  width: 100%;
  max-width: 560px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-bottom: 3rem;
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

/* ── Mistakes ─────────────────────────────────────────────────────────── */
.results-view__mistakes { text-align: left; display: flex; flex-direction: column; gap: 0.75rem; }

.results-view__section-title {
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

/* Nominative header */
.mistake-card__header {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #334155;
}
.mistake-card__nom-label {
  font-size: 0.65rem;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  flex-shrink: 0;
}
.mistake-card__nom-word {
  font-size: 1.1rem;
  font-weight: 700;
  color: #93c5fd;
  letter-spacing: 0.02em;
}

/* Prompt */
.mistake-card__prompt {
  font-size: 1rem;
  font-weight: 600;
  color: #e2e8f0;
  font-style: italic;
}

/* You wrote / Correct row */
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
}
.mistake-card__col--wrong  .mistake-card__value { color: #fca5a5; }
.mistake-card__col--correct .mistake-card__value { color: #6ee7b7; }

/* Rule row */
.mistake-card__rule {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #334155;
}

.mistake-card__case-tag {
  background: #312e81;
  color: #a5b4fc;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  white-space: nowrap;
}

.mistake-card__rule-text {
  color: #64748b;
  font-size: 0.78rem;
  flex: 1;
}

/* ── Actions ─────────────────────────────────────────────────────────── */
.results-view__actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
</style>
