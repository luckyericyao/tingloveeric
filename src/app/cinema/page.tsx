import type { Metadata } from "next";
import { LoveStoryExperience } from "@/components/LoveStoryExperience";

export const metadata: Metadata = {
  title: "电影故事 | Ting & Eric",
  description: "沿着镜头进入 Ting 与 Eric 被保存下来的故事。",
};

export default function CinemaPage() {
  return <LoveStoryExperience />;
}
