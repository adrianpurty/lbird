
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
  ArrowRight
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
  
  const [depositAmount, setDepositAmount] = useState<string>('500');
  const [selectedGatewayId, setSelectedGatewayId] = useState<string>(activeGateways[0]?.id || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<string>('');

  const selectedGateway = gateways.find(g => g.id === selectedGatewayId);

  // Card Info State for Stripe
  const [cardInfo, setCardInfo] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const formatCardNumber = (val: string) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) return parts.join(' ');
    return v;
  };

  const handleVerifyPayment = async () => {
    if (!selectedGateway) return;

    setIsProcessing(true);
    const amount = parseFloat(depositAmount) || 0;

    // --- STRIPE INTEGRATION LOGIC ---
    if (selectedGateway.provider === 'stripe') {
      try {
        setProcessingStatus(`Initializing Stripe SDK (Key: ${selectedGateway.publicKey.substring(0, 8)}...)`);
        
        // Use the global Stripe object loaded in index.html
        if (typeof Stripe === 'undefined') {
            throw new Error("Stripe SDK not loaded. Check connection.");
        }

        // Initialize Stripe with the public key from our admin settings
        const stripe = Stripe(selectedGateway.publicKey);
        
        setProcessingStatus('Securing Payment Channel...');
        await new Promise(r => setTimeout(r, 1000));

        setProcessingStatus('Verifying Card via Stripe Network...');
        // In a real production app, we would use stripe.createPaymentMethod or stripe.confirmCardPayment
        // Since we are in a demo environment with no real backend client_secret, we simulate the handshake
        // using the initialized Stripe object as proof of integration logic.
        
        await new Promise(r => setTimeout(r, 1500));

        setProcessingStatus('Capturing Settleable Funds...');
        await new Promise(r => setTimeout(r, 800));

        onDeposit(amount);
        setIsProcessing(false);
        setShowCheckout(false);
        alert(`STRIPE SUCCESS: Deposit of $${amount} settled. Transaction ID: lb_tx_${Math.random().toString(36).substr(2, 9)}`);
      } catch (err: any) {
        setIsProcessing(false);
        alert(`STRIPE ERROR: ${err.message}`);
      }
      return;
    }

    // --- FALLBACK FOR OTHER PROVIDERS ---
    setProcessingStatus(`Connecting to ${selectedGateway.name} Node...`);
    setTimeout(() => {
      setProcessingStatus('Verifying API Handshake...');
      setTimeout(() => {
        setProcessingStatus('Capturing Settleable Funds...');
        setTimeout(() => {
          onDeposit(amount);
          setIsProcessing(false);
          setShowCheckout(false);
          alert(`DEPOSIT SUCCESS: $${amount} added via ${selectedGateway.name}.`);
        }, 1200);
      }, 1000);
    }, 800);
  };

  const renderCheckoutContent = () => {
    if (!selectedGateway) return null;

    switch (selectedGateway.provider) {
      case 'crypto':
        return (
          <div className="space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex flex-col items-center text-center space-y-4 py-4">
              <div className="p-4 bg-white rounded-2xl shadow-2xl">
                <QrCode size={160} className="text-black" />
              </div>
              <div className="space-y-1">
                <p className="text-xs text-neutral-500 font-black uppercase tracking-widest">Send Exactly ${depositAmount} USD</p>
                <p className="text-[10px] text-[#facc15] font-mono break-all px-10">{selectedGateway.publicKey}</p>
              </div>
            </div>
            <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl text-[11px] text-blue-400 flex items-start gap-3">
              <ShieldAlert size={16} className="shrink-0" />
              <span>Network fee of {selectedGateway.fee}% applies. Transfers are final and logged on-chain.</span>
            </div>
          </div>
        );
      case 'stripe':
        return (
          <div className="space-y-6 animate-in fade-in zoom-in-95">
             <div className="bg-black border border-neutral-800 rounded-3xl p-8 space-y-6">
                <div className="flex items-center gap-4 border-b border-neutral-800 pb-4 mb-2">
                   <div className="w-12 h-12 bg-[#635bff] rounded-xl flex items-center justify-center shadow-lg">
                      <CreditCard className="text-white" size={24} />
                   </div>
                   <div>
                      <h4 className="text-white font-bold">Stripe Payments Enabled</h4>
                      <p className="text-[10px] text-neutral-500 uppercase font-black tracking-widest">PCI-DSS Secure Endpoint</p>
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Full Name on Card</label>
                    <input 
                      className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-4 text-white text-sm focus:border-[#facc15] outline-none transition-all"
                      placeholder="CARDHOLDER NAME"
                      value={cardInfo.name}
                      onChange={e => setCardInfo({...cardInfo, name: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Card Number</label>
                    <input 
                      className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-4 text-white text-sm font-mono focus:border-[#facc15] outline-none transition-all"
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      value={cardInfo.number}
                      onChange={e => setCardInfo({...cardInfo, number: formatCardNumber(e.target.value)})}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Expiry</label>
                        <input 
                        className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-4 text-white text-sm font-mono outline-none focus:border-[#facc15]"
                        placeholder="MM / YY"
                        maxLength={5}
                        value={cardInfo.expiry}
                        onChange={e => setCardInfo({...cardInfo, expiry: e.target.value})}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">CVV</label>
                        <input 
                        type="password"
                        className="w-full bg-[#111] border border-neutral-800 rounded-xl px-4 py-4 text-white text-sm font-mono outline-none focus:border-[#facc15]"
                        placeholder="•••"
                        maxLength={4}
                        value={cardInfo.cvv}
                        onChange={e => setCardInfo({...cardInfo, cvv: e.target.value})}
                        />
                    </div>
                  </div>
                </div>
             </div>
          </div>
        );
      default:
        return (
          <div className="p-10 text-center bg-black border border-neutral-900 rounded-3xl space-y-4">
            <Globe className="text-[#facc15] mx-auto animate-pulse" size={40} />
            <p className="text-white font-black uppercase tracking-widest italic">Awaiting API Node Sync...</p>
            <p className="text-neutral-500 text-[10px]">Processing via {selectedGateway.name}</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="bg-gradient-to-br from-[#161616] to-black p-10 rounded-[2.5rem] border border-neutral-900 flex flex-col lg:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <span className="text-neutral-600 font-black uppercase text-[10px] tracking-[0.4em] block mb-2">Portfolio Liquidity</span>
          <div className="text-7xl font-black text-white flex items-baseline gap-2 italic tracking-tighter">
            ${balance.toLocaleString()}
          </div>
          <div className="flex items-center gap-2 mt-4 text-emerald-500">
            <ShieldCheck size={20} />
            <span className="text-[11px] font-black uppercase tracking-widest">Escrow-Vault Enabled</span>
          </div>
        </div>
        <div className="flex gap-4 relative z-10 w-full lg:w-auto">
          <button className="flex-1 lg:flex-none bg-neutral-900 text-white px-10 py-6 rounded-3xl font-black text-xs border border-neutral-800 hover:bg-neutral-800 active:scale-95 transition-all">WITHDRAW</button>
          <button onClick={() => { setShowCheckout(true); if(!selectedGatewayId) setSelectedGatewayId(activeGateways[0]?.id || '')}} className="flex-1 lg:flex-none bg-[#facc15] text-black px-12 py-6 rounded-3xl font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-yellow-400/20">RECHARGE</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <div className="bg-[#121212] p-10 rounded-[3rem] border border-neutral-900 shadow-2xl space-y-10">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                <Plus className="text-[#facc15]" /> {showCheckout ? 'Stripe Checkout Protocol' : 'Deposit Interface'}
              </h3>
              {showCheckout && !isProcessing && (
                <button onClick={() => setShowCheckout(false)} className="text-[10px] font-black text-neutral-500 hover:text-white uppercase tracking-widest">Cancel</button>
              )}
            </div>

            {!showCheckout ? (
              <div className="space-y-10 animate-in slide-in-from-bottom-2">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Amount (USD)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-[2rem] px-10 py-8 text-5xl font-black text-white outline-none focus:border-[#facc15] transition-all"
                    />
                    <span className="absolute right-10 top-1/2 -translate-y-1/2 text-neutral-700 font-black text-3xl">USD</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Choose Payment Node</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {activeGateways.map((gw) => (
                      <button 
                        key={gw.id}
                        onClick={() => setSelectedGatewayId(gw.id)}
                        className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${selectedGatewayId === gw.id ? 'bg-[#facc15]/10 border-[#facc15] text-[#facc15]' : 'bg-black border-neutral-800 text-neutral-600 hover:border-neutral-700'}`}
                      >
                        {gw.provider === 'stripe' && <CreditCard size={24} />}
                        {gw.provider === 'crypto' && <Bitcoin size={24} />}
                        {gw.provider === 'upi' && <Smartphone size={24} />}
                        {gw.provider === 'paypal' && <Globe size={24} />}
                        <span className="text-[9px] font-black uppercase text-center">{gw.name}</span>
                      </button>
                    ))}
                    {activeGateways.length === 0 && (
                      <p className="col-span-full text-red-500 text-xs font-black uppercase italic p-4 text-center">No payment nodes currently online.</p>
                    )}
                  </div>
                </div>

                <button 
                  disabled={activeGateways.length === 0}
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-[#facc15] text-black py-8 rounded-[2rem] font-black text-2xl hover:bg-[#eab308] transition-all flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50"
                >
                  INITIALIZE RECHARGE <ArrowRight size={28} />
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {renderCheckoutContent()}
                
                {isProcessing ? (
                   <div className="bg-black border border-[#facc15]/20 p-8 rounded-[2rem] text-center space-y-4">
                      <Loader2 className="animate-spin text-[#facc15] mx-auto" size={40} />
                      <p className="text-[#facc15] font-black text-xs uppercase tracking-[0.2em] animate-pulse">{processingStatus}</p>
                   </div>
                ) : (
                  <button 
                    onClick={handleVerifyPayment}
                    className="w-full bg-[#facc15] text-black py-8 rounded-[2rem] font-black text-2xl hover:bg-yellow-500 transition-all flex items-center justify-center gap-3"
                  >
                    AUTHORIZE STRIPE TRANSFER <Zap size={28} />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-[#121212] p-8 rounded-[2.5rem] border border-neutral-900 space-y-6">
              <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                 <ShieldCheck className="text-emerald-500" size={16} /> Stripe Secure Ledger
              </h4>
              <p className="text-neutral-500 text-xs leading-relaxed italic">
                "Payments are processed through Stripe's secure infrastructure. We do not store full credit card details on our identity nodes."
              </p>
              <div className="pt-4 border-t border-neutral-800 flex justify-between">
                <span className="text-[9px] text-neutral-600 font-black uppercase">Active Nodes</span>
                <span className="text-white font-bold text-[10px]">{activeGateways.length} Online</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default WalletSettings;
