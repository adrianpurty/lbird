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
    <div className="bg-surface border border-bright rounded-2xl p-4 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
      <div className="flex items-center gap-8 md:gap-12">
        <div className="flex flex-col">
          <span className="text-dim font-black uppercase text-[8px] tracking-[0.2em] mb-1">Market Volume</span>
          <div className="text-3xl md:text-4xl font-black text-main italic tracking-tighter flex items-center gap-2 font-tactical">
            <span className="text-accent text-xl">↯</span>
            {activeNodesCount * 223 + 47}
          </div>
        </div>
        
        <div className="flex flex-col border-l border-bright pl-8 md:pl-12">
          <span className="text-dim font-black uppercase text-[8px] tracking-[0.2em] mb-1">Active Nodes</span>
          <div className="text-3xl md:text-4xl font-black text-accent italic tracking-tighter flex items-center gap-3 font-tactical">
            <Activity size={20} />
            {activeNodesCount}
          </div>
        </div>

        <div className="hidden lg:flex flex-col border-l border-bright pl-8 md:pl-12">
          <span className="text-dim font-black uppercase text-[8px] tracking-[0.2em] mb-1">Master Node</span>
          <div className="text-3xl md:text-4xl font-black text-emerald-500 italic tracking-tighter flex items-center gap-3 font-tactical">
            <Cpu size={20} />
            {activeGateways > 0 ? '01' : '00'}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-card px-4 py-1.5 rounded-lg border border-bright shrink-0">
         <Database size={12} className="text-accent" />
         <span className="text-[8px] font-black text-accent uppercase tracking-[0.2em]">SYNC_READY_{activeGateways > 0 ? '01' : '00'}</span>
      </div>
    </div>
  );
};

export default DashboardStats;