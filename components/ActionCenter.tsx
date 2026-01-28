
import React, { useState, useMemo } from 'react';
import { PurchaseRequest, User, Lead, Notification, WalletActivity } from '../types.ts';
import { 
  Zap, 
  Activity, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Globe, 
  Target, 
  Database,
  RefreshCw,
  Cpu,
  FileText,
  Terminal,
  X,
  User as UserIcon,
  Search,
  Layers,
  Edit3,
  TrendingUp,
  Wallet,
  Loader2,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  Hash,
  ChevronRight,
  Monitor,
  Ban,
  Check
} from 'lucide-react';
import { soundService } from '../services/soundService.ts';
import { apiService } from '../services/apiService.ts';

interface ActionCenterProps {
  requests: PurchaseRequest[];
  user: User;
  leads: Lead[];
  allUsers?: User[];
  notifications: Notification[];
  walletActivities: WalletActivity[];
  onEditLead: (lead: Lead) => void;
  onWalletUpdate?: () => void;
}

const ActionCenter: React.FC<ActionCenterProps> = ({ 
  requests = [], 
  user, 
  leads = [], 
  allUsers = [], 
  notifications = [], 
  walletActivities = [], 
  onEditLead, 
  onWalletUpdate 
}) => {
  const isAdmin = user.role === 'admin';
  const [activeTab, setActiveTab] = useState<'acquisitions' | 'provisions' | 'wallets' | 'activity'>(
    isAdmin ? 'activity' : 'acquisitions'
  );
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [inspectingOrder, setInspectingOrder] = useState<{ req: PurchaseRequest, mode: 'manifest' | 'identity' } | null>(null);
  
  const [walletSearch, setWalletSearch] = useState('');
  const [adjustingUser, setAdjustingUser] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('100');
  const [isSyncingWallet, setIsSyncingWallet] = useState(false);
  const [isProcessingBid, setIsProcessingBid] = useState<string | null>(null);

  const visibleLeads = useMemo(() => {
    return isAdmin ? leads : leads.filter(l => l.ownerId === user.id);
  }, [leads, user.id, isAdmin]);

  const visibleRequests = useMemo(() => {
    return isAdmin ? requests : requests.filter(r => r.userId === user.id);
  }, [requests, user.id, isAdmin]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => 
      u.name.toLowerCase().includes(walletSearch.toLowerCase()) || 
      u.email.toLowerCase().includes(walletSearch.toLowerCase())
    );
  }, [allUsers, walletSearch]);

  const filteredRequests = useMemo(() => {
    if (activeFilter === 'all') return visibleRequests;
    return visibleRequests.filter(r => (r?.status || 'pending') === activeFilter);
  }, [visibleRequests, activeFilter]);

  const filteredLeads = useMemo(() => {
    if (activeFilter === 'all') return visibleLeads;
    return visibleLeads.filter(l => l.status === activeFilter);
  }, [visibleLeads, activeFilter]);

  const activityFeed = useMemo(() => {
    const rawNotifications = isAdmin ? notifications : notifications.filter(n => n.userId === user.id);
    const rawWallets = isAdmin ? walletActivities : walletActivities.filter(w => w.userId === user.id);

    const events = [
      ...rawNotifications.map(n => ({
        id: n.id,
        timestamp: n.timestamp,
        type: 'event',
        category: n.type,
        message: n.message,
        userId: n.userId
      })),
      ...rawWallets.map(w => ({
        id: w.id,
        timestamp: w.timestamp,
        type: 'financial',
        category: w.type,
        message: `${w.type.toUpperCase()} of $${w.amount.toLocaleString()} via ${w.provider}`,
        userId: w.userId
      }))
    ];

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, walletActivities, user.id, isAdmin]);

  const handleAdjustWallet = async (type: 'credit' | 'debit') => {
    if (!adjustingUser) return;
    const amount = parseFloat(adjustAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsSyncingWallet(true);
    soundService.playClick(true);
    
    try {
      const finalAmount = type === 'credit' ? amount : -amount;
      await apiService.deposit(adjustingUser.id, finalAmount, 'ADMIN_MANUAL_ADJUSTMENT');
      setAdjustingUser(null);
      if (onWalletUpdate) onWalletUpdate();
    } catch (error) {
      console.error("Wallet adjustment failed", error);
    } finally {
      setIsSyncingWallet(false);
    }
  };

  const handleUpdateBidStatus = async (bidId: string, status: 'approved' | 'rejected') => {
    setIsProcessingBid(bidId);
    soundService.playClick(true);
    try {
      await apiService.updateBidStatus(bidId, status);
      if (onWalletUpdate) onWalletUpdate();
    } catch (error) {
      console.error("Bid update failed", error);
    } finally {
      setIsProcessingBid(null);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return { label: 'AUTHORIZED', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: CheckCircle2 };
      case 'rejected':
        return { label: 'REVOKED', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: XCircle };
      default:
        return { label: 'SYNCING', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: RefreshCw };
    }
  };

  const safeUrl = (url?: string) => {
    if (!url) return '---';
    return url.replace(/^https?:\/\//, '');
  };

  const handleOpenHUD = (req: PurchaseRequest, mode: 'manifest' | 'identity') => {
    soundService.playClick(true);
    setInspectingOrder({ req, mode });
  };

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 font-clean max-w-[1400px] mx-auto px-1">
      
      {/* 1. HUD HEADER */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface border border-bright p-4 rounded-2xl shadow-xl transition-all">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white shrink-0">
               <Activity size={20} />
            </div>
            <div>
               <h2 className="text-lg font-futuristic text-white italic uppercase leading-none tracking-tight">ACTION_HUB</h2>
               <div className="flex items-center gap-2 mt-1">
                  <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest">ACTIVE_NODE:</span>
                  <span className="text-[7px] font-black text-accent uppercase tracking-widest">{user.role.toUpperCase()}_OVERRIDE</span>
               </div>
            </div>
         </div>

         <div className="flex bg-card p-0.5 rounded-lg border border-bright w-full sm:w-auto overflow-x-auto scrollbar-hide">
            <button onClick={() => { soundService.playClick(); setActiveTab('activity'); }} className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase whitespace-nowrap transition-all ${activeTab === 'activity' ? 'bg-white text-black shadow-lg' : 'text-neutral-500'}`}>Log</button>
            <button onClick={() => { soundService.playClick(); setActiveTab('acquisitions'); }} className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase whitespace-nowrap transition-all ${activeTab === 'acquisitions' ? 'bg-white text-black shadow-lg' : 'text-neutral-500'}`}>Bids</button>
            <button onClick={() => { soundService.playClick(); setActiveTab('provisions'); }} className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase whitespace-nowrap transition-all ${activeTab === 'provisions' ? 'bg-white text-black shadow-lg' : 'text-neutral-500'}`}>Assets</button>
            {isAdmin && <button onClick={() => { soundService.playClick(); setActiveTab('wallets'); }} className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase whitespace-nowrap transition-all ${activeTab === 'wallets' ? 'bg-red-600 text-white shadow-lg' : 'text-neutral-500'}`}>Vault</button>}
         </div>
      </div>

      {/* 2. MAIN VIEWPORT */}
      <div className="min-h-[600px]">
        {/* ACTIVITY LOG */}
        {activeTab === 'activity' && (
          <div className="bg-surface border border-bright rounded-2xl p-4 shadow-2xl animate-in slide-in-from-bottom-2 duration-500">
             <div className="flex items-center justify-between mb-4 border-b border-bright pb-3">
                <div className="flex items-center gap-2">
                   <Terminal size={14} className="text-accent" />
                   <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Global_Audit_Stream</h3>
                </div>
                <span className="text-[7px] font-mono text-neutral-600 uppercase">{activityFeed.length} ENTRIES_SYNCED</span>
             </div>

             <div className="space-y-0.5 max-h-[700px] overflow-y-auto pr-1 scrollbar-hide font-mono">
                {activityFeed.length === 0 ? (
                  <EmptyNodeState label="NODES_SILENT" />
                ) : (
                  activityFeed.map((event) => (
                    <div key={event.id} className="grid grid-cols-[80px_1fr_100px] items-center gap-4 py-1 px-3 hover:bg-white/[0.03] transition-colors group text-[9px] border-b border-white/[0.02]">
                       <span className="text-neutral-600 group-hover:text-neutral-400">{new Date(event.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</span>
                       <div className="flex items-center gap-2 truncate">
                          <span className={`px-1 py-0.5 rounded-[2px] text-[7px] font-black uppercase ${event.type === 'financial' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-accent/10 text-accent'}`}>{event.category}</span>
                          <span className="text-white/70 group-hover:text-white truncate uppercase italic">{event.message}</span>
                       </div>
                       <div className="text-right flex justify-end gap-2">
                          {isAdmin && <span className="text-[7px] text-neutral-700">UID_{event.userId.slice(-4)}</span>}
                          <Hash size={10} className="text-neutral-800 group-hover:text-accent" />
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}

        {/* ACQUISITIONS / BIDS (WITH ADMIN CONTROLS) */}
        {activeTab === 'acquisitions' && (
          <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-500">
             {filteredRequests.length === 0 ? (
                <EmptyNodeState label="NO_ACQUISITIONS_ACTIVE" />
             ) : (
                filteredRequests.map(req => {
                   const config = getStatusConfig(req?.status || 'pending');
                   const isLocalProcessing = isProcessingBid === req.id;
                   
                   return (
                     <div key={req.id} className={`bg-surface border ${config.border} rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 hover:bg-card transition-all group relative overflow-hidden ${req.status === 'pending' ? 'animate-pulse' : ''}`}>
                        <div className="flex items-center gap-4 flex-1 w-full">
                           <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${config.bg} ${config.color} shadow-inner`}>
                              {(req.status === 'pending' || isLocalProcessing) ? <RefreshCw size={20} className="animate-spin" /> : <config.icon size={20} />}
                           </div>
                           <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                 <h4 className="text-sm font-black text-white uppercase truncate italic">{req.leadTitle}</h4>
                                 <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${config.border} ${config.color}`}>{config.label}</span>
                              </div>
                              <p className="text-[9px] text-neutral-500 font-mono mt-1 truncate uppercase">Vector: {safeUrl(req.buyerTargetLeadUrl)}</p>
                              <p className="text-[7px] text-neutral-700 font-bold uppercase mt-0.5">UID_{req.userId.slice(-6)} // {req.userName}</p>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 px-8 border-x border-bright hidden md:grid">
                           <div className="text-center">
                              <span className="text-[7px] font-black text-neutral-600 uppercase block mb-1">DAILY_FLOW</span>
                              <span className="text-sm font-bold text-white italic font-tactical tracking-widest">{req.leadsPerDay} UNITS</span>
                           </div>
                           <div className="text-center">
                              <span className="text-[7px] font-black text-neutral-600 uppercase block mb-1">UNIT_SETTLE</span>
                              <span className="text-sm font-bold text-emerald-500 italic font-tactical tracking-widest">${req.bidAmount.toLocaleString()}</span>
                           </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 ml-auto md:ml-0">
                           {isAdmin && (req.status === 'pending' || !req.status) && (
                             <div className="flex gap-2 mr-4 border-r border-bright pr-4">
                                <button 
                                  onClick={() => handleUpdateBidStatus(req.id, 'approved')}
                                  disabled={isLocalProcessing}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20 active:scale-95"
                                >
                                   <Check size={14} /> APPROVE
                                </button>
                                <button 
                                  onClick={() => handleUpdateBidStatus(req.id, 'rejected')}
                                  disabled={isLocalProcessing}
                                  className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-red-900/20 active:scale-95"
                                >
                                   <Ban size={14} /> REVOKE
                                </button>
                             </div>
                           )}

                           {isAdmin && req.status === 'approved' && (
                              <button 
                                onClick={() => handleUpdateBidStatus(req.id, 'rejected')}
                                disabled={isLocalProcessing}
                                className="bg-neutral-900 hover:bg-red-900/40 text-neutral-500 hover:text-red-500 border border-neutral-800 px-4 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all flex items-center gap-2"
                              >
                                 <XCircle size={14} /> KILL_SYNC
                              </button>
                           )}

                           <div className="flex gap-2">
                             <button onClick={() => handleOpenHUD(req, 'manifest')} className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-600 hover:text-accent transition-all active:scale-90"><FileText size={16} /></button>
                             <button onClick={() => handleOpenHUD(req, 'identity')} className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-600 hover:text-accent transition-all active:scale-90"><Search size={16} /></button>
                           </div>
                        </div>
                     </div>
                   );
                })
             )}
          </div>
        )}

        {/* PROVISIONS / ASSETS */}
        {activeTab === 'provisions' && (
          <div className="space-y-2 animate-in slide-in-from-bottom-2 duration-500">
             {filteredLeads.length === 0 ? (
                <EmptyNodeState label="NO_ASSETS_PROVISIONED" />
             ) : (
                filteredLeads.map(lead => (
                  <div key={lead.id} className="bg-surface border border-bright rounded-xl p-3 flex flex-col md:flex-row items-center gap-4 hover:bg-card transition-all group">
                     <div className="flex items-center gap-4 flex-1 w-full">
                        <div className="w-12 h-12 bg-accent/5 rounded-xl flex items-center justify-center border border-accent/20 text-accent shrink-0">
                           <Layers size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                           <div className="flex items-center gap-2">
                              <h4 className="text-xs font-black text-white uppercase truncate italic">{lead.title}</h4>
                              <span className="text-[7px] font-black text-neutral-600 uppercase bg-black px-2 py-0.5 rounded border border-neutral-800">LB_{lead.id.slice(-4).toUpperCase()}</span>
                           </div>
                           <p className="text-[9px] text-neutral-500 font-mono mt-1 uppercase">{lead.category} // {lead.qualityScore}% TRUST_Q</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-8 px-6 border-x border-bright hidden md:grid">
                        <div className="text-center">
                           <span className="text-[7px] font-black text-neutral-600 uppercase block mb-1">OPS_VELOCITY</span>
                           <span className="text-sm font-bold text-white italic font-tactical tracking-widest">{lead.bidCount} BIDS</span>
                        </div>
                        <div className="text-center">
                           <span className="text-[7px] font-black text-neutral-600 uppercase block mb-1">MARKET_VAL</span>
                           <span className="text-sm font-bold text-emerald-500 italic font-tactical tracking-widest">${lead.currentBid.toLocaleString()}</span>
                        </div>
                     </div>

                     <div className="flex items-center gap-2 shrink-0 ml-auto md:ml-0">
                        <button onClick={() => onEditLead(lead)} className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 hover:text-accent transition-all text-[9px] font-black uppercase tracking-widest">
                           <Edit3 size={14} /> MOD_NODE
                        </button>
                     </div>
                  </div>
                ))
             )}
          </div>
        )}

        {/* VAULT CENTRAL */}
        {activeTab === 'wallets' && isAdmin && (
          <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-500">
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-accent" size={16} />
                <input 
                  type="text" 
                  placeholder="SEARCH_VAULT_NODES..." 
                  className="w-full bg-surface border border-bright rounded-2xl pl-12 pr-6 py-4 text-[10px] font-black uppercase tracking-widest text-white outline-none focus:border-accent/40"
                  value={walletSearch}
                  onChange={e => setWalletSearch(e.target.value)}
                />
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredUsers.map(u => (
                  <div key={u.id} className={`bg-surface border rounded-2xl p-5 transition-all ${adjustingUser?.id === u.id ? 'border-accent shadow-2xl shadow-accent/10 scale-105' : 'border-bright hover:border-accent/30'}`}>
                     <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-card border border-bright overflow-hidden flex items-center justify-center text-neutral-700 shrink-0 shadow-lg">
                           {u.profileImage ? <img src={u.profileImage} className="w-full h-full object-cover" /> : <UserIcon size={20} />}
                        </div>
                        <div className="min-w-0">
                           <h4 className="text-[11px] font-black text-white uppercase truncate italic">{u.name}</h4>
                           <p className="text-[8px] text-neutral-600 font-bold uppercase truncate">{u.email}</p>
                        </div>
                     </div>

                     <div className="bg-black/40 border border-neutral-800/60 rounded-xl p-4 flex justify-between items-center mb-6">
                        <span className="text-[8px] font-black text-neutral-700 uppercase">LIQUIDITY</span>
                        <span className="text-xl font-tactical font-black text-emerald-500 italic">${u.balance.toLocaleString()}</span>
                     </div>

                     {adjustingUser?.id === u.id ? (
                        <div className="space-y-3 animate-in zoom-in-95">
                           <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 font-tactical text-lg">$</span>
                              <input type="number" className="w-full bg-black border border-accent/40 rounded-xl pl-8 pr-4 py-3 text-lg font-tactical text-white outline-none" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} />
                           </div>
                           <div className="flex gap-2">
                              <button onClick={() => handleAdjustWallet('credit')} className="flex-1 bg-emerald-600 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-500 text-white">Credit</button>
                              <button onClick={() => handleAdjustWallet('debit')} className="flex-1 bg-red-600 py-3 rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-red-500 text-white">Debit</button>
                           </div>
                           <button onClick={() => setAdjustingUser(null)} className="w-full text-[8px] text-neutral-700 uppercase font-black tracking-widest py-2 hover:text-neutral-500">Abort Sync</button>
                        </div>
                     ) : (
                        <button onClick={() => setAdjustingUser(u)} className="w-full py-3 bg-neutral-900 hover:bg-accent/10 border border-neutral-800 rounded-xl text-[9px] font-black text-neutral-500 hover:text-accent uppercase transition-all active:scale-95">SYNC_PROTOCOL</button>
                     )}
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* 3. MODAL HUDs */}
      {inspectingOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-lg bg-surface border border-bright rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
              <div className="flex justify-between items-center p-6 border-b border-bright bg-surface/40">
                 <div className="flex items-center gap-4">
                    <Terminal size={18} className="text-accent" />
                    <h2 className="text-lg font-black text-white italic uppercase tracking-widest">DATA_PAYLOAD_HUD</h2>
                 </div>
                 <button onClick={() => setInspectingOrder(null)} className="p-2 hover:bg-red-500/10 rounded-xl transition-all"><X size={24} className="text-neutral-600 hover:text-white" /></button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="bg-black border border-bright p-6 rounded-2xl font-mono text-[10px] text-emerald-500/80 leading-relaxed whitespace-pre-wrap max-h-[450px] overflow-y-auto scrollbar-hide shadow-inner">
                    {JSON.stringify(inspectingOrder.req, null, 2)}
                 </div>
                 <button onClick={() => setInspectingOrder(null)} className="w-full py-5 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] italic shadow-xl transition-all hover:bg-accent active:scale-98">Close_Buffer</button>
              </div>
           </div>
        </div>
      )}

      {/* DISCLOSURE */}
      <div className="mt-12 p-6 bg-[#0f0f0f] border border-bright rounded-2xl flex items-start gap-6 opacity-40 hover:opacity-100 transition-all duration-500">
         <ShieldCheck size={20} className="text-neutral-700 shrink-0 mt-1" />
         <div className="space-y-1">
            <h5 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">IMMUTABLE_ACTION_LEDGER</h5>
            <p className="text-[9px] text-neutral-700 leading-relaxed uppercase font-medium italic tracking-tighter">
               STATE TRANSITIONS RECORDED TO ACTION HUB ARE BINDING AND SUBJECT TO BEHAVIORAL TELEMETRY ANALYSIS. UNAUTHORIZED NODES ATTEMPTING HANDSHAKE OVERRIDES WILL TRIGGER AUTOMATED INFRASTRUCTURE ISOLATION.
            </p>
         </div>
      </div>
    </div>
  );
};

const EmptyNodeState = ({ label }: { label: string }) => (
  <div className="py-24 text-center border-2 border-dashed border-bright rounded-3xl bg-surface/40">
    <Database className="text-neutral-800 mx-auto mb-6 opacity-40" size={48} />
    <p className="text-neutral-700 text-xs font-black uppercase tracking-[0.5em] italic">{label}</p>
  </div>
);

export default ActionCenter;
