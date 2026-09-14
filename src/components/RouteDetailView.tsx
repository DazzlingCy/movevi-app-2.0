import { Play, ChevronRight, Wifi } from 'lucide-react';
import { getRouteData } from '../data/cities';
import CityImage from './CityImage';

interface RouteDetailViewProps {
  cityId: string;
  routeIndex: number;
  image: string;
  collectionIntent?: 'review' | 'collect';
  onBack: () => void;
  onStart: () => void;
}

export default function RouteDetailView({ cityId, routeIndex, image, collectionIntent, onBack, onStart }: RouteDetailViewProps) {
  const routeData = getRouteData(cityId, routeIndex);

  return (
    <div className="w-full h-full bg-[#f4f6f8] text-slate-800 font-sans relative flex flex-col hide-scrollbar">
      {/* Background Image Header */}
      <div className="relative w-full h-[45%] shrink-0">
        <CityImage src={image} alt="Route cover" fallbackLabel={routeData.title} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 pt-safeb px-4 py-4 z-10 flex items-center text-white">
          <button 
            onClick={onBack} 
            className="w-10 h-10 flex items-center justify-center bg-black/20 backdrop-blur-md rounded-full"
            aria-label="返回"
          >
            <ChevronRight className="rotate-180" size={24} />
          </button>
        </div>

        {/* Info overlay */}
        <div className="absolute bottom-16 left-6 right-6 text-white drop-shadow-md">
          <h1 className="text-2xl font-bold mb-3 tracking-wide drop-shadow-lg">路线{routeIndex}：{routeData.title}</h1>
          <div className="flex items-center text-sm font-medium">
            <div className="flex -space-x-2 mr-3">
              {[1, 2, 3].map((i) => (
                <img 
                  key={i}
                  src={`https://i.pravatar.cc/100?img=${i + 10}`} 
                  alt="avatar" 
                  className="w-7 h-7 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
            <span className="text-slate-100 text-xs drop-shadow">29人跑过</span>
          </div>
        </div>
      </div>

      {/* Overlapping Content Card */}
      <div className="flex-1 bg-white -mt-8 rounded-t-[32px] relative z-20 flex flex-col overflow-y-auto pb-32">
        
        {/* Stats Row */}
        <div className="flex justify-between items-center px-8 py-8 border-b border-slate-100">
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-slate-900 mb-1">{routeData.distance}</span>
            <span className="text-[10px] text-slate-500 flex flex-col items-center">
              <span>预计里程</span>
              <span>(km)</span>
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-slate-900 mb-1">{routeData.duration}</span>
            <span className="text-[10px] text-slate-500 flex flex-col items-center">
              <span>预计时长</span>
              <span>(min)</span>
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-slate-900 mb-1">{routeData.calories}</span>
            <span className="text-[10px] text-slate-500 flex flex-col items-center">
              <span>预计消耗</span>
              <span>(kcal)</span>
            </span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex flex-col items-center">
            <span className="text-2xl font-bold text-orange-500 mb-1">{routeData.rating}</span>
            <span className="text-[10px] text-slate-500 flex flex-col items-center">
              <span>路线评分</span>
              <span>(分)</span>
            </span>
          </div>
        </div>

        {/* Elevation Chart mockup */}
        <div className="w-full h-24 my-4 px-6 opacity-80">
          <svg viewBox="0 0 400 100" className="w-full h-full preserve-aspect-ratio-none">
            <defs>
              <linearGradient id="elevationGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path 
              d="M 0 80 Q 50 20 100 50 T 200 40 T 300 60 T 400 10 L 400 100 L 0 100 Z" 
              fill="url(#elevationGrad)" 
            />
            <path 
              d="M 0 80 Q 50 20 100 50 T 200 40 T 300 60 T 400 10" 
              fill="none" 
              stroke="#10b981" 
              strokeWidth="3" 
            />
          </svg>
        </div>

        {/* Content Sections */}
        <div className="px-6 space-y-8 mt-2">
          
          {/* Route spots */}
          <div>
             <div className="inline-block bg-gradient-to-r from-emerald-100 to-emerald-50 px-4 py-1.5 rounded-r-full -ml-6 mb-4 border-l-4 border-emerald-500">
               <span className="text-sm font-bold text-emerald-800">路线景点</span>
             </div>
             <p className="text-sm text-slate-600 font-medium leading-relaxed">
               {routeData.spots}
             </p>
          </div>

          {/* Route Intro */}
          <div>
             <div className="inline-block bg-gradient-to-r from-emerald-100 to-emerald-50 px-4 py-1.5 rounded-r-full -ml-6 mb-4 border-l-4 border-emerald-500">
               <span className="text-sm font-bold text-emerald-800">路线简介</span>
             </div>
             <p className="text-sm text-slate-500 leading-relaxed">
               {routeData.intro}
             </p>
          </div>

        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/94 backdrop-blur-xl border-t border-slate-100 px-6 pt-3 pb-8 z-30">
         <div className="mb-2 flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-700">
           <Wifi size={12} /> 跑步机已连接，点击即可开始
         </div>
         <button onClick={onStart} className="bg-[#2ecc71] hover:bg-[#27ae60] text-white w-full min-h-14 rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg shadow-[#2ecc71]/30 transition-transform active:scale-[.98]">
            <Play className="fill-white mr-2" size={20} />
            {collectionIntent === 'collect' ? '开始收集' : collectionIntent === 'review' ? '再跑一次' : '开始跑步'}
         </button>
      </div>

    </div>
  );
}
