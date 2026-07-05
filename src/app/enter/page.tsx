"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ButterflyTrail, HeartSparkles, PawPrint, RibbonLabel } from "@/components/ScrapbookDecor";

function EnterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";
  const [passcode, setPasscode] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    const response = await fetch("/api/passcode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passcode }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setMessage(payload?.message || "暗号不对，再轻轻试一次。");
      return;
    }

    router.replace(nextPath.startsWith("/") ? nextPath : "/");
    router.refresh();
  }

  return (
    <main className="page-band min-h-[calc(100svh-12rem)]">
      <div className="content-wrap grid place-items-center">
        <section className="glass-panel-strong relative w-full max-w-xl overflow-hidden p-7 md:p-9">
          <HeartSparkles className="left-8 top-8" />
          <ButterflyTrail className="right-10 top-7" />
          <div className="relative">
            <RibbonLabel>Private</RibbonLabel>
            <h1 className="mt-5 text-3xl font-semibold text-[var(--color-ink)] md:text-4xl">
              进入我俩的小世界
            </h1>
            <p className="mt-4 text-sm leading-7 text-[var(--color-muted)]">
              这里放着 Ting 和 Eric 的小秘密、小纸条、小地图和好多好多喜欢。
            </p>

            <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-[var(--color-ink)]">
                小暗号
                <input
                  value={passcode}
                  onChange={(event) => setPasscode(event.target.value)}
                  type="password"
                  className="rounded-2xl border border-[color:var(--color-line)] bg-white/72 px-4 py-3 text-base outline-none transition focus:border-[rgba(214,154,176,0.52)] focus:bg-white"
                  placeholder="输入只属于我俩的暗号"
                />
              </label>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--color-ink)] px-5 py-3 text-sm font-medium text-[var(--color-ivory)] shadow-[0_14px_34px_rgba(67,59,67,0.18)] transition hover:bg-[var(--color-blue-gray)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <PawPrint />
                {isSubmitting ? "正在打开..." : "打开小世界"}
              </button>
              {message ? (
                <p className="rounded-2xl border border-[rgba(214,154,176,0.24)] bg-white/64 px-4 py-3 text-sm text-[var(--color-rose)]">
                  {message}
                </p>
              ) : null}
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function EnterPage() {
  return (
    <Suspense
      fallback={
        <main className="page-band min-h-[calc(100svh-12rem)]">
          <div className="content-wrap grid place-items-center">
            <section className="glass-panel-strong w-full max-w-xl p-7 md:p-9">
              <p className="text-sm text-[var(--color-muted)]">正在打开小世界...</p>
            </section>
          </div>
        </main>
      }
    >
      <EnterContent />
    </Suspense>
  );
}
