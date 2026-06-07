// ─── Central export for all exercise generators ───────────────────────────────

export type { Exercise, RussianWord, Case, Level, Gender } from './types'
export type {
  EndingChoiceExercise,
  CaseChoiceExercise,
  TransformExercise,
  OrderBlocksExercise,
  MiniStoryExercise,
} from './types'

export {
  createGenerationContext,
  filterBySemantics,
  getCaseForm,
  pickWordForFormExercise,
  pickWordForPattern,
} from './semanticValidator'
export type { GenerationContext, SemanticPattern } from './semanticValidator'

export { generateEndingChoice, generateEndingChoiceBatch } from './endingChoice'
export { generateCaseChoice, generateCaseChoiceBatch }     from './caseChoice'
export { generateTransform, generateTransformBatch }       from './transform'
export { generateOrderBlocks, generateOrderBlocksBatch }   from './orderBlocks'
export { generateMiniStory, generateMiniStoryBatch }       from './miniStory'
