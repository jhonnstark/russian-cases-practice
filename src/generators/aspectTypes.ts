// ─── Types for Russian Verb Aspect exercises ──────────────────────────────────

export type Aspect = 'НСВ' | 'СВ'
export type AspectMode = 'guess-aspect' | 'find-pair' | 'complete-sentence'

export interface VerbPair {
  imperfective: string
  perfective: string
  meaning_es: string
  level: string
  tags: string[]
  examples: { imperfective: string; perfective: string }
}

// Mode 1 — show one verb, pick НСВ or СВ
export interface GuessAspectExercise {
  type: 'guess-aspect'
  verb: string
  aspect: Aspect
  pair: string          // the other form, shown in explanation
  meaning_es: string
  explanation_es: string
}

// Mode 2 — show one verb, pick its aspectual pair from 4 options
export interface FindPairExercise {
  type: 'find-pair'
  verb: string
  aspect: Aspect        // aspect of shown verb
  options: string[]     // 4 verb options
  answer: string        // correct pair form
  meaning_es: string
}

// Mode 3 — fill blank in sentence, choose between imperfective/perfective form
export interface CompleteSentenceExercise {
  type: 'complete-sentence'
  template: string      // sentence with ___
  options: [string, string]   // [imperfective form, perfective form]
  answer: string        // correct form
  aspect: Aspect        // correct aspect
  hint_es: string       // Spanish context clue
  clue: string          // Russian keyword highlighted
  explanation_es: string
}

export type AspectExercise =
  | GuessAspectExercise
  | FindPairExercise
  | CompleteSentenceExercise
