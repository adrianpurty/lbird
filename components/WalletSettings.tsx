
import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, Wallet, Bitcoin, Smartphone, Zap, Activity, History, ArrowDownLeft, 
  ArrowUpRight, Database, DollarSign, CreditCard, Scan, Download, Globe, ArrowRight, 
  Cpu, AlertTriangle, CheckCircle2, RefreshCw, Lock, Terminal, Hash, Key, User as UserIcon, Briefcase, ChevronRight, Landmark, Loader2,
  ShieldAlert
} from 'lucide-react';
import { GatewayAPI, WalletActivity } from '../types.ts';
import { soundService } from '../services/soundService.ts';
import { paymentService } from '../services/paymentService.ts';

interface WalletSettingsProps {
  stripeConnected: boolean;
  onConnect: () => void;
  balance: number;
  onDeposit: (amount: number, provider: string, txnId: string) => Promise<void>;
  gateways: GatewayAPI[];
  walletActivities?: WalletActivity[];
}

const WalletSettings: React.FC<WalletSettingsProps> = ({ balance, onDeposit, gateways, walletActivities = [] }) => {
  const [amount, setAmount] = useState<string>('500');
  const [selectedGatewayId, setSelectedGatewayId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [procStep, setProcStep] = useState('');
  const [flowMode, setFlowMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [error, setError] = useState<string | null>(null);

  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '' });
  const [vpaId, setVpaId] = useState('');
  const [walletAddr, setWalletAddr] = useState('');

  const selectedGateway = useMemo(() => gateways.find(g => g.id === selectedGatewayId), [gateways, selectedGatewayId]);

  const isFormValid = useMemo(() => {
    const num = parseFloat(amount) || 0;
    if (!selectedGateway || num <= 0 || selectedGateway.status !== 'active') return false;
    
    const p = selectedGateway.provider;
    if (p === 'stripe') return cardData.number.replace(/\s/g, '').length >= 15;
    if (p === 'upi') return vpaId.includes('@');
    if (p === 'crypto' || p === 'binance') return walletAddr.length >= 26;
    return true;
  }, [selectedGateway, amount, cardData, vpaId, walletAddr]);

  const handleVaultSync = async () => {
    if (!isFormValid || isProcessing || !selectedGateway) return;
    setError(null);
    setIsProcessing(true);
    soundService.playClick(true);

    try {
      setProcStep(`INITIALIZING_${selectedGateway.provider.toUpperCase()}_HANDSHAKE...`);
      
      const validation = await paymentService.validateGateway(selectedGateway);
      if (!validation.success) throw new Error(validation.message);

      setProcStep(`UPLINK_ESTABLISHED: PROCESSING_SETTLEMENT...`);
      
      const { txnId } = await paymentService.processTransaction(
        selectedGateway, 
        parseFloat(amount), 
        { cardData, vpaId, walletAddr }
      );
      
      setProcStep("VERIFYING_SETTLEMENT_SIGNATURES...");
      const finalAmount = flowMode === 'deposit' ? parseFloat(amount) : -parseFloat(amount);
      await onDeposit(finalAmount, selectedGateway.name, txnId);
      
      setAmount('500');
      setCardData({ number: '', expiry: '', cvc: '' });
      setVpaId('');
      setWalletAddr('');
      setSelectedGatewayId(null);
      setProcStep('');
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
    <div className="max-w-[1400px] mx-auto space-y-4 pb-32 font-rajdhani animate-in fade-in duration-500 px-4 lg:px-0">
      
      {/* HUD Header Optimized for Mobile */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
         <div className="flex-1 w-full bg-surface border border-bright rounded-[2rem] p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
               <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-lg shrink-0">
                  <Wallet size={24} className="sm:size-7" />
               </div>
               <div>
                  <span className="text-[8px] sm:text-[10px] font-black text-dim uppercase tracking-[0.3em] block mb-0.5">AGGREGATE_LIQUIDITY</span>
                  <span className="text-3xl sm:text-4xl font-tactical font-black text-main italic tracking-widest leading-none">${balance.toLocaleString()}</span>
               </div>
            </div>
            
            <div className="flex bg-black p-1 rounded-xl border border-bright w-full sm:w-auto">
               <button onClick={() => { soundService.playClick(); setFlowMode('deposit'); setSelectedGatewayId(null); }} className={`flex-1 sm:flex-none px-6 sm:px-8 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase transition-all ${flowMode === 'deposit' ? 'bg-white text-black shadow-lg' : 'text-dim hover:text-main'}`}>Vault Sync</button>
               <button onClick={() => { soundService.playClick(); setFlowMode('withdraw'); setSelectedGatewayId(null); }} className={`flex-1 sm:flex-none px-6 sm:px-8 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase transition-all ${flowMode === 'withdraw' ? 'bg-white text-black shadow-lg' : 'text-dim hover:text-main'}`}>Extraction</button>
            </div>
         </div>

         <div className="hidden sm:flex w-full sm:w-72 bg-surface border border-bright rounded-[2rem] p-5 sm:p-6 items-center gap-5 shadow-xl">
            <Activity className="text-emerald-500 animate-pulse shrink-0" size={20} />
            <div>
               <span className="text-[8px] sm:text-[10px] font-black text-dim uppercase tracking-widest block mb-0.5">LEDGER_STATE</span>
               <span className="text-[10px] sm:text-xs font-black text-emerald-500 uppercase tracking-[0.2em]">LIVE_NODE_SYNC</span>
            </div>
         </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 p-4 sm:p-5 rounded-2xl flex items-center gap-4 text-red-500 animate-in shake duration-300">
          <AlertTriangle size={18} className="shrink-0" />
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest leading-none">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Control Panel */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface border border-bright rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-12 shadow-2xl relative overflow-hidden group">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 relative z-10">
              
              {/* Left Column: Amount and Inputs */}
              <div className="space-y-6 sm:space-y-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <DollarSign size={14} className="text-accent" />
                       <h3 className="text-[9px] sm:text-[10px] font-black text-main uppercase tracking-[0.4em] italic">Settlement_Units</h3>
                    </div>
                    <div className="relative bg-black rounded-[2rem] border-2 border-bright p-6 sm:p-8 flex flex-col items-center justify-center focus-within:border-accent/40 transition-all shadow-inner">
                       <div className="flex items-center gap-2 sm:gap-4 w-full justify-center">
                          <span className="text-2xl sm:text-3xl font-tactical text-dim italic font-black leading-none">$</span>
                          <input 
                            type="number" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            className="w-full bg-transparent border-none text-4xl sm:text-6xl font-black text-main outline-none font-tactical italic tracking-widest text-center" 
                            placeholder="0.00" 
                          />
                       </div>
                    </div>
                 </div>

                 {selectedGateway && (
                   <div className="p-5 sm:p-6 bg-black border border-bright rounded-[1.5rem] sm:rounded-[2rem] space-y-5 sm:space-y-6 animate-in slide-in-from-top-4">
                      <div className="flex items-center justify-between border-b border-bright pb-3 sm:pb-4">
                        <div className="flex items-center gap-3">
                           <Lock size={12} className="text-accent" />
                           <span className="text-[8px] sm:text-[9px] font-black text-dim uppercase tracking-widest">SDK_HANDSHAKE_READY</span>
                        </div>
                      </div>

                      {selectedGateway.provider === 'stripe' && (
                        <div className="space-y-3 sm:space-y-4">
                           <div className="space-y-1.5">
                             <label className="text-[7px] sm:text-[8px] font-black text-neutral-600 uppercase tracking-widest px-1 italic">CREDIT_PAN_ENTRY</label>
                             <input placeholder="0000 0000 0000 0000" className="w-full bg-surface border border-neutral-800 rounded-xl px-4 py-3 text-main text-[10px] sm:text-xs font-mono outline-none focus:border-accent" value={cardData.number} onChange={e => setCardData({...cardData, number: e.target.value})} />
                           </div>
                           <div className="grid grid-cols-2 gap-3 sm:gap-4">
                              <input placeholder="MM/YY" className="w-full bg-surface border border-neutral-800 rounded-xl px-4 py-3 text-main text-[10px] sm:text-xs font-mono outline-none focus:border-accent" value={cardData.expiry} onChange={e => setCardData({...cardData, expiry: e.target.value})} />
                              <input placeholder="CVC" className="w-full bg-surface border border-neutral-800 rounded-xl px-4 py-3 text-main text-[10px] sm:text-xs font-mono outline-none focus:border-accent" value={cardData.cvc} onChange={e => setCardData({...cardData, cvc: e.target.value})} />
                           </div>
                        </div>
                      )}

                      {selectedGateway.provider === 'upi' && (
                        <div className="space-y-1.5">
                           <label className="text-[7px] sm:text-[8px] font-black text-neutral-600 uppercase tracking-widest px-1 italic">VIRTUAL_PAYMENT_ADDRESS</label>
                           <input placeholder="identifier@bankhost" className="w-full bg-surface border border-neutral-800 rounded-xl px-4 py-3 text-main text-[10px] sm:text-xs font-mono outline-none focus:border-accent" value={vpaId} onChange={e => setVpaId(e.target.value)} />
                        </div>
                      )}

                      {(selectedGateway.provider === 'crypto' || selectedGateway.provider === 'binance') && (
                        <div className="space-y-1.5">
                           <label className="text-[7px] sm:text-[8px] font-black text-neutral-600 uppercase tracking-widest px-1 italic">USER_ADDRESS_HASH</label>
                           <input placeholder="0x..." className="w-full bg-surface border border-neutral-800 rounded-xl px-4 py-3 text-main text-[9px] sm:text-[10px] font-mono outline-none focus:border-accent" value={walletAddr} onChange={e => setWalletAddr(e.target.value)} />
                        </div>
                      )}
                   </div>
                 )}
              </div>

              {/* Right Column: Vectors Selection */}
              <div className="space-y-4 sm:space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Zap size={14} className="text-amber-500" />
                       <h3 className="text-[9px] sm:text-[10px] font-black text-main uppercase tracking-[0.4em] italic">Settlement_Vectors</h3>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-2.5 sm:gap-3 max-h-[300px] sm:max-h-[450px] overflow-y-auto pr-1 sm:pr-2 scrollbar-hide">
                    {gateways.map(g => {
                       const Icon = getProviderIcon(g.provider);
                       const isSelected = selectedGatewayId === g.id;
                       const isActiveNode = g.status === 'active';

                       return (
                         <button 
                            key={g.id} 
                            onClick={() => { soundService.playClick(); setSelectedGatewayId(g.id); }} 
                            className={`flex items-center justify-between p-4 sm:p-5 rounded-[1.25rem] sm:rounded-2xl border-2 transition-all relative overflow-hidden group/node ${isSelected ? 'bg-accent text-white border-accent shadow-xl scale-[1.01]' : 'bg-black border-bright text-dim hover:border-neutral-700'} ${!isActiveNode ? 'opacity-40 grayscale' : ''}`}
                          >
                            <div className="flex items-center gap-4 sm:gap-5 relative z-10 w-full overflow-hidden">
                               <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl border shrink-0 flex items-center justify-center ${isSelected ? 'bg-white/10 border-white/20' : 'bg-surface border-bright'}`}>
                                 <Icon size={20} className={isSelected ? 'text-white' : 'text-dim group-hover/node:text-main'} />
                               </div>
                               <div className="text-left min-w-0 flex-1">
                                  <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest leading-none truncate">{g.name}</p>
                                  <div className="flex items-center gap-1.5 mt-1.5 sm:mt-2">
                                     <div className={`w-1 h-1 rounded-full shrink-0 ${isActiveNode ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500'}`} />
                                     <p className={`text-[7px] sm:text-[8px] font-bold uppercase tracking-widest truncate ${isSelected ? 'text-white/70' : 'text-neutral-600'}`}>{isActiveNode ? 'LIVE_UPLINK' : 'NODE_OFFLINE'}</p>
                                  </div>
                               </div>
                            </div>
                         </button>
                       );
                    })}
                 </div>
              </div>
            </div>

            {/* Bottom Action Section */}
            <div className="mt-8 sm:mt-12 pt-8 sm:pt-10 border-t border-bright relative z-10">
               <button 
                onClick={handleVaultSync} 
                disabled={!isFormValid || isProcessing} 
                className={`w-full py-5 sm:py-6 rounded-[1.5rem] sm:rounded-2xl font-black text-xl sm:text-2xl uppercase italic tracking-[0.2em] sm:tracking-[0.3em] transition-all border-b-[6px] sm:border-b-[8px] flex items-center justify-center gap-4 sm:gap-6 shadow-2xl active:translate-y-1 active:border-b-0 ${isFormValid ? 'bg-white text-black border-neutral-300 hover:bg-accent hover:text-white hover:border-violet-900' : 'bg-neutral-900 text-neutral-700 border-neutral-950 cursor-not-allowed'}`}
               >
                {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <>INIT_SETTLEMENT <ArrowRight className="size-5 sm:size-7" /></>}
              </button>
              
              {isProcessing && procStep && (
                <div className="flex flex-col items-center gap-2 mt-4 sm:mt-6 animate-in fade-in duration-500">
                  <div className="w-full bg-neutral-900 h-1 rounded-full overflow-hidden max-w-[240px] sm:max-w-xs">
                    <div className="h-full bg-accent animate-pulse" style={{width: '60%'}} />
                  </div>
                  <p className="text-center text-[8px] sm:text-[10px] text-accent font-black uppercase animate-pulse tracking-widest">{procStep}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ledger Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="bg-surface border border-bright rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-8 flex flex-col shadow-2xl h-full relative overflow-hidden min-h-[400px]">
              <div className="flex items-center justify-between mb-6 sm:mb-8 border-b border-bright pb-4 sm:pb-6 shrink-0 relative z-10">
                 <div className="flex items-center gap-3 sm:gap-4">
                    <History size={18} className="text-emerald-500" />
                    <h3 className="text-sm sm:text-base font-black text-main italic uppercase tracking-widest font-futuristic">Market_Ledger</h3>
                 </div>
              </div>
              
              <div className="flex-1 space-y-2.5 sm:space-y-3 overflow-y-auto scrollbar-hide pr-1 min-h-[300px]">
                 {walletActivities.length > 0 ? walletActivities.map(act => (
                   <div key={act.id} className="bg-black/40 rounded-[1.25rem] border border-bright p-3.5 sm:p-4 flex items-center justify-between group/row hover:border-accent/30 transition-all cursor-default relative overflow-hidden">
                      <div className="flex items-center gap-3 sm:gap-4 relative z-10">
                         <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border-2 shrink-0 ${act.type === 'deposit' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>
                            {act.type === 'deposit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                         </div>
                         <div className="min-w-0">
                            <p className="text-[7px] sm:text-[8px] text-neutral-600 font-bold uppercase mb-0.5 font-mono truncate max-w-[80px] sm:max-w-[100px]">TXN_{act.id.slice(-6)}</p>
                            <p className="text-[10px] sm:text-xs font-black text-main uppercase truncate max-w-[100px] sm:max-w-[120px]">{act.provider}</p>
                         </div>
                      </div>
                      <div className="text-right shrink-0 relative z-10">
                         <span className={`text-lg sm:text-xl font-tactical font-black italic tracking-widest ${act.type === 'deposit' ? 'text-emerald-400' : 'text-red-400'}`}>
                           {act.type === 'deposit' ? '+' : '-'}${act.amount.toLocaleString()}
                         </span>
                      </div>
                   </div>
                 )) : (
                   <div className="h-full flex flex-col items-center justify-center opacity-10 py-12 sm:py-20">
                     <RefreshCw size={48} className="sm:size-16 animate-spin mb-4 sm:mb-6" />
                     <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em]">SYNCING_LEDGER...</p>
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
