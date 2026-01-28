import React from 'react';
import { Lead, User, GatewayAPI } from '../types.ts';
import { Database, Activity, Zap, Cpu } from 'lucide-react';

interface StatsProps {
  leads: Lead[];
  user: User;
  gateways?: GatewayAPI[];
}

const DashboardStats: React.FC<StatsProps> = ({ leads, user, gateways = [] }) => {
  const activeNodesCount = leads.length;
  const activeGateways = gateways.filter(g => g.status === 'active').length;

  return (
    <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-2xl p-4 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-8 md:gap-12">
        <div className="flex flex-col">
          <span className="text-neutral-700 font-black uppercase text-[8px] tracking-[0.2em] mb-1">Market Volume</span>
          <div className="text-3xl md:text-4xl font-black text-white italic tracking-tighter flex items-center gap-2">
            <span className="text-[#00e5ff] text-xl">↯</span>
            {activeNodesCount * 223 + 47}
          </div>
        </div>
        
        <div className="flex flex-col border-l border-neutral-900 pl-8 md:pl-12">
          <span className="text-neutral-700 font-black uppercase text-[8px] tracking-[0.2em] mb-1">Active Nodes</span>
          <div className="text-3xl md:text-4xl font-black text-[#00e5ff] italic tracking-tighter flex items-center gap-3">
            <Activity size={20} className="text-[#00e5ff]" />
            {activeNodesCount}
          </div>
        </div>

        <div className="hidden lg:flex flex-col border-l border-neutral-900 pl-8 md:pl-12">
          <span className="text-neutral-700 font-black uppercase text-[8px] tracking-[0.2em] mb-1">Master Node</span>
          <div className="text-3xl md:text-4xl font-black text-emerald-500 italic tracking-tighter flex items-center gap-3">
            <Cpu size={20} className="text-emerald-500" />
            {activeGateways > 0 ? '01' : '00'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-black/40 px-4 py-1.5 rounded-lg border border-neutral-800/60 shrink-0">
         <Database size={12} className="text-[#00e5ff]" />
         <span className="text-[8px] font-black text-[#00e5ff] uppercase tracking-[0.2em]">SYNC_READY_{activeGateways > 0 ? '01' : '00'}</span>
      </div>
    </div>
  );
};

export default DashboardStats;