# DEV_CHANGES.md

Changes on `aryav` branch since last merge to `main`. Clear after each merge (keep template).

---

## Pending Changes

### Full Responsive Overhaul (Mobile-First)
- **Dashboard layout**: Created `DashboardShell` client component to manage sidebar state. Sidebar renders as slide-out drawer on mobile (<md) with backdrop overlay. Hamburger menu button in header. Sidebar auto-closes on nav link click.
- **Header**: Hamburger toggle visible on mobile, hidden on desktop. Email truncated to 150px on small screens, 200px on sm.
- **Sidebar**: Fixed overlay with z-50 on mobile, static on desktop. Close button (X) inside sidebar. Backdrop click to close.
- **Landing page navbar**: Added hamburger menu for mobile (<768px). Desktop nav links hidden, replaced with dropdown panel. Proper 44px tap targets.
- **Instance status**: Hero buttons full-width on mobile. Instance URL code block uses `min-w-0` for proper truncation. Plan/Region pill wraps on narrow screens.
- **Billing page**: "Open Billing Portal" button full-width on mobile.
- **Settings page**: Danger zone layout stacks vertically on mobile (text above full-width button).
- **Checkout pages**: Card padding responsive via `clamp()`. Cancel button 44px min-height. Sign out link padded for tap target.
- **Global CSS**: `overflow-x: hidden` on html/body. Safe-area-inset padding for iOS notch.
- **Viewport**: Added Next.js `viewport` export with `viewportFit: "cover"` for notch support.
- **Dashboard shell**: Uses `h-[100dvh]` for proper mobile viewport height (accounts for browser chrome).
- **Main content**: Padding 16px on mobile, 24px on desktop.
- **New files**: `src/components/dashboard/dashboard-shell.tsx`, `ResponsiveQA.md`
- **Modified files**: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/dashboard/layout.tsx`, `src/components/dashboard/sidebar.tsx`, `src/components/dashboard/header.tsx`, `src/components/dashboard/instance-status.tsx`, `src/components/landing/landing-page.tsx`, `src/app/dashboard/billing/page.tsx`, `src/app/dashboard/settings/page.tsx`, `src/app/checkout/success/page.tsx`, `src/app/checkout/cancel/page.tsx`

### Billing Page Cleanup + Settings → Support
- **Billing page**: Removed Plans section (Starter/Pro/Enterprise cards + PlanCard component). Page now only shows Stripe Customer Portal access block
- **Settings page deleted**: Removed `/dashboard/settings` route and page entirely
- **Support page added**: New `/dashboard/support` route with email contact link (`support@openclaw.new`)
- **Sidebar**: Replaced Settings nav item with Support (LifeBuoy icon)
- **Files changed**: `src/app/dashboard/billing/page.tsx`, `src/components/dashboard/sidebar.tsx`
- **Files deleted**: `src/app/dashboard/settings/page.tsx`
- **Files created**: `src/app/dashboard/support/page.tsx`

### Fix: Instance Unreachable After Provisioning (Multiple Root Causes)
- **Root cause 1**: Machines API does not allocate IPs — no `*.fly.dev` DNS record (NXDOMAIN)
- **Root cause 2**: Volume mounted at `/root/.openclaw` but container runs as `node` user (`/home/node`) — permission denied → crash loop
- **Root cause 3**: Missing `--bind lan` — gateway defaulted to loopback, unreachable from Fly proxy
- **Root cause 4**: `sh -c` CMD wrapper — `docker-entrypoint.sh` expects `node` as argv[0]; passing `sh` skipped setup, gateway never started
- **Root cause 5**: Insufficient memory — OpenClaw gateway needs ~800MB RSS at startup; 1024MB VM caused GC thrashing, gateway never bound to port
- **Root cause 6**: OpenClaw requires `allowInsecureAuth: true` + token auth config for non-localhost connections — without `openclaw.json`, WebSocket rejects with "pairing required"
- **Fix**: Added `allocateIpAddresses()` via Fly GraphQL API, fixed mount path to `/home/node/.openclaw`, switched CMD from `sh -c` to `node -e` wrapper (writes config then spawns gateway), bumped starter plan to 2048MB RAM with 1536MB heap limit, added `waitForMachineReady()` + `waitForServiceReady()` before marking active, auto-opens dashboard on success
- **Files changed**: `src/lib/fly.ts`, `src/app/api/instance/provision/route.ts`, `src/components/dashboard/instance-status.tsx`

### Add Start/Stop Instance Controls + Fix Autostart Conflict
- **Issue**: Stop and Restart buttons appeared non-functional — Fly's `autostart: true` service config immediately restarted the machine after stop (triggered by any incoming HTTP request)
- **Fix**: `stopMachine()` now disables `autostart` on the machine's service config before stopping; `startMachine()` re-enables it before starting
- **New API routes**: `POST /api/instance/start`, `POST /api/instance/stop`
- **Dashboard controls**: Contextual buttons — Start shown when stopped, Stop + Restart shown when running, Refresh always visible
- **Files changed**: `src/lib/fly.ts`, `src/app/api/instance/start/route.ts`, `src/app/api/instance/stop/route.ts`, `src/components/dashboard/instance-status.tsx`

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

### Pre-configure Kimi K2.5 as Default Model via OpenRouter
- **Problem**: New users who launch an OpenClaw instance land on an unconfigured assistant — must manually add API keys and select a model before chatting
- **Initial attempt (failed)**: Tried passing `OPENCLAW_PRIMARY_MODEL` / `OPENCLAW_DEFAULT_MODEL` as env vars to the Fly machine. OpenClaw ignores both — they are not valid env vars. Gateway defaulted to `anthropic/claude-opus-4-6` and failed with "No API key found for provider anthropic"
- **Root cause**: OpenClaw reads model config from `openclaw.json` (`agents.defaults.model.primary`), not from env vars. API keys (`OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, etc.) *are* read from env vars
- **Fix**: Added `agents.defaults.model` section to the `openclaw.json` config built in `fly.ts`. `OPENROUTER_API_KEY` passed as env var to the Fly machine. Kimi K2.5 (`openrouter/moonshotai/kimi-k2.5`) is pre-configured as default so users can chat immediately
- **Confirmed working**: Gateway logs show `agent model: openrouter/moonshotai/kimi-k2.5`
- **Users can still** add their own API keys for premium models (Claude, Gemini) via the OpenClaw dashboard
- **New env vars**: `OPENCLAW_DEFAULT_OPENROUTER_KEY` (our env var, passed as `OPENROUTER_API_KEY` to machine), `OPENCLAW_DEFAULT_MODEL` (our env var, used to build `openclaw.json` config — defaults to `openrouter/moonshotai/kimi-k2.5`)
- **Manual step**: Add `OPENCLAW_DEFAULT_OPENROUTER_KEY=sk-or-...` to `.env.local` (and Vercel env vars for production). Ensure OpenRouter account has credits
- **Files changed**: `src/lib/fly.ts`, `src/app/api/instance/provision/route.ts`, `.env.example`

### Vercel Deployment Setup
- **Simplified `next.config.ts`**: Removed `turbopack.root: resolve(__dirname)` — turbopack is dev-only, `__dirname` may not resolve correctly in Vercel's build environment
- **Production branch**: `aryav` (set in Vercel project settings)
- **Manual steps required**:
  1. `vercel link` — connect repo to Vercel project
  2. Set `aryav` as production branch in Vercel dashboard (Settings → Git)
  3. Add all env vars from `.env.local` to Vercel (Settings → Environment Variables)
  4. Create production Stripe webhook endpoint pointing to Vercel URL
  5. Set `STRIPE_WEBHOOK_SECRET` to the new production webhook's signing secret
  6. Add Vercel URL to Supabase Auth redirect URLs
  7. Set `NEXT_PUBLIC_APP_URL` to the Vercel production URL
- **Files changed**: `next.config.ts`

### Fix: Redirect Loop for New Users (Stripe Checkout Failure)
- **Problem**: New users signing in via Google OAuth hit ERR_TOO_MANY_REDIRECTS instead of seeing Stripe checkout
- **Root cause 1**: `STRIPE_PRICE_PRO` was a live-mode price ID but `STRIPE_SECRET_KEY` was a test-mode key — Stripe API rejected every checkout session creation
- **Root cause 2**: When `createCheckoutSession` threw, callback redirected to `/dashboard?error=...` → dashboard layout (no tenant) redirected to `/?error=...` → root page (authed user) redirected back to `/dashboard` → infinite loop
- **Root cause 3**: Vercel env vars had trailing `\n` characters (pasted with newlines in dashboard) — corrupted Stripe API key causing "connection error"
- **Fix (code)**:
  - `src/app/page.tsx`: Skip `/dashboard` redirect when `?error` param is present (breaks redirect loop)
  - `src/app/auth/callback/route.ts`: Checkout failure fallback → `/checkout/cancel` instead of `/dashboard`
  - `src/app/dashboard/layout.tsx`: Checkout failure fallback → `/checkout/cancel` instead of `/`
  - `src/lib/stripe.ts`: Added `env()` helper that `.trim()`s all env var values — prevents trailing whitespace/newline issues
- **Fix (env vars)**: Updated `STRIPE_PRICE_PRO` to test-mode price ID, re-set all env vars via `printf` (no trailing newline) using `vercel env rm` + `vercel env add`
- **Fix (webhook)**: Created production webhook endpoint in Stripe Dashboard, updated `STRIPE_WEBHOOK_SECRET` on Vercel
- **Deploy**: Used `vercel --prod` (git push alone only creates Preview deploys)
- **Files changed**: `src/app/page.tsx`, `src/app/auth/callback/route.ts`, `src/app/dashboard/layout.tsx`, `src/lib/stripe.ts`

### Add Playwright E2E Auth Flow Regression Tests
- **Context**: Auth timeout on external devices was ISP-related (Jio blocking Supabase), but project had zero test infrastructure to verify auth flows
- **What**: Playwright E2E tests in two tiers:
  - **Tier 1 (unauthenticated)**: Landing page OAuth redirect, Supabase health, `/dashboard` redirect protection
  - **Tier 2 (authenticated)**: Session injection via Admin API, root redirect, session persistence, logout flow
- **Test IDs**: AUTH-01, AUTH-02, AUTH-03, AUTH-06, AUTH-07, AUTH-07b, AUTH-08, AUTH-10
- **Run locally**: `npm run test:e2e` (starts dev server automatically)
- **Run against production**: `E2E_BASE_URL=https://tryopenclaw.vercel.app npm run test:e2e`
- **Requires**: `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` for Tier 2 (authed) tests
- **New files**: `playwright.config.ts`, `e2e/auth-unauthed.spec.ts`, `e2e/auth-authed.spec.ts`, `e2e/helpers/supabase-admin.ts`, `e2e/helpers/auth-session.ts`
- **Modified files**: `package.json`, `.gitignore`, `.env.example`

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
