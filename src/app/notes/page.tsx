import type { Metadata } from "next";
import { NoteCard } from "@/components/NoteCard";
import { NotesBoard } from "@/components/NotesBoard";
import { SectionTitle } from "@/components/SectionTitle";
import { futureLetters, seedNotes } from "@/data/love";

export const metadata: Metadata = {
  title: "写给你的小纸条 | 我俩",
  description: "今天也有话想写给你。",
};

export default function NotesPage() {
  return (
    <main>
      <section className="page-band">
        <div className="content-wrap">
          <SectionTitle kicker="Love notes" title="写给你的小纸条" align="center">
            今天也有话想写给你。
          </SectionTitle>
          <div className="mt-10">
            <NotesBoard seedNotes={seedNotes} />
          </div>
        </div>
      </section>

      <section className="page-band bg-[rgba(255,250,244,0.38)]">
        <div className="content-wrap">
          <SectionTitle kicker="Future letters" title="写给未来的我们">
            有些话先收起来，等以后的我们再慢慢打开。
          </SectionTitle>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {futureLetters.map((letter) => (
              <NoteCard
                key={letter.id}
                note={{
                  id: letter.id,
                  author: letter.title,
                  date: letter.openAt,
                  mood: "写给未来",
                  content: letter.content,
                }}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
