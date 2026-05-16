import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { downloadPdf } from "@/lib/pdf";

export function DocumentResult({ text, loading, filename }: { text: string; loading: boolean; filename: string }) {
  const [copying, setCopying] = useState(false);

  if (loading) {
    return (
      <div className="mt-8 border border-blue-100 bg-white rounded-xl p-10 flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating document…
      </div>
    );
  }
  if (!text) return null;

  return (
    <section className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Generated document</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={copying}
            onClick={async () => {
              setCopying(true);
              try {
                await navigator.clipboard.writeText(text);
                toast.success("Copied to clipboard");
              } catch {
                toast.error("Could not copy");
              } finally {
                setCopying(false);
              }
            }}
          >
            <Copy className="w-4 h-4 mr-1" /> Copy
          </Button>
          <Button size="sm" onClick={() => downloadPdf(text, filename)}>
            <Download className="w-4 h-4 mr-1" /> Download PDF
          </Button>
        </div>
      </div>
      <Textarea readOnly value={text} className="min-h-[480px] font-mono text-sm bg-white border-blue-100" />
    </section>
  );
}
