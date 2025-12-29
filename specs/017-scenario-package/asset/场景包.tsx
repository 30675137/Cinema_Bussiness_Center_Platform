
import React, { useState, useMemo } from 'react';
import { 
  Plus, Search, Edit, Copy, Trash2, MapPin, 
  ArrowLeft, Save, Package, Users, Clock, 
  Settings, Zap, CheckCircle2, AlertCircle,
  Image as ImageIcon, X, Trash
} from 'lucide-react';
import { ScenarioPackage, PackageStatus, PackageItem, PackageService } from '../types';

// Mock Data for Hall Types
const MOCK_HALL_TYPES = [
  { id: 'vip', name: 'VIP 厅' },
  { id: 'party', name: 'Party 厅' },
  { id: 'couple', name: '情侣厅' },
  { id: 'imax', name: 'IMAX 厅' },
];

// Mock Data for Products (Soft Benefits)
const MOCK_PRODUCTS = [
  { id: 1, name: '招牌莫吉托 (扎)', price: 45 },
  { id: 2, name: 'VIP 零食拼盘', price: 35 },
  { id: 3, name: '海陆双拼', price: 58 },
  { id: 4, name: '精选干红 (瓶)', price: 80 },
];

// Mock Data for Services
const MOCK_SERVICES = [
  { id: 'butler', name: '管家服务', price: 200 },
  { id: 'decor', name: '场景布置', price: 300 },
  { id: 'photo', name: '跟拍服务', price: 500 },
];

const INITIAL_PACKAGES: ScenarioPackage[] = [
  {
    id: 'pkg-1',
    name: 'VIP 生日派对专场',
    description: '尊享私密空间，专业管家服务，为您打造难忘的生日派对。',
    imageUrl: 'https://images.unsplash.com/photo-1530103043960-ef38714abb15?auto=format&fit=crop&q=80&w=400',
    status: PackageStatus.PUBLISHED,
    hallTypes: ['vip', 'party'],
    rules: { duration: 3, minCapacity: 10, maxCapacity: 20 },
    content: {
      hardBenefits: ['免费生日贺卡', '指定影院8折券'],
      softBenefits: [
        { productId: 1, name: '招牌莫吉托 (扎)', quantity: 20, price: 45 },
        { productId: 2, name: 'VIP 零食拼盘', quantity: 5, price: 35 }
      ],
      services: [
        { id: 'butler', name: '管家服务', price: 200 },
        { id: 'decor', name: '场景布置', price: 300 }
      ]
    },
    pricing: {
      packagePrice: 1888,
      referencePrice: 2500,
      discountRate: 24.5,
      discountAmount: 612
    },
    updatedAt: '2023-10-24 14:00'
  }
];

export const ScenarioManagement: React.FC = () => {
  const [packages, setPackages] = useState<ScenarioPackage[]>(INITIAL_PACKAGES);
  const [activeTab, setActiveTab] = useState<PackageStatus | 'ALL'>('ALL');
  const [isEditing, setIsEditing] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Partial<ScenarioPackage> | null>(null);

  const filteredPackages = useMemo(() => {
    return activeTab === 'ALL' 
      ? packages.filter(p => p.status !== PackageStatus.DELETED)
      : packages.filter(p => p.status === activeTab);
  }, [packages, activeTab]);

  const handleCreate = () => {
    setEditingPackage({
      id: `pkg-${Date.now()}`,
      name: '',
      description: '',
      status: PackageStatus.DRAFT,
      hallTypes: [],
      rules: { duration: 2, minCapacity: 2, maxCapacity: 10 },
      content: { hardBenefits: [], softBenefits: [], services: [] },
      pricing: { packagePrice: 0, referencePrice: 0, discountRate: 0, discountAmount: 0 }
    });
    setIsEditing(true);
  };

  const handleEdit = (pkg: ScenarioPackage) => {
    setEditingPackage({ ...pkg });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editingPackage?.name) return alert('请填写场景包名称');
    
    // Validate pricing
    if (editingPackage.pricing?.packagePrice! <= 0) return alert('打包价格必须大于0');

    const updated = packages.filter(p => p.id !== editingPackage.id);
    const newPkg = {
      ...editingPackage,
      updatedAt: new Date().toLocaleString(),
    } as ScenarioPackage;

    setPackages([...updated, newPkg]);
    setIsEditing(false);
    setEditingPackage(null);
  };

  const updateStatus = (id: string, status: PackageStatus) => {
    setPackages(packages.map(p => p.id === id ? { ...p, status } : p));
  };

  if (isEditing) {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-slate-800">
              {editingPackage?.id ? '编辑场景包' : '新建场景包'}
            </h2>
          </div>
          <div className="flex space-x-3">
            <button 
              onClick={() => setIsEditing(false)} 
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg"
            >
              取消
            </button>
            <button 
              onClick={handleSave}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors shadow-sm font-medium"
            >
              <Save size={18} />
              <span>保存为草稿</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Basic Info & Rules */}
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Settings size={18} className="mr-2 text-blue-500" />
                基础信息
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">场景包名称 *</label>
                  <input 
                    type="text" 
                    value={editingPackage?.name || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="例如：VIP 生日派对专场"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">背景描述</label>
                  <textarea 
                    rows={3}
                    value={editingPackage?.description || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, description: e.target.value })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="介绍该场景包的特色服务..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">适用影厅类型</label>
                  <div className="flex flex-wrap gap-2">
                    {MOCK_HALL_TYPES.map(hall => (
                      <button
                        key={hall.id}
                        onClick={() => {
                          const current = editingPackage?.hallTypes || [];
                          const updated = current.includes(hall.id) 
                            ? current.filter(id => id !== hall.id)
                            : [...current, hall.id];
                          setEditingPackage({ ...editingPackage, hallTypes: updated });
                        }}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          editingPackage?.hallTypes?.includes(hall.id)
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {hall.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Clock size={18} className="mr-2 text-blue-500" />
                使用规则
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">建议时长 (小时)</label>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={editingPackage?.rules?.duration || 0}
                      onChange={(e) => setEditingPackage({ 
                        ...editingPackage, 
                        rules: { ...editingPackage?.rules!, duration: Number(e.target.value) } 
                      })}
                      className="w-full pl-4 pr-10 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">H</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">最小人数</label>
                  <input 
                    type="number" 
                    value={editingPackage?.rules?.minCapacity || 0}
                    onChange={(e) => setEditingPackage({ 
                      ...editingPackage, 
                      rules: { ...editingPackage?.rules!, minCapacity: Number(e.target.value) } 
                    })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">最大人数</label>
                  <input 
                    type="number" 
                    value={editingPackage?.rules?.maxCapacity || 0}
                    onChange={(e) => setEditingPackage({ 
                      ...editingPackage, 
                      rules: { ...editingPackage?.rules!, maxCapacity: Number(e.target.value) } 
                    })}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <Package size={18} className="mr-2 text-blue-500" />
                  软权益 (单品组合)
                </h3>
                <div className="relative group">
                   <button className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center">
                     <Plus size={16} className="mr-1"/> 添加单品
                   </button>
                   {/* Mock Popover for selection */}
                   <div className="hidden group-hover:block absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50 p-2">
                     {MOCK_PRODUCTS.map(p => (
                       <button 
                        key={p.id}
                        onClick={() => {
                          const current = editingPackage?.content?.softBenefits || [];
                          if (current.find(item => item.productId === p.id)) return;
                          const updated = [...current, { productId: p.id, name: p.name, quantity: 1, price: p.price }];
                          setEditingPackage({ ...editingPackage, content: { ...editingPackage?.content!, softBenefits: updated } });
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 rounded"
                       >
                         {p.name} - ¥{p.price}
                       </button>
                     ))}
                   </div>
                </div>
              </div>
              <div className="space-y-3">
                {editingPackage?.content?.softBenefits?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div className="flex items-center space-x-3">
                       <div className="p-2 bg-white rounded border border-slate-200"><Package size={14} className="text-slate-400"/></div>
                       <div>
                         <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                         <p className="text-xs text-slate-500">单价: ¥{item.price}</p>
                       </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center bg-white border border-slate-200 rounded">
                        <button 
                          onClick={() => {
                            const updated = [...editingPackage?.content?.softBenefits!];
                            updated[idx].quantity = Math.max(1, updated[idx].quantity - 1);
                            setEditingPackage({ ...editingPackage, content: { ...editingPackage?.content!, softBenefits: updated } });
                          }}
                          className="px-2 py-1 hover:bg-slate-100">-</button>
                        <span className="px-3 text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => {
                            const updated = [...editingPackage?.content?.softBenefits!];
                            updated[idx].quantity += 1;
                            setEditingPackage({ ...editingPackage, content: { ...editingPackage?.content!, softBenefits: updated } });
                          }}
                          className="px-2 py-1 hover:bg-slate-100">+</button>
                      </div>
                      <button 
                        onClick={() => {
                          const updated = editingPackage?.content?.softBenefits?.filter((_, i) => i !== idx);
                          setEditingPackage({ ...editingPackage, content: { ...editingPackage?.content!, softBenefits: updated } });
                        }}
                        className="text-red-500 hover:text-red-600"><Trash size={16}/></button>
                    </div>
                  </div>
                ))}
                {!editingPackage?.content?.softBenefits?.length && (
                  <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-lg text-slate-400 text-sm">
                    尚未添加任何单品
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Column: Image & Pricing */}
          <div className="space-y-6">
            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <ImageIcon size={18} className="mr-2 text-blue-500" />
                封面图
              </h3>
              <div className="aspect-video bg-slate-100 rounded-lg border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden group relative">
                {editingPackage?.imageUrl ? (
                  <>
                    <img src={editingPackage.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <button 
                        onClick={() => setEditingPackage({ ...editingPackage, imageUrl: '' })}
                        className="p-2 bg-white rounded-full text-red-500"
                      >
                        <X size={20}/>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <ImageIcon size={32} className="text-slate-300 mb-2" />
                    <p className="text-xs text-slate-500 font-medium">点击上传背景图</p>
                    <p className="text-[10px] text-slate-400 mt-1">支持 JPG/PNG, 不超过 5MB</p>
                  </>
                )}
              </div>
            </section>

            <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Zap size={18} className="mr-2 text-blue-500" />
                定价策略
              </h3>
              
              {/* Reference Price Calculation */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6 space-y-2">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>单品累计总价</span>
                  <span>¥{(editingPackage?.content?.softBenefits?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>服务项目总价</span>
                  <span>¥{(editingPackage?.content?.services?.reduce((sum, item) => sum + item.price, 0) || 0).toFixed(2)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-800">
                  <span>参考总价 (不含硬权益)</span>
                  <span>¥{(
                    (editingPackage?.content?.softBenefits?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0) + 
                    (editingPackage?.content?.services?.reduce((sum, item) => sum + item.price, 0) || 0)
                  ).toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">打包一口价 *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">¥</span>
                    <input 
                      type="number" 
                      value={editingPackage?.pricing?.packagePrice || 0}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const ref = (editingPackage?.content?.softBenefits?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0) + 
                                    (editingPackage?.content?.services?.reduce((sum, item) => sum + item.price, 0) || 0);
                        const diff = ref - val;
                        const rate = ref > 0 ? (diff / ref) * 100 : 0;
                        setEditingPackage({ 
                          ...editingPackage, 
                          pricing: { 
                            packagePrice: val, 
                            referencePrice: ref,
                            discountAmount: diff,
                            discountRate: Number(rate.toFixed(1))
                          } 
                        });
                      }}
                      className="w-full pl-8 pr-4 py-3 border-2 border-blue-100 rounded-lg focus:border-blue-500 outline-none text-xl font-bold text-slate-900"
                    />
                  </div>
                </div>

                {editingPackage?.pricing?.discountAmount! > 0 && (
                   <div className="flex items-center p-3 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-700 text-sm">
                     <CheckCircle2 size={16} className="mr-2" />
                     <span>已比单独购买节省 <b>¥{editingPackage.pricing?.discountAmount?.toFixed(2)}</b> ({editingPackage.pricing?.discountRate}%)</span>
                   </div>
                )}
                {editingPackage?.pricing?.discountAmount! < 0 && (
                   <div className="flex items-center p-3 bg-amber-50 rounded-lg border border-amber-100 text-amber-700 text-sm">
                     <AlertCircle size={16} className="mr-2" />
                     <span>警告：打包价高于单点总和</span>
                   </div>
                )}
              </div>
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
          <h2 className="text-2xl font-bold text-slate-800">场景包管理</h2>
          <p className="text-sm text-slate-500 mt-1">定义和打包高利润产品原型，支持跨渠道预约分销</p>
        </div>
        <button 
          onClick={handleCreate}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 font-medium"
        >
          <Plus size={20} />
          <span>新建场景包</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Filters and Search */}
        <div className="p-4 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-slate-50/30">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
            {['ALL', PackageStatus.PUBLISHED, PackageStatus.DRAFT, PackageStatus.ARCHIVED].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === tab 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                }`}
              >
                {tab === 'ALL' ? '全部' : tab}
              </button>
            ))}
          </div>
          
          <div className="flex space-x-2 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="搜索场景包..." 
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64"
              />
            </div>
          </div>
        </div>

        {/* List View */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50/50 border-b border-slate-100 font-bold">
              <tr>
                <th className="px-6 py-4">场景包基本信息</th>
                <th className="px-6 py-4">适用规则</th>
                <th className="px-6 py-4">包含权益/服务</th>
                <th className="px-6 py-4">打包一口价</th>
                <th className="px-6 py-4">状态</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPackages.map((pkg) => (
                <tr key={pkg.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-12 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                        {pkg.imageUrl ? <img src={pkg.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="m-auto text-slate-300" size={20}/>}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{pkg.name}</h4>
                        <div className="flex items-center mt-1 text-slate-400 text-xs">
                          <MapPin size={12} className="mr-1" />
                          {pkg.hallTypes.map(id => MOCK_HALL_TYPES.find(h => h.id === id)?.name).join(', ')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center text-slate-600"><Clock size={12} className="mr-1.5"/> {pkg.rules.duration} 小时</div>
                      <div className="flex items-center text-slate-600"><Users size={12} className="mr-1.5"/> {pkg.rules.minCapacity}-{pkg.rules.maxCapacity} 人</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-[200px] flex flex-wrap gap-1">
                      {pkg.content.softBenefits.slice(0, 2).map((item, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px]">{item.name} x{item.quantity}</span>
                      ))}
                      {pkg.content.services.map((s, i) => (
                        <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px]">{s.name}</span>
                      ))}
                      {(pkg.content.softBenefits.length > 2) && <span className="text-[10px] text-slate-400">...</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">¥{pkg.pricing.packagePrice.toLocaleString()}</div>
                    <div className="text-[10px] text-emerald-600 font-medium mt-0.5">立省 ¥{pkg.pricing.discountAmount}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      pkg.status === PackageStatus.PUBLISHED ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      pkg.status === PackageStatus.DRAFT ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {pkg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {pkg.status === PackageStatus.PUBLISHED ? (
                        <button onClick={() => updateStatus(pkg.id, PackageStatus.ARCHIVED)} className="p-2 hover:bg-slate-200 rounded text-slate-600" title="下架"><ArrowLeft size={16}/></button>
                      ) : (
                        <button onClick={() => updateStatus(pkg.id, PackageStatus.PUBLISHED)} className="p-2 hover:bg-emerald-100 rounded text-emerald-600" title="发布"><Zap size={16}/></button>
                      )}
                      <button onClick={() => handleEdit(pkg)} className="p-2 hover:bg-blue-100 rounded text-blue-600" title="编辑"><Edit size={16}/></button>
                      <button onClick={() => updateStatus(pkg.id, PackageStatus.DELETED)} className="p-2 hover:bg-red-100 rounded text-red-500" title="删除"><Trash2 size={16}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {!filteredPackages.length && (
          <div className="p-20 text-center flex flex-col items-center">
             <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-4">
                <Package size={32} />
             </div>
             <p className="text-slate-400 font-medium">暂无匹配的场景包数据</p>
          </div>
        )}
      </div>
    </div>
  );
};
