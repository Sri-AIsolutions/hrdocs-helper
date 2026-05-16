import "@tanstack/react-start";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const BodySchema = z.object({
  docType: z.enum(["offer", "leave", "warning"]),
  fields: z.record(z.string(), z.union([z.string(), z.number()])),
});

function buildPrompt(docType: "offer" | "leave" | "warning", fields: Record<string, string | number>) {
  const f = JSON.stringify(fields, null, 2);
  if (docType === "offer") {
    return `You are an HR document expert for Indian companies. Generate a professional offer letter using Indian labour law standards based on these details: ${f}. Format it cleanly with proper sections (Letterhead, Date, Subject, Body covering position, compensation in INR, joining date, probation, work location, confidentiality, governing law, and a Signature block).`;
  }
  if (docType === "leave") {
    return `You are an HR document expert for Indian companies. Draft a complete employee Leave Policy compliant with Indian labour law standards (Shops & Establishments Acts and Factories Act where applicable) based on these details: ${f}. Cover types of leave (casual, sick, earned/privileged), accrual, carry forward and encashment, holidays, application procedure, approval workflow, leave without pay, and policy review. Format cleanly with numbered sections.`;
  }
  return `You are an HR document expert for Indian companies. Generate a formal Warning Letter aligned with Indian labour law and principles of natural justice based on these details: ${f}. Include date, employee details, subject, factual description of the incident, prior discussions if any, expected corrective action, consequences of repeat behaviour, and acknowledgement section. Keep tone professional and neutral. Format cleanly with proper sections.`;
}

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

        const prompt = buildPrompt(parsed.data.docType, parsed.data.fields);

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: "You are an expert HR document writer for Indian small and medium businesses. Output only the final document text — no preamble, no explanations, no markdown code fences." },
              { role: "user", content: prompt },
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
