
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
  Settings,
  Plus,
  Trash2,
  RefreshCw,
  Globe,
  ToggleLeft,
  ToggleRight,
  Scan,
  CheckCircle2,
  Cpu,
  Database,
  Zap,
  Activity,
  ChevronDown,
  X
} from 'lucide-react';
import { GatewayAPI } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface AdminPaymentSettingsProps {
  gateways: GatewayAPI[];
  onGatewaysChange: (gateways: GatewayAPI[]) => void;
  onDeploy: (gateways: GatewayAPI[]) => void;
}

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

  const getLabels = (provider: GatewayAPI['provider']) => {
    switch (provider) {
      case 'stripe': return { public: 'Publishable Token', secret: 'Secret Node Key' };
      case 'crypto': return { public: 'Wallet Ledger Address', secret: 'Private Node API' };
      case 'binance': return { public: 'Pay ID / API Key', secret: 'API Secret' };
      case 'upi': return { public: 'Merchant VPA', secret: 'Authorization Secret' };
      case 'paypal': return { public: 'Client Identifier', secret: 'Access Secret' };
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
          <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-4 h-12 md:h-24 bg-[#FACC15] rounded-full blur-xl opacity-10" />
          <h2 className="text-3xl md:text-5xl font-futuristic font-black text-white italic uppercase tracking-tighter leading-none flex flex-wrap items-center gap-4 md:gap-10">
            GATEWAY <span className="text-[#FACC15]">CONFIG</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4 md:mt-6">
            <div className="px-3 md:px-4 py-1.5 bg-[#FACC15]/10 border border-[#FACC15]/30 rounded-full text-[8px] md:text-[10px] font-black text-[#FACC15] uppercase tracking-[0.4em] md:tracking-[0.4em]">FINANCIAL_INFRA_NODE</div>
            <span className="text-[10px] md:text-[12px] text-neutral-600 font-bold uppercase tracking-[0.4em] md:tracking-[0.6em] italic shrink-0">SECURE_TUNNEL_ACTIVE // v4.2</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto">
          <button 
            onClick={() => { soundService.playClick(); setShowKeys(!showKeys); }}
            className="flex-1 md:flex-none p-4 md:p-5 bg-black border-2 border-neutral-800 rounded-xl md:rounded-2xl text-neutral-400 hover:text-white transition-all group shrink-0"
          >
            {showKeys ? <EyeOff size={20} md:size={24} /> : <Eye size={20} md:size={24} />}
          </button>
          <button 
            onClick={() => { soundService.playClick(); setShowAddModal(true); }}
            className="flex-[2] md:flex-none px-4 md:px-8 py-4 md:py-5 bg-black border-2 border-neutral-800 rounded-xl md:rounded-2xl text-[10px] md:text-[12px] font-black text-white hover:border-[#FACC15]/50 transition-all uppercase tracking-[0.2em] md:tracking-[0.4em] flex items-center justify-center gap-2 md:gap-4"
          >
            <Plus size={18} md:size={20} className="text-[#FACC15]" /> PROVISION_NODE
          </button>
          <button 
            onClick={handleDeploy}
            disabled={isDeploying}
            className={`w-full md:w-auto px-6 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[10px] md:text-[12px] uppercase tracking-[0.3em] md:tracking-[0.4em] flex items-center justify-center gap-3 md:gap-4 transition-all shadow-2xl border-b-4 shrink-0 ${
              saveSuccess 
                ? 'bg-white text-black border-neutral-300' 
                : 'bg-[#FACC15] text-black border-yellow-700 hover:bg-white'
            }`}
          >
            {isDeploying ? <RefreshCw className="animate-spin" size={18} md:size={20} /> : <Save size={18} md:size={20} />}
            {isDeploying ? 'SYNCING...' : saveSuccess ? 'DEPLOYED' : 'COMMIT_CONFIG'}
          </button>
        </div>
      </div>

      {/* GATEWAY NODES - LANDSCAPE CARDS */}
      <div className="grid grid-cols-1 gap-6">
        {localGateways.length > 0 ? (
          localGateways.map((api) => {
            const labels = getLabels(api.provider);
            return (
              <div 
                key={api.id} 
                className={`group relative bg-black rounded-[1.5rem] md:rounded-[2.5rem] border-2 transition-all duration-300 overflow-hidden flex flex-col md:flex-row items-center p-6 md:p-8 gap-8 md:gap-10 scanline-effect ${
                  api.status === 'active' ? 'border-neutral-800/60 hover:border-[#FACC15]/40 shadow-[0_0_30px_rgba(250,204,21,0.05)]' : 'border-neutral-900 opacity-40 grayscale'
                }`}
              >
                {/* Status Indicator */}
                <div className={`absolute top-0 left-0 w-full md:w-1.5 h-1.5 md:h-full ${api.status === 'active' ? 'bg-[#FACC15]' : 'bg-neutral-800'}`} />

                {/* Provider Identity */}
                <div className="flex items-center gap-6 md:gap-8 shrink-0 w-full md:w-auto md:min-w-[240px]">
                  <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-[#1A1A1A] border-2 flex items-center justify-center transition-all shrink-0 ${api.status === 'active' ? 'border-neutral-800 group-hover:border-[#FACC15]/50 text-[#FACC15]' : 'border-neutral-900 text-neutral-800'}`}>
                    {api.provider === 'stripe' && <CreditCard size={28} md:size={32} />}
                    {api.provider === 'crypto' && <Bitcoin size={28} md:size={32} />}
                    {api.provider === 'binance' && <Scan size={28} md:size={32} />}
                    {api.provider === 'upi' && <Smartphone size={28} md:size={32} />}
                    {api.provider === 'paypal' && <Globe size={28} md:size={32} />}
                  </div>
                  <div className="min-w-0">
                     <span className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest block mb-1">NODE_IDENTITY</span>
                     <h3 className="text-xl md:text-2xl font-black text-white italic tracking-tighter uppercase font-futuristic leading-none truncate">{api.name}</h3>
                     <div className="flex items-center gap-3 mt-2 md:mt-3">
                       <button 
                          onClick={() => toggleStatus(api.id)}
                          className={`px-3 py-1 rounded-lg text-[8px] md:text-[9px] font-black uppercase tracking-widest border transition-all ${
                            api.status === 'active' ? 'bg-[#FACC15]/10 border-[#FACC15]/30 text-[#FACC15]' : 'bg-neutral-800 border-neutral-700 text-neutral-600'
                          }`}
                       >
                         {api.status}
                       </button>
                       <span className="text-[8px] md:text-[9px] text-neutral-700 font-mono hidden sm:inline">{api.id}</span>
                     </div>
                  </div>
                </div>

                {/* Security Telemetry (Keys) */}
                <div className="flex-1 w-full space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="text-[8px] md:text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] px-1">{labels.public}</label>
                        <input 
                          type={showKeys ? 'text' : 'password'}
                          className="w-full bg-black border border-neutral-800 rounded-xl px-4 md:px-5 py-3 text-[#FACC15]/70 font-mono text-[10px] md:text-[11px] focus:border-[#FACC15]/40 outline-none transition-all"
                          value={api.publicKey}
                          onChange={(e) => handleUpdateGateway(api.id, 'publicKey', e.target.value)}
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="text-[8px] md:text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] px-1">{labels.secret}</label>
                        <input 
                          type={showKeys ? 'text' : 'password'}
                          className="w-full bg-black border border-neutral-800 rounded-xl px-4 md:px-5 py-3 text-[#FACC15]/70 font-mono text-[10px] md:text-[11px] focus:border-[#FACC15]/40 outline-none transition-all"
                          value={api.secretKey}
                          onChange={(e) => handleUpdateGateway(api.id, 'secretKey', e.target.value)}
                        />
                     </div>
                  </div>
                </div>

                {/* Action Node */}
                <div className="w-full md:w-auto shrink-0 flex items-center justify-between md:justify-end gap-6 md:gap-8 md:pl-8 md:border-l border-neutral-800/40">
                  <div className="text-left md:text-right">
                     <span className="text-[8px] md:text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-1">NETWORK_FEE</span>
                     <div className="flex items-center gap-2 justify-start md:justify-end">
                       <Percent size={14} className="text-[#FACC15]" />
                       <input 
                         className="bg-transparent border-none text-xl md:text-2xl font-black text-white italic tracking-widest w-12 md:w-16 p-0 text-left md:text-right outline-none font-tactical"
                         value={api.fee}
                         onChange={(e) => handleUpdateGateway(api.id, 'fee', e.target.value)}
                       />
                     </div>
                  </div>
                  <button 
                    onClick={() => removeGateway(api.id)}
                    className="p-3 md:p-4 bg-red-950/20 text-neutral-800 hover:text-white hover:bg-neutral-800 rounded-xl md:rounded-2xl transition-all active:scale-90"
                  >
                    <Trash2 size={20} md:size={24} />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-24 text-center bg-black border-2 border-neutral-800/40 border-dashed rounded-[2rem] md:rounded-[3rem]">
             <Database size={64} className="mx-auto text-neutral-900 mb-6" />
             <h4 className="text-neutral-700 font-futuristic text-xl uppercase tracking-[0.5em]">NO_GATEWAY_NODES_DETACHED</h4>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-black border-2 border-neutral-800 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 space-y-8 md:space-y-10 animate-in zoom-in-95 duration-300 relative overflow-hidden flex flex-col max-h-[90vh]">
            <button onClick={() => setShowAddModal(false)} className="absolute top-4 right-4 p-2 text-neutral-600 hover:text-white transition-colors">
              <X size={24} />
            </button>
            
            <div className="text-center shrink-0">
               <div className="w-16 h-16 md:w-20 md:h-20 bg-[#FACC15]/10 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6 text-[#FACC15]">
                  <Cpu size={32} md:size={40} />
               </div>
               <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter italic font-futuristic">Provision Node</h3>
               <p className="text-neutral-600 text-[9px] md:text-[11px] font-black uppercase tracking-widest mt-2">Initializing new financial distribution endpoint</p>
            </div>
            
            <form onSubmit={handleAddGateway} className="space-y-6 md:space-y-8 overflow-y-auto pr-1 scrollbar-hide">
              <div className="space-y-3">
                 <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2">Label Identity</label>
                 <input 
                  required
                  className="w-full bg-black border-2 border-neutral-800 rounded-xl md:rounded-2xl px-5 md:px-8 py-3 md:py-5 text-neutral-200 font-bold outline-none focus:border-[#FACC15]/60 transition-all text-base md:text-lg"
                  placeholder="e.g. CORE_STRIPE_v4"
                  value={newGateway.name}
                  onChange={e => setNewGateway({...newGateway, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2">Infra Provider</label>
                  <div className="relative group">
                    <select 
                      className="w-full bg-black border-2 border-neutral-800 rounded-xl md:rounded-2xl px-5 md:px-8 py-3 md:py-5 text-neutral-200 font-bold outline-none focus:border-[#FACC15]/60 transition-all appearance-none cursor-pointer uppercase text-xs md:text-sm italic font-tactical tracking-widest"
                      value={newGateway.provider}
                      onChange={e => setNewGateway({...newGateway, provider: e.target.value as any})}
                    >
                      <option value="stripe">STRIPE_SECURE</option>
                      <option value="binance">BINANCE_PAY</option>
                      <option value="crypto">BLOCKCHAIN_NODE</option>
                      <option value="upi">UPI_INSTANT</option>
                      <option value="paypal">PAYPAL_BIZ</option>
                    </select>
                    <ChevronDown size={20} md:size={24} className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-neutral-700 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2">System Fee %</label>
                  <input 
                    required
                    type="number"
                    step="0.1"
                    className="w-full bg-black border-2 border-neutral-800 rounded-xl md:rounded-2xl px-5 md:px-8 py-3 md:py-5 text-[#FACC15] font-black outline-none focus:border-[#FACC15]/60 text-xl md:text-2xl font-tactical tracking-widest"
                    value={newGateway.fee}
                    onChange={e => setNewGateway({...newGateway, fee: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2">{getLabels(newGateway.provider).public}</label>
                  <input 
                    required
                    className="w-full bg-black border-2 border-neutral-800 rounded-xl px-5 py-3 text-neutral-500 font-mono text-[10px] focus:border-[#FACC15]/40 outline-none"
                    placeholder="Public Data Node"
                    value={newGateway.publicKey}
                    onChange={e => setNewGateway({...newGateway, publicKey: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2">{getLabels(newGateway.provider).secret}</label>
                  <input 
                    required
                    type="password"
                    className="w-full bg-black border-2 border-neutral-800 rounded-xl px-5 py-3 text-neutral-500 font-mono text-[10px] focus:border-[#FACC15]/40 outline-none"
                    placeholder="Private Data Node"
                    value={newGateway.secretKey}
                    onChange={e => setNewGateway({...newGateway, secretKey: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 flex flex-col gap-4 sticky bottom-0 bg-black py-2">
                 <button type="submit" className="w-full bg-[#FACC15] text-black py-4 md:py-6 rounded-xl md:rounded-[2rem] font-black text-lg md:text-xl hover:bg-white transition-all shadow-[0_15px_40px_-10px_rgba(250,204,21,0.4)] border-b-8 border-yellow-700 active:scale-95 italic tracking-widest font-tactical">
                   AUTHORIZE_NODE
                 </button>
                 <button type="button" onClick={() => setShowAddModal(false)} className="w-full text-neutral-700 py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:text-neutral-400 transition-colors">
                   ABORT_PROVISIONING
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
