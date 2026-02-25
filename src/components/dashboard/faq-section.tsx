"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
  {
    question: "Do I need my own API key?",
    answer:
      "No — your instance comes pre-configured with Kimi K2.5 via OpenRouter, so it works out of the box. If you want to use premium models like Claude or GPT-4, you can add your own API keys in the OpenClaw dashboard.",
  },
  {
    question: "Can I connect multiple platforms at once?",
    answer:
      "Yes! OpenClaw supports 13+ channels including Telegram, Discord, Slack, WhatsApp, and more. You can run all of them simultaneously from a single instance.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Each customer gets a dedicated Fly.io machine with a persistent encrypted volume. Your data is isolated from other users and never shared.",
  },
  {
    question: "How long does setup take?",
    answer:
      "Under 5 minutes. After payment, click \"Launch Your OpenClaw\" on the dashboard. Provisioning typically completes in 1-2 minutes, and you can start configuring channels immediately.",
  },
  {
    question: "Can I run multiple instances?",
    answer:
      "Each subscription includes one OpenClaw instance. If you need additional instances, contact our support team for multi-instance pricing.",
  },
  {
    question: "What AI models are supported?",
    answer:
      "OpenClaw supports a wide range of models including Claude, GPT-4, Gemini, Kimi K2.5, Llama, Mistral, and many more via OpenRouter. You can switch models anytime from the OpenClaw dashboard.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Frequently Asked Questions</CardTitle>
        <p className="text-sm text-muted-foreground">
          Common questions about your OpenClaw instance
        </p>
      </CardHeader>
      <CardContent>
        <div className="divide-y rounded-lg border">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between p-3 text-left text-sm font-medium hover:bg-accent/50"
              >
                {item.question}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="px-3 pb-3 text-sm text-muted-foreground">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
