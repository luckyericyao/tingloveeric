export type ArchiveContentClass = "public" | "private" | "eric-feeling" | "verified-record";

export const archiveContent = {
  identity: {
    publicHerName: "Hanni",
    privateHerName: "胡子婷",
    himName: "Eric",
  },
  dates: {
    hanniPost: "2025-01-27",
    herWorldPost: "2025-01-29",
  },
  audio: {
    opening: {
      id: "jiu-shi-ai-ni",
      title: "就是爱你",
      artist: "陶喆",
      src: "/audio/jiu-shi-ai-ni.m4a",
    },
    story: {
      id: "wo-shi-yi-zhi-yu",
      title: "我是一只鱼",
      artist: "任贤齐",
      src: "/audio/wo-shi-yi-zhi-yu.m4a",
    },
  },
  cats: {
    nono: {
      nameZh: "诺诺",
      nameEn: "Nono",
      appearance: "海豹双色布偶，脸部和耳朵有明显重点色，蓝灰色眼睛。",
      shortAppearance: "脸部和耳朵带明显灰色重点色。",
    },
    xiaoye: {
      nameZh: "小yeah",
      nameEn: "Xiaoye",
      appearance: "银白色长毛猫，圆脸、毛量大，灰绿色眼睛。",
      shortAppearance: "整体偏纯白与银白。",
    },
  },
  firstCoordinates: {
    title: "我们最初在 Soul 相遇",
    period: "2025.01",
    opening: "在真正了解她以前，我先看见了她的一张自拍、一只猫、一缸鱼和一盆发财树。",
    portraitCaption: "那时候她叫 Hanni。",
    worldCaption: "一只猫，一缸鱼，一盆发财树。",
  },
  tenderMoments: {
    title: "甜蜜的瞬间",
    lead: "那段时间，陌生慢慢有了温度。",
    replies: ["明天听你分享。", "真棒。", "晚安～"],
  },
  separation: {
    fact: "后来我们失去了联系。她把之前的钱全部还给了我，旧的金钱关系就此结束。",
    reflection: "过去试图用金钱制造吸引，并不是平等地认识一个人的方式。钱被归还，不代表谁因此获得了一次重新开始的权利。",
    growth: "最后一次交流以后，我减重了四十多斤，也重新建立了自己的身体、生活和掌控感。",
  },
} as const;

export const archiveSourceLabels: Record<ArchiveContentClass, string> = {
  public: "公开页面",
  private: "私人房间",
  "eric-feeling": "Eric 的感受",
  "verified-record": "真实记录",
};
