// src/services/etablissements.ts
import http from '../src/api/http';
import { API } from '../src/config/env';
import { EstablishmentType } from '../types/establishment';

export type OpeningHoursDto = {
  day?: string | null;          // "MONDAY"..."SUNDAY"
  morningOpen?: string | null;  // "HH:mm"
  morningClose?: string | null; // "HH:mm"
  eveningOpen?: string | null;  // "HH:mm"
  eveningClose?: string | null; // "HH:mm"
};

export type NearbyEtablissementDTO = EtablissementDTO & {
  distanceKm?: number | null;
};

export interface EtablissementDTO {
  id: number;
  nom: string;
  lieu?: string | null;
  businessType: EstablishmentType;
  crenau?: number | null;
  crenauValeur?: "MINUTE" | "HOUR" | "DAY" | "MONTH" | null;
  imageUrl?: string | null;
  photoPaths?: string[] | null;
  menuPhotoPaths?: string[] | null;
  description?: string | null;

  image?: string | null;
  cover?: string | null;
  mainImage?: string | null;
  photo?: string | null;
photos?: {
    id: number;
    url: string;
    menuPhoto: boolean;
    primary: boolean;
    [key: string]: any;
  }[];
  address?: string | null;
  averageRating?: number | null;
  reviewCount?: number | null;

  /** unified fields: allow null too */
  rating?: number | null;
  reviewsCount?: number | null;

  priceRange?: string | null;

  openingHours?: OpeningHoursDto[] | null;
  todayHours?: OpeningHoursDto | null;

  nextSlots?: string[] | null;

   priseRdvMinValeur?: number | null;
  priseRdvMinUnite?: "MINUTE" | "HOUR" | "DAY" | "MONTH" | null;

  priseRdvMaxValeur?: number | null;
  priseRdvMaxUnite?: "MINUTE" | "HOUR" | "DAY" | "MONTH" | null;

  annulationRdvValeur?: number | null;
  annulationRdvUnite?: "MINUTE" | "HOUR" | "DAY" | "MONTH" | null;
}


export interface PageResult<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export async function fetchEtablissementsByTypes(
  types: EstablishmentType[] | EstablishmentType,
  page = 0,
  size = 10,
  sortBy = 'nom'
): Promise<PageResult<EtablissementDTO>> {
  const list = Array.isArray(types) ? types : [types];
  const params = new URLSearchParams();

  list.forEach((t) => params.append('types', t));

  const base = API.BASE_URL.replace(/\/+$/, '');
  const url =
    `${base}/etablissements/find_type/` +
    `${page}/${size}/${encodeURIComponent(sortBy)}?${params.toString()}`;


  const { data } = await http.get<PageResult<EtablissementDTO>>(url);

  return data;
}
export async function fetchNearbyEtablissements(
  businessType: EstablishmentType,
  lat: number,
  lng: number,
  radiusKm: number,
  page = 0,
  size = 20
): Promise<PageResult<NearbyEtablissementDTO>> {
  const base = API.BASE_URL.replace(/\/+$/, '');

  const params = new URLSearchParams();
  params.set('businessType', businessType);
  params.set('lat', String(lat));
  params.set('lng', String(lng));
  params.set('radiusKm', String(radiusKm));
  params.set('page', String(page));
  params.set('size', String(size));

  const url = `${base}/etablissements/nearby?${params.toString()}`;


  const { data } = await http.get<PageResult<NearbyEtablissementDTO>>(url);


  return data;
}

export async function fetchEtablissementById(
  id: number
): Promise<EtablissementDTO> {
  const base = API.BASE_URL.replace(/\/+$/, '');
  const url = `${base}/etablissements/find/by/id/${id}`;


  const { data } = await http.get<EtablissementDTO>(url);

  const photos = Array.isArray((data as any).photos)
    ? (data as any).photos.map((p: any) => ({
        id: p.id,
        url: p.url,
        primary: p.primary,
        menuPhoto: p.menuPhoto,
      }))
    : null;



  return data;
}


export async function fetchSearchEtablissements(req: any): Promise<PageResult<EtablissementDTO>> {
  const base = API.BASE_URL.replace(/\/+$/, '');
  const url = `${base}/etablissements/search`;

  const { data } = await http.post<PageResult<EtablissementDTO>>(url, req);
  return data;
}

