import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Award,
  Check,
  ChevronLeft,
  Crown,
  Download,
  Gift,
  Lock,
  MapPin,
  Play,
  Share2,
  Shuffle,
  Sparkles,
  UserPlus,
  Users,
  X
} from 'lucide-react';
import { CITIES, getRouteData } from '../data/cities';
import CityImage from './CityImage';

export interface TeamRelayMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  isSelf?: boolean;
}

export interface TeamRelayTask {
  id: string;
  memberId: string;
  cityId: string;
  routeIndex: number;
  image: string;
}

interface SplitReward {
  memberId: string;
  amount: number;
}

interface TeamRelayRoom {
  id: string;
  name: string;
  captainId: string;
  members: TeamRelayMember[];
  createdAt: string;
  status: 'recruiting' | 'full' | 'started';
}

interface TeamRelayViewProps {
  onBack: () => void;
  started: boolean;
  members: TeamRelayMember[];
  tasks: TeamRelayTask[];
  completedTaskIds: string[];
  lotteryChances: number;
  drawHistory: number[];
  shareBonusClaimed: boolean;
  cityId: string | null;
  puzzleAwarded: boolean;
  onUpdateState: (newState: {
    started?: boolean;
    members?: TeamRelayMember[];
    tasks?: TeamRelayTask[];
    completedTaskIds?: string[];
    lotteryChances?: number;
    drawHistory?: number[];
    shareBonusClaimed?: boolean;
    cityId?: string | null;
    puzzleAwarded?: boolean;
  }) => void;
  onNavigateToRouteDetail: (cityId: string, routeIndex: number, image: string, taskId: string) => void;
}

const DEFAULT_MEMBERS: TeamRelayMember[] = [
  { id: 'self', name: '沐小六', role: '拼图发起人', avatar: 'M', color: 'from-cyan-300 to-emerald-300', isSelf: true },
  { id: 'teammate-lin', name: '林间风', role: '城市采集员', avatar: 'L', color: 'from-amber-200 to-orange-400' },
  { id: 'teammate-chen', name: '晨星', role: '路线修复师', avatar: 'C', color: 'from-fuchsia-300 to-rose-400' },
  { id: 'teammate-ye', name: '夜航员', role: '终点守望者', avatar: 'Y', color: 'from-indigo-300 to-sky-400' }
];

const TEAM_SIZE = 2;

const LOBBY_ROOMS: TeamRelayRoom[] = [
  {
    id: 'room-orbit-07',
    name: '晨跑拼图 07 队',
    captainId: 'lobby-captain-a',
    members: [
      { id: 'lobby-captain-a', name: '北岸', role: '队长', avatar: 'B', color: 'from-sky-300 to-cyan-400' }
    ],
    createdAt: '刚刚',
    status: 'recruiting'
  },
  {
    id: 'room-memory-12',
    name: '夜跑记忆 12 队',
    captainId: 'lobby-captain-b',
    members: [
      { id: 'lobby-captain-b', name: '远星', role: '队长', avatar: 'Y', color: 'from-violet-300 to-fuchsia-400' },
      { id: 'lobby-member-b', name: '拾光', role: '队员', avatar: 'S', color: 'from-amber-200 to-orange-400' }
    ],
    createdAt: '3分钟前',
    status: 'full'
  },
  {
    id: 'room-river-03',
    name: '河岸拾光 03 队',
    captainId: 'lobby-captain-c',
    members: [
      { id: 'lobby-captain-c', name: '江临', role: '队长', avatar: 'J', color: 'from-cyan-200 to-blue-400' }
    ],
    createdAt: '6分钟前',
    status: 'recruiting'
  },
  {
    id: 'room-echo-18',
    name: '旧街回声 18 队',
    captainId: 'lobby-captain-d',
    members: [
      { id: 'lobby-captain-d', name: '阿衡', role: '队长', avatar: 'H', color: 'from-rose-200 to-pink-400' }
    ],
    createdAt: '8分钟前',
    status: 'recruiting'
  },
  {
    id: 'room-dawn-21',
    name: '晨光地图 21 队',
    captainId: 'lobby-captain-e',
    members: [
      { id: 'lobby-captain-e', name: '晓川', role: '队长', avatar: 'X', color: 'from-amber-200 to-yellow-400' }
    ],
    createdAt: '12分钟前',
    status: 'recruiting'
  }
];

const MEMBER_ORDER = ['self', 'teammate-lin'];
const PUZZLE_ROUTE_COUNT = 8;
const TOTAL_SPLIT_REWARD = 20;
const PIECE_COLORS = [
  'linear-gradient(135deg, rgba(103,232,249,0.92), rgba(52,211,153,0.76))',
  'linear-gradient(135deg, rgba(245,208,110,0.92), rgba(251,146,60,0.76))',
  'linear-gradient(135deg, rgba(125,211,252,0.9), rgba(129,140,248,0.78))',
  'linear-gradient(135deg, rgba(45,212,191,0.9), rgba(34,197,94,0.74))',
  'linear-gradient(135deg, rgba(250,204,21,0.92), rgba(244,114,182,0.76))',
  'linear-gradient(135deg, rgba(56,189,248,0.9), rgba(168,85,247,0.74))',
  'linear-gradient(135deg, rgba(110,231,183,0.92), rgba(34,211,238,0.72))',
  'linear-gradient(135deg, rgba(251,191,36,0.92), rgba(248,113,113,0.74))'
];

const CITY_MAP_PIECE_SETS: Record<string, Array<{ left: string; top: string; width: string; height: string; clipPath: string }>> = {
  '1': [
    { left: '6%', top: '20%', width: '24%', height: '27%', clipPath: 'polygon(0 6%, 72% 0, 100% 35%, 86% 100%, 12% 92%)' },
    { left: '26%', top: '14%', width: '24%', height: '31%', clipPath: 'polygon(8% 10%, 100% 0, 88% 92%, 0 100%, 12% 48%)' },
    { left: '48%', top: '18%', width: '23%', height: '27%', clipPath: 'polygon(0 0, 86% 8%, 100% 86%, 15% 100%, 8% 42%)' },
    { left: '68%', top: '28%', width: '23%', height: '25%', clipPath: 'polygon(12% 0, 100% 16%, 86% 92%, 0 100%, 10% 44%)' },
    { left: '10%', top: '48%', width: '23%', height: '31%', clipPath: 'polygon(0 0, 90% 10%, 100% 76%, 28% 100%, 8% 54%)' },
    { left: '31%', top: '49%', width: '26%', height: '30%', clipPath: 'polygon(7% 14%, 100% 0, 88% 100%, 0 92%, 14% 44%)' },
    { left: '55%', top: '48%', width: '24%', height: '31%', clipPath: 'polygon(0 8%, 88% 0, 100% 70%, 43% 100%, 8% 85%)' },
    { left: '73%', top: '49%', width: '20%', height: '27%', clipPath: 'polygon(18% 4%, 100% 0, 90% 92%, 0 100%, 12% 38%)' }
  ],
  '2': [
    { left: '9%', top: '17%', width: '21%', height: '30%', clipPath: 'polygon(0 14%, 86% 0, 100% 88%, 16% 100%)' },
    { left: '30%', top: '15%', width: '20%', height: '29%', clipPath: 'polygon(6% 0, 100% 8%, 92% 100%, 0 86%)' },
    { left: '50%', top: '18%', width: '20%', height: '28%', clipPath: 'polygon(0 6%, 90% 0, 100% 88%, 12% 100%)' },
    { left: '70%', top: '17%', width: '19%', height: '31%', clipPath: 'polygon(0 0, 92% 16%, 100% 100%, 8% 86%)' },
    { left: '8%', top: '49%', width: '22%', height: '29%', clipPath: 'polygon(10% 0, 100% 9%, 84% 100%, 0 86%)' },
    { left: '30%', top: '47%', width: '21%', height: '30%', clipPath: 'polygon(0 8%, 92% 0, 100% 92%, 8% 100%)' },
    { left: '51%', top: '49%', width: '21%', height: '29%', clipPath: 'polygon(8% 0, 100% 8%, 84% 100%, 0 88%)' },
    { left: '72%', top: '48%', width: '18%', height: '30%', clipPath: 'polygon(0 8%, 100% 0, 86% 88%, 8% 100%)' }
  ],
  '3': [
    { left: '7%', top: '18%', width: '20%', height: '52%', clipPath: 'polygon(18% 0, 100% 8%, 76% 100%, 0 84%)' },
    { left: '26%', top: '15%', width: '21%', height: '31%', clipPath: 'polygon(0 12%, 100% 0, 86% 92%, 12% 100%)' },
    { left: '47%', top: '17%', width: '20%', height: '29%', clipPath: 'polygon(0 0, 92% 10%, 100% 88%, 14% 100%)' },
    { left: '66%', top: '18%', width: '23%', height: '31%', clipPath: 'polygon(8% 0, 100% 20%, 80% 100%, 0 82%)' },
    { left: '28%', top: '47%', width: '19%', height: '29%', clipPath: 'polygon(8% 0, 100% 8%, 88% 100%, 0 82%)' },
    { left: '47%', top: '48%', width: '21%', height: '29%', clipPath: 'polygon(0 0, 100% 10%, 76% 100%, 8% 88%)' },
    { left: '66%', top: '50%', width: '21%', height: '25%', clipPath: 'polygon(12% 0, 100% 10%, 78% 92%, 0 100%)' },
    { left: '81%', top: '44%', width: '12%', height: '30%', clipPath: 'polygon(22% 0, 100% 28%, 78% 100%, 0 74%)' }
  ]
};

const FALLBACK_CITY_MAP_PIECES = CITY_MAP_PIECE_SETS['1'];

const getCityMapPieces = (cityId: string | undefined, count: number) => {
  const base = CITY_MAP_PIECE_SETS[cityId || ''] || CITY_MAP_PIECE_SETS[String(((Number(cityId || 1) - 1) % 3) + 1)] || FALLBACK_CITY_MAP_PIECES;
  return Array.from({ length: count }).map((_, index) => ({
    ...base[index % base.length],
    background: PIECE_COLORS[index % PIECE_COLORS.length]
  }));
};
const createSplitPrizeMap = (memberIds: string[]) => {
  const totalCents = TOTAL_SPLIT_REWARD * 100;
  const minCents = 280;
  const remainingCents = totalCents - minCents * memberIds.length;
  const weights = memberIds.map(() => 0.55 + Math.random());
  const weightTotal = weights.reduce((sum, weight) => sum + weight, 0);
  const prizes = memberIds.map((memberId, index) => ({
    memberId,
    cents: minCents + Math.floor((weights[index] / weightTotal) * remainingCents)
  }));
  const diff = totalCents - prizes.reduce((sum, prize) => sum + prize.cents, 0);
  prizes[0].cents += diff;

  return prizes.reduce<Record<string, number>>((map, prize) => {
    map[prize.memberId] = Number((prize.cents / 100).toFixed(2));
    return map;
  }, {});
};

const availableCities = () => CITIES.filter(city => city.status !== 'upcoming' && city.routes > 0);

const pickRandomCity = () => {
  const cities = availableCities();
  return cities[Math.floor(Math.random() * cities.length)] || cities[0] || CITIES[0];
};

const buildPuzzleTasks = (selectedCityId: string, memberIds: string[]): TeamRelayTask[] => {
  const city = CITIES.find(item => item.id === selectedCityId) || pickRandomCity();
  const assigneeIds = memberIds.length > 0 ? memberIds : MEMBER_ORDER;
  return Array.from({ length: PUZZLE_ROUTE_COUNT }).map((_, index) => ({
    id: `puzzle-${city.id}-${index + 1}`,
    memberId: assigneeIds[index % assigneeIds.length],
    cityId: city.id,
    routeIndex: index + 1,
    image: city.image
  }));
};

export default function TeamRelayView({
  onBack,
  started,
  members,
  tasks,
  completedTaskIds,
  lotteryChances,
  drawHistory,
  shareBonusClaimed,
  cityId,
  puzzleAwarded,
  onUpdateState,
  onNavigateToRouteDetail
}: TeamRelayViewProps) {
  const [viewMode, setViewMode] = useState<'main' | 'lottery' | 'lobby'>('main');
  const [showPoster, setShowPoster] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [lobbyRooms, setLobbyRooms] = useState<TeamRelayRoom[]>(LOBBY_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [splitRewards, setSplitRewards] = useState<SplitReward[]>([]);
  const [splitPrizeMap, setSplitPrizeMap] = useState<Record<string, number>>({});
  const [splitRoundActive, setSplitRoundActive] = useState(false);

  const activeMembers = members.length > 0 ? members : [];
  const hasTeam = activeMembers.length > 0;
  const isTeamFull = activeMembers.length >= TEAM_SIZE;
  const activeRoom = activeRoomId ? lobbyRooms.find(room => room.id === activeRoomId) || null : null;
  const activeCity = CITIES.find(city => city.id === (cityId || tasks[0]?.cityId)) || null;
  const activeTasks = started ? tasks : [];
  const totalPieces = activeTasks.length || activeCity?.routes || 0;
  const completedCount = activeTasks.filter(task => completedTaskIds.includes(task.id)).length;
  const isPuzzleCompleted = started && activeTasks.length > 0 && completedCount === activeTasks.length;
  const progress = totalPieces > 0 ? Math.round((completedCount / totalPieces) * 100) : 0;
  const routeCountLabel = started ? `${totalPieces || PUZZLE_ROUTE_COUNT}条路线` : `${PUZZLE_ROUTE_COUNT}条路线`;
  const mapPieces = getCityMapPieces(activeCity?.id, activeTasks.length || PUZZLE_ROUTE_COUNT);

  const totalDistance = useMemo(() => {
    return activeTasks.reduce((sum, task) => {
      const routeData = getRouteData(task.cityId, task.routeIndex);
      return sum + Number(routeData.distance || 0);
    }, 0).toFixed(1);
  }, [activeTasks]);

  const splitMembers = activeMembers.slice(0, TEAM_SIZE);
  const splitRoundComplete = splitMembers.length > 0 && splitMembers.every(member => splitRewards.some(reward => reward.memberId === member.id));
  const splitTotalReward = splitRewards.reduce((sum, reward) => sum + reward.amount, 0);
  const isSelfCaptain = activeRoom?.captainId === 'self';

  const getMember = (memberId: string) => activeMembers.find(member => member.id === memberId) || DEFAULT_MEMBERS[0];

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2400);
  };

  const handleCreateRoom = () => {
    if (started) return;
    if (hasTeam) {
      showToast('你已在一个小队中，不能重复创建或加入队伍');
      return;
    }
    const room: TeamRelayRoom = {
      id: `room-self-${Date.now()}`,
      name: '木卫六城市拼图队',
      captainId: 'self',
      members: [DEFAULT_MEMBERS[0]],
      createdAt: '刚刚',
      status: 'recruiting'
    };
    setLobbyRooms(prev => [room, ...prev]);
    setActiveRoomId(room.id);
    onUpdateState({
      started: false,
      members: room.members,
      tasks: [],
      completedTaskIds: [],
      cityId: null,
      puzzleAwarded: false,
      shareBonusClaimed: false
    });
    showToast('小队已创建，正在组队大厅招募队员');
  };

  const updateRoomMembers = (roomId: string, nextMembers: TeamRelayMember[]) => {
    setLobbyRooms(prev => prev.map(room => {
      if (room.id !== roomId) return room;
      return {
        ...room,
        members: nextMembers,
        status: nextMembers.length >= TEAM_SIZE ? 'full' : 'recruiting'
      };
    }));
    setActiveRoomId(roomId);
    onUpdateState({
      members: nextMembers,
      started: false,
      tasks: [],
      completedTaskIds: [],
      cityId: null,
      puzzleAwarded: false
    });
  };

  const startPuzzleForTeam = (membersForPuzzle: TeamRelayMember[], roomId: string | null = activeRoomId) => {
    if (membersForPuzzle.length === 0) {
      showToast('请先在组队大厅创建或加入小队');
      return;
    }
    if (membersForPuzzle.length < TEAM_SIZE) {
      showToast(`小队满 ${TEAM_SIZE} 人后会自动开启任务`);
      return;
    }

    const selectedCity = pickRandomCity();
    const taskMembers = membersForPuzzle.slice(0, TEAM_SIZE);
    onUpdateState({
      started: true,
      cityId: selectedCity.id,
      members: taskMembers,
      tasks: buildPuzzleTasks(selectedCity.id, taskMembers.map(member => member.id)),
      completedTaskIds: [],
      shareBonusClaimed: false,
      puzzleAwarded: false
    });
    if (roomId) {
      setLobbyRooms(prev => prev.map(room => (room.id === roomId ? { ...room, status: 'started' } : room)));
    }
    showToast(`已成功组队，${selectedCity.name}拼图任务已开启`);
  };

  const handleJoinRoom = (room: TeamRelayRoom) => {
    if (started) return;
    if (room.members.some(member => member.id === 'self')) {
      setActiveRoomId(room.id);
      showToast('已进入当前小队');
      return;
    }
    if (hasTeam) {
      showToast('你已在一个小队中，不能重复创建或加入队伍');
      return;
    }
    if (room.members.length >= TEAM_SIZE) {
      showToast('该小队已满员，请选择其他队伍');
      return;
    }

    const nextMembers = [...room.members, { ...DEFAULT_MEMBERS[0], role: '队员' }];
    updateRoomMembers(room.id, nextMembers);
    showToast(`已加入 ${room.name}`);
    if (nextMembers.length >= TEAM_SIZE) {
      window.setTimeout(() => startPuzzleForTeam(nextMembers, room.id), 300);
    }
  };

  const handleSimulateJoin = () => {
    if (!activeRoom || started) return;
    if (activeMembers.length >= TEAM_SIZE) {
      showToast('已成功组队，任务将自动开启');
      return;
    }

    const nextMember = DEFAULT_MEMBERS.find(member => !activeMembers.some(activeMember => activeMember.id === member.id));
    if (!nextMember) return;
    const nextMembers = [...activeMembers, nextMember];
    updateRoomMembers(activeRoom.id, nextMembers);
    showToast(`${nextMember.name} 已加入小队`);
    if (nextMembers.length >= TEAM_SIZE) {
      window.setTimeout(() => startPuzzleForTeam(nextMembers, activeRoom.id), 300);
    }
  };

  const handleStartPuzzle = () => {
    startPuzzleForTeam(activeMembers, activeRoomId);
  };

  const buildRewardState = (nextCompletedIds: string[]) => {
    const shouldAward = activeTasks.length > 0 && nextCompletedIds.length === activeTasks.length && !puzzleAwarded;
    return {
      completedTaskIds: nextCompletedIds,
      lotteryChances: lotteryChances + (shouldAward ? 1 : 0),
      puzzleAwarded: shouldAward ? true : puzzleAwarded
    };
  };

  const handleMainAction = () => {
    if (!started) {
      if (!hasTeam) {
        setViewMode('lobby');
        return;
      }
      if (!isTeamFull) {
        setViewMode('lobby');
        return;
      }
      handleStartPuzzle();
      return;
    }

    const nextTask = activeTasks.find(task => !completedTaskIds.includes(task.id));
    if (nextTask) {
      onNavigateToRouteDetail(nextTask.cityId, nextTask.routeIndex, nextTask.image, nextTask.id);
      return;
    }

    setViewMode('lottery');
  };

  const handleShareSuccess = () => {
    if (!isPuzzleCompleted) {
      showToast('完成整座城市拼图后即可分享成果海报');
      return;
    }
    if (shareBonusClaimed) {
      showToast('本次活动的分享加抽已领取');
      return;
    }
    onUpdateState({
      shareBonusClaimed: true,
      lotteryChances: lotteryChances + 1
    });
    showToast('分享成功，已获得 1 次额外抽奖机会');
  };

  const handleSplitDraw = (memberId: string) => {
    if (splitRewards.some(reward => reward.memberId === memberId)) return;
    if (!splitRoundActive && lotteryChances <= 0) return;

    const nextPrizeMap = splitRoundActive ? splitPrizeMap : createSplitPrizeMap(splitMembers.map(member => member.id));
    const prize = nextPrizeMap[memberId] ?? 0;
    const nextRewards = [...splitRewards, { memberId, amount: prize }];
    const nextHistory = splitRoundActive ? drawHistory : [TOTAL_SPLIT_REWARD, ...drawHistory];
    setSplitRewards(nextRewards);
    setSplitPrizeMap(nextPrizeMap);

    if (!splitRoundActive) {
      setSplitRoundActive(true);
      onUpdateState({
        lotteryChances: Math.max(0, lotteryChances - 1),
        drawHistory: nextHistory
      });
      return;
    }

    onUpdateState({ drawHistory: nextHistory });
  };

  const resetSplitRound = () => {
    setSplitRewards([]);
    setSplitPrizeMap({});
    setSplitRoundActive(false);
  };

  const renderPoster = () => (
    <AnimatePresence>
      {showPoster && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 bg-black/92 backdrop-blur-xl p-4 flex flex-col"
        >
          <div className="flex items-center justify-between shrink-0 pb-3 border-b border-white/10">
            <span className="text-xs font-black text-slate-200 tracking-widest">城市拼图成果海报</span>
            <button onClick={() => setShowPoster(false)} className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center py-4 overflow-hidden">
            <div className="w-[280px] bg-[#f6f1e6] text-[#17201b] rounded-[28px] p-5 shadow-2xl border border-[#f5d06e]/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-black tracking-[0.35em] text-[#7d7050]">MOVEVI 拼图</p>
                  <h3 className="text-xl font-black mt-1 leading-tight">{activeCity?.name || '随机城市'}拼图小队</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#17201b] text-[#f5d06e] flex items-center justify-center">
                  <MapPin size={18} />
                </div>
              </div>

              <div className="mt-5 rounded-2xl overflow-hidden h-32 relative">
                <CityImage
                  src={activeCity?.image || 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=600&q=80'}
                  alt={activeCity?.name || 'team puzzle'}
                  fallbackLabel={activeCity?.name || '拼图城市'}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/75 to-black/10" />
                <div className="absolute left-4 bottom-4 text-white">
                  <p className="text-[10px] font-bold text-white/70">城市拼图进度</p>
                  <p className="text-3xl font-black font-mono">{completedCount}/{totalPieces}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl bg-white/70 p-2">
                  <p className="text-[9px] text-[#776d55] font-bold">小队成员</p>
                  <p className="text-base font-black">{TEAM_SIZE}人</p>
                </div>
                <div className="rounded-2xl bg-white/70 p-2">
                  <p className="text-[9px] text-[#776d55] font-bold">拼图路线</p>
                  <p className="text-base font-black">{totalPieces}块</p>
                </div>
                <div className="rounded-2xl bg-white/70 p-2">
                  <p className="text-[9px] text-[#776d55] font-bold">团队宝箱</p>
                  <p className="text-base font-black">{isPuzzleCompleted ? '已解锁' : '待解锁'}</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-1.5">
                {activeTasks.map(task => {
                  const isDone = completedTaskIds.includes(task.id);
                  return (
                    <div key={task.id} className={`h-10 rounded-xl border flex items-center justify-center text-[10px] font-black ${isDone ? 'bg-[#17201b] text-[#f5d06e] border-[#17201b]' : 'bg-white/60 text-[#776d55] border-[#17201b]/10'}`}>
                      {isDone ? '已拼合' : `拼图${task.routeIndex}`}
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 pt-4 border-t border-[#17201b]/10 flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-[#776d55] font-bold">路线数量</p>
                  <p className="text-xs font-black font-mono">{routeCountLabel}</p>
                </div>
                <div className="w-10 h-10 bg-[#17201b] p-1 grid grid-cols-3 gap-0.5">
                  {Array.from({ length: 9 }).map((_, index) => (
                    <span key={index} className={`${index % 2 === 0 ? 'bg-[#f5d06e]' : 'bg-white'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="shrink-0 grid grid-cols-2 gap-3 bg-[#070b12] border border-white/10 rounded-3xl p-3">
            <button
              onClick={() => showToast('拼图海报已保存到本地相册')}
              className="py-3 rounded-2xl bg-white/8 border border-white/10 text-slate-200 text-xs font-black flex items-center justify-center gap-1.5"
            >
              <Download size={14} />
              保存海报
            </button>
            <button
              onClick={handleShareSuccess}
              disabled={!isPuzzleCompleted || shareBonusClaimed}
              className={`py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 ${
                !isPuzzleCompleted || shareBonusClaimed
                  ? 'bg-slate-800 text-slate-500'
                  : 'bg-[#26b180] text-white shadow-[0_0_18px_rgba(38,177,128,0.25)]'
              }`}
            >
              <Share2 size={14} />
              {shareBonusClaimed ? '已领取加抽' : '微信分享'}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderToast = () => (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="absolute bottom-24 left-4 right-4 z-[70] rounded-2xl border border-cyan-400/30 bg-[#08111e]/95 px-4 py-3 text-center text-xs font-black text-cyan-200 shadow-2xl"
        >
          {toast}
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (viewMode === 'lobby') {
    return (
      <div className="w-full h-full bg-[#05070A] text-slate-100 font-sans relative flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-5 pb-3 bg-black/75 border-b border-white/10 shrink-0">
          <button onClick={() => setViewMode('main')} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-sm font-black tracking-widest text-cyan-200">组队大厅</h2>
            <p className="text-[9px] text-slate-500 font-bold mt-0.5">创建或加入 {TEAM_SIZE} 人城市拼图小队</p>
          </div>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-5 pb-10 space-y-4">
          {!hasTeam ? (
            <button
              onClick={handleCreateRoom}
              className="w-full rounded-3xl bg-gradient-to-r from-cyan-400 to-emerald-300 text-slate-950 p-4 text-left active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-black">我是队长，创建小队</p>
                  <p className="mt-1 text-[10px] font-bold text-slate-800/70">创建后会展示在大厅，等待其他用户加入</p>
                </div>
                <Crown size={24} />
              </div>
            </button>
          ) : (
            <div className="rounded-3xl bg-[#08111e] border border-cyan-400/35 p-4 shadow-[0_18px_48px_rgba(8,145,178,0.1)]">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-black text-slate-100 truncate">{activeRoom?.name || '我的拼图小队'}</p>
                    <span className="rounded-full bg-[#f5d06e]/15 px-1.5 py-0.5 text-[8px] font-black text-[#f5d06e]">
                      {isSelfCaptain ? '队长' : '队员'}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] font-bold text-slate-500">{isTeamFull ? '已成功组队，任务将自动开启' : `等待其他用户加入，满 ${TEAM_SIZE} 人自动开启任务`}</p>
                </div>
                <div className="shrink-0 rounded-full bg-cyan-400 px-3 py-2 text-[10px] font-black text-slate-950">
                  已加入
                </div>
              </div>
              <div className="mt-3 flex -space-x-2">
                {Array.from({ length: TEAM_SIZE }).map((_, index) => {
                  const member = activeMembers[index];
                  return member ? (
                    <div
                      key={member.id}
                      className={`w-9 h-9 rounded-full bg-gradient-to-br ${member.color} border-2 border-[#08111e] flex items-center justify-center text-slate-950 text-[10px] font-black`}
                      title={member.name}
                    >
                      {member.avatar}
                    </div>
                  ) : (
                    <div key={`active-empty-${index}`} className="w-9 h-9 rounded-full bg-slate-900 border-2 border-[#08111e] flex items-center justify-center text-slate-600">
                      <UserPlus size={12} />
                    </div>
                  );
                })}
              </div>
              {!isTeamFull && (
                <button
                  onClick={handleSimulateJoin}
                  className="mt-4 w-full py-3 rounded-2xl bg-white/8 border border-white/10 text-slate-200 text-xs font-black flex items-center justify-center gap-1.5"
                >
                  <UserPlus size={14} />
                  模拟其他用户加入
                </button>
              )}
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black text-slate-200">大厅队伍列表</h3>
              <span className="text-[10px] font-black text-slate-500">{lobbyRooms.length} 支队伍</span>
            </div>
            {lobbyRooms.map(room => {
              const isJoined = activeRoomId === room.id || room.members.some(member => member.id === 'self');
              const roomFull = room.members.length >= TEAM_SIZE;
              const isBlockedByExistingTeam = hasTeam && !isJoined;
              return (
                <div key={room.id} className={`rounded-3xl border p-4 ${isJoined ? 'border-cyan-400/55 bg-cyan-950/25' : 'border-white/8 bg-[#080d15]'}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-black text-slate-100 truncate">{room.name}</p>
                        {room.captainId === 'self' && (
                          <span className="rounded-full bg-[#f5d06e]/15 px-1.5 py-0.5 text-[8px] font-black text-[#f5d06e]">队长</span>
                        )}
                      </div>
                      <p className="mt-1 text-[9px] font-bold text-slate-500">{room.createdAt} · {room.members.length}/{TEAM_SIZE} 人 · {roomFull ? '已满员' : '招募中'}</p>
                    </div>
                    <button
                      onClick={() => handleJoinRoom(room)}
                      disabled={(roomFull && !isJoined) || isBlockedByExistingTeam}
                      className={`shrink-0 rounded-2xl px-3 py-2 text-[10px] font-black ${
                        isJoined
                          ? 'bg-cyan-400 text-slate-950'
                          : roomFull || isBlockedByExistingTeam
                            ? 'bg-slate-800 text-slate-500'
                            : 'bg-white/10 text-slate-200 border border-white/10'
                      }`}
                    >
                      {isJoined ? '已加入' : roomFull ? '已满' : isBlockedByExistingTeam ? '不可加入' : '加入'}
                    </button>
                  </div>
                  <div className="mt-4 flex -space-x-2">
                    {room.members.map(member => (
                      <div
                        key={member.id}
                        className={`w-9 h-9 rounded-full bg-gradient-to-br ${member.color} border-2 border-[#080d15] flex items-center justify-center text-slate-950 text-[10px] font-black`}
                        title={member.name}
                      >
                        {member.avatar}
                      </div>
                    ))}
                    {Array.from({ length: Math.max(0, 4 - room.members.length) }).map((_, index) => (
                      <div key={`room-empty-${room.id}-${index}`} className="w-9 h-9 rounded-full bg-slate-900 border-2 border-[#080d15] flex items-center justify-center text-slate-600">
                        <UserPlus size={12} />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {renderToast()}
      </div>
    );
  }

  if (viewMode === 'lottery') {
    return (
      <div className="w-full h-full bg-[#05070A] text-slate-100 font-sans relative flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-5 pb-3 bg-black/75 border-b border-white/10 shrink-0">
          <button onClick={() => setViewMode('main')} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <h2 className="text-sm font-black tracking-widest text-[#f5d06e]">城市拼图瓜分奖励</h2>
            <p className="text-[9px] text-slate-500 font-bold mt-0.5">消耗 1 次机会，4 名队员各翻 1 张现金卡</p>
          </div>
          <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-5 pb-10 space-y-5">
          <div className="rounded-[28px] border border-[#f5d06e]/20 bg-gradient-to-br from-[#16100a] to-[#070b12] p-5 text-center shadow-[0_18px_60px_rgba(245,208,110,0.08)]">
            <div className="flex items-center justify-between gap-3 text-left">
              <div>
                <p className="text-[10px] text-slate-400 font-black tracking-widest">瓜分奖励总奖金</p>
                <p className="mt-1 text-4xl font-black font-mono text-[#f5d06e]">¥{TOTAL_SPLIT_REWARD}</p>
              </div>
              <div className="rounded-2xl bg-black/35 border border-white/10 px-3 py-2 text-right">
                <p className="text-[9px] text-slate-500 font-black">剩余机会</p>
                <p className="text-2xl font-black font-mono text-white">{lotteryChances}</p>
              </div>
            </div>
            <p className="mt-3 text-[10px] text-slate-500 font-bold">
              {splitRoundActive ? `本轮已翻 ${splitRewards.length}/${TEAM_SIZE} 张` : '点击任意现金卡开启瓜分'}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3">
              {splitMembers.map(member => {
                const reward = splitRewards.find(item => item.memberId === member.id);
                const isRevealed = !!reward;
                const isDisabled = isRevealed || (!splitRoundActive && lotteryChances <= 0);
                return (
                  <button
                    key={member.id}
                    onClick={() => handleSplitDraw(member.id)}
                    disabled={isDisabled}
                    className={`h-36 rounded-2xl border transition-all [perspective:800px] ${
                      isDisabled && !isRevealed
                        ? 'opacity-45 cursor-not-allowed border-white/5'
                        : 'active:scale-95 border-[#f5d06e]/25 hover:border-[#f5d06e]/60'
                    }`}
                  >
                    <motion.div
                      animate={{ rotateY: isRevealed ? 180 : 0 }}
                      transition={{ duration: 0.65 }}
                      className="relative w-full h-full [transform-style:preserve-3d]"
                    >
                      <div className="absolute inset-0 rounded-2xl bg-[#0c1320] border border-white/10 flex flex-col items-center justify-center [backface-visibility:hidden]">
                        <Gift size={26} className="text-[#f5d06e]" />
                        <span className="text-xs font-black mt-2 text-slate-200">现金卡</span>
                        <span className="text-[9px] text-slate-500 font-bold mt-1">点击翻开</span>
                      </div>
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#f5d06e] to-[#ff5c7a] text-[#17120a] flex flex-col items-center justify-center [transform:rotateY(180deg)] [backface-visibility:hidden]">
                        <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-slate-950 text-xs font-black mb-2 border border-black/10`}>
                          {member.avatar}
                        </div>
                        <span className="text-xs font-black">{member.name}</span>
                        <span className="text-[10px] font-bold mt-1 opacity-70">分得现金</span>
                        <span className="text-3xl font-black font-mono mt-1">¥{reward?.amount.toFixed(2) ?? '--'}</span>
                      </div>
                    </motion.div>
                  </button>
                );
              })}
            </div>

            {splitRewards.length > 0 && (
              <div className="mt-4 rounded-2xl bg-black/35 border border-[#f5d06e]/20 p-3 text-left">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black text-slate-200">
                    {splitRoundComplete ? '本轮瓜分完成' : '本轮瓜分中'}
                  </p>
                  <span className="text-sm font-black text-[#f5d06e] font-mono">¥{splitTotalReward.toFixed(2)}/¥{TOTAL_SPLIT_REWARD}</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {splitRewards.map(reward => {
                    const member = getMember(reward.memberId);
                    return (
                      <div key={reward.memberId} className="rounded-xl bg-white/5 border border-white/8 px-3 py-2 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-300">{member.name}</span>
                        <span className="text-xs font-black text-[#f5d06e] font-mono">¥{reward.amount.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
                {splitRoundComplete && (
                  <button
                    onClick={resetSplitRound}
                    disabled={lotteryChances <= 0}
                    className={`mt-3 w-full py-3 rounded-xl text-xs font-black ${
                      lotteryChances > 0 ? 'bg-[#f5d06e] text-slate-950' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {lotteryChances > 0 ? '再开一轮瓜分' : '暂无瓜分机会'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {renderToast()}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#04070d] text-slate-100 font-sans relative flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto hide-scrollbar pb-36">
        <div className="relative min-h-[345px] overflow-hidden">
          <CityImage
            src={activeCity?.image || 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1200&q=80'}
            alt={activeCity?.name || 'city puzzle'}
            fallbackLabel={activeCity?.name || '拼图城市'}
            className="absolute inset-0 w-full h-full object-cover opacity-58"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-[#07111b]/70 to-[#04070d]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_18%,rgba(245,208,110,0.2),transparent_34%)]" />

          <div className="relative z-10 px-4 pt-5">
            <div className="flex items-center justify-between">
              <button onClick={onBack} className="w-10 h-10 rounded-full bg-black/35 border border-white/10 backdrop-blur-md flex items-center justify-center">
                <ChevronLeft size={20} />
              </button>
              <div className="rounded-full border border-[#f5d06e]/25 bg-black/35 px-3 py-1.5 text-[10px] font-black text-[#f5d06e] backdrop-blur-md flex items-center gap-1.5">
                <Shuffle size={12} />
                随机城市拼图
              </div>
            </div>

            <div className="pt-12 text-left">
              <p className="text-[10px] font-black tracking-[0.28em] text-cyan-300">团队拼图活动</p>
              <h1 className="mt-2 text-[28px] leading-tight font-black text-white tracking-wide">城市拼图小队</h1>
              <p className="mt-3 text-[12px] leading-relaxed text-slate-300 font-semibold max-w-[340px]">
                进入组队大厅创建或加入 {TEAM_SIZE} 人小队。满员后提示组队成功并自动生成随机城市地图，团队每完成一条路线，就点亮一块地图区域。
              </p>

              <div className="mt-5 rounded-3xl border border-white/10 bg-black/35 p-3 backdrop-blur-md">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 font-black">{started ? '当前拼图城市' : hasTeam ? '当前小队' : '组队大厅'}</p>
                    <p className="text-sm font-black text-slate-100 mt-0.5 truncate">
                      {started && activeCity ? `${activeCity.name} · ${activeCity.englishName}` : hasTeam ? `${activeRoom?.name || '我的拼图小队'} · ${activeMembers.length}/${TEAM_SIZE}` : '创建小队或加入他人队伍'}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-slate-400 font-black">{started ? '路线数量' : '满员状态'}</p>
                    <p className="text-sm font-black font-mono text-[#f5d06e] mt-0.5">{started ? routeCountLabel : `${activeMembers.length}/${TEAM_SIZE}`}</p>
                  </div>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-[#f5d06e]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 -mt-4 relative z-20 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-[#080d15] border border-white/8 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
              <p className="text-xl font-black font-mono text-white">{completedCount}/{totalPieces || '-'}</p>
              <p className="text-[10px] text-slate-500 font-bold mt-2">拼图进度</p>
            </div>
            <div className="rounded-2xl bg-[#080d15] border border-white/8 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
              <p className="text-xl font-black font-mono text-cyan-300">{started ? totalDistance : '-'}</p>
              <p className="text-[10px] text-slate-500 font-bold mt-2">路线公里</p>
            </div>
            <div className="rounded-2xl bg-[#080d15] border border-white/8 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.22)]">
              <p className="text-xl font-black font-mono text-[#f5d06e]">{lotteryChances}</p>
              <p className="text-[10px] text-slate-500 font-bold mt-2">抽奖机会</p>
            </div>
          </div>

          <div className="rounded-3xl bg-[#080d15] border border-white/8 p-4">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <h2 className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                  <MapPin size={15} className="text-[#f5d06e]" />
                  {started ? `${activeCity?.name || '城市'}地图` : '城市拼图板'}
                </h2>
                <p className="mt-1 text-[10px] font-black text-slate-500">{started ? `${totalPieces}条路线` : '组队后生成'}</p>
              </div>
              {started && (
                <div className="shrink-0 text-right">
                  <p className="text-[9px] text-slate-500 font-black">点亮进度</p>
                  <p className={`text-lg font-black font-mono leading-none ${isPuzzleCompleted ? 'text-[#f5d06e]' : 'text-cyan-300'}`}>{completedCount}/{totalPieces}</p>
                </div>
              )}
            </div>
            {started ? (
              <div className={`relative h-[265px] rounded-[28px] overflow-hidden border ${isPuzzleCompleted ? 'border-[#f5d06e]/55 shadow-[0_0_36px_rgba(245,208,110,0.18)]' : 'border-white/10'} bg-[#070b12]`}>
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.8),rgba(2,6,23,0.4)),radial-gradient(circle_at_50%_42%,rgba(34,211,238,0.12),transparent_48%)]" />
                <div className="absolute inset-0 opacity-45 bg-[linear-gradient(rgba(148,163,184,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.10)_1px,transparent_1px)] bg-[size:18px_18px]" />
                <div className="absolute inset-5 rounded-[24px] border border-white/10 bg-black/10" />

                {activeTasks.map((task, index) => {
                  const routeData = getRouteData(task.cityId, task.routeIndex);
                  const isDone = completedTaskIds.includes(task.id);
                  const region = mapPieces[index % mapPieces.length];
                  return (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.04 }}
                      className="absolute flex items-center justify-center text-center transition-all duration-500"
                      style={{
                        left: region.left,
                        top: region.top,
                        width: region.width,
                        height: region.height,
                        clipPath: region.clipPath,
                        background: isDone ? region.background : 'linear-gradient(135deg, rgba(148,163,184,0.24), rgba(30,41,59,0.46))',
                        boxShadow: isDone ? '0 0 24px rgba(245,208,110,0.26), inset 0 0 0 1px rgba(255,255,255,0.3)' : 'inset 0 0 0 1px rgba(255,255,255,0.12)',
                        filter: isDone ? 'saturate(1.08)' : 'grayscale(1)'
                      }}
                    >
                      <div className={`w-full h-full px-2 flex flex-col items-center justify-center border border-white/10 ${isDone ? 'text-slate-950' : 'text-slate-400'}`}>
                        <span className={`text-[10px] font-black leading-none ${isDone ? 'text-slate-950' : 'text-slate-400'}`}>
                          {index + 1}
                        </span>
                        <span className={`mt-1 max-w-[72px] truncate text-[8px] font-black leading-none ${isDone ? 'text-slate-950' : 'text-slate-500'}`}>
                          {isDone ? '已拼合' : '待点亮'}
                        </span>
                      </div>
                      <span className="sr-only">
                        {routeData.title} {isDone ? '已点亮' : '未点亮'}
                      </span>
                    </motion.div>
                  );
                })}
                {isPuzzleCompleted && (
                  <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(245,208,110,0.18),transparent_55%)]" />
                )}
              </div>
            ) : (
              <button
                onClick={() => {
                  if (hasTeam && isTeamFull) {
                    handleStartPuzzle();
                    return;
                  }
                  setViewMode('lobby');
                }}
                className="w-full py-8 rounded-2xl border border-dashed border-[#f5d06e]/25 bg-black/20 flex flex-col items-center gap-2.5 text-center"
              >
                {isTeamFull ? <Shuffle size={22} className="text-[#f5d06e]" /> : <Lock size={22} className="text-[#f5d06e]" />}
                <span className="text-sm font-black text-slate-100">{isTeamFull ? '组队成功，正在生成城市地图' : hasTeam ? '等待满员后自动解锁城市地图' : '前往组队大厅创建或加入小队'}</span>
                <span className="text-[10px] text-slate-500 font-bold">地图会被拆成 8 块路线区域，完成路线即可点亮</span>
              </button>
            )}
          </div>

          <div className="rounded-3xl bg-[#080d15] border border-white/8 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                <Users size={15} className="text-cyan-300" />
                拼图小队
              </h2>
              <span className="text-[10px] font-black text-slate-500">{hasTeam ? `${activeMembers.length}/${TEAM_SIZE}` : '待组队'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Array.from({ length: TEAM_SIZE }).map((_, index) => {
                const member = activeMembers[index];
                if (!member) {
                  return (
                    <div key={`team-empty-${index}`} className="rounded-2xl bg-black/25 border border-white/5 p-2 text-center min-h-[94px] flex flex-col items-center justify-center">
                      <UserPlus size={18} className="text-slate-600" />
                      <p className="mt-2 text-[10px] font-black text-slate-600">待加入</p>
                    </div>
                  );
                }
                const memberTasks = activeTasks.filter(task => task.memberId === member.id);
                const memberDone = memberTasks.filter(task => completedTaskIds.includes(task.id)).length;
                return (
                  <div key={member.id} className="rounded-2xl bg-black/25 border border-white/5 p-2 text-center">
                    <div className={`mx-auto w-10 h-10 rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-slate-950 text-sm font-black`}>
                      {member.avatar}
                    </div>
                    <p className="mt-2 text-[10px] font-black text-slate-100 truncate">{member.name}</p>
                    <p className="text-[8px] text-slate-500 font-bold truncate">{member.role}</p>
                    <p className="mt-1 text-[9px] text-cyan-300 font-black">{memberDone}/{memberTasks.length || 0}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-[#080d15] border border-white/8 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                <Sparkles size={15} className="text-[#f5d06e]" />
                拼图任务列表
              </h2>
              {isPuzzleCompleted && (
                <span className="text-[10px] font-black text-emerald-300 flex items-center gap-1">
                  <Award size={12} />
                  拼图完成
                </span>
              )}
            </div>

            {started ? activeTasks.map((task, index) => {
              const routeData = getRouteData(task.cityId, task.routeIndex);
              const member = getMember(task.memberId);
              const isDone = completedTaskIds.includes(task.id);

              return (
                <div key={task.id} className={`rounded-2xl border p-3 flex gap-3 ${isDone ? 'bg-emerald-950/20 border-emerald-500/20' : 'bg-black/20 border-white/5'}`}>
                  <div className="relative w-16 h-16 shrink-0 rounded-2xl overflow-hidden">
                    <CityImage src={task.image} alt={routeData.title} fallbackLabel={routeData.title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className={`absolute inset-0 ${isDone ? 'bg-black/15' : 'bg-black/55 grayscale'}`} />
                    <span className="absolute left-1.5 top-1.5 rounded-md bg-black/60 px-1.5 py-0.5 text-[8px] font-black text-white">拼图{index + 1}</span>
                  </div>

                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className={`rounded-full bg-gradient-to-r ${member.color} px-2 py-0.5 text-[8px] font-black text-slate-950 shrink-0`}>
                        {member.name}
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold truncate">路线负责人</span>
                    </div>
                    <h3 className="mt-1.5 text-sm font-black text-slate-100 truncate">{routeData.title}</h3>
                    <p className="mt-1 text-[10px] text-slate-500 font-bold">
                      {routeData.distance} km · {routeData.duration}
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col items-end justify-center">
                    {isDone ? (
                      <span className="rounded-xl bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-1 text-[10px] font-black text-emerald-300 flex items-center gap-1">
                        <Check size={11} />
                        已拼合
                      </span>
                    ) : (
                      <button
                        onClick={() => started && onNavigateToRouteDetail(task.cityId, task.routeIndex, task.image, task.id)}
                        className="rounded-xl px-3 py-2 text-[10px] font-black flex items-center gap-1 bg-cyan-400 text-slate-950"
                      >
                        <Play size={10} className="fill-current" />
                        开跑
                      </button>
                    )}
                  </div>
                </div>
              );
            }) : (
              <p className="text-[11px] text-slate-500 font-bold py-2">组队成功后，这里会展示随机城市的全部路线拼图。</p>
            )}
          </div>

          <div className="rounded-3xl bg-[#080d15] border border-white/8 p-4">
            <h2 className="text-xs font-black text-slate-200 mb-3 flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#f5d06e]" />
              活动规则
            </h2>
            <div className="space-y-2.5 text-[11px] text-slate-400 font-bold leading-relaxed">
              <p>1. 用户可在组队大厅创建小队，也可加入大厅中的未满员队伍。</p>
              <p>2. 小队满 {TEAM_SIZE} 人后提示组队成功，并自动开启任务，系统随机生成 1 座当前可体验城市。</p>
              <p>3. 每座城市默认生成 8 条活动路线，每条路线对应地图上的 1 块区域。</p>
              <p>4. 全部点亮后获得 1 次瓜分奖励机会，分享成果海报可额外获得 1 次。</p>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-md pt-3.5 pb-5 px-4 border-t border-white/8">
        <div className="flex gap-3">
          <button
            onClick={handleMainAction}
            className={`flex-1 py-3.5 rounded-2xl font-black text-[13px] flex items-center justify-center gap-1.5 active:scale-95 transition-all ${
              !hasTeam
                ? 'bg-[#f5d06e] text-slate-950'
                : !started && !isTeamFull
                  ? 'bg-white/10 text-slate-200 border border-white/10'
                  : isPuzzleCompleted
                    ? 'bg-gradient-to-r from-[#f5d06e] to-amber-400 text-slate-950'
                    : 'bg-gradient-to-r from-cyan-400 to-emerald-300 text-slate-950'
            }`}
          >
            {!hasTeam ? (
              <>
                <Users size={15} />
                前往组队大厅
              </>
            ) : !started && !isTeamFull ? (
              <>
                <UserPlus size={15} />
                前往组队大厅 {activeMembers.length}/{TEAM_SIZE}
              </>
            ) : !started ? (
              <>
                <Shuffle size={15} />
                任务自动开启中
              </>
            ) : isPuzzleCompleted ? (
              <>
                <Gift size={15} />
                拼图完成，去抽奖
              </>
            ) : activeTasks.some(task => !completedTaskIds.includes(task.id)) ? (
              <>
                <ArrowRight size={15} />
                完成下一条路线
              </>
            ) : (
              <>
                <Gift size={15} />
                拼图完成，去抽奖
              </>
            )}
          </button>
          <button
            onClick={() => setViewMode('lobby')}
            className="w-12 h-12 rounded-2xl bg-[#0e1624] border border-white/8 text-cyan-200 flex items-center justify-center relative"
            title="组队大厅"
          >
            <Users size={18} />
            {hasTeam && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-cyan-400 text-[8px] text-slate-950 font-black flex items-center justify-center px-1">
                {activeMembers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setViewMode('lottery')}
            className="w-12 h-12 rounded-2xl bg-[#0e1624] border border-white/8 text-[#f5d06e] flex items-center justify-center relative"
            title="城市拼图宝箱"
          >
            <Gift size={18} />
            {lotteryChances > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 rounded-full bg-rose-600 text-[8px] text-white font-black flex items-center justify-center px-1">
                {lotteryChances}
              </span>
            )}
          </button>
        </div>
        <p className="mt-2 text-[9px] text-slate-500 font-bold text-center">
          多人拼图为前端模拟活动，不影响首页城市点亮进度
        </p>
      </div>

      {renderPoster()}
      {renderToast()}
    </div>
  );
}
