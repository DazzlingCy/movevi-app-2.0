import { useMemo, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  Check,
  ChevronLeft,
  Download,
  FileText,
  Flame,
  Images,
  MapPin,
  MessageCircle,
  Route,
  Share2,
  Timer,
  Trophy,
  X
} from 'lucide-react';
import type { CityData } from '../data/cities';
import { getRouteData } from '../data/cities';
import CityImage from './CityImage';
import type { CityRouteListItem } from './CityRoutesView';

interface CityRouteOverviewViewProps {
  city: CityData;
  routeItems?: CityRouteListItem[];
  onBack: () => void;
}

type OverviewRoute = CityRouteListItem & {
  order: number;
  completed: boolean;
  unlocked: boolean;
  spotNames: string[];
  distanceKm: number;
  durationMinutes: number;
};

const durationToMinutes = (duration: string) => {
  const [minutes = 0, seconds = 0] = duration.split(':').map(Number);
  return minutes + seconds / 60;
};

const formatMinutes = (minutes: number) => {
  const rounded = Math.round(minutes);
  if (rounded < 60) return `${rounded}分钟`;
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  return rest ? `${hours}小时${rest}分` : `${hours}小时`;
};

const formatDurationMetric = (minutes: number) => {
  const rounded = Math.round(minutes);
  if (rounded < 60) return { value: `${rounded}`, unit: '分钟' };
  const hours = Math.floor(rounded / 60);
  const rest = rounded % 60;
  return { value: `${hours}`, unit: rest ? `小时${rest}分` : '小时' };
};

export default function CityRouteOverviewView({
  city,
  routeItems,
  onBack
}: CityRouteOverviewViewProps) {
  const [showReport, setShowReport] = useState(false);
  const overview = useMemo(() => {
    const routes: OverviewRoute[] = Array.from({ length: routeItems?.length ?? Math.max(city.routes, 3) }, (_, index) => {
      const order = index + 1;
      const item: CityRouteListItem = routeItems?.[index] ?? getRouteData(city.id, order);
      return {
        ...item,
        order,
        completed: Boolean(item.isCompleted),
        unlocked: item.isUnlocked ?? order === 1,
        spotNames: item.spots.split(/\s*[—–]\s*/).filter(Boolean),
        distanceKm: Number.parseFloat(item.distance) || 0,
        durationMinutes: durationToMinutes(item.duration)
      };
    });

    const uniqueSpots = new Set(routes.flatMap(route => route.spotNames));
    const completedCount = routes.filter(route => route.completed).length;
    const currentRoute = routes.find(route => !route.completed && route.unlocked)
      ?? routes.find(route => !route.completed)
      ?? null;
    const totals = routes.reduce((sum, route) => ({
      distance: sum.distance + route.distanceKm,
      duration: sum.duration + route.durationMinutes,
      calories: sum.calories + (Number.parseFloat(route.calories) || 0),
    }), { distance: 0, duration: 0, calories: 0 });

    return {
      routes,
      completedCount,
      currentRoute,
      uniqueSpotCount: uniqueSpots.size,
      totals
    };
  }, [city, routeItems]);
  const totalDurationMetric = formatDurationMetric(overview.totals.duration);
  const cityCompleted = overview.routes.length > 0 && overview.completedCount === overview.routes.length;

  if (showReport && cityCompleted) {
    return <CityReportView city={city} overview={overview} onBack={() => setShowReport(false)} />;
  }

  return (
    <main className="h-full w-full overflow-y-auto bg-[#f2f4f7] text-slate-900 hide-scrollbar" id="main-content">
      <header className="relative min-h-[272px] overflow-hidden bg-slate-950 text-white">
        <CityImage src={city.image} alt="" fallbackLabel={city.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,8,13,.36),rgba(5,8,13,.48)_40%,rgba(5,8,13,.94))]" />
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-[max(16px,env(safe-area-inset-top))]">
          <button
            type="button"
            onClick={onBack}
            aria-label="返回城市路线列表"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronLeft size={26} />
          </button>
          <span className="rounded-full border border-white/15 bg-black/25 px-3 py-2 text-[11px] font-semibold tracking-[.08em] text-white/80 backdrop-blur-md">{city.name} · {overview.routes.length} 段</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-11">
          <span className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-orange-200"><Route size={14} /> 路线概览</span>
          <p className="mt-3 max-w-[330px] text-[12px] leading-5 text-white/72">先了解城市路线、沿途景点与运动强度。路线将依次解锁，陪你逐步跑遍整座城市。</p>
        </div>
      </header>

      <div className="relative z-20 -mt-7 space-y-4 px-4 pb-12">
        <section className="rounded-[24px] border border-white bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,.10)]" aria-label="城市路线计划概览">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-[24px] font-black tracking-[-.04em]">{city.name}路线概览</h1>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-orange-50 text-orange-500"><Route size={19} /></span>
          </div>
          <div className="mt-4 grid grid-cols-4 divide-x divide-slate-100">
            <OverviewMetric label="路线" value={`${overview.routes.length}`} unit="条" />
            <OverviewMetric label="景点" value={`${overview.uniqueSpotCount}`} unit="处" />
            <OverviewMetric label="里程" value={overview.totals.distance.toFixed(1)} unit="km" />
            <OverviewMetric label="时长" value={totalDurationMetric.value} unit={totalDurationMetric.unit} />
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3" aria-label={`当前已完成 ${overview.completedCount} / ${overview.routes.length} 段路线`}>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-semibold text-slate-500">当前进度 <strong className="ml-1 text-[12px] font-black text-slate-800">{overview.completedCount}/{overview.routes.length}</strong></span>
              <span className="min-w-0 truncate text-right text-[9px] font-semibold text-orange-600">{overview.currentRoute ? `下一段 · ${String(overview.currentRoute.order).padStart(2, '0')} ${overview.currentRoute.title}` : '城市路线已全部完成'}</span>
            </div>
            <div className="mt-2 grid grid-cols-10 gap-1" role="progressbar" aria-label="城市路线完成进度" aria-valuemin={0} aria-valuemax={overview.routes.length} aria-valuenow={overview.completedCount}>
              {overview.routes.map(route => {
                const current = overview.currentRoute?.order === route.order;
                return <i key={route.order} className={`h-1.5 rounded-full ${route.completed ? 'bg-emerald-400' : current ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,.38)]' : 'bg-slate-200'}`} />;
              })}
            </div>
          </div>
        </section>

        <section className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,.06)]" aria-labelledby="route-map-title">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold tracking-[.12em] text-orange-500">路线明细</span>
              <h2 id="route-map-title" className="mt-1 text-xl font-black tracking-[-.03em]">每一段跑多远，经过哪里</h2>
            </div>
            <span className="mt-1 shrink-0 rounded-full bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold text-slate-500">全程 {overview.routes.length} 段</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2" aria-label="路线状态说明">
            <RouteLegend color="bg-emerald-400" label="已完成" />
            <RouteLegend color="bg-orange-500" label="下一段" />
            <RouteLegend color="bg-slate-300" label="待解锁" />
          </div>
          <ol className="mt-4 space-y-1">
            {overview.routes.map((route, index) => {
              const current = overview.currentRoute?.order === route.order;
              return (
                <li key={route.order} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2.5">
                  <div className="relative flex justify-center pt-3">
                    {index < overview.routes.length - 1 && <span className={`absolute bottom-[-8px] top-8 w-px ${route.completed ? 'bg-emerald-200' : 'bg-slate-200'}`} aria-hidden="true" />}
                    <span className={`relative z-10 grid h-6 w-6 place-items-center rounded-full text-[9px] font-black tabular-nums ${route.completed ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' : current ? 'bg-orange-500 text-white shadow-[0_4px_12px_rgba(249,115,22,.28)]' : 'bg-white text-slate-400 ring-1 ring-slate-200'}`}>
                      {route.completed ? <Check size={12} strokeWidth={3} /> : String(route.order).padStart(2, '0')}
                    </span>
                  </div>
                  <article className={`min-w-0 rounded-2xl border px-3 py-3 transition-colors ${current ? 'border-orange-200 bg-[linear-gradient(135deg,#fff7ed,#fffaf6)]' : route.completed ? 'border-transparent bg-white' : 'border-slate-100 bg-slate-50/70'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <h3 className={`min-w-0 truncate text-[13px] font-black ${current ? 'text-slate-900' : route.completed ? 'text-slate-600' : 'text-slate-700'}`}>{route.title}</h3>
                          {current && <span className="shrink-0 rounded-full bg-orange-100 px-2 py-0.5 text-[8px] font-black text-orange-600">下一段</span>}
                        </div>
                        <span className="mt-1.5 block truncate text-[10px] text-slate-400">{route.spotNames.join(' → ')}</span>
                      </div>
                      <div className="shrink-0 text-right">
                        <strong className="block text-[10px] font-black text-slate-600">{route.distanceKm.toFixed(1)} km</strong>
                        <span className="mt-1.5 block text-[9px] text-slate-400">{formatMinutes(route.durationMinutes)}</span>
                      </div>
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </section>

        <button type="button" onClick={cityCompleted ? () => setShowReport(true) : onBack} className={`flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-black text-white transition active:scale-[.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${cityCompleted ? 'bg-[linear-gradient(135deg,#10b981,#059669)] shadow-[0_12px_28px_rgba(5,150,105,.24)] focus-visible:ring-emerald-500' : 'bg-[linear-gradient(135deg,#ff7b50,#ff5b2d)] shadow-[0_12px_28px_rgba(255,91,45,.25)] focus-visible:ring-orange-500'}`}>
          {cityCompleted ? <><FileText size={17} /> 查看城市报告</> : <>了解完成，继续运动 <ArrowRight size={17} /></>}
        </button>
      </div>
    </main>
  );
}

type CityReportOverview = {
  routes: OverviewRoute[];
  completedCount: number;
  uniqueSpotCount: number;
  totals: { distance: number; duration: number; calories: number };
};

const drawRoundedRect = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
};

const createCityReportPoster = (city: CityData, overview: CityReportOverview) => new Promise<File>((resolve, reject) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1440;
  const context = canvas.getContext('2d');
  if (!context) {
    reject(new Error('无法生成城市报告'));
    return;
  }

  const duration = formatDurationMetric(overview.totals.duration);
  const gradient = context.createLinearGradient(0, 0, 1080, 1440);
  gradient.addColorStop(0, '#071713');
  gradient.addColorStop(0.58, '#0d2d24');
  gradient.addColorStop(1, '#0a1714');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 1080, 1440);

  context.globalAlpha = 0.18;
  context.strokeStyle = '#6ee7b7';
  context.lineWidth = 2;
  for (let radius = 140; radius <= 560; radius += 105) {
    context.beginPath();
    context.arc(950, 120, radius, 0, Math.PI * 2);
    context.stroke();
  }
  context.globalAlpha = 1;

  context.fillStyle = '#6ee7b7';
  context.font = '700 30px "Microsoft YaHei", sans-serif';
  context.fillText('MOVEVI 城市完赛报告', 80, 100);
  context.fillStyle = '#ffffff';
  context.font = '900 86px "Microsoft YaHei", sans-serif';
  context.fillText('我跑遍了', 80, 245);
  context.font = '900 150px "Microsoft YaHei", sans-serif';
  context.fillText(city.name, 76, 410);
  context.fillStyle = 'rgba(255,255,255,.62)';
  context.font = '500 30px "Microsoft YaHei", sans-serif';
  context.fillText('每一步都有风景，每一段都是城市记忆。', 82, 472);

  drawRoundedRect(context, 70, 550, 940, 490, 48);
  context.fillStyle = '#f7faf8';
  context.fill();
  context.fillStyle = '#0b1f19';
  context.font = '900 54px "Microsoft YaHei", sans-serif';
  context.fillText('全城路线 · 100% 完成', 120, 640);
  context.fillStyle = '#059669';
  drawRoundedRect(context, 120, 688, 840, 18, 9);
  context.fill();

  const metrics = [
    [`${overview.completedCount}`, '条路线'],
    [overview.totals.distance.toFixed(1), '公里'],
    [`${duration.value}${duration.unit}`, '运动时长'],
    [`${Math.round(overview.totals.calories)}`, '千卡消耗']
  ];
  metrics.forEach(([value, label], index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 120 + column * 435;
    const y = 800 + row * 125;
    context.fillStyle = '#0b1f19';
    context.font = '900 48px "Microsoft YaHei", sans-serif';
    context.fillText(value, x, y);
    context.fillStyle = '#718078';
    context.font = '600 24px "Microsoft YaHei", sans-serif';
    context.fillText(label, x, y + 38);
  });

  context.fillStyle = '#6ee7b7';
  context.font = '700 26px "Microsoft YaHei", sans-serif';
  context.fillText(`途经 ${overview.uniqueSpotCount} 处景点`, 82, 1155);
  context.fillStyle = '#ffffff';
  context.font = '900 58px "Microsoft YaHei", sans-serif';
  context.fillText('下一座城市，继续跑。', 80, 1235);
  context.fillStyle = 'rgba(255,255,255,.48)';
  context.font = '500 24px "Microsoft YaHei", sans-serif';
  context.fillText('我的环球旅程 · MOVEVI', 82, 1335);

  canvas.toBlob(blob => {
    if (!blob) {
      reject(new Error('无法生成城市报告'));
      return;
    }
    resolve(new File([blob], `${city.name}-城市完赛报告.png`, { type: 'image/png' }));
  }, 'image/png', 0.95);
});

function CityReportView({ city, overview, onBack }: { city: CityData; overview: CityReportOverview; onBack: () => void }) {
  const longestRoute = overview.routes.reduce((longest, route) => route.distanceKm > longest.distanceKm ? route : longest, overview.routes[0]);
  const duration = formatDurationMetric(overview.totals.duration);
  const [shareNotice, setShareNotice] = useState('');
  const [sharing, setSharing] = useState<'wechat' | 'save' | 'moments' | null>(null);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterUrl, setPosterUrl] = useState('');
  const [shareSheetOpen, setShareSheetOpen] = useState(false);
  const [posterGenerating, setPosterGenerating] = useState(false);

  const downloadPoster = (file: File) => {
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = file.name;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleShare = async (target: 'wechat' | 'save' | 'moments') => {
    if (sharing) return;
    setSharing(target);
    setShareNotice('');
    try {
      if (!posterFile) return;
      const poster = posterFile;
      if (target === 'wechat' && navigator.share && navigator.canShare?.({ files: [poster] })) {
        await navigator.share({ title: `${city.name}城市完赛报告`, text: `我已跑完${city.name}全部路线`, files: [poster] });
        setShareNotice('已打开系统分享，可选择微信好友');
      } else {
        downloadPoster(poster);
        setShareNotice(target === 'moments' ? '海报已保存，打开朋友圈选择图片即可发布' : target === 'wechat' ? '海报已保存，可发送给微信好友' : '城市完赛海报已保存到本地');
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setShareNotice('生成海报失败，请稍后重试');
    } finally {
      setSharing(null);
    }
  };

  const openShareSheet = async () => {
    setShareSheetOpen(true);
    setPosterGenerating(true);
    setShareNotice('');
    try {
      const poster = await createCityReportPoster(city, overview);
      if (posterUrl) URL.revokeObjectURL(posterUrl);
      setPosterFile(poster);
      setPosterUrl(URL.createObjectURL(poster));
    } catch {
      setShareNotice('分享图片生成失败，请稍后重试');
    } finally {
      setPosterGenerating(false);
    }
  };

  const closeShareSheet = () => {
    if (posterUrl) URL.revokeObjectURL(posterUrl);
    setPosterUrl('');
    setPosterFile(null);
    setShareNotice('');
    setShareSheetOpen(false);
  };

  return (
    <main className="h-full w-full overflow-y-auto bg-[#edf3f0] text-slate-900 hide-scrollbar" id="main-content">
      <header className="relative min-h-[320px] overflow-hidden bg-emerald-950 text-white">
        <CityImage src={city.image} alt="" fallbackLabel={city.name} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,20,16,.34),rgba(2,20,16,.52)_42%,rgba(2,20,16,.96))]" />
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-[max(16px,env(safe-area-inset-top))]">
          <button type="button" onClick={onBack} aria-label="返回路线概览" className="grid h-11 w-11 place-items-center rounded-full border border-white/20 bg-black/25 text-white backdrop-blur-md transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
            <ChevronLeft size={26} />
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/20 bg-emerald-950/35 px-3 py-2 text-[10px] font-bold text-emerald-100 backdrop-blur-md"><Check size={13} /> 全城完成</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 px-5 pb-12">
          <span className="mb-2 flex items-center gap-1.5 text-xs font-bold text-emerald-300"><Trophy size={15} /> 城市报告</span>
          <h1 className="text-[34px] font-black leading-none tracking-[-.045em]">我跑遍了{city.name}</h1>
          <p className="mt-3 text-[12px] leading-5 text-white/72">每一段路线都已留下足迹，这座城市已被你完整跑遍。</p>
        </div>
      </header>

      <div className="relative z-20 -mt-7 space-y-4 px-4 pb-32">
        <section className="rounded-[24px] border border-white bg-white p-4 shadow-[0_14px_40px_rgba(15,23,42,.10)]" aria-label={`${city.name}城市完成报告`}>
          <div className="flex items-center justify-between gap-3">
            <div><span className="text-[10px] font-bold tracking-[.12em] text-emerald-600">城市完成度</span><h2 className="mt-1 text-2xl font-black tracking-[-.04em]">100%</h2></div>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"><Trophy size={23} /></span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label="城市完成度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={100}><span className="block h-full w-full rounded-full bg-[linear-gradient(90deg,#34d399,#059669)]" /></div>
          <div className="mt-5 grid grid-cols-4 divide-x divide-slate-100">
            <OverviewMetric label="路线" value={`${overview.completedCount}`} unit="条" />
            <OverviewMetric label="景点" value={`${overview.uniqueSpotCount}`} unit="处" />
            <OverviewMetric label="里程" value={overview.totals.distance.toFixed(1)} unit="km" />
            <OverviewMetric label="时长" value={duration.value} unit={duration.unit} />
          </div>
        </section>

        <section className="rounded-[24px] bg-[#0d1714] p-4 text-white shadow-[0_12px_32px_rgba(4,24,18,.16)]" aria-labelledby="report-highlights-title">
          <span className="text-[10px] font-bold tracking-[.12em] text-emerald-300">旅程亮点</span>
          <h2 id="report-highlights-title" className="mt-1 text-xl font-black tracking-[-.03em]">你跑过的城市足迹</h2>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <ReportHighlight icon={<Route size={16} />} label="最长路线" value={longestRoute.title} detail={`${longestRoute.distanceKm.toFixed(1)} km`} />
            <ReportHighlight icon={<MapPin size={16} />} label="途经景点" value={`${overview.uniqueSpotCount} 处`} detail="城市记忆已收集" />
            <ReportHighlight icon={<Flame size={16} />} label="累计消耗" value={`${Math.round(overview.totals.calories)}`} detail="千卡" />
            <ReportHighlight icon={<Timer size={16} />} label="累计运动" value={`${duration.value}${duration.unit}`} detail="完成全部路线" />
          </div>
        </section>

      </div>

      <div className="fixed bottom-0 left-1/2 z-[90] w-full max-w-[430px] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(237,243,240,0),rgba(237,243,240,.96)_34%,#edf3f0)] px-4 pt-8" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <button type="button" onClick={openShareSheet} className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#10b981,#047857)] px-5 text-sm font-black !text-white shadow-[0_12px_28px_rgba(5,150,105,.30)] transition active:scale-[.985] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2">
          <Share2 size={18} /> 分享城市报告
        </button>
      </div>

      {shareSheetOpen && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/70 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="share-sheet-title">
          <button type="button" className="absolute inset-0" onClick={closeShareSheet} aria-label="关闭分享面板" />
          <section className="relative z-10 w-full max-w-[430px] rounded-t-[28px] bg-white px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-4 shadow-[0_-18px_50px_rgba(2,20,16,.24)]">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />
            <div className="flex items-start justify-between gap-4">
              <div><span className="text-[10px] font-bold tracking-[.12em] text-emerald-600">分享完赛时刻</span><h2 id="share-sheet-title" className="mt-1 text-xl font-black tracking-[-.03em]">选择分享渠道</h2></div>
              <button type="button" onClick={closeShareSheet} aria-label="关闭" className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-500"><X size={18} /></button>
            </div>
            <div className="mt-4 flex min-h-32 items-center gap-3 rounded-2xl bg-[#f2f7f4] p-3">
              {posterUrl ? <img src={posterUrl} alt={`${city.name}城市完赛报告预览`} className="h-28 w-20 shrink-0 rounded-xl object-cover shadow-md" /> : <div className="grid h-28 w-20 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-600"><span className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" aria-hidden="true" /></div>}
              <div className="min-w-0"><strong className="block text-sm font-black text-slate-800">我跑遍了{city.name}</strong><p className="mt-1 text-[10px] leading-4 text-slate-500">{posterGenerating ? '正在生成专属分享图片…' : '分享图片已生成，可直接分享或保存到手机。'}</p><span className="mt-2 inline-flex rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-bold text-emerald-700">PNG 长图</span></div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <ShareAction icon={<MessageCircle size={18} />} label="微信好友" active={sharing === 'wechat'} disabled={!posterFile} tone="emerald" onClick={() => handleShare('wechat')} />
              <ShareAction icon={<Download size={18} />} label="保存本地" active={sharing === 'save'} disabled={!posterFile} tone="dark" onClick={() => handleShare('save')} />
              <ShareAction icon={<Images size={18} />} label="朋友圈" active={sharing === 'moments'} disabled={!posterFile} tone="warm" onClick={() => handleShare('moments')} />
            </div>
            {shareNotice && <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5 text-center text-[10px] font-semibold text-slate-600" role="status">{shareNotice}</p>}
          </section>
        </div>
      )}
    </main>
  );
}

function ShareAction({ icon, label, active, disabled = false, tone, onClick }: { icon: ReactNode; label: string; active: boolean; disabled?: boolean; tone: 'emerald' | 'dark' | 'warm'; onClick: () => void }) {
  const toneClass = tone === 'emerald'
    ? 'bg-emerald-500 !text-white shadow-[0_7px_16px_rgba(16,185,129,.18)]'
    : tone === 'warm'
      ? 'bg-orange-50 !text-orange-700 ring-1 ring-orange-100'
      : 'bg-slate-900 !text-white shadow-[0_7px_16px_rgba(15,23,42,.14)]';
  return (
    <button type="button" onClick={onClick} disabled={active || disabled} className={`flex min-h-[70px] flex-col items-center justify-center gap-2 rounded-2xl px-2 text-[10px] font-bold transition active:scale-[.97] disabled:opacity-55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${toneClass}`}>
      {icon}
      <span>{active ? '生成中…' : label}</span>
    </button>
  );
}

function ReportHighlight({ icon, label, value, detail }: { icon: ReactNode; label: string; value: string; detail: string }) {
  return (
    <div className="min-w-0 rounded-2xl border border-white/8 bg-white/[.045] p-3">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">{icon}</span>
      <span className="mt-3 block text-[9px] font-medium text-white/45">{label}</span>
      <strong className="mt-1 block truncate text-[13px] font-black text-white">{value}</strong>
      <small className="mt-1 block truncate text-[9px] text-white/38">{detail}</small>
    </div>
  );
}

function RouteLegend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2.5 py-1.5 text-[9px] font-semibold text-slate-500">
      <i className={`h-1.5 w-1.5 rounded-full ${color}`} aria-hidden="true" />
      {label}
    </span>
  );
}

function OverviewMetric({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="min-w-0 px-2 text-center first:pl-0 last:pr-0">
      <strong className="block truncate text-lg font-black text-slate-800">{value}{unit && <small className="ml-0.5 text-[9px] font-bold text-slate-400">{unit}</small>}</strong>
      <span className="mt-1 block text-[9px] font-medium text-slate-400">{label}</span>
    </div>
  );
}
