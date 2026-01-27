
import React, { useState, useEffect } from 'react';
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
  Plus,
  Trash2,
  RefreshCw,
  Globe,
  Scan,
  Cpu,
  Database,
  Zap,
  Activity,
  ChevronDown,
  X,
  CreditCard as CardIcon,
  Landmark,
  Wallet,
  ShoppingBag,
  CircleDollarSign,
  ArrowRight
} from 'lucide-react';
import { GatewayAPI } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface AdminPaymentSettingsProps {
  gateways: GatewayAPI[];
  onGatewaysChange: (gateways: GatewayAPI[]) => void;
  onDeploy: (gateways: GatewayAPI[]) => void;
}

const PROVIDER_DIRECTORY = [
  { id: 'stripe', name: 'Stripe', category: 'Global' },
  { id: 'paypal', name: 'PayPal', category: 'Global' },
  { id: 'adyen', name: 'Adyen', category: 'Enterprise' },
  { id: 'braintree', name: 'Braintree', category: 'Enterprise' },
  { id: 'square', name: 'Square', category: 'Retail' },
  { id: 'authorize_net', name: 'Authorize.net', category: 'Legacy' },
  { id: 'razorpay', name: 'Razorpay', category: 'Asia' },
  { id: 'mollie', name: 'Mollie', category: 'Europe' },
  { id: 'paystack', name: 'Paystack', category: 'Africa' },
  { id: 'crypto', name: 'Crypto Core', category: 'Web3' },
  { id: 'binance', name: 'Binance Pay', category: 'Web3' },
  { id: 'upi', name: 'Unified Payments (UPI)', category: 'Asia' },
  { id: 'skrill', name: 'Skrill', category: 'E-Wallet' },
  { id: 'neteller', name: 'Neteller', category: 'E-Wallet' },
  { id: 'klarna', name: 'Klarna', category: 'BNPL' },
  { id: 'alipay', name: 'Alipay', category: 'China' },
  { id: 'wechat', name: 'WeChat Pay', category: 'China' },
  { id: 'custom', name: 'Custom Gateway', category: 'Other' },
];

const AdminPaymentSettings: React.FC<AdminPaymentSettingsProps> = ({ gateways, onGatewaysChange, onDeploy }) => {
  const [showKeys, setShowKeys] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [localGateways, setLocalGateways] = useState<GatewayAPI[]>([]);

  useEffect(() => {
    setLocalGateways([...gateways]);
  }, [gateways]);
  
  const [newGateway, setNewGateway] = useState<Omit<GatewayAPI, 'id' | 'status'>>({
    name: '',
    provider: 'stripe',
    publicKey: '',
    secretKey: '',
    fee: '2.5'
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

  const getLabels = (provider: GatewayAPI['provider']) => {
    switch (provider) {
      case 'stripe': return { public: 'Publishable Token', secret: 'Secret Node Key' };
      case 'paypal': return { public: 'Client ID', secret: 'Secret Access Token' };
      case 'adyen': return { public: 'Live Endpoint Prefix', secret: 'API Key Hash' };
      case 'braintree': return { public: 'Merchant ID', secret: 'Private Token' };
      case 'square': return { public: 'Application ID', secret: 'Personal Access Token' };
      case 'authorize_net': return { public: 'API Login ID', secret: 'Transaction Key' };
      case 'razorpay': return { public: 'Key ID', secret: 'Key Secret' };
      case 'mollie': return { public: 'Live API Key', secret: 'Partner ID (Optional)' };
      case 'crypto': return { public: 'Master Wallet Address', secret: 'RPC Node Endpoint' };
      case 'binance': return { public: 'Merchant ID', secret: 'API Secret' };
      case 'alipay': return { public: 'App ID', secret: 'RSA Private Key' };
      case 'wechat': return { public: 'MCH ID', secret: 'API V3 Key' };
      default: return { public: 'Public Node Key', secret: 'Private Node Key' };
    }
  };

  const handleUpdateGateway = (id: string, field: keyof GatewayAPI, value: string) => {
    setLocalGateways(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const toggleStatus = (id: string) => {
    soundService.playClick(true);
    setLocalGateways(prev => prev.map(g => g.id === id ? { ...g, status: g.status === 'active' ? 'inactive' : 'active' } : g));
  };

  const handleAddGateway = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playClick(true);
    const api: GatewayAPI = {
      ...newGateway,
      id: `gw_${Math.random().toString(36).substr(2, 5)}`,
      status: 'active'
    };
    setLocalGateways(prev => [...prev, api]);
    setShowAddModal(false);
    setNewGateway({ name: '', provider: 'stripe', publicKey: '', secretKey: '', fee: '2.5' });
  };

  const removeGateway = (id: string) => {
    if(confirm('PURGE_GATEWAY: Immediate disconnection from master ledger?')) {
      soundService.playClick(true);
      setLocalGateways(prev => prev.filter(g => g.id !== id));
    }
  };

  const handleDeploy = async () => {
    if (isDeploying) return;
    soundService.playClick(true);
    setIsDeploying(true);
    setSaveSuccess(false);
    try {
      await onGatewaysChange(localGateways);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-10 pb-32 animate-in fade-in duration-700">
      {/* LANDSCAPE HEADER - HUD STYLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b-2 border-neutral-900 pb-8 md:pb-12">
        <div className="relative">
          <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-4 h-12 md:h-24 bg-emerald-500 rounded-full blur-xl opacity-20" />
          <h2 className="text-3xl md:text-4xl font-futuristic text-white italic uppercase flex items-center gap-4 md:gap-8 text-glow">
            GATEWAY <span className="text-neutral-600 font-normal">CONFIG</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4 md:mt-6">
            <div className="px-3 md:px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[8px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest">FINANCIAL_INFRA_NODE</div>
            <span className="text-[10px] md:text-[12px] text-neutral-600 font-bold uppercase tracking-widest italic shrink-0">SECURE_TUNNEL_ACTIVE // v4.2</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto">
          <button 
            onClick={() => { soundService.playClick(); setShowKeys(!showKeys); }}
            className="flex-1 md:flex-none p-4 md:p-5 bg-neutral-900 border-2 border-neutral-800 rounded-xl md:rounded-2xl text-neutral-400 hover:text-white transition-all group shrink-0"
          >
            {showKeys ? <EyeOff size={20} md:size={24} /> : <Eye size={20} md:size={24} />}
          </button>
          <button 
            onClick={() => { soundService.playClick(); setShowAddModal(true); }}
            className="flex-[2] md:flex-none px-4 md:px-8 py-4 md:py-5 bg-neutral-900 border-2 border-neutral-800 rounded-xl md:rounded-2xl text-[10px] md:text-[12px] font-black text-white hover:border-emerald-500/50 transition-all uppercase tracking-widest flex items-center justify-center gap-2 md:gap-4"
          >
            <Plus size={18} md:size={20} className="text-emerald-400" /> PROVISION_NODE
          </button>
          <button 
            onClick={handleDeploy}
            disabled={isDeploying}
            className={`w-full md:w-auto px-6 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-[12px] uppercase tracking-widest flex items-center justify-center gap-3 md:gap-4 transition-all border-b-4 shrink-0 active:scale-[0.98] ${
              saveSuccess 
                ? 'bg-emerald-600 text-white border-emerald-900' 
                : 'bg-black text-white border-neutral-800 hover:bg-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
            }`}
          >
            {isDeploying ? <RefreshCw className="animate-spin" size={18} md:size={20} /> : <Save size={18} md:size={20} />}
            {isDeploying ? 'SYNCING...' : saveSuccess ? 'DEPLOYED' : 'COMMIT_CONFIG'}
          </button>
        </div>
      </div>

      {/* Gateway Cards */}
      <div className="grid grid-cols-1 gap-6">
        {localGateways.length > 0 ? (
          localGateways.map((api) => {
            const labels = getLabels(api.provider);
            const Icon = getProviderIcon(api.provider);
            return (
              <div 
                key={api.id} 
                className={`group relative bg-[#0c0c0c]/80 rounded-[1.5rem] md:rounded-[2.5rem] border-2 transition-all duration-300 overflow-hidden flex flex-col md:flex-row items-center p-6 md:p-8 gap-8 md:gap-10 scanline-effect ${
                  api.status === 'active' ? 'border-neutral-800/60 hover:border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.05)]' : 'border-red-900/30 opacity-40 grayscale'
                }`}
              >
                <div className={`absolute top-0 left-0 w-full md:w-1.5 h-1.5 md:h-full ${api.status === 'active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <div className="flex items-center gap-6 md:gap-8 shrink-0 w-full md:w-auto md:min-w-[240px]">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-black border-2 flex items-center justify-center transition-all shrink-0 ${api.status === 'active' ? 'border-neutral-800 group-hover:border-emerald-500/50 text-emerald-500' : 'border-neutral-900 text-neutral-800'}`}>
                    <Icon size={28} md:size={32} />
                  </div>
                  <div className="min-w-0">
                     <span className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest block mb-1">NODE_IDENTITY</span>
                     <h3 className="text-xl md:text-2xl font-black text-white italic tracking-tighter uppercase font-futuristic leading-none truncate">{api.name || api.provider.toUpperCase()}</h3>
                     <div className="flex items-center gap-3 mt-2 md:mt-3">
                       <button 
                          onClick={() => toggleStatus(api.id)}
                          className={`px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border transition-all ${
                            api.status === 'active' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                          }`}
                       >
                         {api.status}
                       </button>
                       <span className="text-[8px] md:text-[9px] text-neutral-700 font-mono hidden sm:inline">{api.id}</span>
                     </div>
                  </div>
                </div>
                <div className="flex-1 w-full space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[8px] md:text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">{labels.public}</label>
                        <input 
                          type={showKeys ? 'text' : 'password'}
                          className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 md:px-5 py-3 text-emerald-500/70 font-mono text-[10px] md:text-[11px] focus:border-emerald-500/40 outline-none transition-all"
                          value={api.publicKey}
                          onChange={(e) => handleUpdateGateway(api.id, 'publicKey', e.target.value)}
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[8px] md:text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">{labels.secret}</label>
                        <input 
                          type={showKeys ? 'text' : 'password'}
                          className="w-full bg-black/40 border border-neutral-800 rounded-xl px-4 md:px-5 py-3 text-emerald-500/70 font-mono text-[10px] md:text-sm outline-none focus:border-emerald-500/40 outline-none transition-all"
                          value={api.secretKey}
                          onChange={(e) => handleUpdateGateway(api.id, 'secretKey', e.target.value)}
                        />
                     </div>
                  </div>
                </div>
                <div className="w-full md:w-auto shrink-0 flex items-center justify-between md:justify-end gap-6 md:gap-8 md:pl-8 md:border-l border-neutral-800/40">
                  <div className="text-left md:text-right">
                     <span className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest block mb-1">NETWORK_FEE</span>
                     <div className="flex items-center gap-2 justify-start md:justify-end">
                       <Percent size={14} className="text-emerald-500" />
                       <input 
                         className="bg-transparent border-none text-xl md:text-2xl font-black text-white italic tracking-widest w-12 md:w-16 p-0 text-left md:text-right outline-none font-tactical"
                         value={api.fee}
                         onChange={(e) => handleUpdateGateway(api.id, 'fee', e.target.value)}
                       />
                     </div>
                  </div>
                  <button 
                    onClick={() => removeGateway(api.id)}
                    className="p-3 md:p-4 bg-red-900/10 text-red-900/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl md:rounded-2xl transition-all active:scale-90"
                  >
                    <Trash2 size={20} md:size={24} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-24 text-center bg-[#050505] border-2 border-neutral-800/40 border-dashed rounded-[2rem] md:rounded-[3rem]">
             <Database size={64} className="mx-auto text-neutral-900 mb-6" />
             <h4 className="text-neutral-700 font-futuristic text-xl uppercase tracking-widest">NO_GATEWAY_NODES_DETACHED</h4>
          </div>
        )}
      </div>

      {/* ADD GATEWAY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-2xl bg-[#080808] border-2 border-neutral-800 rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
              <div className="flex justify-between items-center p-8 bg-black/40 border-b-2 border-neutral-900">
                 <div>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">PROVISION_NEW_NODE</h2>
                    <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest mt-1">Expanding Financial Infrastructure</p>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-3 bg-neutral-950 hover:bg-neutral-900 border-2 border-neutral-800 rounded-2xl transition-all">
                    <X size={24} className="text-neutral-500 hover:text-white" />
                 </button>
              </div>

              <form onSubmit={handleAddGateway} className="p-8 md:p-12 space-y-8 overflow-y-auto max-h-[70vh] scrollbar-hide">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2 italic">PROTOCOL_PROVIDER</label>
                       <div className="relative group">
                          <select 
                            required
                            className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-emerald-500/60 transition-all appearance-none cursor-pointer uppercase text-xs tracking-widest"
                            value={newGateway.provider}
                            onChange={e => setNewGateway({...newGateway, provider: e.target.value as any})}
                          >
                             {PROVIDER_DIRECTORY.map(p => (
                                <option key={p.id} value={p.id} className="bg-black text-neutral-400">{p.name} [{p.category.toUpperCase()}]</option>
                             ))}
                          </select>
                          <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-700 pointer-events-none" />
                       </div>
                    </div>
                    <div className="space-y-3">
                       <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2 italic">NODE_LABEL</label>
                       <input 
                         required
                         className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-emerald-500/60 transition-all text-xs uppercase tracking-widest"
                         placeholder="e.g. PRIMARY_SETTLEMENT"
                         value={newGateway.name}
                         onChange={e => setNewGateway({...newGateway, name: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                       <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2 italic">{getLabels(newGateway.provider).public}</label>
                       <input 
                         required
                         className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-5 text-emerald-500/70 font-mono text-[10px] outline-none focus:border-emerald-500/60 transition-all"
                         placeholder="IDENTIFIER_STRING"
                         value={newGateway.publicKey}
                         onChange={e => setNewGateway({...newGateway, publicKey: e.target.value})}
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2 italic">{getLabels(newGateway.provider).secret}</label>
                       <input 
                         required
                         type="password"
                         className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-5 text-emerald-500/70 font-mono text-[10px] outline-none focus:border-emerald-500/60 transition-all"
                         placeholder="SECRET_AUTH_STRING"
                         value={newGateway.secretKey}
                         onChange={e => setNewGateway({...newGateway, secretKey: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2 italic">NETWORK_TAX (%)</label>
                    <div className="relative">
                       <input 
                         required
                         type="number"
                         step="0.01"
                         className="w-full bg-black border-2 border-neutral-800 rounded-2xl px-12 py-5 text-white font-black outline-none focus:border-emerald-500 text-2xl font-tactical tracking-widest"
                         value={newGateway.fee}
                         onChange={e => setNewGateway({...newGateway, fee: e.target.value})}
                       />
                       <Percent size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-700" />
                    </div>
                 </div>

                 <div className="pt-6">
                    <button 
                      type="submit"
                      className="w-full py-6 md:py-8 rounded-2xl md:rounded-[3rem] font-black text-xl md:text-2xl transition-all transform active:scale-[0.98] border-b-8 md:border-b-[12px] font-tactical italic tracking-widest bg-black text-white border-neutral-800 hover:bg-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-center gap-6"
                    >
                      AUTHORIZE_PROVISION <ArrowRight size={28} md:size={32} />
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentSettings;
