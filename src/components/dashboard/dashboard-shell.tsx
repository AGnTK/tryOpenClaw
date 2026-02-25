"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { DashboardHeader } from "./header";

export function DashboardShell({
  email,
  children,
}: {
  email: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-[100dvh]">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader
          email={email}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
