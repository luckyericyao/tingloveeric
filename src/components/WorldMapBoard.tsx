"use client";

import Image from "next/image";
import { FormEvent, KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  LocateFixed,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";
import worldTopology from "world-atlas/countries-110m.json";
import usTopology from "us-atlas/states-10m.json";
import {
  ComposableMap,
  Geographies,
  Geography,
  Graticule,
  Marker,
  Sphere,
  ZoomableGroup,
} from "react-simple-maps";
import type { ImageAsset, WorldMapPlace, WorldPlaceStatus } from "@/data/love";
import { isWorldMapRevision, isWorldMapStatePayload, type SavedWorldMap, type WorldMapSnapshot } from "@/lib/worldMapSchema";
import { PawPrint } from "./ScrapbookDecor";
import styles from "./WorldMapBoard.module.css";

type FilterValue = "all" | WorldPlaceStatus;
type MapMode = "world" | "us";

function TravelPhoto({ place }: { place: WorldMapPlace }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const frame = useRef<HTMLDivElement>(null);
  const holdPhotoPosition = () => {
    if (window.matchMedia("(max-width: 980px)").matches) {
      window.scrollTo({ top: window.scrollY, behavior: "instant" });
    }
  };
  return (
    <div ref={frame} className={styles.detailPhoto} data-photo-status={status} aria-busy={status === "loading"} tabIndex={-1} aria-label={`${place.cityZh || place.name}的照片`}>
      <Image key={attempt} src={place.image.src} alt={place.image.alt} fill
        sizes="(max-width: 980px) 100vw, 52vw" className={styles.detailPhotoImage}
        onLoad={event => { void event.currentTarget.decode().then(() => setStatus("ready")).catch(() => setStatus("error")); }}
        onError={() => setStatus("error")} />
      {status === "ready" ? <span>{place.landmark || place.image.caption}</span> : (
        <div className={styles.photoStatus} role="status">
          <p>{status === "error" ? "这张风景暂时没能打开。" : "风景正在展开…"}</p>
          {status === "error" ? <button type="button" onPointerDown={holdPhotoPosition} onClick={() => {
            holdPhotoPosition();
            frame.current?.focus({ preventScroll: true });
            setStatus("loading");
            setAttempt(value => value + 1);
          }}><RotateCcw size={16} />重试照片</button> : null}
        </div>
      )}
    </div>
  );
}

type WorldMapBoardProps = {
  seedPlaces: WorldMapPlace[];
  canEdit?: boolean;
};

type PlaceForm = {
  name: string;
  country: string;
  status: WorldPlaceStatus;
  date: string;
  message: string;
  lat: string;
  lng: string;
};

type MapPosition = {
  coordinates: [number, number];
  zoom: number;
};

const storageKey = "tingloveeric.worldPlaces";
const overridesStorageKey = "tingloveeric.worldPlaceOverrides";

const emptyForm: PlaceForm = {
  name: "",
  country: "",
  status: "wishlist",
  date: "",
  message: "",
  lat: "",
  lng: "",
};

const fallbackImage: ImageAsset = {
  id: "custom-world-place",
  src: "/images/shanghai-night-walk.jpg",
  alt: "夜里街灯下的城市道路",
  caption: "还没出发的地方，先留在愿望里。",
  category: "personal wish",
};

const placePresets = [
  { label: "上海", name: "上海", country: "中国", lat: 31.2304, lng: 121.4737 },
  { label: "台北", name: "台北", country: "中国台湾", lat: 25.033, lng: 121.5654 },
  { label: "东京", name: "东京", country: "日本", lat: 35.6762, lng: 139.6503 },
  { label: "首尔", name: "首尔", country: "韩国", lat: 37.5665, lng: 126.978 },
  { label: "纽约", name: "纽约", country: "美国", lat: 40.7128, lng: -74.006 },
  { label: "旧金山", name: "旧金山", country: "美国", lat: 37.7749, lng: -122.4194 },
  { label: "巴黎", name: "巴黎", country: "法国", lat: 48.8566, lng: 2.3522 },
];

const mapModes: Record<
  MapMode,
  {
    label: string;
    title: string;
    description: string;
    projection: string;
    scale: number;
    center: [number, number];
  }
> = {
  world: {
    label: "世界",
    title: "世界主要旅游城市",
    description: "点按或悬停查看代表性地标 · 重要地点保持稀疏",
    projection: "geoEqualEarth",
    scale: 155,
    center: [0, 15],
  },
  us: {
    label: "美国",
    title: "美国 · 我的主场",
    description: "旧金山、Starbase、迈阿密……先看主场的下一段路线",
    projection: "geoAlbersUsa",
    scale: 1000,
    center: [-98, 38],
  },
};

const geographyStyle = {
  default: {
    fill: "#e7ded4",
    outline: "none",
    stroke: "#9caea7",
    strokeWidth: 0.5,
  },
  hover: {
    fill: "#d8c8bd",
    outline: "none",
    stroke: "#8c9e98",
    strokeWidth: 0.7,
  },
  pressed: {
    fill: "#c9a9ae",
    outline: "none",
    stroke: "#856a72",
    strokeWidth: 0.7,
  },
};

function readLocalWorldMap() {
  // Earlier device-only copies remain readable, but never auto-publish.
  try {
    const cached = {
      customPlaces: JSON.parse(window.localStorage.getItem(storageKey) ?? "[]"),
      overrides: JSON.parse(window.localStorage.getItem(overridesStorageKey) ?? "{}"),
    };
    return isWorldMapStatePayload(cached) ? cached : null;
  } catch {
    return null;
  }
}

function readRemoteWorldMap(payload: unknown): WorldMapSnapshot | null {
  if (!isWorldMapStatePayload(payload) || !("revision" in payload) || !isWorldMapRevision(payload.revision) ||
      !("persistence" in payload) || payload.persistence !== "redis") {
    return null;
  }
  return { overrides: payload.overrides, customPlaces: payload.customPlaces, revision: payload.revision };
}

function worldResponseMessage(payload: unknown, fallback: string) {
  return payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
    ? payload.message
    : fallback;
}

function formatStatus(status: WorldPlaceStatus) {
  return status === "visited" ? "已经走过" : "想去看看";
}

function isUnitedStates(place: WorldMapPlace) {
  const country = place.country.toLowerCase();
  return (
    country.includes("美国") ||
    country.includes("united states") ||
    country === "us" ||
    (place.lng >= -130 && place.lng <= -60 && place.lat >= 20 && place.lat <= 55)
  );
}

function clampZoom(value: number) {
  return Math.min(8, Math.max(0.8, value));
}

function markerColor(status: WorldPlaceStatus) {
  return status === "visited" ? "#a66572" : "#b79053";
}

export function WorldMapBoard({ seedPlaces, canEdit = false }: WorldMapBoardProps) {
  const [world, setWorld] = useState<SavedWorldMap>({ customPlaces: [], overrides: {} });
  const { customPlaces: localPlaces, overrides: placeOverrides } = world;
  const [revision, setRevision] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [saveConfirmed, setSaveConfirmed] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [mapMode, setMapMode] = useState<MapMode>("world");
  const [mapPosition, setMapPosition] = useState<MapPosition>({
    coordinates: mapModes.world.center,
    zoom: 1,
  });
  const [selectedId, setSelectedId] = useState(seedPlaces[0]?.id || "");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [form, setForm] = useState<PlaceForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const detailRef = useRef<HTMLElement>(null);
  const saveInFlight = useRef(false);
  const newPlaceId = useRef<string | null>(null);
  const canSave = hasLoaded && revision !== null && !syncing;
  const needsReload = hasLoaded && revision === null && Boolean(syncError);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMapReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    const deadline = window.setTimeout(() => controller.abort(), 14000);

    async function loadWorldMap() {
      try {
        const response = await fetch("/api/world/places", { cache: "no-store", signal: controller.signal });
        const payload: unknown = await response.json().catch(() => null);
        const saved = readRemoteWorldMap(payload);
        if (!response.ok || !saved) throw new Error(worldResponseMessage(payload, "地图暂时没有读取成功。"));
        if (cancelled) return;
        setWorld(saved);
        setRevision(saved.revision);
        setSyncError("");
      } catch (error) {
        if (cancelled) return;
        const localCopy = canEdit && loadAttempt === 0 ? readLocalWorldMap() : null;
        if (localCopy) setWorld(localCopy);
        setRevision(null);
        setSyncError(error instanceof Error && error.name === "Error" ? error.message : "地图暂时没有读取成功。");
      } finally {
        window.clearTimeout(deadline);
        if (!cancelled) setHasLoaded(true);
      }
    }

    void loadWorldMap();
    return () => {
      cancelled = true;
      window.clearTimeout(deadline);
      controller.abort();
    };
  }, [canEdit, loadAttempt]);

  function reloadMap() {
    setHasLoaded(false);
    setSyncError("");
    setSaveConfirmed(false);
    setLoadAttempt(attempt => attempt + 1);
  }

  async function saveMap(next: SavedWorldMap) {
    if (!canEdit || !canSave || !revision || saveInFlight.current) return false;
    saveInFlight.current = true;
    setSyncing(true);
    setSyncError("");
    setSaveConfirmed(false);
    const controller = new AbortController();
    const deadline = window.setTimeout(() => controller.abort(), 14000);
    try {
      const response = await fetch("/api/world/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...next, revision }),
        signal: controller.signal,
      });
      const payload: unknown = await response.json().catch(() => null);
      if (response.status === 409) {
        setRevision(null);
        setSyncError("地图已在别处更新。请先查看最新地图，再决定是否保存。");
        return false;
      }
      const saved = readRemoteWorldMap(payload);
      if (!response.ok || !saved) throw new Error(worldResponseMessage(payload, "这次没有确认保存，请再试一次。"));
      if (JSON.stringify(saved.overrides) !== JSON.stringify(next.overrides) ||
          JSON.stringify(saved.customPlaces) !== JSON.stringify(next.customPlaces)) {
        throw new Error("返回的地图未确认这次修改，草稿仍在。");
      }
      setWorld(saved);
      setRevision(saved.revision);
      setSaveConfirmed(true);
      return true;
    } catch (error) {
      setSyncError(error instanceof Error && error.name === "Error" ? error.message : "这次没有确认保存，请再试一次。");
      return false;
    } finally {
      window.clearTimeout(deadline);
      saveInFlight.current = false;
      setSyncing(false);
    }
  }

  const places = useMemo(
    () => [...seedPlaces.map((place) => placeOverrides[place.id] || place), ...localPlaces],
    [localPlaces, placeOverrides, seedPlaces],
  );

  const filteredPlaces = useMemo(
    () => places.filter((place) => filter === "all" || place.status === filter),
    [filter, places],
  );

  const visiblePlaces = useMemo(
    () => (mapMode === "us" ? filteredPlaces.filter(isUnitedStates) : filteredPlaces),
    [filteredPlaces, mapMode],
  );

  const selectedPlace =
    visiblePlaces.find((place) => place.id === hoveredId) ||
    visiblePlaces.find((place) => place.id === selectedId) || visiblePlaces[0] || null;
  const featuredCityCount = visiblePlaces.filter((place) => place.featured).length;
  const visitedCount = places.filter((place) => place.status === "visited").length;
  const wishlistCount = places.filter((place) => place.status === "wishlist").length;
  const nextStop = places.find((place) => place.status === "wishlist");

  function updateForm(field: keyof PlaceForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetEditor() {
    newPlaceId.current = null;
    setEditingId(null);
    setForm(emptyForm);
    setEditorOpen(false);
    setMessage("");
  }

  function editPlace(place: WorldMapPlace) {
    newPlaceId.current = null;
    setEditingId(place.id);
    setEditorOpen(true);
    setForm({
      name: place.name,
      country: place.country,
      status: place.status,
      date: place.date || "",
      message: place.status === "visited" ? place.note : place.wish,
      lat: String(place.lat),
      lng: String(place.lng),
    });
    setMessage("");
  }

  async function removeCustomPlace(place: WorldMapPlace) {
    if (seedPlaces.some((seedPlace) => seedPlace.id === place.id)) return;
    if (!await saveMap({ overrides: placeOverrides, customPlaces: localPlaces.filter(item => item.id !== place.id) })) return;
    setSelectedId(seedPlaces[0]?.id || "");
  }

  async function restoreSeedPlace(place: WorldMapPlace) {
    if (!seedPlaces.some((seedPlace) => seedPlace.id === place.id)) return;
    const overrides = { ...placeOverrides };
    delete overrides[place.id];
    await saveMap({ overrides, customPlaces: localPlaces });
  }

  async function handleSavePlace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave || saveInFlight.current) return;
    setMessage("");

    const lat = Number(form.lat);
    const lng = Number(form.lng);
    const content = form.message.trim();

    if (!form.name.trim() || !form.country.trim() || !content) {
      setMessage("地点、国家/地区和想写的话都要填一下。");
      return;
    }

    if (
      !form.lat.trim() || !form.lng.trim() ||
      !Number.isFinite(lat) ||
      lat < -90 ||
      lat > 90 ||
      !Number.isFinite(lng) ||
      lng < -180 ||
      lng > 180
    ) {
      setMessage("纬度需要在 -90 到 90，经度需要在 -180 到 180。");
      return;
    }

    const originalPlace = editingId ? places.find((place) => place.id === editingId) : null;
    if (editingId && !originalPlace) {
      setMessage("这处地点已在别处移除，可以把草稿另存为新地点。");
      return;
    }
    const nextPlace: WorldMapPlace = {
      id: editingId ?? (newPlaceId.current ??= `custom-${crypto.randomUUID()}`),
      name: form.name.trim(),
      country: form.country.trim(),
      status: form.status,
      date: form.date || undefined,
      note: form.status === "visited" ? content : "还没有走到这里，先把愿望留在地图上。",
      wish: form.status === "wishlist" ? content : "以后若再来，可以把新的画面补在这里。",
      lat,
      lng,
      cityZh: originalPlace?.cityZh,
      landmark: originalPlace?.landmark,
      featured: originalPlace?.featured,
      markerOffset: originalPlace?.markerOffset,
      image: originalPlace?.image || seedPlaces[0]?.image || fallbackImage,
    };

    const next = seedPlaces.some(place => place.id === nextPlace.id)
      ? { overrides: { ...placeOverrides, [nextPlace.id]: nextPlace }, customPlaces: localPlaces }
      : {
        overrides: placeOverrides,
        customPlaces: localPlaces.some(place => place.id === nextPlace.id)
          ? localPlaces.map(place => place.id === nextPlace.id ? nextPlace : place)
          : [nextPlace, ...localPlaces],
      };
    if (!await saveMap(next)) return;
    setSelectedId(nextPlace.id);
    setHoveredId(null);
    setFilter("all");
    resetEditor();
  }

  function changeMapMode(nextMode: MapMode) {
    setMapMode(nextMode);
    setHoveredId(null);
    setMapPosition({ coordinates: mapModes[nextMode].center, zoom: 1 });
    const nextPlace = places.find(
      (place) =>
        (nextMode === "world" || isUnitedStates(place)) &&
        (filter === "all" || place.status === filter),
    );
    setSelectedId(nextPlace?.id || "");
  }

  function zoomBy(amount: number) {
    setMapPosition((current) => ({ ...current, zoom: clampZoom(current.zoom + amount) }));
  }

  function resetMap() {
    setMapPosition({ coordinates: mapModes[mapMode].center, zoom: 1 });
  }

  function selectPlace(placeId: string, focusPhoto = false) {
    setSelectedId(placeId);
    setHoveredId(null);
    if (!window.matchMedia("(max-width: 980px)").matches) return;
    window.requestAnimationFrame(() => {
      if (focusPhoto) detailRef.current?.focus({ preventScroll: true });
      detailRef.current?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
    });
  }

  function handleMarkerKeyDown(event: KeyboardEvent<SVGGElement>, placeId: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      selectPlace(placeId, true);
    }
  }

  const readAgain = needsReload ? (
    <button type="button" data-testid="world-reload" onClick={reloadMap} className={styles.retryButton}>
      <RotateCcw size={13} />
      重新读取地图
    </button>
  ) : null;

  return (
    <div className={styles.board}>
      {canEdit ? <header className={styles.boardHeader}>
        <div>
          <p className={styles.boardKicker}>世界城市名片</p>
          <h2>先看看想去的城市</h2>
        </div>
        <div>
          <p>把重要城市和地标点亮，点按或悬停时先看一眼它最容易被记住的画面。个人愿望，仍然可以自己写。</p>
          <div className={styles.stats} aria-label="旅行统计">
            <div className={styles.stat}>
              <strong>{visitedCount}</strong>
              <span>已经走过</span>
            </div>
            <div className={styles.stat}>
              <strong>{wishlistCount}</strong>
              <span>想去看看</span>
            </div>
            <div className={styles.stat}>
              <strong>{nextStop ? nextStop.cityZh || nextStop.name : "留白"}</strong>
              <span>先写下</span>
            </div>
          </div>
        </div>
      </header> : null}

      {canEdit ? <div className={styles.statusRow} data-testid="world-sync">
        <p role={syncError && !editorOpen ? "alert" : "status"} aria-live="polite">
          <PawPrint />
          {!hasLoaded
            ? "正在打开这张地图..."
            : syncing
              ? "正在收好这次修改..."
              : syncError
                ? (editorOpen ? "这次尚未确认保存。" : syncError)
                : saveConfirmed ? "这次修改已经保存。" : "地图已读取。"}
        </p>
        {!editorOpen ? readAgain : null}
      </div> : null}

      <section className={styles.workspace}>
        <div className={styles.mapShell}>
          <div className={styles.mapTopline}>
            <div>
              <strong>{mapModes[mapMode].title}</strong>
              <span>
                {mapModes[mapMode].description} · {featuredCityCount} 处名片
              </span>
            </div>
            <div className={styles.mapModeTabs} role="tablist" aria-label="地图范围">
              {(Object.keys(mapModes) as MapMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  role="tab"
                  aria-selected={mapMode === mode}
                  data-testid={`world-mode-${mode}`}
                  onClick={() => changeMapMode(mode)}
                  className={`${styles.mapModeTab} ${mapMode === mode ? styles.mapModeTabActive : ""}`}
                >
                  {mapModes[mode].label}
                </button>
              ))}
            </div>
            <label className={styles.cityPicker}>
              <span>城市</span>
              <select
                value={selectedPlace?.id || ""}
                aria-label="选择城市"
                aria-controls="world-photo"
                disabled={visiblePlaces.length === 0}
                onChange={event => selectPlace(event.target.value)}
              >
                {visiblePlaces.length === 0 ? <option value="">暂无地点</option> : visiblePlaces.map(place => (
                  <option key={place.id} value={place.id}>{place.cityZh || place.name} · {place.country}</option>
                ))}
              </select>
            </label>
          </div>

          <div
            data-testid="world-map"
            data-map-zoom={mapPosition.zoom.toFixed(2)}
            className={styles.mapStage}
          >
            <div className={styles.mapControls} aria-label="地图缩放控制">
              <button
                type="button"
                data-testid="world-zoom-in"
                onClick={() => zoomBy(0.7)}
                className={styles.mapControlButton}
                aria-label="放大地图"
                title="放大地图"
              >
                <Plus size={16} strokeWidth={1.6} />
              </button>
              <button
                type="button"
                data-testid="world-zoom-out"
                onClick={() => zoomBy(-0.7)}
                className={styles.mapControlButton}
                aria-label="缩小地图"
                title="缩小地图"
              >
                <Minus size={16} strokeWidth={1.6} />
              </button>
              <button
                type="button"
                data-testid="world-reset"
                onClick={resetMap}
                className={styles.mapControlButton}
                aria-label="重置地图视野"
                title="重置地图视野"
              >
                <LocateFixed size={15} strokeWidth={1.6} />
              </button>
            </div>

            <div className={styles.mapSvg}>
              {mapReady ? (
                <ComposableMap
                  width={1000}
                  height={620}
                  projection={mapModes[mapMode].projection}
                  projectionConfig={{ scale: mapModes[mapMode].scale }}
                  className={styles.mapCanvas}
                >
                <ZoomableGroup
                  key={mapMode}
                  center={mapPosition.coordinates}
                  zoom={mapPosition.zoom}
                  minZoom={0.8}
                  maxZoom={8}
                  onMoveEnd={({ coordinates, zoom }) => setMapPosition({ coordinates, zoom })}
                >
                  {mapMode === "world" ? (
                    <>
                      <Sphere fill="#c7d4cf" stroke="#8fa29d" strokeWidth={0.6} />
                      <Graticule stroke="#8fa29d" strokeWidth={0.35} strokeOpacity={0.35} />
                    </>
                  ) : null}
                  <Geographies geography={mapMode === "world" ? worldTopology : usTopology}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography key={geo.rsmKey} geography={geo} style={geographyStyle} />
                      ))
                    }
                  </Geographies>
                  {visiblePlaces.map((place) => {
                    const isSelected = selectedPlace?.id === place.id;
                    const color = markerColor(place.status);
                    return (
                      <Marker key={place.id} coordinates={[place.lng, place.lat]}>
                        <g transform={place.markerOffset ? `translate(${place.markerOffset.join(" ")})` : undefined}>
                          <g
                            role="button"
                            tabIndex={0}
                            aria-label={`${place.cityZh || place.name} · ${place.name} · ${place.landmark || "地点名片"} · ${formatStatus(place.status)}`}
                            aria-controls="world-photo"
                            onClick={() => selectPlace(place.id)}
                            onKeyDown={(event) => handleMarkerKeyDown(event, place.id)}
                            onMouseEnter={() => setHoveredId(place.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            onFocus={() => setHoveredId(place.id)}
                            onBlur={() => setHoveredId(null)}
                            style={{ cursor: "pointer" }}
                          >
                            <circle r={22} fill="transparent" />
                            {place.featured ? (
                              <circle
                                r={isSelected || hoveredId === place.id ? 18 : 11}
                                fill={color}
                                opacity={isSelected || hoveredId === place.id ? 0.2 : 0.12}
                              />
                            ) : null}
                            {isSelected ? <circle r={14} fill={color} opacity={0.14} /> : null}
                            <circle
                              r={isSelected || hoveredId === place.id ? 8 : place.featured ? 6 : 5}
                              fill={color}
                              stroke="#fff8ef"
                              strokeWidth={isSelected || hoveredId === place.id ? 2.6 : 2}
                            />
                            <circle
                              r={isSelected || hoveredId === place.id ? 2.8 : 2}
                              fill="#fff8ef"
                            />
                          </g>
                          {place.featured && (mapPosition.zoom >= 1.1 || isSelected || hoveredId === place.id) ? (
                            <text x={12} y={4} className={styles.cityMarkerLabel}>
                              {place.cityZh || place.name}
                            </text>
                          ) : null}
                        </g>
                      </Marker>
                    );
                  })}
                </ZoomableGroup>
                </ComposableMap>
              ) : (
                <div className={styles.mapLoading} role="status">正在展开世界地图…</div>
              )}
            </div>

            <div className={styles.mapLegend} aria-label="地点图例">
              <span>
                <i className={styles.legendVisited} /> 已经走过
              </span>
              <span>
                <i className={styles.legendWishlist} /> 想去看看
              </span>
            </div>

            {mapMode === "us" && visiblePlaces.length === 0 ? (
              <p className={styles.emptyMapNote} role="status">
                {canEdit ? "这张美国地图还没有坐标。先在右侧添加一个想去的城市吧。" : "这个范围里还没有分享的地点。可以换一个范围看看。"}
              </p>
            ) : null}
          </div>

          <div className={styles.filterBar} role="toolbar" aria-label="地点筛选">
            <span className={styles.filterLabel}>显示</span>
            {(
              [
                { value: "all", label: "全部地点" },
                { value: "visited", label: "已经走过" },
                { value: "wishlist", label: "想去看看" },
              ] as { value: FilterValue; label: string }[]
            ).map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`${styles.filterButton} ${filter === item.value ? styles.filterButtonActive : ""}`}
                aria-pressed={filter === item.value}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <aside className={styles.detailColumn}>
          {selectedPlace ? (
            <article className={styles.detailPanel} id="world-photo" ref={detailRef} tabIndex={-1} aria-labelledby="selected-city-title">
              <span
                className={`${styles.detailLabel} ${selectedPlace.status === "wishlist" ? styles.detailLabelWishlist : ""}`}
              >
                {formatStatus(selectedPlace.status)}
              </span>
              <div className={styles.detailHeading}>
                <div>
                  <h3 id="selected-city-title" aria-live="polite">{selectedPlace.cityZh || selectedPlace.name}</h3>
                  <p>
                    {selectedPlace.name} · {selectedPlace.country}
                  </p>
                </div>
                {selectedPlace.date ? <time className={styles.detailDate}>{selectedPlace.date}</time> : null}
              </div>
              <TravelPhoto key={selectedPlace.image.src} place={selectedPlace} />
              <p className={styles.detailCopy}>{selectedPlace.note}</p>
              <div className={styles.wishBlock}>
                <span>Eric 的愿望</span>
                <p>{selectedPlace.wish}</p>
              </div>
              {canEdit ? <div className={styles.detailActions}>
                <button
                  type="button"
                  data-testid="world-edit"
                  onClick={() => editPlace(selectedPlace)}
                  disabled={syncing || editorOpen}
                  className={styles.primaryButton}
                >
                  <Pencil size={14} /> 编辑这段记录
                </button>
                {seedPlaces.some((place) => place.id === selectedPlace.id) ? (
                  <button
                    type="button"
                    onClick={() => restoreSeedPlace(selectedPlace)}
                    disabled={!canSave || editorOpen || !Object.hasOwn(placeOverrides, selectedPlace.id)}
                    className={styles.quietButton}
                  >
                    <RotateCcw size={14} /> 恢复原始
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeCustomPlace(selectedPlace)}
                    disabled={!canSave || editorOpen}
                    className={styles.quietButton}
                  >
                    <Trash2 size={14} /> 移除地点
                  </button>
                )}
              </div> : null}
            </article>
          ) : (
            <div className={styles.detailPanel}>
              <span className={styles.detailLabel}>{canEdit ? "先点亮一个坐标" : "留一点空白"}</span>
              <h3 className={styles.detailHeadingEmpty}>{canEdit ? "把下一座城市放进这张地图。" : "这个范围里还没有地点。"}</h3>
              <p className={styles.detailCopy}>{canEdit ? "添加后，这里会显示你想记住的画面。" : "换一个范围，看看已经分享的地方。"}</p>
            </div>
          )}

          {canEdit && !editorOpen ? (
            <button
              type="button"
              className={styles.editorTrigger}
              disabled={syncing}
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setMessage("");
                setEditorOpen(true);
              }}
            >
              <Pencil size={14} />
              写下一处想去的地方
            </button>
          ) : null}

          {canEdit && editorOpen ? <form onSubmit={handleSavePlace} className={styles.editorPanel} data-testid="world-editor" aria-labelledby="world-editor-title">
            <div className={styles.editorTopline}>
              <div>
                <p className={styles.eyebrow}>{editingId ? "改一处愿望" : "写下一处愿望"}</p>
                <h3 id="world-editor-title">{editingId ? "把这段坐标改成现在想记住的样子" : "把一个地方先轻轻写下来"}</h3>
              </div>
              <button
                type="button"
                onClick={resetEditor}
                disabled={syncing}
                className={styles.closeEditor}
                aria-label="取消编辑"
                title="取消编辑"
              >
                <X size={15} />
              </button>
            </div>

            <fieldset className={styles.form} disabled={syncing}>
              <label className={styles.field}>
                地点名称
                <input
                  data-testid="world-name"
                  value={form.name}
                  maxLength={160}
                  onChange={(event) => updateForm("name", event.target.value)}
                  placeholder="例如 New York"
                />
              </label>

              <div className={styles.field}>
                <div className={styles.fieldHint}>快速放一个城市，坐标会自动填好</div>
                <div className={styles.presetRow}>
                  {placePresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        updateForm("name", preset.name);
                        updateForm("country", preset.country);
                        updateForm("lat", String(preset.lat));
                        updateForm("lng", String(preset.lng));
                      }}
                      className={styles.presetButton}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <label className={styles.field}>
                国家 / 地区
                <input
                  data-testid="world-country"
                  value={form.country}
                  maxLength={120}
                  onChange={(event) => updateForm("country", event.target.value)}
                  placeholder="例如 美国"
                />
              </label>

              <div className={styles.formGrid}>
                <label className={styles.field}>
                  状态
                  <select
                    data-testid="world-status"
                    value={form.status}
                    onChange={(event) => updateForm("status", event.target.value as WorldPlaceStatus)}
                  >
                    <option value="visited">已去过</option>
                    <option value="wishlist">想去</option>
                  </select>
                </label>
                <label className={styles.field}>
                  日期（可选）
                  <input
                    data-testid="world-date"
                    value={form.date}
                    onChange={(event) => updateForm("date", event.target.value)}
                    type="date"
                  />
                </label>
              </div>

              <label className={styles.field}>
                想写的话
                <textarea
                  data-testid="world-message"
                  value={form.message}
                  maxLength={500}
                  onChange={(event) => updateForm("message", event.target.value)}
                  placeholder="写一点想记住的画面，或一句给自己的话"
                />
              </label>

              <div className={styles.formGrid}>
                <label className={styles.field}>
                  纬度
                  <input
                    data-testid="world-lat"
                    value={form.lat}
                    onChange={(event) => updateForm("lat", event.target.value)}
                    inputMode="decimal"
                    placeholder="40.7128"
                  />
                </label>
                <label className={styles.field}>
                  经度
                  <input
                    data-testid="world-lng"
                    value={form.lng}
                    onChange={(event) => updateForm("lng", event.target.value)}
                    inputMode="decimal"
                    placeholder="-74.0060"
                  />
                </label>
              </div>

              <button type="submit" data-testid="world-submit" className={styles.primaryButton} disabled={!canSave}>
                {syncing ? "正在保存…" : editingId ? "保存这次修改" : "保存新地点"}
              </button>
              {syncError ? <p className={styles.editorError} role="alert">{syncError} 草稿仍在。</p> : null}
              {readAgain}
              {editingId && !places.some(place => place.id === editingId) ? (
                <button type="button" className={styles.quietButton} onClick={() => { setEditingId(null); setMessage(""); }}>
                  另存为新地点
                </button>
              ) : null}
              {message ? (
                <p className={styles.fieldHint} role="status" aria-live="polite">
                  {message}
                </p>
              ) : null}
            </fieldset>
          </form> : null}
        </aside>
      </section>

      <details className={styles.placeList}>
        <summary className={styles.placeListHeader}>
          <span>全部坐标</span>
          <span>{visiblePlaces.length} 个地点</span>
        </summary>
        {visiblePlaces.length > 0 ? (
          <div className={styles.placeListItems}>
            {visiblePlaces.map((place) => (
              <button
                key={place.id}
                type="button"
                onClick={() => selectPlace(place.id, true)}
                className={`${styles.placeListItem} ${selectedPlace?.id === place.id ? styles.placeListItemActive : ""}`}
              >
                <strong>{place.cityZh || place.name}</strong>
                <span>
                  {place.landmark || place.country} · {place.status === "visited" ? "已经走过" : "想去看看"}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className={styles.fieldHint}>{canEdit ? "切换回世界视图，或在右侧添加一个美国坐标。" : "换一个范围，看看已经分享的地方。"}</p>
        )}
      </details>
    </div>
  );
}
