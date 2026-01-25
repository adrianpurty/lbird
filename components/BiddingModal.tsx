
import React, { useState, useMemo } from 'react';
import { X, Globe, Target, Phone, Zap, ChevronRight, Calculator, AlertTriangle, Wallet, Info, ArrowRight } from 'lucide-react';
import { Lead, User } from '../types.ts';

interface BiddingModalProps {
  lead: Lead;
  user: User;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onRefill: () => void;
}

const BiddingModal: React.FC<BiddingModalProps> = ({ lead, user, onClose, onSubmit, onRefill }) => {
  const minBid = lead.currentBid + 1;
  const [purchaseMode, setPurchaseMode] = useState<'bid' | 'buy_now'>('bid');
  const [formData, setFormData] = useState({
    buyerBusinessUrl: user.defaultBusinessUrl || '',
    buyerTargetLeadUrl: user.defaultTargetUrl || '',
    buyerTollFree: user.phone || '',
    leadsPerDay: 50,
    bidAmount: minBid
  });

  const activePrice = useMemo(() => {
    if (purchaseMode === 'buy_now' && lead.buyNowPrice) return lead.buyNowPrice;
    return formData.bidAmount;
  }, [purchaseMode, lead.buyNowPrice, formData.bidAmount]);

  const totalDailyCost = activePrice * formData.leadsPerDay;
  const hasInsufficientFunds = totalDailyCost > user.balance;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-black border border-[#1A1A1A] rounded-[3rem] shadow-[0_50px_150px_-20px_rgba(0,0,0,1)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
        
        <div className="flex justify-between items-center p-10 border-b border-[#1A1A1A] bg-[#1A1A1A]/10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#1A1A1A] rounded-2xl flex items-center justify-center text-[#FACC15] shadow-lg border border-[#FACC15]/20">
              <Zap size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">
                ASSET <span className="text-[#FACC15]">SYNC</span>
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] mt-3 text-neutral-600">ID: {lead.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white/5 rounded-full transition-all text-neutral-600 hover:text-white">
            <X size={32} />
          </button>
        </div>

        <div className="p-10 space-y-10 overflow-y-auto max-h-[70vh] scrollbar-hide">
          <div className="flex bg-[#1A1A1A] p-1.5 rounded-[2rem] border border-white/5">
            <button 
              onClick={() => setPurchaseMode('bid')}
              className={`flex-1 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all ${purchaseMode === 'bid' ? 'bg-[#FACC15] text-black shadow-lg' : 'text-neutral-500'}`}
            >
              BID_AUCTION
            </button>
            <button 
              onClick={() => setPurchaseMode('buy_now')}
              className={`flex-1 py-4 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest transition-all ${purchaseMode === 'buy_now' ? 'bg-[#FACC15] text-black shadow-lg' : 'text-neutral-500'}`}
            >
              INSTANT_BUY
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#1A1A1A] p-6 rounded-3xl border border-white/5">
              <span className="text-neutral-600 text-[9px] font-black uppercase tracking-[0.4em] block mb-2">TARGET_VAL</span>
              <span className="text-[#FACC15] text-3xl font-black italic tracking-tighter font-tactical">${activePrice.toLocaleString()}</span>
            </div>
            <div className="bg-[#1A1A1A] p-6 rounded-3xl border border-white/5">
              <span className="text-neutral-600 text-[9px] font-black uppercase tracking-[0.4em] block mb-2">VAULT_BALANCE</span>
              <span className="text-white text-3xl font-black italic tracking-tighter font-tactical">${user.balance.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] px-2">ENTITY_URL</label>
              <input 
                className="w-full bg-black border border-[#1A1A1A] rounded-2xl px-6 py-5 text-[#FACC15] font-mono text-sm outline-none focus:border-[#FACC15]/50 transition-all"
                value={formData.buyerBusinessUrl}
                onChange={e => setFormData({...formData, buyerBusinessUrl: e.target.value})}
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] px-2">POST_BACK_ENDPOINT</label>
              <input 
                className="w-full bg-black border border-[#1A1A1A] rounded-2xl px-6 py-5 text-[#FACC15] font-mono text-sm outline-none focus:border-[#FACC15]/50 transition-all"
                value={formData.buyerTargetLeadUrl}
                onChange={e => setFormData({...formData, buyerTargetLeadUrl: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-6">
            <button 
              onClick={() => onSubmit(formData)}
              disabled={hasInsufficientFunds}
              className={`w-full py-8 rounded-[2.5rem] font-black text-2xl uppercase italic tracking-widest transition-all border-b-8 active:border-b-0 active:translate-y-2 shadow-2xl font-tactical ${hasInsufficientFunds ? 'bg-white/5 text-neutral-800 border-black grayscale' : 'bg-[#FACC15] text-black border-yellow-800 hover:bg-white'}`}
            >
              {hasInsufficientFunds ? 'LIQUIDITY_ERROR' : 'INITIALIZE_TRANSFER'}
            </button>
            {hasInsufficientFunds && (
              <button onClick={onRefill} className="w-full mt-6 text-[#FACC15] text-[11px] font-black uppercase tracking-[0.4em] hover:underline">RECHARGE_VAULT_NODE</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiddingModal;
