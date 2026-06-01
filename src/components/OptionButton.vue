<template>
  <button class="option-button" @click="$emit('select', value)">
    {{ value }}
  </button>
</template>

<script setup>
import { defineProps } from 'vue';
defineProps({
  value: String,
});
</script>

<style scoped>
.option-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background-color: #f0f0f0;
  cursor: pointer;
}
</style>