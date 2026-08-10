export type ImageAsset = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  category: string;
  sticker?: string;
};

export type ProfileBlock = {
  title: string;
  eyebrow: string;
  body: string;
  details: string[];
};

export type Profile = {
  name: string;
  subtitle: string;
  intro: string;
  traits: string[];
  sections: ProfileBlock[];
};

export type TimelineEventType =
  | "相遇"
  | "心动"
  | "约会"
  | "旅行"
  | "争执"
  | "和好"
  | "纪念日"
  | "礼物"
  | "重要决定"
  | "普通但珍贵的一天";

export type TimelineEvent = {
  id: string;
  date: string;
  title: string;
  type: TimelineEventType;
  description: string;
  image: ImageAsset;
  source: "verified" | "eric-perspective";
  gallery?: ImageAsset[];
  imageHint?: string;
};

export type LoveNote = {
  id: string;
  author: string;
  date: string;
  content: string;
  mood?: string;
  source?: "verified" | "eric-perspective" | "wish";
};

export type RoomCard = {
  id: string;
  title: string;
  body: string;
  href: string;
  sticker: string;
  accent: "rose" | "lavender" | "gold" | "sage";
  preview: ImageAsset;
};

export type WorldPlaceStatus = "visited" | "wishlist";

export type WorldMapPlace = {
  id: string;
  name: string;
  country: string;
  status: WorldPlaceStatus;
  date?: string;
  note: string;
  wish: string;
  lat: number;
  lng: number;
  image: ImageAsset;
};

export const coupleInfo = {
  siteName: "Ting 与 Eric · 私人档案馆",
  names: {
    her: "Ting",
    him: "Eric",
  },
  shortLine: "只保存真实发生过的细节，也给未来留下选择。",
  heroImage: "/images/romantic-scrapbook-hero.png",
};

export const importantDates = {
  hanniPost: "2025-01-27",
  herWorldPost: "2025-01-29",
};

const hanniArchive: ImageAsset = {
  id: "hanni-archive",
  src: "/images/coordinates/hanni-2025-01-27.jpg",
  alt: "2025 年 1 月 27 日暖色灯光中的旧自拍动态",
  caption: "那时候她叫 Hanni。",
  category: "verified Soul archive",
};

const herWorldArchive: ImageAsset = {
  id: "her-world-archive",
  src: "/images/coordinates/her-world-2025-01-29.jpg",
  alt: "2025 年 1 月 29 日猫、鱼缸和发财树组成的旧动态",
  caption: "一只猫，一缸鱼，一盆发财树。",
  category: "verified Soul archive",
};

const cpCottageArchive: ImageAsset = {
  id: "cp-cottage-archive",
  src: "/images/coordinates/cp-cottage.jpg",
  alt: "后来保存下来的线上关系记录截图",
  caption: "一张历史截图，不是现在的关系状态。",
  category: "verified relationship record",
};

const nonoArchive: ImageAsset = {
  id: "nono-archive",
  src: "/images/coordinates/nono-nine-grid.jpg",
  alt: "灰白重点色猫咪诺诺的九宫格照片",
  caption: "诺诺 · Nono，脸部和耳朵带明显灰色重点色。",
  category: "verified cat reference",
};

const xiaoyiArchive: ImageAsset = {
  id: "xiaoyi-archive",
  src: "/images/coordinates/xiaoyi-nine-grid.jpg",
  alt: "银白色猫咪小伊的九宫格照片",
  caption: "小伊 · Xiaoyi，整体偏纯白与银白。",
  category: "verified cat reference",
};

const wishMapImage: ImageAsset = {
  id: "wish-map-night",
  src: "/images/shanghai-night-walk.jpg",
  alt: "夜里街灯下的城市道路",
  caption: "还没出发的地方，先留在愿望里。",
  category: "personal wish",
};

export const profileHerImages: ImageAsset[] = [
  hanniArchive,
  herWorldArchive,
  nonoArchive,
  xiaoyiArchive,
];

export const profileHimImages: ImageAsset[] = [
  hanniArchive,
  herWorldArchive,
  cpCottageArchive,
];

export const loveWorldRooms: RoomCard[] = [
  {
    id: "coordinates-room",
    title: "相遇与靠近",
    body: "Soul、Hanni、两只猫，以及后来留在聊天里的几句晚安。",
    href: "/coordinates",
    sticker: "真实记录",
    accent: "rose",
    preview: hanniArchive,
  },
  {
    id: "cats-room",
    title: "她与两只猫",
    body: "诺诺与小伊，保留它们各自的花纹、名字和柔软的生活痕迹。",
    href: "/her",
    sticker: "她的小世界",
    accent: "lavender",
    preview: nonoArchive,
  },
  {
    id: "world-room",
    title: "想去的地方",
    body: "还没出发的城市，先替自己的愿望留一盏小灯。",
    href: "/world",
    sticker: "愿望",
    accent: "gold",
    preview: wishMapImage,
  },
  {
    id: "notes-room",
    title: "未寄出的信",
    body: "今天有一句话想留下，就写在这里，不替未来下结论。",
    href: "/notes",
    sticker: "留给自己",
    accent: "lavender",
    preview: cpCottageArchive,
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: "hanni-portrait",
    date: importantDates.hanniPost,
    title: "那时候她叫 Hanni",
    type: "相遇",
    description:
      "一张写着“小疯子”的自拍。那时故事还没有开始，所有事情都仍然拥有无限可能。",
    image: {
      id: "hanni-portrait",
      src: "/images/coordinates/hanni-2025-01-27.jpg",
      alt: "2025 年 1 月 27 日暖色灯光中的旧自拍动态",
      caption: "那时候她叫 Hanni。",
      category: "verified Soul archive",
    },
    source: "verified",
  },
  {
    id: "her-world",
    date: importantDates.herWorldPost,
    title: "我先看见了她的小世界",
    type: "相遇",
    description:
      "一只猫，一缸鱼，一盆发财树。这是我最早看见的、属于她的生活。照片里的猫当时尚未确认身份，因此不擅自命名。",
    image: {
      id: "her-world",
      src: "/images/coordinates/her-world-2025-01-29.jpg",
      alt: "2025 年 1 月 29 日猫、鱼缸和发财树组成的旧动态",
      caption: "一只猫，一缸鱼，一盆发财树。",
      category: "verified Soul archive",
    },
    source: "verified",
  },
  {
    id: "tender-replies",
    date: "靠近以后",
    title: "那些小小的回应",
    type: "普通但珍贵的一天",
    description:
      "我在纸上写她的名字，认真帮她修改简历，也把工作、吃饭和一天里的小事讲给她听。一次短通话、一个“真棒”、一句“晚安～”，让陌生慢慢有了温度。",
    image: {
      id: "tender-replies",
      src: "/images/coordinates/cp-cottage.jpg",
      alt: "被保存下来的线上关系记录截图",
      caption: "这些小小的回应不能定义整段关系，但它们真实发生过。",
      category: "verified relationship record",
    },
    source: "verified",
  },
];

export const seedNotes: LoveNote[] = [];

export const moodOptions = ["今天", "一件小事", "想念", "愿望", "晚安"];

export const worldMapPlaces: WorldMapPlace[] = [
  {
    id: "shanghai",
    name: "Shanghai",
    country: "中国",
    status: "wishlist",
    note: "先把这座城市放进自己的愿望里。",
    wish: "去看江边的夜色，吃一顿普通的饭，把时间留给这座城市。",
    lat: 31.2304,
    lng: 121.4737,
    image: wishMapImage,
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "日本",
    status: "wishlist",
    note: "先收下一条东京夜里的街道。",
    wish: "去看夜景，买一点可爱小物，再拍一张喜欢的照片。",
    lat: 35.6762,
    lng: 139.6503,
    image: wishMapImage,
  },
  {
    id: "paris",
    name: "Paris",
    country: "法国",
    status: "wishlist",
    note: "花和旧街道，先写进一页愿望。",
    wish: "沿着河边散步，买一束花，给这一天留一张照片。",
    lat: 48.8566,
    lng: 2.3522,
    image: wishMapImage,
  },
  {
    id: "london",
    name: "London",
    country: "英国",
    status: "wishlist",
    note: "阴天、灯光和一杯热饮。",
    wish: "去看桥、看展、喝热饮，然后把今天写进一张小纸条。",
    lat: 51.5072,
    lng: -0.1276,
    image: wishMapImage,
  },
  {
    id: "kyoto",
    name: "Kyoto",
    country: "日本",
    status: "wishlist",
    note: "安静庭院和一页书，先留在这里。",
    wish: "看看庭院，吃一份甜点，把慢下来的时间留给自己。",
    lat: 35.0116,
    lng: 135.7681,
    image: wishMapImage,
  },
  {
    id: "santorini",
    name: "Santorini",
    country: "希腊",
    status: "wishlist",
    note: "海风和白色小房子，先收藏起来。",
    wish: "看一场漂亮的日落，拍几张被光照亮的风景。",
    lat: 36.3932,
    lng: 25.4615,
    image: wishMapImage,
  },
  {
    id: "new-york",
    name: "New York",
    country: "美国",
    status: "wishlist",
    note: "很大的城市，也可以先写成一条小路线。",
    wish: "走过公园和街口，把喜欢的店一一记下来。",
    lat: 40.7128,
    lng: -74.006,
    image: wishMapImage,
  },
];

export const profileHer: Profile = {
  name: "她的生活碎片",
  subtitle: "几张照片，几件小事，还有诺诺和小伊。",
  intro:
    "那时候她在 Soul 上叫 Hanni。2025 年 1 月 27 日是一张写着“小疯子”的自拍，1 月 29 日是一只猫、一缸鱼和一盆发财树。",
  traits: ["Hanni", "2025.01.27", "2025.01.29", "诺诺与小伊"],
  sections: [
    {
      title: "最早看见的她",
      eyebrow: "2025.01.27 · 一张自拍",
      body: "一张写着“小疯子”的自拍，是我最早保存下来的她。",
      details: ["Soul 上的 Hanni", "原话：小疯子"],
    },
    {
      title: "她的小世界",
      eyebrow: "2025.01.29 · 一段生活",
      body: "一只猫、一缸鱼、一盆发财树。照片里的猫没有确认身份，所以就把画面原样留下。",
      details: ["猫、鱼缸和发财树", "不替她说明心情"],
    },
    {
      title: "诺诺与小伊",
      eyebrow: "她的小世界",
      body: "诺诺是带灰色重点色的猫，小伊整体更偏白与银白。它们各自有名字，也各自保留自己的样子。",
      details: ["诺诺 · Nono", "小伊 · Xiaoyi", "花纹与名字不混淆"],
    },
  ],
};

export const profileHim: Profile = {
  name: "Eric · 后来发生的变化",
  subtitle: "一份关于我自己的记录，不替她写感受，也不向她索取结局。",
  intro:
    "最后一次交流以后，我减重了四十多斤，也重新建立了身体、生活和掌控感。这个改变由我完成，不需要她回来证明。",
  traits: ["承认过去的方法不对", "钱已经归还", "减重四十多斤", "重新建立生活"],
  sections: [
    {
      title: "先承认一件事",
      eyebrow: "Eric 的感受",
      body: "过去我曾试图用金钱制造吸引。现在我知道，那不是平等地认识一个人的方式。",
      details: ["不把付出变成筹码", "不把归还理解成机会", "把旧关系里的账清零"],
    },
    {
      title: "变化发生在我身上",
      eyebrow: "最后一次交流以后",
      body: "我瘦了四十多斤，生活、身体和自我掌控力都发生了变化。它们是我自己的生活，不是给谁验收的成绩单。",
      details: ["身体变轻了", "状态重新建立", "不把改变交给别人评价"],
    },
    {
      title: "把未来还给选择",
      eyebrow: "不虚构结局",
      body: "如果未来自然相遇，我们可以作为两个自由的人重新判断是否合适；如果没有，也不替故事写一个她没有选择的结尾。",
      details: ["不绕过边界", "不预设她的反应", "允许未来保持开放"],
    },
  ],
};
