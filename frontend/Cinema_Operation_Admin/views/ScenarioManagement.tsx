import React, { useState } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Copy, Trash2, MapPin } from 'lucide-react';

export const ScenarioManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('active');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">场景包管理</h2>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
          <Plus size={18} />
          <span>新建场景包</span>
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        {/* Filters */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg">
            {['已上架', '草稿箱', '已归档'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex space-x-2 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="搜索场景包名称..." 
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 w-full md:w-64"
              />
            </div>
            <select className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 bg-white">
              <option>所有门店</option>
              <option>旗舰店 A</option>
              <option>市中心店 B</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">场景包名称</th>
                <th className="px-6 py-4">适用影城</th>
                <th className="px-6 py-4">适用人数</th>
                <th className="px-6 py-4">时长</th>
                <th className="px-6 py-4">基础价</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4">最近编辑</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                { name: 'VIP 生日派对', cinema: '全网通用', capacity: '10-20 人', duration: '3 小时', price: '¥899', status: '已发布', edited: '2小时前' },
                { name: '企业团建专场', cinema: '旗舰店 A', capacity: '20-50 人', duration: '4 小时', price: '¥1,299', status: '已发布', edited: '1天前' },
                { name: '浪漫情侣观影', cinema: '全网通用', capacity: '2 人', duration: '2.5 小时', price: '¥299', status: '草稿', edited: '3天前' },
                { name: '电竞决赛直播', cinema: '市中心店 B', capacity: '50+ 人', duration: '5 小时', price: '¥2,500', status: '已发布', edited: '1周前' },
              ].map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{item.name}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="flex items-center space-x-1">
                      <MapPin size={14} className="text-slate-400" />
                      <span>{item.cinema}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{item.capacity}</td>
                  <td className="px-6 py-4 text-slate-600">{item.duration}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{item.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                      item.status === '已发布' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{item.edited}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><Edit size={16} /></button>
                      <button className="p-1.5 hover:bg-slate-200 rounded text-slate-500"><Copy size={16} /></button>
                      <button className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded text-slate-500"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 flex justify-center text-sm text-slate-500">
          显示 24 个中的 4 个
        </div>
      </div>
    </div>
  );
};