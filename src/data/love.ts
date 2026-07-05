export type StatItem = {
  id: string;
  label: string;
  value: string;
  detail: string;
};

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
  gallery?: ImageAsset[];
  imageHint?: string;
};

export type FrictionRecord = {
  id: string;
  title: string;
  date: string;
  whatHappened: string;
  whatICaredAbout: string;
  whatYouCaredAbout: string;
  whatWeLearned: string;
};

export type Achievement = {
  id: string;
  name: string;
  rarity: string;
  description: string;
  unlocked: boolean;
  icon?: string;
};

export type LoveNote = {
  id: string;
  author: string;
  date: string;
  content: string;
  mood?: string;
};

export type FutureLetter = {
  id: string;
  title: string;
  openAt: string;
  content: string;
};

export type SweetWorldCard = {
  id: string;
  title: string;
  description: string;
  image: ImageAsset;
  accent: "butterfly" | "cat" | "heart";
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

export type BoardMood =
  | "想你"
  | "晚安"
  | "撒娇"
  | "贴贴"
  | "和好"
  | "心软"
  | "开心"
  | "纪念"
  | "抱抱";

export type BoardMessage = {
  id: string;
  sender: "Eric" | "Ting";
  receiver: "Eric" | "Ting";
  datetime: string;
  content: string;
  mood: BoardMood;
  featured?: boolean;
};

export const coupleInfo = {
  siteName: "我俩",
  names: {
    her: "Ting",
    him: "Eric",
  },
  shortLine: "今天也喜欢你，把心动、贴贴和小纸条都偷偷收藏好。",
  heroImage: "/images/romantic-scrapbook-hero.png",
};

export const importantDates = {
  firstMet: "2024-05-20",
  togetherSince: "2024-08-08",
  firstLongTalk: "2024-06-12",
  firstTrip: "2025-01-18",
};

const coupleMemory: ImageAsset = {
  id: "couple-memory",
  src: "/images/memory-couple.svg",
  alt: "粉色和薰衣草色的情侣记忆插画",
  caption: "普通日子也因为你发光",
  category: "romantic couple memory",
  sticker: "贴贴",
};

const catMemory: ImageAsset = {
  id: "cat-memory",
  src: "/images/memory-cat.svg",
  alt: "奶油色小猫陪伴插画",
  caption: "小猫陪着我们，把世界变软",
  category: "cute cat",
  sticker: "小猫",
};

const butterflyMemory: ImageAsset = {
  id: "butterfly-memory",
  src: "/images/memory-butterfly.svg",
  alt: "薰衣草蝴蝶花园插画",
  caption: "蝴蝶把没说出口的心事送到你身边",
  category: "soft butterfly",
  sticker: "蝴蝶",
};

const flowerMemory: ImageAsset = {
  id: "flower-memory",
  src: "/images/memory-flowers.svg",
  alt: "粉色和薰衣草色花束插画",
  caption: "她笑起来的时候，像一束被偏爱的花",
  category: "pink/lavender flowers",
  sticker: "发光",
};

const noteMemory: ImageAsset = {
  id: "note-memory",
  src: "/images/memory-note.svg",
  alt: "情书和小纸条插画",
  caption: "想你就写成一张小纸条",
  category: "love letter / paper note",
  sticker: "想你",
};

const skyMemory: ImageAsset = {
  id: "sky-memory",
  src: "/images/memory-sky.svg",
  alt: "柔软粉蓝色天空和夕阳插画",
  caption: "那天的风、光和心跳",
  category: "soft sky / sunset",
  sticker: "心动",
};

const travelMemory: ImageAsset = {
  id: "travel-memory",
  src: "/images/memory-travel.svg",
  alt: "旅行票根和行李箱插画",
  caption: "奔赴也被我们收藏成甜甜的一页",
  category: "travel memory",
  sticker: "旅行",
};

const cozyMemory: ImageAsset = {
  id: "cozy-memory",
  src: "/images/memory-cozy.svg",
  alt: "温暖室内杯子和毛毯插画",
  caption: "安静待在一起，也觉得很贴贴",
  category: "cozy indoor moment",
  sticker: "抱抱",
};

const giftMemory: ImageAsset = {
  id: "gift-memory",
  src: "/images/memory-gift.svg",
  alt: "香槟金礼物和丝带插画",
  caption: "把想念打成蝴蝶结送给你",
  category: "gift / ribbon",
  sticker: "礼物",
};

const stickerMemory: ImageAsset = {
  id: "sticker-memory",
  src: "/images/memory-stickers.svg",
  alt: "爱心、猫爪和蝴蝶贴纸插画",
  caption: "每个小表情都值得贴进本子里",
  category: "scrapbook sticker",
  sticker: "收藏",
};

export const heroImages: ImageAsset[] = [
  coupleMemory,
  catMemory,
  butterflyMemory,
  noteMemory,
  flowerMemory,
];

export const memoryImages: ImageAsset[] = [
  coupleMemory,
  flowerMemory,
  catMemory,
  butterflyMemory,
  noteMemory,
  skyMemory,
  travelMemory,
  cozyMemory,
  giftMemory,
];

export const profileHerImages: ImageAsset[] = [
  flowerMemory,
  butterflyMemory,
  noteMemory,
  coupleMemory,
];

export const profileHimImages: ImageAsset[] = [
  catMemory,
  cozyMemory,
  giftMemory,
  skyMemory,
];

export const noteDecorImages: ImageAsset[] = [
  noteMemory,
  stickerMemory,
  butterflyMemory,
  catMemory,
];

export const sweetWorldCards: SweetWorldCard[] = [
  {
    id: "butterflies-for-her",
    title: "她喜欢蝴蝶",
    description: "所以这里的心动，会轻轻飞到她身边。",
    image: butterflyMemory,
    accent: "butterfly",
  },
  {
    id: "cats-for-her",
    title: "她喜欢猫咪",
    description: "所以这里的陪伴，是软软的、黏黏的、一直在的。",
    image: catMemory,
    accent: "cat",
  },
  {
    id: "chosen-for-her",
    title: "她值得被偏爱",
    description: "所以这里每一页都不是模板，而是专门写给她。",
    image: coupleMemory,
    accent: "heart",
  },
];

const dayMs = 24 * 60 * 60 * 1000;

function daysSince(dateValue: string) {
  const start = new Date(`${dateValue}T00:00:00`);
  const today = new Date();
  const localToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  return Math.max(1, Math.floor((localToday.getTime() - start.getTime()) / dayMs) + 1);
}

export const achievements: Achievement[] = [
  {
    id: "thousand-words",
    name: "千言万语",
    rarity: "0.1%",
    description: "我们已经说过太多只属于彼此的话。",
    unlocked: true,
    icon: "✦",
  },
  {
    id: "mountains-rivers",
    name: "万水千山",
    rarity: "0.1%",
    description: "距离没有让我们走散，反而让奔赴更珍贵。",
    unlocked: true,
    icon: "✧",
  },
  {
    id: "many-sails",
    name: "千帆阅尽",
    rarity: "5%",
    description: "经历过很多，最后仍然认定彼此。",
    unlocked: true,
    icon: "♡",
  },
  {
    id: "back-together",
    name: "破镜重圆",
    rarity: "1%",
    description: "分别、误解、距离，都没能让我们彻底错过。",
    unlocked: true,
    icon: "↺",
  },
  {
    id: "same-heart",
    name: "心有灵犀",
    rarity: "3%",
    description: "一个眼神，一个停顿，就已经明白彼此。",
    unlocked: true,
    icon: "❀",
  },
  {
    id: "no-walls",
    name: "无话不谈",
    rarity: "0.5%",
    description: "从秘密到脆弱，我们都敢向彼此打开。",
    unlocked: true,
    icon: "✉",
  },
  {
    id: "finally-you",
    name: "终于是你",
    rarity: "0.1%",
    description: "世界很大，但最后想牵手的人还是你。",
    unlocked: true,
    icon: "♡",
  },
  {
    id: "clingy-license",
    name: "黏人许可证",
    rarity: "1%",
    description: "开始习惯把想念、分享和依赖都给你。",
    unlocked: true,
    icon: "⌁",
  },
  {
    id: "sudden-heartbeat",
    name: "怦然一瞬",
    rarity: "0.1%",
    description: "第一次觉得，心跳好像被你轻轻碰了一下。",
    unlocked: true,
    icon: "✧",
  },
  {
    id: "hug-addiction",
    name: "贴贴成瘾",
    rarity: "1%",
    description: "开始习惯把拥抱、分享和依赖都留给你。",
    unlocked: true,
    icon: "♡",
  },
  {
    id: "cat-companion",
    name: "小猫陪伴",
    rarity: "2%",
    description: "安静待在一起，也觉得世界很软。",
    unlocked: true,
    icon: "⌒",
  },
  {
    id: "butterfly-secret",
    name: "蝴蝶心事",
    rarity: "0.5%",
    description: "那些没说出口的小心动，后来都飞到了你身边。",
    unlocked: true,
    icon: "✦",
  },
  {
    id: "love-you-today",
    name: "今天也喜欢你",
    rarity: "0.1%",
    description: "喜欢不是某一天的事，是每天都重新选择你。",
    unlocked: true,
    icon: "❀",
  },
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: "first-met",
    date: importantDates.firstMet,
    title: "第一次认真看见彼此",
    type: "相遇",
    description:
      "那天没有盛大的开场，但后来回头看，像是命运轻轻把一页纸折了角，提醒我们从这里开始。",
    image: coupleMemory,
    gallery: [skyMemory, noteMemory, butterflyMemory],
    imageHint: "一张浅色车票、聊天截图或那天的天空都适合放在这里。",
  },
  {
    id: "first-long-talk",
    date: importantDates.firstLongTalk,
    title: "聊到舍不得结束",
    type: "心动",
    description:
      "话题从普通的日常慢慢走到心里，那一刻才发现，原来有人愿意认真听，也是一件很珍贵的事。",
    image: noteMemory,
    gallery: [butterflyMemory, cozyMemory, skyMemory],
    imageHint: "可以放一张夜晚、咖啡或聊天记录的照片。",
  },
  {
    id: "first-date",
    date: "2024-07-07",
    title: "把普通一天过得很亮",
    type: "约会",
    description:
      "没有刻意安排成电影里的桥段，却因为身边是对方，连走路、等车、分享一口甜的都变得值得收藏。",
    image: flowerMemory,
    gallery: [coupleMemory, catMemory, noteMemory],
  },
  {
    id: "together",
    date: importantDates.togetherSince,
    title: "我们终于成为彼此的世界",
    type: "重要决定",
    description:
      "从试探、靠近，到愿意把未来也放进句子里。那天以后，很多事情开始有了一个共同的名字：我俩。",
    image: coupleMemory,
    gallery: [giftMemory, butterflyMemory, stickerMemory],
  },
  {
    id: "soft-fight",
    date: "2024-10-03",
    title: "第一次学会慢一点说话",
    type: "争执",
    description:
      "我们都不是故意让对方难过。后来才明白，爱不是永远不误会，而是愿意停下来，把对方真正想说的话听完。",
    image: skyMemory,
    gallery: [noteMemory, cozyMemory, butterflyMemory],
  },
  {
    id: "make-up",
    date: "2024-10-04",
    title: "靠近不是输赢",
    type: "和好",
    description:
      "和好的时候没有谁必须低头，只有两个人都舍不得让距离继续变远。那一天，我们又学会了一点点爱。",
    image: cozyMemory,
    gallery: [catMemory, noteMemory, flowerMemory],
  },
  {
    id: "first-trip",
    date: importantDates.firstTrip,
    title: "一起去看陌生的风",
    type: "旅行",
    description:
      "换一个城市，牵同一双手。风景当然很好看，但更好看的是你在风景里回头找我的样子。",
    image: travelMemory,
    gallery: [skyMemory, coupleMemory, stickerMemory],
    imageHint: "这里适合放旅行合照、票根或一张风景照。",
  },
  {
    id: "gift",
    date: "2025-02-14",
    title: "把想念变成一件小礼物",
    type: "礼物",
    description:
      "礼物真正被记住的地方，不在价格，而在你知道我会喜欢，也愿意花心思让我开心。",
    image: giftMemory,
    gallery: [noteMemory, flowerMemory, butterflyMemory],
  },
  {
    id: "anniversary",
    date: "2025-08-08",
    title: "第一枚认真纪念",
    type: "纪念日",
    description:
      "一年不是故事的终点，而是我们证明过：很多小事累在一起，就会变成很坚定的喜欢。",
    image: stickerMemory,
    gallery: [coupleMemory, giftMemory, noteMemory],
  },
  {
    id: "ordinary-day",
    date: "2026-01-06",
    title: "普通但珍贵的一天",
    type: "普通但珍贵的一天",
    description:
      "没有特别安排，也没有一定要记住的大事件。只是一起吃饭、说话、分享今天，却让人很安心。",
    image: cozyMemory,
    gallery: [catMemory, skyMemory, flowerMemory],
  },
];

export const seedNotes: LoveNote[] = [
  {
    id: "note-1",
    author: "Eric",
    date: "2026-02-14",
    mood: "想你",
    content:
      "我喜欢你不是因为你一直完美，而是因为你有很多真实的小表情、小脾气、小温柔。越了解你，越觉得应该好好珍惜。",
  },
  {
    id: "note-2",
    author: "Ting",
    date: "2026-03-09",
    mood: "安心",
    content:
      "你不一定每次都能马上懂我，但我知道你在学。很多时候，我心软不是因为你说得多漂亮，是因为你真的有在靠近。",
  },
  {
    id: "note-3",
    author: "Eric",
    date: "2026-05-20",
    mood: "纪念",
    content:
      "从遇见你开始，普通的日子像被撒了一点细细的光。我想把这些光都收好，等以后一起翻出来看。",
  },
  {
    id: "note-4",
    author: "Eric",
    date: "2026-06-01",
    mood: "贴贴",
    content:
      "今天也想把你抱抱。不是因为发生了什么特别大的事，只是忽然觉得，有你在的世界会变得很软。",
  },
  {
    id: "note-5",
    author: "Eric",
    date: "2026-06-18",
    mood: "撒娇",
    content:
      "你撒娇的时候真的很可爱，哪怕只是一点点小语气，也会让我觉得：好吧，今天又更喜欢你一点。",
  },
  {
    id: "note-6",
    author: "Ting",
    date: "2026-07-01",
    mood: "晚安",
    content:
      "晚安不是一句结束，是把今天也好好放进我们的小盒子里。希望明天醒来，还是先想到你。",
  },
];

export const moodOptions = ["想你", "撒娇", "心软", "贴贴", "纪念", "和好", "开心", "晚安", "抱抱"];

export const boardMoodOptions: BoardMood[] = [
  "想你",
  "晚安",
  "撒娇",
  "贴贴",
  "和好",
  "心软",
  "开心",
  "纪念",
  "抱抱",
];

export const boardSeedMessages: BoardMessage[] = [
  {
    id: "board-seed-1",
    sender: "Eric",
    receiver: "Ting",
    datetime: "2026-07-05T09:20:00.000Z",
    mood: "想你",
    featured: true,
    content:
      "Ting，今天最想说的话是：你不是偶然被放在这里，你是我很认真、很偏心、很想一直珍惜的人。",
  },
  {
    id: "board-seed-2",
    sender: "Ting",
    receiver: "Eric",
    datetime: "2026-07-04T14:08:00.000Z",
    mood: "心软",
    content:
      "有时候我嘴硬，但你靠近一点、认真一点，我还是会很心软。要记得多抱抱我。",
  },
  {
    id: "board-seed-3",
    sender: "Eric",
    receiver: "Ting",
    datetime: "2026-07-03T16:40:00.000Z",
    mood: "晚安",
    content:
      "晚安。希望你睡前知道，今天也有人把你放在心里很重要的位置。",
  },
];

export const worldMapPlaces: WorldMapPlace[] = [
  {
    id: "shanghai",
    name: "Shanghai",
    country: "中国",
    status: "visited",
    date: "2025-01-18",
    note: "一起走过人很多的街，也一起把普通夜晚过成会发光的记忆。",
    wish: "以后再去一次，把小吃、江边的风和贴贴都补得更满。",
    lat: 31.2304,
    lng: 121.4737,
    image: travelMemory,
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "日本",
    status: "wishlist",
    note: "想把东京先点亮，等以后一起慢慢走进那些温柔的街角。",
    wish: "去看夜景，买可爱小物，再拍一张她喜欢的猫咪照片。",
    lat: 35.6762,
    lng: 139.6503,
    image: catMemory,
  },
  {
    id: "paris",
    name: "Paris",
    country: "法国",
    status: "wishlist",
    note: "这座城市适合把喜欢说得慢一点，也适合给她一场很郑重的偏爱。",
    wish: "牵手散步，给她买花，在夜色里说一次很认真的喜欢。",
    lat: 48.8566,
    lng: 2.3522,
    image: flowerMemory,
  },
  {
    id: "london",
    name: "London",
    country: "英国",
    status: "wishlist",
    note: "想在阴天和灯光里一起走很久，把伞下的位置留给她。",
    wish: "去看桥、看展、喝热饮，然后把今天也写进小纸条。",
    lat: 51.5072,
    lng: -0.1276,
    image: cozyMemory,
  },
  {
    id: "kyoto",
    name: "Kyoto",
    country: "日本",
    status: "wishlist",
    note: "京都应该很适合她，安静、柔软、像一只蝴蝶停在书页边。",
    wish: "一起看庭院、吃甜点，把慢下来的时间都留给彼此。",
    lat: 35.0116,
    lng: 135.7681,
    image: butterflyMemory,
  },
  {
    id: "santorini",
    name: "Santorini",
    country: "希腊",
    status: "wishlist",
    note: "先把海风和白色小房子收藏起来，等有一天带她去看。",
    wish: "看一场很漂亮的日落，拍很多张她被光照到的样子。",
    lat: 36.3932,
    lng: 25.4615,
    image: skyMemory,
  },
  {
    id: "new-york",
    name: "New York",
    country: "美国",
    status: "wishlist",
    note: "很大的城市，也可以只留下我们两个人的小小路线。",
    wish: "一起走过公园和街口，在人群里确认她一直被我牵着。",
    lat: 40.7128,
    lng: -74.006,
    image: coupleMemory,
  },
];

export const futureLetters: FutureLetter[] = [
  {
    id: "future-1",
    title: "写给下一个纪念日",
    openAt: "2026-08-08",
    content:
      "希望那时的我们，已经更会表达、更会拥抱，也更确定：当初选择彼此，是一件很温柔也很勇敢的事。",
  },
  {
    id: "future-2",
    title: "写给很久以后的我们",
    openAt: "未来某一天",
    content:
      "如果有一天我们一起回看这里，请记得：我们曾经很认真地把爱放进每个细节里，也曾经一次次选择不走散。",
  },
];

export const stats: StatItem[] = [
  {
    id: "days-met",
    label: "相遇天数",
    value: `${daysSince(importantDates.firstMet)}`,
    detail: "从第一次靠近开始",
  },
  {
    id: "days-together",
    label: "在一起天数",
    value: `${daysSince(importantDates.togetherSince)}`,
    detail: "把今天也算进喜欢里",
  },
  {
    id: "records",
    label: "共同记录",
    value: `${timelineEvents.length + seedNotes.length + futureLetters.length}`,
    detail: "故事、纸条和未来信",
  },
  {
    id: "notes",
    label: "留言数量",
    value: `${seedNotes.length}`,
    detail: "先放在这里的心里话",
  },
  {
    id: "achievements",
    label: "解锁成就",
    value: `${achievements.filter((item) => item.unlocked).length}`,
    detail: "小小勋章，认真收藏",
  },
];

export const profileHer: Profile = {
  name: "他眼里的她",
  subtitle: "那些让我一次次心动的地方。",
  intro:
    "她有时候很温柔，有时候也会倔强。但越了解她，越会发现，她只是很认真地在爱与被爱。",
  traits: ["很会心软", "认真在乎", "偶尔倔强", "笑起来很亮", "需要被坚定选择", "有自己的小世界"],
  sections: [
    {
      title: "她的样子",
      eyebrow: "她被偏爱的样子",
      body:
        "她不是单一的甜。她有柔软，也有边界；有撒娇，也有不愿将就。正因为这些都是真的，她才更值得被认真看见、认真喜欢、认真珍惜。",
      details: ["喜欢被细节回应", "会把在意藏进小语气", "看似独立，其实很珍惜稳定的偏爱"],
    },
    {
      title: "让我心动的瞬间",
      eyebrow: "心动会偷偷发光",
      body:
        "她不经意回头的时候，认真讲一件小事的时候，明明在乎却还假装没关系的时候，都会让我想把时间放慢一点，悄悄贴一张蝴蝶贴纸。",
      details: ["认真听我说话", "分享今天发生的小事", "嘴硬之后又悄悄靠近"],
    },
    {
      title: "她的小习惯",
      eyebrow: "小习惯也想收藏",
      body:
        "她的小习惯像书页里的香气，轻轻一翻就会出现。那些别人可能忽略的地方，对我来说都是她很可爱的证据。",
      details: ["会反复确认我有没有懂", "喜欢把重要的东西收得很仔细", "生气也会留一点余地给和好"],
    },
    {
      title: "我想认真记住她",
      eyebrow: "想把她放进小纸条里",
      body:
        "我想记住她被照顾时松下来的神情，也记住她不开心时真正需要的不是大道理，而是一句清楚的我在、一个坚定的抱抱。",
      details: ["记住她喜欢的颜色和味道", "记住她不想被敷衍", "记住她值得被很确定地爱"],
    },
  ],
};

export const profileHerSweetProofs = [
  {
    title: "她笑起来的时候",
    body: "像粉色小灯亮了一下，让普通空气都变得甜甜的。",
    image: flowerMemory,
  },
  {
    title: "她嘴硬但心软的时候",
    body: "明明还在假装没关系，却已经悄悄给和好留了门缝。",
    image: noteMemory,
  },
  {
    title: "她认真在乎的时候",
    body: "会把小小的不安说出来，因为她真的想和我走得更近。",
    image: butterflyMemory,
  },
  {
    title: "她撒娇的时候",
    body: "一点点小语气，就足够让我想立刻把她抱进怀里。",
    image: catMemory,
  },
  {
    title: "她需要被坚定选择的时候",
    body: "她不是难哄，她只是想确认自己真的被偏爱、被珍惜。",
    image: coupleMemory,
  },
];

export const profileHerSecretCollection = [
  "她认真看消息时的停顿",
  "她说想你时藏不住的小软",
  "她生气后还愿意听解释的心软",
  "她被夸时假装镇定的样子",
  "她把重要小事记得很清楚的在乎",
];

export const profileHim: Profile = {
  name: "她眼里的他",
  subtitle: "那些她慢慢看见、也慢慢喜欢的部分。",
  intro:
    "他不一定总是会说最漂亮的话，但他会用自己的方式认真靠近。",
  traits: ["慢慢学会表达", "有点黏人", "嘴笨但真诚", "会反省", "想把她照顾好", "像一只陪在旁边的猫"],
  sections: [
    {
      title: "他的样子",
      eyebrow: "像小猫一样靠近",
      body:
        "他有时候反应慢，有时候不知道怎么把心里的话说漂亮。可他愿意留下来，愿意改，愿意像小猫一样慢慢靠近，把喜欢落在行动里。",
      details: ["认真听完再回应", "会记得她随口说过的话", "想把很多事情做得更可靠"],
    },
    {
      title: "他的可爱瞬间",
      eyebrow: "笨拙但很软",
      body:
        "他靠近的时候有一点笨拙，却又很诚实。那些想分享、想确认、想被她夸一下的瞬间，让人很难不心软。",
      details: ["开心时会忍不住多说几句", "想念会藏不太住", "被安慰后会变得很乖"],
    },
    {
      title: "她心软的瞬间",
      eyebrow: "她会想摸摸他的头",
      body:
        "当她看见他不是在逃避，而是在努力学习怎么爱她，她就会愿意再给一点耐心，也给这段关系多一点温柔。",
      details: ["他认真解释的时候", "他主动靠近的时候", "他把承诺变成小行动的时候"],
    },
    {
      title: "他也在学习爱",
      eyebrow: "把喜欢学得更好",
      body:
        "他正在学会：爱不只是证明自己没错，也是看见她为什么难过；不是等她开口才补救，而是提前把她放在心上。",
      details: ["学会更早回应", "学会把在意说清楚", "学会在关系里更温柔也更坚定"],
    },
  ],
};

export const profileHimCuteMoments = [
  {
    title: "他的笨拙可爱瞬间",
    body: "想表达很多，但句子总是慢半拍，于是认真本身就变得很可爱。",
    image: catMemory,
  },
  {
    title: "他想被她夸一下的时候",
    body: "像小猫把爪爪放到手心里，明明不好意思，却又期待被看见。",
    image: cozyMemory,
  },
  {
    title: "他在学习怎么更好地爱她",
    body: "他会复盘、会靠近、会把下一次做得更温柔一点。",
    image: noteMemory,
  },
];

export const frictionRecords: FrictionRecord[] = [
  {
    id: "being-valued",
    title: "当我们都觉得自己委屈",
    date: "2024-10-03",
    whatHappened:
      "那天我们都有点难过，说出来的话都比心里真正想表达的更硬一点。",
    whatICaredAbout:
      "我在意的是被重视，希望我的情绪不是被放到最后才处理。",
    whatYouCaredAbout:
      "你在意的是自己已经尽力，希望努力不要被一句话轻轻抹掉。",
    whatWeLearned:
      "后来才发现，很多争执不是因为不爱，而是因为我们表达爱的方式不同。从那以后，我们又学会了一点点如何靠近彼此。",
  },
  {
    id: "response-time",
    title: "关于及时回应这件小事",
    date: "2025-03-16",
    whatHappened:
      "一条消息晚了一点，一句解释少了一点，心里就悄悄多了很多猜测。",
    whatICaredAbout:
      "我在意的是确定感，希望等待的时候不要只能自己消化。",
    whatYouCaredAbout:
      "你在意的是压力，希望自己不是一直被催促、被否定。",
    whatWeLearned:
      "回应不是束缚，而是把对方放在心上的方式。我们可以更早说明，也可以更温柔地等待。",
  },
  {
    id: "different-tempo",
    title: "我们节奏不一样的时候",
    date: "2025-11-22",
    whatHappened:
      "一个人想马上说清楚，一个人需要先安静下来，于是靠近变成了拉扯。",
    whatICaredAbout:
      "我在意的是问题不要被拖走，希望关系里的不安能被及时接住。",
    whatYouCaredAbout:
      "你在意的是不要在情绪最高的时候说错话，希望先整理好再回来。",
    whatWeLearned:
      "原来暂停不等于逃开，追问也不等于逼迫。只要约定会回来，我们就能在不同节奏里继续相爱。",
  },
];

export const navigationCards = [
  {
    href: "/her",
    title: "他眼里的她",
    description: "把她可爱、心软、发光的地方，一页一页偷偷收藏。",
  },
  {
    href: "/him",
    title: "她眼里的他",
    description: "记录他笨拙但认真靠近，也想被她夸一下的样子。",
  },
  {
    href: "/story",
    title: "相遇以来",
    description: "从第一次靠近，到每一次心动、和好、抱抱。",
  },
  {
    href: "/notes",
    title: "写给你的小纸条",
    description: "想你、撒娇、贴贴、晚安，都可以写在这里。",
  },
  {
    href: "/world",
    title: "甜蜜世界地图",
    description: "把一起去过和以后想一起去的地方，都先点亮。",
  },
  {
    href: "/board",
    title: "我们的留言板",
    description: "你给我，我给你。晚安、撒娇、抱抱都留在这里。",
  },
  {
    href: "/achievements",
    title: "心动藏品",
    description: "把爱收藏成一枚枚甜甜的蝴蝶勋章。",
  },
];
