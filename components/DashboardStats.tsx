
import React from 'react';
import { Lead, User } from '../types.ts';
import { TrendingUp, Activity, ShieldCheck, Gauge, Database, Cpu } from 'lucide-react';

interface StatsProps {
  leads: Lead[];
  user: User;
}

const DashboardStats: React.FC<StatsProps> = ({ leads, user }) => {
  const totalVolume = leads.reduce((acc, lead) => acc + lead.currentBid, 0);
  const activeLeads = leads.length;

  return (
    <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in-95 duration-500 min-w-[320px]">
      <div className="space-y-6">
        
        {/* Main Resource Block */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex flex-col">
            <span className="text-neutral-500 font-black uppercase text-[8px] tracking-[0.4em] mb-1">System_Liquidity</span>
            <div className="text-3xl font-black text-white italic tracking-tighter flex items-baseline gap-1 font-tactical leading-none">
              <span className="text-xs text-[#FACC15] opacity-60">$</span>{totalVolume.toLocaleString()}
            </div>
          </div>
          <div className="relative">
             <div className="w-12 h-12 rounded-full border-2 border-[#FACC15]/20 flex items-center justify-center">
                <Activity size={18} className="text-[#FACC15] animate-pulse" />
                <div className="absolute inset-0 border-2 border-[#FACC15] rounded-full animate-ping opacity-20" />
             </div>
          </div>
        </div>

        {/* Secondary Stats HUD */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-1">
            <span className="text-neutral-700 font-black uppercase text-[7px] tracking-[0.4em]">Active_Nodes</span>
            <div className="text-xl font-black text-white italic flex items-center gap-2 font-tactical tracking-widest leading-none">
              {activeLeads} <span className="text-[8px] text-neutral-600 tracking-normal">Units</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-neutral-700 font-black uppercase text-[7px] tracking-[0.4em]">Latency</span>
            <div className="text-xl font-black text-[#FACC15] italic flex items-center gap-2 font-tactical tracking-widest leading-none">
              <Gauge size={14} /> 12.4ms
            </div>
          </div>
        </div>

        {/* Footer Protocol */}
        <div className="flex items-center justify-between bg-white/5 p-3 rounded-2xl border border-white/5">
           <div className="flex items-center gap-2">
              <Cpu size={12} className="text-[#FACC15]/40" />
              <span className="text-[9px] font-black text-neutral-400 uppercase tracking-widest font-tactical">TERMINAL_HQ_01</span>
           </div>
           <div className="flex items-center gap-1.5">
              <ShieldCheck size={10} className="text-emerald-500" />
              <span className="text-[8px] font-bold text-emerald-500/80 uppercase tracking-widest leading-none">SECURE</span>
           </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardStats;
