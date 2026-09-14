import { useState } from 'react';
import { ChevronRight, Trophy, Zap, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LeaderboardViewProps {
  onBack: () => void;
}

const leaderboardData = [
  { id: 1, name: '极光闪电', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100&h=100', score: 18450 },
  { id: 2, name: '城市探险家', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=100&h=100', score: 16200 },
  { id: 3, name: '追光者·星', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100&h=100', score: 14500 },
  { id: 4, name: '夜行猎手', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100', score: 12100 },
  { id: 5, name: '风行无阻', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100&h=100', score: 11800 },
  { id: 6, name: '地球狂奔', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100&h=100', score: 9500 },
  { id: 7, name: '阿兹特克', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100&h=100', score: 8200 },
  { id: 8, name: '超越极限', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=100&h=100', score: 7100 },
];

export default function LeaderboardView({ onBack }: LeaderboardViewProps) {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="w-full h-full bg-[#05070A] overflow-y-auto pb-24 text-slate-100 font-sans hide-scrollbar relative">
      <div className="sticky top-0 z-20 bg-black/40 backdrop-blur-md pt-safeb flex items-center justify-between px-4 py-4 border-b border-white/10">
        <button 
          onClick={onBack} 
          className="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full hover:bg-white/10 transition-colors"
        >
          <ChevronRight className="rotate-180" size={20} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 font-bold tracking-widest text-slate-100">全球点亮榜</h1>
        <button
          onClick={() => setShowRules(true)}
          className="h-8 px-3 flex items-center gap-1.5 rounded-full border border-cyan-400/25 bg-cyan-400/10 text-xs font-bold text-cyan-100 hover:bg-cyan-400/20 transition-colors"
        >
          <Info size={14} />
          规则
        </button>
      </div>

      {/* Top 3 Podium */}
      <div className="py-10 px-6 flex items-end justify-center gap-4 border-b border-white/5 bg-gradient-to-b from-[#05070A] to-slate-900/40">
        {/* 2nd Place */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center pb-4"
        >
          <div className="relative mb-3">
             <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-400 p-0.5">
               <img src={leaderboardData[1].avatar} className="w-full h-full rounded-full object-cover" />
             </div>
             <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-slate-400 rounded-full flex items-center justify-center text-xs font-bold text-slate-900">2</div>
          </div>
          <div className="text-xs font-bold text-slate-200 mb-1">{leaderboardData[1].name}</div>
          <div className="text-[10px] text-cyan-400 flex items-center"><Zap size={10} className="mr-0.5" />{leaderboardData[1].score.toLocaleString()}</div>
        </motion.div>

        {/* 1st Place */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center relative z-10"
        >
          <div className="absolute -top-6 text-amber-400 animate-bounce">
            <Trophy size={24} />
          </div>
          <div className="relative mb-3">
             <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-amber-400 p-0.5 shadow-[0_0_20px_rgba(245,158,11,0.3)]">
               <img src={leaderboardData[0].avatar} className="w-full h-full rounded-full object-cover" />
             </div>
             <div className="absolute -bottom-2 -left-2 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center text-sm font-bold text-slate-900 shadow-lg">1</div>
          </div>
          <div className="text-sm font-bold text-amber-400 mb-1">{leaderboardData[0].name}</div>
          <div className="text-xs text-cyan-400 flex items-center font-bold"><Zap size={12} className="mr-0.5" />{leaderboardData[0].score.toLocaleString()}</div>
        </motion.div>

        {/* 3rd Place */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center pb-2"
        >
          <div className="relative mb-3">
             <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-orange-400 p-0.5">
               <img src={leaderboardData[2].avatar} className="w-full h-full rounded-full object-cover" />
             </div>
             <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center text-xs font-bold text-slate-900">3</div>
          </div>
          <div className="text-xs font-bold text-slate-200 mb-1">{leaderboardData[2].name}</div>
          <div className="text-[10px] text-cyan-400 flex items-center"><Zap size={10} className="mr-0.5" />{leaderboardData[2].score.toLocaleString()}</div>
        </motion.div>
      </div>

      {/* List */}
      <div className="px-4 py-6 space-y-3">
        {leaderboardData.slice(3).map((user, index) => (
           <motion.div 
             key={user.id}
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ delay: 0.1 * index }}
             className="flex items-center justify-between bg-white/5 border border-white/5 p-3 rounded-2xl hover:bg-white/10 transition-colors"
           >
              <div className="flex items-center gap-4">
                 <div className="w-6 text-center text-slate-500 font-bold font-mono">{index + 4}</div>
                 <img src={user.avatar} className="w-10 h-10 rounded-full object-cover" />
                 <div className="font-bold text-sm text-slate-200">{user.name}</div>
              </div>
              <div className="flex items-center text-cyan-400 font-mono text-xs">
                 <Zap size={12} className="mr-1" /> {user.score.toLocaleString()}
              </div>
           </motion.div>
        ))}
      </div>

      {/* Current User */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent pb-safeb pt-12">
          <div className="flex items-center justify-between bg-cyan-950/40 border border-cyan-500/30 p-4 rounded-2xl backdrop-blur-md shadow-[0_0_20px_rgba(34,211,238,0.1)] mb-4">
            <div className="flex items-center gap-4">
               <div className="w-6 text-center text-cyan-500 font-bold font-mono">142</div>
               <div className="w-10 h-10 rounded-full bg-slate-800 border hover:bg-white/10 flex items-center justify-center border-slate-700">
                 <span className="text-sm font-bold">ME</span>
               </div>
               <div className="font-bold text-sm text-cyan-400">当前排名</div>
            </div>
            <div className="flex items-center text-cyan-400 font-mono text-xs font-bold">
               <Zap size={14} className="mr-1" /> 120
            </div>
          </div>
      </div>

      <AnimatePresence>
        {showRules && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 px-4 pb-6 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRules(false)}
          >
            <motion.div
              className="w-full max-w-sm rounded-[28px] border border-cyan-300/20 bg-[#0A1018] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)]"
              initial={{ y: 28, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 28, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 360, damping: 30 }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold tracking-[0.28em] text-cyan-300/80">活动规则</div>
                  <h2 className="mt-1 text-xl font-black text-white">规则说明</h2>
                </div>
                <button
                  onClick={() => setShowRules(false)}
                  className="h-9 w-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-300"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-slate-300">
                排行榜仅展示最近30天的光迹值。
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
