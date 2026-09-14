import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Award, ChevronLeft, Clock3, Flame, MapPin, Pause, Play, Route, Square, Wifi, Zap } from 'lucide-react';
import { CITIES, getRouteData } from '../data/cities';
import CityImage from './CityImage';
import type { CityRouteListItem } from './CityRoutesView';

const MEDALS = [
  { id: 'm1', name: '首航·星际启程', color: 'from-amber-400 via-amber-200 to-yellow-600', text: '🏯' },
  { id: 'm2', name: '江潮·古道点亮', color: 'from-emerald-400 via-teal-200 to-cyan-600', text: '⛩️' },
  { id: 'm3', name: '中轴·紫禁之巅', color: 'from-rose-500 via-orange-300 to-red-700', text: '🏰' },
  { id: 'm4', name: '星火·光能复苏', color: 'from-sky-400 via-indigo-200 to-purple-600', text: '🗼' },
  { id: 'm5', name: '超越·时空引力', color: 'from-fuchsia-500 via-pink-300 to-purple-700', text: '🛸' },
  { id: 'm6', name: '不朽·地球倒影', color: 'from-cyan-400 via-blue-200 to-teal-600', text: '🌍' },
];

const getCityStoryText = (cityName: string, routeIndex: number) => {
  const stories: Record<string, string[]> = {
    '北京': [
      '微光越过积雪的太和殿，你奔跑时泛出的青色轨迹，将故宫角楼与明清轴线的古老能量重新点亮。',
      '那是昆明湖畔清晨最温柔的风。泛起的波纹成了量子引擎的脉搏，用步履重组沉睡千年的星云轨道。',
      '什刹海结冰的湖面闪过赛博彩霓，光迹引擎完美耦合。一幅关于京华烟云的画卷在星轨重新亮起。'
    ],
    '杭州': [
      '西湖断桥在重力波的作用下泛起星光微澜。脚步下的荧光波纹层层叠叠，将雷峰古塔的共振带回母星。',
      '钱塘江潮水澎湃，数字晶格正吸收着你带来的奔跑能谱。江南忆，最忆是今朝，脚步终将重连蔚蓝。',
      '轻舟漫步苏堤，你的跑姿引力场点亮了沉睡千载的柳梢。这是数字极光在绿洲表层完成的全息重设。'
    ],
    '上海': [
      '外滩万国建筑的风华线条被你连成闪烁冷黄流线，陆家嘴三合高塔的引力锚随之朝宇宙发射璀璨华彩。',
      '黄浦江的复古霓虹折射在虚拟视窗中，穿越石库门的微风成了你在太空跑步机上最澎湃的呼气共鸣。',
      '当光轨跨越徐家汇，魔都数字脑中枢发出雀跃回响。在星河深处，我们已再次读出了申城的温度。'
    ],
    '西安': [
      '古城墙顶端长明灯重新燃起，每一次步伐与青砖的碰撞都将太白积雪的微光能灌入数字能量塔中。',
      '大雁塔檐角悬挂的量子风铃在这中轴重燃的瞬间，演奏出穿越两千年的大唐雅乐，余音响彻太虚。',
      '丝路起点的全息通道已完全激活。大明宫的断壁残垣瞬间被温润的纳米极光重构，大唐不夜城再度现世。'
    ],
    '东京': [
      '涩谷十字路口上空开始飞散樱花瓣的数码极光。极速的奔跑让红色铁塔迸发出划破重度雾霾的通天火芒。',
      '神乐坂的石板路泛起赛博紫潮，电子风车在光流中盘旋。远古神社与现代合金森林在这里达成了完美交融。',
      '秋叶原的电流幕墙随你的心率亮起五彩电光，你的脚步在虚拟沥青地面踩踏出上世纪遗失的黄金底色。'
    ],
    '巴黎': [
      '塞纳河畔升起一道淡金色的引力断桥。埃菲尔铁塔的发射器在接收你跑步能量后，向全星系播撒法式浪漫。',
      '香榭丽舍那璀璨不灭的诗篇再次被脚步唤醒。卢浮宫玻璃金字塔重新泛起晶莹折射，守护着神圣的文明核心。',
      '凯旋门在星海的粼粼折射中完全醒来。塞纳河的水在量子极光伴奏下，重组出属于浪漫艺术的最强交响。'
    ],
    '伦敦': [
      '大本钟深沉的铜盘在这宏大的重燃交织里，发出悠长的低电频共振，宣告雾都夜晚重新回归星系网络。',
      '泰晤士河潮汐随步伐在屏幕上画出正弦波，西区歌剧院的机械管风琴自动合奏，伦敦塔下的引力锁悄然松开。',
      '伦敦塔桥的重型摆臂在能量网络饱充下平缓地开启。这一刻，沉浮半生的星际水湾终于见识了日不落的朝阳。'
    ],
    '纽约': [
      '曼哈顿摩天幕墙闪烁着瑰丽多姿的全息海报。中央公园的赛博银杏在脚落之处开枝散叶，黄金璀璨。',
      '百老汇霓虹长卷迎着晨跑彻底唤醒。你像是一道光箭刺入这空旷钢骨架构，复苏了这超级服务器的运算核心。',
      '帝国大厦尖端的引力塔彻底接入了你跑步的速度波段，发出一束亮红色的探束，点亮了西半球的太空轨道。'
    ],
    '悉尼': [
      '悉尼歌剧院如一双巨型白贝风帆在星海荧光中缓缓扬帆，达令湾的深蓝粒子因你的奔跑轨迹激荡出灿烂浪花。',
      '海港大桥在极光网络的编织中重获新星级的供能，南十字星的辉光在视网膜映射，南半球港口已全网络通车。'
    ],
    '里约热内卢': [
      '驼背山上的耶稣圣像双臂重新发出千米冷蓝光芒，热情的桑巴鼓点化作你脚边荡漾的霓虹光环，璀璨耀人。',
      '科帕卡巴纳沙滩的极细白沙在你的高频脚频震颤下，化作微小金色飞萤，与大西洋荧光海藻遥相呼应。'
    ],
    '开罗': [
      '吉萨三大金字塔被狂奔扯出的极光缎带团团围绕，守候了三个千年的古陵角点，正以光年速度与宇宙母星校准。',
      '尼罗河沉眠泥沼下的古老能量被探针测出，黄沙之下的圣书体象形文字逐渐浮现出幽绿色的脉冲荧光。'
    ]
  };

  const cityStories = stories[cityName] || [
    '每一次汗水滑落，都是对地球母亲最深情的呼唤。群星静默，而我们在你的奔跑中听到了恒星重燃的心跳。',
    '你不是在奔跑，你是在以不灭的肉体之躯，编织重返蔚蓝星宇的引力丝线。母星的苏醒，正在你脚下成真！'
  ];
  return cityStories[routeIndex % cityStories.length];
};

interface RunPlaybackViewProps {
  cityId: string;
  routeIndex: number;
  image: string;
  cityName?: string;
  routeOverride?: CityRouteListItem;
  onExit: () => void;
  onComplete: (stats: { distance: number; duration: number; calories: number }) => void;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
};

const parsePlannedDuration = (value: string) => {
  const [minutes = 0, seconds = 0] = value.split(':').map(Number);
  return minutes * 60 + seconds;
};

export default function RunPlaybackView({ cityId, routeIndex, image, cityName: cityNameOverride, routeOverride, onExit, onComplete }: RunPlaybackViewProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [distance, setDistance] = useState(0);
  const [time, setTime] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const reduceMotion = useReducedMotion();

  const city = CITIES.find(item => String(item.id) === String(cityId));
  const route = routeOverride ?? getRouteData(cityId, routeIndex);
  const cityName = cityNameOverride ?? city?.name ?? '城市';
  const plannedDistance = Number(route.distance) || 0;
  const plannedDuration = parsePlannedDuration(route.duration);

  useEffect(() => {
    if (!isPlaying || showSummary) return;
    const timer = window.setInterval(() => {
      setTime(value => value + 1);
      setDistance(value => Math.min(plannedDistance, value + 0.003));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isPlaying, plannedDistance, showSummary]);

  const result = useMemo(() => {
    const resultDistance = distance >= 0.05 ? distance : plannedDistance;
    const resultDuration = time >= 20 ? time : plannedDuration;
    return {
      distance: Number(resultDistance.toFixed(2)),
      duration: resultDuration,
      calories: Math.max(1, Math.round(resultDistance * 65))
    };
  }, [distance, plannedDistance, plannedDuration, time]);

  const pace = distance > 0.01
    ? `${Math.floor(time / 60 / distance)}'${String(Math.floor(((time / 60 / distance) % 1) * 60)).padStart(2, '0')}\"`
    : '--';
  const todayDateStr = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '/');

  const finishRun = () => {
    setIsPlaying(false);
    setShowSummary(true);
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#05070A] font-sans text-white" aria-label={`${cityName}${route.title}跑步界面`}>
      <motion.div
        className="absolute inset-0"
        animate={reduceMotion || !isPlaying ? { scale: 1 } : { scale: [1, 1.035, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        <CityImage src={image} alt={`${cityName}路线风景`} fallbackLabel={cityName} className="h-full w-full object-cover opacity-70" />
      </motion.div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,12,.78)_0%,rgba(2,6,12,.12)_36%,rgba(2,6,12,.93)_100%)]" />
      <div className="absolute inset-x-0 top-[39%] h-40 -translate-y-1/2 bg-cyan-300/10 blur-3xl" aria-hidden="true" />

      <header className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pb-5 pt-safet">
        <button onClick={onExit} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/35 backdrop-blur-md active:scale-95" aria-label="返回路线详情">
          <ChevronLeft size={23} />
        </button>
        <div className="min-w-0 flex-1 px-3 text-center">
          <p className="truncate text-sm font-black">{route.title}</p>
          <p className="mt-1 flex items-center justify-center gap-1 text-[10px] font-bold text-cyan-100/70"><MapPin size={11} /> {cityName} · 路线 {routeIndex}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-emerald-200/15 bg-emerald-300/10 text-emerald-200" aria-label="跑步机已连接">
          <Wifi size={18} />
        </div>
      </header>

      <main className="relative z-[1] flex h-full flex-col justify-between px-5 pb-[max(26px,env(safe-area-inset-bottom))] pt-28">
        <section className="flex flex-1 flex-col items-center justify-center pb-12" aria-live="polite">
          <motion.div
            className="relative flex h-64 w-64 items-center justify-center rounded-full border border-cyan-100/15 bg-black/20 backdrop-blur-[2px]"
            animate={reduceMotion || !isPlaying ? undefined : { boxShadow: ['0 0 0 rgba(34,211,238,0)', '0 0 54px rgba(34,211,238,.2)', '0 0 0 rgba(34,211,238,0)'] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            <div className="absolute inset-3 rounded-full border border-dashed border-cyan-100/15" />
            <div className="text-center">
              <p className="font-mono text-[70px] font-black leading-none tracking-[-0.08em] tabular-nums">{distance.toFixed(2)}</p>
              <p className="mt-3 text-[10px] font-black tracking-[0.3em] text-cyan-100/65">公里</p>
            </div>
          </motion.div>
        </section>

        <section className="rounded-[28px] border border-white/12 bg-black/35 p-4 backdrop-blur-xl">
          <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
            <div><Clock3 size={15} className="mx-auto text-cyan-200" /><b className="mt-2 block font-mono text-xl tabular-nums">{formatTime(time)}</b><span className="text-[10px] text-slate-400">时间</span></div>
            <div><Route size={15} className="mx-auto text-cyan-200" /><b className="mt-2 block font-mono text-xl tabular-nums">{pace}</b><span className="text-[10px] text-slate-400">配速</span></div>
            <div><Flame size={15} className="mx-auto text-cyan-200" /><b className="mt-2 block font-mono text-xl tabular-nums">{Math.round(distance * 65)}</b><span className="text-[10px] text-slate-400">千卡</span></div>
          </div>

          <div className="mt-5 grid grid-cols-[1fr_2fr] gap-3">
            <button onClick={finishRun} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.06] text-sm font-black text-slate-200 active:scale-[.98]">
              <Square size={15} className="fill-rose-400 text-rose-400" /> 结束
            </button>
            <button onClick={() => setIsPlaying(value => !value)} className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#2ecc71] text-base font-black text-[#042012] shadow-[0_12px_35px_rgba(46,204,113,.26)] active:scale-[.98]">
              {isPlaying ? <Pause size={20} className="fill-current" /> : <Play size={20} className="fill-current" />}
              {isPlaying ? '暂停跑步' : '继续跑步'}
            </button>
          </div>
        </section>
      </main>

      <AnimatePresence>
        {showSummary && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-[#05070a]/95 p-6 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="mb-6 text-center"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduceMotion ? 0 : 0.1 }}
            >
              <div className="mb-1.5 flex items-center justify-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 motion-safe:animate-ping" />
                <span className="font-mono text-xs font-bold tracking-[0.25em] text-cyan-400">路线已唤醒</span>
              </div>
              <h2 id="run-summary-title" className="flex items-center justify-center gap-2 text-2xl font-black tracking-[0.15em] text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                <Zap size={22} className="fill-cyan-400/20 text-cyan-400" />
                路线已唤醒
              </h2>
            </motion.div>

            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="run-summary-title"
              className="mb-8 flex w-full max-w-sm flex-col overflow-hidden rounded-[28px] border border-[#a3dfcb]/10 shadow-[0_20px_50px_rgba(38,177,128,0.15)]"
              initial={{ scale: 0.92, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.28 }}
            >
              <div className="flex flex-col bg-gradient-to-br from-[#d4f7ed] to-[#c2f4e6] p-5 pb-6">
                <div className="mb-5 flex items-center gap-3">
                  <div className="relative flex h-11 w-11 select-none items-center justify-center overflow-hidden rounded-full border border-[#a2dfcb] bg-[#122e26] text-3xl shadow-md">
                    <span className="text-2xl drop-shadow">🐈‍⬛</span>
                    <span className="absolute left-2 top-5 rotate-12 rounded border border-yellow-400 bg-black px-0.5 font-sans text-[8px] font-bold leading-none text-yellow-400">🕶️</span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="select-text text-sm font-bold tracking-wide text-[#103027]">隔壁老大鱼</span>
                    <span className="font-mono text-[9px] font-bold tracking-wider text-[#2c6e5a]">先锋跑者</span>
                  </div>
                </div>

                <div className="mb-5 grid w-full grid-cols-3 gap-2.5">
                  <div className="flex flex-col justify-center rounded-2xl border border-[#b2e8da] bg-white/80 p-2.5 text-center shadow-sm">
                    <div className="font-mono text-2xl font-black text-[#0b3329]" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.7)' }}>{result.distance.toFixed(2)}</div>
                    <div className="mt-1 text-[9.5px] font-bold tracking-tight text-[#206956]">实际里程/km</div>
                  </div>
                  <div className="flex flex-col justify-center rounded-2xl border border-[#b2e8da] bg-white/80 p-2.5 text-center shadow-sm">
                    <div className="font-mono text-2xl font-black text-[#0b3329]" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.7)' }}>{formatTime(result.duration)}</div>
                    <div className="mt-1 text-[9.5px] font-bold tracking-tight text-[#206956]">路线时长</div>
                  </div>
                  <div className="flex flex-col justify-center rounded-2xl border border-[#b2e8da] bg-white/80 p-2.5 text-center shadow-sm">
                    <div className="font-mono text-2xl font-black text-[#0b3329]" style={{ textShadow: '0 1px 0 rgba(255,255,255,0.7)' }}>{result.calories}</div>
                    <div className="mt-1 text-[9.5px] font-bold tracking-tight text-[#206956]">实际消耗/kcal</div>
                  </div>
                </div>

                <div className="flex w-full items-center gap-2.5 rounded-2xl border border-[#b2e8da]/40 bg-[#f4fcf9]/40 p-2 shadow-sm backdrop-blur-sm">
                  <div className="-skew-x-6 flex shrink-0 items-center gap-1 rounded-xl border border-[#c5e66b] bg-[#e4ffa1] px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-[#2c3d00] shadow-sm">
                    <Award size={11} className="text-[#2c3d00] motion-safe:animate-pulse" />
                    <span>获得勋章</span>
                  </div>
                  <div className="hide-scrollbar flex flex-1 items-center justify-start gap-1.5 overflow-x-auto py-0.5">
                    {MEDALS.map((medal, index) => (
                      <div key={medal.id} className="relative shrink-0" title={medal.name}>
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br ${medal.color} p-[1.5px] shadow-sm motion-safe:animate-pulse`} style={{ animationDelay: `${index * 120}ms` }}>
                          <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-900/60 text-sm shadow-inner backdrop-blur-md">{medal.text}</div>
                        </div>
                        {index === 0 && <div className="pointer-events-none absolute inset-0 rounded-full border border-yellow-300 opacity-55 motion-safe:animate-ping" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative h-px bg-transparent">
                <div className="absolute left-[-12px] top-[-12px] z-20 h-6 w-6 rounded-full bg-[#05070a] shadow-inner" />
                <div className="absolute right-[-12px] top-[-12px] z-20 h-6 w-6 rounded-full bg-[#05070a] shadow-inner" />
                <div className="absolute left-4 right-4 top-[-1px] z-10 border-t-2 border-dashed border-[#a1dfcc] opacity-70" />
              </div>

              <div className="relative flex bg-[#f2fbf7] p-6 pt-8 text-left">
                <div className="w-full text-left">
                  <h3 className="mb-1 select-text text-sm font-black tracking-tight text-[#103027]">{cityName}路线{routeIndex}：{route.title}</h3>
                  <div className="mb-3 font-mono text-[10px] font-extrabold tracking-wider text-[#427365]">{todayDateStr}</div>
                  <div className="border-l-2 border-[#80d0b8] py-1 pl-3">
                    <p className="select-text break-all text-[11px] font-medium italic leading-relaxed text-[#1e5445]">{getCityStoryText(cityName, routeIndex)}</p>
                  </div>
                </div>
              </div>
            </motion.section>

            <div className="flex w-full max-w-sm items-center gap-4 px-1">
              <button onClick={() => onComplete(result)} className="flex-1 rounded-2xl bg-[#cb2027] px-6 py-3.5 text-base font-extrabold tracking-wide text-white shadow-[0_4px_15px_rgba(203,32,39,0.3)] transition-all active:scale-95">
                结束训练
              </button>
              <button onClick={() => onComplete(result)} className="flex-1 rounded-2xl bg-[#26b180] px-6 py-3.5 text-base font-extrabold tracking-wide text-white shadow-[0_4px_15px_rgba(38,177,128,0.3)] transition-all active:scale-95">
                继续下一路线
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
