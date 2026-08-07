import type { LoveNote } from "@/data/love";
import { getKvConfig, runKvCommand } from "@/lib/kvRest";

const notesKey = "tingloveeric:notes";

type GlobalNotesStore = typeof globalThis & {
  __tingLoveNotes?: LoveNote[];
};

export function isLoveNote(value: unknown): value is LoveNote {
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
  return Array.isArray(value) ? value.filter(isLoveNote).slice(0, 100) : [];
}

function memoryNotes() {
  const notesGlobal = globalThis as GlobalNotesStore;

  if (!notesGlobal.__tingLoveNotes) {
    notesGlobal.__tingLoveNotes = [];
  }

  return notesGlobal.__tingLoveNotes;
}

export function notesPersistenceMode() {
  return getKvConfig() ? "redis" : "memory";
}

export async function getNotes() {
  if (!getKvConfig()) {
    return [...memoryNotes()];
  }

  const saved = await runKvCommand<string | null>(["GET", notesKey]);
  if (!saved) {
    await runKvCommand<string>(["SET", notesKey, JSON.stringify([])]);
    return [];
  }

  return sanitizeNotes(JSON.parse(saved) as unknown);
}

export async function saveNotes(value: unknown) {
  const nextNotes = sanitizeNotes(value);

  if (!getKvConfig()) {
    const notesGlobal = globalThis as GlobalNotesStore;
    notesGlobal.__tingLoveNotes = nextNotes;
    return nextNotes;
  }

  await runKvCommand<string>(["SET", notesKey, JSON.stringify(nextNotes)]);
  return nextNotes;
}

export async function addNote(note: LoveNote) {
  const notes = await getNotes();
  return saveNotes([note, ...notes]);
}
