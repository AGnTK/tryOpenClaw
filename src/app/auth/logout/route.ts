import { createSupabaseServer } from "@/lib/supabase-server";
import { NextResponse, type NextRequest } from "next/server";

async function handleLogout(request: NextRequest) {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();

  return NextResponse.redirect(new URL("/auth/login", request.url));
}

export const GET = handleLogout;
export const POST = handleLogout;
