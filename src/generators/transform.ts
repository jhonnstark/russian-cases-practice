import type { RussianWord, Case, TransformExercise } from './types'
import { createGenerationContext, getCaseForm, pickWordForFormExercise } from './semanticValidator'

// Pista contextual por caso para guiar al usuario
const CASE_HINTS: Record<Case, string> = {
  nominative:    'Это ___  /  Вот ___',
  genitive:      'У меня нет ___  /  Это для ___',
  accusative:    'Я вижу ___  /  Я читаю ___',
  prepositional: 'Я думаю о ___  /  Я живу в ___',
  dative:        'Я звоню ___  /  Я помогаю ___',
  instrumental:  'Я еду на ___  /  Я занимаюсь ___',
}

const CASE_HINT_ES: Record<Case, string> = {
  nominative:    'nominativo — sujeto, predicado nominal',
  genitive:      'genitivo — negación, posesión, origen',
  accusative:    'acusativo — objeto directo, dirección',
  prepositional: 'preposicional — lugar, tema',
  dative:        'dativo — destinatario, gustar',
  instrumental:  'instrumental — medio, instrumento',
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Genera un ejercicio de tipo Transform para una palabra y un caso dados.
 * El usuario escribe la forma correcta a partir del nominativo.
 */
export function generateTransform(word: RussianWord, targetCase: Case): TransformExercise {
  return {
    type: 'transform',
    nominative: word.nominative,
    targetCase,
    answer: getCaseForm(word, targetCase),
    meaning_es: word.meaning_es,
    level: word.level,
    hint_es: `${CASE_HINT_ES[targetCase]} — ${CASE_HINTS[targetCase]}`,
  }
}

/**
 * Genera N ejercicios de Transform aleatoriamente desde un listado de palabras.
 * Puedes filtrar por caso específico o dejar que elija al azar.
 */
export function generateTransformBatch(
  words: RussianWord[],
  count: number,
  options?: {
    filterLevel?: RussianWord['level']
    filterCase?: Case
  }
): TransformExercise[] {
  const pool = options?.filterLevel
    ? words.filter(w => w.level === options.filterLevel)
    : words

  const cases: Case[] = ['nominative', 'genitive', 'accusative', 'prepositional', 'dative', 'instrumental']
  const exercises: TransformExercise[] = []

  const context = createGenerationContext()

  for (let i = 0; i < count; i++) {
    const targetCase = options?.filterCase ?? pick(cases)
    const word = pickWordForFormExercise(pool, targetCase, context)
    exercises.push(generateTransform(word, targetCase))
  }

  return exercises
}
