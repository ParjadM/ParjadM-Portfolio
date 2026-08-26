export const CURSOR_THEMES = {
  professional: {
    id: 'professional',
    nameKey: 'cursorThemes.professional',
  },
  minimal: {
    id: 'minimal',
    nameKey: 'cursorThemes.minimal',
  },
  classic: {
    id: 'classic',
    nameKey: 'cursorThemes.classic',
  },
  accent: {
    id: 'accent',
    nameKey: 'cursorThemes.accent',
  },
  crosshair: {
    id: 'crosshair',
    nameKey: 'cursorThemes.crosshair',
  },
  native: {
    id: 'native',
    nameKey: 'cursorThemes.native',
    usesNativePointer: true,
  },
};

export const DEFAULT_CURSOR_THEME_ID = 'professional';

export function getCursorTheme(id) {
  return CURSOR_THEMES[id] ?? CURSOR_THEMES[DEFAULT_CURSOR_THEME_ID];
}

export function isCustomCursorEnabled(id) {
  return !getCursorTheme(id).usesNativePointer;
}
