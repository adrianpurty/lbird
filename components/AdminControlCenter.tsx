import React, { useState, useMemo, useRef } from 'react';
import { 
  ShieldAlert, Cpu, Activity, Database, Users, TrendingUp, 
  Search, Filter, ArrowRight, Gavel, Trash2, Edit3, 
  CheckCircle2, XCircle, DollarSign, History, Zap, 
  Layers, Lock, Unlock, Globe, RefreshCw, AlertTriangle, Eye, User as UserIcon, Calendar, Clock, Fingerprint, X,
  Target, ShieldCheck, Radar, BarChart3, Gauge, ArrowUpRight, ChevronLeft, ChevronRight, MapPin, ChevronUp, ChevronDown, Settings
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
        <div className="flex justify-between items-center p-6 bg-black/40 border-b-2 border-neutral-900 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/30 shadow-lg">
              <ShieldAlert className="text-red-500" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-futuristic font-black text-white italic uppercase tracking-tighter leading-none">IDENTITY_AUDIT_LOG</h2>
              <div className="flex items-center gap-3 mt-1.5">
                 <div className="flex items-center gap-1.5">
                    <Fingerprint size={10} className="text-emerald-500" />
                    <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest font-mono">NODE_UID: {user.id}</span>
                 </div>
                 <span className="w-1 h-1 bg-neutral-800 rounded-full" />
                 <span className={`text-[9px] font-black uppercase tracking-widest italic ${user.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`}>
                   STATE: {user.status?.toUpperCase() || 'UNKNOWN'}
                 </span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 bg-neutral-950 hover:bg-neutral-900 border-2 border-neutral-800 rounded-xl transition-all">
            <X size={20} className="text-neutral-500 hover:text-white" />
          </button>
        </div>

        {/* HUD CONTENT */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 scrollbar-hide">
          
          {/* LEFT COLUMN: CORE PROFILE & STATS */}
          <div className="lg:col-span-4 space-y-5">
            <div className="bg-[#0c0c0c] border border-neutral-800 rounded-[2rem] p-6 space-y-6 relative overflow-hidden group">
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-2xl border-2 border-neutral-800 bg-neutral-900 mb-3 overflow-hidden">
                  {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : <UserIcon size={40} className="m-auto h-full text-neutral-700" />}
                </div>
                <h3 className="text-xl font-futuristic font-black text-white italic uppercase tracking-tight">{user.name}</h3>
                <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-[0.2em] mt-1 font-mono">{user.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/40 border border-neutral-800/40 p-3 rounded-xl">
                  <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-1">LIQUIDITY</span>
                  <span className="text-xl font-tactical text-emerald-500 italic tracking-widest leading-none">${user.balance.toLocaleString()}</span>
                </div>
                <div className="bg-black/40 border border-neutral-800/40 p-3 rounded-xl">
                  <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-1">CUMULATIVE_SPEND</span>
                  <span className="text-xl font-tactical text-neutral-400 italic tracking-widest leading-none">${(user.totalSpend || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[8px] font-black text-neutral-700 uppercase tracking-widest border-b border-neutral-900 pb-1.5">
                   <span>AUTHENTICATION_LEVEL</span>
                   <span className="text-white font-futuristic italic">{user.role?.toUpperCase() || 'USER'}</span>
                </div>
                <div className="flex justify-between items-center text-[8px] font-black text-neutral-700 uppercase tracking-widest border-b border-neutral-900 pb-1.5">
                   <span>LAST_HEARTBEAT</span>
                   <span className="text-white font-mono">{user.last_active_at ? new Date(user.last_active_at).toLocaleTimeString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center text-[8px] font-black text-neutral-700 uppercase tracking-widest border-b border-neutral-900 pb-1.5">
                   <span>LOCATION_NODE</span>
                   <span className="text-white font-futuristic italic">{user.location || 'RESTRICTED'}</span>
                </div>
              </div>

              <button 
                onClick={onStatusToggle}
                className={`w-full py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all border-b-4 italic ${
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
          <div className="lg:col-span-8 space-y-6">
            
            {/* OWNED ASSETS */}
            <div className="bg-[#0c0c0c] border border-neutral-800 rounded-[2rem] p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <div className="flex items-center gap-2">
                   <Layers size={14} className="text-[#00e5ff]" />
                   <h4 className="text-[9px] font-futuristic font-black text-white uppercase tracking-[0.2em]">PROVISIONED_ASSETS ({userLeads.length})</h4>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-2 scrollbar-hide">
                {userLeads.map(lead => (
                  <div key={lead.id} className="bg-black/40 border border-neutral-800 rounded-lg p-3 flex items-center justify-between group hover:border-[#00e5ff]/40 transition-all">
                    <div className="min-w-0">
                      <p className="text-[10px] font-futuristic font-black text-white truncate uppercase italic tracking-wider">{lead.title}</p>
                      <p className="text-[7px] text-neutral-600 font-bold uppercase mt-0.5 tracking-widest">{lead.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-tactical font-black text-white italic tracking-widest">${lead.currentBid}</span>
                    </div>
                  </div>
                ))}
                {userLeads.length === 0 && <p className="col-span-full text-center text-[9px] text-neutral-700 py-6 italic uppercase font-black tracking-widest">No Provisioned Nodes Detected</p>}
              </div>
            </div>

            {/* BIDDING LOG */}
            <div className="bg-[#0c0c0c] border border-neutral-800 rounded-[2rem] p-5 space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
                <div className="flex items-center gap-2">
                   <Activity size={14} className="text-amber-400" />
                   <h4 className="text-[9px] font-futuristic font-black text-white uppercase tracking-[0.2em]">ACQUISITION_HISTORY ({userBids.length})</h4>
                </div>
              </div>
              <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-2 scrollbar-hide">
                {userBids.map(bid => (
                  <div key={bid.id} className="bg-black/40 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row items-center gap-5 group hover:bg-amber-400/[0.02] transition-all">
                    <div className="flex-1 min-w-0 w-full">
                       <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[7px] font-mono text-neutral-700 tracking-widest">ORD_{bid.id?.slice(-4).toUpperCase() || '---'}</span>
                          <span className={`text-[7px] font-black uppercase px-1.5 py-0.5 rounded border tracking-widest ${
                            bid.status === 'approved' ? 'border-emerald-900/40 text-emerald-500 bg-emerald-500/5' : 'border-neutral-800 text-neutral-600'
                          }`}>
                            {bid.status}
                          </span>
                       </div>
                       <h5 className="text-[11px] font-futuristic font-black text-white italic uppercase truncate tracking-wide">{bid.leadTitle}</h5>
                       <div className="flex items-center gap-4 mt-1.5">
                          <div className="flex items-center gap-1.5">
                             <Target size={9} className="text-neutral-700" />
                             <span className="text-[7px] font-black text-neutral-500 uppercase tracking-widest">{bid.leadsPerDay} UNITS/DAY</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                             <Clock size={9} className="text-neutral-700" />
                             <span className="text-[7px] font-black text-neutral-500 uppercase tracking-widest font-mono">{new Date(bid.timestamp).toLocaleDateString()}</span>
                          </div>
                       </div>
                    </div>
                    <div className="text-right shrink-0 w-full md:w-auto border-t md:border-t-0 md:border-l border-neutral-900 pt-3 md:pt-0 md:pl-5">
                       <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-1">DAILY_SETTLEMENT</span>
                       <span className="text-2xl font-tactical text-white italic tracking-tighter leading-none">${bid.totalDailyCost.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {userBids.length === 0 && <p className="text-center text-[9px] text-neutral-700 py-10 italic uppercase font-black tracking-widest">No Acquisition Protocols Active</p>}
              </div>
            </div>

          </div>
        </div>

        {/* HUD FOOTER */}
        <div className="p-6 bg-black/40 border-t-2 border-neutral-900 flex justify-end shrink-0">
          <div className="flex items-center gap-4">
             <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest italic max-w-[260px] text-right leading-relaxed font-rajdhani">
               All identity audit transitions are signed via ECDSA-P256 and synchronized with the global ledger nodes.
             </span>
             <button 
              onClick={onClose}
              className="px-8 py-3 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl border-b-4 border-neutral-800 hover:bg-neutral-900 active:translate-y-0.5 active:border-b-0 transition-all font-futuristic italic"
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
  const [activeSubTab, setActiveSubTab] = useState<'leads' | 'users' | 'user-mgmt' | 'ledger'>('leads');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserForAudit, setSelectedUserForAudit] = useState<User | null>(null);
  const [adjustingUser, setAdjustingUser] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof User; direction: 'asc' | 'desc' } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const stats = useMemo(() => ({
    marketCap: leads.reduce((acc, l) => acc + l.currentBid, 0),
    userNodes: users.length,
    activeLeads: leads.filter(l => l.status === 'approved').length
  }), [leads, users]);

  const sortedUsers = useMemo(() => {
    let result = [...users];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(u => u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term) || u.id.toLowerCase().includes(term));
    }
    if (sortConfig) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key] || '';
        const valB = b[sortConfig.key] || '';
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [users, searchTerm, sortConfig]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedUsers.slice(start, start + itemsPerPage);
  }, [sortedUsers, currentPage]);

  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);

  const filteredData = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (activeSubTab === 'leads') return leads.filter(l => l.title?.toLowerCase().includes(term) || l.category?.toLowerCase().includes(term));
    if (activeSubTab === 'users') return users.filter(u => u.name?.toLowerCase().includes(term) || u.email?.toLowerCase().includes(term));
    if (activeSubTab === 'user-mgmt') return paginatedUsers;
    return walletActivities.filter(wa => wa.provider?.toLowerCase().includes(term) || wa.userId?.toLowerCase().includes(term));
  }, [leads, users, paginatedUsers, walletActivities, activeSubTab, searchTerm]);

  const handleAuditUser = (user: User) => {
    soundService.playClick(true);
    setSelectedUserForAudit(user);
  };

  const scrollSlider = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({ 
        left: direction === 'left' ? -scrollAmount : scrollAmount, 
        behavior: 'smooth' 
      });
      soundService.playClick();
    }
  };

  const handleSort = (key: keyof User) => {
    soundService.playClick();
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleAdjustBalance = async () => {
    if (!adjustingUser || !adjustAmount) return;
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount)) return;

    soundService.playClick(true);
    onUpdateUser(adjustingUser.id, { balance: amount });
    setAdjustingUser(null);
    setAdjustAmount('');
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8 pb-32 animate-in fade-in duration-700 font-rajdhani">
      
      {/* HERO HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-5 border-b border-neutral-900/60 pb-8">
        <div className="space-y-4">
          <h1 className="text-2xl sm:text-4xl font-futuristic italic font-black uppercase tracking-tighter">
            CONTROL <span className="text-transparent" style={{ WebkitTextStroke: '1.5px #ffffff', opacity: 0.3 }}>CENTER</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-red-500/10 border border-red-500/40 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.1)]">
              <span className="text-[9px] font-black text-red-500 uppercase tracking-[0.2em] italic font-futuristic">ROOT_ACCESS_LEVEL_1</span>
            </div>
            <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-[0.3em] italic">ADMIN_TUNNEL_ACTIVE // {stats.userNodes} USER_NODES</span>
          </div>
        </div>

        <div className="bg-[#0c0c0c] border-2 border-neutral-800 p-3 md:p-5 rounded-[1.5rem] flex items-center gap-5 shadow-2xl group hover:border-red-500/30 transition-all cursor-default">
          <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 shrink-0 group-hover:scale-110 transition-transform">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest block mb-0.5">SYSTEM_STABILITY_INDEX</span>
            <span className="text-2xl font-tactical text-white tracking-widest leading-none italic">99.82%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: PRIMARY FEED (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* SEARCH & FILTER HUD */}
          <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-[2rem] p-5 flex flex-col md:flex-row items-center gap-5 shadow-xl relative overflow-hidden">
             <div className="absolute left-0 top-0 w-1 h-full bg-red-500/40" />
             
             <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={14} />
                <input 
                  type="text"
                  placeholder={`SEARCH_${activeSubTab.replace('-','_').toUpperCase()}_LOGS...`}
                  className="w-full bg-black border border-neutral-800 rounded-lg pl-10 pr-4 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-white outline-none focus:border-red-500/40 transition-all font-mono"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>

             <div className="flex bg-neutral-900/50 p-1 rounded-lg border border-neutral-800 shrink-0">
                {['leads', 'users', 'user-mgmt', 'ledger'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => { 
                      soundService.playClick(); 
                      setActiveSubTab(tab as any); 
                      if(tab === 'user-mgmt') setCurrentPage(1);
                    }}
                    className={`px-5 py-1.5 rounded-md text-[8px] font-black uppercase tracking-widest transition-all italic font-futuristic ${activeSubTab === tab ? 'bg-white text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                  >
                    {tab.replace('-', ' ')}
                  </button>
                ))}
             </div>
          </div>

          {/* MAIN DATA FEED CARD CONTAINER */}
          <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group min-h-[500px]">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <Layers size={100} />
            </div>

            <div className="flex items-center justify-between mb-6 px-1">
               <div className="flex items-center gap-3">
                  <div className="w-1.5 h-5 bg-red-500 rounded-full shadow-[0_0_10px_#ef4444]" />
                  <h3 className="text-xs font-futuristic font-black text-white italic uppercase tracking-[0.3em]">{activeSubTab.replace('-','_').toUpperCase()}_REGISTRY_VIEW</h3>
                  <span className="text-[7px] font-mono text-neutral-700 uppercase tracking-widest ml-4">SEQ_A_0041</span>
               </div>
               
               {activeSubTab === 'leads' && filteredData.length > 0 && (
                 <div className="flex items-center gap-2">
                    <button onClick={() => scrollSlider('left')} className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-500 hover:text-white transition-all">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => scrollSlider('right')} className="p-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-neutral-500 hover:text-white transition-all">
                      <ChevronRight size={16} />
                    </button>
                 </div>
               )}
            </div>

            {/* TAB CONTENT */}
            {activeSubTab === 'leads' ? (
              <div ref={scrollContainerRef} className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 relative z-10 -mx-1 px-1">
                {filteredData.map((item: any) => (
                  <div key={item.id} className="snap-center shrink-0 w-[300px] md:w-[380px] group/card relative bg-black/40 border-2 border-neutral-800/60 rounded-[2.5rem] p-6 transition-all duration-500 hover:bg-white/[0.02] hover:border-red-500/20 scanline-effect overflow-hidden flex flex-col gap-6">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600 group-hover/card:text-red-500 transition-colors">
                        <Zap size={24} />
                      </div>
                      <div className="text-right">
                         <span className="text-[7px] font-mono text-neutral-700 tracking-widest block mb-1">NODE_ID: #{item.id?.slice(-6).toUpperCase()}</span>
                         <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${item.status === 'approved' ? 'border-emerald-900/40 text-emerald-500 bg-emerald-500/5' : 'border-red-900/40 text-red-500 bg-red-500/5'}`}>{item.status}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-futuristic font-black text-white italic truncate uppercase tracking-wide group-hover/card:text-red-400 transition-colors">{item.title}</h4>
                      <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-[0.2em] font-mono">{item.category}</p>
                    </div>
                    <div className="bg-black/40 border border-neutral-800/40 rounded-2xl p-4 grid grid-cols-2 gap-4">
                       <div><span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-1">BID_FLOOR</span><span className="text-xl font-tactical text-white italic tracking-widest leading-none">${item.currentBid}</span></div>
                       <div className="text-right border-l border-neutral-900 pl-4"><span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-1">INTEGRITY</span><span className="text-xl font-tactical text-emerald-500 italic tracking-widest leading-none">{item.qualityScore}%</span></div>
                    </div>
                    <div className="space-y-3 flex-1">
                       <div className="space-y-1"><span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block flex items-center gap-1.5"><Globe size={10} /> Origin_URI</span><p className="text-[9px] font-mono text-neutral-500 truncate bg-neutral-950 px-2 py-1 rounded border border-neutral-900">{item.businessUrl}</p></div>
                       <div className="space-y-1"><span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block flex items-center gap-1.5"><Target size={10} /> Delivery_Node</span><p className="text-[9px] font-mono text-neutral-500 truncate bg-neutral-950 px-2 py-1 rounded border border-neutral-900">{item.targetLeadUrl}</p></div>
                    </div>
                    <div className="flex gap-3 pt-4 border-t border-neutral-900">
                      <button onClick={() => onUpdateLead(item)} className="flex-1 bg-white text-black py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:bg-neutral-200 active:scale-95 flex items-center justify-center gap-2 italic"><Edit3 size={14} /> MODIFY_ASSET</button>
                      <button onClick={() => onDeleteLead(item.id)} className="p-2.5 bg-neutral-950 border border-neutral-800 rounded-xl text-neutral-600 hover:text-red-500 transition-all active:scale-95"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : activeSubTab === 'user-mgmt' ? (
              <div className="space-y-4 animate-in fade-in duration-500 relative z-10">
                <div className="overflow-x-auto border border-neutral-800/40 rounded-2xl bg-black/20">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="border-b border-neutral-800 bg-neutral-900/40">
                        {(['id', 'name', 'email', 'role', 'status', 'balance', 'last_active_at'] as const).map(key => (
                          <th key={key} onClick={() => handleSort(key as any)} className="p-4 text-[9px] font-black text-neutral-500 uppercase tracking-widest cursor-pointer hover:text-white transition-colors group">
                            <div className="flex items-center gap-2">
                              {key.replace(/_/g, ' ')}
                              <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronUp size={8} className={sortConfig?.key === key && sortConfig.direction === 'asc' ? 'text-red-500' : ''} />
                                <ChevronDown size={8} className={sortConfig?.key === key && sortConfig.direction === 'desc' ? 'text-red-500' : ''} />
                              </div>
                            </div>
                          </th>
                        ))}
                        <th className="p-4 text-[9px] font-black text-neutral-500 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-900">
                      {filteredData.map((u: any) => (
                        <tr key={u.id} className="hover:bg-white/[0.02] transition-colors group/row">
                          <td className="p-4 text-[9px] font-mono text-neutral-600 truncate max-w-[100px]">#{u.id.slice(-6).toUpperCase()}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-lg border border-neutral-800 bg-neutral-900 overflow-hidden flex items-center justify-center text-neutral-700">
                                {u.profileImage ? <img src={u.profileImage} className="w-full h-full object-cover" /> : <UserIcon size={14} />}
                              </div>
                              <span className="text-[11px] font-futuristic font-black text-white italic uppercase tracking-wider">{u.name}</span>
                            </div>
                          </td>
                          <td className="p-4 text-[10px] text-neutral-500 font-bold font-mono">{u.email}</td>
                          <td className="p-4">
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${u.role === 'admin' ? 'border-red-900/40 text-red-500 bg-red-500/5' : 'border-neutral-800 text-neutral-600'}`}>{u.role}</span>
                          </td>
                          <td className="p-4">
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border tracking-widest ${u.status === 'active' ? 'border-emerald-900/40 text-emerald-500 bg-emerald-500/5' : 'border-red-900/40 text-red-500 bg-red-500/5'}`}>{u.status}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-xl font-tactical text-emerald-500 italic tracking-widest">${u.balance?.toLocaleString()}</span>
                          </td>
                          <td className="p-4 text-[9px] text-neutral-600 font-mono italic">
                            {u.last_active_at ? new Date(u.last_active_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'N/A'}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => { soundService.playClick(); setAdjustingUser(u); setAdjustAmount(u.balance.toString()); }} className="p-2 bg-neutral-900 hover:bg-emerald-500/10 border border-neutral-800 rounded-lg text-neutral-600 hover:text-emerald-500 transition-all" title="Adjust Balance"><DollarSign size={14} /></button>
                              <button onClick={() => onUpdateUser(u.id, { status: u.status === 'active' ? 'restricted' : 'active' })} className={`p-2 rounded-lg border transition-all ${u.status === 'active' ? 'bg-neutral-900 border-neutral-800 text-neutral-600 hover:text-red-500 hover:border-red-900/40' : 'bg-emerald-600 border-emerald-800 text-white hover:bg-emerald-500'}`} title={u.status === 'active' ? 'Restrict User' : 'Activate User'}>
                                {u.status === 'active' ? <Lock size={14} /> : <Unlock size={14} />}
                              </button>
                              <button onClick={() => handleAuditUser(u)} className="p-2 bg-neutral-900 hover:bg-white text-neutral-600 hover:text-black border border-neutral-800 rounded-lg transition-all"><Eye size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION HUD */}
                <div className="flex items-center justify-between bg-neutral-900/40 p-4 rounded-2xl border border-neutral-800/60">
                   <div className="flex items-center gap-4">
                      <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Page {currentPage} of {totalPages}</span>
                      <div className="h-4 w-px bg-neutral-800" />
                      <span className="text-[9px] font-black text-neutral-700 uppercase tracking-widest">{sortedUsers.length} Nodes Indexed</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <button disabled={currentPage === 1} onClick={() => { soundService.playClick(); setCurrentPage(p => Math.max(1, p - 1)); }} className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-600 hover:text-white disabled:opacity-20 transition-all"><ChevronLeft size={16} /></button>
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <button key={i} onClick={() => { soundService.playClick(); setCurrentPage(i + 1); }} className={`w-8 h-8 rounded-lg text-[10px] font-black uppercase transition-all ${currentPage === i + 1 ? 'bg-white text-black' : 'bg-neutral-950 text-neutral-600 hover:bg-neutral-900'}`}>{i + 1}</button>
                        ))}
                      </div>
                      <button disabled={currentPage === totalPages} onClick={() => { soundService.playClick(); setCurrentPage(p => Math.min(totalPages, p + 1)); }} className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-600 hover:text-white disabled:opacity-20 transition-all"><ChevronRight size={16} /></button>
                   </div>
                </div>
              </div>
            ) : (
              /* STANDARD VERTICAL LIST FOR OTHER TABS */
              <div className="grid grid-cols-1 gap-3 relative z-10">
                {filteredData.length > 0 ? (
                  filteredData.map((item: any) => (
                    <div key={item.id} className="group/card relative bg-black/40 border border-neutral-800/60 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-5 transition-all hover:bg-white/[0.02] hover:border-red-500/20 scanline-effect overflow-hidden">
                      <div className="flex items-center gap-4 min-w-0 w-full md:w-auto">
                        <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-600 group-hover/card:text-red-500 transition-colors shrink-0">
                          {activeSubTab === 'users' ? <Users size={20} /> : <History size={20} />}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                             <span className="text-[7px] font-mono text-neutral-700 tracking-widest">#{item.id?.slice(-6).toUpperCase()}</span>
                             {item.status && (
                               <span className={`text-[6px] font-black uppercase px-1 py-0.5 rounded border tracking-widest ${item.status === 'active' || item.status === 'approved' ? 'border-emerald-900/40 text-emerald-500 bg-emerald-500/5' : 'border-red-900/40 text-red-500 bg-red-500/5'}`}>{item.status}</span>
                             )}
                          </div>
                          <h4 className="text-sm font-futuristic font-black text-white italic truncate uppercase leading-none group-hover/card:text-red-400 transition-colors tracking-wide">{item.name || item.provider}</h4>
                          <p className="text-[8px] text-neutral-500 font-bold uppercase tracking-[0.2em] mt-1.5 truncate max-w-[200px] font-mono">{item.email || item.timestamp}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 md:border-l border-neutral-900/50 pt-3 md:pt-0 md:pl-6">
                         {activeSubTab === 'users' && (
                           <div className="text-right">
                             <span className="text-[6px] font-black text-neutral-700 uppercase tracking-widest block mb-0.5">WALLET_SYNC</span>
                             <span className="text-2xl font-tactical text-emerald-500 italic tracking-widest leading-none">${item.balance?.toLocaleString()}</span>
                           </div>
                         )}
                         {activeSubTab === 'ledger' && (
                           <div className="text-right">
                             <span className="text-[6px] font-black text-neutral-700 uppercase tracking-widest block mb-0.5">FLOW_AMT</span>
                             <span className={`text-2xl font-tactical italic tracking-widest leading-none ${item.type === 'deposit' ? 'text-emerald-500' : 'text-red-400'}`}>{item.type === 'deposit' ? '+' : '-'} ${item.amount}</span>
                           </div>
                         )}
                         <div className="flex gap-2">
                           {activeSubTab === 'users' && (
                             <>
                               <button onClick={() => handleAuditUser(item)} className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-600 hover:text-cyan-400 transition-all"><Eye size={14} /></button>
                               <button onClick={() => onUpdateUser(item.id, { status: item.status === 'active' ? 'restricted' : 'active' })} className={`px-3 py-2 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border transition-all italic font-futuristic ${item.status === 'active' ? 'bg-emerald-600 text-white border-emerald-800' : 'bg-red-700 text-white border-red-900'}`}>{item.status === 'active' ? 'AUTHORIZE' : 'ISOLATE'}</button>
                             </>
                           )}
                           {activeSubTab === 'ledger' && (
                              <button className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-600 hover:text-white transition-all"><RefreshCw size={14} /></button>
                           )}
                         </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-24 text-center opacity-20"><Radar size={64} className="mx-auto text-neutral-700 mb-5 animate-spin-slow" strokeWidth={1} /><h4 className="text-neutral-500 font-futuristic text-lg uppercase tracking-[0.4em] italic">NO_DATA_SYNCED</h4></div>
                )}
              </div>
            )}
          </div>

          {/* VALUATION ROW */}
          <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500/50" />
            <div className="space-y-2">
              <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1.5 flex items-center gap-2.5 italic font-futuristic"><TrendingUp size={14} className="text-red-500" /> AGGREGATE_MARKET_CAPITALIZATION</span>
              <div className="text-3xl font-black text-white italic font-tactical tracking-widest px-1.5 leading-none"><span className="text-neutral-700 mr-1.5">$</span>{stats.marketCap.toLocaleString()}</div>
            </div>
            <div className="flex-1 flex items-center justify-center border-2 border-neutral-900 border-dashed rounded-[1.5rem] p-6 group cursor-pointer hover:border-red-500/20 transition-colors">
              <div className="flex items-center gap-3 text-neutral-700 group-hover:text-neutral-500 transition-colors"><BarChart3 size={16} /><span className="text-[10px] font-black uppercase tracking-[0.4em] font-futuristic italic">EXECUTE_SYSTEM_AUDIT</span></div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DIAGNOSTICS */}
        <div className="lg:col-span-4 space-y-6 h-full">
          <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-[2.5rem] p-8 h-full flex flex-col shadow-2xl relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-10">
               <Cpu size={16} className="text-red-500" />
               <h3 className="text-xs font-futuristic font-black text-white italic uppercase tracking-[0.3em]">SYSTEM_DIAGNOSTICS</h3>
               <div className="ml-auto w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
            </div>

            <div className="flex-1 space-y-10 py-6">
               <div className="relative flex flex-col items-center justify-center text-center">
                  <div className="absolute inset-0 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
                  <div className="w-40 h-40 rounded-full border-4 border-neutral-900 border-t-red-500 animate-spin-slow relative flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border border-neutral-800 border-dashed flex flex-col items-center justify-center">
                       <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mb-0.5 italic">HEALTH</span>
                       <span className="text-4xl font-tactical text-emerald-500 font-black italic leading-none">99.8%</span>
                       <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest mt-1 italic">NODES_STABLE</span>
                    </div>
                  </div>
               </div>

               <div className="space-y-5">
                 <div className="space-y-2.5">
                   <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-0.5 italic">THROUGHPUT_DISTRIBUTION</span>
                   <div className="space-y-2.5">
                      <div className="space-y-1">
                         <div className="flex justify-between text-[8px] font-black text-neutral-500 uppercase tracking-widest font-futuristic italic"><span>Market Liquidity</span><span>{Math.round((stats.marketCap / 1000000) * 100)}%</span></div>
                         <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden"><div className="h-full bg-emerald-500/40 transition-all duration-1000" style={{ width: `${Math.round((stats.marketCap / 1000000) * 100)}%` }} /></div>
                      </div>
                      <div className="space-y-1">
                         <div className="flex justify-between text-[8px] font-black text-neutral-500 uppercase tracking-widest font-futuristic italic"><span>Asset Density</span><span>{Math.min(100, stats.activeLeads * 5)}%</span></div>
                         <div className="h-1 w-full bg-neutral-900 rounded-full overflow-hidden"><div className="h-full bg-cyan-500/40 transition-all duration-1000" style={{ width: `${Math.min(100, stats.activeLeads * 5)}%` }} /></div>
                      </div>
                   </div>
                 </div>
               </div>
            </div>

            <div className="space-y-8 mt-auto">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2"><span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-0.5 italic">FIREWALL_STATE</span><div className="bg-black/60 border border-neutral-800 p-3 rounded-lg flex items-center gap-2"><ShieldCheck size={10} className="text-emerald-500" /><span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest italic font-futuristic">ACTIVE</span></div></div>
                <div className="space-y-2"><span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-0.5 italic">LEDGER_SYNC</span><div className="bg-black/60 border border-neutral-800 p-3 rounded-lg text-center"><span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest font-mono">0ms_LATENCY</span></div></div>
              </div>
              <button onClick={() => { soundService.playClick(); }} className="w-full bg-white text-black rounded-[1.5rem] py-6 md:py-8 flex flex-col items-center justify-center gap-3 transition-all group/btn border-b-[10px] border-neutral-300 shadow-2xl hover:bg-neutral-100 active:translate-y-0.5 active:border-b-4 overflow-hidden relative">
                <div className="flex items-center gap-5 relative z-10"><span className="text-xl font-black italic tracking-widest uppercase font-tactical">BROADCAST_SYSTEM_UPDATE</span><ArrowUpRight size={24} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" /></div>
                <div className="absolute inset-0 bg-red-500/5 opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DISCLOSURE FOOTER */}
      <div className="bg-[#0f0f0f] border-2 border-neutral-900 p-6 rounded-[2.5rem] shadow-xl flex items-start gap-6 max-w-4xl mx-auto group hover:border-red-500/20 transition-all">
        <div className="w-10 h-10 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500 shrink-0 group-hover:scale-110 transition-transform"><ShieldAlert size={20} /></div>
        <div>
           <h4 className="text-xs font-futuristic font-black text-white italic uppercase tracking-[0.3em] mb-2">ADMINISTRATIVE_OVERSIGHT_PROTOCOL</h4>
           <p className="text-[9px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter font-rajdhani">System synchronization is live. Any state transition (isolation, authorization, or ledger correction) is permanently indexed in the immutable global administrative audit trail and cross-verified by root-level watchdog nodes.</p>
        </div>
      </div>

      {/* BALANCE ADJUSTMENT PROMPT */}
      {adjustingUser && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-md bg-[#0c0c0c] border-2 border-neutral-800 rounded-[2.5rem] shadow-2xl p-8 space-y-8 animate-in zoom-in-95 duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none"><Database size={100} /></div>
              <div className="flex justify-between items-center relative z-10">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shadow-glow-sm"><DollarSign size={20} /></div>
                    <h3 className="text-xl font-futuristic font-black text-white italic uppercase tracking-tighter">LIQUIDITY_OVERRIDE</h3>
                 </div>
                 <button onClick={() => setAdjustingUser(null)} className="p-2 hover:bg-neutral-900 rounded-lg text-neutral-500 hover:text-white transition-all"><X size={20} /></button>
              </div>
              <div className="bg-black/60 border border-neutral-800 p-4 rounded-xl space-y-2 relative z-10">
                 <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block">TARGET_NODE</span>
                 <p className="text-xs font-black text-white uppercase italic">{adjustingUser.name}</p>
                 <p className="text-[9px] text-neutral-600 font-mono italic">{adjustingUser.id}</p>
              </div>
              <div className="space-y-4 relative z-10">
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-neutral-700 uppercase tracking-widest px-1 italic">NEW_VAULT_BALANCE ($)</label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 font-tactical text-xl">$</span>
                       <input 
                         type="number" 
                         className="w-full bg-black border-2 border-neutral-800 rounded-xl pl-10 pr-4 py-4 text-2xl font-tactical text-white outline-none focus:border-[#00e5ff]/40 transition-all"
                         value={adjustAmount}
                         onChange={e => setAdjustAmount(e.target.value)}
                         autoFocus
                       />
                    </div>
                 </div>
                 <button 
                   onClick={handleAdjustBalance}
                   className="w-full py-4 bg-white text-black rounded-2xl font-black text-sm uppercase italic tracking-[0.2em] transition-all border-b-4 border-neutral-300 active:translate-y-0.5 active:border-b-0 flex items-center justify-center gap-3"
                 >
                   <ShieldCheck size={18} /> AUTHORIZE_CHANGE
                 </button>
                 <p className="text-[8px] text-center text-neutral-600 uppercase tracking-widest font-rajdhani">This action bypasses standard deposit protocols and is logged in the aggregate ledger.</p>
              </div>
           </div>
        </div>
      )}

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

      <style>{`
        .animate-spin-slow {
          animation: spin 15s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .scanline-effect::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%);
          height: 50%;
          width: 100%;
          animation: scanline 4s linear infinite;
          pointer-events: none;
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
      `}</style>

    </div>
  );
};

export default AdminControlCenter;