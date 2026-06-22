import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { PHOTO_WIDTHS, photoSrc, type PhotoPath } from "./photos";

type OptimizedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  src: PhotoPath | string;
  priority?: boolean;
  sizes?: string;
};

function buildSrcSet(base: string, ext: "webp" | "jpg") {
  return PHOTO_WIDTHS.map((width) => `${photoSrc(base, width, ext)} ${width}w`).join(", ");
}

export function OptimizedImage({
  src,
  alt,
  priority = false,
  sizes = "100vw",
  className,
  ...props
}: OptimizedImageProps) {
  const fallback = photoSrc(src, PHOTO_WIDTHS[PHOTO_WIDTHS.length - 1], "jpg");

  return (
    <picture className="contents">
      <source type="image/webp" srcSet={buildSrcSet(src, "webp")} sizes={sizes} />
      <img
        src={fallback}
        srcSet={buildSrcSet(src, "jpg")}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        className={cn(className)}
        {...props}
      />
    </picture>
  );
}
