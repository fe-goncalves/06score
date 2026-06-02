import Image from "next/image";

interface OrgImageProps {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
  /** Qualidade do otimizador (1–100). Padrão 90. */
  quality?: number;
}

export function OrgImage({
  src,
  alt,
  width = 48,
  height = 48,
  className,
  fill = false,
  quality = 90,
}: OrgImageProps) {
  const isSmall = !fill && width <= 28 && height <= 28;
  const renderWidth = isSmall ? Math.max(width * 3, 48) : width;
  const renderHeight = isSmall ? Math.max(height * 3, 48) : height;
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-white/[0.05] text-white/25 ${fill ? "absolute inset-0" : ""} ${className ?? ""}`}
        style={fill ? undefined : { width, height }}
        aria-hidden
      >
        <span className="font-display text-[10px] font-bold uppercase">
          {alt.slice(0, 2).toUpperCase()}
        </span>
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        sizes="(max-width:768px) 100vw, 33vw"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={renderWidth}
      height={renderHeight}
      quality={quality}
      sizes={isSmall ? `${width}px` : undefined}
      className={className}
      style={
        isSmall
          ? { width, height, maxWidth: width, maxHeight: height }
          : undefined
      }
    />
  );
}
