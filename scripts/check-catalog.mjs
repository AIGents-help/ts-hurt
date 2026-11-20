#!/usr/bin/env node
// CI guard: a design can't go live unless it's fulfillable. Fails the PR if anything is missing.
import {readFileSync, existsSync, statSync} from 'node:fs';
const products = JSON.parse(readFileSync('data/products.json', 'utf8'));
const errors = [];
const ids = new Set();
for (const p of products) {
  if (ids.has(p.id)) errors.push(`duplicate id ${p.id}`);
  ids.add(p.id);
  if (!/^[a-z0-9-]{2,40}$/.test(p.id)) errors.push(`${p.id}: id must be kebab-case`);
  for (const k of ['name', 'category', 'tag', 'description', 'added']) if (!p[k]) errors.push(`${p.id}: missing ${k}`);
  if (!(p.price >= 25 && p.price <= 45)) errors.push(`${p.id}: price ${p.price} outside $25–45 guardrail`);
  if (!Array.isArray(p.keywords) || p.keywords.length < 2) errors.push(`${p.id}: needs 2+ SEO keywords`);
  for (const f of [`public/designs/${p.id}.svg`, `public/designs/${p.id}.png`, `public/print/${p.id}.png`]) if (!existsSync(f)) errors.push(`${p.id}: missing ${f}`);
  if (existsSync(`public/print/${p.id}.png`)) {
    const buf = readFileSync(`public/print/${p.id}.png`);
    const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
    if (w < 3600 || h < 4000) errors.push(`${p.id}: print file ${w}x${h} below 3600x4000 (12"@300dpi)`);
    if (statSync(`public/print/${p.id}.png`).size > 25e6) errors.push(`${p.id}: print file too large`);
  }
}
if (errors.length) { console.error('Catalog check FAILED:\n- ' + errors.join('\n- ')); process.exit(1); }
console.log(`Catalog OK: ${products.length} fulfillable designs.`);
