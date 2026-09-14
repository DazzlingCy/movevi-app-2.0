export interface WeightPlanRewardRecord {
  day: number;
  amount: string;
  openedAt: string;
}

const WEIGHT_PLAN_REWARD_AMOUNTS: Record<number, string> = {
  1: '￥0.38',
  7: '￥0.68',
  15: '￥0.88',
  21: '￥1.08',
  30: '￥1.28'
};

export const getWeightPlanRewardAmount = (day: number) => WEIGHT_PLAN_REWARD_AMOUNTS[day] || '￥0.18';
