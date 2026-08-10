import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NotesBoard } from "@/components/NotesBoard";
import { moodOptions, seedNotes } from "@/data/love";

export const metadata: Metadata = {
  title: "未寄出的信 | 私人档案馆",
  description: "写下一句只属于自己的话，给今天留一点安静。",
};

export default function NotesPage() {
  return (
    <main className="archive-page notes-room-page">
      <section className="notes-room-shell content-wrap">
        <Link className="archive-back-link" href="/private">
          <ArrowLeft size={16} />
          回到四个房间
        </Link>
        <div className="notes-room-heading">
          <p className="archive-kicker">一封不会打扰任何人的信</p>
          <h1>未寄出的信</h1>
          <p className="archive-lede">把今天的一点心情放下来，先只让自己看见。</p>
        </div>
        <NotesBoard seedNotes={seedNotes} moodOptions={moodOptions} />
      </section>
    </main>
  );
}
