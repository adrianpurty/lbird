
import React, { useState, useMemo } from 'react';
import { PurchaseRequest, User, Lead } from '../types.ts';
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
  ArrowRight,
  RefreshCw,
  Cpu,
  Filter,
  FileText,
  Terminal,
  X,
  Fingerprint,
  User as UserIcon,
  Server,
  Link as LinkIcon,
  Search,
  Calendar,
  Layers,
  Edit3,
  Eye,
  TrendingUp,
  BarChart3,
  Wallet,
  Plus,
  Minus,
  AlertTriangle,
  Loader2,
  // Fix: Added missing ShieldAlert icon import
  ShieldAlert
} from 'lucide-react';
import { soundService } from '../services/soundService.ts';
import { apiService } from '../services/apiService.ts';

interface ActionCenterProps {
  requests: PurchaseRequest[];
  user: User;
  leads: Lead[];
  allUsers?: User[];
  onEditLead: (lead: Lead) => void;
  onWalletUpdate?: () => void;
}

const ActionCenter: React.FC<ActionCenterProps> = ({ requests = [], user, leads = [], allUsers = [], onEditLead, onWalletUpdate }) => {
  const isAdmin = user.role === 'admin';
  const [activeTab, setActiveTab] = useState<'acquisitions' | 'provisions' | 'wallets'>(
    isAdmin ? 'wallets' : 'acquisitions'
  );
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [inspectingOrder, setInspectingOrder] = useState<{ req: PurchaseRequest, mode: 'manifest' | 'identity' } | null>(null);
  
  // Wallet Control State
  const [walletSearch, setWalletSearch] = useState('');
  const [adjustingUser, setAdjustingUser] = useState<User | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('100');
  const [isSyncingWallet, setIsSyncingWallet] = useState(false);

  // Filter leads submitted by the user
  const myLeads = useMemo(() => leads.filter(l => l.ownerId === user.id), [leads, user.id]);

  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => 
      u.name.toLowerCase().includes(walletSearch.toLowerCase()) || 
      u.email.toLowerCase().includes(walletSearch.toLowerCase())
    );
  }, [allUsers, walletSearch]);

  const stats = useMemo(() => {
    const approved = requests.filter(r => r?.status === 'approved');
    const totalDailyLoad = approved.reduce((acc, r) => acc + (r?.leadsPerDay || 0), 0);
    const totalDailyCost = approved.reduce((acc, r) => acc + (r?.totalDailyCost || 0), 0);
    const successRate = requests.length ? Math.round((approved.length / requests.length) * 100) : 0;
    
    return {
      activeNodes: approved.length,
      dailyLoad: totalDailyLoad,
      dailyCost: totalDailyCost,
      successRate
    };
  }, [requests]);

  const provisionStats = useMemo(() => {
    const totalValue = myLeads.reduce((acc, l) => acc + l.currentBid, 0);
    const totalBids = myLeads.reduce((acc, l) => acc + l.bidCount, 0);
    return { totalValue, totalBids };
  }, [myLeads]);

  const filteredRequests = useMemo(() => {
    if (activeFilter === 'all') return requests;
    return requests.filter(r => r?.status === activeFilter);
  }, [requests, activeFilter]);

  const filteredLeads = useMemo(() => {
    if (activeFilter === 'all') return myLeads;
    return myLeads.filter(l => l.status === activeFilter);
  }, [myLeads, activeFilter]);

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

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'approved':
        return {
          label: 'ACTIVE_DEPLOYMENT',
          color: 'text-emerald-500',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          icon: CheckCircle2,
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.2)]'
        };
      case 'rejected':
        return {
          label: 'NODE_REVOKED',
          color: 'text-red-500',
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          icon: XCircle,
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.2)]'
        };
      default:
        return {
          label: 'SYNCING_PROTOCOL',
          color: 'text-amber-400',
          bg: 'bg-amber-400/10',
          border: 'border-amber-400/30',
          icon: RefreshCw,
          glow: 'shadow-[0_0_20px_rgba(250,204,21,0.2)]'
        };
    }
  };

  const safeUrl = (url?: string) => {
    if (!url) return 'UNASSIGNED_NODE';
    try {
      return url.replace(/^https?:\/\//, '');
    } catch {
      return url;
    }
  };

  const handleOpenHUD = (req: PurchaseRequest, mode: 'manifest' | 'identity') => {
    soundService.playClick(true);
    setInspectingOrder({ req, mode });
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-10 pb-32 animate-in fade-in duration-700 font-rajdhani">
      
      {/* COMMAND HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b-2 border-neutral-900 pb-8 md:pb-12">
        <div className="relative">
          <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-4 h-12 md:h-24 bg-[#00e5ff] rounded-full blur-xl opacity-20" />
          <h2 className="text-3xl md:text-4xl font-futuristic text-white italic uppercase flex items-center gap-4 md:gap-8 text-glow">
            ACTION <span className="text-neutral-600 font-normal">CENTER</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4 md:mt-6">
            <div className="px-3 md:px-4 py-1.5 bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-full text-[8px] md:text-[10px] font-black text-[#00e5ff] uppercase tracking-widest">NETWORK_OPS_v4.2</div>
            <span className="text-[10px] md:text-[12px] text-neutral-600 font-bold uppercase tracking-widest italic shrink-0">STABLE_CONNECTION // 0ms_LATENCY</span>
          </div>
        </div>

        {/* TAB SWITCHER */}
        <div className="flex bg-[#0c0c0c] border-2 border-neutral-900 rounded-2xl p-1 shadow-2xl relative z-10">
          {isAdmin && (
            <button 
              onClick={() => { soundService.playClick(); setActiveTab('wallets'); }}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'wallets' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-neutral-500 hover:text-white'}`}
            >
              <Wallet size={14} fill={activeTab === 'wallets' ? "currentColor" : "none"} /> Wallet Central
            </button>
          )}
          <button 
            onClick={() => { soundService.playClick(); setActiveTab('acquisitions'); }}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'acquisitions' ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-neutral-500 hover:text-white'}`}
          >
            <Zap size={14} fill={activeTab === 'acquisitions' ? "currentColor" : "none"} /> Acquisitions
          </button>
          <button 
            onClick={() => { soundService.playClick(); setActiveTab('provisions'); }}
            className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'provisions' ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-neutral-500 hover:text-white'}`}
          >
            <Layers size={14} fill={activeTab === 'provisions' ? "currentColor" : "none"} /> Provisions
          </button>
        </div>
      </div>

      {activeTab === 'wallets' && isAdmin ? (
        <div className="space-y-6 animate-in slide-in-from-bottom duration-500">
           {/* WALLET CONTROL SEARCH */}
           <div className="flex flex-col md:flex-row items-center gap-6 bg-[#0c0c0c] border-2 border-neutral-900 rounded-[2rem] p-6 shadow-2xl">
              <div className="relative flex-1 w-full">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600" size={18} />
                 <input 
                   type="text" 
                   placeholder="SEARCH_USER_LIQUIDITY_POOLS..." 
                   className="w-full bg-black border border-neutral-800 rounded-2xl pl-16 pr-6 py-4 text-sm font-black uppercase tracking-widest text-white outline-none focus:border-[#00e5ff]/40 transition-all"
                   value={walletSearch}
                   onChange={e => setWalletSearch(e.target.value)}
                 />
              </div>
              <div className="flex items-center gap-6 px-6 border-l border-neutral-800 hidden md:flex">
                 <div className="text-right">
                    <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block">MASTER_ADMIN_UID</span>
                    <span className="text-xs font-mono text-neutral-500">{user.id}</span>
                 </div>
                 <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center text-red-500 shadow-glow-sm">
                    <ShieldAlert size={24} />
                 </div>
              </div>
           </div>

           {/* USER WALLET GRID */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.length === 0 ? (
                <div className="col-span-full py-24 text-center border-2 border-neutral-900 border-dashed rounded-[3rem]">
                   <UserIcon className="mx-auto text-neutral-800 mb-4 opacity-20" size={64} />
                   <p className="text-[10px] font-black text-neutral-700 uppercase tracking-widest italic">NO_IDENTITY_NODES_MATCH_QUERY</p>
                </div>
              ) : (
                filteredUsers.map(u => (
                  <div key={u.id} className={`group relative bg-[#0c0c0c] border-2 rounded-[2rem] p-6 shadow-2xl transition-all duration-500 hover:border-neutral-700 ${adjustingUser?.id === u.id ? 'border-red-500/40 ring-4 ring-red-500/10' : 'border-neutral-900'}`}>
                    <div className="flex items-center gap-5 mb-8">
                       <div className="w-14 h-14 rounded-2xl border-2 border-neutral-800 overflow-hidden bg-neutral-900 flex items-center justify-center text-neutral-700 shrink-0">
                          {u.profileImage ? <img src={u.profileImage} className="w-full h-full object-cover" /> : <UserIcon size={24} />}
                       </div>
                       <div className="min-w-0">
                          <h4 className="text-sm font-black text-white italic uppercase truncate">{u.name}</h4>
                          <p className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest mt-1 truncate">{u.email}</p>
                       </div>
                    </div>

                    <div className="bg-black/40 border border-neutral-800 rounded-2xl p-4 flex items-center justify-between mb-6">
                       <div>
                          <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">CURRENT_LIQUIDITY</span>
                          <span className="text-2xl font-tactical text-emerald-500 italic tracking-widest">${u.balance.toLocaleString()}</span>
                       </div>
                       <div className="text-right">
                          <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">NODE_ID</span>
                          <span className="text-[10px] font-mono text-neutral-600">#{u.id.slice(-6).toUpperCase()}</span>
                       </div>
                    </div>

                    {adjustingUser?.id === u.id ? (
                      <div className="space-y-4 animate-in zoom-in-95 duration-300">
                         <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 font-tactical text-xl">$</span>
                            <input 
                              type="number" 
                              className="w-full bg-black border border-red-500/40 rounded-xl pl-10 pr-4 py-3 text-xl font-tactical text-white outline-none"
                              value={adjustAmount}
                              onChange={e => setAdjustAmount(e.target.value)}
                              autoFocus
                            />
                         </div>
                         <div className="grid grid-cols-2 gap-3">
                            <button 
                              onClick={() => handleAdjustWallet('credit')}
                              disabled={isSyncingWallet}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border-b-4 border-emerald-800 active:translate-y-1"
                            >
                              {isSyncingWallet ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Credit
                            </button>
                            <button 
                              onClick={() => handleAdjustWallet('debit')}
                              disabled={isSyncingWallet}
                              className="bg-red-600 hover:bg-red-500 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border-b-4 border-red-800 active:translate-y-1"
                            >
                              {isSyncingWallet ? <Loader2 size={14} className="animate-spin" /> : <Minus size={14} />} Debit
                            </button>
                         </div>
                         <button onClick={() => setAdjustingUser(null)} className="w-full py-2 text-[8px] font-black text-neutral-700 uppercase hover:text-white transition-colors">Abort Adjustment</button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { soundService.playClick(); setAdjustingUser(u); setAdjustAmount('100'); }}
                        className="w-full py-4 bg-neutral-900 hover:bg-white text-neutral-500 hover:text-black rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-b-4 border-neutral-950 active:translate-y-1 active:border-b-0 flex items-center justify-center gap-3"
                      >
                         <Activity size={14} /> ADJ_LIQUIDITY_PROTOCOL
                      </button>
                    )}
                  </div>
                ))
              )}
           </div>
        </div>
      ) : activeTab === 'acquisitions' ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredRequests.length === 0 ? (
            <EmptyNodeState label="NO_ORDERS_FOUND" sub="INITIATE A BID FROM THE SALES FLOOR TO START ASSET CAPTURE" />
          ) : (
            filteredRequests.map((req) => {
              const config = getStatusConfig(req?.status || 'pending');
              const StatusIcon = config.icon;
              
              return (
                <div key={req?.id} className={`group relative bg-[#0c0c0c]/80 rounded-[2rem] border transition-all duration-500 hover:border-white/20 overflow-hidden scanline-effect ${config.border}`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500 ${config.bg.replace('10', '80')} ${config.glow}`} />
                  <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                    <div className="flex items-center gap-6 shrink-0 w-full lg:w-auto md:min-w-[340px]">
                      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[1.5rem] bg-black border-2 border-neutral-900 flex items-center justify-center transition-all group-hover:scale-105 duration-500 ${config.color}`}>
                        <StatusIcon size={32} className={req?.status === 'pending' ? 'animate-spin' : ''} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[7px] md:text-[8px] font-black text-neutral-700 uppercase tracking-[0.2em] block">NETWORK_ORDER_ID</span>
                          <div className="h-px flex-1 bg-neutral-900" />
                          <span className="text-[8px] text-neutral-700 font-mono italic">#{req?.id?.slice(-4).toUpperCase() || '---'}</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-white italic tracking-tighter uppercase font-futuristic leading-none truncate group-hover:text-amber-400 transition-colors">{req?.leadTitle || 'DATA_ASSET'}</h3>
                        <div className="flex items-center gap-3 mt-3">
                           <div className={`px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border transition-all ${config.bg} ${config.border} ${config.color}`}>
                             {config.label}
                           </div>
                           <div className="flex items-center gap-1.5 text-neutral-700">
                              <Clock size={10} />
                              <span className="text-[8px] font-black uppercase">{req?.timestamp ? new Date(req.timestamp).toLocaleDateString() : 'UNKNOWN_DATE'}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 flex-1 w-full lg:px-8 lg:border-x border-neutral-900/50">
                      <div className="space-y-3">
                        <span className="text-[7px] md:text-[8px] font-black text-neutral-700 uppercase tracking-widest block flex items-center gap-2">
                          <Globe size={10} className="text-neutral-800" /> TARGET_URI (WEBHOOK)
                        </span>
                        <div className="bg-black/40 border border-neutral-800/40 rounded-xl px-4 py-2.5 flex items-center justify-between group/uri">
                          <span className="text-[10px] md:text-[11px] font-bold text-neutral-400 truncate max-w-[200px] font-mono">
                            {safeUrl(req?.buyerTargetLeadUrl)}
                          </span>
                          <ArrowRight size={12} className="text-neutral-800 group-hover/uri:text-amber-400 transition-colors" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <span className="text-[7px] md:text-[8px] font-black text-neutral-700 uppercase tracking-widest block flex items-center gap-2">
                          <Target size={10} className="text-neutral-800" /> DAILY_THROUGHPUT
                        </span>
                        <div className="flex items-end gap-3">
                          <div className="text-xl md:text-2xl font-black text-neutral-200 italic font-tactical leading-none">
                            {req?.leadsPerDay || 0} <span className="text-[9px] text-neutral-600 not-italic uppercase tracking-widest">Units/Day</span>
                          </div>
                          <div className="flex-1 h-1 bg-neutral-900 rounded-full mb-1.5 overflow-hidden">
                             <div className={`h-full transition-all duration-1000 ${req?.status === 'approved' ? 'bg-emerald-500 w-full' : 'bg-amber-400 w-1/2 animate-pulse'}`} />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="w-full lg:w-auto lg:pl-8 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3">
                       <div className="text-left lg:text-right">
                          <span className="text-[7px] md:text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">AGGREGATE_DAILY_BURN</span>
                          <div className="text-3xl md:text-4xl font-black text-white italic tracking-tighter font-tactical leading-none group-hover:text-glow transition-all">
                            <span className="text-xs text-neutral-600 mr-1">$</span>{(req?.totalDailyCost || 0).toLocaleString()}
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => handleOpenHUD(req, 'manifest')} className="p-2.5 bg-neutral-950 hover:bg-white/5 border border-neutral-800 rounded-xl text-neutral-600 hover:text-white transition-all group/btn"><FileText size={16} /></button>
                          <button onClick={() => handleOpenHUD(req, 'identity')} className="p-2.5 bg-neutral-950 hover:bg-white/5 border border-neutral-800 rounded-xl text-neutral-600 hover:text-amber-400 transition-all group/btn"><Search size={16} /></button>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredLeads.length === 0 ? (
            <EmptyNodeState label="NO_PROVISIONED_ASSETS" sub="SUBMIT A LEAD ASSET VIA THE PROVISIONING TAB TO START SELLING" />
          ) : (
            filteredLeads.map((lead) => {
              const config = getStatusConfig(lead.status);
              const StatusIcon = config.icon;
              
              return (
                <div key={lead.id} className={`group relative bg-[#0c0c0c]/80 rounded-[2rem] border transition-all duration-500 hover:border-white/20 overflow-hidden scanline-effect ${config.border}`}>
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500 ${activeTab === 'provisions' ? 'bg-[#00e5ff]/80 shadow-[0_0_20px_rgba(0,229,255,0.4)]' : ''}`} />
                  
                  <div className="p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                    <div className="flex items-center gap-6 shrink-0 w-full lg:w-auto md:min-w-[340px]">
                      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-[1.5rem] bg-black border-2 border-neutral-900 flex items-center justify-center transition-all group-hover:scale-105 duration-500 text-[#00e5ff]`}>
                        <Layers size={32} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-[7px] md:text-[8px] font-black text-neutral-700 uppercase tracking-[0.2em] block">ASSET_NODE_ID</span>
                          <div className="h-px flex-1 bg-neutral-900" />
                          <span className="text-[8px] text-neutral-700 font-mono italic">LB_{lead.id.slice(-6).toUpperCase()}</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-black text-white italic tracking-tighter uppercase font-futuristic leading-none truncate group-hover:text-[#00e5ff] transition-colors">{lead.title}</h3>
                        <div className="flex items-center gap-3 mt-3">
                           <div className={`px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border transition-all ${config.bg} ${config.border} ${config.color}`}>
                             {config.label}
                           </div>
                           <div className="flex items-center gap-1.5 text-neutral-700">
                              <Activity size={10} />
                              <span className="text-[8px] font-black uppercase">{lead.category}</span>
                           </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 flex-1 w-full lg:px-8 lg:border-x border-neutral-900/50">
                      <div className="space-y-2">
                         <span className="text-[7px] md:text-[8px] font-black text-neutral-700 uppercase tracking-widest block">MARKET_VELOCITY</span>
                         <div className="flex items-center gap-3">
                            <TrendingUp size={16} className="text-[#00e5ff]" />
                            <span className="text-xl md:text-2xl font-tactical text-white italic leading-none">{lead.bidCount} Bids</span>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <span className="text-[7px] md:text-[8px] font-black text-neutral-700 uppercase tracking-widest block">ASSET_INTEGRITY</span>
                         <div className="flex items-center gap-3">
                            <ShieldCheck size={16} className="text-emerald-500" />
                            <span className="text-xl md:text-2xl font-tactical text-white italic leading-none">{lead.qualityScore}%</span>
                         </div>
                      </div>
                      <div className="space-y-2 hidden sm:block">
                         <span className="text-[7px] md:text-[8px] font-black text-neutral-700 uppercase tracking-widest block">TIME_REMAINING</span>
                         <div className="flex items-center gap-3">
                            <Clock size={16} className="text-neutral-600" />
                            <span className="text-xl md:text-2xl font-tactical text-neutral-400 italic leading-none">{lead.timeLeft}</span>
                         </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-auto lg:pl-8 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3">
                       <div className="text-left lg:text-right">
                          <span className="text-[7px] md:text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">HIGHEST_MARKET_BID</span>
                          <div className="text-3xl md:text-4xl font-black text-white italic tracking-tighter font-tactical leading-none group-hover:text-glow transition-all">
                            <span className="text-xs text-neutral-600 mr-1">$</span>{lead.currentBid.toLocaleString()}
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button onClick={() => { soundService.playClick(); onEditLead(lead); }} className="p-3 bg-neutral-950 hover:bg-white/5 border border-neutral-800 rounded-xl text-neutral-600 hover:text-[#00e5ff] transition-all flex items-center gap-2">
                             <Edit3 size={16} />
                             <span className="text-[9px] font-black uppercase tracking-widest hidden sm:inline">Modify Node</span>
                          </button>
                       </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* INSPECTION HUD OVERLAY (Acquisitions Only) */}
      {inspectingOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-4xl bg-[#080808] border-2 border-neutral-800 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 max-h-[90vh]">
              <div className="flex justify-between items-center p-6 md:p-10 bg-black/40 border-b-2 border-neutral-900 shrink-0">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-amber-400/10 rounded-2xl flex items-center justify-center border border-amber-400/30 shadow-lg shadow-amber-400/5"><Terminal className="text-amber-400" size={28} /></div>
                    <div>
                      <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">{inspectingOrder.mode === 'manifest' ? 'ASSET_MANIFEST_HUD' : 'PROTOCOL_HANDSHAKE_HUD'}</h2>
                      <div className="flex items-center gap-3 mt-2">
                         <div className="flex items-center gap-1.5"><Fingerprint size={12} className="text-emerald-500" /><span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest truncate max-w-[150px]">Order: {inspectingOrder.req.id}</span></div>
                         <span className="w-1 h-1 bg-neutral-800 rounded-full" /><span className="text-[10px] font-black text-amber-400 uppercase tracking-widest italic animate-pulse">STATE: {inspectingOrder.req.status}</span>
                      </div>
                    </div>
                 </div>
                 <button onClick={() => { soundService.playClick(); setInspectingOrder(null); }} className="p-3 bg-neutral-950 hover:bg-neutral-900 border-2 border-neutral-800 rounded-2xl transition-all"><X size={24} className="text-neutral-500 hover:text-white" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scrollbar-hide">
                {inspectingOrder.mode === 'manifest' ? (
                  <div className="space-y-8">
                    <div className="bg-black/60 border-2 border-neutral-800 p-8 rounded-[2.5rem] space-y-6">
                       <div className="flex items-center gap-3"><Calendar size={16} className="text-amber-400" /><h3 className="text-xs font-black text-neutral-400 uppercase tracking-[0.3em]">Operational_Availability</h3></div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                             <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block">ACTIVE_WINDOW</span>
                             <div className="flex items-center gap-4">
                                <div className="bg-neutral-900/60 border border-neutral-800 px-4 py-2 rounded-xl flex items-center gap-3"><Clock size={12} className="text-amber-400/60" /><span className="text-xs font-mono text-white">{(inspectingOrder.req as any).officeHoursStart || '09:00'}</span></div>
                                <span className="text-neutral-700">—</span>
                                <div className="bg-neutral-900/60 border border-neutral-800 px-4 py-2 rounded-xl flex items-center gap-3"><Clock size={12} className="text-amber-400/60" /><span className="text-xs font-mono text-white">{(inspectingOrder.req as any).officeHoursEnd || '17:00'}</span></div>
                             </div>
                          </div>
                          <div className="space-y-4">
                             <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block">OPERATIONAL_DAYS</span>
                             <div className="flex gap-2">
                                {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                                   <div key={day} className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[9px] uppercase border transition-all ${(inspectingOrder.req as any).operationalDays?.includes(day) ? 'bg-amber-400 text-black border-amber-400' : 'bg-transparent text-neutral-800 border-neutral-900'}`}>{day[0]}</div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="bg-black/40 border-2 border-neutral-800 p-6 rounded-3xl space-y-3"><div className="flex items-center gap-2 text-neutral-600"><Clock size={14} /><span className="text-[9px] font-black uppercase tracking-widest">DEPLOYMENT_TIMESTAMP</span></div><p className="text-xl font-tactical text-white italic">{new Date(inspectingOrder.req.timestamp).toLocaleString()}</p></div>
                       <div className="bg-black/40 border-2 border-neutral-800 p-6 rounded-3xl space-y-3"><div className="flex items-center gap-2 text-neutral-600"><Target size={14} /><span className="text-[9px] font-black uppercase tracking-widest">SYNC_VELOCITY</span></div><p className="text-xl font-tactical text-white italic">{inspectingOrder.req.leadsPerDay} UNITS / 24H</p></div>
                       <div className="bg-black/40 border-2 border-neutral-800 p-6 rounded-3xl space-y-3"><div className="flex items-center gap-2 text-neutral-600"><ShieldCheck size={14} /><span className="text-[9px] font-black uppercase tracking-widest">VALIDITY_HASH</span></div><p className="text-xl font-mono text-emerald-500/80 uppercase truncate">LB_SIG_{inspectingOrder.req.id?.slice(-6) || '---'}</p></div>
                    </div>
                    <div className="bg-[#0c0c0c] border-2 border-neutral-800 p-8 rounded-[2.5rem] space-y-6 relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8 opacity-5"><Globe size={100} /></div>
                       <h3 className="text-xs font-black text-neutral-500 uppercase tracking-[0.3em] flex items-center gap-3"><LinkIcon size={16} className="text-amber-400" /> ROUTING_MANIFEST</h3>
                       <div className="space-y-4 relative z-10">
                          <div className="flex flex-col gap-2"><span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-2">SOURCE_ENDPOINT</span><div className="bg-black border border-neutral-800 px-4 py-3 rounded-xl font-mono text-xs text-neutral-400">{inspectingOrder.req.buyerBusinessUrl || 'DIRECT_MARKET_NODE'}</div></div>
                          <div className="flex flex-col gap-2"><span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-2">RECIPIENT_WEBHOOK</span><div className="bg-black border border-neutral-800 px-4 py-3 rounded-xl font-mono text-xs text-amber-400">{inspectingOrder.req.buyerTargetLeadUrl}</div></div>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 justify-center py-4">
                       <div className="flex-1 w-full md:w-auto bg-black/40 border-2 border-neutral-800 p-8 rounded-[2.5rem] flex flex-col items-center text-center space-y-4 group">
                          <div className="w-20 h-20 rounded-3xl bg-neutral-900 border-2 border-neutral-800 flex items-center justify-center text-neutral-700 group-hover:border-amber-400/40 transition-all shadow-2xl"><Server size={32} /></div>
                          <div><span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest block mb-1">SOURCE_PROVIDER</span><h4 className="text-xl font-black text-white italic uppercase tracking-tighter">LEADBID_MASTER_NODE</h4><p className="text-[9px] text-neutral-700 font-bold uppercase mt-1 tracking-widest">AUTHENTICATED_LEDGER_ENTITY</p></div>
                       </div>
                       <div className="shrink-0 flex flex-col items-center gap-2"><div className="w-12 h-12 bg-amber-400/10 rounded-full flex items-center justify-center border border-amber-400/30 animate-pulse"><ArrowRight size={24} className="text-amber-400" /></div><span className="text-[8px] font-black text-neutral-800 uppercase tracking-widest">TRANS_VERIFIED</span></div>
                       <div className="flex-1 w-full md:w-auto bg-[#0c0c0c] border-2 border-amber-400/20 p-8 rounded-[2.5rem] flex flex-col items-center text-center space-y-4 group">
                          <div className="w-20 h-20 rounded-3xl bg-amber-400/5 border-2 border-amber-400/40 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(250,204,21,0.1)] transition-all"><UserIcon size={32} /></div>
                          <div><span className="text-[8px] font-black text-amber-400 uppercase tracking-widest block mb-1">RECIPIENT_NODE</span><h4 className="text-xl font-black text-white italic uppercase tracking-tighter">{inspectingOrder.req.userName || 'IDENTITY_HIDDEN'}</h4><p className="text-[9px] text-neutral-600 font-bold uppercase mt-1 tracking-widest">ID: {inspectingOrder.req.userId?.substr(0, 12)}...</p></div>
                       </div>
                    </div>
                    <div className="bg-[#0f0f0f] border-2 border-neutral-900 rounded-[2.5rem] p-8 md:p-10 shadow-xl space-y-8">
                       <div className="flex justify-between items-center border-b border-neutral-800 pb-4"><h3 className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-3"><Database size={16} className="text-amber-400" /> SETTLEMENT_LEDGER</h3><span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">FUNDS_SECURED</span></div>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
                          <div><span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-2">UNIT_BID</span><span className="text-2xl font-tactical text-white italic">${inspectingOrder.req.bidAmount.toLocaleString()}</span></div>
                          <div><span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-2">DAILY_VOLUME</span><span className="text-2xl font-tactical text-white italic">{inspectingOrder.req.leadsPerDay} Units</span></div>
                          <div className="col-span-2 text-right"><span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-2">AGGREGATE_DAILY_BURN</span><span className="text-4xl font-tactical text-amber-400 italic">${inspectingOrder.req.totalDailyCost.toLocaleString()} <span className="text-xs text-neutral-600 not-italic uppercase">USD</span></span></div>
                       </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-6 md:p-8 bg-black/40 border-t-2 border-neutral-900 flex justify-end shrink-0">
                 <button onClick={() => { soundService.playClick(); setInspectingOrder(null); }} className="px-10 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl border-b-4 border-neutral-800 hover:bg-neutral-900 active:translate-y-1 active:border-b-0 transition-all flex items-center gap-3"><Terminal size={16} /> TERMINATE_INSPECTION</button>
              </div>
           </div>
        </div>
      )}
      
      <style>{`
        @keyframes packet-sync { 0% { left: -25%; } 100% { left: 100%; } }
        .animate-packet-sync { position: absolute; animation: packet-sync 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
      `}</style>
    </div>
  );
};

const EmptyNodeState = ({ label, sub }: { label: string, sub: string }) => (
  <div className="py-32 text-center bg-[#050505] border-2 border-neutral-800/40 border-dashed rounded-[3rem]">
    <Database className="text-neutral-900 mx-auto mb-6 opacity-20" size={80} />
    <h4 className="text-neutral-700 font-futuristic text-xl uppercase tracking-[0.4em]">{label}</h4>
    <p className="text-neutral-800 text-[10px] font-black uppercase tracking-widest mt-4 italic">{sub}</p>
  </div>
);

export default ActionCenter;
