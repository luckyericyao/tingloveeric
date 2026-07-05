import type { Metadata } from "next";
import { MemoryImageCard } from "@/components/MemoryImageCard";
import { NoteCard } from "@/components/NoteCard";
import { NotesBoard } from "@/components/NotesBoard";
import { SectionTitle } from "@/components/SectionTitle";
import { RibbonLabel, Sticker } from "@/components/ScrapbookDecor";
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
            今天也有话想写给你。这里是个人小纸条和日记感的收藏，不是两个人互相留言的留言板。
          </SectionTitle>
          <div className="mx-auto mt-8 grid max-w-4xl gap-3 md:grid-cols-3">
            {["今日份想你", "睡前想留一句", "写给未来的我们"].map((item) => (
              <div key={item} className="pinned-note rounded-[1.4rem] border border-[rgba(201,169,104,0.2)] bg-white/56 p-4 text-center">
                <RibbonLabel>{item}</RibbonLabel>
                <p className="mt-4 text-xs leading-6 text-[var(--color-muted)]">
                  {item === "写给未来的我们"
                    ? "有些话先收好，等以后的我们再打开。"
                    : "想你、撒娇、晚安，都可以悄悄放进来。"}
                </p>
              </div>
            ))}
          </div>
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
          <div className="mt-5 flex flex-wrap gap-2">
            <Sticker tone="rose">未来信</Sticker>
            <Sticker tone="lavender">慢慢打开</Sticker>
            <Sticker tone="gold">认真保存</Sticker>
          </div>
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
