interface LokasiEntity {
  Latitude: number;
  Longitude: number;
}

function isLokasiEntity(data: LokasiEntity): data is LokasiEntity {
  return data!.Latitude && data!.Longitude ? true : false;
}

export { LokasiEntity as default, isLokasiEntity };
