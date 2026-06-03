import { defineStore } from 'pinia'
import type { AspectExercise, AspectMode } from '@/generators/aspectTypes'
import { generateAspectBatch } from '@/generators/aspectGenerator'

const EXERCISES_PER_ROUND = 10

export const useAspectStore = defineStore('aspect', {
  state: () => ({
    selectedMode: 'guess-aspect' as AspectMode,

    exercises:    [] as AspectExercise[],
    currentIndex: 0,
    score:        0,
    streak:       0,
    bestStreak:   0,
    mistakes:     [] as { exercise: AspectExercise; userAnswer: string }[],
    answers:      [] as { exercise: AspectExercise; userAnswer: string; correct: boolean }[],
    sessionDone:  false,
  }),

  getters: {
    currentExercise: (state): AspectExercise | null =>
      state.exercises[state.currentIndex] ?? null,

    progress: (state): number =>
      state.exercises.length
        ? Math.round((state.currentIndex / state.exercises.length) * 100)
        : 0,

    total: (state): number => state.exercises.length,
  },

  actions: {
    setMode(m: AspectMode) {
      this.selectedMode = m
    },

    startSession() {
      this.exercises    = generateAspectBatch(this.selectedMode, EXERCISES_PER_ROUND)
      this.currentIndex = 0
      this.score        = 0
      this.streak       = 0
      this.bestStreak   = 0
      this.mistakes     = []
      this.answers      = []
      this.sessionDone  = false
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

      // advance index here
      if (this.currentIndex < this.exercises.length - 1) {
        this.currentIndex++
      } else {
        this.sessionDone = true
      }
    },

    _checkAnswer(ex: AspectExercise, userAnswer: string): boolean {
      const n = (s: string) => s.trim().toLowerCase()
      switch (ex.type) {
        case 'guess-aspect':       return n(userAnswer) === n(ex.aspect)
        case 'find-pair':          return n(userAnswer) === n(ex.answer)
        case 'complete-sentence':  return n(userAnswer) === n(ex.answer)
      }
    },
  },
})
