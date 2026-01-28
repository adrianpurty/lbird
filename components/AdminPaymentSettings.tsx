import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Percent, Plus, Trash2, RefreshCw, CreditCard, Globe, Landmark, Cpu, ShoppingBag, Zap, Activity, Database, Bitcoin, Scan, Smartphone, X, Search, Terminal, Lock, ChevronDown, Layers
} from 'lucide-react';
import { GatewayAPI } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface AdminPaymentSettingsProps {
  gateways: GatewayAPI[];
  onGatewaysChange: (gateways: GatewayAPI[]) => void;
}

const PROVIDER_OPTIONS = [
  'stripe', 'paypal', 'adyen', 'braintree', 'square', 'authorize_net', 
  'razorpay', 'mollie', 'paystack', 'crypto', 'binance', 'upi', 
  'skrill', 'neteller', 'klarna', 'alipay', 'wechat', 'custom'
];

const AdminPaymentSettings: React.FC<AdminPaymentSettingsProps> = ({ gateways, onGatewaysChange }) => {
  const [showKeys, setShowKeys] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [localGateways, setLocalGateways] = useState<GatewayAPI[]>([]);
  
  // New Gateway State
  const [newGateway, setNewGateway] = useState<Partial<GatewayAPI>>({
    provider: 'stripe',
    name: '',
    publicKey: '',
    secretKey: '',
    fee: '2.5',
    status: 'active'
  });

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

  const handleAddGateway = () => {
    if (!newGateway.name) return;
    soundService.playClick(true);
    const id = `gw_${newGateway.provider}_${Date.now()}`;
    const entry: GatewayAPI = {
      id,
      provider: newGateway.provider as any,
      name: newGateway.name,
      publicKey: newGateway.publicKey || '',
      secretKey: newGateway.secretKey || '',
      fee: newGateway.fee || '2.5',
      status: 'active'
    };
    setLocalGateways(prev => [...prev, entry]);
    setNewGateway({
      provider: 'stripe',
      name: '',
      publicKey: '',
      secretKey: '',
      fee: '2.5',
      status: 'active'
    });
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
    <div className="max-w-[1000px] mx-auto space-y-8 pb-24 animate-in fade-in duration-500 font-rajdhani px-3 md:px-0">
      
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

      {/* NEW GATEWAY DEPLOYMENT SECTION */}
      <div className="bg-[#0c0c0c] border-2 border-dashed border-neutral-800 rounded-[2rem] p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Plus size={16} className="text-[#00e5ff]" />
          <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Deploy_New_Node</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[7px] font-black text-neutral-700 uppercase tracking-widest px-1 italic">Provider</label>
            <div className="relative">
              <select 
                className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-[10px] text-white outline-none appearance-none uppercase"
                value={newGateway.provider}
                onChange={(e) => setNewGateway({...newGateway, provider: e.target.value as any})}
              >
                {PROVIDER_OPTIONS.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
              </select>
              <ChevronDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none" />
            </div>
          </div>
          <div className="md:col-span-4 space-y-1.5">
            <label className="text-[7px] font-black text-neutral-700 uppercase tracking-widest px-1 italic">Node Name</label>
            <input 
              className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-[10px] text-white outline-none placeholder:text-neutral-800"
              placeholder="E.G. BINANCE_PRO_SYNC"
              value={newGateway.name}
              onChange={(e) => setNewGateway({...newGateway, name: e.target.value.toUpperCase()})}
            />
          </div>
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-[7px] font-black text-neutral-700 uppercase tracking-widest px-1 italic">Tax/Fee (%)</label>
            <input 
              type="number"
              className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-[10px] text-white outline-none"
              value={newGateway.fee}
              onChange={(e) => setNewGateway({...newGateway, fee: e.target.value})}
            />
          </div>
          <div className="md:col-span-2 flex items-end">
            <button 
              onClick={handleAddGateway}
              className="w-full bg-[#00e5ff] text-black py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-[#33ebff] transition-all"
            >
              Initialize
            </button>
          </div>
        </div>
      </div>

      {/* ACTIVE GATEWAY NODES */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-1">
          <Layers size={14} className="text-neutral-600" />
          <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Active_Financial_Layer</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {localGateways.length === 0 ? (
            <div className="py-12 text-center border-2 border-neutral-900 border-dashed rounded-3xl opacity-20">
               <Database size={40} className="mx-auto mb-4" />
               <p className="text-[10px] font-black uppercase tracking-widest">No Active Nodes</p>
            </div>
          ) : (
            localGateways.map((api) => {
              const Icon = getProviderIcon(api.provider);
              return (
                <div key={api.id} className="relative group bg-[#0c0c0c] border border-neutral-800/40 rounded-2xl p-4 shadow-lg overflow-hidden flex flex-col md:flex-row items-center gap-6 transition-all hover:bg-white/[0.01]">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500/50" />
                  
                  <div className="flex items-center gap-4 shrink-0 w-full md:w-48">
                    <div className="w-10 h-10 bg-black border border-neutral-800 rounded-xl flex items-center justify-center text-emerald-500">
                      <Icon size={20} />
                    </div>
                    <div className="min-w-0">
                       <h3 className="text-[10px] font-black text-white italic uppercase tracking-widest leading-none truncate">{api.name}</h3>
                       <p className="text-[7px] text-neutral-700 font-mono mt-1 uppercase">{api.provider}</p>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                    <div className="space-y-1">
                      <label className="text-[7px] font-black text-neutral-700 uppercase tracking-widest px-1 italic">Public Key / API Node</label>
                      <input className="w-full bg-black/40 border border-neutral-800 rounded-lg px-3 py-2 text-emerald-500/80 font-mono text-[9px] outline-none" type={showKeys ? "text" : "password"} value={api.publicKey} onChange={(e) => handleUpdateGateway(api.id, 'publicKey', e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[7px] font-black text-neutral-700 uppercase tracking-widest px-1 italic">Secret Token</label>
                      <input className="w-full bg-black/40 border border-neutral-800 rounded-lg px-3 py-2 text-emerald-500/80 font-mono text-[9px] outline-none" type={showKeys ? "text" : "password"} value={api.secretKey} onChange={(e) => handleUpdateGateway(api.id, 'secretKey', e.target.value)} />
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 pt-4 md:pt-0 md:pl-6 md:border-l border-neutral-900 w-full md:w-auto justify-between md:justify-start">
                     <div className="text-right">
                        <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block">Tax (%)</span>
                        <input className="bg-transparent border-none text-xl font-black text-white italic tracking-tighter w-12 p-0 text-right outline-none font-tactical" value={api.fee} onChange={(e) => handleUpdateGateway(api.id, 'fee', e.target.value)} />
                     </div>
                     <button onClick={() => setLocalGateways(p => p.filter(g => g.id !== api.id))} className="p-2 bg-neutral-950 border border-neutral-800 rounded-lg text-neutral-800 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentSettings;