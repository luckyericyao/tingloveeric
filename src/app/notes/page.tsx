import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NotesBoard } from "@/components/NotesBoard";
import { moodOptions, seedNotes } from "@/data/love";
import { viewerSession } from "@/lib/serverAccess";
import styles from "@/components/LetterPaper.module.css";

export const metadata: Metadata = {
  title: "未寄出的信 | 私人档案馆",
  description: "写下一句只属于自己的话，给今天留一点安静。",
};

export default async function NotesPage() {
  const canEdit = (await viewerSession())?.role === "owner";
  return (
    <main className={`archive-page notes-room-page ${styles.room}`}>
      <section className="notes-room-shell content-wrap">
        <Link className="archive-back-link" href="/private">
          <ArrowLeft size={16} />
          回到四个房间
        </Link>
        <div className="notes-room-heading">
          <p className="archive-kicker">一封不会打扰任何人的信</p>
          <h1>未寄出的信</h1>
          <p className="archive-lede">{canEdit ? "新信默认仅所有者可读。你可以选择分享给受邀者。" : "这里收着 Eric 选择分享的几句话。读到这里就好，不必回信。"}</p>
        </div>
        <NotesBoard canEdit={canEdit} seedNotes={canEdit ? seedNotes : seedNotes.filter((note) => note.visibility === "shared")} moodOptions={moodOptions} />
      </section>
    </main>
  );
}
