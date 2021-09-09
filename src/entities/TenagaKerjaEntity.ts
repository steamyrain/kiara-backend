import { Expose, Exclude } from "class-transformer";
import "reflect-metadata";

class TenagaKerjaEntity {
  @Exclude() TenagaKerjaId: number;
  @Expose({ name: "kerja" }) Jenis: string;
  @Expose() Jumlah?: number | undefined;

  constructor(TenagaKerjaId: number, Jenis: string) {
    this.Jenis = Jenis;
    this.TenagaKerjaId = TenagaKerjaId;
  }
}

type TenagaKerjaEntities = TenagaKerjaEntity[];

export { TenagaKerjaEntity as default, TenagaKerjaEntities };
