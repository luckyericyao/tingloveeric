type CatDecorProps = {
  className?: string;
};

export function CatDecor({ className = "" }: CatDecorProps) {
  return (
    <span aria-hidden="true" className={`cat-decor ${className}`}>
      <span className="cat-ear-left" />
      <span className="cat-ear-right" />
      <span className="cat-face" />
    </span>
  );
}
