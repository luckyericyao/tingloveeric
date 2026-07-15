export type CoordinateMemory = {
  id: string;
  title: string;
  date: string;
  source: string;
  alt: string;
  caption: string;
  kind: "portrait" | "relic" | "cat";
  focalPoint?: string;
};

export const coordinateMemories = [
  {
    id: "hanni-portrait",
    title: "那时候她叫 Hanni",
    date: "2025.01.27",
    source: "/images/coordinates/hanni-2025-01-27.jpg",
    alt: "暖色灯光中的一张旧自拍动态截图",
    caption: "昏黄的灯光，一张写着“小疯子”的自拍。故事还没有开始，所有事情都仍然拥有无限可能。",
    kind: "portrait",
    focalPoint: "50% 54%",
  },
  {
    id: "her-world",
    title: "她最早向外展示的生活",
    date: "2025.01.29",
    source: "/images/coordinates/her-world-2025-01-29.jpg",
    alt: "猫、鱼缸和发财树组成的生活动态截图",
    caption: "一只猫，一缸鱼，一盆发财树。这是我最早看见的、属于她的生活。",
    kind: "portrait",
    focalPoint: "50% 48%",
  },
  {
    id: "cp-cottage",
    title: "后来留下的数字遗迹",
    date: "历史截图",
    source: "/images/coordinates/cp-cottage.jpg",
    alt: "一张后来保存下来的线上关系记录截图",
    caption: "它只保存了某个时刻。画面里的天数、等级与礼物，都不是网站现在的数据。",
    kind: "relic",
    focalPoint: "50% 42%",
  },
  {
    id: "nono",
    title: "诺诺 · Nono",
    date: "她的小世界",
    source: "/images/coordinates/nono-nine-grid.jpg",
    alt: "灰白重点色猫咪诺诺的九宫格照片",
    caption: "脸部和耳朵有明显的灰色重点色。更活泼，也更像故事里那个有点顽皮的角色。",
    kind: "cat",
    focalPoint: "50% 36%",
  },
  {
    id: "xiaoyi",
    title: "小伊 · Xiaoyi",
    date: "她的小世界",
    source: "/images/coordinates/xiaoyi-nine-grid.jpg",
    alt: "银白色猫咪小伊的九宫格照片",
    caption: "整体更偏纯白与银白。安静、柔软，像一束落在房间里的冷光。",
    kind: "cat",
    focalPoint: "50% 48%",
  },
] satisfies CoordinateMemory[];

export const originalCoordinates = {
  title: "我们最初在 Soul 相遇",
  englishTitle: "The Original Coordinates",
  period: "2025.01",
  opening:
    "在真正了解她以前，我先看见了她的一张自拍、一只猫、一缸鱼和一盆发财树。",
  closing:
    "我不再试图购买一个结局。我只是成为了一个更好的自己，并把未来重新交还给选择。",
};
