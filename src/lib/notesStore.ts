import type { LoveNote } from "@/data/love";
import { getKvConfig, runKvCommand } from "@/lib/kvRest";

const notesKey = "tingloveeric:notes";
const entriesKey = "tingloveeric:notes:v2";

type StoredEntry = { note: LoveNote; savedAt: number };

export class NotesStorageUnavailable extends Error {
  constructor() { super("Letter storage is not configured"); }
}

export class NoteIdentityConflict extends Error {
  constructor() { super("This letter identity is already in use"); }
}

export function isLoveNote(value: unknown): value is LoveNote {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const note = value as Partial<LoveNote>;
  return (
    typeof note.id === "string" &&
    note.id.length <= 120 &&
    typeof note.author === "string" &&
    note.author.length <= 80 &&
    typeof note.date === "string" &&
    note.date.length <= 40 &&
    typeof note.content === "string" &&
    note.content.trim().length > 0 &&
    note.content.length <= 500 &&
    (note.mood === undefined || (typeof note.mood === "string" && note.mood.length <= 30))
  );
}

export function sanitizeNotes(value: unknown) {
  return Array.isArray(value) ? value.filter(isLoveNote) : [];
}

export function notesPersistenceMode() {
  return getKvConfig() ? "redis" : "unavailable";
}

export async function getNotes() {
  if (!getKvConfig()) throw new NotesStorageUnavailable();

  // Read the legacy archive without migrating, truncating, or overwriting it.
  const saved = await runKvCommand<string | null>(["GET", notesKey]);
  const legacy: unknown = saved === null ? [] : JSON.parse(saved);
  if (!Array.isArray(legacy)) throw new Error("Invalid legacy letter archive");
  const values = await runKvCommand<string[]>(["HGETALL", entriesKey]);
  if (!Array.isArray(values) || values.length % 2 !== 0 || values.some(value => typeof value !== "string")) {
    throw new Error("Invalid letter storage response");
  }
  const entries: StoredEntry[] = [];
  for (let index = 1; index < values.length; index += 2) {
    const entry: unknown = JSON.parse(values[index]);
    if (!entry || typeof entry !== "object" || !("note" in entry) || !("savedAt" in entry) ||
      !isLoveNote(entry.note) || typeof entry.savedAt !== "number" || !Number.isFinite(entry.savedAt)) {
      throw new Error("Invalid stored letter");
    }
    entries.push(entry as StoredEntry);
  }
  entries.sort((left, right) => right.savedAt - left.savedAt || left.note.id.localeCompare(right.note.id));
  const notes = new Map<string, LoveNote>();
  for (const note of [...entries.map(entry => entry.note), ...sanitizeNotes(legacy)]) {
    if (!notes.has(note.id)) notes.set(note.id, note);
  }
  return [...notes.values()];
}

export async function addNote(note: LoveNote) {
  if (!getKvConfig()) throw new NotesStorageUnavailable();
  if (!isLoveNote(note)) throw new Error("Invalid letter");
  // One native atomic insert per letter avoids whole-array lost updates.
  const inserted = await runKvCommand<number>([
    "HSETNX", entriesKey, note.id, JSON.stringify({ note, savedAt: Date.now() }),
  ]);
  if (inserted === 0) {
    const existing = await runKvCommand<string | null>(["HGET", entriesKey, note.id]);
    const stored = existing ? JSON.parse(existing) as StoredEntry : null;
    const sameNote = stored && ["author", "date", "content", "mood", "visibility", "source"].every(
      field => stored.note[field as keyof LoveNote] === note[field as keyof LoveNote],
    );
    if (!sameNote) throw new NoteIdentityConflict();
  } else if (inserted !== 1) {
    throw new Error("Letter storage did not confirm the insert");
  }
  return getNotes();
}
