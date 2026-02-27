"use client";

import { useEffect } from "react";
import { usePostHog } from "posthog-js/react";

export function PostHogIdentify({
  userId,
  email,
  plan,
}: {
  userId: string;
  email: string;
  plan?: string;
}) {
  const posthog = usePostHog();
  useEffect(() => {
    posthog?.identify(userId, { email, plan });
  }, [posthog, userId, email, plan]);
  return null;
}
