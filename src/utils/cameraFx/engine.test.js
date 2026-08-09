import { describe, it, expect } from 'vitest'
import { CAMERA_FX_MODES } from './engine.js'

describe('camera FX modes', () => {
  it('exposes hands plus motion effect modes', () => {
    expect(CAMERA_FX_MODES.map((m) => m.id)).toEqual([
      'hands',
      'aurora',
      'constellation',
      'prism',
      'ember',
    ])
  })
})
