import type { Metadata } from "next";
import { OriginalCoordinatesChapter } from "@/components/OriginalCoordinatesChapter";

export const metadata: Metadata = {
  title: "原始坐标 | Ting & Eric",
  description: "一段真实发生过的相遇，和最早被保存下来的五张画面。",
};

export default function CoordinatesPage() {
  return <OriginalCoordinatesChapter />;
}
