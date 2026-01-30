// src/types/establishment.ts
export enum EstablishmentType {
  SPA = 'SPA',
  RESTAURANT = 'RESTAURANT',
  ACTIVITY = 'ACTIVITY',
}

export const ESTABLISHMENT_LABELS: Record<EstablishmentType, string> = {
  [EstablishmentType.SPA]: 'Beauté & Bien-être',
  [EstablishmentType.RESTAURANT]: 'Restaurant',
  [EstablishmentType.ACTIVITY]: 'Activité',
};
