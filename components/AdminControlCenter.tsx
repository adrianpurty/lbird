
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
  leads, users, walletActivities, onUpdateLead, onDeleteLead, onUpdateUser 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'leads' | 'users' | 'ledger'>('leads');
  const [searchTerm, setSearchTerm] = useState('');

  const stats = useMemo(() => ({
    marketCap: leads.reduce((acc, l) => acc + l.currentBid, 0),
    userNodes: users.length,
    activeLeads: leads.filter(l => l.status === 'approved').length
  }), [leads, users]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (activeSubTab === 'leads') return leads.filter(l => l.title.toLowerCase().includes(term) || l.category.toLowerCase().includes(term));
    if (activeSubTab === 'users') return users.filter(u => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
    return walletActivities.filter(wa => wa.provider.toLowerCase().includes(term) || wa.userId.toLowerCase().includes(term));
  }, [leads, users, walletActivities, activeSubTab, searchTerm]);

  return (
    <div className="max-w-[1000px] mx-auto space-y-4 pb-24 animate-in fade-in duration-500 font-rajdhani px-3 md:px-0">
      
      {/* COMPACT HEADER */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center text-red-500 shadow-glow-sm">
            <ShieldAlert size={16} />
          </div>
          <div>
            <h2 className="text-lg font-futuristic text-white italic uppercase leading-none tracking-tight">CONTROL <span className="text-neutral-500">CENTER</span></h2>
            <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest mt-0.5">ROOT_v4.2_SYNCED</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-neutral-900/50 p-1 rounded-lg border border-neutral-800">
           {['leads', 'users', 'ledger'].map((tab) => (
             <button 
               key={tab}
               onClick={() => { soundService.playClick(); setActiveSubTab(tab as any); }}
               className={`px-3 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${activeSubTab === tab ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
             >
               {tab}
             </button>
           ))}
        </div>
      </div>

      {/* COMPACT STATS */}
      <div className="grid grid-cols-3 gap-3 bg-[#0f0f0f] border border-neutral-800/40 rounded-2xl p-4 shadow-xl">
        <div className="text-center">
          <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-0.5">Valuation</span>
          <span className="text-lg font-black text-white italic font-tactical">${stats.marketCap.toLocaleString()}</span>
        </div>
        <div className="text-center border-x border-neutral-900">
          <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-0.5">Nodes</span>
          <span className="text-lg font-black text-white italic font-tactical">{stats.userNodes}U</span>
        </div>
        <div className="text-center">
          <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-0.5">Health</span>
          <span className="text-lg font-black text-emerald-500 italic font-tactical">99.8%</span>
        </div>
      </div>

      {/* SEARCH HUD */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={14} />
        <input 
          type="text"
          placeholder={`FILTER_${activeSubTab.toUpperCase()}_STREAM...`}
          className="w-full bg-[#0c0c0c] border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-red-500/40 transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* DATA FEED - ULTRA COMPACT */}
      <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-2xl overflow-hidden shadow-lg">
        <div className="max-h-[400px] overflow-y-auto scrollbar-hide">
          {filteredData.map((item: any) => (
            <div key={item.id} className="flex items-center justify-between p-3 border-b border-neutral-900 last:border-0 hover:bg-white/[0.02] transition-colors group">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-700 shrink-0 group-hover:text-red-500 transition-colors">
                  {activeSubTab === 'leads' ? <Zap size={14} /> : activeSubTab === 'users' ? <Users size={14} /> : <History size={14} />}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-white italic truncate uppercase leading-none">{item.title || item.name || item.provider}</h4>
                  <p className="text-[7px] text-neutral-600 font-bold uppercase tracking-widest mt-0.5 truncate">{item.category || item.email || item.timestamp}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {activeSubTab === 'leads' && (
                   <>
                    <button onClick={() => onUpdateLead(item)} className="p-1.5 bg-neutral-900 border border-neutral-800 rounded-md text-neutral-600 hover:text-white transition-all"><Edit3 size={12} /></button>
                    <button onClick={() => onDeleteLead(item.id)} className="p-1.5 bg-neutral-900 border border-neutral-800 rounded-md text-neutral-600 hover:text-red-500 transition-all"><Trash2 size={12} /></button>
                   </>
                )}
                {activeSubTab === 'users' && (
                  <button onClick={() => onUpdateUser(item.id, { status: item.status === 'active' ? 'restricted' : 'active' })} className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border ${item.status === 'active' ? 'border-emerald-900/50 text-emerald-500 bg-emerald-500/5' : 'border-red-900/50 text-red-500 bg-red-500/5'}`}>
                    {item.status === 'active' ? 'AUTH' : 'ISO'}
                  </button>
                )}
                {activeSubTab === 'ledger' && (
                  <span className={`text-[11px] font-black italic font-tactical ${item.type === 'deposit' ? 'text-emerald-500' : 'text-neutral-500'}`}>
                    {item.type === 'deposit' ? '+' : '-'} ${item.amount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#0f0f0f] border border-neutral-900 p-3 rounded-xl flex items-center gap-3">
        <ShieldAlert size={14} className="text-red-900/60" />
        <p className="text-[7px] text-neutral-700 font-medium uppercase tracking-widest">Administrative sync is live. Any state transition is permanently indexed in the global ledger.</p>
      </div>

    </div>
  );
};

export default AdminControlCenter;
