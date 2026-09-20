import { useState } from 'react';
import { Activity, ChevronLeft, Footprints, Info, Trophy, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface LeaderboardViewProps {
  onBack: () => void;
}

type EquipmentCategory = 'treadmill' | 'walking-pad';

type LeaderboardUser = {
  id: number;
  name: string;
  avatar: string;
  unlockedRoutes: number;
};

const avatars = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=160&h=160',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=160&h=160',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=160&h=160',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=160&h=160',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=160&h=160',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=160&h=160',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=160&h=160',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=160&h=160'
];

const leaderboardData: Record<EquipmentCategory, LeaderboardUser[]> = {
  treadmill: [
    { id: 1, name: '极光闪电', avatar: avatars[0], unlockedRoutes: 186 },
    { id: 2, name: '城市探险家', avatar: avatars[1], unlockedRoutes: 174 },
    { id: 3, name: '追光者·星', avatar: avatars[2], unlockedRoutes: 168 },
    { id: 4, name: '夜行猎手', avatar: avatars[3], unlockedRoutes: 151 },
    { id: 5, name: '风行无阻', avatar: avatars[4], unlockedRoutes: 146 },
    { id: 6, name: '地球狂奔', avatar: avatars[5], unlockedRoutes: 139 },
    { id: 7, name: '阿兹特克', avatar: avatars[6], unlockedRoutes: 128 },
    { id: 8, name: '超越极限', avatar: avatars[7], unlockedRoutes: 116 }
  ],
  'walking-pad': [
    { id: 11, name: '漫步云端', avatar: avatars[4], unlockedRoutes: 172 },
    { id: 12, name: '日行万步', avatar: avatars[2], unlockedRoutes: 165 },
    { id: 13, name: '轻盈步履', avatar: avatars[6], unlockedRoutes: 157 },
    { id: 14, name: '城市慢游者', avatar: avatars[0], unlockedRoutes: 143 },
    { id: 15, name: '一路向前', avatar: avatars[7], unlockedRoutes: 132 },
    { id: 16, name: '晨光漫行', avatar: avatars[1], unlockedRoutes: 124 },
    { id: 17, name: '步履不停', avatar: avatars[5], unlockedRoutes: 118 },
    { id: 18, name: '万步达人', avatar: avatars[3], unlockedRoutes: 109 }
  ]
};

const currentUserByCategory = {
  treadmill: { rank: 142, unlockedRoutes: 29 },
  'walking-pad': { rank: 186, unlockedRoutes: 18 }
};

const equipmentTabs: Array<{ id: EquipmentCategory; label: string; icon: typeof Activity }> = [
  { id: 'treadmill', label: '跑步机', icon: Activity },
  { id: 'walking-pad', label: '走步机', icon: Footprints }
];

export default function LeaderboardView({ onBack }: LeaderboardViewProps) {
  const [showRules, setShowRules] = useState(false);
  const [category, setCategory] = useState<EquipmentCategory>('treadmill');
  const ranking = leaderboardData[category];
  const currentUser = currentUserByCategory[category];
  const podiumOrder = [ranking[1], ranking[0], ranking[2]];

  return (
    <main className={`leaderboard-page leaderboard-page--${category}`} id="main-content">
      <header className="leaderboard-header">
        <button type="button" onClick={onBack} aria-label="返回世界页"><ChevronLeft /></button>
        <div><small>全球路线排名</small><h1>全球跑者榜</h1></div>
        <button type="button" onClick={() => setShowRules(true)} aria-label="查看排行榜规则"><Info /><span>规则</span></button>
      </header>

      <div className="leaderboard-tabs" role="tablist" aria-label="设备类型">
        {equipmentTabs.map(tab => {
          const Icon = tab.icon;
          const selected = tab.id === category;
          return (
            <button key={tab.id} type="button" role="tab" aria-selected={selected} className={selected ? 'is-active' : ''} onClick={() => setCategory(tab.id)}>
              <Icon /><span>{tab.label}</span>{selected && <i aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          className="leaderboard-ranking"
          key={category}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          aria-label={`${category === 'treadmill' ? '跑步机' : '走步机'}排行榜`}
        >
          <div className="leaderboard-podium">
            {podiumOrder.map((user, podiumIndex) => {
              const rank = podiumIndex === 0 ? 2 : podiumIndex === 1 ? 1 : 3;
              return (
                <article className={`leaderboard-podium__item leaderboard-podium__item--${rank}`} key={user.id}>
                  {rank === 1 && <Trophy className="leaderboard-podium__trophy" aria-hidden="true" />}
                  <div className="leaderboard-podium__avatar"><img src={user.avatar} alt="" /><b>{rank}</b></div>
                  <h3>{user.name}</h3>
                  <p><strong>{user.unlockedRoutes}</strong><span>条路线</span></p>
                  <i aria-hidden="true" />
                </article>
              );
            })}
          </div>

          <div className="leaderboard-list-heading"><span>全球排名</span><span>已解锁路线</span></div>
          <div className="leaderboard-list">
            {ranking.slice(3).map((user, index) => (
              <motion.article key={user.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.035 }}>
                <b>{String(index + 4).padStart(2, '0')}</b>
                <img src={user.avatar} alt="" />
                <div><strong>{user.name}</strong><small>已探索 {Math.ceil(user.unlockedRoutes / 10)} 座城市</small></div>
                <p><strong>{user.unlockedRoutes}</strong><span>条</span></p>
              </motion.article>
            ))}
          </div>
        </motion.section>
      </AnimatePresence>

      <aside className="leaderboard-current" aria-label={`我的排名 ${currentUser.rank}，已解锁 ${currentUser.unlockedRoutes} 条路线`}>
        <b>{currentUser.rank}</b>
        <span className="leaderboard-current__avatar">我</span>
        <div><small>我的排名</small><strong>沐小六</strong></div>
        <p><strong>{currentUser.unlockedRoutes}</strong><span>条路线</span></p>
      </aside>

      <AnimatePresence>
        {showRules && (
          <motion.div className="leaderboard-rules-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowRules(false)}>
            <motion.section
              className="leaderboard-rules"
              role="dialog"
              aria-modal="true"
              aria-labelledby="leaderboard-rules-title"
              initial={{ y: 28, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 28, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 360, damping: 30 }}
              onClick={event => event.stopPropagation()}
            >
              <header><div><small>排名规则</small><h2 id="leaderboard-rules-title">怎样提升排名？</h2></div><button type="button" onClick={() => setShowRules(false)} aria-label="关闭规则"><X /></button></header>
              <ol>
                <li><b>01</b><p><strong>解锁路线即计入</strong><span>累计解锁的城市路线越多，排名越高。</span></p></li>
                <li><b>02</b><p><strong>设备榜单独立计算</strong><span>跑步机与走步机分别统计，不重复累计。</span></p></li>
                <li><b>03</b><p><strong>同数量按完成时间排序</strong><span>路线数量相同时，较早达成的用户优先。</span></p></li>
              </ol>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
