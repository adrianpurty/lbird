import React, { useState, useMemo, useEffect } from 'react';
import { X, Globe, Target, Phone, Zap, ChevronRight, Calculator, AlertTriangle, Wallet, Info, ArrowRight, CreditCard, RefreshCw, Calendar, Clock, Scan, Globe as GlobeIcon, Bitcoin, Smartphone, Landmark, Database, CheckCircle2, Loader2, ArrowUpRight, ShieldCheck, Briefcase, ShieldAlert, ArrowLeft, Terminal } from 'lucide-react';
import { Lead, User, GatewayAPI } from '../types.ts';
import { soundService } from '../services/soundService.ts';
import { paymentService } from '../services/paymentService.ts';
import { apiService } from '../services/apiService.ts';

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
  const [isGatewaySyncing, setIsGatewaySyncing] = useState(false);
  const [gatewayStep, setGatewayStep] = useState('');
  const [error, setError] = useState<string | null>(null);

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
    } catch (error: any) {
      const msg = error instanceof Error ? error.message : "ACQUISITION_EXECUTION_FAILED";
      setError(msg);
      console.error("Acquisition execution failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDirectSettlement = async (gateway: GatewayAPI) => {
    setIsGatewaySyncing(true);
    setError(null);
    soundService.playClick(true);
    
    try {
      setGatewayStep(`HANDSHAKING_WITH_${gateway.provider.toUpperCase()}...`);
      await paymentService.validateGateway(gateway);
      
      setGatewayStep("UPLINK_ESTABLISHED: PROCESSING_LIVE_SETTLEMENT...");
      const { txnId } = await paymentService.processTransaction(gateway, totalDailyCost);
      
      setGatewayStep("SETTLEMENT_VERIFIED: SYNCING_VAULT_BALANCE...");
      await apiService.deposit(user.id, totalDailyCost, gateway.name, txnId);
      
      setGatewayStep("HANDSHAKE_COMPLETE: BROADCASTING_BID...");
      await onSubmit({ ...formData, totalDailyCost });
      
      setIsSuccess(true);
    } catch (e: any) {
      const msg = e instanceof Error ? e.message : (typeof e === 'string' ? e : "GATEWAY_PROTOCOL_REJECTION");
      setError(msg);
    } finally {
      setIsGatewaySyncing(false);
      setGatewayStep('');
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
      <div className="w-full max-w-2xl max-h-[95vh] bg-surface border border-bright rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden relative">
        
        {isGatewaySyncing && (
          <div className="absolute inset-0 z-[110] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-12 space-y-8 animate-in fade-in duration-500">
             <div className="relative">
                <div className="w-24 h-24 rounded-[2.5rem] bg-accent/10 border-2 border-accent/40 flex items-center justify-center text-accent">
                   <RefreshCw size={48} className="animate-spin" />
                </div>
                <div className="absolute -inset-4 border border-accent/20 border-dashed rounded-[3.5rem] animate-spin-slow" />
             </div>
             <div className="space-y-4">
                <h3 className="text-2xl font-futuristic text-white italic uppercase tracking-tighter">GATEWAY_HANDSHAKE</h3>
                <p className="text-[10px] text-accent font-black uppercase tracking-[0.4em] animate-pulse">{gatewayStep}</p>
             </div>
          </div>
        )}

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
                  <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-[80px] animate-pulse" />
                  <div className="w-32 h-32 rounded-[2.5rem] bg-amber-500 text-black flex items-center justify-center shadow-xl relative z-10">
                     <Clock size={64} />
                  </div>
               </div>
               
               <div className="space-y-4">
                  <h2 className="text-4xl font-futuristic font-black text-white italic uppercase tracking-tighter leading-none">ESCROW SECURED</h2>
                  <p className="text-dim text-[11px] font-bold uppercase tracking-[0.4em] max-w-[300px] mx-auto leading-relaxed">
                    AWAITING_ADMIN_AUTHORIZATION // VAULT_FUNDS_LOCKED
                  </p>
               </div>

               <button 
                onClick={onRedirectToActionCenter}
                className="group relative w-full py-6 bg-white text-black rounded-[2.5rem] font-black text-xl uppercase italic tracking-widest border-b-[8px] border-neutral-300 active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-6"
               >
                 Track in Action Center <ArrowUpRight size={28} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
               </button>
            </div>
          ) : isConfirming ? (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
               <div className="bg-red-500/5 border border-red-500/20 p-8 rounded-[2.5rem] flex items-start gap-6">
                  <ShieldAlert className="text-red-500 shrink-0" size={32} />
                  <div className="space-y-2">
                     <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Authorize Escrow Lock</h3>
                     <p className="text-[10px] text-dim leading-relaxed font-bold uppercase tracking-widest">
                       Funds will be immediately deducted from your vault and held in the admin escrow node.
                     </p>
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
                    className="py-5 bg-amber-600 text-black rounded-[2.5rem] font-black text-lg uppercase italic tracking-widest border-b-[8px] border-amber-800 hover:bg-amber-500 transition-all flex items-center justify-center gap-4 shadow-xl active:translate-y-1 active:border-b-0"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 'Authorize Escrow Lock'}
                    {!isSubmitting && <ShieldCheck size={24} />}
                  </button>
               </div>
            </div>
          ) : !isBridgeMode ? (
            <form onSubmit={handleExecute} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              
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
                    <Phone size={12} className="text-accent" /> Contact Phone
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
                  <Target size={12} className="text-accent" /> Delivery Endpoint
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

              {error && (
                 <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-500 animate-in shake duration-300">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{String(error)}</span>
                 </div>
              )}

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
                {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : 
                 hasInsufficientFunds ? 'Initiate Liquidity Sync' : initialBid ? 'Authorize Acquisition' : 'Broadcast Asset Bid'} 
                {!isSubmitting && <ArrowRight size={24} />}
              </button>
            </form>
          ) : (
            <div className="space-y-8 animate-in zoom-in-95 duration-500">
               {error && (
                 <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl flex items-center gap-4 text-red-500 animate-in shake duration-300">
                    <ShieldAlert size={20} className="shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">{String(error)}</span>
                 </div>
               )}

               <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-[2.5rem] flex items-start gap-6">
                  <Wallet className="text-amber-500 shrink-0" size={32} />
                  <div className="space-y-2">
                     <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Instant Settlement Required</h3>
                     <p className="text-[10px] text-dim leading-relaxed font-bold uppercase tracking-widest">
                       Vault Balance is below required settlement. Use a live financial node to process acquisition instantly.
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
                          onClick={() => handleDirectSettlement(g)}
                          disabled={isGatewaySyncing}
                          className="bg-black/40 border border-bright rounded-3xl p-6 text-left hover:border-accent transition-all flex flex-col gap-4 group shadow-sm relative overflow-hidden"
                        >
                           <div className="flex items-center gap-4 relative z-10">
                              <div className="w-10 h-10 rounded-xl bg-black border border-neutral-800 flex items-center justify-center text-neutral-500 group-hover:text-accent transition-colors">
                                 <NodeIcon size={20} />
                              </div>
                              <h4 className="text-lg font-black text-white italic truncate uppercase flex-1">{g.name}</h4>
                           </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="col-span-full py-12 text-center bg-black/60 border border-dashed border-bright rounded-[2.5rem]">
                       <AlertTriangle className="mx-auto text-neutral-700 mb-4" size={40} />
                       <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">NO_SYNC_NODES_FOUND</p>
                    </div>
                  )}
               </div>

               <div className="flex flex-col gap-4">
                  <button 
                    onClick={onRefill}
                    className="w-full py-5 bg-neutral-900 text-white border border-neutral-800 rounded-[2.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-neutral-800 transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    <Terminal size={16} /> Open Vault API Configuration
                  </button>
                  <button 
                    onClick={() => setIsBridgeMode(false)}
                    className="w-full py-2 text-[9px] font-black text-neutral-700 uppercase tracking-[0.3em] hover:text-neutral-400 transition-colors"
                  >
                    Abort Handshake & Return to Review
                  </button>
               </div>
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