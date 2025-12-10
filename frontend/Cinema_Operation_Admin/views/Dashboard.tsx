import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { DollarSign, Users, Calendar, AlertTriangle } from 'lucide-react';
import { StatCard } from '../components/StatCard';

const data = [
  { name: '周一', gmv: 4000, cost: 2400 },
  { name: '周二', gmv: 3000, cost: 1398 },
  { name: '周三', gmv: 2000, cost: 9800 },
  { name: '周四', gmv: 2780, cost: 3908 },
  { name: '周五', gmv: 1890, cost: 4800 },
  { name: '周六', gmv: 2390, cost: 3800 },
  { name: '周日', gmv: 3490, cost: 4300 },
];

const funnelData = [
  { name: '曝光', value: 4000 },
  { name: '点击', value: 3000 },
  { name: '下单', value: 2000 },
  { name: '核销', value: 1800 },
];

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <select className="form-select text-sm border-slate-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50">
          <option>最近 7 天</option>
          <option>最近 30 天</option>
          <option>本季度</option>
        </select>
        <select className="form-select text-sm border-slate-300 rounded-md shadow-sm">
          <option>全部门店</option>
          <option>旗舰店 A</option>
          <option>市中心店 B</option>
        </select>
        <span className="text-xs text-slate-400 ml-auto">数据更新: 刚刚</span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="总交易额 (GMV)" 
          value="¥128,430" 
          trend="12.5%" 
          trendUp={true} 
          icon={<DollarSign size={20} />} 
          description="较上期"
        />
        <StatCard 
          title="核销率" 
          value="92.4%" 
          trend="0.8%" 
          trendUp={false} 
          icon={<Users size={20} />} 
          description="订单完成率"
        />
        <StatCard 
          title="单场平均毛利" 
          value="¥840" 
          trend="5.2%" 
          trendUp={true} 
          icon={<Calendar size={20} />} 
          description="毛利增长"
        />
        <StatCard 
          title="盘点差异" 
          value="-¥120" 
          trend="异常" 
          trendUp={false} 
          icon={<AlertTriangle size={20} />} 
          description="需立即审计"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">营收与成本趋势</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorGmv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Area type="monotone" dataKey="gmv" name="营收" stroke="#3b82f6" fillOpacity={1} fill="url(#colorGmv)" />
                <Area type="monotone" dataKey="cost" name="成本" stroke="#ef4444" fillOpacity={0.1} fill="#ef4444" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">转化漏斗</h3>
          <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={funnelData} margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={40} stroke="#64748b" />
                <Tooltip cursor={{fill: '#f1f5f9'}} />
                <Bar dataKey="value" name="人数" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alert Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-slate-800">经营预警</h3>
          <button className="text-sm text-blue-600 font-medium hover:underline">查看全部</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">严重程度</th>
                <th className="px-6 py-3">预警类型</th>
                <th className="px-6 py-3">描述</th>
                <th className="px-6 py-3">时间</th>
                <th className="px-6 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-600">高危</span></td>
                <td className="px-6 py-4 font-medium text-slate-800">缺货风险</td>
                <td className="px-6 py-4 text-slate-600">扎啤 (桶 A) 库存低于 5%</td>
                <td className="px-6 py-4 text-slate-500">10 分钟前</td>
                <td className="px-6 py-4"><button className="text-blue-600 hover:text-blue-800">补货</button></td>
              </tr>
              <tr>
                <td className="px-6 py-4"><span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-600">中等</span></td>
                <td className="px-6 py-4 font-medium text-slate-800">异常退款</td>
                <td className="px-6 py-4 text-slate-600">订单 #88392 退款金额 {'>'} ¥500</td>
                <td className="px-6 py-4 text-slate-500">2 小时前</td>
                <td className="px-6 py-4"><button className="text-blue-600 hover:text-blue-800">审核</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};