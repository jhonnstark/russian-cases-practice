import type { VerbPair, AspectExercise, GuessAspectExercise, FindPairExercise, CompleteSentenceExercise, AspectMode } from './aspectTypes'
import verbAspectsData from '../../data/russian/verb-aspects.json'

const VERBS: VerbPair[] = verbAspectsData.verbs as VerbPair[]

type SentenceEntry = {
  template: string
  hint_es: string
  clue: string
  verbKey: string
  form: string
}

const IMP_SENTENCES: SentenceEntry[] = verbAspectsData.sentences.imperfective as SentenceEntry[]
const PFV_SENTENCES: SentenceEntry[] = verbAspectsData.sentences.perfective as SentenceEntry[]

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickN<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n)
}

// ── Mode 1: Guess the Aspect ──────────────────────────────────────────────────
function generateGuessAspect(verb: VerbPair, useImperfective: boolean): GuessAspectExercise {
  if (useImperfective) {
    return {
      type: 'guess-aspect',
      verb: verb.imperfective,
      aspect: 'НСВ',
      pair: verb.perfective,
      meaning_es: verb.meaning_es,
      explanation_es: `"${verb.imperfective}" describe un proceso, hábito o acción repetida. Su par perfectivo es "${verb.perfective}".`,
    }
  } else {
    return {
      type: 'guess-aspect',
      verb: verb.perfective,
      aspect: 'СВ',
      pair: verb.imperfective,
      meaning_es: verb.meaning_es,
      explanation_es: `"${verb.perfective}" describe una acción completada o resultado. Su par imperfectivo es "${verb.imperfective}".`,
    }
  }
}

// ── Mode 2: Find the Pair ─────────────────────────────────────────────────────
function generateFindPair(verb: VerbPair, useImperfective: boolean): FindPairExercise {
  const shownVerb = useImperfective ? verb.imperfective : verb.perfective
  const answer    = useImperfective ? verb.perfective   : verb.imperfective
  const aspect    = useImperfective ? 'НСВ' as const    : 'СВ' as const

  // distractors: pick 3 other verbs' pair-side at random
  const others = VERBS.filter(v => v !== verb)
  const distractors = pickN(others, 3).map(v =>
    useImperfective ? v.perfective : v.imperfective
  )

  return {
    type: 'find-pair',
    verb: shownVerb,
    aspect,
    options: shuffle([answer, ...distractors]),
    answer,
    meaning_es: verb.meaning_es,
  }
}

// ── Mode 3: Complete the Sentence ─────────────────────────────────────────────
function generateCompleteSentence(entry: SentenceEntry, isImperfective: boolean): CompleteSentenceExercise {
  // Find the corresponding pair form for the wrong option
  const verb = VERBS.find(v =>
    isImperfective ? v.imperfective === entry.verbKey : v.perfective === entry.verbKey
  )

  const impForm = isImperfective ? entry.form : (verb?.imperfective ?? entry.form)
  const pfvForm = isImperfective ? (verb?.perfective ?? entry.form) : entry.form

  // For complete-sentence we need both conjugated forms.
  // The data already stores the conjugated form; we use the pair's base as fallback.
  // We store [imperfective-conjugated, perfective-conjugated]
  const options: [string, string] = [impForm, pfvForm]

  const answer = entry.form
  const aspect: 'НСВ' | 'СВ' = isImperfective ? 'НСВ' : 'СВ'

  const expImp = `"${entry.clue}" indica proceso o hábito → НСВ. Forma correcta: "${entry.form}".`
  const expPfv = `"${entry.clue}" indica acción completada o resultado → СВ. Forma correcta: "${entry.form}".`

  return {
    type: 'complete-sentence',
    template: entry.template,
    options,
    answer,
    aspect,
    hint_es: entry.hint_es,
    clue: entry.clue,
    explanation_es: isImperfective ? expImp : expPfv,
  }
}

// ── Batch generator ───────────────────────────────────────────────────────────
export function generateAspectBatch(mode: AspectMode, count: number): AspectExercise[] {
  const exercises: AspectExercise[] = []

  if (mode === 'guess-aspect') {
    const pool = shuffle([
      ...VERBS.map(v => ({ verb: v, imp: true  })),
      ...VERBS.map(v => ({ verb: v, imp: false })),
    ])
    for (let i = 0; i < count; i++) {
      const { verb, imp } = pool[i % pool.length]
      exercises.push(generateGuessAspect(verb, imp))
    }
  }

  if (mode === 'find-pair') {
    const pool = shuffle([
      ...VERBS.map(v => ({ verb: v, imp: true  })),
      ...VERBS.map(v => ({ verb: v, imp: false })),
    ])
    for (let i = 0; i < count; i++) {
      const { verb, imp } = pool[i % pool.length]
      exercises.push(generateFindPair(verb, imp))
    }
  }

  if (mode === 'complete-sentence') {
    const pool = shuffle([
      ...IMP_SENTENCES.map(s => ({ entry: s, imp: true  })),
      ...PFV_SENTENCES.map(s => ({ entry: s, imp: false })),
    ])
    for (let i = 0; i < count; i++) {
      const { entry, imp } = pool[i % pool.length]
      exercises.push(generateCompleteSentence(entry, imp))
    }
  }

  return exercises.slice(0, count)
}
