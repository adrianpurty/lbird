import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldAlert, Cpu, Activity, Database, Users, TrendingUp, 
  Search, Filter, ArrowRight, Gavel, Trash2, Edit3, 
  CheckCircle2, XCircle, DollarSign, History, Zap, 
  Layers, Lock, Unlock, Globe, RefreshCw, AlertTriangle, Eye, User as UserIcon, Calendar, Clock, Fingerprint, X,
  Target, ShieldCheck, Radar, BarChart3, Gauge, ArrowUpRight, ChevronLeft, ChevronRight, MapPin, ChevronUp, ChevronDown, Settings,
  Crosshair, Radio, HardDrive, Terminal, Orbit, CircleDashed, Atom, Box, Monitor, Share2, Power, Scan, ListTree, ActivitySquare, LayoutGrid, Server
} from 'lucide-react';
import { Lead, User, PurchaseRequest, WalletActivity } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface AdminControlCenterProps {
  leads: Lead[];
  users: User[];
  bids: PurchaseRequest[];
  walletActivities: WalletActivity[];
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
  onUpdateUser: (id: string, updates: Partial<User>) => void;
  onUpdateFinancial?: () => void;
}

const CrystalNode: React.FC<{ 
  item: any, 
  type: string, 
  onClick: () => void, 
  displayImage?: string 
}> = ({ item, type, onClick, displayImage }) => {
  const isHealthy = item.status === 'active' || item.status === 'approved';
  
  return (
    <div 
      className="group relative bg-surface/80 backdrop-blur-sm border border-bright rounded-2xl p-6 transition-all duration-300 hover:border-accent/30 hover:bg-card cursor-pointer overflow-hidden flex flex-col justify-between shadow-2xl font-clean"
      onClick={() => { soundService.playClick(); onClick(); }}
    >
      {/* Subtle Dynamic Backglow */}
      <div className={`absolute -bottom-10 -right-10 w-40 h-40 rounded-full blur-[80px] opacity-0 transition-opacity duration-700 group-hover:opacity-10 ${isHealthy ? 'bg-emerald-500' : 'bg-red-500'}`} />
      
      <div className="relative z-10 flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
           <div className="w-12 h-12 rounded-xl bg-card border border-bright flex items-center justify-center text-dim group-hover:text-main transition-all overflow-hidden shrink-0 shadow-lg">
              {displayImage ? (
                <img src={displayImage} alt="Identity" className="w-full h-full object-cover" />
              ) : (
                type === 'leads' ? <Target size={18} strokeWidth={1.5} /> : <UserIcon size={18} strokeWidth={1.5} />
              )}
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-main font-mono tracking-tight group-hover:text-accent transition-all">
                ID_{item.id.slice(-6).toUpperCase()}
              </span>
              <span className="text-[7px] font-black text-dim uppercase tracking-widest mt-0.5">Registry_Lock</span>
           </div>
        </div>
        <div className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest transition-all border ${
          isHealthy ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-red-500/5 border-red-500/20 text-red-500'
        }`}>
          {item.status?.toUpperCase() || 'SYNCED'}
        </div>
      </div>

      <div className="relative z-10">
        <h4 className="text-sm font-semibold text-main tracking-tight truncate leading-tight mb-4 group-hover:translate-x-1 transition-transform">
          {item.title || item.name || 'UNLABELED_NODE'}
        </h4>
        
        <div className="flex items-center justify-between pt-4 border-t border-bright">
           <div className="flex flex-col">
              <span className="text-[7px] font-black text-dim uppercase tracking-widest mb-0.5">Asset_Class</span>
              <span className="text-[9px] font-medium text-main/60 uppercase">{item.category || item.role || 'SYSTEM'}</span>
           </div>
           <div className="w-7 h-7 rounded-lg bg-main/5 flex items-center justify-center text-dim group-hover:bg-accent group-hover:text-white transition-all">
              <ChevronRight size={12} />
           </div>
        </div>
      </div>
    </div>
  );
};

const AdminControlCenter: React.FC<AdminControlCenterProps> = ({ 
  leads, users, bids, walletActivities, onUpdateLead, onDeleteLead, onUpdateUser 
}) => {
  const [activeMode, setActiveMode] = useState<'leads' | 'users' | 'ledger'>('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [systemUptime, setSystemUptime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSystemUptime(p => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (activeMode === 'leads') return leads.filter(l => l.title?.toLowerCase().includes(term));
    if (activeMode === 'users') return users.filter(u => u.name?.toLowerCase().includes(term));
    return walletActivities.filter(wa => wa.provider?.toLowerCase().includes(term));
  }, [leads, users, walletActivities, activeMode, searchTerm]);

  return (
    <div className="max-w-full space-y-8 animate-in fade-in duration-700 font-clean pb-32">
      
      {/* 1. BROAD MASTER TICKER */}
      <div className="bg-surface border border-bright rounded-3xl p-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent/20 to-transparent opacity-50" />
         
         <div className="flex items-center gap-10 w-full md:w-auto overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-6 shrink-0">
               <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center text-white shadow-2xl relative">
                  <ShieldAlert size={24} />
                  <div className="absolute inset-0 bg-red-600 rounded-xl animate-ping opacity-10" />
               </div>
               <div>
                  <h2 className="text-xl font-futuristic text-main italic uppercase leading-none tracking-tight">CONTROL_CENTER</h2>
                  <p className="text-[8px] text-red-500 font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" /> ADMIN_OVERRIDE_ENABLED
                  </p>
               </div>
            </div>
            
            <div className="h-10 w-px bg-bright hidden md:block" />

            <div className="flex items-center gap-10">
               <div className="flex flex-col">
                  <span className="text-[7px] font-black text-neutral-500 uppercase tracking-widest mb-1">Aggregate_Volume</span>
                  <span className="text-xl font-bold text-main tracking-tight">$1,248,392</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[7px] font-black text-neutral-500 uppercase tracking-widest mb-1">Platform_Yield</span>
                  <span className="text-xl font-bold text-emerald-500 tracking-tight">$42,800</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[7px] font-black text-neutral-500 uppercase tracking-widest mb-1">Active_Uptime</span>
                  <span className="text-xl font-medium text-neutral-400 font-mono tracking-tighter">{formatUptime(systemUptime)}</span>
               </div>
            </div>
         </div>

         <div className="flex items-center gap-1 bg-surface/40 p-1 rounded-xl border border-bright w-full md:w-auto">
            {(['leads', 'users', 'ledger'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { soundService.playClick(); setActiveMode(m); }}
                className={`flex-1 px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  activeMode === m ? 'bg-accent text-white shadow-2xl scale-105' : 'text-neutral-500 hover:text-white'
                }`}
              >
                {m === 'leads' ? <Target size={12} /> : m === 'users' ? <Users size={12} /> : <History size={12} />}
                {m}
              </button>
            ))}
         </div>
      </div>

      {/* 2. MAIN BROAD CONSOLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* EXPANSIVE DATA GRID (Full Width) */}
        <div className="lg:col-span-12 space-y-6">
           <div className="bg-surface border border-bright rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col min-h-[750px]">
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10 relative z-10">
                 <div className="relative group w-full md:w-[500px]">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-accent transition-colors" size={18} />
                    <input 
                      type="text"
                      placeholder={`Filter Registry [${activeMode.toUpperCase()}] ...`}
                      className="w-full bg-card border border-bright rounded-2xl pl-14 pr-6 py-4 text-sm font-medium text-main outline-none focus:border-accent/40 transition-all shadow-inner placeholder:text-neutral-700"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 
                 <div className="flex items-center gap-6">
                    <div className="text-right">
                       <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest block mb-0.5">TOTAL_NODES</span>
                       <span className="text-2xl font-bold text-main leading-none tracking-tighter">{filteredData.length} UNITS</span>
                    </div>
                    <button className="p-4 bg-card border border-bright rounded-xl text-neutral-500 hover:text-main transition-all">
                       <Filter size={18} />
                    </button>
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                   {filteredData.map((item: any) => {
                     let displayImage = undefined;
                     if (activeMode === 'leads') {
                       const owner = users.find(u => u.id === item.ownerId);
                       displayImage = owner?.profileImage;
                     } else if (activeMode === 'users') {
                       displayImage = item.profileImage;
                     }

                     return (
                       <CrystalNode 
                         key={item.id} 
                         item={item} 
                         type={activeMode} 
                         displayImage={displayImage}
                         onClick={() => setSelectedNode(item)}
                       />
                     );
                   })}
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* NODE DETAIL MODAL */}
      {selectedNode && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-500 font-clean">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--accent-primary),transparent_70%)] opacity-5 pointer-events-none" />
          
          <div className="w-full max-w-5xl bg-platform border border-bright rounded-[3rem] shadow-2xl flex flex-col max-h-[95vh] relative animate-in zoom-in-95 duration-500 overflow-hidden">
             
             <div className="flex justify-between items-center p-8 md:p-10 bg-surface border-b border-bright shrink-0">
                <div className="flex items-center gap-8">
                   <div className="w-16 h-16 bg-accent/5 rounded-2xl flex items-center justify-center border border-accent/20 text-accent shadow-2xl shadow-accent/10">
                      <Power size={28} strokeWidth={1.5} className="animate-pulse" />
                   </div>
                   <div>
                      <h2 className="text-3xl font-futuristic text-main italic uppercase tracking-tighter leading-none">
                        SYSTEM_OVERRIDE <span className="text-dim">CORE</span>
                      </h2>
                      <p className="text-[9px] text-accent font-black uppercase tracking-[0.4em] mt-3 flex items-center gap-3">
                        <Scan size={12} /> IDENT_TOKEN: {selectedNode.id.toUpperCase()}
                      </p>
                   </div>
                </div>
                <button onClick={() => setSelectedNode(null)} className="w-14 h-14 bg-card border border-bright rounded-2xl flex items-center justify-center text-neutral-500 hover:text-white hover:border-accent/40 transition-all active:scale-90 shadow-2xl">
                  <X size={24} strokeWidth={2} />
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-10 md:p-14 space-y-16 scrollbar-hide">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                   
                   {/* NODE IDENTITY SECTION */}
                   <div className="lg:col-span-5 space-y-12">
                      <div className="flex flex-col items-center text-center space-y-8">
                         <div className="relative group">
                            <div className="absolute inset-0 bg-accent/10 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-all duration-1000" />
                            <div className="w-40 h-40 rounded-[2.5rem] border-4 border-bright bg-card overflow-hidden flex items-center justify-center relative shadow-2xl">
                               {selectedNode.profileImage ? (
                                 <img src={selectedNode.profileImage} className="w-full h-full object-cover scale-105" alt="Node" />
                               ) : (
                                 <UserIcon size={72} strokeWidth={1} className="text-dim" />
                               )}
                            </div>
                         </div>
                         <div className="space-y-2">
                            <h3 className="text-2xl font-bold text-main tracking-tight">{selectedNode.name || selectedNode.title}</h3>
                            <p className="text-xs text-neutral-500 font-medium tracking-wide font-mono">{selectedNode.email || 'INTERNAL_VIRTUAL_ASSET'}</p>
                         </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                         <div className="bg-card border border-bright p-8 rounded-3xl text-center space-y-2 shadow-inner">
                            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest italic block">Asset_Value</span>
                            <span className="text-3xl font-bold text-main tracking-tighter block">${(selectedNode.balance || selectedNode.currentBid || 0).toLocaleString()}</span>
                         </div>
                         <div className="bg-card border border-bright p-8 rounded-3xl text-center space-y-2 shadow-inner">
                            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest italic block">Logical_State</span>
                            <span className={`text-xl font-black italic uppercase block tracking-tighter ${
                              selectedNode.status === 'active' || selectedNode.status === 'approved' ? 'text-emerald-500' : 'text-red-500'
                            }`}>{selectedNode.status || 'SYNCED'}</span>
                         </div>
                      </div>
                   </div>

                   {/* PROTOCOL OVERRIDE SECTION */}
                   <div className="lg:col-span-7 space-y-10">
                      <div className="bg-surface border border-bright p-10 rounded-[3rem] space-y-10 relative overflow-hidden group shadow-2xl">
                         <div className="flex items-center gap-4 border-b border-bright pb-6">
                            <Zap size={16} className="text-accent" />
                            <h4 className="text-[10px] font-black text-main uppercase tracking-[0.4em] italic">Command_Protocols</h4>
                         </div>

                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button 
                              onClick={() => {
                                soundService.playClick(true);
                                if (activeMode === 'users') {
                                  onUpdateUser(selectedNode.id, { status: selectedNode.status === 'active' ? 'restricted' : 'active' });
                                } else {
                                  onUpdateLead({ ...selectedNode, status: selectedNode.status === 'approved' ? 'rejected' : 'approved' });
                                }
                                setSelectedNode(null);
                              }}
                              className={`py-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl active:scale-[0.98] border-b-8 ${
                                selectedNode.status === 'active' || selectedNode.status === 'approved' 
                                  ? 'bg-red-700 text-white border-red-950 hover:bg-red-600' 
                                  : 'bg-emerald-600 text-white border-emerald-950 hover:bg-emerald-500'
                              }`}
                            >
                              {selectedNode.status === 'active' || selectedNode.status === 'approved' ? 'ISOLATE_NODE' : 'RESTORE_SYNC'}
                            </button>

                            <button className="py-6 bg-card border border-bright border-b-8 border-black text-neutral-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white hover:border-accent transition-all shadow-2xl">
                               DEEP_AUDIT
                            </button>

                            <button className="py-6 bg-card border border-bright border-b-8 border-black text-neutral-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-white hover:border-accent transition-all shadow-2xl">
                               REBOOT_CORE
                            </button>

                            <button 
                              onClick={() => {
                                if (confirm('CRITICAL: Permanent Identity Shredding. Node will be blacklisted. Proceed?')) {
                                  if (activeMode === 'leads') onDeleteLead(selectedNode.id);
                                  setSelectedNode(null);
                                }
                              }}
                              className="py-6 bg-red-950/20 border-2 border-red-900/40 border-b-8 border-red-950 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-900 hover:text-white transition-all shadow-2xl"
                            >
                               PURGE_DATA
                            </button>
                         </div>
                      </div>

                      <div className="bg-card border border-bright p-8 rounded-3xl flex items-start gap-8 shadow-inner">
                         <ShieldCheck size={32} className="text-neutral-700 shrink-0" />
                         <div className="space-y-2">
                            <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest font-futuristic leading-none">Global_Security_Handshake</h4>
                            <p className="text-[10px] text-main/80 leading-relaxed font-medium uppercase italic tracking-tighter">
                              Unauthorized state transitions will trigger a total infrastructure lockdown. Behavioral telemetry active.
                            </p>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
             
             <div className="p-8 md:p-10 bg-surface border-t border-bright flex justify-end shrink-0">
                <button 
                  onClick={() => setSelectedNode(null)} 
                  className="px-16 py-4 bg-main text-surface rounded-full font-black text-[10px] uppercase tracking-widest italic hover:bg-main/90 transition-all shadow-2xl active:scale-95"
                >
                  TERMINATE_SESSION
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminControlCenter;