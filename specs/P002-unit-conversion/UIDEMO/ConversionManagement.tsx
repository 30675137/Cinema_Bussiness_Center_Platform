
import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  ArrowRight, 
  Layers, 
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowLeftRight,
  Scale,
  FlaskConical,
  Hash
} from 'lucide-react';
import { UnitConversionRule, UnitCategory } from '../types';

const INITIAL_RULES: UnitConversionRule[] = [
  { id: '1', sourceUnit: '瓶', targetUnit: 'ml', factor: 750, precision: 0, category: 'VOLUME', description: '标准瓶装换算' },
  { id: '2', sourceUnit: 'ml', targetUnit: 'L', factor: 0.001, precision: 3, category: 'VOLUME', description: '毫升转升' },
  { id: '3', sourceUnit: '杯', targetUnit: 'ml', factor: 150, precision: 0, category: 'VOLUME', description: '标准服务杯容量' },
  { id: '4', sourceUnit: 'kg', targetUnit: 'g', factor: 1000, precision: 0, category: 'WEIGHT', description: '千克转克' },
  { id: '5', sourceUnit: '份', targetUnit: 'g', factor: 200, precision: 0, category: 'WEIGHT', description: '标准出品克重' },
];

export const ConversionManagement: React.FC = () => {
  const [rules, setRules] = useState<UnitConversionRule[]>(INITIAL_RULES);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Partial<UnitConversionRule> | null>(null);

  const filteredRules = useMemo(() => {
    return rules.filter(r => 
      r.sourceUnit.includes(searchTerm) || 
      r.targetUnit.includes(searchTerm) || 
      r.description?.includes(searchTerm)
    );
  }, [rules, searchTerm]);

  // Grouped by category for visualization
  const groupedRules = useMemo(() => {
    return {
      VOLUME: rules.filter(r => r.category === 'VOLUME'),
      WEIGHT: rules.filter(r => r.category === 'WEIGHT'),
      COUNT: rules.filter(r => r.category === 'COUNT'),
    };
  }, [rules]);

  const handleAddRule = () => {
    setEditingRule({
      id: Math.random().toString(36).substr(2, 9),
      sourceUnit: '',
      targetUnit: '',
      factor: 1,
      precision: 2,
      category: 'VOLUME'
    });
    setIsModalOpen(true);
  };

  const handleEditRule = (rule: UnitConversionRule) => {
    setEditingRule({ ...rule });
    setIsModalOpen(true);
  };

  const handleDeleteRule = (id: string) => {
    if (confirm('确认删除此换算规则？这将可能影响到现有的 BOM 计算。')) {
      setRules(rules.filter(r => r.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRule?.sourceUnit || !editingRule?.targetUnit || !editingRule?.factor) return;
    
    // Check for circular dependency (simplified check)
    if (editingRule.sourceUnit === editingRule.targetUnit) {
      alert('源单位和目标单位不能相同');
      return;
    }

    const exists = rules.find(r => 
      r.id !== editingRule.id && 
      r.sourceUnit === editingRule.sourceUnit && 
      r.targetUnit === editingRule.targetUnit
    );

    if (exists) {
      alert('该换算关系已存在');
      return;
    }

    if (editingRule.id && rules.find(r => r.id === editingRule.id)) {
      setRules(rules.map(r => r.id === editingRule.id ? (editingRule as UnitConversionRule) : r));
    } else {
      setRules([...rules, editingRule as UnitConversionRule]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">单位换算管理</h2>
          <p className="text-sm text-slate-500 mt-1">配置多级换算链，支持 BOM 配方与库存自动扣减</p>
        </div>
        <button 
          onClick={handleAddRule}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 font-medium"
        >
          <Plus size={20} />
          <span>添加换算规则</span>
        </button>
      </div>

      {/* Stats / Visual Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <FlaskConical size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">体积类规则</p>
            <p className="text-xl font-bold text-slate-800">{groupedRules.VOLUME.length} 条</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <Scale size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">重量类规则</p>
            <p className="text-xl font-bold text-slate-800">{groupedRules.WEIGHT.length} 条</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Hash size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">计数类规则</p>
            <p className="text-xl font-bold text-slate-800">{groupedRules.COUNT.length} 条</p>
          </div>
        </div>
      </div>

      {/* Main List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="搜索单位或说明..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center text-xs text-slate-400">
            <Info size={14} className="mr-1" />
            <span>换算链支持：瓶 → ml → L</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
              <tr>
                <th className="px-6 py-4">类别</th>
                <th className="px-6 py-4">换算关系 (1 : X)</th>
                <th className="px-6 py-4">计算精度</th>
                <th className="px-6 py-4">说明</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                      rule.category === 'VOLUME' ? 'bg-blue-50 text-blue-700' :
                      rule.category === 'WEIGHT' ? 'bg-emerald-50 text-emerald-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {rule.category === 'VOLUME' ? '体积' : rule.category === 'WEIGHT' ? '重量' : '计数'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-12 h-8 bg-slate-100 rounded font-bold text-slate-700 border border-slate-200">
                        1 {rule.sourceUnit}
                      </div>
                      <ArrowRight size={14} className="text-slate-300" />
                      <div className="flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded border border-blue-100 font-bold">
                        {rule.factor} {rule.targetUnit}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-500">
                    {rule.precision} 位小数
                  </td>
                  <td className="px-6 py-4 text-slate-600 italic">
                    {rule.description || '--'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEditRule(rule)}
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-all"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRules.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-slate-400">
                    <ArrowLeftRight size={48} className="mx-auto mb-4 opacity-10" />
                    <p>未找到换算规则</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Chain Graph / Helper */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
          <Layers size={20} className="mr-2 text-blue-500" />
          可视化换算链示例
        </h3>
        <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 border-2 border-slate-200 rounded-full flex items-center justify-center text-slate-600 font-bold">瓶 (Bottle)</div>
            <p className="mt-2 text-xs text-slate-400 italic">主单位</p>
          </div>
          <ArrowRight className="hidden md:block text-slate-300" />
          <div className="flex flex-col items-center relative">
            <div className="absolute -top-6 text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">x750</div>
            <div className="w-20 h-20 bg-blue-50 border-2 border-blue-200 rounded-full flex items-center justify-center text-blue-700 font-bold">ml (毫升)</div>
            <p className="mt-2 text-xs text-slate-400 italic">库存单位</p>
          </div>
          <ArrowRight className="hidden md:block text-slate-300" />
          <div className="flex flex-col items-center relative">
            <div className="absolute -top-6 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold">x0.001</div>
            <div className="w-20 h-20 bg-emerald-50 border-2 border-emerald-200 rounded-full flex items-center justify-center text-emerald-700 font-bold">L (升)</div>
            <p className="mt-2 text-xs text-slate-400 italic">统计单位</p>
          </div>
        </div>
        <div className="mt-8 p-4 bg-blue-50/50 rounded-lg border border-blue-100 flex items-start space-x-3">
          <AlertCircle size={18} className="text-blue-500 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            <b>系统逻辑：</b>当您配置了 A→B 和 B→C 的关系后，系统会自动推导 A→C 的换算结果。在计算 BOM 时，系统会优先寻找直接路径，若无直接路径则沿链路自动寻找最佳换算方案。请确保链路无回路（Loop）以保证计算准确性。
          </p>
        </div>
      </div>

      {/* Modal / Sidebar for adding/editing */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <form onSubmit={handleSave}>
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">
                  {editingRule?.id ? '编辑换算规则' : '新增换算规则'}
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">换算类别</label>
                    <div className="flex space-x-2">
                      {(['VOLUME', 'WEIGHT', 'COUNT'] as UnitCategory[]).map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setEditingRule({ ...editingRule, category: cat })}
                          className={`flex-1 py-2 text-xs font-bold border rounded-lg transition-all ${
                            editingRule?.category === cat 
                              ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {cat === 'VOLUME' ? '体积' : cat === 'WEIGHT' ? '重量' : '计数'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">1 个源单位 *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="如: 瓶"
                      value={editingRule?.sourceUnit || ''}
                      onChange={e => setEditingRule({ ...editingRule, sourceUnit: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">对应多少目标单位 *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="如: ml"
                      value={editingRule?.targetUnit || ''}
                      onChange={e => setEditingRule({ ...editingRule, targetUnit: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">换算系数 *</label>
                    <input 
                      type="number" 
                      step="any"
                      required
                      value={editingRule?.factor || ''}
                      onChange={e => setEditingRule({ ...editingRule, factor: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">舍入小数位</label>
                    <input 
                      type="number" 
                      min="0"
                      max="10"
                      value={editingRule?.precision || 0}
                      onChange={e => setEditingRule({ ...editingRule, precision: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">备注说明</label>
                    <textarea 
                      placeholder="简单描述此换算的应用场景..."
                      value={editingRule?.description || ''}
                      onChange={e => setEditingRule({ ...editingRule, description: e.target.value })}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                      rows={2}
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                   <span className="text-xs text-slate-500">示例预览:</span>
                   <span className="text-sm font-bold text-blue-600">
                     1 {editingRule?.sourceUnit || '?'} = {(editingRule?.factor || 0).toFixed(editingRule?.precision || 0)} {editingRule?.targetUnit || '?'}
                   </span>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 flex justify-end space-x-3 bg-slate-50/50">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl shadow-md transition-all font-bold text-sm"
                >
                  确认保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
