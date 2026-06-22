import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SOURCE_DIR = path.join(ROOT, "photos", "source");
const OUTPUT_DIR = path.join(ROOT, "public", "photos");
const WIDTHS = [640, 960, 1440];
const WEBP_QUALITY = 82;
const JPEG_QUALITY = 82;

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
  const maxWidth = metadata.width ?? 1440;

  const targetWidths = WIDTHS.filter((width) => width <= maxWidth);
  if (targetWidths.length === 0) {
    targetWidths.push(maxWidth);
  } else if (!targetWidths.includes(Math.min(maxWidth, 1440))) {
    targetWidths.push(Math.min(maxWidth, WIDTHS[WIDTHS.length - 1]));
  }

  const uniqueWidths = [...new Set(targetWidths)].sort((a, b) => a - b);
  let totalBytes = 0;

  for (const width of uniqueWidths) {
    const resized = sharp(input, { failOn: "none" }).rotate().resize({
      width,
      withoutEnlargement: true,
    });

    const webpPath = path.join(OUTPUT_DIR, `${slug}-${width}.webp`);
    const jpegPath = path.join(OUTPUT_DIR, `${slug}-${width}.jpg`);

    await resized.clone().webp({ quality: WEBP_QUALITY, effort: 4 }).toFile(webpPath);
    await resized.clone().jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(jpegPath);

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
