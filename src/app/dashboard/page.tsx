import { InstanceStatus } from "@/components/dashboard/instance-status";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage your OpenClaw AI assistant
        </p>
      </div>

      <InstanceStatus />
    </div>
  );
}
