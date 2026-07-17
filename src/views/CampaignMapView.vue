<template>
  <div class="campaign-map">
    <button class="back-btn" @click="router.push('/')">← Inicio</button>

    <header class="hero">
      <h1>Campaign Mode</h1>
      <p>Aprende ruso resolviendo situaciones reales, no preguntas sueltas.</p>
    </header>

    <main class="map">
      <button
        v-for="campaign in campaigns"
        :key="campaign.id"
        class="campaign-node"
        :class="`campaign-node--${campaign.status}`"
        :disabled="campaign.status === 'locked'"
        @click="openCampaign(campaign.id)"
      >
        <span class="campaign-node__emoji">{{ campaign.emoji }}</span>
        <span class="campaign-node__body">
          <strong>{{ campaign.title }}</strong>
          <small>{{ campaign.subtitle }}</small>
        </span>
        <span class="campaign-node__status">{{ statusLabel(campaign.status) }}</span>
      </button>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import campaignData from '@data/russian/campaigns.json'

type CampaignStatus = 'available' | 'locked' | 'planned'

const router = useRouter()
const campaigns = campaignData.campaigns as {
  id: string
  emoji: string
  title: string
  subtitle: string
  status: CampaignStatus
}[]

function openCampaign(id: string) {
  router.push(`/campaigns/${id}`)
}

function statusLabel(status: CampaignStatus) {
  if (status === 'available') return 'Disponible'
  if (status === 'locked') return 'Bloqueada'
  return 'Próximamente'
}
</script>

<style scoped>
.campaign-map {
  min-height: 100svh;
  background: linear-gradient(135deg, #0f172a 0%, #164e63 52%, #1e293b 100%);
  padding: 4rem 1rem 2rem;
  color: #e2e8f0;
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

.hero {
  text-align: center;
  max-width: 720px;
  margin: 0 auto 2rem;
}

.hero h1 {
  margin: 0 0 0.5rem;
  font-size: 2.5rem;
  font-weight: 800;
  color: #f8fafc;
}

.hero p {
  color: #bae6fd;
}

.map {
  max-width: 680px;
  margin: 0 auto;
  display: grid;
  gap: 0.85rem;
}

.campaign-node {
  display: grid;
  grid-template-columns: 3rem 1fr auto;
  align-items: center;
  gap: 1rem;
  width: 100%;
  text-align: left;
  padding: 1rem;
  border-radius: 14px;
  border: 2px solid #334155;
  background: #1e293b;
  color: #e2e8f0;
  cursor: pointer;
}

.campaign-node:hover:not(:disabled) {
  border-color: #22d3ee;
  transform: translateY(-1px);
}

.campaign-node:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.campaign-node__emoji {
  font-size: 2rem;
}

.campaign-node__body {
  display: grid;
  gap: 0.2rem;
}

.campaign-node__body small,
.campaign-node__status {
  color: #94a3b8;
}

.campaign-node__status {
  font-size: 0.78rem;
  font-weight: 800;
}

.campaign-node--available .campaign-node__status {
  color: #86efac;
}

@media (max-width: 560px) {
  .campaign-node {
    grid-template-columns: 2.5rem 1fr;
  }

  .campaign-node__status {
    grid-column: 2;
  }
}
</style>
