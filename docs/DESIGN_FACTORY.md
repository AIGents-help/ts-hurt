# TS-HURT Design Factory

The weekly drop is how the catalog grows without Tony doing the work. A scheduled AI run follows this file, opens **one pull request** labeled `design-drop`, and stops. Tony merges (publish) or closes (reject). Merging deploys automatically, and the Thursday cron emails the list about it.

## The voice

The shirt you'd see at a motorcycle rally, a tattoo convention or a refinery break room. Bold, crude, darkly funny, not politically correct, built for people who are tired of being polite. **The joke is aimed at life, work, the body, the ego, the buyer themselves, or institutions. It is never aimed at who someone is.**

Best performers so far follow these patterns. Riff on them:
- **Made-up swear words** that are actually clever: SHITUATION, MALFUCKTION. Coin new ones (e.g. "CLUSTERFUNCTION", "FUCKTASTROPHE"-tier, but original).
- **Road / grit / survival bravado:** "I DON'T ARRIVE. I SURVIVE."
- **Dark humor about death, aging, the body:** "BURY ME FACE DOWN."
- **Hurt-to-grow motivation with a mean streak:** "1 REP."
- **Shift work / blue-collar / corporate pain:** night shift, overtime, HR, safety meetings, "per my last email". Tony's home turf, so mine it hard.

## Hard guardrails (non-negotiable — protect the Stripe & Printful accounts)

A design is rejected before PR if it:
1. Targets or mocks a protected group: race, ethnicity, religion, nationality, sex, gender identity, sexual orientation, disability. **No slurs, ever, even "ironic".**
2. Promotes or glorifies real violence, threats, self-harm, drugs dealing, or sexual content involving anyone non-consenting or minors.
3. Names or depicts a real person, brand, logo, sports team, character, song lyric, or movie quote (IP takedown = Printful strike).
4. Is political-party or candidate content (polarizes the buyer pool, gets ads rejected).
5. Is just shock with no joke. Crude is the delivery; the joke still has to land.

Swearing, crude bodily humor, dark jokes about death, and insulting the reader directly are all **fine**.

## Format per design

- `public/designs/<id>.svg` — viewBox `0 0 1200 1400`, transparent background, prints on **black** tees: use only `#eee5cf` (bone), `#d42d27` (blood red), optionally `#8f8880` (ash). Text via `<text>` with any font-family (the build swaps in bundled Anton). Keep all ink inside x 90–1110, y 200–1180. Copy an existing design file as the template and keep the house frame/stamp style, but vary layout so the catalog doesn't look cloned.
- Long words: use `textLength` + `lengthAdjust="spacingAndGlyphs"` to fit width.
- Add the entry to `data/products.json`: kebab-case `id`, ALL-CAPS `name`, one of the existing categories (`NO FILTER`, `HURT TO GROW`, `SOCIAL DISCOMFORT`, `OFFENDERS`) or one new one max per drop, `price` 29 (standard) or 32 (premium), short `tag`, one-to-two sentence `description` in voice, 3 buyer-intent `keywords` ("funny shift work shirt"), `added` = today (YYYY-MM-DD).
- Run `node scripts/build-print-files.mjs`, then `node scripts/check-catalog.mjs`, `npm run typecheck`, `npm run build`. All must pass.
- Look at each rendered `public/designs/<id>.png` composited on black. Fix overflow, clipped text, or unreadable layout before opening the PR.

## Each weekly drop

- **3 designs.** At least one shift-work/blue-collar, at least one made-up-swear-word, and one wildcard.
- Check `/api/metrics?days=30` (if `METRICS_TOKEN` is available) and lean the drop toward whatever category sold best; avoid repeating patterns with zero sales.
- Also write `marketing/drops/<date>.md` with, per design: 3 TikTok/Reels hooks (first 2 seconds), 1 caption with 5 hashtags, and 1 Pinterest pin title + description.
- PR title: `Design drop YYYY-MM-DD: <name>, <name>, <name>`. Label: `design-drop`. Body: one line per design with the joke explained in under 10 words, and the guardrail check stated as passed.
- Never merge your own PR. Never edit checkout, webhook, pricing logic, or env config in a design-drop PR.
