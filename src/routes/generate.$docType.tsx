import { createFileRoute, Link, useNavigate, notFound } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DocumentResult } from "@/components/DocumentResult";
import { generateDocument, saveDocument } from "@/lib/generate";
import { DOC_TYPES, LANGUAGES, type Language } from "@/lib/docTypes";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/generate/$docType")({
  component: GeneratePage,
  notFoundComponent: () => (
    <AppShell>
      <p>Unknown document type. <Link to="/" className="text-primary underline">Go back</Link></p>
    </AppShell>
  ),
  errorComponent: ({ error }) => (
    <AppShell>
      <p className="text-destructive">{error.message}</p>
    </AppShell>
  ),
});

function GeneratePage() {
  const { docType } = Route.useParams();
  const navigate = useNavigate();
  const def = DOC_TYPES[docType];
  if (!def) throw notFound();

  const { profile, loading: profileLoading } = useCompanyProfile();
  const [language, setLanguage] = useState<Language>("English");
  const [fields, setFields] = useState<Record<string, string>>(() =>
    Object.fromEntries(def.fields.map((f) => [f.key, f.key === "probationMonths" ? "3" : ""])),
  );
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  // Auto-fill company name from profile (once profile loads, if field is empty)
  useEffect(() => {
    if (profileLoading) return;
    setFields((prev) => {
      const next = { ...prev };
      for (const f of def.fields) {
        if (f.autofillFrom === "companyName" && !next[f.key] && profile.companyName) {
          next[f.key] = profile.companyName;
        }
      }
      return next;
    });
  }, [profileLoading, profile.companyName, def]);

  const branding = useMemo(
    () => ({
      companyName: profile.companyName || fields.companyName || "",
      address: profile.address,
      logoDataUrl: profile.logoUrl,
    }),
    [profile, fields.companyName],
  );

  const setField = (k: string) => (v: string) => setFields((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (def.fields.some((f) => !String(fields[f.key] ?? "").trim())) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const labelled: Record<string, string> = {};
      for (const f of def.fields) labelled[f.label] = fields[f.key];
      const text = await generateDocument({
        docType: def.slug,
        title: def.title,
        promptInstructions: def.promptInstructions,
        language,
        fields: labelled,
        companyProfile: profile.companyName || profile.address || profile.hrManagerName
          ? {
              companyName: profile.companyName,
              address: profile.address,
              hrManagerName: profile.hrManagerName,
            }
          : undefined,
      });
      setResult(text);
      try {
        await saveDocument({
          docType: def.slug,
          title: def.title,
          companyName: branding.companyName,
          language,
          content: text,
        });
      } catch (err) {
        console.error("Save failed", err);
        toast.error("Generated, but could not save to history");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Generation failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const filename = `${(branding.companyName || "company").toLowerCase().replace(/\s+/g, "-")}-${def.filenameSlug}.pdf`;

  return (
    <AppShell>
      <button
        onClick={() => navigate({ to: "/" })}
        className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center mb-4"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to dashboard
      </button>
      <h1 className="text-2xl font-semibold tracking-tight">Generate {def.title}</h1>
      <p className="text-muted-foreground mt-1 mb-6">{def.description}</p>

      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
            {def.fields.map((f) => (
              <div
                key={f.key}
                className={`space-y-2 ${f.type === "textarea" ? "md:col-span-2" : ""}`}
              >
                <Label htmlFor={f.key}>{f.label}</Label>
                {f.type === "textarea" ? (
                  <Textarea
                    id={f.key}
                    value={fields[f.key]}
                    onChange={(e) => setField(f.key)(e.target.value)}
                    placeholder={f.placeholder}
                    required
                  />
                ) : f.type === "select" ? (
                  <Select value={fields[f.key]} onValueChange={setField(f.key)}>
                    <SelectTrigger id={f.key}>
                      <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                      {f.options?.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={f.key}
                    type={f.type ?? "text"}
                    value={fields[f.key]}
                    onChange={(e) => setField(f.key)(e.target.value)}
                    placeholder={f.placeholder}
                    required
                  />
                )}
              </div>
            ))}

            <div className="space-y-2">
              <Label htmlFor="language">Output language</Label>
              <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading ? "Generating…" : "Generate"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DocumentResult text={result} loading={loading} filename={filename} branding={branding} />
    </AppShell>
  );
}
