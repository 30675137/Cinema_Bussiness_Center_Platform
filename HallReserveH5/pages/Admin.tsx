
import React, { useState } from 'react';
import { 
  LayoutDashboard, ShoppingBag, Settings, ChevronLeft, 
  Plus, Edit2, Trash2, Image as ImageIcon, 
  MapPin, DollarSign, Save, X, ChevronRight, BarChart3
} from 'lucide-react';
import { AdminOrder, Scenario, ScenarioCategory } from '../types';
import { SCENARIOS, THEME_CONFIG } from '../constants';
import { NeonButton } from '../components/NeonButton';

interface AdminProps {
  onBack: () => void;
}

const MOCK_ORDERS: AdminOrder[] = [
  { id: 'ORD-001', customer: '张先生', scenarioTitle: '二人世界尊享包', time: '今日 19:00', amount: 888, status: 'confirmed' },
  { id: 'ORD-002', customer: '李女士', scenarioTitle: '企业年会/发布会', time: '明日 10:00', amount: 3500, status: 'pending' },
  { id: 'ORD-003', customer: '王同学', scenarioTitle: '粉丝应援打call包', time: '周六 14:30', amount: 2200, status: 'completed' },
];

export const Admin: React.FC<AdminProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'configs'>('overview');
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>(SCENARIOS);

  const handleSaveScenario = (updated: Scenario) => {
    setScenarios(prev => prev.map(s => s.id === updated.id ? updated : s));
    setEditingScenario(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0c] pb-24 transition-colors duration-300">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b dark:border-[#1c1c22] bg-white dark:bg-[#0a0a0c] sticky top-0 z-40">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full">
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-bold text-gray-900 dark:text-white">多元经营管理工作台</h1>
        <div className="w-8"></div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-white dark:bg-[#111115] border-b dark:border-[#1c1c22] sticky top-[65px] z-30">
        {[
          { id: 'overview', icon: LayoutDashboard, label: '经营看板' },
          { id: 'orders', icon: ShoppingBag, label: '订单管理' },
          { id: 'configs', icon: Settings, label: '场景配置' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 flex flex-col items-center py-3 space-y-1 transition-all ${
              activeTab === tab.id 
                ? 'text-[#ff2e4d] border-b-2 border-[#ff2e4d] bg-[#ff2e4d]/5' 
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon size={18} />
            <span className="text-[10px] font-bold tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 max-w-md mx-auto">
        {/* Tab: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Real-time Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#15151a] border border-gray-100 dark:border-[#222] shadow-sm">
                <div className="text-gray-400 text-xs mb-1">今日预订总额</div>
                <div className="text-2xl font-bold font-mono text-[#ff2e4d]">¥12,480</div>
                <div className="text-[10px] text-green-500 mt-1">↑ 12% 较昨日</div>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-[#15151a] border border-gray-100 dark:border-[#222] shadow-sm">
                <div className="text-gray-400 text-xs mb-1">活跃场景</div>
                <div className="text-2xl font-bold font-mono dark:text-white">8</div>
                <div className="text-[10px] text-gray-500 mt-1">满载率 85%</div>
              </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#15151a] border border-gray-100 dark:border-[#222]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold dark:text-white flex items-center">
                  <BarChart3 size={16} className="mr-2 text-[#ff2e4d]" />
                  分类贡献占比
                </h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: '私人观影', value: 45, color: 'bg-purple-500' },
                  { label: '商务团建', value: 35, color: 'bg-cyan-500' },
                  { label: '派对策划', value: 20, color: 'bg-pink-500' }
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[10px] mb-1 dark:text-gray-400">
                      <span>{item.label}</span>
                      <span>{item.value}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.value}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-3 animate-in fade-in duration-300">
            {MOCK_ORDERS.map(order => (
              <div key={order.id} className="p-4 rounded-xl border bg-white dark:bg-[#15151a] dark:border-[#222] flex justify-between items-center">
                <div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mb-1">{order.id}</div>
                  <div className="font-bold text-gray-900 dark:text-white">{order.customer}</div>
                  <div className="text-xs text-gray-500">{order.scenarioTitle}</div>
                  <div className="text-[10px] font-mono mt-1 text-gray-400">{order.time}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[#ff2e4d]">¥{order.amount}</div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    order.status === 'confirmed' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' :
                    order.status === 'completed' ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' :
                    'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400'
                  }`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Configs (THE MAIN PART) */}
        {activeTab === 'configs' && !editingScenario && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-sm font-bold dark:text-white">首页场景配置</h2>
              <button className="flex items-center text-xs text-[#ff2e4d] bg-[#ff2e4d]/10 px-3 py-1.5 rounded-lg border border-[#ff2e4d]/20">
                <Plus size={14} className="mr-1" />
                新增场景
              </button>
            </div>
            
            <div className="space-y-3">
              {scenarios.map(scenario => {
                const theme = THEME_CONFIG[scenario.category];
                return (
                  <div key={scenario.id} className="group rounded-xl border bg-white dark:bg-[#15151a] dark:border-[#222] overflow-hidden flex shadow-sm">
                    <div className="w-24 h-24 flex-shrink-0">
                      <img src={scenario.image} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${theme.badgeStyle}`}>
                            {theme.label}
                          </span>
                          <div className="flex space-x-2">
                             <button onClick={() => setEditingScenario(scenario)} className="text-gray-400 hover:text-blue-500">
                               <Edit2 size={14} />
                             </button>
                             <button className="text-gray-400 hover:text-red-500">
                               <Trash2 size={14} />
                             </button>
                          </div>
                        </div>
                        <h3 className="text-sm font-bold dark:text-white mt-1 line-clamp-1">{scenario.title}</h3>
                        <p className="text-[10px] text-gray-500 flex items-center mt-1">
                          <MapPin size={8} className="mr-1" />
                          {scenario.location.split('·')[1] || scenario.location}
                        </p>
                      </div>
                      <div className="text-[11px] font-bold text-[#ff2e4d]">
                        起价 ¥{scenario.packages[0].price}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Scenario Detail Editor */}
        {activeTab === 'configs' && editingScenario && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
             <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900 dark:text-white">编辑场景详情</h2>
                <button onClick={() => setEditingScenario(null)} className="p-1"><X size={20}/></button>
             </div>

             <div className="space-y-4">
                {/* Basic Info */}
                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-400 uppercase">业务标题</label>
                   <input 
                    type="text" 
                    value={editingScenario.title}
                    onChange={(e) => setEditingScenario({...editingScenario, title: e.target.value})}
                    className="w-full bg-white dark:bg-[#1c1c22] border dark:border-[#333] rounded-lg px-3 py-2 text-sm focus:ring-1 ring-[#ff2e4d] outline-none"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">分类</label>
                    <select 
                      value={editingScenario.category}
                      onChange={(e) => setEditingScenario({...editingScenario, category: e.target.value as ScenarioCategory})}
                      className="w-full bg-white dark:bg-[#1c1c22] border dark:border-[#333] rounded-lg px-3 py-2 text-sm outline-none"
                    >
                      <option value="MOVIE">私人订制</option>
                      <option value="TEAM">商务团建</option>
                      <option value="PARTY">派对策划</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">评分</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      max="5"
                      value={editingScenario.rating}
                      onChange={(e) => setEditingScenario({...editingScenario, rating: parseFloat(e.target.value)})}
                      className="w-full bg-white dark:bg-[#1c1c22] border dark:border-[#333] rounded-lg px-3 py-2 text-sm outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Resource Info */}
                <div className="space-y-1">
                   <label className="text-xs font-bold text-gray-400 uppercase">执行影城/影厅</label>
                   <div className="relative">
                      <MapPin size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="影城名称 · 几号厅"
                        value={editingScenario.location}
                        onChange={(e) => setEditingScenario({...editingScenario, location: e.target.value})}
                        className="w-full bg-white dark:bg-[#1c1c22] border dark:border-[#333] rounded-lg pl-9 pr-3 py-2 text-sm outline-none"
                      />
                   </div>
                </div>

                {/* Image Config */}
                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-400 uppercase">背景封面图 (URL)</label>
                   <div className="flex space-x-3">
                      <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-800 overflow-hidden flex-shrink-0">
                        <img src={editingScenario.image} className="w-full h-full object-cover" />
                      </div>
                      <input 
                        type="text" 
                        value={editingScenario.image}
                        onChange={(e) => setEditingScenario({...editingScenario, image: e.target.value})}
                        className="flex-1 bg-white dark:bg-[#1c1c22] border dark:border-[#333] rounded-lg px-3 py-2 text-xs outline-none"
                        placeholder="https://..."
                      />
                   </div>
                </div>

                {/* Packages Config */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center border-b pb-2 border-gray-100 dark:border-[#222]">
                    <label className="text-xs font-bold text-gray-400 uppercase">套餐与定价</label>
                    <button className="text-[10px] text-blue-500 flex items-center">
                      <Plus size={12} className="mr-0.5" />
                      添加规格
                    </button>
                  </div>
                  {editingScenario.packages.map((pkg, idx) => (
                    <div key={pkg.id} className="p-3 rounded-lg border dark:border-[#333] bg-gray-50 dark:bg-white/5 space-y-3">
                       <div className="flex justify-between items-start">
                          <input 
                            className="bg-transparent border-b border-gray-300 dark:border-gray-700 font-bold text-sm focus:border-[#ff2e4d] outline-none"
                            value={pkg.name}
                            onChange={(e) => {
                              const newPkgs = [...editingScenario.packages];
                              newPkgs[idx].name = e.target.value;
                              setEditingScenario({...editingScenario, packages: newPkgs});
                            }}
                          />
                          <button className="text-gray-400"><Trash2 size={12}/></button>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <div className="flex items-center space-x-2">
                             <span className="text-[10px] text-gray-500 uppercase">现价</span>
                             <div className="relative flex-1">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">¥</span>
                                <input 
                                  type="number"
                                  className="w-full bg-white dark:bg-black/20 border dark:border-[#444] rounded pl-5 pr-2 py-1 text-xs font-mono"
                                  value={pkg.price}
                                  onChange={(e) => {
                                    const newPkgs = [...editingScenario.packages];
                                    newPkgs[idx].price = parseInt(e.target.value);
                                    setEditingScenario({...editingScenario, packages: newPkgs});
                                  }}
                                />
                             </div>
                          </div>
                          <div className="flex items-center space-x-2">
                             <span className="text-[10px] text-gray-500 uppercase">原价</span>
                             <div className="relative flex-1">
                                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">¥</span>
                                <input 
                                  type="number"
                                  className="w-full bg-white dark:bg-black/20 border dark:border-[#444] rounded pl-5 pr-2 py-1 text-xs font-mono text-gray-500"
                                  value={pkg.originalPrice}
                                  onChange={(e) => {
                                    const newPkgs = [...editingScenario.packages];
                                    newPkgs[idx].originalPrice = parseInt(e.target.value);
                                    setEditingScenario({...editingScenario, packages: newPkgs});
                                  }}
                                />
                             </div>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
             </div>

             {/* Footer Actions */}
             <div className="flex space-x-3 pt-4 border-t dark:border-[#222]">
                <button 
                  onClick={() => setEditingScenario(null)}
                  className="flex-1 py-3 rounded-lg border dark:border-[#333] text-sm font-bold dark:text-gray-400"
                >
                  取消
                </button>
                <button 
                  onClick={() => handleSaveScenario(editingScenario)}
                  className="flex-1 py-3 rounded-lg bg-[#ff2e4d] text-white text-sm font-bold shadow-lg shadow-[#ff2e4d]/20"
                >
                  保存更新
                </button>
             </div>
          </div>
        )}
      </div>

      {/* Admin Quick Switch (Optional floating toggle for demo) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-black/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center space-x-4 shadow-2xl">
          <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            运营模式
          </div>
          <button 
            onClick={onBack}
            className="text-[10px] font-bold text-[#ff2e4d] bg-white rounded-full px-3 py-1 hover:scale-105 transition-transform"
          >
            返回首页
          </button>
      </div>
    </div>
  );
};
