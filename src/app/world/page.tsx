import type { Metadata } from "next";
import { WorldMapBoard } from "@/components/WorldMapBoard";
import { WorldCatCompanions } from "@/components/WorldCatCompanions";
import { loveWorldRooms, worldMapPlaces } from "@/data/love";
import styles from "./WorldPage.module.css";
import { viewerSession } from "@/lib/serverAccess";

export const metadata: Metadata = {
  title: "想去的地方 | 私人档案馆",
  description: "把还没出发的城市留在一张真实的地图上。",
};

export default async function WorldPage() {
  const canEdit = (await viewerSession())?.role === "owner";

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <WorldCatCompanions />
        <div className={styles.heroInner}>
          <div>
            <h1>想去的地方</h1>
            <p className={styles.heroCopy}>
              有些风景，想亲眼看一次。
            </p>
          </div>
        </div>
      </section>

      <div className={styles.boardWrap}>
        <WorldMapBoard seedPlaces={worldMapPlaces} canEdit={canEdit} />
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
