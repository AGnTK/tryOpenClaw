# TODO.md

## Planned Features

### Phase 2: Dashboard & Polish
- [x] Error handling for failed provisions (retry mechanism) — reverts to "paid" on failure, waits for machine+service readiness before marking active
- [x] Full responsive overhaul — mobile-first layout, sidebar drawer, hamburger menu, safe-area support, `ResponsiveQA.md` test checklist
- [ ] Health check worker (Vercel cron job to check machine status)
- [ ] Email notifications (welcome, provisioning complete, payment failed)
- [x] Onboarding guide improvements — added Integrations, Inspiration, and FAQ sections to dashboard
- [ ] Instance log viewer (link to Fly.io log viewer)
- [ ] Dashboard redesign to match landing page visual theme

### Phase 3: Growth
- [ ] Custom domains (tenant maps their domain to Fly instance)
- [ ] Usage analytics (poll OpenClaw for conversation stats)
- [ ] Pre-configured templates (different SOUL.md / AGENTS.md on provision)
- [ ] Referral system
- [ ] Team/org support (multiple users per tenant)
- [ ] Admin dashboard (internal: view all tenants, usage, revenue)

## Tech Debt

- [x] Add test framework — Playwright E2E for auth flow regression tests
- [ ] Expand E2E tests: billing flow, provisioning, API route unit tests
- [ ] Add rate limiting to API routes
- [ ] Add proper error boundary components
- [ ] Consider adding Sentry or similar for error tracking
- [ ] Landing page uses inline CSS — consider migrating to Tailwind for consistency
- [ ] Checkout success/cancel pages use inline styles — consider extracting shared theme
- [ ] Add `.trim()` to env var usage in `fly.ts` and other libs (currently only `stripe.ts` trims)
- [ ] `src/proxy.ts` is dead code — not imported anywhere, not used as middleware. Remove or wire up as actual Next.js middleware

## Blockers

_None._
