const sceneryVideoSource = `${import.meta.env.BASE_URL}video/routes/hangzhou-city-demo.mp4`;

export function createRunSceneryVideo(): HTMLVideoElement {
  const video = document.createElement('video');
  video.preload = 'metadata';
  video.defaultMuted = true;
  video.muted = true;
  video.playsInline = true;
  video.loop = true;
  video.src = sceneryVideoSource;
  return video;
}
