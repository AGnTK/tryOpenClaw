# DEV_CHANGES.md

Changes in `dev` since last merge to `master`. Clear after each merge (keep template).

---

## Pending Changes

### Landing Page Redesign
- **Replaced root `/` page**: Unauthenticated users now see the full marketing landing page (ported from AGnTK/website repo) instead of being redirected to `/auth/login`
- **New file**: `src/components/landing/landing-page.tsx` — full landing page component with all sections (hero, social proof, comparison, testimonials, use cases, CTA, footer)
- **Static assets**: Added `/public/logos/` (6 company logos + 3 model logos + 3 platform logos) and `/public/profiles/` (13 testimonial avatars)
- **Google Fonts**: Added Inter + JetBrains Mono via `<link>` in `src/app/layout.tsx`
- **All "Get Started" buttons** trigger Google OAuth via `signInWithOAuth({ provider: "google" })`
- **`/auth/login` page unchanged** — still works as fallback for middleware redirects

### Phase 1: Core Platform (Initial Build)
- **Next.js 15 project scaffolded** with TypeScript strict, Tailwind v4, App Router
- **shadcn/ui components**: Button, Card, Badge, Input (manual setup, no CLI)
- **Drizzle ORM schema**: `tenants` + `billing_events` tables (`src/lib/schema.ts`)
- **Supabase Auth**: Google OAuth login, callback, logout, middleware protection
- **Fly.io Machines API client** (`src/lib/fly.ts`): create/start/stop/destroy/resize machines
- **Stripe integration** (`src/lib/stripe.ts`): Checkout sessions, Portal sessions, webhook verification
- **Stripe webhook handler** (`src/app/api/webhooks/stripe/route.ts`): Handles checkout.session.completed, subscription.deleted, subscription.updated, invoice.payment_failed
- **Instance API routes**: provision info, live status, restart, destroy
- **Billing API routes**: create Checkout session, create Portal session
- **Dashboard**: Layout (sidebar + header), instance status with auto-refresh, quick start guide
- **Billing page**: Stripe Portal link, plan comparison cards
- **Settings page**: Instance config guidance, danger zone (cancel subscription)

---

## Migration / Manual Steps Required

1. **Create Supabase project** and configure Google OAuth provider
2. **Create Stripe products/prices** for Starter ($19/mo), Pro ($49/mo), Enterprise ($149/mo)
3. **Configure Stripe webhook** endpoint: `{APP_URL}/api/webhooks/stripe` with events:
   - `checkout.session.completed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
   - `invoice.payment_failed`
4. **Create Fly.io API token** via `flyctl tokens create`
5. **Set all environment variables** (see `.env.example`)
6. **Run `npx drizzle-kit push`** to create database tables
7. **Deploy to Vercel** with env vars configured

---

## Deploy Notes

- First deployment requires all env vars set in Vercel dashboard
- Stripe webhook URL must point to production URL after deploy
- Fly.io API token must have org-level access to create apps
