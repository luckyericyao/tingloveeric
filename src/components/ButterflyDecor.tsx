type ButterflyDecorProps = {
  className?: string;
  size?: "small" | "default";
  tone?: "rose" | "gold";
};

export function ButterflyDecor({
  className = "",
  size = "default",
  tone = "rose",
}: ButterflyDecorProps) {
  return (
    <span
      aria-hidden="true"
      className={`butterfly-decor ${size === "small" ? "small" : ""} ${
        tone === "gold" ? "gold" : ""
      } ${className}`}
    />
  );
}
