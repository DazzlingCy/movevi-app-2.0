import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play } from 'lucide-react';
import { CITIES_BY_CONTINENT, CONTINENTS_ORDER, CityData } from '../data/cities';
import { cn } from '../lib/utils';
import CityImage from './CityImage';

const CONTINENT_ICONS: Record<string, string> = {
  '中国': '🏯',
  '亚洲其他': '🪷',
  '欧洲': '🏰',
  '非洲': '🏜️',
  '北美洲': '🗽',
  '南美洲': '⛰️',
  '大洋洲': '🗿'
};

export default function CitiesTab({ onCityClick }: { onCityClick?: (city: CityData) => void }) {
  const [activeContinent, setActiveContinent] = useState(CONTINENTS_ORDER[0]);

  return (
    <div className="w-full h-full bg-[#05070A] flex flex-col text-slate-100 font-sans">
      {/* Header */}
      <div className="shrink-0 bg-black/40 backdrop-blur-md pt-safet pt-4 pb-4 border-b border-white/10 relative z-20 flex items-center justify-center px-4">
        <h1 className="text-base font-bold text-center tracking-wider">城市列表</h1>
      </div>

      {/* Main Layout Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <div className="w-[85px] shrink-0 bg-white/5 border-r border-white/10 flex flex-col items-center py-4 overflow-y-auto hide-scrollbar space-y-6">
          {CONTINENTS_ORDER.map(continent => {
            const isActive = activeContinent === continent;
            return (
              <button
                key={continent}
                onClick={() => setActiveContinent(continent)}
                className="flex flex-col items-center gap-2 relative w-full group"
              >
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-red-500 rounded-r-full shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                  />
                )}
                <div className={cn(
                  "relative w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-300 border-2",
                  isActive 
                    ? "bg-red-500/10 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.2)]" 
                    : "bg-white/5 border-transparent group-hover:bg-white/10 grayscale-[50%] opacity-70"
                )}>
                  {CONTINENT_ICONS[continent]}
                  {isActive && (
                    <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#0B1015]" />
                  )}
                </div>
                <span className={cn(
                  "text-xs font-medium tracking-widest transition-colors",
                  isActive ? "text-red-400 font-bold" : "text-slate-500 group-hover:text-slate-300"
                )}>
                  {continent}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 overflow-y-auto hide-scrollbar px-4 py-5 bg-[#05070A] pb-32">
          <div className="space-y-4">
            {CITIES_BY_CONTINENT[activeContinent]?.map((city, idx) => (
              <motion.div
                key={city.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onCityClick && onCityClick(city)}
                className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 shadow-lg flex p-2.5 gap-4 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div className="relative w-[110px] h-[110px] shrink-0 rounded-xl overflow-hidden">
                  <CityImage
                    src={city.image} 
                    alt={city.name}
                    fallbackLabel={city.name}
                    className="absolute inset-0 w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                </div>
                
                <div className="flex-1 flex flex-col py-1 pr-2">
                  <h3 className="text-base font-bold text-slate-100 tracking-wide">{city.name}</h3>
                  
                  <div className="flex gap-4 mt-auto mb-1.5">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-slate-200">{city.routes}</span>
                      <span className="text-[10px] text-slate-500">路线</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-slate-200">{city.spots}</span>
                      <span className="text-[10px] text-slate-500">景点</span>
                    </div>
                  </div>
                  
                  <div className="mt-1">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] text-slate-500">完成进度</span>
                      <span className="text-[10px] text-amber-500 font-mono font-medium">{city.completed}/{city.routes}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                        style={{ width: `${(city.completed / city.routes) * 100}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {(!CITIES_BY_CONTINENT[activeContinent] || CITIES_BY_CONTINENT[activeContinent].length === 0) && (
              <div className="text-center text-slate-500 text-xs py-10">
                暂无城市数据
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
