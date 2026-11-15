import { archiveContent } from "@/data/archiveContent";

export type StoryVisualId =
  | "cottage"
  | "guangzhou"
  | "night"
  | "shanghai"
  | "paris"
  | "tokyo"
  | "yellowstone"
  | "starbase"
  | "antarctica";

export type StorySource = "真实记录" | "Eric 的感受" | "Eric 的愿望";

export type StoryVisual = {
  src: string;
  alt: string;
  caption: string;
  focalPoint: [number, number];
};

export type StoryChapter = {
  id: string;
  index: string;
  label: string;
  position: [number, number, number];
  camera: [number, number, number];
  lookAt: [number, number, number];
  action?: {
    label: string;
    href: string;
  };
};

export type StoryBeat = {
  id: string;
  start: number;
  chapterIndex: number;
  eyebrow?: string;
  title: string;
  quote?: string;
  body: string;
  prompt?: string;
  source: StorySource;
  visual: StoryVisualId;
};

export type StoryMusicTrack = {
  id: string;
  title: string;
  artist: string;
  src: string;
  type: "audio/mp4" | "audio/mpeg";
  available: boolean;
};

export const storyVisuals = {
  cottage: {
    src: "/images/edited/cp-cottage-relic.jpg",
    alt: "一张后来保存下来的线上关系记录截图",
    caption: "历史截图 · 不代表现在的关系状态",
    focalPoint: [0.5, 0.45],
  },
  guangzhou: {
    src: "/images/travel/guangzhou.jpg",
    alt: "广州塔与城市夜景的城市意象",
    caption: "广州 · 城市意象",
    focalPoint: [0.5, 0.5],
  },
  night: {
    src: "/images/shanghai-night-walk.jpg",
    alt: "城市夜色中的道路意象",
    caption: "记忆意象 · 不代表第一次见面的地点",
    focalPoint: [0.5, 0.52],
  },
  shanghai: {
    src: "/images/travel/shanghai.jpg",
    alt: "上海江边的城市夜景",
    caption: "Eric 的愿望 · 上海",
    focalPoint: [0.5, 0.5],
  },
  paris: {
    src: "/images/travel/paris.jpg",
    alt: "巴黎塞纳河与埃菲尔铁塔",
    caption: "Eric 的愿望 · 巴黎",
    focalPoint: [0.5, 0.5],
  },
  tokyo: {
    src: "/images/travel/tokyo.jpg",
    alt: "东京夜晚的城市街道",
    caption: "Eric 的愿望 · 东京",
    focalPoint: [0.5, 0.5],
  },
  yellowstone: {
    src: "/images/travel/yellowstone.jpg",
    alt: "黄石公园的大棱镜温泉",
    caption: "Eric 的愿望 · 黄石公园",
    focalPoint: [0.5, 0.5],
  },
  starbase: {
    src: "/images/travel/starbase.jpg",
    alt: "Starbase 发射场与辽阔天空",
    caption: "Eric 的愿望 · Starbase",
    focalPoint: [0.5, 0.5],
  },
  antarctica: {
    src: "/images/travel/antarctica.jpg",
    alt: "南极冰原、海湾与长天光",
    caption: "Eric 的愿望 · 南极",
    focalPoint: [0.5, 0.5],
  },
} satisfies Record<StoryVisualId, StoryVisual>;

export const storyWorld = {
  title: "Ting & Eric",
  subtitle: "一段只保存真实发生过的相遇",
  music: {
    title: "故事里的歌",
    tracks: [
      {
        ...archiveContent.audio.opening,
        type: "audio/mp4",
        available: true,
      },
      {
        ...archiveContent.audio.story,
        type: "audio/mp4",
        available: true,
      },
      {
        id: "forever-and-ever-and-always",
        title: "Forever and Ever and Always",
        artist: "Ryan Mack",
        src: "/audio/forever-and-ever-and-always.m4a",
        type: "audio/mp4",
        available: false,
      },
    ] satisfies StoryMusicTrack[],
  },
  chapters: [
    {
      id: "first-meeting",
      index: "00",
      label: "第一次见面",
      position: [-6, 0, -1],
      camera: [-7.8, 3.2, 7.8],
      lookAt: [-5.5, 1.45, -1.7],
    },
    {
      id: "after-the-heartbeat",
      index: "01",
      label: "瑞士到广州",
      position: [-3, 0, -3.2],
      camera: [-4.8, 2.7, 5.4],
      lookAt: [-2.8, 1.45, -3.6],
    },
    {
      id: "switzerland-to-guangzhou",
      index: "02",
      label: "一段很远的路",
      position: [0, 0, -4.2],
      camera: [-0.8, 2.55, 4.2],
      lookAt: [0, 1.45, -4.6],
    },
    {
      id: "apart",
      index: "03",
      label: "留一点空白",
      position: [3.4, 0, -2.5],
      camera: [4.8, 2.9, 5.2],
      lookAt: [3.4, 1.45, -2.9],
    },
    {
      id: "future-places",
      index: "04",
      label: "我想分享的愿望",
      position: [6.5, 0, -4.2],
      camera: [8.2, 2.65, 4.3],
      lookAt: [6.5, 1.45, -4.6],
    },
    {
      id: "ordinary-future",
      index: "05",
      label: "我向往的普通日子",
      position: [9.7, 0, -2.6],
      camera: [11.1, 3, 5.4],
      lookAt: [9.7, 1.5, -3],
      action: {
        label: "去世界地图",
        href: "/world",
      },
    },
  ] satisfies StoryChapter[],
  timeline: [
    {
      id: "first-sight",
      start: 0,
      chapterIndex: 0,
      title: "那一刻，我真的很心动。",
      body: "第一次见到你，从屏幕里走到现实中。",
      source: "Eric 的感受",
      visual: "night",
    },
    {
      id: "switzerland-to-guangzhou",
      start: 28,
      chapterIndex: 1,
      title: "后来，我从瑞士回来见你。",
      body: "那一次，目的地是广州。也是我们最后一次见面。",
      source: "真实记录",
      visual: "guangzhou",
    },
    {
      id: "a-quiet-frame",
      start: 48,
      chapterIndex: 2,
      title: "有一件行李，我舍不得就这样放下。",
      body: "途中又花了两个小时回头去取。那是我记住的分量。",
      source: "Eric 的感受",
      visual: "night",
    },
    {
      id: "space-between",
      start: 70,
      chapterIndex: 3,
      title: "关于后来，留一点空白。",
      body: "",
      source: "Eric 的感受",
      visual: "night",
    },
    {
      id: "ordinary-dinner",
      start: 96,
      chapterIndex: 4,
      title: "我想先和你吃一顿普通的饭。",
      body: "接下来的，是我还没实现的愿望。先从一顿不赶时间的饭开始。",
      source: "Eric 的愿望",
      visual: "shanghai",
    },
    {
      id: "paris",
      start: 126,
      chapterIndex: 4,
      title: "沿着河边走一段，再买一束花。",
      body: "去巴黎看看，给那一天留一张喜欢的照片。",
      source: "Eric 的愿望",
      visual: "paris",
    },
    {
      id: "yellowstone",
      start: 156,
      chapterIndex: 4,
      title: "有些风景，想亲眼看一次。",
      body: "比如黄石的大棱镜，看看照片之外的颜色。",
      source: "Eric 的愿望",
      visual: "yellowstone",
    },
    {
      id: "ordinary-days",
      start: 188,
      chapterIndex: 5,
      title: "我最想要的，其实是普通日子。",
      body: "照顾猫咪，遇到分歧时好好说话。把平常的一天过好。",
      source: "Eric 的愿望",
      visual: "night",
    },
    {
      id: "thank-you",
      start: 218,
      chapterIndex: 5,
      title: "谢谢那些真实发生过的温柔。",
      body: "",
      source: "Eric 的感受",
      visual: "night",
    },
    {
      id: "choice-stays-yours",
      start: 246,
      chapterIndex: 5,
      title: "故事先停在这里。",
      body: "地图上的远方，可以慢慢看。不必急着给什么答案。",
      source: "Eric 的愿望",
      visual: "paris",
    },
  ] satisfies StoryBeat[],
};

export type StoryWorld = typeof storyWorld;
