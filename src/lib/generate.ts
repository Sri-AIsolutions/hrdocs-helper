import { supabase } from "@/integrations/supabase/client";
import type { Language } from "@/lib/docTypes";

export type CompanyProfile = {
  companyName: string;
  address: string;
  hrManagerName: string;
  logoUrl?: string | null;
};

export async function generateDocument(args: {
  docType: string;
  title: string;
  promptInstructions: string;
  language: Language;
  fields: Record<string, string | number>;
  companyProfile?: CompanyProfile;
}): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify({
      docType: args.docType,
      title: args.title,
      promptInstructions: args.promptInstructions,
      language: args.language,
      fields: args.fields,
      companyProfile: args.companyProfile
        ? {
            companyName: args.companyProfile.companyName,
            address: args.companyProfile.address,
            hrManagerName: args.companyProfile.hrManagerName,
          }
        : undefined,
    }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Rate limit reached. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Workspace → Usage.");
    throw new Error(txt || `Generation failed (${res.status})`);
  }
  const { text } = (await res.json()) as { text: string };
  return text;
}

export async function saveDocument(args: {
  docType: string;
  title: string;
  companyName: string;
  language: Language;
  content: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in");
  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      doc_type: args.docType,
      title: args.title,
      company_name: args.companyName,
      language: args.language,
      content: args.content,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}
