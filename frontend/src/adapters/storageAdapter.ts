import type { HardwareProfile } from '../domain/types'

const KEY_PREFIX = 'genesis_math_lab_v1_'

export const storageAdapter = {
  getNote(problemId: string): string {
    try {
      return localStorage.getItem(`${KEY_PREFIX}note_${problemId}`) ?? ''
    } catch {
      return ''
    }
  },
  setNote(problemId: string, text: string): void {
    try {
      localStorage.setItem(`${KEY_PREFIX}note_${problemId}`, text)
    } catch {
      // Ignore quota errors cleanly
    }
  },
  getHardwareProfile(): HardwareProfile {
    try {
      const val = localStorage.getItem(`${KEY_PREFIX}hw_profile`)
      if (val === 'eco' || val === 'balanced' || val === 'ultra') return val
      return 'balanced'
    } catch {
      return 'balanced'
    }
  },
  setHardwareProfile(profile: HardwareProfile): void {
    try {
      localStorage.setItem(`${KEY_PREFIX}hw_profile`, profile)
    } catch {
      // ignore
    }
  },
}
