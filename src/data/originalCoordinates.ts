import { archiveContent } from "@/data/archiveContent";

export type CoordinateMemory = {
  id: string;
  title: string;
  date: string;
  source: string;
  alt: string;
  caption: string;
  kind: "portrait" | "relic" | "cat";
  sourceLabel: "真实记录" | "猫咪角色肖像";
  focalPoint?: string;
};

export const coordinateMemories = [
  {
    id: "hanni-portrait",
    title: `那时候她叫 ${archiveContent.identity.publicHerName}`,
    date: archiveContent.dates.hanniPost.replaceAll("-", "."),
    source: "/images/edited/hanni-portrait.jpg",
    alt: "暖色灯光中的一张自拍画面",
    caption: "昏黄的灯光，一张写着“小疯子”的自拍。故事还没有开始，所有事情都仍然拥有无限可能。",
    kind: "portrait",
    sourceLabel: "真实记录",
    focalPoint: "50% 54%",
  },
  {
    id: "her-world",
    title: "她最早向外展示的生活",
    date: archiveContent.dates.herWorldPost.replaceAll("-", "."),
    source: "/images/edited/her-world.jpg",
    alt: "猫、鱼缸和发财树组成的生活画面",
    caption: "一只猫，一缸鱼，一盆发财树。这是我最早看见的、属于她的生活。",
    kind: "portrait",
    sourceLabel: "真实记录",
    focalPoint: "50% 48%",
  },
  {
    id: "cp-cottage",
    title: "后来留下的数字遗迹",
    date: "历史截图",
    source: "/images/edited/cp-cottage-relic.jpg",
    alt: "一张后来保存下来的线上关系记录截图",
    caption: "它只保存了某个时刻。画面里的天数、等级与礼物，都不是网站现在的数据。",
    kind: "relic",
    sourceLabel: "真实记录",
    focalPoint: "50% 42%",
  },
  {
    id: "nono",
    title: "诺诺 · Nono",
    date: "她的小世界",
    source: "/assets/cats/nono-front.webp",
    alt: "根据诺诺外貌生成的灰白重点色猫咪角色肖像",
    caption: "脸部和耳朵有明显的灰色重点色。更活泼，也更像故事里那个有点顽皮的角色。",
    kind: "cat",
    sourceLabel: "猫咪角色肖像",
    focalPoint: "50% 36%",
  },
  {
    id: "xiaoye",
    title: archiveContent.cats.xiaoye.nameZh,
    date: "她的小世界",
    source: "/assets/cats/xiaoye-front.webp",
    alt: "根据小yeah外貌生成的银白色长毛猫角色肖像",
    caption: `${archiveContent.cats.xiaoye.shortAppearance}安静、柔软，像一束落在房间里的冷光。`,
    kind: "cat",
    sourceLabel: "猫咪角色肖像",
    focalPoint: "50% 48%",
  },
] satisfies CoordinateMemory[];

export const originalCoordinates = {
  title: archiveContent.firstCoordinates.title,
  period: archiveContent.firstCoordinates.period,
  opening: archiveContent.firstCoordinates.opening,
  tenderMoments: {
    eyebrow: "Eric 的感受",
    title: archiveContent.tenderMoments.title,
    lead: archiveContent.tenderMoments.lead,
    paragraphs: [
      "有一段时间，我会在纸上反复写她的名字，认真帮她修改简历，也会把工作、吃饭、聚会和一天里琐碎的事情讲给她听。",
      "我们有过短暂的通话，会互道晚安。我表达想念，她也曾用几句简单的话、一个可爱的表情，回应那些普通的日常。",
    ],
    replies: [...archiveContent.tenderMoments.replies],
    closing:
      "后来很多事情改变了。但当时的温柔，不需要因为结局而被否定。",
  },
};
