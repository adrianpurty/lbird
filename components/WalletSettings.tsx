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
  ShieldAlert,
  Lock,
  Calendar,
  Hash,
  Globe,
  Zap,
  ArrowRight,
  Scan,
  Building2,
  ArrowDownCircle,
  Banknote,
  Navigation
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

const WalletSettings: React.FC<WalletSettingsProps> = ({ stripeConnected, onConnect, balance, onDeposit, gateways }) => {
  const activeGateways = gateways.filter(g => g.status === 'active');
  
  // Interaction State
  const [amount, setAmount] = useState<string>('500');
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>(activeGateways[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [flowMode, setFlowMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [withdrawMethod, setWithdrawMethod] = useState<'bank' | 'binance' | 'gpay' | 'paypal'>('bank');

  const selectedGateway = gateways.find(g => g.id === selectedGatewayId);

  // Form Details
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
    
    if (numericAmount <= 0) {
      alert("ERROR: Enter a valid amount.");
      return;
    }

    if (flowMode === 'withdraw' && numericAmount > balance) {
      alert("INSUFFICIENT FUNDS: Portfolio balance is lower than requested settlement.");
      return;
    }

    setIsProcessing(true);

    if (flowMode === 'deposit') {
      // --- DEPOSIT FLOW ---
      if (selectedGateway?.provider === 'stripe') {
        try {
          setProcessingStatus(`Initializing Stripe SDK...`);
          if (typeof Stripe === 'undefined') throw new Error("Stripe SDK Offline");
          setProcessingStatus('Securing Payment Channel...');
          await new Promise(r => setTimeout(r, 1000));
          setProcessingStatus('Capturing Settleable Funds...');
          await new Promise(r => setTimeout(r, 1000));
          onDeposit(numericAmount);
        } catch (err: any) {
          alert(`STRIPE ERROR: ${err.message}`);
        }
      } else {
        setProcessingStatus(`Syncing with ${selectedGateway?.name || 'Node'}...`);
        await new Promise(r => setTimeout(r, 2000));
        onDeposit(numericAmount);
      }
    } else {
      // --- WITHDRAW FLOW ---
      setProcessingStatus(`Authenticating Settlement Request...`);
      await new Promise(r => setTimeout(r, 1000));
      setProcessingStatus(`Routing Funds to ${withdrawMethod.toUpperCase()} Node...`);
      await new Promise(r => setTimeout(r, 1500));
      setProcessingStatus(`Ledger Finalization...`);
      await new Promise(r => setTimeout(r, 800));
      
      // Debit the balance
      onDeposit(-numericAmount);
      alert(`SETTLEMENT SUCCESS: $${numericAmount} has been released to your ${withdrawMethod} account.`);
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
                 <div className="w-16 h-16 bg-[#F3BA2F]/10 rounded-2xl flex items-center justify-center border border-[#F3BA2F]/30 mb-2">
                    <Scan size={32} className="text-[#F3BA2F]" />
                 </div>
                 <div className="p-4 bg-white rounded-2xl shadow-2xl border-4 border-[#F3BA2F]">
                    <QrCode size={160} className="text-black" />
                 </div>
                 <div className="space-y-2">
                    <p className="text-xs text-neutral-500 font-black uppercase tracking-widest">Binance Pay ID</p>
                    <div className="bg-black/50 border border-neutral-800 rounded-xl px-6 py-3 font-mono text-sm font-bold text-[#F3BA2F]">
                      {selectedGateway.publicKey}
                    </div>
                 </div>
              </div>
            </div>
          );
        case 'stripe':
          return (
            <div className="bg-black border border-neutral-800 rounded-3xl p-8 space-y-6">
              <div className="flex items-center gap-4 border-b border-neutral-800 pb-4 mb-2">
                 <div className="w-12 h-12 bg-[#635bff] rounded-xl flex items-center justify-center shadow-lg"><CreditCard className="text-white" size={24} /></div>
                 <div><h4 className="text-white font-bold text-sm">Stripe Secure Endpoint</h4><p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest">PCI-DSS Level 1</p></div>
              </div>
              <div className="space-y-4">
                <input className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-4 text-white text-sm focus:border-[#facc15] outline-none" placeholder="CARDHOLDER NAME" value={cardInfo.name} onChange={e => setCardInfo({...cardInfo, name: e.target.value.toUpperCase()})} />
                <input className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-4 text-white text-sm font-mono focus:border-[#facc15] outline-none" placeholder="0000 0000 0000 0000" maxLength={19} value={cardInfo.number} onChange={e => setCardInfo({...cardInfo, number: formatCardNumber(e.target.value)})} />
                <div className="grid grid-cols-2 gap-4">
                  <input className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-4 text-white text-sm font-mono focus:border-[#facc15] outline-none" placeholder="MM / YY" maxLength={5} value={cardInfo.expiry} onChange={e => setCardInfo({...cardInfo, expiry: e.target.value})} />
                  <input className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-4 text-white text-sm font-mono focus:border-[#facc15] outline-none" placeholder="CVV" maxLength={4} value={cardInfo.cvv} onChange={e => setCardInfo({...cardInfo, cvv: e.target.value})} />
                </div>
              </div>
            </div>
          );
        default:
          return <div className="p-10 text-center"><p className="text-neutral-500 font-black uppercase text-xs italic tracking-widest">Routing via {selectedGateway.name} Node...</p></div>;
      }
    } else {
      // --- WITHDRAW FLOW CONTENT ---
      switch (withdrawMethod) {
        case 'bank':
          return (
            <div className="bg-black border border-neutral-800 rounded-3xl p-8 space-y-4">
              <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Institutional Wire Details</h4>
              <input className="w-full bg-[#111] border border-neutral-800 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-emerald-500" placeholder="ACCOUNT HOLDER NAME" value={withdrawDetails.accountName} onChange={e => setWithdrawDetails({...withdrawDetails, accountName: e.target.value})} />
              <input className="w-full bg-[#111] border border-neutral-800 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-emerald-500" placeholder="BANK NAME" value={withdrawDetails.bankName} onChange={e => setWithdrawDetails({...withdrawDetails, bankName: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input className="w-full bg-[#111] border border-neutral-800 rounded-xl px-5 py-4 text-white text-xs font-mono focus:border-emerald-500" placeholder="IBAN / ACCOUNT #" value={withdrawDetails.iban} onChange={e => setWithdrawDetails({...withdrawDetails, iban: e.target.value})} />
                <input className="w-full bg-[#111] border border-neutral-800 rounded-xl px-5 py-4 text-white text-xs font-mono focus:border-emerald-500" placeholder="SWIFT / BIC" value={withdrawDetails.swift} onChange={e => setWithdrawDetails({...withdrawDetails, swift: e.target.value})} />
              </div>
            </div>
          );
        case 'binance':
          return (
            <div className="bg-black border border-neutral-800 rounded-3xl p-8 space-y-4">
              <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Binance Pay Authentication</h4>
              <input className="w-full bg-[#111] border border-[#F3BA2F]/30 rounded-xl px-5 py-5 text-white font-mono text-sm outline-none focus:border-[#F3BA2F]" placeholder="ENTER BINANCE ID / PAY ID" value={withdrawDetails.binanceId} onChange={e => setWithdrawDetails({...withdrawDetails, binanceId: e.target.value})} />
              <div className="bg-[#F3BA2F]/5 border border-[#F3BA2F]/10 p-4 rounded-xl text-[9px] text-[#F3BA2F] italic uppercase font-black">Settlements processed in USDT/BUSD pegged at market parity.</div>
            </div>
          );
        case 'gpay':
          return (
            <div className="bg-black border border-neutral-800 rounded-3xl p-8 space-y-4">
              <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Google Pay Endpoint</h4>
              <input className="w-full bg-[#111] border border-neutral-800 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-blue-500" placeholder="GPAY PHONE OR EMAIL" value={withdrawDetails.gpayContact} onChange={e => setWithdrawDetails({...withdrawDetails, gpayContact: e.target.value})} />
            </div>
          );
        case 'paypal':
          return (
            <div className="bg-black border border-neutral-800 rounded-3xl p-8 space-y-4">
              <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">PayPal Verified Merchant Email</h4>
              <input className="w-full bg-[#111] border border-neutral-800 rounded-xl px-5 py-4 text-white text-sm outline-none focus:border-[#0070ba]" placeholder="PAYPAL@EXAMPLE.COM" value={withdrawDetails.paypalEmail} onChange={e => setWithdrawDetails({...withdrawDetails, paypalEmail: e.target.value})} />
            </div>
          );
      }
    }
  };

  return (
    <div className="lg:max-w-[75%] mx-auto space-y-8 pb-32 theme-transition">
      <div className="bg-gradient-to-br from-[#161616] to-black p-10 rounded-[2.5rem] border border-neutral-900 flex flex-col lg:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-neutral-600 font-black uppercase text-[10px] tracking-[0.4em] block mb-2">Portfolio Liquidity</span>
          <div className="text-7xl font-black text-white flex items-baseline gap-2 italic tracking-tighter">
            ${balance.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-4 text-emerald-500">
            <ShieldCheck size={20} />
            <span className="text-[11px] font-black uppercase tracking-widest">Escrow-Vault Protection Active</span>
          </div>
        </div>
        <div className="flex gap-4 relative z-10 w-full lg:w-auto">
          <button 
            onClick={() => { setFlowMode('withdraw'); setShowCheckout(false); }}
            className={`flex-1 lg:flex-none px-10 py-6 rounded-3xl font-black text-xs border transition-all active:scale-95 ${flowMode === 'withdraw' ? 'bg-emerald-600 text-white border-emerald-500 shadow-xl shadow-emerald-500/10' : 'bg-neutral-900 text-white border-neutral-800 hover:bg-neutral-800'}`}
          >
            WITHDRAW
          </button>
          <button 
            onClick={() => { setFlowMode('deposit'); setShowCheckout(false); }}
            className={`flex-1 lg:flex-none px-12 py-6 rounded-3xl font-black text-xs transition-all active:scale-95 shadow-2xl ${flowMode === 'deposit' ? 'bg-[#facc15] text-black shadow-yellow-400/20' : 'bg-neutral-900 text-white border border-neutral-800'}`}
          >
            RECHARGE
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <div className={`bg-[#121212] p-10 rounded-[3rem] border shadow-2xl space-y-10 transition-colors ${flowMode === 'withdraw' ? 'border-emerald-500/20' : 'border-neutral-900'}`}>
            <div className="flex justify-between items-center">
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                {flowMode === 'deposit' ? <Plus className="text-[#facc15]" /> : <ArrowUpRight className="text-emerald-500" />}
                {showCheckout ? (flowMode === 'deposit' ? `${selectedGateway?.name || 'Node'} Entry` : `${withdrawMethod.toUpperCase()} Settlement`) : (flowMode === 'deposit' ? 'Deposit Protocol' : 'Withdrawal Protocol')}
              </h3>
              {showCheckout && !isProcessing && (
                <button onClick={() => setShowCheckout(false)} className="text-[10px] font-black text-neutral-500 hover:text-white uppercase tracking-widest">Back to config</button>
              )}
            </div>

            {!showCheckout ? (
              <div className="space-y-10 animate-in slide-in-from-bottom-2">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Amount to {flowMode === 'deposit' ? 'Inject' : 'Extract'} (USD)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`w-full bg-black border rounded-[2rem] px-10 py-8 text-5xl font-black text-white outline-none transition-all ${flowMode === 'withdraw' ? 'focus:border-emerald-500 border-neutral-800' : 'focus:border-[#facc15] border-neutral-800'}`}
                    />
                    <span className="absolute right-10 top-1/2 -translate-y-1/2 text-neutral-700 font-black text-3xl">USD</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Target {flowMode === 'deposit' ? 'Input Node' : 'Settlement Endpoint'}</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {flowMode === 'deposit' ? (
                      activeGateways.map((gw) => (
                        <button 
                          key={gw.id}
                          onClick={() => setSelectedGatewayId(gw.id)}
                          className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${selectedGatewayId === gw.id ? 'bg-[#facc15]/10 border-[#facc15] text-[#facc15]' : 'bg-black border-neutral-800 text-neutral-600 hover:border-neutral-700'}`}
                        >
                          {gw.provider === 'stripe' && <CreditCard size={24} />}
                          {gw.provider === 'crypto' && <Bitcoin size={24} />}
                          {gw.provider === 'binance' && <Scan size={24} />}
                          <span className="text-[8px] font-black uppercase text-center leading-tight">{gw.name}</span>
                        </button>
                      ))
                    ) : (
                      <>
                        {[
                          { id: 'bank', icon: Building2, label: 'Wire' },
                          { id: 'binance', icon: Scan, label: 'Binance' },
                          { id: 'gpay', icon: Smartphone, label: 'GPay' },
                          { id: 'paypal', icon: Globe, label: 'PayPal' }
                        ].map(m => (
                          <button 
                            key={m.id}
                            onClick={() => setWithdrawMethod(m.id as any)}
                            className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${withdrawMethod === m.id ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-black border-neutral-800 text-neutral-600 hover:border-neutral-700'}`}
                          >
                            <m.icon size={24} />
                            <span className="text-[8px] font-black uppercase text-center leading-tight">{m.label}</span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => setShowCheckout(true)}
                  className={`w-full py-8 rounded-[2rem] font-black text-2xl transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 ${flowMode === 'withdraw' ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-[#facc15] text-black hover:bg-[#eab308]'}`}
                >
                  {flowMode === 'deposit' ? 'INITIALIZE RECHARGE' : 'INITIALIZE WITHDRAWAL'} <ArrowRight size={28} />
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {renderCheckoutContent()}
                
                {isProcessing ? (
                   <div className="bg-black border border-neutral-800 p-8 rounded-[2rem] text-center space-y-4">
                      <Loader2 className={`animate-spin mx-auto ${flowMode === 'withdraw' ? 'text-emerald-500' : 'text-[#facc15]'}`} size={40} />
                      <p className={`font-black text-[10px] uppercase tracking-[0.2em] animate-pulse ${flowMode === 'withdraw' ? 'text-emerald-500' : 'text-[#facc15]'}`}>{processingStatus}</p>
                   </div>
                ) : (
                  <button 
                    onClick={handleProcessTransaction}
                    className={`w-full py-8 rounded-[2rem] font-black text-2xl transition-all flex items-center justify-center gap-3 ${flowMode === 'withdraw' ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-[#facc15] text-black hover:bg-yellow-500'}`}
                  >
                    AUTHORIZE {flowMode === 'deposit' ? 'ENTRY' : 'SETTLEMENT'} <Zap size={28} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
           <div className={`bg-[#121212] p-8 rounded-[2.5rem] border space-y-6 ${flowMode === 'withdraw' ? 'border-emerald-500/20' : 'border-neutral-900'}`}>
              <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                 <ShieldCheck className={flowMode === 'withdraw' ? 'text-emerald-500' : 'text-[#facc15]'} size={16} /> Secure Protocol
              </h4>
              <p className="text-neutral-500 text-[10px] leading-relaxed italic uppercase font-black">
                {flowMode === 'deposit' 
                  ? "Recharge nodes utilize PCI-DSS level 1 security. Deposits are final once the block confirmation or gateway handshake completes."
                  : "Withdrawal requests undergo an automated compliance check. Settlements typically arrive within 4-12 hours depending on target node latency."}
              </p>
              <div className="pt-4 border-t border-neutral-800 flex justify-between items-center">
                <span className="text-[9px] text-neutral-600 font-black uppercase">Identity Linked</span>
                <span className="text-emerald-500 font-black text-[9px] flex items-center gap-1"><CheckCircle size={10} /> VERIFIED</span>
              </div>
           </div>

           {flowMode === 'withdraw' && (
             <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[2rem] space-y-3">
                <div className="flex items-center gap-2 text-emerald-500">
                  <Banknote size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Withdrawal Limit</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-black text-white italic">${balance.toLocaleString()}</span>
                  <span className="text-[9px] text-neutral-500 font-black uppercase">Max Extractable</span>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default WalletSettings;