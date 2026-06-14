declare module "china-division" {
  export const provinces: { code: string; name: string }[];
  export const cities: { code: string; name: string; provinceCode: string }[];
  export const areas: { code: string; name: string; cityCode: string; provinceCode: string }[];
  export const streets: unknown[];
  export const villages: unknown[];
  export const pc: Record<string, string[]>;
  export const pcC: Record<string, string[]>;
  export const pca: Record<string, Record<string, string[]>>;
  export const pcaC: Record<string, Record<string, string[]>>;
  export const pcas: string[][];
  export const pcasC: string[][];
}
