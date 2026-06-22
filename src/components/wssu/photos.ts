export const PHOTO_WIDTHS = [640, 960, 1440] as const;

export type PhotoPath = `/photos/${string}`;

export function photoPath(slug: string): PhotoPath {
  return `/photos/${slug}`;
}

export function photoSrc(base: PhotoPath | string, width: number, ext: "webp" | "jpg") {
  return `${base}-${width}.${ext}`;
}

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

export const hero = photos[0];

export const programs = {
  arts: photoPath("program-arts"),
  business: photoPath("program-business"),
  comms: photoPath("program-comms"),
  education: photoPath("program-education"),
  justice: photoPath("program-justice"),
} as const satisfies Record<string, PhotoPath>;

export const whyImage = photos[7];
export const testimonialImage = photos[6];
export const ctaImage = photos[2];

export const blog = [
  photos[5],
  photos[6],
  photos[2],
  photos[1],
  photos[4],
  photos[0],
  photos[3],
  photos[7],
  photos[5],
] as const satisfies readonly PhotoPath[];
