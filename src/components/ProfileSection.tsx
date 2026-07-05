import type { ImageAsset, Profile } from "@/data/love";
import { ButterflyDecor } from "./ButterflyDecor";
import { CatDecor } from "./CatDecor";
import { LovePolaroid } from "./LovePolaroid";
import { HeartSparkles, PawPrint, Sticker } from "./ScrapbookDecor";

export function ProfileSection({
  profile,
  mode,
  images = [],
}: {
  profile: Profile;
  mode: "her" | "him";
  images?: ImageAsset[];
}) {
  return (
    <div className="relative">
      <ButterflyDecor className="right-4 top-0" tone={mode === "her" ? "rose" : "gold"} />
      {mode === "him" ? <CatDecor className="right-0 top-28 hidden md:block" /> : null}
      <HeartSparkles className="left-6 top-8" />

      {images.length ? (
        <div className="mb-12 grid gap-5 md:grid-cols-4">
          {images.slice(0, 4).map((image, index) => (
            <LovePolaroid
              key={image.id}
              image={image}
              rotate={index % 2 === 0 ? "-3deg" : "4deg"}
              className={index === 0 ? "md:col-span-2" : ""}
            />
          ))}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        <aside className="glass-panel-strong h-fit p-6">
          <p className="font-serif-elegant text-sm text-[var(--color-gold)]">
            {mode === "her" ? "她被认真看见" : "小猫一样慢慢靠近"}
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
              <Sticker key={trait} tone={mode === "her" ? "rose" : "sage"}>
                {trait}
              </Sticker>
            ))}
          </div>
          {mode === "him" ? (
            <div className="mt-6 flex items-center gap-2 text-sm text-[var(--color-blue-gray)]">
              <PawPrint /> 他也想被她夸一下
            </div>
          ) : null}
        </aside>

        <div className="grid gap-4">
          {profile.sections.map((section) => (
            <article key={section.title} className="glass-panel hover-lift p-6">
              <p className="font-serif-elegant text-xs text-[var(--color-gold)]">
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
