"use client";

import { Button } from "@/components/ui/button";
import { LogOut, Menu } from "lucide-react";

export function DashboardHeader({
  email,
  onMenuToggle,
}: {
  email: string;
  onMenuToggle: () => void;
}) {
  async function handleLogout() {
    await fetch("/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <header className="flex h-14 items-center justify-between border-b bg-card px-4 md:px-6">
      <Button
        variant="ghost"
        size="icon"
        onClick={onMenuToggle}
        className="md:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="h-5 w-5" />
      </Button>
      <div className="hidden md:block" />
      <div className="flex items-center gap-2 md:gap-4">
        <span className="max-w-[150px] truncate text-sm text-muted-foreground sm:max-w-[200px] md:max-w-none">
          {email}
        </span>
        <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
