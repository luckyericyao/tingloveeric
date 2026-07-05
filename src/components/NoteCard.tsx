import type { LoveNote } from "@/data/love";
import { PawPrint, ScrapbookTape, Sticker } from "./ScrapbookDecor";

export function NoteCard({ note }: { note: LoveNote }) {
  return (
    <article className="paper-note hover-lift rotate-[-0.6deg] p-5">
      <ScrapbookTape className="right-8 top-[-0.6rem] rotate-[5deg]" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-[var(--color-ink)]">{note.author}</p>
        <time className="font-serif-elegant text-sm text-[var(--color-gold)]">
          {note.date}
        </time>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {note.mood ? <Sticker tone="rose">{note.mood}</Sticker> : null}
        <PawPrint className="scale-75 opacity-80" />
      </div>
      <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[var(--color-muted)]">
        {note.content}
      </p>
    </article>
  );
}
