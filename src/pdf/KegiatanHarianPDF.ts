import PDFDocument from "pdfkit";
import { DateTime } from "luxon";
import KegiatanEntity from "../entities/KegiatanEntity";
import TenagaKerjaEntity from "../entities/TenagaKerjaEntity";

const KegiatanHarianPDF = (
  onData: (...args: any[]) => void,
  onEnd: (...args: any[]) => void,
  kegiatan: KegiatanEntity
) => {
  const doc = new PDFDocument({ bufferPages: true });
  doc.on("data", onData);
  doc.on("end", onEnd);
  doc
    .font("Times-Bold")
    .fontSize(10)
    .text("LAPORAN KEGIATAN HARIAN", { align: "center" });
  doc.font("Times-Roman").fontSize(10).text(`Uraian : ${kegiatan.Uraian}`);
  doc.font("Times-Roman").fontSize(10).text(`Lokasi : ${kegiatan.Lokasi}`);
  doc
    .font("Times-Roman")
    .fontSize(10)
    .text(
      `Waktu: ${kegiatan.TanggalWaktuAwal.setLocale("id").toLocaleString(
        DateTime.DATETIME_FULL
      )} s.d. ${kegiatan.TanggalWaktuAkhir.setLocale("id").toLocaleString(
        DateTime.DATETIME_FULL
      )}`
    );
  doc
    .font("Times-Roman")
    .fontSize(10)
    .text(`Keterangan : ${kegiatan.Keterangan}`);
  kegiatan.TenagaKerjas.forEach((tk: TenagaKerjaEntity) => {
    doc.font("Times-Roman").fontSize(10).text(`${tk.Jenis}: ${tk.Jumlah}`);
  });
  doc.end();
};

export default KegiatanHarianPDF;
