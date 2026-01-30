
import React, { useState, useMemo } from 'react';
// @fix: Added missing ShieldAlert icon import to resolve "Cannot find name 'ShieldAlert'" error.
import { 
  ShieldCheck, Wallet, Bitcoin, Smartphone, Zap, Activity, History, ArrowDownLeft, 
  ArrowUpRight, Database, DollarSign, CreditCard, Scan, Download, Globe, ArrowRight, 
  Cpu, AlertTriangle, CheckCircle2, RefreshCw, Lock, Terminal, Hash, Key, User as UserIcon, Briefcase, ChevronRight, Landmark, Loader2,
  ShieldAlert
} from 'lucide-react';
import { GatewayAPI, WalletActivity } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface WalletSettingsProps {
  stripeConnected: boolean;
  onConnect: () => void;
  balance: number;
  onDeposit: (amount: number, provider?: string) => Promise<void>;
  gateways: GatewayAPI[];
  walletActivities?: WalletActivity[];
}

const WalletSettings: React.FC<WalletSettingsProps> = ({ balance, onDeposit, gateways, walletActivities = [] }) => {
  const [amount, setAmount] = useState<string>('500');
  const [selectedGatewayId, setSelectedGatewayId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [flowMode, setFlowMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [error, setError] = useState<string | null>(null);

  // Field states for different providers
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '' });
  const [vpaId, setVpaId] = useState('');
  const [walletAddr, setWalletAddr] = useState('');

  // Rule 3: Identify operational gateways with valid administrative keys
  const gatewayStatusMap = useMemo(() => {
    return gateways.reduce((acc, g) => {
      const hasKeys = (g.publicKey?.length || 0) > 5 && (g.secretKey?.length || 0) > 5;
      acc[g.id] = g.status === 'active' && hasKeys;
      return acc;
    }, {} as Record<string, boolean>);
  }, [gateways]);

  const selectedGateway = useMemo(() => gateways.find(g => g.id === selectedGatewayId), [gateways, selectedGatewayId]);
  const isOperational = selectedGateway ? gatewayStatusMap[selectedGateway.id] : false;

  const calculation = useMemo(() => {
    const num = parseFloat(amount) || 0;
    const feePercent = selectedGateway ? parseFloat(selectedGateway.fee) : 0;
    const feeAmount = (num * feePercent) / 100;
    const netAmount = flowMode === 'deposit' ? num : num; 
    return { feeAmount, netAmount, feePercent };
  }, [amount, selectedGateway, flowMode]);

  const isFormValid = useMemo(() => {
    if (!selectedGateway || calculation.netAmount <= 0 || !isOperational) return false;

    const p = selectedGateway.provider;
    if (p === 'stripe') {
      return cardData.number.replace(/\s/g, '').length >= 15 && cardData.expiry.includes('/') && cardData.cvc.length >= 3;
    }
    if (p === 'upi') return vpaId.includes('@');
    if (p === 'crypto' || p === 'binance') return walletAddr.length >= 26;
    return true;
  }, [selectedGateway, calculation.netAmount, cardData, vpaId, walletAddr, isOperational]);

  const handleVaultSync = async () => {
    if (!isFormValid || isProcessing) return;
    setError(null);
    setIsProcessing(true);
    soundService.playClick(true);

    try {
      // Rule 3 and 4 execution via apiService
      const finalAmount = flowMode === 'deposit' ? calculation.netAmount : -calculation.netAmount;
      await onDeposit(finalAmount, selectedGateway?.name);
      
      // Reset form on success
      setAmount('500');
      setCardData({ number: '', expiry: '', cvc: '' });
      setVpaId('');
      setWalletAddr('');
      soundService.playClick(false);
    } catch (e: any) {
      setError(e.message || "VAULT_HANDSHAKE_FAILED");
    } finally {
      setIsProcessing(false);
    }
  };

  const getProviderIcon = (provider: string) => {
    const p = provider.toLowerCase();
    if (p.includes('stripe')) return CreditCard;
    if (p.includes('binance') || p.includes('scan')) return Scan;
    if (p.includes('crypto') || p.includes('bitcoin')) return Bitcoin;
    if (p.includes('upi') || p.includes('phone')) return Smartphone;
    return Landmark;
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-4 pb-24 font-rajdhani animate-in fade-in duration-500 px-4 lg:px-0">
      
      {/* VAULT STATUS BAR */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
         <div className="flex-1 w-full bg-surface border border-bright rounded-2xl p-6 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-6">
               <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 shadow-lg border border-emerald-500/20">
                  <Wallet size={28} />
               </div>
               <div>
                  <span className="text-[10px] font-black text-dim uppercase tracking-[0.3em] block mb-1">AGGREGATE_LIQUIDITY</span>
                  <span className="text-4xl font-tactical font-black text-main italic tracking-widest leading-none">${balance.toLocaleString()}</span>
               </div>
            </div>
            <div className="flex bg-black p-1 rounded-xl border border-bright">
               <button 
                 onClick={() => { soundService.playClick(); setFlowMode('deposit'); setSelectedGatewayId(null); }} 
                 className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${flowMode === 'deposit' ? 'bg-white text-black shadow-lg' : 'text-dim hover:text-main'}`}
               >
                 Vault Sync
               </button>
               <button 
                 onClick={() => { soundService.playClick(); setFlowMode('withdraw'); setSelectedGatewayId(null); }} 
                 className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all ${flowMode === 'withdraw' ? 'bg-white text-black shadow-lg' : 'text-dim hover:text-main'}`}
               >
                 Extraction
               </button>
            </div>
         </div>

         <div className="hidden lg:flex w-72 bg-surface border border-bright rounded-2xl p-6 items-center gap-5 shadow-xl">
            <div className="relative">
              <Activity className="text-emerald-500 animate-pulse" size={24} />
              <div className="absolute inset-0 bg-emerald-500 blur-md opacity-20 animate-pulse" />
            </div>
            <div>
               <span className="text-[10px] font-black text-dim uppercase tracking-widest block mb-1">LEDGER_STATE</span>
               <span className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">ENCRYPTED_AND_LIVE</span>
            </div>
         </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl flex items-center gap-4 text-red-500 animate-in shake duration-300">
          <AlertTriangle size={20} />
          <span className="text-xs font-black uppercase tracking-widest leading-none">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT SECTOR: CONFIGURATION */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface border border-bright rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              
              {/* UNIT SELECTION */}
              <div className="space-y-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <DollarSign size={16} className="text-accent" />
                       <h3 className="text-[10px] font-black text-main uppercase tracking-[0.4em] italic">Settlement_Units</h3>
                    </div>
                    <div className="relative bg-black rounded-3xl border-2 border-bright p-8 flex flex-col items-center justify-center focus-within:border-accent/40 transition-all shadow-inner group">
                       <div className="flex items-center gap-4 w-full">
                          <span className="text-3xl font-tactical text-dim italic font-black leading-none shrink-0">$</span>
                          <input 
                            type="number" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            className="w-full bg-transparent border-none text-6xl font-black text-main outline-none font-tactical italic tracking-widest text-center" 
                            placeholder="0.00"
                          />
                       </div>
                       <div className="absolute bottom-2 text-[8px] font-black text-neutral-800 uppercase tracking-widest">UNIT_STAKE_SELECTOR</div>
                    </div>
                 </div>

                 {/* DYNAMIC FIELDS BASED ON SELECTED NODE */}
                 {selectedGateway && isOperational && (
                   <div className="p-6 bg-black border border-bright rounded-[2rem] space-y-6 animate-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center justify-between border-b border-bright pb-4">
                        <div className="flex items-center gap-3">
                           <Lock size={14} className="text-accent" />
                           <span className="text-[10px] font-black text-dim uppercase tracking-widest">Financial_Identifier_Manifest</span>
                        </div>
                        <span className="text-[8px] font-mono text-neutral-700">AES_256_ACTIVE</span>
                      </div>

                      {selectedGateway.provider === 'stripe' && (
                        <div className="space-y-4">
                           <div className="space-y-1.5">
                             <label className="text-[8px] font-black text-neutral-600 uppercase tracking-widest px-1">CARD_NUMBER (PAN)</label>
                             <input 
                               placeholder="0000 0000 0000 0000" 
                               className="w-full bg-surface border border-bright rounded-xl px-5 py-3.5 text-main text-xs font-mono outline-none focus:border-accent/40 transition-all" 
                               value={cardData.number} 
                               onChange={e => setCardData({...cardData, number: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()})} 
                             />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                             <div className="space-y-1.5">
                               <label className="text-[8px] font-black text-neutral-600 uppercase tracking-widest px-1">EXPIRY</label>
                               <input 
                                 placeholder="MM / YY" 
                                 className="w-full bg-surface border border-bright rounded-xl px-5 py-3.5 text-main text-xs font-mono outline-none text-center focus:border-accent/40 transition-all" 
                                 value={cardData.expiry} 
                                 onChange={e => setCardData({...cardData, expiry: e.target.value})} 
                               />
                             </div>
                             <div className="space-y-1.5">
                               <label className="text-[8px] font-black text-neutral-600 uppercase tracking-widest px-1">CVC_SECURITY</label>
                               <input 
                                 type="password" 
                                 placeholder="***" 
                                 className="w-full bg-surface border border-bright rounded-xl px-5 py-3.5 text-main text-xs font-mono outline-none text-center focus:border-accent/40 transition-all" 
                                 value={cardData.cvc} 
                                 onChange={e => setCardData({...cardData, expiry: e.target.value})} 
                               />
                             </div>
                           </div>
                        </div>
                      )}

                      {selectedGateway.provider === 'upi' && (
                        <div className="space-y-1.5">
                           <label className="text-[8px] font-black text-neutral-600 uppercase tracking-widest px-1">VIRTUAL_PAYMENT_ADDRESS (VPA)</label>
                           <input 
                             placeholder="identifier@bankhost" 
                             className="w-full bg-surface border border-bright rounded-xl px-5 py-3.5 text-main text-xs font-mono outline-none focus:border-accent/40 transition-all" 
                             value={vpaId} 
                             onChange={e => setVpaId(e.target.value)} 
                           />
                        </div>
                      )}

                      {(selectedGateway.provider === 'crypto' || selectedGateway.provider === 'binance') && (
                        <div className="space-y-1.5">
                           <label className="text-[8px] font-black text-neutral-600 uppercase tracking-widest px-1">USER_SETTLEMENT_ADDRESS_HASH</label>
                           <div className="relative">
                             <input 
                               placeholder="0x... or Wallet ID" 
                               className="w-full bg-surface border border-bright rounded-xl pl-12 pr-5 py-3.5 text-main text-[10px] font-mono outline-none focus:border-accent/40 transition-all" 
                               value={walletAddr} 
                               onChange={e => setWalletAddr(e.target.value)} 
                             />
                             <Hash size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" />
                           </div>
                        </div>
                      )}
                   </div>
                 )}
              </div>

              {/* NODE SELECTION */}
              <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Zap size={16} className="text-amber-500" />
                       <h3 className="text-[10px] font-black text-main uppercase tracking-[0.4em] italic">Settlement_Vector</h3>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-3 max-h-[450px] overflow-y-auto pr-2 scrollbar-hide">
                    {gateways.map(g => {
                       const Icon = getProviderIcon(g.provider);
                       const isSelected = selectedGatewayId === g.id;
                       const status = gatewayStatusMap[g.id];

                       return (
                         <button 
                           key={g.id} 
                           onClick={() => { soundService.playClick(); setSelectedGatewayId(g.id); }}
                           className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all relative overflow-hidden group/node ${
                             isSelected 
                               ? 'bg-accent text-white border-accent shadow-xl scale-[1.02]' 
                               : 'bg-black border-bright text-dim hover:border-neutral-700'
                           }`}
                         >
                            <div className="flex items-center gap-5 relative z-10">
                               <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
                                 isSelected ? 'bg-white/10 border-white/20' : 'bg-surface border-bright'
                               }`}>
                                 <Icon size={24} className={isSelected ? 'text-white' : 'text-dim group-hover/node:text-main'} />
                               </div>
                               <div className="text-left">
                                  <p className="text-xs font-black uppercase tracking-widest leading-none">{g.name}</p>
                                  <div className="flex items-center gap-2 mt-2">
                                     <div className={`w-1.5 h-1.5 rounded-full ${status ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`} />
                                     <p className={`text-[8px] font-bold uppercase tracking-widest ${isSelected ? 'text-white/70' : 'text-neutral-600'}`}>
                                       {status ? 'NODE_OPERATIONAL' : 'API_KEYS_UNASSIGNED'}
                                     </p>
                                  </div>
                               </div>
                            </div>
                            {isSelected && <CheckCircle2 size={18} className="relative z-10" />}
                            
                            {/* Decorative background for operational status */}
                            {status && !isSelected && (
                              <div className="absolute right-0 top-0 bottom-0 w-1 bg-emerald-500 opacity-20" />
                            )}
                         </button>
                       );
                    })}
                 </div>
              </div>
            </div>

            {/* ACTION COMMITMENT */}
            <div className="mt-12 pt-10 border-t border-bright relative z-10">
               <button 
                onClick={handleVaultSync}
                disabled={!isFormValid || isProcessing}
                className={`w-full py-6 rounded-2xl font-black text-2xl uppercase italic tracking-[0.3em] transition-all border-b-[8px] flex items-center justify-center gap-6 shadow-2xl active:translate-y-1 active:border-b-0 ${
                  isFormValid 
                    ? 'bg-white text-black border-neutral-300 hover:bg-[#00e5ff]' 
                    : 'bg-neutral-900 text-neutral-700 border-neutral-950 cursor-not-allowed'
                }`}
              >
                {isProcessing ? <Loader2 className="animate-spin" size={28} /> : (
                  <>INIT_VAULT_HANDSHAKE <ArrowRight size={28} /></>
                )}
              </button>
              
              {!isOperational && selectedGateway && (
                <div className="mt-6 p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex items-center justify-center gap-3">
                   <ShieldAlert size={14} className="text-red-500" />
                   <p className="text-[9px] text-red-500/80 font-black uppercase tracking-widest">
                     RULE_3_VIOLATION: Administrative API keys for this node are offline. Configure in Control Center.
                   </p>
                </div>
              )}

              <p className="text-center text-[8px] text-neutral-600 font-bold uppercase mt-6 tracking-[0.4em] italic">
                Secure Handshake Protocol v6.0.4 // All Transactions Audited
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SECTOR: MASTER LEDGER */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="bg-surface border border-bright rounded-[3rem] p-8 flex flex-col shadow-2xl h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                <History size={180} />
              </div>

              <div className="flex items-center justify-between mb-8 border-b border-bright pb-6 shrink-0 relative z-10">
                 <div className="flex items-center gap-4">
                    <History size={20} className="text-emerald-500" />
                    <h3 className="text-base font-black text-main italic uppercase tracking-widest font-futuristic">Master_Ledger</h3>
                 </div>
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto scrollbar-hide pr-1 min-h-[400px] relative z-10">
                 {walletActivities.length > 0 ? (
                   walletActivities.map(act => (
                     <div key={act.id} className="bg-black/40 rounded-2xl border border-bright p-4 flex items-center justify-between group/row hover:border-accent/30 transition-all cursor-default">
                        <div className="flex items-center gap-4">
                           <div className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 ${act.type === 'deposit' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>
                              {act.type === 'deposit' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                           </div>
                           <div className="min-w-0">
                              <p className="text-[8px] text-neutral-600 font-bold uppercase mb-0.5 font-mono">TXID: {act.id}</p>
                              <p className="text-xs font-black text-main uppercase truncate max-w-[120px] leading-tight tracking-tight">{act.provider}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <span className={`text-xl font-tactical font-black italic tracking-widest ${act.type === 'deposit' ? 'text-emerald-500' : 'text-red-500'}`}>
                              {act.type === 'deposit' ? '+' : '-'}{act.amount.toLocaleString()}
                           </span>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center opacity-10 py-20">
                      <RefreshCw size={64} className="animate-spin-slow mb-6 text-main" />
                      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-main">AWAITING_FIRST_SYNC</p>
                   </div>
                 )}
              </div>

              <div className="mt-8 pt-6 border-t border-bright relative z-10">
                 <button className="w-full py-4 bg-black border border-bright rounded-2xl text-[9px] font-black text-dim uppercase tracking-[0.3em] hover:text-white transition-all flex items-center justify-center gap-3">
                   <Download size={14} /> DOWNLOAD_FISCAL_AUDIT
                 </button>
              </div>
           </div>
        </div>
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default WalletSettings;
