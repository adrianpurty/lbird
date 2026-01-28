
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Percent, Plus, Trash2, RefreshCw, CreditCard, Globe, Landmark, Cpu, ShoppingBag, Zap, Activity, Database, Bitcoin, Scan, Smartphone, X, Search, Terminal, Lock
} from 'lucide-react';
import { GatewayAPI } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface AdminPaymentSettingsProps {
  gateways: GatewayAPI[];
  onGatewaysChange: (gateways: GatewayAPI[]) => void;
}

const AdminPaymentSettings: React.FC<AdminPaymentSettingsProps> = ({ gateways, onGatewaysChange }) => {
  const [showKeys, setShowKeys] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [localGateways, setLocalGateways] = useState<GatewayAPI[]>([]);

  useEffect(() => {
    setLocalGateways([...gateways]);
  }, [gateways]);

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'stripe': return CreditCard;
      case 'paypal': return Globe;
      case 'adyen': return Landmark;
      case 'braintree': return Cpu;
      case 'square': return ShoppingBag;
      case 'authorize_net': return Lock;
      case 'razorpay': return Zap;
      case 'mollie': return Activity;
      case 'paystack': return Database;
      case 'crypto': return Bitcoin;
      case 'binance': return Scan;
      case 'upi': return Smartphone;
      default: return Database;
    }
  };

  const handleUpdateGateway = (id: string, field: keyof GatewayAPI, value: string) => {
    setLocalGateways(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const handleDeploy = async () => {
    if (isDeploying) return;
    soundService.playClick(true);
    setIsDeploying(true);
    setSaveSuccess(false);
    try {
      await onGatewaysChange(localGateways);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-4 pb-24 animate-in fade-in duration-500 font-rajdhani px-3 md:px-0">
      
      {/* COMPACT HEADER */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500 shadow-glow-sm">
            <Landmark size={16} />
          </div>
          <div>
            <h2 className="text-lg font-futuristic text-white italic uppercase leading-none tracking-tight">GATEWAY <span className="text-neutral-500">CONFIG</span></h2>
            <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest mt-0.5">FIN_INFRA_v4.5</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => setShowKeys(!showKeys)} className="p-1.5 bg-neutral-900 border border-neutral-800 rounded-md text-neutral-500 hover:text-white"><Terminal size={14} /></button>
          <button onClick={handleDeploy} disabled={isDeploying} className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-black text-[9px] uppercase tracking-widest transition-all border-b-2 active:translate-y-0.5 active:border-b-0 ${saveSuccess ? 'bg-emerald-600 text-white border-emerald-900' : 'bg-white text-black border-neutral-300'}`}>
            {isDeploying ? <RefreshCw className="animate-spin" size={12} /> : <Database size={12} />}
            {isDeploying ? 'SYNC' : saveSuccess ? 'DONE' : 'COMMIT'}
          </button>
        </div>
      </div>

      {/* GATEWAY BLOCKS */}
      <div className="grid grid-cols-1 gap-4">
        {localGateways.map((api) => {
          const Icon = getProviderIcon(api.provider);
          return (
            <div key={api.id} className="relative group bg-[#0c0c0c] border border-neutral-800/40 rounded-2xl p-4 shadow-lg overflow-hidden flex flex-col sm:flex-row items-center gap-6">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/50" />
              
              <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto">
                <div className="w-12 h-12 bg-black border border-neutral-800 rounded-xl flex items-center justify-center text-emerald-500">
                  <Icon size={24} />
                </div>
                <div>
                   <h3 className="text-xs font-black text-white italic uppercase tracking-widest leading-none">{api.name}</h3>
                   <p className="text-[7px] text-neutral-700 font-mono mt-1 uppercase">{api.id}</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div className="space-y-1">
                  <label className="text-[7px] font-black text-neutral-700 uppercase tracking-widest px-1 italic">Public Key</label>
                  <input className="w-full bg-black/40 border border-neutral-800 rounded-lg px-3 py-2 text-emerald-500/80 font-mono text-[9px] outline-none" type={showKeys ? "text" : "password"} value={api.publicKey} onChange={(e) => handleUpdateGateway(api.id, 'publicKey', e.target.value)} />
                </div>
                <div className="space-y-1">
                  <label className="text-[7px] font-black text-neutral-700 uppercase tracking-widest px-1 italic">Secret Key</label>
                  <input className="w-full bg-black/40 border border-neutral-800 rounded-lg px-3 py-2 text-emerald-500/80 font-mono text-[9px] outline-none" type={showKeys ? "text" : "password"} value={api.secretKey} onChange={(e) => handleUpdateGateway(api.id, 'secretKey', e.target.value)} />
                </div>
              </div>

              <div className="flex items-center gap-6 shrink-0 pt-4 sm:pt-0 sm:pl-6 sm:border-l border-neutral-900 w-full sm:w-auto justify-between sm:justify-start">
                 <div className="text-right">
                    <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block">Tax (%)</span>
                    <input className="bg-transparent border-none text-2xl font-black text-white italic tracking-tighter w-12 p-0 text-right outline-none font-tactical" value={api.fee} onChange={(e) => handleUpdateGateway(api.id, 'fee', e.target.value)} />
                 </div>
                 <button onClick={() => setLocalGateways(p => p.filter(g => g.id !== api.id))} className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-800 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPaymentSettings;
