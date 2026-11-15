import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { moodOptions, type LoveNote } from "@/data/love";
import {
  addNote,
  getNotes,
  notesPersistenceMode,
  NoteIdentityConflict,
  NotesStorageUnavailable,
} from "@/lib/notesStore";
import { viewerSession } from "@/lib/serverAccess";
import { sameOrigin } from "@/lib/sameOrigin";

export const runtime = "nodejs";

type NotePayload = {
  id?: unknown;
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
  } catch (error) {
    if (error instanceof NotesStorageUnavailable) {
      return NextResponse.json({ message: "信件暂时无法读取，稍后再来看看。", persistence: "unavailable" }, { status: 503 });
    }
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

  if (payload?.id !== undefined && (typeof payload.id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(payload.id))) {
    return NextResponse.json({ message: "这封信的标记无效，请刷新后再试。" }, { status: 400 });
  }

  try {
    const note: LoveNote = { id: typeof payload?.id === "string" ? payload.id : randomUUID(), ...input };
    const notes = await addNote(note);
    return NextResponse.json({ note, notes, persistence: notesPersistenceMode() }, { status: 201 });
  } catch (error) {
    if (error instanceof NotesStorageUnavailable) {
      return NextResponse.json({ message: "长期保存尚未启用。文字仍在输入框里，请先不要关闭页面。" }, { status: 503 });
    }
    if (error instanceof NoteIdentityConflict) {
      return NextResponse.json({ message: "这封信已被保存为不同内容。请保留文字，刷新后再试。" }, { status: 409 });
    }
    return NextResponse.json({ message: "小纸条暂时没有保存成功，等一下再试试。" }, { status: 500 });
  }
}

export async function PUT() {
  return NextResponse.json({ message: "不再自动上传或批量覆盖信件。" }, { status: 405 });
}
