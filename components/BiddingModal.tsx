import React, { useState, useMemo, useEffect } from 'react';
import { X, Globe, Target, Phone, Zap, ChevronRight, Calculator, AlertTriangle, Wallet, Info } from 'lucide-react';
import { Lead, User } from '../types.ts';

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

const HelpTip = ({ text }: { text: string }) => (
  <div className="group relative inline-block ml-1 align-middle">
    <Info size={14} className="text-neutral-500 hover:text-[#00e5ff] cursor-help transition-colors" />
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-4 bg-black border-2 border-neutral-700 rounded-2xl text-[10px] text-neutral-300 font-bold uppercase tracking-widest leading-relaxed opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-[110] shadow-2xl backdrop-blur-md">
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl overflow-hidden">
      <div className="w-full max-w-2xl max-h-[95vh] bg-[#1a1a1a] border-4 border-neutral-800 rounded-[3rem] shadow-[0_50px_150px_-20px_rgba(0,0,0,1)] flex flex-col animate-in zoom-in-95 duration-300">
        
        <div className="flex justify-between items-center p-8 sm:p-10 border-b-2 border-neutral-800 bg-black/40 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-[#00e5ff] rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)]">
              <Zap className="text-black" size={28} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none italic">Provision Lead Pipeline</h2>
              <p className="text-[#00e5ff] text-[10px] font-black uppercase tracking-widest mt-2">Target Node: {lead.title.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-neutral-800 rounded-full transition-all text-neutral-500 hover:text-white active:scale-90">
            <X size={32} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 sm:p-10 space-y-8 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6">
            <div className="flex-1 bg-black p-6 rounded-3xl border-2 border-neutral-800 flex justify-between items-center shadow-inner">
              <div>
                <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest block leading-none mb-2">Protocol Floor</span>
                <span className="text-[#00e5ff] text-2xl font-black italic tracking-tighter">${minBid.toLocaleString()} <span className="text-[11px] text-neutral-600 font-black uppercase not-italic ml-1">USD/EA</span></span>
              </div>
            </div>
            <div className="flex-1 bg-[#00e5ff] p-6 rounded-3xl border-2 border-[#00b8cc] flex justify-between items-center shadow-lg group hover:shadow-[0_0_30px_rgba(0,229,255,0.2)] transition-all">
              <div>
                <span className="text-black/60 text-[10px] font-black uppercase tracking-widest block leading-none mb-2">Node Liquidity</span>
                <span className="text-black text-2xl font-black italic tracking-tighter">${user.balance.toLocaleString()}</span>
              </div>
              <Wallet size={24} className="text-black/60" />
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2 px-2 italic">
                  <Globe size={14} className="text-[#00e5ff]" /> Identity Origin
                </label>
                <input 
                  required
                  type="url"
                  className="w-full bg-black border-2 border-neutral-800 rounded-2xl px-6 py-4 text-neutral-200 text-sm font-bold outline-none focus:border-[#00e5ff] transition-all shadow-inner"
                  placeholder="https://official-hq.com"
                  value={formData.buyerBusinessUrl}
                  onChange={e => setFormData({...formData, buyerBusinessUrl: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2 px-2 italic">
                  <Phone size={14} className="text-[#00e5ff]" /> Endpoint ID
                </label>
                <input 
                  required
                  type="text"
                  className="w-full bg-black border-2 border-neutral-800 rounded-2xl px-6 py-4 text-neutral-200 text-sm font-bold outline-none focus:border-[#00e5ff] transition-all shadow-inner"
                  placeholder="e.g. 1-800-PROVISION"
                  value={formData.buyerTollFree}
                  onChange={e => setFormData({...formData, buyerTollFree: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2 px-2 italic">
                <Target size={14} className="text-[#00e5ff]" /> POST-BACK TERMINAL (WEBHOOK)
              </label>
              <input 
                required
                type="url"
                className="w-full bg-black border-2 border-neutral-800 rounded-2xl px-6 py-4 text-neutral-200 text-sm font-bold outline-none focus:border-[#00e5ff] transition-all shadow-inner"
                placeholder="https://api.crm.io/v1/ingest"
                value={formData.buyerTargetLeadUrl}
                onChange={e => setFormData({...formData, buyerTargetLeadUrl: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-6 pt-2 bg-black/60 p-8 rounded-[2.5rem] border-2 border-neutral-800 shadow-inner">
            <div className="flex justify-between items-end mb-4">
              <label className="text-xs font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2 italic">
                <Calculator size={18} className="text-[#00e5ff]" /> Daily Batch Protocol
                <HelpTip text="Target nodes to process per 24h cycle. Adjusting this modifies your total daily clearing amount." />
              </label>
              <div className="text-right">
                <span className="text-3xl font-black text-white italic tracking-tighter">{formData.leadsPerDay}</span>
                <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest ml-3 italic">UNITS/DAY</span>
              </div>
            </div>
            
            <div className="relative h-12 flex items-center">
              <input 
                type="range"
                min="1"
                max="1000"
                step="1"
                className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-[#00e5ff] hover:accent-[#22d3ee] transition-all"
                value={formData.leadsPerDay}
                onChange={e => setFormData({...formData, leadsPerDay: parseInt(e.target.value) || 1})}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-2 flex items-center gap-2 italic">
              UNIT SETTLEMENT BID ($)
              <HelpTip text="Your maximum bid for a single asset. Higher bids receive priority in the automated distribution waterfall." />
            </label>
            <div className="relative">
              <input 
                required
                type="number"
                min={minBid}
                step="0.01"
                className={`w-full bg-black border-4 ${isBidTooLow ? 'border-red-600' : 'border-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.1)]'} rounded-3xl px-8 py-6 text-4xl font-black text-white outline-none focus:ring-8 focus:ring-[#00e5ff]/10 transition-all text-center shadow-inner`}
                value={formData.bidAmount}
                onChange={e => setFormData({...formData, bidAmount: parseFloat(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className={`${hasInsufficientFunds ? 'bg-red-600' : 'bg-[#222]'} border-4 ${hasInsufficientFunds ? 'border-red-800' : 'border-neutral-700'} rounded-[3rem] p-8 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-500 shadow-2xl`}>
             <div className="flex items-center gap-6">
                <div className={`w-16 h-16 rounded-2xl ${hasInsufficientFunds ? 'bg-black/20 text-white' : 'bg-[#00e5ff] text-black shadow-[0_0_20px_rgba(0,229,255,0.4)]'} flex items-center justify-center shrink-0`}>
                  <Calculator size={32} />
                </div>
                <div>
                  <span className={`${hasInsufficientFunds ? 'text-white/60' : 'text-neutral-500'} text-[10px] font-black uppercase tracking-widest block leading-none mb-2 italic`}>AGGREGATE DAILY BURN</span>
                  <span className={`${hasInsufficientFunds ? 'text-white' : 'text-neutral-200'} text-3xl font-black tracking-widest italic`}>
                    ${totalDailyCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
             </div>
             {hasInsufficientFunds && (
                <div className="text-white text-[11px] font-black uppercase flex items-center gap-2 animate-pulse bg-black/30 px-6 py-3 rounded-2xl border-2 border-white/20">
                  <AlertTriangle size={18} /> INSUFFICIENT LIQUIDITY
                </div>
             )}
          </div>

          <button 
            type="submit"
            disabled={isBidTooLow}
            className={`w-full py-8 rounded-[3rem] font-black text-2xl sm:text-3xl transition-all flex items-center justify-center gap-6 active:scale-[0.98] mt-6 border-b-[10px] ${
              isBidTooLow 
              ? 'bg-neutral-800 text-neutral-600 border-neutral-900 cursor-not-allowed' 
              : 'bg-black text-white border-neutral-800 hover:bg-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
            }`}
          >
            {hasInsufficientFunds ? 'DEPOSIT FUNDS' : 'AUTHORIZE ACQUISITION'} <ChevronRight size={32} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default BiddingModal;