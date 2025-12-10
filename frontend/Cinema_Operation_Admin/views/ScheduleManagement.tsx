
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, User, Clock, Info, Lock, Tag, MonitorPlay, Sparkles, UserCog } from 'lucide-react';

// 模拟数据类型
type EventType = 'public' | 'private' | 'maintenance' | 'cleaning';
type EventStatus = 'confirmed' | 'pending' | 'locked';

interface ScheduleEvent {
  id: string;
  hallId: string;
  startHour: number; // 9.5 = 9:30
  duration: number;
  title: string;
  type: EventType;
  status?: EventStatus;
  details?: string;
  customer?: string;
  occupancy?: string; // For public screenings
  serviceManager?: string; // 新增：服务经理
}

export const ScheduleManagement: React.FC = () => {
  const [currentDate, setCurrentDate] = useState('2023-10-24');
  
  // 营业时间：10:00 - 24:00
  const startHour = 10;
  const endHour = 24;
  const totalHours = endHour - startHour;
  const timeSlots = Array.from({ length: totalHours }, (_, i) => i + startHour);

  // 影厅资源数据
  const halls = [
    { id: 'h1', name: '1号厅 (VIP)', capacity: 12, tags: ['真皮沙发', '管家服务'], type: 'VIP' },
    { id: 'h2', name: '2号厅 (情侣)', capacity: 6, tags: ['双人座', '私密'], type: 'CP' },
    { id: 'h3', name: '3号厅 (聚会)', capacity: 30, tags: ['KTV设备', '自助餐台'], type: 'Party' },
    { id: 'h4', name: '4号厅 (IMAX)', capacity: 120, tags: ['激光IMAX', '杜比全景声'], type: 'Public' },
  ];

  // 模拟档期数据 - 数据更饱满，加入服务经理
  const events: ScheduleEvent[] = [
    // --- 1号厅 (VIP) ---
    // 上午：生日派对
    { id: 'e1', hallId: 'h1', startHour: 10.5, duration: 3, title: '刘总生日派对', type: 'private', status: 'confirmed', customer: '刘先生 138****0000', serviceManager: '王经理', details: '含豪华果盘 x2' },
    // 中午：保洁
    { id: 'e2', hallId: 'h1', startHour: 13.5, duration: 0.5, title: '保洁', type: 'cleaning' },
    // 下午：企业团建
    { id: 'e3', hallId: 'h1', startHour: 14.5, duration: 4, title: '企业团建：王者荣耀', type: 'private', status: 'pending', customer: '科技无限公司', serviceManager: '李主管', details: '需接游戏主机' },
    // 晚上：保洁
    { id: 'e3_clean', hallId: 'h1', startHour: 18.5, duration: 0.5, title: '保洁', type: 'cleaning' },
    // 晚场：私人观影
    { id: 'e3_night', hallId: 'h1', startHour: 19.5, duration: 3, title: '私人观影：教父', type: 'private', status: 'confirmed', customer: '陈女士', serviceManager: 'Amy', details: '红酒服务' },

    // --- 2号厅 (情侣) ---
    // 上午：维护
    { id: 'e4', hallId: 'h2', startHour: 10, duration: 1, title: '设备调试', type: 'maintenance', details: '投影校准' },
    // 中午：求婚布置
    { id: 'e4_setup', hallId: 'h2', startHour: 11, duration: 1, title: '求婚布置', type: 'maintenance', details: '气球/鲜花' },
    // 下午：求婚包场
    { id: 'e5', hallId: 'h2', startHour: 12, duration: 3, title: '求婚：泰坦尼克号', type: 'private', status: 'locked', customer: '张先生', serviceManager: 'Rose', details: '定金已付' },
    // 下午：清理
    { id: 'e5_clean', hallId: 'h2', startHour: 15, duration: 0.5, title: '保洁', type: 'cleaning' },
    // 傍晚：情侣观影
    { id: 'e5_movie1', hallId: 'h2', startHour: 16, duration: 2.5, title: '情侣包场：爱乐之城', type: 'private', status: 'confirmed', customer: '周先生', serviceManager: 'Rose' },
    // 晚间：情侣观影
    { id: 'e5_movie2', hallId: 'h2', startHour: 19, duration: 2.5, title: '情侣包场：你的名字', type: 'private', status: 'confirmed', customer: '吴女士', serviceManager: 'Jack' },

    // --- 3号厅 (聚会) ---
    // 下午：KTV
    { id: 'e3_ktv', hallId: 'h3', startHour: 13, duration: 4, title: '校友聚会 KTV', type: 'private', status: 'confirmed', customer: '复旦校友会', serviceManager: '张经理', details: '自助餐台开启' },
    // 傍晚：保洁
    { id: 'e3_clean2', hallId: 'h3', startHour: 17, duration: 1, title: '深度保洁', type: 'cleaning' },
    // 晚上：球赛直播
    { id: 'e3_sport', hallId: 'h3', startHour: 18.5, duration: 4, title: '欧冠决赛直播', type: 'private', status: 'pending', customer: '球迷协会', serviceManager: '王经理', details: '啤酒畅饮' },

    // --- 4号厅 (公映) ---
    // 排片排满
    { id: 'e6', hallId: 'h4', startHour: 10, duration: 2.5, title: '流浪地球2', type: 'public', occupancy: '85/120', details: '热映中' },
    { id: 'e7', hallId: 'h4', startHour: 12.5, duration: 0.5, title: '散场清洁', type: 'cleaning' },
    { id: 'e8', hallId: 'h4', startHour: 13, duration: 2.5, title: '满江红', type: 'public', occupancy: '110/120', details: '即将满座' },
    { id: 'e9', hallId: 'h4', startHour: 15.5, duration: 0.5, title: '散场清洁', type: 'cleaning' },
    { id: 'e10', hallId: 'h4', startHour: 16, duration: 2.5, title: '深海', type: 'public', occupancy: '60/120', details: '特效厅' },
    { id: 'e11', hallId: 'h4', startHour: 18.5, duration: 0.5, title: '散场清洁', type: 'cleaning' },
    { id: 'e12', hallId: 'h4', startHour: 19, duration: 2.5, title: '流浪地球2', type: 'public', occupancy: '120/120', details: '满座' },
    { id: 'e13', hallId: 'h4', startHour: 21.5, duration: 0.5, title: '散场清洁', type: 'cleaning' },
    { id: 'e14', hallId: 'h4', startHour: 22, duration: 2, title: '无名', type: 'public', occupancy: '45/120', details: '深夜场' },
  ];

  // 辅助函数：计算左边距百分比
  const getLeftStyle = (start: number) => {
    return `${((start - startHour) / totalHours) * 100}%`;
  };

  // 辅助函数：计算宽度百分比
  const getWidthStyle = (duration: number) => {
    return `${(duration / totalHours) * 100}%`;
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4">
      {/* 顶部控制栏 */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        {/* 日期与快捷跳转 */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600"><ChevronLeft size={18} /></button>
            <div className="px-4 flex items-center space-x-2 text-sm font-semibold text-slate-800 cursor-pointer hover:text-blue-600">
              <Calendar size={16} />
              <span>2023年10月24日 (周二)</span>
            </div>
            <button className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-slate-600"><ChevronRight size={18} /></button>
          </div>
          <button className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md font-medium hover:bg-blue-100 transition-colors">回到今天</button>
        </div>
        
        {/* 图例 */}
        <div className="flex flex-wrap gap-3 text-xs">
           <div className="flex items-center space-x-1.5 px-2 py-1 bg-slate-50 rounded border border-slate-200">
             <div className="w-3 h-3 rounded bg-indigo-500"></div><span className="text-slate-600">排片公映</span>
           </div>
           <div className="flex items-center space-x-1.5 px-2 py-1 bg-slate-50 rounded border border-slate-200">
             <div className="w-3 h-3 rounded bg-emerald-500"></div><span className="text-slate-600">包场(已确)</span>
           </div>
           <div className="flex items-center space-x-1.5 px-2 py-1 bg-slate-50 rounded border border-slate-200">
             <div className="w-3 h-3 rounded bg-amber-400"></div><span className="text-slate-600">包场(待定)</span>
           </div>
           <div className="flex items-center space-x-1.5 px-2 py-1 bg-slate-50 rounded border border-slate-200">
             <div className="w-3 h-3 rounded bg-slate-300 striped-bg"></div><span className="text-slate-600">保洁/维护</span>
           </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex space-x-2">
           <button className="flex items-center space-x-1 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm hover:bg-slate-50">
             <Lock size={16} />
             <span>锁座/维护</span>
           </button>
           <button className="flex items-center space-x-1 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 shadow-sm">
             <Sparkles size={16} />
             <span>新增预约</span>
           </button>
        </div>
      </div>

      {/* 甘特图主体 */}
      <div className="flex-1 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col relative">
        
        {/* 时间轴表头 */}
        <div className="flex border-b border-slate-200 bg-slate-50 sticky top-0 z-20">
          <div className="w-48 flex-shrink-0 p-4 border-r border-slate-200 font-semibold text-slate-700 text-sm flex items-center bg-slate-50 z-20">
            影厅资源 ({halls.length})
          </div>
          <div className="flex-1 relative h-12">
            {timeSlots.map((h, i) => (
              <div key={h} className="absolute top-0 bottom-0 border-l border-slate-200 text-xs text-slate-500 pl-1 pt-3 font-medium" 
                   style={{ left: `${(i / totalHours) * 100}%`, width: `${(1 / totalHours) * 100}%` }}>
                {h}:00
              </div>
            ))}
          </div>
        </div>

        {/* 资源行 */}
        <div className="overflow-y-auto flex-1 relative">
          {/* 背景网格线 (绝对定位铺满) */}
          <div className="absolute inset-0 flex pointer-events-none z-0">
             <div className="w-48 flex-shrink-0 border-r border-slate-100 bg-white"></div>
             <div className="flex-1 flex">
               {timeSlots.map((_, i) => (
                 <div key={i} className="flex-1 border-r border-slate-100 h-full bg-slate-50/20"></div>
               ))}
             </div>
          </div>
          
          {/* 当前时间指示线 (假设当前是 14:15) */}
          <div className="absolute top-0 bottom-0 w-px bg-red-500 z-10 pointer-events-none" style={{ left: `calc(12rem + ${((14.25 - startHour) / totalHours) * 100}%)` }}>
            <div className="absolute -top-1 -translate-x-1/2 bg-red-500 text-white text-[10px] px-1 rounded">14:15</div>
          </div>

          <div className="relative z-10 divide-y divide-slate-100">
            {halls.map((hall) => (
              <div key={hall.id} className="flex group min-h-[100px] hover:bg-slate-50 transition-colors">
                {/* 左侧资源卡片 */}
                <div className="w-48 flex-shrink-0 p-4 border-r border-slate-200 bg-white group-hover:bg-slate-50 transition-colors flex flex-col justify-center relative z-20">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-800 text-sm">{hall.name}</h3>
                    {hall.type === 'VIP' && <span className="text-[10px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded font-bold">VIP</span>}
                    {hall.type === 'Public' && <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-bold">公映</span>}
                  </div>
                  <div className="text-xs text-slate-500 mb-2 flex items-center">
                    <User size={12} className="mr-1" /> {hall.capacity}人座
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {hall.tags.map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded border border-slate-200">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* 右侧时间条区域 */}
                <div className="flex-1 relative h-[100px]">
                  {/* 空白区域点击添加 (视觉暗示) */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="h-full border-2 border-dashed border-blue-200 bg-blue-50/30 flex items-center justify-center text-blue-400 text-sm font-medium">
                        点击空闲时段添加排期
                      </div>
                  </div>

                  {events.filter(e => e.hallId === hall.id).map((evt) => (
                    <div
                      key={evt.id}
                      className={`absolute top-2 bottom-2 rounded-md shadow-sm border text-xs overflow-hidden cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all z-20 flex flex-col
                        ${evt.type === 'private' && evt.status === 'confirmed' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : ''}
                        ${evt.type === 'private' && evt.status === 'pending' ? 'bg-amber-50 border-amber-200 text-amber-900' : ''}
                        ${evt.type === 'private' && evt.status === 'locked' ? 'bg-slate-100 border-slate-300 text-slate-600' : ''}
                        ${evt.type === 'public' ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : ''}
                        ${evt.type === 'cleaning' || evt.type === 'maintenance' ? 'bg-slate-100/80 border-slate-200 text-slate-400' : ''}
                      `}
                      style={{
                        left: getLeftStyle(evt.startHour),
                        width: getWidthStyle(evt.duration),
                      }}
                    >
                      {/* 保洁/维护 简化显示 */}
                      {(evt.type === 'cleaning' || evt.type === 'maintenance') ? (
                         <div className="w-full h-full flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')]">
                            <span className="font-medium transform -rotate-12">{evt.title}</span>
                         </div>
                      ) : (
                        // 正常业务显示
                        <div className="flex flex-col h-full p-2">
                          <div className="flex justify-between items-start mb-0.5">
                             <span className="font-bold truncate pr-1" title={evt.title}>{evt.title}</span>
                             {evt.type === 'public' && <span className="bg-indigo-100 text-indigo-700 px-1 rounded text-[10px] whitespace-nowrap flex-shrink-0"><MonitorPlay size={10} className="inline mr-0.5"/>排片</span>}
                             {evt.type === 'private' && <span className="bg-emerald-100 text-emerald-700 px-1 rounded text-[10px] whitespace-nowrap flex-shrink-0"><Sparkles size={10} className="inline mr-0.5"/>包场</span>}
                          </div>
                          
                          <div className="flex-1 flex flex-col justify-center space-y-0.5 min-h-0">
                            <div className="flex items-center text-[10px] opacity-80">
                               <Clock size={10} className="mr-1"/>
                               {Math.floor(evt.startHour)}:{evt.startHour % 1 === 0.5 ? '30' : '00'} - {Math.floor(evt.startHour + evt.duration)}:{(evt.startHour + evt.duration) % 1 === 0.5 ? '30' : '00'}
                            </div>
                            
                            {evt.customer && (
                              <div className="flex items-center text-[10px] font-medium truncate" title={evt.customer}>
                                <User size={10} className="mr-1 flex-shrink-0"/> <span className="truncate">{evt.customer}</span>
                              </div>
                            )}

                            {/* 服务经理字段展示 */}
                            {evt.serviceManager && (
                              <div className="flex items-center text-[10px] text-slate-600 truncate bg-white/50 rounded px-1 -ml-1 w-fit" title={`服务经理: ${evt.serviceManager}`}>
                                <UserCog size={10} className="mr-1 flex-shrink-0"/> <span className="truncate">{evt.serviceManager}</span>
                              </div>
                            )}

                            {evt.occupancy && (
                               <div className="w-full bg-indigo-200/50 rounded-full h-1.5 mt-0.5 overflow-hidden">
                                 <div className="bg-indigo-500 h-full" style={{width: '70%'}}></div>
                               </div>
                            )}
                            {evt.occupancy && <div className="text-[10px] text-indigo-600 mt-0.5 text-right leading-none">上座率 {evt.occupancy}</div>}
                          </div>

                          {evt.status === 'pending' && (
                             <div className="absolute top-0 right-0 p-1">
                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" title="待支付/待确认"></div>
                             </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {/* 空态占位 (如果太短) */}
          <div className="h-20 bg-slate-50/30 flex items-center justify-center text-slate-400 text-sm border-t border-slate-100">
            向下滚动查看更多资源
          </div>
        </div>
      </div>
    </div>
  );
};
