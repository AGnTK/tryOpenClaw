const FLY_API_URL = "https://api.machines.dev/v1";

function flyHeaders() {
  return {
    Authorization: `Bearer ${process.env.FLY_API_TOKEN!}`,
    "Content-Type": "application/json",
  };
}

async function flyFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${FLY_API_URL}${path}`, {
    ...options,
    headers: { ...flyHeaders(), ...options.headers },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Fly API error ${res.status}: ${body}`);
  }
  return res;
}

// Plan → machine size mapping
const PLAN_SIZES: Record<string, { cpus: number; memoryMb: number; cpuKind: string }> = {
  starter: { cpus: 1, memoryMb: 512, cpuKind: "shared" },
  pro: { cpus: 1, memoryMb: 1024, cpuKind: "shared" },
  enterprise: { cpus: 2, memoryMb: 2048, cpuKind: "shared" },
};

export async function createApp(appName: string): Promise<void> {
  await flyFetch("/apps", {
    method: "POST",
    body: JSON.stringify({ app_name: appName, org_slug: process.env.FLY_ORG || "personal" }),
  });
}

export async function createVolume(
  appName: string,
  region: string = "iad"
): Promise<string> {
  const res = await flyFetch(`/apps/${appName}/volumes`, {
    method: "POST",
    body: JSON.stringify({
      name: "oc_data",
      size_gb: 1,
      region,
    }),
  });
  const data = await res.json();
  return data.id;
}

export async function createMachine(
  appName: string,
  plan: string,
  volumeId: string,
  envVars: Record<string, string>,
  region: string = "iad"
): Promise<{ machineId: string; instanceUrl: string }> {
  const size = PLAN_SIZES[plan] || PLAN_SIZES.starter;
  const openClawImage = process.env.OPENCLAW_DOCKER_IMAGE || "ghcr.io/openclaw/openclaw:latest";

  const res = await flyFetch(`/apps/${appName}/machines`, {
    method: "POST",
    body: JSON.stringify({
      region,
      config: {
        image: openClawImage,
        guest: {
          cpus: size.cpus,
          memory_mb: size.memoryMb,
          cpu_kind: size.cpuKind,
        },
        env: envVars,
        services: [
          {
            ports: [
              { port: 443, handlers: ["tls", "http"] },
              { port: 80, handlers: ["http"] },
            ],
            protocol: "tcp",
            internal_port: 18789,
            autostop: "stop",
            autostart: true,
            min_machines_running: 0,
          },
        ],
        mounts: [
          {
            volume: volumeId,
            path: "/root/.openclaw",
          },
        ],
        auto_destroy: false,
      },
    }),
  });

  const data = await res.json();
  return {
    machineId: data.id,
    instanceUrl: `https://${appName}.fly.dev`,
  };
}

export async function getMachineStatus(
  appName: string,
  machineId: string
): Promise<{ state: string; status: string }> {
  const res = await flyFetch(`/apps/${appName}/machines/${machineId}`);
  const data = await res.json();
  return { state: data.state, status: data.status };
}

export async function startMachine(appName: string, machineId: string): Promise<void> {
  await flyFetch(`/apps/${appName}/machines/${machineId}/start`, {
    method: "POST",
  });
}

export async function stopMachine(appName: string, machineId: string): Promise<void> {
  await flyFetch(`/apps/${appName}/machines/${machineId}/stop`, {
    method: "POST",
  });
}

export async function destroyMachine(appName: string, machineId: string): Promise<void> {
  await flyFetch(`/apps/${appName}/machines/${machineId}?force=true`, {
    method: "DELETE",
  });
}

export async function destroyApp(appName: string): Promise<void> {
  await flyFetch(`/apps/${appName}`, {
    method: "DELETE",
  });
}

export async function updateMachineSize(
  appName: string,
  machineId: string,
  plan: string
): Promise<void> {
  const size = PLAN_SIZES[plan] || PLAN_SIZES.starter;

  // Get current machine config
  const res = await flyFetch(`/apps/${appName}/machines/${machineId}`);
  const machine = await res.json();

  // Update with new size
  await flyFetch(`/apps/${appName}/machines/${machineId}`, {
    method: "POST",
    body: JSON.stringify({
      config: {
        ...machine.config,
        guest: {
          cpus: size.cpus,
          memory_mb: size.memoryMb,
          cpu_kind: size.cpuKind,
        },
      },
    }),
  });
}

export async function waitForMachineReady(
  appName: string,
  machineId: string,
  timeoutMs: number = 120000
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const { state } = await getMachineStatus(appName, machineId);
      if (state === "started") return true;
      if (state === "failed" || state === "destroyed") return false;
    } catch {
      // Machine may not be queryable yet
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  return false;
}
