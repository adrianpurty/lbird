
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShieldCheck, CreditCard, Globe, Landmark, Cpu, Zap, Activity, Database, 
  Bitcoin, Scan, Smartphone, RefreshCw, Terminal, Lock, Eye, EyeOff, Save, CheckCircle,
  Building, Trash2, Plus, ChevronDown, Wallet, LayoutGrid, AlertTriangle, ShieldAlert,
  Upload, X, Image as ImageIcon
} from 'lucide-react';
import { GatewayAPI } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface AdminPaymentSettingsProps {
  gateways: GatewayAPI[];
  onGatewaysChange: (gateways: GatewayAPI[]) => void;
}

// Internal icon proxy for missing icons
const MessageSquare = ({ size, className }: any) => <LayoutGrid size={size} className={className} />;

const PROVIDER_METADATA: Record<string, { label: string, icon: any, color: string, sub: string, hasQr?: boolean }> = {
  stripe: { label: 'Stripe', icon: CreditCard, color: 'text-blue-500', sub: 'Fiat Settlement', hasQr: false },
  paypal: { label: 'PayPal', icon: Globe, color: 'text-indigo-400', sub: 'Digital Wallet', hasQr: false },
  binance: { label: 'Binance Pay', icon: Scan, color: 'text-yellow-500', sub: 'Smart Chain', hasQr: true },
  upi: { label: 'UPI / GPay', icon: Smartphone, color: 'text-emerald-500', sub: 'Instant Bank', hasQr: true },
  crypto: { label: 'Web3 Vault', icon: Bitcoin, color: 'text-orange-500', sub: 'Multi-Chain', hasQr: true },
  razorpay: { label: 'Razorpay', icon: Landmark, color: 'text-blue-600', sub: 'Regional Hub', hasQr: true },
  klarna: { label: 'Klarna', icon: Smartphone, color: 'text-pink-400', sub: 'BNPL Protocol', hasQr: false },
  skrill: { label: 'Skrill', icon: Wallet, color: 'text-purple-500', sub: 'E-Money', hasQr: false },
  bank: { label: 'Bank Direct', icon: Building, color: 'text-neutral-400', sub: 'SWIFT / SEPA', hasQr: false },
  adyen: { label: 'Adyen', icon: ShieldCheck, color: 'text-emerald-600', sub: 'Enterprise Pay', hasQr: false },
  mollie: { label: 'Mollie', icon: LayoutGrid, color: 'text-neutral-200', sub: 'European Node', hasQr: false },
  square: { label: 'Square', icon: LayoutGrid, color: 'text-neutral-100', sub: 'POS & Online', hasQr: false },
  alipay: { label: 'Alipay', icon: Smartphone, color: 'text-blue-400', sub: 'Regional Wallet', hasQr: true },
  wechat: { label: 'WeChat Pay', icon: MessageSquare, color: 'text-emerald-400', sub: 'Social Pay', hasQr: true }
};

// Sub-component to handle individual node logic and fix Hook order violation
const GatewayNode: React.FC<{
  g: GatewayAPI;
  showKeys: boolean;
  onUpdate: (id: string, field: keyof GatewayAPI, value: any) => void;
  onToggleStatus: (id: string) => void;
  onPurge: (id: string) => void;
  onQrUpload: (id: string, file: File | null) => void;
}> = ({ g, showKeys, onUpdate, onToggleStatus, onPurge, onQrUpload }) => {
  const meta = PROVIDER_METADATA[g.provider] || PROVIDER_METADATA['stripe'];
  const isActive = g.status === 'active';
  const Icon = meta.icon;
  const hasKeys = (g.publicKey?.length || 0) > 5 && (g.secretKey?.length || 0) > 5;
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`group relative bg-[#0c0c0c] border-2 rounded-[2.5rem] p-8 shadow-2xl transition-all duration-500 ${isActive ? 'border-neutral-800/60' : 'border-red-900/10 opacity-60'}`}>
      {/* Visual Indicators */}
      <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-[100px] -mr-20 -mt-20 opacity-5 pointer-events-none ${meta.color.replace('text', 'bg')}`} />
      {isActive && hasKeys && (
        <div className="absolute top-8 right-8 w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
      )}

      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-5">
          <div className={`w-14 h-14 bg-black border border-neutral-800 rounded-[1.25rem] flex items-center justify-center transition-all shadow-inner ${isActive ? meta.color : 'text-neutral-700'}`}>
            <Icon size={28} />
          </div>
          <div>
            <h3 className="text-base font-black text-white italic uppercase tracking-widest leading-none">{meta.label} Node</h3>
            <p className="text-[9px] text-neutral-600 font-black uppercase mt-1.5 tracking-[0.2em]">{meta.sub}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onToggleStatus(g.id)}
            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all ${
              isActive ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-glow-sm' : 'bg-red-500/10 border-red-500/30 text-red-500'
            }`}
          >
            {isActive ? 'ONLINE' : 'OFFLINE'}
          </button>
          <button 
            onClick={() => onPurge(g.id)}
            className="p-2 bg-neutral-950 border border-neutral-900 rounded-lg text-neutral-700 hover:text-red-500 transition-all hover:border-red-900/40"
            title="Decommission Node"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-5">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-neutral-700 uppercase tracking-widest px-2 italic flex items-center gap-2">
              <Lock size={12} /> Master Public Key
            </label>
            <input 
              className="w-full bg-black border border-neutral-800 rounded-xl px-5 py-4 text-[11px] text-white font-mono outline-none focus:border-white/20 transition-all shadow-inner"
              placeholder="UNASSIGNED_PUB_KEY"
              value={g.publicKey}
              onChange={(e) => onUpdate(g.id, 'publicKey', e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-neutral-700 uppercase tracking-widest px-2 italic flex items-center gap-2">
              <Terminal size={12} /> Restricted Secret Token
            </label>
            <div className="relative">
              <input 
                type={showKeys ? "text" : "password"}
                className="w-full bg-black border border-neutral-800 rounded-xl px-5 py-4 text-[11px] text-neutral-500 font-mono outline-none focus:border-white/20 transition-all shadow-inner"
                placeholder="••••••••••••••••"
                value={g.secretKey}
                onChange={(e) => onUpdate(g.id, 'secretKey', e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                <ShieldAlert size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* QR SECTION - DYNAMIC */}
        {meta.hasQr && (
          <div className="mt-6 pt-6 border-t border-neutral-900/50 space-y-4">
            <label className="text-[9px] font-black text-neutral-700 uppercase tracking-widest px-2 italic flex items-center gap-2">
              <Scan size={12} className="text-emerald-500" /> QR_UPLINK_TERMINAL
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-full aspect-square bg-black border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer group/qr transition-all ${
                g.qrCode ? 'border-emerald-500/20' : 'border-neutral-800 hover:border-accent/40'
              }`}
            >
              {g.qrCode ? (
                <div className="relative w-full h-full p-6 animate-in fade-in duration-700">
                   <img src={g.qrCode} className="w-full h-full object-contain mix-blend-screen opacity-80" alt="QR Code" />
                   <button 
                     onClick={(e) => { e.stopPropagation(); onUpdate(g.id, 'qrCode', ''); }}
                     className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:bg-red-600 transition-all"
                   >
                     <X size={14} />
                   </button>
                   <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none" />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center px-8">
                   <div className="w-16 h-16 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-center text-neutral-700 group-hover/qr:text-accent transition-colors">
                      <Upload size={24} />
                   </div>
                   <div>
                      <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">Broadcast QR Asset</span>
                      <span className="text-[8px] text-neutral-700 font-bold uppercase mt-1">Accepts PNG / JPEG Node Strings</span>
                   </div>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => onQrUpload(g.id, e.target.files?.[0] || null)} 
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-neutral-900/50">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-neutral-700 uppercase tracking-widest mb-1">Transaction Node Fee</span>
            <div className="flex items-center gap-2 bg-black border border-neutral-800 rounded-lg px-3 py-1">
              <input 
                type="number" 
                step="0.1"
                className="bg-transparent border-none text-xl font-black text-white italic tracking-tighter w-12 p-0 outline-none font-tactical" 
                value={g.fee} 
                onChange={(e) => onUpdate(g.id, 'fee', e.target.value)} 
              />
              <span className="text-neutral-700 text-sm italic font-tactical font-black">%</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[9px] font-black text-neutral-700 uppercase tracking-widest mb-1">Node Identifier</span>
             <span className="text-[10px] font-mono text-neutral-600 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800">{g.id.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminPaymentSettings: React.FC<AdminPaymentSettingsProps> = ({ gateways, onGatewaysChange }) => {
  const [showKeys, setShowKeys] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [selectedNewProvider, setSelectedNewProvider] = useState<string>('stripe');
  const [localGateways, setLocalGateways] = useState<GatewayAPI[]>([]);

  useEffect(() => {
    if (gateways.length > 0) {
      setLocalGateways(gateways);
    }
  }, [gateways]);

  const handleUpdate = (id: string, field: keyof GatewayAPI, value: any) => {
    setLocalGateways(prev => prev.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const handleToggleStatus = (id: string) => {
    soundService.playClick(true);
    setLocalGateways(prev => prev.map(g => g.id === id ? { ...g, status: g.status === 'active' ? 'inactive' : 'active' } : g));
  };

  const handleAddNode = () => {
    soundService.playClick(true);
    const meta = PROVIDER_METADATA[selectedNewProvider] || PROVIDER_METADATA['stripe'];
    const newNode: GatewayAPI = {
      id: `gw_${Math.random().toString(36).substr(2, 9)}`,
      provider: selectedNewProvider as any,
      name: `${meta.label.toUpperCase()}_NODE_${(localGateways.filter(g => g.provider === selectedNewProvider).length + 1)}`,
      publicKey: '',
      secretKey: '',
      fee: '2.5',
      status: 'inactive',
      qrCode: ''
    };
    setLocalGateways(prev => [...prev, newNode]);
  };

  const handlePurgeNode = (id: string) => {
    if (confirm("CRITICAL_ACTION: Permanently decommission this financial node? All associated settlement logic will be purged.")) {
      soundService.playClick(true);
      setLocalGateways(prev => prev.filter(g => g.id !== id));
    }
  };

  const handleQrUpload = (id: string, file: File | null) => {
    if (!file) return;
    soundService.playClick(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      handleUpdate(id, 'qrCode', reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCommit = async () => {
    if (isSaving) return;
    soundService.playClick(true);
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await onGatewaysChange(localGateways);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 pb-32 animate-in fade-in duration-500 font-rajdhani px-4">
      
      {/* CONTROL HUD */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6 border-b border-neutral-900 pb-6">
        <div className="flex items-center gap-6 w-full xl:w-auto">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-glow-sm">
            <Landmark size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-futuristic text-white italic uppercase leading-none tracking-tight">FINANCIAL <span className="text-neutral-500">INFRASTRUCTURE</span></h2>
            <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.3em] mt-2">MERCHANT_NODE_ORCHESTRATION_v6.1</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto justify-end">
          <div className="flex bg-black border border-neutral-800 rounded-xl p-1.5 items-center gap-2">
            <select 
              value={selectedNewProvider}
              onChange={(e) => setSelectedNewProvider(e.target.value)}
              className="bg-transparent text-[10px] font-black text-white uppercase tracking-widest outline-none px-4 py-1.5 cursor-pointer appearance-none border-r border-neutral-800 pr-8"
            >
              {Object.entries(PROVIDER_METADATA).map(([key, meta]) => (
                <option key={key} value={key} className="bg-[#0c0c0c]">{meta.label}</option>
              ))}
            </select>
            <button 
              onClick={handleAddNode}
              className="flex items-center gap-2 px-4 py-1.5 bg-accent text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-accent/80 transition-all"
            >
              <Plus size={14} /> Provision_Node
            </button>
          </div>

          <div className="h-10 w-px bg-neutral-900 hidden md:block" />

          <button 
            onClick={() => setShowKeys(!showKeys)} 
            className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 hover:text-white transition-all shadow-xl"
            title="Toggle Key Visibility"
          >
            {showKeys ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>

          <button 
            onClick={handleCommit} 
            disabled={isSaving} 
            className={`flex items-center gap-4 px-8 py-2.5 rounded-xl font-black text-xs uppercase italic tracking-widest transition-all border-b-4 active:translate-y-1 active:border-b-0 ${
              saveSuccess ? 'bg-emerald-600 text-white border-emerald-900' : 'bg-white text-black border-neutral-300'
            }`}
          >
            {isSaving ? <RefreshCw className="animate-spin" size={18} /> : saveSuccess ? <CheckCircle size={18} /> : <Save size={18} />}
            {isSaving ? 'SYNCING...' : saveSuccess ? 'COMMIT_SUCCESS' : 'COMMIT_GLOBAL_SYNC'}
          </button>
        </div>
      </div>

      {/* NODE GRID */}
      {localGateways.length === 0 ? (
        <div className="py-32 text-center bg-black/40 border-2 border-dashed border-neutral-900 rounded-[3rem] flex flex-col items-center gap-6">
           <Database size={64} className="text-neutral-800 animate-pulse" />
           <div className="space-y-2">
              <h3 className="text-xl font-futuristic text-neutral-600 uppercase tracking-[0.4em]">Infrastructure_Offline</h3>
              <p className="text-[10px] text-neutral-800 font-black uppercase tracking-widest">PROVISION A MERCHANT NODE TO ESTABLISH LIQUIDITY HANDSHAKE</p>
           </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
          {localGateways.map((g) => (
            <GatewayNode 
              key={g.id}
              g={g}
              showKeys={showKeys}
              onUpdate={handleUpdate}
              onToggleStatus={handleToggleStatus}
              onPurge={handlePurgeNode}
              onQrUpload={handleQrUpload}
            />
          ))}
        </div>
      )}

      {/* DISCLOSURE */}
      <div className="bg-[#0f0f0f] border border-neutral-900 p-8 rounded-[3rem] flex items-start gap-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <ShieldCheck size={32} className="text-neutral-700 shrink-0 relative z-10" />
        <div className="space-y-3 relative z-10">
          <h4 className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.4em] italic">Consensus Layer Handshake Disclosure</h4>
          <p className="text-[10px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
            Changes to the financial infrastructure require absolute root authorization. Provisioning modern gateway nodes establishes a dedicated handshake protocol with the global vault ledger. All keys are encrypted via hardware-accelerated AES-256 before being committed to the persistent data node. Decommissioned nodes will immediately suspend all pending settlement cycles.
          </p>
        </div>
      </div>

      <style>{`
        .shadow-glow-sm {
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
        }
        .font-tactical { font-family: 'Teko', sans-serif; }
      `}</style>

    </div>
  );
};

export default AdminPaymentSettings;
