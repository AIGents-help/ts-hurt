#!/usr/bin/env node
// Renders every design SVG in public/designs/ into:
//   public/print/<id>.png     — 3600x4200 (12"x14" @ 300dpi) transparent print file Printful pulls at order time
//   public/designs/<id>.png   — 900px web preview used by the storefront
// Fonts are bundled (assets/fonts) so output is identical on every machine/CI run.
// Usage: node scripts/build-print-files.mjs [--only id1,id2] [--force]
import {readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {Resvg} from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const designsDir = join(root, 'public/designs');
const printDir = join(root, 'public/print');
const fontFiles = readdirSync(join(root, 'assets/fonts')).filter(f => /\.(ttf|otf)$/i.test(f)).map(f => join(root, 'assets/fonts', f));
mkdirSync(printDir, {recursive: true});

const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1].split(',') : null;
const force = args.includes('--force');

// Every design font stack collapses to the bundled print font.
const normalize = svg => svg.replace(/font-family="[^"]*"/g, 'font-family="Anton"');

let built = 0;
for (const file of readdirSync(designsDir).filter(f => f.endsWith('.svg'))) {
  const id = file.replace(/\.svg$/, '');
  if (only && !only.includes(id)) continue;
  const src = join(designsDir, file);
  const out = join(printDir, `${id}.png`);
  if (!force && existsSync(out) && statSync(out).mtimeMs > statSync(src).mtimeMs) continue;
  const svg = normalize(readFileSync(src, 'utf8'));
  const render = width => new Resvg(svg, {fitTo: {mode: 'width', value: width}, font: {fontFiles, loadSystemFonts: false, defaultFontFamily: 'Anton'}, background: 'rgba(0,0,0,0)'}).render().asPng();
  writeFileSync(out, render(3600));
  writeFileSync(join(designsDir, `${id}.png`), render(900));
  built++;
  console.log(`✓ ${id}`);
}
console.log(`${built} design(s) rendered.`);
