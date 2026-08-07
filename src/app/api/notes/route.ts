import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { moodOptions, type LoveNote } from "@/data/love";
import {
  addNote,
  getNotes,
  isLoveNote,
  notesPersistenceMode,
  saveNotes,
} from "@/lib/notesStore";

export const runtime = "nodejs";

type NotePayload = {
  author?: unknown;
  date?: unknown;
  mood?: unknown;
  content?: unknown;
};

function parseNotePayload(payload: NotePayload | null): Omit<LoveNote, "id"> | null {
  const author = typeof payload?.author === "string" ? payload.author.trim() : "";
  const date = typeof payload?.date === "string" ? payload.date.trim() : "";
  const content = typeof payload?.content === "string" ? payload.content.trim() : "";
  const mood = typeof payload?.mood === "string" ? payload.mood.trim() : undefined;

  if (!author || author.length > 80 || !date || date.length > 40 || !content || content.length > 500) {
    return null;
  }

  if (mood && !moodOptions.includes(mood)) {
    return null;
  }

  return { author, date, mood: mood || undefined, content };
}

export async function GET() {
  try {
    const notes = await getNotes();
    return NextResponse.json({ notes, persistence: notesPersistenceMode() });
  } catch {
    return NextResponse.json({ message: "小纸条暂时没有打开成功，等一下再试试。" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as NotePayload | null;
  const input = parseNotePayload(payload);

  if (!input) {
    return NextResponse.json({ message: "作者、日期和小纸条内容都要填好。" }, { status: 400 });
  }

  try {
    const note: LoveNote = { id: randomUUID(), ...input };
    const notes = await addNote(note);
    return NextResponse.json({ note, notes, persistence: notesPersistenceMode() }, { status: 201 });
  } catch {
    return NextResponse.json({ message: "小纸条暂时没有保存成功，等一下再试试。" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const payload = (await request.json().catch(() => null)) as { notes?: unknown } | null;

  if (!payload || !Array.isArray(payload.notes) || payload.notes.some((note) => !isLoveNote(note))) {
    return NextResponse.json({ message: "小纸条记录格式不对，没有修改任何内容。" }, { status: 400 });
  }

  try {
    const notes = await saveNotes(payload.notes);
    return NextResponse.json({ notes, persistence: notesPersistenceMode() });
  } catch {
    return NextResponse.json({ message: "小纸条暂时没有同步成功，等一下再试试。" }, { status: 500 });
  }
}
