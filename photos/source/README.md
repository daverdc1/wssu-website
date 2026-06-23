# Photo sources

Drop original photos here, then run:

```bash
npm run photos:optimize
```

The script writes optimized WebP + JPEG variants to `public/photos/` at 640px, 960px, 1280px, 1440px, and 1920px widths (never upscaled). A `photo-manifest.json` records the actual widths per slug.

Reference optimized slugs in `src/components/wssu/photos.ts` without a file extension, e.g. `/photos/program-arts`.

## Current files

| Source file | Used for |
|---|---|
| `program-arts.jpg` | Programs — Arts & Entertainment |
| `program-business.jpg` | Programs — Business |
| `program-comms.jpg` | Programs — Communications & Media |
| `program-education.jpg` | Programs — Education |
| `program-justice.jpg` | Programs — Social Justice |
| `testimonial-1.jpg` | Testimonials — slide 1 |
| `testimonial-2.jpg` | Testimonials — slide 2 |
| `blog-admitted-students.jpg` | Blog — Admitted Students Day |
| `blog-nursing.jpg` | Blog — Nursing program |
| `blog-economic-impact.jpg` | Blog — Economic impact |
| `blog-digital-media.jpg` | Blog — Digital media lab |
| `blog-wellness.jpg` | Blog — Wellness center |
| `blog-professor.jpg` | Blog — Professor profile |
| `blog-basketball.jpg` | Blog — Rams basketball |
| `why1.jpg` | Why WSSU — opportunity highlight |
| `why-career.jpg` | Why WSSU — career highlight |
| `why3.jpg` | Why WSSU — belong highlight |
| `cta-ramily.jpg` | CTA — “Join the Ramily” split section |
| `wssu-1.jpg` … `wssu-8.jpg` | Hero, blog, testimonials, etc. |
