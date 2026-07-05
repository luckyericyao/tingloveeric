import type { Metadata } from "next";
import { MemoryImageCard } from "@/components/MemoryImageCard";
import { NoteCard } from "@/components/NoteCard";
import { NotesBoard } from "@/components/NotesBoard";
import { SectionTitle } from "@/components/SectionTitle";
import { futureLetters, moodOptions, noteDecorImages, seedNotes } from "@/data/love";

export const metadata: Metadata = {
  title: "写给你的小纸条 | 我俩",
  description: "今天也有话想写给你。",
};

export default function NotesPage() {
  return (
    <main>
      <section className="page-band love-wall">
        <div className="content-wrap">
          <SectionTitle kicker="今日份想你" title="写给你的小纸条" align="center">
            今天也有话想写给你。想你、撒娇、心软、贴贴，都可以轻轻钉在这面纸条墙上。
          </SectionTitle>
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {noteDecorImages.map((image, index) => (
              <MemoryImageCard key={image.id} image={image} priority={index === 0} />
            ))}
          </div>
          <div className="mt-10">
            <NotesBoard seedNotes={seedNotes} moodOptions={moodOptions} />
          </div>
        </div>
      </section>

      <section className="page-band bg-[rgba(255,250,244,0.38)]">
        <div className="content-wrap">
          <SectionTitle kicker="写给未来的小盒子" title="写给未来的我们">
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
