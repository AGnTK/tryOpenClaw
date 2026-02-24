import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase-server";
import LandingPage from "@/components/landing/landing-page";

export default async function Home() {
  const user = await getUser();

  if (user) {
    redirect("/dashboard");
  }

  return <LandingPage />;
}
