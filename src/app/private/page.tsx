import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { LockPrivateRoom } from "@/components/LockPrivateRoom";
import { loveWorldRooms } from "@/data/love";
import { viewerSession } from "@/lib/serverAccess";
import styles from "./PrivatePage.module.css";

export const metadata: Metadata = {
  title: "四个房间 | 私人档案馆",
  description: "四个安静的入口，分别收好照片、猫咪、愿望和未寄出的信。",
};

export default async function PrivatePage() {
  const canEdit = (await viewerSession())?.role === "owner";
  return (
    <main className={styles.page}>
      <section className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>故事之外</p>
          <h1>把温柔留在日常里。</h1>
          <p>
            一句晚安，一次分享，还有两只猫。<br />那些细小的时刻，仍然值得慢慢看。
          </p>
        </div>
      </section>

      <section className={styles.rooms} aria-label="四个房间">
        <div>
          <div className={styles.grid}>
            {loveWorldRooms.map((room) => (
              <Link key={room.id} href={room.href} className={styles.room}>
                <figure className={styles.preview}>
                  {room.id === "notes-room" ? (
                    <div className={styles.letter} aria-hidden="true">
                      <span>有些话，<br />先留在这里。</span>
                      <small>Eric</small>
                    </div>
                  ) : <Image
                    src={room.preview.src}
                    alt={room.preview.alt}
                    fill
                    sizes="(max-width: 700px) 90vw, (max-width: 1200px) 44vw, 520px"
                  />}
                </figure>
                <div className={styles.copy}>
                  <h2>{room.title}</h2>
                  <p>{!canEdit && room.guestBody ? room.guestBody : room.body}</p>
                </div>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>

          <div className={styles.footer}>
            <LockPrivateRoom />
            <span><LockKeyhole size={14} aria-hidden="true" /> 私人档案</span>
            <Link href="/">回到序幕</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
