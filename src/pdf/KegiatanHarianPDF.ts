import PDFDocument from "pdfkit";

const KegiatanHarianPDF = (
  onData: (...args: any[]) => void,
  onEnd: (...args: any[]) => void
) => {
  const doc = new PDFDocument({ bufferPages: true });
  doc.on("data", onData);
  doc.on("end", onEnd);
  doc
    .font("Times-Bold")
    .fontSize(10)
    .text("LAPORAN KEGIATAN HARIAN", { align: "center" });
  doc.end();
};

export default KegiatanHarianPDF;
