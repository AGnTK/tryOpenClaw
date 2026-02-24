# Testing Checklist

## Critical Flow Tests

Run these tests after ANY change to auth, billing, or deployment configuration.

### 1. OAuth Flow Test
```bash
# Test OAuth redirect URL is correct
curl -sI "https://openclaw-saas-theta.vercel.app/api/auth/google" | grep -E "(location|HTTP)"

# Expected: 307 redirect to Supabase with correct callback URL
# redirect_to should contain: openclaw-saas-theta.vercel.app/auth/callback
```

### 2. Supabase Configuration Test
```bash
# Verify Supabase auth config
curl -s "https://api.supabase.com/v1/projects/PROJECT_REF/config/auth" \
  -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" | \
  python3 -c "import sys,json; d=json.load(sys.stdin); print('site_url:', d.get('site_url')); print('uri_allow_list:', d.get('uri_allow_list'))"

# Expected:
# site_url: https://openclaw-saas-theta.vercel.app
# uri_allow_list: https://openclaw-saas-theta.vercel.app/**,...
```

### 3. Stripe Integration Test
```bash
# Test Stripe price is valid
curl -s https://api.stripe.com/v1/prices/$STRIPE_PRICE_STARTER \
  -u "$STRIPE_SECRET_KEY:" | grep -E '"active"|"error"'

# Expected: "active": true
```

### 4. Environment Variables Test
```bash
# Verify critical env vars are set correctly
vercel env pull .env.test --environment production --yes
grep -E "(APP_URL|STRIPE|SUPABASE)" .env.test
rm .env.test

# Check for:
# - NEXT_PUBLIC_APP_URL = https://openclaw-saas-theta.vercel.app (no newline!)
# - STRIPE_SECRET_KEY = sk_test_... or sk_live_...
# - STRIPE_PRICE_STARTER = price_...
# - NEXT_PUBLIC_SUPABASE_URL = https://....supabase.co
```

### 5. Database Connection Test
```bash
node -e "
const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });
const client = postgres(process.env.DATABASE_URL);
client\`SELECT 1\`.then(() => { console.log('DB OK'); client.end(); });
"
```

### 6. End-to-End Flow Test (Manual)

1. **Website loads**: Go to https://tryopenclawai.com - should show landing page
2. **OAuth starts**: Click "Get Started" - should redirect to Google account picker
3. **OAuth callback**: After Google sign-in - should NOT show intermediate page
4. **Stripe checkout**: New users should see Stripe checkout page
5. **Dashboard access**: After payment - should see dashboard with instance status
6. **Setup modal**: "Setup OpenClaw" button should open modal with channels/FAQ

## Common Issues & Fixes

| Issue | Cause | Fix |
|-------|-------|-----|
| 404 on website | Wrong Vercel project deployed | Deploy from correct directory |
| OAuth redirects to website | Supabase `site_url` wrong | Update via Management API |
| Stripe checkout fails | `NEXT_PUBLIC_APP_URL` has newline | Re-add env var with `printf` |
| Callback goes to wrong URL | `uri_allow_list` missing app URL | Update Supabase redirect URLs |

## Pre-Deployment Checklist

- [ ] Local build passes: `npm run build`
- [ ] Database connection works
- [ ] Stripe price is active
- [ ] Supabase redirect URLs include deployment URL
- [ ] `NEXT_PUBLIC_APP_URL` matches actual deployment URL
- [ ] Test OAuth flow end-to-end after deployment
