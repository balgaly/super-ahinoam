import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const DOWNLOADS = 'C:/Users/sbalgaly/Downloads';
const OUT = resolve('public/assets/sprites');

const HERO_IDLE = `${DOWNLOADS}/ChatGPT Image May 27, 2026, 04_13_42 AM.png`;
const HERO_WALK = `${DOWNLOADS}/ChatGPT Image May 27, 2026, 04_16_02 AM.png`;
const HERO_BIG = `${DOWNLOADS}/ChatGPT Image May 27, 2026, 05_19_21 AM (1).png`;
const TILESET = `${DOWNLOADS}/ChatGPT Image May 27, 2026, 05_19_21 AM (2).png`;

await mkdir(OUT, { recursive: true });

async function trimAndResize(input, output, w, h) {
  const trimmed = await sharp(input).trim({ threshold: 10 }).toBuffer();
  await sharp(trimmed)
    .resize(w, h, { kernel: 'nearest', fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(output);
  console.log(`wrote ${output} (${w}x${h})`);
}

async function sliceSheet(input, output, frames, frameW, frameH) {
  const meta = await sharp(input).metadata();
  const trimmed = await sharp(input).trim({ threshold: 10 }).toBuffer();
  const tMeta = await sharp(trimmed).metadata();
  const srcFrameW = Math.floor(tMeta.width / frames);
  console.log(`source ${meta.width}x${meta.height} trimmed ${tMeta.width}x${tMeta.height}, srcFrameW=${srcFrameW}`);

  const frameBufs = [];
  for (let i = 0; i < frames; i++) {
    const buf = await sharp(trimmed)
      .extract({ left: i * srcFrameW, top: 0, width: srcFrameW, height: tMeta.height })
      .resize(frameW, frameH, { kernel: 'nearest', fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    frameBufs.push(buf);
  }

  const composites = frameBufs.map((b, i) => ({ input: b, left: i * frameW, top: 0 }));
  await sharp({
    create: {
      width: frameW * frames,
      height: frameH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  }).composite(composites).png().toFile(output);
  console.log(`wrote ${output} (${frameW * frames}x${frameH}, ${frames} frames)`);
}

async function extractTile(input, output, srcX, srcY, srcW, srcH, outW, outH) {
  await sharp(input)
    .extract({ left: srcX, top: srcY, width: srcW, height: srcH })
    .resize(outW, outH, { kernel: 'nearest' })
    .png()
    .toFile(output);
  console.log(`wrote ${output} (${outW}x${outH})`);
}

await trimAndResize(HERO_IDLE, `${OUT}/hero_idle.png`, 16, 24);
await sliceSheet(HERO_WALK, `${OUT}/hero_walk.png`, 4, 16, 24);
await trimAndResize(HERO_BIG, `${OUT}/hero_big.png`, 16, 32);

const tMeta = await sharp(TILESET).metadata();
const cellW = Math.floor(tMeta.width / 4);
const cellH = Math.floor(tMeta.height / 3);
console.log(`tileset ${tMeta.width}x${tMeta.height}, cell ${cellW}x${cellH}`);

await extractTile(TILESET, `${OUT}/qblock.png`, 0, 0, cellW, cellH, 16, 16);
await extractTile(TILESET, `${OUT}/brick.png`, cellW, 0, cellW, cellH, 16, 16);
await extractTile(TILESET, `${OUT}/coin.png`, 0, 2 * cellH, cellW, cellH, 16, 16);

console.log('\\ndone.');
