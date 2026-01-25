
import React from 'react';
import { X, ShieldCheck, Zap, Target, Globe, Link, Clock, DollarSign, Activity, Database, FileText, ArrowRight, Fingerprint } from 'lucide-react';
import { PurchaseRequest, Lead } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface PurchaseManifestModalProps {
  purchase: PurchaseRequest;
  lead?: Lead;
  onClose: () => void;
}

const PurchaseManifestModal: React.FC<PurchaseManifestModalProps> = ({ purchase, lead, onClose }) => {
  const handleClose = () => {
    soundService.playClick(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-[#050505] border-2 border-neutral-800/60 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 relative">
        
        {/* HUD HEADER */}
        <div className="flex justify-between items-center p-8 bg-[#0A0A0A] border-b border-neutral-800/40 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-14 h-14 bg-[#FACC15]/10 rounded-2xl flex items-center justify-center border border-[#FACC15]/30 shadow-lg">
              <FileText className="text-[#FACC15]" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none font-futuristic">ASSET_MANIFEST</h2>
              <div className="flex items-center gap-3 mt-2">
                 <div className="flex items-center gap-1.5">
                    <Fingerprint size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-tactical font-black text-neutral-500 uppercase tracking-widest">UID: {purchase.id}</span>
                 </div>
                 <span className="w-1 h-1 bg-neutral-800 rounded-full" />
                 <span className={`text-[10px] font-tactical font-black uppercase tracking-widest ${purchase.status === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                    SYNC_{purchase.status.toUpperCase()}
                 </span>
              </div>
            </div>
          </div>
          <button onClick={handleClose} className="p-3 hover:bg-white/5 rounded-full transition-all text-neutral-600 hover:text-white relative z-10">
            <X size={28} />
          </button>
        </div>

        {/* TACTICAL DATA GRID */}
        <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto scrollbar-hide">
          
          {/* LEFT: CORE TELEMETRY */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-black border border-neutral-800/60 rounded-[2rem] p-6 space-y-6">
               <div className="text-center pb-4 border-b border-neutral-900">
                  <span className="text-[8px] font-tactical text-neutral-600 uppercase tracking-widest block mb-2">SETTLEMENT_VALUATION</span>
                  <div className="text-4xl font-black text-white font-tactical tracking-tighter italic">
                     <span className="text-sm text-[#FACC15] opacity-40">$</span>{purchase.bidAmount.toLocaleString()}
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] font-tactical text-neutral-500 uppercase">Daily_Volume</span>
                     <span className="text-xs font-black text-white">{purchase.leadsPerDay} Nodes</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] font-tactical text-neutral-500 uppercase">Purchase_Mode</span>
                     <span className="text-[9px] font-black px-2 py-0.5 bg-[#1A1A1A] rounded text-[#FACC15] uppercase">{purchase.purchaseMode}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[9px] font-tactical text-neutral-500 uppercase">Total_Daily_Burn</span>
                     <span className="text-xs font-black text-emerald-500 font-tactical">${purchase.totalDailyCost.toLocaleString()}</span>
                  </div>
               </div>

               <div className="pt-4 mt-4 border-t border-neutral-900">
                  <div className="flex items-center gap-3 p-3 bg-neutral-900/30 rounded-xl border border-white/5">
                     <Activity size={14} className="text-[#FACC15] animate-pulse" />
                     <div className="min-w-0">
                        <span className="text-[8px] font-tactical text-neutral-600 uppercase block">Node_Status</span>
                        <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest truncate block">OPERATIONAL_LINK</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-[#1A1A1A]/30 border border-white/5 rounded-2xl p-6 flex items-start gap-4">
               <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
               <div className="space-y-1">
                  <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Ledger_Integrity</h4>
                  <p className="text-[9px] text-neutral-600 leading-relaxed font-medium uppercase tracking-tighter italic">
                    Handshake finalized via secure-tunnel. Transaction hash is immutable.
                  </p>
               </div>
            </div>
          </div>

          {/* RIGHT: ROUTING & ASSET IDENTITY */}
          <div className="lg:col-span-8 space-y-6">
             <div className="bg-[#0A0A0A] border border-neutral-800/60 rounded-[2.5rem] p-8 h-full flex flex-col relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                  <Database size={160} />
                </div>

                <div className="flex items-center gap-4 mb-8 border-b border-neutral-900 pb-6 relative z-10">
                   <div className="w-10 h-10 bg-black rounded-xl border border-neutral-800 flex items-center justify-center text-[#FACC15]">
                      <Target size={20} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black text-white italic tracking-tight">{purchase.leadTitle}</h3>
                      <p className="text-[9px] text-neutral-600 font-tactical uppercase tracking-widest mt-1">{lead?.category || 'MULTI-SECTOR'} ASSET NODE</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                   <div className="space-y-3">
                      <span className="text-[9px] font-tactical text-neutral-700 uppercase tracking-widest block px-1">Origin_Business_Endpoint</span>
                      <div className="flex items-center gap-3 p-4 bg-black rounded-2xl border border-neutral-800 group-hover:border-[#FACC15]/20 transition-all">
                         <Globe size={14} className="text-neutral-600" />
                         <span className="text-[10px] font-mono text-[#FACC15] truncate">{purchase.buyerBusinessUrl}</span>
                      </div>
                   </div>
                   <div className="space-y-3">
                      <span className="text-[9px] font-tactical text-neutral-700 uppercase tracking-widest block px-1">Post_Back_Relay</span>
                      <div className="flex items-center gap-3 p-4 bg-black rounded-2xl border border-neutral-800 group-hover:border-[#FACC15]/20 transition-all">
                         <Link size={14} className="text-neutral-600" />
                         <span className="text-[10px] font-mono text-[#FACC15] truncate">{purchase.buyerTargetLeadUrl}</span>
                      </div>
                   </div>
                </div>

                <div className="mt-8 space-y-4 relative z-10">
                   <span className="text-[9px] font-tactical text-neutral-700 uppercase tracking-widest block px-1">Acquisition_Timeline</span>
                   <div className="flex items-center gap-4">
                      <div className="flex-1 bg-black p-4 rounded-2xl border border-neutral-800 flex items-center justify-between">
                         <span className="text-[9px] font-tactical text-neutral-500 uppercase">Synchronized</span>
                         <span className="text-[10px] font-black text-neutral-400 font-mono">{purchase.timestamp}</span>
                      </div>
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 text-emerald-500">
                         <ShieldCheck size={18} />
                      </div>
                   </div>
                </div>

                <div className="mt-auto pt-8 flex justify-end gap-4 relative z-10">
                   <button className="px-6 py-3 bg-[#1A1A1A] border border-neutral-800 rounded-xl text-[9px] font-black text-neutral-500 uppercase tracking-widest hover:text-white transition-all flex items-center gap-2">
                      <FileText size={14} /> DOWNLOAD_LOG
                   </button>
                   <button 
                    onClick={handleClose}
                    className="px-8 py-3 bg-[#FACC15] text-black rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl border-b-4 border-yellow-700 active:scale-95 transition-all"
                   >
                     CLOSE_NODE
                   </button>
                </div>
             </div>
          </div>
        </div>

        {/* Scanline Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
      </div>
    </div>
  );
};

export default PurchaseManifestModal;
