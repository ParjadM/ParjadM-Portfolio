import { describe, it, expect } from 'vitest'
import { buildGhostText } from './PythonCodeEditor.jsx'

describe('buildGhostText', () => {
  it('shows full skeleton when nothing typed', () => {
    expect(buildGhostText('abc\ndef', '')).toBe('abc\ndef')
  })

  it('hides matching prefix with spaces while keeping newlines', () => {
    expect(buildGhostText('abc\ndef', 'ab')).toBe('  c\ndef')
    expect(buildGhostText('abc\ndef', 'abc\n')).toBe('   \ndef')
  })

  it('stops hiding at first mismatch', () => {
    expect(buildGhostText('abc', 'ax')).toBe(' bc')
  })
})
