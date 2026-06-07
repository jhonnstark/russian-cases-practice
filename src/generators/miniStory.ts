import type { RussianWord, Case, MiniStoryExercise } from './types'
import semanticPatternsRaw from '../../data/russian/semantic-patterns.json'
import { createGenerationContext, getCaseForm, pickWordForPattern } from './semanticValidator'
import type { GenerationContext, SemanticPattern } from './semanticValidator'

const SEMANTIC_PATTERNS = semanticPatternsRaw as SemanticPattern[]

// Cada plantilla de historia tiene 3 oraciones y 2 huecos con sus casos.
// {W1} y {W2} son reemplazados con la forma correcta de cada palabra.
interface StoryTemplate {
  sentences: [string, string, string]
  blanks: [
    { placeholder: '{W1}'; case: Case; patternHint: string },
    { placeholder: '{W2}'; case: Case; patternHint: string },
  ]
  hint_es: string
}

// patternHint must match exactly a "pattern" field in semantic-patterns.json
const STORY_TEMPLATES: StoryTemplate[] = [
  {
    sentences: [
      'Сегодня я иду в {W1}.',
      'После {W2} я еду домой.',
      'Это был отличный день!',
    ],
    blanks: [
      { placeholder: '{W1}', case: 'accusative',  patternHint: 'Я иду в {noun}.' },
      { placeholder: '{W2}', case: 'genitive',    patternHint: 'После {noun} я отдыхаю.' },
    ],
    hint_es: 'Hoy voy al {W1}. Después del {W2} me voy a casa.',
  },
  {
    sentences: [
      'У меня нет {W1}.',
      'Я думаю о {W2}.',
      'Завтра всё будет лучше.',
    ],
    blanks: [
      { placeholder: '{W1}', case: 'genitive',      patternHint: 'У меня нет {noun}.' },
      { placeholder: '{W2}', case: 'prepositional', patternHint: 'Я думаю о {noun}.' },
    ],
    hint_es: 'No tengo {W1}. Pienso en {W2}.',
  },
  {
    sentences: [
      'Я живу в {W1}.',
      'Я работаю в {W2}.',
      'Мне нравится моя жизнь.',
    ],
    blanks: [
      { placeholder: '{W1}', case: 'prepositional', patternHint: 'Я живу в {noun}.' },
      { placeholder: '{W2}', case: 'prepositional', patternHint: 'Я работаю в {noun}.' },
    ],
    hint_es: 'Vivo en {W1}. Trabajo en {W2}.',
  },
  {
    sentences: [
      'Я еду в {W1}.',
      'Там я жду {W2}.',
      'Мы вместе идём домой.',
    ],
    blanks: [
      { placeholder: '{W1}', case: 'accusative', patternHint: 'Я еду в {noun}.' },
      { placeholder: '{W2}', case: 'accusative', patternHint: 'Я жду {noun}.' },
    ],
    hint_es: 'Voy a {W1}. Allí espero a {W2}.',
  },
  {
    sentences: [
      'Это подарок для {W1}.',
      'Я думаю о {W2}.',
      'Надеюсь, что им понравится.',
    ],
    blanks: [
      { placeholder: '{W1}', case: 'genitive',      patternHint: 'Это подарок для {noun}.' },
      { placeholder: '{W2}', case: 'prepositional', patternHint: 'Я думаю о {noun}.' },
    ],
    hint_es: 'Es un regalo para {W1}. Pienso en {W2}.',
  },
  {
    sentences: [
      'Я звоню {W1}.',
      'Мы говорим о {W2}.',
      'Разговор был очень интересным.',
    ],
    blanks: [
      { placeholder: '{W1}', case: 'dative',        patternHint: 'Я звоню {noun}.' },
      { placeholder: '{W2}', case: 'prepositional', patternHint: 'Мы говорим о {noun}.' },
    ],
    hint_es: 'Llamo a {W1}. Hablamos de {W2}.',
  },
  {
    sentences: [
      'Я помогаю {W1}.',
      'После {W2} мы идём в кафе.',
      'Это приятно — помогать другим.',
    ],
    blanks: [
      { placeholder: '{W1}', case: 'dative',   patternHint: 'Я помогаю {noun}.' },
      { placeholder: '{W2}', case: 'genitive', patternHint: 'После {noun} я отдыхаю.' },
    ],
    hint_es: 'Ayudo a {W1}. Después de {W2} vamos al café.',
  },
  {
    sentences: [
      'Я занимаюсь {W1}.',
      'Я еду на {W2}.',
      'Это мой любимый день.',
    ],
    blanks: [
      { placeholder: '{W1}', case: 'instrumental', patternHint: 'Я занимаюсь {noun}.' },
      { placeholder: '{W2}', case: 'instrumental', patternHint: 'Я еду на {noun}.' },
    ],
    hint_es: 'Me dedico a {W1}. Voy en {W2}.',
  },
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getPattern(patternHint: string): SemanticPattern | undefined {
  return SEMANTIC_PATTERNS.find(p => p.pattern === patternHint)
}

/**
 * Genera un ejercicio de Mini Story eligiendo semánticamente
 * palabras compatibles con cada hueco de la plantilla.
 */
export function generateMiniStory(words: RussianWord[], context?: GenerationContext): MiniStoryExercise {
  const template = pick(STORY_TEMPLATES)
  const [b1, b2] = template.blanks

  const p1 = getPattern(b1.patternHint)
  const p2 = getPattern(b2.patternHint)

  const word1 = p1 ? pickWordForPattern(words, p1, context) : pick(words)
  // Ensure word2 differs from word1
  let word2: RussianWord
  let attempts = 0
  do {
    word2 = p2 ? pickWordForPattern(words, p2, context) : pick(words)
    attempts++
  } while (word2.nominative === word1.nominative && attempts < 10)

  const form1 = getCaseForm(word1, b1.case)
  const form2 = getCaseForm(word2, b2.case)

  const story = template.sentences.map(s =>
    s
      .replace(b1.placeholder, '{blank}')
      .replace(b2.placeholder, '{blank}')
  )

  return {
    type: 'mini-story',
    story,
    blanks: [
      { nominative: word1.nominative, answer: form1, case: b1.case },
      { nominative: word2.nominative, answer: form2, case: b2.case },
    ],
    level: word1.level,
  }
}

/**
 * Genera N ejercicios de Mini Story aleatoriamente desde un listado de palabras.
 */
export function generateMiniStoryBatch(
  words: RussianWord[],
  count: number,
  filterLevel?: RussianWord['level']
): MiniStoryExercise[] {
  const pool = filterLevel ? words.filter(w => w.level === filterLevel) : words
  const exercises: MiniStoryExercise[] = []
  const context = createGenerationContext()

  for (let i = 0; i < count; i++) {
    exercises.push(generateMiniStory(pool, context))
  }

  return exercises
}
