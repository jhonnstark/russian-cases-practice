import { defineStore } from 'pinia'
import type { Case, Exercise, RussianWord } from '@/generators'
import { generateEndingChoiceBatch } from '@/generators'
import { generateCaseChoiceBatch }   from '@/generators'
import { generateTransformBatch }    from '@/generators'
import { generateOrderBlocksBatch }  from '@/generators'
import { generateMiniStoryBatch }    from '@/generators'
import dictionaryData from '@data/russian/russian_dictionary.json'

export type GameMode = 'ending-choice' | 'case-choice' | 'transform' | 'order-blocks' | 'mini-story'

const WORDS: RussianWord[] = dictionaryData.words as RussianWord[]
const EXERCISES_PER_ROUND = 10

export const useGameStore = defineStore('game', {
  state: () => ({
    // Config
    selectedCase:  'genitive' as Case | 'mixed',
    selectedMode:  'ending-choice' as GameMode,

    // Session
    exercises:     [] as Exercise[],
    currentIndex:  0,
    score:         0,
    streak:        0,
    bestStreak:    0,
    mistakes:      [] as { exercise: Exercise; userAnswer: string }[],
    answers:       [] as { exercise: Exercise; userAnswer: string; correct: boolean }[],
    sessionDone:   false,
  }),

  getters: {
    currentExercise: (state): Exercise | null =>
      state.exercises[state.currentIndex] ?? null,

    progress: (state): number =>
      state.exercises.length
        ? Math.round((state.currentIndex / state.exercises.length) * 100)
        : 0,

    total: (state): number => state.exercises.length,
  },

  actions: {
    // ── Config ────────────────────────────────────────────────────────────────
    setCase(c: Case | 'mixed') {
      this.selectedCase = c
    },
    setMode(m: GameMode) {
      this.selectedMode = m
    },

    // ── Session ───────────────────────────────────────────────────────────────
    startSession() {
      const filterCase = this.selectedCase === 'mixed' ? undefined : this.selectedCase as Case
      const n = EXERCISES_PER_ROUND

      let exercises: Exercise[] = []

      switch (this.selectedMode) {
        case 'ending-choice':
          exercises = generateEndingChoiceBatch(WORDS, n, { filterCase })
          break
        case 'case-choice':
          exercises = generateCaseChoiceBatch(WORDS, n, { filterCase })
          break
        case 'transform':
          exercises = generateTransformBatch(WORDS, n, { filterCase })
          break
        case 'order-blocks':
          exercises = generateOrderBlocksBatch(WORDS, n, { filterCase })
          break
        case 'mini-story':
          exercises = generateMiniStoryBatch(WORDS, n)
          break
      }

      this.exercises    = exercises
      this.currentIndex = 0
      this.score        = 0
      this.streak       = 0
      this.bestStreak   = 0
      this.mistakes     = []
      this.answers      = []
      this.sessionDone  = false
    },

    // ── Answer ────────────────────────────────────────────────────────────────
    submitAnswer(userAnswer: string) {
      const ex = this.currentExercise
      if (!ex) return

      const correct = this._checkAnswer(ex, userAnswer)

      this.answers.push({ exercise: ex, userAnswer, correct })

      if (correct) {
        this.score++
        this.streak++
        if (this.streak > this.bestStreak) this.bestStreak = this.streak
      } else {
        this.streak = 0
        this.mistakes.push({ exercise: ex, userAnswer })
      }

      if (this.currentIndex < this.exercises.length - 1) {
        this.currentIndex++
      } else {
        this.sessionDone = true
      }
    },

    // ── Internal ──────────────────────────────────────────────────────────────
    _checkAnswer(ex: Exercise, userAnswer: string): boolean {
      const normalize = (s: string) => s.trim().toLowerCase()

      switch (ex.type) {
        case 'ending-choice':
          return normalize(userAnswer) === normalize(ex.answer)
        case 'case-choice':
          return normalize(userAnswer) === normalize(ex.answer)
        case 'transform':
          return normalize(userAnswer) === normalize(ex.answer)
        case 'order-blocks':
          return normalize(userAnswer) === normalize(ex.answer)
        case 'mini-story': {
          // userAnswer = "форма1|форма2"
          const parts = userAnswer.split('|').map(normalize)
          return ex.blanks.every((b, i) => parts[i] === normalize(b.answer))
        }
      }
    },
  },
})
