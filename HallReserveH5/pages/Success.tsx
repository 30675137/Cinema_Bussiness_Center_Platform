
import React from 'react';
import { BookingState, Scenario, ScenarioPackage } from '../types';
import { NeonButton } from '../components/NeonButton';
import { Check, Share2, MapPin, Navigation, ArrowRight } from 'lucide-react';

interface SuccessProps {
  data: {
      scenario: Scenario;
      package: ScenarioPackage;
      date: string;
      time: string;
      total: number;
  };
  onHome: () => void;
}

export const Success: React.FC<SuccessProps> = ({ data, onHome }) => {
  const { scenario, date, time } = data;

  return (
    <div className="min-h-screen flex flex-col items-center pt-12 px-6 pb-12 relative overflow-hidden transition-colors duration-300
      bg-gray-50 dark:bg-[#050505]">
        {/* Background Ambient Glow (Only in Dark Mode) */}
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[50%] blur-[120px] pointer-events-none transition-opacity duration-300
          opacity-0 dark:bg-[#ff2e4d] dark:opacity-10"></div>

        {/* Status Hero */}
        <div className="flex flex-col items-center mb-8 z-10">
            <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 mb-4 animate-bounce
              bg-green-100 border-green-500 text-green-600 shadow-sm
              dark:bg-green-500/20 dark:border-green-500 dark:text-green-500 dark:shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                <Check size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">预订成功</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">订单号 #8839-2910</p>
        </div>

        {/* The Ticket / QR Card */}
        <div className="w-full max-w-sm rounded-2xl overflow-hidden z-10 transition-all duration-300
          bg-white border border-gray-200 shadow-xl
          dark:bg-[#1c1c22] dark:border-[#2a2a35] dark:shadow-2xl">
            {/* Ticket Header */}
            <div className="p-4 border-b flex items-start space-x-3
               bg-gray-50 border-gray-100
               dark:bg-[#23232b] dark:border-[#2a2a35]">
                <img src={scenario.image} className="w-12 h-12 rounded object-cover" alt="Thumb" />
                <div>
                    <h3 className="font-bold text-sm leading-tight text-gray-900 dark:text-white">{scenario.title}</h3>
                    <p className="text-xs mt-1 text-gray-500 dark:text-gray-500">{scenario.location}</p>
                </div>
            </div>
            
            {/* QR Area */}
            <div className="p-8 flex flex-col items-center justify-center relative
               bg-white dark:bg-white/5">
                <div className="w-48 h-48 bg-white p-2 rounded-lg shadow-sm">
                    {/* Placeholder QR */}
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ORDER-${scenario.id}`} 
                      alt="QR Code" 
                      className="w-full h-full"
                    />
                </div>
                <p className="text-[10px] mt-3 uppercase tracking-widest text-gray-400 dark:text-gray-500">请在入口处出示此码核销</p>
                
                {/* Visual Punch-outs */}
                <div className="absolute top-1/2 left-0 w-4 h-8 rounded-r-full transform -translate-y-1/2
                   bg-gray-50 dark:bg-[#050505]"></div>
                <div className="absolute top-1/2 right-0 w-4 h-8 rounded-l-full transform -translate-y-1/2
                   bg-gray-50 dark:bg-[#050505]"></div>
            </div>

            {/* Details Footer */}
            <div className="p-5 space-y-3 bg-white dark:bg-[#1c1c22]">
                <div className="flex justify-between items-center text-sm border-b pb-3 border-gray-100 dark:border-[#2a2a35]">
                    <span className="text-gray-500 dark:text-gray-400">日期</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">{date}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b pb-3 border-gray-100 dark:border-[#2a2a35]">
                    <span className="text-gray-500 dark:text-gray-400">时间</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">{time}</span>
                </div>
                 <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500 dark:text-gray-400">人数</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">上限 {data.package.name.includes('四人') ? 4 : 2} 人</span>
                </div>
            </div>
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm mt-8 space-y-4 z-10">
            <NeonButton variant="secondary" fullWidth className="flex items-center justify-center space-x-2">
                <Share2 size={18} />
                <span>生成邀请函</span>
            </NeonButton>
            
            <div className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center p-3 rounded-xl border transition-colors
                  bg-white border-gray-200 text-gray-600 hover:bg-gray-50
                  dark:bg-[#1c1c22] dark:border-[#2a2a35] dark:text-gray-300 dark:hover:bg-[#25252d]">
                    <Navigation size={20} className="mb-2 text-[#ff2e4d]" />
                    <span className="text-xs">导航到店</span>
                </button>
                 <button onClick={onHome} className="flex flex-col items-center justify-center p-3 rounded-xl border transition-colors
                   bg-white border-gray-200 text-gray-600 hover:bg-gray-50
                   dark:bg-[#1c1c22] dark:border-[#2a2a35] dark:text-gray-300 dark:hover:bg-[#25252d]">
                    <ArrowRight size={20} className="mb-2 text-gray-900 dark:text-white" />
                    <span className="text-xs">浏览更多</span>
                </button>
            </div>
        </div>

        {/* Footer Support */}
        <div className="mt-8 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-600">需要帮助? <span className="underline hover:text-gray-800 dark:hover:text-gray-400">联系现场管家</span></p>
        </div>
    </div>
  );
};
