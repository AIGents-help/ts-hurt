# TS-HURT — AIGents Protocol

Print-on-demand apparel brand of AIGents LLC (owner: Tony Kates). Edgy, crude, darkly funny tees. Goal: fully autonomous revenue with one human gate (weekly design approval).

## How money flows (don't break this)
Cart → `POST /api/checkout` (prices rebuilt server-side from `data/products.json`) → Stripe Checkout → `POST /api/stripe/webhook` (signature-verified) → `lib/printful.ts createOrder` (external_id = payment_intent, idempotent) → Printful prints & ships using `https://ts-hurt.com/print/<id>.png`. Owner gets a sale email; buyer gets confirmation; expired checkouts with promo consent get a recovery email.

## Autonomy map
| Loop | Where | Human? |
|---|---|---|
| Order fulfillment | Stripe webhook → Printful | No (draft-mode until `PRINTFUL_AUTO_CONFIRM=true`) |
| Abandoned cart recovery | webhook `checkout.session.expired` | No |
| Email capture + welcome code | `/api/subscribe` → Resend | No |
| New-drop email blast | Vercel cron Thu → `/api/cron/drop-broadcast` | No |
| Weekly P&L + verdict to Tony | Vercel cron Mon → `/api/cron/weekly-report` | No |
| New designs | Weekly scheduled AI run → PR labeled `design-drop` (see `docs/DESIGN_FACTORY.md`) | **Yes: merge = publish** |
| Command Center | `/admin` (basic auth) + `/api/metrics` (bearer) for DJINN | Read only |

## Rules for any AI working here
- Read `docs/DESIGN_FACTORY.md` before touching designs; its content guardrails are mandatory.
- Every product must pass `node scripts/check-catalog.mjs`. CI runs it plus typecheck and build on every PR.
- Never commit secrets. All keys live in Vercel env (see `.env.example`).
- Never change prices, checkout, webhook, or fulfillment code in the same PR as designs.
- Ship via PR to `main`; Vercel auto-deploys `main` to ts-hurt.com.
