import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const { profile, loading, save, uploadLogo } = useCompanyProfile();
  const [form, setForm] = useState(profile);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => setForm(profile), [profile]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await save(form);
      toast.success("Company settings saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const onLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be smaller than 2MB");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadLogo(file);
      const next = { ...form, logoUrl: url };
      setForm(next);
      await save(next);
      toast.success("Logo uploaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <AppShell>
      <h1 className="text-2xl font-semibold tracking-tight">Company Settings</h1>
      <p className="text-muted-foreground mt-1 mb-6">
        These details auto-fill every document and appear on branded PDF downloads.
      </p>

      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle className="text-base">Company profile</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center text-muted-foreground">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading…
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label>Company logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden">
                    {form.logoUrl ? (
                      <img src={form.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-xs text-muted-foreground">No logo</span>
                    )}
                  </div>
                  <label className="inline-flex">
                    <Button type="button" variant="outline" size="sm" disabled={uploading} asChild>
                      <span>
                        <Upload className="w-4 h-4 mr-1" />
                        {uploading ? "Uploading…" : form.logoUrl ? "Replace logo" : "Upload logo"}
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={onLogoChange}
                    />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Company name</Label>
                <Input
                  id="companyName"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hrManager">HR Manager name</Label>
                <Input
                  id="hrManager"
                  value={form.hrManagerName}
                  onChange={(e) => setForm({ ...form, hrManagerName: e.target.value })}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving…" : "Save settings"}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
