import jsPDF from "jspdf";

export type PdfBranding = {
  companyName?: string;
  address?: string;
  logoDataUrl?: string | null;
};

async function urlToDataUrl(url: string): Promise<{ dataUrl: string; format: "PNG" | "JPEG" } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const isJpeg = blob.type.includes("jpeg") || blob.type.includes("jpg");
    return { dataUrl, format: isJpeg ? "JPEG" : "PNG" };
  } catch {
    return null;
  }
}

export async function downloadPdf(text: string, filename: string, branding?: PdfBranding) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 56;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const usable = pageWidth - margin * 2;

  let y = margin;

  // Branded header
  if (branding && (branding.companyName || branding.address || branding.logoDataUrl)) {
    const headerHeight = 60;
    let textX = margin;
    if (branding.logoDataUrl) {
      const img = await urlToDataUrl(branding.logoDataUrl);
      if (img) {
        try {
          doc.addImage(img.dataUrl, img.format, margin, y, 50, 50);
          textX = margin + 60;
        } catch {
          /* ignore bad image */
        }
      }
    }
    if (branding.companyName) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(branding.companyName, textX, y + 16);
    }
    if (branding.address) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const addrLines = doc.splitTextToSize(branding.address, usable - (textX - margin));
      doc.text(addrLines, textX, y + 32);
    }
    y += headerHeight;
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 20;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const lines = doc.splitTextToSize(text, usable);
  const lineHeight = 16;
  for (const line of lines) {
    if (y > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  }
  doc.save(filename);
}
