export type StoryArtifact =
  | "prologue"
  | "coordinates"
  | "orb"
  | "book"
  | "garden"
  | "photo"
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
  artifact: StoryArtifact;
  position: [number, number, number];
  camera: [number, number, number];
  lookAt: [number, number, number];
  action?: {
    label: string;
    href: string;
  };
};

export const storyWorld = {
  title: "Ting & Eric",
  subtitle: "一段可以走进去的故事",
  music: {
    src: "/audio/our-night.m4a",
    title: "Our Night",
    credit: "Original ambient score generated for this private archive.",
  },
  chapters: [
    {
      id: "prologue",
      index: "00",
      label: "序章",
      title: "进入我们的故事",
      date: "",
      place: "",
      quote: "有些关系不是被介绍出来的，是一步一步走进去的。",
      body: "两只小猫陪在画面两侧。每一束光，都通向一段被留下的时间。",
      prompt: "故事从这里开始",
      artifact: "prologue",
      position: [-6, 0, -1],
      camera: [-7.8, 3.2, 7.8],
      lookAt: [-5.5, 1.1, -1.3],
    },
    {
      id: "coordinates",
      index: "01",
      label: "原始坐标",
      title: "我们在 Soul 相遇",
      date: "2025.01",
      place: "Soul",
      quote: "那时候，我们还只是两个陌生人。",
      body: "她那时叫 Hanni。一张自拍，一只猫，一缸鱼和一盆发财树，是故事最早被保存下来的画面。",
      prompt: "一份被留住的数字遗迹",
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
      label: "心动",
      title: "聊到舍不得结束",
      date: "后来",
      place: "深夜",
      quote: "原来有人愿意认真听，也是一件很珍贵的事。",
      body: "话题从普通日常慢慢走到心里。夜已经很深了，谁都没有先说结束。",
      prompt: "那个舍不得说晚安的夜里",
      artifact: "book",
      position: [0, 0, -4.2],
      camera: [-0.8, 2.3, 4.2],
      lookAt: [0, 1, -4.1],
    },
    {
      id: "her-world",
      index: "03",
      label: "她的世界",
      title: "她嘴硬，也会心软",
      date: "靠近以后",
      place: "她的世界",
      quote: "你靠近一点、认真一点，我还是会很心软。",
      body: "她喜欢蝴蝶，也喜欢猫。她需要被清楚选择，生气的时候，也会悄悄给和好留一扇门。",
      prompt: "她的世界慢慢亮起来",
      artifact: "garden",
      position: [3.4, 0, -2.5],
      camera: [4.8, 2.9, 5.2],
      lookAt: [3.4, 1, -2.7],
      action: {
        label: "看见 Ting",
        href: "/her",
      },
    },
    {
      id: "shanghai",
      index: "04",
      label: "我们的记忆",
      title: "人很多的街，普通的夜晚",
      date: "后来",
      place: "上海",
      quote: "世界很大，但想一起去的人是你。",
      body: "一起走过人很多的街，也把一个普通夜晚过成后来会反复想起的样子。",
      prompt: "上海，普通又珍贵的夜晚",
      artifact: "photo",
      position: [6.5, 0, -4.2],
      camera: [8.2, 2.5, 4.3],
      lookAt: [6.5, 1.1, -4.1],
      action: {
        label: "查看全部故事",
        href: "/story",
      },
    },
    {
      id: "future",
      index: "05",
      label: "未来",
      title: "下一站，还没有名字",
      date: "以后",
      place: "东京，以及更远的地方",
      quote: "先把想去的地方点亮，再慢慢一起抵达。",
      body: "夜景、小路、陌生车站。真正想收藏的不是地标，是你也在旁边。",
      prompt: "远处还有一起要去的地方",
      artifact: "city",
      position: [9.7, 0, -2.6],
      camera: [11.1, 3, 5.4],
      lookAt: [9.7, 1.2, -2.7],
      action: {
        label: "打开未来地图",
        href: "/world",
      },
    },
    {
      id: "now",
      index: "06",
      label: "此刻",
      title: "故事还在继续",
      date: "2026.07.05",
      place: "现在",
      quote: "你不是偶然被放在这里。",
      body: "你是我很认真、很偏心、很想一直珍惜的人。新的纸条、城市和照片，以后还会继续落进这里。",
      prompt: "这一页之后，故事仍在继续",
      artifact: "letter",
      position: [12.8, 0, -4],
      camera: [14.4, 2.7, 4.8],
      lookAt: [12.8, 1, -4],
      action: {
        label: "写下此刻",
        href: "/board",
      },
    },
  ] satisfies StoryChapter[],
};

export type StoryWorld = typeof storyWorld;
