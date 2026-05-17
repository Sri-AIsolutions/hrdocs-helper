import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileSignature,
  ScrollText,
  AlertTriangle,
  BadgeCheck,
  LogOut as Exit,
  Award,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  FileText,
  Calendar,
  Trophy,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DOC_TYPES, DOC_TYPE_LABELS } from "@/lib/docTypes";

export const Route = createFileRoute("/")({ component: Dashboard });

const ICONS: Record<string, typeof FileSignature> = {
  offer: FileSignature,
  appointment: BadgeCheck,
  leave: ScrollText,
  warning: AlertTriangle,
  relieving: Exit,
  experience: Award,
  increment: TrendingUp,
  posh: ShieldCheck,
};

const ORDER = ["offer", "appointment", "leave", "warning", "relieving", "experience", "increment", "posh"];

type Stats = { total: number; thisMonth: number; topType: string | null };

function Dashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, thisMonth: 0, topType: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("documents")
        .select("doc_type, created_at")
        .eq("user_id", user.id);
      const rows = data ?? [];
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const counts: Record<string, number> = {};
      let thisMonth = 0;
      for (const r of rows) {
        counts[r.doc_type] = (counts[r.doc_type] ?? 0) + 1;
        if (new Date(r.created_at) >= startOfMonth) thisMonth++;
      }
      let topType: string | null = null;
      let topCount = 0;
      for (const [k, v] of Object.entries(counts)) {
        if (v > topCount) {
          topCount = v;
          topType = k;
        }
      }
      setStats({ total: rows.length, thisMonth, topType });
      setLoading(false);
    })();
  }, []);

  return (
    <AppShell>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">HR documents, generated.</h1>
        <p className="text-muted-foreground mt-2">
          Pick a document to start. Everything is tailored to Indian SMBs.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-10">
        <StatCard icon={FileText} label="Total documents" value={loading ? "—" : String(stats.total)} />
        <StatCard icon={Calendar} label="This month" value={loading ? "—" : String(stats.thisMonth)} />
        <StatCard
          icon={Trophy}
          label="Most used"
          value={loading ? "—" : stats.topType ? DOC_TYPE_LABELS[stats.topType] ?? stats.topType : "—"}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {ORDER.map((slug) => {
          const def = DOC_TYPES[slug];
          const Icon = ICONS[slug] ?? FileSignature;
          return (
            <Link
              key={slug}
              to="/generate/$docType"
              params={{ docType: slug }}
              className="group"
            >
              <Card className="h-full border-blue-100 hover:border-primary/40 hover:shadow-md transition-all">
                <CardHeader>
                  <div className="w-11 h-11 rounded-lg bg-blue-50 text-primary flex items-center justify-center mb-2">
                    <Icon className="w-5 h-5" />
                  </div>
                  <CardTitle className="text-lg">{def.title}</CardTitle>
                  <CardDescription>{def.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <span className="text-sm text-primary inline-flex items-center group-hover:translate-x-0.5 transition-transform">
                    Open <ArrowRight className="w-4 h-4 ml-1" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </AppShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
}) {
  return (
    <Card className="border-blue-100">
      <CardContent className="pt-6 flex items-center gap-4">
        <div className="w-11 h-11 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-semibold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
