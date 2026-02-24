---
title: Direct Google OAuth Flow (Skip Intermediate Login Page)
slug: direct-google-oauth-flow
problem_type: integration
components:
  - Next.js API routes
  - Supabase Auth
  - Website HTML
  - Vercel deployment
symptoms:
  - "Get Started" button shows intermediate login page
  - Extra click required before Google account picker
date_solved: 2026-02-24
severity: medium
tags:
  - oauth
  - supabase
  - google-auth
  - ux
---

# Direct Google OAuth Flow

## Problem

The "Get Started" button on the marketing website (`tryopenclawai.com`) was directing users to `/auth/login` which showed an intermediate page with a "Continue with Google" button. Users had to click twice to start the OAuth flow.

**Desired behavior**: Clicking "Get Started" should immediately open Google's account picker.

## Root Cause

The existing `/auth/login` page was a client-side React component that rendered a button. When clicked, it called `supabase.auth.signInWithOAuth()` which then redirected to Google. This required:
1. Page load
2. Button click
3. OAuth redirect

## Solution

Created a server-side API route that immediately redirects to Google OAuth.

### Code Changes

**New file: `src/app/api/auth/google/route.ts`**

```typescript
import { createSupabaseServer } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const redirect = searchParams.get("redirect") || "/dashboard";

  const supabase = await createSupabaseServer();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${request.nextUrl.origin}/auth/callback?redirect=${encodeURIComponent(redirect)}`,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(new URL("/auth/login?error=oauth_failed", request.url));
  }

  return NextResponse.redirect(data.url);
}
```

**Website HTML update:**

```html
<!-- Before -->
<a href="#" class="btn btn-primary">Get Started</a>

<!-- After -->
<a href="https://openclaw-saas-theta.vercel.app/api/auth/google" class="btn btn-primary">Get Started</a>
```

## Configuration Required

### 1. Supabase Redirect URLs

Add allowed redirect URLs via Supabase Management API:

```bash
curl -X PATCH "https://api.supabase.com/v1/projects/YOUR_PROJECT_REF/config/auth" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"uri_allow_list": "https://your-app.vercel.app/**,https://your-domain.com/**"}'
```

Or via dashboard: Authentication → URL Configuration → Redirect URLs

### 2. Supabase Site URL

Update site_url to match your deployment:

```bash
curl -X PATCH "https://api.supabase.com/v1/projects/YOUR_PROJECT_REF/config/auth" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"site_url": "https://your-app.vercel.app"}'
```

### 3. Stripe Webhook (if applicable)

```bash
stripe webhook_endpoints create \
  --url "https://your-app.vercel.app/api/webhooks/stripe" \
  -d "enabled_events[]=checkout.session.completed" \
  -d "enabled_events[]=customer.subscription.deleted" \
  -d "enabled_events[]=customer.subscription.updated" \
  -d "enabled_events[]=invoice.payment_failed"
```

### 4. Vercel Environment Variables

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add NEXT_PUBLIC_APP_URL production
# ... etc
```

## Flow Comparison

### Before (2 clicks)
1. User clicks "Get Started"
2. Page loads `/auth/login`
3. User clicks "Continue with Google"
4. Google OAuth flow starts

### After (1 click)
1. User clicks "Get Started"
2. Server redirects to Google OAuth
3. Google account picker appears

## Staging vs Production

| Environment | App URL | Website URL |
|-------------|---------|-------------|
| Staging | `openclaw-saas-theta.vercel.app` | `tryopenclawai.com` |
| Production | `tryopenclawai.com` | `tryopenclawai.com` |

When promoting to production:
1. Update website hrefs to production URL
2. Update Supabase `site_url` and `uri_allow_list`
3. Create production Stripe webhook with live keys
4. Update Google OAuth authorized redirect URIs

## Prevention Checklist

- [ ] Always create server-side OAuth routes for direct redirects
- [ ] Configure Supabase redirect URLs before testing
- [ ] Set correct `site_url` in Supabase for the deployment environment
- [ ] Use stable Vercel URLs (e.g., `project-name.vercel.app`) not deployment-specific URLs
- [ ] Test OAuth flow end-to-end after deployment
