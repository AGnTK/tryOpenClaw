import { test, expect } from "@playwright/test";
import { createTestUser, deleteTestUser } from "./helpers/supabase-admin";
import { injectSession } from "./helpers/auth-session";
import type { Session } from "@supabase/supabase-js";

let userId: string;
let session: Session;

// Run serially in one worker — beforeAll creates user once, all tests share it.
test.describe.configure({ mode: "serial" });

test.describe("Auth Flow — Authenticated (Tier 2)", () => {
  test.beforeAll(async () => {
    const testUser = await createTestUser();
    userId = testUser.userId;
    session = testUser.session;
  });

  test.afterAll(async () => {
    if (userId) await deleteTestUser(userId);
  });

  test("AUTH-03: Authed user on / is redirected away from landing page", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await injectSession(context, session);
    const page = await context.newPage();

    await page.goto("/");

    // Authed user with no tenant → redirected to /dashboard → then to Stripe checkout
    // or /checkout/cancel. The key assertion: NOT still on landing page.
    await page.waitForURL((url) => url.pathname !== "/", { timeout: 10000 });
    expect(page.url()).not.toMatch(/\/$/);

    await context.close();
  });

  test("AUTH-06: Page refresh preserves auth session", async ({ browser }) => {
    const context = await browser.newContext();
    await injectSession(context, session);
    const page = await context.newPage();

    // First load — should redirect away from / (authed)
    await page.goto("/");
    await page.waitForURL((url) => url.pathname !== "/", { timeout: 10000 });

    // Reload — session should still be valid
    await page.reload();
    await page.waitForLoadState("domcontentloaded");

    // Should NOT have been bounced back to landing page
    const currentUrl = page.url();
    expect(currentUrl).not.toMatch(/^https?:\/\/[^/]+\/$/);

    await context.close();
  });

  test("AUTH-08: /auth/logout clears session and returns to landing page", async ({
    browser,
  }) => {
    const context = await browser.newContext();
    await injectSession(context, session);
    const page = await context.newPage();

    // Hit logout endpoint
    await page.goto("/auth/logout");

    // Should redirect to / (landing page)
    await page.waitForURL((url) => url.pathname === "/", { timeout: 10000 });

    // Verify landing page is shown (session cleared, not redirected to dashboard)
    await expect(page.locator(".landing-page")).toBeVisible({ timeout: 5000 });

    // Verify session is gone: visiting /dashboard should redirect back to /
    await page.goto("/dashboard");
    await page.waitForURL((url) => url.pathname === "/", { timeout: 10000 });

    await context.close();
  });
});
