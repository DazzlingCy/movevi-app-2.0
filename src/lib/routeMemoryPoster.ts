export interface RouteMemoryPosterData {
  cityName: string;
  routeTitle: string;
  routeIndex: number;
  routeIntro: string;
  image?: string;
  dateLabel: string;
  timeLabel: string;
  distanceLabel: string;
  durationLabel: string;
  paceLabel: string;
  caloriesLabel: string;
  lightValueEarned: number;
  landmarks: string[];
  userName: string;
  userAvatar: string;
}

const POSTER_WIDTH = 1080;
const POSTER_HEIGHT = 1920;
const INK = '#f8fafc';
const MUTED = '#94a3b8';
const CYAN = '#a5f3fc';
const GOLD = '#fde68a';

const roundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.arcTo(x + width, y, x + width, y + height, safeRadius);
  ctx.arcTo(x + width, y + height, x, y + height, safeRadius);
  ctx.arcTo(x, y + height, x, y, safeRadius);
  ctx.arcTo(x, y, x + width, y, safeRadius);
  ctx.closePath();
};

const fitText = (ctx: CanvasRenderingContext2D, value: string, maxWidth: number) => {
  if (ctx.measureText(value).width <= maxWidth) return value;
  let result = value;
  while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result}…`;
};

const drawWrappedText = (
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines: number
) => {
  let rest = value.trim();
  for (let line = 0; line < maxLines && rest; line += 1) {
    let current = '';
    for (const character of rest) {
      if (ctx.measureText(current + character).width > maxWidth) break;
      current += character;
    }
    if (!current) current = rest.slice(0, 1);
    rest = rest.slice(current.length);
    if (line === maxLines - 1 && rest) current = fitText(ctx, `${current}${rest}`, maxWidth);
    ctx.fillText(current, x, y + line * lineHeight);
  }
};

const loadImage = (src?: string) => new Promise<HTMLImageElement | null>(resolve => {
  if (!src) {
    resolve(null);
    return;
  }
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.referrerPolicy = 'no-referrer';
  image.onload = () => resolve(image);
  image.onerror = () => resolve(null);
  image.src = src;
});

const drawCoverImage = (
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
) => {
  const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight);
  const sourceWidth = width / scale;
  const sourceHeight = height / scale;
  const sourceX = (image.naturalWidth - sourceWidth) / 2;
  const sourceY = (image.naturalHeight - sourceHeight) / 2;
  ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
};

const splitStatValue = (value: string) => {
  const units = [' /km', ' kcal', ' km'];
  const unit = units.find(item => value.endsWith(item));
  if (!unit) return { value, unit: '' };
  return { value: value.slice(0, -unit.length), unit: unit.trim() };
};

const drawValueWithUnit = (
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  valueSize: number,
  unitSize: number,
  color = INK
) => {
  const measurement = splitStatValue(value);
  ctx.textAlign = 'left';
  ctx.fillStyle = color;
  ctx.font = `700 ${valueSize}px "Bahnschrift", "Arial Narrow", sans-serif`;
  ctx.fillText(measurement.value, x, y);
  const valueWidth = ctx.measureText(measurement.value).width;
  if (measurement.unit) {
    ctx.fillStyle = '#64748b';
    ctx.font = `600 ${unitSize}px "Microsoft YaHei UI", sans-serif`;
    ctx.fillText(measurement.unit, x + valueWidth + 12, y - 2);
  }
};

// Paths come from the installed Lucide icon package and match the app's icon language.
const MEDAL_ICON_PATHS = [
  [
    'M10 18v-7',
    'M11.12 2.198a2 2 0 0 1 1.76.006l7.866 3.847c.476.233.31.949-.22.949H3.474c-.53 0-.695-.716-.22-.949z',
    'M14 18v-7',
    'M18 18v-7',
    'M3 22h18',
    'M6 18v-7'
  ],
  ['m8 3 4 8 5-5 5 15H2L8 3z'],
  [
    'M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
    'M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1',
    'M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1'
  ]
];

const drawLucideMedalIcon = (
  ctx: CanvasRenderingContext2D,
  iconIndex: number,
  centerX: number,
  centerY: number,
  size: number
) => {
  const scale = size / 24;
  ctx.save();
  ctx.translate(centerX - size / 2, centerY - size / 2);
  ctx.scale(scale, scale);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 1.8;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  MEDAL_ICON_PATHS[iconIndex].forEach(path => ctx.stroke(new Path2D(path)));
  ctx.restore();
};

const drawPoster = (
  data: RouteMemoryPosterData,
  heroImage: HTMLImageElement | null,
  avatarImage: HTMLImageElement | null
) => {
  const canvas = document.createElement('canvas');
  canvas.width = POSTER_WIDTH;
  canvas.height = POSTER_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('无法创建海报画布');

  const background = ctx.createLinearGradient(0, 0, POSTER_WIDTH, POSTER_HEIGHT);
  background.addColorStop(0, '#07171d');
  background.addColorStop(0.48, '#03070b');
  background.addColorStop(1, '#100e07');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, POSTER_WIDTH, POSTER_HEIGHT);

  const cyanGlow = ctx.createRadialGradient(60, 30, 0, 60, 30, 680);
  cyanGlow.addColorStop(0, 'rgba(34, 211, 238, 0.22)');
  cyanGlow.addColorStop(1, 'rgba(34, 211, 238, 0)');
  ctx.fillStyle = cyanGlow;
  ctx.fillRect(0, 0, 760, 760);

  const goldGlow = ctx.createRadialGradient(1080, 1800, 0, 1080, 1800, 700);
  goldGlow.addColorStop(0, 'rgba(251, 191, 36, 0.14)');
  goldGlow.addColorStop(1, 'rgba(251, 191, 36, 0)');
  ctx.fillStyle = goldGlow;
  ctx.fillRect(380, 1100, 700, 820);

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 58;
  ctx.shadowOffsetY = 24;
  const ticketGradient = ctx.createLinearGradient(40, 48, 1040, 1836);
  ticketGradient.addColorStop(0, '#0a151e');
  ticketGradient.addColorStop(0.62, '#070d13');
  ticketGradient.addColorStop(1, '#0d0d0a');
  ctx.fillStyle = ticketGradient;
  roundedRect(ctx, 40, 48, 1000, 1788, 44);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.11)';
  ctx.lineWidth = 2;
  roundedRect(ctx, 40, 48, 1000, 1788, 44);
  ctx.stroke();

  // Route-memory hero.
  ctx.save();
  roundedRect(ctx, 72, 82, 936, 520, 36);
  ctx.clip();
  if (heroImage) {
    drawCoverImage(ctx, heroImage, 72, 82, 936, 520);
  } else {
    ctx.fillStyle = '#0f2633';
    ctx.fillRect(72, 82, 936, 520);
  }
  const heroShade = ctx.createLinearGradient(72, 82, 72, 602);
  heroShade.addColorStop(0, 'rgba(3, 6, 9, 0.04)');
  heroShade.addColorStop(0.5, 'rgba(3, 6, 9, 0.18)');
  heroShade.addColorStop(1, 'rgba(3, 6, 9, 0.96)');
  ctx.fillStyle = heroShade;
  ctx.fillRect(72, 82, 936, 520);
  ctx.restore();
  ctx.strokeStyle = 'rgba(165, 243, 252, 0.18)';
  roundedRect(ctx, 72, 82, 936, 520, 36);
  ctx.stroke();

  ctx.fillStyle = 'rgba(8, 51, 68, 0.82)';
  roundedRect(ctx, 104, 382, 222, 58, 29);
  ctx.fill();
  ctx.strokeStyle = 'rgba(165, 243, 252, 0.28)';
  ctx.stroke();
  ctx.fillStyle = CYAN;
  ctx.textAlign = 'center';
  ctx.font = '700 23px "Microsoft YaHei UI", sans-serif';
  ctx.fillText(`${data.cityName} · 路线 ${String(data.routeIndex).padStart(2, '0')}`, 215, 419);

  ctx.fillStyle = 'rgba(253, 230, 138, 0.14)';
  roundedRect(ctx, 772, 382, 200, 58, 29);
  ctx.fill();
  ctx.strokeStyle = 'rgba(253, 230, 138, 0.28)';
  ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.font = '700 22px "Microsoft YaHei UI", sans-serif';
  ctx.fillText(`+${data.lightValueEarned} 光迹值`, 872, 419);

  ctx.textAlign = 'left';
  ctx.fillStyle = INK;
  ctx.font = '900 64px "Microsoft YaHei UI", "Microsoft YaHei", sans-serif';
  ctx.fillText(fitText(ctx, data.routeTitle, 820), 104, 506);
  ctx.fillStyle = '#dbeafe';
  ctx.font = '600 27px "Microsoft YaHei UI", sans-serif';
  ctx.fillText(`${data.dateLabel}  ·  ${data.timeLabel} 完成`, 104, 562);

  // Ticket perforation.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.11)';
  ctx.lineWidth = 2;
  ctx.setLineDash([12, 12]);
  ctx.beginPath();
  ctx.moveTo(70, 650);
  ctx.lineTo(1010, 650);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#04080c';
  ctx.beginPath();
  ctx.arc(40, 650, 29, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(1040, 650, 29, 0, Math.PI * 2);
  ctx.fill();

  const stats = [
    ['完成里程', data.distanceLabel, CYAN, 'rgba(8, 47, 73, 0.38)'],
    ['运动用时', data.durationLabel, '#c7d2fe', 'rgba(30, 41, 69, 0.50)'],
    ['平均配速', data.paceLabel, '#a7f3d0', 'rgba(6, 45, 42, 0.42)'],
    ['消耗热量', data.caloriesLabel, GOLD, 'rgba(69, 55, 16, 0.34)']
  ];
  stats.forEach(([label, value, tone, surface], index) => {
    const x = index % 2 === 0 ? 72 : 550;
    const y = index < 2 ? 708 : 918;
    ctx.fillStyle = surface;
    roundedRect(ctx, x, y, 458, 190, 30);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.stroke();
    ctx.fillStyle = tone;
    roundedRect(ctx, x + 30, y + 29, 44, 7, 3.5);
    ctx.fill();
    ctx.fillStyle = MUTED;
    ctx.textAlign = 'left';
    ctx.font = '600 26px "Microsoft YaHei UI", sans-serif';
    ctx.fillText(label, x + 30, y + 80);
    drawValueWithUnit(ctx, value, x + 30, y + 152, 62, 26, tone);
  });

  // Route-memory content mirrors the on-screen memory card.
  ctx.fillStyle = 'rgba(9, 16, 25, 0.92)';
  roundedRect(ctx, 72, 1154, 936, 494, 32);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.stroke();
  ctx.fillStyle = CYAN;
  roundedRect(ctx, 104, 1202, 11, 48, 5.5);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.textAlign = 'left';
  ctx.font = '800 40px "Microsoft YaHei UI", sans-serif';
  ctx.fillText('沿途记忆', 139, 1243);
  ctx.fillStyle = MUTED;
  ctx.font = '500 26px "Microsoft YaHei UI", sans-serif';
  drawWrappedText(ctx, data.routeIntro, 104, 1302, 872, 42, 3);

  const medalCenters = [242, 540, 838];
  data.landmarks.slice(0, 3).forEach((landmark, index) => {
    const centerX = medalCenters[index];
    const cardX = centerX - 132;
    ctx.fillStyle = 'rgba(253, 230, 138, 0.035)';
    roundedRect(ctx, cardX, 1405, 264, 190, 26);
    ctx.fill();
    ctx.strokeStyle = 'rgba(253, 230, 138, 0.16)';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(centerX, 1470, 48, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(253, 230, 138, 0.10)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(253, 230, 138, 0.44)';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawLucideMedalIcon(ctx, index, centerX, 1470, 40);
    ctx.fillStyle = GOLD;
    ctx.textAlign = 'center';
    ctx.font = '700 25px "Microsoft YaHei UI", sans-serif';
    ctx.fillText(fitText(ctx, landmark, 220), centerX, 1557);
  });

  // Owner and brand signature at the ticket bottom.
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
  ctx.beginPath();
  ctx.moveTo(88, 1700);
  ctx.lineTo(992, 1700);
  ctx.stroke();
  const avatarX = 88;
  const avatarY = 1729;
  const avatarSize = 76;
  ctx.save();
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = '#11212b';
  ctx.fillRect(avatarX, avatarY, avatarSize, avatarSize);
  if (avatarImage) drawCoverImage(ctx, avatarImage, avatarX, avatarY, avatarSize, avatarSize);
  ctx.restore();
  ctx.strokeStyle = 'rgba(165, 243, 252, 0.72)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.textAlign = 'left';
  ctx.font = '700 32px "Microsoft YaHei UI", sans-serif';
  ctx.fillText(data.userName, avatarX + avatarSize + 24, avatarY + 49);
  ctx.fillStyle = CYAN;
  ctx.textAlign = 'right';
  ctx.font = '800 32px "Bahnschrift", sans-serif';
  ctx.fillText('MOVEVI', 992, avatarY + 49);

  return canvas;
};

export const createRouteMemoryPoster = async (data: RouteMemoryPosterData) => {
  const [heroImage, avatarImage] = await Promise.all([
    loadImage(data.image),
    loadImage(data.userAvatar)
  ]);
  const posterWithImage = drawPoster(data, heroImage, avatarImage);
  try {
    return posterWithImage.toDataURL('image/png', 1);
  } catch {
    return drawPoster(data, null, avatarImage).toDataURL('image/png', 1);
  }
};

export const posterDataUrlToFile = async (dataUrl: string, fileName: string) => {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: 'image/png' });
};
