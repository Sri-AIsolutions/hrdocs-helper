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

export const Route = createFileRoute("/generate/leave-policy")({ component: LeavePolicy });

function LeavePolicy() {
  const [fields, setFields] = useState({
    companyName: "",
    employeeCount: "",
    workState: "",
    annualLeaveDays: "24",
    leaveTypes: "Casual, Sick, Earned",
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
      const text = await generateDocument("leave", {
        "Company name": fields.companyName,
        "Number of employees": fields.employeeCount,
        "Work state": fields.workState,
        "Total annual leave days": fields.annualLeaveDays,
        "Leave types to include": fields.leaveTypes,
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
      <h1 className="text-2xl font-semibold tracking-tight">Generate Leave Policy</h1>
      <p className="text-muted-foreground mt-1 mb-6">Create a leave policy tailored to your company size and location.</p>
      <Card className="border-blue-100">
        <CardHeader><CardTitle className="text-base">Policy details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
            <Field id="companyName" label="Company name" value={fields.companyName} onChange={set("companyName")} />
            <Field id="employeeCount" label="Number of employees" type="number" value={fields.employeeCount} onChange={set("employeeCount")} />
            <Field id="workState" label="Work location (state)" value={fields.workState} onChange={set("workState")} />
            <Field id="annualLeaveDays" label="Total annual leave days" type="number" value={fields.annualLeaveDays} onChange={set("annualLeaveDays")} />
            <div className="md:col-span-2">
              <Field id="leaveTypes" label="Leave types to include" value={fields.leaveTypes} onChange={set("leaveTypes")} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={loading}>{loading ? "Generating…" : "Generate"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <DocumentResult text={result} loading={loading} filename={`${fields.companyName || "company"}-leave-policy.pdf`} />
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
