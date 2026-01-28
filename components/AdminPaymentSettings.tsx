import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, CreditCard, Globe, Landmark, Cpu, Zap, Activity, Database, 
  Bitcoin, Scan, Smartphone, RefreshCw, Terminal, Lock, Eye, EyeOff, Save, CheckCircle
} from 'lucide-react';
import { GatewayAPI } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface AdminPaymentSettingsProps {
  gateways: GatewayAPI[];
  onGatewaysChange: (gateways: GatewayAPI[]) => void;
}

const AdminPaymentSettings: React.FC<AdminPaymentSettingsProps> = ({ gateways, onGatewaysChange }) => {
  const [showKeys, setShowKeys] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // We define the specific providers we support as "Master Nodes"
  const [configs, setConfigs] = useState<Record<string, GatewayAPI>>({
    stripe: { id: 'gw_stripe', provider: 'stripe', name: 'STRIPE_MASTER_NODE', publicKey: '', secretKey: '', fee: '2.5', status: 'active' },
    binance: { id: 'gw_binance', provider: 'binance', name: 'BINANCE_SMART_NODE', publicKey: '', secretKey: '', fee: '1.0', status: 'active' },
    upi: { id: 'gw_upi', provider: 'upi', name: 'UPI_REALTIME_NODE', publicKey: '', secretKey: '', fee: '0.0', status: 'active' },
    crypto: { id: 'gw_crypto', provider: 'crypto', name: 'DECENTRALIZED_VAULT', publicKey: '', secretKey: '', fee: '0.5', status: 'active' }
  });

  useEffect(() => {
    if (gateways.length > 0) {
      const newConfigs = { ...configs };
      gateways.forEach(g => {
        if (newConfigs[g.provider]) {
          newConfigs[g.provider] = { ...g };
        }
      });
      setConfigs(newConfigs);
    }
  }, [gateways]);

  const handleUpdate = (provider: string, field: keyof GatewayAPI, value: string) => {
    setConfigs(prev => ({
      ...prev,
      [provider]: { ...prev[provider], [field]: value }
    }));
  };

  const handleToggleStatus = (provider: string) => {
    soundService.playClick(true);
    const newStatus = configs[provider].status === 'active' ? 'inactive' : 'active';
    handleUpdate(provider, 'status', newStatus);
  };

  const handleCommit = async () => {
    if (isSaving) return;
    soundService.playClick(true);
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Send the flattened array of configs to the parent
      await onGatewaysChange(Object.values(configs));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const providers = [
    { key: 'stripe', icon: CreditCard, color: 'text-blue-500', label: 'Stripe Gateway', sub: 'Fiat Settlement' },
    { key: 'binance', icon: Scan, color: 'text-yellow-500', label: 'Binance Pay', sub: 'BEP20 / Smart Chain' },
    { key: 'upi', icon: Smartphone, color: 'text-emerald-500', label: 'UPI / GPay', sub: 'Instant Bank Transfer' },
    { key: 'crypto', icon: Bitcoin, color: 'text-orange-500', label: 'Web3 Vault', sub: 'BTC / ETH Nodes' }
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 pb-24 animate-in fade-in duration-500 font-rajdhani px-4">
      
      {/* HEADER HUD */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 shadow-glow-sm">
            <Landmark size={20} />
          </div>
          <div>
            <h2 className="text-xl font-futuristic text-white italic uppercase leading-none tracking-tight">FINANCIAL <span className="text-neutral-500">INFRASTRUCTURE</span></h2>
            <p className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em] mt-1">NODE_MANAGEMENT_v4.6</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowKeys(!showKeys)} 
            className="p-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-500 hover:text-white transition-all"
            title="Toggle Key Visibility"
          >
            {showKeys ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button 
            onClick={handleCommit} 
            disabled={isSaving} 
            className={`flex items-center gap-3 px-6 py-2.5 rounded-xl font-black text-xs uppercase italic tracking-widest transition-all border-b-4 active:translate-y-1 active:border-b-0 ${
              saveSuccess ? 'bg-emerald-600 text-white border-emerald-900' : 'bg-white text-black border-neutral-300'
            }`}
          >
            {isSaving ? <RefreshCw className="animate-spin" size={16} /> : saveSuccess ? <CheckCircle size={16} /> : <Save size={16} />}
            {isSaving ? 'SYNCING...' : saveSuccess ? 'SYNC_COMPLETE' : 'COMMIT_CHANGES'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {providers.map((p) => {
          const config = configs[p.key];
          const isActive = config.status === 'active';
          
          return (
            <div key={p.key} className={`group relative bg-[#0c0c0c] border-2 rounded-[2rem] p-6 shadow-2xl transition-all duration-500 ${isActive ? 'border-neutral-800/60' : 'border-red-900/20 opacity-60'}`}>
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[80px] -mr-16 -mt-16 opacity-5 pointer-events-none ${p.color.replace('text', 'bg')}`} />
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-black border border-neutral-800 rounded-2xl flex items-center justify-center transition-all ${isActive ? p.color : 'text-neutral-700'}`}>
                    <p.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white italic uppercase tracking-widest leading-none">{p.label}</h3>
                    <p className="text-[8px] text-neutral-600 font-black uppercase mt-1 tracking-widest">{p.sub}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleToggleStatus(p.key)}
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
                    isActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-red-500/10 border-red-500/30 text-red-500'
                  }`}
                >
                  {isActive ? 'ONLINE' : 'OFFLINE'}
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-2 italic flex items-center gap-2">
                      <Lock size={10} /> Public Key / Merchant ID
                    </label>
                    <input 
                      className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-[11px] text-white font-mono outline-none focus:border-white/20 transition-all"
                      placeholder={`ENTER_${p.key.toUpperCase()}_PUB_KEY`}
                      value={config.publicKey}
                      onChange={(e) => handleUpdate(p.key, 'publicKey', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-2 italic flex items-center gap-2">
                      <Terminal size={10} /> Secret Authentication Token
                    </label>
                    <input 
                      type={showKeys ? "text" : "password"}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-[11px] text-neutral-400 font-mono outline-none focus:border-white/20 transition-all"
                      placeholder="••••••••••••••••"
                      value={config.secretKey}
                      onChange={(e) => handleUpdate(p.key, 'secretKey', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-neutral-900">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">Transaction Fee (%)</span>
                    <div className="flex items-center gap-2">
                      <input 
                        type="number" 
                        step="0.1"
                        className="bg-transparent border-none text-xl font-black text-white italic tracking-tighter w-12 p-0 outline-none font-tactical" 
                        value={config.fee} 
                        onChange={(e) => handleUpdate(p.key, 'fee', e.target.value)} 
                      />
                      <span className="text-neutral-700 text-sm italic font-tactical">%</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">Node ID</span>
                     <span className="text-[9px] font-mono text-neutral-600">LB_{config.id.toUpperCase()}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-[#0f0f0f] border border-neutral-900 p-6 rounded-[2rem] flex items-start gap-6 shadow-xl">
        <ShieldCheck size={24} className="text-neutral-700 shrink-0" />
        <div className="space-y-1">
          <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Global Settlement Protocol Disclosure</h4>
          <p className="text-[9px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
            System gateways utilize hardware-accelerated AES-256 encryption. Changes to master nodes require high-privilege root access and are logged across the global administrative audit trail. Only one instance per provider is permitted to ensure ledger consistency.
          </p>
        </div>
      </div>

    </div>
  );
};

export default AdminPaymentSettings;