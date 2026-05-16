import { supabase } from "@/integrations/supabase/client";

export type DocType = "offer" | "leave" | "warning";

export async function generateDocument(docType: DocType, fields: Record<string, string | number>) {
  const { data: { session } } = await supabase.auth.getSession();
  const res = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify({ docType, fields }),
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
