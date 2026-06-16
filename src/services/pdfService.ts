import { PDFDocument, StandardFonts, type PDFFont, rgb } from "pdf-lib";

export interface RitenutaPdfData {
  cognomeNome: string;
  totaleImponibile: number;
  rimborsoSpese: number;
  ritenutaAcconto: number;
  totaleNetto: number;
}

type FontWeight = "regular" | "bold";
type TextAlign = "left" | "right" | "center";

interface PdfTextBox {
  x: number;
  y: number;
  width: number;
  fontSize: number;
  align: TextAlign;
  weight: FontWeight;
}

/**
 * Il template PDF va copiato nella cartella public/ del progetto Vite.
 * Esempio:
 *
 * public/Template_ritenuta_acconto.pdf
 */
const TEMPLATE_FILE_NAME = "Template_ritenuta_acconto.pdf";

/**
 * Dimensione del template allegato: A4 portrait, circa 595.32 x 841.92 punti PDF.
 * Le coordinate sotto sono riferite a questa dimensione.
 */
const TEMPLATE_REFERENCE_WIDTH = 595.32;
const TEMPLATE_REFERENCE_HEIGHT = 841.92;

/**
 * Coordinate PDF: origine in basso a sinistra.
 *
 * Queste coordinate sono tarate sul template allegato.
 * Se modifichi il layout del PDF, dovrai eventualmente ritoccarle.
 */
const FIELD_BOXES: Record<keyof RitenutaPdfData, PdfTextBox> = {
  cognomeNome: {
    x: 73,
    y: 760,
    width: 180,
    fontSize: 10,
    align: "left",
    weight: "bold",
  },
  totaleImponibile: {
    x: 400,
    y: 360,
    width: 116,
    fontSize: 10,
    align: "right",
    weight: "regular",
  },
  rimborsoSpese: {
    x: 400,
    y: 332,
    width: 116,
    fontSize: 10,
    align: "right",
    weight: "regular",
  },
  ritenutaAcconto: {
    x: 400,
    y: 304,
    width: 116,
    fontSize: 10,
    align: "right",
    weight: "regular",
  },
  totaleNetto: {
    x: 400,
    y: 276,
    width: 116,
    fontSize: 10,
    align: "right",
    weight: "bold",
  },
};

function formatEuro(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function sanitizeFileName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a")
    .replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i")
    .replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildTemplateUrls(): string[] {
  /**
   * Primo path:
   * usa il BASE_URL di Vite.
   *
   * In produzione su GitHub Pages diventa:
   * /calcolo-ritenuta-d-acconto/Template_ritenuta_acconto.pdf
   *
   * In locale può diventare:
   * /calcolo-ritenuta-d-acconto/Template_ritenuta_acconto.pdf
   */
  const baseUrl = `${import.meta.env.BASE_URL}${TEMPLATE_FILE_NAME}`;

  /**
   * Secondo path:
   * fallback utile in sviluppo locale, quando il file viene servito direttamente da /public.
   */
  const rootUrl = `/${TEMPLATE_FILE_NAME}`;

  /**
   * Evita duplicati nel caso in cui BASE_URL sia già "/".
   */
  return Array.from(new Set([baseUrl, rootUrl]));
}

async function loadTemplateBytes(): Promise<ArrayBuffer> {
  const urls = buildTemplateUrls();

  for (const url of urls) {
    const response = await fetch(url);

    if (response.ok) {
      return response.arrayBuffer();
    }

    console.warn(
      `Template PDF non trovato all'URL: ${url}. Status: ${response.status} ${response.statusText}`
    );
  }

  throw new Error(
    `Impossibile caricare il template PDF. URL provati: ${urls.join(", ")}`
  );
}

function getScaledBox(
  box: PdfTextBox,
  pageWidth: number,
  pageHeight: number
): PdfTextBox {
  const scaleX = pageWidth / TEMPLATE_REFERENCE_WIDTH;
  const scaleY = pageHeight / TEMPLATE_REFERENCE_HEIGHT;

  return {
    ...box,
    x: box.x * scaleX,
    y: box.y * scaleY,
    width: box.width * scaleX,
    fontSize: box.fontSize * Math.min(scaleX, scaleY),
  };
}

function fitFontSize(text: string, font: PDFFont, requestedSize: number, maxWidth: number): number {
  let fontSize = requestedSize;

  while (fontSize > 7 && font.widthOfTextAtSize(text, fontSize) > maxWidth) {
    fontSize -= 0.5;
  }

  return fontSize;
}

function getTextX(text: string, box: PdfTextBox, font: PDFFont, fontSize: number): number {
  const textWidth = font.widthOfTextAtSize(text, fontSize);

  if (box.align === "right") {
    return box.x + box.width - textWidth;
  }

  if (box.align === "center") {
    return box.x + (box.width - textWidth) / 2;
  }

  return box.x;
}

function drawTextInBox(params: {
  text: string;
  box: PdfTextBox;
  regularFont: PDFFont;
  boldFont: PDFFont;
  page: ReturnType<PDFDocument["getPages"]>[number];
}): void {
  const { text, box, regularFont, boldFont, page } = params;
  const font = box.weight === "bold" ? boldFont : regularFont;
  const fontSize = fitFontSize(text, font, box.fontSize, box.width);
  const x = getTextX(text, box, font, fontSize);

  page.drawText(text, {
    x,
    y: box.y,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });
}

export function buildRitenutaFileName(cognomeNome?: string): string {
  const today = new Date().toISOString().slice(0, 10);
  const normalizedName = cognomeNome ? sanitizeFileName(cognomeNome) : "ritenuta";

  return `${normalizedName || "ritenuta"}-${today}.pdf`;
}

export async function generaRitenutaPdf(data: RitenutaPdfData): Promise<Blob> {
  const templateBytes = await loadTemplateBytes();
  const pdfDoc = await PDFDocument.load(templateBytes);

  const pages = pdfDoc.getPages();

  if (pages.length === 0) {
    throw new Error("Il template PDF non contiene pagine.");
  }

  const page = pages[0];
  const { width, height } = page.getSize();

  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const values: Record<keyof RitenutaPdfData, string> = {
    cognomeNome: data.cognomeNome.trim().toUpperCase(),
    totaleImponibile: formatEuro(data.totaleImponibile),
    rimborsoSpese: formatEuro(data.rimborsoSpese),
    ritenutaAcconto: formatEuro(data.ritenutaAcconto),
    totaleNetto: formatEuro(data.totaleNetto),
  };

  (Object.keys(values) as Array<keyof RitenutaPdfData>).forEach((fieldName) => {
    drawTextInBox({
      text: values[fieldName],
      box: getScaledBox(FIELD_BOXES[fieldName], width, height),
      regularFont,
      boldFont,
      page,
    });
  });

  const pdfBytes = await pdfDoc.save();

  return new Blob([pdfBytes], {
    type: "application/pdf",
  });
}

export function downloadPdf(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export async function condividiPdf(blob: Blob, fileName: string): Promise<boolean> {
  const file = new File([blob], fileName, { type: "application/pdf" });

  const shareData: ShareData = {
    title: "Ritenuta d'acconto",
    text: "Ritenuta d'acconto precompilata",
    files: [file],
  };

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share(shareData);
    return true;
  }

  return false;
}

export async function generaEScaricaRitenutaPdf(data: RitenutaPdfData): Promise<void> {
  const blob = await generaRitenutaPdf(data);
  downloadPdf(blob, buildRitenutaFileName(data.cognomeNome));
}
