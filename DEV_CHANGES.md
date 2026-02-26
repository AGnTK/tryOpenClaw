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
- **Support page added**: New `/dashboard/support` route with email contact link (`support@tryopenclawai.com`)
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

### Legal Pages: Terms, Privacy, Money-Back Guarantee
- **Shared layout**: Extracted `LegalPageShell` component with nav (logo + Contact Support), footer (Terms/Privacy/Guarantee links + email), and all shared inline CSS
- **Terms page** (`/terms`): 18-section Terms of Service with acceptance, payments, acceptable use, liability, etc.
- **Privacy page** (`/privacy`): 13-section Privacy Policy with data collection, third-party services, cookies, rights, etc.
- **Money-Back Guarantee page** (`/money-back-guarantee`): Refactored to use `LegalPageShell`. 7-day guarantee policy with eligibility, refund process, exclusions
- **Landing page hero**: Added subtitle below Get Started button — "Set up in under a minute. Cancel anytime. Moneyback guarantee." with link to `/money-back-guarantee` (13px, `#9ca3af`, 20px top margin)
- **Landing page CTA**: Same subtitle added below bottom Get Started button
- **Landing page footer**: Updated Terms/Privacy links from `#` to `/terms` and `/privacy`
- **Support email**: Updated all references from `support@openclaw.new` to `support@tryopenclawai.com`
- **New files**: `src/components/legal-page-shell.tsx`, `src/app/terms/page.tsx`, `src/app/privacy/page.tsx`
- **Modified files**: `src/app/money-back-guarantee/page.tsx`, `src/components/landing/landing-page.tsx`, `src/app/dashboard/support/page.tsx`

### Dashboard: Get Started Section Extracted
- **Extracted** Get Started guide from `instance-status.tsx` into standalone `get-started-section.tsx`
- **Removed** "Open Dashboard to Configure" button from Get Started section
- **Dashboard order**: InstanceStatus → Integrations → Get Started → Inspiration → FAQ
- **New files**: `src/components/dashboard/get-started-section.tsx`
- **Modified files**: `src/components/dashboard/instance-status.tsx`, `src/app/dashboard/page.tsx`

### Dashboard: Integrations, Inspiration & FAQ Sections
- **3 new sections** below instance status on dashboard page
- **Integrations section** (`integrations-section.tsx`): 4 integration cards (Web Chat, Telegram, Slack, Discord) with configure modal per platform. Modal shows setup steps + input field. No backend — guides users to configure via OpenClaw dashboard
- **Inspiration section** (`inspiration-section.tsx`): 6 use case idea cards in responsive grid (1→2→3 cols). Server component, no state
- **FAQ section** (`faq-section.tsx`): 6 accordion items with single-open toggle and chevron rotation
- **No new dependencies** — modal and accordion built with `useState`
- **New files**: `src/components/dashboard/integrations-section.tsx`, `src/components/dashboard/inspiration-section.tsx`, `src/components/dashboard/faq-section.tsx`
- **Modified files**: `src/app/dashboard/page.tsx`

### First-Time User Discount via Stripe Payment Link
- **Problem**: New users and cancelled users both got the same Stripe Checkout flow. Needed to differentiate for a $59 discounted offer via Payment Link with `50NOW` promo code
- **Solution**: Split routing — first-time users (no tenant record) → Stripe Payment Link with `client_reference_id` + `prefilled_email`; cancelled users → regular `createCheckoutSession()`
- **Webhook update**: `handleCheckoutCompleted()` now reads `session.client_reference_id` as fallback for `session.metadata?.userId` (Payment Links don't support custom metadata). Default plan changed from `"starter"` to `"pro"`
- **New helper**: `getFirstTimeCheckoutUrl(userId, email)` in `stripe.ts` — reads `STRIPE_FIRST_TIME_LINK` env var, appends `client_reference_id` and `prefilled_email` URL params
- **New env var**: `STRIPE_FIRST_TIME_LINK` — set to `https://buy.stripe.com/5kQ9AVgYefxl1V68bG6AM1r?prefilled_promo_code=50NOW`
- **Manual step**: Add `STRIPE_FIRST_TIME_LINK` to Vercel env vars and redeploy
- **Files changed**: `src/lib/stripe.ts`, `src/app/auth/callback/route.ts`, `src/app/dashboard/layout.tsx`, `src/app/api/webhooks/stripe/route.ts`

### Provisioning: Clean Up Orphaned Fly Resources on Failure
- **Problem**: When `createMachine` fails (e.g. Fly 412 "insufficient resources"), the already-created Fly app and volume were left orphaned. Each retry created new orphans. `flyAppName` stayed in DB preventing clean retries
- **Fix**: Error handler now calls `destroyApp()` (cascades to volumes), clears `flyAppName`/`flyMachineId`/`instanceUrl` from tenant row, and returns the actual error message to the client
- **Files changed**: `src/app/api/instance/provision/route.ts`

### Telegram Integration via Dashboard (E2E)
- **Database**: Added `telegramBotToken` column (nullable) to `tenants` table
- **Fly.ts**: Added `updateMachineEnvVars()` — reads machine config, merges/removes env vars, POSTs back (Fly auto-restarts)
- **New API route**: `GET/POST/DELETE /api/instance/channels/telegram`
  - POST: Validates token via Telegram `getMe` API, stores in DB, sets `TELEGRAM_BOT_TOKEN` env var on machine
  - DELETE: Clears token from DB, removes `TELEGRAM_BOT_TOKEN` env var from machine
  - GET: Returns `{ configured, botUsername }` based on stored token
- **Provision route**: If `tenant.telegramBotToken` exists, passes `TELEGRAM_BOT_TOKEN` as env var at provision time
- **Approach**: Uses `TELEGRAM_BOT_TOKEN` env var (not `openclaw.json` channels section) — OpenClaw reads it natively, keeping the OpenClaw UI default with all channels visible
- **UI rewrite**: `IntegrationsSection` now shows only Telegram (Web Chat, Slack, Discord removed). Fetches connection status on mount, shows Connected/Not Connected state, Configure/Reconfigure/Disconnect buttons, modal with token validation and loading state
- **Manual step**: Run `npx drizzle-kit push` to add the new column (or `ALTER TABLE tenants ADD COLUMN IF NOT EXISTS telegram_bot_token TEXT`)
- **New files**: `src/app/api/instance/channels/telegram/route.ts`
- **Modified files**: `src/lib/schema.ts`, `src/lib/fly.ts`, `src/app/api/instance/provision/route.ts`, `src/components/dashboard/integrations-section.tsx`

### Region Fallback for Fly Capacity Errors (409/412)
- **Problem**: `iad` region out of capacity — Fly returns `409: insufficient memory` or `412: insufficient resources`, provisioning fails
- **Fix**: Provision route now tries regions in order: `iad` → `ord` → `ewr` → `sjc`. On capacity errors, deletes the failed volume and retries next region. Non-capacity errors break immediately
- **New helper**: `deleteVolume()` in `fly.ts`
- **Files changed**: `src/lib/fly.ts`, `src/app/api/instance/provision/route.ts`

### Fix OpenClaw Gateway Crash on Startup
- **Problem 1**: Latest OpenClaw Docker image requires `controlUi.dangerouslyAllowHostHeaderOriginFallback: true` for non-loopback access. Gateway crashed with "non-loopback Control UI requires gateway.controlUi.allowedOrigins"
- **Problem 2**: `googlechat` channel enabled but Docker image missing `google-auth-library` → crash-loop
- **Fix**: Added `dangerouslyAllowHostHeaderOriginFallback: true` to `controlUi` config, removed `googlechat` from channels block
- **Files changed**: `src/lib/fly.ts`

### Async Provisioning (Fix Vercel Timeout)
- **Problem**: Provision route waited for machine boot + service readiness (2-3 min). Vercel Hobby plan kills functions at 10s, destroying the Fly app mid-provision
- **Fix**: Provision route now creates Fly resources and returns immediately with `"provisioning"`. Status route (`GET /api/instance/status`) auto-promotes to `"active"` when machine is started + HTTP service responds `< 500`
- **Client**: Polls every 10s, shows provisioning spinner, auto-opens dashboard on `"active"` transition
- **Removed**: `waitForMachineReady()` and `waitForServiceReady()` imports from provision route
- **Files changed**: `src/app/api/instance/provision/route.ts`, `src/app/api/instance/status/route.ts`, `src/components/dashboard/instance-status.tsx`

### Fly Machine Config Improvements (3 Changes)
- **`autostop: "suspend"`**: Changed from `"stop"` to `"suspend"` in `createMachine()`. Machines suspend to memory instead of shutting down — resume in ~1-3s vs ~10-30s cold boot. Suspended machines still incur reduced memory billing
- **Channel schemas enabled**: Added `channels` block to `openclaw.json` config with `{ enabled: true }` for 8 channels (Telegram, WhatsApp, Discord, IRC, Google Chat, Slack, Signal, iMessage). Fixes "Channel config schema unavailable" in OpenClaw dashboard
- **Default model → Kimi K2.5 Nitro**: Changed default from `kimi-k2.5` to `kimi-k2.5:nitro` — same model, faster inference via optimized provider routing on OpenRouter
- **Existing instances unaffected** — changes only apply to newly provisioned machines. Existing instances need restart/reprovision to pick up new config
- **Files changed**: `src/lib/fly.ts`

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
