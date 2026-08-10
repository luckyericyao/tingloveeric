import type { LoveNote } from "@/data/love";

export function NoteCard({ note }: { note: LoveNote }) {
  return (
    <article data-testid="note-card" className="archive-note-card">
      <div className="archive-note-meta">
        <p>{note.author}</p>
        <time>{note.date}</time>
      </div>
      <p className="archive-note-source">
        {note.source === "wish" ? "愿望" : note.source === "verified" ? "已核实记录" : "Eric 的感受"}
      </p>
      <p className="archive-note-content">{note.content}</p>
    </article>
  );
}
