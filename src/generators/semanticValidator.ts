/**
 * Semantic Validator
 * Ensures words are semantically compatible with sentence patterns.
 * Prevents nonsense like "Я еду в сахар" or "У меня нет Москвы".
 */

import type { RussianWord, Case } from './types'

const DEFAULT_NOUN_COOLDOWN = 30
const DEFAULT_PATTERN_COOLDOWN = 10
const DEFAULT_CATEGORY_WINDOW = 30
const DEFAULT_MAX_CATEGORY_SHARE = 0.2
const DEFAULT_MIN_CANDIDATE_POOL = 8

export interface GenerationContext {
  step: number
  nounCooldown: number
  patternCooldown: number
  categoryWindow: number
  maxCategoryShare: number
  minCandidatePool: number
  lastSeenByLemma: Map<string, number>
  diversityPenaltyByLemma: Map<string, number>
  recentPatterns: string[]
  recentCategories: string[]
}

export function createGenerationContext(options?: Partial<Pick<
  GenerationContext,
  'nounCooldown' | 'patternCooldown' | 'categoryWindow' | 'maxCategoryShare' | 'minCandidatePool'
>>): GenerationContext {
  return {
    step: 0,
    nounCooldown: options?.nounCooldown ?? DEFAULT_NOUN_COOLDOWN,
    patternCooldown: options?.patternCooldown ?? DEFAULT_PATTERN_COOLDOWN,
    categoryWindow: options?.categoryWindow ?? DEFAULT_CATEGORY_WINDOW,
    maxCategoryShare: options?.maxCategoryShare ?? DEFAULT_MAX_CATEGORY_SHARE,
    minCandidatePool: options?.minCandidatePool ?? DEFAULT_MIN_CANDIDATE_POOL,
    lastSeenByLemma: new Map(),
    diversityPenaltyByLemma: new Map(),
    recentPatterns: [],
    recentCategories: [],
  }
}

const CATEGORY_TAGS = [
  'family',
  'friend',
  'person',
  'city',
  'country',
  'place',
  'food',
  'drink',
  'animal',
  'education',
  'school',
  'study',
  'work',
  'career',
  'travel',
  'tourism',
  'nature',
  'history',
  'culture',
  'literature',
  'technology',
  'transport',
  'holiday',
  'music',
  'sport',
  'object',
  'abstract',
]

/**
 * Picks a random word from an array using pedagogicBonus as weight.
 * A word with pedagogicBonus=5 appears ~5× more often than one with no bonus.
 */
function weightedPick(words: RussianWord[]): RussianWord {
  const totalWeight = words.reduce((sum, w) => sum + (w.pedagogicBonus ?? 1), 0)
  let r = Math.random() * totalWeight
  for (const w of words) {
    r -= (w.pedagogicBonus ?? 1)
    if (r <= 0) return w
  }
  return words[words.length - 1]
}

function weightedPickByScore(words: RussianWord[], score: (word: RussianWord) => number): RussianWord {
  const weights = words.map(w => Math.max(0.1, score(w)))
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  let r = Math.random() * totalWeight

  for (let i = 0; i < words.length; i++) {
    r -= weights[i]
    if (r <= 0) return words[i]
  }

  return words[words.length - 1]
}

function primaryCategory(word: RussianWord): string {
  return word.tags.find(t => CATEGORY_TAGS.includes(t)) ?? word.tags[0] ?? 'other'
}

function isInNounCooldown(word: RussianWord, context: GenerationContext): boolean {
  const lastSeen = context.lastSeenByLemma.get(word.nominative)
  return lastSeen !== undefined && context.step - lastSeen < context.nounCooldown
}

function isCategoryOverLimit(word: RussianWord, context: GenerationContext): boolean {
  const recent = context.recentCategories.slice(-context.categoryWindow)
  if (recent.length < 5) return false

  const category = primaryCategory(word)
  const occurrences = recent.filter(c => c === category).length
  return (occurrences + 1) / (recent.length + 1) > context.maxCategoryShare
}

function diversityScore(word: RussianWord, context: GenerationContext): number {
  const penalty = context.diversityPenaltyByLemma.get(word.nominative) ?? 0
  return Math.max(0, 10 - penalty * 2)
}

function recencyScore(word: RussianWord, context: GenerationContext): number {
  const lastSeen = context.lastSeenByLemma.get(word.nominative)
  if (lastSeen === undefined) return 10

  const distance = context.step - lastSeen
  if (distance < context.nounCooldown) return 0
  return Math.min(10, 4 + distance / 3)
}

function semanticScore(word: RussianWord, pattern?: SemanticPattern): number {
  if (!pattern) return 7
  if (word.tags.some(t => pattern.preferredTags.includes(t))) return 10
  if (word.tags.some(t => pattern.allowedTags.includes(t))) return 7
  return 0
}

function effectiveScore(
  word: RussianWord,
  targetCase: Case | undefined,
  context: GenerationContext,
  pattern?: SemanticPattern,
): number {
  const grammarScore = targetCase ? learningScore(word, targetCase) : (word.pedagogicBonus ?? 1) * 2

  return (
    grammarScore * 0.25 +
    diversityScore(word, context) * 0.35 +
    recencyScore(word, context) * 0.25 +
    semanticScore(word, pattern) * 0.15
  )
}

function applyDiversityFilters(words: RussianWord[], context?: GenerationContext): RussianWord[] {
  if (!context) return words

  const filtered = words.filter(w =>
    !isInNounCooldown(w, context) &&
    !isCategoryOverLimit(w, context)
  )

  return filtered.length >= Math.min(context.minCandidatePool, words.length) ? filtered : words
}

function registerSelection(word: RussianWord, pattern: SemanticPattern | undefined, context?: GenerationContext): void {
  if (!context) return

  context.lastSeenByLemma.set(word.nominative, context.step)
  context.diversityPenaltyByLemma.set(
    word.nominative,
    (context.diversityPenaltyByLemma.get(word.nominative) ?? 0) + 1,
  )

  if (pattern) {
    context.recentPatterns.push(pattern.pattern)
    context.recentPatterns = context.recentPatterns.slice(-context.patternCooldown)
  }

  context.recentCategories.push(primaryCategory(word))
  context.recentCategories = context.recentCategories.slice(-context.categoryWindow)
  context.step += 1
}

/**
 * Gets the form of a word for a given case, including nominative.
 */
export function getCaseForm(word: RussianWord, targetCase: Case): string {
  if (targetCase === 'nominative') return word.nominative
  return word.cases[targetCase]
}

/**
 * Returns true if the word does NOT change its form for the given case
 * compared to the nominative (i.e. fully or partially indeclinable).
 */
export function isSameAsNominative(word: RussianWord, targetCase: Case): boolean {
  return getCaseForm(word, targetCase) === word.nominative
}

/**
 * Returns true if ALL oblique cases are identical (fully indeclinable word).
 * These words should never be used in ending-choice or form-choice exercises.
 */
export function isFullyIndeclinable(word: RussianWord): boolean {
  if (word.indeclinable) return true
  const oblique: Case[] = ['genitive', 'accusative', 'prepositional', 'dative', 'instrumental']
  return oblique.every(c => word.cases[c as Exclude<Case, 'nominative'>] === word.nominative)
}

/**
 * Calculates a learning score (1–10) for using this word in a choice exercise
 * for a specific case.
 *
 * Score reflects how visible the grammatical transformation is:
 *   10 — large change, clearly different ending (машина → машину)
 *    7 — one-letter change (друг → другу)
 *    4 — same ending as another case (could still confuse)
 *    1 — no change from nominative (радио → радио) — useless for choice exercise
 */
export function learningScore(word: RussianWord, targetCase: Case): number {
  const nom = word.nominative
  const form = getCaseForm(word, targetCase)

  // Identical to nominative — no educational value for form-choice
  if (form === nom) return 1

  // Compute Levenshtein-like distance by suffix change
  let i = 0
  while (i < nom.length && i < form.length && nom[i] === form[i]) i++
  const changedNom = nom.length - i   // chars removed from nominative
  const changedForm = form.length - i  // chars added in new form

  const totalChange = changedNom + changedForm

  if (totalChange >= 5) return 10
  if (totalChange === 4) return 9
  if (totalChange === 3) return 8
  if (totalChange === 2) return 7

  // Change of 1 char — small but visible
  // Check if this form collides with other case forms (less distinctive)
  const allForms = (['genitive', 'accusative', 'prepositional', 'dative', 'instrumental'] as const)
    .filter(c => c !== targetCase)
    .map(c => word.cases[c])

  const collisions = allForms.filter(f => f === form).length
  if (collisions >= 2) return 4
  if (collisions === 1) return 5
  return 6
}

/**
 * Returns true if this word is suitable for ending-choice / case-choice exercises
 * for the given target case:
 *   - Not indeclinable overall
 *   - The target form differs from nominative
 */
export function isGoodForChoiceExercise(word: RussianWord, targetCase: Case): boolean {
  if (isFullyIndeclinable(word)) return false
  return !isSameAsNominative(word, targetCase);

}

export function validChoiceCandidates(
  words: RussianWord[],
  pattern: SemanticPattern,
  targetCase: Case,
): RussianWord[] {
  const compatible = words.filter(w => isCompatible(w, pattern))
  const pool = compatible.length > 0 ? compatible : words

  if (targetCase === 'nominative') {
    return pool.filter(w => !isFullyIndeclinable(w))
  }

  return pool.filter(w => isGoodForChoiceExercise(w, targetCase))
}

export function isPatternOnCooldown(pattern: SemanticPattern, context?: GenerationContext): boolean {
  if (!context) return false
  return context.recentPatterns.includes(pattern.pattern)
}

/**
 * Picks a word for choice exercises, preferring words with higher learning scores
 * and filtering out indeclinables / no-change words for the target case.
 *
 * Falls back to all compatible words if no high-scoring ones are available.
 */
export function pickWordForChoiceExercise(
  words: RussianWord[],
  pattern: SemanticPattern,
  targetCase: Case,
  context?: GenerationContext,
): RussianWord {
  // Start with semantically compatible words
  const compatible = words.filter(w => isCompatible(w, pattern))
  const pool = compatible.length > 0 ? compatible : words

  // For nominative case, form IS the nominative — all declinable words are fine
  if (targetCase === 'nominative') {
    const preferred = pool.filter(w =>
      !isFullyIndeclinable(w) && w.tags.some(t => pattern.preferredTags.includes(t))
    )
    const good = pool.filter(w => !isFullyIndeclinable(w))
    const source = preferred.length > 0 && Math.random() < 0.7 ? preferred : (good.length > 0 ? good : pool)
    const diverseSource = applyDiversityFilters(source, context)
    const selected = context
      ? weightedPickByScore(diverseSource, w => effectiveScore(w, targetCase, context, pattern))
      : weightedPick(diverseSource)
    registerSelection(selected, pattern, context)
    return selected
  }

  // Filter to words where the form actually changes for this case
  const changing = pool.filter(w => isGoodForChoiceExercise(w, targetCase))
  const usable = changing.length > 0 ? changing : pool
  const diverseUsable = applyDiversityFilters(usable, context)

  // Prefer high learning-score words (score >= 7) with 75% probability
  const highScore = diverseUsable.filter(w => learningScore(w, targetCase) >= 7)
  const preferredHigh = highScore.filter(w => w.tags.some(t => pattern.preferredTags.includes(t)))

  let selected: RussianWord
  if (preferredHigh.length > 0 && Math.random() < 0.75) {
    selected = context
      ? weightedPickByScore(preferredHigh, w => effectiveScore(w, targetCase, context, pattern))
      : weightedPick(preferredHigh)
  } else if (highScore.length > 0 && Math.random() < 0.75) {
    selected = context
      ? weightedPickByScore(highScore, w => effectiveScore(w, targetCase, context, pattern))
      : weightedPick(highScore)
  } else {
    selected = context
      ? weightedPickByScore(diverseUsable, w => effectiveScore(w, targetCase, context, pattern))
      : weightedPick(diverseUsable)
  }

  registerSelection(selected, pattern, context)
  return selected
}

export function pickWordForFormExercise(
  words: RussianWord[],
  targetCase: Case,
  context?: GenerationContext,
): RussianWord {
  const usable = targetCase === 'nominative'
    ? words.filter(w => !isFullyIndeclinable(w))
    : words.filter(w => isGoodForChoiceExercise(w, targetCase))
  const source = usable.length > 0 ? usable : words
  const diverseSource = applyDiversityFilters(source, context)
  const selected = context
    ? weightedPickByScore(diverseSource, w => effectiveScore(w, targetCase, context))
    : weightedPick(diverseSource)

  registerSelection(selected, undefined, context)
  return selected
}

export interface SemanticPattern {
  pattern: string
  case: Case
  allowedTags: string[]
  preferredTags: string[]
  rejectedTags: string[]
}

/**
 * Returns true if the word is compatible with the given semantic pattern.
 */
export function isCompatible(word: RussianWord, pattern: SemanticPattern): boolean {
  const tags = word.tags
  if (tags.some(t => pattern.rejectedTags.includes(t))) return false
  return tags.some(t => pattern.allowedTags.includes(t))
}

/**
 * Filters a list of words to only those compatible with the given pattern,
 * sorted with preferredTags first.
 */
export function filterBySemantics(
  words: RussianWord[],
  pattern: SemanticPattern
): RussianWord[] {
  const compatible = words.filter(w => isCompatible(w, pattern))
  return compatible.sort((a, b) => {
    const aPreferred = a.tags.some(t => pattern.preferredTags.includes(t)) ? 0 : 1
    const bPreferred = b.tags.some(t => pattern.preferredTags.includes(t)) ? 0 : 1
    return aPreferred - bPreferred
  })
}

/**
 * Picks a word for story / transform / order-blocks exercises (no strict choice quality needed).
 * Semantic compatibility + preferredTags bias.
 */
export function pickWordForPattern(
  words: RussianWord[],
  pattern: SemanticPattern,
  context?: GenerationContext,
): RussianWord {
  const compatible = words.filter(w => isCompatible(w, pattern))

  if (compatible.length === 0) {
    const source = applyDiversityFilters(words, context)
    const selected = context
      ? weightedPickByScore(source, w => effectiveScore(w, pattern.case, context, pattern))
      : weightedPick(source)
    registerSelection(selected, pattern, context)
    return selected
  }

  const preferred = compatible.filter(w =>
    w.tags.some(t => pattern.preferredTags.includes(t))
  )

  const pool = preferred.length > 0 && Math.random() < 0.7 ? preferred : compatible
  const diversePool = applyDiversityFilters(pool, context)
  const selected = context
    ? weightedPickByScore(diversePool, w => effectiveScore(w, pattern.case, context, pattern))
    : weightedPick(diversePool)

  registerSelection(selected, pattern, context)
  return selected
}
