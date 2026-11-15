import type { ImageAsset, WorldMapPlace } from "@/data/love";

export type SavedWorldMap = {
  overrides: Record<string, WorldMapPlace>;
  customPlaces: WorldMapPlace[];
};

export type WorldMapSnapshot = SavedWorldMap & { revision: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isText(value: unknown, maxLength: number): value is string {
  return typeof value === "string" && value.length <= maxLength;
}

function isImageAsset(value: unknown): value is ImageAsset {
  return isRecord(value) &&
    isText(value.id, 120) &&
    isText(value.src, 1024) && value.src.startsWith("/") && !value.src.startsWith("//") &&
    isText(value.alt, 500) &&
    isText(value.caption, 500) &&
    isText(value.category, 120);
}

function isCoordinate(value: unknown, limit: number) {
  return typeof value === "number" && Number.isFinite(value) && Math.abs(value) <= limit;
}

function isWorldMapPlace(value: unknown): value is WorldMapPlace {
  return isRecord(value) &&
    isText(value.id, 120) && value.id.length > 0 &&
    isText(value.name, 160) && value.name.trim().length > 0 &&
    isText(value.country, 120) && value.country.trim().length > 0 &&
    (value.status === "visited" || value.status === "wishlist") &&
    isText(value.note, 500) &&
    isText(value.wish, 500) &&
    isCoordinate(value.lat, 90) &&
    isCoordinate(value.lng, 180) &&
    (value.date === undefined || isText(value.date, 40)) &&
    (value.cityZh === undefined || isText(value.cityZh, 160)) &&
    (value.landmark === undefined || isText(value.landmark, 500)) &&
    (value.featured === undefined || typeof value.featured === "boolean") &&
    (value.markerOffset === undefined || (Array.isArray(value.markerOffset) && value.markerOffset.length === 2 &&
      value.markerOffset.every(offset => typeof offset === "number" && Number.isFinite(offset)))) &&
    isImageAsset(value.image);
}

export function isWorldMapStatePayload(value: unknown): value is SavedWorldMap {
  if (!isRecord(value) || !isRecord(value.overrides) || !Array.isArray(value.customPlaces)) return false;
  const overrides = Object.entries(value.overrides);
  if (overrides.length > 100 || value.customPlaces.length > 100) return false;
  if (!overrides.every(([id, place]) => isWorldMapPlace(place) && place.id === id)) return false;
  const ids = new Set(overrides.map(([id]) => id));
  for (const place of value.customPlaces) {
    if (!isWorldMapPlace(place) || ids.has(place.id)) return false;
    ids.add(place.id);
  }
  return true;
}

export function isWorldMapRevision(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
}
