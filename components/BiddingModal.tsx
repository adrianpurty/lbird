
import React, { useState, useMemo, useEffect } from 'react';
import { X, Globe, Target, Phone, Zap, ChevronRight, Calculator, AlertTriangle, Wallet, Info } from 'lucide-react';
import { Lead, User } from '../types';

interface BiddingModalProps {
  lead: Lead;
  user: User;
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
}

// Inline component for help tooltips in the modal
const HelpTip = ({ text }: { text: string }) => (
  <div className="group relative inline-block ml-1 align-middle">
    <Info size={12} className="text-neutral-500 hover:text-[#facc15] cursor-help transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-black border border-white/10 rounded-xl text-[10px] text-white font-medium leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[110] shadow-2xl backdrop-blur-md">
      {text}
    </div>
  </div>
);

const BiddingModal: React.FC<BiddingModalProps> = ({ lead, user, onClose, onSubmit, onRefill }) => {
  const minBid = lead.currentBid + 1;
  const [formData, setFormData] = useState<Omit<BiddingFormData, 'totalDailyCost'>>({
    buyerBusinessUrl: user.defaultBusinessUrl || '',
    buyerTargetLeadUrl: user.defaultTargetUrl || '',
    buyerTollFree: user.phone || '',
    leadsPerDay: 50,
    bidAmount: minBid
  });

  const totalDailyCost = useMemo(() => {
    return formData.bidAmount * formData.leadsPerDay;
  }, [formData.bidAmount, formData.leadsPerDay]);

  const isBidTooLow = formData.bidAmount <= lead.currentBid;
  const hasInsufficientFunds = totalDailyCost > user.balance;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBidTooLow) return;
    if (hasInsufficientFunds) {
      onRefill();
      return;
    }
    onSubmit({ ...formData, totalDailyCost });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md overflow-hidden">
      <div className="w-full max-w-xl max-h-[90vh] bg-[#0d111a] border border-[#facc15]/20 rounded-[2rem] shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center p-6 sm:p-8 border-b border-white/5 bg-black/20 shrink-0">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tighter">Initialize Lead Purchase</h2>
            <p className="text-[#facc15] text-[10px] font-black uppercase tracking-widest mt-1">Acquiring: {lead.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-neutral-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex-1 bg-[#1a202c] p-4 sm:p-5 rounded-2xl border border-white/5 flex justify-between items-center">
              <div>
                <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest block leading-none mb-1">Min Next Bid</span>
                <span className="text-emerald-500 text-lg font-black italic">${minBid} <span className="text-[10px] text-neutral-600 font-black uppercase not-italic">/ unit</span></span>
              </div>
            </div>
            <div className="flex-1 bg-[#facc15]/5 p-4 sm:p-5 rounded-2xl border border-[#facc15]/20 flex justify-between items-center">
              <div>
                <span className="text-[#facc15] text-[10px] font-black uppercase tracking-widest block leading-none mb-1">Your Credits</span>
                <span className="text-white text-lg font-black italic">${user.balance.toLocaleString()}</span>
              </div>
              <Wallet size={18} className="text-[#facc15] opacity-50" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Globe size={12} className="text-[#facc15]" /> Official Domain
                </label>
                <input 
                  required
                  type="url"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#facc15] transition-all"
                  placeholder="https://your-hq.com"
                  value={formData.buyerBusinessUrl}
                  onChange={e => setFormData({...formData, buyerBusinessUrl: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2 px-1">
                  <Phone size={12} className="text-[#facc15]" /> Endpoint
                </label>
                <input 
                  required
                  type="text"
                  className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#facc15] transition-all"
                  placeholder="e.g. 1-800-LEADS"
                  value={formData.buyerTollFree}
                  onChange={e => setFormData({...formData, buyerTollFree: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2 px-1">
                <Target size={12} className="text-[#facc15]" /> Webhook / Post-Back URL
              </label>
              <input 
                required
                type="url"
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#facc15] transition-all"
                placeholder="https://crm.yoursite.com/ingest"
                value={formData.buyerTargetLeadUrl}
                onChange={e => setFormData({...formData, buyerTargetLeadUrl: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-4 pt-2 bg-black/40 p-4 sm:p-6 rounded-3xl border border-neutral-900">
            <div className="flex justify-between items-end mb-2">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-1">
                <Zap size={14} className="text-[#facc15]" /> Daily Volume Protocol
                <HelpTip text="Target number of leads you wish to acquire per 24h cycle. Adjusting this impacts your daily settlement total." />
              </label>
              <div className="text-right">
                <span className="text-xl sm:text-2xl font-black text-white italic">{formData.leadsPerDay}</span>
                <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest ml-1 sm:ml-2 italic">Units/Day</span>
              </div>
            </div>
            
            <div className="relative h-10 flex items-center">
              <input 
                type="range"
                min="1"
                max="1000"
                step="1"
                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#facc15] hover:accent-yellow-500 transition-all"
                value={formData.leadsPerDay}
                onChange={e => setFormData({...formData, leadsPerDay: parseInt(e.target.value) || 1})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1 flex items-center gap-1">
              Unit Bid Amount ($)
              <HelpTip text="The maximum price you are willing to pay for a single verified lead. Higher bids increase your priority in the distribution waterfall." />
            </label>
            <div className="relative">
              <input 
                required
                type="number"
                min={minBid}
                step="0.01"
                className={`w-full bg-black border ${isBidTooLow ? 'border-red-500/50' : 'border-[#facc15]/30'} rounded-2xl px-6 py-4 sm:py-5 text-2xl sm:text-3xl font-black outline-none focus:border-[#facc15] transition-all`}
                value={formData.bidAmount}
                onChange={e => setFormData({...formData, bidAmount: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className={`${hasInsufficientFunds ? 'bg-red-500/10 border-red-500/30' : 'bg-[#facc15]/5 border-[#facc15]/10'} border rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-500`}>
             <div className="flex items-center gap-4 sm:gap-6">
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${hasInsufficientFunds ? 'bg-red-500/20 text-red-500' : 'bg-[#facc15]/10 text-[#facc15]'} flex items-center justify-center shrink-0`}>
                  <Calculator size={28} className="sm:size-[32px]" />
                </div>
                <div>
                  <span className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.3em] block leading-none mb-2">Aggregate Daily Settlement</span>
                  <span className={`${hasInsufficientFunds ? 'text-red-500' : 'text-white'} text-2xl sm:text-3xl font-black tracking-tighter italic`}>
                    ${totalDailyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
             </div>
             {hasInsufficientFunds && (
                <div className="flex flex-col items-center sm:items-end gap-1">
                  <div className="text-red-500 text-[10px] font-black uppercase flex items-center gap-1.5 animate-pulse bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20">
                    <AlertTriangle size={14} /> Critical Balance
                  </div>
                </div>
             )}
          </div>

          <button 
            type="submit"
            disabled={isBidTooLow}
            className={`w-full py-5 sm:py-7 rounded-[1.5rem] sm:rounded-[2.5rem] font-black text-xl sm:text-2xl transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.97] mt-4 transform ${
              isBidTooLow 
              ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50 grayscale' 
              : hasInsufficientFunds 
                ? 'bg-red-600 text-white hover:bg-red-500 border-b-[6px] border-red-800 shadow-red-500/20'
                : 'bg-[#facc15] text-black hover:bg-[#eab308] border-b-[6px] border-yellow-600 shadow-yellow-400/20'
            }`}
          >
            {hasInsufficientFunds ? 'RECHARGE NODE' : 'LOCK IN BUY ORDER'} <ChevronRight size={28} className="sm:size-[32px]" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default BiddingModal;
