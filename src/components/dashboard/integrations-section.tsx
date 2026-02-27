"use client";

import { useState, useEffect, useCallback } from "react";
import { usePostHog } from "posthog-js/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, CheckCircle2, Loader2 } from "lucide-react";

type TelegramStatus = {
  configured: boolean;
  botUsername?: string;
};

function TelegramModal({
  onClose,
  onSaved,
  onFailed,
}: {
  onClose: () => void;
  onSaved: (botUsername: string) => void;
  onFailed?: (error: string) => void;
}) {
  const [token, setToken] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    if (!token.trim()) {
      setError("Bot token is required");
      return;
    }
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/instance/channels/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botToken: token.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || "Failed to save";
        setError(msg);
        onFailed?.(msg);
        return;
      }

      onSaved(data.botUsername || "");
    } catch {
      setError("Network error. Please try again.");
      onFailed?.("Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Configure Telegram</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 hover:bg-accent"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-muted-foreground">Steps:</p>
          <ol className="space-y-1 text-sm">
            <li className="flex gap-2">
              <span className="font-medium text-muted-foreground">1.</span>
              Message @BotFather on Telegram
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-muted-foreground">2.</span>
              Create a new bot with /newbot
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-muted-foreground">3.</span>
              Copy the bot token
            </li>
            <li className="flex gap-2">
              <span className="font-medium text-muted-foreground">4.</span>
              Paste it below
            </li>
          </ol>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium">Bot Token</label>
          <Input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="123456:ABC-DEF..."
            disabled={saving}
          />
          {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}

export function IntegrationsSection() {
  const posthog = usePostHog();
  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/instance/channels/telegram");
      if (res.ok) {
        setStatus(await res.json());
      }
    } catch {
      // Silently fail — status stays null
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  async function handleDisconnect() {
    if (!confirm("Disconnect Telegram bot? Your instance will restart.")) return;

    setDisconnecting(true);
    try {
      const res = await fetch("/api/instance/channels/telegram", { method: "DELETE" });
      if (res.ok) {
        posthog?.capture("telegram_disconnected", { bot_username: status?.botUsername });
        setStatus({ configured: false });
      }
    } catch {
      // ignore
    } finally {
      setDisconnecting(false);
    }
  }

  function handleSaved(botUsername: string) {
    posthog?.capture("telegram_configured", { bot_username: botUsername });
    setStatus({ configured: true, botUsername });
    setShowModal(false);
  }

  function handleOpenModal() {
    posthog?.capture("telegram_configure_started");
    setShowModal(true);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect your assistant to messaging platforms
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary">
              <img src="/logos/telegram.webp" alt="Telegram" className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Telegram</p>
                {status?.configured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {loading
                  ? "Loading..."
                  : status?.configured
                    ? `@${status.botUsername || "bot"}`
                    : "Connect a Telegram bot to your assistant"}
              </p>
            </div>
          </div>
          <div className="ml-2 flex shrink-0 gap-2">
            {status?.configured ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpenModal}
                >
                  Reconfigure
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="text-red-500 hover:text-red-600"
                >
                  {disconnecting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Disconnect"
                  )}
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenModal}
                disabled={loading}
              >
                Configure
              </Button>
            )}
          </div>
        </div>
      </CardContent>

      {showModal && (
        <TelegramModal
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
          onFailed={(error) => posthog?.capture("telegram_config_failed", { error })}
        />
      )}
    </Card>
  );
}
