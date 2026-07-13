import Image from "next/image";
import Link from "next/link";

const archiveRooms = [
  {
    href: "/her",
    title: "Ting 档案",
    description: "她的可爱、脾气、温柔，和那些被认真看见的小表情。",
  },
  {
    href: "/story",
    title: "相遇以来",
    description: "从第一次靠近，到每一次更懂彼此。",
  },
  {
    href: "/notes",
    title: "小纸条",
    description: "那些没有大声说出口，却值得留下的话。",
  },
  {
    href: "/board",
    title: "两个人的留言",
    description: "你给我，我给你，只在这里被读到。",
  },
  {
    href: "/world",
    title: "走过的地方",
    description: "已经抵达的城市，和以后想一起去的远方。",
  },
  {
    href: "/achievements",
    title: "被保存的藏品",
    description: "关系里那些很小，却不想忘记的证据。",
  },
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#f7f3ec] text-[#211c1d]">
      <section className="border-b border-[#211c1d]/15">
        <div className="mx-auto grid w-[min(1320px,calc(100%_-_2rem))] items-center gap-7 pb-5 pt-8 md:min-h-[calc(88svh-4rem)] md:w-[min(1320px,calc(100%_-_4rem))] md:grid-cols-[0.78fr_1.22fr] md:gap-14 md:py-14 lg:gap-20">
          <div className="max-w-xl pb-4 md:pb-0">
            <p className="text-sm text-[#a66572]">私人档案馆</p>
            <h1 className="font-serif-elegant mt-6 text-5xl font-medium leading-[1.08] md:text-6xl lg:text-7xl">
              Ting 与 Eric
              <br />
              被保存的日子
            </h1>
            <p className="mt-8 max-w-lg text-lg leading-9 text-[#211c1d]/72 md:text-xl">
              不是一个恋爱 App，而是只对两个人开放的私人档案馆。
            </p>
            <div className="mt-10 flex items-center gap-4 border-t border-[#211c1d]/18 pt-5 text-sm leading-6 text-[#211c1d]/60">
              <span className="h-px w-8 bg-[#c8bfe4]" aria-hidden="true" />
              <span>蝴蝶索引 · 第一页</span>
            </div>
          </div>

          <figure>
            <div className="relative aspect-video overflow-hidden bg-[#211c1d] md:h-[62svh] md:min-h-[28rem] md:max-h-[42rem] md:aspect-auto">
              <Image
                src="/images/shanghai-night-walk.jpg"
                alt="上海夜里牵手走过灯光长廊的两个人"
                fill
                priority
                sizes="(max-width: 768px) calc(100vw - 2rem), 58vw"
                className="object-cover object-[50%_62%] saturate-[0.72] contrast-[1.04]"
              />
              <div className="absolute inset-0 bg-[#5f2634]/10" aria-hidden="true" />
            </div>
            <figcaption className="mt-4 flex items-center justify-between gap-4 text-xs leading-5 text-[#211c1d]/56">
              <span>2025.01.18</span>
              <span>上海</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="moment" className="border-b border-[#211c1d]/15">
        <div className="mx-auto grid w-[min(1120px,calc(100%_-_2rem))] gap-10 pb-20 pt-12 md:w-[min(1120px,calc(100%_-_4rem))] md:grid-cols-[0.72fr_1.28fr] md:gap-20 md:pb-28 md:pt-12">
          <div>
            <p className="text-sm text-[#a66572]">2025.01.18 · 上海</p>
            <h2 className="font-serif-elegant mt-5 text-4xl font-medium leading-tight md:text-6xl">
              人很多的街，
              <br />
              普通的夜晚
            </h2>
          </div>

          <div className="md:pt-16">
            <blockquote className="font-serif-elegant max-w-2xl text-3xl leading-[1.55] text-[#211c1d] md:text-5xl">
              “世界很大，
              <br />
              但想一起去的人是你。”
            </blockquote>
            <p className="mt-10 max-w-xl text-base leading-8 text-[#211c1d]/68 md:text-lg">
              一起走过人很多的街，也一起把普通夜晚过成会发光的记忆。照片没有记住全部，但它记住了我们并肩走回去的样子。
            </p>

            <div className="mt-14 grid gap-4 border-l-2 border-[#a66572] pl-6 md:grid-cols-[9rem_1fr] md:gap-8">
              <p className="text-sm leading-7 text-[#a66572]">2024.10.04 · 和好</p>
              <div>
                <p className="font-serif-elegant text-2xl leading-9">“靠近不是输赢。”</p>
                <p className="mt-3 max-w-lg text-sm leading-7 text-[#211c1d]/62">
                  没有谁必须低头，只是两个人都舍不得让距离继续变远。那一天，我们又学会了一点点爱。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="rooms">
        <div className="mx-auto w-[min(1120px,calc(100%_-_2rem))] py-20 md:w-[min(1120px,calc(100%_-_4rem))] md:py-28">
          <div className="grid gap-6 border-b border-[#211c1d]/20 pb-10 md:grid-cols-[0.72fr_1.28fr] md:items-end">
            <h2 className="font-serif-elegant text-4xl font-medium leading-tight md:text-6xl">
              几个安静的房间
            </h2>
            <p className="max-w-lg text-base leading-8 text-[#211c1d]/62">
              每一扇门后，只放一类记忆。没有公开广场，也没有需要表演给别人看的关系。
            </p>
          </div>

          <div className="grid md:grid-cols-2 md:gap-x-14">
            {archiveRooms.map((room, index) => (
              <Link
                key={room.href}
                href={room.href}
                className="group grid min-h-40 grid-cols-[2.5rem_1fr] content-center gap-3 border-b border-[#211c1d]/15 py-8 transition-colors hover:text-[#a66572] md:grid-cols-[3rem_1fr]"
              >
                <span className="pt-1 text-xs text-[#a66572]">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="font-serif-elegant block text-2xl leading-9 md:text-3xl">
                    {room.title}
                  </span>
                  <span className="mt-2 block max-w-sm text-sm leading-7 text-[#211c1d]/58 transition-colors group-hover:text-[#a66572]/80">
                    {room.description}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
