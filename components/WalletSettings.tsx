import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle, 
  ShieldCheck, 
  Wallet, 
  ArrowUpRight,
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
  Banknote,
  ChevronRight,
  Activity,
  History,
  ShieldAlert
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
  const activeGateways = gateways.filter(g => g.status === 'active');
  
  const [amount, setAmount] = useState<string>('500');
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>(activeGateways[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [flowMode, setFlowMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'binance' | 'gpay' | 'paypal'>('bank');

  const selectedGateway = gateways.find(g => g.id === selectedGatewayId);

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

  const formatCardNumber = (val: string) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = v.match(/.{1,4}/g) || [];
    return parts.join(' ').substring(0, 19);
  };

  const handleProcessTransaction = async () => {
    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount <= 0) return alert("ERROR: Invalid amount.");
    if (flowMode === 'withdraw' && numericAmount > balance) return alert("INSUFFICIENT FUNDS.");

    setIsProcessing(true);
    soundService.playClick(true);
    
    // Optimized delay for tactile responsiveness
    const HANDSHAKE_DELAY = 1200;

    if (flowMode === 'deposit') {
      setProcessingStatus(`Initiating Handshake with ${selectedGateway?.name || 'Gateway'}...`);
      await new Promise(r => setTimeout(r, 600));
      setProcessingStatus(`Validating Asset Transfer Protocol...`);
      await new Promise(r => setTimeout(r, 600));
      onDeposit(numericAmount);
    } else {
      setProcessingStatus(`Calculating Settlement Reserve...`);
      await new Promise(r => setTimeout(r, 600));
      setProcessingStatus(`Routing Withdrawal to ${withdrawMethod.toUpperCase()} Node...`);
      await new Promise(r => setTimeout(r, 600));
      onDeposit(-numericAmount);
    }
    
    setIsProcessing(false);
    setShowCheckout(false);
    soundService.playClick(false);
  };

  const renderCheckoutContent = () => {
    if (flowMode === 'deposit') {
      if (!selectedGateway) return (
        <div className="p-10 text-center bg-black/20 rounded-3xl border border-neutral-800/40">
           <ShieldAlert className="mx-auto text-neutral-800 mb-2" size={32} />
           <p className="text-neutral-600 font-black uppercase text-[10px] tracking-widest">No Active Payment Gateways Detected</p>
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
                    <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest">Binance Pay ID Node</p>
                    <div className="bg-black/40 border border-neutral-800/50 rounded-xl px-6 py-2.5 font-mono text-xs font-bold text-[#F3BA2F] shadow-[0_0_15px_rgba(243,186,47,0.1)]">
                      {selectedGateway.publicKey || 'NODE_ID_NOT_CONFIGURED'}
                    </div>
                 </div>
              </div>
            </div>
          );
        case 'stripe':
          return (
            <div className="bg-black/30 border border-neutral-800/40 rounded-3xl p-8 space-y-6 animate-in slide-in-from-top-4 duration-500">
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Identity Holder</label>
                 <input className="w-full bg-neutral-900/60 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-300 text-xs font-bold focus:border-[#facc15]/50 outline-none transition-all" placeholder="FULL NAME" value={cardInfo.name} onChange={e => setCardInfo({...cardInfo, name: e.target.value.toUpperCase()})} />
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">PAN Token</label>
                 <input className="w-full bg-neutral-900/60 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-400 text-xs font-mono focus:border-[#facc15]/50 outline-none transition-all" placeholder="0000 0000 0000 0000" maxLength={19} value={cardInfo.number} onChange={e => setCardInfo({...cardInfo, number: formatCardNumber(e.target.value)})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Expiry</label>
                   <input className="w-full bg-neutral-900/60 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-400 text-xs font-mono focus:border-[#facc15]/50 outline-none transition-all" placeholder="MM / YY" maxLength={5} value={cardInfo.expiry} onChange={e => setCardInfo({...cardInfo, expiry: e.target.value})} />
                </div>
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">CVC</label>
                   <input className="w-full bg-neutral-900/60 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-400 text-xs font-mono focus:border-[#facc15]/50 outline-none transition-all" placeholder="•••" maxLength={4} value={cardInfo.cvv} onChange={e => setCardInfo({...cardInfo, cvv: e.target.value})} />
                </div>
              </div>
            </div>
          );
        default:
          return (
            <div className="p-12 text-center bg-black/20 rounded-3xl border border-neutral-800/40 animate-in fade-in duration-500">
               <Zap className="mx-auto text-[#facc15]/30 mb-4 animate-pulse" size={32} />
               <p className="text-neutral-500 font-black uppercase text-[10px] italic tracking-widest">Routing via Global {selectedGateway.name} Node...</p>
            </div>
          );
      }
    } else {
      switch (withdrawMethod) {
        case 'bank':
          return (
            <div className="bg-black/30 border border-neutral-800/40 rounded-3xl p-8 space-y-4 animate-in slide-in-from-top-4 duration-500">
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Account Holder Name</label>
                 <input className="w-full bg-neutral-900/60 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-300 text-xs font-bold outline-none focus:border-[#facc15]/50" placeholder="LEGAL NAME" value={withdrawDetails.accountName} onChange={e => setWithdrawDetails({...withdrawDetails, accountName: e.target.value})} />
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Financial Institution</label>
                 <input className="w-full bg-neutral-900/60 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-300 text-xs font-bold outline-none focus:border-[#facc15]/50" placeholder="e.g. Chase, HSBC" value={withdrawDetails.bankName} onChange={e => setWithdrawDetails({...withdrawDetails, bankName: e.target.value})} />
              </div>
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Settlement IBAN / Number</label>
                 <input className="w-full bg-neutral-900/60 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-400 text-xs font-mono focus:border-[#facc15]/50" placeholder="SWIFT / IBAN" value={withdrawDetails.iban} onChange={e => setWithdrawDetails({...withdrawDetails, iban: e.target.value})} />
              </div>
            </div>
          );
        default:
          return (
            <div className="bg-black/30 border border-neutral-800/40 rounded-3xl p-12 text-center">
               <Globe className="mx-auto text-neutral-700 mb-4 animate-spin-slow" size={32} />
               <p className="text-neutral-600 text-[10px] font-black uppercase tracking-widest">External Node Authentication Protocol Required</p>
            </div>
          );
      }
    }
  };

  return (
    <div className="w-full mx-auto space-y-8 pb-32 px-4 lg:px-10 theme-transition animate-in fade-in duration-700 optimize-gpu">
      
      {/* TACTICAL HEADER: Financial Command Post */}
      <div className="bg-gradient-to-br from-[#121212] via-[#0a0a0a] to-[#0d0d0d] border border-neutral-800/40 rounded-[3rem] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-10 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none group-hover:opacity-15 transition-opacity" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#facc15]/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex items-center gap-8 relative z-10">
           <div className="w-20 h-20 bg-[#facc15]/5 rounded-3xl flex items-center justify-center border border-[#facc15]/20 shadow-[0_0_30px_rgba(250,204,21,0.1)] group-hover:scale-105 transition-transform duration-500">
              <Wallet className="text-[#facc15]/60" size={40} />
           </div>
           <div>
              <span className="text-neutral-700 font-black uppercase text-[11px] tracking-[0.5em] block mb-2 italic">Available Trading Capital</span>
              <div className="text-5xl sm:text-7xl font-black text-neutral-300 italic tracking-tighter flex items-baseline gap-3">
                 <span className="text-2xl text-[#facc15]/50 opacity-60">$</span>{balance.toLocaleString()}
              </div>
           </div>
        </div>

        <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 sm:gap-12 relative z-10">
           <div className="text-center md:text-right group/stat">
              <span className="text-[10px] text-neutral-700 font-black uppercase tracking-widest block mb-1">CPA Potential</span>
              <span className="text-neutral-400 font-black text-2xl italic group-hover:text-[#facc15]/60 transition-colors">MAX</span>
           </div>
           <div className="w-px h-16 bg-neutral-800/30 hidden md:block" />
           <div className="text-center md:text-right group/stat">
              <span className="text-[10px] text-neutral-700 font-black uppercase tracking-widest block mb-1">Market Rating</span>
              <div className="flex items-center gap-1.5 text-[#facc15]/80 font-black text-2xl italic group-hover:scale-110 transition-transform">
                 <CheckCircle size={20} className="text-emerald-500/60" /> 5.0
              </div>
           </div>
           <div className="w-px h-16 bg-neutral-800/30 hidden md:block" />
           <div className="flex items-center gap-4 bg-black/40 px-6 py-4 rounded-3xl border border-neutral-800/50 shadow-inner group/escrow">
              <ShieldCheck className="text-[#facc15]/40 group-hover:scale-110 transition-transform" size={24} />
              <div>
                <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest block">Security Node</span>
                <span className="text-emerald-800/80 font-black text-[9px] uppercase tracking-widest">ESCROW_VERIFIED</span>
              </div>
           </div>
        </div>
      </div>

      {/* TACTICAL TRANSACTION INTERFACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* RESOURCE ALLOCATION PANEL */}
        <div className="lg:col-span-4 space-y-8 order-2 lg:order-1">
           <div className="bg-[#121212]/40 p-8 rounded-[2.5rem] border border-neutral-800/40 space-y-8 shadow-xl backdrop-blur-md">
              <h4 className="text-[11px] font-black text-neutral-500 uppercase tracking-widest border-b border-neutral-800/30 pb-4 flex items-center gap-3">
                 <Activity size={16} className="text-[#facc15]/50" /> Network Status
              </h4>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                       <span className="text-[10px] text-neutral-600 font-black uppercase">Settlement Power</span>
                       <span className="text-emerald-500/80 font-black text-xs">92%</span>
                    </div>
                    <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-neutral-800/40">
                       <div className="bg-emerald-800/60 h-full w-[92%] shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                       <span className="text-[10px] text-neutral-600 font-black uppercase">Collateral Hold</span>
                       <span className="text-[#facc15]/60 font-black text-xs">8%</span>
                    </div>
                    <div className="w-full bg-black/60 h-2 rounded-full overflow-hidden border border-neutral-800/40">
                       <div className="bg-[#facc15]/40 h-full w-[8%] shadow-[0_0_10px_rgba(250,204,21,0.2)]" />
                    </div>
                 </div>
              </div>

              <div className="bg-black/20 p-6 rounded-3xl border border-neutral-800/30 space-y-3">
                 <h5 className="text-[9px] font-black text-neutral-700 uppercase tracking-widest flex items-center gap-2">
                   <ShieldAlert size={14} className="text-red-900/60" /> Global Compliance Note
                 </h5>
                 <p className="text-[10px] text-neutral-600 leading-relaxed font-bold uppercase italic">
                   System maintenance scheduled for node-to-node wire protocols. Cryptographic settlements (USDT/BTC) remain at full operational capacity.
                 </p>
              </div>
           </div>

           <div className="bg-gradient-to-br from-[#111111] to-black p-8 rounded-[2.5rem] border border-neutral-800/40 space-y-4 shadow-xl text-center group">
              <Plus size={32} className="mx-auto text-neutral-800 mb-2 group-hover:text-[#facc15]/40 transition-colors" />
              <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Connect API Extension</h4>
              <p className="text-[10px] text-neutral-600 font-bold uppercase">Provision more financial nodes via Control Room</p>
           </div>
        </div>

        {/* MAIN TRANSACTION TERMINAL */}
        <div className="lg:col-span-8 space-y-8 order-1 lg:order-2">
          <div className="bg-[#0f0f0f]/80 p-8 sm:p-12 rounded-[3.5rem] border border-neutral-800/50 shadow-2xl space-y-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#facc15]/2 rounded-full blur-3xl -mr-16 -mt-16" />
            
            <div className="flex justify-between items-center">
               <div className="flex bg-black p-1.5 rounded-2xl border border-neutral-800/50 shadow-inner">
                  <button onClick={() => setFlowMode('deposit')} className={`px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${flowMode === 'deposit' ? 'bg-[#facc15] text-black shadow-[0_10px_20px_rgba(250,204,21,0.2)]' : 'text-neutral-700 hover:text-neutral-400'}`}>Deposit</button>
                  <button onClick={() => setFlowMode('withdraw')} className={`px-10 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${flowMode === 'withdraw' ? 'bg-emerald-900/60 text-emerald-300 shadow-[0_10px_20px_rgba(6,78,59,0.2)]' : 'text-neutral-700 hover:text-neutral-400'}`}>Withdraw</button>
               </div>
               {showCheckout && (
                 <button onClick={() => setShowCheckout(false)} className="text-[10px] font-black text-[#facc15]/50 hover:text-[#facc15] uppercase tracking-widest flex items-center gap-2 transition-all group">
                    <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> Re-allocate Amount
                 </button>
               )}
            </div>

            {!showCheckout ? (
              <div className="space-y-12 animate-in slide-in-from-bottom-6 duration-700">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.5em] px-4 italic">Settlement Allocation (USD)</label>
                  <div className="relative group/input">
                    <input 
                      type="number" 
                      value={amount} 
                      onChange={(e) => setAmount(e.target.value)} 
                      className="w-full bg-black/40 border border-neutral-800/50 rounded-[2.5rem] px-10 py-8 text-6xl font-black text-neutral-300 outline-none focus:border-[#facc15]/40 transition-all text-center placeholder:text-neutral-900" 
                    />
                    <span className="absolute left-10 top-1/2 -translate-y-1/2 text-neutral-800 font-black text-2xl italic">$</span>
                    <span className="absolute right-10 top-1/2 -translate-y-1/2 text-neutral-800 font-black text-xl uppercase tracking-widest">USD</span>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.5em] px-4 italic">Execution Route</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {(flowMode === 'deposit' ? activeGateways : [
                      { id: 'bank', icon: Building2, label: 'Swift' },
                      { id: 'binance', icon: Scan, label: 'Binance' },
                      { id: 'gpay', icon: Smartphone, label: 'Mobile' },
                      { id: 'paypal', icon: Globe, label: 'Global' }
                    ]).map((item: any) => (
                      <button 
                        key={item.id}
                        onClick={() => {
                          soundService.playClick(true);
                          flowMode === 'deposit' ? setSelectedGatewayId(item.id) : setWithdrawMethod(item.id);
                        }}
                        className={`p-6 rounded-[2rem] border transition-all duration-300 flex flex-col items-center gap-4 relative overflow-hidden group/btn ${
                          (flowMode === 'deposit' ? selectedGatewayId === item.id : withdrawMethod === item.id) 
                            ? 'bg-[#facc15] text-black border-[#facc15] shadow-xl' : 'bg-black/40 border-neutral-800/60 text-neutral-600 hover:border-neutral-700 hover:text-neutral-400'
                        }`}
                      >
                        <item.icon size={28} className="relative z-10 transition-transform group-hover/btn:scale-110" />
                        <span className="text-[9px] font-black uppercase tracking-widest relative z-10">{item.name || item.label}</span>
                        {(flowMode === 'deposit' ? selectedGatewayId === item.id : withdrawMethod === item.id) && (
                          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => {
                    soundService.playClick(true);
                    setShowCheckout(true);
                  }} 
                  className={`w-full py-7 rounded-[2.5rem] font-black text-lg sm:text-xl transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] transform border-b-[6px] ${
                    flowMode === 'withdraw' 
                      ? 'bg-emerald-900/80 text-emerald-200 border-emerald-950 shadow-emerald-900/10' 
                      : 'bg-[#facc15] text-black border-yellow-700 shadow-yellow-500/10 hover:bg-[#facc15]/90'
                  }`}
                >
                  INITIALIZE {flowMode.toUpperCase()} SEQUENCE <ChevronRight size={24} />
                </button>
              </div>
            ) : (
              <div className="space-y-10 animate-in zoom-in-95 duration-700">
                <div className="p-5 bg-black/40 border border-neutral-800/50 rounded-3xl text-center shadow-inner">
                   <p className="text-[10px] font-black text-neutral-700 uppercase tracking-widest italic">Routing Protocol via <span className="text-[#facc15]/60">{flowMode === 'deposit' ? selectedGateway?.name : withdrawMethod.toUpperCase()}</span> Node</p>
                </div>
                
                {renderCheckoutContent()}
                
                {isProcessing ? (
                   <div className="py-16 text-center space-y-6">
                      <div className="relative inline-block">
                         <Loader2 className={`animate-spin mx-auto ${flowMode === 'withdraw' ? 'text-emerald-500/40' : 'text-[#facc15]/40'}`} size={48} />
                         <Zap className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${flowMode === 'withdraw' ? 'text-emerald-500/80' : 'text-[#facc15]/80'} animate-pulse`} size={20} />
                      </div>
                      <p className="font-black text-xs text-neutral-500 uppercase tracking-[0.5em] animate-pulse">{processingStatus}</p>
                   </div>
                ) : (
                  <div className="space-y-4">
                     <button onClick={handleProcessTransaction} className={`w-full py-7 rounded-[2.5rem] font-black text-xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl border-b-[6px] ${
                        flowMode === 'withdraw' 
                          ? 'bg-emerald-900/80 text-emerald-100 border-emerald-950 shadow-emerald-900/10' 
                          : 'bg-[#facc15] text-black border-yellow-700 shadow-yellow-400/20'
                     }`}>
                        AUTHORIZE FINAL HANDSHAKE <Zap size={20} className="fill-current opacity-70" />
                     </button>
                     <p className="text-center text-[9px] text-neutral-800 font-black uppercase tracking-widest italic opacity-60">All settlements are logged to the global node ledger instantly.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* NODE ACTIVITY LEDGER */}
          <div className="bg-[#121212]/40 p-10 rounded-[3rem] border border-neutral-800/40 space-y-8 shadow-xl">
             <div className="flex justify-between items-center border-b border-neutral-800/30 pb-6">
                <h4 className="text-[11px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-3">
                   <History size={16} className="text-[#facc15]/50" /> Ledger Stream
                </h4>
                <span className="bg-black/60 px-3 py-1 rounded-lg text-[9px] font-black text-neutral-700 uppercase tracking-widest border border-neutral-800/40">LIVE_FEED</span>
             </div>
             <div className="space-y-4">
                {[
                  { type: 'dep', amt: '+ $2,500', label: 'Stripe Settlement', date: '2H AGO', status: 'verified' },
                  { type: 'wit', amt: '- $450', label: 'Local Swift Route', date: '5H AGO', status: 'settled' },
                  { type: 'dep', amt: '+ $1,200', label: 'Binance Pay Node', date: '1D AGO', status: 'verified' },
                ].map((tx, idx) => (
                  <div key={idx} className="bg-black/30 p-5 rounded-[1.5rem] border border-neutral-800/20 flex justify-between items-center group hover:border-[#facc15]/30 transition-all hover:translate-x-1 duration-300">
                     <div className="flex items-center gap-5">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${tx.type === 'dep' ? 'bg-emerald-900/10 text-emerald-500/80' : 'bg-red-900/10 text-red-500/80'}`}>
                           {tx.type === 'dep' ? '+' : '-'}
                        </div>
                        <div>
                           <span className="text-[10px] text-neutral-300 font-black uppercase tracking-tight">{tx.label}</span>
                           <p className="text-[9px] text-neutral-700 font-bold uppercase mt-1 flex items-center gap-1.5"><Activity size={10} /> {tx.date}</p>
                        </div>
                     </div>
                     <div className="text-right">
                        <span className={`text-base font-black italic ${tx.type === 'dep' ? 'text-emerald-500/80' : 'text-neutral-400'}`}>{tx.amt}</span>
                        <div className="text-[8px] text-neutral-800 font-black uppercase tracking-widest mt-1 bg-black/40 px-2 py-0.5 rounded-md border border-neutral-800/30">
                           {tx.status}
                        </div>
                     </div>
                  </div>
                ))}
             </div>
             <div className="pt-4">
                <button className="w-full py-4 rounded-2xl border border-neutral-800/40 text-[10px] font-black text-neutral-700 uppercase tracking-widest hover:text-[#facc15]/60 hover:border-[#facc15]/30 hover:bg-[#facc15]/2 transition-all duration-300 active:scale-95">
                   Request Master Node Statement
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletSettings;
