import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const BodySchema = z.object({
  docType: z.string().min(1).max(40),
  title: z.string().min(1).max(200),
  promptInstructions: z.string().min(1).max(2000),
  language: z.string().min(1).max(40).default("English"),
  fields: z.record(z.string(), z.union([z.string(), z.number()])),
  companyProfile: z
    .object({
      companyName: z.string().max(200).optional(),
      address: z.string().max(500).optional(),
      hrManagerName: z.string().max(200).optional(),
    })
    .optional(),
});

export const Route = createFileRoute("/api/generate")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const parsed = BodySchema.safeParse(body);
        if (!parsed.success) {
          return new Response(JSON.stringify({ error: parsed.error.flatten() }), { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const { title, promptInstructions, language, fields, companyProfile } = parsed.data;

        const profileBlock = companyProfile
          ? `\n\nCompany on whose behalf this is issued:\nCompany name: ${companyProfile.companyName ?? ""}\nAddress: ${companyProfile.address ?? ""}\nHR Manager: ${companyProfile.hrManagerName ?? ""}`
          : "";

        const langInstruction =
          language && language !== "English"
            ? `Write the ENTIRE document in ${language} language. Use the native script of ${language}. Do not output English except for proper nouns, currency symbols and figures.`
            : "Write the document in clear professional English.";

        const userPrompt = `Document: ${title}\n\n${promptInstructions}\n\nDetails:\n${JSON.stringify(fields, null, 2)}${profileBlock}\n\nLanguage requirement: ${langInstruction}\n\nFormat cleanly with proper sections. Output only the final document text — no preamble, no explanations, no markdown code fences.`;

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "You are an expert HR document writer for Indian small and medium businesses. You always follow Indian labour law conventions. Output only the final document text." },
              { role: "user", content: userPrompt },
            ],
          }),
        });

        if (!upstream.ok) {
          const errTxt = await upstream.text().catch(() => "");
          return new Response(errTxt || "Upstream error", { status: upstream.status });
        }
        const data = (await upstream.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const text = data.choices?.[0]?.message?.content ?? "";
        return new Response(JSON.stringify({ text }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
});
