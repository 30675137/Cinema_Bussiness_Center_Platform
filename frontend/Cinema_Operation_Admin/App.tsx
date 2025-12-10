import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  CalendarDays, 
  ClipboardList, 
  CheckCircle, 
  Database, 
  PackageSearch, 
  DollarSign,
  Menu,
  Bell,
  Search,
  User,
  LogOut
} from 'lucide-react';

import { ViewState, NavItem } from './types';
import { Dashboard } from './views/Dashboard';
import { ScenarioManagement } from './views/ScenarioManagement';
import { ScheduleManagement } from './views/ScheduleManagement';
import { OrderManagement } from './views/OrderManagement';
import { ProductBOM } from './views/ProductBOM';

// Placeholder components for views not fully detailed in this concise demo
const PlaceholderView = ({ title }: { title: string }) => (
  <div className="flex flex-col items-center justify-center h-96 text-slate-400">
    <Database size={48} className="mb-4 opacity-50" />
    <h2 className="text-xl font-semibold">{title}</h2>
    <p>模块加载完毕。详情内容省略。</p>
  </div>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const navItems: NavItem[] = [
    { id: ViewState.DASHBOARD, label: '经营总览', icon: <LayoutDashboard size={20} /> },
    { id: ViewState.SCENARIOS, label: '场景包管理', icon: <ShoppingBag size={20} /> },
    { id: ViewState.SCHEDULE, label: '档期与资源', icon: <CalendarDays size={20} /> },
    { id: ViewState.ORDERS, label: '订单管理', icon: <ClipboardList size={20} /> },
    { id: ViewState.VERIFICATION, label: '核销履约中心', icon: <CheckCircle size={20} /> },
    { id: ViewState.PRODUCT_BOM, label: '商品 & 配方', icon: <Database size={20} /> },
    { id: ViewState.INVENTORY, label: '库存 & 盘点', icon: <PackageSearch size={20} /> },
    { id: ViewState.FINANCE, label: '财务与分销', icon: <DollarSign size={20} /> },
  ];

  const renderContent = () => {
    switch (activeView) {
      case ViewState.DASHBOARD: return <Dashboard />;
      case ViewState.SCENARIOS: return <ScenarioManagement />;
      case ViewState.SCHEDULE: return <ScheduleManagement />;
      case ViewState.ORDERS: return <OrderManagement />;
      case ViewState.VERIFICATION: return <PlaceholderView title="核销履约中心" />;
      case ViewState.PRODUCT_BOM: return <ProductBOM />;
      case ViewState.INVENTORY: return <PlaceholderView title="库存与盘点" />;
      case ViewState.FINANCE: return <PlaceholderView title="财务与结算" />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col fixed inset-y-0 left-0 z-30`}
      >
        <div className="h-16 flex items-center justify-center border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">C</div>
            {isSidebarOpen && <span className="font-bold text-white text-lg tracking-tight">耀莱中台</span>}
          </div>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors group ${
                activeView === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
              title={!isSidebarOpen ? item.label : ''}
            >
              <div className={`${activeView === item.id ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>
                {item.icon}
              </div>
              {isSidebarOpen && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
           <button className="flex items-center space-x-3 text-slate-400 hover:text-white w-full px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors">
              <LogOut size={20} />
              {isSidebarOpen && <span>退出登录</span>}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-600"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold text-slate-800 hidden md:block">
              {navItems.find(n => n.id === activeView)?.label}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                    type="text" 
                    placeholder="全局搜索..." 
                    className="pl-9 pr-4 py-1.5 text-sm border border-slate-300 rounded-full focus:outline-none focus:border-blue-500 w-64 transition-all"
                />
            </div>
            <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center space-x-2 pl-4 border-l border-slate-200 cursor-pointer">
              <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600">
                <User size={16} />
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-900">管理员</p>
                <p className="text-xs text-slate-500">门店经理</p>
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
             {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;