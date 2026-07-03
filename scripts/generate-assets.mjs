/**
 * Generates optimized site assets with sharp:
 *  - WebP versions of src/Images (smaller payloads for the app bundle)
 *  - PWA icons (192/512/maskable/apple-touch) from the favicon artwork
 *  - Open Graph card (1200x630) for social link previews
 *
 * Run: node scripts/generate-assets.mjs
 */
import sharp from 'sharp';
import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imagesDir = path.join(root, 'src', 'Images');
const publicDir = path.join(root, 'public');
const iconsDir = path.join(publicDir, 'icons');
const serverAssetsDir = path.join(root, 'server', 'assets');

const WEBP_SOURCES = [
  { file: 'Parjad.jpg', maxWidth: 800 },
  { file: 'ParjadM.png', maxWidth: 800 },
  { file: 'Logo.png', maxWidth: 400 },
  { file: 'CodeQuest.jpg', maxWidth: 1280 },
  { file: 'Binary 1010 Generator.jpg', maxWidth: 1280 },
  { file: 'SpaceShooter.jpg', maxWidth: 1280 },
];

// Project card images also get a 640px variant for phone-sized srcsets.
const SM_VARIANTS = ['CodeQuest.jpg', 'Binary 1010 Generator.jpg', 'SpaceShooter.jpg'];

async function generateWebp() {
  for (const { file, maxWidth } of WEBP_SOURCES) {
    const src = path.join(imagesDir, file);
    const out = src.replace(/\.(jpe?g|png)$/i, '.webp');
    const info = await sharp(src)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(out);
    console.log(`webp  ${file} -> ${path.basename(out)} (${Math.round(info.size / 1024)} kB)`);

    if (SM_VARIANTS.includes(file)) {
      const outSm = src.replace(/\.(jpe?g|png)$/i, '-sm.webp');
      const infoSm = await sharp(src)
        .resize({ width: 640, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(outSm);
      console.log(`webp  ${file} -> ${path.basename(outSm)} (${Math.round(infoSm.size / 1024)} kB)`);
    }
  }
}

async function generateIcons() {
  await mkdir(iconsDir, { recursive: true });
  const source = path.join(imagesDir, 'FavIcon.png');

  const targets = [
    { out: 'icon-192.png', size: 192, pad: 0 },
    { out: 'icon-512.png', size: 512, pad: 0 },
    // Maskable icons need ~10% safe-zone padding so the artwork survives circular masks.
    { out: 'icon-maskable-512.png', size: 512, pad: 64 },
    { out: 'apple-touch-icon.png', size: 180, pad: 0 },
  ];

  for (const { out, size, pad } of targets) {
    const inner = size - pad * 2;
    const artwork = await sharp(source)
      .resize(inner, inner, { fit: 'contain', background: '#0f172a' })
      .toBuffer();
    await sharp({
      create: { width: size, height: size, channels: 4, background: '#0f172a' },
    })
      .composite([{ input: artwork, top: pad, left: pad }])
      .png()
      .toFile(path.join(iconsDir, out));
    console.log(`icon  ${out} (${size}x${size})`);
  }
}

async function generateOgImage() {
  const W = 1200;
  const H = 630;
  const logo = await sharp(path.join(imagesDir, 'Logo.png'))
    .resize(220, 220, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();

  const svg = `
  <svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0f172a"/>
        <stop offset="100%" stop-color="#134e4a"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <rect x="0" y="${H - 8}" width="${W}" height="8" fill="#10b981"/>
    <text x="90" y="330" font-family="Segoe UI, Arial, sans-serif" font-size="72" font-weight="800" fill="#ffffff">Parjad Minooei</text>
    <text x="90" y="410" font-family="Segoe UI, Arial, sans-serif" font-size="40" font-weight="500" fill="#6ee7b7">Software Engineer</text>
    <text x="90" y="480" font-family="Segoe UI, Arial, sans-serif" font-size="28" fill="#94a3b8">parjadm.ca — projects, blog &amp; interactive portfolio</text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .composite([{ input: logo, top: 120, left: W - 340 }])
    .jpeg({ quality: 90 })
    .toFile(path.join(publicDir, 'og-image.jpg'));
  console.log('og    og-image.jpg (1200x630)');
}

async function copyOgFont() {
  await mkdir(serverAssetsDir, { recursive: true });
  const src = path.join(root, 'node_modules', '@fontsource', 'outfit', 'files', 'outfit-latin-600-normal.woff');
  const dest = path.join(serverAssetsDir, 'outfit-latin-600.woff');
  await copyFile(src, dest);
  console.log('font  outfit-latin-600.woff -> server/assets/');
}

await generateWebp();
await generateIcons();
await generateOgImage();
await copyOgFont();
console.log('Done.');
