/**
 * Format an ISO-ish date string ("2026-06-25") into a localized long date
 * ("June 25, 2026" / "25 juin 2026"). Falls back to the raw string.
 */
export function formatDate(dateStr, language = 'en') {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  const locale = String(language).startsWith('fr') ? 'fr-CA' : 'en-CA';
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(d);
}
