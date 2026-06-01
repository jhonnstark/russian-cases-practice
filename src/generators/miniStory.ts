import type { RussianWord, Case, MiniStoryExercise } from './types'

// Cada plantilla de historia tiene 3 oraciones y 2 huecos con sus casos.
// {W1} y {W2} son reemplazados con la forma correcta de cada palabra.
interface StoryTemplate {
  sentences: [string, string, string]
  blanks: [
    { placeholder: '{W1}'; case: Case },
    { placeholder: '{W2}'; case: Case },
  ]
  hint_es: string
}

const STORY_TEMPLATES: StoryTemplate[] = [
  {
    sentences: [
      'Сегодня я иду в {W1}.',
      'После {W2} я еду домой.',
      'Это был отличный день!',
    ],
    blanks: [
      { placeholder: '{W1}', case: 'accusative' },
      { placeholder: '{W2}', case: 'genitive' },
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
      { placeholder: '{W1}', case: 'genitive' },
      { placeholder: '{W2}', case: 'prepositional' },
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
      { placeholder: '{W1}', case: 'prepositional' },
      { placeholder: '{W2}', case: 'prepositional' },
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
      { placeholder: '{W1}', case: 'accusative' },
      { placeholder: '{W2}', case: 'accusative' },
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
      { placeholder: '{W1}', case: 'genitive' },
      { placeholder: '{W2}', case: 'prepositional' },
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
      { placeholder: '{W1}', case: 'dative' },
      { placeholder: '{W2}', case: 'prepositional' },
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
      { placeholder: '{W1}', case: 'dative' },
      { placeholder: '{W2}', case: 'genitive' },
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
      { placeholder: '{W1}', case: 'instrumental' },
      { placeholder: '{W2}', case: 'instrumental' },
    ],
    hint_es: 'Me dedico a {W1}. Voy en {W2}.',
  },
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Genera un ejercicio de Mini Story usando dos palabras y una plantilla aleatoria.
 * Las oraciones con huecos se marcan con {blank} para el frontend.
 */
export function generateMiniStory(word1: RussianWord, word2: RussianWord): MiniStoryExercise {
  const template = pick(STORY_TEMPLATES)

  const [b1, b2] = template.blanks
  const form1 = word1.cases[b1.case]
  const form2 = word2.cases[b2.case]

  // Reemplazar placeholders en las oraciones: poner {blank} donde va el hueco
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

  for (let i = 0; i < count; i++) {
    // Elegir dos palabras distintas
    let word1 = pick(pool)
    let word2 = pick(pool)
    let attempts = 0
    while (word2.nominative === word1.nominative && attempts < 10) {
      word2 = pick(pool)
      attempts++
    }
    exercises.push(generateMiniStory(word1, word2))
  }

  return exercises
}
