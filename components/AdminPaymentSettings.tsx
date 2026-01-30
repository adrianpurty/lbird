
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ShieldCheck, CreditCard, Globe, Landmark, Cpu, Zap, Activity, Database, 
  Bitcoin, Scan, Smartphone, RefreshCw, Terminal, Lock, Eye, EyeOff, Save, CheckCircle,
  Building, Trash2, Plus, ChevronDown, Wallet, LayoutGrid, AlertTriangle, ShieldAlert,
  Upload, X, Image as ImageIcon, Link as LinkIcon
} from 'lucide-react';
import { GatewayAPI } from '../types.ts';
import { soundService } from '../services/soundService.ts';
import { paymentService } from '../services/paymentService.ts';

interface AdminPaymentSettingsProps {
  gateways: GatewayAPI[];
  onGatewaysChange: (gateways: GatewayAPI[]) => void;
}

const MessageSquare = ({ size, className }: any) => <LayoutGrid size={size} className={className} />;

const PROVIDER_METADATA: Record<string, { label: string, icon: any, color: string, sub: string, hasQr?: boolean }> = {
  stripe: { label: 'Stripe', icon: CreditCard, color: 'text-blue-500', sub: 'Fiat Settlement', hasQr: false },
  paypal: { label: 'PayPal', icon: Globe, color: 'text-indigo-400', sub: 'Digital Wallet', hasQr: false },
  binance: { label: 'Binance Pay', icon: Scan, color: 'text-yellow-500', sub: 'Smart Chain', hasQr: true },
  upi: { label: 'UPI / GPay', icon: Smartphone, color: 'text-emerald-500', sub: 'Instant Bank', hasQr: true },
  crypto: { label: 'Web3 Vault', icon: Bitcoin, color: 'text-orange-500', sub: 'Multi-Chain', hasQr: true },
  razorpay: { label: 'Razorpay', icon: Landmark, color: 'text-blue-600', sub: 'Regional Hub', hasQr: true },
  bank: { label: 'Bank Direct', icon: Building, color: 'text-neutral-400', sub: 'SWIFT / SEPA', hasQr: false },
};

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const handleTestConnection = async () => {
    soundService.playClick(true);
    setTestStatus('testing');
    setTestMessage('INITIATING_HANDSHAKE...');
    
    const result = await paymentService.validateGateway(g);
    
    setTimeout(() => {
      if (result.success) {
        setTestStatus('success');
        setTestMessage(result.message);
      } else {
        setTestStatus('fail');
        setTestMessage(result.message);
      }
    }, 1200);
  };

  return (
    <div className={`group relative bg-[#0c0c0c] border-2 rounded-[2.5rem] p-8 shadow-2xl transition-all duration-500 ${isActive ? 'border-neutral-800/60' : 'border-red-900/10 opacity-60'}`}>
      <div className={`absolute top-0 right-0 w-40 h-40 rounded-full blur-[100px] -mr-20 -mt-20 opacity-5 pointer-events-none ${meta.color.replace('text', 'bg')}`} />
      
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
              placeholder="pk_live_..."
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
                placeholder="sk_live_..."
                value={g.secretKey}
                onChange={(e) => onUpdate(g.id, 'secretKey', e.target.value)}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                <ShieldAlert size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* LIVE VALIDATION HUD */}
        <div className="pt-4">
           <button 
             onClick={handleTestConnection}
             disabled={testStatus === 'testing'}
             className={`w-full py-3 rounded-xl border-2 flex items-center justify-center gap-3 transition-all ${
               testStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' :
               testStatus === 'fail' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
               'bg-black border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-700'
             }`}
           >
             {testStatus === 'testing' ? <RefreshCw size={14} className="animate-spin" /> : <LinkIcon size={14} />}
             <span className="text-[9px] font-black uppercase tracking-widest">
               {testStatus === 'idle' ? 'TEST_GATEWAY_HANDSHAKE' : testMessage}
             </span>
           </button>
        </div>

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
                     className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl"
                   >
                     <X size={14} />
                   </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center px-8">
                   <div className="w-16 h-16 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-center text-neutral-700 group-hover/qr:text-accent">
                      <Upload size={24} />
                   </div>
                   <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest block">Broadcast QR Asset</span>
                </div>
              )}
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => onQrUpload(g.id, e.target.files?.[0] || null)} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-6 border-t border-neutral-900/50">
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-neutral-700 uppercase tracking-widest mb-1">Fee Protocol</span>
            <div className="flex items-center gap-2 bg-black border border-neutral-800 rounded-lg px-3 py-1">
              <input type="number" step="0.1" className="bg-transparent border-none text-xl font-black text-white italic tracking-tighter w-12 p-0 outline-none" value={g.fee} onChange={(e) => onUpdate(g.id, 'fee', e.target.value)} />
              <span className="text-neutral-700 text-sm italic font-black">%</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[9px] font-black text-neutral-700 uppercase tracking-widest mb-1">Node ID</span>
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
    if (gateways.length > 0) setLocalGateways(gateways);
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
    const newNode: GatewayAPI = {
      id: `gw_${Math.random().toString(36).substr(2, 9)}`,
      provider: selectedNewProvider as any,
      name: `${selectedNewProvider.toUpperCase()}_NODE`,
      publicKey: '',
      secretKey: '',
      fee: '2.5',
      status: 'inactive',
      qrCode: ''
    };
    setLocalGateways(prev => [...prev, newNode]);
  };

  const handlePurgeNode = (id: string) => {
    if (confirm("Decommission financial node?")) {
      soundService.playClick(true);
      setLocalGateways(prev => prev.filter(g => g.id !== id));
    }
  };

  const handleQrUpload = (id: string, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => handleUpdate(id, 'qrCode', reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleCommit = async () => {
    if (isSaving) return;
    soundService.playClick(true);
    setIsSaving(true);
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
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 border-b border-neutral-900 pb-6">
        <div className="flex items-center gap-4 sm:gap-6 w-full lg:w-auto">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-glow-sm">
            <Landmark size={20} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-futuristic text-white italic uppercase tracking-tight">FINANCIAL <span className="text-neutral-500">INFRA</span></h2>
            <p className="text-[8px] sm:text-[10px] text-neutral-600 font-black uppercase tracking-[0.2em] mt-1">NODE_v6.1_LIVE_MESH</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 w-full lg:w-auto justify-start sm:justify-end">
          <div className="flex flex-1 sm:flex-none bg-black border border-neutral-800 rounded-xl p-1 sm:p-1.5 items-center gap-1 sm:gap-2">
            <select value={selectedNewProvider} onChange={(e) => setSelectedNewProvider(e.target.value)} className="bg-transparent text-[9px] sm:text-[10px] font-black text-white uppercase tracking-widest outline-none px-2 sm:px-4 py-1.5 cursor-pointer appearance-none border-r border-neutral-800 pr-6 sm:pr-8">
              {Object.entries(PROVIDER_METADATA).map(([key, meta]) => (
                <option key={key} value={key} className="bg-[#0c0c0c]">{meta.label}</option>
              ))}
            </select>
            <button onClick={handleAddNode} className="flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 bg-accent text-white rounded-lg text-[9px] font-black uppercase hover:bg-accent/80 transition-all">
              <Plus size={14} /> Provision
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button onClick={() => setShowKeys(!showKeys)} className="p-2.5 bg-neutral-900 border border-neutral-800 rounded-xl text-neutral-500 hover:text-white shadow-xl">
              {showKeys ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>

            <button onClick={handleCommit} disabled={isSaving} className={`flex items-center gap-2 sm:gap-4 px-4 sm:px-8 py-2.5 rounded-xl font-black text-[10px] sm:text-xs uppercase italic transition-all border-b-4 ${saveSuccess ? 'bg-emerald-600 text-white border-emerald-900' : 'bg-white text-black border-neutral-300'}`}>
              {isSaving ? <RefreshCw className="animate-spin" size={16} /> : saveSuccess ? <CheckCircle size={16} /> : <Save size={16} />}
              <span>{isSaving ? 'SYNCING...' : saveSuccess ? 'SUCCESS' : 'COMMIT_SYNC'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6">
        {localGateways.map((g) => (
          <GatewayNode key={g.id} g={g} showKeys={showKeys} onUpdate={handleUpdate} onToggleStatus={handleToggleStatus} onPurge={handlePurgeNode} onQrUpload={handleQrUpload} />
        ))}
      </div>
    </div>
  );
};

export default AdminPaymentSettings;
