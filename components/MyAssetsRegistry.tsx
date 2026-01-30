
import React, { useMemo } from 'react';
import { 
  Target, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Activity, 
  Edit3, 
  Database,
  Hash,
  ArrowRight,
  Zap,
  Layers,
  ChevronRight,
  Eye,
  TrendingUp
} from 'lucide-react';
import { Lead } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface MyAssetsRegistryProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
}

const MyAssetsRegistry: React.FC<MyAssetsRegistryProps> = ({ leads, onEdit }) => {
  const stats = useMemo(() => {
    return {
      total: leads.length,
      approved: leads.filter(l => l.status === 'approved').length,
      pending: leads.filter(l => l.status === 'pending').length,
      revoked: leads.filter(l => l.status === 'rejected').length,
    };
  }, [leads]);

  if (leads.length === 0) return null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Registry Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-bright pb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-main rounded-xl flex items-center justify-center text-surface shadow-lg">
            <Layers size={20} />
          </div>
          <div>
            <h2 className="text-xl font-futuristic text-main italic uppercase tracking-tight">ASSET <span className="text-dim">REGISTRY</span></h2>
            <p className="text-[8px] text-neutral-600 font-black uppercase tracking-[0.3em] mt-1">Personal_Node_Sync_Manifest</p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-card/40 px-6 py-3 rounded-2xl border border-bright">
           <div className="flex flex-col items-center px-4">
              <span className="text-[7px] font-black text-neutral-600 uppercase mb-1">TOTAL</span>
              <span className="text-lg font-tactical font-black text-main leading-none">{stats.total}</span>
           </div>
           <div className="h-6 w-px bg-bright" />
           <div className="flex flex-col items-center px-4">
              <span className="text-[7px] font-black text-emerald-500/60 uppercase mb-1">LIVE</span>
              <span className="text-lg font-tactical font-black text-emerald-500 leading-none">{stats.approved}</span>
           </div>
           <div className="h-6 w-px bg-bright" />
           <div className="flex flex-col items-center px-4">
              <span className="text-[7px] font-black text-amber-500/60 uppercase mb-1">AUDIT</span>
              <span className="text-lg font-tactical font-black text-amber-500 leading-none">{stats.pending}</span>
           </div>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {leads.map(lead => (
          <div 
            key={lead.id}
            onClick={() => { soundService.playClick(); onEdit(lead); }}
            className="group relative bg-[#0a0a0a] border-2 border-neutral-900 rounded-[2rem] p-6 transition-all duration-500 hover:border-accent/40 hover:bg-[#0d0d0d] cursor-pointer overflow-hidden shadow-2xl"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 transition-opacity duration-1000 ${
              lead.status === 'approved' ? 'bg-emerald-500' : lead.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
            }`} />

            <div className="flex justify-between items-start mb-6 relative z-10">
               <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl bg-black border border-neutral-800 flex items-center justify-center transition-all ${
                    lead.status === 'approved' ? 'text-emerald-500' : lead.status === 'rejected' ? 'text-red-500' : 'text-amber-500'
                  }`}>
                    <Target size={20} />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono font-bold text-neutral-600 block leading-none mb-1">ID_{lead.id.slice(-6).toUpperCase()}</span>
                    <div className="flex items-center gap-1.5">
                       <div className={`w-1 h-1 rounded-full animate-pulse ${
                         lead.status === 'approved' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 
                         lead.status === 'rejected' ? 'bg-red-500' : 'bg-amber-500'
                       }`} />
                       <span className={`text-[8px] font-black uppercase tracking-widest ${
                         lead.status === 'approved' ? 'text-emerald-500' : 
                         lead.status === 'rejected' ? 'text-red-500' : 'text-amber-500'
                       }`}>{lead.status}</span>
                    </div>
                  </div>
               </div>
               <div className="bg-black/60 border border-bright px-3 py-1 rounded-lg text-right">
                  <span className="text-[7px] font-black text-neutral-600 uppercase block">Floor</span>
                  <span className="text-sm font-tactical font-black text-main leading-none">${lead.currentBid}</span>
               </div>
            </div>

            <h3 className="text-sm font-bold text-main uppercase italic truncate leading-tight mb-2 relative z-10 group-hover:text-accent transition-colors">{lead.title}</h3>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest italic mb-6 opacity-60">{lead.category}</p>

            <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
               <div className="bg-black/40 border border-bright p-3 rounded-xl">
                  <span className="text-[7px] font-black text-neutral-700 uppercase block mb-1">Quality</span>
                  <div className="flex items-center gap-2">
                     <TrendingUp size={10} className="text-emerald-500" />
                     <span className="text-xs font-black text-main font-tactical italic tracking-widest">{lead.qualityScore}%</span>
                  </div>
               </div>
               <div className="bg-black/40 border border-bright p-3 rounded-xl text-right">
                  <span className="text-[7px] font-black text-neutral-700 uppercase block mb-1">Capacity</span>
                  <span className="text-xs font-black text-main font-tactical italic tracking-widest">{lead.leadCapacity?.toLocaleString() || '∞'}U</span>
               </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-bright relative z-10">
               <div className="flex items-center gap-2 text-neutral-700">
                  <Clock size={12} />
                  <span className="text-[8px] font-bold uppercase tracking-tighter">{lead.deliveryDate?.replace('WK-', 'Week ') || 'Realtime'}</span>
               </div>
               <button className="flex items-center gap-2 text-[9px] font-black text-neutral-600 hover:text-white transition-all group/btn">
                  ASSET_DETAILS <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAssetsRegistry;
