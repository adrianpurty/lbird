import React, { useState, useMemo, useEffect } from 'react';
import { X, Globe, Target, Phone, Zap, ChevronRight, Calculator, AlertTriangle, Wallet, Info, ArrowRight, CreditCard, RefreshCw, Calendar, Clock, Scan, Globe as GlobeIcon, Bitcoin, Smartphone, Landmark, Database } from 'lucide-react';
import { Lead, User, GatewayAPI } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface BiddingModalProps {
  lead: Lead;
  user: User;
  gateways: GatewayAPI[];
  onClose: () => void;
  onSubmit: (data: BiddingFormData) => void;
  onRefill: () => void;
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

const BiddingModal: React.FC<BiddingModalProps> = ({ lead, user, gateways, onClose, onSubmit, onRefill }) => {
  const minBid = lead.currentBid + 1;
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

  const [isBridgeMode, setIsBridgeMode] = useState(false);

  const totalDailyCost = useMemo(() => {
    return formData.bidAmount * formData.leadsPerDay;
  }, [formData.bidAmount, formData.leadsPerDay]);

  const isBidTooLow = formData.bidAmount <= lead.currentBid;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBidTooLow) return;
    if (hasInsufficientFunds && !isBridgeMode) {
      soundService.playClick(true);
      setIsBridgeMode(true);
      return;
    }
    onSubmit({ ...formData, totalDailyCost });
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl overflow-hidden">
      <div className="w-full max-w-2xl max-h-[95vh] bg-[#0c0c0c] border-2 border-neutral-800 rounded-[3rem] shadow-[0_50px_150px_-20px_rgba(0,0,0,1)] flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="flex justify-between items-center p-8 sm:p-10 border-b border-neutral-800 bg-black/40 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)]">
              {isBridgeMode ? <CreditCard className="text-black" size={28} /> : <Zap className="text-black" size={28} fill="currentColor" />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none italic" style={{ fontVariant: 'small-caps' }}>
                {isBridgeMode ? 'Financial Bridge Proxy' : 'Lead Acquisition Handshake'}
              </h2>
              <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mt-2" style={{ fontVariant: 'small-caps' }}>
                {isBridgeMode ? 'REPLENISH_LIQUIDITY_BUFFER' : `Target Lead Asset: ${lead?.title?.toUpperCase() || 'DATA_NODE'}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-neutral-800 rounded-full transition-all text-neutral-500 hover:text-white active:scale-90">
            <X size={32} />
          </button>
        </div>

        {/* MODAL CONTENT */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-10 scrollbar-hide">
          {!isBridgeMode ? (
            <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              
              {/* COMPLIANCE ALERT */}
              <div className="bg-neutral-900/40 p-4 rounded-2xl border border-neutral-800/60 flex items-start gap-4">
                <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
                <p className="text-[9px] text-neutral-400 uppercase leading-relaxed font-bold tracking-widest">
                  Identity verification required. Lead delivery is restricted to authorized operational windows defined below.
                </p>
              </div>

              {/* CORE BUSINESS DATA */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2 px-2 italic">
                    <Globe size={12} className="text-white" /> Business URL
                  </label>
                  <input 
                    required
                    type="url"
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-white transition-all shadow-inner"
                    placeholder="https://official-business.com"
                    value={formData.buyerBusinessUrl}
                    onChange={e => setFormData({...formData, buyerBusinessUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2 px-2 italic">
                    <Phone size={12} className="text-white" /> Business ID
                  </label>
                  <input 
                    required
                    type="text"
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-white transition-all shadow-inner"
                    placeholder="e.g. +1-800-LEADS"
                    value={formData.buyerTollFree}
                    onChange={e => setFormData({...formData, buyerTollFree: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2 px-2 italic">
                  <Target size={12} className="text-white" /> Delivery Endpoint (Webhook)
                </label>
                <input 
                  required
                  type="url"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-white transition-all shadow-inner font-mono"
                  placeholder="https://api.your-crm.io/v1/leads/ingest"
                  value={formData.buyerTargetLeadUrl}
                  onChange={e => setFormData({...formData, buyerTargetLeadUrl: e.target.value})}
                />
              </div>

              {/* SCHEDULE MODULE */}
              <div className="bg-[#111111] border-2 border-neutral-800/60 rounded-[2rem] p-6 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <Calendar size={14} className="text-[#00e5ff]" />
                      <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Operational_Handshake</h3>
                   </div>
                   <div className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">GMT_SYNC_ACTIVE</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="flex gap-1.5 justify-center md:justify-start">
                    {DAYS_OF_WEEK.map(day => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => toggleDay(day.id)}
                        className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center font-black text-[9px] transition-all ${
                          formData.operationalDays.includes(day.id)
                            ? 'bg-[#00e5ff] text-black border-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                            : 'bg-black text-neutral-600 border-neutral-800 hover:border-neutral-700'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3 bg-black/40 border border-neutral-800 p-2 rounded-xl">
                    <div className="flex-1 relative">
                       <Clock size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00e5ff]/60" />
                       <input 
                         type="time"
                         className="w-full bg-transparent border-none pl-8 pr-2 py-1 text-white font-mono text-[10px] outline-none cursor-pointer"
                         value={formData.officeHoursStart}
                         onChange={e => setFormData({...formData, officeHoursStart: e.target.value})}
                       />
                    </div>
                    <span className="text-neutral-800 text-xs">—</span>
                    <div className="flex-1 relative">
                       <Clock size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00e5ff]/60" />
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

              {/* CALCULATOR SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-black/60 border border-neutral-800 p-4 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Daily Cap</span>
                      <input 
                        type="number"
                        className="w-16 bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-white font-tactical text-lg text-center outline-none focus:border-[#00e5ff]/40"
                        value={formData.leadsPerDay}
                        onChange={e => setFormData({...formData, leadsPerDay: parseInt(e.target.value) || 0})}
                      />
                  </div>
                  <div className="flex justify-between items-center">
                      <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">Unit Bid</span>
                      <div className="flex items-center gap-2">
                        <span className="text-neutral-700 font-tactical text-lg">$</span>
                        <input 
                          type="number"
                          className="w-16 bg-neutral-900 border border-neutral-800 rounded-lg px-2 py-1 text-white font-tactical text-lg text-center outline-none focus:border-[#00e5ff]/40"
                          value={formData.bidAmount}
                          onChange={e => setFormData({...formData, bidAmount: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                  </div>
                </div>

                <div className="bg-white/[0.03] border border-white/5 p-4 rounded-2xl flex flex-col justify-center items-center text-center relative group overflow-hidden">
                  <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none scale-150"><Calculator size={40} /></div>
                  <span className="text-[7px] font-black text-neutral-600 uppercase tracking-[0.2em] mb-1">TOTAL_DAILY_BURN</span>
                  <div className={`text-3xl font-black italic font-tactical tracking-tighter transition-colors ${hasInsufficientFunds ? 'text-red-500' : 'text-white'}`}>
                    ${totalDailyCost.toLocaleString()}
                  </div>
                  {hasInsufficientFunds && (
                    <span className="text-[6px] text-red-900 font-black uppercase tracking-widest mt-1 animate-pulse">LIQUIDITY_LIMIT_REACHED</span>
                  )}
                </div>
              </div>

              <button 
                type="submit"
                className={`w-full py-6 rounded-[2.5rem] font-black text-xl sm:text-2xl transition-all flex items-center justify-center gap-6 active:scale-[0.98] mt-4 border-b-[6px] ${
                  hasInsufficientFunds 
                    ? 'bg-amber-400 text-black border-amber-600 hover:bg-amber-500' 
                    : 'bg-white text-black border-neutral-300 hover:bg-neutral-100'
                }`}
              >
                {hasInsufficientFunds ? 'Initiate Bridge Protocol' : 'Authorize Acquisition'} <ArrowRight size={24} />
              </button>
            </form>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
               <div className="bg-amber-950/10 border-2 border-amber-900/30 p-8 rounded-[2.5rem] flex items-start gap-6">
                  <Wallet className="text-amber-500 shrink-0" size={32} />
                  <div className="space-y-2">
                     <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Bridge Protocol Initiated</h3>
                     <p className="text-[10px] text-neutral-500 leading-relaxed font-bold uppercase tracking-widest">
                       Current liquidity [${user.balance?.toLocaleString() || '0'}] is insufficient for this campaign. Select a provisioned financial node to sync additional assets instantly.
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
                          className="bg-[#0c0c0c] border border-neutral-800 rounded-3xl p-6 text-left hover:border-amber-400/40 transition-all flex flex-col gap-4 group"
                        >
                           <div className="flex items-center justify-between">
                              <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">FIN_NODE: {g.provider?.toUpperCase() || 'UNKNOWN'}</span>
                              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                           </div>
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-black border border-neutral-800 flex items-center justify-center text-neutral-700 group-hover:text-amber-400 transition-colors">
                                 <NodeIcon size={20} />
                              </div>
                              <h4 className="text-lg font-black text-white italic truncate uppercase flex-1">{g.name}</h4>
                           </div>
                           <div className="text-[8px] text-neutral-700 font-bold uppercase flex items-center gap-1">
                              <RefreshCw size={10} className="animate-spin-slow" /> INSTANT_SYNC_AVAILABLE
                           </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-12 text-center bg-black/40 border border-dashed border-neutral-800 rounded-[2.5rem]">
                       <AlertTriangle className="mx-auto text-neutral-800 mb-4" size={40} />
                       <p className="text-[10px] text-neutral-700 font-black uppercase tracking-widest">NO_GATEWAYS_DETACHED // CONTACT_ROOT_ADMIN</p>
                    </div>
                  )}
               </div>

               <button 
                onClick={() => setIsBridgeMode(false)}
                className="w-full py-4 text-[10px] font-black text-neutral-700 uppercase tracking-widest hover:text-white transition-colors"
               >
                 Abort Bridge & Return to Bidding
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