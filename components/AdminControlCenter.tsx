import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, Cpu, Activity, Database, Users, TrendingUp, 
  Search, Filter, ArrowRight, Gavel, Trash2, Edit3, 
  CheckCircle2, XCircle, DollarSign, History, Zap, 
  Layers, Lock, Unlock, Globe, RefreshCw, AlertTriangle, Eye, User as UserIcon, Calendar, Clock, Fingerprint, X,
  Target
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

const UserAuditHUD: React.FC<{ 
  user: User; 
  userLeads: Lead[]; 
  userBids: PurchaseRequest[]; 
  onClose: () => void;
  onStatusToggle: () => void;
}> = ({ user, userLeads, userBids, onClose, onStatusToggle }) => {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="w-full max-w-6xl h-[90vh] bg-[#080808] border-2 border-neutral-800 rounded-[3rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-500 overflow-hidden">
        
        {/* HUD HEADER */}
        <div className="flex justify-between items-center p-8 bg-black/40 border-b-2 border-neutral-900 shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/30 shadow-lg">
              <ShieldAlert className="text-red-500" size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">IDENTITY_AUDIT_LOG</h2>
              <div className="flex items-center gap-3 mt-2">
                 <div className="flex items-center gap-1.5">
                    <Fingerprint size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">NODE_UID: {user.id}</span>
                 </div>
                 <span className="w-1 h-1 bg-neutral-800 rounded-full" />
                 <span className={`text-[10px] font-black uppercase tracking-widest italic ${user.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`}>
                   STATE: {user.status?.toUpperCase() || 'UNKNOWN'}
                 </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 bg-neutral-950 hover:bg-neutral-900 border-2 border-neutral-800 rounded-2xl transition-all">
            <X size={24} className="text-neutral-500 hover:text-white" />
          </button>
        </div>

        {/* HUD CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 scrollbar-hide">
          
          {/* LEFT COLUMN: CORE PROFILE & STATS */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0c0c0c] border border-neutral-800 rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden group">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-3xl border-2 border-neutral-800 bg-neutral-900 mb-4 overflow-hidden">
                  {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : <UserIcon size={48} className="m-auto h-full text-neutral-700" />}
                </div>
                <h3 className="text-xl font-black text-white italic uppercase tracking-tight">{user.name}</h3>
                <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-1">{user.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/40 border border-neutral-800/40 p-4 rounded-2xl">
                  <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">LIQUIDITY</span>
                  <span className="text-xl font-tactical text-emerald-500 italic">${user.balance.toLocaleString()}</span>
                </div>
                <div className="bg-black/40 border border-neutral-800/40 p-4 rounded-2xl">
                  <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">CUMULATIVE_SPEND</span>
                  <span className="text-xl font-tactical text-neutral-400 italic">${(user.totalSpend || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-[9px] font-black text-neutral-700 uppercase tracking-widest border-b border-neutral-900 pb-2">
                   <span>AUTHENTICATION_LEVEL</span>
                   <span className="text-white">{user.role?.toUpperCase() || 'USER'}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-black text-neutral-700 uppercase tracking-widest border-b border-neutral-900 pb-2">
                   <span>LAST_HEARTBEAT</span>
                   <span className="text-white">{user.last_active_at ? new Date(user.last_active_at).toLocaleTimeString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-black text-neutral-700 uppercase tracking-widest border-b border-neutral-900 pb-2">
                   <span>LOCATION_NODE</span>
                   <span className="text-white">{user.location || 'RESTRICTED'}</span>
                </div>
              </div>

              <button 
                onClick={onStatusToggle}
                className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-b-4 ${
                  user.status === 'active' 
                    ? 'bg-red-950/20 text-red-500 border-red-900/40 hover:bg-red-900 hover:text-white' 
                    : 'bg-emerald-600 text-white border-emerald-900 hover:bg-emerald-500'
                }`}
              >
                {user.status === 'active' ? 'ISOLATE_IDENTITY_NODE' : 'RESTORE_NETWORK_SYNC'}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: ASSETS & BIDS */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* OWNED ASSETS */}
            <div className="bg-[#0c0c0c] border border-neutral-800 rounded-[2.5rem] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                <div className="flex items-center gap-3">
                   <Layers size={16} className="text-[#00e5ff]" />
                   <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">PROVISIONED_ASSETS ({userLeads.length})</h4>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                {userLeads.map(lead => (
                  <div key={lead.id} className="bg-black/40 border border-neutral-800 rounded-xl p-4 flex items-center justify-between group hover:border-[#00e5ff]/40 transition-all">
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-white truncate uppercase italic">{lead.title}</p>
                      <p className="text-[8px] text-neutral-600 font-bold uppercase mt-1">{lead.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-black text-white italic font-tactical">${lead.currentBid}</span>
                    </div>
                  </div>
                ))}
                {userLeads.length === 0 && <p className="col-span-full text-center text-[10px] text-neutral-700 py-8 italic uppercase font-black">No Provisioned Nodes Detected</p>}
              </div>
            </div>

            {/* BIDDING LOG */}
            <div className="bg-[#0c0c0c] border border-neutral-800 rounded-[2.5rem] p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
                <div className="flex items-center gap-3">
                   <Activity size={16} className="text-amber-400" />
                   <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">ACQUISITION_HISTORY ({userBids.length})</h4>
                </div>
              </div>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                {userBids.map(bid => (
                  <div key={bid.id} className="bg-black/40 border border-neutral-800 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-6 group hover:bg-amber-400/[0.02] transition-all">
                    <div className="flex-1 min-w-0 w-full">
                       <div className="flex items-center justify-between mb-2">
                          <span className="text-[8px] font-mono text-neutral-700">ORD_{bid.id?.slice(-4).toUpperCase() || '---'}</span>
                          <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                            bid.status === 'approved' ? 'border-emerald-900/40 text-emerald-500 bg-emerald-500/5' : 'border-neutral-800 text-neutral-600'
                          }`}>
                            {bid.status}
                          </span>
                       </div>
                       <h5 className="text-xs font-black text-white italic uppercase truncate">{bid.leadTitle}</h5>
                       <div className="flex items-center gap-4 mt-2">
                          <div className="flex items-center gap-1.5">
                             <Target size={10} className="text-neutral-700" />
                             <span className="text-[8px] font-black text-neutral-500 uppercase">{bid.leadsPerDay} UNITS/DAY</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                             <Clock size={10} className="text-neutral-700" />
                             <span className="text-[8px] font-black text-neutral-500 uppercase">{new Date(bid.timestamp).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                    <div className="text-right shrink-0 w-full md:w-auto border-t md:border-t-0 md:border-l border-neutral-900 pt-4 md:pt-0 md:pl-6">
                       <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">DAILY_SETTLEMENT</span>
                       <span className="text-2xl font-tactical text-white italic tracking-tighter">${bid.totalDailyCost.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {userBids.length === 0 && <p className="text-center text-[10px] text-neutral-700 py-12 italic uppercase font-black">No Acquisition Protocols Active</p>}
              </div>
            </div>

          </div>
        </div>

        {/* HUD FOOTER */}
        <div className="p-8 bg-black/40 border-t-2 border-neutral-900 flex justify-end shrink-0">
          <div className="flex items-center gap-4">
             <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest italic max-w-[300px] text-right leading-relaxed">
               All identity audit transitions are signed via ECDSA-P256 and synchronized with the global ledger nodes.
             </span>
             <button 
              onClick={onClose}
              className="px-10 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl border-b-4 border-neutral-800 hover:bg-neutral-900 active:translate-y-1 active:border-b-0 transition-all"
             >
               TERMINATE_AUDIT
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminControlCenter: React.FC<AdminControlCenterProps> = ({ 
  leads, users, bids, walletActivities, onUpdateLead, onDeleteLead, onUpdateUser 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'leads' | 'users' | 'ledger'>('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserForAudit, setSelectedUserForAudit] = useState<User | null>(null);

  const stats = useMemo(() => ({
    marketCap: leads.reduce((acc, l) => acc + l.currentBid, 0),
    userNodes: users.length,
    activeLeads: leads.filter(l => l.status === 'approved').length
  }), [leads, users]);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (activeSubTab === 'leads') return leads.filter(l => l.title?.toLowerCase().includes(term) || l.category?.toLowerCase().includes(term));
    if (activeSubTab === 'users') return users.filter(u => u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term));
    return walletActivities.filter(wa => wa.provider?.toLowerCase().includes(term) || wa.userId?.toLowerCase().includes(term));
  }, [leads, users, walletActivities, activeSubTab, searchTerm]);

  const handleAuditUser = (user: User) => {
    soundService.playClick(true);
    setSelectedUserForAudit(user);
  };

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
                  <>
                    <button 
                      onClick={() => handleAuditUser(item)}
                      className="p-1.5 bg-neutral-900 border border-neutral-800 rounded-md text-neutral-600 hover:text-[#00e5ff] transition-all"
                      title="Identity Audit"
                    >
                      <Eye size={12} />
                    </button>
                    <button onClick={() => onUpdateUser(item.id, { status: item.status === 'active' ? 'restricted' : 'active' })} className={`px-2 py-0.5 rounded text-[7px] font-black uppercase tracking-widest border ${item.status === 'active' ? 'border-emerald-900/50 text-emerald-500 bg-emerald-500/5' : 'border-red-900/50 text-red-500 bg-red-500/5'}`}>
                      {item.status === 'active' ? 'AUTH' : 'ISO'}
                    </button>
                  </>
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

      {selectedUserForAudit && (
        <UserAuditHUD 
          user={selectedUserForAudit}
          userLeads={leads.filter(l => l.ownerId === selectedUserForAudit.id)}
          userBids={bids.filter(b => b.userId === selectedUserForAudit.id)}
          onClose={() => setSelectedUserForAudit(null)}
          onStatusToggle={() => {
            const updates = { status: selectedUserForAudit.status === 'active' ? 'restricted' : ('active' as any) };
            onUpdateUser(selectedUserForAudit.id, updates);
            setSelectedUserForAudit({ ...selectedUserForAudit, ...updates });
          }}
        />
      )}

    </div>
  );
};

export default AdminControlCenter;