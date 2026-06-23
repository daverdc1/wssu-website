import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "photos", "source");
const OUTPUT_DIR = path.join(ROOT, "public", "photos");
const MANIFEST_PATH = path.join(ROOT, "src", "lib", "photo-manifest.json");
const WIDTHS = [640, 960, 1280, 1600, 2560];
const MAX_OUTPUT_WIDTH = 1600;
const WEBP_QUALITY = 85;
const JPEG_QUALITY = 85;
const QUALITY_OVERRIDES = {
  "why-career": { webp: 88, jpeg: 92 },
  "cta-ramily": { webp: 94, jpeg: 96 },
};
const MAX_WIDTH_OVERRIDES = {
  "cta-ramily": 3840,
};
const SHARPEN_OVERRIDES = {
  "cta-ramily": { sigma: 0.35, m1: 0.4, m2: 0.25 },
};
/** Fractional crop — trims soft foreground and keeps the sharp crowd for CTA display. */
const CROP_OVERRIDES = {
  "cta-ramily": { left: 0.2, top: 0.05, width: 0.58, height: 0.9 },
};
const WEBP_OPTIONS_OVERRIDES = {
  "cta-ramily": { quality: 94, effort: 6, smartSubsample: false, nearLossless: true },
};

const SUPPORTED = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);

async function listSources() {
  const entries = await fs.readdir(SOURCE_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && SUPPORTED.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort();
}

function buildSourcePipeline(input, slug, metadata) {
  let pipeline = sharp(input, { failOn: "none" }).rotate();
  const crop = CROP_OVERRIDES[slug];

  if (crop && metadata.width && metadata.height) {
    const left = Math.min(
      Math.round(metadata.width * crop.left),
      metadata.width - 1,
    );
    const top = Math.min(
      Math.round(metadata.height * crop.top),
      metadata.height - 1,
    );
    const width = Math.min(
      Math.round(metadata.width * crop.width),
      metadata.width - left,
    );
    const height = Math.min(
      Math.round(metadata.height * crop.height),
      metadata.height - top,
    );

    pipeline = pipeline.extract({ left, top, width, height });
  }

  return pipeline;
}

async function optimizeOne(filename) {
  const input = path.join(SOURCE_DIR, filename);
  const slug = path.parse(filename).name;
  const image = sharp(input, { failOn: "none" }).rotate();
  const metadata = await image.metadata();
  const cropped = await buildSourcePipeline(input, slug, metadata).metadata();
  const maxWidth = cropped.width ?? metadata.width ?? MAX_OUTPUT_WIDTH;
  const outputCap = Math.min(maxWidth, MAX_WIDTH_OVERRIDES[slug] ?? MAX_OUTPUT_WIDTH);

  const targetWidths = WIDTHS.filter((width) => width <= maxWidth && width <= outputCap);
  if (targetWidths.length === 0) {
    targetWidths.push(outputCap);
  }

  if (!targetWidths.includes(outputCap)) {
    targetWidths.push(outputCap);
  }

  const uniqueWidths = [...new Set(targetWidths)].sort((a, b) => a - b);
  const quality = QUALITY_OVERRIDES[slug] ?? { webp: WEBP_QUALITY, jpeg: JPEG_QUALITY };
  const sharpen = SHARPEN_OVERRIDES[slug] ?? { sigma: 0.5, m1: 0.5, m2: 0.35 };
  let totalBytes = 0;

  for (const width of uniqueWidths) {
    const resized = await buildSourcePipeline(input, slug, metadata)
      .resize({
        width,
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3,
      })
      .sharpen(sharpen);

    const webpPath = path.join(OUTPUT_DIR, `${slug}-${width}.webp`);
    const jpegPath = path.join(OUTPUT_DIR, `${slug}-${width}.jpg`);
    const webpOptions = WEBP_OPTIONS_OVERRIDES[slug] ?? {
      quality: quality.webp,
      effort: 4,
      smartSubsample: false,
    };

    await resized
      .clone()
      .webp(webpOptions)
      .toFile(webpPath);
    await resized
      .clone()
      .jpeg({ quality: quality.jpeg, mozjpeg: true })
      .toFile(jpegPath);

    totalBytes += (await fs.stat(webpPath)).size + (await fs.stat(jpegPath)).size;
  }

  const largest = uniqueWidths[uniqueWidths.length - 1];
  const webpDefault = path.join(OUTPUT_DIR, `${slug}.webp`);
  const jpegDefault = path.join(OUTPUT_DIR, `${slug}.jpg`);

  await fs.copyFile(path.join(OUTPUT_DIR, `${slug}-${largest}.webp`), webpDefault);
  await fs.copyFile(path.join(OUTPUT_DIR, `${slug}-${largest}.jpg`), jpegDefault);

  return {
    slug,
    widths: uniqueWidths,
    totalKb: Math.round(totalBytes / 1024),
    originalKb: Math.round((await fs.stat(input)).size / 1024),
  };
}

async function cleanGeneratedOutputs(slugs) {
  const entries = await fs.readdir(OUTPUT_DIR, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => {
        if (!entry.isFile() || !/\.(webp|jpe?g)$/i.test(entry.name)) return false;
        if (!slugs?.length) return true;
        return slugs.some((slug) => entry.name === `${slug}.webp` || entry.name === `${slug}.jpg` || entry.name.startsWith(`${slug}-`));
      })
      .map((entry) => fs.unlink(path.join(OUTPUT_DIR, entry.name))),
  );
}

async function updateManifest(results) {
  let manifest = {};
  try {
    manifest = JSON.parse(await fs.readFile(MANIFEST_PATH, "utf8"));
  } catch {
    manifest = {};
  }

  for (const result of results) {
    manifest[result.slug] = result.widths;
  }

  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
}

async function main() {
  const slugFilter = process.argv[2]?.replace(/^--slug=/, "") || process.argv.find((arg) => arg.startsWith("--slug="))?.split("=")[1];

  await fs.mkdir(SOURCE_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  let sources = await listSources();
  if (slugFilter) {
    sources = sources.filter((filename) => path.parse(filename).name === slugFilter);
    if (!sources.length) {
      console.error(`No source photo found for slug "${slugFilter}".`);
      process.exit(1);
    }
  }

  if (!sources.length) {
    console.log("No source photos found in photos/source.");
    return;
  }

  const slugs = sources.map((filename) => path.parse(filename).name);
  await cleanGeneratedOutputs(slugFilter ? slugs : undefined);

  const results = [];
  for (const filename of sources) {
    results.push(await optimizeOne(filename));
  }

  const manifest = Object.fromEntries(results.map((result) => [result.slug, result.widths]));
  if (slugFilter) {
    await updateManifest(results);
  } else {
    await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
    await fs.writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  console.log(`Optimized ${results.length} photo(s) into public/photos:`);
  for (const result of results) {
    console.log(
      `  ${result.slug}: ${result.originalKb}KB -> ${result.totalKb}KB (${result.widths.join(", ")}w)`,
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
