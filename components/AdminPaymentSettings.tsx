
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
  ArrowRight,
  Terminal,
  Lock
} from 'lucide-react';
import { GatewayAPI } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface AdminPaymentSettingsProps {
  gateways: GatewayAPI[];
  onGatewaysChange: (gateways: GatewayAPI[]) => void;
  onDeploy: (gateways: GatewayAPI[]) => void;
}

const PROVIDER_DIRECTORY = [
  { id: 'stripe', name: 'Stripe', category: 'Global', desc: 'Industry standard for card processing and recurring billing.' },
  { id: 'paypal', name: 'PayPal', category: 'Global', desc: 'Global digital wallet with high trust and consumer protection.' },
  { id: 'adyen', name: 'Adyen', category: 'Enterprise', desc: 'Unified commerce platform for high-volume enterprise throughput.' },
  { id: 'braintree', name: 'Braintree', category: 'Enterprise', desc: 'PayPal-backed specialized SDK for complex settlement logic.' },
  { id: 'square', name: 'Square', category: 'Retail', desc: 'Integrated software and hardware payment ecosystem.' },
  { id: 'authorize_net', name: 'Authorize.net', category: 'Legacy', desc: 'Reliable payment gateway for traditional high-risk merchants.' },
  { id: 'razorpay', name: 'Razorpay', category: 'Asia', desc: 'Leading payment solution for the Indian sub-continent.' },
  { id: 'mollie', name: 'Mollie', category: 'Europe', desc: 'Simple, powerful payment methods for European growth.' },
  { id: 'paystack', name: 'Paystack', category: 'Africa', desc: 'Modern online payments for businesses in Africa.' },
  { id: 'crypto', name: 'Crypto Core', category: 'Web3', desc: 'Direct blockchain settlement for BTC, ETH, and USDC.' },
  { id: 'binance', name: 'Binance Pay', category: 'Web3', desc: 'Zero-fee crypto payments for Binance ecosystem users.' },
  { id: 'upi', name: 'UPI Protocol', category: 'Asia', desc: 'Real-time mobile payment system for Indian banking nodes.' },
  { id: 'klarna', name: 'Klarna', category: 'BNPL', desc: 'Flexible financing and "Buy Now, Pay Later" integration.' },
  { id: 'alipay', name: 'Alipay', category: 'China', desc: 'The primary digital payment node for the Chinese market.' },
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
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-futuristic italic font-black uppercase tracking-tighter flex items-baseline gap-4">
            GATEWAY <span className="text-transparent" style={{ WebkitTextStroke: '2px #ffffff', opacity: 0.3 }}>CONFIG</span>
          </h1>
          
          <div className="flex items-center gap-6">
            <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/40 rounded-lg">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em]">FINANCIAL_INFRA_NODE</span>
            </div>
            <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-[0.3em] italic">SECURE_TUNNEL_ACTIVE // V4.5</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => { soundService.playClick(); setShowKeys(!showKeys); }}
            className="p-5 bg-[#0c0c0c] border border-neutral-800 rounded-2xl text-neutral-500 hover:text-white transition-all shadow-xl hover:border-neutral-700"
          >
            {showKeys ? <EyeOff size={24} /> : <Eye size={24} />}
          </button>
          
          <button 
            onClick={() => { soundService.playClick(); setShowAddModal(true); }}
            className="flex items-center gap-4 px-10 py-5 bg-[#0c0c0c] border-2 border-neutral-800 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] text-white hover:border-emerald-500/40 transition-all shadow-xl group"
          >
            <Plus size={18} className="text-emerald-400 group-hover:rotate-90 transition-transform" />
            PROVISION_NODE
          </button>

          <button 
            onClick={handleDeploy}
            disabled={isDeploying}
            className={`flex items-center gap-4 px-10 py-5 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] transition-all border-b-8 active:scale-[0.98] ${
              saveSuccess 
                ? 'bg-emerald-600 text-white border-emerald-900 shadow-[0_0_30px_rgba(16,185,129,0.2)]' 
                : 'bg-black text-white border-neutral-800 hover:bg-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)]'
            }`}
          >
            {isDeploying ? <RefreshCw className="animate-spin" size={18} /> : <Database size={18} />}
            {isDeploying ? 'SYNCING...' : saveSuccess ? 'DEPLOYED' : 'COMMIT_CONFIG'}
          </button>
        </div>
      </div>

      <div className="h-px w-full bg-neutral-900/50" />

      {/* GATEWAY NODES LIST - Blade Server Aesthetic */}
      <div className="space-y-6">
        {localGateways.map((api) => {
          const Icon = getProviderIcon(api.provider);
          return (
            <div 
              key={api.id} 
              className="relative group bg-[#080808]/90 backdrop-blur-md border border-neutral-800/40 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row items-center p-8 gap-12 shadow-2xl transition-all duration-500 hover:border-emerald-500/20"
            >
              {/* Vertical Laser Guard Decor */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 shadow-[2px_0_20px_rgba(16,185,129,0.4)]" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/5 rounded-full blur-[80px] group-hover:bg-emerald-500/10 transition-all pointer-events-none" />

              {/* Provider Identity Sector */}
              <div className="flex items-center gap-8 shrink-0 min-w-[340px]">
                <div className="w-24 h-24 bg-black border-2 border-neutral-800 rounded-[2.2rem] flex items-center justify-center text-emerald-500 group-hover:border-emerald-500/30 transition-all shadow-inner group-hover:scale-105 duration-500">
                  <Icon size={48} strokeWidth={1.5} />
                </div>
                <div>
                  <span className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.25em] block mb-2 font-futuristic">PROTOCOL_ENDPOINT</span>
                  <h3 className="text-3xl font-futuristic font-black text-white italic tracking-tighter uppercase leading-none group-hover:text-glow">
                    {api.name}
                  </h3>
                  <div className="flex items-center gap-4 mt-4">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> ACTIVE_SYNC
                    </span>
                    <span className="text-[10px] text-neutral-700 font-mono uppercase tracking-widest">{api.id}</span>
                  </div>
                </div>
              </div>

              {/* API Tokens Sector */}
              <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-neutral-700 uppercase tracking-widest px-2 italic flex items-center gap-2">
                     <Terminal size={12} className="text-emerald-500/50" /> PUBLISHABLE_NODE_KEY
                  </label>
                  <div className="relative group/input">
                    <input 
                      className="w-full bg-black/60 border border-neutral-800/80 rounded-2xl px-6 py-4 text-emerald-500/80 font-mono text-xs outline-none focus:border-emerald-500/40 transition-all shadow-inner"
                      type={showKeys ? "text" : "password"}
                      value={api.publicKey}
                      onChange={(e) => handleUpdateGateway(api.id, 'publicKey', e.target.value)}
                      placeholder="••••••••••••••••••••••••••••••••"
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] font-black text-neutral-700 uppercase tracking-widest px-2 italic flex items-center gap-2">
                    <Lock size={12} className="text-emerald-500/50" /> SECURE_SECRET_TOKEN
                  </label>
                  <div className="relative group/input">
                    <input 
                      className="w-full bg-black/60 border border-neutral-800/80 rounded-2xl px-6 py-4 text-emerald-500/80 font-mono text-xs outline-none focus:border-emerald-500/40 transition-all shadow-inner"
                      type={showKeys ? "text" : "password"}
                      value={api.secretKey}
                      onChange={(e) => handleUpdateGateway(api.id, 'secretKey', e.target.value)}
                      placeholder="••••••••••••••••••••••••••••••••"
                    />
                  </div>
                </div>
              </div>

              {/* Settlement Logic Sector */}
              <div className="flex items-center gap-12 shrink-0 md:pl-10 md:border-l border-neutral-900/50">
                <div className="text-right space-y-2">
                  <span className="text-[10px] font-black text-neutral-700 uppercase tracking-widest block">NETWORK_TAX (%)</span>
                  <div className="flex items-center gap-4 justify-end">
                    <div className="relative">
                      <input 
                        className="bg-transparent border-none text-5xl font-black text-white italic tracking-tighter w-20 p-0 text-right outline-none font-tactical group-hover:text-emerald-400 transition-colors"
                        value={api.fee}
                        onChange={(e) => handleUpdateGateway(api.id, 'fee', e.target.value)}
                      />
                      <Percent size={14} className="absolute -right-5 top-1/2 -translate-y-1/2 text-neutral-700" />
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => removeGateway(api.id)}
                  className="p-5 bg-neutral-950/40 border border-neutral-800/60 rounded-2xl text-neutral-800 hover:text-red-500 hover:bg-red-500/10 hover:border-red-500/20 transition-all active:scale-90"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            </div>
          );
        })}

        {localGateways.length === 0 && (
          <div className="py-32 text-center bg-[#050505] border-2 border-neutral-800/40 border-dashed rounded-[3rem] animate-pulse">
            <Database className="text-neutral-900 mx-auto mb-6 opacity-20" size={80} />
            <h4 className="text-neutral-700 font-futuristic text-xl uppercase tracking-[0.4em]">NO_GATEWAY_NODES_DETACHED</h4>
            <p className="text-neutral-800 text-[10px] font-black uppercase tracking-widest mt-4">INITIALIZE PROVISIONING SEQUENCE TO START MARKET SETTLEMENTS</p>
          </div>
        )}
      </div>

      {/* PROVISIONING DIRECTORY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/98 backdrop-blur-2xl animate-in fade-in duration-300">
           <div className="w-full max-w-5xl bg-[#080808] border-2 border-neutral-800 rounded-[3rem] shadow-[0_0_150px_rgba(0,0,0,1)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 max-h-[90vh]">
              
              {/* Modal Header HUD */}
              <div className="flex justify-between items-center p-10 bg-black/40 border-b-2 border-neutral-900 shrink-0">
                 <div className="flex items-center gap-8">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center border border-emerald-500/30 text-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                       <Plus size={32} />
                    </div>
                    <div>
                       <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">Provision Financial Node</h2>
                       <p className="text-[11px] text-neutral-600 font-black uppercase tracking-[0.4em] mt-3 italic">MASTER_DIRECTORY_PROTOCOL_v4.5</p>
                    </div>
                 </div>
                 <button onClick={() => setShowAddModal(false)} className="p-4 bg-neutral-950 hover:bg-neutral-900 border-2 border-neutral-800 rounded-2xl transition-all active:scale-90">
                    <X size={32} className="text-neutral-500 hover:text-white" />
                 </button>
              </div>

              {/* Search HUD */}
              <div className="p-10 border-b border-neutral-900 bg-neutral-900/10 shrink-0">
                 <div className="relative group max-w-3xl mx-auto">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-emerald-500 transition-colors" size={24} />
                    <input 
                      autoFocus
                      className="w-full bg-black/60 border-2 border-neutral-800 rounded-3xl pl-16 pr-8 py-6 text-xl font-bold text-white outline-none focus:border-emerald-500/40 transition-all shadow-inner placeholder:text-neutral-800"
                      placeholder="FILTER_GATEWAY_HANDSHAKES..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                 </div>
              </div>

              {/* Providers Grid */}
              <div className="flex-1 overflow-y-auto p-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 scrollbar-hide">
                 {PROVIDER_DIRECTORY.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase())).map((p) => {
                   const NodeIcon = getProviderIcon(p.id);
                   return (
                     <button 
                       key={p.id}
                       onClick={() => handleAddGateway(p)}
                       className="group relative bg-[#0c0c0c] border border-neutral-800/40 rounded-[2.5rem] p-8 text-left hover:border-emerald-500/30 transition-all overflow-hidden active:scale-[0.98] shadow-lg"
                     >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.01] rounded-full -mr-16 -mt-16 group-hover:bg-emerald-500/5 transition-all" />
                        
                        <div className="flex items-start gap-8 relative z-10">
                           <div className="w-20 h-20 bg-black border border-neutral-800 rounded-2xl flex items-center justify-center text-neutral-700 group-hover:text-emerald-500 group-hover:border-emerald-500/20 transition-all shrink-0">
                              <NodeIcon size={40} />
                           </div>
                           <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                 <h4 className="text-2xl font-black text-white italic uppercase tracking-tight leading-none">{p.name}</h4>
                                 <span className="text-[9px] font-black text-neutral-700 uppercase tracking-widest border border-neutral-800 px-2 py-0.5 rounded bg-black">{p.category}</span>
                              </div>
                              <p className="text-[11px] text-neutral-500 font-medium leading-relaxed italic uppercase tracking-tighter pr-8">
                                 {p.desc}
                              </p>
                           </div>
                        </div>
                        
                        <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                           <ArrowRight size={28} className="text-emerald-500" />
                        </div>
                     </button>
                   );
                 })}
              </div>

              {/* Modal Footer Info */}
              <div className="p-8 bg-neutral-900/20 border-t border-neutral-900 flex items-center gap-6 shrink-0">
                 <ShieldCheck size={20} className="text-emerald-500/40" />
                 <p className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em]">
                   All provisioned nodes use high-entropy encryption for key storage. Node metadata is synced across the global audit cluster.
                 </p>
              </div>
           </div>
        </div>
      )}

      {/* DISCLOSURE FOOTER */}
      <div className="bg-[#0f0f0f] border-2 border-neutral-900 p-10 rounded-[3rem] shadow-2xl flex items-start gap-10 max-w-5xl mx-auto group hover:border-emerald-500/20 transition-all">
        <div className="w-16 h-16 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0 group-hover:scale-110 transition-transform">
          <Database size={32} />
        </div>
        <div className="space-y-4">
           <h4 className="text-sm font-black text-white italic uppercase tracking-[0.3em] font-futuristic">SETTLEMENT_INFRA_COMPLIANCE</h4>
           <p className="text-[10px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
             Financial nodes represent authorized entry points for global liquidity. By committing this configuration, you certify that all API handshakes are compliant with PCI-DSS V4.2 standards. Any breach in sync integrity will trigger automated vault isolation and nodal revocation across the cluster.
           </p>
        </div>
      </div>

    </div>
  );
};

export default AdminPaymentSettings;
