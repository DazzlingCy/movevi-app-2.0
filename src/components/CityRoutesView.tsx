import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Globe2, Lock, Award, Route, Sparkles, Check, Clock3, MapPin, Play, LockOpen, Star } from 'lucide-react';
import { CityData } from '../data/cities';
import CityImage from './CityImage';
import RouteRunners from './RouteRunners';
import RouteCardRail from './RouteCardRail';

import { getRouteData } from '../data/cities';
import CityRouteOverviewView from './CityRouteOverviewView';
import styles from './CityRoutesView.module.css';
import { getRouteCover } from '../data/routeCovers';
import { getInitialRouteIndex } from '../journey/routeFocus';
import { getRouteCategory, type RouteCategory } from '../data/routeCategories';

export interface CityRouteListItem {
  category?: RouteCategory;
  title: string;
  distance: string;
  duration: string;
  calories: string;
  rating: string;
  spots: string;
  intro: string;
  coverImage?: string;
  runnerCount?: number;
  runnerAvatars?: string[];
  isCompleted?: boolean;
  isUnlocked?: boolean;
}

interface CityRoutesViewProps {
  city: CityData;
  onBack: () => void;
  onRouteClick: (routeIndex: number) => void;
  onExploreNext?: (currentCityId: string) => void;
  routeItems?: CityRouteListItem[];
  completedRouteIndices?: number[];
  openRouteCount?: number;
}

export default function CityRoutesView({ city, onBack, onRouteClick, onExploreNext, routeItems, completedRouteIndices, openRouteCount }: CityRoutesViewProps) {
  const [showLitModal, setShowLitModal] = useState(false);
  const [showOverview, setShowOverview] = useState(false);
  const [routeSelection, setRouteSelection] = useState<{ cityId: string; index: number } | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isLightingUp, setIsLightingUp] = useState(false);
  const completedIndices = completedRouteIndices ?? city.completedRouteIndices ?? [];
  const routes = Array.from({ length: routeItems?.length ?? Math.max(city.routes, 3) }, (_, i) => {
    const routeId = i + 1;
    const data = routeItems?.[i] ?? getRouteData(city.id, routeId);
    const isCompleted = routeItems?.[i]?.isCompleted ?? completedIndices.includes(routeId);
    const isUnlocked = routeItems?.[i]?.isUnlocked ?? (
      isCompleted || (Array.from({ length: i }, (_, index) => index + 1).every(index => completedIndices.includes(index))
        && (openRouteCount === undefined || routeId <= openRouteCount))
    );
    return { routeId, data, isCompleted, isUnlocked };
  });
  const totalDistance = routes.reduce((sum, route) => sum + (Number.parseFloat(route.data.distance) || 0), 0);
  const routeCardIndex = routeSelection?.cityId === city.id ? routeSelection.index : getInitialRouteIndex(routes);

  useEffect(() => {
    setShowOverview(false);
    if (city.justLit) {
      setIsCardFlipped(false);
      setShowLitModal(true);
    }
  }, [city.id, city.justLit]);

  if (showOverview) {
    return (
      <CityRouteOverviewView
        city={city}
        routeItems={routeItems}
        onBack={() => setShowOverview(false)}
      />
    );
  }

  const handleCloseLitModal = () => {
    setShowLitModal(false);
    city.justLit = false;
    if (onExploreNext) {
      onExploreNext(city.id);
    } else {
      onBack();
    }
  };



  return (
    <div className={styles.page} role="main" id="main-content">
      <header className={styles.hero}>
        <CityImage src={city.image} alt="" fallbackLabel={city.name} className={styles.heroImage} loading="eager" fetchPriority="high" />
        <div className={styles.heroShade} />
        <div className={styles.toolbar}>
          <button type="button" onClick={onBack} className={styles.back} aria-label="返回城市"><ChevronLeft size={22} /></button>
          <svg className={styles.journeyIcon} viewBox="0 0 28 28" role="img" aria-label="城市旅程">
            <rect x="3" y="11" width="5" height="15" rx="1" fill="currentColor" />
            <rect x="11.5" y="3" width="5" height="23" rx="1" fill="currentColor" />
            <rect x="20" y="16" width="5" height="10" rx="1" fill="currentColor" />
          </svg>
        </div>
        <div className={styles.heroContent}>
          <p className={styles.englishName}>{city.englishName || 'CITY'}</p>
          <h1>{city.name}</h1>
          <div className={styles.heroBottom}>
            <p>{routes.length} 条路线<span>·</span>{totalDistance.toFixed(1)} 公里</p>
            <button type="button" onClick={() => setShowOverview(true)} className={styles.overview}>
              <Route size={16} />路线概览<ChevronRight size={16} />
            </button>
          </div>
        </div>
      </header>

      <section className={styles.routeList} aria-labelledby="city-routes-title">
        <div className={styles.listHeading}>
          <h2 id="city-routes-title">选择路线</h2><p>按路线顺序探索</p>
        </div>
        <div key={city.id} className={styles.railContainer}>
        <RouteCardRail initialIndex={routeCardIndex} onSelect={index => setRouteSelection({ cityId: city.id, index })} items={routes.map(({ routeId, data, isCompleted, isUnlocked }) => {
          const category = routeItems?.[routeId - 1]?.category ?? getRouteCategory(city.name, routeId);
          const numSpots = data.spots.split(/—|→/).filter(spot => spot.trim()).length;
          const statusLabel = isCompleted ? '已完成' : isUnlocked ? '已解锁' : '未解锁';
          const durationParts = data.duration.split(':').map(Number);
          const durationLabel = durationParts.length === 2 && durationParts.every(Number.isFinite)
            ? `${durationParts[0]}分${durationParts[1] ? `${durationParts[1]}秒` : '钟'}`
            : data.duration;
          return (
            <button
              type="button"
              key={routeId}
              className={`${styles.routeCard} ${isCompleted ? styles.completedRoute : isUnlocked ? styles.nextRoute : styles.lockedRoute}`}
              onClick={() => onRouteClick(routeId)}
            >
              <span className={styles.thumbnail}>
                <CityImage src={routeItems?.[routeId - 1]?.coverImage || getRouteCover(city.name, routeId)?.src} alt="" fallbackLabel={data.spots.split(/—|→/)[0].trim()} className={styles.routeImage} loading={routeId === 1 ? 'eager' : 'lazy'} />
                <span className={styles.imageShade} />
                <span className={styles.routeIdentity}>
                  <span className={styles.routeNumber}>{String(routeId).padStart(2, '0')}</span>
                  <span className={styles.categoryTag}>{category}</span>
                </span>
                <span className={styles.routeStatus}>
                  {isCompleted ? <Check size={14} /> : isUnlocked ? <LockOpen size={14} /> : <Lock size={14} />}{statusLabel}
                </span>
                <span className={styles.imageMeta}>
                  <RouteRunners compact count={routeItems?.[routeId - 1]?.runnerCount} avatars={routeItems?.[routeId - 1]?.runnerAvatars} />
                  <span className={styles.routeRating} aria-label={`路线评分 ${data.rating} 分`}><Star size={13} fill="currentColor" aria-hidden="true" /><b>{data.rating}</b><span>分</span></span>
                </span>
              </span>
              <span className={styles.routeContent}>
                <strong className={styles.routeTitle}>{data.title}</strong>
                <span className={styles.landmarks}>{data.spots.replace(/—/g, ' → ')}</span>
                <span className={styles.routeMetrics}><b>{data.distance}<small> km</small></b><span><Clock3 size={12} />{durationLabel}</span><span><MapPin size={12} />{numSpots} 景点</span></span>
                <span className={styles.cardAction}>
                  {isCompleted ? <Check size={16} /> : isUnlocked ? <Play size={16} /> : <Lock size={16} />}
                  <span>{isCompleted ? '已完成 · 再跑一次' : isUnlocked ? '开始这条路线' : '未解锁 · 查看详情'}</span>
                  <ChevronRight size={16} />
                </span>
              </span>
            </button>
          );
        })} />
        </div>
        {routes.length === 0 && <div className={styles.empty}><Route size={26} /><h3>路线筹备中</h3><p>这座城市的路线即将开放</p></div>}
      </section>

      {/* City Lit Modal */}
      <AnimatePresence>
        {showLitModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 perspective-[1000px]"
          >
             <motion.div
                initial={{ opacity: 0, y: 50, rotateX: 10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="w-full max-w-sm flex flex-col items-center"
             >
                <div className="w-full text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-widest">{isCardFlipped ? "获得城市卡片" : "城市已点亮！"}</h2>
                  <p className="text-cyan-400 text-sm">{isCardFlipped ? `${city.routes} 枚景点勋章已汇入 · 光迹徽章已点亮` : "点击卡片翻开你的奖励"}</p>
                </div>

                <motion.div 
                   className="relative w-64 h-[360px] [transform-style:preserve-3d] cursor-pointer"
                   whileHover={!isCardFlipped && !isLightingUp ? { scale: 1.05, y: -5 } : {}}
                   animate={{ 
                       rotateY: isCardFlipped ? 180 : (isLightingUp ? [-2, 2, -2, 2, -2, 2, 0] : 0), 
                       scale: isCardFlipped ? 1 : (isLightingUp ? 0.95 : 1)
                   }}
                   transition={{ 
                       rotateY: isCardFlipped ? { type: "spring", stiffness: 50, damping: 15 } : { duration: 0.4 },
                       scale: { duration: 0.3 }
                   }}
                   onClick={() => {
                     if (isCardFlipped || isLightingUp) return;
                     setIsLightingUp(true);
                     setTimeout(() => {
                       setIsCardFlipped(true);
                       setTimeout(() => setIsLightingUp(false), 800);
                     }, 600);
                   }}
                >
                   {/* Light burst effects inside */}
                   <AnimatePresence>
                     {isLightingUp && !isCardFlipped && (
                       <motion.div
                         initial={{ opacity: 0, scale: 0.8 }}
                         animate={{ opacity: [0, 0.8, 0.4, 1], scale: 1.2 }}
                         exit={{ opacity: 0 }}
                         transition={{ duration: 0.6 }}
                         className="absolute inset-0 bg-cyan-400/50 mix-blend-screen blur-[30px] rounded-2xl z-0 pointer-events-none"
                       />
                     )}
                     {isCardFlipped && (
                       <motion.div
                         initial={{ opacity: 1, scale: 1 }}
                         animate={{ opacity: 0, scale: 2.5 }}
                         transition={{ duration: 1, ease: "easeOut" }}
                         className="absolute inset-0 bg-white mix-blend-overlay blur-[40px] rounded-2xl z-50 pointer-events-none"
                       />
                     )}
                   </AnimatePresence>

                   {/* Card Back */}
                   <div className="absolute inset-0 [backface-visibility:hidden] bg-slate-800 border-[3px] border-white/10 hover:border-white/20 rounded-2xl shadow-2xl flex flex-col items-center justify-center transition-colors">
                     <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 rounded-2xl pointer-events-none"></div>
                     <div className="w-20 h-20 bg-slate-700/50 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] relative overflow-hidden transition-shadow pointer-events-none">
                       <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent animate-pulse" />
                       <Globe2 size={40} className="text-slate-400 relative z-10" />
                     </div>
                     <p className="text-slate-400 text-xs font-mono mb-2 tracking-[0.2em] relative z-10 font-medium pointer-events-none">点击揭晓</p>
                     <motion.div 
                        animate={{ y: [0, -6, 0] }} 
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                        className="text-white/40 text-3xl mt-4 relative z-10 pointer-events-none"
                     >
                        👆
                     </motion.div>
                     
                     {/* Inner active border glow when charging */}
                     {isLightingUp && !isCardFlipped && (
                       <div className="absolute inset-0 border-4 border-cyan-400/60 shadow-[inset_0_0_30px_rgba(34,211,238,0.5)] rounded-2xl pointer-events-none"></div>
                     )}
                   </div>

                   {/* Card Front */}
                   <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-2xl shadow-[0_0_50px_rgba(34,211,238,0.4)] overflow-hidden bg-slate-900 border-2 border-cyan-400/40 flex flex-col">
                       <div className="h-[55%] relative pointer-events-none">
                         <CityImage src={city.image} alt={city.name} fallbackLabel={city.name} className="absolute inset-0 w-full h-full object-cover" />
                         <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
                         
                         <motion.div 
                           initial={{ x: '-100%', opacity: 0 }}
                           animate={isCardFlipped ? { x: '200%', opacity: [0, 1, 0] } : {}}
                           transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                           className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                         />
                       </div>
                       <div className="flex-1 px-5 pb-5 pt-4 flex flex-col items-center justify-center text-center -mt-6 relative z-10 pointer-events-none">
                          <h3 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-200 mb-1 drop-shadow-[0_2px_10px_rgba(34,211,238,0.5)]">{city.name}</h3>
                          <div className="text-[10px] text-cyan-400/80 font-mono tracking-[0.2em] uppercase mb-3">{city.englishName}</div>
                          <div className="flex items-center justify-center gap-2 mb-3" aria-label={`${city.routes} 枚景点成就勋章`}>
                            {Array.from({ length: city.routes }, (_, index) => (
                              <div key={index} className="relative flex h-9 w-9 items-center justify-center rounded-full border-2 border-amber-200/55 bg-slate-900/85 text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.16)]">
                                <span className="absolute inset-1 rounded-full border border-amber-100/20" />
                                <Award size={15} className="relative" />
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-[10px] rounded-full tracking-wider font-semibold shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                            <Sparkles size={12} />
                            光迹徽章 · 全城点亮
                          </div>
                       </div>
                       
                       {/* Floating particles on front */}
                       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 pointer-events-none mix-blend-screen"></div>
                   </div>
                </motion.div>

                <AnimatePresence>
                  {isCardFlipped && (
                    <motion.button 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      onClick={handleCloseLitModal}
                      className="mt-10 px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(34,211,238,0.3)] active:scale-95"
                    >
                      继续探索世界
                    </motion.button>
                  )}
                </AnimatePresence>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
