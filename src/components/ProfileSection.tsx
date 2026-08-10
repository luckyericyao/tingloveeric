import Image from "next/image";
import type { ImageAsset, Profile } from "@/data/love";

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
    <div className={`archive-profile ${mode === "her" ? "archive-profile-her" : "archive-profile-him"}`}>
      <div className="archive-profile-gallery">
        {images.slice(0, 4).map((image, index) => (
          <figure key={image.id} className={`archive-profile-image archive-profile-image-${index + 1}`}>
            <div className="archive-profile-image-frame">
              <Image src={image.src} alt={image.alt} fill sizes="(max-width: 767px) 44vw, 22vw" />
            </div>
            <figcaption className="archive-profile-caption">{image.caption}</figcaption>
          </figure>
        ))}
      </div>

      <div className="archive-profile-grid">
        <aside className="archive-profile-intro">
          <p className="archive-kicker">{mode === "her" ? "她与两只猫" : "Eric 的自我记录"}</p>
          <h1>{profile.name}</h1>
          <p className="archive-profile-subtitle">{profile.subtitle}</p>
          <p className="archive-profile-lede">{profile.intro}</p>
          <div className="archive-profile-facts">
            {profile.traits.map((trait) => <span key={trait}>{trait}</span>)}
          </div>
        </aside>

        <div className="archive-profile-sections">
          {profile.sections.map((section) => (
            <article key={section.title}>
              <p className="archive-kicker">{section.eyebrow}</p>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
              <ul>
                {section.details.map((detail) => <li key={detail}>{detail}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
