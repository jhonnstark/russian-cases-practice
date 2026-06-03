<template>
  <div class="home">
    <div class="home__hero">
      <h1 class="home__title">🇷🇺 {{ t('home.appTitle') }}</h1>
      <p class="home__subtitle">{{ t('home.appSubtitle') }}</p>
    </div>

    <div class="home__games">

      <!-- Cases game -->
      <div class="game-card" @click="$router.push('/cases')">
        <div class="game-card__icon">📚</div>
        <div class="game-card__body">
          <h2 class="game-card__title">{{ t('home.casesTitle') }}</h2>
          <p class="game-card__desc">{{ t('home.casesDesc') }}</p>
        </div>
        <span class="game-card__arrow">→</span>
      </div>

      <!-- Aspect game -->
      <div class="game-card game-card--aspect" @click="$router.push('/aspect')">
        <div class="game-card__icon">⚡</div>
        <div class="game-card__body">
          <h2 class="game-card__title">{{ t('home.aspectTitle') }}</h2>
          <p class="game-card__desc">{{ t('home.aspectDesc') }}</p>
        </div>
        <span class="game-card__arrow">→</span>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  padding: 2rem 1rem;
  gap: 2rem;
}

.home__hero { text-align: center; }

.home__title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #e0e0e0;
  margin: 0 0 0.5rem;
}

.home__subtitle {
  font-size: 1rem;
  color: #a0aec0;
  margin: 0;
}

.home__games {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.game-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: #1e293b;
  border: 2px solid #334155;
  border-radius: 16px;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.1s;
}
.game-card:hover { border-color: #6366f1; transform: translateY(-1px); }
.game-card--aspect:hover { border-color: #a855f7; }

.game-card__icon { font-size: 2rem; flex-shrink: 0; }

.game-card__body { flex: 1; text-align: left; }

.game-card__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0 0 0.25rem;
}

.game-card__desc {
  font-size: 0.85rem;
  color: #64748b;
  margin: 0;
}

.game-card__arrow {
  font-size: 1.25rem;
  color: #475569;
  flex-shrink: 0;
}
</style>
