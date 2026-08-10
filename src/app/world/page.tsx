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
              还没有出发的城市，先被轻轻放进地图。是否抵达，留给以后和现实。
            </p>
          </div>
          <div className={styles.heroAside}>
            <span>给未来留一点空白</span>
            <strong>Shanghai · 先从这里写起</strong>
            <p>一张可以放大、拖动、继续写下去的世界地图。</p>
          </div>
        </div>
      </section>

      <div className={styles.boardWrap}>
        <WorldMapBoard seedPlaces={worldMapPlaces} />
      </div>
    </main>
  );
}
