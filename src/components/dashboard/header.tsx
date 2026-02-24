"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function DashboardHeader({ email }: { email: string }) {
  async function handleLogout() {
    await fetch("/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-6">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">{email}</span>
        <Button variant="ghost" size="icon" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
