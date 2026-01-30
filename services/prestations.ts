import http from '../src/api/http';
import { API } from '../src/config/env';

export interface PrestationCategorie {
  id: number;
  nom: string;
  description?: string;
}

export interface Prestation {
  id: number;
  nom: string;
  description: string;
  prixFixe: number | null;
  prixMin: number | null;
  prixMax: number | null;
  durationMinutes: number | null;
  preparationTimeMinutes: number | null;
  categorieId: number;
  categorieNom: string;
}

export interface PageResult<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
}

export async function fetchCategories(etablissementId: number): Promise<PrestationCategorie[]> {
  const url = `${API.BASE_URL}/prestation-categories/etablissement/${etablissementId}?page=0&size=50&sort=id,desc`;
  const { data } = await http.get<PageResult<PrestationCategorie>>(url);
  return data.content;
}

export async function fetchPrestationsByCategory(categorieId: number): Promise<Prestation[]> {
  const url = `${API.BASE_URL}/prestations/categorie/${categorieId}`;
  const { data } = await http.get<Prestation[]>(url);
  return data;
}
