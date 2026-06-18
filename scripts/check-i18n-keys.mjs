import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const en = JSON.parse(readFileSync(join(root, 'src/locales/en/translation.json'), 'utf8'));
const fr = JSON.parse(readFileSync(join(root, 'src/locales/fr/translation.json'), 'utf8'));

function flatten(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return flatten(value, path);
    }
    return [path];
  });
}

const enKeys = new Set(flatten(en));
const frKeys = new Set(flatten(fr));

const missingInFr = [...enKeys].filter((k) => !frKeys.has(k));
const missingInEn = [...frKeys].filter((k) => !enKeys.has(k));

if (missingInFr.length || missingInEn.length) {
  if (missingInFr.length) {
    console.error('Keys missing in fr/translation.json:');
    missingInFr.forEach((k) => console.error(`  - ${k}`));
  }
  if (missingInEn.length) {
    console.error('Keys missing in en/translation.json:');
    missingInEn.forEach((k) => console.error(`  - ${k}`));
  }
  process.exit(1);
}

console.log(`i18n OK: ${enKeys.size} keys matched in en and fr.`);
