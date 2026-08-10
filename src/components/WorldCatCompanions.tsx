import Image from "next/image";
import styles from "./WorldCatCompanions.module.css";

export function WorldCatCompanions() {
  return (
    <div className={styles.companions} aria-label="Nono 与 小yeah">
      <figure className={`${styles.cat} ${styles.nono}`} data-testid="world-cat-nono">
        <Image
          src="/assets/cats/nono-right.webp"
          alt="Nono，海豹双色布偶猫"
          width={1023}
          height={1537}
          sizes="(max-width: 700px) 46vw, 280px"
          priority
          className={styles.catImage}
        />
        <figcaption>
          <strong>Nono</strong>
          <span>海豹双色布偶</span>
        </figcaption>
      </figure>

      <figure className={`${styles.cat} ${styles.xiaoye}`} data-testid="world-cat-xiaoye">
        <Image
          src="/assets/cats/xiaoyi-left.webp"
          alt="小yeah，银白色长毛猫"
          width={1128}
          height={1394}
          sizes="(max-width: 700px) 46vw, 300px"
          priority
          className={styles.catImage}
        />
        <figcaption>
          <strong>小yeah</strong>
          <span>银白色长毛</span>
        </figcaption>
      </figure>
    </div>
  );
}
