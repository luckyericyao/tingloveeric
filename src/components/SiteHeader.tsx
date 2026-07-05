import Link from "next/link";

const navItems = [
  { href: "/", label: "我俩" },
  { href: "/her", label: "他眼里的她" },
  { href: "/him", label: "她眼里的他" },
  { href: "/story", label: "相遇以来" },
  { href: "/notes", label: "小纸条" },
  { href: "/achievements", label: "心动藏品" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[color:var(--color-line)] bg-[rgba(251,247,240,0.78)] backdrop-blur-2xl">
      <div className="content-wrap flex min-h-16 items-center justify-between gap-4 py-3">
        <Link href="/" className="group flex items-center gap-3" aria-label="回到我俩首页">
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

        <nav className="flex max-w-[68vw] gap-2 overflow-x-auto py-1 text-sm text-[var(--color-muted)]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-full px-3 py-2 text-[var(--color-muted)] transition hover:bg-white/70 hover:text-[var(--color-ink)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
