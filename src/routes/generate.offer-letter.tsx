import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentResult } from "@/components/DocumentResult";
import { generateDocument } from "@/lib/generate";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/generate/offer-letter")({ component: OfferLetter });

function OfferLetter() {
  const [fields, setFields] = useState({
    companyName: "",
    employeeName: "",
    jobTitle: "",
    ctc: "",
    joiningDate: "",
    probationMonths: "3",
    workLocation: "",
  });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(fields).some((v) => !String(v).trim())) {
      toast.error("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setResult("");
    try {
      const text = await generateDocument("offer", {
        "Company name": fields.companyName,
        "Employee full name": fields.employeeName,
        "Job title": fields.jobTitle,
        "CTC per annum (INR)": fields.ctc,
        "Joining date": fields.joiningDate,
        "Probation period (months)": fields.probationMonths,
        "Work location (city)": fields.workLocation,
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
      <h1 className="text-2xl font-semibold tracking-tight">Generate Offer Letter</h1>
      <p className="text-muted-foreground mt-1 mb-6">Fill in the details below to draft a professional Indian offer letter.</p>

      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle className="text-base">Offer details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
            <Field id="companyName" label="Company name" value={fields.companyName} onChange={set("companyName")} />
            <Field id="employeeName" label="Employee full name" value={fields.employeeName} onChange={set("employeeName")} />
            <Field id="jobTitle" label="Job title" value={fields.jobTitle} onChange={set("jobTitle")} />
            <Field id="ctc" label="CTC per annum (₹)" type="number" value={fields.ctc} onChange={set("ctc")} />
            <Field id="joiningDate" label="Joining date" type="date" value={fields.joiningDate} onChange={set("joiningDate")} />
            <Field id="probationMonths" label="Probation period (months)" type="number" value={fields.probationMonths} onChange={set("probationMonths")} />
            <Field id="workLocation" label="Work location (city)" value={fields.workLocation} onChange={set("workLocation")} />
            <div className="md:col-span-2">
              <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading ? "Generating…" : "Generate"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DocumentResult text={result} loading={loading} filename={`${fields.companyName || "company"}-offer-letter.pdf`} />
    </AppShell>
  );
}

function Field({ id, label, value, onChange, type = "text" }: { id: string; label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} value={value} onChange={onChange} type={type} required />
    </div>
  );
}
