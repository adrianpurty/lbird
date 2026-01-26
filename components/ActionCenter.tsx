
import React, { useState, useMemo } from 'react';
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
  Target, 
  Database,
  ArrowRight,
  Gauge,
  Cpu,
  Filter,
  RefreshCw,
  AlertTriangle,
  History,
  FileText
} from 'lucide-react';
import { soundService } from '../services/soundService.ts';

interface ActionCenterProps {
  requests: PurchaseRequest[];
}

const ActionCenter: React.FC<ActionCenterProps> = ({ requests }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const stats = useMemo(() => {
    const approved = requests.filter(r => r.status === 'approved');
    const totalDailyLoad = approved.reduce((acc, r) => acc + r.leadsPerDay, 0);
    const totalDailyCost = approved.reduce((acc, r) => acc + r.totalDailyCost, 0);
    const successRate = requests.length ? Math.round((approved.length / requests.length) * 100) : 0;
    
    return {
      activeNodes: approved.length,
      dailyLoad: totalDailyLoad,
      dailyCost: totalDailyCost,
      successRate
    };
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (activeFilter === 'all') return requests;
    return requests.filter(r => r.status === activeFilter);
  }, [requests, activeFilter]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          label: 'ACTIVE_DEPLOYMENT',
          color: 'text-emerald-500',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          icon: CheckCircle2,
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)]'
        };
      case 'rejected':
        return {
          label: 'DEPLOYMENT_FAILED',
          color: 'text-red-500',
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          icon: XCircle,
          glow: 'shadow-[0_0_15px_rgba(239,68,68,0.3)]'
        };
      default:
        return {
          label: 'SYNC_INITIATED',
          color: 'text-[#00e5ff]',
          bg: 'bg-[#00e5ff]/10',
          border: 'border-[#00e5ff]/30',
          icon: RefreshCw,
          glow: 'shadow-[0_0_15px_rgba(0,229,255,0.3)]'
        };
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-10 pb-32 animate-in fade-in duration-700">
      
      {/* COMMAND HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b-2 border-neutral-900 pb-8 md:pb-12">
        <div className="relative">
          <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-4 h-12 md:h-24 bg-[#00e5ff] rounded-full blur-xl opacity-20" />
          <h2 className="text-3xl md:text-4xl font-futuristic text-white italic uppercase flex items-center gap-4 md:gap-8 text-glow">
            DEPLOYMENT <span className="text-neutral-600 font-normal">HUB</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4 md:mt-6">
            <div className="px-3 md:px-4 py-1.5 bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-full text-[8px] md:text-[10px] font-black text-[#00e5ff] uppercase tracking-widest">ASSET_CONTROL_v4.2</div>
            <span className="text-[10px] md:text-[12px] text-neutral-600 font-bold uppercase tracking-widest italic shrink-0">GLOBAL_SYNC_STATUS // LIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
          <div className="flex-1 md:flex-none p-4 md:p-6 bg-[#0f0f0f] border-2 border-neutral-900 rounded-[1.5rem] md:rounded-3xl shadow-2xl flex items-center gap-4 md:gap-6 group hover:border-[#00e5ff]/50 transition-all cursor-default overflow-hidden">
            <div className="w-10 md:w-14 h-10 md:h-14 bg-[#00e5ff]/10 rounded-xl md:rounded-2xl flex items-center justify-center text-[#00e5ff] group-hover:scale-110 transition-transform shrink-0">
              <RefreshCw size={24} className="animate-spin-slow md:w-7 md:h-7" />
            </div>
            <div>
              <span className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest block mb-1">LATENCY</span>
              <span className="text-xl md:text-3xl font-tactical text-white tracking-widest leading-none text-glow">4.2ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* TACTICAL HUD STATS */}
      <div className="bg-[#0f0f0f] border border-neutral-800/60 rounded-[1.5rem] md:rounded-[2rem] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e5ff]/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex items-center gap-8 md:gap-16 overflow-x-auto scrollbar-hide w-full">
          <div className="flex flex-col shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Network Velocity</span>
            <div className="text-2xl md:text-4xl font-black text-white italic tracking-tighter flex items-baseline gap-2 font-tactical leading-none">
              {stats.dailyLoad.toLocaleString()} <span className="text-[10px] text-[#00e5ff] opacity-40 not-italic uppercase">Units/Day</span>
            </div>
          </div>
          <div className="hidden md:block h-12 w-px bg-neutral-800 shrink-0" />
          <div className="flex flex-col shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Daily Clearance</span>
            <div className="text-2xl md:text-3xl font-black text-neutral-300 italic flex items-center gap-2 md:gap-3 font-tactical tracking-widest leading-none">
              <span className="text-sm text-neutral-600">$</span>{stats.dailyCost.toLocaleString()}
            </div>
          </div>
          <div className="hidden md:block h-12 w-px bg-neutral-800 shrink-0" />
          <div className="flex flex-col shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Sync Success</span>
            <div className="text-2xl md:text-3xl font-black text-emerald-500/80 italic flex items-center gap-2 md:gap-3 font-tactical tracking-widest leading-none">
              <ShieldCheck size={18} className="animate-pulse" /> {stats.successRate}%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-neutral-800/40 shrink-0 w-full md:w-auto">
           <div className="flex flex-col items-end px-3 hidden sm:flex">
             <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest leading-none">STATE</span>
             <span className="text-[10px] font-bold text-neutral-400 font-mono uppercase tracking-widest">STABLE</span>
           </div>
           <div className="h-6 w-px bg-neutral-800/60 hidden md:block" />
           <div className="px-3 flex items-center gap-3">
              <Activity size={16} className="text-emerald-500/40" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest font-tactical">HANDSHAKE_READY</span>
           </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#080808]/50 p-2 rounded-2xl border border-neutral-900">
         <div className="flex items-center gap-3 px-4 border-r border-neutral-800 hidden sm:flex">
            <Filter size={14} className="text-neutral-600" />
            <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">STATE_FILTER</span>
         </div>
         <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {[
              { id: 'all', label: 'ALL_NODES' },
              { id: 'pending', label: 'SYNCING' },
              { id: 'approved', label: 'ACTIVE' },
              { id: 'rejected', label: 'FAILED' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => { soundService.playClick(); setActiveFilter(tab.id as any); }}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  activeFilter === tab.id 
                    ? 'bg-white text-black shadow-lg shadow-white/5' 
                    : 'text-neutral-500 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
         </div>
         <div className="sm:ml-auto px-4 text-[10px] font-black text-neutral-700 uppercase tracking-widest italic">
            {filteredRequests.length} MATCHES_FOUND
         </div>
      </div>

      {/* CAMPAIGN FEED */}
      <div className="grid grid-cols-1 gap-4 md:gap-6">
        {filteredRequests.length === 0 ? (
          <div className="py-32 text-center bg-[#050505] border-2 border-neutral-800/40 border-dashed rounded-[3rem]">
            <Database className="text-neutral-900 mx-auto mb-6 opacity-20" size={80} />
            <h4 className="text-neutral-700 font-futuristic text-xl uppercase tracking-[0.4em]">NO_RECORDS_IN_CACHE</h4>
            <p className="text-neutral-800 text-[10px] font-black uppercase tracking-widest mt-4 italic">ADJUST FILTER OR VISIT SALES FLOOR</p>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const config = getStatusConfig(req.status);
            const StatusIcon = config.icon;
            
            return (
              <div 
                key={req.id} 
                className={`group relative bg-[#0c0c0c]/80 rounded-[2rem] border transition-all duration-500 hover:border-white/20 overflow-hidden scanline-effect ${config.border}`}
              >
                {/* Status Indicator Sidebar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500 ${config.bg.replace('10', '80')} ${config.glow}`} />

                <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                  
                  {/* Identity & Status */}
                  <div className="flex items-center gap-6 shrink-0 w-full lg:w-auto md:min-w-[340px]">
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[1.5rem] bg-black border-2 border-neutral-900 flex items-center justify-center transition-all group-hover:scale-105 duration-500 ${config.color}`}>
                      <StatusIcon size={32} className={req.status === 'pending' ? 'animate-spin' : ''} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[7px] md:text-[8px] font-black text-neutral-600 uppercase tracking-[0.2em] block">NETWORK_NODE</span>
                        <div className="h-px flex-1 bg-neutral-900" />
                        <span className="text-[8px] text-neutral-700 font-mono italic">#{req.id.split('_')[1]}</span>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white italic tracking-tighter uppercase font-futuristic leading-none truncate group-hover:text-[#00e5ff] transition-colors">{req.leadTitle || 'ASSET_NODE'}</h3>
                      <div className="flex items-center gap-3 mt-3">
                         <div className={`px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border transition-all ${config.bg} ${config.border} ${config.color}`}>
                           {config.label}
                         </div>
                         <div className="flex items-center gap-1.5 text-neutral-700">
                            <Clock size={10} />
                            <span className="text-[8px] font-black uppercase">{new Date(req.timestamp).toLocaleDateString()}</span>
                         </div>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Block */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 flex-1 w-full lg:px-8 lg:border-x border-neutral-900/50">
                    <div className="space-y-2">
                      <span className="text-[7px] md:text-[8px] font-black text-neutral-700 uppercase tracking-widest block flex items-center gap-2">
                        <Globe size={10} className="text-neutral-800" /> DESTINATION_URI
                      </span>
                      <div className="bg-black/40 border border-neutral-800/40 rounded-xl px-4 py-2.5 flex items-center justify-between group/uri">
                        <span className="text-[10px] md:text-[11px] font-bold text-neutral-400 truncate max-w-[200px] font-mono">
                          {req.buyerTargetLeadUrl.replace(/^https?:\/\//, '')}
                        </span>
                        <ArrowRight size={12} className="text-neutral-800 group-hover/uri:text-[#00e5ff] transition-colors" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <span className="text-[7px] md:text-[8px] font-black text-neutral-700 uppercase tracking-widest block flex items-center gap-2">
                        <Target size={10} className="text-neutral-800" /> BATCH_VELOCITY
                      </span>
                      <div className="flex items-end gap-3">
                        <div className="text-xl md:text-2xl font-black text-neutral-200 italic font-tactical leading-none">
                          {req.leadsPerDay} <span className="text-[9px] text-neutral-600 not-italic uppercase tracking-widest">Units/Day</span>
                        </div>
                        <div className="flex-1 h-1 bg-neutral-900 rounded-full mb-1.5 overflow-hidden">
                           <div 
                            className={`h-full transition-all duration-1000 ${req.status === 'approved' ? 'bg-emerald-500 w-full' : 'bg-[#00e5ff] w-2/3 animate-pulse'}`} 
                           />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Settlement Node */}
                  <div className="w-full lg:w-auto lg:pl-8 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2">
                     <div className="text-left lg:text-right">
                        <span className="text-[7px] md:text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">TOTAL_DAILY_VALUATION</span>
                        <div className="text-3xl md:text-4xl font-black text-white italic tracking-tighter font-tactical leading-none group-hover:text-glow transition-all">
                          <span className="text-xs text-neutral-600 mr-1">$</span>{req.totalDailyCost.toLocaleString()}
                        </div>
                     </div>
                     <button className="p-3 bg-neutral-950 hover:bg-white/5 border border-neutral-800 rounded-xl text-neutral-600 hover:text-white transition-all group/btn">
                        <FileText size={18} />
                     </button>
                  </div>
                </div>

                {/* Progress Strip for Syncing */}
                {req.status === 'pending' && (
                  <div className="h-1 w-full bg-neutral-900 relative">
                    <div className="absolute inset-0 bg-[#00e5ff]/20 animate-pulse" />
                    <div className="h-full bg-[#00e5ff] shadow-[0_0_10px_#00e5ff] animate-packet-sync" style={{ width: '30%' }} />
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
        @keyframes packet-sync {
          0% { left: -30%; }
          100% { left: 100%; }
        }
        .animate-packet-sync {
          position: absolute;
          animation: packet-sync 2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>

    </div>
  );
};

export default ActionCenter;
