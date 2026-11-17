/** Run with npx tsx scripts/optimize-recommendation-covers.ts after vendoring images. */
import { execFile } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { LOCAL_IMAGE_MANIFEST } from '../src/data/localImageManifest';
import { CITIES } from '../src/data/cities';
import { ROUTE_COVERS } from '../src/data/routeCovers';
import { cityCoverPath, recommendationCoverPath } from '../src/lib/localImages';

const run = promisify(execFile);
const root = resolve(import.meta.dirname, '..');
const publicDir = resolve(root, 'public');
const app = await readFile(resolve(root, 'src/components/journey/JourneyApp.tsx'), 'utf8');
const cityBlock = app.match(/const JOURNEY_CITY_IMAGES[^=]*= ([\s\S]*?);/)?.[1];
if (!cityBlock) throw new Error('City image catalogue not found');

function localCovers(urls: string[]) {
  return [...new Set(urls.map(src => {
    const path = LOCAL_IMAGE_MANIFEST[src];
    if (!path) throw new Error(`Missing local cover: ${src}`);
    return path;
  }))];
}

const routeCovers = localCovers(Object.values(ROUTE_COVERS).flat().map(({ src }) => src));
const cityCovers = localCovers([...CITIES.map(city => city.image), ...[...cityBlock.matchAll(/https:\/\/[^']+/g)].map(match => match[0])]);
const routeVariants = [
  { size: 'feature', filter: "scale=w='min(1120,iw)':h='min(1120,ih)':force_original_aspect_ratio=decrease", quality: '85' },
  { size: 'thumbnail', filter: 'crop=min(iw\\,ih):min(iw\\,ih),scale=192:192', quality: '82' },
  { size: 'list', filter: "crop=w='min(iw,ih*0.64)':h='min(ih,iw/0.64)',scale=w='min(256,iw)':h=-2", quality: '80' },
] as const;
const cityVariants = [
  { size: 'cover', filter: "scale=w='min(1280,iw)':h='min(1280,ih)':force_original_aspect_ratio=decrease", quality: '80' },
  { size: 'grid', filter: "scale=w='min(520,iw)':h='min(520,ih)':force_original_aspect_ratio=decrease", quality: '78' },
] as const;

const mobileOnly = process.argv.includes('--mobile');
const jobs = [
  ...routeCovers.flatMap(cover => routeVariants.map(variant => ({ cover, ...variant, target: recommendationCoverPath(cover, variant.size) }))),
  ...cityCovers.flatMap(cover => cityVariants.map(variant => ({ cover, ...variant, target: cityCoverPath(cover, variant.size) }))),
].filter(job => !mobileOnly || (job.size !== 'feature' && job.size !== 'thumbnail'));

await Promise.all([...new Set(jobs.map(job => job.target.slice(0, job.target.lastIndexOf('/'))))]
  .map(directory => mkdir(resolve(publicDir, directory), { recursive: true })));

let next = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (next < jobs.length) {
    const { cover, filter, quality, target } = jobs[next++];
    await run('ffmpeg', [
      '-v', 'error', '-nostdin', '-y', '-threads', '1', '-i', resolve(publicDir, cover),
      '-filter_threads', '1', '-vf', filter, '-frames:v', '1', '-c:v', 'libwebp', '-quality', quality,
      resolve(publicDir, target),
    ], { windowsHide: true });
  }
}));
console.log(`Generated ${jobs.length} cover variants.`);
