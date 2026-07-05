import type { ReactNode } from "react";

type SectionTitleProps = {
  kicker?: string;
  title: string;
  children?: ReactNode;
  align?: "left" | "center";
};

export function SectionTitle({
  kicker,
  title,
  children,
  align = "left",
}: SectionTitleProps) {
  const centered = align === "center";

  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {kicker ? (
        <p className="font-serif-elegant mb-3 text-xs text-[var(--color-gold)]">
          {kicker}
        </p>
      ) : null}
      <h2 className="text-3xl font-semibold leading-tight text-[var(--color-ink)] md:text-4xl">
        {title}
      </h2>
      {children ? (
        <p className="mt-4 text-base leading-8 text-[var(--color-muted)]">{children}</p>
      ) : null}
    </div>
  );
}
