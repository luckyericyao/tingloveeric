import type { Metadata } from "next";
import { WorldMapBoard } from "@/components/WorldMapBoard";
import { worldMapPlaces } from "@/data/love";
import styles from "./WorldPage.module.css";

export const metadata: Metadata = {
  title: "想去的地方 | 私人档案馆",
  description: "把还没出发的城市留在一张真实的地图上。",
};

export default function WorldPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.kicker}>一张留给愿望的地图</p>
            <h1>
              想去的
              <br />
              地方
            </h1>
            <p className={styles.heroCopy}>
              巴黎、东京、上海……先把那些想亲眼看见的城市点亮。悬停地图上的点位，会出现一张地标照片。
            </p>
          </div>
          <div className={styles.heroAside}>
            <span>{worldMapPlaces.filter((place) => place.featured).length} 座城市名片</span>
            <strong>从一张照片开始</strong>
            <p>地图上的每个点，都先替未来保留一个具体的画面。</p>
          </div>
        </div>
      </section>

      <div className={styles.boardWrap}>
        <WorldMapBoard seedPlaces={worldMapPlaces} />
      </div>
    </main>
  );
}
