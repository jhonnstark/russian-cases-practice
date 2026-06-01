import type { RussianWord, Case, EndingChoiceExercise } from './types'
import semanticPatternsRaw from '../../data/russian/semantic-patterns.json'
import { pickWordForChoiceExercise, getCaseForm } from './semanticValidator'
import type { SemanticPattern } from './semanticValidator'

const SEMANTIC_PATTERNS = semanticPatternsRaw as SemanticPattern[]

// hint_es per pattern template (parallel to semantic-patterns.json order, keyed by pattern string)
const HINT_ES: Record<string, string> = {
  'Это {noun}.':               'Esto es {meaning}.',
  'Вот {noun}.':               'Aquí está {meaning}.',
  '{noun} здесь.':             '{meaning} está aquí.',
  '{noun} стоит дорого.':      '{meaning} cuesta caro.',
  '{noun} очень красивый.':    '{meaning} es muy bonito.',
  '{noun} работает здесь.':    '{meaning} trabaja aquí.',
  'У меня нет {noun}.':        'No tengo {meaning}.',
  'У нас нет {noun}.':        'No tenemos {meaning}.',
  'Это портрет {noun}.':      'Es un retrato de {meaning}.',
  'Это флаг {noun}.':         'Es la bandera de {meaning}.',
  'Я из {noun}.':             'Soy de {meaning}.',
  'Это подарок для {noun}.':  'Es un regalo para {meaning}.',
  'Кофе без {noun}.':         'Café sin {meaning}.',
  'После {noun} я отдыхаю.': 'Después de {meaning} descanso.',
  'Я живу около {noun}.':     'Vivo cerca de {meaning}.',
  'Я читаю {noun}.':          'Leo {meaning}.',
  'Я люблю {noun}.':          'Amo {meaning}.',
  'Я слушаю {noun}.':         'Escucho {meaning}.',
  'Я вижу {noun}.':           'Veo {meaning}.',
  'Я жду {noun}.':            'Espero {meaning}.',
  'Я еду в {noun}.':          'Viajo a {meaning}.',
  'Я иду в {noun}.':          'Voy a {meaning}.',
  'Мы говорим о {noun}.':     'Hablamos de {meaning}.',
  'Я думаю о {noun}.':        'Pienso en {meaning}.',
  'Я живу в {noun}.':         'Vivo en {meaning}.',
  'Я работаю в {noun}.':      'Trabajo en {meaning}.',
  'Я учусь в {noun}.':        'Estudio en {meaning}.',
  'Я играю на {noun}.':       'Toco {meaning}.',
  'Я звоню {noun}.':          'Llamo a {meaning}.',
  'Я пишу {noun}.':           'Escribo a {meaning}.',
  'Я помогаю {noun}.':        'Ayudo a {meaning}.',
  'Я дарю подарок {noun}.':   'Le regalo algo a {meaning}.',
  'Я еду на {noun}.':         'Voy en {meaning}.',
  'Я занимаюсь {noun}.':      'Me dedico a {meaning}.',
  'Я восхищаюсь {noun}.':     'Me maravillo con {meaning}.',
  'Я горжусь {noun}.':        'Me enorgullezco de {meaning}.',
  'Я интересуюсь {noun}.':    'Me interesa {meaning}.',
}

// Terminaciones incorrectas plausibles por caso (distractores)
const WRONG_ENDINGS: Record<Case, string[]> = {
  nominative:   ['у', 'е', 'ом', 'ы'],
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

function pickPatternForCase(targetCase: Case): SemanticPattern {
  const patterns = SEMANTIC_PATTERNS.filter(p => p.case === targetCase)
  return pick(patterns)
}

/**
 * Extrae el "stem" visible y el ending correcto a partir del nominativo y la forma del caso.
 * Ej: nominative="машина", form="машины" → stem="машин", ending="ы"
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
 * Attempts to build an EndingChoiceExercise.
 * Returns null if unique options < 2 (Rule 5 — e.g. indeclinable slipped through).
 */
function tryGenerateEndingChoice(words: RussianWord[], targetCase: Case): EndingChoiceExercise | null {
  const semanticPattern = pickPatternForCase(targetCase)
  const word = pickWordForChoiceExercise(words, semanticPattern, targetCase)

  const form = getCaseForm(word, targetCase)
  const { stem, ending: correctEnding } = splitStemEnding(word.nominative, form)

  // For nominative the ending IS the full word — correctEnding could be the whole form.
  // Distractors from the wrong-endings pool, deduped against correct.
  const wrongPool = WRONG_ENDINGS[targetCase].filter(e => e !== correctEnding)
  const uniqueDistractors = [...new Set(wrongPool)].slice(0, 3)
  const allOptions = [correctEnding, ...uniqueDistractors]

  // Rule 5: discard if < 2 unique options
  if ([...new Set(allOptions)].length < 2) return null

  const prompt = semanticPattern.pattern.replace('{noun}', stem ? `${stem}__` : '__')
  const hintTemplate = HINT_ES[semanticPattern.pattern] ?? 'Traduce: {meaning}.'
  const hint_es = hintTemplate.replace('{meaning}', word.meaning_es)

  return {
    type: 'ending-choice',
    prompt,
    nominative: word.nominative,
    base: stem,
    options: shuffle(allOptions),
    answer: correctEnding,
    case: targetCase,
    level: word.level,
    hint_es,
  }
}

/**
 * Genera un ejercicio de tipo Ending Choice con hasta 5 reintentos si Rule 5 falla.
 */
export function generateEndingChoice(words: RussianWord[], targetCase: Case): EndingChoiceExercise {
  for (let attempt = 0; attempt < 5; attempt++) {
    const ex = tryGenerateEndingChoice(words, targetCase)
    if (ex) return ex
  }
  // Should never reach here with a proper dictionary
  return tryGenerateEndingChoice(words, targetCase) ?? {
    type: 'ending-choice',
    prompt: '___',
    nominative: '—',
    base: '—',
    options: ['—'],
    answer: '—',
    case: targetCase,
    level: 'A1',
    hint_es: '',
  }
}

/**
 * Genera N ejercicios de Ending Choice.
 * Respects filterCase when provided.
 */
export function generateEndingChoiceBatch(
  words: RussianWord[],
  count: number,
  options?: { filterLevel?: RussianWord['level']; filterCase?: Case }
): EndingChoiceExercise[] {
  const pool = options?.filterLevel ? words.filter(w => w.level === options.filterLevel) : words
  const cases: Case[] = ['nominative', 'genitive', 'accusative', 'prepositional', 'dative', 'instrumental']
  const exercises: EndingChoiceExercise[] = []

  for (let i = 0; i < count; i++) {
    const targetCase = options?.filterCase ?? pick(cases)
    exercises.push(generateEndingChoice(pool, targetCase))
  }

  return exercises
}
