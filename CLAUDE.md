# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Mandatory Project Workflow (Non-Negotiable)

Any AI or developer working on this project must follow this workflow to avoid context loss, regressions, and repeated mistakes.

### Workflow Steps
1. **Read `CLAUDE.md` first** (this file).
2. **Check `DEV_CHANGES.md`** (when on `dev`) to see what's pending for deployment/migrations/manual steps.
3. **Check `TODO.md`** for planned work, blockers, and tech debt.
4. **Make changes** (minimal scope; no unrelated refactors).
5. **Update documentation immediately**:
   - Update `CLAUDE.md` if a new rule/convention/recurring mistake is discovered.
   - Update `DEV_CHANGES.md` (on `dev`) for every completed change + any deploy steps.
   - Update `TODO.md` for new enhancements/tech debt/blockers.
6. **If docs aren't updated, the change is incomplete.**

### Documentation Files
| File | Purpose | When to Update |
|------|---------|----------------|
| `CLAUDE.md` | Project rules, architecture, conventions, known issues | New conventions; move items from DEV_CHANGES after merge |
| `DEV_CHANGES.md` | Changes in dev since last master merge | Every dev change; cleared after merge to master (keep template) |
| `TODO.md` | Future features, client feedback, tech debt | New requirements or blocked items |

---

## Project Overview

**OpenClaw SaaS** — A managed hosting platform for OpenClaw AI assistants. Users sign in with Google, pay via Stripe, and get a fully provisioned OpenClaw instance on Fly.io. We don't rebuild any OpenClaw features — we only build the billing, provisioning, and management layer.

### Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS v4, shadcn/ui components |
| Language | TypeScript 5 (strict mode) |
| Auth | Supabase Auth (Google OAuth) |
| Database | Supabase PostgreSQL via Drizzle ORM |
| Billing | Stripe (Checkout, Subscriptions, Customer Portal, Webhooks) |
| Tenant Hosting | Fly.io Machines API (one machine per tenant) |
| Deployment | Vercel (GitHub integration, `aryav` branch = production) |
| Package Manager | npm |

---

## Commands

```bash
npm run dev      # Dev server at http://localhost:3000
npm run build    # Production build
npm start        # Serve production build
npm run lint     # ESLint
npx drizzle-kit push  # Push schema to Supabase DB
```

### External CLI tools needed for development:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe  # Local Stripe webhooks
flyctl apps list                     # See tenant apps
flyctl machines list -a oc-tenant-x  # Check tenant machine
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx               # Root layout, fonts (Geist + Inter + JetBrains Mono), metadata
│   ├── page.tsx                 # Landing page (unauthed) or redirect to /dashboard (authed)
│   ├── auth/
│   │   ├── callback/route.ts    # OAuth callback handler
│   │   └── logout/route.ts      # Sign out → redirects to /
│   ├── checkout/
│   │   ├── success/page.tsx     # Post-payment confirmation → polls then redirects to dashboard
│   │   └── cancel/page.tsx      # Payment cancelled → retry or sign out
│   ├── dashboard/
│   │   ├── layout.tsx           # Dashboard shell (server), auth + checkout redirect logic
│   │   ├── page.tsx             # Instance status + Launch button + quick start guide
│   │   ├── billing/page.tsx     # Stripe portal (subscription management only)
│   │   └── support/page.tsx     # Support contact page (email link)
│   └── api/
│       ├── webhooks/stripe/route.ts     # Stripe webhook (creates tenant, handles cancellation)
│       ├── instance/
│       │   ├── channels/telegram/route.ts  # GET/POST/DELETE: Telegram bot integration
│       │   ├── provision/route.ts       # POST: User-triggered Fly.io provisioning
│       │   ├── status/route.ts          # GET: Live machine status from Fly
│       │   ├── start/route.ts           # POST: Start stopped machine (re-enables autostart)
│       │   ├── stop/route.ts            # POST: Stop running machine (disables autostart)
│       │   ├── restart/route.ts         # POST: Restart Fly machine
│       │   └── destroy/route.ts         # POST: Destroy machine (cancelled only)
│       └── billing/
│           ├── checkout/route.ts        # Create Stripe Checkout session
│           └── portal/route.ts          # Create Stripe Portal session
├── components/
│   ├── landing/
│   │   └── landing-page.tsx     # Full marketing landing page (ported from AGnTK/website)
│   ├── dashboard/
│   │   ├── dashboard-shell.tsx  # Client wrapper: sidebar state + responsive layout (100dvh)
│   │   ├── sidebar.tsx          # Nav sidebar (slide-out drawer on mobile, static on md+)
│   │   ├── header.tsx           # Top bar with hamburger toggle (mobile) + email + logout
│   │   └── instance-status.tsx  # Instance status card + Launch button + plan selector
│   └── ui/                      # shadcn/ui components (button, card, badge, input)
├── lib/
│   ├── db.ts                    # Drizzle client
│   ├── schema.ts                # Drizzle schema (tenants, billing_events)
│   ├── fly.ts                   # Fly.io Machines API client
│   ├── stripe.ts                # Stripe helpers
│   ├── supabase-server.ts       # Supabase server client
│   ├── supabase-client.ts       # Supabase browser client
│   └── utils.ts                 # cn() utility
├── proxy.ts                     # Auth proxy (protects /dashboard/*, /checkout/*)
public/
├── logos/                       # Company + model + platform logos (SVG/WebP)
├── profiles/                    # Testimonial avatar images (WebP)
└── favicon.svg                  # Crab favicon
```

---

## Architecture & Key Patterns

### Auth Flow
1. Root `/` shows landing page (unauthed) or redirects to `/dashboard` (authed)
2. "Get Started" buttons trigger Google OAuth via Supabase `signInWithOAuth`
3. Middleware (`proxy.ts`) protects `/dashboard/*` and `/checkout/*` routes
4. OAuth callback exchanges code for session, checks for existing tenant
5. Session stored in cookies via `@supabase/ssr`
6. **No `/auth/login` page** — all auth flows go through landing page at `/`

### Billing Flow
1. New user → Landing page → "Get Started" → Google OAuth
2. OAuth callback → no tenant found → redirect to Stripe Checkout
3. Payment succeeds → Stripe webhook `checkout.session.completed` → creates tenant with status `"paid"`
4. User redirected to `/checkout/success` → polls for tenant → auto-redirects to `/dashboard`
5. Cancellation → Stripe webhook → stop machine → mark cancelled

### Provisioning Flow (User-Triggered from Dashboard)
1. User sees "Launch Your OpenClaw" button on dashboard (status: `"paid"`)
2. Click → `POST /api/instance/provision`
3. Generate unique app name: `oc-{random-hex}`
4. Generate `OPENCLAW_GATEWAY_TOKEN` (32-byte hex)
5. Create Fly app via Machines API
6. Allocate shared IPv4 + IPv6 via Fly GraphQL API (required for `*.fly.dev` DNS)
7. Create 1GB persistent volume (mounted at `/home/node/.openclaw`)
8. Create machine with Docker image (2048MB RAM, `node -e` CMD writes config + spawns gateway)
9. Store fly_machine_id + instance_url in DB immediately (before wait steps)
10. Wait for machine to reach `started` state + HTTP service to respond (`status < 500`)
11. Update tenant status to `"active"`
12. Return `gatewayToken` in response → client auto-opens instance in new tab
13. On failure: revert to `"paid"` so user can retry

### Tenant Status Lifecycle
| Status | Meaning |
|--------|---------|
| `paid` | Payment confirmed, instance not yet launched |
| `provisioning` | Fly.io instance being created |
| `active` | Instance running |
| `suspended` | Payment failed |
| `cancelled` | Subscription cancelled |

### OpenClaw Integration
- **Docker image**: `ghcr.io/openclaw/openclaw:latest` (official GHCR image)
- **Port**: 18789 (OpenClaw Gateway — serves web dashboard + WebSocket + API)
- **Auth**: Token-based via `openclaw.json` config (`auth.mode: "token"`, `allowInsecureAuth: true`)
- **Dashboard URL**: `{instanceUrl}?token={gatewayToken}` — token passed as URL param
- **Bind mode**: `--bind lan` CLI flag (0.0.0.0) — required for Fly.io proxy to reach the gateway
- **User**: Runs as `node` (not root) — `HOME=/home/node`
- **Memory**: Gateway needs ~800MB RSS at startup; minimum 2048MB VM with `--max-old-space-size=1536`
- **State**: Stored at `/home/node/.openclaw` on persistent Fly volume (config, sessions, memory)
- **Config injection**: `OPENCLAW_CONFIG_JSON` env var → written to `openclaw.json` at boot via `node -e` wrapper
- **CMD pattern**: Must use `node` as argv[0] (not `sh`) — `docker-entrypoint.sh` expects it for correct setup
- **Channels**: 13+ supported (Telegram, Discord, Slack, WhatsApp, Signal, etc.)
- **Default model**: Kimi K2.5 Nitro via OpenRouter (`openrouter/moonshotai/kimi-k2.5:nitro`) — set via `agents.defaults.model` in `openclaw.json`, not via env var (OpenClaw ignores model env vars)
- **We don't touch OpenClaw internals** — all AI/channel/agent config is user-managed (users can add their own API keys for premium models via the OpenClaw dashboard)

### Database
- **tenants**: One row per paying customer. Stores Supabase user ID, Stripe IDs, Fly.io IDs, plan, status, gateway_token.
- **billing_events**: Idempotent Stripe webhook log. Prevents duplicate processing.

### Key Conventions
- All dashboard components use `"use client"` directive
- Server components used for layouts and data fetching
- API routes handle auth via `getUser()` from supabase-server.ts
- Fly.io API token stored in `FLY_API_TOKEN` env var
- Stripe webhook uses raw body + signature verification
- Tenant app names follow pattern: `oc-{12-char-hex}`
- Landing page uses inline CSS (scoped under `.landing-page`) — not Tailwind
- Checkout success/cancel pages use inline styles matching landing page theme
- All auth redirects point to `/` (not `/auth/login` — that page was removed)

### Responsive Design Conventions
- **Mobile-first**: Tailwind breakpoints `sm:` (640px), `md:` (768px) for progressive enhancement
- **Dashboard sidebar**: Managed by `DashboardShell` (client component). Drawer on mobile (<md), static on desktop
- **Layout height**: Uses `h-[100dvh]` (dynamic viewport height) for proper mobile browser chrome handling
- **Viewport**: `viewportFit: "cover"` + `env(safe-area-inset-*)` padding on body for iOS notch
- **Buttons**: Full-width on mobile (`w-full sm:w-auto`) for primary actions
- **Landing page mobile nav**: Hamburger toggle at <768px, dropdown panel with state in `LandingPage` component
- **Tap targets**: Minimum 44px for primary actions (buttons, links). Use `min-height: 44px` or adequate padding
- **Long text**: Use `truncate` + `min-w-0` for emails, URLs, IDs. Max-width constraints on small screens
- **Responsive padding**: `clamp()` for inline-styled pages, `p-4 md:p-6` for Tailwind layouts
- **QA checklist**: See `ResponsiveQA.md` — run through before every deploy

---

## Environment Variables

See `.env.example` for all required variables. Key groups:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase Auth
- `DATABASE_URL` — Supabase PostgreSQL
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*` — Stripe
- `FLY_API_TOKEN`, `FLY_ORG` — Fly.io
- `OPENCLAW_DOCKER_IMAGE` — Docker image (default: `ghcr.io/openclaw/openclaw:latest`)
- `OPENCLAW_DEFAULT_ANTHROPIC_KEY`, `OPENCLAW_DEFAULT_OPENAI_KEY`, `OPENCLAW_DEFAULT_OPENROUTER_KEY` — Optional pre-configured AI keys for tenant instances
- `OPENCLAW_DEFAULT_MODEL` — Default model for new instances, set in `openclaw.json` `agents.defaults.model` (default: `openrouter/moonshotai/kimi-k2.5:nitro`)
- `NEXT_PUBLIC_APP_URL` — Base URL for redirects

---

## Known Issues & Fixes

### Fly.io Machines API Does Not Allocate IPs
The Machines REST API (`api.machines.dev`) does not allocate IP addresses. Without IPs, `*.fly.dev` DNS returns NXDOMAIN. Must call `allocateIpAddresses()` via the Fly GraphQL API (`api.fly.io/graphql`) after `createApp()`. Both shared IPv4 and IPv6 are allocated.

### Machine Creation != Machine Ready
`createMachine()` returns as soon as Fly acknowledges the request. The machine still needs to pull the Docker image, boot, and start OpenClaw. Always call `waitForMachineReady()` + `waitForServiceReady()` before marking a tenant as `active`.

### OpenClaw Container Runs as `node` User (Not Root)
The OpenClaw Docker image runs as uid 1000 (`node`). Volume must mount at `/home/node/.openclaw`, not `/root/.openclaw`. Set `HOME=/home/node` and `--bind lan` so Fly's proxy can reach port 18789.

### CMD Must Start With `node` (Not `sh`)
The OpenClaw `docker-entrypoint.sh` expects `node` as the first CMD argument. Using `sh -c "..."` as CMD causes the entrypoint to skip setup (workdir, user context, etc.), resulting in the gateway silently failing to start with no logs. Use `node -e "..."` instead when a wrapper script is needed.

### OpenClaw Gateway Requires ~800MB RSS
The gateway needs significant memory at startup. With 1024MB VM + 768MB heap, the gateway GC-thrashes and never binds to port 18789. Minimum: 2048MB VM + 1536MB Node.js heap (`NODE_OPTIONS=--max-old-space-size=1536`).

### Config File vs Volume Mount Conflict
Fly's `files` config writes files before volume mounts. If the file path is inside the volume mount point, the volume mount overwrites it. Solution: pass config as env var (`OPENCLAW_CONFIG_JSON`) and write it to disk at boot via `node -e` wrapper (after volume is mounted).

### Telegram: Use Env Var, Not `openclaw.json` Channels Section
OpenClaw natively reads `TELEGRAM_BOT_TOKEN` from env vars. Do NOT inject full channel config (tokens, connection details) into `openclaw.json` — doing so overrides OpenClaw's default channel UI and causes "Unsupported schema node" warnings. Set `TELEGRAM_BOT_TOKEN` as a machine env var via `updateMachineEnvVars()` and let OpenClaw handle channel setup with its own defaults.

### Channel Config Schemas Require `{ enabled: true }` Flags
OpenClaw's dashboard shows "Channel config schema unavailable" unless `openclaw.json` includes a `channels` block with `{ enabled: true }` for each channel. This is distinct from injecting full channel config (tokens, etc.) — only the `enabled` flag is needed to make OpenClaw render the config UI. The `channels` block in `createMachine()` sets all supported channels to `{ enabled: true }`.

### Fly `autostop: "suspend"` for Fast Resume
Machines use `autostop: "suspend"` (not `"stop"`) so the VM suspends to memory instead of fully shutting down. Resume from suspend takes ~1-3s vs ~10-30s for cold boot. Suspended machines still incur memory billing at a reduced rate.

### Fly Machines `POST /machines/{id}` Restarts the Machine
When you POST a config update via the Fly Machines API, Fly stops and restarts the machine with the new config. Do NOT follow up with a separate `stopMachine`/`startMachine` — those functions call `setAutostart` which does its own read-modify-write of the machine config, creating a race condition that can overwrite your env var changes.

### Fly 409/412 "Insufficient Resources" — Region Fallback
Fly returns `409` (insufficient memory) or `412` (insufficient volume capacity) when a region is out of resources. The provision route now tries multiple regions in order: `iad` → `ord` → `ewr` → `sjc`. On capacity errors, it deletes the failed volume and retries in the next region. Non-capacity errors (auth, config) break immediately. The app + IPs are created once (region-agnostic); only volumes + machines are region-specific.

### OpenClaw Control UI Requires Origin Fallback on Non-Localhost
The latest OpenClaw Docker image requires `gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback: true` in `openclaw.json` for non-loopback access. Without it, the gateway crashes with: "non-loopback Control UI requires gateway.controlUi.allowedOrigins". This is in addition to `allowInsecureAuth: true`.

### OpenClaw googlechat Plugin Missing Dependency
The `ghcr.io/openclaw/openclaw:latest` Docker image is missing `google-auth-library`. Enabling `googlechat` in the `channels` config causes a crash-loop. Exclude `googlechat` from the channels block until the upstream image is fixed.

### OpenClaw iMessage Plugin Crashes on Linux
The `imessage` channel requires the `imsg` binary (macOS-only). On Linux Docker containers, it crash-loops with "imsg rpc not ready". Exclude `imessage` from the channels block for Fly.io deployments.

### OpenClaw Telegram `dmPolicy: "open"` Requires `allowFrom: ["*"]`
Setting `dmPolicy: "open"` without `allowFrom: ["*"]` crashes the gateway at startup with a config validation error. The default `dmPolicy` is `"pairing"` which silently drops messages from non-paired users — set `dmPolicy: "open"` + `allowFrom: ["*"]` for SaaS deployments where any Telegram user should be able to message the bot.

### OpenClaw WebSocket "Pairing Required" — Disable Device Auth for Docker/Proxy
OpenClaw's device pairing system rejects WebSocket connections from non-localhost IPs (code 1008: "pairing required"). `allowInsecureAuth: true` only relaxes HTTPS requirements — it does NOT bypass device identity checks. For Docker/containerized deployments behind a proxy (Fly.io, Railway, etc.), you must set `controlUi.dangerouslyDisableDeviceAuth: true` in `openclaw.json`. The full `controlUi` config needed: `{ enabled: true, allowInsecureAuth: true, dangerouslyAllowHostHeaderOriginFallback: true, dangerouslyDisableDeviceAuth: true }`. Token auth (`auth.mode: "token"`) + `trustedProxies` are still required.

### OpenClaw Model Config Must Be in `openclaw.json`, Not Env Vars
`OPENCLAW_DEFAULT_MODEL` and `OPENCLAW_PRIMARY_MODEL` are not valid OpenClaw env vars. The default model must be set in `openclaw.json` under `agents.defaults.model.primary`. API keys (`OPENROUTER_API_KEY`, `ANTHROPIC_API_KEY`, etc.) *are* read from env vars.

### Fly `autostart` Conflicts With Manual Stop
Fly services with `autostart: true` auto-start the machine on any incoming HTTP request. Manual stop via API appears to do nothing because the next request (dashboard polling, browser tab) triggers autostart. Fix: `stopMachine()` disables `autostart` in the machine's service config before stopping; `startMachine()` re-enables it.

### Redirect Loop When Stripe Checkout Fails (New Users)
When `createCheckoutSession` throws (e.g., wrong price ID, bad API key), the auth callback and dashboard layout previously redirected to `/` or `/dashboard` with error params. Since the root page unconditionally redirects authed users to `/dashboard`, and the dashboard layout redirects users without tenants back, this created an infinite redirect loop (ERR_TOO_MANY_REDIRECTS). Fix: All checkout failure fallbacks now redirect to `/checkout/cancel` (which has retry + sign out buttons and no server-side redirects). The root page also skips the `/dashboard` redirect when an `?error` query param is present.

### Vercel Env Vars Can Have Trailing Newlines
When pasting env var values in the Vercel Dashboard, trailing `\n` characters can be included invisibly. This corrupts API keys and IDs — Stripe returns "connection error" for bad keys, "No such price" for bad price IDs. Fix: `src/lib/stripe.ts` now `.trim()`s all env var values via a helper function. **Always trim env vars at the point of use when calling external APIs.**

### Stripe Test vs Live Mode Mismatch
Stripe price IDs are mode-specific. A price ID from live mode (`price_...`) will NOT work with a test secret key (`sk_test_...`), and vice versa. Error: "No such price: '...'; a similar object exists in live mode, but a test mode key was used". Both `STRIPE_SECRET_KEY` and `STRIPE_PRICE_*` must be from the same Stripe mode.

### Stripe Webhook Secret: Local vs Production
`stripe listen` generates a temporary webhook signing secret that only works locally. For production (Vercel), you must create a webhook endpoint in the Stripe Dashboard (Developers → Webhooks) pointing to `{PRODUCTION_URL}/api/webhooks/stripe` and use THAT endpoint's signing secret as `STRIPE_WEBHOOK_SECRET`.

### Duplicate Tenant Rows Break `findFirst` Queries
Multiple Stripe payments (e.g., testing, retries) can create duplicate tenant rows for the same `userId`. Since `findFirst` with no ordering is non-deterministic, the wrong row (no gateway token, no fly app) can be returned — causing "pairing required" errors, missing instance data, etc. **All `findFirst` queries on `tenants` must include `orderBy: [desc(tenants.updatedAt)]`** to return the most recent/active row.

### Vercel Serverless Function Timeout Kills Long Operations
Vercel Hobby plan has a 10s function timeout (Pro: 60s, even with `maxDuration`). Any API route that does blocking I/O (polling loops, waiting for external services) will be killed mid-execution. The `catch` block may or may not run, leading to orphaned resources. **Pattern: return immediately from the API route, then let the client poll a status endpoint.** The provision route follows this pattern — it creates Fly resources and returns `"provisioning"`, then the status route auto-promotes to `"active"` when the service is reachable.

### Provisioning is Async (Provision Route + Status Route)
The provision route (`POST /api/instance/provision`) creates the Fly app/IPs/volume/machine and returns immediately with `status: "provisioning"`. It does NOT wait for the machine to boot or the service to respond. The status route (`GET /api/instance/status`) checks if the tenant is `"provisioning"` + machine is `"started"` + HTTP service responds `< 500`, then auto-promotes to `"active"`. The client polls status every 10s and auto-opens the dashboard on transition. **Never add blocking waits back to the provision route** — Vercel will kill it.

### Vercel Deploys: Push to Branch ≠ Production Deploy
Pushing to `aryav` creates a **Preview** deployment on Vercel, not Production. The production domain (`tryopenclaw.vercel.app`) only updates from Production deploys. Use `vercel --prod` to force a production deployment, or configure the branch as the production branch in Vercel Dashboard → Settings → Git.
