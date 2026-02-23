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
| Deployment | Vercel (planned) |
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
│   ├── layout.tsx               # Root layout, fonts, metadata
│   ├── page.tsx                 # Root redirect (→ /dashboard or /auth/login)
│   ├── auth/
│   │   ├── login/page.tsx       # Google sign-in page (Supabase Auth)
│   │   ├── callback/route.ts    # OAuth callback handler
│   │   └── logout/route.ts      # Sign out
│   ├── dashboard/
│   │   ├── layout.tsx           # Dashboard shell (sidebar + header)
│   │   ├── page.tsx             # Instance status + quick start guide
│   │   ├── billing/page.tsx     # Stripe portal + plan comparison
│   │   └── settings/page.tsx    # Account settings + danger zone
│   └── api/
│       ├── webhooks/stripe/route.ts     # Stripe webhook (provision/suspend)
│       ├── instance/
│       │   ├── provision/route.ts       # Get tenant instance info
│       │   ├── status/route.ts          # Live machine status from Fly
│       │   ├── restart/route.ts         # Restart Fly machine
│       │   └── destroy/route.ts         # Destroy machine (cancelled only)
│       └── billing/
│           ├── checkout/route.ts        # Create Stripe Checkout session
│           └── portal/route.ts          # Create Stripe Portal session
├── components/
│   ├── dashboard/
│   │   ├── sidebar.tsx          # Nav sidebar
│   │   ├── header.tsx           # Top bar with email + logout
│   │   └── instance-status.tsx  # Instance status card + plan selector
│   └── ui/                      # shadcn/ui components (button, card, badge, input)
├── lib/
│   ├── db.ts                    # Drizzle client
│   ├── schema.ts                # Drizzle schema (tenants, billing_events)
│   ├── fly.ts                   # Fly.io Machines API client
│   ├── stripe.ts                # Stripe helpers
│   ├── supabase-server.ts       # Supabase server client
│   ├── supabase-client.ts       # Supabase browser client
│   └── utils.ts                 # cn() utility
└── proxy.ts                    # Auth proxy (Next.js 16 convention, protects /dashboard/*)
```

---

## Architecture & Key Patterns

### Auth Flow
1. Root `/` redirects to `/dashboard` (authed) or `/auth/login` (unauthed)
2. Middleware protects all `/dashboard/*` routes
3. Google OAuth via Supabase Auth → callback exchanges code for session
4. Session stored in cookies via `@supabase/ssr`

### Billing Flow
1. New user → `/auth/login` → Google sign-in → `/dashboard`
2. Dashboard shows plan selector → POST `/api/billing/checkout` → Stripe Checkout
3. Payment succeeds → Stripe webhook `checkout.session.completed` → provision Fly machine
4. Cancellation → Stripe webhook → stop machine → mark cancelled

### Provisioning Flow (in Stripe webhook handler)
1. Generate unique app name: `oc-{random-hex}`
2. Generate `OPENCLAW_GATEWAY_TOKEN` (32-byte hex) per tenant for OpenClaw dashboard auth
3. Create Fly app via Machines API
4. Create 1GB persistent volume (mounted at `/root/.openclaw` — OpenClaw state dir)
5. Create machine with `ghcr.io/openclaw/openclaw:latest` Docker image
6. Pass env vars: `OPENCLAW_GATEWAY_TOKEN`, `OPENCLAW_STATE_DIR`, optional AI API keys
7. Store fly_app_name, fly_machine_id, instance_url, gateway_token in DB
8. Update tenant status to 'active'

### OpenClaw Integration
- **Docker image**: `ghcr.io/openclaw/openclaw:latest` (official GHCR image)
- **Port**: 18789 (OpenClaw Gateway — serves web dashboard + WebSocket + API)
- **Auth**: `OPENCLAW_GATEWAY_TOKEN` env var — dashboard accessed via `?token=<token>` URL param
- **State**: Stored at `/root/.openclaw` on persistent Fly volume (config, sessions, memory)
- **Config**: `openclaw.json` + env vars — users configure through built-in web dashboard
- **Channels**: 13+ supported (Telegram, Discord, Slack, WhatsApp, Signal, etc.)
- **We don't touch OpenClaw internals** — all AI/channel/agent config is user-managed

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

---

## Environment Variables

See `.env.example` for all required variables. Key groups:
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase Auth
- `DATABASE_URL` — Supabase PostgreSQL
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*` — Stripe
- `FLY_API_TOKEN`, `FLY_ORG` — Fly.io
- `OPENCLAW_DOCKER_IMAGE` — Docker image (default: `ghcr.io/openclaw/openclaw:latest`)
- `OPENCLAW_DEFAULT_ANTHROPIC_KEY`, `OPENCLAW_DEFAULT_OPENAI_KEY` — Optional pre-configured AI keys for tenant instances
- `NEXT_PUBLIC_APP_URL` — Base URL for redirects

---

## Known Issues & Fixes

_None yet._
