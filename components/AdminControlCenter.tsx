
import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, Cpu, Activity, Database, Users, TrendingUp, 
  Search, Filter, ArrowRight, Gavel, Trash2, Edit3, 
  CheckCircle2, XCircle, DollarSign, History, Zap, 
  Layers, Lock, Unlock, Globe, RefreshCw, AlertTriangle
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
  onUpdateFinancial: (activityId: string, updates: any) => void;
}

const AdminControlCenter: React.FC<AdminControlCenterProps> = ({ 
  leads, users, bids, walletActivities, 
  onUpdateLead, onDeleteLead, onUpdateUser, onUpdateFinancial 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'leads' | 'users' | 'ledger'>('leads');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = useMemo(() => ({
    marketCap: leads.reduce((acc, l) => acc + l.currentBid, 0),
    userNodes: users.length,
    activeLeads: leads.filter(l => l.status === 'approved').length,
    systemLoad: 14.2
  }), [leads, users]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (activeSubTab === 'leads') return leads.filter(l => l.title.toLowerCase().includes(term) || l.category.toLowerCase().includes(term));
    if (activeSubTab === 'users') return users.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    return walletActivities.filter(wa => wa.provider.toLowerCase().includes(term) || wa.userId.toLowerCase().includes(term));
  }, [leads, users, walletActivities, activeSubTab, searchTerm]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-32 animate-in fade-in duration-700 font-rajdhani">
      
      {/* HEADER HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-900/60 pb-10">
        <div className="space-y-6">
          <h1 className="text-6xl font-futuristic italic font-black uppercase tracking-tighter">
            CONTROL <span className="text-transparent" style={{ WebkitTextStroke: '2px #ffffff', opacity: 0.3 }}>CENTER</span>
          </h1>
          <div className="flex items-center gap-6">
            <div className="px-4 py-1.5 bg-red-500/10 border border-red-500/40 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <span className="text-[10px] font-black text-red-500 uppercase tracking-[0.2em]">ROOT_ACCESS_v4.2</span>
            </div>
            <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-[0.3em] italic">KERNEL_SYNC_ACTIVE // {leads.length + users.length} NODES</span>
          </div>
        </div>

        {/* SYSTEM INTEGRITY WIDGET */}
        <div className="bg-[#0c0c0c] border-2 border-neutral-800 p-4 md:p-6 rounded-[2rem] flex items-center gap-6 shadow-2xl group hover:border-red-500/30 transition-all cursor-default">
          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 shrink-0 group-hover:scale-110 transition-transform">
            <ShieldAlert size={24} />
          </div>
          <div>
            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-1">MARKET_INTEGRITY</span>
            <span className="text-3xl font-tactical text-white tracking-widest leading-none">SECURE</span>
          </div>
        </div>
      </div>

      {/* MASTER STATS BAR */}
      <div className="bg-[#0f0f0f] border border-neutral-800/60 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/5 rounded-full blur-[100px] -ml-32 -mt-32 pointer-events-none" />
        
        <div className="flex items-center gap-12 overflow-x-auto scrollbar-hide w-full">
          <div className="flex flex-col shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">AGGREGATE_VALUATION</span>
            <div className="text-3xl font-black text-white italic tracking-tighter flex items-baseline gap-2 font-tactical leading-none">
              <span className="text-sm text-red-500 opacity-40">$</span>{stats.marketCap.toLocaleString()}
            </div>
          </div>
          <div className="h-10 w-px bg-neutral-800 shrink-0" />
          <div className="flex flex-col shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">IDENTITY_NODES</span>
            <div className="text-2xl font-black text-white italic font-tactical leading-none uppercase">{stats.userNodes} Units</div>
          </div>
          <div className="h-10 w-px bg-neutral-800 shrink-0" />
          <div className="flex flex-col shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">NODE_HEALTH</span>
            <div className="text-2xl font-black text-emerald-500 italic flex items-center gap-2 font-tactical leading-none">
              <Activity size={16} className="animate-pulse" /> 99.8%
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-neutral-800 shrink-0 w-full md:w-auto">
            {['leads', 'users', 'ledger'].map((tab) => (
              <button 
                key={tab}
                onClick={() => { soundService.playClick(); setActiveSubTab(tab as any); }}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  activeSubTab === tab ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-neutral-600 hover:text-white'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* LEFT COLUMN: COMMAND STREAM (Col 8) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <Database size={120} />
            </div>

            {/* SEARCH & FILTERS */}
            <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 relative z-10">
              <div className="relative group flex-1 w-full">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-red-500 transition-colors" size={20} />
                <input 
                  type="text"
                  placeholder={`FILTER_${activeSubTab.toUpperCase()}_STREAM...`}
                  className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl pl-16 pr-6 py-4 text-[11px] font-black uppercase tracking-widest text-white outline-none focus:border-red-500/40 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.3em]">{filteredData.length} MATCHES</span>
                <button className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-600 hover:text-white transition-all">
                  <Filter size={18} />
                </button>
              </div>
            </div>

            {/* DATA GRID */}
            <div className="grid grid-cols-1 gap-4 relative z-10">
              {activeSubTab === 'leads' && (
                filteredData.map((lead: any) => (
                  <div key={lead.id} className="bg-black/40 border border-neutral-800/60 rounded-2xl p-6 flex items-center justify-between group/item hover:border-red-500/30 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600 group-hover/item:text-red-500 transition-colors">
                        <Zap size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white italic uppercase tracking-tight">{lead.title}</h4>
                        <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mt-1">{lead.category} // NODE_{lead.id.slice(-4)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] font-black text-white italic font-tactical">${lead.currentBid}</span>
                        <p className="text-[7px] text-neutral-700 font-black uppercase tracking-widest">VALUATION</p>
                      </div>
                      <button onClick={() => { soundService.playClick(); onUpdateLead(lead); }} className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-600 hover:text-white transition-all">
                        <Edit3 size={16} />
                      </button>
                      <button onClick={() => { soundService.playClick(); onDeleteLead(lead.id); }} className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-600 hover:text-red-500 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {activeSubTab === 'users' && (
                filteredData.map((user: any) => (
                  <div key={user.id} className="bg-black/40 border border-neutral-800/60 rounded-2xl p-6 flex items-center justify-between group/item hover:border-red-500/30 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                        {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : <Users className="text-neutral-700" size={20} />}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white italic uppercase tracking-tight">{user.name}</h4>
                        <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mt-1">{user.role} // {user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => onUpdateUser(user.id, { status: user.status === 'active' ? 'restricted' : 'active' })}
                        className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                          user.status === 'active' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' : 'border-red-500/30 text-red-500 bg-red-500/5'
                        }`}
                      >
                        {user.status === 'active' ? 'AUTHORIZED' : 'ISOLATED'}
                      </button>
                      <button className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-600 hover:text-white transition-all">
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {activeSubTab === 'ledger' && (
                filteredData.map((wa: any) => (
                  <div key={wa.id} className="bg-black/40 border border-neutral-800/60 rounded-2xl p-6 flex items-center justify-between group/item hover:border-red-500/30 transition-all">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-xl border border-neutral-800 flex items-center justify-center ${wa.type === 'deposit' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {wa.type === 'deposit' ? <TrendingUp size={20} /> : <Database size={20} />}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white italic uppercase tracking-tight">{wa.provider}</h4>
                        <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest mt-1">{wa.timestamp} // ID_{wa.id.slice(-6)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className={`text-lg font-black font-tactical italic ${wa.type === 'deposit' ? 'text-emerald-500' : 'text-neutral-500'}`}>
                        {wa.type === 'deposit' ? '+' : '-'} ${wa.amount}
                      </span>
                      <button className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-600 hover:text-white transition-all">
                        <History size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* LOWER ACTION STRIPE */}
          <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-10 shadow-xl">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2 flex items-center gap-3">
                <AlertTriangle size={16} className="text-red-500" /> SYSTEM_OVERRIDE_ACTIVE
              </span>
              <div className="text-2xl font-black text-white italic font-tactical tracking-widest px-2">
                ADMINISTRATIVE_MOD_ENABLED
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center border-2 border-neutral-900 border-dashed rounded-[2rem] p-8 group cursor-pointer hover:border-red-500/20 transition-colors">
              <div className="flex items-center gap-4 text-neutral-700 group-hover:text-neutral-500 transition-colors">
                <RefreshCw size={20} className="animate-spin-slow" />
                <span className="text-[11px] font-black uppercase tracking-[0.3em]">FORCE_NODE_SYNCHRONIZATION</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DIAGNOSTICS (Col 4) */}
        <div className="lg:col-span-4 space-y-8 h-full">
          <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-[3rem] p-10 h-full flex flex-col shadow-2xl relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-16">
               <Cpu size={18} className="text-red-500" />
               <h3 className="text-sm font-black text-white italic uppercase tracking-[0.3em]">DIAGNOSTICS_NODE</h3>
               <div className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_#ef4444]" />
            </div>

            <div className="flex-1 space-y-12">
               {/* RADAR WIDGET */}
               <div className="relative flex flex-col items-center justify-center text-center">
                  <div className="absolute inset-0 bg-red-500/5 rounded-full blur-3xl" />
                  <div className="w-48 h-48 rounded-full border-4 border-neutral-900 border-t-red-500 animate-spin-slow relative flex items-center justify-center">
                    <div className="w-40 h-40 rounded-full border border-neutral-800 border-dashed flex flex-col items-center justify-center">
                       <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-1">LATENCY</span>
                       <span className="text-4xl font-tactical text-white font-black">{stats.systemLoad}ms</span>
                       <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest mt-1">UPSCALE_SYNCING</span>
                    </div>
                  </div>
               </div>

               <div className="space-y-6">
                 <div className="space-y-3">
                   <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">TRAFFIC_WATERFALL</span>
                   <div className="space-y-3">
                      {['API_INGEST', 'AUTH_TUNNEL', 'WALLET_NODE', 'LEDGER_TX'].map(sys => (
                        <div key={sys} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-neutral-800/60">
                           <span className="text-[9px] font-black text-neutral-500 uppercase">{sys}</span>
                           <span className="text-[8px] font-black text-emerald-500 uppercase">ONLINE</span>
                        </div>
                      ))}
                   </div>
                 </div>
               </div>
            </div>

            <div className="space-y-6 mt-auto">
              <button 
                onClick={() => { soundService.playClick(); }}
                className="w-full bg-red-600 text-white rounded-[2rem] py-6 flex flex-col items-center justify-center gap-2 transition-all border-b-8 border-red-900 shadow-2xl active:translate-y-1 active:border-b-0"
              >
                <span className="text-xl font-black italic tracking-widest uppercase font-tactical">ISOLATE_ALL_NODES</span>
                <span className="text-[7px] font-black uppercase opacity-60">SYSTEM_LOCKDOWN_PROTOCOL</span>
              </button>

              <button 
                onClick={() => { soundService.playClick(); }}
                className="w-full bg-black text-white rounded-[2rem] py-6 flex flex-col items-center justify-center gap-2 transition-all border-b-8 border-neutral-900 shadow-2xl hover:bg-neutral-950 active:translate-y-1 active:border-b-0"
              >
                <span className="text-xl font-black italic tracking-widest uppercase font-tactical">PURGE_TEMP_LEDGER</span>
                <span className="text-[7px] font-black uppercase opacity-40">MAINTENANCE_SEQUENCE_09</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PERSISTENCE FOOTER */}
      <div className="bg-[#0f0f0f] border-2 border-neutral-900 p-8 rounded-[3rem] shadow-xl flex items-start gap-8 max-w-5xl mx-auto group hover:border-red-500/20 transition-all">
        <div className="w-14 h-14 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center justify-center text-red-500 shrink-0 group-hover:scale-110 transition-transform">
          <Database size={28} />
        </div>
        <div>
           <h4 className="text-xs font-black text-white italic uppercase tracking-[0.3em] mb-3 font-futuristic">AUDIT_LOG_PERSISTENCE</h4>
           <p className="text-[9px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
             Administrative overrides are subject to secondary nodal audit. Every state change is hashed and broadcast to the immutable global registry. Incomplete handshakes or unauthorized identity masking will trigger automated system isolation.
           </p>
        </div>
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 20s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
};

export default AdminControlCenter;
