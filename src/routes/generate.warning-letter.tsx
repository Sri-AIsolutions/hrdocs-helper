import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentResult } from "@/components/DocumentResult";
import { generateDocument } from "@/lib/generate";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/generate/warning-letter")({ component: WarningLetter });

function WarningLetter() {
  const [fields, setFields] = useState({
    companyName: "",
    employeeName: "",
    designation: "",
    incidentDate: "",
    severity: "Written",
    description: "",
  });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const setField = (k: keyof typeof fields, v: string) => setFields((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(fields).some((v) => !String(v).trim())) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const text = await generateDocument("warning", {
        "Company name": fields.companyName,
        "Employee name": fields.employeeName,
        "Designation": fields.designation,
        "Date of incident": fields.incidentDate,
        "Severity": fields.severity,
        "Description of issue": fields.description,
      });
      setResult(text);
    } catch (err: any) {
      toast.error(err.message ?? "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center mb-4">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to dashboard
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">Generate Warning Letter</h1>
      <p className="text-muted-foreground mt-1 mb-6">Draft a formal warning letter with clear documentation.</p>
      <Card className="border-blue-100">
        <CardHeader><CardTitle className="text-base">Incident details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
            <Input id="companyName" placeholder="Company name" value={fields.companyName} onChange={(e) => setField("companyName", e.target.value)} required />
            <Input id="employeeName" placeholder="Employee name" value={fields.employeeName} onChange={(e) => setField("employeeName", e.target.value)} required />
            <Input id="designation" placeholder="Employee designation" value={fields.designation} onChange={(e) => setField("designation", e.target.value)} required />
            <Input id="incidentDate" type="date" value={fields.incidentDate} onChange={(e) => setField("incidentDate", e.target.value)} required />
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="severity">Severity</Label>
              <select
                id="severity"
                value={fields.severity}
                onChange={(e) => setField("severity", e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option>Verbal</option>
                <option>Written</option>
                <option>Final</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description of issue</Label>
              <Textarea id="description" rows={4} value={fields.description} onChange={(e) => setField("description", e.target.value)} required />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={loading}>{loading ? "Generating…" : "Generate"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <DocumentResult text={result} loading={loading} filename={`${fields.companyName || "company"}-warning-letter.pdf`} />
    </AppShell>
  );
}
