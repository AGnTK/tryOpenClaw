import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Headphones,
  ShoppingCart,
  GraduationCap,
  Calendar,
  Code,
  Heart,
} from "lucide-react";

const IDEAS = [
  {
    icon: <Headphones className="h-5 w-5" />,
    title: "Customer Support Bot",
    description: "Answer FAQs, handle tickets, and escalate complex issues automatically.",
  },
  {
    icon: <ShoppingCart className="h-5 w-5" />,
    title: "E-Commerce Assistant",
    description: "Help customers find products, track orders, and process returns.",
  },
  {
    icon: <GraduationCap className="h-5 w-5" />,
    title: "Learning Tutor",
    description: "Create an interactive tutor that explains concepts and quizzes students.",
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    title: "Scheduling Assistant",
    description: "Manage appointments, send reminders, and coordinate across time zones.",
  },
  {
    icon: <Code className="h-5 w-5" />,
    title: "Developer Helper",
    description: "Answer coding questions, review snippets, and explain documentation.",
  },
  {
    icon: <Heart className="h-5 w-5" />,
    title: "Community Manager",
    description: "Moderate discussions, welcome new members, and share updates.",
  },
];

export function InspirationSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Get Inspired</CardTitle>
        <p className="text-sm text-muted-foreground">
          Ideas for what you can build with your assistant
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {IDEAS.map((idea) => (
            <div
              key={idea.title}
              className="rounded-lg border p-3"
            >
              <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-md bg-secondary">
                {idea.icon}
              </div>
              <p className="text-sm font-medium">{idea.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {idea.description}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
