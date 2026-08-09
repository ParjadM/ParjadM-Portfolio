import { describe, it, expect } from 'vitest'
import { classifyHandGesture, FINGER_CHAINS } from './handTracker.js'

function lm(x, y, z = 0) {
  return { x, y, z }
}

/** Build a fake upright open palm roughly facing the camera. */
function openPalm() {
  const pts = Array.from({ length: 21 }, () => lm(0.5, 0.5))
  pts[0] = lm(0.5, 0.8) // wrist
  // thumb
  pts[1] = lm(0.42, 0.72); pts[2] = lm(0.38, 0.62); pts[3] = lm(0.34, 0.52); pts[4] = lm(0.3, 0.42)
  // index
  pts[5] = lm(0.46, 0.6); pts[6] = lm(0.45, 0.45); pts[7] = lm(0.44, 0.3); pts[8] = lm(0.43, 0.15)
  // middle
  pts[9] = lm(0.5, 0.58); pts[10] = lm(0.5, 0.42); pts[11] = lm(0.5, 0.26); pts[12] = lm(0.5, 0.1)
  // ring
  pts[13] = lm(0.54, 0.6); pts[14] = lm(0.55, 0.45); pts[15] = lm(0.56, 0.3); pts[16] = lm(0.57, 0.16)
  // pinky
  pts[17] = lm(0.58, 0.62); pts[18] = lm(0.6, 0.5); pts[19] = lm(0.62, 0.38); pts[20] = lm(0.64, 0.26)
  return pts
}

function fistFromOpen(open) {
  const pts = open.map((p) => ({ ...p }))
  // curl tips back toward wrist
  for (const tip of [4, 8, 12, 16, 20]) {
    pts[tip] = { ...pts[0], x: pts[0].x + (tip - 10) * 0.01, y: pts[0].y - 0.05 }
  }
  // keep PIPs closer than tips to wrist intentionally for "not extended"
  for (const pip of [3, 6, 10, 14, 18]) {
    pts[pip] = { x: pts[0].x, y: pts[0].y - 0.12 }
  }
  return pts
}

describe('handTracker gestures', () => {
  it('exposes five finger chains including tips', () => {
    expect(FINGER_CHAINS).toHaveLength(5)
    expect(FINGER_CHAINS.map((f) => f.tip)).toEqual([4, 8, 12, 16, 20])
  })

  it('classifies an open palm', () => {
    expect(classifyHandGesture(openPalm())).toBe('open')
  })

  it('classifies a pinch when thumb and index tips are close', () => {
    const pts = openPalm()
    pts[4] = lm(0.48, 0.4)
    pts[8] = lm(0.49, 0.41)
    expect(classifyHandGesture(pts)).toBe('pinch')
  })

  it('classifies a fist when fingers are curled', () => {
    expect(classifyHandGesture(fistFromOpen(openPalm()))).toBe('fist')
  })
})
