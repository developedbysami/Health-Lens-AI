import * as pdfjslib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min?url";

pdfjslib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const extractTextFromPdf = async (file) => {
  const fileArrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjslib.getDocument({ data: fileArrayBuffer }).promise;
  
  const textPages = await Promise.all(
    Array.from({ length: pdf.numPages }, async (_, i) => {
      const page = await pdf.getPage(i + 1);
      const content = await page.getTextContent();
      return content.items.map((item) => item.str).join(" ");
    })
  );
  
  return textPages.join("\n").trim();
};