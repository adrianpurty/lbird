import React from 'react';
import { Lead, User } from '../types.ts';
import { Database, Activity } from 'lucide-react';

interface StatsProps {
  leads: Lead[];
  user: User;
}

const DashboardStats: React.FC<StatsProps> = ({ leads, user }) => {
  const totalVolume = leads.reduce((acc, lead) => acc + (lead.currentBid || 0), 0);
  const activeNodesCount = leads.length;

  return (
    <div className="bg-[#0c0c0c] border border-neutral-800/60 rounded-[1.5rem] p-8 shadow-xl relative overflow-hidden flex items-center justify-between">
      <div className="flex items-center gap-16">
        <div className="flex flex-col">
          <span className="text-neutral-700 font-black uppercase text-[10px] tracking-[0.2em] mb-3">Market Volume</span>
          <div className="text-6xl font-black text-white italic tracking-tighter flex items-center gap-4">
            <span className="text-[#00e5ff] text-3xl">↯</span>
            {activeNodesCount * 223 + 47}
          </div>
        </div>
        
        <div className="flex flex-col">
          <span className="text-neutral-700 font-black uppercase text-[10px] tracking-[0.2em] mb-3">Nodes</span>
          <div className="text-6xl font-black text-[#00e5ff] italic tracking-tighter flex items-center gap-4">
            <Activity size={32} className="text-[#00e5ff]" />
            {activeNodesCount}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-3">
        <div className="bg-black/80 px-6 py-2 rounded-xl border border-neutral-800 flex items-center gap-4 group hover:border-[#00e5ff]/50 transition-all cursor-default">
           <Database size={16} className="text-[#00e5ff]" />
           <span className="text-[10px] font-black text-[#00e5ff] uppercase tracking-[0.2em]">NODE_HQ_01</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;