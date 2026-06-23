import type { ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import photoManifest from "@/lib/photo-manifest.json";
import { PHOTO_WIDTHS, photoLargestSrc, photoSrc, type PhotoPath } from "./photos";

type OptimizedImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src" | "srcSet"> & {
  src: PhotoPath | string;
  priority?: boolean;
  sizes?: string;
};

function slugFromBase(base: string) {
  return base.replace(/^\/photos\//, "");
}

function widthsForPhoto(base: string) {
  const slug = slugFromBase(base);
  const widths = photoManifest[slug as keyof typeof photoManifest];
  return widths?.length ? widths : [...PHOTO_WIDTHS];
}

function buildSrcSet(base: string, ext: "webp" | "jpg") {
  return widthsForPhoto(base)
    .map((width) => `${photoSrc(base, width, ext)} ${width}w`)
    .join(", ");
}

export function OptimizedImage({
  src,
  alt,
  priority = false,
  sizes = "100vw",
  className,
  draggable = false,
  onDragStart,
  ...props
}: OptimizedImageProps) {
  const widths = widthsForPhoto(src);
  const fallback = photoLargestSrc(src, widths);

  return (
    <picture className="contents">
      <source type="image/webp" srcSet={buildSrcSet(src, "webp")} sizes={sizes} />
      <img
        {...props}
        src={fallback}
        srcSet={buildSrcSet(src, "jpg")}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        draggable={draggable}
        onDragStart={(event) => {
          event.preventDefault();
          onDragStart?.(event);
        }}
        className={cn("select-none [-webkit-user-drag:none]", className)}
      />
    </picture>
  );
}
