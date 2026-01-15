
import React from 'react';
import { SCENARIOS, THEME_CONFIG } from '../constants';
import { Scenario } from '../types';
import { MapPin, Star, ChevronRight, Tag, Settings } from 'lucide-react';

interface HomeProps {
  onSelectScenario: (scenario: Scenario) => void;
  onOpenAdmin: () => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectScenario, onOpenAdmin }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] pb-24 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 py-4 flex justify-between items-center border-b backdrop-blur-md bg-white/80 border-gray-200 dark:bg-[#050505]/90 dark:border-[#1c1c22] transition-colors duration-300">
        <div className="flex items-center space-x-2">
          <div className="flex items-center font-bold text-lg tracking-tight text-gray-900 dark:text-white">
            <MapPin size={18} className="mr-1 text-[#ff2e4d]" />
            <span>北京</span>
          </div>
          <span className="text-gray-400 text-sm">·</span>
          <span className="text-gray-500 dark:text-gray-300 text-sm font-medium">严选场馆</span>
        </div>
        <button 
          onClick={onOpenAdmin}
          className="p-2 rounded-full bg-gray-100 dark:bg-[#1c1c22] text-gray-500 dark:text-gray-400"
        >
          <Settings size={18} />
        </button>
      </header>

      {/* Hero / Promo */}
      <div className="mt-4 px-4">
        <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
          不仅仅是 <span className="text-[#ff2e4d] neon-text-red">电影</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">会议路演 · 求婚策划 · 粉丝应援</p>
      </div>

      {/* Scenario Shelf */}
      <div className="space-y-6 px-4">
        {SCENARIOS.map((scenario) => {
          const theme = THEME_CONFIG[scenario.category];
          
          return (
            <div 
              key={scenario.id}
              onClick={() => onSelectScenario(scenario)}
              className={`group relative rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer active:scale-[0.98] 
                bg-white border-gray-100 shadow-sm hover:shadow-md 
                dark:bg-[#1c1c22] dark:border-[#2a2a35] dark:shadow-lg ${theme.borderColor}`}
            >
              {/* Image */}
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={scenario.image} 
                  alt={scenario.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-95 dark:opacity-90"
                />
                <div className="absolute top-3 right-3 px-2 py-1 rounded-md flex items-center text-xs font-bold z-10 
                  bg-white/90 text-yellow-600 border border-yellow-500/20 shadow-sm
                  dark:bg-black/60 dark:text-yellow-400 dark:backdrop-blur-sm">
                  <Star size={12} className="mr-1 fill-current" />
                  {scenario.rating}
                </div>
                
                {/* Category Badge */}
                <div className={`absolute top-3 left-3 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md z-10 flex items-center ${theme.badgeStyle}`}>
                    <Tag size={10} className="mr-1" />
                    {theme.label}
                </div>

                {/* Theme tint overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t ${theme.gradientFrom} to-transparent opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                
                <div className="absolute bottom-3 left-4 right-4 z-10">
                  <h2 className={`text-xl font-bold mb-1 transition-colors text-white drop-shadow-md`}>{scenario.title}</h2>
                  <div className="flex flex-wrap gap-2">
                      {scenario.tags.map((tag, i) => (
                          <span key={i} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded backdrop-blur-md 
                            bg-white/20 text-white border border-white/10 shadow-sm">
                              {tag}
                          </span>
                      ))}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 flex justify-between items-center relative z-20 bg-white dark:bg-[#1c1c22]">
                  <div className="flex flex-col max-w-[85%]">
                      <div className="flex items-center text-xs mb-1 text-gray-500 dark:text-gray-500">
                        <MapPin size={10} className="mr-1 flex-shrink-0" />
                        <span className="truncate">{scenario.location}</span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-300">
                        起价 <span className="font-bold text-lg font-mono text-gray-900 dark:text-white">¥{scenario.packages[0].price}</span>
                      </span>
                  </div>
                  <div className={`p-2 rounded-full transition-colors flex-shrink-0 
                    bg-gray-50 text-gray-400 group-hover:bg-gray-100 group-hover:text-gray-600
                    dark:bg-[#2a2a35] dark:text-gray-400 dark:group-hover:bg-white/10 dark:group-hover:${theme.iconColor}`}>
                      <ChevronRight size={20} />
                  </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Rebook (Optional Row) */}
      <div className="mt-8 px-4">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 dark:text-gray-400">猜你喜欢</h3>
        </div>
        <div className="p-3 rounded-lg flex items-center justify-between border 
          bg-white border-gray-100 shadow-sm
          dark:bg-[#15151a] dark:border-[#222]">
            <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-md overflow-hidden relative bg-gray-100 dark:bg-gray-800">
                   <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=100&q=80" className="w-full h-full object-cover opacity-80" /> 
                </div>
                <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">电竞对战团建包</div>
                    <div className="text-xs text-gray-500">耀莱成龙影城（五棵松店）</div>
                </div>
            </div>
            <button className="text-xs px-3 py-1 rounded border 
              text-[#ff2e4d] border-[#ff2e4d] bg-[#ff2e4d]/5">
                去看看
            </button>
        </div>
      </div>
    </div>
  );
};
