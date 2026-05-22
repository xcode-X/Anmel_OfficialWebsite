/**
 * Compress large PNG assets to WebP for faster page loads.
 * Run: node scripts/optimize-images.mjs
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesDir = path.join(__dirname, '../src/images');

const targets = [
  { file: 'scholarship-student-cutout.png', maxWidth: 900, quality: 82 },
];

for (const { file, maxWidth, quality } of targets) {
  const input = path.join(imagesDir, file);
  if (!fs.existsSync(input)) {
    console.warn(`Skip (missing): ${file}`);
    continue;
  }
  const out = input.replace(/\.png$/i, '.webp');
  const before = fs.statSync(input).size;
  await sharp(input)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toFile(out);
  const after = fs.statSync(out).size;
  console.log(`${file} → ${path.basename(out)} (${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB)`);
}
