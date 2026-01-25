
import React from 'react';
import { Lead, User } from '../types.ts';
import { TrendingUp, Activity, ShieldCheck, Gauge, Database } from 'lucide-react';

interface StatsProps {
  leads: Lead[];
  user: User;
}

const DashboardStats: React.FC<StatsProps> = ({ leads, user }) => {
  const totalVolume = leads.reduce((acc, lead) => acc + lead.currentBid, 0);
  const activeLeads = leads.length;

  return (
    <div className="bg-[#0f0f0f] border border-neutral-800/60 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 shadow-xl animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:flex md:flex-row items-center justify-between gap-4 md:gap-8">
        
        {/* Market Volume - Spans 2 columns on mobile */}
        <div className="col-span-2 md:col-span-1 flex flex-col md:border-r md:border-neutral-800 md:pr-8">
          <span className="text-neutral-700 font-black uppercase text-[7px] md:text-[8px] tracking-[0.3em] mb-1">Market Volume</span>
          <div className="text-2xl md:text-3xl lg:text-4xl font-black text-white italic tracking-tighter flex items-baseline gap-1.5 font-tactical leading-none">
            <span className="text-xs md:text-sm text-[#00e5ff]/50 opacity-40">$</span>
            {totalVolume.toLocaleString()}
          </div>
        </div>
        
        {/* Active Nodes */}
        <div className="flex flex-col">
          <span className="text-neutral-700 font-black uppercase text-[7px] md:text-[8px] tracking-[0.3em] mb-1">Nodes</span>
          <div className="text-lg md:text-xl font-black text-white italic flex items-center gap-2 font-tactical tracking-widest leading-none">
            <Activity size={12} className="text-[#00e5ff] animate-pulse" /> {activeLeads}
          </div>
        </div>

        {/* Network Reliability */}
        <div className="flex flex-col">
          <span className="text-neutral-700 font-black uppercase text-[7px] md:text-[8px] tracking-[0.3em] mb-1">Uptime</span>
          <div className="text-lg md:text-xl font-black text-emerald-500/80 italic flex items-center gap-2 font-tactical tracking-widest leading-none">
            <ShieldCheck size={12} /> 99.9%
          </div>
        </div>

        {/* Avg Throughput - Hidden on smallest mobile screens if needed, or compact */}
        <div className="hidden xs:flex flex-col">
          <span className="text-neutral-700 font-black uppercase text-[7px] md:text-[8px] tracking-[0.3em] mb-1">Latency</span>
          <div className="text-lg md:text-xl font-black text-cyan-400 italic flex items-center gap-2 font-tactical tracking-widest leading-none">
            <Gauge size={12} /> 14.2ms
          </div>
        </div>

        {/* Live HUD Indicator - Right aligned on desktop, bottom on mobile grid */}
        <div className="col-span-2 md:col-span-1 md:ml-auto flex items-center gap-3 bg-black/40 p-2 rounded-xl border border-neutral-800/40 mt-2 md:mt-0">
           <div className="flex flex-col items-end px-2 hidden sm:flex">
             <span className="text-[6px] font-black text-neutral-600 uppercase tracking-widest">Protocol</span>
             <span className="text-[8px] font-bold text-neutral-400 font-mono uppercase tracking-widest leading-none">V4.2.0</span>
           </div>
           <div className="h-6 w-px bg-neutral-800/60 hidden sm:block" />
           <div className="px-2 flex items-center gap-2 flex-1 md:flex-none justify-center">
              <Database size={12} className="text-[#00e5ff]/40" />
              <span className="text-[9px] font-black text-[#00e5ff] uppercase tracking-widest font-tactical">Node_HQ_01</span>
           </div>
        </div>

      </div>
    </div>
  );
};

export default DashboardStats;
