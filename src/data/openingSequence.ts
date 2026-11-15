import { archiveContent } from "@/data/archiveContent";

export const OPENING_DURATION = 60;
export const OPENING_BEAT_SECONDS = 5;

const portrait = {
  kind: "photo",
  source: "/images/edited/hanni-portrait.jpg",
  alt: "2025 年 1 月 27 日暖色灯光中的自拍画面",
  label: "那时候她叫 Hanni",
  date: "2025.01.27",
  caption: "昏黄的灯光，一张被保存下来的自拍。",
  className: "heroPrintPortrait",
} as const;

const world = {
  kind: "photo",
  source: "/images/edited/her-world.jpg",
  alt: "猫、鱼缸和发财树组成的生活画面",
  label: "她的小世界",
  date: "2025.01.29",
  caption: "一只猫，一缸鱼，一盆发财树。",
  className: "heroPrintWorld",
} as const;

const relic = {
  kind: "photo",
  source: "/images/edited/cp-cottage-relic.jpg",
  alt: "曾经留下来的情侣小屋历史截图",
  label: "后来留下的数字遗迹",
  date: "历史截图",
  caption: "一张旧记录，不代表现在的关系状态。",
  className: "heroPrintRelic",
} as const;

type PrintBase = { id: string; label: string; date: string; caption: string; className: string };
type OpeningPrint = PrintBase & (
  | { kind: "photo"; source: string; alt: string; cat?: boolean; detail?: boolean }
  | { kind: "quote"; quote: string }
  | { kind: "companions" }
);

export const openingPrints: readonly OpeningPrint[] = [
  { ...portrait, id: "portrait" },
  { ...world, id: "little-world" },
  { ...relic, id: "old-record" },
  {
    id: "nono", kind: "photo", source: "/assets/cats/nono-front.webp", cat: true,
    alt: "根据 Nono 外貌制作的海豹双色布偶猫角色肖像",
    label: "Nono", date: "她的小世界", caption: archiveContent.cats.nono.shortAppearance, className: "heroPrintNono",
  },
  {
    id: "xiaoye", kind: "photo", source: "/assets/cats/xiaoye-front.webp", cat: true,
    alt: "根据小yeah外貌制作的银白色长毛猫角色肖像",
    label: "小yeah", date: "她的小世界", caption: archiveContent.cats.xiaoye.shortAppearance, className: "heroPrintXiaoye",
  },
  {
    id: "tomorrow", kind: "quote", quote: archiveContent.tenderMoments.replies[0],
    label: "一句回应", date: "那段时间", caption: archiveContent.tenderMoments.replies[0], className: "heroPrintWords",
  },
  { ...portrait, id: "portrait-detail", detail: true },
  { ...world, id: "world-detail", detail: true },
  {
    id: "encouragement", kind: "quote", quote: archiveContent.tenderMoments.replies[1],
    label: "一句鼓励", date: "那段时间", caption: archiveContent.tenderMoments.replies[1], className: "heroPrintWords",
  },
  { ...relic, id: "record-detail", detail: true },
  {
    id: "companions", kind: "companions", label: "Nono 与小yeah", date: "她的小世界",
    caption: "两只猫，各自保留自己的样子。", className: "heroPrintWords",
  },
  {
    id: "goodnight", kind: "quote", quote: archiveContent.tenderMoments.replies[2],
    label: "一句晚安", date: "那段时间", caption: archiveContent.tenderMoments.replies[2], className: "heroPrintWords",
  },
];

export function openingBeatAt(time: number) {
  const seconds = Number.isFinite(time) ? Math.max(0, time) : 0;
  return Math.min(Math.floor(seconds / OPENING_BEAT_SECONDS), openingPrints.length - 1);
}
