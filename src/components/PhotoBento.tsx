import type { ImageAsset } from "@/data/love";
import { MemoryImageCard } from "./MemoryImageCard";

export function PhotoBento({ images }: { images: ImageAsset[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-6">
      {images.map((image, index) => (
        <MemoryImageCard
          key={image.id}
          image={image}
          priority={index < 2}
          tall={index === 0 || index === 4}
          className={
            index === 0
              ? "md:col-span-3 md:row-span-2"
              : index === 1 || index === 5
                ? "md:col-span-3"
                : "md:col-span-2"
          }
        />
      ))}
    </div>
  );
}
