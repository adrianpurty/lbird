
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
  Globe,
  Activity,
  History,
  ArrowDownLeft,
  ArrowUpRight,
  Cpu,
  RefreshCw,
  Shield,
  Database,
  DollarSign,
  Landmark,
  ShoppingBag,
  CircleDollarSign,
  ArrowRight
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
    swift: ''
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
      ? ['Syncing Node...', 'Validating Key...', 'Settling...']
      : ['Allocating...', 'Routing...', 'Settled'];

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

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500 font-rajdhani px-4 md:px-0">
      
      {/* COMPACT HEADER */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[#00e5ff]/10 rounded-xl flex items-center justify-center text-[#00e5ff] shadow-glow-sm">
            <Database size={20} />
          </div>
          <div>
            <h2 className="text-xl font-futuristic text-white italic uppercase leading-none tracking-tight">VAULT <span className="text-neutral-500 font-normal">API</span></h2>
            <p className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em] mt-1">NODE_SYNC_READY</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-neutral-900/50 p-1 rounded-lg border border-neutral-800">
           <button 
            onClick={() => { soundService.playClick(); setFlowMode('deposit'); setShowCheckout(false); }} 
            className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${flowMode === 'deposit' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
           >
             Deposit
           </button>
           <button 
            onClick={() => { soundService.playClick(); setFlowMode('withdraw'); setShowCheckout(false); }} 
            className={`px-4 py-1.5 rounded-md text-[9px] font-black uppercase tracking-widest transition-all ${flowMode === 'withdraw' ? 'bg-white text-black' : 'text-neutral-500 hover:text-white'}`}
           >
             Withdraw
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* OPERATION HUB (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#0c0c0c] rounded-[2rem] border border-neutral-800/60 p-6 shadow-2xl relative overflow-hidden group">
            {!showCheckout ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Amount Input */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1 italic flex items-center gap-2">
                      <DollarSign size={12} className="text-[#00e5ff]" /> Settlement_Unit
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)} 
                        className="w-full bg-black border border-neutral-800 rounded-2xl px-12 py-4 text-3xl font-black text-white outline-none focus:border-[#00e5ff]/50 transition-all font-tactical tracking-widest" 
                      />
                      <span className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-700 font-black text-xl italic font-tactical">$</span>
                    </div>
                  </div>

                  {/* Provider Selection */}
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1 italic flex items-center gap-2">
                      <Cpu size={12} className="text-[#00e5ff]" /> Gateway_Node
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-[120px] overflow-y-auto pr-1 scrollbar-hide">
                      {(flowMode === 'deposit' ? activeGateways : [
                        { id: 'bank', provider: 'adyen', name: 'SWIFT' },
                        { id: 'binance', provider: 'binance', name: 'BINANCE' }
                      ]).map((item: any) => {
                        const Icon = getProviderIcon(item.provider);
                        const isSelected = flowMode === 'deposit' ? selectedGatewayId === item.id : withdrawMethod === item.id;
                        return (
                          <button 
                            key={item.id}
                            onClick={() => { soundService.playClick(); flowMode === 'deposit' ? setSelectedGatewayId(item.id) : setWithdrawMethod(item.id); }}
                            className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                              isSelected ? 'bg-[#00e5ff]/10 border-[#00e5ff]/40 text-[#00e5ff]' : 'bg-black/40 border-neutral-800/60 text-neutral-600 hover:text-white hover:border-neutral-700'
                            }`}
                          >
                            <Icon size={14} />
                            <span className="text-[9px] font-black uppercase truncate">{item.name || item.provider}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => { soundService.playClick(true); setShowCheckout(true); }} 
                  className="w-full py-4 rounded-2xl font-black text-sm uppercase italic tracking-[0.2em] transition-all border-b-4 active:translate-y-1 active:border-b-0 bg-white text-black border-neutral-300 hover:bg-neutral-100 flex items-center justify-center gap-3"
                >
                  Sync_{flowMode.toUpperCase()}_Node <ArrowRight size={16} />
                </button>
              </div>
            ) : (
              <div className="space-y-6 animate-in zoom-in-95 duration-300">
                <div className="flex justify-between items-center border-b border-neutral-800 pb-4">
                  <h3 className="text-sm font-black text-white uppercase italic tracking-widest font-futuristic">PROTOCOL_AUTH</h3>
                  <button onClick={() => setShowCheckout(false)} className="text-[9px] font-black text-neutral-600 hover:text-white uppercase tracking-widest">Abort</button>
                </div>
                
                <div className="py-4">
                  {flowMode === 'deposit' ? (
                    selectedGateway?.provider === 'crypto' || selectedGateway?.provider === 'binance' ? (
                      <div className="flex flex-col items-center gap-4 bg-black/40 rounded-2xl p-6 border border-neutral-800">
                        <QrCode size={120} className="text-white" />
                        <div className="text-center w-full px-2">
                          <p className="text-[8px] text-neutral-700 font-black uppercase tracking-widest mb-2">MASTER_ENDPOINT</p>
                          <code className="text-[10px] text-[#00e5ff] break-all block bg-black p-2 rounded-lg border border-neutral-900">{selectedGateway.publicKey || '0x_NODE_ERR'}</code>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        <input className="bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#00e5ff]/40" placeholder="LEGAL NAME" value={cardInfo.name} onChange={e => setCardInfo({...cardInfo, name: e.target.value.toUpperCase()})} />
                        <input className="bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white font-mono outline-none focus:border-[#00e5ff]/40" placeholder="0000 0000 0000 0000" value={cardInfo.number} onChange={e => setCardInfo({...cardInfo, number: e.target.value})} />
                        <div className="grid grid-cols-2 gap-4">
                          <input className="bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#00e5ff]/40" placeholder="MM/YY" value={cardInfo.expiry} onChange={e => setCardInfo({...cardInfo, expiry: e.target.value})} />
                          <input className="bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#00e5ff]/40" placeholder="CVV" value={cardInfo.cvv} onChange={e => setCardInfo({...cardInfo, cvv: e.target.value})} />
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="space-y-4">
                      <input className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white" placeholder="RECIPIENT NAME" value={withdrawDetails.accountName} onChange={e => setWithdrawDetails({...withdrawDetails, accountName: e.target.value})} />
                      <input className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white font-mono" placeholder="ROUTING / IBAN STRING" value={withdrawDetails.iban} onChange={e => setWithdrawDetails({...withdrawDetails, iban: e.target.value})} />
                    </div>
                  )}
                </div>

                {isProcessing ? (
                  <div className="py-6 text-center space-y-4 bg-black/20 rounded-2xl border border-neutral-800/40 border-dashed">
                    <Loader2 className="animate-spin text-[#00e5ff] mx-auto" size={24} />
                    <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest animate-pulse">{processingStatus}</p>
                  </div>
                ) : (
                  <button 
                    onClick={handleProcessTransaction} 
                    className="w-full py-4 rounded-2xl font-black text-sm uppercase italic tracking-widest bg-[#00e5ff] text-black border-b-4 border-[#009fb1] active:translate-y-1 active:border-b-0"
                  >
                    Authorize_Settlement
                  </button>
                )}
              </div>
            )}
          </div>

          {/* BALANCE DISPLAY */}
          <div className="bg-[#0f0f0f] border border-neutral-800/60 rounded-[1.5rem] p-6 shadow-xl flex items-center justify-between">
             <div className="flex flex-col">
                <span className="text-[9px] font-black text-neutral-700 uppercase tracking-widest mb-1">AVAILABLE_LIQUIDITY</span>
                <div className="text-3xl font-black text-white italic font-tactical tracking-widest leading-none">
                   <span className="text-sm text-[#00e5ff] mr-1 opacity-50">$</span>{balance.toLocaleString()}
                </div>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[9px] font-black text-neutral-700 uppercase tracking-widest mb-1">NETWORK_SYNC</span>
                <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase italic tracking-widest">
                   <Activity size={12} className="animate-pulse" /> 100%_Ready
                </div>
             </div>
          </div>
        </div>

        {/* LEDGER FEED (Col 5) */}
        <div className="lg:col-span-5">
           <div className="bg-[#0f0f0f] rounded-[2rem] border border-neutral-800/60 p-6 h-full flex flex-col shadow-2xl relative overflow-hidden min-h-[400px]">
              <div className="flex justify-between items-center border-b border-neutral-800/40 pb-4 mb-4">
                 <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2 font-futuristic">
                    <History size={14} className="text-[#00e5ff]" /> MASTER_LEDGER
                 </h4>
                 <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
              </div>
              
              <div className="flex-1 space-y-2 overflow-y-auto scrollbar-hide max-h-[300px] lg:max-h-none">
                 {[
                   { type: 'dep', amt: '+2,500', node: 'STRIPE_NODE', date: '5m' },
                   { type: 'wit', amt: '-1,245', node: 'SWIFT_CORE', date: '1h' },
                   { type: 'dep', amt: '+500', node: 'BNB_PAY', date: '6h' },
                   { type: 'dep', amt: '+8,000', node: 'ROOT_GATE', date: '1d' },
                 ].map((tx, idx) => (
                   <div key={idx} className="bg-black/40 p-3 rounded-xl border border-neutral-800/30 flex items-center justify-between hover:border-[#00e5ff]/30 transition-all cursor-default">
                      <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'dep' ? 'bg-emerald-950/20 text-emerald-500' : 'bg-red-950/20 text-red-500'}`}>
                            {tx.type === 'dep' ? <ArrowDownLeft size={14} /> : <ArrowUpRight size={14} />}
                         </div>
                         <div className="min-w-0">
                            <p className="text-[9px] text-neutral-200 font-black uppercase truncate max-w-[100px] leading-none">{tx.node}</p>
                            <p className="text-[7px] text-neutral-700 font-bold uppercase mt-1">{tx.date} ago</p>
                         </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-black italic font-tactical tracking-widest ${tx.type === 'dep' ? 'text-emerald-500' : 'text-neutral-500'}`}>{tx.amt}</span>
                      </div>
                   </div>
                 ))}
              </div>

              <button className="w-full mt-6 bg-neutral-900 text-neutral-600 hover:text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border-b-2 border-neutral-950 transition-all flex items-center justify-center gap-2">
                 <Shield size={12} /> Export_Log
              </button>
           </div>
        </div>
      </div>
      
      <div className="bg-neutral-950/40 p-4 rounded-[1.5rem] border border-neutral-900 flex items-start gap-4">
        <ShieldCheck className="text-neutral-700 shrink-0 mt-0.5" size={16} />
        <p className="text-[9px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
          Financial settlements are signed via ECDSA-P256. Sync latency depends on node throughput. All transactions are final upon ledger broadcast.
        </p>
      </div>

    </div>
  );
};

export default WalletSettings;
