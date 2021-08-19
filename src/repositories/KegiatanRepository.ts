import {
  KegiatanOutputPort,
  KegiatanInputPort,
} from "../usecases/KegiatanPort";

interface KegiatanRepository {
  getKegiatan(kegiatanId: number): Promise<KegiatanOutputPort>;
  setKegiatan(kegiatan: KegiatanInputPort): Promise<void>;
}

export { KegiatanRepository as default };
