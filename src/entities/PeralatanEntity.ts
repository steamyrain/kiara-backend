interface PeralatanEntity {
  Jenis: string;
  Jumlah: number;
}

type PeralatanEntities = Array<PeralatanEntity>;

export { PeralatanEntity as default, PeralatanEntities };
