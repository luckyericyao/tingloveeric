import type { Profile } from "@/data/love";
import { ButterflyDecor } from "./ButterflyDecor";
import { CatDecor } from "./CatDecor";

export function ProfileSection({
  profile,
  mode,
}: {
  profile: Profile;
  mode: "her" | "him";
}) {
  return (
    <div className="relative">
      <ButterflyDecor className="right-4 top-0" tone={mode === "her" ? "rose" : "gold"} />
      {mode === "him" ? <CatDecor className="right-0 top-28 hidden md:block" /> : null}

      <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="glass-panel-strong h-fit p-6">
          <p className="font-serif-elegant text-sm uppercase text-[var(--color-gold)]">
            Precious profile
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-[var(--color-ink)]">
            {profile.name}
          </h1>
          <p className="mt-4 text-lg leading-8 text-[var(--color-muted)]">{profile.subtitle}</p>
          <p className="mt-7 border-l-2 border-[var(--color-mist-rose)] pl-4 text-base leading-8 text-[var(--color-ink)]">
            {profile.intro}
          </p>
          <div className="mt-7 flex flex-wrap gap-2">
            {profile.traits.map((trait) => (
              <span key={trait} className="soft-chip px-3 py-1">
                {trait}
              </span>
            ))}
          </div>
        </aside>

        <div className="grid gap-4">
          {profile.sections.map((section) => (
            <article key={section.title} className="glass-panel hover-lift p-6">
              <p className="font-serif-elegant text-xs uppercase text-[var(--color-gold)]">
                {section.eyebrow}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--color-ink)]">
                {section.title}
              </h2>
              <p className="mt-4 text-sm leading-8 text-[var(--color-muted)]">{section.body}</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                {section.details.map((detail) => (
                  <li
                    key={detail}
                    className="rounded-lg border border-[color:var(--color-line)] bg-white/54 p-3 text-sm leading-6 text-[var(--color-muted)]"
                  >
                    {detail}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
