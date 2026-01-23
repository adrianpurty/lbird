
import React from 'react';
import { Lead, User } from '../types';
import { TrendingUp, Users, Target, Zap } from 'lucide-react';

interface StatsProps {
  leads: Lead[];
  user: User;
}

const DashboardStats: React.FC<StatsProps> = ({ leads, user }) => {
  const totalVolume = leads.reduce((acc, lead) => acc + lead.currentBid, 0);
  const activeLeads = leads.length;

  const stats = [
    { label: 'Market Vol', value: `$${totalVolume.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500', trend: '+12%' },
    { label: 'Live Leads', value: activeLeads.toString(), icon: Target, color: 'text-[#facc15]', trend: '+4' },
    { label: 'Avg Quality', value: '91%', icon: Zap, color: 'text-purple-500', trend: 'STABLE' },
    { label: 'Bidders', value: '1.2K', icon: Users, color: 'text-blue-500', trend: '+104' },
  ];

  return (
    <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-4 gap-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
      {stats.map((stat) => (
        <div key={stat.label} className="min-w-[260px] sm:min-w-0 snap-center bg-[#111111] p-5 rounded-2xl border border-neutral-900 group hover:border-[#facc15]/30 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div className={`p-2.5 rounded-xl bg-black border border-neutral-800 ${stat.color} group-hover:scale-110 transition-transform`}>
              <stat.icon size={20} />
            </div>
            <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase tracking-tighter">{stat.trend}</span>
          </div>
          <div>
            <p className="text-neutral-600 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">{stat.label}</p>
            <p className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-tight">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
