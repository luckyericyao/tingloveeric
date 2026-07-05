import type { Metadata } from "next";
import { SectionTitle } from "@/components/SectionTitle";
import { WorldMapBoard } from "@/components/WorldMapBoard";
import { worldMapPlaces } from "@/data/love";

export const metadata: Metadata = {
  title: "甜蜜世界地图 | Ting & Eric",
  description: "把已经一起走过的地方，和以后想一起去的地方，都先点亮在地图上。",
};

export default function WorldPage() {
  return (
    <main>
      <section className="page-band">
        <div className="content-wrap">
          <SectionTitle kicker="World Map" title="甜蜜世界地图" align="center">
            把已经一起走过的地方，和以后想一起去的地方，都先点亮在地图上。
          </SectionTitle>
          <div className="mt-10">
            <WorldMapBoard seedPlaces={worldMapPlaces} />
          </div>
        </div>
      </section>
    </main>
  );
}
