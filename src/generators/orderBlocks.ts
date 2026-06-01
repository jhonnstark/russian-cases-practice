import type { RussianWord, Case, OrderBlocksExercise } from './types'

// Frases plantilla por caso. {WORD} se reemplaza con la forma correcta del caso.
const SENTENCE_TEMPLATES: Record<Case, { words: (form: string) => string[]; hint_es: string }[]> = {
  genitive: [
    { words: f => ['У', 'меня', 'нет', f + '.'],          hint_es: 'No tengo ...' },
    { words: f => ['У', 'нас', 'нет', f + '.'],           hint_es: 'No tenemos ...' },
    { words: f => ['Это', 'портрет', f + '.'],             hint_es: 'Es un retrato de ...' },
    { words: f => ['Я', 'иду', 'из', f + '.'],            hint_es: 'Vengo de ...' },
    { words: f => ['Кофе', 'без', f + '.'],                hint_es: 'Café sin ...' },
    { words: f => ['После', f, 'я', 'отдыхаю.'],          hint_es: 'Después de ... descanso.' },
    { words: f => ['Я', 'живу', 'около', f + '.'],        hint_es: 'Vivo cerca de ...' },
    { words: f => ['Это', 'подарок', 'для', f + '.'],     hint_es: 'Es un regalo para ...' },
  ],
  accusative: [
    { words: f => ['Я', 'читаю', f + '.'],                 hint_es: 'Leo ...' },
    { words: f => ['Я', 'люблю', f + '.'],                 hint_es: 'Amo ...' },
    { words: f => ['Я', 'слушаю', f + '.'],                hint_es: 'Escucho ...' },
    { words: f => ['Я', 'вижу', f + '.'],                  hint_es: 'Veo ...' },
    { words: f => ['Я', 'жду', f + '.'],                   hint_es: 'Espero ...' },
    { words: f => ['Я', 'еду', 'в', f + '.'],             hint_es: 'Viajo a ...' },
    { words: f => ['Я', 'иду', 'в', f + '.'],             hint_es: 'Voy a ...' },
  ],
  prepositional: [
    { words: f => ['Мы', 'говорим', 'о', f + '.'],        hint_es: 'Hablamos de ...' },
    { words: f => ['Я', 'думаю', 'о', f + '.'],           hint_es: 'Pienso en ...' },
    { words: f => ['Я', 'живу', 'в', f + '.'],            hint_es: 'Vivo en ...' },
    { words: f => ['Я', 'работаю', 'в', f + '.'],         hint_es: 'Trabajo en ...' },
    { words: f => ['Я', 'учусь', 'в', f + '.'],           hint_es: 'Estudio en ...' },
    { words: f => ['Я', 'играю', 'на', f + '.'],          hint_es: 'Toco ...' },
  ],
  dative: [
    { words: f => ['Я', 'звоню', f + '.'],                 hint_es: 'Llamo a ...' },
    { words: f => ['Я', 'пишу', f + '.'],                  hint_es: 'Escribo a ...' },
    { words: f => ['Я', 'помогаю', f + '.'],               hint_es: 'Ayudo a ...' },
    { words: f => ['Я', 'дарю', 'подарок', f + '.'],      hint_es: 'Regalo algo a ...' },
  ],
  instrumental: [
    { words: f => ['Я', 'еду', 'на', f + '.'],            hint_es: 'Voy en ...' },
    { words: f => ['Я', 'занимаюсь', f + '.'],             hint_es: 'Me dedico a ...' },
    { words: f => ['Я', 'восхищаюсь', f + '.'],            hint_es: 'Me maravillo con ...' },
    { words: f => ['Я', 'горжусь', f + '.'],               hint_es: 'Me enorgullezco de ...' },
    { words: f => ['Я', 'интересуюсь', f + '.'],           hint_es: 'Me interesa ...' },
  ],
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Genera un ejercicio de tipo Order Blocks para una palabra y un caso dados.
 * El usuario ordena bloques de palabras para formar la oración correcta.
 */
export function generateOrderBlocks(word: RussianWord, targetCase: Case): OrderBlocksExercise {
  const form = word.cases[targetCase]
  const template = pick(SENTENCE_TEMPLATES[targetCase])
  const orderedBlocks = template.words(form)
  const answer = orderedBlocks.join(' ')

  return {
    type: 'order-blocks',
    blocks: shuffle(orderedBlocks),
    answer,
    case: targetCase,
    level: word.level,
    hint_es: template.hint_es,
  }
}

/**
 * Genera N ejercicios de Order Blocks aleatoriamente desde un listado de palabras.
 */
export function generateOrderBlocksBatch(
  words: RussianWord[],
  count: number,
  options?: {
    filterLevel?: RussianWord['level']
    filterCase?: Case
  }
): OrderBlocksExercise[] {
  const pool = options?.filterLevel
    ? words.filter(w => w.level === options.filterLevel)
    : words

  const cases: Case[] = ['genitive', 'accusative', 'prepositional', 'dative', 'instrumental']
  const exercises: OrderBlocksExercise[] = []

  for (let i = 0; i < count; i++) {
    const word = pick(pool)
    const targetCase = options?.filterCase ?? pick(cases)
    exercises.push(generateOrderBlocks(word, targetCase))
  }

  return exercises
}
