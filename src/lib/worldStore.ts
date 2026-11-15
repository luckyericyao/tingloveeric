import { createHash } from "node:crypto";
import { getKvConfig, runKvCommand } from "@/lib/kvRest";
import { isWorldMapStatePayload, type SavedWorldMap, type WorldMapSnapshot } from "@/lib/worldMapSchema";

const worldKey = "tingloveeric:world-map";

// Keep the existing JSON value and compare the exact bytes inside Redis.
const compareAndSave = `
local current = redis.call('GET', KEYS[1])
if current == ARGV[3] then return 1 end
if (ARGV[1] == 'missing' and current == false) or (ARGV[1] == 'present' and current == ARGV[2]) then
  redis.call('SET', KEYS[1], ARGV[3])
  return 1
end
return 0
`;

export class WorldMapConflict extends Error {}
export class WorldMapStorageUnavailable extends Error {}

function revisionOf(raw: string | null) {
  return createHash("sha256").update(raw === null ? "missing" : `value:${raw}`).digest("hex");
}

async function readSnapshot(): Promise<{ raw: string | null; snapshot: WorldMapSnapshot }> {
  if (!getKvConfig()) throw new WorldMapStorageUnavailable();
  const raw = await runKvCommand<string | null>(["GET", worldKey]);
  const state: unknown = raw === null ? { overrides: {}, customPlaces: [] } : JSON.parse(raw);
  if (!isWorldMapStatePayload(state)) throw new Error("Invalid stored map");
  return { raw, snapshot: { ...state, revision: revisionOf(raw) } };
}

export async function getWorldMapState() {
  return (await readSnapshot()).snapshot;
}

export async function saveWorldMapState(state: SavedWorldMap, revision: string): Promise<WorldMapSnapshot> {
  const { raw, snapshot } = await readSnapshot();
  const next = { overrides: state.overrides, customPlaces: state.customPlaces };
  const encoded = JSON.stringify(next);
  // An identical retry can acknowledge a save whose response was lost.
  if (raw === encoded) return snapshot;
  if (snapshot.revision !== revision) throw new WorldMapConflict();
  const result = await runKvCommand<number>([
    "EVAL", compareAndSave, 1, worldKey, raw === null ? "missing" : "present", raw ?? "", encoded,
  ]);
  if (result === 0) throw new WorldMapConflict();
  if (result !== 1) throw new Error("Map save not acknowledged");
  return { ...next, revision: revisionOf(encoded) };
}
