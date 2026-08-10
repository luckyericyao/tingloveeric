"use client";

import { useState } from "react";
import { LockKeyhole } from "lucide-react";

export function LockPrivateRoom() {
  const [isLocking, setIsLocking] = useState(false);
  const [error, setError] = useState("");

  async function lockRoom() {
    setIsLocking(true);
    setError("");

    try {
      const response = await fetch("/api/passcode", { method: "DELETE" });
      if (!response.ok) throw new Error("Lock request failed");
      window.location.replace("/enter?next=%2Fprivate");
    } catch {
      setIsLocking(false);
      setError("暂时没有锁好，再试一次。");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={() => void lockRoom()}
        disabled={isLocking}
        className="inline-flex min-h-11 items-center gap-2 border-b border-transparent px-1 transition hover:border-[var(--color-rose)] hover:text-[var(--color-rose)] disabled:cursor-wait disabled:opacity-50"
      >
        <LockKeyhole size={14} strokeWidth={1.6} />
        {isLocking ? "正在锁上..." : "锁上小世界"}
      </button>
      {error ? <span role="alert">{error}</span> : null}
    </div>
  );
}
