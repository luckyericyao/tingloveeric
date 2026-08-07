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
  tenderMoments: {
    eyebrow: "靠近以后 · 真实发生过",
    title: "甜蜜的瞬间",
    lead: "我们没有一直停留在最初的陌生里。",
    paragraphs: [
      "有一段时间，我会在纸上反复写她的名字，认真帮她修改简历，也会把工作、吃饭、聚会和一天里琐碎的事情讲给她听。",
      "我们有过短暂的通话，会互道晚安。我表达想念，她也会用“明天听你分享”“真棒”“晚安～”和可爱的表情，回应那些普通的日常。",
    ],
    replies: ["明天听你分享。", "真棒。", "晚安～"],
    fragments: [
      {
        label: "纸上 · 一遍又一遍",
        title: "她的名字",
        body: "我会在纸上写下她的名字，也认真看她正在走的路。",
        tone: "paper",
      },
      {
        label: "通话 · 1:27",
        title: "明天听你分享～",
        body: "一句早点睡、晚安和做个好梦，留住了那天很轻的一点靠近。",
        tone: "rose",
      },
      {
        label: "聊天里 · 被分享的日常",
        title: "Missing you deeply.",
        body: "工作、吃饭、聚会，琐碎的日子里也会给对方留一点位置。",
        tone: "lavender",
      },
    ],
    closing:
      "这些很小的回应不能替整段关系下定义，也不是正式关系的证明。但它们真实发生过，所以值得被留下。",
  },
  change: {
    eyebrow: "后来 · 关系重新归零",
    title: "变化之后",
    paragraphs: [
      "后来我们失去了联系。她把之前的钱全部还给了我，旧的金钱关系就此结束。",
      "我也承认，过去试图用金钱制造吸引，并不是平等地认识一个人的方式。钱被归还，不代表谁因此获得了一次重新开始的权利。",
      "最后一次交流以后，我减重了四十多斤，也重新建立了自己的身体、生活和掌控感。这些改变由我完成，不需要由她回来证明。",
    ],
    future:
      "如果未来还有一次自然相遇，我们可以作为两个自由、独立的人，重新判断彼此是否合适；如果没有，也不替故事虚构结局。",
  },
  closing:
    "我不再试图购买一个结局。我只是成为了一个更好的自己，并把未来重新交还给选择。",
};
