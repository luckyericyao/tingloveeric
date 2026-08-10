export type StoryArtifact =
  | "prologue"
  | "coordinates"
  | "book"
  | "cats"
  | "city"
  | "letter";

export type StoryChapter = {
  id: string;
  index: string;
  label: string;
  title: string;
  date: string;
  place: string;
  quote: string;
  body: string;
  prompt: string;
  source: "档案说明" | "真实记录" | "Eric 的感受" | "愿望";
  artifact: StoryArtifact;
  position: [number, number, number];
  camera: [number, number, number];
  lookAt: [number, number, number];
  action?: {
    label: string;
    href: string;
  };
};

export type StoryMusicTrack = {
  id: string;
  title: string;
  artist: string;
  src: string;
  type: "audio/mp4" | "audio/mpeg";
  available: boolean;
};

export const storyWorld = {
  title: "Ting & Eric",
  subtitle: "一段只保存真实发生过的相遇",
  music: {
    title: "故事里的歌",
    tracks: [
      {
        id: "jiu-shi-ai-ni",
        title: "就是爱你",
        artist: "陶喆",
        src: "/audio/jiu-shi-ai-ni.m4a",
        type: "audio/mp4",
        available: true,
      },
      {
        id: "wo-shi-yi-zhi-yu",
        title: "我是一只鱼",
        artist: "任贤齐",
        src: "/audio/wo-shi-yi-zhi-yu.m4a",
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
      id: "prologue",
      index: "00",
      label: "私人档案馆",
      title: "从一张真实的画面开始",
      date: "",
      place: "",
      quote: "不是一个恋爱 App，而是只对两个人开放的私人档案馆。",
      body: "这里先保存已经发生过的细节。未来怎么走，不替任何人提前写好。",
      prompt: "轻轻给一个方向，故事会自己向前",
      source: "档案说明",
      artifact: "prologue",
      position: [-6, 0, -1],
      camera: [-7.8, 3.2, 7.8],
      lookAt: [-5.5, 1.1, -1.3],
    },
    {
      id: "coordinates",
      index: "01",
      label: "原始坐标",
      title: "在 Soul 上相遇",
      date: "2025.01",
      place: "Soul",
      quote: "那时候，我们还只是两个陌生人。",
      body: "她那时叫 Hanni。2025 年 1 月 27 日的一张自拍，和 1 月 29 日的一只猫、一缸鱼、一盆发财树，是最早留下来的画面。",
      prompt: "一份被留住的数字遗迹",
      source: "真实记录",
      artifact: "coordinates",
      position: [-3, 0, -3.2],
      camera: [-4.8, 2.6, 5.4],
      lookAt: [-2.7, 1.1, -3.2],
      action: {
        label: "打开原始坐标",
        href: "/coordinates",
      },
    },
    {
      id: "heartbeat",
      index: "02",
      label: "甜蜜的瞬间",
      title: "那些小小的回应",
      date: "靠近以后",
      place: "聊天框与日常",
      quote: "明天听你分享。",
      body: "我在纸上写她的名字，认真帮她修改简历，也把工作、吃饭和一天里的小事讲给她听。一次短通话、一个“真棒”、一句“晚安～”，让陌生慢慢有了温度。",
      prompt: "那些小小的回应",
      source: "真实记录",
      artifact: "book",
      position: [0, 0, -4.2],
      camera: [-0.8, 2.3, 4.2],
      lookAt: [0, 1, -4.1],
    },
    {
      id: "her-world",
      index: "03",
      label: "她的小世界",
      title: "诺诺与小伊",
      date: "真实的猫咪资料",
      place: "她的生活",
      quote: "先把名字和花纹记准确。",
      body: "诺诺是海豹双色布偶，脸部和耳朵有明显重点色；小伊是银白色长毛猫。它们不需要替故事表演，只要作为她生活里真实的两个角色被看见。",
      prompt: "看见她，也尊重她的未知",
      source: "真实记录",
      artifact: "cats",
      position: [3.4, 0, -2.5],
      camera: [4.8, 2.9, 5.2],
      lookAt: [3.4, 1, -2.7],
      action: {
        label: "打开她与两只猫",
        href: "/her",
      },
    },
    {
      id: "shanghai",
      index: "04",
      label: "后来",
      title: "把未来还给选择",
      date: "最后一次交流之后",
      place: "各自的生活",
      quote: "变化由我完成，不需要她回来证明。",
      body: "钱已经归还，旧的金钱关系结束。我也承认过去试图用金钱制造吸引并不平等。后来我减重了四十多斤，重新建立身体、生活和掌控感。",
      prompt: "不虚构结局",
      source: "Eric 的感受",
      artifact: "letter",
      position: [6.5, 0, -4.2],
      camera: [8.2, 2.5, 4.3],
      lookAt: [6.5, 1.1, -4.1],
      action: {
        label: "看 Eric 的记录",
        href: "/him",
      },
    },
    {
      id: "future",
      index: "05",
      label: "愿望",
      title: "下一站，还没有名字",
      date: "以后",
      place: "地图上的空白",
      quote: "愿望可以被写下，但不等于已经发生。",
      body: "夜景、小路、陌生车站。先把想去的地方点亮，等时间和现实告诉我是否真的抵达。",
      prompt: "给未来留一点空间",
      source: "愿望",
      artifact: "city",
      position: [9.7, 0, -2.6],
      camera: [11.1, 3, 5.4],
      lookAt: [9.7, 1.2, -2.7],
      action: {
        label: "打开想去的地方",
        href: "/world",
      },
    },
  ] satisfies StoryChapter[],
};

export type StoryWorld = typeof storyWorld;
