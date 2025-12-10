import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
  description?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, trend, trendUp, icon, description }) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
        </div>
        {icon && <div className="p-2 bg-blue-50 text-blue-600 rounded-md">{icon}</div>}
      </div>
      {(trend || description) && (
        <div className="flex items-center text-sm">
          {trend && (
            <span className={`font-medium mr-2 ${trendUp ? 'text-emerald-600' : 'text-red-600'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
          )}
          {description && <span className="text-slate-400">{description}</span>}
        </div>
      )}
    </div>
  );
};