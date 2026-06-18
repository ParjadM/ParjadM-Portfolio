export function buildLanguageDirective(locale) {
  if (!locale || String(locale).startsWith('en')) return '';
  return '\n\nIMPORTANT: Write all user-facing text in French (Canadian French preferred). Keep code snippets, URLs, and proper nouns unchanged.';
}

export function normalizeLocale(locale) {
  if (!locale) return 'en';
  const value = String(locale).toLowerCase();
  if (value.startsWith('fr')) return 'fr';
  return 'en';
}
