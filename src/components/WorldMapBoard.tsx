"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
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

const storageKey = "tingloveeric.worldPlaces";

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
  const [hasLoaded, setHasLoaded] = useState(false);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [selectedId, setSelectedId] = useState(seedPlaces[0]?.id || "");
  const [form, setForm] = useState<PlaceForm>(emptyForm);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as unknown;
          if (Array.isArray(parsed)) {
            setLocalPlaces(parsed.filter(isWorldMapPlace));
          }
        } catch {
          window.localStorage.removeItem(storageKey);
        }
      }
      setHasLoaded(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hasLoaded) {
      window.localStorage.setItem(storageKey, JSON.stringify(localPlaces));
    }
  }, [hasLoaded, localPlaces]);

  const places = useMemo(() => [...seedPlaces, ...localPlaces], [seedPlaces, localPlaces]);
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

  function handleAddPlace(event: FormEvent<HTMLFormElement>) {
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

    const newPlace: WorldMapPlace = {
      id: `custom-${Date.now()}`,
      name: form.name.trim(),
      country: form.country.trim(),
      status: form.status,
      date: form.date || undefined,
      note: form.status === "visited" ? content : "还没一起去，但已经先把愿望点亮在这里。",
      wish: form.status === "wishlist" ? content : "下次还想一起再去，把这份记忆补得更甜一点。",
      lat,
      lng,
      image: seedPlaces[0]?.image || fallbackImage,
    };

    setLocalPlaces((current) => [newPlace, ...current]);
    setSelectedId(newPlace.id);
    setFilter("all");
    setForm(emptyForm);
    setMessage("这个地方已经被我们点亮了。");
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
            </article>
          ) : null}

          <form onSubmit={handleAddPlace} className="paper-note grid gap-4 p-5">
            <div>
              <RibbonLabel>把这个地方先偷偷点亮</RibbonLabel>
              <h2 className="mt-4 text-xl font-semibold text-[var(--color-ink)]">
                添加一个旅行小心愿
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
              把这个地方先偷偷点亮
            </button>
            {message ? <p className="text-sm text-[var(--color-rose)]">{message}</p> : null}
          </form>
        </aside>
      </section>
    </div>
  );
}
