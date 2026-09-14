import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Award, Zap, ChevronRight, X, CheckCircle2, Lock, Activity, Compass, RefreshCw, Gift, Sparkles, Flame, HeadphonesIcon, Radio } from 'lucide-react';
import { CITIES, CityData } from '../data/cities';
import { cn } from '../lib/utils';
import { getGlowRank } from '../lib/glow';
import CityImage from './CityImage';

const WorldGlobe = React.lazy(() => import('./WorldGlobe'));

const ENABLE_GLOW_TASKS = false;

const HOME_NEBULA_STARS = Array.from({ length: 38 }, (_, index) => ({
  id: index,
  left: `${3 + (index * 29) % 94}%`,
  top: `${2 + (index * 47) % 92}%`,
  size: 1 + (index % 3) * 0.65,
  opacity: 0.2 + (index % 5) * 0.1
}));

const HOME_NEBULA_METEORS = [
  { id: 'north', left: '7%', top: '14%', distanceX: 156, distanceY: 92, width: 66, delay: 1.2, duration: 1.35, repeatDelay: 7.4 },
  { id: 'upper-mid', left: '31%', top: '4%', distanceX: 142, distanceY: 84, width: 58, delay: 3.0, duration: 1.22, repeatDelay: 8.1 },
  { id: 'east', left: '52%', top: '8%', distanceX: 128, distanceY: 76, width: 52, delay: 4.8, duration: 1.15, repeatDelay: 8.6 },
  { id: 'south-east', left: '68%', top: '25%', distanceX: 112, distanceY: 68, width: 46, delay: 6.5, duration: 1.08, repeatDelay: 7.8 },
  { id: 'west', left: '18%', top: '38%', distanceX: 184, distanceY: 108, width: 78, delay: 8.2, duration: 1.55, repeatDelay: 9.2 },
  { id: 'lower-west', left: '3%', top: '52%', distanceX: 164, distanceY: 96, width: 70, delay: 10.0, duration: 1.42, repeatDelay: 8.8 }
];

const HOME_STARLIGHT_FLARES = [
  { id: 'flare-1', left: '18%', top: '18%', size: 9, delay: 0.2 },
  { id: 'flare-2', left: '72%', top: '15%', size: 7, delay: 1.1 },
  { id: 'flare-3', left: '84%', top: '39%', size: 10, delay: 1.8 },
  { id: 'flare-4', left: '29%', top: '52%', size: 6, delay: 2.5 },
  { id: 'flare-5', left: '61%', top: '62%', size: 8, delay: 3.2 }
];

const getCityPreviewImage = (city?: CityData | null) => {
  if (!city) return '';
  return city.image;
};

export default function HomeTab({ onNavigate, completedChapters = [], targetFlight, onFlightComplete, pendingSelectionFrom, onCitySelected, litCityIds = [], userStats, setUserStats, taskPanelOpenSignal = 0, onTreadmillActivated }: { onNavigate?: (type: string, data: any) => void; completedChapters?: number[]; targetFlight?: {fromCityId: string, toCityId: string} | null; onFlightComplete?: () => void; pendingSelectionFrom?: string | null; onCitySelected?: (cityId: string) => void; litCityIds?: string[]; userStats?: any; setUserStats?: any; taskPanelOpenSignal?: number; onTreadmillActivated?: () => void; }) {
  const reduceMotion = useReducedMotion();
  const [showStoryPanel, setShowStoryPanel] = useState(false);
  const [showCitySelection, setShowCitySelection] = useState(false);
  const [selectableCities, setSelectableCities] = useState<CityData[]>([]);
  const [selectedCity, setSelectedCity] = useState<CityData | null>(null);
  const [isTreadmillConnected, setIsTreadmillConnected] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false);
  const [showTaskPanel, setShowTaskPanel] = useState(false);
  const [globeReady, setGlobeReady] = useState(false);
  const [rewardBurst, setRewardBurst] = useState<{ id: number; reward: number; title: string } | null>(null);
  const [broadcastIndex, setBroadcastIndex] = useState(0);
  const glowRankDetails = getGlowRank(userStats?.lifetimeLightValue ?? userStats?.lightValue ?? 0);
  const currentGlowRank = glowRankDetails.current;
  const citySwitchPasses = userStats?.citySwitchPasses || 0;
  const equippedHomeThemes: string[] = userStats?.equippedGlowShopItemIds || [];
  const auroraEarthActive = equippedHomeThemes.includes('home-globe-aurora');
  const nightEarthActive = equippedHomeThemes.includes('home-globe-night');
  const nebulaSpaceActive = equippedHomeThemes.includes('home-space-nebula');
  const starlightSpaceActive = equippedHomeThemes.includes('home-space-starlight');
  const globeAppearance = nightEarthActive ? 'night' : auroraEarthActive ? 'aurora' : 'default';
  const spaceBackground = nebulaSpaceActive ? 'nebula' : starlightSpaceActive ? 'starlight' : 'default';
  const avatarFrameStyles: Record<number, { ring: string; shadow: string; badge: string }> = {
    1: { ring: 'from-orange-300 via-amber-500 to-stone-700', shadow: 'shadow-[0_0_16px_rgba(251,146,60,0.42)]', badge: 'text-orange-200' },
    2: { ring: 'from-white via-slate-300 to-slate-500', shadow: 'shadow-[0_0_16px_rgba(226,232,240,0.38)]', badge: 'text-slate-100' },
    3: { ring: 'from-amber-100 via-yellow-300 to-amber-600', shadow: 'shadow-[0_0_18px_rgba(251,191,36,0.5)]', badge: 'text-amber-200' },
    4: { ring: 'from-cyan-100 via-sky-300 to-blue-600', shadow: 'shadow-[0_0_20px_rgba(34,211,238,0.5)]', badge: 'text-cyan-200' },
    5: { ring: 'from-fuchsia-100 via-violet-300 to-indigo-600', shadow: 'shadow-[0_0_20px_rgba(217,70,239,0.48)]', badge: 'text-fuchsia-200' },
    6: { ring: 'from-rose-100 via-amber-200 to-yellow-500', shadow: 'shadow-[0_0_22px_rgba(251,113,133,0.5)]', badge: 'text-rose-100' }
  };
  const avatarFrame = avatarFrameStyles[currentGlowRank.level] || avatarFrameStyles[1];

  useEffect(() => {
    const timer = window.setTimeout(() => setGlobeReady(true), 250);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (userStats?.dailyTreadmillStarted) {
      setIsTreadmillConnected(true);
    }
  }, [userStats?.dailyTreadmillStarted]);

  useEffect(() => {
    if (pendingSelectionFrom) {
      const available = CITIES.filter(c => c.status !== 'lit' && c.status !== 'upcoming' && c.id !== pendingSelectionFrom);
      const shuffled = [...available].sort(() => 0.5 - Math.random());
      setSelectableCities(shuffled.slice(0, 3));
      setShowCitySelection(true);
    }
  }, [pendingSelectionFrom]);

  useEffect(() => {
    if (ENABLE_GLOW_TASKS && taskPanelOpenSignal > 0) {
      setShowTaskPanel(true);
    }
  }, [taskPanelOpenSignal]);

  const litCount = CITIES.filter(c => c.status === 'lit').length;
  const inProgressCity = CITIES.find(c => c.status === 'in-progress');
  const nextFocusCity = inProgressCity || CITIES.find(c => c.status !== 'lit' && c.status !== 'upcoming') || CITIES.find(c => c.status !== 'upcoming');
  const availableCityCount = CITIES.filter(c => c.status !== 'upcoming').length;
  
  const numMap = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];

  let currentChapterText = "奔跑·点亮地球计划尚未开启";
  let progressWidth = '0%';

  const medalLotteryHistory = userStats?.medalLotteryDrawHistory || [];
  const broadcastMessages = [
    ...medalLotteryHistory.slice(0, 3).map((record: any) => ({
      type: 'prize' as const,
      text: `${record.nickname || '沐小六'} 在勋章抽奖中抽中 ${record.amount} 现金红包`
    })),
    { type: 'route' as const, text: '林同风完成 北京·故宫角楼掠影，获得城市勋章' },
    { type: 'prize' as const, text: '晨跑星在勋章抽奖中抽中 1.66 元现金红包' },
    { type: 'route' as const, text: '青柠完成 新加坡·滨海湾路线，点亮路线勋章' },
    { type: 'prize' as const, text: '夜航员在勋章抽奖中抽中 2.66 元现金红包' },
    { type: 'route' as const, text: '北岸完成 杭州·西湖断桥残雪，获得城市勋章' }
  ];
  const activeBroadcast = broadcastMessages[broadcastIndex % broadcastMessages.length];

  useEffect(() => {
    if (broadcastMessages.length <= 1) return;
    const timer = window.setInterval(() => {
      setBroadcastIndex(prev => (prev + 1) % broadcastMessages.length);
    }, 2800);
    return () => window.clearInterval(timer);
  }, [broadcastMessages.length]);
  
  if (litCityIds.length === 0) {
    currentChapterText = "未知状态：点击进入并开启计划";
    progressWidth = '0%';
  } else if (inProgressCity) {
    const cityIndexInSequence = litCityIds.indexOf(inProgressCity.id);
    const numStr = numMap[cityIndexInSequence] || (cityIndexInSequence + 1).toString();
    currentChapterText = `第${numStr}城：${inProgressCity.name}，${inProgressCity.description}`;
    progressWidth = `${(inProgressCity.completed / inProgressCity.routes) * 100}%`;
  } else if (litCount > 0 && litCount === CITIES.length) {
    currentChapterText = "所有城市已点亮（地球倒影已解锁）";
    progressWidth = '100%';
  } else {
     // If everything is lit but some are still in progress? 
     // Or if we just finished one and haven't picked next
     const lastLitId = litCityIds[litCityIds.length - 1];
     const lastLitCity = CITIES.find(c => c.id === lastLitId);
      if (lastLitCity) {
        currentChapterText = `已点亮：${lastLitCity.name}，请开启下一站`;
        progressWidth = '100%';
      }
  }

  const handleConnectTreadmill = () => {
    setIsTreadmillConnected(true);
    onTreadmillActivated?.();
    if (setUserStats) {
      setUserStats((prev: any) => ({
        ...prev,
        dailyTreadmillStarted: true
      }));
    }
    setToastMessage('跑步机连接功能已启用，设备已连接');
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const triggerRewardBurst = (reward: number, title: string) => {
    const id = Date.now();
    setRewardBurst({ id, reward, title });
    window.setTimeout(() => {
      setRewardBurst(current => current?.id === id ? null : current);
    }, 1800);
  };

  const claimedDailyTaskIds: string[] = userStats?.claimedDailyTaskIds || [];
  const claimedWeeklyTaskIds: string[] = userStats?.claimedWeeklyTaskIds || [];
  const dailyTasks = [
    {
      id: 'daily-checkin',
      title: '每日签到',
      progress: userStats?.dailyCheckedIn ? 1 : 0,
      target: 1,
      reward: 1,
      actionLabel: '签到',
      ready: !userStats?.dailyCheckedIn,
      claimed: !!userStats?.dailyCheckedIn
    },
    {
      id: 'daily-route',
      title: '今日完成 1 条路线',
      progress: Math.min(userStats?.dailyCompletedRoutes || 0, 1),
      target: 1,
      reward: 2,
      ready: (userStats?.dailyCompletedRoutes || 0) >= 1,
      claimed: claimedDailyTaskIds.includes('daily-route')
    },
    {
      id: 'daily-treadmill',
      title: '今日启动一次跑步机',
      progress: userStats?.dailyTreadmillStarted ? 1 : 0,
      target: 1,
      reward: 1,
      ready: !!userStats?.dailyTreadmillStarted,
      claimed: claimedDailyTaskIds.includes('daily-treadmill')
    }
  ];
  const orderedDailyTasks = [...dailyTasks].sort((a, b) => {
    const order = ['daily-checkin', 'daily-treadmill', 'daily-route'];
    return order.indexOf(a.id) - order.indexOf(b.id);
  });
  const weeklyTasks = [
    {
      id: 'weekly-city',
      title: '本周完成 1 座城市',
      progress: Math.min(userStats?.weeklyCompletedCities || 0, 1),
      target: 1,
      reward: 10,
      ready: (userStats?.weeklyCompletedCities || 0) >= 1,
      claimed: claimedWeeklyTaskIds.includes('weekly-city')
    }
  ];
  const completedDailyCount = orderedDailyTasks.filter(task => task.claimed || task.ready).length;
  const completedWeeklyCount = weeklyTasks.filter(task => task.claimed || task.ready).length;
  const allGlowTasks = [...orderedDailyTasks, ...weeklyTasks];
  const totalTaskCount = allGlowTasks.length;
  const completedTaskCount = completedDailyCount + completedWeeklyCount;
  const handleClaimDailyTask = (taskId: string, reward: number) => {
    if (!setUserStats) return;

    if (taskId === 'daily-checkin') {
      if (userStats?.dailyCheckedIn) return;
      setUserStats((prev: any) => ({
        ...prev,
        dailyCheckedIn: true,
        lightValue: (prev.lightValue || 0) + reward,
        lifetimeLightValue: (prev.lifetimeLightValue ?? prev.lightValue ?? 0) + reward
      }));
      triggerRewardBurst(reward, '签到成功');
      showToast(`签到成功，获得 ${reward} 点光迹值`);
      return;
    }

    if (claimedDailyTaskIds.includes(taskId)) return;
    setUserStats((prev: any) => ({
      ...prev,
      claimedDailyTaskIds: [...(prev.claimedDailyTaskIds || []), taskId],
      lightValue: (prev.lightValue || 0) + reward,
      lifetimeLightValue: (prev.lifetimeLightValue ?? prev.lightValue ?? 0) + reward
    }));
    triggerRewardBurst(reward, '任务完成');
    showToast(`获得 ${reward} 点光迹值`);
  };

  const handleClaimWeeklyTask = (taskId: string, reward: number) => {
    if (!setUserStats || claimedWeeklyTaskIds.includes(taskId)) return;
    setUserStats((prev: any) => ({
      ...prev,
      claimedWeeklyTaskIds: [...(prev.claimedWeeklyTaskIds || []), taskId],
      lightValue: (prev.lightValue || 0) + reward,
      lifetimeLightValue: (prev.lifetimeLightValue ?? prev.lightValue ?? 0) + reward
    }));
    triggerRewardBurst(reward, '本周任务完成');
    showToast(`获得 ${reward} 点光迹值`);
  };

  const handleStartExplore = () => {
    setShowStoryPanel(false);
    
    if (inProgressCity) {
      setSelectedCity(inProgressCity);
    } else {
      // Pick 3 available cities (not lit, not upcoming)
      const available = CITIES.filter(c => c.status !== 'lit' && c.status !== 'upcoming');
      const shuffled = [...available].sort(() => 0.5 - Math.random());
      setSelectableCities(shuffled.slice(0, 3));
      setShowCitySelection(true);
    }
  };

  const handleShuffleCities = (e: React.MouseEvent) => {
    e.stopPropagation();
    let available = CITIES.filter(c => c.status !== 'lit' && c.status !== 'upcoming');
    if (pendingSelectionFrom) {
      available = available.filter(c => c.id !== pendingSelectionFrom);
    }
    const currentIds = new Set(selectableCities.map(c => c.id));
    let remaining = available.filter(c => !currentIds.has(c.id));
    if (remaining.length < 3) {
      remaining = [...available].sort(() => 0.5 - Math.random());
    } else {
      remaining = remaining.sort(() => 0.5 - Math.random());
    }
    setSelectableCities(remaining.slice(0, 3));
  };

  const handleCitySelect = (city: CityData) => {
    setShowCitySelection(false);
    
    // Set status to in-progress for selected city
    CITIES.forEach(c => {
      if (c.status === 'in-progress') {
        c.status = 'unlit';
      }
    });
    city.status = 'in-progress';

    if (onCitySelected) {
      onCitySelected(city.id);
    }
    
    if (!pendingSelectionFrom) {
      setSelectedCity(city);
    }
  };

  const handleCityClick = (city: CityData) => {
    setSelectedCity(city);
  };

  return (
    <div className={`relative flex h-full w-full items-center justify-center overflow-hidden ${spaceBackground === 'nebula' ? 'bg-[#040511]' : spaceBackground === 'starlight' ? 'bg-[#020713]' : 'bg-[#081827]'}`}>
      {/* Solid atmospheric backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {spaceBackground === 'nebula' ? (
          <>
            <div className="absolute inset-0 bg-[#040511]" />
            <div className="absolute -left-[30%] -top-[8%] h-[66%] w-[105%] rounded-full bg-[radial-gradient(ellipse,rgba(99,102,241,0.3),rgba(34,211,238,0.08)_38%,transparent_70%)] opacity-90 blur-2xl" />
            <div className="absolute -right-[28%] top-[22%] h-[62%] w-[90%] rounded-full bg-[radial-gradient(ellipse,rgba(217,70,239,0.2),rgba(45,212,191,0.06)_42%,transparent_72%)] blur-3xl" />
            {HOME_NEBULA_STARS.map(star => (
              <span
                key={star.id}
                className="absolute rounded-full bg-white"
                style={{
                  left: star.left,
                  top: star.top,
                  width: star.size,
                  height: star.size,
                  opacity: star.opacity,
                  boxShadow: `0 0 ${star.size * 5}px rgba(196,181,253,0.7)`
                }}
              />
            ))}
            {!reduceMotion && HOME_NEBULA_METEORS.map(meteor => (
              <motion.span
                key={meteor.id}
                className="absolute block h-px origin-right"
                style={{ left: meteor.left, top: meteor.top, width: meteor.width, rotate: 30 }}
                initial={{ x: -24, y: -14, opacity: 0, scaleX: 0.35 }}
                animate={{
                  x: [-24, meteor.distanceX],
                  y: [-14, meteor.distanceY],
                  opacity: [0, 0.92, 0.7, 0],
                  scaleX: [0.35, 1, 0.78]
                }}
                transition={{
                  delay: meteor.delay,
                  duration: meteor.duration,
                  repeat: Infinity,
                  repeatDelay: meteor.repeatDelay,
                  ease: 'easeOut'
                }}
                data-home-meteor={meteor.id}
                aria-hidden="true"
              >
                <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-cyan-100/65 to-white shadow-[0_0_8px_rgba(165,243,252,0.7)]" />
                <span className="absolute right-0 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-white shadow-[0_0_10px_rgba(224,247,255,0.95)]" />
              </motion.span>
            ))}
            <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[#040511]/80 via-[#040511]/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#040511] via-[#07091a]/70 to-transparent" />
          </>
        ) : spaceBackground === 'starlight' ? (
          <>
            <div className="absolute inset-0 bg-[#020713]" />
            <div className="absolute -left-[48%] top-[9%] h-[46%] w-[198%] rotate-[18deg] bg-[linear-gradient(180deg,transparent_0%,rgba(96,165,250,0.06)_18%,rgba(186,230,253,0.24)_43%,rgba(224,242,254,0.32)_52%,rgba(129,140,248,0.16)_65%,transparent_100%)] blur-2xl mix-blend-screen" />
            <div className="absolute -left-[38%] top-[23%] h-[15%] w-[174%] rotate-[18deg] bg-[linear-gradient(180deg,transparent,rgba(240,249,255,0.24),rgba(147,197,253,0.12),transparent)] blur-xl mix-blend-screen" />
            <div className="absolute left-[-4%] top-[5%] h-[55%] w-[108%] rounded-full bg-[radial-gradient(ellipse,rgba(125,211,252,0.2),rgba(99,102,241,0.07)_46%,transparent_72%)] blur-3xl" />
            <div className="absolute right-[-22%] top-[34%] h-[40%] w-[78%] rounded-full bg-[radial-gradient(ellipse,rgba(167,139,250,0.11),transparent_68%)] blur-3xl" />
            {HOME_NEBULA_STARS.map(star => (
              <motion.span
                key={`starlight-${star.id}`}
                className="absolute rounded-full bg-sky-50"
                style={{
                  left: star.left,
                  top: star.top,
                  width: Math.max(1, star.size),
                  height: Math.max(1, star.size),
                  boxShadow: `0 0 ${star.size * 6}px rgba(186, 230, 253, 0.76)`
                }}
                initial={{ opacity: Math.min(0.82, star.opacity + 0.16) }}
                animate={reduceMotion ? undefined : { opacity: [0.3, Math.min(0.95, star.opacity + 0.32), 0.3] }}
                transition={{ duration: 2.4 + (star.id % 4) * 0.55, delay: (star.id % 7) * 0.28, repeat: Infinity, ease: 'easeInOut' }}
              />
            ))}
            {HOME_STARLIGHT_FLARES.map(flare => (
              <motion.span
                key={flare.id}
                className="absolute rounded-full bg-white shadow-[0_0_14px_rgba(224,242,254,0.95)]"
                style={{ left: flare.left, top: flare.top, width: flare.size, height: flare.size }}
                initial={{ opacity: 0.42, scale: 0.82 }}
                animate={reduceMotion ? undefined : { opacity: [0.38, 1, 0.38], scale: [0.82, 1.18, 0.82] }}
                transition={{ duration: 2.8, delay: flare.delay, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden="true"
              >
                <span className="absolute left-1/2 top-1/2 h-px w-[220%] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-transparent via-sky-100/80 to-transparent" />
                <span className="absolute left-1/2 top-1/2 h-[220%] w-px -translate-x-1/2 -translate-y-1/2 bg-gradient-to-b from-transparent via-sky-100/70 to-transparent" />
              </motion.span>
            ))}
            <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[#020713]/76 via-[#020713]/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#020713] via-[#050d1d]/62 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[#081827]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_52%_32%,rgba(34,211,238,0.18),transparent_38%),radial-gradient(circle_at_24%_74%,rgba(20,184,166,0.14),transparent_32%)]" />
            <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-[#081827]/76 via-[#081827]/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-[#081827] via-[#081827]/62 to-transparent" />
          </>
        )}
      </div>

      {globeReady ? (
        <React.Suspense
          fallback={(
            <div className="absolute inset-0 flex items-center justify-center" role="status" aria-label="地球加载中">
              <div className="h-20 w-20 animate-pulse rounded-full border border-cyan-200/20 bg-cyan-200/5 shadow-[0_0_60px_rgba(34,211,238,0.12)]" />
            </div>
          )}
        >
          <div className="absolute inset-0 -translate-y-6">
            <WorldGlobe
              key={`${globeAppearance}-earth`}
              cities={CITIES}
              appearance={globeAppearance}
              focusCityId={nextFocusCity?.id}
              targetFlight={targetFlight}
              onCityClick={handleCityClick}
              onFlightComplete={onFlightComplete}
            />
          </div>
        </React.Suspense>
      ) : (
        <div className="absolute inset-0" aria-hidden="true" />
      )}

      {/* HUD: Top Overlay */}
      <div className={`absolute left-0 right-0 top-0 z-20 flex items-start justify-between gap-3 bg-gradient-to-b px-5 pt-5 pointer-events-none ${spaceBackground === 'nebula' ? 'from-[#040511]/76' : spaceBackground === 'starlight' ? 'from-[#020713]/74' : 'from-[#081827]/68'} to-transparent`}>
        
        {/* User Info & Campaign Entry */}
        <div className="flex w-[190px] flex-col items-start gap-2 pointer-events-auto">
          <button
            onClick={() => onNavigate && onNavigate('glowCenter', null)}
            className="flex w-full items-center gap-3 rounded-full border border-white/12 bg-slate-950/24 p-1.5 pr-4 text-left shadow-[0_18px_44px_rgba(0,0,0,0.24)] backdrop-blur-md hover:border-cyan-200/35 hover:bg-white/[0.075] transition-colors"
          >
            <div className={`relative h-12 w-12 rounded-full bg-gradient-to-br ${avatarFrame.ring} p-[2px] ${avatarFrame.shadow}`}>
              <div className="h-full w-full rounded-full bg-slate-950 p-[2px]">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100"
                  alt="用户头像"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            </div>
            <div>
              <div className="text-sm font-black tracking-wide text-slate-50">沐小六</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] font-bold text-slate-300">
                <span>{currentGlowRank.name}</span>
                <span className="text-slate-500">LV.{currentGlowRank.level}</span>
              </div>
              <div className="mt-1 h-1 w-20 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-200 to-amber-200"
                  style={{ width: `${glowRankDetails.progress}%` }}
                />
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigate?.('purchaseRefundCampaign', null)}
            className="group relative flex h-10 w-full items-center gap-2.5 overflow-hidden rounded-[15px] border border-amber-100/20 bg-[#18212a]/82 px-3 text-left shadow-[0_12px_30px_rgba(0,0,0,0.22)] backdrop-blur-xl outline-none transition active:scale-[0.985] focus-visible:ring-2 focus-visible:ring-amber-100/55"
            aria-label="打开30天运动打卡返购机款活动"
          >
            <span className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-[radial-gradient(circle_at_100%_50%,rgba(251,191,36,0.15),transparent_72%)]" />
            <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-[10px] border border-amber-100/20 bg-amber-200/9 text-amber-100">
              <Gift size={14} />
            </span>
            <span className="relative min-w-0 flex-1 whitespace-nowrap text-[11px] font-black tracking-[-0.03em] text-white">30天运动打卡返购机款</span>
            <ChevronRight size={15} className="relative shrink-0 text-amber-100/85 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={handleConnectTreadmill}
            aria-label={isTreadmillConnected ? '跑步机已连接' : '连接跑步机'}
            title={isTreadmillConnected ? '跑步机已连接' : '连接跑步机'}
            className={cn(
              "group relative flex h-11 w-11 items-center justify-center rounded-2xl backdrop-blur-md transition-all duration-300 shadow-lg border active:scale-95",
              isTreadmillConnected 
                ? "bg-emerald-500/20 border-emerald-300/60 hover:bg-emerald-500/25 shadow-[0_0_22px_rgba(52,211,153,0.24)]" 
                : "bg-slate-950/35 border-cyan-300/30 hover:bg-cyan-400/15 hover:border-cyan-200/70 hover:shadow-[0_0_22px_rgba(34,211,238,0.2)]"
            )}
          >
            <span className={cn(
              "absolute inset-1 rounded-xl opacity-0 transition-opacity",
              isTreadmillConnected ? "bg-emerald-300/10 opacity-100" : "bg-cyan-300/10 group-hover:opacity-100"
            )} />
            <svg
              className={cn("relative z-10 h-6 w-6", isTreadmillConnected ? "text-emerald-300" : "text-cyan-300")}
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 17.5h10.4c1.4 0 2.6-.9 3-2.2l1.2-3.8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M3.8 19.5h13.8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M8.5 17.5 13 7.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M12.2 7.5h5.3c.7 0 1.2.5 1.2 1.2v1.1c0 .7-.5 1.2-1.2 1.2h-6.9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16.1 8.9h.1"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
              />
            </svg>
            {isTreadmillConnected && (
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.85)]" />
            )}
            <span className="sr-only">
              {isTreadmillConnected ? "跑步机已连接" : "连接跑步机"}
            </span>
          </button>
        </div>
      </div>


      {/* Right Quick Rail */}
      <div className="absolute right-5 top-[42%] z-20 flex -translate-y-1/2 flex-col items-center gap-3 pointer-events-auto">
        <button
          className="group flex flex-col items-center gap-1.5 text-[10px] font-black text-slate-200"
          onClick={() => onNavigate && onNavigate('routeCollection', null)}
          aria-label="打开城市图鉴"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-slate-950/34 text-cyan-200 shadow-[0_12px_34px_rgba(0,0,0,0.26)] backdrop-blur-md transition group-hover:border-cyan-200/50 group-hover:bg-cyan-300/12">
            <Zap size={18} />
          </span>
          城市图鉴
        </button>
        <button
          className="group flex flex-col items-center gap-1.5 text-[10px] font-black text-slate-200"
          onClick={() => onNavigate && onNavigate('leaderboard', null)}
        >
          <span className="relative flex h-11 w-11 items-center justify-center rounded-full border border-white/14 bg-slate-950/34 text-cyan-200 shadow-[0_12px_34px_rgba(0,0,0,0.26)] backdrop-blur-md transition group-hover:border-cyan-200/50 group-hover:bg-cyan-300/12">
            <Award size={18} />
          </span>
          排行榜
        </button>
        <button
          className="group flex flex-col items-center gap-1.5 text-[10px] font-black text-orange-100"
          onClick={() => onNavigate && onNavigate('weightLossPlan', null)}
          aria-label="打开打卡红包活动"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-orange-200/24 bg-orange-300/12 text-orange-200 shadow-[0_12px_34px_rgba(0,0,0,0.26)] backdrop-blur-md transition group-hover:border-orange-200/50 group-hover:bg-orange-300/18">
            <Flame size={18} />
          </span>
          打卡领红包
        </button>
        <button
          type="button"
          onClick={() => onNavigate && onNavigate('onlineSupport', null)}
          className="group flex flex-col items-center gap-1.5 text-[11px] font-black text-cyan-50"
          aria-label="打开在线客服"
        >
          <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-cyan-100/45 bg-gradient-to-br from-cyan-300/28 via-[#0c2636]/88 to-[#07111f]/90 text-cyan-50 shadow-[0_14px_36px_rgba(0,0,0,0.32),0_0_24px_rgba(34,211,238,0.22),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md transition group-hover:border-cyan-100/70 group-hover:from-cyan-200/34 group-hover:shadow-[0_16px_38px_rgba(0,0,0,0.34),0_0_32px_rgba(34,211,238,0.3),inset_0_1px_0_rgba(255,255,255,0.22)] group-focus-visible:border-cyan-100/80 group-focus-visible:outline-none group-focus-visible:ring-2 group-focus-visible:ring-cyan-200/45">
            <span className="absolute inset-[-5px] rounded-full border border-cyan-200/12 opacity-80 shadow-[0_0_28px_rgba(34,211,238,0.16)]" />
            <HeadphonesIcon size={20} strokeWidth={2.4} className="relative" />
          </span>
          在线客服
        </button>
      </div>

      {/* Bottom Area */}
      <div className="absolute bottom-2 left-4 right-4 z-20 pointer-events-none flex flex-col gap-2">
        {/* Bottom Mission Card (Teaser) */}
        <div
          className="relative w-full cursor-pointer overflow-hidden rounded-[22px] border border-cyan-100/16 bg-[#142538]/76 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl pointer-events-auto transition-colors hover:border-cyan-200/32"
          onClick={() => setShowStoryPanel(true)}
        >
          <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_18%_0%,rgba(103,232,249,0.18),transparent_48%),radial-gradient(circle_at_84%_0%,rgba(148,163,184,0.14),transparent_46%)] pointer-events-none" />
          <div className="relative grid grid-cols-[0.9fr_1.1fr] gap-3">
            <div className="flex min-h-[126px] flex-col border-r border-white/10 pr-3">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-black tracking-wide text-white">点亮地球计划</h3>
                <span className="flex h-4 w-4 items-center justify-center rounded-full border border-white/12 text-[10px] text-slate-400">i</span>
              </div>
              <p className="mt-4 flex items-end gap-1 leading-none text-cyan-100">
                <span className="pb-1 text-base font-black tracking-[-0.03em]">点亮：</span>
                <span className="font-mono text-[44px] font-black tracking-[-0.07em] tabular-nums">{litCount}</span>
                <span className="pb-1 text-base font-black tracking-[-0.03em]">座城市</span>
              </p>
              <div className="mt-auto text-[11px] font-bold leading-5 text-slate-400">
                <p>解锁：<span className="font-mono text-sm font-black text-slate-100">{availableCityCount}</span> 条路线</p>
              </div>
            </div>

            <div className="flex min-h-[126px] min-w-0 flex-col gap-3 pl-1">
              <div>
                <p className="text-[10px] font-bold text-slate-400">正在点亮的城市</p>
                <div className="mt-2 flex items-start gap-3">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                    {nextFocusCity && (
                      <CityImage
                        src={getCityPreviewImage(nextFocusCity)}
                        alt={nextFocusCity.name}
                        fallbackLabel={nextFocusCity.name}
                        className="h-full w-full object-cover object-center"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/45 to-transparent" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-lg font-black leading-tight text-white">{nextFocusCity?.name || '下一城'}</h4>
                    <p className="mt-0.5 truncate text-[11px] font-bold text-slate-400">{inProgressCity ? '信号接收中...' : '等待开启探索'}</p>
                    <div className="mt-1.5 flex items-center gap-0.5">
                      {Array.from({ length: 18 }).map((_, index) => (
                        <span
                          key={index}
                          className={cn(
                            "h-3 w-0.5 rounded-full",
                            index < Math.round((Number.parseFloat(progressWidth) || 0) / 100 * 18) ? "bg-cyan-200" : "bg-white/10"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (nextFocusCity && onNavigate) {
                    onNavigate('cityRoutes', nextFocusCity);
                  } else {
                    setShowStoryPanel(true);
                  }
                }}
                className="mt-auto flex h-9 w-full items-center justify-center rounded-full border border-cyan-100/18 bg-cyan-100/[0.08] text-xs font-black text-cyan-50 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-95"
              >
                前往探索
              </button>
            </div>
          </div>
        </div>

        <div
          className="flex w-full items-center gap-3 rounded-[18px] border border-amber-200/18 bg-[#14283c]/74 px-3.5 py-3 text-left shadow-[0_16px_44px_rgba(0,0,0,0.24)] backdrop-blur-xl pointer-events-auto"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-200/18 bg-amber-200/10 text-amber-200 shadow-[0_0_18px_rgba(251,191,36,0.13)]">
            <Radio size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex items-center gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-amber-100/70">信号广播</span>
              <span className="h-1 w-1 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(110,231,183,0.7)]" />
            </div>
            <div className="relative h-4 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.p
                  key={`${activeBroadcast.type}-${broadcastIndex}`}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.26, ease: 'easeOut' }}
                  className="absolute inset-x-0 top-0 truncate text-[11px] font-bold text-slate-200"
                >
                  {activeBroadcast.text}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* City Popup Card Overlay */}
      <AnimatePresence>
        {selectedCity && !showStoryPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/40 flex items-center justify-center p-6 backdrop-blur-[2px]"
            onClick={() => setSelectedCity(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm bg-slate-900/90 backdrop-blur-xl rounded-3xl overflow-hidden border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
              onClick={(e) => {
                 e.stopPropagation();
                 if (selectedCity.status !== 'upcoming') {
                   setSelectedCity(null);
                   if (onNavigate) {
                     onNavigate('cityRoutes', selectedCity);
                   }
                 }
              }}
            >
              <div className="relative h-48 w-full">
                <CityImage src={selectedCity.image} alt={selectedCity.name} fallbackLabel={selectedCity.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCity(null);
                  }}
                  className="absolute top-4 right-4 w-8 h-8 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm transition-colors text-white"
                >
                  <X size={16} />
                </button>
                <div className="absolute bottom-4 left-6">
                   <h3 className="text-3xl font-bold text-white tracking-widest drop-shadow-md">{selectedCity.name}</h3>
                   <p className="text-sm font-medium text-cyan-300 uppercase tracking-widest mt-1 opacity-80">{selectedCity.englishName}</p>
                </div>
              </div>
              
              <div className="p-6 pt-2">
                 {selectedCity.status === 'upcoming' ? (
                   <div className="flex flex-col items-center justify-center py-8">
                     <Lock size={32} className="text-slate-500 mb-4" />
                     <p className="text-slate-400 font-medium">即将上线时间: 2026年下半年</p>
                   </div>
                 ) : (
                   <>
                     <div className="flex justify-between text-sm mb-6 bg-white/5 rounded-xl p-4 border border-white/5">
                       <div className="flex flex-col items-center">
                         <span className="text-2xl font-bold text-slate-100 mb-1">{selectedCity.routes}</span>
                         <span className="text-[10px] text-slate-500 uppercase tracking-widest">路线</span>
                       </div>
                       <div className="w-px bg-white/10" />
                       <div className="flex flex-col items-center">
                         <span className="text-2xl font-bold text-slate-100 mb-1">{selectedCity.spots}</span>
                         <span className="text-[10px] text-slate-500 uppercase tracking-widest">景点</span>
                       </div>
                       <div className="w-px bg-white/10" />
                       <div className="flex flex-col items-center">
                         <span className="text-2xl font-bold text-slate-100 mb-1">{selectedCity.status === 'lit' ? '100%' : `${Math.round((selectedCity.completed / selectedCity.routes) * 100)}%`}</span>
                         <span className="text-[10px] text-slate-500 uppercase tracking-widest">完成度</span>
                       </div>
                     </div>

                     <div className="mb-6">
                        <div className="flex justify-between items-end mb-2">
                           <span className="text-[10px] text-slate-400">唤醒进度</span>
                           <span className="text-xs font-mono font-medium text-amber-500">{selectedCity.completed} / {selectedCity.routes}</span>
                        </div>
                        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                           <div 
                             className="h-full bg-amber-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                             style={{ width: `${(selectedCity.completed / selectedCity.routes) * 100}%` }} 
                           />
                        </div>
                     </div>

                     <button 
                       className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-colors tracking-wide shadow-[0_0_20px_rgba(34,211,238,0.2)]"
                       onClick={(e) => {
                         e.stopPropagation();
                         setSelectedCity(null);
                         if (onNavigate) {
                           onNavigate('cityRoutes', selectedCity);
                         }
                       }}
                     >
                       进入这座城市
                     </button>
                   </>
                 )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Panel Overlay */}
      <AnimatePresence>
        {showStoryPanel && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute inset-0 z-50 bg-[#05070A] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 pb-2 border-b border-white/5 relative bg-gradient-to-b from-cyan-900/20 to-transparent">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
              <div>
                <h2 className="text-2xl font-bold text-slate-100 mb-1">奔跑·点亮地球计划</h2>
                <p className="text-xs text-cyan-400 opacity-80 tracking-widest font-mono">MOVEVI 世界点亮计划</p>
              </div>
              <button 
                onClick={() => setShowStoryPanel(false)}
                className="w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center border border-white/10 transition-colors pointer-events-auto shadow-xl"
              >
                <X size={20} className="text-slate-300" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 hide-scrollbar">
              <div className="mb-8 p-4 bg-gradient-to-r from-cyan-950/40 to-transparent rounded-xl border-l-2 border-cyan-500 shadow-md">
                <p className="text-xs text-slate-300 leading-relaxed font-medium italic mb-3">
                  "600年以后，人类早已离开地球，生活在群星之间。我们建造了新的城市、新的轨道、新的家园。"
                </p>
                <p className="text-xs text-slate-300 leading-relaxed font-medium italic mb-3">
                  "可是走向宇宙深处，人们越开始想念那颗蓝色的母星。想念巴黎清晨的雾，想念东京街口的人潮，想念开罗金字塔前吹来的热风，也想念新加坡滨海湾，海风穿过花园城市的声音..."
                </p>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  你，不是普通运动者。你是一名<span className="text-cyan-400 font-bold mx-1">光迹探索者 (Glowtrail Explorer)</span>。<br/>
                  你的任务，是通过每一次出发，唤醒一段地球记忆；每完成一条路线，点亮一道母星光迹。
                </p>
              </div>

              {!litCityIds.length ? (
                <div className="w-full py-12 px-6 bg-slate-900/50 border border-slate-700/50 rounded-2xl flex flex-col items-center justify-center text-center mb-6 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent"></div>
                  <Compass size={32} className="text-cyan-500 animate-pulse mb-4 relative z-10" />
                  <h3 className="text-lg font-bold text-slate-200 tracking-wider mb-2 relative z-10">奔跑·点亮地球计划待开启</h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-4 relative z-10">
                    地球的记忆仍在一片暗淡之中。<br className="hidden sm:block" />您的奔跑，是重启这些城市坐标的唯一能源。
                  </p>
                  <div className="text-xs font-mono text-cyan-500/80 bg-cyan-950/30 px-3 py-1.5 rounded relative z-10">
                    等待接收探索者指令...
                  </div>
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-slate-700 before:to-slate-800">
                  {Array.from({ length: Math.min(litCityIds.length + 1, CITIES.length) }).map((_, index) => {
                    const cityId = litCityIds[index];
                    const numStr = numMap[index] || (index + 1).toString();
                    
                    if (cityId) {
                      const city = CITIES.find(c => c.id === cityId);
                      if (!city) return null;
                      
                      const isLit = city.status === 'lit';
                      const isInProgress = city.status === 'in-progress';
                      const isLocked = false;

                      return (
                        <div key={city.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${!isLocked ? 'is-active' : ''}`}>
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-[#05070A] ${isLit ? 'bg-[#2ecc71] text-slate-100 shadow-[0_0_20px_rgba(46,204,113,0.8)]' : isInProgress ? 'bg-cyan-500 text-slate-100 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'bg-slate-800 text-slate-400'} shrink-0 z-10 font-bold text-xs relative`}>
                            {isLit && <span className="absolute w-full h-full rounded-full bg-[#2ecc71] animate-ping opacity-40"></span>}
                            {String(index + 1).padStart(2, '0')}
                          </div>
                          <div className={`w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-white/5 border ${isLit ? 'border-[#2ecc71]/40 shadow-[0_0_20px_rgba(46,204,113,0.15)] bg-[#2ecc71]/[0.02]' : isInProgress ? 'border-cyan-500/30' : 'border-white/5'} rounded-2xl p-4 shadow-lg backdrop-blur-sm ${isLocked ? 'opacity-60' : ''}`}>
                             <div className="flex items-start justify-between mb-1 gap-2">
                                <div>
                                  <h3 className={`${isLit ? 'text-[#2ecc71]' : isInProgress ? 'text-cyan-400' : 'text-slate-300'} font-bold text-lg`}>第{numStr}城：{city.name}</h3>
                                  <p className="text-[13px] text-slate-400 mt-1 font-mono">{city.continent} · {city.englishName}</p>
                                </div>
                                {isLocked && <Lock size={14} className="text-slate-500" />}
                                {isInProgress && (
                                  <button onClick={(e) => {
                                      e.stopPropagation();
                                      setShowSwitchConfirm(true);
                                  }} className="flex items-center gap-1.5 text-xs font-medium text-cyan-400/80 hover:text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-400/40 hover:bg-cyan-900/40 px-3 py-1 rounded-full transition-all shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.05)]">
                                    <RefreshCw size={12} />
                                    切换
                                  </button>
                                )}
                             </div>
                             <p className={`text-[12px] leading-relaxed mb-4 ${isLocked ? 'text-slate-500' : 'text-slate-300'}`}>
                               {city.description}
                             </p>
                             {isLit ? (
                                <div className="flex items-center text-[10px] text-[#2ecc71] bg-[#2ecc71]/10 rounded px-2 py-1 font-mono w-fit">
                                   <CheckCircle2 size={12} className="mr-1" />
                                   已完成: 城市卡片已解锁
                                </div>
                             ) : isInProgress ? (
                                <div className="flex items-center text-[10px] text-cyan-400 bg-cyan-950/40 rounded px-2 py-1 font-mono w-fit">
                                   <Activity size={12} className="mr-1" />
                                   进行中: 唤醒进度 {city.completed}/{city.routes}
                                </div>
                             ) : null}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={`locked-${index}`} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group opacity-50">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-[#05070A] bg-slate-800 text-slate-500 shrink-0 z-10 font-bold text-xs relative">
                            {String(index + 1).padStart(2, '0')}
                          </div>
                          <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2rem)] bg-white/5 border border-white/5 rounded-2xl p-4 backdrop-blur-sm">
                             <div className="flex items-center justify-between mb-1">
                                <h3 className="text-slate-500 font-bold">第{numStr}城：待解密</h3>
                                <Lock size={14} className="text-slate-600" />
                             </div>
                             <p className="text-xs text-slate-600 mb-3 font-mono">未知坐标</p>
                             <p className="text-[11px] text-slate-600 leading-relaxed mb-3">
                               需完成前置任务后，方可获取此地标的脉冲信号。
                             </p>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              )}
            </div>
            
            <div className="p-4 bg-black/80 backdrop-blur-md border-t border-white/5 shrink-0">
               <button 
                 onClick={handleStartExplore}
                 className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-colors tracking-wide shadow-[0_0_20px_rgba(34,211,238,0.3)]"
               >
                 {litCityIds.length === 0 ? "开始探索" : inProgressCity ? "继续探索" : "选择下一城"}
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* City Selection Overlay */}
      <AnimatePresence>
        {showCitySelection && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center p-6 backdrop-blur-sm"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">选择探索城市</h2>
              <p className="text-slate-400 text-sm">选择一个城市，开启你的光迹唤醒之旅</p>
            </div>
            
            <div className="w-full flex flex-col gap-4">
              {selectableCities.map((city, idx) => {
                const completedCount = city.completedRouteIndices?.length || 0;
                const totalRoutes = city.routes || 3;
                
                return (
                <motion.div
                  key={city.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl cursor-pointer"
                  onClick={() => handleCitySelect(city)}
                >
                  <div className="relative h-28">
                    <CityImage src={city.image} alt={city.name} fallbackLabel={city.name} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col justify-end">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-white drop-shadow-md">{city.name}</h3>
                          <p className="text-xs text-cyan-300 font-mono tracking-widest uppercase mt-0.5">{city.englishName}</p>
                        </div>
                        <ChevronRight className="text-white/50 w-5 h-5" />
                      </div>
                      
                      <div className="w-full bg-slate-700/80 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-cyan-400 h-full transition-all duration-500 shadow-[0_0_12px_rgba(34,211,238,0.9)]"
                          style={{ width: `${Math.min(100, (completedCount / totalRoutes) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-mono">
                        <span>进度</span>
                        <span className="text-cyan-400">{completedCount}/{totalRoutes} 路线</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
                );
              })}
            </div>
            
            <button 
              onClick={handleShuffleCities}
              className="mt-8 flex items-center justify-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors bg-cyan-500/10 px-6 py-2.5 rounded-full"
            >
              <RefreshCw size={16} />
              <span className="text-sm font-medium">换一批</span>
            </button>
            
            <button
              className="mt-6 text-slate-400 text-sm hover:text-white"
              onClick={() => setShowCitySelection(false)}
            >
              取消
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Burst */}
      <AnimatePresence>
        {rewardBurst && (
          <motion.div
            key={rewardBurst.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 z-[95] flex items-center justify-center px-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.72, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -18 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="relative w-full max-w-[280px] overflow-hidden rounded-[30px] border border-amber-300/45 bg-[#08111d]/95 px-7 py-7 text-center shadow-[0_0_70px_rgba(251,191,36,0.38)] backdrop-blur-xl"
            >
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: [0.6, 1.15, 1], opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-amber-200/60 bg-amber-300 text-slate-950 shadow-[0_0_34px_rgba(251,191,36,0.55)]"
              >
                <Sparkles size={30} strokeWidth={2.8} />
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 }}
                className="mt-5 text-[11px] font-black tracking-[0.22em] text-amber-100"
              >
                光迹值到账
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: [0.75, 1.12, 1] }}
                transition={{ delay: 0.18, duration: 0.5 }}
                className="mt-1 font-mono text-5xl font-black text-white"
              >
                +{rewardBurst.reward}
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
                className="mt-2 text-xs font-bold text-cyan-200"
              >
                {rewardBurst.title}
              </motion.p>

              {Array.from({ length: 14 }).map((_, index) => {
                const angle = (index / 14) * Math.PI * 2;
                const distance = 86 + (index % 4) * 14;
                return (
                  <motion.span
                    key={index}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 0 }}
                    animate={{
                      x: Math.cos(angle) * distance,
                      y: Math.sin(angle) * distance,
                      scale: [0, 1, 0.6],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ duration: 1.15, delay: index * 0.025, ease: 'easeOut' }}
                    className="absolute left-1/2 top-1/2 h-2 w-2 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.8)]"
                  />
                );
              })}

              <motion.div
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: [0, 1, 0], y: -110 }}
                transition={{ duration: 1.25, delay: 0.18, ease: 'easeOut' }}
                className="absolute left-1/2 top-1/2 h-20 w-1 -translate-x-1/2 rounded-full bg-gradient-to-t from-cyan-300/0 via-cyan-200/70 to-amber-200/0 blur-[1px]"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Panel */}
      <AnimatePresence>
        {ENABLE_GLOW_TASKS && showTaskPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[70] flex items-end justify-center bg-black/80 backdrop-blur-md"
            onClick={() => setShowTaskPanel(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              className="relative w-full max-w-md overflow-hidden rounded-t-[30px] border border-white/10 bg-[#05070A] p-4 pb-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_20%_0%,rgba(94,106,210,0.26),transparent_42%),radial-gradient(circle_at_84%_6%,rgba(251,191,36,0.18),transparent_36%)]" />
              <div className="absolute inset-0 opacity-[0.06] bg-[linear-gradient(rgba(255,255,255,0.22)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.22)_1px,transparent_1px)] bg-[size:28px_28px]" />
              <div className="relative">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black tracking-[0.24em] text-indigo-200">光迹任务</p>
                  <h2 className="mt-1 text-xl font-black tracking-tight text-white">光迹任务</h2>
                </div>
                <button
                  onClick={() => setShowTaskPanel(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition-colors hover:bg-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-5 overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.055] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-3">
                    <p className="text-[10px] font-bold text-slate-500">完成度</p>
                    <p className="mt-1 font-mono text-xl font-black text-white">{completedTaskCount}/{totalTaskCount}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTaskPanel(false);
                      onNavigate && onNavigate('glowCenter', null);
                    }}
                    className="rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.06] p-3 text-left transition-colors hover:border-cyan-200/30 hover:bg-cyan-300/[0.1]"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[10px] font-bold text-cyan-100/60">余额</p>
                      <ChevronRight size={12} className="text-cyan-200/70" />
                    </div>
                    <p className="mt-1 font-mono text-xl font-black text-cyan-200">{userStats?.lightValue || 0}</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTaskPanel(false);
                      onNavigate && onNavigate('glowWheel', null);
                    }}
                    className="relative overflow-hidden rounded-2xl border border-amber-200/25 bg-gradient-to-br from-amber-300/18 via-indigo-300/12 to-cyan-300/10 p-3 text-left transition-all hover:border-amber-200/45 hover:bg-amber-300/[0.12] active:scale-95"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,231,155,0.22),transparent_48%)]" />
                    <div className="relative flex items-center justify-between gap-2">
                      <p className="text-[10px] font-bold text-amber-100/70">光迹值</p>
                      <ChevronRight size={12} className="text-amber-100/80" />
                    </div>
                    <div className="relative mt-1 flex items-center gap-1.5">
                      <Gift size={16} className="text-amber-200" />
                      <p className="text-sm font-black leading-tight text-amber-100">现金抽奖</p>
                    </div>
                  </button>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(completedTaskCount / totalTaskCount) * 100}%` }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-300 via-cyan-300 to-amber-200"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-4">
                {[
                  { title: '今日任务', meta: '每日刷新', tasks: orderedDailyTasks, tone: 'cyan' },
                  { title: '本周任务', meta: `${completedWeeklyCount}/1`, tasks: weeklyTasks, tone: 'amber' }
                ].map(group => (
                  <div key={group.title}>
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-xs font-black text-slate-100">{group.title}</h3>
                      <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2 py-1 text-[10px] font-bold text-slate-500">{group.meta}</span>
                    </div>
                    <div className="space-y-2">
                      {group.tasks.map((task: any) => {
                        const progressText = task.unit === 'km'
                          ? `${task.progress.toFixed(1)}/${task.target}${task.unit}`
                          : `${task.progress}/${task.target}`;
                        const progressPercent = Math.min(100, (task.progress / task.target) * 100);
                        const canClaim = task.ready && !task.claimed;
                        const isWeekly = group.tone === 'amber';
                        return (
                          <div
                            key={task.id}
                            className={`rounded-[18px] border p-3 ${
                              task.claimed
                                ? 'border-emerald-300/[0.14] bg-emerald-300/[0.035]'
                                : canClaim
                                  ? isWeekly
                                    ? 'border-amber-300/[0.24] bg-amber-300/[0.065]'
                                    : 'border-cyan-300/[0.22] bg-cyan-300/[0.055]'
                                  : 'border-white/[0.08] bg-[#0b1018]/80'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                                task.claimed
                                  ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-300'
                                  : canClaim
                                    ? isWeekly
                                      ? 'border-amber-300/20 bg-amber-300/10 text-amber-200'
                                      : 'border-cyan-300/20 bg-cyan-300/10 text-cyan-200'
                                    : 'border-white/[0.08] bg-white/[0.035] text-slate-500'
                              }`}>
                                {task.claimed ? <CheckCircle2 size={18} /> : isWeekly ? <Award size={17} /> : <Gift size={17} />}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between gap-2">
                                  <p className="truncate text-xs font-black text-slate-100">{task.title}</p>
                                  <span className={`shrink-0 font-mono text-[11px] font-black ${isWeekly ? 'text-amber-200' : 'text-cyan-200'}`}>+{task.reward}</span>
                                </div>
                                <div className="mt-2 flex items-center gap-2">
                                  <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
                                    <div
                                      className={`h-full rounded-full ${isWeekly ? 'bg-gradient-to-r from-amber-300 to-yellow-100' : 'bg-gradient-to-r from-indigo-300 to-cyan-200'}`}
                                      style={{ width: `${progressPercent}%` }}
                                    />
                                  </div>
                                  <span className="shrink-0 font-mono text-[10px] font-bold text-slate-500">{progressText}</span>
                                </div>
                              </div>
                              <button
                                disabled={!canClaim}
                                onClick={() => task.id === 'weekly-city' ? handleClaimWeeklyTask(task.id, task.reward) : handleClaimDailyTask(task.id, task.reward)}
                                className={`h-9 shrink-0 rounded-xl px-3 text-[10px] font-black transition-colors ${
                                  canClaim
                                    ? isWeekly
                                      ? 'bg-amber-200 text-slate-950 shadow-[0_0_18px_rgba(251,191,36,0.22)]'
                                      : 'bg-cyan-300 text-slate-950 shadow-[0_0_18px_rgba(103,232,249,0.2)]'
                                    : task.claimed
                                      ? 'border border-emerald-300/15 bg-emerald-300/[0.06] text-emerald-300'
                                      : 'border border-white/[0.08] bg-white/[0.035] text-slate-500'
                                }`}
                              >
                                {task.claimed ? '已领' : task.actionLabel || '领取'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Switch City Confirmation */}
      <AnimatePresence>
        {showSwitchConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[60] bg-black/80 flex flex-col items-center justify-center p-6 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 p-6 rounded-2xl w-full max-w-xs text-center shadow-2xl"
            >
               <h3 className="text-xl font-bold text-white mb-3">切换城市</h3>
               <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  {citySwitchPasses > 0 ? (
                    <>本次优先使用 <span className="text-cyan-200 font-bold mx-1">1 张城市切换券</span>。<br />当前持有 {citySwitchPasses} 张</>
                  ) : (
                    <>切换城市将消耗<span className="text-amber-400 font-bold mx-1">3 点光迹值</span>。<br />是否继续？</>
                  )}
                </p>
               
               <div className="flex gap-3">
                 <button 
                   onClick={() => setShowSwitchConfirm(false)}
                   className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors font-medium border border-white/5"
                 >
                   取消
                 </button>
                 <button 
                   onClick={() => {
                       const useSwitchPass = citySwitchPasses > 0;
                       if (userStats && (useSwitchPass || userStats.lightValue >= 3)) {
                         if (setUserStats) {
                           setUserStats((prev: any) => {
                             if (useSwitchPass) {
                               return {
                                 ...prev,
                                 citySwitchPasses: Math.max(0, (prev.citySwitchPasses || 0) - 1),
                                 glowShopInventory: {
                                   ...(prev.glowShopInventory || {}),
                                   'city-switch-pack': Math.max(0, (prev.glowShopInventory?.['city-switch-pack'] || 0) - 1)
                                 }
                               };
                             }

                             return {
                               ...prev,
                               lightValue: prev.lightValue - 3,
                               glowValueRecords: [
                                 {
                                   id: `city-switch-${Date.now()}`,
                                   type: 'spend',
                                   title: '切换探索城市',
                                   description: '重新选择下一座城市',
                                   amount: 3,
                                   createdAt: Date.now()
                                 },
                                 ...(prev.glowValueRecords || [])
                               ]
                             };
                           });
                         }
                        const available = CITIES.filter(c => c.status !== 'lit' && c.status !== 'upcoming');
                        const shuffled = [...available].sort(() => 0.5 - Math.random());
                        setSelectableCities(shuffled.slice(0, 3));
                        setShowSwitchConfirm(false);
                        setShowStoryPanel(false); // Close story panel as well right away
                        setShowCitySelection(true);
                         setToastMessage(useSwitchPass ? '已使用 1 张城市切换券' : '已消耗 3 点光迹值重新选择城市');
                        setTimeout(() => setToastMessage(null), 3000);
                      } else {
                        setShowSwitchConfirm(false);
                        setToastMessage('光迹值不足（需要 3 点）');
                        setTimeout(() => setToastMessage(null), 3000);
                      }
                   }}
                   className="flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-xl transition-colors font-bold shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                 >
                   确定
                 </button>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-500/90 text-white px-4 py-2 rounded-full shadow-lg backdrop-blur-md text-xs font-medium whitespace-nowrap"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
