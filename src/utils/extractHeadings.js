/** Slugify a heading for anchor links. */
export function slugifyHeading(text) {
  return String(text ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || 'section';
}

/** Extract h2/h3 headings from markdown for a table of contents. */
export function extractHeadings(content) {
  if (!content) return [];
  const headings = [];
  const seen = new Map();
  for (const line of content.split('\n')) {
    const m = /^(#{2,3})\s+(.+)$/.exec(line.trim());
    if (!m) continue;
    const level = m[1].length;
    const text = m[2].replace(/[#*_`[\]()]/g, '').trim();
    let id = slugifyHeading(text);
    const n = (seen.get(id) || 0) + 1;
    seen.set(id, n);
    if (n > 1) id = `${id}-${n}`;
    headings.push({ level, text, id });
  }
  return headings;
}
