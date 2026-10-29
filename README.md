# TS-HURT

**FEELINGS SOLD SEPARATELY.**  
*An Underground Print Operation*

Next.js 15 starter for a grungy, print-on-demand apparel brand.

## Run

```bash
npm install
npm run dev
```

## Current scope

- Responsive homepage, sample inventory with filters, product size selection, and browser-persisted cart.
- Three branded visual positions (wordmark, operation seal, press mark) currently rendered as CSS/text treatments.
- **Concept artwork only**. The three original high-resolution generated logo PNGs must be added to the repository and substituted before launch.
- **Checkout disabled.** No Stripe, POD, tax, or shipment integrations are configured. Sample product prices are not production-verified.

## Next priorities

1. Add approved original logos and final artwork, with optimized web variants.
2. Configure POD account/provider, products, variant IDs, shipping, samples and return policies.
3. Implement secure server-side Stripe Checkout, webhook validation, idempotent order processing and POD order submission.
4. Perform build, accessibility, mobile and checkout test suites, then deploy to Vercel and connect ts-hurt.com.
