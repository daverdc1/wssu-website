import { spawnSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";

const ROOT = process.cwd();
const SOURCE_CANDIDATES = [
  path.join(ROOT, "video", "hero.mp4"),
  path.join(ROOT, "public", "video", "hero.mp4"),
];
const OUTPUT_DIR = path.join(ROOT, "public", "video");
const OUTPUT_DESKTOP = path.join(OUTPUT_DIR, "hero.mp4");
const OUTPUT_MOBILE = path.join(OUTPUT_DIR, "hero-mobile.mp4");

function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function runFfmpeg(args) {
  const result = spawnSync(ffmpegPath, args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`ffmpeg failed with exit code ${result.status ?? "unknown"}`);
  }
}

async function resolveSource() {
  for (const candidate of SOURCE_CANDIDATES) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // try next candidate
    }
  }

  throw new Error(
    `No source video found. Add video/hero.mp4 or public/video/hero.mp4 before running video:optimize.`,
  );
}

async function encodeVariant({ input, output, label, scaleFilter, crf, maxrate, bufsize }) {
  console.log(`\n→ ${label}`);
  runFfmpeg([
    "-y",
    "-i",
    input,
    "-movflags",
    "+faststart",
    "-vf",
    scaleFilter,
    "-c:v",
    "libx264",
    "-profile:v",
    "main",
    "-level",
    "3.1",
    "-pix_fmt",
    "yuv420p",
    "-preset",
    "medium",
    "-crf",
    String(crf),
    "-maxrate",
    maxrate,
    "-bufsize",
    bufsize,
    "-an",
    output,
  ]);

  const { size } = await fs.stat(output);
  console.log(`  ${path.basename(output)} — ${formatBytes(size)}`);
}

async function main() {
  if (!ffmpegPath) {
    throw new Error("ffmpeg-static binary is unavailable.");
  }

  const input = await resolveSource();
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const { size: sourceSize } = await fs.stat(input);
  console.log(`Source: ${path.relative(ROOT, input)} (${formatBytes(sourceSize)})`);

  await encodeVariant({
    input,
    output: OUTPUT_DESKTOP,
    label: "Desktop hero video",
    scaleFilter: "scale='min(1920,iw)':-2",
    crf: 23,
    maxrate: "5M",
    bufsize: "10M",
  });

  await encodeVariant({
    input,
    output: OUTPUT_MOBILE,
    label: "Mobile hero video",
    scaleFilter: "scale='min(960,iw)':-2",
    crf: 28,
    maxrate: "1.5M",
    bufsize: "3M",
  });

  console.log("\nDone.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
