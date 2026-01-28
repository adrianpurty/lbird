import React, { useState, useMemo, useEffect } from 'react';
import { X, Globe, Target, Phone, Zap, ChevronRight, Calculator, AlertTriangle, Wallet, Info, ArrowRight, CreditCard, RefreshCw, Calendar, Clock, Scan, Globe as GlobeIcon, Bitcoin, Smartphone, Landmark, Database, CheckCircle2, Loader2, ArrowUpRight, ShieldCheck, Briefcase, ShieldAlert, ArrowLeft } from 'lucide-react';
import { Lead, User, GatewayAPI } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface BiddingModalProps {
  lead: Lead;
  user: User;
  gateways: GatewayAPI[];
  onClose: () => void;
  onSubmit: (data: BiddingFormData) => Promise<void>;
  onRefill: () => void;
  onRedirectToActionCenter: () => void;
  initialBid?: number;
}

export interface BiddingFormData {
  buyerBusinessUrl: string;
  buyerTargetLeadUrl: string;
  buyerTollFree: string;
  leadsPerDay: number;
  bidAmount: number;
  totalDailyCost: number;
  officeHoursStart: string;
  officeHoursEnd: string;
  operationalDays: string[];
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

const BiddingModal: React.FC<BiddingModalProps> = ({ lead, user, gateways, onClose, onSubmit, onRefill, onRedirectToActionCenter, initialBid }) => {
  const minBid = initialBid ? initialBid : lead.currentBid + 1;
  const activeGateways = useMemo(() => gateways.filter(g => g.status === 'active'), [gateways]);

  const [formData, setFormData] = useState<Omit<BiddingFormData, 'totalDailyCost'>>({
    buyerBusinessUrl: user.defaultBusinessUrl || '',
    buyerTargetLeadUrl: user.defaultTargetUrl || '',
    buyerTollFree: user.phone || '',
    leadsPerDay: 50,
    bidAmount: minBid,
    officeHoursStart: '09:00',
    officeHoursEnd: '17:00',
    operationalDays: ['mon', 'tue', 'wed', 'thu', 'fri']
  });

  const [isConfirming, setIsConfirming] = useState(false);
  const [isBridgeMode, setIsBridgeMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const safeUrl = (url?: string) => {
    if (!url) return 'UNASSIGNED_NODE';
    try {
      return url.replace(/^https?:\/\//, '');
    } catch {
      return url;
    }
  };

  const totalDailyCost = useMemo(() => {
    return formData.bidAmount * formData.leadsPerDay;
  }, [formData.bidAmount, formData.leadsPerDay]);

  const isBidTooLow = formData.bidAmount < lead.currentBid;
  const hasInsufficientFunds = totalDailyCost > user.balance;

  const toggleDay = (dayId: string) => {
    soundService.playClick();
    setFormData(prev => ({
      ...prev,
      operationalDays: prev.operationalDays.includes(dayId)
        ? prev.operationalDays.filter(d => d !== dayId)
        : [...prev.operationalDays, dayId]
    }));
  };

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isBidTooLow || isSubmitting) return;
    
    if (hasInsufficientFunds && !isBridgeMode) {
      soundService.playClick(true);
      setIsBridgeMode(true);
      return;
    }

    if (!isConfirming) {
      soundService.playClick(true);
      setIsConfirming(true);
      return;
    }

    await finalSubmit();
  };

  const finalSubmit = async () => {
    setIsSubmitting(true);
    soundService.playClick(true);

    try {
      await onSubmit({ ...formData, totalDailyCost });
      setIsSuccess(true);
      soundService.playClick(false);
    } catch (error) {
      console.error("Acquisition execution failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'stripe': return CreditCard;
      case 'paypal': return GlobeIcon;
      case 'adyen': return Landmark;
      case 'crypto': return Bitcoin;
      case 'binance': return Scan;
      case 'upi': return Smartphone;
      default: return Database;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl overflow-hidden">
      <div className="w-full max-w-2xl max-h-[95vh] bg-surface border border-bright rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
        
        {!isSuccess && (
          <div className="flex justify-between items-center p-8 sm:p-10 border-b border-bright bg-black/40 shrink-0">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
                {isBridgeMode ? <CreditCard className="text-white" size={28} /> : isConfirming ? <ShieldAlert className="text-white" size={28} /> : <Zap className="text-white" size={28} fill="currentColor" />}
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none italic">
                  {isBridgeMode ? 'Financial Bridge Proxy' : isConfirming ? 'Final Authorization' : initialBid ? 'Lead Acquisition' : 'Lead Bidding Protocol'}
                </h2>
                <p className="text-dim text-[10px] font-black uppercase tracking-widest mt-2">
                  {isBridgeMode ? 'REPLENISH_LIQUIDITY_BUFFER' : isConfirming ? 'REVIEW_TRANSACTION_PARAMETERS' : `Target Asset: ${lead?.title?.toUpperCase() || 'DATA_NODE'}`}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 hover:bg-input rounded-full transition-all text-neutral-600 hover:text-white active:scale-90">
              <X size={32} />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-8 sm:p-10 scrollbar-hide">
          {isSuccess ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-10 py-12 animate-in zoom-in-95 duration-700">
               <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-[80px] animate-pulse" />
                  <div className="w-32 h-32 rounded-[2.5rem] bg-emerald-500 text-white flex items-center justify-center shadow-xl relative z-10">
                     <CheckCircle2 size={64} />
                  </div>
               </div>
               
               <div className="space-y-4">
                  <h2 className="text-4xl font-futuristic font-black text-white italic uppercase tracking-tighter">LEAD FLOW SECURED</h2>
                  <p className="text-dim text-[11px] font-bold uppercase tracking-[0.4em] max-w-[300px] mx-auto leading-relaxed">
                    CONTRACT_DEPLOYED // HANDSHAKE_ESTABLISHED
                  </p>
               </div>

               <div className="bg-black/60 border border-bright rounded-[2rem] p-6 w-full max-w-sm flex items-center justify-between">
                  <div className="text-left">
                     <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest block mb-1">UNIT_SETTLEMENT</span>
                     <span className="text-2xl font-tactical text-emerald-500 italic tracking-widest">${formData.bidAmount.toLocaleString()} / Lead</span>
                  </div>
                  <div className="text-right">
                     <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest block mb-1">SETTLEMENT_TYPE</span>
                     <span className="text-[10px] font-black text-neutral-400 uppercase">VAULT_DEDUCTION</span>
                  </div>
               </div>

               <button 
                onClick={onRedirectToActionCenter}
                className="group relative w-full py-6 bg-white text-black rounded-[2.5rem] font-black text-xl uppercase italic tracking-widest border-b-[8px] border-neutral-300 active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-6"
               >
                 Review Campaigns <ArrowUpRight size={28} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
               </button>
            </div>
          ) : isConfirming ? (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
               <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-[2.5rem] flex items-start gap-6">
                  <ShieldAlert className="text-red-500 shrink-0" size={32} />
                  <div className="space-y-2">
                     <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Confirm Acquisition Handshake</h3>
                     <p className="text-[10px] text-dim leading-relaxed font-bold uppercase tracking-widest">
                       You are authorizing an immutable daily settlement commitment from your liquidity vault. Ensure all delivery parameters match your terminal endpoint.
                     </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-black/60 border border-bright rounded-[2rem] p-6 space-y-4">
                     <span className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.3em]">UNIT_ACQUISITION_COST</span>
                     <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-tactical text-white italic font-black">${formData.bidAmount.toLocaleString()}</span>
                        <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">/ UNIT</span>
                     </div>
                  </div>
                  <div className="bg-black/60 border border-bright rounded-[2rem] p-6 space-y-4">
                     <span className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.3em]">DAILY_VAULT_SETTLEMENT</span>
                     <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-tactical text-emerald-500 italic font-black">${totalDailyCost.toLocaleString()}</span>
                        <span className="text-[9px] text-neutral-600 font-bold uppercase tracking-widest">/ 24H</span>
                     </div>
                  </div>
               </div>

               <div className="bg-black border border-bright rounded-2xl p-6 space-y-4 font-mono">
                  <div className="flex justify-between items-center opacity-60">
                     <span className="text-[8px] uppercase tracking-widest text-neutral-500">Target Asset</span>
                     <span className="text-[8px] text-white truncate max-w-[150px]">{lead.title}</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-[8px] uppercase tracking-widest text-neutral-500">Delivery Vector</span>
                     <span className="text-[8px] text-accent truncate max-w-[200px] font-bold">{safeUrl(formData.buyerTargetLeadUrl)}</span>
                  </div>
                  <div className="h-[1px] bg-neutral-800 w-full" />
                  <div className="flex justify-between items-center">
                     <span className="text-[8px] uppercase tracking-widest text-neutral-500">Available Balance</span>
                     <span className="text-sm font-black text-white italic tracking-widest">${user.balance.toLocaleString()}</span>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setIsConfirming(false)}
                    className="py-5 bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
                  >
                    <ArrowLeft size={16} /> Abort & Review
                  </button>
                  <button 
                    onClick={finalSubmit}
                    disabled={isSubmitting}
                    className="py-5 bg-emerald-600 text-white rounded-[2.5rem] font-black text-lg uppercase italic tracking-widest border-b-[8px] border-emerald-800 hover:bg-emerald-500 transition-all flex items-center justify-center gap-4 shadow-xl active:translate-y-1 active:border-b-0"
                  >
                    {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : 'Authorize Protocol'}
                    {!isSubmitting && <CheckCircle2 size={24} />}
                  </button>
               </div>
            </div>
          ) : !isBridgeMode ? (
            <form onSubmit={handleExecute} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              
              <div className="bg-accent/5 p-4 rounded-2xl border border-accent/20 flex items-start gap-4">
                <ShieldCheck className="text-accent shrink-0 mt-0.5" size={16} />
                <p className="text-[9px] text-dim uppercase leading-relaxed font-bold tracking-widest">
                  Buyer Identity Verification: Provisioning of official business assets is mandatory for lead-flow authentication.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2 px-2 italic">
                    <Briefcase size={12} className="text-accent" /> Official Business URL
                  </label>
                  <input 
                    required
                    type="url"
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-accent transition-all shadow-sm"
                    placeholder="https://your-corp.com"
                    value={formData.buyerBusinessUrl}
                    onChange={e => setFormData({...formData, buyerBusinessUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2 px-2 italic">
                    <Phone size={12} className="text-accent" /> Contact Phone / Toll Free
                  </label>
                  <input 
                    required
                    type="tel"
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-accent transition-all shadow-sm"
                    placeholder="+1 (000) 000-0000"
                    value={formData.buyerTollFree}
                    onChange={e => setFormData({...formData, buyerTollFree: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2 px-2 italic">
                  <Target size={12} className="text-accent" /> Delivery Endpoint (Webhook)
                </label>
                <input 
                  required
                  type="url"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-accent transition-all shadow-sm font-mono"
                  placeholder="https://crm.endpoint.io/ingest"
                  value={formData.buyerTargetLeadUrl}
                  onChange={e => setFormData({...formData, buyerTargetLeadUrl: e.target.value})}
                />
              </div>

              <div className="bg-black/60 border border-bright rounded-[2rem] p-6 space-y-6 shadow-sm">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Calendar size={14} className="text-accent" />
                      <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Acquisition_Window</h3>
                   </div>
                   <div className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">REALTIME_DELIVERY_SYNC</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex gap-1.5 justify-center md:justify-start">
                    {DAYS_OF_WEEK.map(day => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center font-black text-[9px] transition-all ${
                          formData.operationalDays.includes(day.id)
                            ? 'bg-accent text-white border-accent shadow-lg'
                            : 'bg-black text-neutral-600 border-neutral-800 hover:border-accent/40'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 bg-black border border-neutral-800 p-2 rounded-xl">
                    <div className="flex-1 relative">
                       <Clock size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/60" />
                       <input 
                         type="time"
                         className="w-full bg-transparent border-none pl-8 pr-2 py-1 text-white font-mono text-[10px] outline-none cursor-pointer"
                         value={formData.officeHoursStart}
                         onChange={e => setFormData({...formData, officeHoursStart: e.target.value})}
                       />
                    </div>
                    <span className="text-neutral-700 text-xs">—</span>
                    <div className="flex-1 relative">
                       <Clock size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-accent/60" />
                       <input 
                         type="time"
                         className="w-full bg-transparent border-none pl-8 pr-2 py-1 text-white font-mono text-[10px] outline-none cursor-pointer"
                         value={formData.officeHoursEnd}
                         onChange={e => setFormData({...formData, officeHoursEnd: e.target.value})}
                       />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-black/60 border border-bright p-4 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Leads Per Day</span>
                      <input 
                        type="number"
                        className="w-16 bg-black border border-neutral-800 rounded-lg px-2 py-1 text-white font-tactical text-lg text-center outline-none focus:border-accent"
                        value={formData.leadsPerDay}
                        onChange={e => setFormData({...formData, leadsPerDay: parseInt(e.target.value) || 0})}
                      />
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">Unit Bid ($)</span>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-600 font-tactical text-lg">$</span>
                        <input 
                          type="number"
                          readOnly={!!initialBid}
                          className={`w-16 bg-black border border-neutral-800 rounded-lg px-2 py-1 text-white font-tactical text-lg text-center outline-none focus:border-accent ${initialBid ? 'opacity-50 cursor-not-allowed' : ''}`}
                          value={formData.bidAmount}
                          onChange={e => setFormData({...formData, bidAmount: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                  </div>
                </div>

                <div className="bg-black border border-bright p-4 rounded-2xl flex flex-col justify-center items-center text-center relative group overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none scale-150 text-white"><Calculator size={40} /></div>
                  <span className="text-[7px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-1">ESTIMATED_DAILY_BURN</span>
                  <div className={`text-3xl font-black italic font-tactical tracking-tighter transition-colors ${hasInsufficientFunds ? 'text-red-500' : 'text-white'}`}>
                    ${totalDailyCost.toLocaleString()}
                  </div>
                  {hasInsufficientFunds && (
                    <span className="text-[6px] text-red-500 font-black uppercase tracking-widest mt-1 animate-pulse">VAULT_LIMIT_EXCEEDED</span>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-6 rounded-[2.5rem] font-black text-xl sm:text-2xl transition-all flex items-center justify-center gap-6 active:scale-[0.98] mt-4 border-b-[6px] shadow-xl ${
                  isSubmitting ? 'bg-neutral-800 text-neutral-500 border-neutral-900 cursor-not-allowed' :
                  hasInsufficientFunds 
                    ? 'bg-amber-500 text-black border-amber-700 hover:bg-amber-400' 
                    : 'bg-white text-black border-neutral-300 hover:bg-[#00e5ff]'
                }`}
              >
                {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : 
                 hasInsufficientFunds ? 'Initiate Liquidity Sync' : initialBid ? 'Authorize Acquisition' : 'Broadcast Asset Bid'} 
                {!isSubmitting && <ArrowRight size={24} />}
              </button>
            </form>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
               <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-[2.5rem] flex items-start gap-6">
                  <Wallet className="text-amber-500 shrink-0" size={32} />
                  <div className="space-y-2">
                     <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Bridge Protocol Initiated</h3>
                     <p className="text-[10px] text-dim leading-relaxed font-bold uppercase tracking-widest">
                       Your Vault Balance [${user.balance?.toLocaleString() || '0'}] is insufficient to cover the daily settlement cycle. Select a provisioned financial node to sync additional assets.
                     </p>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeGateways.length > 0 ? (
                    activeGateways.map((g) => {
                      const NodeIcon = getProviderIcon(g.provider);
                      return (
                        <button 
                          key={g.id}
                          onClick={() => { soundService.playClick(); onRefill(); }}
                          className="bg-black/40 border border-bright rounded-3xl p-6 text-left hover:border-accent transition-all flex flex-col gap-4 group shadow-sm"
                        >
                           <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">FIN_NODE: {g.provider?.toUpperCase() || 'UNKNOWN'}</span>
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-black border border-neutral-800 flex items-center justify-center text-neutral-500 group-hover:text-accent transition-colors">
                                 <NodeIcon size={20} />
                              </div>
                              <h4 className="text-lg font-black text-white italic truncate uppercase flex-1">{g.name}</h4>
                           </div>
                           <div className="text-[8px] text-dim font-bold uppercase flex items-center gap-1">
                              <RefreshCw size={10} className="animate-spin-slow" /> INSTANT_SYNC_AVAILABLE
                           </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-12 text-center bg-black/60 border border-dashed border-bright rounded-[2.5rem]">
                       <AlertTriangle className="mx-auto text-neutral-700 mb-4" size={40} />
                       <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">NO_SYNC_NODES_FOUND // CONTACT_ADMIN</p>
                    </div>
                  )}
               </div>

               <button 
                onClick={() => setIsBridgeMode(false)}
                className="w-full py-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest hover:text-white transition-colors"
               >
                 Abort Bridge & Return to Config
               </button>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default BiddingModal;