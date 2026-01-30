
import React, { useState, useMemo } from 'react';
import { PurchaseRequest, User, Lead, Notification, WalletActivity } from '../types';
import { 
  Zap, Activity, ShieldCheck, Clock, CheckCircle2, XCircle, Globe, Target, Database,
  RefreshCw, Cpu, FileText, Terminal, X, User as UserIcon, Search, Layers, Edit3,
  TrendingUp, Wallet, Loader2, ArrowDownLeft, ArrowUpRight, History, Hash, ChevronRight,
  Monitor, Ban, Check, ShieldAlert, ExternalLink, Calendar, Settings2, Save, ArrowLeft,
  Info, CreditCard, Radio, Box
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

const DAYS_OF_WEEK = [
  { id: 'mon', label: 'M' },
  { id: 'tue', label: 'T' },
  { id: 'wed', label: 'W' },
  { id: 'thu', label: 'T' },
  { id: 'fri', label: 'F' },
  { id: 'sat', label: 'S' },
  { id: 'sun', label: 'S' }
];

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
  const [editingDeliveryId, setEditingDeliveryId] = useState<string | null>(null);
  const [deliveryForm, setDeliveryForm] = useState({
    officeHoursStart: '09:00',
    officeHoursEnd: '17:00',
    operationalDays: ['mon', 'tue', 'wed', 'thu', 'fri'],
    deliveryStartDate: new Date().toISOString().split('T')[0]
  });

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

  const startDeliveryConfig = (req: PurchaseRequest) => {
    soundService.playClick();
    setEditingDeliveryId(req.id);
    setDeliveryForm({
      officeHoursStart: req.officeHoursStart || '09:00',
      officeHoursEnd: req.officeHoursEnd || '17:00',
      operationalDays: req.operationalDays || ['mon', 'tue', 'wed', 'thu', 'fri'],
      deliveryStartDate: req.deliveryStartDate || new Date().toISOString().split('T')[0]
    });
  };

  const saveDeliveryConfig = async () => {
    if (!editingDeliveryId) return;
    setIsProcessing(editingDeliveryId);
    soundService.playClick(true);
    try {
      await apiService.updateBidDelivery(editingDeliveryId, deliveryForm);
      setEditingDeliveryId(null);
      onWalletUpdate?.();
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(null);
    }
  };

  const toggleDay = (dayId: string) => {
    soundService.playClick();
    setDeliveryForm(prev => ({
      ...prev,
      operationalDays: prev.operationalDays.includes(dayId)
        ? prev.operationalDays.filter(d => d !== dayId)
        : [...prev.operationalDays, dayId]
    }));
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

  const myProvisionedLeads = useMemo(() => {
    return leads.filter(l => l.ownerId === user.id);
  }, [leads, user.id]);

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

         <div className="flex bg-card p-0.5 rounded-lg border border-bright w-full sm:w-auto overflow-x-auto scrollbar-hide">
            {isAdmin && (
              <button onClick={() => { soundService.playClick(); setActiveTab('approvals'); }} className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase transition-all flex items-center gap-2 shrink-0 ${activeTab === 'approvals' ? 'bg-red-600 text-white shadow-lg' : 'text-neutral-500'}`}>
                {pendingApprovals.length > 0 && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                Approvals
              </button>
            )}
            <button onClick={() => { soundService.playClick(); setActiveTab('acquisitions'); }} className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase transition-all shrink-0 ${activeTab === 'acquisitions' ? 'bg-white text-black shadow-lg' : 'text-neutral-500'}`}>My Bids</button>
            <button onClick={() => { soundService.playClick(); setActiveTab('provisions'); }} className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase transition-all shrink-0 ${activeTab === 'provisions' ? 'bg-white text-black shadow-lg' : 'text-neutral-500'}`}>My Assets</button>
            <button onClick={() => { soundService.playClick(); setActiveTab('activity'); }} className={`px-4 py-1.5 rounded-md text-[8px] font-black uppercase transition-all shrink-0 ${activeTab === 'activity' ? 'bg-white text-black shadow-lg' : 'text-neutral-500'}`}>Logs</button>
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
               filteredRequests.map(req => {
                 const isEditingThis = editingDeliveryId === req.id;
                 const isApproved = req.status === 'approved';
                 
                 return (
                   <div key={req.id} className="bg-surface border border-bright rounded-2xl p-6 flex flex-col gap-6 hover:bg-card transition-all relative overflow-hidden group">
                      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5 w-full md:w-auto">
                           <div className={`relative w-12 h-12 rounded-xl border flex items-center justify-center ${isApproved ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : req.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                              {isApproved ? <Check size={24} /> : req.status === 'rejected' ? <X size={24} /> : <Clock size={24} />}
                              {isApproved && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />}
                           </div>
                           <div className="min-w-0">
                              <h4 className="text-sm font-black text-white italic uppercase truncate">{req.leadTitle}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                 <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">ID: {req.id.slice(-6).toUpperCase()}</span>
                                 <div className="w-px h-2 bg-neutral-800" />
                                 <div className="flex items-center gap-1">
                                    <CreditCard size={8} className="text-accent" />
                                    <span className="text-[7px] font-black text-neutral-500 uppercase tracking-widest">GATE_SYNC: OK</span>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-8 px-8 border-x border-neutral-800/40 flex-1 justify-center w-full md:w-auto">
                           <div className="text-center">
                              <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest block mb-1">State</span>
                              <span className={`text-[10px] font-black italic uppercase ${isApproved ? 'text-emerald-500' : req.status === 'rejected' ? 'text-red-500' : 'text-amber-500'}`}>{req.status}</span>
                           </div>
                           <div className="hidden sm:block text-center">
                              <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest block mb-1">Schedule</span>
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-[9px] font-bold text-neutral-400 font-mono uppercase">
                                  {isApproved ? `${req.operationalDays?.length || 5}D // ${req.officeHoursStart}-${req.officeHoursEnd}` : 'WAITING_SYNC'}
                                </span>
                              </div>
                           </div>
                        </div>

                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                           <div className="text-right">
                              <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest block mb-1">Daily Settlement</span>
                              <span className="text-2xl font-tactical font-black text-white italic tracking-tighter">${req.totalDailyCost.toLocaleString()}</span>
                           </div>
                           {isApproved && !isEditingThis && (
                              <button 
                                onClick={() => startDeliveryConfig(req)}
                                className="p-3 bg-black border border-neutral-800 rounded-xl text-accent hover:border-accent transition-all shadow-lg active:scale-95"
                                title="Configure Delivery Protocol"
                              >
                                <Settings2 size={20} />
                              </button>
                           )}
                        </div>
                      </div>

                      {/* DELIVERY CONFIGURATION INTERFACE */}
                      {isEditingThis && (
                        <div className="mt-4 pt-6 border-t border-bright animate-in slide-in-from-top-4 duration-500 space-y-6">
                           <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                 <Calendar size={14} className="text-accent" />
                                 <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Delivery_Sync_Protocol</h3>
                              </div>
                              <button onClick={() => setEditingDeliveryId(null)} className="text-[8px] font-black text-neutral-600 hover:text-white uppercase tracking-widest flex items-center gap-1">
                                <ArrowLeft size={10} /> Abort_Changes
                              </button>
                           </div>

                           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                              {/* Left: Days Grid */}
                              <div className="lg:col-span-4 space-y-3">
                                 <label className="text-[8px] font-black text-neutral-600 uppercase tracking-widest px-1 italic">Operational_Days</label>
                                 <div className="flex gap-2 justify-between bg-black/40 p-3 rounded-2xl border border-neutral-800">
                                    {DAYS_OF_WEEK.map(day => (
                                      <button
                                        key={day.id}
                                        type="button"
                                        onClick={() => toggleDay(day.id)}
                                        className={`w-9 h-9 rounded-lg border flex items-center justify-center font-black text-[10px] transition-all ${
                                          deliveryForm.operationalDays.includes(day.id)
                                            ? 'bg-accent text-white border-accent shadow-[0_0_15px_rgba(124,58,237,0.3)]'
                                            : 'bg-black text-neutral-600 border-neutral-800 hover:border-accent/40'
                                        }`}
                                      >
                                        {day.label}
                                      </button>
                                    ))}
                                 </div>
                              </div>

                              {/* Center: Hours */}
                              <div className="lg:col-span-4 space-y-3">
                                 <label className="text-[8px] font-black text-neutral-600 uppercase tracking-widest px-1 italic">Active_Window (Local_Time)</label>
                                 <div className="flex items-center gap-4 bg-black/40 p-3 rounded-2xl border border-neutral-800">
                                    <div className="flex-1 relative">
                                       <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/60" />
                                       <input 
                                         type="time"
                                         className="w-full bg-transparent border-none pl-10 pr-2 py-1.5 text-white font-mono text-[11px] outline-none cursor-pointer"
                                         value={deliveryForm.officeHoursStart}
                                         onChange={e => setDeliveryForm({...deliveryForm, officeHoursStart: e.target.value})}
                                       />
                                    </div>
                                    <span className="text-neutral-700 text-xs font-black">—</span>
                                    <div className="flex-1 relative">
                                       <Clock size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/60" />
                                       <input 
                                         type="time"
                                         className="w-full bg-transparent border-none pl-10 pr-2 py-1.5 text-white font-mono text-[11px] outline-none cursor-pointer"
                                         value={deliveryForm.officeHoursEnd}
                                         onChange={e => setDeliveryForm({...deliveryForm, officeHoursEnd: e.target.value})}
                                       />
                                    </div>
                                 </div>
                              </div>

                              {/* Right: Date & Actions */}
                              <div className="lg:col-span-4 flex flex-col gap-4">
                                 <div className="space-y-3 flex-1">
                                    <label className="text-[8px] font-black text-neutral-600 uppercase tracking-widest px-1 italic">Sync_Start_Date</label>
                                    <div className="relative">
                                       <Calendar size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-accent/60" />
                                       <input 
                                         type="date"
                                         className="w-full bg-black/40 border border-neutral-800 rounded-2xl pl-12 pr-4 py-3 text-white font-mono text-[11px] outline-none cursor-pointer focus:border-accent"
                                         value={deliveryForm.deliveryStartDate}
                                         onChange={e => setDeliveryForm({...deliveryForm, deliveryStartDate: e.target.value})}
                                       />
                                    </div>
                                 </div>
                                 <button 
                                   onClick={saveDeliveryConfig}
                                   disabled={isProcessing === req.id}
                                   className="w-full py-4 bg-white text-black rounded-2xl font-black text-[10px] uppercase tracking-widest border-b-[6px] border-neutral-300 hover:bg-[#00e5ff] active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-3 shadow-xl"
                                 >
                                    {isProcessing === req.id ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> Save_Protocol</>}
                                 </button>
                              </div>
                           </div>

                           <div className="bg-accent/5 border border-accent/20 p-4 rounded-xl flex items-start gap-4">
                              <Info className="text-accent shrink-0 mt-0.5" size={16} />
                              <p className="text-[9px] text-dim uppercase leading-relaxed font-bold tracking-widest italic">
                                Note: Modifying delivery hours updates the traffic router instantly. Leads captured outside these windows will be held in a temporary queue for up to 12 hours.
                              </p>
                           </div>
                        </div>
                      )}

                      {isApproved && !isEditingThis && (
                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
                      )}
                   </div>
                 );
               })
             )}
          </div>
        )}

        {activeTab === 'provisions' && (
           <div className="grid grid-cols-1 gap-4">
              {myProvisionedLeads.length === 0 ? (
                <div className="py-32 text-center bg-black/20 border-2 border-dashed border-bright rounded-[2rem]">
                  <Box size={48} className="mx-auto text-dim opacity-20 mb-4" />
                  <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.3em]">No provisioned assets found.</p>
                </div>
              ) : (
                myProvisionedLeads.map(lead => {
                  const bCount = requests.filter(r => r.leadId === lead.id).length;
                  const activeAcquisitions = requests.filter(r => r.leadId === lead.id && r.status === 'approved');
                  
                  return (
                    <div key={lead.id} className="bg-surface border border-bright rounded-2xl p-6 flex flex-col lg:flex-row items-center justify-between gap-8 group hover:border-accent/40 transition-all relative">
                       <div className="flex items-center gap-6 w-full lg:w-auto">
                          <div className={`w-14 h-14 rounded-xl border flex items-center justify-center ${lead.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                             <Layers size={24} />
                          </div>
                          <div>
                             <h4 className="text-sm font-black text-white italic uppercase truncate">{lead.title}</h4>
                             <p className="text-[8px] font-black text-neutral-600 uppercase tracking-widest mt-1">STATUS: {lead.status.toUpperCase()} // NICHE: {lead.category.toUpperCase()}</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-3 gap-10 px-10 border-x border-neutral-800/40 flex-1 w-full lg:w-auto">
                          <div className="text-center">
                             <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest block mb-1">Floor</span>
                             <span className="text-xl font-tactical font-black text-white italic">${lead.currentBid}</span>
                          </div>
                          <div className="text-center">
                             <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest block mb-1">Bids</span>
                             <span className="text-xl font-tactical font-black text-white italic">{bCount}</span>
                          </div>
                          <div className="text-center">
                             <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest block mb-1">Active Syncs</span>
                             <span className="text-xl font-tactical font-black text-emerald-500 italic">{activeAcquisitions.length}</span>
                          </div>
                       </div>

                       <div className="flex items-center gap-3 w-full lg:w-auto">
                          <button 
                            onClick={() => onEditLead(lead)}
                            className="flex-1 lg:flex-none px-10 py-3 bg-white text-black rounded-xl font-black text-[9px] uppercase tracking-widest border-b-4 border-neutral-300 hover:bg-[#00e5ff] active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-2"
                          >
                             <Edit3 size={14} /> Refinery
                          </button>
                       </div>
                    </div>
                  );
                })
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
