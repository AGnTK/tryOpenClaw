# DEV_CHANGES.md

Changes on `aryav` branch since last merge to `main`. Clear after each merge (keep template).

---

## Pending Changes

### Checkout Success/Cancel Page Redesign
- **Both pages redesigned** to match landing page theme (Inter font, dot grid bg, red/teal accents, crab logo, rounded cards)
- **Success page**: Polls for tenant record, shows spinner → auto-redirects to dashboard on confirmation
- **Cancel page**: Red "Try Again" button (retries Stripe Checkout) + "Sign Out" link

### Post-Payment Flow: Manual Instance Launch
- **Stripe webhook no longer auto-provisions** — `checkout.session.completed` now sets tenant status to `"paid"` (no Fly.io calls)
- **New provisioning API**: `POST /api/instance/provision` — user-triggered, creates Fly app/volume/machine, reverts to `"paid"` on failure so user can retry
- **Dashboard "Launch Your OpenClaw" button** — shown when tenant status is `"paid"`, triggers provisioning on click
- **Checkout success page** — polls for tenant record then redirects to dashboard
- **New tenant status**: `"paid"` — between payment and instance launch
- **Flow**: Payment → Confirmation → Dashboard → "Launch Your OpenClaw" → Provisioning → Active

### Landing Page Redesign
- **Replaced root `/` page**: Unauthenticated users now see the full marketing landing page (ported from AGnTK/website repo)
- **New file**: `src/components/landing/landing-page.tsx` — all sections (hero, social proof, comparison, testimonials, use cases, CTA, footer)
- **Static assets**: Added `/public/logos/` and `/public/profiles/`
- **Google Fonts**: Added Inter + JetBrains Mono via `<link>` in layout
- **All "Get Started" buttons** trigger Google OAuth via `signInWithOAuth({ provider: "google" })`
- **Removed `/auth/login` page** — all auth redirects now go to `/`
- **Updated all references**: proxy.ts, header.tsx, logout route, dashboard layout, callback route

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
- Existing tenants with status `"provisioning"` may need manual status update to `"paid"` if migrating
