import { defineStore } from 'pinia'
import { generateComparativeBatch } from '@/generators/comparativeGenerator'
import type { ComparativeExercise } from '@/generators/comparativeTypes'
import type { ComparativeGameMode } from '@/generators/comparativeGenerator'

const EXERCISES_PER_ROUND = 10

export const useComparativeStore = defineStore('comparative', {
  state: () => ({
    selectedMode: 'mixed' as ComparativeGameMode,
    exercises: [] as ComparativeExercise[],
    currentIndex: 0,
    score: 0,
    streak: 0,
    bestStreak: 0,
    mistakes: [] as { exercise: ComparativeExercise; userAnswer: string }[],
    answers: [] as { exercise: ComparativeExercise; userAnswer: string; correct: boolean }[],
    sessionDone: false,
  }),

  getters: {
    currentExercise: (state): ComparativeExercise | null =>
      state.exercises[state.currentIndex] ?? null,

    progress: (state): number =>
      state.exercises.length
        ? Math.round((state.currentIndex / state.exercises.length) * 100)
        : 0,

    total: (state): number => state.exercises.length,
  },

  actions: {
    setMode(mode: ComparativeGameMode) {
      this.selectedMode = mode
    },

    startSession() {
      this.exercises = generateComparativeBatch(this.selectedMode, EXERCISES_PER_ROUND)
      this.currentIndex = 0
      this.score = 0
      this.streak = 0
      this.bestStreak = 0
      this.mistakes = []
      this.answers = []
      this.sessionDone = false
    },

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

    _checkAnswer(ex: ComparativeExercise, userAnswer: string): boolean {
      const normalize = (value: string) =>
        value.trim().toLowerCase().replace(/\s+/g, ' ')

      if (ex.type === 'source-form') {
        return ex.acceptedAnswers.some(answer => normalize(answer) === normalize(userAnswer))
      }

      return normalize(userAnswer) === normalize(ex.answer)
    },
  },
})
