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
import { GatewayAPI } from './AdminPaymentSettings';

declare const Stripe: any;

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
    if (flowMode === 'deposit') {
      setProcessingStatus(`Connecting to ${selectedGateway?.name || 'Gateway'}...`);
      await new Promise(r => setTimeout(r, 1500));
      onDeposit(numericAmount);
    } else {
      setProcessingStatus(`Validating Settlement Route...`);
      await new Promise(r => setTimeout(r, 1500));
      onDeposit(-numericAmount);
      alert(`Success: $${numericAmount} released.`);
    }
    setIsProcessing(false);
    setShowCheckout(false);
  };

  const renderCheckoutContent = () => {
    if (flowMode === 'deposit') {
      if (!selectedGateway) return null;
      switch (selectedGateway.provider) {
        case 'binance':
          return (
            <div className="space-y-6 animate-in fade-in zoom-in-95">
              <div className="flex flex-col items-center text-center space-y-4 py-4">
                 <div className="p-4 bg-neutral-100/10 rounded-2xl shadow-2xl border-4 border-[#F3BA2F]/40">
                    <QrCode size={120} className="text-neutral-400" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest">Target Pay ID</p>
                    <div className="bg-black/30 border border-neutral-800/50 rounded-xl px-4 py-2 font-mono text-xs font-bold text-[#F3BA2F]/70">
                      {selectedGateway.publicKey}
                    </div>
                 </div>
              </div>
            </div>
          );
        case 'stripe':
          return (
            <div className="bg-black/30 border border-neutral-800/40 rounded-3xl p-6 space-y-4">
              <input className="w-full bg-neutral-900/40 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-400 text-xs focus:border-[#facc15]/50 outline-none" placeholder="CARDHOLDER NAME" value={cardInfo.name} onChange={e => setCardInfo({...cardInfo, name: e.target.value.toUpperCase()})} />
              <input className="w-full bg-neutral-900/40 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-400 text-xs font-mono focus:border-[#facc15]/50 outline-none" placeholder="0000 0000 0000 0000" maxLength={19} value={cardInfo.number} onChange={e => setCardInfo({...cardInfo, number: formatCardNumber(e.target.value)})} />
              <div className="grid grid-cols-2 gap-4">
                <input className="w-full bg-neutral-900/40 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-400 text-xs font-mono focus:border-[#facc15]/50 outline-none" placeholder="MM / YY" maxLength={5} value={cardInfo.expiry} onChange={e => setCardInfo({...cardInfo, expiry: e.target.value})} />
                <input className="w-full bg-neutral-900/40 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-400 text-xs font-mono focus:border-[#facc15]/50 outline-none" placeholder="CVV" maxLength={4} value={cardInfo.cvv} onChange={e => setCardInfo({...cardInfo, cvv: e.target.value})} />
              </div>
            </div>
          );
        default:
          return <div className="p-10 text-center"><p className="text-neutral-600 font-black uppercase text-xs italic tracking-widest">Routing via {selectedGateway.name} Node...</p></div>;
      }
    } else {
      switch (withdrawMethod) {
        case 'bank':
          return (
            <div className="bg-black/30 border border-neutral-800/40 rounded-3xl p-6 space-y-3">
              <input className="w-full bg-neutral-900/40 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-400 text-xs outline-none focus:border-[#facc15]/50" placeholder="ACCOUNT HOLDER NAME" value={withdrawDetails.accountName} onChange={e => setWithdrawDetails({...withdrawDetails, accountName: e.target.value})} />
              <input className="w-full bg-neutral-900/40 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-400 text-xs outline-none focus:border-[#facc15]/50" placeholder="BANK NAME" value={withdrawDetails.bankName} onChange={e => setWithdrawDetails({...withdrawDetails, bankName: e.target.value})} />
              <input className="w-full bg-neutral-900/40 border border-neutral-800/50 rounded-xl px-4 py-3 text-neutral-400 text-xs font-mono focus:border-[#facc15]/50" placeholder="IBAN / ACCOUNT #" value={withdrawDetails.iban} onChange={e => setWithdrawDetails({...withdrawDetails, iban: e.target.value})} />
            </div>
          );
        default:
          return <div className="bg-black/30 border border-neutral-800/40 rounded-3xl p-6"><p className="text-neutral-600 text-[10px] font-black uppercase tracking-widest text-center">Protocol-Specific Authentication Required</p></div>;
      }
    }
  };

  return (
    <div className="w-full mx-auto space-y-6 pb-24 px-4 lg:px-10 theme-transition animate-in fade-in duration-500">
      
      {/* LANDSCAPE HEADER: Portfolio Ribbon */}
      <div className="bg-gradient-to-r from-[#121212]/80 via-[#0a0a0a]/80 to-[#121212]/80 border border-neutral-800/40 rounded-[2.5rem] p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none" />
        
        <div className="flex items-center gap-6 relative z-10">
           <div className="w-16 h-16 bg-[#facc15]/5 rounded-2xl flex items-center justify-center border border-[#facc15]/10">
              <Wallet className="text-[#facc15]/60" size={32} />
           </div>
           <div>
              <span className="text-neutral-700 font-black uppercase text-[10px] tracking-[0.4em] block mb-1">Liquid Portfolio</span>
              <div className="text-4xl sm:text-5xl font-black text-neutral-300 italic tracking-tighter flex items-baseline gap-2">
                 <span className="text-xl text-[#facc15]/50 opacity-60">$</span>{balance.toLocaleString()}
              </div>
           </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 sm:gap-10 relative z-10">
           <div className="text-center md:text-left">
              <span className="text-[9px] text-neutral-700 font-black uppercase tracking-widest block mb-1">CPA Potential</span>
              <span className="text-neutral-400 font-black text-lg italic">MAX</span>
           </div>
           <div className="w-px h-10 bg-neutral-800/40 hidden md:block" />
           <div className="text-center md:text-left">
              <span className="text-[9px] text-neutral-700 font-black uppercase tracking-widest block mb-1">Nodes Active</span>
              <span className="text-emerald-700/80 font-black text-lg italic">GLOBAL</span>
           </div>
           <div className="w-px h-10 bg-neutral-800/40 hidden md:block" />
           <div className="flex items-center gap-3 bg-black/20 px-5 py-3 rounded-2xl border border-neutral-800/30">
              <ShieldCheck className="text-[#facc15]/40" size={18} />
              <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">Escrow Verified</span>
           </div>
        </div>
      </div>

      {/* THREE-COLUMN LANDSCAPE CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COL 1: Node Status */}
        <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
           <div className="bg-[#121212]/40 p-6 rounded-[2rem] border border-neutral-800/40 space-y-6 shadow-md">
              <h4 className="text-[10px] font-black text-neutral-600 uppercase tracking-widest border-b border-neutral-800/30 pb-3 flex items-center gap-2">
                 <Activity size={14} className="text-[#facc15]/50" /> Resource Allocation
              </h4>
              <div className="space-y-5">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] text-neutral-600 font-black uppercase">Settlement</span>
                    <span className="text-neutral-400 font-bold text-xs">${(balance * 0.9).toLocaleString()}</span>
                 </div>
                 <div className="w-full bg-neutral-900/60 h-1 rounded-full overflow-hidden">
                    <div className="bg-emerald-800/60 h-full w-[90%]" />
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] text-neutral-600 font-black uppercase">Reserved</span>
                    <span className="text-neutral-400 font-bold text-xs">${(balance * 0.1).toLocaleString()}</span>
                 </div>
                 <div className="w-full bg-neutral-900/60 h-1 rounded-full overflow-hidden">
                    <div className="bg-[#facc15]/40 h-full w-[10%]" />
                 </div>
              </div>
           </div>

           <div className="bg-[#121212]/40 p-6 rounded-[2rem] border border-neutral-800/40 space-y-4 shadow-md">
              <h4 className="text-[10px] font-black text-neutral-600 uppercase tracking-widest border-b border-neutral-800/30 pb-3 flex items-center gap-2">
                 <ShieldAlert size={14} className="text-red-900/60" /> Compliance
              </h4>
              <p className="text-[9px] text-neutral-700 leading-relaxed font-black uppercase italic">
                 Node verification pending for international wire transfers. Localized USDT settlements are instantaneous.
              </p>
           </div>
        </div>

        {/* COL 2: Transaction Engine */}
        <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
          <div className="bg-[#121212]/60 p-8 sm:p-10 rounded-[2.5rem] border border-neutral-800/50 shadow-lg space-y-8 relative">
            <div className="flex justify-between items-center">
               <div className="flex bg-black/40 p-1 rounded-xl border border-neutral-800/40">
                  <button onClick={() => setFlowMode('deposit')} className={`px-6 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${flowMode === 'deposit' ? 'bg-[#facc15]/60 text-black shadow-md' : 'text-neutral-600 hover:text-neutral-400'}`}>Deposit</button>
                  <button onClick={() => setFlowMode('withdraw')} className={`px-6 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${flowMode === 'withdraw' ? 'bg-emerald-900/60 text-neutral-300 shadow-md' : 'text-neutral-600 hover:text-neutral-400'}`}>Withdraw</button>
               </div>
               {showCheckout && (
                 <button onClick={() => setShowCheckout(false)} className="text-[9px] font-black text-neutral-700 hover:text-neutral-400 uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                    <ArrowRight size={12} className="rotate-180" /> Change Amount
                 </button>
               )}
            </div>

            {!showCheckout ? (
              <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-neutral-700 uppercase tracking-[0.4em] px-2">Allocation Amount (USD)</label>
                  <div className="relative">
                    <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-black/40 border border-neutral-800/40 rounded-2xl px-6 py-5 text-4xl font-black text-neutral-300 outline-none focus:border-[#facc15]/40 transition-all" />
                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-800 font-black text-xl">USD</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] font-black text-neutral-700 uppercase tracking-[0.4em] px-2">Provider Node</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(flowMode === 'deposit' ? activeGateways : [
                      { id: 'bank', icon: Building2, label: 'Bank' },
                      { id: 'binance', icon: Scan, label: 'Binance' },
                      { id: 'gpay', icon: Smartphone, label: 'GPay' },
                      { id: 'paypal', icon: Globe, label: 'PayPal' }
                    ]).map((item: any) => (
                      <button 
                        key={item.id}
                        onClick={() => flowMode === 'deposit' ? setSelectedGatewayId(item.id) : setWithdrawMethod(item.id)}
                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                          (flowMode === 'deposit' ? selectedGatewayId === item.id : withdrawMethod === item.id) 
                            ? 'bg-[#facc15]/50 text-neutral-900 border-[#facc15]/60' : 'bg-black/20 border-neutral-800/40 text-neutral-600 hover:text-neutral-400'
                        }`}
                      >
                        <item.icon size={20} className="opacity-70" />
                        <span className="text-[8px] font-black uppercase tracking-widest">{item.name || item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={() => setShowCheckout(true)} className={`w-full py-5 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] ${flowMode === 'withdraw' ? 'bg-emerald-900/60 text-neutral-300' : 'bg-[#facc15]/60 text-black'}`}>
                  INITIALIZE {flowMode.toUpperCase()} <ChevronRight size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in zoom-in-95 duration-500">
                <div className="p-4 bg-black/30 border border-neutral-800/30 rounded-2xl text-center">
                   <p className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">Routing via {flowMode === 'deposit' ? selectedGateway?.name : withdrawMethod.toUpperCase()}</p>
                </div>
                {renderCheckoutContent()}
                {isProcessing ? (
                   <div className="py-10 text-center space-y-4">
                      <Loader2 className={`animate-spin mx-auto ${flowMode === 'withdraw' ? 'text-emerald-700/60' : 'text-[#facc15]/60'}`} size={32} />
                      <p className="font-black text-[10px] text-neutral-600 uppercase tracking-widest animate-pulse">{processingStatus}</p>
                   </div>
                ) : (
                  <button onClick={handleProcessTransaction} className={`w-full py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 ${flowMode === 'withdraw' ? 'bg-emerald-900/60 text-neutral-300' : 'bg-[#facc15]/60 text-black'}`}>
                    AUTHORIZE HANDSHAKE <Zap size={18} className="fill-current opacity-70" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* COL 3: History & Activity Ledger */}
        <div className="lg:col-span-3 space-y-6 order-3">
           <div className="bg-[#121212]/40 p-6 rounded-[2rem] border border-neutral-800/40 space-y-6 shadow-md h-full flex flex-col">
              <h4 className="text-[10px] font-black text-neutral-600 uppercase tracking-widest border-b border-neutral-800/30 pb-3 flex items-center gap-2">
                 <History size={14} className="text-[#facc15]/50" /> Node Activity
              </h4>
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[300px] lg:max-h-none scrollbar-hide">
                 {[
                   { type: 'dep', amt: '+ $2,500', date: '2H AGO', status: 'verified' },
                   { type: 'wit', amt: '- $450', date: '5H AGO', status: 'settled' },
                   { type: 'dep', amt: '+ $1,200', date: '1D AGO', status: 'verified' },
                 ].map((tx, idx) => (
                   <div key={idx} className="bg-black/20 p-3 rounded-xl border border-neutral-800/20 flex justify-between items-center group hover:border-[#facc15]/20 transition-colors">
                      <div>
                         <span className={`text-[8px] font-black uppercase ${tx.type === 'dep' ? 'text-emerald-800/80' : 'text-red-900/70'}`}>{tx.amt}</span>
                         <p className="text-[8px] text-neutral-700 font-bold uppercase mt-1">{tx.date}</p>
                      </div>
                      <div className="text-[7px] text-neutral-700 font-black uppercase tracking-widest bg-neutral-900/40 px-1.5 py-1 rounded">
                         {tx.status}
                      </div>
                   </div>
                 ))}
              </div>
              <div className="pt-4 border-t border-neutral-800/30">
                 <button className="w-full py-3 rounded-xl border border-neutral-800/40 text-[9px] font-black text-neutral-700 uppercase tracking-widest hover:text-neutral-400 hover:border-neutral-700/50 transition-all">
                    View Full Ledger
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WalletSettings;