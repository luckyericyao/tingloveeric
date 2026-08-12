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
  eyebrow: string;
  title: string;
  quote?: string;
  body: string;
  prompt: string;
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
      label: "心动以后",
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
      label: "后来分开",
      position: [3.4, 0, -2.5],
      camera: [4.8, 2.9, 5.2],
      lookAt: [3.4, 1.45, -2.9],
    },
    {
      id: "future-places",
      index: "04",
      label: "我想和你去",
      position: [6.5, 0, -4.2],
      camera: [8.2, 2.65, 4.3],
      lookAt: [6.5, 1.45, -4.6],
    },
    {
      id: "ordinary-future",
      index: "05",
      label: "未来的普通日子",
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
      eyebrow: "第一次真正见到你",
      title: "那一刻，我真的很心动。",
      body: "不是在聊天框里想象你，而是你真实地站在我面前。",
      prompt: "这是 Eric 对第一次见面的记忆",
      source: "Eric 的感受",
      visual: "night",
    },
    {
      id: "remember-the-feeling",
      start: 15,
      chapterIndex: 0,
      eyebrow: "第一次见面以后",
      title: "我记住的不是流程，是见到你的感觉。",
      body: "很多细节不需要被写成证据。我只记得，那天结束以后，我开始期待下一次。",
      prompt: "地点与日期留白，心动属于 Eric",
      source: "Eric 的感受",
      visual: "night",
    },
    {
      id: "real-weight",
      start: 30,
      chapterIndex: 0,
      eyebrow: "从线上走到现实",
      title: "喜欢从那一天，有了现实里的重量。",
      body: "你不再只是屏幕另一端的名字，而是一个让我想认真靠近、认真了解的人。",
      prompt: "故事从见到彼此以后继续",
      source: "Eric 的感受",
      visual: "night",
    },
    {
      id: "more-than-a-meeting",
      start: 46,
      chapterIndex: 1,
      eyebrow: "心动以后",
      title: "我想要的，不只是一次漂亮的见面。",
      body: "我想在更多普通时刻里认识你：一起吃饭、散步，听你说完一天里真正发生的事。",
      prompt: "喜欢开始指向现实里的陪伴",
      source: "Eric 的感受",
      visual: "shanghai",
    },
    {
      id: "expect-next-time",
      start: 62,
      chapterIndex: 1,
      eyebrow: "想再靠近一点",
      title: "我开始期待，下一次还能见到你。",
      body: "喜欢不是一场表演。对当时的我来说，它是想靠近一点，又怕走得太快。",
      prompt: "期待属于 Eric，不替她写答案",
      source: "Eric 的感受",
      visual: "shanghai",
    },
    {
      id: "no-written-ending",
      start: 78,
      chapterIndex: 1,
      eyebrow: "心动没有自动写出结局",
      title: "我们靠近过，也在后来走向不同的方向。",
      body: "喜欢真实发生过，但真实不等于它会永远停在原来的位置。",
      prompt: "从心动走向后来的变化",
      source: "Eric 的感受",
      visual: "shanghai",
    },
    {
      id: "switzerland-to-guangzhou",
      start: 94,
      chapterIndex: 2,
      eyebrow: "瑞士 → 广州",
      title: "后来，我从瑞士回来见你。",
      body: "跨过很远的路，最后抵达广州。这一程，只在电影里留这一张画面。",
      prompt: "一笔带过的远路",
      source: "真实记录",
      visual: "guangzhou",
    },
    {
      id: "lost-contact",
      start: 110,
      chapterIndex: 3,
      eyebrow: "后来",
      title: "我们失去了联系。",
      body: "故事没有照我希望的方向继续，也没有一个被共同写下的结尾。",
      prompt: "到这里，不替关系补一个答案",
      source: "真实记录",
      visual: "night",
    },
    {
      id: "money-returned",
      start: 126,
      chapterIndex: 3,
      eyebrow: "旧关系结束以后",
      title: "钱被还清，彼此重新回到自由。",
      body: "这不是重新开始的凭证，只是让旧的金钱关系真正结束。",
      prompt: "归还不等于任何人欠一个结局",
      source: "Eric 的感受",
      visual: "cottage",
    },
    {
      id: "wrong-way",
      start: 142,
      chapterIndex: 3,
      eyebrow: "Eric 的承认",
      title: "我也承认，过去有些方式不对。",
      body: "喜欢不该靠金钱制造，也不该用改变去交换一个人回头。",
      prompt: "承认错误，然后把选择还给现实",
      source: "Eric 的感受",
      visual: "night",
    },
    {
      id: "ordinary-dinner",
      start: 158,
      chapterIndex: 4,
      eyebrow: "如果未来还有一次自然相遇",
      title: "我想先和你吃一顿普通的饭。",
      body: "不急着谈关系，也不要求一个答案，只是重新听你说说现在的生活。",
      prompt: "这是 Eric 的愿望，不是共同决定",
      source: "Eric 的愿望",
      visual: "shanghai",
    },
    {
      id: "many-places",
      start: 174,
      chapterIndex: 4,
      eyebrow: "地图上还没有发生的事",
      title: "我想和你去很多地方。",
      quote: "这些是我写下的愿望，不是你已经答应的计划。",
      body: "地图会把它们点亮，选择仍然留在现实里。",
      prompt: "愿望可以具体，未来仍然开放",
      source: "Eric 的愿望",
      visual: "paris",
    },
    {
      id: "paris",
      start: 190,
      chapterIndex: 4,
      eyebrow: "巴黎",
      title: "沿着河边走一段，再买一束花。",
      body: "不赶行程，只给那一天留一张真正喜欢的照片。",
      prompt: "一件很小、很具体的愿望",
      source: "Eric 的愿望",
      visual: "paris",
    },
    {
      id: "tokyo-and-yellowstone",
      start: 205,
      chapterIndex: 4,
      eyebrow: "东京 · 黄石公园",
      title: "买一点可爱的东西，再一起看大棱镜。",
      body: "把热闹和辽阔，都变成认真看过的风景。",
      prompt: "世界地图上的下一盏灯",
      source: "Eric 的愿望",
      visual: "yellowstone",
    },
    {
      id: "starbase-and-antarctica",
      start: 220,
      chapterIndex: 4,
      eyebrow: "Starbase · 南极",
      title: "看一次发射，也去看很长的天光。",
      body: "把世界上很远的地方，慢慢走成可以记住的一天。",
      prompt: "远方先作为愿望被保存",
      source: "Eric 的愿望",
      visual: "starbase",
    },
    {
      id: "ordinary-days",
      start: 235,
      chapterIndex: 5,
      eyebrow: "比远方更重要的事",
      title: "我最想要的，其实是普通日子。",
      body: "一起吃饭、照顾猫咪、遇到分歧时好好说话，让喜欢不再只靠情绪支撑。",
      prompt: "平凡，比宏大的承诺更难也更珍贵",
      source: "Eric 的愿望",
      visual: "antarctica",
    },
    {
      id: "choice-stays-yours",
      start: 246,
      chapterIndex: 5,
      eyebrow: "Eric 的愿望",
      title: "如果你愿意，就从一次新的认识开始。",
      quote: "如果你不愿意，我也尊重你的答案。",
      body: "未来不由这个网站决定。地图可以先亮起，选择永远留给你。",
      prompt: "电影结束，下一站是世界地图",
      source: "Eric 的愿望",
      visual: "antarctica",
    },
  ] satisfies StoryBeat[],
};

export type StoryWorld = typeof storyWorld;
