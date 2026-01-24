
import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Bitcoin, 
  Smartphone, 
  CreditCard, 
  Save, 
  Lock,
  Eye,
  EyeOff,
  Percent,
  Settings,
  Plus,
  Trash2,
  RefreshCw,
  Globe,
  ToggleLeft,
  ToggleRight,
  Scan
} from 'lucide-react';

export interface GatewayAPI {
  id: string;
  name: string;
  provider: 'stripe' | 'crypto' | 'upi' | 'paypal' | 'binance' | 'custom';
  publicKey: string;
  secretKey: string;
  fee: string;
  status: 'active' | 'inactive';
}

interface AdminPaymentSettingsProps {
  gateways: GatewayAPI[];
  onGatewaysChange: (gateways: GatewayAPI[]) => void;
  onDeploy: (gateways: GatewayAPI[]) => void;
}

const AdminPaymentSettings: React.FC<AdminPaymentSettingsProps> = ({ gateways, onGatewaysChange, onDeploy }) => {
  const [showKeys, setShowKeys] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [newGateway, setNewGateway] = useState<Omit<GatewayAPI, 'id' | 'status'>>({
    name: '',
    provider: 'stripe',
    publicKey: '',
    secretKey: '',
    fee: '2.5'
  });

  const getLabels = (provider: GatewayAPI['provider']) => {
    switch (provider) {
      case 'stripe':
        return { public: 'Stripe Publishable Key', secret: 'Stripe Secret Key' };
      case 'crypto':
        return { public: 'Crypto Wallet Address', secret: 'Node API Token' };
      case 'binance':
        return { public: 'Binance Pay ID / API Key', secret: 'Binance Secret Key' };
      case 'upi':
        return { public: 'UPI Merchant ID / VPA', secret: 'Merchant Secret Key' };
      case 'paypal':
        return { public: 'PayPal Client ID', secret: 'PayPal Secret Key' };
      default:
        return { public: 'Public API Key', secret: 'Secret API Token' };
    }
  };

  const handleUpdateGateway = (id: string, field: keyof GatewayAPI, value: string) => {
    onGatewaysChange(gateways.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const toggleStatus = (id: string) => {
    onGatewaysChange(gateways.map(g => g.id === id ? { ...g, status: g.status === 'active' ? 'inactive' : 'active' } : g));
  };

  const handleAddGateway = (e: React.FormEvent) => {
    e.preventDefault();
    const api: GatewayAPI = {
      ...newGateway,
      id: `gw_${Math.random().toString(36).substr(2, 5)}`,
      status: 'active'
    };
    onGatewaysChange([...gateways, api]);
    setShowAddModal(false);
    setNewGateway({ name: '', provider: 'stripe', publicKey: '', secretKey: '', fee: '2.5' });
  };

  const removeGateway = (id: string) => {
    if(confirm('Disconnect and purge this gateway node from the global ledger?')) {
      onGatewaysChange(gateways.filter(g => g.id !== id));
    }
  };

  const handleDeploy = () => {
    setIsDeploying(true);
    onDeploy(gateways);
    setTimeout(() => {
      setIsDeploying(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
            <Settings className="text-[#facc15]" /> Financial Nodes
          </h2>
          <p className="text-neutral-500 text-sm font-medium mt-1">Configure API keys for Stripe, Binance, Crypto, and UPI payment infrastructure.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex-1 md:flex-none bg-neutral-900 text-white px-6 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border border-neutral-800 hover:bg-neutral-800 transition-colors"
          >
            <Plus size={16} /> ADD GATEWAY
          </button>
          <button 
            onClick={handleDeploy}
            disabled={isDeploying}
            className="flex-1 md:flex-none bg-[#facc15] text-black px-8 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-yellow-400/10 border-b-4 border-yellow-600 active:scale-95 disabled:opacity-50"
          >
            {isDeploying ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
            {isDeploying ? 'DEPLOYING...' : 'SAVE CONFIG'}
          </button>
        </div>
      </div>

      <div className="bg-[#0a0f1a] border border-[#facc15]/20 p-6 rounded-[2rem] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#facc15] rounded-xl flex items-center justify-center">
              <Lock className="text-black" size={24} />
            </div>
            <div>
              <span className="text-[9px] text-neutral-500 font-black uppercase tracking-widest block leading-none mb-1">Key Visibility</span>
              <button onClick={() => setShowKeys(!showKeys)} className="text-[#facc15] font-black text-xs flex items-center gap-1.5">
                {showKeys ? <EyeOff size={14} /> : <Eye size={14} />} {showKeys ? 'MASK SECRETS' : 'SHOW KEYS'}
              </button>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6 px-4">
             <div className="text-center">
                <span className="text-[9px] text-neutral-500 font-black uppercase tracking-widest block mb-1">Operational</span>
                <span className="text-emerald-500 font-black text-xs">{gateways.filter(g => g.status === 'active').length} Nodes</span>
             </div>
             <div className="w-px h-8 bg-neutral-800" />
             <div className="text-center">
                <span className="text-[9px] text-neutral-500 font-black uppercase tracking-widest block mb-1">Security</span>
                <span className="text-[#facc15] font-black text-xs">ENCRYPTED</span>
             </div>
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {gateways.map((api) => {
          const labels = getLabels(api.provider);
          return (
            <div key={api.id} className={`bg-[#121212] p-8 rounded-[2.5rem] border transition-all flex flex-col group ${api.status === 'active' ? 'border-neutral-900' : 'border-red-500/20 opacity-60'}`}>
              <div className="flex justify-between items-start mb-8">
                 <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all ${api.status === 'active' ? 'bg-black border border-neutral-800 text-[#facc15]' : 'bg-neutral-900 text-neutral-700'}`}>
                      {api.provider === 'stripe' && <CreditCard size={28} />}
                      {api.provider === 'crypto' && <Bitcoin size={28} />}
                      {api.provider === 'binance' && <Scan size={28} />}
                      {api.provider === 'upi' && <Smartphone size={28} />}
                      {api.provider === 'paypal' && <Globe size={28} />}
                    </div>
                    <div>
                      <input 
                        className="bg-transparent border-none text-xl font-black text-white uppercase tracking-tight italic focus:ring-0 w-full p-0"
                        value={api.name}
                        onChange={(e) => handleUpdateGateway(api.id, 'name', e.target.value)}
                      />
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[9px] text-neutral-600 font-black uppercase tracking-widest">{api.provider} Node</span>
                         <span className="text-neutral-800">•</span>
                         <button onClick={() => toggleStatus(api.id)} className={`text-[9px] font-black uppercase flex items-center gap-1 ${api.status === 'active' ? 'text-emerald-500' : 'text-red-500'}`}>
                            {api.status === 'active' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                            {api.status}
                         </button>
                      </div>
                    </div>
                 </div>
                 <button onClick={() => removeGateway(api.id)} className="text-neutral-800 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest px-1">Network Fee (%)</label>
                     <div className="relative">
                       <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={14} />
                       <input 
                         className="w-full bg-black border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-white font-bold text-xs focus:border-[#facc15] outline-none"
                         value={api.fee}
                         onChange={(e) => handleUpdateGateway(api.id, 'fee', e.target.value)}
                       />
                     </div>
                   </div>
                   <div className="space-y-1.5">
                     <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest px-1">Node Identification</label>
                     <div className="bg-black/50 border border-neutral-800 rounded-xl px-4 py-3 text-neutral-600 font-mono text-[10px] flex items-center italic">
                       {api.id}
                     </div>
                   </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest px-1">{labels.public}</label>
                  <input 
                    type={showKeys ? 'text' : 'password'}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-5 py-3 text-white font-mono text-xs focus:border-[#facc15] outline-none"
                    value={api.publicKey}
                    onChange={(e) => handleUpdateGateway(api.id, 'publicKey', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest px-1">{labels.secret}</label>
                  <input 
                    type={showKeys ? 'text' : 'password'}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-5 py-3 text-white font-mono text-xs focus:border-[#facc15] outline-none"
                    value={api.secretKey}
                    onChange={(e) => handleUpdateGateway(api.id, 'secretKey', e.target.value)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-[#0d111a] border border-[#facc15]/30 rounded-[3rem] p-10 space-y-8 animate-in zoom-in-95 duration-300">
            <div className="text-center">
               <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Provision Gateway Node</h3>
               <p className="text-neutral-500 text-xs mt-1">Initialize production API credentials for secure transactions.</p>
            </div>
            
            <form onSubmit={handleAddGateway} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Friendly Label</label>
                 <input 
                  required
                  className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#facc15]"
                  placeholder="e.g. Primary Stripe Checkout"
                  value={newGateway.name}
                  onChange={e => setNewGateway({...newGateway, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Infrastructure Provider</label>
                  <select 
                    className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#facc15] appearance-none"
                    value={newGateway.provider}
                    onChange={e => setNewGateway({...newGateway, provider: e.target.value as any})}
                  >
                    <option value="stripe">Stripe Payments</option>
                    <option value="binance">Binance Pay</option>
                    <option value="crypto">Crypto Wallet Node</option>
                    <option value="upi">UPI Unified Node</option>
                    <option value="paypal">PayPal Business</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Default Platform Fee %</label>
                  <input 
                    required
                    type="number"
                    step="0.1"
                    className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-[#facc15] font-black outline-none focus:border-[#facc15]"
                    value={newGateway.fee}
                    onChange={e => setNewGateway({...newGateway, fee: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">
                    {getLabels(newGateway.provider).public}
                  </label>
                  <input 
                    required
                    className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-white font-mono text-xs focus:border-[#facc15]"
                    placeholder={newGateway.provider === 'stripe' ? 'pk_live_...' : newGateway.provider === 'binance' ? 'Binance Pay ID' : '0x...'}
                    value={newGateway.publicKey}
                    onChange={e => setNewGateway({...newGateway, publicKey: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">
                    {getLabels(newGateway.provider).secret}
                  </label>
                  <input 
                    required
                    type="password"
                    className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-white font-mono text-xs focus:border-[#facc15]"
                    placeholder={newGateway.provider === 'stripe' ? 'sk_live_...' : '••••••••'}
                    value={newGateway.secretKey}
                    onChange={e => setNewGateway({...newGateway, secretKey: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                 <button type="submit" className="w-full bg-[#facc15] text-black py-5 rounded-[2rem] font-black text-lg hover:bg-yellow-500 transition-colors shadow-xl shadow-yellow-400/5">ACTIVATE NODE</button>
                 <button type="button" onClick={() => setShowAddModal(false)} className="w-full text-neutral-600 py-2 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Abort Provisioning</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentSettings;
