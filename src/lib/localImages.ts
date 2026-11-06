import { LOCAL_IMAGE_MANIFEST } from '../data/localImageManifest';

const appBase = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? './';

/** Keep backend/custom images untouched; pre-packaged defaults use the app's own origin. */
export function resolveLocalImage(src: string | undefined, base = appBase): string | undefined {
  if (!src) return src;
  const localPath = LOCAL_IMAGE_MANIFEST[src];
  return localPath ? `${base.endsWith('/') ? base : `${base}/`}${localPath}` : src;
}

/** Recommendation variants are generated from the vendored route covers. */
export function recommendationCoverPath(localPath: string, size: 'feature' | 'thumbnail'): string {
  const name = localPath.slice(localPath.lastIndexOf('/') + 1, localPath.lastIndexOf('.'));
  return `images/recommendations/${size}/${name}.webp`;
}

export function resolveRecommendationCover(src: string | undefined, size: 'feature' | 'thumbnail'): string | undefined {
  const localPath = src && LOCAL_IMAGE_MANIFEST[src];
  return localPath ? `${appBase}${recommendationCoverPath(localPath, size)}` : src;
}
