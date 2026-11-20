# TS-HURT

**FEELINGS SOLD SEPARATELY.** An underground print operation by AIGents LLC.

Next.js 15 storefront on Vercel → Stripe Checkout → Printful auto-fulfillment, with email capture, abandoned-cart recovery, weekly drop broadcasts, a weekly P&L email and a Command Center at `/admin`. See **CLAUDE.md** for the autonomy map and **docs/DESIGN_FACTORY.md** for how new designs get made.

## Go-live checklist (one time)
1. Create a **new Stripe account** for Ts-Hurt → copy the secret key → run `STRIPE_SECRET_KEY=sk_live_... node scripts/setup-stripe.mjs` (creates WELCOME10 / COMEBACK10 and the webhook, prints `STRIPE_WEBHOOK_SECRET`).
2. Create a **Printful** account (no store integration needed: choose "API" / manual order platform), add a billing card, create a private API token.
3. **Resend**: verify `ts-hurt.com` sending domain, create an audience, API key.
4. Paste everything from `.env.example` into Vercel env (Production) and redeploy.
5. Place one real order of your own with `PRINTFUL_AUTO_CONFIRM=false`, confirm the draft in Printful, check the shirt. Then set `PRINTFUL_AUTO_CONFIRM=true`. The store is now hands-off.

## Dev
```bash
npm install
npm run dev
node scripts/build-print-files.mjs   # after adding/editing a design SVG
node scripts/check-catalog.mjs       # every product must be fulfillable
```
Fonts: Anton (SIL Open Font License, `assets/fonts/OFL-Anton.txt`).
