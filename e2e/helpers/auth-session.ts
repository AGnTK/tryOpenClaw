import type { BrowserContext } from "@playwright/test";
import type { Session } from "@supabase/supabase-js";

/**
 * Derive the Supabase cookie name from the project URL.
 * Format: sb-{project-ref}-auth-token
 */
function getCookieName(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  // Extract project ref from URL: https://<ref>.supabase.co
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  if (!match) throw new Error(`Cannot parse project ref from ${url}`);
  return `sb-${match[1]}-auth-token`;
}

/**
 * Encode a session payload the way @supabase/ssr does.
 * Returns base64url-encoded string with "base64-" prefix.
 */
function encodeSessionPayload(session: Session): string {
  const payload = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    expires_in: session.expires_in,
    token_type: session.token_type,
    type: "access",
    user: session.user,
  });

  // base64url encode
  const encoded = Buffer.from(payload)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `base64-${encoded}`;
}

// Max cookie size before chunking (~3500 to stay under 4096 limit with overhead)
const MAX_CHUNK_SIZE = 3500;

/**
 * Inject Supabase session cookies into a Playwright browser context.
 * Handles chunking for large payloads (`.0`, `.1` suffixes).
 */
export async function injectSession(
  context: BrowserContext,
  session: Session
): Promise<void> {
  const cookieName = getCookieName();
  const encoded = encodeSessionPayload(session);

  const baseURL = process.env.E2E_BASE_URL || "http://localhost:3000";
  const url = new URL(baseURL);
  const domain = url.hostname;
  const isSecure = url.protocol === "https:";

  if (encoded.length <= MAX_CHUNK_SIZE) {
    // Single cookie
    await context.addCookies([
      {
        name: cookieName,
        value: encoded,
        domain,
        path: "/",
        httpOnly: false,
        secure: isSecure,
        sameSite: "Lax",
      },
    ]);
  } else {
    // Chunked cookies
    const chunks: string[] = [];
    for (let i = 0; i < encoded.length; i += MAX_CHUNK_SIZE) {
      chunks.push(encoded.slice(i, i + MAX_CHUNK_SIZE));
    }

    const cookies = chunks.map((chunk, i) => ({
      name: `${cookieName}.${i}`,
      value: chunk,
      domain,
      path: "/",
      httpOnly: false,
      secure: isSecure,
      sameSite: "Lax" as const,
    }));

    await context.addCookies(cookies);
  }
}
