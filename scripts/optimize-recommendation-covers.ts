/** Run with npx tsx scripts/optimize-recommendation-covers.ts after vendoring route images. */
import { execFile } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { LOCAL_IMAGE_MANIFEST } from '../src/data/localImageManifest';
import { ROUTE_COVERS } from '../src/data/routeCovers';
import { recommendationCoverPath } from '../src/lib/localImages';

const run = promisify(execFile);
const publicDir = resolve(import.meta.dirname, '../public');
const covers = [...new Set(Object.values(ROUTE_COVERS).flat().map(({ src }) => {
  const path = LOCAL_IMAGE_MANIFEST[src];
  if (!path) throw new Error(`Missing local route cover: ${src}`);
  return path;
}))];
const variants = [
  { size: 'feature', filter: "scale=w='min(1120,iw)':h='min(1120,ih)':force_original_aspect_ratio=decrease", quality: '85' },
  { size: 'thumbnail', filter: 'crop=min(iw\\,ih):min(iw\\,ih),scale=192:192', quality: '82' },
] as const;

for (const { size } of variants) {
  await mkdir(resolve(publicDir, 'images/recommendations', size), { recursive: true });
}

let next = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (next < covers.length) {
    const cover = covers[next++];
    for (const { size, filter, quality } of variants) {
      await run('ffmpeg', [
        '-v', 'error', '-nostdin', '-y', '-i', resolve(publicDir, cover),
        '-vf', filter, '-frames:v', '1', '-c:v', 'libwebp', '-quality', quality,
        resolve(publicDir, recommendationCoverPath(cover, size)),
      ], { windowsHide: true });
    }
  }
}));
console.log(`Generated both sizes for ${covers.length} route covers.`);
