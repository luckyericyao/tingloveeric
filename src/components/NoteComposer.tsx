"use client";

import { useRef, useState, type FormEvent } from "react";
import type { LoveNote } from "@/data/love";
import styles from "./LetterPaper.module.css";

type NoteComposerProps = {
  onAdd: (note: LoveNote) => void | Promise<void>;
  moodOptions: string[];
};

function todayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function NoteComposer({ onAdd, moodOptions }: NoteComposerProps) {
  const [date, setDate] = useState(todayValue);
  const [mood, setMood] = useState(moodOptions[0] ?? "想念");
  const [content, setContent] = useState("");
  const [shared, setShared] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef<string | null>(null);
  const saving = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving.current) return;
    const trimmed = content.trim();
    if (!trimmed) {
      setError("先写下自己的话。");
      return;
    }

    setError("");
    setSaved(false);
    setIsSaving(true);
    saving.current = true;
    try {
      requestId.current ??= crypto.randomUUID();
      await onAdd({
        id: requestId.current,
        author: "Eric",
        date,
        mood: mood.trim() || undefined,
        content: trimmed,
        source: "eric-perspective",
        visibility: shared ? "shared" : "owner",
      });
      setContent("");
      setShared(false);
      setSaved(true);
      requestId.current = null;
    } catch (error) {
      setError(error instanceof Error ? error.message : "这句话没有收好，请稍后再试。");
    } finally {
      saving.current = false;
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={`archive-note-composer ${styles.composer}`}>
      <p className="archive-kicker">此刻 · Eric</p>
      <h2>今天想留下什么？</h2>
      <p className="archive-note-intro">
        一件真实发生过的小事，一句没有寄出的想念，或者今天突然想到的画面。
      </p>
      <label className="archive-note-label">
        写下此刻
        <textarea
          value={content}
          onChange={(event) => { setContent(event.target.value); setSaved(false); requestId.current = null; }}
          rows={6}
          maxLength={500}
          disabled={isSaving}
          placeholder="写下一件真实的小事，或者一句只属于自己的话。"
        />
      </label>
      <div className="archive-note-fields">
        <label>
          日期
          <input type="date" value={date} disabled={isSaving} onChange={(event) => { setDate(event.target.value); requestId.current = null; setSaved(false); }} />
        </label>
        <label>
          这一刻
          <select value={mood} disabled={isSaving} onChange={(event) => { setMood(event.target.value); requestId.current = null; setSaved(false); }}>
            {moodOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </label>
      </div>
      <div className="archive-note-actions">
        <label className={styles.sharing}>
          <input type="checkbox" checked={shared} disabled={isSaving} onChange={(event) => { setShared(event.target.checked); requestId.current = null; setSaved(false); }} />
          允许受邀者阅读这封信
        </label>
        <button type="submit" disabled={isSaving} className="archive-solid-button">
          {isSaving ? "正在保存" : "收进未寄出的信"}
        </button>
        {saved ? <span role="status">已保存为 Eric 的记录。</span> : null}
        {error ? <span role="alert">{error}</span> : null}
      </div>
    </form>
  );
}
