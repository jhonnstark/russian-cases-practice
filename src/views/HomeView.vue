<template>
  <div class="home">
    <div class="home__hero">
      <h1 class="home__title">🇷🇺 Russian Cases</h1>
      <p class="home__subtitle">Practice Russian grammar cases with real A2 sentences</p>
    </div>

    <Card class="home__card">
      <template #content>
        <CaseSelector />
        <Button
          label="Start Practice"
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
import Card from 'primevue/card'
import Button from 'primevue/button'
import CaseSelector from '../components/CaseSelector.vue'
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
}

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
