import comparativesRaw from '../../data/russian/comparatives.json'
import type {
  BuildComparisonExercise,
  ChooseComparativeExercise,
  ComparativeEntry,
  ComparativeExercise,
  ComparativeMode,
  ComparativeSourceExercise,
} from './comparativeTypes'

const COMPARATIVES = comparativesRaw.comparatives as ComparativeEntry[]

const EXERCISE_COUNT = 10
const COMPARATIVE_COOLDOWN = 15
const PATTERN_COOLDOWN = 8

const OPPOSITES: Record<string, string> = {
  лучше: 'хуже',
  хуже: 'лучше',
  чаще: 'реже',
  реже: 'чаще',
  больше: 'меньше',
  меньше: 'больше',
  выше: 'ниже',
  ниже: 'выше',
  дальше: 'ближе',
  ближе: 'дальше',
  шире: 'уже',
  уже: 'шире',
  дороже: 'дешевле',
  дешевле: 'дороже',
  громче: 'тише',
  тише: 'громче',
  раньше: 'позже',
  позже: 'раньше',
  старше: 'моложе',
  моложе: 'старше',
  толще: 'тоньше',
  тоньше: 'толще',
}

const MEANING_DISTRACTORS = [
  'más caro',
  'más barato',
  'más alto',
  'más bajo',
  'más temprano',
  'más tarde',
  'más cerca',
  'más lejos',
  'más frecuentemente',
  'menos frecuentemente',
  'más silencioso',
  'más fuerte',
  'mejor',
  'peor',
]

interface ComparativeContext {
  step: number
  recentComparatives: string[]
  recentPatterns: string[]
  recentTags: string[]
}

function createContext(): ComparativeContext {
  return {
    step: 0,
    recentComparatives: [],
    recentPatterns: [],
    recentTags: [],
  }
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5)
}

function pick<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

function unique(items: string[]): string[] {
  return [...new Set(items.filter(Boolean))]
}

function sourceForms(entry: ComparativeEntry): string[] {
  return unique([entry.adjective ?? '', entry.adverb ?? ''])
}

function sourceLabel(entry: ComparativeEntry): string {
  return sourceForms(entry).join(' / ')
}

function explanation(entry: ComparativeEntry): string {
  const regularity = entry.irregular ? 'irregular' : 'regular'
  return `${sourceLabel(entry)} → ${entry.comparative}. Comparativo ${regularity}.`
}

function weightedPick(entries: ComparativeEntry[], context: ComparativeContext): ComparativeEntry {
  const pool = entries.length ? entries : COMPARATIVES
  const weights = pool.map(entry => {
    const seenPenalty = context.recentComparatives.includes(entry.comparative) ? 0.1 : 1
    const tagPenalty = entry.tags.some(t => context.recentTags.includes(t)) ? 0.65 : 1
    return Math.max(0.1, entry.learningScore * seenPenalty * tagPenalty)
  })
  const total = weights.reduce((sum, weight) => sum + weight, 0)
  let cursor = Math.random() * total

  for (let i = 0; i < pool.length; i++) {
    cursor -= weights[i]
    if (cursor <= 0) return pool[i]
  }

  return pool[pool.length - 1]
}

function pickEntry(context: ComparativeContext, filter?: (entry: ComparativeEntry) => boolean): ComparativeEntry {
  const filtered = COMPARATIVES.filter(entry =>
    !context.recentComparatives.includes(entry.comparative) &&
    (!filter || filter(entry))
  )
  const entry = weightedPick(filtered.length ? filtered : COMPARATIVES.filter(e => !filter || filter(e)), context)
  context.recentComparatives.push(entry.comparative)
  context.recentComparatives = context.recentComparatives.slice(-COMPARATIVE_COOLDOWN)
  context.recentTags.push(entry.tags[0] ?? 'quality')
  context.recentTags = context.recentTags.slice(-8)
  context.step += 1
  return entry
}

function comparativeOptions(answer: string, include: string[] = []): string[] {
  const distractors = shuffle(COMPARATIVES.map(e => e.comparative).filter(c => c !== answer))
  return shuffle(unique([answer, ...include, ...distractors]).slice(0, 4))
}

function sourceOptions(entry: ComparativeEntry): string[] {
  const answers = sourceForms(entry)
  const distractors = shuffle(COMPARATIVES.flatMap(sourceForms).filter(form => !answers.includes(form)))
  return shuffle(unique([...answers, ...distractors]).slice(0, 4))
}

function meaningOptions(entry: ComparativeEntry): string[] {
  const distractors = shuffle(MEANING_DISTRACTORS.filter(m => m !== entry.meaning_es))
  return shuffle(unique([entry.meaning_es, ...distractors]).slice(0, 4))
}

function registerPattern(context: ComparativeContext, pattern: string): void {
  context.recentPatterns.push(pattern)
  context.recentPatterns = context.recentPatterns.slice(-PATTERN_COOLDOWN)
}

function generateChooseComparative(entry: ComparativeEntry): ChooseComparativeExercise {
  return {
    id: `${entry.id}-choose`,
    type: 'choose-comparative',
    entry,
    source: sourceLabel(entry),
    prompt: `${sourceLabel(entry)} → ?`,
    answer: entry.comparative,
    options: comparativeOptions(entry.comparative, sourceForms(entry)),
    explanation_es: explanation(entry),
  }
}

function generateCompleteSentence(entry: ComparativeEntry) {
  const sentence = pick(entry.examples).replace(entry.comparative, '______')
  return {
    id: `${entry.id}-sentence`,
    type: 'complete-sentence' as const,
    entry,
    prompt: 'Completa la comparación:',
    sentence,
    answer: entry.comparative,
    options: comparativeOptions(entry.comparative, sourceForms(entry)),
    explanation_es: explanation(entry),
  }
}

function generateSourceForm(entry: ComparativeEntry): ComparativeSourceExercise {
  const acceptedAnswers = sourceForms(entry)
  return {
    id: `${entry.id}-source`,
    type: 'source-form',
    entry,
    prompt: `¿Qué forma base puede producir "${entry.comparative}"?`,
    answer: acceptedAnswers[0],
    acceptedAnswers,
    options: sourceOptions(entry),
    explanation_es: `También válido: ${acceptedAnswers.join(' / ')}.`,
  }
}

function generateMeaning(entry: ComparativeEntry) {
  return {
    id: `${entry.id}-meaning`,
    type: 'meaning' as const,
    entry,
    prompt: `¿Qué significa "${entry.comparative}"?`,
    answer: entry.meaning_es,
    options: meaningOptions(entry),
    explanation_es: `${entry.comparative} = ${entry.meaning_es}.`,
  }
}

function generateOpposite(entry: ComparativeEntry) {
  const answer = OPPOSITES[entry.comparative]
  return {
    id: `${entry.id}-opposite`,
    type: 'opposite' as const,
    entry,
    prompt: `Encuentra el comparativo opuesto de "${entry.comparative}"`,
    answer,
    options: comparativeOptions(answer),
    explanation_es: `${entry.comparative} ↔ ${answer}.`,
  }
}

function generateBuildComparison(entry: ComparativeEntry): BuildComparisonExercise {
  const sentence = pick(entry.examples)
  const blocks = sentence.replace('.', '').replace(',', ' ,').split(' ')
  return {
    id: `${entry.id}-build`,
    type: 'build-comparison',
    entry,
    prompt: 'Ordena la comparación:',
    answer: sentence,
    blocks: shuffle(blocks),
    explanation_es: sentence,
  }
}

function generateConversation(entry: ComparativeEntry) {
  const choices = [
    `Я думаю, что ${entry.comparative}.`,
    `Мне больше нравится Сочи.`,
    `Да, но в другом месте ${entry.comparative}.`,
    `Тогда лучше выбрать этот вариант.`,
  ]
  return {
    id: `${entry.id}-conversation`,
    type: 'conversation' as const,
    entry,
    prompt: 'Выберите естественный ответ:',
    answer: choices[0],
    choices,
    options: shuffle(choices),
    explanation_es: `Respuesta natural usando ${entry.comparative}.`,
  }
}

export function generateComparativeExercise(
  mode: ComparativeMode,
  context = createContext(),
): ComparativeExercise {
  const effectiveMode = mode
  const needsOpposite = effectiveMode === 'opposite'
  const entry = pickEntry(context, needsOpposite ? e => Boolean(OPPOSITES[e.comparative]) : undefined)
  registerPattern(context, effectiveMode)

  switch (effectiveMode) {
    case 'choose-comparative':
      return generateChooseComparative(entry)
    case 'complete-sentence':
      return generateCompleteSentence(entry)
    case 'source-form':
      return generateSourceForm(entry)
    case 'meaning':
      return generateMeaning(entry)
    case 'opposite':
      return generateOpposite(entry)
    case 'build-comparison':
      return generateBuildComparison(entry)
    case 'conversation':
      return generateConversation(entry)
  }
}

export type ComparativeGameMode = ComparativeMode | 'mixed'

export function generateComparativeBatch(mode: ComparativeGameMode, count = EXERCISE_COUNT): ComparativeExercise[] {
  const context = createContext()
  const modes: ComparativeMode[] = [
    'choose-comparative',
    'complete-sentence',
    'source-form',
    'meaning',
    'opposite',
    'build-comparison',
    'conversation',
  ]

  return Array.from({ length: count }, (_, i) =>
    generateComparativeExercise(mode === 'mixed' ? modes[i % modes.length] : mode, context)
  )
}
