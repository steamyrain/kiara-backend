import LokasiEntity from "./LokasiEntity";

interface DokumentasiEntity extends LokasiEntity {
  NamaFile: string;
}

type DokumentasiEntities = Array<DokumentasiEntity>;

export { DokumentasiEntity as default, DokumentasiEntities };
