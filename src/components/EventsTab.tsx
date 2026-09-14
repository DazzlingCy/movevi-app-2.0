import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { Calendar, ChevronRight, Gift, Globe2, MessageSquare, Sparkles } from 'lucide-react';

interface EventsTabProps {
  onSelectMedley?: () => void;
  onSelectMedalLottery?: () => void;
  onSelectWeightLossPlan?: () => void;
}

type EventCardProps = {
  title: string;
  description: string;
  image: string;
  accent: 'amber' | 'emerald' | 'purple' | 'cyan';
  icon: ReactNode;
  tag: ReactNode;
  onClick?: () => void;
  className?: string;
  delay?: number;
  taller?: boolean;
};

const accentStyles = {
  amber: {
    border: 'border-amber-500/30',
    overlay: 'from-black via-black/60 to-amber-900/20',
    glow: 'from-amber-500/20 to-transparent',
    badge: 'bg-amber-500/20 text-amber-200 border-amber-500/50',
    iconBox: 'bg-amber-500/20 border-amber-500/30',
    iconText: 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]',
    title: 'text-amber-100',
    copy: 'text-amber-200/60',
    action: 'bg-amber-500/20 hover:bg-amber-500/25 border-amber-500/40 text-amber-200',
    arrow: 'bg-amber-500/10 border-amber-500/30 group-hover:bg-amber-500/30 text-amber-200'
  },
  emerald: {
    border: 'border-emerald-500/30',
    overlay: 'from-black via-black/70 to-emerald-900/20',
    glow: 'from-emerald-500/20 to-transparent',
    badge: 'bg-emerald-500/30 text-[#a1f2da] border-emerald-500/50',
    iconBox: 'bg-emerald-500/20 border-emerald-500/30',
    iconText: 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]',
    title: 'text-emerald-100',
    copy: 'text-emerald-200/60',
    action: 'bg-emerald-500/20 hover:bg-emerald-500/25 border-emerald-500/40 text-[#a2dfcb]',
    arrow: 'bg-emerald-500/10 border-emerald-500/30 group-hover:bg-emerald-500/30 text-emerald-200'
  },
  purple: {
    border: 'border-purple-500/30',
    overlay: 'from-black via-black/60 to-purple-900/20',
    glow: 'from-purple-500/20 to-transparent',
    badge: 'bg-purple-500/20 text-purple-200 border-purple-500/50',
    iconBox: 'bg-purple-500/20 border-purple-500/30',
    iconText: 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]',
    title: 'text-purple-100',
    copy: 'text-purple-200/60',
    action: 'bg-purple-500/20 hover:bg-purple-500/25 border-purple-500/40 text-purple-200',
    arrow: 'bg-purple-500/10 border-purple-500/30 group-hover:bg-purple-500/30 text-purple-200'
  },
  cyan: {
    border: 'border-cyan-500/30',
    overlay: 'from-black via-black/65 to-cyan-900/20',
    glow: 'from-cyan-500/20 to-transparent',
    badge: 'bg-cyan-500/20 text-cyan-200 border-cyan-500/50',
    iconBox: 'bg-cyan-500/20 border-cyan-500/30',
    iconText: 'text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]',
    title: 'text-cyan-100',
    copy: 'text-cyan-200/60',
    action: 'bg-cyan-500/20 hover:bg-cyan-500/25 border-cyan-500/40 text-cyan-200',
    arrow: 'bg-cyan-500/10 border-cyan-500/30 group-hover:bg-cyan-500/30 text-cyan-200'
  }
};

function EventCard({
  title,
  description,
  image,
  accent,
  icon,
  tag,
  onClick,
  className = '',
  delay = 0,
  taller = false
}: EventCardProps) {
  const styles = accentStyles[accent];

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={`relative w-full ${taller ? 'h-[200px]' : 'h-[170px]'} rounded-2xl overflow-hidden shadow-2xl cursor-pointer group border ${styles.border} ${className}`}
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
      />
      <div className={`absolute inset-0 bg-gradient-to-t ${styles.overlay} mix-blend-multiply`} />
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.glow} pointer-events-none`} />

      <div className={`absolute right-3 top-3 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest shadow-lg backdrop-blur-sm ${styles.badge}`}>
        {tag}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-3.5">
        <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg border shadow-inner backdrop-blur-md ${styles.iconBox} ${styles.iconText}`}>
          {icon}
        </div>
        <h2 className={`mb-0.5 text-base font-bold tracking-wide ${styles.title}`}>{title}</h2>
        <div className="flex items-center justify-between gap-3">
          <p className={`max-w-[66%] text-[11px] leading-relaxed line-clamp-2 ${styles.copy}`}>{description}</p>
          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={(event) => event.stopPropagation()}
              className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold shadow-lg transition-colors active:scale-95 cursor-default ${styles.action}`}
            >
              <MessageSquare size={11} />
              讨论
            </button>
            <div className={`flex h-7 w-7 items-center justify-center rounded-full border backdrop-blur transition-colors ${styles.arrow}`}>
              <ChevronRight size={14} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function EventsTab({ onSelectMedley, onSelectMedalLottery }: EventsTabProps) {
  return (
    <div className="relative h-full w-full overflow-y-auto bg-[#05070A] pb-24 font-sans text-slate-100 hide-scrollbar">
      <div className="sticky top-0 z-20 flex items-center justify-center border-b border-white/10 bg-black/40 p-3.5 pt-safeb backdrop-blur-md">
        <h1 className="text-sm font-bold uppercase tracking-widest text-cyan-400">热门活动</h1>
      </div>

      <div className="flex flex-col gap-3.5 p-3.5">
        <EventCard
          title="勋章盲盒抽奖"
          description="消耗勋章，解锁全球城市路线，获取专属勋章抽取现金奖励。"
          image="https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=600&h=400"
          accent="amber"
          icon={<Gift size={16} />}
          tag={<span className="flex items-center gap-1"><Sparkles size={10} className="animate-pulse" />每日开放</span>}
          onClick={onSelectMedalLottery}
        />

        <EventCard
          title="周末城市记忆串烧"
          description="选取 3 个城市经典记忆路线，完成后可抽取现金奖励。"
          image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600&h=400"
          accent="emerald"
          icon={<Sparkles size={16} />}
          tag={<span className="flex items-center gap-1"><Calendar size={10} className="animate-pulse" />每周末开放</span>}
          onClick={onSelectMedley}
        />

        <EventCard
          title="百人百城计划"
          description="集结全球跑者，共同解锁全球 100 个标志性城市赛道，抽免费旅行。"
          image="https://images.unsplash.com/photo-1506501139174-099022df5260?auto=format&fit=crop&q=80&w=600&h=500"
          accent="purple"
          icon={<Globe2 size={16} />}
          tag="抽免费旅行"
          taller
          delay={0.1}
        />

      </div>
    </div>
  );
}
