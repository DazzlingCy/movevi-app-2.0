import { getJourneyCity } from './data';
import type { JourneyRoute } from './types';

export interface LandmarkMedal {
  id: string;
  cityId: string;
  name: string;
}

export const COINS_PER_LANDMARK_MEDAL = 500;
export const MEDAL_LOTTERY_DRAW_COST = 500;
export const COIN_LOTTERY_NAME = '金币抽奖';

export function getMedalLandmarks(route: Pick<JourneyRoute, 'landmarks' | 'medalLandmarks'>) {
  return [...new Set(route.medalLandmarks ?? route.landmarks)];
}

function createPreviewMedals(cityId: string, count: number) {
  const names = new Set(getJourneyCity(cityId)?.routes.flatMap(route => getMedalLandmarks(route)));
  return [...names].slice(0, count).map(name => ({ id: 'preview:' + cityId + ':' + name, cityId, name }));
}

export const PREVIEW_AVAILABLE_MEDALS = createPreviewMedals('tokyo', 5);
export const PREVIEW_EXCHANGED_MEDALS = createPreviewMedals('sydney', 10);

export function getRunMedals(route: JourneyRoute, runId: string): LandmarkMedal[] {
  return getMedalLandmarks(route)
    .map(name => ({ id: runId + ':' + route.cityId + ':' + name, cityId: route.cityId, name }));
}

export const MEDAL_LOTTERY_PRIZES = [
  { level: '一等奖', amount: '16.6', unit: '元', count: 1 },
  { level: '二等奖', amount: '12.6', unit: '元', count: 2 },
  { level: '三等奖', amount: '6.6', unit: '元', count: 2 },
  { level: '四等奖', amount: '2.66', unit: '元', count: 6 },
  { level: '五等奖', amount: '1.66', unit: '元', count: 11 },
  { level: '六等奖', amount: '6', unit: '分', count: 178 },
] as const;

export const MEDAL_LOTTERY_POOL_SIZE = MEDAL_LOTTERY_PRIZES.reduce((total, prize) => total + prize.count, 0);

export function getMedalLotteryStock(wins: readonly number[]) {
  return MEDAL_LOTTERY_PRIZES.map(({ count }, index) =>
    Math.max(0, count - wins.filter(prizeIndex => prizeIndex === index).length),
  );
}

export function selectMedalLotteryPrize(stock: readonly number[], random = Math.random()) {
  const remaining = stock.reduce((total, count) => total + count, 0);
  let slot = Math.floor(random * remaining);
  for (const [index, count] of stock.entries()) {
    if (slot < count) return index;
    slot -= count;
  }
  return -1;
}
