import type { Metadata } from "next";
import { WorldMapBoard } from "@/components/WorldMapBoard";
import { worldMapPlaces } from "@/data/love";
import styles from "./WorldPage.module.css";

export const metadata: Metadata = {
  title: "带你看遍这个世界 | Ting & Eric",
  description: "已经一起走过的地方，和以后想一起去的地方，都在一张真实的地图上留下坐标。",
};

export default function WorldPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div>
            <p className={styles.kicker}>PRIVATE TRAVEL ARCHIVE</p>
            <h1>
              带你看遍
              <br />
              这个世界
            </h1>
            <p className={styles.heroCopy}>
              已经一起走过的地方，和以后想一起去的地方，先被我们轻轻点亮。
            </p>
          </div>
          <div className={styles.heroAside}>
            <span>Eric &amp; Ting</span>
            <strong>Shanghai → everywhere</strong>
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
