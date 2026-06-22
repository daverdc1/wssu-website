# Photo sources

Drop original photos here, then run:

```bash
npm run photos:optimize
```

The script writes optimized WebP + JPEG variants to `public/photos/` at 640px, 960px, and 1440px widths (never upscaled).

Reference optimized slugs in `src/components/wssu/photos.ts` without a file extension, e.g. `/photos/program-arts`.

## Current files

| Source file | Used for |
|---|---|
| `program-arts.jpg` | Programs — Arts & Entertainment |
| `program-business.jpg` | Programs — Business |
| `program-comms.jpg` | Programs — Communications & Media |
| `program-education.jpg` | Programs — Education |
| `program-justice.jpg` | Programs — Social Justice |
| `wssu-1.jpg` … `wssu-8.jpg` | Hero, blog, testimonials, CTA, etc. |
