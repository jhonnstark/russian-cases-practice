<template>
  <div class="progress-wrapper">
    <div class="progress-info">
      <span class="progress-info__label">Progress</span>
      <span class="progress-info__value">{{ progress }}%</span>
    </div>
    <ProgressBar :value="progress" />
  </div>
</template>

<script setup lang="ts">
import ProgressBar from 'primevue/progressbar'

defineProps<{
  progress: number
}>()
</script>

<style scoped>
.progress-wrapper {
  margin-top: 1.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 0.4rem;
}

.progress-info__value {
  font-weight: 700;
}
</style>
