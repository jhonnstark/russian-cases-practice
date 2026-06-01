/**
 * Semantic Validator
 * Ensures words are semantically compatible with sentence patterns.
 * Prevents nonsense like "Я еду в сахар" or "У меня нет Москвы".
 */

import type { RussianWord, Case } from './types'

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
  if (isSameAsNominative(word, targetCase)) return false
  return true
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
    return weightedPick(source)
  }

  // Filter to words where the form actually changes for this case
  const changing = pool.filter(w => isGoodForChoiceExercise(w, targetCase))
  const usable = changing.length > 0 ? changing : pool

  // Prefer high learning-score words (score >= 7) with 75% probability
  const highScore = usable.filter(w => learningScore(w, targetCase) >= 7)
  const preferredHigh = highScore.filter(w => w.tags.some(t => pattern.preferredTags.includes(t)))

  if (preferredHigh.length > 0 && Math.random() < 0.75) {
    return weightedPick(preferredHigh)
  }
  if (highScore.length > 0 && Math.random() < 0.75) {
    return weightedPick(highScore)
  }
  return weightedPick(usable)
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
  pattern: SemanticPattern
): RussianWord {
  const compatible = words.filter(w => isCompatible(w, pattern))

  if (compatible.length === 0) {
    return weightedPick(words)
  }

  const preferred = compatible.filter(w =>
    w.tags.some(t => pattern.preferredTags.includes(t))
  )

  const pool = preferred.length > 0 && Math.random() < 0.7 ? preferred : compatible
  return weightedPick(pool)
}
