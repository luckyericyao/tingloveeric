import type { Metadata } from "next";
import Image from "next/image";
import { WorldMapBoard } from "@/components/WorldMapBoard";
import { WorldCatCompanions } from "@/components/WorldCatCompanions";
import { loveWorldRooms, worldMapPlaces } from "@/data/love";
import styles from "./WorldPage.module.css";

export const metadata: Metadata = {
  title: "想去的地方 | 私人档案馆",
  description: "把还没出发的城市留在一张真实的地图上。",
};

export default function WorldPage() {
  const featuredPlace = worldMapPlaces.find((place) => place.id === "shanghai") ?? worldMapPlaces[0];

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <WorldCatCompanions />
        <div className={styles.heroInner}>
          <div>
            <p className={styles.kicker}>一张留给愿望的地图</p>
            <h1>
              想去的
              <br />
              地方
            </h1>
            <p className={styles.heroCopy}>
              巴黎、东京、上海……先把那些想亲眼看见的城市和地标点亮。点按或悬停地图上的点位，会出现一张地标照片。
            </p>
          </div>
          <div className={styles.heroAside}>
            <span>{worldMapPlaces.filter((place) => place.featured).length} 处世界名片</span>
            <strong>从一张照片开始</strong>
            <p>地图上的每个点，都先替未来保留一个具体的画面。</p>
            {featuredPlace ? (
              <figure className={styles.heroPhoto}>
                <Image
                  src={featuredPlace.image.src}
                  alt={featuredPlace.image.alt}
                  fill
                  priority
                  sizes="(max-width: 700px) 100vw, 270px"
                />
                <figcaption>{featuredPlace.cityZh} · {featuredPlace.landmark}</figcaption>
              </figure>
            ) : null}
          </div>
        </div>
      </section>

      <div className={styles.boardWrap}>
        <WorldMapBoard seedPlaces={worldMapPlaces} />
      </div>

      <nav className={styles.roomRail} aria-label="地图之后的四个房间">
        <div className={styles.roomRailIntro}>
          <p>地图之后</p>
          <h2>回到只对两个人开放的房间。</h2>
        </div>
        <div className={styles.roomLinks}>
          {loveWorldRooms.map((room) => (
            <a key={room.id} href={room.href} className={`${styles.roomLink} ${styles[room.accent]}`}>
              <span>{room.sticker}</span>
              <strong>{room.title}</strong>
              <small>{room.body}</small>
            </a>
          ))}
        </div>
      </nav>
    </main>
  );
}
