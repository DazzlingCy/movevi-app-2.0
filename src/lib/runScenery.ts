const fastScenerySource = `${import.meta.env.BASE_URL}video/routes/hangzhou-city-fast.mp4`;
const fallbackScenerySource = `${import.meta.env.BASE_URL}video/routes/hangzhou-city-demo.mp4`;

export function createRunSceneryVideo(): HTMLVideoElement {
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.defaultMuted = true;
  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.src = fastScenerySource;
  return video;
}

export function reloadRunSceneryVideo(video: HTMLVideoElement): void {
  const position = video.currentTime;
  // Some browsers load the conventional MP4 more reliably than a fragmented MP4.
  if (video.getAttribute('src') === fastScenerySource) video.src = fallbackScenerySource;
  else video.load();
  if (position > 0) video.currentTime = position;
}
