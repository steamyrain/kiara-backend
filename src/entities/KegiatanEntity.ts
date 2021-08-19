import { DateTime } from "luxon";
import { Expose, Transform, TransformFnParams, Type } from "class-transformer";
import "reflect-metadata";
import { IsLuxonDateTime } from "../commons/validations/IsLuxonDateTime";

class KegiatanEntity {
  KegiatanId?: number;

  @IsLuxonDateTime()
  @Type(() => Date)
  @Transform((data: TransformFnParams) => DateTime.fromJSDate(data.value), {
    toClassOnly: true,
  })
  TanggalWaktuAwal: DateTime;

  @IsLuxonDateTime()
  @Type(() => Date)
  @Transform((data: TransformFnParams) => DateTime.fromJSDate(data.value), {
    toClassOnly: true,
  })
  TanggalWaktuAkhir: DateTime;

  @Expose() Uraian: string;
  @Expose() Lokasi: string;
  @Expose() Keterangan: string;

  constructor(
    TanggalWaktuAwal: DateTime,
    TanggalWaktuAkhir: DateTime,
    Uraian: string,
    Lokasi: string,
    Keterangan: string
  ) {
    this.TanggalWaktuAwal = TanggalWaktuAwal;
    this.TanggalWaktuAkhir = TanggalWaktuAkhir;
    this.Uraian = Uraian;
    this.Lokasi = Lokasi;
    this.Keterangan = Keterangan;
  }
}

export default KegiatanEntity;
