<template>
  <div class="home">
    <button class="back-btn" @click="$router.push('/')">{{ t('nav.home') }}</button>
    <div class="home__hero">
      <h1 class="home__title">{{ t('home.title') }}</h1>
      <p class="home__subtitle">{{ t('home.subtitle') }}</p>
    </div>

    <Card class="home__card">
      <template #content>
        <CaseSelector />
        <Button
          :label="t('home.start')"
          icon="pi pi-play"
          size="large"
          class="start-btn"
          @click="$router.push('/game')"
        />
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import Card from 'primevue/card'
import Button from 'primevue/button'
import CaseSelector from '../components/CaseSelector.vue'

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
  padding: 2rem;
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

.home__hero {
  text-align: center;
  margin-bottom: 2rem;
}

.home__title {
  font-size: 3rem;
  font-weight: 800;
  color: #e0e0e0;
  margin-bottom: 0.5rem;
}

.home__subtitle {
  font-size: 1.1rem;
  color: #a0aec0;
}

.home__card {
  width: 100%;
  max-width: 480px;
}

.start-btn {
  width: 100%;
  margin-top: 1rem;
}
</style>
