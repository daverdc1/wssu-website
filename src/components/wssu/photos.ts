export const PHOTO_WIDTHS = [640, 960, 1280, 1600] as const;

export type PhotoPath = `/photos/${string}`;

export function photoPath(slug: string): PhotoPath {
  return `/photos/${slug}`;
}

export function photoSrc(base: PhotoPath | string, width: number, ext: "webp" | "jpg") {
  return `${base}-${width}.${ext}`;
}

export function photoDefaultSrc(base: PhotoPath | string) {
  return `${base}.jpg`;
}

export function photoLargestSrc(base: PhotoPath | string, widths: readonly number[]) {
  const largest = widths[widths.length - 1];
  return photoSrc(base, largest, "jpg");
}

/** Legacy Lovable stock — hero poster + a few sections still reference these. */
export const photos = [
  photoPath("wssu-1"),
  photoPath("wssu-2"),
  photoPath("wssu-3"),
  photoPath("wssu-4"),
  photoPath("wssu-5"),
  photoPath("wssu-6"),
  photoPath("wssu-7"),
  photoPath("wssu-8"),
] as const satisfies readonly PhotoPath[];

export const hero = photoPath("hero");

export const programs = {
  arts: photoPath("program-arts"),
  business: photoPath("program-business"),
  comms: photoPath("program-comms"),
  education: photoPath("program-education"),
  justice: photoPath("program-justice"),
  health: photoPath("program-health"),
  stem: photoPath("program-stem"),
} as const satisfies Record<string, PhotoPath>;

export const testimonialSlides = [
  photoPath("testimonial-1"),
  photoPath("testimonial-2"),
  photoPath("testimonial-3"),
] as const satisfies readonly PhotoPath[];

/** @deprecated Use testimonialSlides[0] */
export const testimonialImage = testimonialSlides[0];

export const whyImage = photoPath("why1");
export const whyCareerImage = photoPath("why-career");
export const whyBelongImage = photoPath("why3");
export const ctaImage = photoPath("cta-ramily");

export const blog = [
  photoPath("blog-admitted-students"),
  photoPath("blog-nursing"),
  photoPath("blog-economic-impact"),
  photoPath("blog-digital-media"),
  photoPath("blog-wellness"),
  photoPath("blog-professor"),
  photoPath("blog-basketball"),
  photoPath("blog-honors"),
  photoPath("blog-serve"),
] as const satisfies readonly PhotoPath[];
