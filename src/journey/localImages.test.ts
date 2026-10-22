import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { LOCAL_IMAGE_MANIFEST } from '../data/localImageManifest';
import { ROUTE_COVERS } from '../data/routeCovers';
import { CITIES } from '../data/cities';
import { getRouteRunners } from '../data/routeRunners';
import { resolveLocalImage } from '../lib/localImages';

test('all default route covers, city covers and runner portraits have bundled files', () => {
  const app = readFileSync(resolve('src/components/journey/JourneyApp.tsx'), 'utf8');
  const cityBlock = app.match(/const JOURNEY_CITY_IMAGES[^=]*= ([\s\S]*?);/)![1];
  const urls = [...Object.values(ROUTE_COVERS).flat().map(cover => cover.src),
    ...CITIES.map(city => city.image), ...getRouteRunners().avatars,
    ...[...cityBlock.matchAll(/https:\/\/[^']+/g)].map(match => match[0])];
  for (const url of urls) {
    const file = LOCAL_IMAGE_MANIFEST[url];
    assert.ok(file, `Missing bundled image: ${url}`);
    assert.match(file, /^images\/journey\/[a-f0-9]+\.(jpg|png|webp|gif)$/);
    const bytes = readFileSync(resolve('public', file));
    assert.ok(bytes.length > 100, `${file} is empty`);
    assert.ok((bytes[0] === 255 && bytes[1] === 216) || bytes[0] === 137
      || bytes.toString('ascii', 0, 4) === 'RIFF' || bytes.toString('ascii', 0, 3) === 'GIF', `${file} is not an image`);
  }
  assert.ok(existsSync('public/images/journey/attribution.json'));
});

test('image paths work under GitHub Pages subpaths without rewriting custom images', () => {
  const original = Object.values(ROUTE_COVERS)[0][0].src;
  assert.equal(resolveLocalImage(original, '/movevi-app-2.0/'), `/movevi-app-2.0/${LOCAL_IMAGE_MANIFEST[original]}`);
  assert.equal(resolveLocalImage(original, './'), `./${LOCAL_IMAGE_MANIFEST[original]}`);
  assert.equal(resolveLocalImage('https://example.com/custom.jpg'), 'https://example.com/custom.jpg');
  assert.equal(resolveLocalImage(undefined), undefined);
});
