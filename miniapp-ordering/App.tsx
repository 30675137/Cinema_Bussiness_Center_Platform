
import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, Coffee, Beer, Wine, Pizza, Search, Star, ChevronRight, X, Plus, Minus, Info, User, Ticket, Award, CheckCircle2, ClipboardList, Scan, Camera } from 'lucide-react';
import { CategoryType, Product, CartItem, EntertainmentZone, Coupon, Member } from './types';
import { PRODUCTS, ZONES, MOCK_MEMBER } from './constants';
import { getAIRecommendation } from './geminiService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'order' | 'member'>('order');
  const [activeCategory, setActiveCategory] = useState<CategoryType>(CategoryType.ALCOHOL);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedZone, setSelectedZone] = useState<EntertainmentZone>(ZONES[0]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAISuggestionLoading, setIsAISuggestionLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<{name: string, reason: string}[]>([]);
  
  // 会员状态
  const [member, setMember] = useState<Member>(MOCK_MEMBER);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [usePoints, setUsePoints] = useState(false);

  const filteredProducts = useMemo(() => 
    PRODUCTS.filter(p => p.category === activeCategory),
    [activeCategory]
  );

  const subtotal = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.isRedemption ? 0 : item.product.price * item.quantity), 0),
    [cart]
  );

  // 获取特定产品在购物车中的总数（排除积分兑换的）
  const getProductQuantity = (productId: string) => {
    return cart
      .filter(item => item.product.id === productId && !item.isRedemption)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  // 优惠逻辑计算
  const discount = useMemo(() => {
    let d = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === 'flat' && subtotal >= appliedCoupon.minSpend) {
        d += appliedCoupon.value;
      } else if (appliedCoupon.discountType === 'percent') {
        d += (subtotal * appliedCoupon.value) / 100;
      }
    }
    if (usePoints) {
      const pointValue = member.points / 10;
      const pointDiscount = Math.min(pointValue, subtotal * 0.5);
      d += pointDiscount;
    }
    return Math.floor(d);
  }, [appliedCoupon, subtotal, usePoints, member.points]);

  const cartTotal = Math.max(0, subtotal - discount);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const pointsToEarn = Math.floor(cartTotal);

  const addToCart = (product: Product, options: Record<string, string> = {}, isRedemption = false) => {
    if (isRedemption && member.points < (product.pointsPrice || 0)) {
      alert("积分余额不足");
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => 
        item.product.id === product.id && 
        item.isRedemption === isRedemption &&
        JSON.stringify(item.selectedOptions) === JSON.stringify(options)
      );
      if (existing) {
        return prev.map(item => 
          item === existing ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, selectedOptions: options, isRedemption }];
    });
    setSelectedProduct(null);
    if (isRedemption) {
      alert(`已成功兑换 ${product.name}`);
    }
  };

  const updateCartQuantity = (productId: string, delta: number, isRedemption = false) => {
    setCart(prev => {
      const items = prev.filter(item => item.product.id === productId && item.isRedemption === isRedemption);
      if (items.length === 0 && delta > 0) {
        const product = PRODUCTS.find(p => p.id === productId);
        if (product) return [...prev, { product, quantity: 1, selectedOptions: {}, isRedemption }];
        return prev;
      }
      
      return prev.map(item => {
        if (item.product.id === productId && item.isRedemption === isRedemption) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const fetchAIRecommendation = async () => {
    setIsAISuggestionLoading(true);
    const moodMap: Record<string, string> = {
      'h1': '震撼影院',
      'h2': '高能竞技',
      'h3': '爵士微醺',
      'h4': '激情赛事'
    };
    const recs = await getAIRecommendation(moodMap[selectedZone.id] || '普通观影', PRODUCTS);
    setAiRecommendations(recs);
    setIsAISuggestionLoading(false);
  };

  useEffect(() => {
    fetchAIRecommendation();
  }, [selectedZone]);

  const renderOrderTab = () => (
    <div className="flex flex-1 overflow-hidden">
      <nav className="w-20 bg-zinc-900 border-r border-zinc-800 flex flex-col items-center py-4 space-y-8 overflow-y-auto">
        {[
          { type: CategoryType.ALCOHOL, icon: Wine },
          { type: CategoryType.COFFEE, icon: Coffee },
          { type: CategoryType.BEVERAGE, icon: Beer },
          { type: CategoryType.SNACK, icon: Pizza },
        ].map(({ type, icon: Icon }) => (
          <button
            key={type}
            onClick={() => setActiveCategory(type)}
            className={`flex flex-col items-center space-y-1 transition-all ${
              activeCategory === type ? 'text-amber-500 scale-110' : 'text-zinc-500'
            }`}
          >
            <div className={`p-2 rounded-xl ${activeCategory === type ? 'bg-amber-500/10' : 'bg-transparent'}`}>
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-medium text-center px-1">{type}</span>
          </button>
        ))}
      </nav>

      <main className="flex-1 overflow-y-auto bg-zinc-950 p-4 pb-24">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-lg font-bold mb-1">{activeCategory}</h2>
            <p className="text-xs text-zinc-500">为您的视听盛宴挑选心意之选</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {filteredProducts.map(product => {
            const qty = getProductQuantity(product.id);
            return (
              <div 
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="bg-zinc-900/50 rounded-2xl overflow-hidden border border-zinc-800 flex items-center p-3 active:scale-[0.98] transition-transform cursor-pointer"
              >
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="w-20 h-20 rounded-xl object-cover"
                />
                <div className="flex-1 ml-4 flex flex-col justify-between h-20">
                  <div>
                    <h3 className="font-semibold text-zinc-100 text-sm">{product.name}</h3>
                    <div className="flex items-center text-[10px] text-zinc-500 mt-0.5 space-x-1">
                      <Star className="w-2 h-2 text-amber-500 fill-amber-500" />
                      <span>预计得 {product.price} 积分</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-500 text-sm">¥{product.price}</span>
                    <div className="flex items-center space-x-2">
                      {qty > 0 && (
                        <>
                          <button 
                            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-full p-1.5 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateCartQuantity(product.id, -1);
                            }}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-sm font-bold text-amber-500 w-4 text-center">{qty}</span>
                        </>
                      )}
                      <button 
                        className="bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-full p-1.5 shadow-lg shadow-amber-500/10 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateCartQuantity(product.id, 1);
                        }}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );

  const renderMemberTab = () => (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="relative bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-3xl p-6 border border-zinc-700 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        <div className="flex justify-between items-start mb-10">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">{member.name}</h3>
            <div className="flex items-center mt-1 space-x-2">
              <span className="px-2 py-0.5 bg-amber-500 text-zinc-950 text-[10px] font-black rounded-full uppercase">
                {member.level}
              </span>
              <span className="text-xs text-zinc-400">自 2024 年加入</span>
            </div>
          </div>
          <Award className="w-8 h-8 text-amber-500" />
        </div>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-zinc-400 mb-1 uppercase tracking-widest font-bold">积分余额</p>
            <p className="text-3xl font-black text-amber-500">{member.points} <span className="text-sm font-normal text-zinc-500 ml-1">Pts</span></p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-zinc-500 mb-1">消费总计</p>
            <p className="text-sm font-bold">¥{member.totalSpent}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          className="bg-zinc-900 hover:bg-zinc-800 transition-colors rounded-2xl p-4 border border-zinc-800 text-left flex flex-col"
          onClick={() => alert('暂无历史订单')}
        >
          <ClipboardList className="w-5 h-5 text-blue-500 mb-2" />
          <p className="text-xs text-zinc-400">我的订单</p>
          <p className="text-lg font-bold">查看全部</p>
        </button>

        <button 
          className="bg-zinc-900 hover:bg-zinc-800 transition-colors rounded-2xl p-4 border border-zinc-800 text-left flex flex-col relative"
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingBag className="w-5 h-5 text-green-500 mb-2" />
          {totalItems > 0 && (
            <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {totalItems}
            </span>
          )}
          <p className="text-xs text-zinc-400">购物车</p>
          <p className="text-lg font-bold">{totalItems > 0 ? `${totalItems}件商品` : '空空如也'}</p>
        </button>

        <button className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 text-left">
          <Ticket className="w-5 h-5 text-amber-500 mb-2" />
          <p className="text-xs text-zinc-400">优惠券</p>
          <p className="text-lg font-bold">{member.coupons.length} 张可用</p>
        </button>

        <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
          <Award className="w-5 h-5 text-purple-500 mb-2" />
          <p className="text-xs text-zinc-400">等级晋升</p>
          <p className="text-lg font-bold text-zinc-200">¥{2000 - member.totalSpent} 升级</p>
        </div>
      </div>

      <div>
        <h4 className="font-bold text-sm mb-4 flex items-center px-1">
          <Star className="w-4 h-4 mr-2 text-amber-500" /> 积分商城
        </h4>
        <div className="space-y-3">
          {PRODUCTS.filter(p => p.pointsPrice).map(product => (
            <div key={product.id} className="bg-zinc-900/50 rounded-2xl p-3 border border-zinc-800 flex items-center justify-between">
              <div className="flex items-center">
                <img src={product.image} className="w-12 h-12 rounded-lg object-cover" alt={product.name} />
                <div className="ml-3">
                  <p className="text-xs font-bold">{product.name}</p>
                  <p className="text-[10px] text-amber-500 font-bold">{product.pointsPrice} 积分</p>
                </div>
              </div>
              <button 
                onClick={() => addToCart(product, {}, true)}
                className="bg-amber-500 text-zinc-950 text-[10px] font-bold px-4 py-1.5 rounded-full"
              >
                立即兑换
              </button>
            </div>
          ))}
        </div>
      </div>
    </main>
  );

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-zinc-950 text-zinc-50 relative overflow-hidden border-x border-zinc-800">
      
      {/* 扫码界面覆盖层 */}
      {isScanOpen && (
        <div className="fixed inset-0 z-[100] bg-black animate-fade-in flex flex-col">
          <div className="relative flex-1 flex flex-col items-center justify-center p-6">
            <button 
              onClick={() => setIsScanOpen(false)}
              className="absolute top-10 right-6 p-3 bg-white/10 rounded-full backdrop-blur-md text-white"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="relative w-64 h-64 border-2 border-amber-500/50 rounded-3xl">
              {/* 四个角 */}
              <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-amber-500 rounded-tl-xl"></div>
              <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-amber-500 rounded-tr-xl"></div>
              <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-amber-500 rounded-bl-xl"></div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-amber-500 rounded-br-xl"></div>
              
              {/* 扫描线动画 */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-scan"></div>
              
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                <Camera className="w-16 h-16 text-zinc-500" />
              </div>
            </div>
            
            <div className="mt-12 text-center space-y-2">
              <h3 className="text-xl font-bold">扫描二维码</h3>
              <p className="text-sm text-zinc-400 px-10 leading-relaxed">对准影厅座位或桌台上的二维码即可自动点餐</p>
            </div>

            <button 
              onClick={() => {
                alert('已识别: 3号厅-爵士现场-B12桌');
                setSelectedZone(ZONES[2]);
                setIsScanOpen(false);
              }}
              className="mt-16 bg-amber-500 text-zinc-950 px-8 py-3 rounded-full font-black text-sm uppercase tracking-widest active:scale-95 transition-transform"
            >
              模拟识别
            </button>
          </div>
        </div>
      )}

      <header className="px-4 pt-6 pb-4 bg-zinc-900/50 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-40">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-amber-500">CINELounge</h1>
            <button className="flex items-center text-sm text-zinc-400 mt-1">
              <Info className="w-3.5 h-3.5 mr-1" />
              <span>{selectedZone.name}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 bg-zinc-800 hover:bg-zinc-700 transition-colors rounded-full text-zinc-300">
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsScanOpen(true)}
              className="p-2 bg-amber-500 hover:bg-amber-400 transition-colors rounded-full text-zinc-950 shadow-lg shadow-amber-500/10"
            >
              <Scan className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="px-4 py-2 bg-gradient-to-r from-amber-600/20 to-transparent border-b border-amber-900/30 overflow-hidden whitespace-nowrap">
        <div className="flex items-center space-x-2">
          <Star className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0 animate-pulse" />
          <span className="text-[10px] font-medium text-amber-200 uppercase tracking-widest">
            {isAISuggestionLoading ? "AI 正在根据氛围为您配餐..." : 
              aiRecommendations.length > 0 ? `AI推荐: ${aiRecommendations[0].name}` : 
              "会员特惠专场已开启"}
          </span>
        </div>
      </div>

      {activeTab === 'order' ? renderOrderTab() : renderMemberTab()}

      <nav className="h-20 bg-zinc-900 border-t border-zinc-800 flex items-center justify-around px-6 z-40">
        <button 
          onClick={() => setActiveTab('order')}
          className={`flex flex-col items-center space-y-1 ${activeTab === 'order' ? 'text-amber-500' : 'text-zinc-500'}`}
        >
          <ShoppingBag className="w-6 h-6" />
          <span className="text-[10px] font-bold">点餐</span>
        </button>
        <button 
          onClick={() => setActiveTab('member')}
          className={`flex flex-col items-center space-y-1 ${activeTab === 'member' ? 'text-amber-500' : 'text-zinc-500'}`}
        >
          <User className="w-6 h-6" />
          <span className="text-[10px] font-bold">会员中心</span>
        </button>
      </nav>

      {cartTotal > 0 && activeTab === 'order' && (
        <div className="absolute bottom-24 left-4 right-4 z-50">
          <div 
            onClick={() => setIsCartOpen(true)}
            className="bg-amber-500 text-zinc-950 h-14 rounded-2xl flex items-center px-6 shadow-2xl cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <div className="bg-zinc-950 text-amber-500 text-xs font-bold rounded-lg w-7 h-7 flex items-center justify-center">
              {totalItems}
            </div>
            <div className="flex-1 ml-4">
              <p className="text-xs opacity-80 font-bold uppercase tracking-tight leading-none">去结账</p>
              <p className="text-lg font-black">¥{cartTotal}</p>
            </div>
            <ChevronRight className="w-6 h-6" />
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="absolute inset-0 z-[60] flex items-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setSelectedProduct(null)} />
          <div className="relative w-full bg-zinc-900 rounded-t-3xl p-6 animate-slide-up border-t border-zinc-800">
            <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-6"></div>
            <div className="flex space-x-6 mb-8">
              <img src={selectedProduct.image} className="w-32 h-32 rounded-2xl object-cover shadow-2xl" alt={selectedProduct.name} />
              <div className="flex-1 pt-2">
                <h2 className="text-2xl font-black text-zinc-50 leading-tight">{selectedProduct.name}</h2>
                <p className="text-xs text-zinc-400 mt-2">{selectedProduct.description}</p>
                <p className="text-2xl font-black text-amber-500 mt-4">¥{selectedProduct.price}</p>
              </div>
            </div>

            <button 
              className="w-full bg-amber-500 py-4 rounded-2xl text-zinc-950 font-black hover:bg-amber-400 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-amber-500/20"
              onClick={() => addToCart(selectedProduct)}
            >
              <Plus className="w-5 h-5" />
              <span>加入购物车</span>
            </button>
            <p className="text-center text-[10px] text-zinc-500 mt-4 uppercase tracking-widest">
              下单即可获得 {selectedProduct.price} 积分
            </p>
          </div>
        </div>
      )}

      {isCartOpen && (
        <div className="absolute inset-0 z-[70] flex items-end">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full h-[90vh] bg-zinc-900 rounded-t-[2.5rem] flex flex-col border-t border-zinc-800 overflow-hidden">
            <div className="p-8 pb-4 flex items-center justify-between">
              <h2 className="text-2xl font-black">订单汇总</h2>
              <button onClick={() => setIsCartOpen(false)} className="bg-zinc-800 p-2 rounded-full"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-8 py-4 space-y-6">
              {cart.map((item, idx) => (
                <div key={`${item.product.id}-${idx}`} className="flex items-center justify-between group">
                  <div className="flex items-center">
                    <div className="relative">
                      <img src={item.product.image} className="w-14 h-14 rounded-xl object-cover" alt={item.product.name} />
                      {item.isRedemption && <div className="absolute -top-1 -right-1 bg-amber-500 text-zinc-950 text-[8px] font-black px-1.5 py-0.5 rounded-full">兑换</div>}
                    </div>
                    <div className="ml-4">
                      <h4 className="font-bold text-sm">{item.product.name}</h4>
                      <p className="text-amber-500 text-xs font-bold">
                        {item.isRedemption ? `${item.product.pointsPrice} 积分` : `¥${item.product.price}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 bg-zinc-800/50 p-1 rounded-xl">
                    <button onClick={() => updateCartQuantity(item.product.id, -1, item.isRedemption)} className="p-1 hover:text-amber-500"><Minus className="w-3.5 h-3.5" /></button>
                    <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                    <button onClick={() => updateCartQuantity(item.product.id, 1, item.isRedemption)} className="p-1 hover:text-amber-500"><Plus className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}

              <div className="pt-4 space-y-3">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">可用优惠券</p>
                {member.coupons.map(coupon => (
                  <button
                    key={coupon.id}
                    disabled={subtotal < coupon.minSpend}
                    onClick={() => setAppliedCoupon(appliedCoupon?.id === coupon.id ? null : coupon)}
                    className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      appliedCoupon?.id === coupon.id 
                        ? 'bg-amber-500/10 border-amber-500' 
                        : 'bg-zinc-800/30 border-zinc-800'
                    } ${subtotal < coupon.minSpend ? 'opacity-40' : 'opacity-100'}`}
                  >
                    <div className="flex items-center">
                      <Ticket className={`w-5 h-5 mr-3 ${appliedCoupon?.id === coupon.id ? 'text-amber-500' : 'text-zinc-500'}`} />
                      <div className="text-left">
                        <p className="text-xs font-bold">{coupon.title}</p>
                        <p className="text-[10px] text-zinc-500">{coupon.description}</p>
                      </div>
                    </div>
                    {appliedCoupon?.id === coupon.id && <CheckCircle2 className="w-5 h-5 text-amber-500" />}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-2xl border border-zinc-800">
                <div className="flex items-center">
                  <Star className="w-5 h-5 mr-3 text-amber-500" />
                  <div>
                    <p className="text-xs font-bold">积分抵扣现金</p>
                    <p className="text-[10px] text-zinc-500">当前余额: {member.points} 积分</p>
                  </div>
                </div>
                <button 
                  onClick={() => setUsePoints(!usePoints)}
                  className={`w-10 h-6 rounded-full transition-colors relative ${usePoints ? 'bg-amber-500' : 'bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${usePoints ? 'translate-x-4' : ''}`}></div>
                </button>
              </div>
            </div>

            <div className="p-8 bg-zinc-950 border-t border-zinc-800">
              <div className="space-y-1 mb-6">
                <div className="flex justify-between text-xs text-zinc-500">
                  <span>小计</span>
                  <span>¥{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-xs text-amber-500 font-bold">
                    <span>已优惠</span>
                    <span>-¥{discount}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-zinc-400 font-bold">实付金额</span>
                  <span className="text-3xl font-black text-amber-500">¥{cartTotal}</span>
                </div>
                <div className="flex items-center justify-end text-[10px] text-zinc-600">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> 本单将为您赚取 {pointsToEarn} 积分
                </div>
              </div>
              <button 
                className="w-full bg-amber-500 py-5 rounded-[1.5rem] text-zinc-950 font-black text-lg transition-all shadow-xl shadow-amber-500/10 active:scale-95"
                onClick={() => {
                  alert(`支付成功! 实付 ¥${cartTotal}。您已获得 ${pointsToEarn} 积分。`);
                  const pointsUsed = usePoints ? Math.min(member.points, Math.floor(subtotal * 5)) : 0;
                  setMember(prev => ({...prev, points: prev.points + pointsToEarn - pointsUsed, totalSpent: prev.totalSpent + cartTotal}));
                  setCart([]);
                  setIsCartOpen(false);
                  setAppliedCoupon(null);
                  setUsePoints(false);
                }}
              >
                立即支付
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(256px); opacity: 0; }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slide-up {
          animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default App;
