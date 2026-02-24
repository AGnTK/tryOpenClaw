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
