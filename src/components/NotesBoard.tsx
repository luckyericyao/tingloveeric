"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { LoveNote } from "@/data/love";
import { NoteCard } from "./NoteCard";
import { NoteComposer } from "./NoteComposer";

const storageKey = "tingloveeric.notes";
const emptyNotes: LoveNote[] = [];
let lastRawNotes = "";
let lastParsedNotes: LoveNote[] = emptyNotes;

function readStoredNotes() {
  if (typeof window === "undefined") {
    return emptyNotes;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      lastRawNotes = "";
      lastParsedNotes = emptyNotes;
      return lastParsedNotes;
    }

    if (raw === lastRawNotes) {
      return lastParsedNotes;
    }

    const parsed = JSON.parse(raw) as LoveNote[];
    lastRawNotes = raw;
    lastParsedNotes = Array.isArray(parsed) ? parsed : [];
    return lastParsedNotes;
  } catch {
    lastRawNotes = "";
    lastParsedNotes = emptyNotes;
    return lastParsedNotes;
  }
}

function getServerNotesSnapshot() {
  return emptyNotes;
}

function subscribeToNotes(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("tingloveeric-notes", callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("tingloveeric-notes", callback);
  };
}

export function NotesBoard({
  seedNotes,
  moodOptions,
}: {
  seedNotes: LoveNote[];
  moodOptions: string[];
}) {
  const localNotes = useSyncExternalStore(
    subscribeToNotes,
    readStoredNotes,
    getServerNotesSnapshot,
  );
  const notes = useMemo(() => [...localNotes, ...seedNotes], [localNotes, seedNotes]);

  function handleAdd(note: LoveNote) {
    const next = [note, ...readStoredNotes()];
    window.localStorage.setItem(storageKey, JSON.stringify(next));
    window.dispatchEvent(new Event("tingloveeric-notes"));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <NoteComposer onAdd={handleAdd} moodOptions={moodOptions} />
      <div className="grid gap-4">
        {notes.length ? notes.map((note) => (
          <NoteCard key={note.id} note={note} />
        )) : (
          <div className="paper-note p-6 text-sm leading-7 text-[var(--color-muted)]">
            这里还空着，等第一张想你、贴贴或晚安的小纸条。
          </div>
        )}
      </div>
    </div>
  );
}
