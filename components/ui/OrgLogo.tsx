/** Logo nítido (sem otimizador Next) para ícones pequenos. */
export function OrgLogo({
  src,
  size = 20,
  className,
}: {
  src: string | null | undefined;
  size?: number;
  className?: string;
}) {
  const dim = `${size}px`;
  if (!src) {
    return (
      <span
        className={`org-logo org-logo--ph ${className ?? ""}`}
        style={{ width: dim, height: dim }}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={src}
      alt=""
      width={size}
      height={size}
      className={`org-logo ${className ?? ""}`}
      style={{ width: dim, height: dim }}
      loading="lazy"
      decoding="async"
    />
  );
}
