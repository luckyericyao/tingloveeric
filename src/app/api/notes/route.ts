import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { moodOptions, type LoveNote } from "@/data/love";
import {
  addNote,
  getNotes,
  notesPersistenceMode,
} from "@/lib/notesStore";
import { viewerSession } from "@/lib/serverAccess";
import { sameOrigin } from "@/lib/sameOrigin";

export const runtime = "nodejs";

type NotePayload = {
  author?: unknown;
  date?: unknown;
  mood?: unknown;
  content?: unknown;
  visibility?: unknown;
};

function parseNotePayload(payload: NotePayload | null): Omit<LoveNote, "id"> | null {
  const author = "Eric";
  const date = typeof payload?.date === "string" ? payload.date.trim() : "";
  const content = typeof payload?.content === "string" ? payload.content.trim() : "";
  const mood = typeof payload?.mood === "string" ? payload.mood.trim() : undefined;

  if (!author || author.length > 80 || !date || date.length > 40 || !content || content.length > 500) {
    return null;
  }

  if (mood && !moodOptions.includes(mood)) {
    return null;
  }

  return { author, date, mood: mood || undefined, content, source: "eric-perspective", visibility: payload?.visibility === "shared" ? "shared" : "owner" };
}

export async function GET() {
  const session = await viewerSession();
  if (!session) return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  try {
    const notes = await getNotes();
    return NextResponse.json({ notes: session.role === "owner" ? notes : notes.filter((note) => note.visibility === "shared"), persistence: notesPersistenceMode() }, { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return NextResponse.json({ message: "小纸条暂时没有打开成功，等一下再试试。" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if ((await viewerSession())?.role !== "owner") return NextResponse.json({ message: "只有所有者可以写信。" }, { status: 403 });
  if (!sameOrigin(request)) return NextResponse.json({ message: "请求来源无效。" }, { status: 403 });
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

export async function PUT() {
  return NextResponse.json({ message: "不再自动上传或批量覆盖信件。" }, { status: 405 });
}
