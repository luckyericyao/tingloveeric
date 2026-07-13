"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/her", label: "Ting" },
  { href: "/him", label: "Eric" },
  { href: "/story", label: "故事" },
  { href: "/notes", label: "纸条" },
  { href: "/world", label: "地点" },
  { href: "/board", label: "留言" },
  { href: "/achievements", label: "藏品" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[#211c1d]/15 bg-[rgba(247,243,236,0.9)] backdrop-blur-xl">
      <div className="content-wrap flex min-h-16 items-center justify-between gap-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label="回到我俩首页"
          onClick={() => setIsOpen(false)}
        >
          <span>
            <span className="font-serif-elegant block text-base text-[#211c1d]">
              私人档案馆
            </span>
            <span className="block text-[0.68rem] text-[#211c1d]/50">
              Ting 与 Eric
            </span>
          </span>
        </Link>

        <nav className="hidden max-w-[72vw] gap-1 overflow-x-auto py-1 text-sm text-[#211c1d]/55 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`inline-flex whitespace-nowrap border-b px-3 py-2 transition-colors hover:text-[#211c1d] ${
                pathname === item.href
                  ? "border-[#a66572] text-[#211c1d]"
                  : "border-transparent text-[#211c1d]/55"
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
          className="grid size-10 place-items-center border border-[#211c1d]/18 bg-transparent text-[#211c1d] md:hidden"
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
          <div className="border border-[#211c1d]/15 bg-[#f7f3ec] p-4 shadow-[0_18px_46px_rgba(33,28,29,0.1)]">
            <p className="px-2 pb-3 text-xs leading-6 text-[var(--color-muted)]">
              只对 Ting 与 Eric 开放的记录。
            </p>
            <div className="grid gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between border-b border-[#211c1d]/10 px-4 py-3 text-sm transition-colors ${
                  pathname === item.href
                    ? "text-[#a66572]"
                    : "text-[#211c1d]/60 hover:text-[#211c1d]"
                }`}
              >
                <span>{item.label}</span>
              </Link>
            ))}
            </div>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
