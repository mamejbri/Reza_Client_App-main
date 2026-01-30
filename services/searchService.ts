// src/services/searchService.ts

import { API } from "../src/config/env";

export type Place = {
  id: string;
  name: string;
  address: string;
  city: string;
  images: string[];
  location: { lat: number; lng: number };
  category_id: string;
  rating?: number;
  reviews?: any[];
  available_slots?: Record<string, { time: string; reserved_by?: string }[]>;
};

export const getPlacesByQuery = async (
  query?: string | null,
  categoryName?: string
): Promise<Place[]> => {
  try {
    const [placesRes, categoriesRes] = await Promise.all([
      fetch(`${API.BASE_URL}/places`),
      fetch(`${API.BASE_URL}/categories`),
    ]);

    if (!placesRes.ok || !categoriesRes.ok) {
      throw new Error('Failed to fetch places/categories');
    }

    const [places, categories] = await Promise.all([
      placesRes.json(),
      categoriesRes.json(),
    ]);

    let filteredPlaces: Place[] = places;

    // Filter by query (city or name)
    const q = query?.trim();
    if (q) {
      const queryLower = q.toLowerCase();
      filteredPlaces = filteredPlaces.filter((place: any) => {
        const cityMatch = place.city?.toLowerCase() === queryLower;

        const fullNameMatch = place.name?.toLowerCase() === queryLower;

        const nameWords = (place.name ?? '').toLowerCase().split(/\s+/);
        const nameWordMatch = nameWords.some(
          (word: string) =>
            word === queryLower ||
            (word.startsWith(queryLower) && queryLower.length >= 4)
        );

        return cityMatch || fullNameMatch || nameWordMatch;
      });
    }

    // Filter by category
    if (categoryName) {
      const matchingCategory = categories.find(
        (cat: any) => cat.name?.toLowerCase() === categoryName.toLowerCase()
      );
      if (matchingCategory) {
        filteredPlaces = filteredPlaces.filter(
          (place: any) => place.category_id === matchingCategory.id
        );
      }
    }

    return filteredPlaces as Place[];
  } catch (error) {
    console.error('Error fetching places by query:', error);
    return [];
  }
};
