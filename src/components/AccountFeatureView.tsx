import { useMemo, useState } from 'react';
import {
  Bell,
  Bluetooth,
  ChevronLeft,
  CircleHelp,
  ClipboardList,
  Download,
  HeadphonesIcon,
  LockKeyhole,
  MapPinned,
  Medal,
  MonitorSmartphone,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Trophy,
  Wallet,
  X
} from 'lucide-react';
import { CITIES } from '../data/cities';
import type { AuthUser } from './AuthView';
import CityImage from './CityImage';

const viteBaseUrl = ((import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL || '/');

export type AccountFeatureKind =
  | 'records'
  | 'device'
  | 'wallet'
  | 'service'
  | 'feedback'
  | 'guide'
  | 'messages'
  | 'profileEdit'
  | 'achievements'
  | 'cityCards';

type UserStats = {
  completedCities: number;
  completedRoutes: number;
  totalDistance: number;
  totalTimeHours: number;
  lightValue?: number;
  newbieCashRewardHistory?: Array<{ title: string; amount: string; createdAt: string }>;
  glowWheelDrawHistory?: Array<{ amount: number; createdAt: string }>;
  medalLotteryDrawHistory?: Array<{ amount: string; createdAt: string }>;
};

type AccountFeatureViewProps = {
  kind: AccountFeatureKind;
  userStats: UserStats;
  authUser: AuthUser | null;
  onBack: () => void;
  onOpenAuth: () => void;
  initialSupportQrOpen?: boolean;
};

const featureMeta: Record<AccountFeatureKind, { title: string; eyebrow: string; desc: string }> = {
  records: { title: '运动记录', eyebrow: '运动日志', desc: '查看近期路线、里程和运动完成情况。' },
  device: { title: '我的设备', eyebrow: '设备管理', desc: '管理跑步机连接、扫码绑定和设备校准。' },
  wallet: { title: '我的钱包', eyebrow: '钱包', desc: '查看现金红包、奖励明细和提现入口。' },
  service: { title: '问题反馈', eyebrow: '问题反馈', desc: '描述遇到的问题，扫码添加企业微信客服。' },
  feedback: { title: '客服反馈', eyebrow: '客服反馈', desc: '描述遇到的问题，扫码联系客服。' },
  guide: { title: '使用说明', eyebrow: '使用指南', desc: '了解连接设备、完成路线和领取奖励的步骤。' },
  messages: { title: '消息中心', eyebrow: '消息', desc: '查看活动提醒、设备状态和系统通知。' },
  profileEdit: { title: '编辑资料', eyebrow: '个人资料', desc: '管理昵称、手机号和账号基础信息。' },
  achievements: { title: '成就勋章', eyebrow: '勋章', desc: '查看路线、城市和活动中获得的荣誉勋章。' },
  cityCards: { title: '城市卡片', eyebrow: '城市收藏', desc: '收藏每座城市的探索记忆，记录你的世界足迹。' }
};

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-cyan-200/15 bg-cyan-300/8 text-cyan-100">
        <CircleHelp size={28} />
      </div>
      <h3 className="mt-4 text-base font-black text-white">{title}</h3>
      <p className="mt-2 text-xs font-bold leading-5 text-slate-500">{desc}</p>
    </div>
  );
}

function LoginHint({ onOpenAuth }: { onOpenAuth: () => void }) {
  return (
    <div className="rounded-[28px] border border-amber-200/18 bg-amber-300/8 p-5">
      <p className="text-sm font-black text-amber-100">登录后可同步完整数据</p>
      <p className="mt-2 text-xs font-bold leading-5 text-slate-400">账号登录后，钱包、设备、运动记录和红包明细会归档到同一个用户身份。</p>
      <button
        type="button"
        onClick={onOpenAuth}
        className="mt-4 h-11 w-full rounded-full bg-gradient-to-r from-cyan-200 to-amber-100 text-sm font-black text-slate-950 active:scale-95"
      >
        登录 / 注册
      </button>
    </div>
  );
}

function FeatureIcon({ kind }: { kind: AccountFeatureKind }) {
  if (kind === 'records') return <ClipboardList size={25} />;
  if (kind === 'device') return <MonitorSmartphone size={25} />;
  if (kind === 'wallet') return <Wallet size={25} />;
  if (kind === 'service') return <HeadphonesIcon size={25} />;
  if (kind === 'feedback') return <HeadphonesIcon size={25} />;
  if (kind === 'guide') return <MapPinned size={25} />;
  if (kind === 'messages') return <Bell size={25} />;
  if (kind === 'achievements') return <Medal size={25} />;
  if (kind === 'cityCards') return <MapPinned size={25} />;
  return <ShieldCheck size={25} />;
}

export default function AccountFeatureView({ kind, userStats, authUser, onBack, onOpenAuth, initialSupportQrOpen = false }: AccountFeatureViewProps) {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [showSupportQr, setShowSupportQr] = useState(initialSupportQrOpen);
  const meta = featureMeta[kind];

  const walletRecords = useMemo(() => {
    const newbie = (userStats.newbieCashRewardHistory || []).map(item => ({
      title: item.title,
      amount: `+¥${item.amount}`,
      time: item.createdAt
    }));
    const wheel = (userStats.glowWheelDrawHistory || []).map(item => ({
      title: '光迹值现金抽奖',
      amount: `+¥${item.amount.toFixed(2)}`,
      time: item.createdAt
    }));
    const medals = (userStats.medalLotteryDrawHistory || []).map(item => ({
      title: '勋章盲盒抽奖',
      amount: `+${item.amount}`,
      time: item.createdAt
    }));
    return [...newbie, ...wheel, ...medals].slice(0, 8);
  }, [userStats]);

  const walletTotal = useMemo(() => {
    return walletRecords.reduce((sum, record) => {
      const value = Number(record.amount.replace(/[^\d.]/g, ''));
      return Number.isFinite(value) ? sum + value : sum;
    }, 0);
  }, [walletRecords]);

  const renderContent = () => {
    if (kind === 'achievements') {
      const medals = [
        { title: '城市初光', desc: '首次点亮城市', icon: Medal, unlocked: true, tone: 'text-amber-200 bg-amber-300/12 border-amber-200/20' },
        { title: '路线先锋', desc: '完成 7 条路线', icon: Trophy, unlocked: userStats.completedRoutes >= 7, tone: 'text-cyan-100 bg-cyan-300/12 border-cyan-200/20' },
        { title: '满载而归', desc: '累计运动 60km', icon: Sparkles, unlocked: userStats.totalDistance >= 60, tone: 'text-emerald-100 bg-emerald-300/12 border-emerald-200/20' },
        { title: '环球收藏家', desc: '点亮 5 座城市', icon: Medal, unlocked: userStats.completedCities >= 5, tone: 'text-violet-100 bg-violet-300/12 border-violet-200/20' },
        { title: '活动达人', desc: '完成活动挑战', icon: Trophy, unlocked: false, tone: 'text-slate-400 bg-white/[0.04] border-white/10' },
        { title: '王者光迹', desc: '达到王者段位', icon: LockKeyhole, unlocked: false, tone: 'text-slate-400 bg-white/[0.04] border-white/10' }
      ];

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '已获得', value: String(medals.filter(item => item.unlocked).length) },
              { label: '总勋章', value: String(medals.length) },
              { label: '待解锁', value: String(medals.filter(item => !item.unlocked).length) }
            ].map(item => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] font-bold text-slate-500">{item.label}</p>
                <p className="mt-2 font-mono text-2xl font-black text-amber-100">{item.value}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {medals.map(item => {
              const Icon = item.icon;
              return (
                <div key={item.title} className={`rounded-[26px] border p-4 ${item.tone} ${item.unlocked ? '' : 'opacity-70'}`}>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/22">
                    <Icon size={24} />
                  </div>
                  <h3 className="mt-4 text-sm font-black text-white">{item.title}</h3>
                  <p className="mt-1 text-[11px] font-bold leading-4 text-slate-400">{item.desc}</p>
                  <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-[11px] font-black ${item.unlocked ? 'bg-emerald-300/14 text-emerald-100' : 'bg-slate-700/30 text-slate-500'}`}>
                    {item.unlocked ? '已获得' : '未解锁'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (kind === 'cityCards') {
      const collected = CITIES.filter(city => city.status === 'lit' || city.status === 'in-progress').slice(0, 6);
      const locked = CITIES.filter(city => city.status !== 'lit' && city.status !== 'in-progress').slice(0, 4);
      return (
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-black tracking-[0.24em] text-cyan-200/70">城市收藏</p>
              <h2 className="mt-2 text-xl font-black text-white">已收藏城市记忆卡</h2>
            </div>
            <span className="font-mono text-sm font-black text-cyan-100">{collected.length}/{CITIES.length}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...collected, ...locked].map((city, index) => {
              const unlocked = index < collected.length;
              return (
                <div key={`${city.id}-${unlocked ? 'open' : 'lock'}`} className={`overflow-hidden rounded-[24px] border bg-white/[0.04] ${unlocked ? 'border-cyan-200/18' : 'border-white/10 opacity-55'}`}>
                  <div className="relative h-28">
                    {unlocked ? (
                      <CityImage src={city.image} alt={city.name} fallbackLabel={city.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-slate-900 text-slate-500">
                        <LockKeyhole size={28} />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <span className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-1 text-[10px] font-black text-cyan-50">
                      {unlocked ? '已收藏' : '未解锁'}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-black text-white">{city.name}</h3>
                    <p className="mt-1 text-[11px] font-bold text-slate-500">城市卡片 #{String(index + 1).padStart(2, '0')}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (kind === 'records') {
      const records = [
        { city: '新加坡', route: '新加坡深度探索路线', distance: '5.2 km', time: '35:00', date: '07/29 09:12' },
        { city: '杭州', route: '灵隐寻幽', distance: '4.2 km', time: '40:00', date: '07/28 19:30' },
        { city: '北京', route: '故宫角楼掠影', distance: '4.0 km', time: '30:00', date: '07/27 08:45' }
      ];

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: '总里程', value: userStats.totalDistance.toFixed(1), unit: 'km' },
              { label: '总时长', value: userStats.totalTimeHours.toFixed(1), unit: 'h' },
              { label: '路线', value: String(userStats.completedRoutes), unit: '条' }
            ].map(item => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                <p className="text-[11px] font-bold text-slate-500">{item.label}</p>
                <p className="mt-2 font-mono text-2xl font-black text-cyan-100">{item.value}<span className="ml-1 text-xs text-slate-500">{item.unit}</span></p>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            {records.map(record => (
              <div key={`${record.city}-${record.date}`} className="rounded-[26px] border border-white/10 bg-[#09111b] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black text-cyan-200">{record.city}</p>
                    <h3 className="mt-1 text-base font-black text-white">{record.route}</h3>
                  </div>
                  <p className="shrink-0 text-xs font-bold text-slate-500">{record.date}</p>
                </div>
                <div className="mt-4 flex items-center gap-3 text-xs font-black text-slate-400">
                  <span>{record.distance}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-700" />
                  <span>{record.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (kind === 'device') {
      return (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-[30px] border border-emerald-200/16 bg-[#07140f] p-5">
            <div className="absolute right-[-18px] top-[-18px] h-32 w-32 rounded-full bg-emerald-300/12 blur-3xl" />
            <div className="relative flex items-center gap-4">
              <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[28px] border border-emerald-200/18 bg-emerald-300/10 text-emerald-100">
                <MonitorSmartphone size={32} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-black text-white">MOVE VI 智能跑步机</h3>
                <p className="mt-1 text-xs font-bold text-emerald-200/70">设备在线 · 默认已连接</p>
              </div>
              <span className="rounded-full bg-emerald-300/16 px-3 py-1 text-xs font-black text-emerald-100">已连接</span>
            </div>
          </div>
          {[
            { icon: Bluetooth, title: '蓝牙连接', desc: '优先连接最近一次激活的跑步机' },
            { icon: QrCode, title: '扫码绑定设备', desc: '支持机身二维码和家庭设备码' },
            { icon: Smartphone, title: '固件与校准', desc: '检查固件版本、坡度和速度校准' }
          ].map(item => {
            const Icon = item.icon;
            return (
              <button key={item.title} type="button" className="flex w-full items-center gap-4 rounded-[26px] border border-white/10 bg-white/[0.04] p-4 text-left active:scale-[0.99]">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-300/10 text-cyan-100"><Icon size={22} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black text-white">{item.title}</span>
                  <span className="mt-1 block text-xs font-bold text-slate-500">{item.desc}</span>
                </span>
              </button>
            );
          })}
        </div>
      );
    }

    if (kind === 'wallet') {
      return (
        <div className="space-y-4">
          {!authUser && <LoginHint onOpenAuth={onOpenAuth} />}
          <div className="relative overflow-hidden rounded-[32px] border border-amber-200/20 bg-[#130e08] p-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgba(251,191,36,0.24),transparent_42%),linear-gradient(135deg,rgba(34,211,238,0.08),transparent)]" />
            <div className="relative">
              <p className="text-xs font-black tracking-[0.28em] text-amber-100/70">钱包余额</p>
              <p className="mt-3 font-mono text-5xl font-black tracking-[-0.07em] text-amber-100">¥{walletTotal.toFixed(2)}</p>
              <p className="mt-2 text-xs font-bold text-slate-500">红包、现金抽奖和段位奖励会在此汇总。</p>
              <button className="mt-5 h-12 w-full rounded-full bg-gradient-to-r from-amber-100 to-cyan-100 text-sm font-black text-slate-950 active:scale-95">
                提现到微信
              </button>
            </div>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-black">钱包明细</h3>
              <span className="text-xs font-bold text-slate-500">{walletRecords.length} 条</span>
            </div>
            {walletRecords.length > 0 ? (
              <div className="space-y-2">
                {walletRecords.map((record, index) => (
                  <div key={`${record.title}-${index}`} className="flex items-center justify-between rounded-2xl bg-black/24 px-4 py-3">
                    <div>
                      <p className="text-sm font-black text-white">{record.title}</p>
                      <p className="mt-1 text-xs font-bold text-slate-600">{record.time}</p>
                    </div>
                    <p className="font-mono text-sm font-black text-amber-100">{record.amount}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="暂无钱包记录" desc="完成红包任务或抽奖后，现金奖励会出现在这里。" />
            )}
          </div>
        </div>
      );
    }

    if (kind === 'service' || kind === 'feedback') {
      return (
        <div className="space-y-5 pt-1">
          <section>
            <label htmlFor="support-question" className="text-base font-black text-white">描述问题</label>
            <div className="relative mt-3">
              <textarea
                id="support-question"
                value={feedbackText}
                maxLength={200}
                onChange={event => {
                  setFeedbackText(event.target.value);
                  setFeedbackSubmitted(false);
                }}
                placeholder="请描述你遇到的问题"
                className="h-52 w-full resize-none rounded-[26px] border border-white/10 bg-[#0a111b] p-4 pb-9 text-sm font-bold leading-6 text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/45 focus:ring-2 focus:ring-cyan-300/10"
              />
              <span className="pointer-events-none absolute bottom-3 right-4 font-mono text-[10px] font-bold text-slate-600">{feedbackText.length}/200</span>
            </div>
          </section>

          <button
            type="button"
            disabled={!feedbackText.trim()}
            onClick={() => setFeedbackSubmitted(true)}
            className="flex h-12 w-full items-center justify-center rounded-full bg-cyan-200 text-sm font-black text-slate-950 shadow-[0_12px_30px_rgba(34,211,238,0.16)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
          >
            {feedbackSubmitted ? '已提交' : '提交'}
          </button>

          <button
            type="button"
            onClick={() => setShowSupportQr(true)}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-cyan-200/28 bg-cyan-300/10 text-sm font-black text-cyan-100 transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/70"
          >
            <QrCode size={18} />
            添加客服（企业微信）
          </button>
        </div>
      );
    }

    if (kind === 'guide') {
      const steps = [
        { title: '连接跑步机', desc: '打开设备蓝牙，点击首页跑步机图标完成连接。' },
        { title: '选择城市路线', desc: '进入正在点亮的城市，选择一条未完成路线。' },
        { title: '完成运动回放', desc: '跑步结束后同步里程、时长、光迹值和路线进度。' },
        { title: '领取奖励', desc: '红包、勋章和抽奖记录可在活动页或钱包中查看。' }
      ];
      return (
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div key={step.title} className="flex gap-4 rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-300/10 font-mono text-sm font-black text-cyan-100">{String(index + 1).padStart(2, '0')}</div>
              <div>
                <h3 className="text-sm font-black text-white">{step.title}</h3>
                <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (kind === 'messages') {
      const messages = [
        { title: '信号广播', desc: '用户完成路线获得勋章，抽取现金红包。', time: '刚刚' },
        { title: '设备在线', desc: '跑步机已连接，可直接开始今日路线。', time: '09:32' },
        { title: '活动提醒', desc: '勋章盲盒抽奖每日开放。', time: '昨天' }
      ];
      return (
        <div className="space-y-3">
          {messages.map(item => (
            <div key={item.title} className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-black text-white">{item.title}</h3>
                <span className="text-xs font-bold text-slate-600">{item.time}</span>
              </div>
              <p className="mt-2 text-xs font-bold leading-5 text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {!authUser && <LoginHint onOpenAuth={onOpenAuth} />}
        <label className="block rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
          <span className="text-xs font-bold text-slate-500">昵称</span>
          <input defaultValue={authUser?.name || '尘缘'} className="mt-2 w-full bg-transparent text-lg font-black text-white outline-none" />
        </label>
        <label className="block rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
          <span className="text-xs font-bold text-slate-500">手机号</span>
          <input value={authUser ? `${authUser.phone.slice(0, 3)}****${authUser.phone.slice(-4)}` : '未登录'} readOnly className="mt-2 w-full bg-transparent text-lg font-black text-white outline-none" />
        </label>
        <button className="h-12 w-full rounded-full bg-gradient-to-r from-cyan-200 to-amber-100 text-sm font-black text-slate-950 active:scale-95">
          保存资料
        </button>
      </div>
    );
  };

  return (
    <div className="relative h-full w-full overflow-y-auto bg-[#05070A] px-5 pb-10 pt-safeb text-slate-100 hide-scrollbar">
      <div className="sticky top-0 z-20 -mx-5 flex items-center justify-between border-b border-white/10 bg-[#05070A]/82 px-5 py-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-200 active:scale-95"
          aria-label="返回"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="text-center">
          {kind !== 'service' && kind !== 'feedback' && (
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-cyan-200/70">{meta.eyebrow}</p>
          )}
          <h1 className="text-lg font-black">{meta.title}</h1>
        </div>
        <div className="h-11 w-11" />
      </div>

      {kind !== 'service' && kind !== 'feedback' && (
        <section className="relative mt-5 overflow-hidden rounded-[30px] border border-cyan-200/15 bg-[#09111b] p-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(34,211,238,0.16),transparent_38%),radial-gradient(circle_at_100%_0%,rgba(251,191,36,0.12),transparent_45%)]" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[22px] border border-cyan-200/16 bg-cyan-300/10 text-cyan-100">
              <FeatureIcon kind={kind} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">{meta.title}</h2>
              <p className="mt-1 text-xs font-bold text-slate-500">{meta.desc}</p>
            </div>
          </div>
        </section>
      )}

      <main className={kind === 'service' || kind === 'feedback' ? 'mt-5' : 'mt-4'}>{renderContent()}</main>

      {showSupportQr && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/72 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-qr-title"
          onClick={() => setShowSupportQr(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-[30px] border border-cyan-200/18 bg-[#0a1522] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.62)]"
            onClick={event => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowSupportQr(false)}
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-300 active:scale-95"
              aria-label="关闭客服二维码"
            >
              <X size={19} />
            </button>

            <div className="pr-12">
              <h2 id="support-qr-title" className="text-xl font-black text-white">扫码联系客服</h2>
              <p className="mt-1 text-xs font-bold leading-5 text-slate-500">先保存二维码，再打开微信扫一扫，从相册选择二维码识别。</p>
            </div>

            <div className="mt-5 rounded-[24px] border border-cyan-200/15 bg-white p-4 shadow-[0_0_45px_rgba(34,211,238,0.12)]">
              <img
                src={`${viteBaseUrl}movevi-support-qr.png`}
                alt="客服二维码"
                className="mx-auto aspect-square w-full max-w-[260px] object-contain"
              />
            </div>

            <a
              href={`${viteBaseUrl}movevi-support-qr.png`}
              download="MOVEVI客服二维码.png"
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-cyan-200 text-sm font-black text-slate-950 shadow-[0_12px_30px_rgba(34,211,238,0.16)] transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/70"
            >
              <Download size={18} />
              一键保存二维码
            </a>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(110,231,183,0.55)]" />
              客服在线 · 09:00 - 16:00
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
