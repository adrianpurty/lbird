
import React, { useState, useMemo } from 'react';
import { PurchaseRequest, User, Lead, Notification, WalletActivity } from '../types';
import { 
  Zap, Activity, ShieldCheck, Clock, CheckCircle2, XCircle, Globe, Target, Database,
  RefreshCw, Cpu, FileText, Terminal, X, User as UserIcon, Search, Layers, Edit3,
  TrendingUp, Wallet, Loader2, ArrowDownLeft, ArrowUpRight, History, Hash, ChevronRight,
  Monitor, Ban, Check
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
  const [activeTab, setActiveTab] = useState<'acquisitions' | 'provisions' | 'wallets' | 'activity'>(
    isAdmin ? 'activity' : 'acquisitions'
  );
  
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

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 font-clean max-w-[1400px] mx-auto px-1">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface border border-bright p-4 rounded-2xl shadow-xl">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-accent rounded-xl flex items-center justify-center text-white">
               <Activity size={20} />
            </div>
            <div>
               <h2 className="text-lg font-futuristic text-white italic uppercase leading-none tracking-tight">AUDIT_CONSOLE</h2>
               <p className="text-[7px] font-black text-accent uppercase tracking-widest mt-1">HANDSHAKE_PROTOCOL_V6.0</p>
            </div>
         </div>

         <div className="flex bg-card p-0.5 rounded-lg border border-bright w-full sm:w-auto">
            <button onClick={() => { soundService.playClick(); setActiveTab('activity'); }} className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase transition-all ${activeTab === 'activity' ? 'bg-white text-black shadow-lg' : 'text-neutral-500'}`}>Full Log</button>
            <button onClick={() => { soundService.playClick(); setActiveTab('acquisitions'); }} className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase transition-all ${activeTab === 'acquisitions' ? 'bg-white text-black shadow-lg' : 'text-neutral-500'}`}>Clearances</button>
            {isAdmin && <button onClick={() => { soundService.playClick(); setActiveTab('wallets'); }} className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase transition-all ${activeTab === 'wallets' ? 'bg-red-600 text-white shadow-lg' : 'text-neutral-500'}`}>Treasury</button>}
         </div>
      </div>

      <div className="min-h-[600px]">
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
