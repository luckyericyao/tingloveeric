import { archiveContent } from "@/data/archiveContent";

export type StoryVisualId =
  | "hanni"
  | "her-world"
  | "collage"
  | "cottage"
  | "guangzhou"
  | "night";

export type StorySource = "档案说明" | "真实记录" | "Eric 的感受";

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
  hanni: {
    src: "/images/edited/hanni-portrait.jpg",
    alt: "2025 年 1 月 27 日暖色灯光中的自拍画面",
    caption: "2025.01.27 · 真实记录",
    focalPoint: [0.5, 0.46],
  },
  "her-world": {
    src: "/images/edited/her-world.jpg",
    alt: "猫、鱼缸和发财树组成的生活画面",
    caption: "2025.01.29 · 真实记录",
    focalPoint: [0.54, 0.5],
  },
  collage: {
    src: "/images/home/hero-memory-collage.jpg",
    alt: "自拍、猫咪与最初生活画面组成的记忆拼图",
    caption: "最初被保存下来的几张画面",
    focalPoint: [0.58, 0.5],
  },
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
    alt: "夜色中的城市道路",
    caption: "后来 · 城市意象",
    focalPoint: [0.5, 0.52],
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
      id: "before-us",
      index: "00",
      label: "在我们以前",
      position: [-6, 0, -1],
      camera: [-7.8, 3.2, 7.8],
      lookAt: [-5.5, 1.45, -1.7],
    },
    {
      id: "coordinates",
      index: "01",
      label: "原始坐标",
      position: [-3, 0, -3.2],
      camera: [-4.8, 2.7, 5.4],
      lookAt: [-2.8, 1.45, -3.6],
    },
    {
      id: "closer",
      index: "02",
      label: "慢慢靠近",
      position: [0, 0, -4.2],
      camera: [-0.8, 2.55, 4.2],
      lookAt: [0, 1.45, -4.6],
    },
    {
      id: "last-meeting",
      index: "03",
      label: "最后一次见面",
      position: [3.4, 0, -2.5],
      camera: [4.8, 2.9, 5.2],
      lookAt: [3.4, 1.45, -2.9],
    },
    {
      id: "after",
      index: "04",
      label: "后来",
      position: [6.5, 0, -4.2],
      camera: [8.2, 2.65, 4.3],
      lookAt: [6.5, 1.45, -4.6],
    },
    {
      id: "choice",
      index: "05",
      label: "把选择还给你",
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
      id: "hanni-before-us",
      start: 0,
      chapterIndex: 0,
      eyebrow: "2025.01.27 · Soul",
      title: "那时候，你还不知道我会出现。",
      body: "你在 Soul 上叫 Hanni。一张昏黄灯光下的自拍，标题是“小疯子”。",
      prompt: "故事从你还不知道我的时候开始",
      source: "真实记录",
      visual: "hanni",
    },
    {
      id: "her-world-before-us",
      start: 15,
      chapterIndex: 0,
      eyebrow: "2025.01.29 · Soul",
      title: "我先看见了你生活里的一只猫。",
      body: "一缸鱼，一盆发财树。那是我最早看见的、属于你的生活。",
      prompt: "一张普通动态，成了最早的坐标",
      source: "真实记录",
      visual: "her-world",
    },
    {
      id: "two-strangers",
      start: 30,
      chapterIndex: 1,
      eyebrow: "原始坐标",
      title: "我们从两个陌生人开始。",
      quote: "照片里的你还不知道我会出现，照片外的我，也不知道你会停留这么久。",
      body: "那时故事还没有开始，一切都仍然拥有无限可能。",
      prompt: "没有人提前知道后来",
      source: "Eric 的感受",
      visual: "collage",
    },
    {
      id: "digital-relic",
      start: 46,
      chapterIndex: 1,
      eyebrow: "后来留下的数字遗迹",
      title: "我们真的靠近过。",
      body: "这张历史截图不代表现在。它只证明，有一段相遇曾经被认真保存。",
      prompt: "过去不等于现在，但过去真实存在",
      source: "真实记录",
      visual: "cottage",
    },
    {
      id: "listen-tomorrow",
      start: 62,
      chapterIndex: 2,
      eyebrow: "靠近以后",
      title: "“明天听你分享。”",
      body: "一句很轻的回应，让我的分享欲第一次有了落点。",
      prompt: "陌生从一句回应开始变软",
      source: "真实记录",
      visual: "hanni",
    },
    {
      id: "name-and-resume",
      start: 77,
      chapterIndex: 2,
      eyebrow: "一些普通的日常",
      title: "我开始在纸上写你的名字。",
      body: "也认真帮你修改简历，把工作、吃饭和一天里的小事讲给你听。",
      prompt: "喜欢慢慢有了具体的动作",
      source: "真实记录",
      visual: "collage",
    },
    {
      id: "good-night",
      start: 92,
      chapterIndex: 2,
      eyebrow: "一次短通话以后",
      title: "“真棒。” · “晚安～”",
      body: "这些话不能替关系下定义，但它们确实让陌生慢慢有了温度。",
      prompt: "那些很小的回应，曾经真实发生过",
      source: "真实记录",
      visual: "her-world",
    },
    {
      id: "europe-to-guangzhou",
      start: 108,
      chapterIndex: 3,
      eyebrow: "最后一次见面 · 欧洲 → 广州",
      title: "我从欧洲飞到广州见你。",
      body: "那不是想象，是一段真的走过的路。",
      prompt: "一段跨洲的路",
      source: "真实记录",
      visual: "guangzhou",
    },
    {
      id: "the-luggage",
      start: 123,
      chapterIndex: 3,
      eyebrow: "途中",
      title: "有一件行李，我舍不得留下。",
      body: "后来，我又花了两个小时回头去取。",
      prompt: "有些分量，当时还不懂怎么放下",
      source: "真实记录",
      visual: "guangzhou",
    },
    {
      id: "airport-waiting",
      start: 138,
      chapterIndex: 3,
      eyebrow: "广州机场",
      title: "你已经在机场等我。",
      body: "接到我以后，你很着急地带我离开机场。",
      prompt: "这是最后一次见面的真实片段",
      source: "真实记录",
      visual: "guangzhou",
    },
    {
      id: "weight",
      start: 153,
      chapterIndex: 3,
      eyebrow: "Eric 当时的感受",
      title: "有些东西，我还舍不得放下。",
      quote: "可我在你那里，已经没有那么重了。",
      body: "这是我当时感受到的分量，不替你解释，也不把一次见面当成你全部的心意。",
      prompt: "感受属于我，答案属于你",
      source: "Eric 的感受",
      visual: "night",
    },
    {
      id: "lost-contact",
      start: 168,
      chapterIndex: 4,
      eyebrow: "后来",
      title: "我们失去了联系。",
      body: "没有再替这段关系补一个好看的结局。",
      prompt: "有些故事停下时，没有告别镜头",
      source: "真实记录",
      visual: "cottage",
    },
    {
      id: "money-returned",
      start: 183,
      chapterIndex: 4,
      eyebrow: "关系重新归零",
      title: "你把之前的钱全部还给了我。",
      body: "旧的金钱关系结束，我们重新成为两个独立的人。",
      prompt: "归还不是重启，只是把彼此还给自由",
      source: "真实记录",
      visual: "cottage",
    },
    {
      id: "wrong-way",
      start: 198,
      chapterIndex: 4,
      eyebrow: "Eric 的承认",
      title: "我过去用错了方式。",
      body: "试图用金钱制造吸引，并不是平等地认识一个人。",
      prompt: "承认错误，比改写过去更重要",
      source: "Eric 的感受",
      visual: "night",
    },
    {
      id: "forty-jin",
      start: 213,
      chapterIndex: 5,
      eyebrow: "最后一次交流以后",
      title: "我瘦了四十多斤。",
      body: "也重新建立了自己的身体、生活和掌控感。",
      prompt: "改变发生在自己的生活里",
      source: "Eric 的感受",
      visual: "night",
    },
    {
      id: "not-a-report-card",
      start: 228,
      chapterIndex: 5,
      eyebrow: "不是一张成绩单",
      title: "这不是给你验收的改变。",
      quote: "变化由我完成，不需要你回来证明。",
      body: "你可能是这段改变的起点，但它现在属于我的生活。",
      prompt: "不再用改变交换一个答案",
      source: "Eric 的感受",
      visual: "collage",
    },
    {
      id: "choice-returned",
      start: 241,
      chapterIndex: 5,
      eyebrow: "如果未来还有一次自然相遇",
      title: "如果再见，就从平等开始。",
      quote: "这不是请求你回头。我只是终于学会，把爱和选择都还给你。",
      body: "我愿意作为一个独立的人，重新认识你；如果没有，我也尊重你的答案。",
      prompt: "故事到这里，把下一步交还给你",
      source: "Eric 的感受",
      visual: "collage",
    },
  ] satisfies StoryBeat[],
};

export type StoryWorld = typeof storyWorld;
