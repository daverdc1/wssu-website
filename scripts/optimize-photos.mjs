import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "photos", "source");
const OUTPUT_DIR = path.join(ROOT, "public", "photos");
const MANIFEST_PATH = path.join(ROOT, "src", "lib", "photo-manifest.json");
const WIDTHS = [640, 960, 1280, 1600];
const MAX_OUTPUT_WIDTH = 1600;
const WEBP_QUALITY = 85;
const JPEG_QUALITY = 85;
const QUALITY_OVERRIDES = {
  "why-career": { webp: 88, jpeg: 92 },
};

const SUPPORTED = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".tif", ".tiff"]);

async function listSources() {
  const entries = await fs.readdir(SOURCE_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && SUPPORTED.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort();
}

async function optimizeOne(filename) {
  const input = path.join(SOURCE_DIR, filename);
  const slug = path.parse(filename).name;
  const image = sharp(input, { failOn: "none" }).rotate();
  const metadata = await image.metadata();
  const maxWidth = metadata.width ?? MAX_OUTPUT_WIDTH;

  const targetWidths = WIDTHS.filter((width) => width <= maxWidth && width <= MAX_OUTPUT_WIDTH);
  if (targetWidths.length === 0) {
    targetWidths.push(Math.min(maxWidth, MAX_OUTPUT_WIDTH));
  }

  const outputCap = Math.min(maxWidth, MAX_OUTPUT_WIDTH);
  if (!targetWidths.includes(outputCap)) {
    targetWidths.push(outputCap);
  }

  const uniqueWidths = [...new Set(targetWidths)].sort((a, b) => a - b);
  const quality = QUALITY_OVERRIDES[slug] ?? { webp: WEBP_QUALITY, jpeg: JPEG_QUALITY };
  let totalBytes = 0;

  for (const width of uniqueWidths) {
    const resized = sharp(input, { failOn: "none" })
      .rotate()
      .resize({
        width,
        withoutEnlargement: true,
        kernel: sharp.kernel.lanczos3,
      })
      .sharpen({ sigma: 0.5, m1: 0.5, m2: 0.35 });

    const webpPath = path.join(OUTPUT_DIR, `${slug}-${width}.webp`);
    const jpegPath = path.join(OUTPUT_DIR, `${slug}-${width}.jpg`);

    await resized
      .clone()
      .webp({ quality: quality.webp, effort: 4, smartSubsample: false })
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

async function cleanGeneratedOutputs() {
  const entries = await fs.readdir(OUTPUT_DIR, { withFileTypes: true });
  await Promise.all(
    entries
      .filter((entry) => entry.isFile() && /\.(webp|jpe?g)$/i.test(entry.name))
      .map((entry) => fs.unlink(path.join(OUTPUT_DIR, entry.name))),
  );
}

async function main() {
  await fs.mkdir(SOURCE_DIR, { recursive: true });
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const sources = await listSources();
  if (!sources.length) {
    console.log("No source photos found in photos/source.");
    return;
  }

  await cleanGeneratedOutputs();

  const results = [];
  for (const filename of sources) {
    results.push(await optimizeOne(filename));
  }

  const manifest = Object.fromEntries(results.map((result) => [result.slug, result.widths]));
  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
  await fs.writeFile(`${MANIFEST_PATH}`, `${JSON.stringify(manifest, null, 2)}\n`);

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
