
import React, { useState, useEffect } from 'react';
import { Scenario, ScenarioPackage, BookingState } from '../types';
import { ADDONS, TIME_SLOTS, THEME_CONFIG } from '../constants';
import { ChevronLeft, Info, Plus, Minus, CreditCard, Clock, Users, Zap, Tag, MapPin } from 'lucide-react';
import { NeonButton } from '../components/NeonButton';

interface DetailProps {
  scenario: Scenario;
  onBack: () => void;
  onSuccess: (bookingData: any) => void;
}

export const Detail: React.FC<DetailProps> = ({ scenario, onBack, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState('今天');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPkgId, setSelectedPkgId] = useState<string>(scenario.packages[0].id);
  const [addons, setAddons] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState(false);

  const theme = THEME_CONFIG[scenario.category];

  useEffect(() => {
    const firstAvailable = TIME_SLOTS.find(t => t.status === 'Available');
    if (firstAvailable) setSelectedTime(firstAvailable.time);
  }, []);

  const handleAddonUpdate = (id: string, delta: number) => {
    setAddons(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const getPackage = () => scenario.packages.find(p => p.id === selectedPkgId)!;

  const calculateTotal = () => {
    const pkgPrice = getPackage().price;
    const addonsPrice = ADDONS.reduce((sum, item) => {
      return sum + (item.price * (addons[item.id] || 0));
    }, 0);
    return pkgPrice + addonsPrice;
  };

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onSuccess({
        scenario,
        package: getPackage(),
        addons,
        total: calculateTotal(),
        time: selectedTime,
        date: selectedDate
      });
    }, 1500);
  };

  const selectedPkg = getPackage();
  const totalAddonsCount: number = (Object.values(addons) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#050505] pb-32 transition-colors duration-300">
      {/* Immersive Header */}
      <div className="relative h-72 bg-gray-200 dark:bg-gray-800 overflow-hidden">
        <img src={scenario.image} className="w-full h-full object-cover" alt="Hero" />
        {/* Adaptive Gradient Overlay */}
        <div className={`absolute inset-0 bg-gradient-to-b ${theme.heroOverlay} opacity-100`}></div>
        
        {/* Nav Back */}
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 p-2 rounded-full backdrop-blur-md active:scale-95 transition-transform z-10
            bg-white/60 text-black border border-white/20 shadow-sm
            dark:bg-black/40 dark:text-white dark:border-white/10"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Hero Content */}
        <div className="absolute bottom-4 left-4 right-4 z-10">
            <div className={`inline-flex items-center mb-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${theme.badgeStyle}`}>
                <Tag size={10} className="mr-1" />
                {theme.label}
            </div>
          <h1 className="text-2xl font-bold mb-2 leading-tight drop-shadow-md text-gray-900 dark:text-white">{scenario.title}</h1>
          <div className="flex flex-col space-y-2">
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-300">
                  <MapPin size={12} className="mr-1 flex-shrink-0 opacity-70" />
                  <span className="truncate">{scenario.location}</span>
              </div>
              <div className="flex space-x-3 text-sm font-medium">
                <div className="flex items-center px-2 py-1 rounded backdrop-blur-md 
                   bg-white/40 text-gray-800 border border-white/20
                   dark:bg-white/10 dark:text-gray-200">
                    <Users size={14} className={`mr-1.5 ${theme.iconColor}`} />
                    {scenario.tags[0]}
                </div>
                <div className="flex items-center px-2 py-1 rounded backdrop-blur-md
                   bg-white/40 text-gray-800 border border-white/20
                   dark:bg-white/10 dark:text-gray-200">
                    <Zap size={14} className={`mr-1.5 ${theme.iconColor}`} />
                    {scenario.tags[1]}
                </div>
              </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-8 mt-4">
        
        {/* 1. Date & Time Selection */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">选择场次</h2>
            <button className={`text-xs ${theme.iconColor}`}>查看日历</button>
          </div>
          {/* Date Strip */}
          <div className="flex space-x-3 overflow-x-auto no-scrollbar mb-4 pb-2">
             {['今天', '明天', '周五 24', '周六 25'].map(day => (
               <button 
                 key={day}
                 onClick={() => setSelectedDate(day)}
                 className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${
                   selectedDate === day 
                   ? 'bg-gray-900 text-white dark:bg-gray-200 dark:text-black' 
                   : 'bg-white text-gray-600 border border-gray-200 dark:bg-[#1c1c22] dark:text-gray-500 dark:border-[#2a2a35]'
                 }`}
               >
                 {day}
               </button>
             ))}
          </div>
          {/* Time Grid */}
          <div className="grid grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => {
               const isAvailable = slot.status === 'Available';
               const isSelected = selectedTime === slot.time;
               return (
                 <button
                   key={slot.time}
                   disabled={!isAvailable}
                   onClick={() => setSelectedTime(slot.time)}
                   className={`
                      relative p-2 rounded border text-center transition-all
                      ${!isAvailable 
                        ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-100 text-gray-400 dark:bg-[#1c1c22] dark:border-[#1c1c22] dark:text-gray-600' 
                        : ''}
                      ${isAvailable && !isSelected 
                        ? 'bg-white border-gray-200 text-gray-900 hover:border-gray-400 dark:bg-[#15151a] dark:border-[#333] dark:text-white dark:hover:border-[#555]' 
                        : ''}
                      ${isSelected 
                        ? 'bg-red-50 border-red-500 text-red-600 dark:bg-[#ff2e4d]/10 dark:border-[#ff2e4d] dark:text-[#ff2e4d] dark:shadow-[0_0_10px_rgba(255,46,77,0.2)]' 
                        : ''}
                   `}
                 >
                   <div className="text-sm font-bold font-mono">{slot.time}</div>
                   {!isAvailable && <div className="text-[10px] text-gray-400 dark:text-gray-500">售罄</div>}
                 </button>
               )
            })}
          </div>
        </section>

        {/* 2. Package Selection */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-500 dark:text-gray-400">选择套餐</h2>
          <div className="space-y-3">
             {scenario.packages.map((pkg) => (
               <div 
                 key={pkg.id}
                 onClick={() => setSelectedPkgId(pkg.id)}
                 className={`
                    relative p-4 rounded-xl border-2 transition-all cursor-pointer group shadow-sm
                    ${selectedPkgId === pkg.id 
                       ? 'border-[#ff2e4d] ring-1 ring-[#ff2e4d]/10 bg-white dark:bg-[#1c1c22] dark:shadow-[0_0_15px_rgba(255,46,77,0.15)] dark:ring-0' 
                       : 'border-gray-100 bg-white hover:border-gray-300 dark:border-[#2a2a35] dark:bg-[#15151a] dark:hover:border-gray-600'}
                 `}
               >
                  <div className="flex justify-between items-start">
                     <div>
                        <div className="flex items-center space-x-2">
                            <h3 className="font-bold text-gray-900 dark:text-white">{pkg.name}</h3>
                            {pkg.tags.length > 0 && (
                                <span className="bg-yellow-100 text-yellow-800 dark:bg-[#ffd700] dark:text-black text-[10px] font-bold px-1.5 py-0.5 rounded">{pkg.tags[0]}</span>
                            )}
                        </div>
                        <p className="text-xs mt-1 leading-relaxed max-w-[85%] text-gray-500 dark:text-gray-400">{pkg.desc}</p>
                     </div>
                     <div className="text-right">
                        <div className="text-[#ff2e4d] font-bold text-lg font-mono">¥{pkg.price}</div>
                        <div className="text-xs line-through text-gray-400 dark:text-gray-600">¥{pkg.originalPrice}</div>
                     </div>
                  </div>
                  {/* Selection Indicator */}
                  <div className={`absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 w-4 h-8 rounded-l-full bg-gray-50 dark:bg-[#050505] ${selectedPkgId === pkg.id ? 'block' : 'hidden'}`}></div>
               </div>
             ))}
          </div>
        </section>

        {/* 3. Add-ons */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider mb-3 text-gray-500 dark:text-gray-400">超值加购</h2>
          <div className="rounded-xl border divide-y shadow-sm
             bg-white border-gray-200 divide-gray-100
             dark:bg-[#15151a] dark:border-[#2a2a35] dark:divide-[#222]">
            {ADDONS.map((item) => (
              <div key={item.id} className="p-3 flex justify-between items-center">
                 <div>
                    <div className="text-sm text-gray-800 dark:text-gray-200">{item.name}</div>
                    <div className="text-xs font-mono text-gray-500 dark:text-gray-500">¥{item.price}</div>
                 </div>
                 <div className="flex items-center space-x-3 rounded-lg p-1 bg-gray-50 dark:bg-[#1c1c22]">
                    <button 
                      onClick={() => handleAddonUpdate(item.id, -1)}
                      className={`p-1 rounded transition-colors ${(addons[item.id] || 0) > 0 ? 'bg-gray-200 text-black dark:bg-gray-700 dark:text-white' : 'text-gray-400 dark:text-gray-600'}`}
                      disabled={!addons[item.id]}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm w-4 text-center font-mono text-gray-900 dark:text-white">{addons[item.id] || 0}</span>
                    <button 
                      onClick={() => handleAddonUpdate(item.id, 1)}
                      className="p-1 rounded text-white bg-[#ff2e4d]"
                    >
                      <Plus size={14} />
                    </button>
                 </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Sticky Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-[430px] mx-auto p-4 pb-10 z-50 backdrop-blur-xl bg-opacity-95 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] transition-colors duration-300
         bg-white/90 border-t border-gray-200
         dark:bg-[#0f0f13] dark:border-[#2a2a35] dark:shadow-2xl">
         <div className="flex items-center justify-between">
            <div className="flex flex-col">
               <div className="flex items-baseline space-x-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">总计</span>
                  <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white">¥{calculateTotal()}</span>
               </div>
               <div className="text-xs truncate max-w-[150px] text-gray-400 dark:text-gray-500">
                  {selectedPkg.name} {totalAddonsCount > 0 ? `+ ${totalAddonsCount} 项加购` : ''}
               </div>
            </div>
            
            <NeonButton 
              className="w-48 flex items-center justify-center space-x-2 relative overflow-hidden"
              onClick={handlePayment}
              disabled={isProcessing || !selectedTime}
            >
               {isProcessing ? (
                 <span className="animate-pulse">处理中...</span>
               ) : (
                 <>
                   <span>立即支付</span>
                   <Zap size={16} className="fill-current" />
                 </>
               )}
            </NeonButton>
         </div>
         {/* Validation Msg */}
         {!selectedTime && (
            <div className="absolute -top-8 left-0 right-0 text-center">
                <span className="px-3 py-1 rounded-full text-xs border backdrop-blur-md
                  bg-red-50 text-red-600 border-red-200
                  dark:bg-red-500/20 dark:text-red-500 dark:border-red-500/30">
                    请先选择场次
                </span>
            </div>
         )}
      </div>
    </div>
  );
};
