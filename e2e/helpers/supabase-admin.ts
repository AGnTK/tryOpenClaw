import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Lazy-init: only created when Tier 2 tests actually call createTestUser/deleteTestUser.
// This prevents Tier 1 tests from crashing when SUPABASE_SERVICE_ROLE_KEY is missing.
let _admin: SupabaseClient | null = null;

function getAdmin(): SupabaseClient {
  if (!_admin) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY is required for authenticated (Tier 2) tests. " +
          "Add it to .env.local or skip Tier 2 tests."
      );
    }
    _admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _admin;
}

const TEST_EMAIL = "e2e-test@openclaw-test.local";

/**
 * Create a test user via Admin API and obtain a session via generateLink + verifyOtp.
 * This works even when email/password logins are disabled (Google OAuth only).
 */
export async function createTestUser() {
  const admin = getAdmin();

  // Create user or find existing one
  let userId: string;
  const { data: createData, error: createError } =
    await admin.auth.admin.createUser({
      email: TEST_EMAIL,
      email_confirm: true,
    });

  if (createError) {
    if (createError.message.includes("already been registered")) {
      // User exists — find their ID
      const { data: listData } = await admin.auth.admin.listUsers();
      const existing = listData?.users?.find((u) => u.email === TEST_EMAIL);
      if (!existing) {
        throw new Error(
          "Test user exists but not found in listUsers. May need pagination."
        );
      }
      userId = existing.id;
    } else {
      throw new Error(`Failed to create test user: ${createError.message}`);
    }
  } else {
    userId = createData.user.id;
  }

  // Generate a magic link token via Admin API (doesn't send email, bypasses auth settings)
  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email: TEST_EMAIL,
    });

  if (linkError || !linkData.properties?.hashed_token) {
    throw new Error(
      `Failed to generate magic link: ${linkError?.message || "no token"}`
    );
  }

  // Exchange token for a real session via verifyOtp
  const anonClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: verifyData, error: verifyError } =
    await anonClient.auth.verifyOtp({
      token_hash: linkData.properties.hashed_token,
      type: "magiclink",
    });

  if (verifyError || !verifyData.session) {
    throw new Error(
      `Failed to verify OTP: ${verifyError?.message || "no session"}`
    );
  }

  return {
    userId,
    email: TEST_EMAIL,
    session: verifyData.session,
  };
}

/**
 * Delete the test user created for E2E tests.
 */
export async function deleteTestUser(userId: string) {
  const { error } = await getAdmin().auth.admin.deleteUser(userId);
  if (error) {
    console.warn(`Failed to delete test user ${userId}: ${error.message}`);
  }
}
