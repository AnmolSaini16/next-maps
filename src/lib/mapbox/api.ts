import { LocationSuggestion, LocationFeature } from "./utils";

const MAPBOX_API_BASE = "https://api.mapbox.com/search/searchbox/v1";

function getSessionToken(): string {
  if (typeof window !== "undefined") {
    const stored = sessionStorage.getItem("mapbox_session_token");
    if (stored) return stored;

    const token = process.env.NEXT_PUBLIC_MAPBOX_SESSION_TOKEN ?? "";
    sessionStorage.setItem("mapbox_session_token", token);
    return token;
  }
  return "";
}

export interface SearchOptions {
  query: string;
  country?: string;
  limit?: number;
  proximity?: [number, number]; // [longitude, latitude]
  signal?: AbortSignal;
}

export interface SearchResponse {
  suggestions: LocationSuggestion[];
}

export interface RetrieveResponse {
  features: LocationFeature[];
}

export async function searchLocations(
  options: SearchOptions
): Promise<LocationSuggestion[]> {
  const { query, country = "US", limit = 5, proximity, signal } = options;

  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!accessToken) {
    throw new Error("MAPBOX_TOKEN is not configured");
  }

  const sessionToken = getSessionToken();
  const params = new URLSearchParams({
    q: query,
    access_token: accessToken,
    session_token: sessionToken,
    country,
    limit: limit.toString(),
  });

  if (proximity) {
    params.append("proximity", `${proximity[0]},${proximity[1]}`);
  }

  const url = `${MAPBOX_API_BASE}/suggest?${params.toString()}`;

  try {
    const response = await fetch(url, { signal });

    if (!response.ok) {
      throw new Error(
        `Mapbox API error: ${response.status} ${response.statusText}`
      );
    }

    const data: SearchResponse = await response.json();
    return data.suggestions ?? [];
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    if (error instanceof Error) {
      throw new Error(`Failed to search locations: ${error.message}`);
    }
    throw new Error("Failed to search locations: Unknown error");
  }
}

export async function retrieveLocation(
  mapboxId: string,
  signal?: AbortSignal
): Promise<LocationFeature[]> {
  const accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!accessToken) {
    throw new Error("MAPBOX_TOKEN is not configured");
  }

  const sessionToken = getSessionToken();
  const url = `${MAPBOX_API_BASE}/retrieve/${mapboxId}?access_token=${accessToken}&session_token=${sessionToken}`;

  try {
    const response = await fetch(url, { signal });

    if (!response.ok) {
      throw new Error(
        `Mapbox API error: ${response.status} ${response.statusText}`
      );
    }

    const data: RetrieveResponse = await response.json();
    return data.features ?? [];
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    if (error instanceof Error) {
      throw new Error(`Failed to retrieve location: ${error.message}`);
    }
    throw new Error("Failed to retrieve location: Unknown error");
  }
}
