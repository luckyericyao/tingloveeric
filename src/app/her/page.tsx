import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import { archiveContent } from "@/data/archiveContent";
import styles from "./HerPage.module.css";
import { CatPortrait } from "@/components/CatPortrait";

export const metadata: Metadata = {
  title: "她与两只猫 | Ting 与 Eric",
  description: "只保存照片、日期和原话能支持的她的生活碎片。",
};

export default function HerPage() {
  return (
    <main className={`archive-page ${styles.page}`}>
      <section>
        <div className="content-wrap">
          <Link className="archive-back-link" href="/private">
            <ArrowLeft size={16} />
            回到四个房间
          </Link>
          <header className={styles.heading} data-testid="cats-heading">
            <h1>她与两只猫</h1>
            <p>生活里，柔软的那一部分。</p>
          </header>
          <div className={styles.portraits} data-testid="cat-portraits">
            {([
              { id: "xiaoye", name: archiveContent.cats.xiaoye.nameZh, src: "/assets/cats/xiaoye-front.webp", detail: archiveContent.cats.xiaoye.appearance },
              { id: "nono", name: archiveContent.cats.nono.nameEn, src: "/assets/cats/nono-front.webp", detail: archiveContent.cats.nono.appearance },
            ] as const).map(cat => (
              <figure key={cat.id}>
                <CatPortrait id={cat.id} name={cat.name} detail={cat.detail} />
                <figcaption><h2>{cat.name}</h2><p>{cat.detail}</p></figcaption>
              </figure>
            ))}
          </div>
          <figure className={styles.memory}>
            <Image src="/images/edited/her-world.jpg" alt="猫、鱼缸与发财树的生活片段" width={1200} height={1600} sizes="(max-width: 700px) 100vw, 600px" />
            <figcaption>一只猫，一缸鱼，一盆发财树。</figcaption>
          </figure>
        </div>
      </section>
    </main>
  );
}
