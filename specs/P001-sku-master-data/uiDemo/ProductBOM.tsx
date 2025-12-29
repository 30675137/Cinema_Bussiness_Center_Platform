
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Edit, Trash2, ChevronDown, ChevronRight, 
  Package, Droplet, ArrowLeft, Save, Tag, 
  BarChart3, RefreshCw, Layers, CheckCircle, XCircle,
  X, Filter, PlusCircle
} from 'lucide-react';
import { SKUProduct, ProductStatus, BOMItem, Ingredient } from '../types';

// Mock Data for Raw Ingredients
const MOCK_INGREDIENTS: Ingredient[] = [
  { id: 'ing-1', name: '白朗姆酒 (百加得)', unit: 'ml', unitPrice: 0.025 },
  { id: 'ing-2', name: '新鲜薄荷叶', unit: 'g', unitPrice: 0.2 },
  { id: 'ing-3', name: '苏打水', unit: 'ml', unitPrice: 0.002 },
  { id: 'ing-4', name: '精选爆米花原料', unit: 'g', unitPrice: 0.01 },
  { id: 'ing-5', name: '焦糖糖浆', unit: 'ml', unitPrice: 0.05 },
  { id: 'ing-6', name: '柠檬片', unit: '片', unitPrice: 0.5 },
  { id: 'ing-7', name: '杜松子酒', unit: 'ml', unitPrice: 0.04 },
  { id: 'ing-8', name: '补宁水', unit: 'ml', unitPrice: 0.005 },
];

const INITIAL_PRODUCTS: SKUProduct[] = [
  {
    id: 'p-1',
    skuCode: 'COCK-001',
    name: '招牌莫吉托 (扎)',
    category: '鸡尾酒',
    price: 45,
    cost: 12.5,
    margin: 72.2,
    status: ProductStatus.ACTIVE,
    bom: [
      { ingredientId: 'ing-1', name: '白朗姆酒 (百加得)', quantity: 180, unit: 'ml', cost: 4.5 },
      { ingredientId: 'ing-2', name: '新鲜薄荷叶', quantity: 20, unit: 'g', cost: 4.0 },
      { ingredientId: 'ing-3', name: '苏打水', quantity: 500, unit: 'ml', cost: 1.0 },
    ],
    updatedAt: '2023-10-24 10:00'
  },
  {
    id: 'p-2',
    skuCode: 'SNACK-002',
    name: '焦糖大桶爆米花',
    category: '小吃',
    price: 35,
    cost: 8.4,
    margin: 76.0,
    status: ProductStatus.ACTIVE,
    bom: [
      { ingredientId: 'ing-4', name: '精选爆米花原料', quantity: 500, unit: 'g', cost: 5.0 },
      { ingredientId: 'ing-5', name: '焦糖糖浆', quantity: 68, unit: 'ml', cost: 3.4 },
    ],
    updatedAt: '2023-10-24 11:20'
  }
];

export const ProductBOM: React.FC = () => {
  const [products, setProducts] = useState<SKUProduct[]>(INITIAL_PRODUCTS);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<SKUProduct> | null>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  
  // New States for Optimized Ingredient Selector
  const [isIngModalOpen, setIsIngModalOpen] = useState(false);
  const [ingSearchTerm, setIngSearchTerm] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.name.includes(searchTerm) || p.skuCode.includes(searchTerm));
  }, [products, searchTerm]);

  const filteredIngredients = useMemo(() => {
    return MOCK_INGREDIENTS.filter(ing => ing.name.toLowerCase().includes(ingSearchTerm.toLowerCase()));
  }, [ingSearchTerm]);

  const toggleRow = (id: string) => {
    const newRows = new Set(expandedRows);
    if (newRows.has(id)) newRows.delete(id);
    else newRows.add(id);
    setExpandedRows(newRows);
  };

  const handleCreate = () => {
    setEditingProduct({
      id: `p-${Date.now()}`,
      skuCode: '',
      name: '',
      category: '鸡尾酒',
      price: 0,
      cost: 0,
      margin: 0,
      status: ProductStatus.DRAFT,
      bom: []
    });
    setIsEditing(true);
  };

  const handleEdit = (product: SKUProduct) => {
    setEditingProduct({ ...product });
    setIsEditing(true);
  };

  const addBOMItem = (ing: Ingredient) => {
    if (!editingProduct) return;
    const currentBOM = editingProduct.bom || [];
    if (currentBOM.find(b => b.ingredientId === ing.id)) return;
    
    const newItem: BOMItem = {
      ingredientId: ing.id,
      name: ing.name,
      quantity: 1,
      unit: ing.unit,
      cost: ing.unitPrice
    };
    
    const newBOM = [...currentBOM, newItem];
    updateProductWithBOM(newBOM);
  };

  const updateProductWithBOM = (newBOM: BOMItem[]) => {
    const newCost = newBOM.reduce((sum, item) => sum + item.cost, 0);
    const newPrice = editingProduct?.price || 0;
    const newMargin = newPrice > 0 ? ((newPrice - newCost) / newPrice) * 100 : 0;
    
    setEditingProduct({
      ...editingProduct!,
      bom: newBOM,
      cost: Number(newCost.toFixed(2)),
      margin: Number(newMargin.toFixed(1))
    });
  };

  const removeBOMItem = (ingredientId: string) => {
    const newBOM = editingProduct?.bom?.filter(item => item.ingredientId !== ingredientId) || [];
    updateProductWithBOM(newBOM);
  };

  const handleSave = () => {
    if (!editingProduct?.name || !editingProduct?.skuCode) return alert('请完善商品基础信息');
    
    const updatedProducts = products.filter(p => p.id !== editingProduct.id);
    const finalProduct = {
      ...editingProduct,
      updatedAt: new Date().toLocaleString()
    } as SKUProduct;
    
    setProducts([...updatedProducts, finalProduct]);
    setIsEditing(false);
    setEditingProduct(null);
  };

  if (isEditing) {
    return (
      <div className="space-y-6 pb-20 relative">
        {/* Ingredient Selection Modal */}
        {isIngModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsIngModalOpen(false)}></div>
            <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-800">选择原料库</h3>
                  <p className="text-xs text-slate-500">点击原料将其添加至配方</p>
                </div>
                <button onClick={() => setIsIngModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="搜索原料名称..." 
                    value={ingSearchTerm}
                    onChange={(e) => setIngSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                <div className="space-y-1">
                  {filteredIngredients.map(ing => {
                    const isAdded = editingProduct?.bom?.some(b => b.ingredientId === ing.id);
                    return (
                      <button
                        key={ing.id}
                        disabled={isAdded}
                        onClick={() => addBOMItem(ing)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                          isAdded 
                          ? 'bg-slate-50 cursor-not-allowed opacity-60' 
                          : 'hover:bg-blue-50 group'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${isAdded ? 'bg-slate-200 text-slate-400' : 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                            <Droplet size={16} />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-slate-700">{ing.name}</p>
                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">¥{ing.unitPrice}/{ing.unit}</p>
                          </div>
                        </div>
                        {isAdded ? (
                          <div className="flex items-center text-emerald-600 text-[10px] font-bold">
                            <CheckCircle size={14} className="mr-1" /> 已添加
                          </div>
                        ) : (
                          <PlusCircle size={20} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                        )}
                      </button>
                    );
                  })}
                  {filteredIngredients.length === 0 && (
                    <div className="py-20 text-center text-slate-400">
                      <Search size={32} className="mx-auto mb-2 opacity-20" />
                      <p className="text-sm">未找到相关原料</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
                <button 
                  onClick={() => setIsIngModalOpen(false)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-white shadow-sm"
                >
                  完成添加
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-slate-800">
              {editingProduct?.skuCode ? '编辑 SKU' : '新建 SKU'}
            </h2>
          </div>
          <button 
            onClick={handleSave}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow-lg shadow-blue-500/30 transition-all active:scale-95 font-medium"
          >
            <Save size={18} />
            <span>保存商品</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Tag size={18} className="mr-2 text-blue-500" />
                基础属性
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">SKU 编码 *</label>
                  <input 
                    type="text" 
                    value={editingProduct?.skuCode || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, skuCode: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="如: COCK-001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">商品名称 *</label>
                  <input 
                    type="text" 
                    value={editingProduct?.name || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="如: 经典马天尼"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">分类</label>
                  <select 
                    value={editingProduct?.category || '鸡尾酒'}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option>鸡尾酒</option>
                    <option>小吃</option>
                    <option>红酒/白酒</option>
                    <option>软饮</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">零售价 (¥)</label>
                    <input 
                      type="number" 
                      value={editingProduct?.price || 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const cost = editingProduct?.cost || 0;
                        const margin = val > 0 ? ((val - cost) / val) * 100 : 0;
                        setEditingProduct({...editingProduct, price: val, margin: Number(margin.toFixed(1))});
                      }}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">当前状态</label>
                    <select 
                      value={editingProduct?.status || ProductStatus.DRAFT}
                      onChange={(e) => setEditingProduct({...editingProduct, status: e.target.value as ProductStatus})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      <option value={ProductStatus.ACTIVE}>上架</option>
                      <option value={ProductStatus.INACTIVE}>下架</option>
                      <option value={ProductStatus.DRAFT}>草稿</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-slate-900 p-6 rounded-xl text-white shadow-lg overflow-hidden relative">
              <div className="absolute -right-4 -bottom-4 text-white/5 transform rotate-12">
                <BarChart3 size={120} />
              </div>
              <h3 className="text-lg font-bold mb-4 flex items-center relative z-10">
                <BarChart3 size={18} className="mr-2 text-blue-400" />
                盈利分析
              </h3>
              <div className="grid grid-cols-2 gap-4 relative z-10">
                <div>
                  <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">估算成本</p>
                  <p className="text-2xl font-bold text-slate-100">¥ {editingProduct?.cost}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">预估毛利</p>
                  <p className={`text-2xl font-bold ${editingProduct?.margin! > 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {editingProduct?.margin}%
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800 text-[10px] text-slate-500 italic relative z-10">
                * 成本基于 BOM 配方各原料单价累加自动计算得出
              </div>
            </section>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm min-h-[500px] flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    <Droplet size={18} className="mr-2 text-blue-500" />
                    BOM 配方管理
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">配比原料并根据实时价格核算单品成本</p>
                </div>
                <button 
                  onClick={() => {
                    setIngSearchTerm('');
                    setIsIngModalOpen(true);
                  }}
                  className="flex items-center space-x-2 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-xl text-sm font-bold transition-colors group"
                >
                  <PlusCircle size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span>添加配方原料</span>
                </button>
              </div>

              {editingProduct?.bom && editingProduct.bom.length > 0 ? (
                <div className="flex-1 overflow-hidden border border-slate-100 rounded-xl">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-left">原料名称</th>
                        <th className="px-6 py-4 text-center">标准用量</th>
                        <th className="px-6 py-4 text-right">成本小计</th>
                        <th className="px-6 py-4 text-right w-10">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {editingProduct.bom.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
                                <Droplet size={14} />
                              </div>
                              <span className="font-semibold text-slate-700">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <input 
                                type="number" 
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = Math.max(0, Number(e.target.value));
                                  const ing = MOCK_INGREDIENTS.find(i => i.id === item.ingredientId);
                                  const newBOM = [...editingProduct.bom!];
                                  newBOM[idx] = {
                                    ...item,
                                    quantity: val,
                                    cost: Number((val * (ing?.unitPrice || 0)).toFixed(3))
                                  };
                                  updateProductWithBOM(newBOM);
                                }}
                                className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-center font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none"
                              />
                              <span className="text-slate-400 font-medium">{item.unit}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-slate-600">¥ {item.cost.toFixed(2)}</td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => removeBOMItem(item.ingredientId)} 
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50/50 font-bold text-slate-900 border-t border-slate-100">
                      <tr>
                        <td className="px-6 py-5" colSpan={2}>
                          <div className="flex items-center text-slate-400">
                            <Layers size={16} className="mr-2" />
                            共 {editingProduct.bom.length} 项原料
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right text-lg">
                          <span className="text-xs text-slate-400 font-normal mr-2">总计成本</span>
                          ¥ {editingProduct.cost?.toFixed(2)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30 text-slate-400 p-12">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 border border-slate-100">
                    <Layers size={32} className="opacity-20" />
                  </div>
                  <h4 className="font-bold text-slate-600">尚未配置配方</h4>
                  <p className="text-xs mt-1">点击右上角按钮从原料库中选择并建立配方</p>
                  <button 
                    onClick={() => setIsIngModalOpen(true)}
                    className="mt-6 px-6 py-2 bg-white border border-slate-200 rounded-xl text-blue-600 text-sm font-bold shadow-sm hover:shadow-md transition-all"
                  >
                    立即去添加
                  </button>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">商品 & 配方 (SKU Management)</h2>
          <p className="text-sm text-slate-500 mt-1">管理单品 SKU、维护 BOM 配方及实时核算成本毛利</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-all">
            <RefreshCw size={18} />
            <span>管理原料库</span>
          </button>
          <button 
            onClick={handleCreate}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95 font-medium"
          >
            <Plus size={20} />
            <span>新建 SKU</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Search and Filters */}
        <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="搜索 SKU 编码或名称..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm transition-all bg-white shadow-sm"
            />
          </div>
          <div className="flex space-x-2">
            <button className="flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
              <Filter size={14} />
              <span>全部分类</span>
            </button>
            <button className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">排序: 毛利</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 uppercase font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4 w-10"></th>
                <th className="px-6 py-4">SKU 信息</th>
                <th className="px-6 py-4">分类</th>
                <th className="px-6 py-4 text-right">售价</th>
                <th className="px-6 py-4 text-right">BOM 成本</th>
                <th className="px-6 py-4 text-right">毛利率</th>
                <th className="px-6 py-4 text-center">状态</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <React.Fragment key={p.id}>
                  <tr 
                    className={`hover:bg-slate-50 transition-colors group cursor-pointer ${expandedRows.has(p.id) ? 'bg-slate-50' : ''}`}
                    onClick={() => toggleRow(p.id)}
                  >
                    <td className="px-6 py-4 text-slate-400">
                      {expandedRows.has(p.id) ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 border border-slate-200 group-hover:bg-white group-hover:border-blue-200 group-hover:text-blue-500 transition-all">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{p.name}</p>
                          <p className="text-[10px] font-mono text-slate-400 tracking-tighter">{p.skuCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">{p.category}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-900">¥ {p.price.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-slate-600">¥ {p.cost.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex flex-col items-end">
                        <span className={`font-bold ${p.margin > 60 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {p.margin}%
                        </span>
                        <div className="w-16 bg-slate-100 h-1 rounded-full mt-1 overflow-hidden">
                           <div className={`h-full ${p.margin > 60 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{width: `${p.margin}%`}}></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        p.status === ProductStatus.ACTIVE ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        p.status === ProductStatus.INACTIVE ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {p.status === ProductStatus.ACTIVE ? <CheckCircle size={10} /> : <XCircle size={10} />}
                        <span>{p.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                        className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <Edit size={16} />
                      </button>
                    </td>
                  </tr>
                  {expandedRows.has(p.id) && (
                    <tr className="bg-slate-50/50">
                      <td colSpan={8} className="px-12 py-4">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
                            <div>
                              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest flex items-center">
                                <Droplet size={14} className="mr-2 text-blue-500" />
                                配方详情 (BOM)
                              </h4>
                              <p className="text-[10px] text-slate-400 mt-1">最后更新: {p.updatedAt}</p>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleEdit(p); }} className="text-xs text-blue-600 font-bold hover:underline">编辑配方</button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {p.bom.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition-colors">
                                <div className="flex items-center space-x-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                  <span className="text-sm font-semibold text-slate-700">{item.name}</span>
                                </div>
                                <span className="text-xs text-slate-500 font-mono">
                                  {item.quantity} {item.unit} <span className="mx-1 opacity-20">|</span> ¥{item.cost.toFixed(2)}
                                </span>
                              </div>
                            ))}
                            {p.bom.length === 0 && (
                              <div className="col-span-full py-4 text-center text-slate-400 text-xs italic">
                                该商品暂未配置配方内容
                              </div>
                            )}
                          </div>
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
    </div>
  );
};
