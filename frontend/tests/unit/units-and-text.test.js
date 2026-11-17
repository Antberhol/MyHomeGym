import { describe, expect, it } from 'vitest'
import { cmToIn, inToCm, kgToLb, lbToKg } from '../../src/utils/units'
import { normalizeExerciseName } from '../../src/utils/text'

describe('units utils', () => {
  describe('kgToLb', () => {
    it('converts normal values', () => {
      expect(kgToLb(1)).toBeCloseTo(2.20, 2)
      expect(kgToLb(70)).toBeCloseTo(154.32, 2)
    })
    it('returns 0 for 0', () => {
      expect(kgToLb(0)).toBe(0)
    })
    it('handles decimals', () => {
      expect(kgToLb(70.5)).toBeCloseTo(155.43, 2)
      expect(kgToLb(0.5)).toBeCloseTo(1.10, 2)
    })
  })

  describe('lbToKg', () => {
    it('converts normal values', () => {
      expect(lbToKg(2.2046226218)).toBeCloseTo(1, 5)
      expect(lbToKg(154.323583526)).toBeCloseTo(70, 2)
    })
    it('returns 0 for 0', () => {
      expect(lbToKg(0)).toBe(0)
    })
    it('handles decimals', () => {
      expect(lbToKg(10.5)).toBeCloseTo(4.76, 2)
    })
  })

  describe('round trips kg -> lb -> kg', () => {
    it('returns original weight', () => {
      expect(lbToKg(kgToLb(70))).toBeCloseTo(70, 5)
      expect(lbToKg(kgToLb(0))).toBe(0)
      expect(lbToKg(kgToLb(82.5))).toBeCloseTo(82.5, 5)
    })
  })

  describe('cmToIn', () => {
    it('converts normal values', () => {
      expect(cmToIn(2.54)).toBeCloseTo(1, 5)
      expect(cmToIn(170)).toBeCloseTo(66.93, 2)
    })
    it('returns 0 for 0', () => {
      expect(cmToIn(0)).toBe(0)
    })
    it('handles decimals', () => {
      expect(cmToIn(175.5)).toBeCloseTo(69.09, 2)
    })
  })

  describe('inToCm', () => {
    it('converts normal values', () => {
      expect(inToCm(1)).toBeCloseTo(2.54, 2)
      expect(inToCm(66.9291338583)).toBeCloseTo(170, 2)
    })
    it('returns 0 for 0', () => {
      expect(inToCm(0)).toBe(0)
    })
    it('handles decimals', () => {
      expect(inToCm(5.5)).toBeCloseTo(13.97, 2)
    })
  })

  describe('round trips cm -> in -> cm', () => {
    it('returns original length', () => {
      expect(inToCm(cmToIn(170))).toBeCloseTo(170, 5)
      expect(inToCm(cmToIn(0))).toBe(0)
      expect(inToCm(cmToIn(182.5))).toBeCloseTo(182.5, 5)
    })
  })
})

describe('text utils', () => {
  describe('normalizeExerciseName', () => {
    it('lowercases and trims', () => {
      expect(normalizeExerciseName('Press Banca')).toBe('press banca')
      expect(normalizeExerciseName('  Sentadilla  ')).toBe('sentadilla')
    })
    it('removes accents', () => {
      expect(normalizeExerciseName('PRÉNSA')).toBe('prensa')
      expect(normalizeExerciseName('Bíceps Curl')).toBe('biceps curl')
      expect(normalizeExerciseName('ÁÉÍÓÚ')).toBe('aeiou')
    })
    it('collapses extra spaces and punctuation', () => {
      expect(normalizeExerciseName('Sentadilla   con  Barra')).toBe('sentadilla con barra')
      expect(normalizeExerciseName('Press-Banca!')).toBe('press banca')
      expect(normalizeExerciseName('Press / Banca')).toBe('press banca')
    })
    it('handles empty and null', () => {
      expect(normalizeExerciseName('')).toBe('')
      expect(normalizeExerciseName(null)).toBe('')
      expect(normalizeExerciseName(undefined)).toBe('')
    })
    it('keeps numbers', () => {
      expect(normalizeExerciseName('Día 1 - Press 100kg')).toBe('dia 1 press 100kg')
    })
  })
})
