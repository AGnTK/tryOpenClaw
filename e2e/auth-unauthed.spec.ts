import { test, expect } from "@playwright/test";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;

test.describe("Auth Flow — Unauthenticated (Tier 1)", () => {
  test("AUTH-01: 'Get Started' redirects to Supabase OAuth with provider=google", async ({
    page,
  }) => {
    await page.goto("/");

    // Wait for landing page to render
    await page.waitForSelector(".landing-page .btn-primary");

    // Click the first "Get Started" button and capture the navigation
    const [request] = await Promise.all([
      page.waitForRequest(
        (req) => req.url().includes("supabase.co/auth/v1/authorize"),
        { timeout: 5000 }
      ),
      page.locator(".landing-page .btn-primary").first().click(),
    ]);

    const url = new URL(request.url());
    expect(url.pathname).toBe("/auth/v1/authorize");
    expect(url.searchParams.get("provider")).toBe("google");
  });

  test("AUTH-02: Supabase Auth health endpoint returns 200 + GoTrue", async ({
    request,
  }) => {
    const res = await request.get(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
    });
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("name", "GoTrue");
  });

  test("AUTH-07: /dashboard unauthenticated redirects to /", async ({
    page,
  }) => {
    const response = await page.goto("/dashboard");

    // Server-side redirect: getUser() returns null → redirect("/")
    // Playwright follows redirects, so we should end up at /
    expect(page.url()).toMatch(/\/$/);

    // Verify landing page is shown (not a blank page or error)
    await expect(page.locator(".landing-page")).toBeVisible({ timeout: 5000 });
  });

  test("AUTH-07b: /checkout/success unauthenticated is accessible (client component, no server auth gate)", async ({
    page,
  }) => {
    // Note: /checkout/success is a "use client" component with no server-side
    // auth check. It renders for unauthenticated users but the API poll fails.
    // This test documents the actual behavior — not a redirect.
    // If middleware is added later, update this test to expect a redirect to /.
    const response = await page.goto("/checkout/success");
    expect(response?.status()).toBeLessThan(500);
  });

  test("AUTH-10: Supabase health + REST API respond < 500", async ({
    request,
  }) => {
    // Health endpoint
    const health = await request.get(`${supabaseUrl}/auth/v1/health`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
    });
    expect(health.status()).toBeLessThan(500);

    // REST API endpoint (returns 401 without auth, but not 5xx)
    const rest = await request.get(`${supabaseUrl}/rest/v1/`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! },
    });
    expect(rest.status()).toBeLessThan(500);
  });
});
