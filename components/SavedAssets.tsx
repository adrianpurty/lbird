
import React from 'react';
import { 
  Heart, 
  Zap, 
  Cpu, 
  Database, 
  ShieldCheck, 
  Search, 
  TrendingUp, 
  Activity, 
  Layers, 
  Radar,
  ArrowRight,
  FilterX
} from 'lucide-react';
import { Lead } from '../types.ts';
import { TacticalLeadCard } from './LeadGrid.tsx';
import { soundService } from '../services/soundService.ts';

interface SavedAssetsProps {
  leads: Lead[];
  onBid: (id: string) => void;
  onRemove: (id: string) => void;
}

const SavedAssets: React.FC<SavedAssetsProps> = ({ leads, onBid, onRemove }) => {
  const totalValuation = leads.reduce((acc, l) => acc + l.currentBid, 0);
  const avgIntegrity = leads.length > 0 
    ? Math.round(leads.reduce((acc, l) => acc + l.qualityScore, 0) / leads.length) 
    : 0;

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-32 animate-in fade-in duration-700 font-rajdhani">
      
      {/* HEADER HUD - MATCHES ASSET PROVISION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-900/60 pb-10">
        <div className="space-y-6">
          <h1 className="text-6xl font-futuristic italic font-black uppercase tracking-tighter">
            SAVED <span className="text-transparent" style={{ WebkitTextStroke: '2px #ffffff', opacity: 0.3 }}>ASSETS</span>
          </h1>
          <div className="flex items-center gap-6">
            <div className="px-4 py-1.5 bg-[#00e5ff]/10 border border-[#00e5ff]/40 rounded-lg shadow-[0_0_15px_rgba(0,229,255,0.1)]">
              <span className="text-[10px] font-black text-[#00e5ff] uppercase tracking-[0.2em]">VAULT_ARCHIVE_v4</span>
            </div>
            <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-[0.3em] italic">SECURE_TUNNEL_ACTIVE // {leads.length} NODES</span>
          </div>
        </div>

        {/* VAULT INTEGRITY WIDGET */}
        <div className="bg-[#0c0c0c] border-2 border-neutral-800 p-4 md:p-6 rounded-[2rem] flex items-center gap-6 shadow-2xl group hover:border-[#00e5ff]/30 transition-all cursor-default">
          <div className="w-12 h-12 bg-[#00e5ff]/10 rounded-xl flex items-center justify-center text-[#00e5ff] shrink-0 group-hover:scale-110 transition-transform">
            <ShieldCheck size={24} />
          </div>
          <div>
            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-1">AVERAGE_NODE_QUALITY</span>
            <span className="text-3xl font-tactical text-white tracking-widest leading-none">{avgIntegrity}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: ASSET STREAM (Col 8) */}
        <div className="lg:col-span-8 space-y-8">
          {leads.length > 0 ? (
            <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <Layers size={120} />
              </div>

              <div className="flex items-center gap-3 mb-8 px-2">
                 <div className="w-1.5 h-6 bg-[#00e5ff] rounded-full shadow-[0_0_10px_#00e5ff]" />
                 <h3 className="text-sm font-black text-white italic uppercase tracking-[0.3em]">SECURE_STORAGE_POOL</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                {leads.map(lead => (
                  <TacticalLeadCard 
                    key={lead.id}
                    lead={lead}
                    userRole="user"
                    onBid={onBid}
                    onEdit={() => {}}
                    nicheCount={1}
                    isWishlisted={true}
                    onToggleWishlist={() => { soundService.playClick(); onRemove(lead.id); }}
                    compact
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#0c0c0c] border border-dashed border-neutral-800 rounded-[3rem] p-20 text-center flex flex-col items-center gap-8 shadow-2xl">
               <div className="relative">
                 <Radar size={80} className="text-neutral-900 animate-spin-slow" strokeWidth={1} />
                 <Heart size={32} className="absolute inset-0 m-auto text-neutral-800" />
               </div>
               <div className="space-y-4">
                  <h4 className="text-neutral-700 font-futuristic text-xl uppercase tracking-[0.4em]">VAULT_EMPTY</h4>
                  <p className="text-neutral-800 text-[10px] font-black uppercase tracking-widest italic">MONITOR THE SALES FLOOR TO SECURE HIGH-INTENSITY ASSETS</p>
               </div>
            </div>
          )}

          {/* VALUATION ROW */}
          <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-10 shadow-xl">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2 flex items-center gap-3">
                <TrendingUp size={16} className="text-[#00e5ff]" /> AGGREGATE_VAULT_VALUATION
              </span>
              <div className="text-5xl font-black text-white italic font-tactical tracking-widest px-2">
                <span className="text-neutral-700 mr-2">$</span>{totalValuation.toLocaleString()}
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center border-2 border-neutral-900 border-dashed rounded-[2rem] p-10 group cursor-pointer hover:border-[#00e5ff]/20 transition-colors">
              <div className="flex items-center gap-4 text-neutral-700 group-hover:text-neutral-500 transition-colors">
                <Activity size={20} />
                <span className="text-[11px] font-black uppercase tracking-[0.3em]">ANALYZE_MARKET_SYNERGY</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DIAGNOSTICS (Col 4) */}
        <div className="lg:col-span-4 space-y-8 h-full">
          <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-[3rem] p-10 h-full flex flex-col shadow-2xl relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-16">
               <Cpu size={18} className="text-[#00e5ff]" />
               <h3 className="text-sm font-black text-white italic uppercase tracking-[0.3em]">VAULT_DIAGNOSTICS</h3>
               <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
            </div>

            <div className="flex-1 space-y-12 py-10">
               {/* STATS CIRCLE */}
               <div className="relative flex flex-col items-center justify-center text-center">
                  <div className="absolute inset-0 bg-[#00e5ff]/5 rounded-full blur-3xl animate-pulse" />
                  <div className="w-48 h-48 rounded-full border-4 border-neutral-900 border-t-[#00e5ff] animate-spin-slow relative flex items-center justify-center">
                    <div className="w-40 h-40 rounded-full border border-neutral-800 border-dashed flex flex-col items-center justify-center">
                       <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-1">DENSITY</span>
                       <span className="text-4xl font-tactical text-white font-black">{leads.length}</span>
                       <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest mt-1">NODES_SYNCED</span>
                    </div>
                  </div>
               </div>

               <div className="space-y-6">
                 <div className="space-y-3">
                   <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">PROTOCOL_DISTRIBUTION</span>
                   <div className="space-y-2">
                      {Array.from(new Set(leads.map(l => l.category))).map(cat => {
                        const count = leads.filter(l => l.category === cat).length;
                        const percent = Math.round((count / leads.length) * 100);
                        return (
                          <div key={cat} className="space-y-1">
                             <div className="flex justify-between text-[9px] font-black text-neutral-500 uppercase tracking-tighter">
                                <span>{cat}</span>
                                <span>{percent}%</span>
                             </div>
                             <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden">
                                <div className="h-full bg-[#00e5ff]/40" style={{ width: `${percent}%` }} />
                             </div>
                          </div>
                        );
                      })}
                   </div>
                 </div>
               </div>
            </div>

            <div className="space-y-10 mt-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">LOCK_STATE</span>
                  <div className="bg-black/60 border border-neutral-800 p-4 rounded-xl flex items-center gap-3">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">SECURE</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">SYNC_FREQ</span>
                  <div className="bg-black/60 border border-neutral-800 p-4 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">REAL-TIME</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => { soundService.playClick(); }}
                className="w-full bg-black text-white rounded-[2rem] py-8 md:py-10 flex flex-col items-center justify-center gap-4 transition-all group/btn border-b-[12px] border-neutral-950 shadow-2xl hover:bg-neutral-900 active:translate-y-1 active:border-b-4 overflow-hidden relative"
              >
                <div className="flex items-center gap-6 relative z-10">
                  <span className="text-3xl font-black italic tracking-widest uppercase font-tactical">INITIALIZE_BATCH_BID</span>
                  <ArrowRight size={32} className="group-hover/btn:translate-x-2 transition-transform" />
                </div>
                <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* INTEGRITY FOOTER */}
      <div className="bg-[#0f0f0f] border-2 border-neutral-900 p-8 rounded-[3rem] shadow-xl flex items-start gap-8 max-w-5xl mx-auto group hover:border-[#00e5ff]/20 transition-all">
        <div className="w-14 h-14 bg-[#00e5ff]/5 border border-[#00e5ff]/20 rounded-2xl flex items-center justify-center text-[#00e5ff] shrink-0 group-hover:scale-110 transition-transform">
          <Database size={28} />
        </div>
        <div>
           <h4 className="text-xs font-black text-white italic uppercase tracking-[0.3em] mb-3 font-futuristic">VAULT_DATA_PERSISTENCE</h4>
           <p className="text-[9px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
             Saved assets are indexed for low-latency synchronization with the global liquidity pool. Archived nodes maintain their bid history and quality integrity score indefinitely within your local identity node.
           </p>
        </div>
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 15s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
};

export default SavedAssets;
