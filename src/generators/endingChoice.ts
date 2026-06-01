import type { RussianWord, Case, EndingChoiceExercise } from './types'

// Patrones por caso con su preposición/contexto
const CASE_PATTERNS: Record<Case, { template: string; hint_es: string }[]> = {
  genitive: [
    { template: 'У меня нет {form}.', hint_es: 'No tengo {meaning}.' },
    { template: 'У нас нет {form}.', hint_es: 'No tenemos {meaning}.' },
    { template: 'Это портрет {form}.', hint_es: 'Es un retrato de {meaning}.' },
    { template: 'Это подарок для {form}.', hint_es: 'Es un regalo para {meaning}.' },
    { template: 'Я иду из {form}.', hint_es: 'Vengo de {meaning}.' },
    { template: 'Кофе без {form}.', hint_es: 'Café sin {meaning}.' },
    { template: 'После {form} я отдыхаю.', hint_es: 'Después de {meaning} descanso.' },
    { template: 'Я живу около {form}.', hint_es: 'Vivo cerca de {meaning}.' },
  ],
  accusative: [
    { template: 'Я читаю {form}.', hint_es: 'Leo {meaning}.' },
    { template: 'Я люблю {form}.', hint_es: 'Amo {meaning}.' },
    { template: 'Я слушаю {form}.', hint_es: 'Escucho {meaning}.' },
    { template: 'Я вижу {form}.', hint_es: 'Veo {meaning}.' },
    { template: 'Я жду {form}.', hint_es: 'Espero {meaning}.' },
    { template: 'Я иду в {form}.', hint_es: 'Voy a {meaning}.' },
    { template: 'Я еду в {form}.', hint_es: 'Viajo a {meaning}.' },
  ],
  prepositional: [
    { template: 'Мы говорим о {form}.', hint_es: 'Hablamos de {meaning}.' },
    { template: 'Я думаю о {form}.', hint_es: 'Pienso en {meaning}.' },
    { template: 'Я живу в {form}.', hint_es: 'Vivo en {meaning}.' },
    { template: 'Я работаю в {form}.', hint_es: 'Trabajo en {meaning}.' },
    { template: 'Я учусь в {form}.', hint_es: 'Estudio en {meaning}.' },
    { template: 'Я играю на {form}.', hint_es: 'Toco {meaning}.' },
  ],
  dative: [
    { template: 'Я звоню {form}.', hint_es: 'Llamo a {meaning}.' },
    { template: 'Я пишу {form}.', hint_es: 'Escribo a {meaning}.' },
    { template: 'Мне нравится {form}.', hint_es: 'Me gusta {meaning}.' },
    { template: 'Я помогаю {form}.', hint_es: 'Ayudo a {meaning}.' },
    { template: 'Я дарю подарок {form}.', hint_es: 'Regalo algo a {meaning}.' },
  ],
  instrumental: [
    { template: 'Я еду на {form}.', hint_es: 'Voy en {meaning}.' },
    { template: 'Я занимаюсь {form}.', hint_es: 'Me dedico a {meaning}.' },
    { template: 'Я восхищаюсь {form}.', hint_es: 'Me maravillo con {meaning}.' },
    { template: 'Я горжусь {form}.', hint_es: 'Me enorgullezco de {meaning}.' },
    { template: 'Я интересуюсь {form}.', hint_es: 'Me interesa {meaning}.' },
  ],
}

// Terminaciones incorrectas plausibles por caso (distractores)
const WRONG_ENDINGS: Record<Case, string[]> = {
  genitive:     ['у', 'е', 'ом', 'а'],
  accusative:   ['ы', 'е', 'ом', 'и'],
  prepositional:['а', 'у', 'ом', 'ы'],
  dative:       ['а', 'ы', 'ом', 'е'],
  instrumental: ['а', 'е', 'ы', 'у'],
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Extrae el "stem" visible y el ending correcto a partir del nominativo y la forma del caso.
 * Ej: nominative="машина", form="машины" → stem="машин", ending="ы"
 * Si no se puede detectar el stem común, devuelve el nominativo completo como stem y la forma como respuesta.
 */
function splitStemEnding(nominative: string, form: string): { stem: string; ending: string } {
  let i = 0
  while (i < nominative.length && i < form.length && nominative[i] === form[i]) i++
  return {
    stem: form.slice(0, i),
    ending: form.slice(i),
  }
}

/**
 * Genera un ejercicio de tipo Ending Choice para una palabra y un caso dados.
 */
export function generateEndingChoice(word: RussianWord, targetCase: Case): EndingChoiceExercise {
  const form = word.cases[targetCase]
  const { stem, ending: correctEnding } = splitStemEnding(word.nominative, form)

  const pattern = pick(CASE_PATTERNS[targetCase])
  const prompt = pattern.template
    .replace('{form}', `${stem}__`)
  const hint_es = pattern.hint_es.replace('{meaning}', word.meaning_es)

  // Construir 3 distractores únicos y distintos del correcto
  const wrongPool = WRONG_ENDINGS[targetCase].filter(e => e !== correctEnding)
  const distractors = shuffle(wrongPool).slice(0, 3)
  const options = shuffle([correctEnding, ...distractors])

  return {
    type: 'ending-choice',
    prompt,
    base: stem,
    options,
    answer: correctEnding,
    case: targetCase,
    level: word.level,
    hint_es,
  }
}

/**
 * Genera N ejercicios de Ending Choice aleatoriamente desde un listado de palabras.
 */
export function generateEndingChoiceBatch(
  words: RussianWord[],
  count: number,
  filterLevel?: RussianWord['level']
): EndingChoiceExercise[] {
  const pool = filterLevel ? words.filter(w => w.level === filterLevel) : words
  const cases: Case[] = ['genitive', 'accusative', 'prepositional', 'dative', 'instrumental']
  const exercises: EndingChoiceExercise[] = []

  for (let i = 0; i < count; i++) {
    const word = pick(pool)
    const targetCase = pick(cases)
    exercises.push(generateEndingChoice(word, targetCase))
  }

  return exercises
}
