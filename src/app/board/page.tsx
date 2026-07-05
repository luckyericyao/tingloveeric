import type { Metadata } from "next";
import { CoupleBoard } from "@/components/CoupleBoard";
import { SectionTitle } from "@/components/SectionTitle";

export const metadata: Metadata = {
  title: "我们的留言板 | Ting & Eric",
  description: "你给我，我给你。想说的话、想念的话、晚安、和好、撒娇，都留在这里。",
};

export default function BoardPage() {
  return (
    <main>
      <section className="page-band">
        <div className="content-wrap">
          <SectionTitle kicker="Private Board" title="我们的留言板" align="center">
            你给我，我给你。想说的话、想念的话、晚安、和好、撒娇，都留在这里。
          </SectionTitle>
          <div className="mt-10">
            <CoupleBoard />
          </div>
        </div>
      </section>
    </main>
  );
}
