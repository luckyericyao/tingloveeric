import { NextResponse } from "next/server";
import {
  getWorldMapState,
  saveWorldMapState,
  WorldMapConflict,
  WorldMapStorageUnavailable,
} from "@/lib/worldStore";
import { isWorldMapRevision, isWorldMapStatePayload } from "@/lib/worldMapSchema";
import { sameOrigin } from "@/lib/sameOrigin";
import { viewerSession } from "@/lib/serverAccess";

export const runtime = "nodejs";
const privateHeaders = { "Cache-Control": "private, no-store" };

export async function GET() {
  if (!(await viewerSession())) return NextResponse.json({ message: "请先登录。" }, { status: 401 });
  try {
    const state = await getWorldMapState();
    return NextResponse.json({ ...state, persistence: "redis" }, { headers: privateHeaders });
  } catch (error) {
    if (error instanceof WorldMapStorageUnavailable) {
      return NextResponse.json({ message: "地图长期保存尚未连接。" }, { status: 503, headers: privateHeaders });
    }
    return NextResponse.json(
      { message: "地图记录暂时没有打开成功，等一下再试试。" },
      { status: 500, headers: privateHeaders },
    );
  }
}

export async function POST(request: Request) {
  if ((await viewerSession())?.role !== "owner" || !sameOrigin(request)) {
    return NextResponse.json({ message: "只有所有者可以修改记录。" }, { status: 403 });
  }
  const payload = await request.json().catch(() => null) as unknown;

  if (!isWorldMapStatePayload(payload) || !("revision" in payload) || !isWorldMapRevision(payload.revision)) {
    return NextResponse.json(
      { message: "地图记录或版本无效，没有修改任何内容。" },
      { status: 400, headers: privateHeaders },
    );
  }

  try {
    const state = await saveWorldMapState(payload, payload.revision);
    return NextResponse.json({ ...state, persistence: "redis" }, { headers: privateHeaders });
  } catch (error) {
    if (error instanceof WorldMapConflict) {
      return NextResponse.json(
        { message: "地图已在别处更新。草稿仍在，请先查看最新地图。" },
        { status: 409, headers: privateHeaders },
      );
    }
    if (error instanceof WorldMapStorageUnavailable) {
      return NextResponse.json({ message: "地图长期保存尚未连接。" }, { status: 503, headers: privateHeaders });
    }
    return NextResponse.json(
      { message: "这次没有确认保存，可以保留草稿再试。" },
      { status: 500, headers: privateHeaders },
    );
  }
}
