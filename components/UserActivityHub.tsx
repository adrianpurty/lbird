
import React, { useMemo } from 'react';
import { 
  FileText, Zap, ShieldCheck, ArrowUpRight, Clock, 
  History, Activity, Target, Database, TrendingUp,
  CheckCircle2, AlertCircle, ExternalLink, Globe
} from 'lucide-react';
import { PurchaseRequest, Notification, Lead } from '../types.ts';

interface UserActivityHubProps {
  purchaseRequests: PurchaseRequest[];
  notifications: Notification[];
  leads: Lead[];
  userId: string;
}

const UserActivityHub: React.FC<UserActivityHubProps> = ({ purchaseRequests, notifications, leads, userId }) => {
  const userPurchases = useMemo(() => 
    purchaseRequests.filter(pr => pr.userId === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [purchaseRequests, userId]
  );

  const userLogs = useMemo(() => 
    notifications.filter(n => n.userId === userId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    [notifications, userId]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* LEFT: ASSET ACQUISITIONS (8 COLS) */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex items-center justify-between px-4">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#FACC15]/10 rounded-xl flex items-center justify-center border border-[#FACC15]/20">
                 <FileText className="text-[#FACC15]" size={20} />
              </div>
              <div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tighter">Asset Acquisitions</h3>
                 <p className="text-[8px] text-neutral-600 font-black uppercase tracking-[0.4em]">Verified Handshakes // {userPurchases.length} Units</p>
              </div>
           </div>
           <div className="hidden sm:flex items-center gap-6 text-[9px] font-black text-neutral-700 uppercase tracking-widest">
              <span>Filter: All_Nodes</span>
              <div className="w-px h-4 bg-neutral-900" />
              <Database size={14} />
           </div>
        </div>

        <div className="space-y-4">
          {userPurchases.length > 0 ? (
            userPurchases.map((purchase) => {
              const originalLead = leads.find(l => l.id === purchase.leadId);
              return (
                <div key={purchase.id} className="group relative bg-[#080808] border-2 border-neutral-900 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:border-[#FACC15]/30 transition-all shadow-xl overflow-hidden">
                   <div className="flex items-center gap-6 flex-1 w-full">
                      <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center border border-neutral-800 text-neutral-500 group-hover:text-[#FACC15] transition-colors shrink-0">
                         {purchase.purchaseMode === 'buy_now' ? <Zap size={24} /> : <Target size={24} />}
                      </div>
                      <div className="min-w-0">
                         <div className="flex items-center gap-3 mb-1.5">
                            <span className="text-[8px] font-black text-[#FACC15] uppercase tracking-[0.3em]">{purchase.purchaseMode === 'buy_now' ? 'INSTANT_SETTLEMENT' : 'AUCTION_WIN'}</span>
                            <span className="text-[7px] font-mono text-neutral-700 uppercase tracking-widest">ID: {purchase.id.slice(0, 10)}</span>
                         </div>
                         <h4 className="text-lg font-black text-white truncate uppercase tracking-tight leading-none group-hover:text-white transition-colors">{purchase.leadTitle}</h4>
                         <div className="flex items-center gap-4 mt-2">
                            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest flex items-center gap-1.5">
                               <Clock size={10} /> {new Date(purchase.timestamp).toLocaleDateString()}
                            </span>
                            <div className="w-1 h-1 bg-neutral-800 rounded-full" />
                            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">{originalLead?.category || 'General'} Sector</span>
                         </div>
                      </div>
                   </div>

                   <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 md:border-l border-neutral-900 pt-4 md:pt-0 md:pl-8">
                      <div className="text-left md:text-right shrink-0">
                         <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">UNIT_COST</span>
                         <div className="text-2xl font-black text-white font-tactical tracking-tighter leading-none">
                            <span className="text-xs text-[#FACC15] opacity-40">$</span>{purchase.bidAmount.toLocaleString()}
                         </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                         <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                            purchase.status === 'approved' ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-500' : 'bg-amber-950/20 border-amber-900/30 text-amber-500'
                         }`}>
                            {purchase.status === 'approved' ? 'HANDSHAKE_OK' : 'PENDING_AUTH'}
                         </div>
                         <button className="text-[8px] font-black text-neutral-700 hover:text-[#FACC15] uppercase tracking-widest flex items-center gap-1 transition-colors">
                            VIEW_MANIFEST <ArrowUpRight size={10} />
                         </button>
                      </div>
                   </div>
                   
                   {/* Scanline Effect Overlay */}
                   <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
                </div>
              );
            })
          ) : (
            <div className="py-24 text-center bg-[#050505] border-2 border-neutral-900/40 border-dashed rounded-[3rem]">
               <FileText size={64} className="mx-auto text-neutral-900 mb-6 opacity-20" />
               <h4 className="text-neutral-700 font-futuristic text-xl uppercase tracking-[0.5em]">Inventory Empty</h4>
               <p className="text-neutral-800 text-[10px] font-black uppercase tracking-widest mt-4">No assets have been provisioned to your ID yet</p>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: OPERATIONAL HISTORY (4 COLS) */}
      <div className="lg:col-span-4 h-full">
         <div className="bg-black p-8 rounded-[3rem] border border-neutral-800/60 h-full flex flex-col shadow-2xl relative overflow-hidden group">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-6 mb-8 relative z-10">
               <h4 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.4em] flex items-center gap-3">
                  <History size={16} className="text-[#FACC15]" /> Operational History
               </h4>
               <div className="w-2 h-2 bg-[#FACC15] rounded-full animate-pulse shadow-[0_0_12px_#FACC15]" />
            </div>
            
            <div className="flex-1 space-y-6 overflow-y-auto scrollbar-hide relative z-10 max-h-[800px] pr-2">
               {userLogs.length > 0 ? (
                 userLogs.map((log, idx) => (
                   <div key={idx} className="relative pl-8 border-l border-neutral-900 pb-2">
                      <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 bg-neutral-900 border border-neutral-800 rounded-full group-hover:bg-[#FACC15] group-hover:border-black transition-all" />
                      <div className="space-y-2">
                         <div className="flex justify-between items-center">
                            <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">{log.timestamp}</span>
                            <span className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-tighter ${
                               log.type === 'buy' ? 'bg-emerald-600 text-white' : 'bg-neutral-800 text-neutral-400'
                            }`}>
                               {log.type}
                            </span>
                         </div>
                         <p className="text-[11px] text-neutral-400 font-bold uppercase leading-relaxed group-hover:text-white transition-colors">
                            {log.message}
                         </p>
                         <div className="flex items-center gap-2 text-[8px] font-black text-neutral-800 uppercase tracking-widest">
                            <ShieldCheck size={10} /> VERIFIED_LEDGER_SYNC
                         </div>
                      </div>
                   </div>
                 ))
               ) : (
                 <div className="py-24 text-center opacity-20">
                    <Activity size={40} className="mx-auto text-neutral-900 mb-4" />
                    <p className="text-[9px] text-neutral-700 font-black uppercase tracking-[0.5em]">Log Offline</p>
                 </div>
               )}
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-900 relative z-10">
               <div className="bg-neutral-900/30 p-4 rounded-2xl border border-white/5 space-y-3">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                     <span className="text-neutral-600">Sync Integrity</span>
                     <span className="text-emerald-500">99.9%</span>
                  </div>
                  <div className="w-full h-1 bg-black rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-[99.9%]" />
                  </div>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
};

export default UserActivityHub;
