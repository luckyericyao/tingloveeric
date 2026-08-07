"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Pencil, RotateCcw, Trash2, X } from "lucide-react";
import type { ImageAsset, WorldMapPlace, WorldPlaceStatus } from "@/data/love";
import { ButterflyTrail, HeartSparkles, PawPrint, RibbonLabel, Sticker } from "./ScrapbookDecor";

type FilterValue = "all" | WorldPlaceStatus;

type WorldMapBoardProps = {
  seedPlaces: WorldMapPlace[];
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

type PersistenceMode = "redis" | "memory" | "local";

type WorldMapResponse = {
  overrides?: unknown;
  customPlaces?: unknown;
  persistence?: "redis" | "memory";
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
  src: "/images/memory-travel.svg",
  alt: "旅行票根和行李箱插画",
  caption: "新的地方，也会变成我俩的小小地图坐标",
  category: "custom travel memory",
  sticker: "旅行",
};

const placePresets = [
  { label: "上海", name: "上海", country: "中国", lat: 31.2304, lng: 121.4737 },
  { label: "台北", name: "台北", country: "中国台湾", lat: 25.033, lng: 121.5654 },
  { label: "东京", name: "东京", country: "日本", lat: 35.6762, lng: 139.6503 },
  { label: "首尔", name: "首尔", country: "韩国", lat: 37.5665, lng: 126.978 },
  { label: "巴黎", name: "巴黎", country: "法国", lat: 48.8566, lng: 2.3522 },
];

function isWorldMapPlace(value: unknown): value is WorldMapPlace {
  const place = value as Partial<WorldMapPlace>;
  return (
    typeof place.id === "string" &&
    typeof place.name === "string" &&
    typeof place.country === "string" &&
    (place.status === "visited" || place.status === "wishlist") &&
    typeof place.note === "string" &&
    typeof place.wish === "string" &&
    typeof place.lat === "number" &&
    typeof place.lng === "number"
  );
}

function readLocalWorldMap() {
  const localPlaces: WorldMapPlace[] = [];
  const placeOverrides: Record<string, WorldMapPlace> = {};
  const savedPlaces = window.localStorage.getItem(storageKey);

  if (savedPlaces) {
    try {
      const parsed = JSON.parse(savedPlaces) as unknown;
      if (Array.isArray(parsed)) {
        localPlaces.push(...parsed.filter(isWorldMapPlace));
      }
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }

  const savedOverrides = window.localStorage.getItem(overridesStorageKey);
  if (savedOverrides) {
    try {
      const parsed = JSON.parse(savedOverrides) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        Object.entries(parsed).forEach(([id, value]) => {
          if (isWorldMapPlace(value)) placeOverrides[id] = value;
        });
      }
    } catch {
      window.localStorage.removeItem(overridesStorageKey);
    }
  }

  return { localPlaces, placeOverrides };
}

function readRemoteWorldMap(payload: WorldMapResponse) {
  const localPlaces = Array.isArray(payload.customPlaces)
    ? payload.customPlaces.filter(isWorldMapPlace)
    : [];
  const placeOverrides: Record<string, WorldMapPlace> = {};

  if (payload.overrides && typeof payload.overrides === "object" && !Array.isArray(payload.overrides)) {
    Object.entries(payload.overrides).forEach(([id, value]) => {
      if (isWorldMapPlace(value)) placeOverrides[id] = value;
    });
  }

  return { localPlaces, placeOverrides };
}

function hasWorldMapEntries(state: { localPlaces: WorldMapPlace[]; placeOverrides: Record<string, WorldMapPlace> }) {
  return state.localPlaces.length > 0 || Object.keys(state.placeOverrides).length > 0;
}

function placePosition(place: WorldMapPlace) {
  return {
    x: ((place.lng + 180) / 360) * 100,
    y: ((90 - place.lat) / 180) * 100,
  };
}

function formatStatus(status: WorldPlaceStatus) {
  return status === "visited" ? "我们去过这里" : "这里以后一起去";
}

function statusClasses(status: WorldPlaceStatus) {
  return status === "visited"
    ? "border-[rgba(214,154,176,0.5)] bg-[var(--color-rose)] text-white"
    : "border-[rgba(201,169,104,0.5)] bg-[var(--color-gold)] text-white";
}

export function WorldMapBoard({ seedPlaces }: WorldMapBoardProps) {
  const [localPlaces, setLocalPlaces] = useState<WorldMapPlace[]>([]);
  const [placeOverrides, setPlaceOverrides] = useState<Record<string, WorldMapPlace>>({});
  const [hasLoaded, setHasLoaded] = useState(false);
  const [persistenceMode, setPersistenceMode] = useState<PersistenceMode>("local");
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [syncAttempt, setSyncAttempt] = useState(0);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [selectedId, setSelectedId] = useState(seedPlaces[0]?.id || "");
  const [form, setForm] = useState<PlaceForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadWorldMap() {
      const localState = readLocalWorldMap();

      try {
        const response = await fetch("/api/world/places", { cache: "no-store" });
        if (!response.ok) throw new Error("World map request failed");
        const payload = (await response.json()) as WorldMapResponse;
        const remoteState = readRemoteWorldMap(payload);
        const initialState = !hasWorldMapEntries(remoteState) && hasWorldMapEntries(localState)
          ? localState
          : remoteState;

        if (cancelled) return;
        setLocalPlaces(initialState.localPlaces);
        setPlaceOverrides(initialState.placeOverrides);
        setPersistenceMode(payload.persistence || "memory");
        setSyncError("");
      } catch {
        if (cancelled) return;
        setLocalPlaces(localState.localPlaces);
        setPlaceOverrides(localState.placeOverrides);
        setPersistenceMode("local");
        setSyncError("地图接口暂时没有打开成功，当前先保存在这台设备上。");
      } finally {
        if (!cancelled) setHasLoaded(true);
      }
    }

    void loadWorldMap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hasLoaded) return;

    window.localStorage.setItem(storageKey, JSON.stringify(localPlaces));
    window.localStorage.setItem(overridesStorageKey, JSON.stringify(placeOverrides));

    let cancelled = false;
    const controller = new AbortController();
    const saveTimer = window.setTimeout(async () => {
      if (cancelled) return;
      setSyncing(true);
      try {
        const response = await fetch("/api/world/places", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ customPlaces: localPlaces, overrides: placeOverrides }),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("World map save failed");
        const payload = (await response.json()) as WorldMapResponse;
        if (cancelled) return;
        setPersistenceMode(payload.persistence || "memory");
        setSyncError("");
      } catch (error) {
        if (!cancelled && (error as Error).name !== "AbortError") {
          setSyncError("这次修改暂时只保存在本机，网络恢复后可以再保存。");
        }
      } finally {
        if (!cancelled) setSyncing(false);
      }
    }, 260);

    return () => {
      cancelled = true;
      window.clearTimeout(saveTimer);
      controller.abort();
    };
  }, [hasLoaded, localPlaces, placeOverrides, syncAttempt]);

  const places = useMemo(
    () => [...seedPlaces.map((place) => placeOverrides[place.id] || place), ...localPlaces],
    [localPlaces, placeOverrides, seedPlaces],
  );
  const filteredPlaces = useMemo(
    () => places.filter((place) => filter === "all" || place.status === filter),
    [filter, places],
  );

  const selectedPlace =
    places.find((place) => place.id === selectedId) || filteredPlaces[0] || places[0] || null;
  const visitedCount = places.filter((place) => place.status === "visited").length;
  const wishlistCount = places.filter((place) => place.status === "wishlist").length;
  const nextStop = places.find((place) => place.status === "wishlist");

  function updateForm(field: keyof PlaceForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetEditor() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  function editPlace(place: WorldMapPlace) {
    setEditingId(place.id);
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

  function removeCustomPlace(place: WorldMapPlace) {
    if (seedPlaces.some((seedPlace) => seedPlace.id === place.id)) return;
    setLocalPlaces((current) => current.filter((item) => item.id !== place.id));
    setSelectedId(seedPlaces[0]?.id || "");
    resetEditor();
    setMessage(`${place.name} 已从这张地图移开。`);
  }

  function restoreSeedPlace(place: WorldMapPlace) {
    if (!seedPlaces.some((seedPlace) => seedPlace.id === place.id)) return;
    setPlaceOverrides((current) => {
      const next = { ...current };
      delete next[place.id];
      return next;
    });
    resetEditor();
    setMessage(`${place.name} 已恢复成原始记录。`);
  }

  function handleSavePlace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const lat = Number(form.lat);
    const lng = Number(form.lng);
    const content = form.message.trim();

    if (!form.name.trim() || !form.country.trim() || !content) {
      setMessage("地点、国家/地区和想写的话都要填一下。");
      return;
    }

    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
      setMessage("纬度需要在 -90 到 90，经度需要在 -180 到 180。");
      return;
    }

    const originalPlace = editingId ? places.find((place) => place.id === editingId) : null;
    const nextPlace: WorldMapPlace = {
      id: editingId || `custom-${Date.now()}`,
      name: form.name.trim(),
      country: form.country.trim(),
      status: form.status,
      date: form.date || undefined,
      note: form.status === "visited" ? content : "还没一起去，但已经先把愿望点亮在这里。",
      wish: form.status === "wishlist" ? content : "下次还想一起再去，把这份记忆补得更甜一点。",
      lat,
      lng,
      image: originalPlace?.image || seedPlaces[0]?.image || fallbackImage,
    };

    const successMessage = editingId
      ? `${nextPlace.name} 的记录已经更新。`
      : "这个地方已经被我们点亮了。";

    if (editingId) {
      if (seedPlaces.some((place) => place.id === editingId)) {
        setPlaceOverrides((current) => ({ ...current, [editingId]: nextPlace }));
      } else {
        setLocalPlaces((current) => current.map((place) => (place.id === editingId ? nextPlace : place)));
      }
    } else {
      setLocalPlaces((current) => [nextPlace, ...current]);
    }
    setSelectedId(nextPlace.id);
    setFilter("all");
    setEditingId(null);
    setForm(emptyForm);
    setMessage(successMessage);
  }

  return (
    <div className="grid gap-8">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel hover-lift p-5">
          <p className="text-sm text-[var(--color-muted)]">我们去过这里</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">{visitedCount}</p>
        </div>
        <div className="glass-panel hover-lift p-5">
          <p className="text-sm text-[var(--color-muted)]">这里以后一起去</p>
          <p className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">{wishlistCount}</p>
        </div>
        <div className="glass-panel hover-lift p-5">
          <p className="text-sm text-[var(--color-muted)]">下一站的心愿</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--color-ink)]">
            {nextStop ? nextStop.name : "等她来定"}
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <p
          className={`inline-flex items-center gap-2 text-xs leading-6 ${syncError ? "text-[var(--color-rose)]" : "text-[var(--color-muted)]"}`}
          role={syncError ? "alert" : "status"}
          aria-live="polite"
        >
          <PawPrint />
          {!hasLoaded
            ? "正在打开两个人的地图..."
            : syncing
              ? "正在把这段地图收进档案..."
              : syncError ||
                (persistenceMode === "redis"
                  ? "这张地图已经同步到两个人的档案。"
                  : persistenceMode === "memory"
                    ? "当前是临时保存，配置 KV 后即可跨设备保留。"
                    : "当前先保存在这台设备上。")}
        </p>
        {syncError ? (
          <button
            type="button"
            data-testid="world-retry-sync"
            onClick={() => {
              setSyncError("");
              setSyncAttempt((current) => current + 1);
            }}
            disabled={syncing}
            className="inline-flex items-center gap-1.5 border-b border-transparent py-1 text-xs text-[var(--color-rose)] transition hover:border-[var(--color-rose)] disabled:cursor-wait disabled:opacity-50"
          >
            <RotateCcw size={13} />
            重试同步
          </button>
        ) : null}
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.22fr_0.78fr]">
        <div className="world-shell relative overflow-hidden p-4 md:p-6">
          <HeartSparkles className="left-8 top-8" />
          <ButterflyTrail className="right-10 top-8" />

          <div className="relative mb-5 flex flex-wrap gap-2">
            {[
              { value: "all", label: "全部" },
              { value: "visited", label: "我们去过这里" },
              { value: "wishlist", label: "这里以后一起去" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value as FilterValue)}
                className={`tap-bounce rounded-full border px-4 py-2 text-sm transition ${
                  filter === item.value
                    ? "border-[rgba(214,154,176,0.38)] bg-[var(--color-ink)] text-[var(--color-ivory)]"
                    : "border-[color:var(--color-line)] bg-white/62 text-[var(--color-muted)] hover:bg-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div
            data-testid="world-map"
            className="relative aspect-[1.72] min-h-[23rem] overflow-hidden rounded-[1.6rem] border border-[rgba(201,169,104,0.24)] bg-[linear-gradient(180deg,rgba(246,250,255,0.86),rgba(255,245,249,0.78))]"
          >
            <svg
              viewBox="0 0 1000 560"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full"
            >
              <path
                d="M96 190C132 112 238 94 314 130C376 159 370 229 330 268C294 303 222 310 164 282C111 257 70 246 96 190Z"
                fill="rgba(183,197,176,0.42)"
              />
              <path
                d="M238 332C306 304 382 340 400 406C418 472 342 526 282 496C224 466 176 358 238 332Z"
                fill="rgba(214,154,176,0.26)"
              />
              <path
                d="M466 154C528 92 660 102 712 164C762 224 694 284 598 274C504 264 414 206 466 154Z"
                fill="rgba(200,191,228,0.42)"
              />
              <path
                d="M550 304C640 272 732 312 758 382C790 468 676 520 586 474C514 438 478 330 550 304Z"
                fill="rgba(201,169,104,0.24)"
              />
              <path
                d="M754 166C832 120 934 142 956 210C980 284 880 326 796 296C724 270 704 196 754 166Z"
                fill="rgba(183,197,176,0.38)"
              />
              <path
                d="M814 372C864 336 932 356 944 410C956 464 898 504 842 480C786 456 774 400 814 372Z"
                fill="rgba(214,154,176,0.24)"
              />
            </svg>

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.52),transparent_28rem)]" />

            {filteredPlaces.map((place) => {
              const position = placePosition(place);
              const isSelected = selectedPlace?.id === place.id;
              return (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => setSelectedId(place.id)}
                  title={`${place.name} · ${formatStatus(place.status)}`}
                  style={{ left: `${position.x}%`, top: `${position.y}%` }}
                  className={`map-pin-pulse absolute z-10 grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 shadow-[0_12px_24px_rgba(67,59,67,0.18)] transition hover:scale-110 ${statusClasses(place.status)} ${
                    isSelected ? "ring-4 ring-white/84" : ""
                  }`}
                >
                  <span>{place.status === "visited" ? "♡" : "✦"}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--color-muted)]">
            <span className="inline-flex items-center gap-2">
              <span className="size-3 rounded-full bg-[var(--color-rose)]" />
              我们去过这里
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-3 rounded-full bg-[var(--color-gold)]" />
              这里以后一起去
            </span>
          </div>
        </div>

        <aside className="grid gap-4">
          {selectedPlace ? (
            <article className="memory-card p-5">
              <RibbonLabel>{formatStatus(selectedPlace.status)}</RibbonLabel>
              <div className="mt-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--color-ink)]">
                    {selectedPlace.name}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">{selectedPlace.country}</p>
                </div>
                <Sticker tone={selectedPlace.status === "visited" ? "rose" : "gold"}>
                  {selectedPlace.date || "未来某天"}
                </Sticker>
              </div>
              <p className="mt-5 text-sm leading-7 text-[var(--color-muted)]">
                {selectedPlace.note}
              </p>
              <div className="mt-4 rounded-2xl border border-[rgba(201,169,104,0.22)] bg-white/54 p-4">
                <p className="text-xs text-[var(--color-blue-gray)]">下一站的心愿</p>
                <p className="mt-2 text-sm leading-7 text-[var(--color-ink)]">{selectedPlace.wish}</p>
              </div>
              <p className="mt-4 inline-flex items-center gap-2 text-xs text-[var(--color-muted)]">
                <PawPrint /> {selectedPlace.image.caption}
              </p>
              <div className="mt-5 flex flex-wrap gap-2 border-t border-[color:var(--color-line)] pt-4">
                <button
                  type="button"
                  data-testid="world-edit"
                  onClick={() => editPlace(selectedPlace)}
                  className="inline-flex items-center gap-2 border border-[color:var(--color-line)] bg-white/54 px-3 py-2 text-xs text-[var(--color-ink)] transition hover:border-[var(--color-rose)]"
                >
                  <Pencil size={14} /> 编辑这段记录
                </button>
                {seedPlaces.some((place) => place.id === selectedPlace.id) ? (
                  <button
                    type="button"
                    onClick={() => restoreSeedPlace(selectedPlace)}
                    className="inline-flex items-center gap-2 border border-[color:var(--color-line)] bg-transparent px-3 py-2 text-xs text-[var(--color-muted)] transition hover:border-[var(--color-gold)]"
                  >
                    <RotateCcw size={14} /> 恢复原始
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => removeCustomPlace(selectedPlace)}
                    className="inline-flex items-center gap-2 border border-[color:var(--color-line)] bg-transparent px-3 py-2 text-xs text-[var(--color-muted)] transition hover:border-[var(--color-rose)]"
                  >
                    <Trash2 size={14} /> 移除地点
                  </button>
                )}
              </div>
            </article>
          ) : null}

          <form onSubmit={handleSavePlace} className="paper-note grid gap-4 p-5">
            <div>
              <div className="flex items-start justify-between gap-4">
                <RibbonLabel>{editingId ? "修改这段记忆" : "把这个地方先偷偷点亮"}</RibbonLabel>
                {editingId ? (
                  <button
                    type="button"
                    onClick={resetEditor}
                    className="grid size-8 place-items-center border border-[color:var(--color-line)] text-[var(--color-muted)]"
                    aria-label="取消编辑"
                    title="取消编辑"
                  >
                    <X size={15} />
                  </button>
                ) : null}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-[var(--color-ink)]">
                {editingId ? "把这段去过的地方改成现在想记住的样子" : "添加一个旅行小心愿"}
              </h2>
            </div>
            <label className="grid gap-2 text-sm text-[var(--color-ink)]">
              地点名称
              <input
                data-testid="world-name"
                value={form.name}
                onChange={(event) => updateForm("name", event.target.value)}
                className="rounded-2xl border border-[color:var(--color-line)] bg-white/70 px-4 py-3 outline-none focus:border-[rgba(214,154,176,0.48)]"
                placeholder="例如 Seoul"
              />
            </label>
            <div className="grid gap-2 text-sm text-[var(--color-ink)]">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span>{editingId ? "重新定位这条记录" : "快速放一个城市"}</span>
                <span className="text-xs text-[var(--color-muted)]">坐标会自动填好</span>
              </div>
              <div className="flex flex-wrap gap-2">
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
                    className="tap-bounce rounded-full border border-[rgba(201,169,104,0.3)] bg-[rgba(255,249,231,0.72)] px-3 py-2 text-xs text-[var(--color-ink)] transition hover:bg-white"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="grid gap-2 text-sm text-[var(--color-ink)]">
              国家/地区
              <input
                data-testid="world-country"
                value={form.country}
                onChange={(event) => updateForm("country", event.target.value)}
                className="rounded-2xl border border-[color:var(--color-line)] bg-white/70 px-4 py-3 outline-none focus:border-[rgba(214,154,176,0.48)]"
                placeholder="例如 韩国"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-[var(--color-ink)]">
                状态（已去过 / 想去）
                <select
                  data-testid="world-status"
                  value={form.status}
                  onChange={(event) => updateForm("status", event.target.value)}
                  className="rounded-2xl border border-[color:var(--color-line)] bg-white/70 px-4 py-3 outline-none focus:border-[rgba(214,154,176,0.48)]"
                >
                  <option value="visited">已去过</option>
                  <option value="wishlist">想去</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm text-[var(--color-ink)]">
                日期（可选）
                <input
                  data-testid="world-date"
                  value={form.date}
                  onChange={(event) => updateForm("date", event.target.value)}
                  type="date"
                  className="rounded-2xl border border-[color:var(--color-line)] bg-white/70 px-4 py-3 outline-none focus:border-[rgba(214,154,176,0.48)]"
                />
              </label>
            </div>
            <label className="grid gap-2 text-sm text-[var(--color-ink)]">
              想写的话
              <textarea
                data-testid="world-message"
                value={form.message}
                onChange={(event) => updateForm("message", event.target.value)}
                rows={4}
                className="resize-none rounded-2xl border border-[color:var(--color-line)] bg-white/70 px-4 py-3 outline-none focus:border-[rgba(214,154,176,0.48)]"
                placeholder="写一点记忆，或者写一句：等以后一起去"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-[var(--color-ink)]">
                纬度
                <input
                  data-testid="world-lat"
                  value={form.lat}
                  onChange={(event) => updateForm("lat", event.target.value)}
                  inputMode="decimal"
                  className="rounded-2xl border border-[color:var(--color-line)] bg-white/70 px-4 py-3 outline-none focus:border-[rgba(214,154,176,0.48)]"
                  placeholder="31.2304"
                />
              </label>
              <label className="grid gap-2 text-sm text-[var(--color-ink)]">
                经度
                <input
                  data-testid="world-lng"
                  value={form.lng}
                  onChange={(event) => updateForm("lng", event.target.value)}
                  inputMode="decimal"
                  className="rounded-2xl border border-[color:var(--color-line)] bg-white/70 px-4 py-3 outline-none focus:border-[rgba(214,154,176,0.48)]"
                  placeholder="121.4737"
                />
              </label>
            </div>
            <button
              type="submit"
              data-testid="world-submit"
              className="rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-medium text-[var(--color-ivory)] transition hover:bg-[var(--color-blue-gray)]"
            >
              {editingId ? "保存这次修改" : "把这个地方先偷偷点亮"}
            </button>
            {message ? (
              <p className="text-sm text-[var(--color-rose)]" role="status" aria-live="polite">
                {message}
              </p>
            ) : null}
          </form>
        </aside>
      </section>
    </div>
  );
}
