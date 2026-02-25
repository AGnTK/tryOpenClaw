"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Globe, MessageCircle, Hash, X } from "lucide-react";

type Integration = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  inputLabel: string;
  placeholder: string;
  steps: string[];
};

const INTEGRATIONS: Integration[] = [
  {
    id: "webchat",
    name: "Web Chat",
    description: "Embed a chat widget on your website",
    icon: <Globe className="h-5 w-5" />,
    inputLabel: "Widget Embed URL",
    placeholder: "https://your-site.com",
    steps: [
      "Open your OpenClaw dashboard",
      "Go to Channels → Web Chat",
      "Copy the embed snippet",
      "Paste into your website",
    ],
  },
  {
    id: "telegram",
    name: "Telegram",
    description: "Connect a Telegram bot to your assistant",
    icon: <MessageCircle className="h-5 w-5" />,
    inputLabel: "Bot Token",
    placeholder: "123456:ABC-DEF...",
    steps: [
      "Message @BotFather on Telegram",
      "Create a new bot with /newbot",
      "Copy the bot token",
      "Paste it below",
    ],
  },
  {
    id: "slack",
    name: "Slack",
    description: "Add your assistant to Slack workspaces",
    icon: <Hash className="h-5 w-5" />,
    inputLabel: "Bot OAuth Token",
    placeholder: "xoxb-...",
    steps: [
      "Create a Slack App at api.slack.com",
      "Add Bot Token Scopes",
      "Install to workspace",
      "Paste the Bot OAuth Token below",
    ],
  },
  {
    id: "discord",
    name: "Discord",
    description: "Deploy your assistant to Discord servers",
    icon: <MessageCircle className="h-5 w-5" />,
    inputLabel: "Bot Token",
    placeholder: "MTk...",
    steps: [
      "Create app at discord.com/developers",
      "Add a Bot under your application",
      "Copy the bot token",
      "Paste it below",
    ],
  },
];

function IntegrationModal({
  integration,
  onClose,
}: {
  integration: Integration;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Configure {integration.name}</h3>
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
            {integration.steps.map((step, i) => (
              <li key={i} className="flex gap-2">
                <span className="font-medium text-muted-foreground">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-medium">
            {integration.inputLabel}
          </label>
          <Input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={integration.placeholder}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>Save</Button>
        </div>
      </div>
    </div>
  );
}

export function IntegrationsSection() {
  const [activeIntegration, setActiveIntegration] = useState<Integration | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integrations</CardTitle>
        <p className="text-sm text-muted-foreground">
          Connect your assistant to messaging platforms
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {INTEGRATIONS.map((integration) => (
            <div
              key={integration.id}
              className="flex items-center justify-between rounded-lg border p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary">
                  {integration.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">{integration.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {integration.description}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="ml-2 shrink-0"
                onClick={() => setActiveIntegration(integration)}
              >
                Configure
              </Button>
            </div>
          ))}
        </div>
      </CardContent>

      {activeIntegration && (
        <IntegrationModal
          integration={activeIntegration}
          onClose={() => setActiveIntegration(null)}
        />
      )}
    </Card>
  );
}
