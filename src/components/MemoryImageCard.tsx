import Image from "next/image";
import type { ImageAsset } from "@/data/love";
import { ScrapbookTape, Sticker } from "./ScrapbookDecor";

export function MemoryImageCard({
  image,
  priority = false,
  className = "",
  tall = false,
}: {
  image: ImageAsset;
  priority?: boolean;
  className?: string;
  tall?: boolean;
}) {
  return (
    <figure
      className={`memory-card hover-lift group relative overflow-hidden p-3 ${className}`}
    >
      <ScrapbookTape className="left-8 top-2 z-10" />
      <div className={`relative overflow-hidden rounded-[24px] ${tall ? "h-80" : "h-56"}`}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 92vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-[1.035]"
        />
      </div>
      <figcaption className="relative mt-3 flex items-start justify-between gap-3 px-1 pb-1">
        <span className="text-sm font-medium leading-6 text-[var(--color-ink)]">
          {image.caption}
        </span>
        {image.sticker ? <Sticker tone="lavender">{image.sticker}</Sticker> : null}
      </figcaption>
    </figure>
  );
}
