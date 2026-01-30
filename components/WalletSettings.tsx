import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, Wallet, Bitcoin, Smartphone, Zap, Activity, History, ArrowDownLeft, 
  ArrowUpRight, Database, DollarSign, CreditCard, Scan, Globe, ArrowRight, 
  Cpu, AlertTriangle, CheckCircle2, RefreshCw, Lock, Terminal, Hash, 
  ShieldAlert, Radio, Server, Link2, Box, Landmark, Loader2
} from 'lucide-react';
import { GatewayAPI, WalletActivity, User } from '../types.ts';
import { soundService } from '../services/soundService.ts';
import GatewayPortal from './GatewayPortal.tsx';

interface WalletSettingsProps {
  user: User;
  onConnect: () => void;
  balance: number;
  onDeposit: (amount: number, provider: string, txnId: string) => Promise<void>;
  gateways: GatewayAPI[];
  walletActivities?: WalletActivity[];
}

const WalletSettings: React.FC<WalletSettingsProps> = ({ user, balance, onDeposit, gateways, walletActivities = [] }) => {
  const [amount, setAmount] = useState<string>('500');
  const [selectedGatewayId, setSelectedGatewayId] = useState<string | null>(null);
  const [flowMode, setFlowMode] = useState<'deposit' | 'withdraw'>('deposit');
  const [showPortal, setShowPortal] = useState(false);

  const selectedGateway = useMemo(() => gateways.find(g => g.id === selectedGatewayId), [gateways, selectedGatewayId]);

  const handleInitSettlement = () => {
    if (!selectedGateway || !amount || parseFloat(amount) <= 0) return;
    soundService.playClick(true);
    setShowPortal(true);
  };

  const handlePortalSuccess = async (txnId: string) => {
    setShowPortal(false);
    if (!selectedGateway) return;
    const finalAmount = flowMode === 'deposit' ? parseFloat(amount) : -parseFloat(amount);
    await onDeposit(finalAmount, selectedGateway.name, txnId);
    setSelectedGatewayId(null);
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
    <div className="max-w-[1400px] mx-auto space-y-4 pb-32 font-rajdhani animate-in fade-in duration-500 px-4 lg:px-0 relative">
      
      {/* HUD HEADER */}
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
               <button onClick={() => { soundService.playClick(); setFlowMode('deposit'); setSelectedGatewayId(null); }} className={`flex-1 sm:flex-none px-6 sm:px-8 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase transition-all ${flowMode === 'deposit' ? 'bg-white text-black shadow-lg' : 'text-dim hover:text-main'}`}>Gateway Sync</button>
               <button onClick={() => { soundService.playClick(); setFlowMode('withdraw'); setSelectedGatewayId(null); }} className={`flex-1 sm:flex-none px-6 sm:px-8 py-2 rounded-lg text-[9px] sm:text-[10px] font-black uppercase transition-all ${flowMode === 'withdraw' ? 'bg-white text-black shadow-lg' : 'text-dim hover:text-main'}`}>Extraction</button>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-surface border border-bright rounded-[2.5rem] p-6 sm:p-12 shadow-2xl relative overflow-hidden group">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 relative z-10">
              
              <div className="space-y-6 sm:space-y-8">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <DollarSign size={14} className="text-accent" />
                       <h3 className="text-[9px] font-black text-main uppercase tracking-[0.4em] italic">Settlement_Units</h3>
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

                 <div className="p-8 border-2 border-dashed border-bright rounded-[2rem] text-center space-y-4 flex flex-col items-center justify-center bg-black/20">
                    {selectedGateway ? (
                       <div className="animate-in zoom-in duration-300 flex flex-col items-center">
                          <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-4 border border-accent/20 shadow-lg">
                             <Lock size={28} />
                          </div>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest italic mb-1">{selectedGateway.name}</span>
                          <p className="text-[8px] text-dim uppercase font-bold tracking-widest leading-relaxed">Secure tunnel encrypted at endpoint level.</p>
                       </div>
                    ) : (
                       <>
                         <ShieldAlert className="mx-auto text-dim opacity-40" size={32} />
                         <p className="text-[9px] font-black text-dim uppercase tracking-widest">Select an active financial node to begin sync</p>
                       </>
                    )}
                 </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <Zap size={14} className="text-amber-500" />
                       <h3 className="text-[9px] font-black text-main uppercase tracking-[0.4em] italic">Settlement_Vectors</h3>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-2.5 sm:gap-3 max-h-[300px] sm:max-h-[450px] overflow-y-auto pr-1 sm:pr-2 scrollbar-hide">
                    {gateways.length > 0 ? gateways.map(g => {
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
                                     <p className={`text-[7px] sm:text-[8px] font-bold uppercase tracking-widest truncate ${isSelected ? 'text-white/70' : 'text-neutral-600'}`}>{isActiveNode ? 'GATEWAY_ONLINE' : 'NODE_OFFLINE'}</p>
                                  </div>
                               </div>
                            </div>
                         </button>
                       );
                    }) : (
                      <div className="py-12 text-center bg-black/40 border border-dashed border-bright rounded-2xl">
                        <AlertTriangle className="mx-auto text-dim opacity-40 mb-3" />
                        <p className="text-[9px] font-black text-dim uppercase tracking-widest">No active nodes provisioned by admin</p>
                      </div>
                    )}
                 </div>
              </div>
            </div>

            <div className="mt-8 sm:mt-10 pt-8 sm:pt-8 border-t border-bright relative z-10 flex flex-col items-center">
               <button 
                onClick={handleInitSettlement} 
                disabled={!selectedGateway || !amount || parseFloat(amount) <= 0} 
                className={`w-full sm:w-auto sm:px-12 py-4 rounded-xl font-black text-lg uppercase italic tracking-[0.2em] transition-all border-b-4 flex items-center justify-center gap-4 shadow-xl active:translate-y-1 active:border-b-0 ${selectedGateway ? 'bg-white text-black border-neutral-300 hover:bg-emerald-500 hover:text-white hover:border-emerald-800' : 'bg-neutral-900 text-neutral-700 border-neutral-950 cursor-not-allowed'}`}
               >
                 Open Secure Portal <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="bg-surface border border-bright rounded-[2.5rem] p-6 sm:p-8 flex flex-col shadow-2xl h-full relative overflow-hidden min-h-[400px]">
              <div className="flex items-center justify-between mb-6 border-b border-bright pb-4 shrink-0 relative z-10">
                 <div className="flex items-center gap-3">
                    <History size={18} className="text-emerald-500" />
                    <h3 className="text-sm font-black text-main italic uppercase tracking-widest font-futuristic">Verified_Ledger</h3>
                 </div>
              </div>
              
              <div className="flex-1 space-y-2.5 overflow-y-auto scrollbar-hide pr-1 min-h-[300px]">
                 {walletActivities.length > 0 ? walletActivities.map(act => (
                   <div key={act.id} className="bg-black/40 rounded-[1.25rem] border border-bright p-3.5 flex items-center justify-between group/row hover:border-accent/30 transition-all cursor-default relative overflow-hidden">
                      <div className="flex items-center gap-3 relative z-10">
                         <div className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 shrink-0 ${act.type === 'deposit' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500' : 'bg-red-500/5 border-red-500/20 text-red-500'}`}>
                            {act.type === 'deposit' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                         </div>
                         <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                               <p className="text-[7px] text-neutral-600 font-bold uppercase font-mono truncate max-w-[80px]">TXN_{act.id.slice(-6)}</p>
                               {act.type === 'deposit' && (
                                  <ShieldCheck size={8} className="text-emerald-500" />
                               )}
                            </div>
                            <p className="text-[10px] font-black text-main uppercase truncate max-w-[100px]">{act.provider}</p>
                         </div>
                      </div>
                      <div className="text-right shrink-0 relative z-10">
                         <span className={`text-lg font-tactical font-black italic tracking-widest ${act.type === 'deposit' ? 'text-emerald-400' : 'text-red-400'}`}>
                           {act.type === 'deposit' ? '+' : '-'}${act.amount.toLocaleString()}
                         </span>
                      </div>
                   </div>
                 )) : (
                   <div className="h-full flex flex-col items-center justify-center opacity-10 py-12">
                     <RefreshCw size={48} className="animate-spin mb-4" />
                     <p className="text-[8px] font-black uppercase tracking-[0.4em]">SYNCING_LEDGER...</p>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </div>

      {/* GATEWAY PORTAL OVERLAY */}
      {showPortal && selectedGateway && (
        <GatewayPortal 
          gateway={selectedGateway}
          amount={parseFloat(amount)}
          userId={user.id}
          onSuccess={handlePortalSuccess}
          onCancel={() => setShowPortal(false)}
        />
      )}
    </div>
  );
};

export default WalletSettings;