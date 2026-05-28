import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';

const OUT = resolve('public/assets/sprites');
await mkdir(OUT, { recursive: true });

const PAL = {
  '.': [0, 0, 0, 0],
  'K': [0, 0, 0, 255],
  'W': [252, 252, 252, 255],
  'S': [252, 216, 168, 255],
  'H': [248, 184, 56, 255],
  'h': [200, 132, 24, 255],
  'P': [56, 88, 188, 255],
  'p': [32, 56, 140, 255],
  'B': [216, 56, 32, 255],
  'b': [148, 28, 12, 255],
  'O': [200, 132, 24, 255],
  'o': [248, 184, 56, 255],
  'L': [252, 252, 252, 255],
  'G': [248, 188, 0, 255],
  'g': [180, 124, 0, 255],
  'N': [80, 60, 28, 255],
  'C': [212, 156, 96, 255],
  'c': [156, 100, 60, 255],
  'M': [184, 84, 24, 255],
  'm': [120, 48, 8, 255],
  'Q': [248, 168, 24, 255],
  'q': [200, 124, 12, 255]
};

function rasterize(rows) {
  const h = rows.length;
  const w = rows[0].length;
  const buf = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][x];
      const px = PAL[ch];
      if (!px) throw new Error(`unknown palette char "${ch}" at ${x},${y}`);
      const i = (y * w + x) * 4;
      buf[i] = px[0]; buf[i+1] = px[1]; buf[i+2] = px[2]; buf[i+3] = px[3];
    }
  }
  return { buf, w, h };
}

async function writePng(rows, file) {
  const { buf, w, h } = rasterize(rows);
  await sharp(buf, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 9 }).toFile(file);
  console.log(`wrote ${file} (${w}x${h})`);
}

async function writeStrip(frames, file) {
  const fw = frames[0][0].length;
  const fh = frames[0].length;
  const composites = [];
  for (let i = 0; i < frames.length; i++) {
    const { buf } = rasterize(frames[i]);
    composites.push({ input: buf, raw: { width: fw, height: fh, channels: 4 }, left: i * fw, top: 0 });
  }
  await sharp({ create: { width: fw * frames.length, height: fh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(composites).png({ compressionLevel: 9 }).toFile(file);
  console.log(`wrote ${file} (${fw * frames.length}x${fh}, ${frames.length} frames)`);
}

const heroIdle = [
  '................',
  '....KKKKKKKK....',
  '...KHHHHHHHHK...',
  '..KHhhHHHHHHHK..',
  '..KHHHHHHHHHHK..',
  '.KHHSSSSSSSSHHK.',
  '.KHSSSSSSSSSSHK.',
  '.KHSKSSSSSSKSHK.',
  '.KHSSSSSSSSSSHK.',
  '.KHSSSSCCSSSSHK.',
  '..KHSSSMMSSSHK..',
  '..KKWWWWWWWWKK..',
  '.KWWWWWBBWWWWWK.',
  '.KWWWWBbbBWWWWK.',
  '.KWWWWWBBWWWWWK.',
  '.KWWWWWWWWWWWWK.',
  '.KPPPPPPPPPPPPK.',
  '.KPPPPPPPPPPPPK.',
  '.KPPPPPpKKpPPPK.',
  '.KPPPPK....KPPK.',
  '..KPPK......KK..',
  '..KPPK......KK..',
  '..KKKK......KK..',
  '..KNNK......KK..'
];

const heroWalkA = [
  '................',
  '....KKKKKKKK....',
  '...KHHHHHHHHK...',
  '..KHhhHHHHHHHK..',
  '..KHHHHHHHHHHK..',
  '.KHHSSSSSSSSHHK.',
  '.KHSSSSSSSSSSHK.',
  '.KHSKSSSSSSKSHK.',
  '.KHSSSSSSSSSSHK.',
  '.KHSSSSCCSSSSHK.',
  '..KHSSSMMSSSHK..',
  '..KKWWWWWWWWKK..',
  '.KWWWWWBBWWWWWK.',
  '.KWWWWBbbBWWWWK.',
  '.KWWWWWBBWWWWWK.',
  '.KWWWWWWWWWWWWK.',
  '.KPPPPPPPPPPPPK.',
  '.KPPPPPPPPPPPPK.',
  '.KPPPPpKKpPPPPK.',
  '.KPPPK....KPPPK.',
  '.KPPK......KPPK.',
  '.KPPK......KKKK.',
  '.KKKK......KNNK.',
  '.KNNK......KKKK.'
];

const heroWalkB = heroIdle;

const heroWalkC = [
  '................',
  '....KKKKKKKK....',
  '...KHHHHHHHHK...',
  '..KHhhHHHHHHHK..',
  '..KHHHHHHHHHHK..',
  '.KHHSSSSSSSSHHK.',
  '.KHSSSSSSSSSSHK.',
  '.KHSKSSSSSSKSHK.',
  '.KHSSSSSSSSSSHK.',
  '.KHSSSSCCSSSSHK.',
  '..KHSSSMMSSSHK..',
  '..KKWWWWWWWWKK..',
  '.KWWWWWBBWWWWWK.',
  '.KWWWWBbbBWWWWK.',
  '.KWWWWWBBWWWWWK.',
  '.KWWWWWWWWWWWWK.',
  '.KPPPPPPPPPPPPK.',
  '.KPPPPPPPPPPPPK.',
  '.KPPPPpKKpPPPPK.',
  '.KPPPK....KPPPK.',
  '.KPPK......KPPK.',
  '.KKKK......KPPK.',
  '.KNNK......KKKK.',
  '.KKKK......KNNK.'
];

const qblock = [
  'KKKKKKKKKKKKKKKK',
  'KLLLLLLLLLLLLLLK',
  'KLGGGGGGGGGGGGGK',
  'KLGGGKKKKKKGGGgK',
  'KLGGKKWWWWKKGGgK',
  'KLGGKWGGGGKKGGgK',
  'KLGGKKGGGKKGGGgK',
  'KLGGGGGGKKGGGGgK',
  'KLGGGGGKKGGGGGgK',
  'KLGGGGKKGGGGGGgK',
  'KLGGGGKKGGGGGGgK',
  'KLGGGGGGGGGGGGgK',
  'KLGGGGKKKGGGGGgK',
  'KLGGGGKKKGGGGGgK',
  'KLgggggggggggggK',
  'KKKKKKKKKKKKKKKK'
];

const brick = [
  'KKKKKKKKKKKKKKKK',
  'KOOOOOOOKOOOOOOK',
  'KOMMMMMOKOMMMMmK',
  'KOMMMMMOKOMMMMmK',
  'KOmmmmmOKOmmmmmK',
  'KKKKKKKKKKKKKKKK',
  'KOOOOOOOOOOOOOOK',
  'KOMMMMMMMMMMMMmK',
  'KOmmmmmmmmmmmmmK',
  'KKKKKKKKKKKKKKKK',
  'KOOOOOKOOOOOOOOK',
  'KOMMMOKOMMMMMMmK',
  'KOMMMOKOMMMMMMmK',
  'KOmmmOKOmmmmmmmK',
  'KKKKKKKKKKKKKKKK',
  'KKKKKKKKKKKKKKKK'
];

const coin = [
  '....KKKKKK......',
  '...KQQQQQQK.....',
  '..KQQggggQQK....',
  '..KQgQQQQggQK...',
  '.KQQgQggggQQQK..',
  '.KQQgQggggQQQK..',
  '.KQQgQggggQQQK..',
  '.KQQgQggggQQQK..',
  '.KQQgQggggQQQK..',
  '.KQQgQggggQQQK..',
  '.KQQgQggggQQQK..',
  '.KQQgQggggQQQK..',
  '..KQgQQQQggQK...',
  '..KQQggggQQK....',
  '...KQQQQQQK.....',
  '....KKKKKK......'
];

const usedBlock = [
  'KKKKKKKKKKKKKKKK',
  'KqqqqqqqqqqqqqqK',
  'KqMMMMMMMMMMMMqK',
  'KqMMMMMMMMMMMMqK',
  'KqMMMMMMMMMMMMqK',
  'KqMMMMMMMMMMMMqK',
  'KqMMMMMMMMMMMMqK',
  'KqMMMMMMMMMMMMqK',
  'KqMMMMMMMMMMMMqK',
  'KqMMMMMMMMMMMMqK',
  'KqMMMMMMMMMMMMqK',
  'KqMMMMMMMMMMMMqK',
  'KqMMMMMMMMMMMMqK',
  'KqMMMMMMMMMMMMqK',
  'KqqqqqqqqqqqqqqK',
  'KKKKKKKKKKKKKKKK'
];

const ground = [
  'MMMMMMMMMMMMMMMM',
  'MmmmmmmmmmmmmmmM',
  'MmmMmmMmmMmmMmmM',
  'MmmMmmMmmMmmMmmM',
  'MmmmmmmmmmmmmmmM',
  'MmmmmmmmmmmmmmmM',
  'MMMMMMMMMMMMMMMM',
  'MmmmmmmmmmmmmmmM',
  'MMmmMmmMmmMmmMmM',
  'MMmmMmmMmmMmmMmM',
  'MmmmmmmmmmmmmmmM',
  'MmmmmmmmmmmmmmmM',
  'MmmmmmmmmmmmmmmM',
  'MmmmmmmmmmmmmmmM',
  'MmmmmmmmmmmmmmmM',
  'MMMMMMMMMMMMMMMM'
];

const cloud = [
  '................................',
  '................................',
  '..........WWWWWW................',
  '........WWWWWWWWWW..............',
  '......WWWWWWWWWWWWWW............',
  '.....WWWWWWWWWWWWWWWWW..........',
  '...WWWWWWWWWWWWWWWWWWWWWW.......',
  '..WWWWWWWWWWWWWWWWWWWWWWWWW.....',
  '.WWWWWWWWWWWWWWWWWWWWWWWWWWWW...',
  'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW..',
  'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW.',
  'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  'WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW',
  '.WWWWWWWWWWWWWWWWWWWWWWWWWWWWWW.',
  '..WWWWWWWWWWWWWWWWWWWWWWWWWWWW..',
  '....WWWWWWWWWWWWWWWWWWWWWWWW....'
];

const HILL_GREEN = [0, 168, 0, 255];
const HILL_DARK = [0, 100, 0, 255];
const HILL_DOT = [0, 200, 60, 255];

PAL['v'] = HILL_GREEN;
PAL['V'] = HILL_DARK;
PAL['d'] = HILL_DOT;

const hill = [
  '................................................',
  '................................................',
  '................................................',
  '....................VVVV........................',
  '..................VVvvvvVV......................',
  '................VVvvvvvvvvVV....................',
  '..............VVvvvvvvvvvvvvVV..................',
  '............VVvvvvvvvvvvvvvvvvVV................',
  '..........VVvvvvvvvvdvvvvvvvvvvvVV..............',
  '........VVvvvvvvvvvvvvvvvvvvvvvvvvVV............',
  '......VVvvvvvvvvvvvvvvvdvvvvvvvvvvvvVV..........',
  '....VVvvvvvvvvvvvvdvvvvvvvvvvvvvvvvvvvVV........',
  '..VVvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvVV......',
  'VVvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvVV....',
  'vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvVV..',
  'VVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV'
];

const flagpole = (() => {
  const rows = [];
  rows.push('.....KKKK.......');
  rows.push('....KGGGGK......');
  rows.push('....KGggGK......');
  rows.push('.....KGGK.......');
  rows.push('......KK........');
  rows.push('.....KWWK.......');
  rows.push('.KKKKKWWK.......');
  rows.push('.KBBBBBWWK......');
  rows.push('.KBbbbbBWWK.....');
  rows.push('.KBBBBBBBWWK....');
  rows.push('.KBbbbbbbbBWK...');
  rows.push('.KBBBBBBBBBBK...');
  rows.push('.KKKKKKWWKKKK...');
  rows.push('.....KWWK.......');
  rows.push('.....KWWK.......');
  rows.push('.....KWWK.......');
  for (let i = 0; i < 128; i++) rows.push('.....KWWK.......');
  return rows;
})();

await writePng(heroIdle, `${OUT}/hero_idle.png`);
await writeStrip([heroWalkA, heroWalkB, heroWalkC, heroWalkB], `${OUT}/hero_walk.png`);
await writePng(qblock, `${OUT}/qblock.png`);
await writePng(brick, `${OUT}/brick.png`);
await writePng(coin, `${OUT}/coin.png`);
await writePng(usedBlock, `${OUT}/used_block.png`);
await writePng(ground, `${OUT}/ground.png`);
await writePng(cloud, `${OUT}/cloud.png`);
await writePng(hill, `${OUT}/hill.png`);
await writePng(flagpole, `${OUT}/flagpole.png`);

console.log('done.');
