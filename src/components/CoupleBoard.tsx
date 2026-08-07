"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw, Reply } from "lucide-react";
import type { BoardMessage, BoardMood } from "@/data/love";
import { boardMoodOptions, boardSeedMessages } from "@/data/love";
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

const quickNotes: Array<{ label: string; content: string; mood: BoardMood }> = [
  { label: "晚安", content: "晚安，今天也想把你放在最后一句里。", mood: "晚安" },
  { label: "想你", content: "今天路过一个很小的瞬间，第一反应还是想告诉你。", mood: "想你" },
  { label: "抱抱", content: "先把一个抱抱留在这里，等你有空的时候再来收。", mood: "抱抱" },
];

const boardStorageKey = "tingloveeric.boardMessages";
const boardPendingStorageKey = "tingloveeric.boardPendingMessages";
const seedMessageIds = new Set(boardSeedMessages.map((message) => message.id));

function isStoredBoardMessage(value: unknown): value is BoardMessage {
  const message = value as Partial<BoardMessage>;
  return (
    typeof message.id === "string" &&
    message.id.length <= 120 &&
    typeof message.sender === "string" &&
    (message.sender === "Eric" || message.sender === "Ting") &&
    typeof message.receiver === "string" &&
    (message.receiver === "Eric" || message.receiver === "Ting") &&
    typeof message.datetime === "string" &&
    !Number.isNaN(new Date(message.datetime).getTime()) &&
    typeof message.content === "string" &&
    message.content.trim().length > 0 &&
    message.content.length <= 360 &&
    typeof message.mood === "string" &&
    boardMoodOptions.includes(message.mood as BoardMood)
  );
}

function sortMessages(messages: BoardMessage[]) {
  const unique = new Map(messages.map((message) => [message.id, message]));
  return [...unique.values()].sort((a, b) => b.datetime.localeCompare(a.datetime));
}

function readStoredMessages(storageKey: string) {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? sortMessages(parsed.filter(isStoredBoardMessage)) : [];
  } catch {
    window.localStorage.removeItem(storageKey);
    return [];
  }
}

function readLocalMessages() {
  return readStoredMessages(boardStorageKey);
}

function readPendingMessages() {
  return readStoredMessages(boardPendingStorageKey).filter((message) => message.id.startsWith("local-"));
}

function writeLocalMessages(messages: BoardMessage[]) {
  if (typeof window === "undefined") return;

  const customMessages = sortMessages(messages)
    .filter((message) => !seedMessageIds.has(message.id))
    .slice(0, 100);
  window.localStorage.setItem(boardStorageKey, JSON.stringify(customMessages));
}

function writePendingMessages(messages: BoardMessage[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(boardPendingStorageKey, JSON.stringify(sortMessages(messages).slice(0, 50)));
}

function mergeMessages(remoteMessages: BoardMessage[], localMessages: BoardMessage[]) {
  return sortMessages([...remoteMessages, ...localMessages]);
}

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
  const [pendingMessages, setPendingMessages] = useState<BoardMessage[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const composerRef = useRef<HTMLFormElement>(null);

  const receiver: BoardMessage["receiver"] = form.sender === "Eric" ? "Ting" : "Eric";

  useEffect(() => {
    let isMounted = true;

    async function loadMessages() {
      setIsLoading(true);
      setError("");
      const localMessages = readLocalMessages();
      const localPending = readPendingMessages();
      setPendingMessages(localPending);
      const response = await fetch("/api/board/messages", { cache: "no-store" }).catch(() => null);

      if (!isMounted) {
        return;
      }

      if (!response) {
        setMessages(mergeMessages(boardSeedMessages, localMessages));
        setShowOwnerStorageNote(true);
        setError(
          localMessages.length
            ? "留言接口暂时没回应，先打开这台设备保存过的话。"
            : "留言板暂时没有打开成功，等一下再试试。",
        );
        setIsLoading(false);
        return;
      }

      const payload = (await response.json().catch(() => null)) as BoardResponse | null;

      if (!response.ok || !payload?.messages) {
        setMessages(mergeMessages(boardSeedMessages, localMessages));
        setShowOwnerStorageNote(true);
        setError(
          typeof payload?.message === "string"
            ? payload.message
            : "留言板暂时没有打开成功，等一下再试试。",
        );
        setIsLoading(false);
        return;
      }

      const nextMessages = payload.persistence === "redis"
        ? mergeMessages(payload.messages, localPending)
        : mergeMessages(payload.messages, localMessages);
      setMessages(nextMessages);
      writeLocalMessages(nextMessages);
      setShowOwnerStorageNote(
        payload.persistence === "memory" || localPending.length > 0,
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

  function replyTo(message: BoardMessage) {
    const compactContent = message.content.trim().replace(/\s+/g, " ");
    const shortenedContent = compactContent.length > 72
      ? `${compactContent.slice(0, 72)}...`
      : compactContent;

    updateForm("sender", message.receiver);
    updateForm("datetime", localDateTimeValue());
    updateForm("mood", message.mood === "晚安" ? "晚安" : "心软");
    updateForm("content", `回复「${shortenedContent}」：`);
    setStatus("已经把这句话放进编辑器了。回一句吧。");
    setError("");
    window.requestAnimationFrame(() => {
      composerRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
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
    const parsedDatetime = new Date(form.datetime);
    const optimisticDatetime = Number.isNaN(parsedDatetime.getTime())
      ? new Date().toISOString()
      : parsedDatetime.toISOString();

    const optimisticMessage: BoardMessage = {
      id: `local-${Date.now()}`,
      sender: form.sender,
      receiver,
      datetime: optimisticDatetime,
      content: form.content.trim(),
      mood: form.mood,
    };
    const response = await fetch("/api/board/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: optimisticMessage.id,
        sender: form.sender,
        receiver,
        datetime: form.datetime,
        content: form.content,
        mood: form.mood,
      }),
    }).catch(() => null);

    function rememberPendingMessage() {
      setPendingMessages((current) => {
        const nextPending = mergeMessages([...current, optimisticMessage], []);
        writePendingMessages(nextPending);
        return nextPending;
      });
    }

    if (!response) {
      const nextMessages = mergeMessages([...messages, optimisticMessage], readLocalMessages());
      setMessages(nextMessages);
      writeLocalMessages(nextMessages);
      rememberPendingMessage();
      setShowOwnerStorageNote(true);
      setIsSubmitting(false);
      setForm((current) => ({
        ...current,
        datetime: localDateTimeValue(),
        content: "",
      }));
      setStatus("接口暂时没回应，这句话先收在这台设备里。网络恢复后仍然可以再同步。");
      return;
    }

    const payload = (await response.json().catch(() => null)) as BoardResponse | null;
    setIsSubmitting(false);

    if (!response.ok || !payload?.messages) {
      const nextMessages = mergeMessages([...messages, optimisticMessage], readLocalMessages());
      setMessages(nextMessages);
      writeLocalMessages(nextMessages);
      rememberPendingMessage();
      setShowOwnerStorageNote(true);
      setError(
        typeof payload?.message === "string"
          ? payload.message
          : "留言没有保存成功，等一下再试试。",
      );
      return;
    }

    const remainingPending = pendingMessages.filter((message) => message.id !== optimisticMessage.id);
    const nextMessages = payload.persistence === "redis"
      ? mergeMessages(payload.messages, remainingPending)
      : mergeMessages(payload.messages, readLocalMessages().filter((message) => message.id !== optimisticMessage.id));
    setMessages(nextMessages);
    writeLocalMessages(nextMessages);
    setPendingMessages(remainingPending);
    writePendingMessages(remainingPending);
    setShowOwnerStorageNote(payload.persistence === "memory" || remainingPending.length > 0);
    setForm((current) => ({
      ...current,
      datetime: localDateTimeValue(),
      content: "",
    }));
    setStatus(
      payload.persistence === "redis"
        ? `这句话已经留给${receiver === "Ting" ? "她" : "他"}了。`
        : "这句话已经留在这里，本机也收好了一份。",
    );
  }

  async function retryPendingMessages() {
    if (!pendingMessages.length || isRetrying) return;

    setIsRetrying(true);
    setError("");
    let remaining = [...pendingMessages];
    let nextMessages = messages;
    let usedMemoryPersistence = false;

    for (const pending of pendingMessages) {
      const response = await fetch("/api/board/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pending),
      }).catch(() => null);

      if (!response) continue;
      const payload = (await response.json().catch(() => null)) as BoardResponse | null;
      if (!response.ok || !payload?.messages) continue;

      if (payload.persistence === "memory") usedMemoryPersistence = true;
      remaining = remaining.filter((message) => message.id !== pending.id);
      nextMessages = mergeMessages(payload.messages, nextMessages.filter((message) => message.id !== pending.id));
    }

    setPendingMessages(remaining);
    writePendingMessages(remaining);
    setMessages(nextMessages);
    writeLocalMessages(nextMessages);
    setShowOwnerStorageNote(usedMemoryPersistence || remaining.length > 0);
    setStatus(
      remaining.length
        ? `还有 ${remaining.length} 句话暂时没有同步，先留在这台设备里。`
        : "这几句话已经重新收好，留言板里也有了。",
    );
    setIsRetrying(false);
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
                <button
                  type="button"
                  data-testid={`reply-highlight-${highlighted.id}`}
                  onClick={() => replyTo(highlighted)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-[rgba(214,154,176,0.32)] bg-white/68 px-3 py-2 text-xs text-[var(--color-rose)] transition hover:bg-white"
                >
                  <Reply size={14} />
                  回一句
                </button>
              </div>
            ) : (
              <p className="mt-5 rounded-[1.6rem] border border-[color:var(--color-line)] bg-white/58 p-5 text-sm leading-7 text-[var(--color-muted)]">
                还没有留言。第一句话可以很轻，也可以很认真。
              </p>
            )}
          </div>

          <form ref={composerRef} onSubmit={handleSubmit} className="paper-note grid gap-4 p-5">
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

            <div className="grid gap-2 text-sm text-[var(--color-ink)]">
              轻轻留一句
              <div className="flex flex-wrap gap-2">
                {quickNotes.map((note) => (
                  <button
                    key={note.label}
                    type="button"
                    data-testid={`quick-note-${note.label}`}
                    onClick={() => {
                      updateForm("content", note.content);
                      updateForm("mood", note.mood);
                      setStatus("");
                      setError("");
                    }}
                    className="tap-bounce rounded-full border border-[rgba(214,154,176,0.32)] bg-[rgba(255,247,250,0.72)] px-3 py-2 text-sm text-[var(--color-rose)] transition hover:bg-white"
                  >
                    {note.label}
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
              <p data-testid="board-status" className="text-sm text-[var(--color-rose)]" role="status" aria-live="polite">
                {status}
              </p>
            ) : null}
            {error ? <p className="text-sm text-[var(--color-rose)]" role="alert">{error}</p> : null}
            {showOwnerStorageNote ? (
              <p className="rounded-2xl border border-[rgba(201,169,104,0.2)] bg-white/50 px-4 py-3 text-xs leading-6 text-[var(--color-muted)]">
                当前留言板使用临时保存；配置 KV 后，两个人在不同设备也能看到这句话。
              </p>
            ) : null}
            {pendingMessages.length ? (
              <div
                data-testid="board-pending-sync"
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[rgba(214,154,176,0.28)] bg-[rgba(255,247,250,0.72)] px-4 py-3 text-xs leading-6 text-[var(--color-rose)]"
                role="status"
                aria-live="polite"
              >
                <span>还有 {pendingMessages.length} 句话等网络回来。</span>
                <button
                  type="button"
                  data-testid="board-retry-sync"
                  onClick={() => void retryPendingMessages()}
                  disabled={isRetrying}
                  className="inline-flex items-center gap-1.5 border-b border-transparent py-1 transition hover:border-[var(--color-rose)] disabled:cursor-wait disabled:opacity-50"
                >
                  <RefreshCw size={13} className={isRetrying ? "animate-spin" : ""} />
                  {isRetrying ? "正在同步..." : "重新同步"}
                </button>
              </div>
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
                <button
                  type="button"
                  data-testid={`reply-${message.id}`}
                  onClick={() => replyTo(message)}
                  className="mt-4 inline-flex items-center gap-2 rounded-full border border-[rgba(214,154,176,0.3)] bg-white/58 px-3 py-2 text-xs text-[var(--color-rose)] transition hover:bg-white"
                >
                  <Reply size={14} />
                  回一句
                </button>
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
