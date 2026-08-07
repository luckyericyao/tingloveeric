import type { ImageAsset, WorldMapPlace } from "@/data/love";
import { getKvConfig, runKvCommand } from "@/lib/kvRest";

const worldKey = "tingloveeric:world-map";

export type SavedWorldMap = {
  overrides: Record<string, WorldMapPlace>;
  customPlaces: WorldMapPlace[];
};

type GlobalWorldStore = typeof globalThis & {
  __tingLoveWorldMap?: SavedWorldMap;
};

function emptyWorldMap(): SavedWorldMap {
  return { overrides: {}, customPlaces: [] };
}

function isImageAsset(value: unknown): value is ImageAsset {
  const image = value as Partial<ImageAsset>;
  return (
    typeof image.id === "string" &&
    typeof image.src === "string" &&
    typeof image.alt === "string" &&
    typeof image.caption === "string" &&
    typeof image.category === "string"
  );
}

export function isWorldMapPlace(value: unknown): value is WorldMapPlace {
  const place = value as Partial<WorldMapPlace>;
  return (
    typeof place.id === "string" &&
    place.id.length <= 120 &&
    typeof place.name === "string" &&
    place.name.length <= 160 &&
    typeof place.country === "string" &&
    place.country.length <= 120 &&
    (place.status === "visited" || place.status === "wishlist") &&
    typeof place.note === "string" &&
    place.note.length <= 500 &&
    typeof place.wish === "string" &&
    place.wish.length <= 500 &&
    typeof place.lat === "number" &&
    Number.isFinite(place.lat) &&
    place.lat >= -90 &&
    place.lat <= 90 &&
    typeof place.lng === "number" &&
    Number.isFinite(place.lng) &&
    place.lng >= -180 &&
    place.lng <= 180 &&
    (place.date === undefined || typeof place.date === "string") &&
    isImageAsset(place.image)
  );
}

export function sanitizeWorldMap(value: unknown): SavedWorldMap {
  const candidate = value as Partial<SavedWorldMap> | null;
  const overrides =
    candidate && candidate.overrides && typeof candidate.overrides === "object"
      ? Object.fromEntries(
          Object.entries(candidate.overrides)
            .filter(([, place]) => isWorldMapPlace(place))
            .slice(0, 100),
        ) as Record<string, WorldMapPlace>
      : {};
  const customPlaces =
    candidate && Array.isArray(candidate.customPlaces)
      ? candidate.customPlaces.filter(isWorldMapPlace).slice(0, 100)
      : [];

  return { overrides, customPlaces };
}

export function isWorldMapStatePayload(value: unknown): value is SavedWorldMap {
  const candidate = value as Partial<SavedWorldMap> | null;
  return Boolean(
    candidate &&
      typeof candidate === "object" &&
      !Array.isArray(candidate) &&
      candidate.overrides &&
      typeof candidate.overrides === "object" &&
      !Array.isArray(candidate.overrides) &&
      Array.isArray(candidate.customPlaces),
  );
}

function memoryWorldMap() {
  const worldGlobal = globalThis as GlobalWorldStore;

  if (!worldGlobal.__tingLoveWorldMap) {
    worldGlobal.__tingLoveWorldMap = emptyWorldMap();
  }

  return worldGlobal.__tingLoveWorldMap;
}

export function worldPersistenceMode() {
  return getKvConfig() ? "redis" : "memory";
}

export async function getWorldMapState() {
  if (!getKvConfig()) {
    return sanitizeWorldMap(memoryWorldMap());
  }

  const saved = await runKvCommand<string | null>(["GET", worldKey]);

  if (!saved) {
    const initial = emptyWorldMap();
    await runKvCommand<string>(["SET", worldKey, JSON.stringify(initial)]);
    return initial;
  }

  return sanitizeWorldMap(JSON.parse(saved) as unknown);
}

export async function saveWorldMapState(value: unknown) {
  const nextState = sanitizeWorldMap(value);

  if (!getKvConfig()) {
    const worldGlobal = globalThis as GlobalWorldStore;
    worldGlobal.__tingLoveWorldMap = nextState;
    return nextState;
  }

  await runKvCommand<string>(["SET", worldKey, JSON.stringify(nextState)]);
  return nextState;
}
