import React from 'react';
import { Filter, Download, ExternalLink, UserCog } from 'lucide-react';
import { Status } from '../types';

export const OrderManagement: React.FC = () => {
  return (
    <div className="space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">订单管理</h2>
        <div className="flex space-x-2">
            <button className="flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm hover:bg-slate-50">
                <Download size={16} />
                <span>导出数据</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
        {/* Advanced Search */}
        <div className="p-4 border-b border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" placeholder="订单号 / 客户手机号" className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500" />
            <select className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 bg-white">
                <option>所有渠道</option>
                <option>抖音预定</option>
                <option>微信预定</option>
                <option>线下预定</option>
            </select>
            <select className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 bg-white">
                <option>所有状态</option>
                <option>已支付</option>
                <option>待支付</option>
                <option>已取消</option>
                <option>已核销</option>
            </select>
            <input type="date" className="px-3 py-2 text-sm border border-slate-200 rounded-lg text-slate-600 bg-white" />
        </div>

        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
                    <tr>
                        <th className="px-6 py-4">订单号</th>
                        <th className="px-6 py-4">渠道</th>
                        <th className="px-6 py-4">商品/场景包</th>
                        <th className="px-6 py-4">客户</th>
                        <th className="px-6 py-4">服务经理</th>
                        <th className="px-6 py-4">预约时段</th>
                        <th className="px-6 py-4">实付金额</th>
                        <th className="px-6 py-4">状态</th>
                        <th className="px-6 py-4">操作</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {[
                        { id: '#ORD-2023-001', channel: '微信预定', item: 'VIP 生日派对', customer: '刘爱丽', serviceManager: '王经理', slot: '10月24日 14:00', amt: '¥899', status: '已支付', statusColor: 'emerald' },
                        { id: '#ORD-2023-002', channel: '线下预定', item: '现场酒水补单', customer: '张伟', serviceManager: 'Rose', slot: '10月24日 15:30', amt: '¥45', status: '已完成', statusColor: 'blue' },
                        { id: '#ORD-2023-003', channel: '抖音预定', item: '企业团建套餐', customer: '科技无限公司', serviceManager: '李主管', slot: '10月25日 09:00', amt: '¥2,500', status: '定金已付', statusColor: 'amber' },
                        { id: '#ORD-2023-004', channel: '微信预定', item: '情侣电影之夜', customer: '散客 992', serviceManager: '无', slot: '10月24日 19:00', amt: '¥299', status: '已取消', statusColor: 'slate' },
                        { id: '#ORD-2023-005', channel: '抖音预定', item: '求婚策划包场', customer: '周杰伦', serviceManager: 'Jack', slot: '10月26日 20:00', amt: '¥5,200', status: '待核销', statusColor: 'emerald' },
                    ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-mono text-xs font-medium text-slate-600">{row.id}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-0.5 rounded text-xs border ${
                                    row.channel === '抖音预定' ? 'bg-slate-900 text-white border-slate-900' :
                                    row.channel === '微信预定' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                    {row.channel}
                                </span>
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-800">{row.item}</td>
                            <td className="px-6 py-4 text-slate-600">{row.customer}</td>
                            <td className="px-6 py-4 text-slate-600">
                                <div className="flex items-center space-x-1">
                                    <UserCog size={14} className="text-slate-400"/>
                                    <span>{row.serviceManager}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-slate-500">{row.slot}</td>
                            <td className="px-6 py-4 font-medium">{row.amt}</td>
                            <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${row.statusColor}-100 text-${row.statusColor}-700`}>
                                    {row.status}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <button className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center">
                                    详情 <ExternalLink size={12} className="ml-1"/>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
        
        <div className="p-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
            <span>显示 5 条，共 128 条</span>
            <div className="flex space-x-1">
                <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50" disabled>上一页</button>
                <button className="px-3 py-1 border border-slate-200 rounded hover:bg-slate-50">下一页</button>
            </div>
        </div>
      </div>
    </div>
  );
};