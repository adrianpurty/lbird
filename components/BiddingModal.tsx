
import React, { useState, useMemo, useEffect } from 'react';
import { X, Globe, Target, Phone, Zap, ChevronRight, Calculator, AlertTriangle, Wallet, Info, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { Lead, User, PurchaseRequest } from '../types.ts';

interface BiddingModalProps {
  lead: Lead;
  user: User;
  onClose: () => void;
  onSubmit: (data: any) => void;
  onRefill: () => void;
  existingPurchase?: PurchaseRequest;
}

const BiddingModal: React.FC<BiddingModalProps> = ({ lead, user, onClose, onSubmit, onRefill, existingPurchase }) => {
  const isEditMode = !!existingPurchase;
  const minBid = isEditMode ? existingPurchase.bidAmount : lead.currentBid + 1;
  
  const [purchaseMode, setPurchaseMode] = useState<'bid' | 'buy_now'>(existingPurchase?.purchaseMode || 'bid');
  const [formData, setFormData] = useState({
    buyerBusinessUrl: existingPurchase?.buyerBusinessUrl || user.defaultBusinessUrl || user.companyWebsite || '',
    buyerTargetLeadUrl: existingPurchase?.buyerTargetLeadUrl || user.defaultTargetUrl || '',
    buyerTollFree: existingPurchase?.buyerTollFree || user.phone || '',
    leadsPerDay: existingPurchase?.leadsPerDay || 50,
    bidAmount: existingPurchase?.bidAmount || minBid
  });

  const activePrice = useMemo(() => {
    if (purchaseMode === 'buy_now' && lead.buyNowPrice) return lead.buyNowPrice;
    return formData.bidAmount;
  }, [purchaseMode, lead.buyNowPrice, formData.bidAmount]);

  const totalDailyCost = activePrice * formData.leadsPerDay;
  const hasInsufficientFunds = totalDailyCost > user.balance;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-2xl bg-black border border-[#1A1A1A] rounded-[3rem] shadow-[0_50px_150px_-20px_rgba(0,0,0,1)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 max-h-[95vh]">
        
        {/* HUD HEADER */}
        <div className="flex justify-between items-center p-8 border-b border-[#1A1A1A] bg-[#1A1A1A]/10">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-[#1A1A1A] rounded-2xl flex items-center justify-center text-[#FACC15] shadow-lg border border-[#FACC15]/20">
              {isEditMode ? <RefreshCw size={28} className="animate-spin-slow" /> : <Zap size={28} />}
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none font-futuristic">
                {isEditMode ? 'RECONFIGURE' : 'ASSET'} <span className="text-[#FACC15]">SYNC</span>
              </h2>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] mt-2 text-neutral-600">NODE_AUTH: {lead.id.slice(0, 12)}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-all text-neutral-600 hover:text-white">
            <X size={28} />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto scrollbar-hide">
          {/* PURCHASE MODE TOGGLE */}
          {!isEditMode && (
            <div className="flex bg-[#0A0A0A] p-1.5 rounded-[2rem] border border-white/5">
                <button 
                onClick={() => setPurchaseMode('bid')}
                className={`flex-1 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${purchaseMode === 'bid' ? 'bg-[#FACC15] text-black shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                BID_AUCTION
                </button>
                <button 
                onClick={() => setPurchaseMode('buy_now')}
                className={`flex-1 py-3 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest transition-all ${purchaseMode === 'buy_now' ? 'bg-[#FACC15] text-black shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
                >
                INSTANT_BUY
                </button>
            </div>
          )}

          {/* TELEMETRY READOUT */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#0A0A0A] p-5 rounded-3xl border border-white/5">
              <span className="text-neutral-600 text-[8px] font-black uppercase tracking-[0.4em] block mb-2">TARGET_UNIT_VAL</span>
              <span className="text-[#FACC15] text-2xl font-black italic tracking-tighter font-tactical">
                ${activePrice.toLocaleString()}
              </span>
            </div>
            <div className="bg-[#0A0A0A] p-5 rounded-3xl border border-white/5">
              <span className="text-neutral-600 text-[8px] font-black uppercase tracking-[0.4em] block mb-2">LIQUIDITY_BUFFER</span>
              <span className="text-white text-2xl font-black italic tracking-tighter font-tactical">
                ${user.balance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* FORM DATA: DELIVERY ENDPOINTS */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                        <Globe size={12} className="text-[#FACC15]" /> OFFICIAL_BUSINESS_URL
                    </label>
                    <input 
                        className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl px-5 py-4 text-[#FACC15] font-mono text-xs outline-none focus:border-[#FACC15]/40 transition-all placeholder:text-neutral-800"
                        placeholder="https://your-business.com"
                        value={formData.buyerBusinessUrl}
                        onChange={e => setFormData({...formData, buyerBusinessUrl: e.target.value})}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                        <Phone size={12} className="text-[#FACC15]" /> TOLL_FREE_ROUTING
                    </label>
                    <input 
                        className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl px-5 py-4 text-white font-mono text-xs outline-none focus:border-[#FACC15]/40 transition-all placeholder:text-neutral-800"
                        placeholder="+1-800-000-0000"
                        value={formData.buyerTollFree}
                        onChange={e => setFormData({...formData, buyerTollFree: e.target.value})}
                    />
                </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                <Target size={12} className="text-[#FACC15]" /> TARGET_POST_BACK_ENDPOINT
              </label>
              <input 
                className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl px-5 py-4 text-[#FACC15] font-mono text-xs outline-none focus:border-[#FACC15]/40 transition-all placeholder:text-neutral-800"
                placeholder="https://your-crm.io/leads/ingest"
                value={formData.buyerTargetLeadUrl}
                onChange={e => setFormData({...formData, buyerTargetLeadUrl: e.target.value})}
              />
              <p className="text-[8px] text-neutral-700 font-bold uppercase tracking-widest mt-1 px-2 italic">
                * Specify the webhook or API endpoint where verified lead data will be delivered.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] px-2">DAILY_VOLUME_NODES</label>
                    <input 
                        type="number"
                        className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-[#FACC15]/40"
                        value={formData.leadsPerDay}
                        onChange={e => setFormData({...formData, leadsPerDay: parseInt(e.target.value) || 0})}
                    />
                </div>
                {purchaseMode === 'bid' && (
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] px-2">BID_VALUATION ($)</label>
                        <input 
                            type="number"
                            min={minBid}
                            className="w-full bg-[#0A0A0A] border border-[#1A1A1A] rounded-xl px-5 py-4 text-[#FACC15] font-black outline-none focus:border-[#FACC15]/40"
                            value={formData.bidAmount}
                            onChange={e => setFormData({...formData, bidAmount: parseFloat(e.target.value) || 0})}
                        />
                    </div>
                )}
            </div>
          </div>

          {/* SETTLEMENT BLOCK */}
          <div className="bg-[#1A1A1A]/40 border border-white/5 rounded-3xl p-6 space-y-4">
             <div className="flex justify-between items-center text-[10px] font-black text-neutral-500 uppercase tracking-widest">
                <span>ESTIMATED_DAILY_BURN</span>
                <span className={hasInsufficientFunds ? 'text-red-500' : 'text-emerald-500'}>
                    ${totalDailyCost.toLocaleString()}
                </span>
             </div>
             <div className="w-full h-1 bg-black rounded-full overflow-hidden">
                <div 
                    className={`h-full transition-all duration-500 ${hasInsufficientFunds ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-[#FACC15] shadow-[0_0_10px_#FACC15]'}`} 
                    style={{ width: `${Math.min(100, (totalDailyCost / user.balance) * 100)}%` }} 
                />
             </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={() => onSubmit({...formData, purchaseMode, totalDailyCost, id: existingPurchase?.id})}
              disabled={hasInsufficientFunds}
              className={`w-full py-6 rounded-[2rem] font-black text-xl uppercase italic tracking-widest transition-all border-b-8 active:border-b-0 active:translate-y-2 shadow-2xl font-tactical flex items-center justify-center gap-4 ${hasInsufficientFunds ? 'bg-white/5 text-neutral-800 border-black grayscale cursor-not-allowed' : 'bg-[#FACC15] text-black border-yellow-800 hover:bg-white'}`}
            >
              {hasInsufficientFunds ? <><AlertTriangle size={20} /> LIQUIDITY_ERROR</> : <><ShieldCheck size={20} /> {isEditMode ? 'COMMIT_RECONFIGURATION' : 'INITIALIZE_SYNC'}</>}
            </button>
            {hasInsufficientFunds && (
              <button onClick={onRefill} className="w-full mt-6 text-[#FACC15] text-[10px] font-black uppercase tracking-[0.4em] hover:underline flex items-center justify-center gap-2">
                <Wallet size={12} /> RECHARGE_VAULT_NODE
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default BiddingModal;
