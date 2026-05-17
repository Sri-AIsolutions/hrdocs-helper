import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type CompanyProfile = {
  companyName: string;
  address: string;
  hrManagerName: string;
  logoUrl: string | null;
};

const EMPTY: CompanyProfile = { companyName: "", address: "", hrManagerName: "", logoUrl: null };

export function useCompanyProfile() {
  const [profile, setProfile] = useState<CompanyProfile>(EMPTY);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setProfile(EMPTY);
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("company_profiles")
      .select("company_name, address, hr_manager_name, logo_url")
      .eq("user_id", user.id)
      .maybeSingle();
    setProfile({
      companyName: data?.company_name ?? "",
      address: data?.address ?? "",
      hrManagerName: data?.hr_manager_name ?? "",
      logoUrl: data?.logo_url ?? null,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const save = useCallback(async (next: CompanyProfile) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    const { error } = await supabase.from("company_profiles").upsert({
      user_id: user.id,
      company_name: next.companyName,
      address: next.address,
      hr_manager_name: next.hrManagerName,
      logo_url: next.logoUrl,
    });
    if (error) throw error;
    setProfile(next);
  }, []);

  const uploadLogo = useCallback(async (file: File) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not signed in");
    const ext = file.name.split(".").pop() || "png";
    const path = `${user.id}/logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("company-logos").upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (error) throw error;
    const { data } = supabase.storage.from("company-logos").getPublicUrl(path);
    return data.publicUrl;
  }, []);

  return { profile, loading, refresh, save, uploadLogo };
}
