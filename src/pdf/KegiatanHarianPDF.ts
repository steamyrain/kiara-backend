import PDFDocument from "pdfkit";

const KegiatanHarianPDF = (
  onData: (...args: any[]) => void,
  onEnd: (...args: any[]) => void
) => {
  const doc = new PDFDocument({ bufferPages: true });
  doc.on("data", onData);
  doc.on("end", onEnd);
  doc.font("Times-Roman").fontSize(12).text("Hello World");
  doc.end();
};

export default KegiatanHarianPDF;
