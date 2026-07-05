import Image from "next/image";
import type { ImageAsset } from "@/data/love";
import { ScrapbookTape, Sticker } from "./ScrapbookDecor";

export function LovePolaroid({
  image,
  rotate = "-2deg",
  className = "",
  priority = false,
}: {
  image: ImageAsset;
  rotate?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <figure
      className={`relative rounded-[28px] border border-[rgba(201,169,104,0.26)] bg-[rgba(255,252,247,0.94)] p-3 shadow-[0_24px_60px_rgba(126,99,115,0.16)] ${className}`}
      style={{ transform: `rotate(${rotate})` }}
    >
      <ScrapbookTape className="left-1/2 top-[-0.35rem] z-10 -translate-x-1/2" />
      <div className="relative h-48 overflow-hidden rounded-[22px]">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 80vw, 22vw"
          className="object-cover"
        />
      </div>
      <figcaption className="mt-3 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[var(--color-ink)]">{image.caption}</span>
        {image.sticker ? <Sticker tone="gold">{image.sticker}</Sticker> : null}
      </figcaption>
    </figure>
  );
}
