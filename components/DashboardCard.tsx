
import React from 'react';

interface Props {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export const DashboardCard: React.FC<Props> = ({ title, value, icon, trend, trendUp }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
};
