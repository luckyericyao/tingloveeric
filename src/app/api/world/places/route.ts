import { NextResponse } from "next/server";
import {
  getWorldMapState,
  isWorldMapStatePayload,
  saveWorldMapState,
  worldPersistenceMode,
} from "@/lib/worldStore";

export const runtime = "nodejs";

export async function GET() {
  try {
    const state = await getWorldMapState();
    return NextResponse.json({ ...state, persistence: worldPersistenceMode() });
  } catch {
    return NextResponse.json(
      { message: "地图记录暂时没有打开成功，等一下再试试。" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);

  if (!isWorldMapStatePayload(payload)) {
    return NextResponse.json(
      { message: "地图记录格式不对，没有修改任何内容。" },
      { status: 400 },
    );
  }

  try {
    const state = await saveWorldMapState(payload);
    return NextResponse.json({ ...state, persistence: worldPersistenceMode() });
  } catch {
    return NextResponse.json(
      { message: "地图记录暂时没有保存成功，等一下再试试。" },
      { status: 500 },
    );
  }
}
