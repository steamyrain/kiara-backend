import PDFDocument from "pdfkit";
import {DateTime} from 'luxon';
import KegiatanEntity from "../entities/KegiatanEntity";

const KegiatanHarianPDF = (
  onData: (...args: any[]) => void,
  onEnd: (...args: any[]) => void,
  kegiatans:  KegiatanEntity[]
) => {
  const doc = new PDFDocument({ bufferPages: true });
  doc.on("data", onData);
  doc.on("end", onEnd);
  doc
    .font("Times-Bold")
    .fontSize(10)
    .text("LAPORAN KEGIATAN HARIAN", { align: "center" });
  kegiatans.forEach((kegiatan)=>{
    doc
      .font("Times-Roman")
      .fontSize(10)
      .text(`Uraian : ${kegiatan.Uraian}`);
    doc
      .font("Times-Roman")
      .fontSize(10)
      .text(`Lokasi : ${kegiatan.Lokasi}`);
    doc
      .font("Times-Roman")
      .fontSize(10)
      .text(`Waktu: ${kegiatan.TanggalWaktuAwal.setLocale('id').toLocaleString(DateTime.DATETIME_FULL)} s.d. ${kegiatan.TanggalWaktuAkhir.setLocale('id').toLocaleString(DateTime.DATETIME_FULL)}`)
    doc
      .font("Times-Roman")
      .fontSize(10)
      .text(`Keterangan : ${kegiatan.Keterangan}`);
  })
  doc.end();
};

export default KegiatanHarianPDF;
