import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import type { BoardMessage, BoardMood } from "@/data/love";
import { boardMoodOptions } from "@/data/love";
import { addBoardMessage, boardPersistenceMode, getBoardMessages } from "@/lib/boardStore";

export const runtime = "nodejs";

type BoardPayload = {
  sender?: unknown;
  receiver?: unknown;
  datetime?: unknown;
  content?: unknown;
  mood?: unknown;
};

function isSender(value: unknown): value is BoardMessage["sender"] {
  return value === "Eric" || value === "Ting";
}

function isMood(value: unknown): value is BoardMood {
  return typeof value === "string" && boardMoodOptions.includes(value as BoardMood);
}

export async function GET() {
  try {
    const messages = await getBoardMessages();
    return NextResponse.json({ messages, persistence: boardPersistenceMode() });
  } catch {
    return NextResponse.json(
      { message: "留言板暂时没有打开成功，等一下再试试。" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as BoardPayload | null;

  if (!payload || !isSender(payload.sender)) {
    return NextResponse.json({ message: "请选择是谁写给谁。" }, { status: 400 });
  }

  if (!isMood(payload.mood)) {
    return NextResponse.json({ message: "请选择一个心情标签。" }, { status: 400 });
  }

  const content = typeof payload.content === "string" ? payload.content.trim() : "";

  if (!content) {
    return NextResponse.json({ message: "留言不能为空。" }, { status: 400 });
  }

  if (content.length > 360) {
    return NextResponse.json({ message: "这张小纸条先控制在 360 字以内。" }, { status: 400 });
  }

  const datetimeValue =
    typeof payload.datetime === "string" && payload.datetime.trim()
      ? new Date(payload.datetime)
      : new Date();

  if (Number.isNaN(datetimeValue.getTime())) {
    return NextResponse.json({ message: "日期时间格式不对。" }, { status: 400 });
  }

  const sender = payload.sender;
  const receiver: BoardMessage["receiver"] = sender === "Eric" ? "Ting" : "Eric";

  if (payload.receiver && payload.receiver !== receiver) {
    return NextResponse.json({ message: "收件人和发送方向不匹配。" }, { status: 400 });
  }

  const message: BoardMessage = {
    id: randomUUID(),
    sender,
    receiver,
    datetime: datetimeValue.toISOString(),
    content,
    mood: payload.mood,
  };

  try {
    const messages = await addBoardMessage(message);
    return NextResponse.json({ message, messages, persistence: boardPersistenceMode() }, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "留言没有保存成功，等一下再试试。" },
      { status: 500 },
    );
  }
}
