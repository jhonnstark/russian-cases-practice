<template>
  <div class="selector">
    <label class="selector__label">{{ t('selector.caseLabel') }}</label>
    <div class="selector__grid">
      <div
        v-for="c in caseOptions"
        :key="c.value"
        class="selector__chip"
        :class="{ 'selector__chip--active': store.selectedCase === c.value }"
        @click="store.setCase(c.value)"
      >
        <i :class="c.icon" />
        <span>{{ t(`selector.cases.${c.value}`) }}</span>
      </div>
    </div>

    <label class="selector__label" style="margin-top:1.25rem">{{ t('selector.modeLabel') }}</label>
    <div class="selector__grid selector__grid--modes">
      <div
        v-for="m in modeOptions"
        :key="m.value"
        class="selector__chip"
        :class="{ 'selector__chip--active': store.selectedMode === m.value }"
        @click="store.setMode(m.value)"
      >
        <i :class="m.icon" />
        <span>{{ t(`selector.modes.${m.value}`) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useGameStore } from '../store'
import type { GameMode } from '../store'
import type { Case } from '../generators/types'

const { t } = useI18n()
const store = useGameStore()

const caseOptions: { value: Case | 'mixed'; icon: string }[] = [
  { value: 'genitive',      icon: 'pi pi-minus-circle' },
  { value: 'accusative',    icon: 'pi pi-arrow-right' },
  { value: 'prepositional', icon: 'pi pi-map-marker' },
  { value: 'dative',        icon: 'pi pi-user' },
  { value: 'instrumental',  icon: 'pi pi-wrench' },
  { value: 'mixed',         icon: 'pi pi-shuffle' },
]

const modeOptions: { value: GameMode; icon: string }[] = [
  { value: 'ending-choice', icon: 'pi pi-pencil' },
  { value: 'case-choice',   icon: 'pi pi-list' },
  { value: 'transform',     icon: 'pi pi-sync' },
  { value: 'order-blocks',  icon: 'pi pi-sort' },
  { value: 'mini-story',    icon: 'pi pi-book' },
]
</script>

<style scoped>
.selector__label {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.6rem;
}

.selector__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.selector__grid--modes {
  grid-template-columns: repeat(3, 1fr);
}

.selector__chip {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 0.75rem;
  border: 2px solid #334155;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: #94a3b8;
  transition: all 0.15s;
}

.selector__chip:hover {
  border-color: #6366f1;
  color: #c7d2fe;
}

.selector__chip--active {
  border-color: #6366f1;
  background: #1e1b4b;
  color: #a5b4fc;
  font-weight: 700;
}
</style>
