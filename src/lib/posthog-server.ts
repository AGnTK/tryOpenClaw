import { PostHog } from "posthog-node";

let _posthog: PostHog | null = null;

export function getPostHogServer(): PostHog | null {
  const key = (process.env.NEXT_PUBLIC_POSTHOG_KEY || "").trim();
  if (!key) return null;
  if (!_posthog) {
    _posthog = new PostHog(key, {
      host: (process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com").trim(),
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return _posthog;
}
