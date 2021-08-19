interface KegiatanInputPort {
  TanggalWaktuAwal: string;
  TanggalWaktuAkhir: string;
  Uraian: string;
  Lokasi: string;
  Keterangan: string;
}

interface KegiatanOutputPort {
  KegiatanId?: number;
  TanggalWaktuAwal: string;
  TanggalWaktuAkhir: string;
  Uraian: string;
  Lokasi: string;
  Keterangan: string;
}

const isKegiatanInputPort = (
  data: KegiatanInputPort
): data is KegiatanInputPort => {
  return (
    data.TanggalWaktuAwal !== undefined &&
    data.TanggalWaktuAkhir !== undefined &&
    data.Uraian !== undefined &&
    data.Lokasi !== undefined &&
    data.Keterangan !== undefined
  );
};

export { KegiatanInputPort, KegiatanOutputPort, isKegiatanInputPort };
