import Image from "next/image";

interface OrgImageProps {
  src: string | null | undefined;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  fill?: boolean;
}

export function OrgImage({
  src,
  alt,
  width = 48,
  height = 48,
  className,
  fill = false,
}: OrgImageProps) {
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
      width={width}
      height={height}
      className={className}
    />
  );
}
