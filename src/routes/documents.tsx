import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { DOC_TYPE_LABELS, DOC_TYPES } from "@/lib/docTypes";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { downloadPdf } from "@/lib/pdf";
import { Download, Eye, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/documents")({ component: DocumentsPage });

type Doc = {
  id: string;
  doc_type: string;
  title: string;
  company_name: string | null;
  language: string;
  content: string;
  created_at: string;
};

function DocumentsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<Doc | null>(null);
  const { profile } = useCompanyProfile();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("documents")
        .select("id, doc_type, title, company_name, language, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) toast.error(error.message);
      setDocs((data as Doc[] | null) ?? []);
      setLoading(false);
    })();
  }, []);

  const download = async (doc: Doc) => {
    const def = DOC_TYPES[doc.doc_type];
    const slug = def?.filenameSlug ?? doc.doc_type;
    const filename = `${(doc.company_name || "company").toLowerCase().replace(/\s+/g, "-")}-${slug}.pdf`;
    await downloadPdf(doc.content, filename, {
      companyName: doc.company_name ?? profile.companyName,
      address: profile.address,
      logoDataUrl: profile.logoUrl,
    });
  };

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">My Documents</h1>
      <p className="text-muted-foreground mt-1 mb-6">
        Every document you have generated, ready to view or re-download.
      </p>

      {loading ? (
        <div className="flex items-center text-muted-foreground">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading…
        </div>
      ) : docs.length === 0 ? (
        <Card className="border-blue-100">
          <CardContent className="py-12 text-center text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-60" />
            No documents yet. Generate one from the dashboard.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {docs.map((d) => (
            <Card key={d.id} className="border-blue-100">
              <CardContent className="py-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{DOC_TYPE_LABELS[d.doc_type] ?? d.doc_type}</Badge>
                    <Badge variant="outline">{d.language}</Badge>
                  </div>
                  <p className="font-medium truncate">{d.company_name || "—"}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(d.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setOpen(d)}>
                    <Eye className="w-4 h-4 mr-1" /> View
                  </Button>
                  <Button size="sm" onClick={() => download(d)}>
                    <Download className="w-4 h-4 mr-1" /> PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {open ? `${DOC_TYPE_LABELS[open.doc_type] ?? open.doc_type} — ${open.company_name || ""}` : ""}
            </DialogTitle>
          </DialogHeader>
          {open && (
            <Textarea readOnly value={open.content} className="min-h-[480px] font-mono text-sm" />
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
