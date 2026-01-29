
import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, Wallet, Bitcoin, Smartphone, Zap, Activity, History, ArrowDownLeft, 
  ArrowUpRight, Database, DollarSign, CreditCard, Scan, Download, Globe, ArrowRight, 
  Cpu, AlertTriangle, CheckCircle2, RefreshCw, Lock, Terminal, Hash, Key, User as UserIcon, Briefcase, ChevronRight, Landmark
} from 'lucide-react';
import { GatewayAPI, WalletActivity } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface WalletSettingsProps {
  stripeConnected: boolean;
  onConnect: () => void;
  balance: number;
  onDeposit: (amount: number, provider?: string) => void;
  gateways: GatewayAPI[];
  walletActivities?: WalletActivity[];
}

const WalletSettings: React.FC<WalletSettingsProps> = ({ balance, onDeposit, gateways, walletActivities = [] }) => {
  const [amount, setAmount] = useState<string>('500');
  const [selectedGatewayId, setSelectedGatewayId] = useState<string | null>(null);
  const [showHandshakeHUD, setShowHandshakeHUD] = useState(false);
  const [handshakeStep, setHandshakeStep] = useState(0);
  const [flowMode, setFlowMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [error, setError] = useState<string | null>(null);

  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '' });
  const [vpaId, setVpaId] = useState('');
  const [walletAddr, setWalletAddr] = useState('');
  const [bankData, setBankData] = useState({ holder: '', bankName: '', accountNumber: '', routing: '' });

  // Rule 3: Filter for gateways that are active AND have keys
  const activeGateways = useMemo(() => gateways.filter(g => 
    g.status === 'active' && 
    (g.publicKey?.length > 5 || g.provider === 'upi' || g.provider === 'crypto')
  ), [gateways]);

  const selectedGateway = useMemo(() => gateways.find(g => g.id === selectedGatewayId), [gateways, selectedGatewayId]);

  const calculation = useMemo(() => {
    const num = parseFloat(amount) || 0;
    const feePercent = selectedGateway ? parseFloat(selectedGateway.fee) : 0;
    const feeAmount = (num * feePercent) / 100;
    const netAmount = flowMode === 'deposit' ? num - feeAmount : num;
    return { feeAmount, netAmount, feePercent };
  }, [amount, selectedGateway, flowMode]);

  const isFormValid = useMemo(() => {
    if (!selectedGateway || calculation.netAmount <= 0) return false;
    // Rule 3 Enforcement check
    if (flowMode === 'deposit' && (!selectedGateway.publicKey || selectedGateway.status !== 'active')) return false;

    const p = selectedGateway.provider;
    if (p === 'stripe') {
      if (flowMode === 'deposit') {
        return cardData.number.length >= 15 && cardData.expiry.includes('/') && cardData.cvc.length >= 3;
      } else {
        return bankData.holder.length > 2 && bankData.bankName.length > 2 && bankData.accountNumber.length > 5 && bankData.routing.length > 3;
      }
    }
    if (p === 'upi') return vpaId.includes('@');
    if (p === 'crypto' || p === 'binance') return walletAddr.length >= 26;
    return true;
  }, [selectedGateway, calculation.netAmount, cardData, vpaId, walletAddr, bankData, flowMode]);

  const getProviderIcon = (provider: string) => {
    const p = provider.toLowerCase();
    if (p.includes('stripe')) return Globe;
    if (p.includes('binance') || p.includes('scan')) return Scan;
    if (p.includes('crypto') || p.includes('bitcoin')) return Bitcoin;
    if (p.includes('upi') || p.includes('phone')) return Smartphone;
    return CreditCard;
  };

  const handleAuthorize = async () => {
    if (!isFormValid) return;
    setError(null);
    soundService.playClick(true);
    setShowHandshakeHUD(true);
    setHandshakeStep(1);

    try {
      await new Promise(r => setTimeout(r, 1000));
      setHandshakeStep(2);
      await new Promise(r => setTimeout(r, 1200));
      setHandshakeStep(3);
      await new Promise(r => setTimeout(r, 1000));
      setHandshakeStep(4);
      await new Promise(r => setTimeout(r, 800));

      const finalAmount = flowMode === 'deposit' ? calculation.netAmount : -calculation.netAmount;
      await onDeposit(finalAmount, selectedGateway?.name);
      
      setShowHandshakeHUD(false);
      setHandshakeStep(0);
      setAmount('500'); 
    } catch (e: any) {
      setError(e.message || "VAULT_HANDSHAKE_FAILED");
      setShowHandshakeHUD(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-4 pb-24 font-rajdhani animate-in fade-in duration-500 px-4 lg:px-0">
      
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
         <div className="flex-1 w-full bg-surface border border-bright rounded-2xl p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shadow-md">
                  <Wallet size={20} />
               </div>
               <div>
                  <span className="text-[8px] font-black text-dim uppercase tracking-widest block leading-none mb-1">AVAIL_LIQUIDITY</span>
                  <span className="text-xl font-tactical font-black text-main italic tracking-widest leading-none">${balance.toLocaleString()}</span>
               </div>
            </div>
            <div className="flex bg-input p-0.5 rounded-lg border border-bright">
               <button 
                 onClick={() => { soundService.playClick(); setFlowMode('deposit'); setSelectedGatewayId(null); }} 
                 className={`px-6 py-1.5 rounded-md text-[8px] font-black uppercase transition-all ${flowMode === 'deposit' ? 'bg-main text-surface shadow-md' : 'text-dim hover:text-main'}`}
               >
                 Deposit
               </button>
               <button 
                 onClick={() => { soundService.playClick(); setFlowMode('withdraw'); setSelectedGatewayId(null); }} 
                 className={`px-6 py-1.5 rounded-md text-[8px] font-black uppercase transition-all ${flowMode === 'withdraw' ? 'bg-main text-surface shadow-md' : 'text-dim hover:text-main'}`}
               >
                 Withdraw
               </button>
            </div>
         </div>

         <div className="hidden lg:flex w-64 bg-surface border border-bright rounded-2xl p-4 items-center gap-4 shadow-lg">
            <Activity className="text-emerald-500 animate-pulse" size={20} />
            <div>
               <span className="text-[8px] font-black text-dim uppercase tracking-widest block leading-none mb-1">NODE_STATUS</span>
               <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">ENCRYPTED_SYNC</span>
            </div>
         </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 text-red-500 animate-in shake duration-300">
          <AlertTriangle size={18} />
          <span className="text-[10px] font-black uppercase tracking-widest">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-surface border border-bright rounded-[2.5rem] p-6 sm:p-10 relative overflow-hidden shadow-2xl transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-6">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <DollarSign size={14} className="text-accent" />
                       <h3 className="text-[10px] font-black text-main uppercase tracking-[0.3em] italic">Settlement_Units</h3>
                    </div>
                    <div className="relative bg-input rounded-3xl border-2 border-bright p-6 flex flex-col items-center justify-center group focus-within:border-accent/40 transition-all shadow-inner">
                       <div className="flex items-center gap-3 w-full">
                          <span className="text-2xl font-tactical text-dim italic font-black leading-none shrink-0">$</span>
                          <input 
                            type="number" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            className="w-full bg-transparent border-none text-5xl font-black text-main outline-none font-tactical italic tracking-widest text-center" 
                          />
                       </div>
                    </div>
                 </div>

                 {selectedGateway && (
                   <div className="p-5 bg-input border border-bright rounded-2xl space-y-4 animate-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center gap-2">
                        <Lock size={12} className="text-accent/60" />
                        <span className="text-[9px] font-black text-dim uppercase tracking-widest">Data_Identifier_Manifest</span>
                      </div>

                      {selectedGateway.provider === 'stripe' && flowMode === 'deposit' && (
                        <div className="space-y-3">
                           <input placeholder="PAN_ID: 0000 0000 0000 0000" className="w-full bg-surface border border-bright rounded-xl px-4 py-2.5 text-main text-[10px] font-mono outline-none" value={cardData.number} onChange={e => setCardData({...cardData, number: e.target.value})} />
                           <div className="grid grid-cols-2 gap-3">
                             <input placeholder="MM/YY" className="w-full bg-surface border border-bright rounded-xl px-4 py-2.5 text-main text-[10px] font-mono outline-none text-center" value={cardData.expiry} onChange={e => setCardData({...cardData, expiry: e.target.value})} />
                             <input type="password" placeholder="CVC" className="w-full bg-surface border border-bright rounded-xl px-4 py-2.5 text-main text-[10px] font-mono outline-none text-center" value={cardData.cvc} onChange={e => setCardData({...cardData, cvc: e.target.value})} />
                           </div>
                        </div>
                      )}
                      {/* ... other provider fields ... */}
                   </div>
                 )}
              </div>

              <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Zap size={14} className="text-amber-500" />
                       <h3 className="text-[10px] font-black text-main uppercase tracking-[0.3em] italic">Settlement_Vector</h3>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-2 max-h-[280px] overflow-y-auto pr-1 scrollbar-hide">
                    {gateways.map(g => {
                       const Icon = getProviderIcon(g.provider);
                       const isSelected = selectedGatewayId === g.id;
                       const isEnforced = g.status === 'active' && g.publicKey?.length > 5;

                       return (
                         <button 
                           key={g.id} 
                           onClick={() => { soundService.playClick(); setSelectedGatewayId(g.id); }}
                           className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all group/node ${isSelected ? 'bg-accent text-white border-accent' : 'bg-input border-bright text-dim'}`}
                         >
                            <div className="flex items-center gap-3">
                               <Icon size={16} className={isSelected ? 'text-white' : 'text-dim'} />
                               <div className="text-left">
                                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">{g.name}</p>
                                  <p className={`text-[7px] font-bold mt-1 ${isSelected ? 'text-white/80' : 'text-dim/60'}`}>
                                    {isEnforced ? 'SECURE_NODE' : 'OFFLINE_NODE'}
                                  </p>
                               </div>
                            </div>
                            {isSelected && <CheckCircle2 size={14} />}
                         </button>
                       );
                    })}
                 </div>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-bright relative z-10">
               <button 
                onClick={handleAuthorize}
                disabled={!isFormValid}
                className="w-full py-5 bg-main text-surface rounded-2xl font-black text-xl uppercase italic tracking-[0.3em] transition-all hover:bg-accent active:scale-[0.98] shadow-2xl flex items-center justify-center gap-4 disabled:opacity-10"
              >
                INIT_VAULT_HANDSHAKE <ArrowRight size={24} />
              </button>
              {!isFormValid && flowMode === 'deposit' && (
                <p className="text-center text-[7px] text-neutral-600 font-bold uppercase mt-4 tracking-widest">
                  Rule 3 Disclosure: Vault crediting requires an active payment gateway with authorized API keys.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
           <div className="bg-surface border border-bright rounded-[2.5rem] p-6 sm:p-8 flex flex-col shadow-2xl h-full relative overflow-hidden">
              <div className="flex items-center justify-between mb-6 border-b border-bright pb-4 shrink-0">
                 <div className="flex items-center gap-3">
                    <History size={16} className="text-emerald-500" />
                    <h3 className="text-sm font-black text-main italic uppercase tracking-widest font-futuristic">Master_Ledger</h3>
                 </div>
              </div>

              <div className="flex-1 space-y-2 overflow-y-auto scrollbar-hide pr-1 min-h-[300px]">
                 {walletActivities.length > 0 ? (
                   walletActivities.map(act => (
                     <div key={act.id} className="bg-input rounded-xl border border-bright p-3 flex items-center justify-between group/row">
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${act.type === 'deposit' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>
                              {act.type === 'deposit' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                           </div>
                           <div className="min-w-0">
                              <p className="text-[7px] text-neutral-600 font-bold uppercase mb-0.5">TXID: {act.id}</p>
                              <p className="text-[10px] font-black text-main uppercase truncate max-w-[100px] leading-tight">{act.provider}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className={`text-sm font-tactical font-black italic tracking-widest ${act.type === 'deposit' ? 'text-emerald-500' : 'text-red-500'}`}>
                              {act.type === 'deposit' ? '+' : '-'}{act.amount.toLocaleString()}
                           </span>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center opacity-10">
                      <RefreshCw size={40} className="animate-spin mb-4 text-main" />
                      <p className="text-[8px] font-black uppercase tracking-widest text-main">No Transactions Recorded</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WalletSettings;
