import { archiveContent } from "@/data/archiveContent";

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
  cityZh?: string;
  country: string;
  status: WorldPlaceStatus;
  date?: string;
  note: string;
  wish: string;
  lat: number;
  lng: number;
  image: ImageAsset;
  landmark?: string;
  featured?: boolean;
  markerOffset?: [number, number];
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
  hanniPost: archiveContent.dates.hanniPost,
  herWorldPost: archiveContent.dates.herWorldPost,
};

const hanniArchive: ImageAsset = {
  id: "hanni-archive",
  src: "/images/edited/hanni-portrait.jpg",
  alt: "2025 年 1 月 27 日暖色灯光中的自拍画面",
  caption: "那时候她叫 Hanni。",
  category: "verified Soul archive",
};

const herWorldArchive: ImageAsset = {
  id: "her-world-archive",
  src: "/images/edited/her-world.jpg",
  alt: "2025 年 1 月 29 日猫、鱼缸和发财树组成的生活画面",
  caption: "一只猫，一缸鱼，一盆发财树。",
  category: "verified Soul archive",
};

const cpCottageArchive: ImageAsset = {
  id: "cp-cottage-archive",
  src: "/images/edited/cp-cottage-relic.jpg",
  alt: "后来保存下来的线上关系记录截图",
  caption: "一张历史截图，不是现在的关系状态。",
  category: "verified relationship record",
};

const nonoArchive: ImageAsset = {
  id: "nono-archive",
  src: "/assets/cats/nono-front.webp",
  alt: `灰白重点色猫咪${archiveContent.cats.nono.nameZh}的正面肖像`,
  caption: `${archiveContent.cats.nono.nameZh} · ${archiveContent.cats.nono.nameEn}，${archiveContent.cats.nono.shortAppearance}`,
  category: "verified cat reference",
};

const xiaoyeArchive: ImageAsset = {
  id: "xiaoye-archive",
  src: "/assets/cats/xiaoye-front.webp",
  alt: `${archiveContent.cats.xiaoye.appearance}的正面肖像`,
  caption: `${archiveContent.cats.xiaoye.nameZh}，${archiveContent.cats.xiaoye.shortAppearance}`,
  category: "verified cat reference",
};

const wishMapImage: ImageAsset = {
  id: "wish-map-night",
  src: "/images/shanghai-night-walk.jpg",
  alt: "夜里街灯下的城市道路",
  caption: "还没出发的地方，先留在愿望里。",
  category: "personal wish",
};

function travelImage(id: string, city: string, landmark: string): ImageAsset {
  return {
    id: `travel-${id}`,
    src: `/images/travel/${id}.jpg`,
    alt: `${city} ${landmark} 的地标照片`,
    caption: landmark,
    category: "Wikimedia Commons travel landmark",
  };
}

const travelImages = {
  shanghai: travelImage("shanghai", "上海", "外滩与陆家嘴天际线"),
  tokyo: travelImage("tokyo", "东京", "涩谷十字路口"),
  seoul: travelImage("seoul", "首尔", "景福宫庆会楼"),
  bangkok: travelImage("bangkok", "曼谷", "郑王庙"),
  singapore: travelImage("singapore", "新加坡", "滨海湾黄昏"),
  dubai: travelImage("dubai", "迪拜", "哈利法塔天际线"),
  istanbul: travelImage("istanbul", "伊斯坦布尔", "圣索菲亚大教堂"),
  paris: travelImage("paris", "巴黎", "埃菲尔铁塔"),
  london: travelImage("london", "伦敦", "伦敦塔桥"),
  rome: travelImage("rome", "罗马", "斗兽场"),
  barcelona: travelImage("barcelona", "巴塞罗那", "圣家堂"),
  kyoto: travelImage("kyoto", "京都", "清水寺"),
  santorini: travelImage("santorini", "圣托里尼", "伊亚小镇日落"),
  "new-york": travelImage("new-york", "纽约", "自由女神像"),
  sydney: travelImage("sydney", "悉尼", "悉尼歌剧院"),
  cairo: travelImage("cairo", "开罗", "吉萨金字塔"),
  "cape-town": travelImage("cape-town", "开普敦", "桌山"),
  "san-francisco": travelImage("san-francisco", "旧金山", "金门大桥"),
  starbase: travelImage("starbase", "Starbase", "SpaceX 星舰发射场"),
  miami: travelImage("miami", "迈阿密", "迈阿密海滩与天际线"),
  boston: travelImage("boston", "波士顿", "查尔斯河与波士顿天际线"),
  "san-diego": travelImage("san-diego", "圣地亚哥", "圣地亚哥港湾"),
  yellowstone: travelImage("yellowstone", "黄石公园", "大棱镜温泉"),
  chicago: travelImage("chicago", "芝加哥", "芝加哥天际线"),
  beijing: travelImage("beijing", "北京", "长城"),
  xian: travelImage("xian", "西安", "兵马俑"),
  chengdu: travelImage("chengdu", "成都", "大熊猫基地"),
  chongqing: travelImage("chongqing", "重庆", "洪崖洞"),
  hangzhou: travelImage("hangzhou", "杭州", "西湖"),
  guangzhou: travelImage("guangzhou", "广州", "广州塔"),
  shenzhen: travelImage("shenzhen", "深圳", "深圳天际线"),
  xiamen: travelImage("xiamen", "厦门", "鼓浪屿"),
  zhangjiajie: travelImage("zhangjiajie", "张家界", "张家界国家森林公园"),
  lijiang: travelImage("lijiang", "丽江", "丽江古城"),
  harbin: travelImage("harbin", "哈尔滨", "圣索菲亚教堂"),
  sanya: travelImage("sanya", "三亚", "三亚海湾"),
  taiyuan: travelImage("taiyuan", "太原", "晋祠圣母殿"),
  urumqi: travelImage("urumqi", "乌鲁木齐", "新疆城市天际线"),
  lhasa: travelImage("lhasa", "拉萨", "布达拉宫"),
  marrakech: travelImage("marrakech", "马拉喀什", "杰马艾尔弗纳广场"),
  nairobi: travelImage("nairobi", "内罗毕", "乌呼鲁公园与城市天际线"),
  "rio-de-janeiro": travelImage("rio-de-janeiro", "里约热内卢", "科尔科瓦多山与海湾"),
  "buenos-aires": travelImage("buenos-aires", "布宜诺斯艾利斯", "五月大道方尖碑"),
  "machu-picchu": travelImage("machu-picchu", "马丘比丘", "马丘比丘遗址与群山"),
  antarctica: travelImage("antarctica", "南极", "南极冰原与海湾"),
} satisfies Record<string, ImageAsset>;

export const profileHerImages: ImageAsset[] = [
  hanniArchive,
  herWorldArchive,
  nonoArchive,
  xiaoyeArchive,
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
      body: `${archiveContent.cats.nono.nameZh}与${archiveContent.cats.xiaoye.nameZh}，保留它们各自的花纹、名字和柔软的生活痕迹。`,
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
      src: "/images/edited/hanni-portrait.jpg",
      alt: "2025 年 1 月 27 日暖色灯光中的自拍画面",
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
      src: "/images/edited/her-world.jpg",
      alt: "2025 年 1 月 29 日猫、鱼缸和发财树组成的生活画面",
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
      src: "/images/edited/cp-cottage-relic.jpg",
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
    cityZh: "上海",
    country: "中国",
    status: "wishlist",
    note: "先把这座城市放进自己的愿望里。",
    wish: "去看江边的夜色，吃一顿普通的饭，把时间留给这座城市。",
    lat: 31.2304,
    lng: 121.4737,
    image: travelImages.shanghai,
    landmark: "外滩与陆家嘴天际线",
    featured: true,
  },
  {
    id: "tokyo",
    name: "Tokyo",
    cityZh: "东京",
    country: "日本",
    status: "wishlist",
    note: "先收下一条东京夜里的街道。",
    wish: "去看夜景，买一点可爱小物，再拍一张喜欢的照片。",
    lat: 35.6762,
    lng: 139.6503,
    image: travelImages.tokyo,
    landmark: "涩谷十字路口",
    featured: true,
    markerOffset: [7, -3],
  },
  {
    id: "seoul",
    name: "Seoul",
    cityZh: "首尔",
    country: "韩国",
    status: "wishlist",
    note: "古宫屋檐和城市夜色，先收进一张名片。",
    wish: "看一场古宫的光影，再沿着城市街道慢慢走。",
    lat: 37.5665,
    lng: 126.978,
    image: travelImages.seoul,
    landmark: "景福宫庆会楼",
    featured: true,
  },
  {
    id: "bangkok",
    name: "Bangkok",
    cityZh: "曼谷",
    country: "泰国",
    status: "wishlist",
    note: "河边寺庙和热带风，先点亮一处南方的愿望。",
    wish: "坐船看郑王庙，把一晚的风和灯火留在照片里。",
    lat: 13.7563,
    lng: 100.5018,
    image: travelImages.bangkok,
    landmark: "郑王庙",
    featured: true,
  },
  {
    id: "singapore",
    name: "Singapore",
    cityZh: "新加坡",
    country: "新加坡",
    status: "wishlist",
    note: "海湾、树影和很干净的夜色。",
    wish: "看滨海湾的黄昏，走一段有风的城市栈道。",
    lat: 1.3521,
    lng: 103.8198,
    image: travelImages.singapore,
    landmark: "滨海湾黄昏",
    featured: true,
  },
  {
    id: "dubai",
    name: "Dubai",
    cityZh: "迪拜",
    country: "阿联酋",
    status: "wishlist",
    note: "沙漠与天际线同时出现的城市名片。",
    wish: "在高楼和沙漠之间走一遍，看一场晚霞。",
    lat: 25.2048,
    lng: 55.2708,
    image: travelImages.dubai,
    landmark: "哈利法塔天际线",
    featured: true,
  },
  {
    id: "istanbul",
    name: "Istanbul",
    cityZh: "伊斯坦布尔",
    country: "土耳其",
    status: "wishlist",
    note: "两片大陆之间，先留一座有穹顶的城市。",
    wish: "看海峡、清真寺和黄昏里的渡轮。",
    lat: 41.0082,
    lng: 28.9784,
    image: travelImages.istanbul,
    landmark: "圣索菲亚大教堂",
    featured: true,
  },
  {
    id: "paris",
    name: "Paris",
    cityZh: "巴黎",
    country: "法国",
    status: "wishlist",
    note: "花和旧街道，先写进一页愿望。",
    wish: "沿着河边散步，买一束花，给这一天留一张照片。",
    lat: 48.8566,
    lng: 2.3522,
    image: travelImages.paris,
    landmark: "埃菲尔铁塔",
    featured: true,
    markerOffset: [5, -2],
  },
  {
    id: "london",
    name: "London",
    cityZh: "伦敦",
    country: "英国",
    status: "wishlist",
    note: "阴天、灯光和一杯热饮。",
    wish: "去看桥、看展、喝热饮，然后把今天写进一张小纸条。",
    lat: 51.5072,
    lng: -0.1276,
    image: travelImages.london,
    landmark: "伦敦塔桥",
    featured: true,
    markerOffset: [-5, 2],
  },
  {
    id: "rome",
    name: "Rome",
    cityZh: "罗马",
    country: "意大利",
    status: "wishlist",
    note: "旧石头、广场和一座还在呼吸的历史城市。",
    wish: "走过斗兽场周围的旧街，在傍晚拍一张城市的颜色。",
    lat: 41.9028,
    lng: 12.4964,
    image: travelImages.rome,
    landmark: "斗兽场",
    featured: true,
  },
  {
    id: "barcelona",
    name: "Barcelona",
    cityZh: "巴塞罗那",
    country: "西班牙",
    status: "wishlist",
    note: "彩色建筑和海风，先留给这座城市一个位置。",
    wish: "看圣家堂的光，再去海边走一小段。",
    lat: 41.3874,
    lng: 2.1686,
    image: travelImages.barcelona,
    landmark: "圣家堂",
    featured: true,
  },
  {
    id: "kyoto",
    name: "Kyoto",
    cityZh: "京都",
    country: "日本",
    status: "wishlist",
    note: "安静庭院和一页书，先留在这里。",
    wish: "看看庭院，吃一份甜点，把慢下来的时间留给自己。",
    lat: 35.0116,
    lng: 135.7681,
    image: travelImages.kyoto,
    landmark: "清水寺",
    featured: true,
    markerOffset: [-7, 3],
  },
  {
    id: "santorini",
    name: "Santorini",
    cityZh: "圣托里尼",
    country: "希腊",
    status: "wishlist",
    note: "海风和白色小房子，先收藏起来。",
    wish: "看一场漂亮的日落，拍几张被光照亮的风景。",
    lat: 36.3932,
    lng: 25.4615,
    image: travelImages.santorini,
    landmark: "伊亚小镇日落",
    featured: true,
  },
  {
    id: "new-york",
    name: "New York",
    cityZh: "纽约",
    country: "美国",
    status: "wishlist",
    note: "很大的城市，也可以先写成一条小路线。",
    wish: "走过公园和街口，把喜欢的店一一记下来。",
    lat: 40.7128,
    lng: -74.006,
    image: travelImages["new-york"],
    landmark: "自由女神像",
    featured: true,
  },
  {
    id: "sydney",
    name: "Sydney",
    cityZh: "悉尼",
    country: "澳大利亚",
    status: "wishlist",
    note: "海港、白色屋顶和很远的南半球。",
    wish: "在海港边走到天黑，看歌剧院被灯光照亮。",
    lat: -33.8688,
    lng: 151.2093,
    image: travelImages.sydney,
    landmark: "悉尼歌剧院",
    featured: true,
  },
  {
    id: "cairo",
    name: "Cairo",
    cityZh: "开罗",
    country: "埃及",
    status: "wishlist",
    note: "金色沙地和几千年以前留下的轮廓。",
    wish: "看一眼金字塔，把那种辽阔留给以后慢慢消化。",
    lat: 30.0444,
    lng: 31.2357,
    image: travelImages.cairo,
    landmark: "吉萨金字塔",
    featured: true,
  },
  {
    id: "cape-town",
    name: "Cape Town",
    cityZh: "开普敦",
    country: "南非",
    status: "wishlist",
    note: "山、海和一座很适合慢慢看的城市。",
    wish: "看桌山的天气变化，再沿着海岸线走一会儿。",
    lat: -33.9249,
    lng: 18.4241,
    image: travelImages["cape-town"],
    landmark: "桌山",
    featured: true,
  },
  {
    id: "marrakech",
    name: "Marrakesh",
    cityZh: "马拉喀什",
    country: "摩洛哥",
    status: "wishlist",
    note: "赭红色城墙、黄昏广场和北非的热度，给非洲再留一处入口。",
    wish: "去杰马艾尔弗纳广场看灯亮起来，再沿着老城慢慢走。",
    lat: 31.6295,
    lng: -7.9811,
    image: travelImages.marrakech,
    landmark: "杰马艾尔弗纳广场",
    featured: true,
  },
  {
    id: "nairobi",
    name: "Nairobi",
    cityZh: "内罗毕",
    country: "肯尼亚",
    status: "wishlist",
    note: "绿意、公园和城市天际线同时出现的一站。",
    wish: "从公园看一次内罗毕的天际线，也把非洲的风写进路线。",
    lat: -1.2921,
    lng: 36.8219,
    image: travelImages.nairobi,
    landmark: "乌呼鲁公园与城市天际线",
    featured: true,
  },
  {
    id: "rio-de-janeiro",
    name: "Rio de Janeiro",
    cityZh: "里约热内卢",
    country: "巴西",
    status: "wishlist",
    note: "山、海湾和城市一起铺开，先把南美的第一眼留给里约。",
    wish: "从山顶看一遍海湾和城市，再去海边走到天黑。",
    lat: -22.9068,
    lng: -43.1729,
    image: travelImages["rio-de-janeiro"],
    landmark: "科尔科瓦多山与海湾",
    featured: true,
  },
  {
    id: "buenos-aires",
    name: "Buenos Aires",
    cityZh: "布宜诺斯艾利斯",
    country: "阿根廷",
    status: "wishlist",
    note: "一座有旧街道、宽马路和夜晚灯光的南美城市。",
    wish: "去看方尖碑和九七大道，把城市的节奏走一遍。",
    lat: -34.6037,
    lng: -58.3816,
    image: travelImages["buenos-aires"],
    landmark: "五月大道方尖碑",
    featured: true,
  },
  {
    id: "machu-picchu",
    name: "Machu Picchu",
    cityZh: "马丘比丘",
    country: "秘鲁",
    status: "wishlist",
    note: "把南美的山谷、遗址和云层留成一张很远的名片。",
    wish: "亲眼看一次遗址和群山，把那种辽阔留在旅程里。",
    lat: -13.1637,
    lng: -72.5465,
    image: travelImages["machu-picchu"],
    landmark: "马丘比丘遗址与群山",
    featured: true,
  },
  {
    id: "antarctica",
    name: "Antarctica",
    cityZh: "南极",
    country: "南极洲",
    status: "wishlist",
    note: "世界地图最南端留一处安静的白色，不把它伪装成一座城市。",
    wish: "有一天去看冰原、海湾和极地的长天光。",
    lat: -65.2511,
    lng: -64.2539,
    image: travelImages.antarctica,
    landmark: "南极冰原与海湾",
    featured: true,
  },
  {
    id: "san-francisco",
    name: "San Francisco",
    cityZh: "旧金山",
    country: "美国",
    status: "wishlist",
    note: "先从金门大桥开始，给美国主场留一张明亮的入口照片。",
    wish: "沿着海湾看一遍金门大桥，也去走走那些有坡度的街道。",
    lat: 37.7749,
    lng: -122.4194,
    image: travelImages["san-francisco"],
    landmark: "金门大桥",
    featured: true,
  },
  {
    id: "starbase",
    name: "Starbase",
    cityZh: "Starbase",
    country: "美国",
    status: "wishlist",
    note: "德州海边一处很特别的未来坐标，和城市名片放在一起。",
    wish: "去 Boca Chica 看一次发射场，把辽阔的天空留给这一站。",
    lat: 25.9975,
    lng: -97.1555,
    image: travelImages.starbase,
    landmark: "SpaceX 星舰发射场",
    featured: true,
  },
  {
    id: "miami",
    name: "Miami",
    cityZh: "迈阿密",
    country: "美国",
    status: "wishlist",
    note: "海滩、棕榈树和一张带着热度的南方城市名片。",
    wish: "去海边吹风，看一次迈阿密的晚霞和夜里的灯。",
    lat: 25.7617,
    lng: -80.1918,
    image: travelImages.miami,
    landmark: "迈阿密海滩与天际线",
    featured: true,
  },
  {
    id: "boston",
    name: "Boston",
    cityZh: "波士顿",
    country: "美国",
    status: "wishlist",
    note: "港口、旧街区和一座适合慢慢走的东海岸城市。",
    wish: "沿着查尔斯河走一圈，再去看一场傍晚的城市灯光。",
    lat: 42.3601,
    lng: -71.0589,
    image: travelImages.boston,
    landmark: "查尔斯河与波士顿天际线",
    featured: true,
  },
  {
    id: "san-diego",
    name: "San Diego",
    cityZh: "圣地亚哥",
    country: "美国",
    status: "wishlist",
    note: "港湾边的夜色，把美国主场的南方留一处位置。",
    wish: "去海港看夜景，沿着水边把一天走得慢一点。",
    lat: 32.7157,
    lng: -117.1611,
    image: travelImages["san-diego"],
    landmark: "圣地亚哥港湾",
    featured: true,
  },
  {
    id: "yellowstone",
    name: "Yellowstone",
    cityZh: "黄石公园",
    country: "美国",
    status: "wishlist",
    note: "不是一座城市，但值得在地图上单独亮起。",
    wish: "亲眼看一次大棱镜温泉，也看看公园里更安静的风景。",
    lat: 44.6,
    lng: -110.5,
    image: travelImages.yellowstone,
    landmark: "大棱镜温泉",
    featured: true,
  },
  {
    id: "chicago",
    name: "Chicago",
    cityZh: "芝加哥",
    country: "美国",
    status: "wishlist",
    note: "湖边的天际线，为美国主场再添一座北方城市。",
    wish: "从湖边看芝加哥的天际线，再走进一条有风的街道。",
    lat: 41.8781,
    lng: -87.6298,
    image: travelImages.chicago,
    landmark: "芝加哥天际线",
    featured: true,
  },
  {
    id: "beijing",
    name: "Beijing",
    cityZh: "北京",
    country: "中国",
    status: "wishlist",
    note: "先把长城放进国内路线的第一页。",
    wish: "走一段长城，看清晨或傍晚的风从山脊上经过。",
    lat: 39.9042,
    lng: 116.4074,
    image: travelImages.beijing,
    landmark: "长城",
    featured: true,
  },
  {
    id: "taiyuan",
    name: "Taiyuan",
    cityZh: "太原",
    country: "中国",
    status: "wishlist",
    note: "只留一处山西坐标，让太原代表这段北方的旧时间。",
    wish: "去晋祠看古建筑和树影，在太原慢慢走一下午。",
    lat: 37.8706,
    lng: 112.5489,
    image: travelImages.taiyuan,
    landmark: "晋祠圣母殿",
    featured: true,
  },
  {
    id: "guangzhou",
    name: "Guangzhou",
    cityZh: "广州",
    country: "中国",
    status: "wishlist",
    note: "珠江边的城市灯光，和一顿热气腾腾的晚饭。",
    wish: "去看广州塔的夜色，再认真吃一顿早茶。",
    lat: 23.1291,
    lng: 113.2644,
    image: travelImages.guangzhou,
    landmark: "广州塔",
    featured: true,
    markerOffset: [10, -6],
  },
  {
    id: "urumqi",
    name: "Urumqi",
    cityZh: "乌鲁木齐 · 新疆",
    country: "中国",
    status: "wishlist",
    note: "把新疆留成一处远方坐标，不再用一串相邻城市填满地图。",
    wish: "从乌鲁木齐出发去看天山，把很长的路留给一次真正的出发。",
    lat: 43.8256,
    lng: 87.6168,
    image: travelImages.urumqi,
    landmark: "新疆城市天际线",
    featured: true,
  },
  {
    id: "lhasa",
    name: "Lhasa",
    cityZh: "拉萨 · 西藏",
    country: "中国",
    status: "wishlist",
    note: "西藏只留拉萨这一处代表坐标，让地图重新有呼吸。",
    wish: "去看布达拉宫清晨的光，也把高原的安静留给自己。",
    lat: 29.652,
    lng: 91.1721,
    image: travelImages.lhasa,
    landmark: "布达拉宫",
    featured: true,
  },
];

export const profileHer: Profile = {
  name: "她的生活碎片",
  subtitle: `几张照片，几件小事，还有${archiveContent.cats.nono.nameZh}和${archiveContent.cats.xiaoye.nameZh}。`,
  intro:
    "那时候她在 Soul 上叫 Hanni。2025 年 1 月 27 日是一张写着“小疯子”的自拍，1 月 29 日是一只猫、一缸鱼和一盆发财树。",
  traits: [archiveContent.identity.publicHerName, archiveContent.dates.hanniPost.replaceAll("-", "."), archiveContent.dates.herWorldPost.replaceAll("-", "."), `${archiveContent.cats.nono.nameZh}与${archiveContent.cats.xiaoye.nameZh}`],
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
      title: `${archiveContent.cats.nono.nameZh}与${archiveContent.cats.xiaoye.nameZh}`,
      eyebrow: "她的小世界",
      body: `${archiveContent.cats.nono.nameZh}是带灰色重点色的猫，${archiveContent.cats.xiaoye.nameZh}${archiveContent.cats.xiaoye.shortAppearance}它们各自有名字，也各自保留自己的样子。`,
      details: [`${archiveContent.cats.nono.nameZh} · ${archiveContent.cats.nono.nameEn}`, archiveContent.cats.xiaoye.nameZh, "花纹与名字不混淆"],
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
