"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "我俩" },
  { href: "/her", label: "他眼里的她" },
  { href: "/him", label: "她眼里的他" },
  { href: "/story", label: "相遇以来" },
  { href: "/notes", label: "小纸条" },
  { href: "/world", label: "甜蜜世界地图" },
  { href: "/board", label: "我们的留言板" },
  { href: "/achievements", label: "心动藏品" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--color-line)] bg-[rgba(251,247,240,0.78)] backdrop-blur-2xl">
      <div className="content-wrap flex min-h-16 items-center justify-between gap-4 py-3">
        <Link
          href="/"
          className="group flex items-center gap-3"
          aria-label="回到我俩首页"
          onClick={() => setIsOpen(false)}
        >
          <span className="relative grid size-9 place-items-center rounded-full border border-[rgba(201,169,104,0.34)] bg-[rgba(255,250,244,0.86)] shadow-[0_12px_34px_rgba(126,99,115,0.12)]">
            <span className="h-3 w-3 rounded-full bg-[var(--color-rose)] shadow-[10px_0_0_var(--color-lavender),5px_7px_0_var(--color-gold)]" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-[var(--color-ink)]">我俩</span>
            <span className="font-serif-elegant block text-[0.68rem] uppercase text-[var(--color-muted)]">
              Ting & Eric
            </span>
          </span>
        </Link>

        <nav className="hidden max-w-[72vw] gap-2 overflow-x-auto py-1 text-sm text-[var(--color-muted)] md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-full px-3 py-2 transition hover:bg-white/70 hover:text-[var(--color-ink)] ${
                pathname === item.href
                  ? "bg-white/80 text-[var(--color-ink)] shadow-[0_10px_24px_rgba(126,99,115,0.1)]"
                  : "text-[var(--color-muted)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          aria-label="打开导航"
          aria-expanded={isOpen}
          onClick={() => setIsOpen((value) => !value)}
          className="grid size-10 place-items-center rounded-full border border-[rgba(201,169,104,0.26)] bg-white/70 text-[var(--color-ink)] shadow-[0_12px_30px_rgba(126,99,115,0.1)] md:hidden"
        >
          <span className="flex w-4 flex-col gap-1">
            <span className="h-0.5 rounded-full bg-current" />
            <span className="h-0.5 rounded-full bg-current" />
            <span className="h-0.5 rounded-full bg-current" />
          </span>
        </button>
      </div>

      {isOpen ? (
        <nav className="content-wrap pb-4 md:hidden">
          <div className="grid gap-2 rounded-[1.6rem] border border-[color:var(--color-line)] bg-[rgba(255,252,247,0.92)] p-3 shadow-[0_24px_70px_rgba(126,99,115,0.14)]">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`rounded-2xl px-4 py-3 text-sm transition ${
                  pathname === item.href
                    ? "bg-[rgba(214,154,176,0.16)] text-[var(--color-ink)]"
                    : "text-[var(--color-muted)] hover:bg-white/74 hover:text-[var(--color-ink)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
