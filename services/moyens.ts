// src/services/moyens.ts
import { API } from "../src/config/env";

export interface Moyen {
  id: string;
  name: string;
  image: string;
}

export const fetchGlobalMoyens = async (): Promise<Moyen[]> => {
  const res = await fetch(`${API.BASE_URL}/moyens`);
  if (!res.ok) throw new Error('Failed to fetch moyens');
  return await res.json();
};
