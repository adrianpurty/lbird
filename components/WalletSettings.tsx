import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  Wallet, 
  Bitcoin,
  Smartphone,
  Loader2,
  QrCode,
  Zap,
  Scan,
  Building2,
  Globe,
  ChevronRight,
  Activity,
  History,
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight,
  Cpu,
  RefreshCw,
  Shield
} from 'lucide-react';
import { GatewayAPI } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface WalletSettingsProps {
  stripeConnected: boolean;
  onConnect: () => void;
  balance: number;
  onDeposit: (amount: number) => void;
  gateways: GatewayAPI[];
}

const WalletSettings: React.FC<WalletSettingsProps> = ({ balance, onDeposit, gateways }) => {
  const activeGateways = useMemo(() => gateways.filter(g => g.status === 'active'), [gateways]);
  
  const [amount, setAmount] = useState<string>('500');
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [flowMode, setFlowMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'binance' | 'gpay' | 'paypal'>('bank');

  useEffect(() => {
    if (activeGateways.length > 0 && !selectedGatewayId) {
      setSelectedGatewayId(activeGateways[0].id);
    }
  }, [activeGateways, selectedGatewayId]);

  const selectedGateway = useMemo(() => 
    activeGateways.find(g => g.id === selectedGatewayId), 
    [activeGateways, selectedGatewayId]
  );

  const [cardInfo, setCardInfo] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [withdrawDetails, setWithdrawDetails] = useState({
    bankName: '',
    accountName: '',
    iban: '',
    swift: '',
    binanceId: '',
    gpayContact: '',
    paypalEmail: ''
  });

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'stripe': return CreditCard;
      case 'binance': return Scan;
      case 'crypto': return Bitcoin;
      case 'upi': return Smartphone;
      case 'paypal': return Globe;
      default: return Building2;
    }
  };

  const handleProcessTransaction = async () => {
    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount <= 0) return;
    if (flowMode === 'withdraw' && numericAmount > balance) return;

    setIsProcessing(true);
    soundService.playClick(true);
    
    const stages = flowMode === 'deposit' 
      ? ['Syncing Node...', 'Validating...', 'Transferring Assets...']
      : ['Allocating...', 'Routing...', 'Settling...'];

    for (const stage of stages) {
      setProcessingStatus(stage);
      await new Promise(r => setTimeout(r, 450));
    }

    onDeposit(flowMode === 'deposit' ? numericAmount : -numericAmount);
    setIsProcessing(false);
    setShowCheckout(false);
    soundService.playClick(false);
  };

  const renderCompactForm = () => {
    if (flowMode === 'deposit') {
      if (!selectedGateway) return null;
      if (selectedGateway.provider === 'binance') {
        return (
          <div className="flex flex-col items-center gap-3 p-4 bg-black/40 rounded-2xl border border-neutral-800/40 animate-in fade-in duration-300">
             <QrCode size={100} className="text-neutral-400" />
             <div className="text-center">
                <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest">Pay ID Node</p>
                <p className="text-[10px] font-mono font-bold text-[#F3BA2F]">{selectedGateway.publicKey || '0x_NULL'}</p>
             </div>
          </div>
        );
      }
      return (
        <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
          <input className="w-full bg-black/40 border border-neutral-800/60 rounded-xl px-4 py-2.5 text-[11px] text-white outline-none focus:border-[#facc15]/40" placeholder="CARDHOLDER NAME" value={cardInfo.name} onChange={e => setCardInfo({...cardInfo, name: e.target.value.toUpperCase()})} />
          <input className="w-full bg-black/40 border border-neutral-800/60 rounded-xl px-4 py-2.5 text-[11px] text-neutral-400 font-mono outline-none focus:border-[#facc15]/40" placeholder="0000 0000 0000 0000" maxLength={19} value={cardInfo.number} onChange={e => setCardInfo({...cardInfo, number: e.target.value})} />
          <div className="grid grid-cols-2 gap-3">
             <input className="bg-black/40 border border-neutral-800/60 rounded-xl px-4 py-2.5 text-[11px] text-neutral-400 font-mono" placeholder="MM/YY" maxLength={5} value={cardInfo.expiry} onChange={e => setCardInfo({...cardInfo, expiry: e.target.value})} />
             <input className="bg-black/40 border border-neutral-800/60 rounded-xl px-4 py-2.5 text-[11px] text-neutral-400 font-mono" placeholder="CVV" maxLength={4} value={cardInfo.cvv} onChange={e => setCardInfo({...cardInfo, cvv: e.target.value})} />
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
           <input className="w-full bg-black/40 border border-neutral-800/60 rounded-xl px-4 py-2.5 text-[11px] text-white outline-none" placeholder="RECIPIENT LEGAL NAME" value={withdrawDetails.accountName} onChange={e => setWithdrawDetails({...withdrawDetails, accountName: e.target.value})} />
           <input className="w-full bg-black/40 border border-neutral-800/60 rounded-xl px-4 py-2.5 text-[11px] text-neutral-400 font-mono outline-none" placeholder="IBAN / ACCOUNT TOKEN" value={withdrawDetails.iban} onChange={e => setWithdrawDetails({...withdrawDetails, iban: e.target.value})} />
        </div>
      );
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-4 pb-20 theme-transition animate-in fade-in duration-700">
      
      {/* LANDSCAPE HEADER: COMPACT TELEMETRY */}
      <div className="bg-[#0f0f0f] border border-neutral-800/60 rounded-[1.5rem] p-4 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-[0.3em] mb-1">Total Liquidity</span>
            <div className="text-3xl font-black text-neutral-200 italic tracking-tighter flex items-baseline gap-1.5">
               <span className="text-sm text-[#facc15]/50 opacity-40">$</span>{balance.toLocaleString()}
            </div>
          </div>
          <div className="hidden sm:block h-8 w-px bg-neutral-800" />
          <div className="flex items-center gap-4">
            <div>
              <span className="text-neutral-700 font-black uppercase text-[8px] tracking-[0.3em] mb-1">Efficiency</span>
              <div className="text-xs font-black text-emerald-500/80 italic flex items-center gap-1.5">
                 <Activity size={10} className="animate-pulse" /> 99.9%
              </div>
            </div>
            <div>
              <span className="text-neutral-700 font-black uppercase text-[8px] tracking-[0.3em] mb-1">Nodes</span>
              <div className="text-xs font-black text-neutral-400 italic">{activeGateways.length} ONLINE</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-black/40 p-1 rounded-xl border border-neutral-800/40">
           <button onClick={() => { soundService.playClick(); setFlowMode('deposit'); setShowCheckout(false); }} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${flowMode === 'deposit' ? 'bg-[#facc15] text-black shadow-lg' : 'text-neutral-600 hover:text-neutral-400'}`}>Deposit</button>
           <button onClick={() => { soundService.playClick(); setFlowMode('withdraw'); setShowCheckout(false); }} className={`px-5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${flowMode === 'withdraw' ? 'bg-emerald-900/60 text-emerald-300' : 'text-neutral-600 hover:text-neutral-400'}`}>Withdraw</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT: HANDSHAKE TERMINAL (COMPACT) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="bg-[#0c0c0c]/90 rounded-[2rem] border border-neutral-800/50 p-6 shadow-2xl relative overflow-hidden flex-1">
             <div className="absolute top-0 right-0 w-48 h-48 bg-[#facc15]/2 rounded-full blur-[80px] -mr-24 -mt-24 pointer-events-none" />
             
             {!showCheckout ? (
               <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex-1 space-y-2">
                       <label className="text-[9px] font-black text-neutral-700 uppercase tracking-widest px-1">Settlement Amount (USD)</label>
                       <div className="relative">
                          <input 
                            type="number" 
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)} 
                            className="w-full bg-black/40 border border-neutral-800/60 rounded-2xl px-12 py-5 text-4xl font-black text-neutral-200 outline-none focus:border-[#facc15]/40 transition-all" 
                          />
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-800 font-black text-xl italic">$</span>
                       </div>
                    </div>
                    
                    <div className="flex-1 space-y-2">
                       <label className="text-[9px] font-black text-neutral-700 uppercase tracking-widest px-1">Gateway Protocol</label>
                       <div className="grid grid-cols-4 gap-2">
                         {(flowMode === 'deposit' ? activeGateways : [
                           { id: 'bank', provider: 'bank', name: 'Swift' },
                           { id: 'binance', provider: 'binance', name: 'BNB' },
                           { id: 'gpay', provider: 'upi', name: 'GPay' },
                           { id: 'paypal', provider: 'paypal', name: 'PP' }
                         ]).map((item: any) => {
                           const Icon = getProviderIcon(item.provider);
                           return (
                             <button 
                               key={item.id}
                               onClick={() => { soundService.playClick(true); flowMode === 'deposit' ? setSelectedGatewayId(item.id) : setWithdrawMethod(item.id); }}
                               className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                                 (flowMode === 'deposit' ? selectedGatewayId === item.id : withdrawMethod === item.id) 
                                   ? 'bg-[#facc15] text-black border-[#facc15]' : 'bg-black/40 border-neutral-800/60 text-neutral-600'
                               }`}
                             >
                               <Icon size={16} />
                               <span className="text-[7px] font-black uppercase tracking-widest">{item.name}</span>
                             </button>
                           );
                         })}
                       </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => { soundService.playClick(true); setShowCheckout(true); }} 
                    className={`w-full py-4 rounded-2xl font-black text-sm transition-all border-b-[4px] active:scale-[0.98] ${
                      flowMode === 'withdraw' ? 'bg-emerald-900/80 text-emerald-200 border-emerald-950' : 'bg-[#facc15] text-black border-yellow-700'
                    }`}
                  >
                    INITIALIZE {flowMode.toUpperCase()}
                  </button>
               </div>
             ) : (
               <div className="space-y-5 animate-in zoom-in-95 duration-500">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-black text-neutral-700 uppercase tracking-widest">Handshake Authentication</span>
                    <button onClick={() => setShowCheckout(false)} className="text-[8px] font-black text-[#facc15]/40 hover:text-[#facc15] uppercase tracking-widest">Re-configure</button>
                  </div>
                  
                  {renderCompactForm()}
                  
                  {isProcessing ? (
                     <div className="py-10 text-center space-y-4">
                        <Loader2 className={`animate-spin mx-auto ${flowMode === 'withdraw' ? 'text-emerald-500/40' : 'text-[#facc15]/40'}`} size={32} />
                        <p className="font-black text-[9px] text-neutral-500 uppercase tracking-[0.4em] animate-pulse">{processingStatus}</p>
                     </div>
                  ) : (
                    <button onClick={handleProcessTransaction} className={`w-full py-4 rounded-2xl font-black text-sm border-b-[4px] active:scale-95 ${
                      flowMode === 'withdraw' ? 'bg-emerald-900/80 text-emerald-100 border-emerald-950' : 'bg-[#facc15] text-black border-yellow-700'
                    }`}>
                      AUTHORIZE TRANSFER
                    </button>
                  )}
               </div>
             )}
          </div>

          <div className="bg-blue-950/5 border border-blue-900/10 p-4 rounded-2xl flex items-center gap-4">
             <Shield size={16} className="text-blue-900/60 shrink-0" />
             <p className="text-[8px] text-neutral-700 font-bold uppercase italic tracking-widest leading-relaxed">
               SECURE HANDSHAKE: Assets cryptographically verified. Transfers are immutable once authorized.
             </p>
          </div>
        </div>

        {/* RIGHT: LEDGER FEED (LANDSCAPE SIDEBAR) */}
        <div className="lg:col-span-4 h-full">
           <div className="bg-[#0f0f0f] p-6 rounded-[2rem] border border-neutral-800/40 h-full flex flex-col shadow-xl">
              <div className="flex justify-between items-center border-b border-neutral-800/30 pb-4 mb-4">
                 <h4 className="text-[9px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                    <History size={12} className="text-[#facc15]/50" /> Live Feed
                 </h4>
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              </div>
              
              <div className="flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-hide max-h-[380px]">
                 {[
                   { type: 'dep', amt: '+ $2.5k', hub: 'Stripe', date: '5m' },
                   { type: 'wit', amt: '- $1.2k', hub: 'Bank', date: '1h' },
                   { type: 'dep', amt: '+ $500', hub: 'BNB', date: '6h' },
                   { type: 'dep', amt: '+ $8k', hub: 'Root', date: '1d' },
                 ].map((tx, idx) => (
                   <div key={idx} className="bg-black/30 p-4 rounded-xl border border-neutral-800/20 flex items-center justify-between group hover:border-[#facc15]/30 transition-all">
                      <div className="flex items-center gap-3">
                         <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tx.type === 'dep' ? 'bg-emerald-900/10 text-emerald-500/80' : 'bg-red-900/10 text-red-500/80'}`}>
                            {tx.type === 'dep' ? <ArrowDownLeft size={10} /> : <ArrowUpRight size={10} />}
                         </div>
                         <div>
                            <p className="text-[9px] text-neutral-200 font-black uppercase tracking-tight">{tx.hub}</p>
                            <p className="text-[7px] text-neutral-700 font-bold">{tx.date} ago</p>
                         </div>
                      </div>
                      <span className={`text-sm font-black italic ${tx.type === 'dep' ? 'text-emerald-500/80' : 'text-neutral-500'}`}>{tx.amt}</span>
                   </div>
                 ))}
              </div>

              <button className="w-full mt-4 py-2 text-[8px] font-black text-neutral-700 uppercase tracking-[0.3em] hover:text-[#facc15]/60 border border-neutral-800/40 rounded-lg">
                Full Audit Log
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WalletSettings;