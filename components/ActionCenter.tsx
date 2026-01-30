
import React, { useState, useMemo } from 'react';
import { PurchaseRequest, User, Lead, Notification, WalletActivity } from '../types';
import { 
  Zap, Activity, ShieldCheck, Clock, CheckCircle2, XCircle, Globe, Target, Database,
  RefreshCw, Cpu, FileText, Terminal, X, User as UserIcon, Search, Layers, Edit3,
  TrendingUp, Wallet, Loader2, ArrowDownLeft, ArrowUpRight, History, Hash, ChevronRight,
  Monitor, Ban, Check, ShieldAlert, ExternalLink
} from 'lucide-react';
import { soundService } from '../services/soundService';
import { apiService } from '../services/apiService';

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
  const [activeTab, setActiveTab] = useState<'acquisitions' | 'provisions' | 'approvals' | 'activity'>(
    isAdmin ? 'approvals' : 'acquisitions'
  );
  
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleAuthorize = async (bidId: string) => {
    soundService.playClick(true);
    setIsProcessing(bidId);
    try {
      await apiService.authorizeBid(bidId);
      onWalletUpdate?.();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (bidId: string) => {
    soundService.playClick(true);
    setIsProcessing(bidId);
    try {
      await apiService.rejectBid(bidId);
      onWalletUpdate?.();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(null);
    }
  };

  const activityFeed = useMemo(() => {
    const rawNotifications = isAdmin ? notifications : notifications.filter(n => n.userId === user.id);
    const rawWallets = isAdmin ? walletActivities : walletActivities.filter(w => w.userId === user.id);

    const events = [
      ...rawNotifications.map(n => ({
        id: n.id || `LOG-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        timestamp: n.timestamp,
        type: 'event',
        category: n.type,
        message: n.message,
        userId: n.userId,
        txnId: 'SYSTEM_EVENT'
      })),
      ...rawWallets.map(w => ({
        id: w.id,
        timestamp: w.timestamp,
        type: 'financial',
        category: w.type,
        message: `${w.type.toUpperCase()} of $${w.amount.toLocaleString()} via ${w.provider}`,
        userId: w.userId,
        txnId: w.id 
      }))
    ];

    return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [notifications, walletActivities, user.id, isAdmin]);

  const filteredRequests = useMemo(() => {
    if (isAdmin) return requests;
    return requests.filter(r => r.userId === user.id);
  }, [requests, user.id, isAdmin]);

  const pendingApprovals = useMemo(() => {
    return requests.filter(r => r.status === 'pending');
  }, [requests]);

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 font-clean max-w-[1400px] mx-auto px-1">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface border border-bright p-4 rounded-2xl shadow-xl">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
               <Activity size={20} />
            </div>
            <div>
               <h2 className="text-lg font-futuristic text-white italic uppercase leading-none tracking-tight">AUDIT_CONSOLE</h2>
               <p className="text-[7px] font-black text-accent uppercase tracking-widest mt-1">HANDSHAKE_PROTOCOL_V6.5</p>
            </div>
         </div>

         <div className="flex bg-card p-0.5 rounded-lg border border-bright w-full sm:w-auto">
            {isAdmin && (
              <button onClick={() => { soundService.playClick(); setActiveTab('approvals'); }} className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase transition-all flex items-center gap-2 ${activeTab === 'approvals' ? 'bg-red-600 text-white shadow-lg' : 'text-neutral-500'}`}>
                {pendingApprovals.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                Approvals Hub
              </button>
            )}
            <button onClick={() => { soundService.playClick(); setActiveTab('acquisitions'); }} className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase transition-all ${activeTab === 'acquisitions' ? 'bg-white text-black shadow-lg' : 'text-neutral-500'}`}>My Bids</button>
            <button onClick={() => { soundService.playClick(); setActiveTab('activity'); }} className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase transition-all ${activeTab === 'activity' ? 'bg-white text-black shadow-lg' : 'text-neutral-500'}`}>Full Log</button>
         </div>
      </div>

      <div className="min-h-[600px]">
        {activeTab === 'approvals' && isAdmin && (
          <div className="space-y-4">
            <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl flex items-center gap-4 mb-6">
              <ShieldAlert className="text-red-500" size={20} />
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-relaxed">
                Advisory: Every pending acquisition requires manual clearance. Validating Origin URIs is mandatory before authorization.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {pendingApprovals.length === 0 ? (
                <div className="py-32 text-center bg-black/20 border-2 border-dashed border-bright rounded-[2rem]">
                  <CheckCircle2 size={48} className="mx-auto text-emerald-500/20 mb-4" />
                  <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.3em]">No Pending Authorizations</p>
                </div>
              ) : (
                pendingApprovals.map(req => (
                  <div key={req.id} className="bg-surface border border-bright rounded-2xl p-6 flex flex-col lg:flex-row items-center justify-between gap-8 group hover:border-accent/40 transition-all relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                    
                    <div className="flex items-center gap-6 w-full lg:w-auto">
                       <div className="w-14 h-14 bg-black border border-neutral-800 rounded-xl flex items-center justify-center text-amber-500">
                          <Clock size={24} className="animate-pulse" />
                       </div>
                       <div className="min-w-0">
                          <h4 className="text-sm font-black text-white italic uppercase truncate">{req.leadTitle}</h4>
                          <div className="flex items-center gap-3 mt-1.5">
                             <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Buyer: {req.userName}</span>
                             <span className="text-[8px] font-black text-neutral-800">•</span>
                             <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Held in Escrow</span>
                          </div>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 px-8 border-x border-neutral-800/40 flex-1 w-full lg:w-auto">
                       <div>
                          <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest block mb-1">Unit Bid</span>
                          <span className="text-xl font-tactical font-black text-white italic">${req.bidAmount}</span>
                       </div>
                       <div>
                          <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest block mb-1">Daily Cap</span>
                          <span className="text-xl font-tactical font-black text-white italic">{req.leadsPerDay}U</span>
                       </div>
                       <div className="hidden md:block">
                          <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest block mb-1">Settlement</span>
                          <span className="text-xl font-tactical font-black text-emerald-500 italic">${req.totalDailyCost.toLocaleString()}</span>
                       </div>
                    </div>

                    <div className="flex items-center gap-3 w-full lg:w-auto">
                       <button 
                        disabled={isProcessing === req.id}
                        onClick={() => handleReject(req.id)}
                        className="flex-1 lg:flex-none px-6 py-3 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 hover:text-red-500 hover:border-red-900/40 transition-all text-[9px] font-black uppercase tracking-widest"
                       >
                         {isProcessing === req.id ? <Loader2 className="animate-spin" size={14} /> : 'Revoke'}
                       </button>
                       <button 
                        disabled={isProcessing === req.id}
                        onClick={() => handleAuthorize(req.id)}
                        className="flex-1 lg:flex-none px-10 py-3 bg-white text-black rounded-xl font-black text-[9px] uppercase tracking-widest border-b-4 border-neutral-300 hover:bg-[#00e5ff] active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2"
                       >
                         {isProcessing === req.id ? <Loader2 className="animate-spin" size={14} /> : <><ShieldCheck size={14} /> Authorize</>}
                       </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'acquisitions' && (
          <div className="grid grid-cols-1 gap-4">
             {filteredRequests.length === 0 ? (
               <div className="py-32 text-center opacity-20"><Target size={64} className="mx-auto mb-4" />No Active Bids</div>
             ) : (
               filteredRequests.map(req => (
                 <div key={req.id} className="bg-surface border border-bright rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 hover:bg-card transition-all">
                    <div className="flex items-center gap-5 w-full md:w-auto">
                       <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : req.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                          {req.status === 'approved' ? <Check size={24} /> : req.status === 'rejected' ? <X size={24} /> : <Clock size={24} />}
                       </div>
                       <div className="min-w-0">
                          <h4 className="text-sm font-black text-white italic uppercase truncate">{req.leadTitle}</h4>
                          <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mt-1">ID: {req.id.toUpperCase()}</p>
                       </div>
                    </div>

                    <div className="flex items-center gap-8 px-8 border-x border-neutral-800/40 flex-1 justify-center w-full md:w-auto">
                       <div className="text-center">
                          <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest block mb-1">State</span>
                          <span className={`text-[10px] font-black italic uppercase ${req.status === 'approved' ? 'text-emerald-500' : req.status === 'rejected' ? 'text-red-500' : 'text-amber-500'}`}>{req.status}</span>
                       </div>
                       <div className="text-center">
                          <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest block mb-1">Unit Bid</span>
                          <span className="text-[10px] font-black text-white italic font-tactical tracking-widest">${req.bidAmount}</span>
                       </div>
                    </div>

                    <div className="text-right w-full md:w-auto">
                       <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest block mb-1">Daily Settlement</span>
                       <span className="text-2xl font-tactical font-black text-white italic tracking-tighter">${req.totalDailyCost.toLocaleString()}</span>
                    </div>
                 </div>
               ))
             )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-surface border border-bright rounded-2xl p-4 shadow-2xl">
             <div className="flex items-center justify-between mb-4 border-b border-bright pb-3">
                <div className="flex items-center gap-2">
                   <Terminal size={14} className="text-accent" />
                   <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Global_Ledger_History</h3>
                </div>
                <span className="text-[7px] font-mono text-neutral-600 uppercase">SYSTEM_COMPLIANT_LOGS</span>
             </div>

             <div className="space-y-1 max-h-[700px] overflow-y-auto scrollbar-hide font-mono">
                {activityFeed.length === 0 ? (
                  <div className="py-24 text-center opacity-20"><Database size={48} className="mx-auto mb-4" />Nodes Silent</div>
                ) : (
                  activityFeed.map((event) => (
                    <div key={event.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 py-2 px-3 hover:bg-white/[0.03] border-b border-white/[0.02] text-[9px]">
                       <div className="flex items-center gap-3">
                          <span className="text-neutral-600 shrink-0">{new Date(event.timestamp).toLocaleTimeString()}</span>
                          <span className={`px-1 py-0.5 rounded-[2px] text-[7px] font-black uppercase shrink-0 ${event.type === 'financial' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-accent/10 text-accent'}`}>{event.category}</span>
                          <span className="text-white/70 truncate uppercase">{event.message}</span>
                       </div>
                       <div className="flex items-center gap-4 text-right">
                          <span className="text-neutral-700 font-bold uppercase tracking-tighter">ID: {event.txnId}</span>
                          <Hash size={10} className="text-neutral-800" />
                       </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionCenter;
