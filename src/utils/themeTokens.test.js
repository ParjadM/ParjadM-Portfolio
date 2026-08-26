import { describe, it, expect } from 'vitest';
import { normalizeAccent, getAccent } from './themeTokens.js';

describe('normalizeAccent', () => {
  it('maps pink, blue, and emerald accent ids', () => {
    expect(normalizeAccent('pink')).toBe('pink');
    expect(normalizeAccent('blue')).toBe('blue');
    expect(normalizeAccent('emerald')).toBe('emerald');
  });

  it('maps green and unknown values to emerald', () => {
    expect(normalizeAccent('green')).toBe('emerald');
    expect(normalizeAccent(undefined)).toBe('emerald');
    expect(normalizeAccent('unknown')).toBe('emerald');
  });
});

describe('getAccent', () => {
  it('returns the correct accent token set for each theme', () => {
    expect(getAccent('pink').id).toBe('pink');
    expect(getAccent('blue').id).toBe('blue');
    expect(getAccent('emerald').id).toBe('emerald');
    expect(getAccent('green').id).toBe('emerald');
  });

  it('exposes blue-specific portrait and chart tokens', () => {
    const blue = getAccent('blue');
    expect(blue.portraitBorder).toBe('portrait-border--blue');
    expect(blue.portraitGlow).toBe('portrait-border-glow--blue');
    expect(blue.chartA).toBe('#60a5fa');
    expect(blue.hex).toBe('#60a5fa');
  });

  it('falls back to emerald for unknown themes', () => {
    expect(getAccent('not-a-theme').text).toBe('text-emerald-400');
  });
});
