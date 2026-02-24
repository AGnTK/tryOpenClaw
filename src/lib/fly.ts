const FLY_API_URL = "https://api.machines.dev/v1";
const FLY_GQL_URL = "https://api.fly.io/graphql";

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

async function flyGql(query: string, variables: Record<string, unknown> = {}) {
  const res = await fetch(FLY_GQL_URL, {
    method: "POST",
    headers: flyHeaders(),
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Fly GraphQL error ${res.status}: ${body}`);
  }
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(`Fly GraphQL error: ${json.errors[0].message}`);
  }
  return json.data;
}

// Plan → machine size mapping
const PLAN_SIZES: Record<string, { cpus: number; memoryMb: number; cpuKind: string }> = {
  starter: { cpus: 1, memoryMb: 2048, cpuKind: "shared" },
  pro: { cpus: 2, memoryMb: 2048, cpuKind: "shared" },
  enterprise: { cpus: 2, memoryMb: 4096, cpuKind: "shared" },
};

export async function createApp(appName: string): Promise<void> {
  await flyFetch("/apps", {
    method: "POST",
    body: JSON.stringify({ app_name: appName, org_slug: process.env.FLY_ORG || "personal" }),
  });
}

export async function allocateIpAddresses(appName: string): Promise<void> {
  const mutation = `
    mutation ($input: AllocateIPAddressInput!) {
      allocateIpAddress(input: $input) {
        ipAddress { address type }
      }
    }
  `;
  // Shared IPv4 + IPv6 — required for *.fly.dev DNS to resolve
  await flyGql(mutation, { input: { appId: appName, type: "shared_v4" } });
  await flyGql(mutation, { input: { appId: appName, type: "v6" } });
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
  gatewayToken: string,
  region: string = "iad"
): Promise<{ machineId: string; instanceUrl: string }> {
  const size = PLAN_SIZES[plan] || PLAN_SIZES.starter;
  const openClawImage = process.env.OPENCLAW_DOCKER_IMAGE || "ghcr.io/openclaw/openclaw:latest";

  // OpenClaw config: enable token auth + bypass device pairing for Fly.io proxy
  // Passed as env var and written to file at boot (can't use Fly `files` — volume mount overwrites it)
  const openclawConfig = JSON.stringify({
    gateway: {
      mode: "local",
      bind: "lan",
      port: 18789,
      controlUi: {
        enabled: true,
        allowInsecureAuth: true,
      },
      auth: {
        mode: "token",
        token: gatewayToken,
      },
      trustedProxies: ["172.16.0.0/12", "10.0.0.0/8", "fdaa::/16", "fc00::/7"],
    },
  });
  envVars.OPENCLAW_CONFIG_JSON = openclawConfig;

  const res = await flyFetch(`/apps/${appName}/machines`, {
    method: "POST",
    body: JSON.stringify({
      region,
      config: {
        image: openClawImage,
        init: {
          cmd: [
            "node", "-e",
            // Write config from env var to volume-mounted dir, then spawn gateway.
            // Uses "node -e" (not "sh -c") so docker-entrypoint.sh sees "node" as argv[0]
            // and applies correct setup (workdir, user, etc.).
            "const fs=require('fs');" +
            "fs.mkdirSync('/home/node/.openclaw',{recursive:true});" +
            "fs.writeFileSync('/home/node/.openclaw/openclaw.json',process.env.OPENCLAW_CONFIG_JSON||'{}');" +
            "const c=require('child_process').spawn('node',['openclaw.mjs','gateway','--allow-unconfigured','--bind','lan','--port','18789'],{stdio:'inherit'});" +
            "c.on('exit',x=>process.exit(x||0));" +
            "process.on('SIGTERM',()=>c.kill('SIGTERM'))",
          ],
        },
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
            path: "/home/node/.openclaw",
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
  await setAutostart(appName, machineId, true);
  await flyFetch(`/apps/${appName}/machines/${machineId}/start`, {
    method: "POST",
  });
}

export async function stopMachine(appName: string, machineId: string): Promise<void> {
  await setAutostart(appName, machineId, false);
  await flyFetch(`/apps/${appName}/machines/${machineId}/stop`, {
    method: "POST",
  });
}

async function setAutostart(appName: string, machineId: string, enabled: boolean): Promise<void> {
  const res = await flyFetch(`/apps/${appName}/machines/${machineId}`);
  const machine = await res.json();

  // Update autostart on all services
  const services = machine.config?.services?.map((s: Record<string, unknown>) => ({
    ...s,
    autostart: enabled,
  })) || [];

  await flyFetch(`/apps/${appName}/machines/${machineId}`, {
    method: "POST",
    body: JSON.stringify({
      config: {
        ...machine.config,
        services,
      },
    }),
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

export async function waitForServiceReady(
  url: string,
  timeoutMs: number = 180000
): Promise<boolean> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      // Fly proxy returns 502/503 when the app isn't listening yet — keep waiting
      // OpenClaw itself returns <500 (200, 302, 401, etc.) when ready
      if (res.status < 500) return true;
    } catch {
      // Connection refused, timeout, DNS not ready — keep polling
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  return false;
}
