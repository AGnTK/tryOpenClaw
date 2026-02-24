import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase-server";
import LandingPage from "@/components/landing/landing-page";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await getUser();
  const params = await searchParams;

  // Don't redirect to dashboard if there's an error — prevents redirect loop
  // when checkout creation fails for users without a tenant
  if (user && !params.error) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
