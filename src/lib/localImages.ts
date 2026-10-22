import { LOCAL_IMAGE_MANIFEST } from '../data/localImageManifest';

const appBase = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL ?? './';

/** Keep backend/custom images untouched; pre-packaged defaults use the app's own origin. */
export function resolveLocalImage(src: string | undefined, base = appBase): string | undefined {
  if (!src) return src;
  const localPath = LOCAL_IMAGE_MANIFEST[src];
  return localPath ? `${base.endsWith('/') ? base : `${base}/`}${localPath}` : src;
}
