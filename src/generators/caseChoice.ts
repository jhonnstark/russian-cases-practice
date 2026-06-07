import type { RussianWord, Case, CaseChoiceExercise } from './types'
import semanticPatternsRaw from '../../data/russian/semantic-patterns.json'
import {
  createGenerationContext,
  getCaseForm,
  isPatternOnCooldown,
  pickWordForChoiceExercise,
  validChoiceCandidates,
} from './semanticValidator'
import type { GenerationContext, SemanticPattern } from './semanticValidator'

const SEMANTIC_PATTERNS = semanticPatternsRaw as SemanticPattern[]

// hint_es per pattern template
// noinspection NonAsciiCharacters
const HINT_ES: Record<string, string> = {
  'Это {noun}.':               'Esto es {meaning}.',
  'Вот {noun}.':               'Aquí está {meaning}.',
  '{noun} здесь.':             '{meaning} está aquí.',
  '{noun} стоит дорого.':      '{meaning} cuesta caro.',
  '{noun} очень красивый.':    '{meaning} es muy bonito.',
  '{noun} работает здесь.':    '{meaning} trabaja aquí.',
  'У меня нет {noun}.':        'No tengo {meaning}.',
  'У нас нет {noun}.':         'No tenemos {meaning}.',
  'Это портрет {noun}.':       'Es un retrato de {meaning}.',
  'Это флаг {noun}.':          'Es la bandera de {meaning}.',
  'Я из {noun}.':              'Soy de {meaning}.',
  'Это подарок для {noun}.':   'Es un regalo para {meaning}.',
  'Кофе без {noun}.':          'Café sin {meaning}.',
  'После {noun} я отдыхаю.':  'Después de {meaning} descanso.',
  'Я живу около {noun}.':      'Vivo cerca de {meaning}.',
  'Я читаю {noun}.':           'Leo {meaning}.',
  'Я люблю {noun}.':           'Amo {meaning}.',
  'Я слушаю {noun}.':          'Escucho {meaning}.',
  'Я вижу {noun}.':            'Veo {meaning}.',
  'Я жду {noun}.':             'Espero {meaning}.',
  'Я еду в {noun}.':           'Viajo a {meaning}.',
  'Я иду в {noun}.':           'Voy a {meaning}.',
  'Мы говорим о {noun}.':      'Hablamos de {meaning}.',
  'Я думаю о {noun}.':         'Pienso en {meaning}.',
  'Я живу в {noun}.':          'Vivo en {meaning}.',
  'Я работаю в {noun}.':       'Trabajo en {meaning}.',
  'Я учусь в {noun}.':         'Estudio en {meaning}.',
  'Я играю на {noun}.':        'Toco {meaning}.',
  'Я звоню {noun}.':           'Llamo a {meaning}.',
  'Я пишу {noun}.':            'Escribo a {meaning}.',
  'Я помогаю {noun}.':         'Ayudo a {meaning}.',
  'Я дарю подарок {noun}.':    'Le regalo algo a {meaning}.',
  'Я еду на {noun}.':          'Voy en {meaning}.',
  'Я занимаюсь {noun}.':       'Me dedico a {meaning}.',
  'Я восхищаюсь {noun}.':      'Me maravillo con {meaning}.',
  'Я горжусь {noun}.':         'Me enorgullezco de {meaning}.',
  'Я интересуюсь {noun}.':     'Me interesa {meaning}.',
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

function pickViablePatternForCase(
  words: RussianWord[],
  targetCase: Case,
  context?: GenerationContext,
): SemanticPattern {
  const patterns = shuffle(SEMANTIC_PATTERNS.filter(p =>
    p.case === targetCase && !isPatternOnCooldown(p, context)
  ))
  const fallbackPatterns = patterns.length > 0
    ? patterns
    : shuffle(SEMANTIC_PATTERNS.filter(p => p.case === targetCase))

  return fallbackPatterns.find(p =>
    validChoiceCandidates(words, p, targetCase).length >= (context?.minCandidatePool ?? 8)
  ) ?? fallbackPatterns[0] ?? pickPatternForCase(targetCase)
}

/**
 * Attempts to build a CaseChoiceExercise for the given case.
 * Returns null if the word produces < 2 unique options (Rule 5).
 */
function tryGenerateCaseChoice(
  words: RussianWord[],
  targetCase: Case,
  context?: GenerationContext,
): CaseChoiceExercise | null {
  const semanticPattern = pickViablePatternForCase(words, targetCase, context)
  const word = pickWordForChoiceExercise(words, semanticPattern, targetCase, context)

  const correctForm = getCaseForm(word, targetCase)
  const prompt = semanticPattern.pattern.replace('{noun}', '___')
  const hintTemplate = HINT_ES[semanticPattern.pattern] ?? 'Traduce: {meaning}.'
  const hint_es = hintTemplate.replace('{meaning}', word.meaning_es)

  // Build distractors from other case forms of the same word
  const otherCases = (['nominative', 'genitive', 'accusative', 'prepositional', 'dative', 'instrumental'] as Case[])
    .filter(c => c !== targetCase)
  const rawDistractors = shuffle(otherCases)
    .map(c => getCaseForm(word, c))
    .filter(f => f !== correctForm)

  // Deduplicate distractors (Rule 4 / Rule 5)
  const uniqueDistractors = [...new Set(rawDistractors)].slice(0, 3)

  // Pad with nominative only if it differs from correctForm
  if (uniqueDistractors.length < 3 && word.nominative !== correctForm) {
    uniqueDistractors.push(word.nominative)
  }

  const allOptions = [correctForm, ...uniqueDistractors.slice(0, 3)]
  const uniqueOptions = [...new Set(allOptions)]

  // Rule 5: discard if fewer than 2 distinct options
  if (uniqueOptions.length < 2) return null

  return {
    type: 'case-choice',
    prompt,
    nominative: word.nominative,
    options: shuffle(allOptions.slice(0, 4)),
    answer: correctForm,
    case: targetCase,
    level: word.level,
    hint_es,
  }
}

/**
 * Genera un ejercicio de tipo Case Choice, con hasta 5 reintentos si Rule 5 falla.
 */
export function generateCaseChoice(words: RussianWord[], targetCase: Case): CaseChoiceExercise {
  for (let attempt = 0; attempt < 5; attempt++) {
    const ex = tryGenerateCaseChoice(words, targetCase)
    if (ex) return ex
  }
  // Last resort: force-generate ignoring quality (shouldn't happen with 109 words)
  return tryGenerateCaseChoice(words, targetCase) ?? {
    type: 'case-choice',
    prompt: '___',
    nominative: '—',
    options: ['—'],
    answer: '—',
    case: targetCase,
    level: 'A1',
    hint_es: '',
  }
}

/**
 * Genera N ejercicios de Case Choice.
 * Respects filterCase when provided (used when user selects a specific case).
 */
export function generateCaseChoiceBatch(
  words: RussianWord[],
  count: number,
  options?: { filterLevel?: RussianWord['level']; filterCase?: Case }
): CaseChoiceExercise[] {
  const pool = options?.filterLevel ? words.filter(w => w.level === options.filterLevel) : words
  const cases: Case[] = ['nominative', 'genitive', 'accusative', 'prepositional', 'dative', 'instrumental']
  const exercises: CaseChoiceExercise[] = []
  const context = createGenerationContext()

  for (let i = 0; i < count; i++) {
    const targetCase = options?.filterCase ?? pick(cases)
    const ex = tryGenerateCaseChoice(pool, targetCase, context)
    if (ex) exercises.push(ex)
  }

  return exercises
}
