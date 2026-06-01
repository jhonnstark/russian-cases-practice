<template>
  <div v-if="message" class="feedback-box" :class="correct ? 'feedback-box--correct' : 'feedback-box--incorrect'">
    <i :class="correct ? 'pi pi-check-circle' : 'pi pi-times-circle'" class="feedback-box__icon" />
    <span class="feedback-box__message">{{ message }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message?: string
  correct?: boolean
}>()
</script>

<style scoped>
.feedback-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 1rem;
  margin-top: 1rem;
}

.feedback-box--correct {
  background: #dcfce7;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.feedback-box--incorrect {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.feedback-box__icon {
  font-size: 1.25rem;
}
</style>
