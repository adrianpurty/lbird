
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
  Shield,
  Target,
  Database,
  TrendingUp,
  DollarSign,
  Landmark,
  ShoppingBag,
  CircleDollarSign,
  CreditCard as CardIcon
} from 'lucide-react';
import { GatewayAPI } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface WalletSettingsProps {
  stripeConnected: boolean;
  onConnect: () => void;
  balance: number;
  onDeposit: (amount: number, provider?: string) => void;
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
  const [withdrawMethod, setWithdrawMethod] = useState<string>('bank');

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
      case 'paypal': return Globe;
      case 'adyen': return Landmark;
      case 'braintree': return Cpu;
      case 'square': return ShoppingBag;
      case 'authorize_net': return ShieldCheck;
      case 'razorpay': return Zap;
      case 'mollie': return Activity;
      case 'paystack': return Database;
      case 'crypto': return Bitcoin;
      case 'binance': return Scan;
      case 'upi': return Smartphone;
      case 'skrill': return Wallet;
      case 'neteller': return CircleDollarSign;
      case 'klarna': return CardIcon;
      case 'alipay': return Globe;
      case 'wechat': return Smartphone;
      default: return Database;
    }
  };

  const handleProcessTransaction = async () => {
    const numericAmount = parseFloat(amount) || 0;
    if (numericAmount <= 0) return;
    if (flowMode === 'withdraw' && numericAmount > balance) return;

    setIsProcessing(true);
    soundService.playClick(true);
    
    const stages = flowMode === 'deposit' 
      ? ['Syncing Node...', 'Validating Key...', 'Authorizing Transfer...', 'Settle Assets']
      : ['Allocating...', 'Routing...', 'Hashing...', 'Settled'];

    for (const stage of stages) {
      setProcessingStatus(stage);
      await new Promise(r => setTimeout(r, 650));
    }

    const providerName = flowMode === 'deposit' 
        ? (selectedGateway?.name || selectedGateway?.provider.toUpperCase() || 'SYNC_NODE')
        : (withdrawMethod.toUpperCase());

    onDeposit(flowMode === 'deposit' ? numericAmount : -numericAmount, providerName);
    setIsProcessing(false);
    setShowCheckout(false);
    soundService.playClick(false);
  };

  const renderCompactForm = () => {
    if (flowMode === 'deposit') {
      if (!selectedGateway) return null;
      if (selectedGateway.provider === 'binance' || selectedGateway.provider === 'crypto') {
        return (
          <div className="flex flex-col items-center gap-6 p-8 bg-black/60 rounded-[2.5rem] border-2 border-neutral-800/40 animate-in zoom-in-95 duration-500">
             <div className="p-4 bg-white rounded-3xl">
                <QrCode size={180} className="text-black" />
             </div>
             <div className="text-center space-y-3">
                <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.4em] mb-2">MASTER_PAY_NODE</p>
                <div className="px-4 py-3 bg-black/40 rounded-2xl border border-emerald-500/20 flex items-center gap-4">
                   <p className="text-sm font-mono font-bold text-[#00e5ff] break-all">{selectedGateway.publicKey || '0x_NULL_NODE'}</p>
                   <button className="text-neutral-700 hover:text-white transition-colors" onClick={() => { navigator.clipboard.writeText(selectedGateway.publicKey); soundService.playClick(); }}>
                      <Scan size={16} />
                   </button>
                </div>
             </div>
          </div>
        );
      }
      return (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] px-2 italic">IDENTIFIER_LEGAL</label>
            <input className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#00e5ff]/60 transition-all placeholder:text-neutral-900" placeholder="LEGAL CARDHOLDER IDENTITY" value={cardInfo.name} onChange={e => setCardInfo({...cardInfo, name: e.target.value.toUpperCase()})} />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] px-2 italic">DATA_STRING_NODE</label>
            <input className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-4 text-neutral-400 font-mono text-lg outline-none focus:border-[#00e5ff]/60 transition-all placeholder:text-neutral-900" placeholder="0000 0000 0000 0000" maxLength={19} value={cardInfo.number} onChange={e => setCardInfo({...cardInfo, number: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] px-2 italic">TERMINATION</label>
                <input className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-4 text-neutral-400 font-mono text-lg outline-none focus:border-[#00e5ff]/60" placeholder="MM/YY" maxLength={5} value={cardInfo.expiry} onChange={e => setCardInfo({...cardInfo, expiry: e.target.value})} />
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] px-2 italic">CVV_TOKEN</label>
                <input className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-4 text-neutral-400 font-mono text-lg outline-none focus:border-[#00e5ff]/60" placeholder="•••" maxLength={4} value={cardInfo.cvv} onChange={e => setCardInfo({...cardInfo, cvv: e.target.value})} />
             </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="space-y-6 animate-in slide-in-from-top-4 duration-500">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] px-2 italic">RECIPIENT_PROTOCOL</label>
              <input className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#00e5ff]/60 transition-all" placeholder="MASTER ACCOUNT IDENTITY" value={withdrawDetails.accountName} onChange={e => setWithdrawDetails({...withdrawDetails, accountName: e.target.value})} />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] px-2 italic">ENDPOINT_IBAN_SWIFT</label>
              <input className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-4 text-neutral-400 font-mono text-lg outline-none focus:border-[#00e5ff]/60 transition-all" placeholder="ROUTING_TOKEN_STRING" value={withdrawDetails.iban} onChange={e => setWithdrawDetails({...withdrawDetails, iban: e.target.value})} />
           </div>
        </div>
      );
    }
  };

  const withdrawalOptions = [
    { id: 'bank', provider: 'adyen', name: 'SWIFT_WIRE' },
    { id: 'binance', provider: 'binance', name: 'BNB_PAY' },
    { id: 'razorpay', provider: 'razorpay', name: 'RZRPY_INSTANT' },
    { id: 'paypal', provider: 'paypal', name: 'PAYPAL_DIRECT' }
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-32 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b-2 border-neutral-900 pb-12">
        <div className="relative">
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-4 h-24 bg-[#00e5ff] rounded-full blur-xl opacity-20" />
          <h2 className="text-4xl font-futuristic text-white italic uppercase flex items-center gap-8 text-glow">
            VAULT <span className="text-neutral-600 font-normal">API</span>
          </h2>
          <div className="flex items-center gap-6 mt-6">
            <div className="px-4 py-1.5 bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-full text-[10px] font-black text-[#00e5ff] uppercase tracking-widest">FINANCE_TERMINAL_V4.5</div>
            <span className="text-[12px] text-neutral-600 font-bold uppercase tracking-widest italic">LIQUIDITY_POOL_ACTIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="p-6 bg-[#0f0f0f] border-2 border-neutral-900 rounded-3xl shadow-2xl flex items-center gap-6 group hover:border-[#00e5ff]/50 transition-all cursor-default overflow-hidden">
            <div className="w-14 h-14 bg-[#00e5ff]/10 rounded-2xl flex items-center justify-center text-[#00e5ff] group-hover:scale-110 transition-transform shrink-0">
              <RefreshCw size={28} className="animate-spin-slow" />
            </div>
            <div>
              <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest block mb-1">THROUGHPUT</span>
              <span className="text-3xl font-tactical text-white tracking-widest leading-none text-glow">14.2ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* TELEMETRY HUD */}
      <div className="bg-[#0f0f0f] border border-neutral-800/60 rounded-[1.5rem] p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-12 overflow-x-auto scrollbar-hide w-full">
          <div className="flex flex-col shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[10px] tracking-widest mb-1">Vault Liquidity</span>
            <div className="text-4xl font-black text-white italic tracking-tighter flex items-baseline gap-2 font-tactical">
              <span className="text-sm text-[#00e5ff] opacity-40">$</span>{balance.toLocaleString()}
            </div>
          </div>
          <div className="hidden md:block h-10 w-px bg-neutral-800" />
          <div className="flex items-center gap-8 shrink-0">
            <div>
              <span className="text-neutral-700 font-black uppercase text-[10px] tracking-widest mb-1">Efficiency</span>
              <div className="text-lg font-black text-emerald-500/80 italic flex items-center gap-3 font-tactical tracking-widest">
                <Activity size={16} className="animate-pulse" /> 99.9%
              </div>
            </div>
            <div>
              <span className="text-neutral-700 font-black uppercase text-[10px] tracking-widest mb-1">Active Nodes</span>
              <div className="text-lg font-black text-neutral-400 italic font-tactical tracking-widest uppercase">{activeGateways.length} Units Connected</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/40 p-2 rounded-2xl border border-neutral-800/40 shrink-0">
           <button 
            onClick={() => { soundService.playClick(); setFlowMode('deposit'); setShowCheckout(false); }} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${flowMode === 'deposit' ? 'bg-white text-black shadow-lg shadow-white/5' : 'text-neutral-600 hover:text-neutral-400'}`}
           >
             <ArrowDownLeft size={16} /> Asset_In
           </button>
           <button 
            onClick={() => { soundService.playClick(); setFlowMode('withdraw'); setShowCheckout(false); }} 
            className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${flowMode === 'withdraw' ? 'bg-neutral-800 text-white shadow-lg' : 'text-neutral-600 hover:text-neutral-400'}`}
           >
             <ArrowUpRight size={16} /> Asset_Out
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-[#0c0c0c]/90 rounded-[3rem] border-2 border-neutral-900 p-10 shadow-2xl relative overflow-hidden scanline-effect group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <Database size={120} />
            </div>

            {!showCheckout ? (
              <div className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                     <label className="text-[11px] font-black text-neutral-600 uppercase tracking-widest px-2 italic flex items-center gap-3">
                       <DollarSign size={16} className="text-[#00e5ff]" /> UNIT_SETTLEMENT (USD)
                     </label>
                     <div className="relative">
                        <input 
                          type="number" 
                          value={amount} 
                          onChange={(e) => setAmount(e.target.value)} 
                          className="w-full bg-black border-4 border-neutral-800 rounded-[2.5rem] px-16 py-8 text-5xl font-black text-white outline-none focus:border-[#00e5ff] transition-all font-tactical tracking-widest" 
                        />
                        <span className="absolute left-10 top-1/2 -translate-y-1/2 text-neutral-700 font-black text-3xl italic font-tactical">$</span>
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                     <label className="text-[11px] font-black text-neutral-600 uppercase tracking-widest px-2 italic flex items-center gap-3">
                       <Cpu size={16} className="text-[#00e5ff]" /> ACTIVE_GATEWAY_NODE
                     </label>
                     <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                       {(flowMode === 'deposit' ? activeGateways : withdrawalOptions).map((item: any) => {
                         const Icon = getProviderIcon(item.provider);
                         const isSelected = flowMode === 'deposit' ? selectedGatewayId === item.id : withdrawMethod === item.id;
                         return (
                           <button 
                             key={item.id}
                             onClick={() => { soundService.playClick(true); flowMode === 'deposit' ? setSelectedGatewayId(item.id) : setWithdrawMethod(item.id); }}
                             className={`p-6 rounded-3xl border-2 flex flex-col items-center justify-center gap-3 transition-all ${
                               isSelected 
                                 ? 'bg-[#00e5ff] text-black border-[#00e5ff] shadow-xl' 
                                 : 'bg-black/40 border-neutral-800/60 text-neutral-600 hover:border-neutral-600 hover:text-neutral-400'
                             }`}
                           >
                             <Icon size={24} />
                             <span className="text-[10px] font-black uppercase tracking-widest font-tactical truncate w-full text-center">{item.name || item.provider.toUpperCase()}</span>
                           </button>
                         );
                       })}
                     </div>
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={() => { soundService.playClick(true); setShowCheckout(true); }} 
                    className="w-full py-8 rounded-[3rem] font-black text-2xl uppercase italic tracking-widest transition-all border-b-[10px] active:scale-[0.98] font-tactical bg-black text-white border-neutral-800 hover:bg-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                  >
                    INITIALIZE_{flowMode.toUpperCase()}_HANDSHAKE
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-10 animate-in zoom-in-95 duration-500">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-8">
                  <div>
                    <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter font-futuristic">NODE_PROTOCOL_AUTH</h3>
                    <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.4em] mt-2 italic">ESTABLISHING TUNNEL TO {selectedGateway?.name || flowMode.toUpperCase()}</p>
                  </div>
                  <button onClick={() => setShowCheckout(false)} className="px-6 py-2.5 border-2 border-neutral-800 rounded-xl text-[10px] font-black text-neutral-700 uppercase tracking-widest hover:text-white transition-colors">ABORT_SEQUENCE</button>
                </div>
                
                <div className="max-w-xl mx-auto py-4">
                  {renderCompactForm()}
                </div>
                
                {isProcessing ? (
                   <div className="py-16 text-center space-y-8 bg-black/20 rounded-[3rem] border border-neutral-800/40 border-dashed">
                      <div className="relative mx-auto w-16 h-16">
                        <Loader2 className="animate-spin text-[#00e5ff]/40 w-full h-full" />
                        <Activity className="absolute inset-0 m-auto text-[#00e5ff] animate-pulse" size={20} />
                      </div>
                      <div className="space-y-2">
                        <p className="font-black text-xl text-neutral-200 uppercase tracking-[0.2em] animate-pulse font-tactical italic">{processingStatus}</p>
                        <p className="text-[10px] text-neutral-700 font-black uppercase tracking-widest italic">ENCRYPTING_NODAL_HANDSHAKE</p>
                      </div>
                   </div>
                ) : (
                  <button 
                    onClick={handleProcessTransaction} 
                    className="w-full py-8 rounded-[3rem] font-black text-2xl border-b-[10px] active:scale-95 italic tracking-widest uppercase font-tactical bg-black text-white border-neutral-800 hover:bg-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                  >
                    AUTHORIZE_MASTER_SETTLEMENT
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="bg-[#0f0f0f] border-2 border-neutral-900 p-8 rounded-[2.5rem] flex items-start gap-6 shadow-xl">
            <ShieldCheck className="text-emerald-500 shrink-0" size={24} />
            <div>
               <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1">LEDGER_INTEGRITY_SYNC</h4>
               <p className="text-[10px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
                 Financial settlements are cryptographically broadcast to the immutable global ledger. Sync latency is dependent on the provisioned gateway node. Handshakes are permanent.
               </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 h-full">
           <div className="bg-[#0f0f0f] p-8 rounded-[3rem] border-2 border-neutral-900 h-full flex flex-col shadow-2xl relative overflow-hidden group min-h-[600px]">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <History size={120} />
              </div>

              <div className="flex justify-between items-center border-b border-neutral-800/40 pb-8 mb-8 relative z-10">
                 <h4 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-3 font-futuristic">
                    <History size={16} className="text-[#00e5ff]" /> MASTER_LEDGER
                 </h4>
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_#10b981]" />
              </div>
              
              <div className="flex-1 space-y-4 overflow-y-auto pr-2 scrollbar-hide relative z-10">
                 {[
                   { type: 'dep', amt: '+ $2,500.00', hub: 'STRIPE_NODE_A', date: '5m' },
                   { type: 'wit', amt: '- $1,245.50', hub: 'SWIFT_CORE', date: '1h' },
                   { type: 'dep', amt: '+ $500.00', hub: 'BNB_PAY_SYNC', date: '6h' },
                   { type: 'dep', amt: '+ $8,000.00', hub: 'ROOT_GATEWAY', date: '1d' },
                   { type: 'wit', amt: '- $300.00', hub: 'PAYPAL_HUB', date: '2d' },
                   { type: 'dep', amt: '+ $1,200.00', hub: 'CRYPTO_NODE', date: '3d' },
                 ].map((tx, idx) => (
                   <div key={idx} className="bg-black/40 p-5 rounded-2xl border border-neutral-800/30 flex items-center justify-between group/tx hover:border-[#00e5ff]/30 transition-all cursor-default">
                      <div className="flex items-center gap-5">
                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.type === 'dep' ? 'bg-emerald-900/10 text-emerald-500' : 'bg-red-900/10 text-red-500'}`}>
                            {tx.type === 'dep' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                         </div>
                         <div className="min-w-0">
                            <p className="text-[11px] text-neutral-200 font-black uppercase tracking-tight font-futuristic truncate max-w-[140px]">{tx.hub}</p>
                            <p className="text-[8px] text-neutral-700 font-bold uppercase mt-1">{tx.date} AGO // AUTHED</p>
                         </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-lg font-black italic font-tactical tracking-widest ${tx.type === 'dep' ? 'text-emerald-500' : 'text-neutral-500'}`}>{tx.amt}</span>
                      </div>
                   </div>
                 ))}
              </div>

              <div className="mt-8 pt-8 border-t border-neutral-800/40 relative z-10">
                 <button className="w-full bg-neutral-900 text-neutral-500 hover:text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border-b-4 border-neutral-950 transition-all flex items-center justify-center gap-3 active:translate-y-1 active:border-b-0">
                   <Shield size={16} /> EXPORT_AUDIT_LOG
                 </button>
              </div>
           </div>
        </div>
      </div>
      
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default WalletSettings;
