import { API } from "../src/config/env";

export interface FilterOption {
  id: number;
  value: string;     //  <-- 🔥 ADD THIS
  libelle: string;
  group: string;
}

export type FilterGroup = {
  groupLabel: string;
  group: string;
  options: FilterOption[];
};

export async function fetchFilterGroups(type: string): Promise<FilterGroup[]> {
  const url = `${API.BASE_URL}/filters/by-business-type?businessType=${type.toUpperCase()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Unable to fetch filters");
  }

  return res.json();
}


export async function fetchMyFilters(): Promise<FilterOption[]> {
  const url = `${API.BASE_URL}/filters/me`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Unable to fetch selected filters");
  return res.json();
}

export async function updateMyFilters(ids: number[]): Promise<void> {
  const url = `${API.BASE_URL}/filters/me`;
  await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filterIds: ids }),
  });
}
