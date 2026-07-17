<template>
  <div class="lesson-page" v-if="campaign && lesson">
    <button class="back-btn" @click="router.push(`/campaigns/${campaign.id}`)">← Campaña</button>

    <header class="lesson-hero">
      <span class="lesson-kicker">{{ campaign.title }}</span>
      <h1>{{ lesson.title }}</h1>
      <p>{{ lesson.goal }}</p>
      <div class="lesson-type">{{ lessonKind }}</div>
    </header>

    <main class="lesson-shell">
      <section class="panel npc-panel" v-if="usesNpc">
        <div>
          <h2>NPC</h2>
          <select v-model="selectedNpcId">
            <option v-for="person in npcs" :key="person.id" :value="person.id">
              {{ person.name }} · {{ person.role }}
            </option>
          </select>
        </div>
        <div class="affinity" aria-label="Afinidad">
          <span v-for="heart in relationHearts" :key="heart" :class="{ active: heart <= affinity }">♥</span>
        </div>
        <div class="npc-reply">{{ npcReply }}</div>
      </section>

      <section v-if="isVocabularyLesson" class="panel">
        <h2>Vocabulary Match</h2>
        <div class="word-grid">
          <button
            v-for="word in vocabularyItems"
            :key="word"
            :class="{ selected: selectedWords.includes(word) }"
            @click="toggleWord(word)"
          >
            {{ word }}
          </button>
        </div>
        <p class="feedback">Seleccionadas: {{ selectedWords.length }} / {{ vocabularyItems.length }}</p>
      </section>

      <section v-else-if="isChoiceLesson" class="panel">
        <h2>Choice Card</h2>
        <div class="card-picker" v-if="choiceCards.length > 1">
          <button
            v-for="card in choiceCards"
            :key="card.id"
            :class="{ selected: activeCard?.id === card.id }"
            @click="selectCard(card.id)"
          >
            {{ card.prompt }}
          </button>
        </div>

        <article class="choice-card" v-if="activeCard">
          <strong>{{ activeCard.prompt }}</strong>
          <div class="choice-options">
            <button
              v-for="option in activeCard.options"
              :key="option"
              :class="{ selected: selectedOption === option }"
              @click="chooseOption(option)"
            >
              {{ option }}
            </button>
          </div>
          <small>{{ activeCard.follow_up }}</small>
        </article>

        <div class="builder">
          <h3>Opinion Builder</h3>
          <div class="blocks">
            <button v-for="block in builderBlocks" :key="block" @click="addBlock(block)">{{ block }}</button>
          </div>
          <div class="sentence" :class="{ empty: selectedBlocks.length === 0 }">
            {{ selectedBlocks.length ? selectedBlocks.join(' ') : 'Construye la frase con bloques.' }}
          </div>
          <div class="actions">
            <button @click="resetBuilder">Reiniciar</button>
            <button :disabled="!selectedOption" @click="finishStep">Completar</button>
          </div>
        </div>
      </section>

      <section v-else-if="isRoleplayLesson" class="panel">
        <h2>Role Play</h2>
        <div class="role-grid">
          <span v-for="role in lessonRoles" :key="role">{{ role }}</span>
        </div>
        <div class="dialogue-board">
          <button v-for="phrase in dialoguePhrases" :key="phrase" @click="addBlock(phrase)">{{ phrase }}</button>
        </div>
        <div class="sentence" :class="{ empty: selectedBlocks.length === 0 }">
          {{ selectedBlocks.length ? selectedBlocks.join(' ') : 'Elige frases para construir el turno.' }}
        </div>
      </section>

      <section v-else-if="isBossLesson" class="panel boss-panel">
        <h2>Boss Challenge</h2>
        <p>{{ campaign.bossChallenge || lesson.goal }}</p>
        <div class="requirements">
          <span v-for="requirement in lessonRequirements" :key="requirement">{{ requirement }}</span>
        </div>
        <div class="dialogue-board">
          <button v-for="block in bossBlocks" :key="block" @click="addBlock(block)">{{ block }}</button>
        </div>
        <div class="sentence" :class="{ empty: selectedBlocks.length === 0 }">
          {{ selectedBlocks.length ? selectedBlocks.join(' ') : 'Ordena las frases para completar el diálogo final.' }}
        </div>
        <button @click="finishStep">Finalizar boss</button>
      </section>

      <section v-else class="panel">
        <h2>Lesson Runner</h2>
        <p>Esta lección ya está en JSON. El motor todavía no tiene una plantilla especializada para este tipo.</p>
        <button v-if="lesson.route" @click="router.push(lesson.route)">Abrir práctica</button>
      </section>

      <section class="panel rewards-panel">
        <h2>Achievements posibles</h2>
        <div class="chips">
          <span v-for="achievement in campaignAchievements" :key="achievement.id">{{ achievement.title }}</span>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import campaignData from '@data/russian/campaigns.json'
import choiceCardData from '@data/russian/choice-cards.json'
import npcData from '@data/russian/npc-personalities.json'
import achievementData from '@data/russian/achievements.json'

type Lesson = {
  id: string
  number?: number
  type: string
  title: string
  goal: string
  route?: string
  items?: string[]
  roles?: string[]
  phrases?: string[]
  requirements?: string[]
  examples?: string[]
}

type Campaign = {
  id: string
  title: string
  theme?: string
  bossChallenge?: string
  topics?: string[]
  vocabulary?: string[]
  conversationCards?: string[]
  commonPhrases?: string[]
  roles?: string[]
  reward?: string
  status: string
  lessons?: Lesson[]
}

type ChoiceCard = {
  id: string
  topic: string
  prompt: string
  options: string[]
  follow_up?: string
  requirements?: string[]
  example?: string
  partnerReply?: string
}

type Npc = {
  id: string
  name: string
  role: string
  likes: string[]
  dislikes: string[]
  replies: Record<'agree' | 'pushback' | 'neutral', string[]>
}

type Achievement = {
  id: string
  title: string
  campaigns: string[]
}

const route = useRoute()
const router = useRouter()

const campaigns = (campaignData as { campaigns: Campaign[] }).campaigns
const allChoiceCards = (choiceCardData as { choice_cards: ChoiceCard[] }).choice_cards
const npcs = (npcData as { npcs: Npc[] }).npcs
const achievements = (achievementData as { achievements: Achievement[] }).achievements

const selectedNpcId = ref(npcs[0]?.id ?? '')
const selectedCardId = ref('')
const selectedOption = ref('')
const selectedBlocks = ref<string[]>([])
const selectedWords = ref<string[]>([])
const affinity = ref(3)

const campaignId = computed(() => String(route.params.id ?? ''))
const lessonId = computed(() => String(route.params.lessonId ?? ''))

const campaign = computed(() => campaigns.find(item => item.id === campaignId.value && item.status === 'available'))
const lesson = computed(() => campaign.value?.lessons?.find(item => item.id === lessonId.value))
const lessonKind = computed(() => normalizeLessonType(lesson.value?.type ?? ''))
const npc = computed(() => npcs.find(person => person.id === selectedNpcId.value) ?? npcs[0])

const vocabularyItems = computed(() => lesson.value?.items ?? campaign.value?.vocabulary?.slice(0, 16) ?? [])
const lessonTopics = computed(() => new Set([...(campaign.value?.topics ?? []), campaign.value?.id ?? '']))
const choiceCards = computed(() => {
  const cards = allChoiceCards.filter(card => lessonTopics.value.has(card.topic) || card.topic === campaign.value?.id)
  return cards.length ? cards : allChoiceCards.slice(0, 6)
})
const activeCard = computed(() => choiceCards.value.find(card => card.id === selectedCardId.value) ?? choiceCards.value[0])

const relationHearts = computed(() => [1, 2, 3, 4, 5])
const usesNpc = computed(() => isChoiceLesson.value || isRoleplayLesson.value || isBossLesson.value)
const isVocabularyLesson = computed(() => ['vocabulary', 'vocabulary_match'].includes(lessonKind.value))
const isChoiceLesson = computed(() => ['choice_card', 'opinion', 'opinion_challenge', 'preference', 'persuasion', 'debate', 'comparatives'].includes(lessonKind.value))
const isRoleplayLesson = computed(() => ['role_play', 'conversation', 'restaurant_conversation'].includes(lessonKind.value))
const isBossLesson = computed(() => lessonKind.value === 'boss')

const lessonRoles = computed(() => lesson.value?.roles ?? campaign.value?.roles ?? [npc.value?.role ?? 'Friend'])
const lessonRequirements = computed(() => lesson.value?.requirements ?? activeCard.value?.requirements ?? ['1 opinion', '1 reason'])
const dialoguePhrases = computed(() => [
  ...(lesson.value?.phrases ?? []),
  ...(campaign.value?.conversationCards ?? []),
  ...(campaign.value?.commonPhrases ?? []),
].slice(0, 18))

const builderBlocks = computed(() => {
  const option = selectedOption.value || activeCard.value?.options[0] || 'это'
  return [
    'Я выбираю',
    option,
    'потому что',
    'он вкуснее',
    'это полезнее',
    'и удобнее',
    'Кроме того,',
    'Да, но',
    'иногда другой вариант лучше',
  ]
})

const bossBlocks = computed(() => [
  'Я выбираю',
  activeCard.value?.options[0] ?? 'этот вариант',
  'потому что',
  'это лучше',
  'Да, но',
  'можно найти компромисс',
  'Тогда лучше',
  'Давайте попробуем',
])

const npcReply = computed(() => {
  const person = npc.value
  if (!person) return ''
  const option = selectedOption.value || selectedBlocks.value.join(' ')
  const tone = scoreNpcReaction(option, person)
  const replies = person.replies[tone]
  return replies[Math.min(replies.length - 1, Math.max(0, selectedBlocks.value.length % replies.length))]
})

const campaignAchievements = computed(() => achievements.filter(achievement => achievement.campaigns.includes(campaignId.value)))

function normalizeLessonType(type: string) {
  return type.replace(/-/g, '_')
}

function selectCard(id: string) {
  selectedCardId.value = id
  selectedOption.value = ''
  selectedBlocks.value = []
}

function chooseOption(option: string) {
  selectedOption.value = option
  selectedBlocks.value = ['Я выбираю', option]
  const tone = scoreNpcReaction(option, npc.value)
  if (tone === 'agree') affinity.value = Math.min(5, affinity.value + 1)
  if (tone === 'pushback') affinity.value = Math.max(1, affinity.value - 1)
}

function scoreNpcReaction(text: string, person?: Npc): 'agree' | 'pushback' | 'neutral' {
  if (!person || !text) return 'neutral'
  const lowered = text.toLowerCase()
  if (person.dislikes.some(item => lowered.includes(item.toLowerCase()))) return 'pushback'
  if (person.likes.some(item => lowered.includes(item.toLowerCase()))) return 'agree'
  return 'neutral'
}

function addBlock(block: string) {
  selectedBlocks.value.push(block)
}

function resetBuilder() {
  selectedBlocks.value = []
  selectedOption.value = ''
}

function finishStep() {
  affinity.value = Math.min(5, affinity.value + 1)
}

function toggleWord(word: string) {
  selectedWords.value = selectedWords.value.includes(word)
    ? selectedWords.value.filter(item => item !== word)
    : [...selectedWords.value, word]
}
</script>

<style scoped>
.lesson-page {
  min-height: 100svh;
  background: #0f172a;
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
  color: #67e8f9;
  cursor: pointer;
}

.lesson-hero,
.lesson-shell {
  max-width: 860px;
  margin: 0 auto;
}

.lesson-hero {
  margin-bottom: 1rem;
}

.lesson-kicker,
.lesson-type {
  color: #86efac;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 0.76rem;
}

.lesson-hero h1 {
  margin: 0.25rem 0;
  font-size: 2.2rem;
  color: #f8fafc;
}

.lesson-hero p {
  margin: 0 0 0.75rem;
  color: #cbd5e1;
}

.lesson-shell {
  display: grid;
  gap: 1rem;
}

.panel {
  background: #172033;
  border: 1px solid #334155;
  border-radius: 12px;
  padding: 1rem;
}

.panel h2,
.builder h3 {
  margin: 0 0 0.75rem;
  color: #bae6fd;
}

.npc-panel {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  align-items: center;
}

.npc-panel select {
  width: min(100%, 18rem);
  margin-top: 0.35rem;
  border: 1px solid #334155;
  border-radius: 8px;
  background: #0f172a;
  color: #e2e8f0;
  padding: 0.55rem;
}

.affinity {
  font-size: 1.35rem;
  letter-spacing: 0;
  color: #475569;
}

.affinity .active {
  color: #fb7185;
}

.npc-reply {
  grid-column: 1 / -1;
  border-left: 3px solid #22c55e;
  padding-left: 0.75rem;
  color: #f8fafc;
}

.word-grid,
.card-picker,
.choice-options,
.blocks,
.dialogue-board,
.requirements,
.chips,
.role-grid,
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

button,
.chips span,
.role-grid span,
.requirements span {
  border: 1px solid #334155;
  border-radius: 8px;
  background: #0f172a;
  color: #e2e8f0;
  padding: 0.55rem 0.75rem;
}

button {
  cursor: pointer;
  font-weight: 700;
}

button:hover:not(:disabled),
button.selected {
  border-color: #22d3ee;
  color: #f8fafc;
}

button:disabled {
  opacity: 0.45;
  cursor: default;
}

.choice-card {
  display: grid;
  gap: 0.75rem;
  margin: 0.85rem 0;
  padding: 0.85rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
}

.choice-card small,
.feedback {
  color: #94a3b8;
}

.builder {
  display: grid;
  gap: 0.75rem;
}

.sentence {
  min-height: 3.25rem;
  border: 1px dashed #38bdf8;
  border-radius: 10px;
  padding: 0.85rem;
  background: #082f49;
  color: #f8fafc;
}

.sentence.empty {
  color: #94a3b8;
}

.boss-panel {
  border-color: #f59e0b;
}

@media (max-width: 640px) {
  .lesson-page {
    padding-top: 3.5rem;
  }

  .lesson-hero h1 {
    font-size: 1.65rem;
  }

  .npc-panel {
    grid-template-columns: 1fr;
  }

  button,
  .chips span,
  .role-grid span,
  .requirements span {
    width: 100%;
    text-align: left;
  }
}
</style>
