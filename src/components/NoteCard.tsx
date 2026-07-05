import type { LoveNote } from "@/data/love";

export function NoteCard({ note }: { note: LoveNote }) {
  return (
    <article className="paper-note hover-lift p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-medium text-[var(--color-ink)]">{note.author}</p>
        <time className="font-serif-elegant text-sm text-[var(--color-gold)]">
          {note.date}
        </time>
      </div>
      {note.mood ? <span className="soft-chip mt-4 px-3 py-1">{note.mood}</span> : null}
      <p className="mt-4 whitespace-pre-line text-sm leading-8 text-[var(--color-muted)]">
        {note.content}
      </p>
    </article>
  );
}
