"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { BoardMessage, BoardMood } from "@/data/love";
import { boardMoodOptions } from "@/data/love";
import { ButterflyTrail, HeartSparkles, PawPrint, RibbonLabel, Sticker } from "./ScrapbookDecor";

type BoardFilter = "all" | "fromEric" | "fromTing";

type BoardForm = {
  sender: BoardMessage["sender"];
  datetime: string;
  content: string;
  mood: BoardMood;
};

type BoardResponse = {
  messages?: BoardMessage[];
  message?: BoardMessage | string;
  persistence?: "redis" | "memory";
};

const filterOptions: Array<{ value: BoardFilter; label: string }> = [
  { value: "all", label: "全部" },
  { value: "fromEric", label: "我写给她" },
  { value: "fromTing", label: "她写给我" },
];

function localDateTimeValue(date = new Date()) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function directionLabel(message: Pick<BoardMessage, "sender" | "receiver">) {
  return `${message.sender} → ${message.receiver}`;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function cardTone(message: BoardMessage) {
  return message.sender === "Eric"
    ? "border-[rgba(214,154,176,0.28)] bg-[linear-gradient(145deg,rgba(255,252,247,0.96),rgba(255,239,246,0.84))]"
    : "border-[rgba(200,191,228,0.34)] bg-[linear-gradient(145deg,rgba(255,252,247,0.96),rgba(243,239,255,0.8))]";
}

export function CoupleBoard() {
  const [messages, setMessages] = useState<BoardMessage[]>([]);
  const [showOwnerStorageNote, setShowOwnerStorageNote] = useState(false);
  const [filter, setFilter] = useState<BoardFilter>("all");
  const [form, setForm] = useState<BoardForm>({
    sender: "Eric",
    datetime: localDateTimeValue(),
    content: "",
    mood: "想你",
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const receiver: BoardMessage["receiver"] = form.sender === "Eric" ? "Ting" : "Eric";

  useEffect(() => {
    let isMounted = true;

    async function loadMessages() {
      setIsLoading(true);
      setError("");
      const response = await fetch("/api/board/messages", { cache: "no-store" }).catch(() => null);

      if (!isMounted) {
        return;
      }

      if (!response) {
        setError("留言板暂时没有打开成功，等一下再试试。");
        setIsLoading(false);
        return;
      }

      const payload = (await response.json().catch(() => null)) as BoardResponse | null;

      if (!response.ok || !payload?.messages) {
        setError(
          typeof payload?.message === "string"
            ? payload.message
            : "留言板暂时没有打开成功，等一下再试试。",
        );
        setIsLoading(false);
        return;
      }

      setMessages(payload.messages);
      setShowOwnerStorageNote(
        payload.persistence === "memory" &&
          (window.location.hostname === "localhost" ||
            window.location.hostname === "127.0.0.1" ||
            window.location.search.includes("owner=1")),
      );
      setIsLoading(false);
    }

    loadMessages();

    return () => {
      isMounted = false;
    };
  }, []);

  const highlighted = messages[0] || null;
  const visibleMessages = useMemo(
    () =>
      messages.filter((message) => {
        if (filter === "fromEric") {
          return message.sender === "Eric" && message.receiver === "Ting";
        }

        if (filter === "fromTing") {
          return message.sender === "Ting" && message.receiver === "Eric";
        }

        return true;
      }),
    [filter, messages],
  );

  function updateForm<Value extends keyof BoardForm>(field: Value, value: BoardForm[Value]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("");
    setError("");

    if (!form.content.trim()) {
      setError("留言不能为空。");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/board/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sender: form.sender,
        receiver,
        datetime: form.datetime,
        content: form.content,
        mood: form.mood,
      }),
    });

    const payload = (await response.json().catch(() => null)) as BoardResponse | null;
    setIsSubmitting(false);

    if (!response.ok || !payload?.messages) {
      setError(
        typeof payload?.message === "string"
          ? payload.message
          : "留言没有保存成功，等一下再试试。",
      );
      return;
    }

    setMessages(payload.messages);
    setForm((current) => ({
      ...current,
      datetime: localDateTimeValue(),
      content: "",
    }));
    setStatus(`这句话已经留给${receiver === "Ting" ? "她" : "他"}了。`);
  }

  return (
    <div className="grid gap-8">
      <section className="world-shell relative overflow-hidden p-5 md:p-7">
        <HeartSparkles className="left-8 top-7" />
        <ButterflyTrail className="right-10 top-8" />
        <div className="relative grid gap-6 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <RibbonLabel>今天最想说的话</RibbonLabel>
            <h2 className="mt-5 text-2xl font-semibold text-[var(--color-ink)] md:text-3xl">
              今天最想说的话
            </h2>
            {highlighted ? (
              <div className="pinned-note mt-5 rounded-[1.6rem] border border-[rgba(214,154,176,0.24)] bg-white/64 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Sticker tone={highlighted.sender === "Eric" ? "rose" : "lavender"}>
                    {directionLabel(highlighted)}
                  </Sticker>
                  <Sticker tone="gold">{highlighted.mood}</Sticker>
                  {highlighted.featured ? <Sticker tone="lavender">置顶</Sticker> : null}
                </div>
                <p className="mt-4 text-base leading-8 text-[var(--color-ink)]">
                  {highlighted.content}
                </p>
                <p className="mt-3 text-xs text-[var(--color-muted)]">
                  {formatDateTime(highlighted.datetime)}
                </p>
              </div>
            ) : (
              <p className="mt-5 rounded-[1.6rem] border border-[color:var(--color-line)] bg-white/58 p-5 text-sm leading-7 text-[var(--color-muted)]">
                还没有留言。第一句话可以很轻，也可以很认真。
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="paper-note grid gap-4 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { sender: "Eric" as const, label: "Eric → Ting" },
                { sender: "Ting" as const, label: "Ting → Eric" },
              ].map((option) => (
                <button
                  key={option.label}
                  type="button"
                  data-testid={`sender-${option.sender}`}
                  onClick={() => updateForm("sender", option.sender)}
                  className={`tap-bounce rounded-2xl border px-4 py-3 text-left text-sm transition ${
                    form.sender === option.sender
                      ? "border-[rgba(214,154,176,0.42)] bg-white text-[var(--color-ink)] shadow-[0_12px_28px_rgba(126,99,115,0.1)]"
                      : "border-[color:var(--color-line)] bg-white/54 text-[var(--color-muted)] hover:bg-white/80"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-[var(--color-ink)]">
                收件人
                <span className="rounded-2xl border border-[color:var(--color-line)] bg-white/58 px-4 py-3 text-[var(--color-muted)]">
                  {receiver}
                </span>
              </label>
              <label className="grid gap-2 text-sm text-[var(--color-ink)]">
                日期时间
                <input
                  data-testid="board-datetime"
                  value={form.datetime}
                  onChange={(event) => updateForm("datetime", event.target.value)}
                  type="datetime-local"
                  className="rounded-2xl border border-[color:var(--color-line)] bg-white/70 px-4 py-3 outline-none focus:border-[rgba(214,154,176,0.48)]"
                />
              </label>
            </div>

            <div className="grid gap-2 text-sm text-[var(--color-ink)]">
              心情标签
              <div className="flex flex-wrap gap-2">
                {boardMoodOptions.map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    data-testid={`mood-${mood}`}
                    onClick={() => updateForm("mood", mood)}
                    className={`tap-bounce rounded-full border px-3 py-2 text-sm transition ${
                      form.mood === mood
                        ? "border-[rgba(214,154,176,0.42)] bg-[var(--color-ink)] text-[var(--color-ivory)]"
                        : "border-[color:var(--color-line)] bg-white/60 text-[var(--color-muted)] hover:bg-white"
                    }`}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <label className="grid gap-2 text-sm text-[var(--color-ink)]">
              想说的话
              <textarea
                data-testid="board-content"
                value={form.content}
                onChange={(event) => updateForm("content", event.target.value)}
                rows={5}
                maxLength={360}
                className="resize-none rounded-2xl border border-[color:var(--color-line)] bg-white/70 px-4 py-3 leading-7 outline-none focus:border-[rgba(214,154,176,0.48)]"
                placeholder="晚安、想你、和好、撒娇，都可以认真留在这里。"
              />
            </label>

            <button
              type="submit"
              data-testid="board-submit"
              disabled={isSubmitting}
              className="tap-bounce inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-medium text-[var(--color-ivory)] transition hover:bg-[var(--color-blue-gray)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PawPrint />
              {isSubmitting ? "正在保存..." : "留下这句话"}
            </button>
            {status ? (
              <p data-testid="board-status" className="text-sm text-[var(--color-rose)]">
                {status}
              </p>
            ) : null}
            {error ? <p className="text-sm text-[var(--color-rose)]">{error}</p> : null}
            {showOwnerStorageNote ? (
              <p className="rounded-2xl border border-[rgba(201,169,104,0.2)] bg-white/50 px-4 py-3 text-xs leading-6 text-[var(--color-muted)]">
                当前留言板使用临时存储，建议配置 KV 后再长期使用。
              </p>
            ) : null}
          </form>
        </div>
      </section>

      <section className="love-wall rounded-[2rem] border border-[rgba(201,169,104,0.18)] bg-[rgba(255,250,244,0.38)] p-4 md:p-6">
        <div className="mb-5 flex flex-wrap gap-2">
          <Sticker tone="rose">私密留言墙</Sticker>
          <Sticker tone="lavender">不是公开评论</Sticker>
          <Sticker tone="gold">贴贴保存</Sticker>
        </div>
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`tap-bounce rounded-full border px-4 py-2 text-sm transition ${
                filter === option.value
                  ? "border-[rgba(214,154,176,0.38)] bg-[var(--color-ink)] text-[var(--color-ivory)]"
                  : "border-[color:var(--color-line)] bg-white/62 text-[var(--color-muted)] hover:bg-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="glass-panel p-6 text-sm text-[var(--color-muted)]">正在打开留言板...</div>
        ) : visibleMessages.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {visibleMessages.map((message) => (
              <article
                key={message.id}
                className={`pinned-note relative overflow-hidden rounded-[1.8rem] border p-5 shadow-[0_18px_50px_rgba(126,99,115,0.12)] ${cardTone(message)}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Sticker tone={message.sender === "Eric" ? "rose" : "lavender"}>
                    {directionLabel(message)}
                  </Sticker>
                  <Sticker tone="gold">{message.mood}</Sticker>
                  {message.featured ? <Sticker tone="lavender">置顶</Sticker> : null}
                </div>
                <p className="mt-4 text-base leading-8 text-[var(--color-ink)]">{message.content}</p>
                <p className="mt-4 text-xs text-[var(--color-muted)]">
                  {formatDateTime(message.datetime)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <div className="glass-panel p-6 text-sm leading-7 text-[var(--color-muted)]">
            这个筛选里还没有留言。可以先写一句软软的话，给它开个头。
          </div>
        )}
      </section>
    </div>
  );
}
