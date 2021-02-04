export enum Provinces {
  BCN = "BCN",
  LLE = "LLE",
  GIR = "GIR",
  TAR = "TAR",
}

export const sitsByProvince: Record<Provinces, number> = {
  [Provinces.BCN]: 85,
  [Provinces.TAR]: 18,
  [Provinces.GIR]: 17,
  [Provinces.LLE]: 15,
}
