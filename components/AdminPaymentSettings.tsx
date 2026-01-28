
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Save, 
  Eye, 
  EyeOff, 
  Percent, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CreditCard,
  Globe,
  Landmark,
  Cpu,
  ShoppingBag,
  Zap,
  Activity,
  Database,
  Bitcoin,
  Scan,
  Smartphone,
  Wallet,
  CircleDollarSign,
  Search,
  X,
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

const AdminPaymentSettings: React.FC<AdminPaymentSettingsProps> = ({ gateways, onGatewaysChange }) => {
  const [showKeys, setShowKeys] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [localGateways, setLocalGateways] = useState<GatewayAPI[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  const handleUpdateGateway = (id: string, field: keyof GatewayAPI, value: string) => {
    setLocalGateways(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
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

  const handleAddGateway = (provider: any) => {
    soundService.playClick(true);
    const api: GatewayAPI = {
      id: `gw_${Math.random().toString(36).substr(2, 5)}`,
      name: `${provider.name.toUpperCase()} MASTER NODE`,
      provider: provider.id as any,
      publicKey: '',
      secretKey: '',
      fee: '2.5',
      status: 'active'
    };
    setLocalGateways(prev => [...prev, api]);
    setShowAddModal(false);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-12 pb-32 animate-in fade-in duration-700 font-rajdhani">
      
      {/* HEADER SECTION - EXACT REPLICA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pt-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-futuristic italic font-black uppercase tracking-tighter flex items-baseline gap-4">
            GATEWAY <span className="text-transparent" style={{ WebkitTextStroke: '2px #ffffff', opacity: 0.3 }}>CONFIG</span>
          </h1>
          
          <div className="flex items-center gap-6">
            <div className="px-4 py-1 bg-emerald-500/10 border border-emerald-500/40 rounded-lg">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">FINANCIAL_INFRA_NODE</span>
            </div>
            <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-[0.3em] italic">SECURE_TUNNEL_ACTIVE // V4.2</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Fix: Removed reference to undefined showSecrets and setShowSecrets. Using showKeys instead. */}
          <button 
            onClick={() => { soundService.playClick(); setShowKeys(!showKeys); }}
            className="p-5 bg-[#0c0c0c] border border-neutral-800 rounded-2xl text-neutral-500 hover:text-white transition-all shadow-xl"
          >
            {showKeys ? <EyeOff size={24} /> : <Eye size={24} />}
          </button>
          
          <button 
            onClick={() => { soundService.playClick(); setShowAddModal(true); }}
            className="flex items-center gap-4 px-10 py-5 bg-[#0c0c0c] border-2 border-neutral-800 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] text-white hover:border-emerald-500/40 transition-all shadow-xl"
          >
            <Plus size={18} className="text-emerald-400" />
            PROVISION_NODE
          </button>

          <button 
            onClick={handleDeploy}
            disabled={isDeploying}
            className={`flex items-center gap-4 px-10 py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] transition-all border-b-8 active:scale-[0.98] ${
              saveSuccess 
                ? 'bg-emerald-600 text-white border-emerald-900 shadow-[0_0_30px_rgba(16,185,129,0.2)]' 
                : 'bg-black text-white border-neutral-800 hover:bg-neutral-900'
            }`}
          >
            {isDeploying ? <RefreshCw className="animate-spin" size={18} /> : <Database size={18} />}
            {isDeploying ? 'SYNCING...' : saveSuccess ? 'DEPLOYED' : 'COMMIT_CONFIG'}
          </button>
        </div>
      </div>

      <div className="h-px w-full bg-neutral-900/50" />

      {/* GATEWAY NODES LIST */}
      <div className="space-y-6">
        {localGateways.map((api) => {
          const Icon = getProviderIcon(api.provider);
          return (
            <div 
              key={api.id} 
              className="relative group bg-[#080808] border border-neutral-800/40 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row items-center p-8 gap-12 shadow-2xl transition-all duration-500"
            >
              {/* Left Accent Bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 shadow-[0_0_20px_#10b981]" />

              {/* Icon & Identity Sector */}
              <div className="flex items-center gap-8 shrink-0 min-w-[340px]">
                <div className="w-24 h-24 bg-black border-2 border-neutral-800 rounded-[2rem] flex items-center justify-center text-emerald-500 group-hover:border-emerald-500/30 transition-all">
                  <Icon size={48} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest block mb-2">NODE_IDENTITY</span>
                  <h3 className="text-3xl font-futuristic font-black text-white italic tracking-tighter uppercase leading-none">
                    {api.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest">ACTIVE</span>
                    <span className="text-[10px] text-neutral-700 font-mono uppercase tracking-widest">{api.id}</span>
                  </div>
                </div>
              </div>

              {/* Input Fields Sector */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">PUBLISHABLE TOKEN</label>
                  <div className="relative">
                    <input 
                      className="w-full bg-black/40 border border-neutral-800/60 rounded-2xl px-6 py-4 text-emerald-500/70 font-mono text-xs outline-none focus:border-emerald-500/30 transition-all"
                      type={showKeys ? "text" : "password"}
                      value={api.publicKey}
                      onChange={(e) => handleUpdateGateway(api.id, 'publicKey', e.target.value)}
                      placeholder="••••••••••••••••••••••••••••••••"
                    />
                    {!showKeys && <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-emerald-500/40 text-lg">..........................</div>}
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">SECRET NODE KEY</label>
                  <div className="relative">
                    <input 
                      className="w-full bg-black/40 border border-neutral-800/60 rounded-2xl px-6 py-4 text-emerald-500/70 font-mono text-xs outline-none focus:border-emerald-500/30 transition-all"
                      type={showKeys ? "text" : "password"}
                      value={api.secretKey}
                      onChange={(e) => handleUpdateGateway(api.id, 'secretKey', e.target.value)}
                      placeholder="••••••••••••••••••••••••••••••••"
                    />
                    {!showKeys && <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none text-emerald-500/40 text-lg">..........................</div>}
                  </div>
                </div>
              </div>

              {/* Network Fee Sector */}
              <div className="flex items-center gap-12 shrink-0 md:pl-10 md:border-l border-neutral-900/50">
                <div className="text-right space-y-2">
                  <span className="text-[10px] font-black text-neutral-700 uppercase tracking-widest block">NETWORK_FEE</span>
                  <div className="flex items-center gap-4">
                    <Percent size={20} className="text-emerald-500" />
                    <input 
                      className="bg-transparent border-none text-5xl font-black text-white italic tracking-tighter w-20 p-0 text-right outline-none font-tactical"
                      value={api.fee}
                      onChange={(e) => handleUpdateGateway(api.id, 'fee', e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  onClick={() => removeGateway(api.id)}
                  className="p-5 bg-neutral-950/20 border border-neutral-800/40 rounded-2xl text-neutral-800 hover:text-red-500 transition-all"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </div>
          );
        })}
        {localGateways.length === 0 && (
          <div className="py-32 text-center bg-[#050505] border-2 border-neutral-800/40 border-dashed rounded-[3rem]">
            <Database className="text-neutral-900 mx-auto mb-6 opacity-20" size={80} />
            <h4 className="text-neutral-700 font-futuristic text-xl uppercase tracking-[0.4em]">NO_GATEWAY_NODES_DETACHED</h4>
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="w-full max-w-5xl bg-[#080808] border-2 border-neutral-800 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 max-h-[90vh]">
              <div className="flex justify-between items-center p-10 bg-black/40 border-b-2 border-neutral-900">
                 <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/30 text-emerald-500">
                       <Plus size={28} />
                    </div>
                    <div>
                       <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">PROVISION_NEW_NODE</h2>
                       <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest mt-1 italic">DIRECTORY_PROTOCOL_v4.2</p>
                    </div>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-3 bg-neutral-950 hover:bg-neutral-900 border-2 border-neutral-800 rounded-2xl transition-all">
                    <X size={24} className="text-neutral-500 hover:text-white" />
                 </button>
              </div>

              <div className="p-10 border-b border-neutral-900 bg-neutral-900/10">
                 <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-emerald-500 transition-colors" size={20} />
                    <input 
                      autoFocus
                      className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl pl-16 pr-6 py-5 text-lg font-bold text-white outline-none focus:border-emerald-500/40 transition-all"
                      placeholder="SEARCH_PROVIDER_HANDSHAKES..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                 </div>
              </div>

              <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 scrollbar-hide">
                 {PROVIDER_DIRECTORY.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => {
                   const NodeIcon = getProviderIcon(p.id);
                   return (
                     <button 
                       key={p.id}
                       onClick={() => handleAddGateway(p)}
                       className="group bg-[#0c0c0c] border border-neutral-800/40 rounded-[2.5rem] p-8 text-left hover:border-emerald-500/30 transition-all relative overflow-hidden active:scale-[0.98]"
                     >
                        <div className="flex items-center gap-5 mb-4">
                           <div className="w-14 h-14 bg-black border border-neutral-800 rounded-2xl flex items-center justify-center text-neutral-700 group-hover:text-emerald-500 transition-colors">
                              <NodeIcon size={28} />
                           </div>
                           <div>
                              <h4 className="text-xl font-black text-white italic uppercase tracking-tight">{p.name}</h4>
                              <span className="text-[10px] font-black text-neutral-700 uppercase tracking-widest">{p.category}</span>
                           </div>
                        </div>
                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                           <ArrowRight size={24} className="text-emerald-500" />
                        </div>
                     </button>
                   );
                 })}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default AdminPaymentSettings;
