import type { RussianWord, Case, CaseChoiceExercise } from './types'

// Cada plantilla tiene un hueco {blank} que se rellena con la forma correcta.
// Los distractores son formas del mismo sustantivo en otros casos.
const CASE_TEMPLATES: Record<Case, { template: string; hint_es: string }[]> = {
  genitive: [
    { template: 'У меня нет {blank}.', hint_es: 'No tengo {meaning}.' },
    { template: 'Это портрет {blank}.', hint_es: 'Es un retrato de {meaning}.' },
    { template: 'Это подарок для {blank}.', hint_es: 'Es un regalo para {meaning}.' },
    { template: 'Я иду из {blank}.', hint_es: 'Vengo de {meaning}.' },
    { template: 'Кофе без {blank}.', hint_es: 'Café sin {meaning}.' },
    { template: 'После {blank} я отдыхаю.', hint_es: 'Después de {meaning} descanso.' },
    { template: 'Я живу около {blank}.', hint_es: 'Vivo cerca de {meaning}.' },
  ],
  accusative: [
    { template: 'Я читаю {blank}.', hint_es: 'Leo {meaning}.' },
    { template: 'Я люблю {blank}.', hint_es: 'Amo {meaning}.' },
    { template: 'Я слушаю {blank}.', hint_es: 'Escucho {meaning}.' },
    { template: 'Я вижу {blank}.', hint_es: 'Veo {meaning}.' },
    { template: 'Я жду {blank}.', hint_es: 'Espero {meaning}.' },
    { template: 'Я еду в {blank}.', hint_es: 'Viajo a {meaning}.' },
  ],
  prepositional: [
    { template: 'Мы говорим о {blank}.', hint_es: 'Hablamos de {meaning}.' },
    { template: 'Я думаю о {blank}.', hint_es: 'Pienso en {meaning}.' },
    { template: 'Я живу в {blank}.', hint_es: 'Vivo en {meaning}.' },
    { template: 'Я работаю в {blank}.', hint_es: 'Trabajo en {meaning}.' },
    { template: 'Я учусь в {blank}.', hint_es: 'Estudio en {meaning}.' },
    { template: 'Я играю на {blank}.', hint_es: 'Toco {meaning}.' },
  ],
  dative: [
    { template: 'Я звоню {blank}.', hint_es: 'Llamo a {meaning}.' },
    { template: 'Я пишу {blank}.', hint_es: 'Escribo a {meaning}.' },
    { template: 'Я помогаю {blank}.', hint_es: 'Ayudo a {meaning}.' },
    { template: 'Я дарю подарок {blank}.', hint_es: 'Le regalo algo a {meaning}.' },
    { template: 'Мне нравится {blank}.', hint_es: 'Me gusta {meaning}.' },
  ],
  instrumental: [
    { template: 'Я еду на {blank}.', hint_es: 'Voy en {meaning}.' },
    { template: 'Я занимаюсь {blank}.', hint_es: 'Me dedico a {meaning}.' },
    { template: 'Я восхищаюсь {blank}.', hint_es: 'Me maravillo con {meaning}.' },
    { template: 'Я горжусь {blank}.', hint_es: 'Me enorgullezco de {meaning}.' },
    { template: 'Я интересуюсь {blank}.', hint_es: 'Me interesa {meaning}.' },
  ],
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Genera un ejercicio de tipo Case Choice para una palabra y un caso dados.
 * El usuario elige la opción completa correcta (preposición + forma).
 */
export function generateCaseChoice(word: RussianWord, targetCase: Case): CaseChoiceExercise {
  const correctForm = word.cases[targetCase]
  const pattern = pick(CASE_TEMPLATES[targetCase])

  const prompt = pattern.template.replace('{blank}', '___')
  const hint_es = pattern.hint_es.replace('{meaning}', word.meaning_es)

  // Construir la opción correcta
  const correctOption = correctForm

  // Construir 3 distractores con formas del mismo sustantivo en otros casos
  const otherCases = (['genitive', 'accusative', 'prepositional', 'dative', 'instrumental'] as Case[])
    .filter(c => c !== targetCase)
  const distractors = shuffle(otherCases)
    .slice(0, 3)
    .map(c => word.cases[c])
    .filter(f => f !== correctOption) // evitar duplicados si dos casos coinciden

  // Si por irregularidades hay menos de 3 distractores únicos, rellenar con nominativo
  while (distractors.length < 3) {
    distractors.push(word.nominative)
  }

  const options = shuffle([correctOption, ...distractors.slice(0, 3)])

  return {
    type: 'case-choice',
    prompt,
    options,
    answer: correctOption,
    case: targetCase,
    level: word.level,
    hint_es,
  }
}

/**
 * Genera N ejercicios de Case Choice aleatoriamente desde un listado de palabras.
 */
export function generateCaseChoiceBatch(
  words: RussianWord[],
  count: number,
  filterLevel?: RussianWord['level']
): CaseChoiceExercise[] {
  const pool = filterLevel ? words.filter(w => w.level === filterLevel) : words
  const cases: Case[] = ['genitive', 'accusative', 'prepositional', 'dative', 'instrumental']
  const exercises: CaseChoiceExercise[] = []

  for (let i = 0; i < count; i++) {
    const word = pick(pool)
    const targetCase = pick(cases)
    exercises.push(generateCaseChoice(word, targetCase))
  }

  return exercises
}
