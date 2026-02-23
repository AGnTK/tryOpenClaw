# TODO.md

## Planned Features

### Phase 2: Dashboard & Polish
- [ ] Error handling for failed provisions (retry mechanism)
- [ ] Health check worker (Vercel cron job to check machine status)
- [ ] Email notifications (welcome, provisioning complete, payment failed)
- [ ] Onboarding guide improvements (step-by-step with progress tracking)
- [ ] Instance log viewer (link to Fly.io log viewer)

### Phase 3: Growth
- [ ] Custom domains (tenant maps their domain to Fly instance)
- [ ] Usage analytics (poll OpenClaw for conversation stats)
- [ ] Pre-configured templates (different SOUL.md / AGENTS.md on provision)
- [ ] Referral system
- [ ] Team/org support (multiple users per tenant)
- [ ] Admin dashboard (internal: view all tenants, usage, revenue)

## Tech Debt

- [ ] Add test framework (Vitest or Jest) and write tests for API routes
- [ ] Add rate limiting to API routes
- [ ] Add proper error boundary components
- [ ] Consider adding Sentry or similar for error tracking
- [ ] Stripe webhook retry handling for failed provisioning

## Blockers

_None yet._
