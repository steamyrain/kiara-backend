import { DateTime } from "luxon";
import { Expose, Transform, TransformFnParams, Type } from "class-transformer";
import "reflect-metadata";
import { IsLuxonDateTime } from "../commons/validations/IsLuxonDateTime";
import TenagaKerjaEntity, { TenagaKerjaEntities } from "./TenagaKerjaEntity";

class KegiatanEntity {
  KegiatanId?: number;

  @Type(() => DateTime)
  @Transform((data: TransformFnParams) => DateTime.fromJSDate(data.value), {
    toClassOnly: true,
  })
  @Expose()
  TanggalWaktuAwal: DateTime;

  @Type(() => DateTime)
  @Transform((data: TransformFnParams) => DateTime.fromJSDate(data.value), {
    toClassOnly: true,
  })
  @Expose()
  TanggalWaktuAkhir: DateTime;

  @Expose() Uraian: string;
  @Expose() Lokasi: string;
  @Expose() Keterangan: string;
  @Type(() => TenagaKerjaEntity)
  @Expose()
  TenagaKerjas: TenagaKerjaEntities;

  constructor(
    KegiatanId: number,
    TanggalWaktuAwal: DateTime,
    TanggalWaktuAkhir: DateTime,
    Uraian: string,
    Lokasi: string,
    Keterangan: string,
    TenagaKerjas: TenagaKerjaEntities
  ) {
    this.KegiatanId = KegiatanId;
    this.TanggalWaktuAwal = TanggalWaktuAwal;
    this.TanggalWaktuAkhir = TanggalWaktuAkhir;
    this.Uraian = Uraian;
    this.Lokasi = Lokasi;
    this.Keterangan = Keterangan;
    this.TenagaKerjas = TenagaKerjas;
  }
}

export default KegiatanEntity;
