import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LifeBuoy, Mail } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support</h1>
        <p className="text-sm text-muted-foreground">
          Get help with your OpenClaw instance
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5" />
            Need Help?
          </CardTitle>
          <CardDescription>
            Reach out to us via email and we&apos;ll get back to you as soon as possible.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a
            href="mailto:support@tryopenclawai.com"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Mail className="h-4 w-4" />
            support@tryopenclawai.com
          </a>
          <p className="mt-3 text-xs text-muted-foreground">
            We typically respond within 24 hours.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
