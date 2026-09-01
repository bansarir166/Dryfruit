import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "hero");

const files = [
  "hero-composition.png",
  "hero-almonds.png",
  "hero-cashews.png",
  "hero-pistachios.png",
  "hero-walnuts.png",
  "hero-dates.png",
  "hero-raisins.png",
  "hero-figs.png",
];

function sample(data, w, channels, x, y) {
  const i = (y * w + x) * channels;
  return [data[i], data[i + 1], data[i + 2]];
}

function dist(a, b) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function lum(c) {
  return c[0] * 0.299 + c[1] * 0.587 + c[2] * 0.114;
}

function isBg(px, bg) {
  const L = lum(px);
  const d = dist(px, bg);
  // Dark espresso studio backdrop — keep fruit flesh even when deep brown
  if (L < 28 && d < 42) return true;
  if (L < 42 && d < 26) return true;
  if (L < 52 && d < 16) return true;
  return false;
}

function featherAlpha(alpha, w, h, radius) {
  const out = new Float32Array(alpha.length);
  const r = radius;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let sum = 0;
      let n = 0;
      for (let dy = -r; dy <= r; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -r; dx <= r; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          sum += alpha[yy * w + xx];
          n++;
        }
      }
      out[y * w + x] = sum / n;
    }
  }
  return out;
}

async function cutout(file) {
  const input = path.join(dir, file);
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width: w, height: h, channels } = info;
  const corners = [
    sample(data, w, channels, 2, 2),
    sample(data, w, channels, w - 3, 2),
    sample(data, w, channels, 2, h - 3),
    sample(data, w, channels, w - 3, h - 3),
    sample(data, w, channels, Math.floor(w / 2), 2),
    sample(data, w, channels, 2, Math.floor(h / 2)),
  ];
  const bg = corners
    .reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]], [0, 0, 0])
    .map((v) => v / corners.length);

  const visited = new Uint8Array(w * h);
  const queue = [];
  const push = (x, y) => {
    const idx = y * w + x;
    if (visited[idx]) return;
    const i = idx * channels;
    const px = [data[i], data[i + 1], data[i + 2]];
    if (!isBg(px, bg)) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < w; x++) {
    push(x, 0);
    push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    push(0, y);
    push(w - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop();
    const x = idx % w;
    const y = (idx / w) | 0;
    if (x > 0) push(x - 1, y);
    if (x + 1 < w) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y + 1 < h) push(x, y + 1);
  }

  const alpha = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    alpha[i] = visited[i] ? 0 : 255;
  }

  const feathered = featherAlpha(alpha, w, h, 2);
  for (let i = 0; i < w * h; i++) {
    data[i * channels + 3] = Math.max(0, Math.min(255, Math.round(feathered[i])));
  }

  const out = path.join(dir, file.replace(".png", ".webp"));
  await sharp(data, { raw: { width: w, height: h, channels } })
    .webp({ quality: 88, alphaQuality: 90 })
    .toFile(out);

  const meta = await sharp(out).metadata();
  console.log(file, "→", path.basename(out), `${meta.width}x${meta.height}`, "bg", bg.map((n) => n.toFixed(0)).join(","));
}

for (const file of files) {
  await cutout(file);
}
