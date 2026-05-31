import sharp from 'sharp';
import { resolve } from 'node:path';

const SRC = 'C:/Users/sbalgaly/Downloads/ChatGPT Image May 31, 2026, 09_31_50 AM.png';
const OUT = resolve('public/assets/sprites');

const FRAME_W = 24;
const FRAME_H = 32;
const FRAMES = 3;

async function chromaKey(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height;
  const idx = (x, y) => (y * w + x) * 4;
  const isBg = (i) => {
    const r = data[i], g = data[i+1], b = data[i+2];
    const isMagenta = r > 220 && g < 80 && b > 180;
    const isWhite = r > 240 && g > 240 && b > 240;
    return isMagenta || isWhite;
  };

  const visited = new Uint8Array(w * h);
  const stack = [];
  for (let x = 0; x < w; x++) {
    if (isBg(idx(x, 0))) { stack.push(x, 0); visited[x] = 1; }
    if (isBg(idx(x, h-1))) { stack.push(x, h-1); visited[(h-1)*w + x] = 1; }
  }
  for (let y = 0; y < h; y++) {
    if (isBg(idx(0, y))) { stack.push(0, y); visited[y*w] = 1; }
    if (isBg(idx(w-1, y))) { stack.push(w-1, y); visited[y*w + (w-1)] = 1; }
  }

  while (stack.length) {
    const y = stack.pop();
    const x = stack.pop();
    data[idx(x, y) + 3] = 0;
    const neighbors = [[x-1,y],[x+1,y],[x,y-1],[x,y+1]];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
      const vi = ny*w + nx;
      if (visited[vi]) continue;
      if (isBg(idx(nx, ny))) {
        visited[vi] = 1;
        stack.push(nx, ny);
      }
    }
  }

  return sharp(data, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

async function run() {
  const keyed = await chromaKey(SRC);
  const trimmed = await sharp(keyed).trim({ threshold: 1 }).toBuffer();
  const meta = await sharp(trimmed).metadata();
  const srcFrameW = Math.floor(meta.width / FRAMES);
  console.log(`source trimmed ${meta.width}x${meta.height}, srcFrameW=${srcFrameW}`);

  const frameBufs = [];
  for (let i = 0; i < FRAMES; i++) {
    const buf = await sharp(trimmed)
      .extract({ left: i * srcFrameW, top: 0, width: srcFrameW, height: meta.height })
      .resize(FRAME_W, FRAME_H, { kernel: 'nearest', fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    frameBufs.push(buf);
  }

  await sharp(frameBufs[0]).toFile(`${OUT}/princess_idle.png`);
  console.log(`wrote ${OUT}/princess_idle.png (${FRAME_W}x${FRAME_H})`);

  const composites = frameBufs.map((b, i) => ({ input: b, left: i * FRAME_W, top: 0 }));
  await sharp({
    create: { width: FRAME_W * FRAMES, height: FRAME_H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } }
  }).composite(composites).png().toFile(`${OUT}/princess_bob.png`);
  console.log(`wrote ${OUT}/princess_bob.png (${FRAME_W * FRAMES}x${FRAME_H}, ${FRAMES} frames)`);
}

await run();
console.log('done.');
