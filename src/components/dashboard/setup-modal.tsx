"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  MessageCircle,
  Hash,
  MessageSquare,
  Phone,
  Globe,
  Zap,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Brain,
  Shield,
} from "lucide-react";

interface SetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dashboardUrl: string;
}

interface Channel {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  setupPath: string;
}

const CHANNELS: Channel[] = [
  {
    id: "telegram",
    name: "Telegram",
    icon: <MessageCircle className="h-6 w-6" />,
    description: "Connect a Telegram bot to chat with your assistant",
    setupPath: "telegram",
  },
  {
    id: "discord",
    name: "Discord",
    icon: <Hash className="h-6 w-6" />,
    description: "Add your assistant to Discord servers",
    setupPath: "discord",
  },
  {
    id: "slack",
    name: "Slack",
    icon: <MessageSquare className="h-6 w-6" />,
    description: "Integrate with your Slack workspace",
    setupPath: "slack",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    icon: <Phone className="h-6 w-6" />,
    description: "Connect via WhatsApp Business API",
    setupPath: "whatsapp",
  },
  {
    id: "web",
    name: "Web Chat",
    icon: <Globe className="h-6 w-6" />,
    description: "Embed a chat widget on your website",
    setupPath: "web",
  },
  {
    id: "api",
    name: "API",
    icon: <Zap className="h-6 w-6" />,
    description: "Use the REST API for custom integrations",
    setupPath: "api",
  },
];

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "How do I connect Telegram?",
    answer:
      "Create a bot via @BotFather in Telegram, copy the bot token, then paste it in your OpenClaw dashboard under Channels → Telegram. Your bot will be live within seconds.",
  },
  {
    question: "What AI models are supported?",
    answer:
      "OpenClaw supports Claude (Anthropic), GPT-4 & GPT-4o (OpenAI), Gemini (Google), Kimi K2.5 (Moonshot), and many other models. You can switch models anytime in your dashboard.",
  },
  {
    question: "How do I add my API keys?",
    answer:
      "Go to Settings → AI Models in your OpenClaw dashboard. Add your API keys for the providers you want to use. Keys are encrypted and stored securely.",
  },
  {
    question: "What's the difference between plans?",
    answer:
      "Starter includes 1 channel and basic features. Pro includes 5 channels, priority support, and advanced features. Enterprise offers unlimited channels, custom SLAs, and dedicated support.",
  },
  {
    question: "Can I customize my assistant's personality?",
    answer:
      "Yes! Edit SOUL.md in your OpenClaw dashboard to define your assistant's persona, skills, tone, and conversation style. You can make it formal, friendly, technical, or anything in between.",
  },
  {
    question: "What happens if my instance is sleeping?",
    answer:
      "To save resources, instances sleep after inactivity. They wake automatically on the next request, with a cold start of 30-60 seconds. Pro and Enterprise plans have faster wake times.",
  },
];

export function SetupModal({ open, onOpenChange, dashboardUrl }: SetupModalProps) {
  const [activeTab, setActiveTab] = useState("channels");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  function handleChannelConnect(channel: Channel) {
    const url = `${dashboardUrl}&setup=${channel.setupPath}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function toggleFaq(index: number) {
    setExpandedFaq(expandedFaq === index ? null : index);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Setup Your OpenClaw Assistant</DialogTitle>
          <DialogDescription>
            Connect channels, configure AI models, and get answers to common questions.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="models">AI Models</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          <TabsContent value="channels" className="mt-6">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">
              Connect a channel to start chatting with your assistant
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {CHANNELS.map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => handleChannelConnect(channel)}
                  className="flex items-start gap-3 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-accent"
                >
                  <div className="shrink-0 text-muted-foreground">{channel.icon}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{channel.name}</span>
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{channel.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="models" className="mt-6">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">
              Choose and configure your AI model
            </h3>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 rounded-full bg-primary/10 p-2 text-primary">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Supported Models</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Claude (Anthropic), GPT-4 & GPT-4o (OpenAI), Gemini (Google), Kimi K2.5 (Moonshot), Mistral, Llama, and more.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 rounded-full bg-primary/10 p-2 text-primary">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">How to Configure</h4>
                    <ol className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <li>1. Open your OpenClaw dashboard</li>
                      <li>2. Go to Settings → AI Models</li>
                      <li>3. Add your API key for your preferred provider</li>
                      <li>4. Select the model you want to use</li>
                    </ol>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 rounded-full bg-primary/10 p-2 text-primary">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium">Security</h4>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Your API keys are encrypted and stored securely. They never leave your instance and are only used to make API calls on your behalf.
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => window.open(dashboardUrl, "_blank", "noopener,noreferrer")}
                className="w-full gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Configure Models in Dashboard
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="faq" className="mt-6">
            <h3 className="mb-4 text-sm font-medium text-muted-foreground">
              Frequently asked questions
            </h3>
            <div className="space-y-2">
              {FAQ_ITEMS.map((item, index) => (
                <div key={index} className="rounded-lg border">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <span className="font-medium">{item.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="border-t px-4 py-3">
                      <p className="text-sm text-muted-foreground">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
