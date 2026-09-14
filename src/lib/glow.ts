export interface GlowRank {
  level: number;
  name: string;
  threshold: number;
  color: string;
}

export type GlowValueRecordType = 'earn' | 'spend';

export interface GlowValueRecord {
  id: string;
  type: GlowValueRecordType;
  title: string;
  description: string;
  amount: number;
  createdAt: number;
}

export interface GlowCenterStats {
  lightValue?: number;
  lifetimeLightValue?: number;
  glowValueRecords?: GlowValueRecord[];
}

export type GlowShopItemCategory = 'utility' | 'collectible';
export type GlowShopItemVisual =
  | 'switch'
  | 'medal-ticket'
  | 'globe-natural'
  | 'globe-night'
  | 'space-nebula'
  | 'space-starlight';
export type GlowShopItemEffect = 'city-switch-pass' | 'medal-ticket' | 'collectible';
export type GlowCosmeticSlot = 'home-globe' | 'home-space';

export interface GlowShopItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  benefit?: string;
  price: number;
  category: GlowShopItemCategory;
  visual: GlowShopItemVisual;
  effect: GlowShopItemEffect;
  quantity?: number;
  repeatable?: boolean;
  cosmeticSlot?: GlowCosmeticSlot;
  accent: string;
}

export interface GlowShopStats extends GlowCenterStats {
  citySwitchPasses?: number;
  medalMysteryTickets?: number;
  glowWheelChances?: number;
  glowShopInventory?: Record<string, number>;
  ownedGlowShopItemIds?: string[];
  equippedGlowShopItemIds?: string[];
}

export interface GlowExchangeResult {
  success: boolean;
  message: string;
}

export const GLOW_SHOP_ITEMS: GlowShopItem[] = [
  {
    id: 'city-switch-pack',
    name: '城市切换券',
    subtitle: '探索道具',
    description: '重新选择下一座探索城市时，优先使用切换券。',
    price: 3,
    category: 'utility',
    visual: 'switch',
    effect: 'city-switch-pass',
    repeatable: true,
    accent: 'from-cyan-300 to-blue-500'
  },
  {
    id: 'medal-mystery-ticket',
    name: '勋章盲盒券',
    subtitle: '活动道具',
    description: '用于勋章盲盒活动，兑换一次抽奖机会。',
    price: 10,
    category: 'utility',
    visual: 'medal-ticket',
    effect: 'medal-ticket',
    repeatable: true,
    accent: 'from-amber-200 to-orange-500'
  },
  {
    id: 'home-globe-aurora',
    name: '蔚蓝星球',
    subtitle: '地球样式',
    description: '将首页地球切换为自然地貌、深蓝海洋与柔和大气层。',
    price: 50,
    category: 'collectible',
    visual: 'globe-natural',
    effect: 'collectible',
    cosmeticSlot: 'home-globe',
    accent: 'from-emerald-200 via-cyan-300 to-violet-500'
  },
  {
    id: 'home-globe-night',
    name: '城市夜光',
    subtitle: '地球样式',
    description: '将首页地球切换为夜色大陆、城市灯光与深蓝大气层。',
    price: 80,
    category: 'collectible',
    visual: 'globe-night',
    effect: 'collectible',
    cosmeticSlot: 'home-globe',
    accent: 'from-amber-200 via-blue-400 to-indigo-600'
  },
  {
    id: 'home-space-nebula',
    name: '深空星云',
    subtitle: '太空样式',
    description: '将首页太空切换为深蓝星海与流动星云背景。',
    price: 100,
    category: 'collectible',
    visual: 'space-nebula',
    effect: 'collectible',
    cosmeticSlot: 'home-space',
    accent: 'from-indigo-300 via-violet-400 to-fuchsia-500'
  },
  {
    id: 'home-space-starlight',
    name: '银河微光',
    subtitle: '太空样式',
    description: '将首页太空切换为高亮银蓝银河、密集星尘与闪烁远星。',
    price: 80,
    category: 'collectible',
    visual: 'space-starlight',
    effect: 'collectible',
    cosmeticSlot: 'home-space',
    accent: 'from-slate-100 via-sky-300 to-indigo-500'
  }
];

export const GLOW_RANKS: GlowRank[] = [
  { level: 1, name: '青铜', threshold: 0, color: 'from-orange-300 to-amber-700' },
  { level: 2, name: '白银', threshold: 80, color: 'from-slate-100 to-slate-400' },
  { level: 3, name: '黄金', threshold: 120, color: 'from-amber-200 to-yellow-500' },
  { level: 4, name: '钻石', threshold: 300, color: 'from-cyan-200 to-blue-500' },
  { level: 5, name: '星耀', threshold: 600, color: 'from-fuchsia-200 to-violet-500' },
  { level: 6, name: '王者', threshold: 1000, color: 'from-rose-200 to-amber-300' }
];

export const getGlowRank = (lifetimeLightValue = 0) => {
  const currentIndex = GLOW_RANKS.reduce((result, rank, index) => {
    return lifetimeLightValue >= rank.threshold ? index : result;
  }, 0);
  const current = GLOW_RANKS[currentIndex];
  const next = GLOW_RANKS[currentIndex + 1] || null;
  const currentBase = current.threshold;
  const nextBase = next?.threshold ?? current.threshold;
  const progress = next
    ? Math.min(100, Math.max(0, ((lifetimeLightValue - currentBase) / (nextBase - currentBase)) * 100))
    : 100;

  return {
    current,
    next,
    progress,
    remaining: next ? Math.max(0, next.threshold - lifetimeLightValue) : 0
  };
};

export const getGlowWheelDailyExchangeLimit = (rankLevel = 1) => {
  if (rankLevel >= 5) return 3;
  if (rankLevel >= 3) return 2;
  return 1;
};

export const GLOW_WHEEL_EXCHANGE_RULE_TEXT = '每日领取上限：青铜/白银 1 张，黄金/钻石 2 张，星耀/王者 3 张。';
