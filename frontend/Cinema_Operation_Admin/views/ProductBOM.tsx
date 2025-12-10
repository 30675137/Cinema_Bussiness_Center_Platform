import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Package, Droplet } from 'lucide-react';

export const ProductBOM: React.FC = () => {
  const [expandedRow, setExpandedRow] = useState<number | null>(0);

  const products = [
    { id: 1, name: '招牌莫吉托 (扎)', category: '鸡尾酒', price: '¥45.00', cost: '¥12.50', margin: '72%' },
    { id: 2, name: 'VIP 零食拼盘', category: '小吃', price: '¥35.00', cost: '¥10.00', margin: '71%' },
    { id: 3, name: '精选干红 (瓶)', category: '红酒', price: '¥80.00', cost: '¥35.00', margin: '56%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">商品 & 配方 (BOM)</h2>
        <div className="flex space-x-2">
            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">管理原料库</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ 新建商品</button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-xs text-slate-500 uppercase">
                <tr>
                    <th className="px-6 py-3 w-10"></th>
                    <th className="px-6 py-3">商品名称</th>
                    <th className="px-6 py-3">分类</th>
                    <th className="px-6 py-3 text-right">售价</th>
                    <th className="px-6 py-3 text-right">BOM成本</th>
                    <th className="px-6 py-3 text-right">毛利率</th>
                    <th className="px-6 py-3">状态</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {products.map((p, i) => (
                    <React.Fragment key={p.id}>
                        <tr 
                            className={`cursor-pointer hover:bg-slate-50 transition-colors ${expandedRow === i ? 'bg-slate-50' : ''}`}
                            onClick={() => setExpandedRow(expandedRow === i ? null : i)}
                        >
                            <td className="px-6 py-4 text-slate-400">
                                {expandedRow === i ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-900 flex items-center">
                                <Package size={16} className="mr-2 text-slate-400" />
                                {p.name}
                            </td>
                            <td className="px-6 py-4 text-slate-600">{p.category}</td>
                            <td className="px-6 py-4 text-right font-medium">{p.price}</td>
                            <td className="px-6 py-4 text-right text-slate-600">{p.cost}</td>
                            <td className="px-6 py-4 text-right text-emerald-600 font-medium">{p.margin}</td>
                            <td className="px-6 py-4"><span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs">上架中</span></td>
                        </tr>
                        {expandedRow === i && (
                            <tr className="bg-slate-50/50">
                                <td colSpan={7} className="px-6 py-4 pl-16">
                                    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                                        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center">
                                            <Droplet size={14} className="mr-2"/> 配方详情 / BOM 结构
                                        </h4>
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="text-slate-400 border-b border-slate-100">
                                                    <th className="pb-2 text-left">原料名称 (SKU)</th>
                                                    <th className="pb-2 text-right">用量</th>
                                                    <th className="pb-2 text-right">单位</th>
                                                    <th className="pb-2 text-right">预估损耗率</th>
                                                    <th className="pb-2 text-right">成本小计</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-slate-600">
                                                <tr>
                                                    <td className="py-2">白朗姆酒 (百加得)</td>
                                                    <td className="py-2 text-right">180</td>
                                                    <td className="py-2 text-right">ml</td>
                                                    <td className="py-2 text-right">5%</td>
                                                    <td className="py-2 text-right">¥4.50</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2">新鲜薄荷叶</td>
                                                    <td className="py-2 text-right">1</td>
                                                    <td className="py-2 text-right">把</td>
                                                    <td className="py-2 text-right">10%</td>
                                                    <td className="py-2 text-right">¥2.00</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-2">苏打水</td>
                                                    <td className="py-2 text-right">500</td>
                                                    <td className="py-2 text-right">ml</td>
                                                    <td className="py-2 text-right">0%</td>
                                                    <td className="py-2 text-right">¥1.00</td>
                                                </tr>
                                                <tr className="font-semibold text-slate-800 border-t border-slate-100 mt-2">
                                                    <td className="pt-2">合计</td>
                                                    <td className="pt-2" colSpan={3}></td>
                                                    <td className="pt-2 text-right">¥7.50 (+ 运营成本)</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </React.Fragment>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};