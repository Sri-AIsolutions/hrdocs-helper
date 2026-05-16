import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileSignature, ScrollText, AlertTriangle, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({ component: Dashboard });

const tiles = [
  {
    to: "/generate/offer-letter",
    title: "Generate Offer Letter",
    description: "Professional offer letter with Indian labour law standards.",
    icon: FileSignature,
  },
  {
    to: "/generate/leave-policy",
    title: "Generate Leave Policy",
    description: "Tailored leave policy covering casual, sick and earned leave.",
    icon: ScrollText,
  },
  {
    to: "/generate/warning-letter",
    title: "Generate Warning Letter",
    description: "Formal warning letter with clear documentation and tone.",
    icon: AlertTriangle,
  },
] as const;

function Dashboard() {
  return (
    <AppShell>
      <div className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight">HR documents, generated.</h1>
        <p className="text-muted-foreground mt-2">Pick a document to start. Everything is tailored to Indian SMBs.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-5">
        {tiles.map((t) => (
          <Link key={t.to} to={t.to} className="group">
            <Card className="h-full border-blue-100 hover:border-primary/40 hover:shadow-md transition-all">
              <CardHeader>
                <div className="w-11 h-11 rounded-lg bg-blue-50 text-primary flex items-center justify-center mb-2">
                  <t.icon className="w-5 h-5" />
                </div>
                <CardTitle className="text-lg">{t.title}</CardTitle>
                <CardDescription>{t.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-primary inline-flex items-center group-hover:translate-x-0.5 transition-transform">
                  Open <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
