import type { Metadata } from "next";
import { ArchiveHome } from "@/components/ArchiveHome";

export const metadata: Metadata = {
  title: "Ting & Eric | 私人档案馆",
  description: "不是一个恋爱 App，而是只对两个人开放的私人档案馆。",
};

export default function Home() {
  return <ArchiveHome />;
}
