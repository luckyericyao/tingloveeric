import { ButterflyDecor } from "./ButterflyDecor";
import { CatDecor } from "./CatDecor";

export function FloatingDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <ButterflyDecor className="left-[8%] top-[18%]" />
      <ButterflyDecor className="right-[14%] top-[22%]" size="small" tone="gold" />
      <ButterflyDecor className="bottom-[14%] left-[18%]" size="small" />
      <CatDecor className="bottom-[7%] right-[7%] hidden md:block" />
    </div>
  );
}
