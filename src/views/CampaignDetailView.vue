<template>
  <div class="campaign-detail" v-if="campaign">
    <button class="back-btn" @click="router.push('/campaigns')">← Mapa</button>

    <section class="campaign-hero">
      <div class="emoji">{{ campaign.emoji }}</div>
      <h1>{{ campaign.title }}</h1>
      <p>{{ campaign.theme }}</p>
      <div class="reward">Reward: {{ campaign.reward }}</div>
    </section>

    <section class="panel">
      <h2>Vocabulario</h2>
      <div class="chips">
        <span v-for="word in campaign.vocabulary" :key="word">{{ word }}</span>
      </div>
    </section>

    <section class="panel">
      <h2>Conversation Cards</h2>
      <div class="chips">
        <span v-for="phrase in campaign.conversationCards" :key="phrase">{{ phrase }}</span>
      </div>
    </section>

    <section class="lessons">
      <article v-for="lesson in campaign.lessons" :key="lesson.id" class="lesson">
        <div class="lesson__number">{{ lesson.number }}</div>
        <div class="lesson__body">
          <strong>{{ lesson.title }}</strong>
          <p>{{ lesson.goal }}</p>
          <small>{{ lesson.type }}</small>
        </div>
        <button v-if="lesson.route" @click="router.push(lesson.route)">Practicar</button>
        <button v-else disabled>Diseñado</button>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import campaignData from '@data/russian/campaigns.json'

type Campaign = typeof campaignData.campaigns[number] & {
  vocabulary?: string[]
  conversationCards?: string[]
  lessons?: {
    id: string
    number: number
    type: string
    title: string
    goal: string
    route?: string
  }[]
}

const route = useRoute()
const router = useRouter()

const campaign = computed(() => {
  const found = campaignData.campaigns.find(c => c.id === route.params.id) as Campaign | undefined
  return found?.status === 'available' ? found : undefined
})
</script>

<style scoped>
.campaign-detail {
  min-height: 100svh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: #e2e8f0;
  padding: 4rem 1rem 2rem;
  position: relative;
}

.back-btn {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: transparent;
  border: none;
  color: #a5b4fc;
  cursor: pointer;
}

.campaign-hero,
.panel,
.lessons {
  max-width: 760px;
  margin: 0 auto 1rem;
}

.campaign-hero {
  text-align: center;
}

.emoji {
  font-size: 3rem;
}

h1 {
  margin: 0.35rem 0;
  font-size: 2.4rem;
  font-weight: 800;
  color: #f8fafc;
}

h2 {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  color: #bae6fd;
}

.campaign-hero p {
  color: #cbd5e1;
}

.reward,
.panel,
.lesson {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 14px;
}

.reward {
  display: inline-flex;
  padding: 0.5rem 0.75rem;
  color: #fde68a;
}

.panel {
  padding: 1rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chips span {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 999px;
  padding: 0.35rem 0.65rem;
}

.lessons {
  display: grid;
  gap: 0.75rem;
}

.lesson {
  display: grid;
  grid-template-columns: 2.5rem 1fr auto;
  gap: 0.85rem;
  align-items: center;
  padding: 0.9rem;
}

.lesson__number {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 999px;
  background: #0f172a;
  color: #67e8f9;
  font-weight: 800;
}

.lesson p {
  margin: 0.2rem 0;
  color: #94a3b8;
}

.lesson small {
  color: #64748b;
}

button {
  border: none;
  border-radius: 10px;
  background: #0891b2;
  color: white;
  padding: 0.7rem 0.9rem;
  font-weight: 800;
  cursor: pointer;
}

button:disabled {
  background: #334155;
  cursor: default;
}

@media (max-width: 620px) {
  .lesson {
    grid-template-columns: 2.5rem 1fr;
  }

  .lesson button {
    grid-column: 2;
  }
}
</style>
