import { describe, expect, it } from 'vitest';
import {
  CURSOR_THEMES,
  DEFAULT_CURSOR_THEME_ID,
  getCursorTheme,
  isCustomCursorEnabled,
} from './cursorThemeConfig.js';

describe('cursorThemeConfig', () => {
  it('returns known cursor themes', () => {
    expect(getCursorTheme('professional').id).toBe('professional');
    expect(getCursorTheme('native').usesNativePointer).toBe(true);
  });

  it('falls back to default for unknown ids', () => {
    expect(getCursorTheme('unknown').id).toBe(DEFAULT_CURSOR_THEME_ID);
  });

  it('detects when custom cursor is disabled', () => {
    expect(isCustomCursorEnabled('classic')).toBe(true);
    expect(isCustomCursorEnabled('native')).toBe(false);
  });

  it('defines at least five selectable styles plus native', () => {
    expect(Object.keys(CURSOR_THEMES).length).toBeGreaterThanOrEqual(6);
  });
});
