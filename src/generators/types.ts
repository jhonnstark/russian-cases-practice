// ─── Shared Types for Russian Cases Practice Generators ───────────────────────

export type Case = 'genitive' | 'accusative' | 'prepositional' | 'dative' | 'instrumental'
export type Gender = 'masculine' | 'feminine' | 'neuter' | 'plural'
export type Level = 'A1' | 'A2' | 'B1'

// ─── Dictionary word ──────────────────────────────────────────────────────────
export interface RussianWord {
  nominative: string
  gender: Gender
  animate: boolean
  meaning_es: string
  level: Level
  indeclinable?: boolean
  cases: Record<Case, string>
  tags: string[]
}

// ─── Exercise types ───────────────────────────────────────────────────────────

/** Modo 1 — Ending Choice
 *  "У меня нет машин__"  →  options: [а, ы, у, е]  answer: ы
 */
export interface EndingChoiceExercise {
  type: 'ending-choice'
  prompt: string          // sentence with blank: "У меня нет машин__."
  base: string            // stem shown to user: "машин"
  options: string[]       // 4 endings
  answer: string          // correct ending
  case: Case
  level: Level
  hint_es?: string        // translation hint
}

/** Modo 2 — Case Choice
 *  "Я иду ___ работу."  →  options: [на работу, на работе, с работы, для работы]
 */
export interface CaseChoiceExercise {
  type: 'case-choice'
  prompt: string          // sentence with blank
  options: string[]       // 4 full phrase options
  answer: string          // correct option
  case: Case
  level: Level
  hint_es?: string
}

/** Modo 3 — Transform
 *  word: "машина"  targetCase: "genitive"  →  answer: "машины"
 */
export interface TransformExercise {
  type: 'transform'
  nominative: string      // base form shown to user
  targetCase: Case
  answer: string          // correct transformed form
  meaning_es: string
  level: Level
  hint_es?: string        // e.g. "У меня нет ___"
}

/** Modo 4 — Order Blocks
 *  blocks: ["У","меня","нет","времени"]  →  answer: "У меня нет времени."
 */
export interface OrderBlocksExercise {
  type: 'order-blocks'
  blocks: string[]        // shuffled word blocks
  answer: string          // correct sentence
  case: Case
  level: Level
  hint_es?: string
}

/** Modo 5 — Mini Story
 *  story with blanks, user fills in correct case forms
 */
export interface MiniStoryExercise {
  type: 'mini-story'
  story: string[]         // sentences, some with {blank}
  blanks: {
    nominative: string    // base form hint
    answer: string        // correct form
    case: Case
  }[]
  level: Level
}

export type Exercise =
  | EndingChoiceExercise
  | CaseChoiceExercise
  | TransformExercise
  | OrderBlocksExercise
  | MiniStoryExercise
