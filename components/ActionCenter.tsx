
import React from 'react';
import { PurchaseRequest } from '../types.ts';
import { 
  Zap, 
  Activity, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Globe, 
  Phone, 
  Target, 
  Database,
  Search,
  LayoutDashboard,
  FilterX
} from 'lucide-react';

interface ActionCenterProps {
  requests: PurchaseRequest[];
}

const ActionCenter: React.FC<ActionCenterProps> = ({ requests }) => {
  return (
    <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-10 pb-32 animate-in fade-in duration-700">
      
      {/* COMMAND HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b-2 border-neutral-900 pb-8 md:pb-12">
        <div className="relative">
          <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-4 h-12 md:h-24 bg-cyan-400 rounded-full blur-xl opacity-20" />
          <h2 className="text-3xl md:text-4xl font-futuristic text-white italic uppercase flex items-center gap-4 md:gap-8 text-glow">
            ACTION <span className="text-neutral-600 font-normal">CENTER</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4 md:mt-6">
            <div className="px-3 md:px-4 py-1.5 bg-cyan-400/10 border border-cyan-400/30 rounded-full text-[8px] md:text-[10px] font-black text-cyan-400 uppercase tracking-widest">CAMPAIGN_TRACKER_v4</div>
            <span className="text-[10px] md:text-[12px] text-neutral-600 font-bold uppercase tracking-widest italic shrink-0">ACTIVE_TELEMETRY // LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
          <div className="flex-1 md:flex-none p-4 md:p-6 bg-[#0f0f0f] border-2 border-neutral-900 rounded-[1.5rem] md:rounded-3xl shadow-2xl flex items-center gap-4 md:gap-6 group hover:border-cyan-400/50 transition-all cursor-default">
            <div className="w-10 md:w-14 h-10 md:h-14 bg-cyan-400/10 rounded-xl md:rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shrink-0">
              <Activity size={24} className="md:w-7 md:h-7" />
            </div>
            <div>
              <span className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest block mb-1">NETWORK_IO</span>
              <span className="text-xl md:text-3xl font-tactical text-white tracking-widest leading-none text-glow">HEALTHY</span>
            </div>
          </div>
        </div>
      </div>

      {/* CAMPAIGN OVERVIEW HUD */}
      <div className="bg-[#0f0f0f] border border-neutral-800/60 rounded-[1.5rem] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-8 md:gap-12 overflow-x-auto scrollbar-hide w-full">
          <div className="flex flex-col shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Total Deployments</span>
            <div className="text-2xl md:text-3xl font-black text-white italic tracking-tighter flex items-baseline gap-2 font-tactical">
              {requests.length} <span className="text-xs text-neutral-600 uppercase italic">Nodes</span>
            </div>
          </div>
          <div className="hidden md:block h-10 w-px bg-neutral-800 shrink-0" />
          <div className="flex flex-col shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Acquisition Velocity</span>
            <div className="text-lg md:text-xl font-black text-emerald-500/80 italic flex items-center gap-2 md:gap-3 font-tactical tracking-widest leading-none">
              <Zap size={14} className="text-cyan-400/40" /> {requests.reduce((a, b) => a + b.leadsPerDay, 0)} U/DAY
            </div>
          </div>
          <div className="hidden md:block h-10 w-px bg-neutral-800 shrink-0" />
          <div className="flex flex-col shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">System Integrity</span>
            <div className="text-lg md:text-xl font-black text-neutral-400 italic flex items-center gap-2 md:gap-3 font-tactical tracking-widest leading-none">
              <ShieldCheck size={14} className="text-emerald-500/40" /> 100%_VALID
            </div>
          </div>
        </div>
      </div>

      {/* CAMPAIGN FEED */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {requests.length === 0 ? (
          <div className="py-32 text-center bg-[#050505] border-2 border-neutral-800/40 border-dashed rounded-[3rem]">
            <Database className="text-neutral-900 mx-auto mb-6" size={64} />
            <h4 className="text-neutral-700 font-futuristic text-xl uppercase tracking-widest">NO_CAMPAIGNS_PROVISIONED</h4>
            <p className="text-neutral-800 text-[10px] font-black uppercase tracking-widest mt-4">VISIT SALES FLOOR TO MOUNT NEW ASSETS</p>
          </div>
        ) : (
          requests.map((req) => (
            <div key={req.id} className="group relative bg-[#0c0c0c]/80 rounded-[2rem] border border-neutral-800/60 p-6 md:p-10 transition-all duration-500 hover:border-cyan-400/30 overflow-hidden scanline-effect">
              {/* Status Indicator Sidebar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500 ${
                req.status === 'approved' ? 'bg-emerald-500' : 
                req.status === 'rejected' ? 'bg-red-500' : 'bg-cyan-500 animate-pulse'
              }`} />

              <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                
                {/* Identity & Status */}
                <div className="flex items-center gap-6 shrink-0 w-full lg:w-auto md:min-w-[320px]">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-black border-2 border-neutral-800 flex items-center justify-center transition-all ${
                    req.status === 'approved' ? 'text-emerald-500' : 
                    req.status === 'rejected' ? 'text-red-500' : 'text-cyan-400'
                  }`}>
                    {req.status === 'approved' ? <CheckCircle2 size={32} /> : 
                     req.status === 'rejected' ? <XCircle size={32} /> : <Loader2 size={32} className="animate-spin" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest block mb-1">ACQUISITION_TARGET</span>
                    <h3 className="text-xl md:text-2xl font-black text-white italic tracking-tighter uppercase font-futuristic leading-none truncate group-hover:text-cyan-400 transition-colors">{req.leadTitle || 'ASSET_NODE'}</h3>
                    <div className="flex items-center gap-3 mt-3">
                       <div className={`px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border transition-all ${
                        req.status === 'approved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
                        req.status === 'rejected' ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-cyan-500/10 border-cyan-400/30 text-cyan-400'
                       }`}>
                         {req.status}
                       </div>
                       <span className="text-[8px] md:text-[9px] text-neutral-700 font-mono italic">#{req.id.split('_')[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Vertical Separator */}
                <div className="hidden lg:block h-16 w-px bg-neutral-800/40" />

                {/* Telemetry Block */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 flex-1 w-full">
                  <div className="space-y-1">
                    <span className="text-[7px] md:text-[8px] font-black text-neutral-700 uppercase tracking-widest block">ENDPOINT_DESTINATION</span>
                    <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-neutral-400 truncate">
                      <Globe size={12} className="text-cyan-400/40" /> {req.buyerTargetLeadUrl.replace(/^https?:\/\//, '')}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[7px] md:text-[8px] font-black text-neutral-700 uppercase tracking-widest block">DAILY_BATCH_LOAD</span>
                    <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold text-neutral-400">
                      <Target size={12} className="text-cyan-400/40" /> {req.leadsPerDay} UNITS/24H
                    </div>
                  </div>
                  <div className="space-y-1 hidden sm:block">
                    <span className="text-[7px] md:text-[8px] font-black text-neutral-700 uppercase tracking-widest block">SETTLEMENT_UNIT</span>
                    <div className="flex items-center gap-2 text-[12px] md:text-[14px] font-black text-white italic font-tactical">
                       ${req.bidAmount.toLocaleString()} <span className="text-[8px] text-neutral-700 not-italic">USD/EA</span>
                    </div>
                  </div>
                </div>

                {/* Financial Footer for Mobile / Side for Desktop */}
                <div className="w-full lg:w-auto lg:pl-8 lg:border-l border-neutral-800/40 flex items-center justify-between lg:block space-y-1">
                   <span className="text-[7px] md:text-[8px] font-black text-neutral-700 uppercase tracking-widest block text-right">TOTAL_DAILY_COST</span>
                   <div className="text-2xl md:text-3xl font-black text-white italic tracking-tighter font-tactical leading-none text-right">
                     ${req.totalDailyCost.toLocaleString()}
                   </div>
                </div>

              </div>

              {/* Interaction Overlay on Hover */}
              <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-4">
                 <div className="flex items-center gap-2 px-3 py-1 bg-black border border-neutral-800 rounded-lg">
                    <Clock size={10} className="text-neutral-600" />
                    <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">DEPLOYED: {new Date(req.timestamp).toLocaleDateString()}</span>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default ActionCenter;
