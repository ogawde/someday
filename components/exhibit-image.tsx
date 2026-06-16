import Image from "next/image";
import { cn } from "@/lib/utils";

export function ExhibitImage({
  src,
  alt = "",
  className,
  fill,
}: {
  src: string;
  alt?: string;
  className?: string;
  fill?: boolean;
}) {
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={cn("object-cover", className)}
        sizes="(max-width: 768px) 100vw, 33vw"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={1200}
      height={675}
      className={cn("w-full object-cover", className)}
      sizes="(max-width: 768px) 100vw, 800px"
    />
  );
}
