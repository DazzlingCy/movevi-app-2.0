import { getJourneyCity, hasPublishedCityRoutes } from './data';
import type { JourneyRoute } from './types';

interface SceneCover {
  image: string;
  title: string;
}

export interface SceneRoutePreview extends SceneCover {
  preview: Pick<JourneyRoute, 'name' | 'distanceKm' | 'durationMinutes' | 'description' | 'landmarks'>;
}

export type SceneContent = SceneRoutePreview | (SceneCover & { cityId: string; routeLandmark: string; preview?: never });

export interface RunScene {
  id: 'beach' | 'forest' | 'architecture' | 'midday';
  group: 'natural' | 'lifestyle';
  label: string;
  backdropHue: number;
  entries: readonly [SceneContent, ...SceneContent[]];
}

export const CITY_CARD_MODE_LABEL = '城市卡片';

export function runSceneImage(entry: Pick<SceneCover, 'image'>, size: 'cover' | 'thumbnail' = 'cover') {
  const folder = size === 'thumbnail' ? 'images/run-scenes/thumbnails/' : 'images/run-scenes/';
  return import.meta.env.BASE_URL + folder + entry.image + '.webp';
}

export const RUN_SCENES: readonly RunScene[] = [
  {
    id: 'beach',
    group: 'natural',
    label: '海滩',
    backdropHue: 196,
    entries: [
      { image: 'beach-sydney', title: '悉尼', cityId: 'sydney', routeLandmark: '悉尼歌剧院' },
      { image: 'beach-miami', title: '迈阿密', preview: { name: '迈阿密海滨 · 棕榈长廊', distanceKm: 4.1, durationMinutes: 30, landmarks: ['南海滩', '海滨步道', '棕榈长廊'], description: '沿海滨长廊慢跑，在棕榈树和开阔的海面之间找回自己的节奏。' } },
      { image: 'beach-bali', title: '巴厘岛', preview: { name: '巴厘岛海岸 · 海风慢跑', distanceKm: 3.4, durationMinutes: 25, landmarks: ['海滩入口', '海岸步道', '临海观景点'], description: '沿着海岸轻松起步，边跑边看看浪花和海边的风景。' } },
    ],
  },
  {
    id: 'forest',
    group: 'natural',
    label: '森林',
    backdropHue: 142,
    entries: [
      { image: 'forest-auckland', title: '奥克兰', preview: { name: '奥克兰林径 · 绿荫漫跑', distanceKm: 3.6, durationMinutes: 28, landmarks: ['林径入口', '林荫步道', '树冠观景段'], description: '从林荫步道出发，沿途看看树冠间洒下的光，保持轻松的步频。' } },
      { image: 'forest-podgorica', title: '波德戈里察', preview: { name: '波德戈里察 · 林间漫跑', distanceKm: 4, durationMinutes: 31, landmarks: ['林道入口', '林荫缓坡', '森林转弯处'], description: '跟着林间小路一路向前，穿过连片树荫，享受一段安静的慢跑。' } },
      { image: 'forest-philadelphia', title: '费城', preview: { name: '费城绿道 · 林荫巡游', distanceKm: 3.8, durationMinutes: 29, landmarks: ['城市绿道入口', '林荫直道', '绿道休憩点'], description: '在绿道上匀速向前，沿着树木成排的路段感受从城市到林间的变化。' } },
    ],
  },
  {
    id: 'architecture',
    group: 'natural',
    label: '建筑',
    backdropHue: 29,
    entries: [
      { image: 'architecture-giza', title: '胡夫金字塔', cityId: 'cairo', routeLandmark: '吉萨金字塔' },
      { image: 'architecture-abu-dhabi', title: '阿布扎比王宫', preview: { name: '阿布扎比王宫 · 宫苑漫跑', distanceKm: 3.2, durationMinutes: 24, landmarks: ['王宫外广场', '宫苑拱廊', '外侧林荫道'], description: '从王宫外的开阔空间出发，沿途欣赏建筑立面和拱廊细节。' } },
      { image: 'architecture-paris', title: '巴黎圣母院', cityId: 'paris', routeLandmark: '巴黎圣母院' },
    ],
  },
  {
    id: 'midday',
    group: 'lifestyle',
    label: '午间休息',
    backdropHue: 265,
    entries: [
      { image: 'break-florence', title: '佛罗伦萨', preview: { name: '佛罗伦萨古城 · 午间漫步', distanceKm: 2.6, durationMinutes: 20, landmarks: ['古城巷口', '街心小广场', '古城观景街段'], description: '趁午间走一小段，看看古城街景和沿途的屋顶与建筑。' } },
      { image: 'break-buenos-aires', title: '布宜诺斯艾利斯', preview: { name: '布宜诺斯艾利斯 · 街景漫步', distanceKm: 2.8, durationMinutes: 22, landmarks: ['街区入口', '彩色建筑街段', '街角广场'], description: '用舒缓的步频逛一段城市街景，给午间留一点活动时间。' } },
      { image: 'break-singapore', title: '新加坡', cityId: 'singapore', routeLandmark: '金沙天际' },
      { image: 'break-kyoto', title: '京都', preview: { name: '京都街巷 · 午间慢行', distanceKm: 2.5, durationMinutes: 20, landmarks: ['古街入口', '石板小巷', '街巷转角'], description: '沿着京都街巷轻松走一段，留意街边屋檐和转角的风景。' } },
    ],
  },
];

export function getSceneContentRoute(entry: SceneContent): JourneyRoute | undefined {
  if (!('cityId' in entry)) {
    return {
      ...entry.preview,
      id: entry.image,
      cityId: `scene-${entry.image}`,
      order: 1,
      calories: Math.round(entry.preview.distanceKm * 65),
    };
  }
  if (!hasPublishedCityRoutes(entry.cityId)) return;
  return getJourneyCity(entry.cityId)?.routes.find(route => route.landmarks[0] === entry.routeLandmark);
}
