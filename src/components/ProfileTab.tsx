import {
  BookOpen,
  ChevronRight,
  ClipboardList,
  HeadphonesIcon,
  Mail,
  Map as MapIcon,
  Medal,
  MessageSquare,
  MonitorSmartphone,
  Settings,
  Sparkles,
  SquarePen,
  Wallet
} from 'lucide-react';
import { motion } from 'motion/react';
import { getGlowRank } from '../lib/glow';
import type { AuthUser } from './AuthView';
import type { AccountFeatureKind } from './AccountFeatureView';

interface UserStats {
  completedCities: number;
  completedRoutes: number;
  totalDistance: number;
  totalTimeHours: number;
  lightValue?: number;
  lifetimeLightValue?: number;
}

interface ProfileTabProps {
  userStats: UserStats;
  authUser?: AuthUser | null;
  onOpenAuth?: () => void;
  onOpenSettings?: () => void;
  onOpenFeature?: (feature: AccountFeatureKind) => void;
  onOpenRouteCollection?: () => void;
  onOpenWechatSupport?: () => void;
}

export default function ProfileTab({ userStats, authUser, onOpenAuth, onOpenSettings, onOpenFeature, onOpenRouteCollection, onOpenWechatSupport }: ProfileTabProps) {
  const rankInfo = getGlowRank(userStats.lifetimeLightValue ?? userStats.lightValue ?? 0);
  const displayName = authUser?.name || '登录 / 注册';
  const openProfile = () => {
    if (authUser) {
      onOpenFeature?.('profileEdit');
      return;
    }
    onOpenAuth?.();
  };
  const statItems = [
    { label: '完成城市', value: userStats.completedCities.toString() },
    { label: '完成路线', value: userStats.completedRoutes.toString() },
    { label: '运动里程', value: userStats.totalDistance.toFixed(1), unit: 'km' },
    { label: '运动时长', value: userStats.totalTimeHours.toFixed(1), unit: 'h' }
  ];

  const menuItems = [
    { icon: ClipboardList, label: '运动记录', feature: 'records' as AccountFeatureKind },
    { icon: MonitorSmartphone, label: '我的设备', feature: 'device' as AccountFeatureKind },
    { icon: Wallet, label: '我的钱包', feature: 'wallet' as AccountFeatureKind },
    { icon: MessageSquare, label: '问题反馈', feature: 'service' as AccountFeatureKind },
    { icon: HeadphonesIcon, label: '添加企微', onClick: onOpenWechatSupport },
    { icon: BookOpen, label: '使用说明', feature: 'guide' as AccountFeatureKind },
    { icon: Settings, label: '设置', onClick: onOpenSettings }
  ];

  return (
    <div className="h-full w-full overflow-y-auto bg-[#05070A] pb-24 text-slate-100 hide-scrollbar">
      <div className="relative overflow-hidden px-5 pb-8 pt-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_0%,rgba(34,211,238,0.22),transparent_36%),radial-gradient(circle_at_86%_6%,rgba(251,191,36,0.12),transparent_34%),linear-gradient(180deg,rgba(8,47,73,0.48),transparent_78%)]" />
        <div className="relative flex justify-end gap-4">
          <button
            type="button"
            onClick={() => onOpenFeature?.('messages')}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-200 backdrop-blur-md active:scale-95"
            aria-label="消息"
          >
            <Mail size={20} />
          </button>
          <button
            type="button"
            onClick={openProfile}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-slate-200 backdrop-blur-md active:scale-95"
            aria-label={authUser ? '编辑资料' : '登录或注册'}
          >
            <SquarePen size={20} />
          </button>
        </div>

        <section className="relative mt-4 rounded-[32px] border border-cyan-200/15 bg-[#081019]/82 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.36)] backdrop-blur-xl">
          <div className="absolute inset-0 rounded-[32px] bg-[linear-gradient(135deg,rgba(255,255,255,0.07),transparent_44%),radial-gradient(circle_at_92%_0%,rgba(251,191,36,0.14),transparent_42%)]" />
          <div className="relative flex items-center gap-4">
            <button
              type="button"
              onClick={openProfile}
              className={`h-[78px] w-[78px] shrink-0 rounded-full bg-gradient-to-br ${rankInfo.current.color} p-[2px] shadow-[0_0_34px_rgba(103,232,249,0.18)] active:scale-95`}
              aria-label={authUser ? '查看或编辑资料' : '登录或注册'}
            >
              <div className="h-full w-full rounded-full bg-slate-950 p-1">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200&h=200"
                  alt="头像"
                  className="h-full w-full rounded-full object-cover"
                />
              </div>
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-black tracking-tight text-white">{displayName}</h1>
              <div className="mt-2 flex items-center gap-2">
                <span className={`rounded-full bg-gradient-to-r ${rankInfo.current.color} px-2.5 py-1 text-[11px] font-black text-slate-950 shadow-[0_0_16px_rgba(251,191,36,0.24)]`}>
                  LV.{rankInfo.current.level}
                </span>
                <span className="text-sm font-black text-amber-300">{rankInfo.current.name}</span>
              </div>
            </div>
          </div>

          <div className="relative mt-6 grid grid-cols-4 gap-2">
            {statItems.map(item => (
              <div key={item.label} className="rounded-2xl border border-white/[0.08] bg-white/[0.045] px-2 py-3 text-center">
                <p className="font-mono text-lg font-black tracking-[-0.03em] text-white">
                  {item.value}
                  {item.unit && <span className="ml-0.5 text-[10px] text-slate-500">{item.unit}</span>}
                </p>
                <p className="mt-1 text-[10px] font-bold text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="relative z-10 -mt-3 space-y-5 px-5">
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            type="button"
            onClick={onOpenRouteCollection}
            whileTap={{ scale: 0.97 }}
            className="relative col-span-2 overflow-hidden rounded-[26px] border border-cyan-200/20 bg-[#08121b] p-4 text-left shadow-xl"
          >
            <div className="absolute -right-7 -top-10 text-cyan-200/[0.07]">
              <MapIcon size={132} />
            </div>
            <div className="relative flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[9px] font-black tracking-[0.2em] text-cyan-200/60">CITY COLLECTION</p>
                <h3 className="mt-1 text-lg font-black text-white">城市收藏</h3>
                <p className="mt-1 text-[11px] font-bold text-slate-500">景点勋章 · 城市卡片 · 光迹徽章</p>
              </div>
              <div className="flex shrink-0 items-center -space-x-1.5" aria-hidden="true">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-amber-200/40 bg-[#16130b] text-amber-100 shadow-lg">
                  <Medal size={20} />
                </span>
                <span className="relative z-[1] flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-cyan-200/35 bg-[#0b1c29] text-cyan-100 shadow-lg">
                  <MapIcon size={21} />
                </span>
                <span className="relative z-[2] flex h-11 w-11 items-center justify-center rounded-full border-2 border-emerald-200/35 bg-[#0b1d19] text-emerald-100 shadow-lg">
                  <Sparkles size={19} />
                </span>
              </div>
            </div>
          </motion.button>
        </div>

        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.045] shadow-2xl backdrop-blur-xl">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.button
                key={item.label}
                type="button"
                onClick={() => {
                  if ('feature' in item && item.feature) {
                    onOpenFeature?.(item.feature);
                    return;
                  }
                  item.onClick?.();
                }}
                whileTap={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
                className={`flex w-full items-center justify-between px-5 py-4 text-left ${index !== menuItems.length - 1 ? 'border-b border-white/[0.06]' : ''}`}
              >
                <span className="flex items-center gap-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900/80 text-slate-300">
                    <Icon size={19} />
                  </span>
                  <span className="text-sm font-black text-slate-100">{item.label}</span>
                </span>
                <ChevronRight size={18} className="text-slate-600" />
              </motion.button>
            );
          })}
        </section>
      </div>
    </div>
  );
}
