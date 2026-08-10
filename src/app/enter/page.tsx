"use client";

import { FormEvent, Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import styles from "./EnterGate.module.css";

function EnterContent() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";
  const [passcode, setPasscode] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        setMessage(payload?.message || "暗号不对，再轻轻试一次。");
        return;
      }

      const safeNextPath = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
      window.location.replace(safeNextPath);
    } catch {
      setMessage("暗号门暂时没有回应，检查网络后再试一次。");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className={styles.entryPage}>
      <Image
        src="/images/home/hero-memory-collage.jpg"
        alt="旧自拍、猫咪与鱼缸组成的记忆拼贴"
        fill
        priority
        sizes="100vw"
        className={styles.entryImage}
      />
      <div className={styles.entryVeil} aria-hidden="true" />
      <div className={styles.entryStage}>
        <div className={styles.entryContext}>
          <p className={styles.entryOverline}>私人档案馆 · 仅限受邀查看</p>
          <h1>有些记忆，<br />只在这里安静保存。</h1>
          <p>
            从一张自拍、一只猫和一句晚安开始。这里保存的是曾经真实发生过的靠近，
            也保留每个人继续生活以后的空间。
          </p>
        </div>

        <section className={styles.entryGate} aria-labelledby="entry-title">
          <div className={styles.gateTopline}>
            <span className={styles.entryKicker}>私人入口</span>
            <LockKeyhole size={18} strokeWidth={1.5} aria-hidden="true" />
          </div>
          <h2 id="entry-title">进入档案馆</h2>
          <p className={styles.gateIntro}>输入暗号，继续看完剩下的故事。</p>

          <form onSubmit={handleSubmit} className={styles.entryForm}>
            <label className={styles.entryLabel}>
              小暗号
              <input
                value={passcode}
                onChange={(event) => setPasscode(event.target.value)}
                type="password"
                autoComplete="current-password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                autoCapitalize="off"
                spellCheck={false}
                className={styles.entryInput}
                placeholder="输入暗号"
                autoFocus
              />
            </label>
            <button type="submit" disabled={isSubmitting} className={styles.entrySubmit}>
              {isSubmitting ? "正在打开..." : "打开小世界"}
              <ArrowRight size={16} strokeWidth={1.7} />
            </button>
            {message ? (
              <p className={styles.entryMessage} role="alert" aria-live="assertive">
                {message}
              </p>
            ) : null}
          </form>

          <Link className={styles.archiveLink} href="/">
            <ArrowLeft size={15} strokeWidth={1.5} />
            回到公开档案馆
          </Link>
        </section>
      </div>
      <p className={styles.entryCaption}>那时候，还只是两个陌生人。</p>
    </main>
  );
}

export default function EnterPage() {
  return (
    <Suspense
      fallback={
        <main className={styles.entryPage}>
          <div className={styles.entryStage}>
            <p className={styles.entryKicker}>正在打开小世界...</p>
          </div>
        </main>
      }
    >
      <EnterContent />
    </Suspense>
  );
}
