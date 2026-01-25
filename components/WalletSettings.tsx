import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  CheckCircle, 
  ShieldCheck, 
  Wallet, 
  Bitcoin,
  Smartphone,
  Plus,
  Loader2,
  QrCode,
  Lock,
  Zap,
  ArrowRight,
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
  TrendingUp,
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

  // Ensure a gateway is selected automatically when gateways load
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

  const formatCardNumber = (val: string) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = v.match(/.{1,4}/g) || [];
    return parts.join(' ').substring(0, 19);
  };

  const handleProcessTransaction = async () => {
    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount <= 0) return;
    if (flowMode === 'withdraw' && numericAmount > balance) return;

    setIsProcessing(true);
    soundService.playClick(true);
    
    // Simulated sequence for tactical feel
    const stages = flowMode === 'deposit' 
      ? ['Syncing Node...', 'Verifying Handshake...', 'Authorizing Asset Transfer...']
      : ['Calculating Liquidity...', 'Routing Settlement Node...', 'Finalizing Disbursement...'];

    for (const stage of stages) {
      setProcessingStatus(stage);
      await new Promise(r => setTimeout(r, 600));
    }

    onDeposit(flowMode === 'deposit' ? numericAmount : -numericAmount);
    setIsProcessing(false);
    setShowCheckout(false);
    soundService.playClick(false);
  };

  const renderCheckoutContent = () => {
    if (flowMode === 'deposit') {
      if (!selectedGateway) return (
        <div className="p-10 text-center bg-black/40 rounded-3xl border border-neutral-800/40">
           <ShieldAlert className="mx-auto text-neutral-800 mb-2" size={32} />
           <p className="text-neutral-600 font-black uppercase text-[10px] tracking-widest">Awaiting Gateway Provisioning...</p>
        </div>
      );

      switch (selectedGateway.provider) {
        case 'binance':
          return (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
              <div className="flex flex-col items-center text-center space-y-4 py-4">
                 <div className="p-4 bg-white/5 rounded-3xl shadow-2xl border border-neutral-800/40 relative">
                    <div className="absolute inset-0 bg-[#F3BA2F]/5 animate-pulse rounded-3xl" />
                    <QrCode size={160} className="text-neutral-400 relative z-10" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest">Merchant Node Address</p>
                    <div className="bg-black/60 border border-neutral-800/50 rounded-xl px-6 py-2.5 font-mono text-xs font-bold text-[#F3BA2F] shadow-[0_0_15px_rgba(243,186,47,0.1)]">
                      {selectedGateway.publicKey || '0x_PROVISIONING_REQUIRED'}
                    </div>
                 </div>
              </div>
            </div>
          );
        default:
          return (
            <div className="bg-black/30 border border-neutral-800/40 rounded-3xl p-8 space-y-6 animate-in slide-in-from-top-4 duration-500">
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Account Holder Identity</label>
                 <input className="w-full bg-neutral-900/60 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-300 text-xs font-bold focus:border-[#facc15]/50 outline-none transition-all" placeholder="FULL NAME" value={cardInfo.name} onChange={e => setCardInfo({...cardInfo, name: e.target.value.toUpperCase()})} />
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">PAN Token (Card Number)</label>
                 <input className="w-full bg-neutral-900/60 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-400 text-xs font-mono focus:border-[#facc15]/50 outline-none transition-all" placeholder="0000 0000 0000 0000" maxLength={19} value={cardInfo.number} onChange={e => setCardInfo({...cardInfo, number: formatCardNumber(e.target.value)})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Exp Date</label>
                   <input className="w-full bg-neutral-900/60 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-400 text-xs font-mono focus:border-[#facc15]/50 outline-none transition-all" placeholder="MM / YY" maxLength={5} value={cardInfo.expiry} onChange={e => setCardInfo({...cardInfo, expiry: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">CVC Code</label>
                   <input className="w-full bg-neutral-900/60 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-400 text-xs font-mono focus:border-[#facc15]/50 outline-none transition-all" placeholder="•••" maxLength={4} value={cardInfo.cvv} onChange={e => setCardInfo({...cardInfo, cvv: e.target.value})} />
                </div>
              </div>
            </div>
          );
      }
    } else {
      return (
        <div className="bg-black/30 border border-neutral-800/40 rounded-3xl p-8 space-y-4 animate-in slide-in-from-top-4 duration-500">
          <div className="space-y-2">
              <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Settlement Hub</label>
              <div className="bg-neutral-900/60 border border-neutral-800/50 rounded-xl px-4 py-3 text-[#facc15] text-xs font-black uppercase">
                {withdrawMethod.toUpperCase()} Node
              </div>
          </div>
          <div className="space-y-2">
             <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Recipient Identity</label>
             <input className="w-full bg-neutral-900/60 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-300 text-xs font-bold outline-none focus:border-[#facc15]/50" placeholder="LEGAL NAME" value={withdrawDetails.accountName} onChange={e => setWithdrawDetails({...withdrawDetails, accountName: e.target.value})} />
          </div>
          <div className="space-y-2">
             <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Account / IBAN Protocol</label>
             <input className="w-full bg-neutral-900/60 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-400 text-xs font-mono focus:border-[#facc15]/50" placeholder="DESTINATION_TOKEN" value={withdrawDetails.iban} onChange={e => setWithdrawDetails({...withdrawDetails, iban: e.target.value})} />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="w-full mx-auto space-y-8 pb-32 px-4 lg:px-0 theme-transition animate-in fade-in duration-700 max-w-7xl">
      
      {/* SECTION 1: FINANCIAL TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-gradient-to-br from-[#121212] to-black border border-neutral-800/60 rounded-[2.5rem] p-10 relative overflow-hidden group shadow-2xl">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <span className="text-neutral-700 font-black uppercase text-[10px] tracking-[0.4em] block mb-2 italic">Liquidity Reservoir</span>
              <div className="text-6xl sm:text-7xl font-black text-neutral-200 italic tracking-tighter flex items-baseline gap-3">
                 <span className="text-2xl text-[#facc15]/50 opacity-40">$</span>{balance.toLocaleString()}
              </div>
              <div className="flex items-center gap-3 mt-6">
                 <div className="flex items-center gap-1.5 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-900/30">
                    <Activity size={12} className="text-emerald-500 animate-pulse" />
                    <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest">Network Stable</span>
                 </div>
                 <span className="text-[9px] text-neutral-700 font-black uppercase tracking-widest italic">Handshake: Global-v4.1</span>
              </div>
            </div>
            <div className="hidden sm:flex w-32 h-32 bg-[#facc15]/5 rounded-full border border-[#facc15]/10 items-center justify-center group-hover:scale-110 transition-transform duration-700 shadow-inner">
               <Wallet className="text-[#facc15]/40" size={56} />
            </div>
          </div>
        </div>

        <div className="bg-[#121212]/40 p-10 rounded-[2.5rem] border border-neutral-800/40 flex flex-col justify-between shadow-xl">
           <div className="flex justify-between items-start">
              <span className="text-neutral-700 font-black uppercase text-[9px] tracking-widest">Efficiency Rating</span>
              <Cpu size={18} className="text-[#facc15]/40" />
           </div>
           <div>
              <div className="text-4xl font-black text-neutral-400 italic">99.8%</div>
              <p className="text-[9px] text-neutral-700 font-black uppercase tracking-widest mt-1">Operational Sync</p>
           </div>
           <div className="w-full bg-neutral-900 h-1.5 rounded-full mt-4 overflow-hidden shadow-inner">
              <div className="bg-emerald-800/60 h-full w-[99%]" />
           </div>
        </div>

        <div className="bg-[#121212]/40 p-10 rounded-[2.5rem] border border-neutral-800/40 flex flex-col justify-between shadow-xl">
           <div className="flex justify-between items-start">
              <span className="text-neutral-700 font-black uppercase text-[9px] tracking-widest">Node Health</span>
              <Globe size={18} className="text-emerald-900/60" />
           </div>
           <div>
              <div className="text-4xl font-black text-emerald-800/80 italic">ACTIVE</div>
              <p className="text-[9px] text-neutral-700 font-black uppercase tracking-widest mt-1">{activeGateways.length} Settlement Nodes Live</p>
           </div>
           <div className="flex gap-1.5 mt-4">
              {Array.from({length: 12}).map((_, i) => (
                <div key={i} className="flex-1 h-1.5 bg-emerald-900/40 rounded-full animate-pulse shadow-sm" style={{ animationDelay: `${i * 80}ms` }} />
              ))}
           </div>
        </div>
      </div>

      {/* SECTION 2: COMMAND TERMINAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ENGINE */}
        <div className="lg:col-span-8">
          <div className="bg-[#0f0f0f]/80 p-8 sm:p-14 rounded-[4rem] border border-neutral-800/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#facc15]/2 rounded-full blur-[120px] -mr-40 -mt-40 pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-16">
               <div className="flex bg-black p-2 rounded-2xl border border-neutral-800/50 shadow-inner w-full sm:w-auto">
                  <button 
                    onClick={() => { soundService.playClick(); setFlowMode('deposit'); setShowCheckout(false); }} 
                    className={`flex-1 sm:flex-none px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${flowMode === 'deposit' ? 'bg-[#facc15] text-black shadow-lg' : 'text-neutral-600 hover:text-neutral-400'}`}
                  >
                    <ArrowDownLeft size={16} /> Deposit
                  </button>
                  <button 
                    onClick={() => { soundService.playClick(); setFlowMode('withdraw'); setShowCheckout(false); }} 
                    className={`flex-1 sm:flex-none px-10 py-4 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-3 ${flowMode === 'withdraw' ? 'bg-emerald-900/60 text-emerald-300' : 'text-neutral-600 hover:text-neutral-400'}`}
                  >
                    <ArrowUpRight size={16} /> Withdraw
                  </button>
               </div>
               {showCheckout && !isProcessing && (
                 <button onClick={() => setShowCheckout(false)} className="text-[10px] font-black text-[#facc15]/40 hover:text-[#facc15] uppercase tracking-[0.2em] flex items-center gap-2 transition-all">
                    <RefreshCw size={14} /> Re-configure
                 </button>
               )}
            </div>

            {!showCheckout ? (
              <div className="space-y-16 animate-in slide-in-from-bottom-6 duration-700">
                <div className="space-y-6">
                  <label className="text-[11px] font-black text-neutral-700 uppercase tracking-[0.5em] px-4 italic">Settlement Payload (USD)</label>
                  <div className="relative group/input">
                    <input 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)} 
                      className="w-full bg-black/40 border border-neutral-800/50 rounded-[3rem] px-10 py-10 text-7xl font-black text-neutral-300 outline-none focus:border-[#facc15]/40 transition-all text-center placeholder:text-neutral-900" 
                    />
                    <span className="absolute left-12 top-1/2 -translate-y-1/2 text-neutral-800 font-black text-3xl italic">$</span>
                    <span className="absolute right-12 top-1/2 -translate-y-1/2 text-neutral-800 font-black text-2xl uppercase tracking-widest">USD</span>
                  </div>
                </div>

                <div className="space-y-8">
                  <label className="text-[11px] font-black text-neutral-700 uppercase tracking-[0.5em] px-4 italic">Distribution Hub</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                    {(flowMode === 'deposit' ? activeGateways : [
                      { id: 'bank', provider: 'bank', name: 'Swift' },
                      { id: 'binance', provider: 'binance', name: 'Binance' },
                      { id: 'gpay', provider: 'upi', name: 'GPay' },
                      { id: 'paypal', provider: 'paypal', name: 'PayPal' }
                    ]).map((item: any) => {
                      const IconComp = getProviderIcon(item.provider);
                      return (
                        <button 
                          key={item.id}
                          onClick={() => {
                            soundService.playClick(true);
                            flowMode === 'deposit' ? setSelectedGatewayId(item.id) : setWithdrawMethod(item.id);
                          }}
                          className={`p-8 rounded-[2.5rem] border transition-all duration-300 flex flex-col items-center gap-5 relative group/btn ${
                            (flowMode === 'deposit' ? selectedGatewayId === item.id : withdrawMethod === item.id) 
                              ? 'bg-[#facc15] text-black border-[#facc15] shadow-2xl' : 'bg-black/40 border-neutral-800/60 text-neutral-600 hover:border-neutral-700'
                          }`}
                        >
                          <IconComp size={32} className="relative z-10 transition-transform group-hover/btn:scale-110" />
                          <span className="text-[10px] font-black uppercase tracking-widest relative z-10">{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button 
                  onClick={() => { soundService.playClick(true); setShowCheckout(true); }} 
                  className={`w-full py-8 rounded-[3rem] font-black text-2xl transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] border-b-[8px] ${
                    flowMode === 'withdraw' 
                      ? 'bg-emerald-900/80 text-emerald-200 border-emerald-950 shadow-emerald-900/10' 
                      : 'bg-[#facc15] text-black border-yellow-700 shadow-yellow-500/10'
                  }`}
                >
                  INITIALIZE {flowMode.toUpperCase()} SEQUENCE <ChevronRight size={32} />
                </button>
              </div>
            ) : (
              <div className="space-y-12 animate-in zoom-in-95 duration-700">
                <div className="p-6 bg-black/40 border border-neutral-800/50 rounded-3xl text-center shadow-inner">
                   <p className="text-[11px] font-black text-neutral-700 uppercase tracking-widest italic">Gateway Security: <span className="text-[#facc15]/60">SSL_ENCRYPTED</span></p>
                </div>
                
                {renderCheckoutContent()}
                
                {isProcessing ? (
                   <div className="py-20 text-center space-y-8">
                      <div className="relative inline-block">
                         <Loader2 className={`animate-spin mx-auto ${flowMode === 'withdraw' ? 'text-emerald-500/40' : 'text-[#facc15]/40'}`} size={64} />
                         <Zap className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${flowMode === 'withdraw' ? 'text-emerald-500/80' : 'text-[#facc15]/80'} animate-pulse`} size={24} />
                      </div>
                      <p className="font-black text-sm text-neutral-500 uppercase tracking-[0.5em] animate-pulse italic">{processingStatus}</p>
                   </div>
                ) : (
                  <div className="space-y-6">
                     <button onClick={handleProcessTransaction} className={`w-full py-8 rounded-[3rem] font-black text-2xl flex items-center justify-center gap-4 active:scale-95 transition-all shadow-2xl border-b-[8px] ${
                        flowMode === 'withdraw' 
                          ? 'bg-emerald-900/80 text-emerald-100 border-emerald-950 shadow-emerald-900/10' 
                          : 'bg-[#facc15] text-black border-yellow-700 shadow-yellow-400/20'
                     }`}>
                        AUTHORIZE FINAL HANDSHAKE <ShieldCheck size={28} className="fill-current opacity-70" />
                     </button>
                     <p className="text-center text-[9px] text-neutral-800 font-black uppercase tracking-widest italic opacity-50">Transactions are committed to the master node ledger instantly.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* LEDGER STREAM */}
        <div className="lg:col-span-4 flex flex-col h-full">
           <div className="bg-[#121212]/40 p-10 rounded-[3.5rem] border border-neutral-800/40 flex-1 flex flex-col shadow-xl">
              <div className="flex justify-between items-center border-b border-neutral-800/30 pb-8 mb-8">
                 <h4 className="text-[12px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-4">
                    <History size={18} className="text-[#facc15]/50" /> Live Settlement Feed
                 </h4>
                 <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
              </div>
              
              <div className="flex-1 space-y-5 overflow-y-auto pr-2 scrollbar-hide max-h-[650px]">
                 {[
                   { type: 'dep', amt: '+ $2,500', hub: 'Stripe Node', hash: 'TX_77a1...f0', date: '45M AGO' },
                   { type: 'wit', amt: '- $1,200', hub: 'Bank Settlement', hash: 'TX_bc91...21', date: '3H AGO' },
                   { type: 'dep', amt: '+ $500', hub: 'Binance Pay', hash: 'TX_e1e1...12', date: '1D AGO' },
                   { type: 'dep', amt: '+ $10,000', hub: 'Master Route', hash: 'TX_ffaa...00', date: '2D AGO' },
                   { type: 'wit', amt: '- $350', hub: 'GPay Terminal', hash: 'TX_aa32...cc', date: '4D AGO' },
                 ].map((tx, idx) => (
                   <div key={idx} className="bg-black/30 p-6 rounded-[2rem] border border-neutral-800/20 group hover:border-[#facc15]/30 transition-all duration-300">
                      <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'dep' ? 'bg-emerald-900/10 text-emerald-500/80' : 'bg-red-900/10 text-red-500/80'}`}>
                               {tx.type === 'dep' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                            </div>
                            <div>
                               <p className="text-[11px] text-neutral-200 font-black uppercase tracking-tight">{tx.hub}</p>
                               <p className="text-[9px] text-neutral-700 font-mono tracking-tighter mt-1">{tx.hash}</p>
                            </div>
                         </div>
                         <span className="text-[9px] text-neutral-700 font-bold uppercase">{tx.date}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-neutral-800/20">
                         <span className={`text-lg font-black italic ${tx.type === 'dep' ? 'text-emerald-500/80' : 'text-neutral-400'}`}>{tx.amt}</span>
                         <span className="text-[8px] text-emerald-800/60 font-black uppercase tracking-widest bg-emerald-950/20 px-3 py-1 rounded-md">CLEARED</span>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="pt-10 mt-8 border-t border-neutral-800/30">
                 <button className="w-full py-5 rounded-2xl border border-neutral-800/40 text-[10px] font-black text-neutral-700 uppercase tracking-[0.3em] hover:text-[#facc15]/60 hover:border-[#facc15]/30 hover:bg-[#facc15]/2 transition-all duration-500 active:scale-95">
                    Generate Audit Statement (.XLSX)
                 </button>
              </div>
           </div>
        </div>
      </div>

      {/* COMPLIANCE FOOTER */}
      <div className="bg-red-950/5 border border-red-900/10 p-8 rounded-[2.5rem] flex items-center gap-6 shadow-sm">
         <Shield size={24} className="text-red-900/60 shrink-0" />
         <p className="text-[10px] text-neutral-700 font-bold uppercase italic leading-relaxed tracking-wider">
           Audit Disclaimer: This terminal provides high-integrity financial routing. All asset transfers are cryptographically signed and verified by the LeadBid Master Node. Withdrawal settlements are subject to local banking network latency.
         </p>
      </div>
    </div>
  );
};

export default WalletSettings;