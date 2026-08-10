import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { LockPrivateRoom } from "@/components/LockPrivateRoom";
import { loveWorldRooms } from "@/data/love";

export const metadata: Metadata = {
  title: "四个房间 | 私人档案馆",
  description: "四个安静的入口，分别收好照片、猫咪、愿望和未寄出的信。",
};

export default function PrivatePage() {
  return (
    <main className="archive-page private-archive-page">
      <section className="private-intro-band">
        <div className="content-wrap private-intro">
          <p className="archive-kicker">一间安静的私人档案馆</p>
          <h1>四个房间，四种心情。</h1>
          <p>
            一扇门通往相遇，一扇门留给两只猫，一扇门收好愿望，最后一扇只写自己的话。
          </p>
        </div>
      </section>

      <section className="private-rooms-section">
        <div className="content-wrap">
          <div className="private-room-grid">
            {loveWorldRooms.map((room, index) => (
              <Link key={room.id} href={room.href} className="private-room-link">
                <figure className="private-room-preview">
                  <Image
                    src={room.preview.src}
                    alt={room.preview.alt}
                    fill
                    sizes="(max-width: 767px) 30vw, 15vw"
                  />
                </figure>
                <span className="private-room-index">0{index + 1}</span>
                <div>
                  <p className="archive-kicker">{room.sticker}</p>
                  <h2>{room.title}</h2>
                  <p>{room.body}</p>
                </div>
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            ))}
          </div>

          <div className="private-footer-line">
            <LockPrivateRoom />
            <span><LockKeyhole size={14} /> 内容默认只留在这里</span>
            <Link href="/">回到公开首页</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
