export type ComparativeMode =
  | 'choose-comparative'
  | 'complete-sentence'
  | 'source-form'
  | 'meaning'
  | 'opposite'
  | 'build-comparison'
  | 'conversation'

export type ComparativeLevel = 'A1' | 'A2' | 'B1'

export interface ComparativeEntry {
  id: string
  adjective?: string
  adverb?: string
  comparative: string
  irregular: boolean
  level: ComparativeLevel
  tags: string[]
  meaning_es: string
  examples: string[]
  learningScore: number
}

interface BaseComparativeExercise {
  id: string
  type: ComparativeMode
  entry: ComparativeEntry
  prompt: string
  answer: string
  options?: string[]
  explanation_es: string
}

export interface ChooseComparativeExercise extends BaseComparativeExercise {
  type: 'choose-comparative'
  source: string
}

export interface CompleteComparativeSentenceExercise extends BaseComparativeExercise {
  type: 'complete-sentence'
  sentence: string
}

export interface ComparativeSourceExercise extends BaseComparativeExercise {
  type: 'source-form'
  acceptedAnswers: string[]
}

export interface ComparativeMeaningExercise extends BaseComparativeExercise {
  type: 'meaning'
}

export interface OppositeComparativeExercise extends BaseComparativeExercise {
  type: 'opposite'
}

export interface BuildComparisonExercise extends BaseComparativeExercise {
  type: 'build-comparison'
  blocks: string[]
}

export interface ComparativeConversationExercise extends BaseComparativeExercise {
  type: 'conversation'
  choices: string[]
}

export type ComparativeExercise =
  | ChooseComparativeExercise
  | CompleteComparativeSentenceExercise
  | ComparativeSourceExercise
  | ComparativeMeaningExercise
  | OppositeComparativeExercise
  | BuildComparisonExercise
  | ComparativeConversationExercise
