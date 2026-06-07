import type { RussianWord, Case, OrderBlocksExercise } from './types'
import semanticPatternsRaw from '../../data/russian/semantic-patterns.json'
import { createGenerationContext, getCaseForm, isPatternOnCooldown, pickWordForPattern } from './semanticValidator'
import type { GenerationContext, SemanticPattern } from './semanticValidator'

const SEMANTIC_PATTERNS = semanticPatternsRaw as SemanticPattern[]

// Maps semantic pattern string → function that builds word blocks from the case form
// The pattern string uses {noun}; we extract the structure from it.
interface BlockTemplate {
  patternKey: string                           // matches SemanticPattern.pattern
  words: (form: string) => string[]
  hint_es: string
}

const BLOCK_TEMPLATES: BlockTemplate[] = [
  { patternKey: 'Это {noun}.',              words: f => ['Это', f + '.'],                    hint_es: 'Esto es ...' },
  { patternKey: 'Вот {noun}.',              words: f => ['Вот', f + '.'],                    hint_es: 'Aquí está ...' },
  { patternKey: '{noun} здесь.',            words: f => [f, 'здесь.'],                       hint_es: '... está aquí.' },
  { patternKey: '{noun} стоит дорого.',     words: f => [f, 'стоит', 'дорого.'],             hint_es: '... cuesta caro.' },
  { patternKey: '{noun} работает здесь.',   words: f => [f, 'работает', 'здесь.'],           hint_es: '... trabaja aquí.' },
  { patternKey: 'У меня нет {noun}.',       words: f => ['У', 'меня', 'нет', f + '.'],       hint_es: 'No tengo ...' },
  { patternKey: 'У нас нет {noun}.',        words: f => ['У', 'нас', 'нет', f + '.'],          hint_es: 'No tenemos ...' },
  { patternKey: 'Это портрет {noun}.',      words: f => ['Это', 'портрет', f + '.'],            hint_es: 'Es un retrato de ...' },
  { patternKey: 'Это подарок для {noun}.', words: f => ['Это', 'подарок', 'для', f + '.'],    hint_es: 'Es un regalo para ...' },
  { patternKey: 'Я из {noun}.',             words: f => ['Я', 'из', f + '.'],                  hint_es: 'Soy de ...' },
  { patternKey: 'Кофе без {noun}.',         words: f => ['Кофе', 'без', f + '.'],              hint_es: 'Café sin ...' },
  { patternKey: 'После {noun} я отдыхаю.', words: f => ['После', f, 'я', 'отдыхаю.'],        hint_es: 'Después de ... descanso.' },
  { patternKey: 'Я живу около {noun}.',     words: f => ['Я', 'живу', 'около', f + '.'],      hint_es: 'Vivo cerca de ...' },
  { patternKey: 'Я читаю {noun}.',          words: f => ['Я', 'читаю', f + '.'],               hint_es: 'Leo ...' },
  { patternKey: 'Я люблю {noun}.',          words: f => ['Я', 'люблю', f + '.'],               hint_es: 'Amo ...' },
  { patternKey: 'Я слушаю {noun}.',         words: f => ['Я', 'слушаю', f + '.'],              hint_es: 'Escucho ...' },
  { patternKey: 'Я вижу {noun}.',           words: f => ['Я', 'вижу', f + '.'],                hint_es: 'Veo ...' },
  { patternKey: 'Я жду {noun}.',            words: f => ['Я', 'жду', f + '.'],                 hint_es: 'Espero ...' },
  { patternKey: 'Я еду в {noun}.',          words: f => ['Я', 'еду', 'в', f + '.'],           hint_es: 'Viajo a ...' },
  { patternKey: 'Я иду в {noun}.',          words: f => ['Я', 'иду', 'в', f + '.'],           hint_es: 'Voy a ...' },
  { patternKey: 'Мы говорим о {noun}.',     words: f => ['Мы', 'говорим', 'о', f + '.'],      hint_es: 'Hablamos de ...' },
  { patternKey: 'Я думаю о {noun}.',        words: f => ['Я', 'думаю', 'о', f + '.'],         hint_es: 'Pienso en ...' },
  { patternKey: 'Я живу в {noun}.',         words: f => ['Я', 'живу', 'в', f + '.'],          hint_es: 'Vivo en ...' },
  { patternKey: 'Я работаю в {noun}.',      words: f => ['Я', 'работаю', 'в', f + '.'],       hint_es: 'Trabajo en ...' },
  { patternKey: 'Я учусь в {noun}.',        words: f => ['Я', 'учусь', 'в', f + '.'],         hint_es: 'Estudio en ...' },
  { patternKey: 'Я играю на {noun}.',       words: f => ['Я', 'играю', 'на', f + '.'],        hint_es: 'Toco ...' },
  { patternKey: 'Я звоню {noun}.',          words: f => ['Я', 'звоню', f + '.'],               hint_es: 'Llamo a ...' },
  { patternKey: 'Я пишу {noun}.',           words: f => ['Я', 'пишу', f + '.'],                hint_es: 'Escribo a ...' },
  { patternKey: 'Я помогаю {noun}.',        words: f => ['Я', 'помогаю', f + '.'],             hint_es: 'Ayudo a ...' },
  { patternKey: 'Я дарю подарок {noun}.', words: f => ['Я', 'дарю', 'подарок', f + '.'],    hint_es: 'Regalo algo a ...' },
  { patternKey: 'Я еду на {noun}.',         words: f => ['Я', 'еду', 'на', f + '.'],          hint_es: 'Voy en ...' },
  { patternKey: 'Я занимаюсь {noun}.',      words: f => ['Я', 'занимаюсь', f + '.'],           hint_es: 'Me dedico a ...' },
  { patternKey: 'Я восхищаюсь {noun}.',     words: f => ['Я', 'восхищаюсь', f + '.'],          hint_es: 'Me maravillo con ...' },
  { patternKey: 'Я горжусь {noun}.',        words: f => ['Я', 'горжусь', f + '.'],             hint_es: 'Me enorgullezco de ...' },
  { patternKey: 'Я интересуюсь {noun}.',    words: f => ['Я', 'интересуюсь', f + '.'],         hint_es: 'Me interesa ...' },
]

// Build a lookup: patternKey → SemanticPattern
function getSemanticPattern(patternKey: string): SemanticPattern | undefined {
  return SEMANTIC_PATTERNS.find(p => p.pattern === patternKey)
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5)
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/**
 * Genera un ejercicio de tipo Order Blocks para un caso dado,
 * eligiendo semánticamente una palabra y patrón compatibles.
 */
export function generateOrderBlocks(
  words: RussianWord[],
  targetCase: Case,
  context?: GenerationContext,
): OrderBlocksExercise {
  // Get all block templates for the target case
  const casePatterns = SEMANTIC_PATTERNS.filter(p =>
    p.case === targetCase && !isPatternOnCooldown(p, context)
  )
  const semanticPattern = pick(casePatterns.length > 0
    ? casePatterns
    : SEMANTIC_PATTERNS.filter(p => p.case === targetCase)
  )
  const blockTemplate = BLOCK_TEMPLATES.find(t => t.patternKey === semanticPattern.pattern)
    ?? BLOCK_TEMPLATES.find(t => {
      const sp = getSemanticPattern(t.patternKey)
      return sp?.case === targetCase
    })!

  const word = pickWordForPattern(words, semanticPattern, context)
  const form = getCaseForm(word, targetCase)
  const orderedBlocks = blockTemplate.words(form)
  const answer = orderedBlocks.join(' ')

  return {
    type: 'order-blocks',
    nominative: word.nominative,
    blocks: shuffle(orderedBlocks),
    answer,
    case: targetCase,
    level: word.level,
    hint_es: blockTemplate.hint_es,
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

  const cases: Case[] = ['nominative', 'genitive', 'accusative', 'prepositional', 'dative', 'instrumental']
  const exercises: OrderBlocksExercise[] = []
  const context = createGenerationContext()

  for (let i = 0; i < count; i++) {
    const targetCase = options?.filterCase ?? pick(cases)
    exercises.push(generateOrderBlocks(pool, targetCase, context))
  }

  return exercises
}
