export function register() {
  // No-op — required export for Next.js instrumentation
}

export const onRequestError = async (
  err: { message: string; digest?: string },
  request: {
    path: string;
    method: string;
    headers: { cookie?: string | string[] };
  },
  context: {
    routerKind: string;
    routePath: string;
    routeType: string;
    renderSource: string;
  }
) => {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getPostHogServer } = await import("@/lib/posthog-server");
    const posthog = getPostHogServer();
    if (!posthog) return;

    // Extract PostHog distinct_id from cookie to tie error to user
    let distinctId: string | undefined;
    if (request.headers.cookie) {
      const cookieString = Array.isArray(request.headers.cookie)
        ? request.headers.cookie.join("; ")
        : request.headers.cookie;
      const match = cookieString.match(/ph_.*?_posthog=([^;]+)/);
      if (match?.[1]) {
        try {
          const decoded = decodeURIComponent(match[1]);
          distinctId = JSON.parse(decoded).distinct_id;
        } catch {
          // Ignore malformed cookie
        }
      }
    }

    posthog.captureException(err, distinctId, {
      path: request.path,
      method: request.method,
      routerKind: context.routerKind,
      routePath: context.routePath,
    });
    await posthog.shutdown();
  }
};
