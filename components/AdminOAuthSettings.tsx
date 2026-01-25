
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  Facebook, 
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Cpu,
  Database,
  Terminal,
  Zap,
  Activity,
  Globe
} from 'lucide-react';
import { OAuthConfig } from '../types.ts';

interface AdminOAuthSettingsProps {
  config: OAuthConfig;
  onConfigChange: (config: OAuthConfig) => Promise<any>;
}

const AdminOAuthSettings: React.FC<AdminOAuthSettingsProps> = ({ config, onConfigChange }) => {
  const [showSecrets, setShowSecrets] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [localConfig, setLocalConfig] = useState<OAuthConfig>({ ...config });

  useEffect(() => {
    setLocalConfig({ ...config });
  }, [config]);

  const handleToggle = (key: keyof OAuthConfig) => {
    if (typeof localConfig[key] === 'boolean') {
      setLocalConfig(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleChange = (key: keyof OAuthConfig, value: string | boolean) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (isSaving) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(false);
    
    try {
      const response = await onConfigChange(localConfig);
      if (response && response.status === 'success') {
        setSaveSuccess(true);
      } else {
        setSaveError(true);
      }
    } catch (error) {
      setSaveError(true);
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveSuccess(false);
        setSaveError(false);
      }, 4000);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-32 animate-in fade-in duration-700">
      {/* LANDSCAPE HEADER - HUD STYLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b-2 border-neutral-900 pb-8 md:pb-12">
        <div className="relative">
          <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-4 h-12 md:h-24 bg-purple-500 rounded-full blur-xl opacity-20" />
          <h2 className="text-4xl sm:text-7xl lg:text-8xl font-futuristic font-black text-white italic uppercase tracking-tighter leading-none flex flex-wrap items-center gap-4 md:gap-10 text-glow">
            AUTH <span className="text-neutral-600">INFRA</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4 md:mt-6">
            <div className="px-3 md:px-4 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full text-[8px] md:text-[10px] font-black text-purple-400 uppercase tracking-[0.3em] md:tracking-[0.4em]">IDENTITY_GATEWAY_v4</div>
            <span className="text-[10px] md:text-[12px] text-neutral-600 font-bold uppercase tracking-[0.4em] md:tracking-[0.6em] italic shrink-0">OIDC_PROTOCOLS_ACTIVE</span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto">
          <button 
            type="button"
            onClick={() => setShowSecrets(!showSecrets)} 
            className="p-4 md:p-5 bg-neutral-900 border-2 border-neutral-800 rounded-xl md:rounded-2xl text-neutral-400 hover:text-white transition-all group shrink-0"
          >
            {showSecrets ? <EyeOff size={20} md:size={24} /> : <Eye size={20} md:size={24} />}
          </button>
          <button 
            type="button"
            onClick={handleSave} 
            disabled={isSaving} 
            className={`flex-1 md:flex-none px-6 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[12px] uppercase tracking-[0.3em] md:tracking-[0.4em] flex items-center justify-center gap-3 md:gap-4 transition-all shadow-2xl border-b-4 ${
              saveSuccess 
                ? 'bg-emerald-600 text-white border-emerald-900' 
                : saveError
                  ? 'bg-red-700 text-white border-red-950 animate-shake'
                  : 'bg-purple-600 text-white border-purple-900 hover:bg-purple-500 shadow-purple-500/20'
            }`}
          >
            {isSaving ? <RefreshCw className="animate-spin" size={16} md:size={20} /> : saveSuccess ? <CheckCircle2 size={16} md:size={20} /> : <Save size={16} md:size={20} />}
            {isSaving ? 'SYNCING...' : saveSuccess ? 'COMMITTED' : 'COMMIT_INFRA'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:gap-8">
        {/* Google Terminal Card */}
        <div className="group relative bg-[#0c0c0c]/80 rounded-[2rem] md:rounded-[3rem] border-2 border-neutral-800/60 p-6 md:p-10 scanline-effect hover:border-blue-500/40 transition-all flex flex-col lg:flex-row items-center gap-8 md:gap-12">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 shadow-[2px_0_15px_rgba(59,130,246,0.3)]" />
          
          {/* Identity Node */}
          <div className="flex items-center gap-6 md:gap-8 shrink-0 w-full lg:w-auto lg:min-w-[300px]">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-black border-2 border-neutral-800 rounded-2xl md:rounded-[2rem] flex items-center justify-center grayscale group-hover:grayscale-0 transition-all group-hover:border-blue-500/50 shrink-0">
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 md:w-10 md:h-10" />
            </div>
            <div>
              <span className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest block mb-1">AUTH_NODE_01</span>
              <h3 className="text-xl md:text-3xl font-black text-white italic tracking-tighter uppercase font-futuristic leading-tight">GOOGLE_CORE</h3>
              <div className="flex items-center gap-4 mt-3 md:mt-4">
                 <button 
                  onClick={() => handleToggle('googleEnabled')} 
                  className={`px-3 md:px-4 py-1 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${
                    localConfig.googleEnabled ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                 >
                   {localConfig.googleEnabled ? 'OPERATIONAL' : 'OFFLINE'}
                 </button>
              </div>
            </div>
          </div>

          {/* Configuration Node */}
          <div className="flex-1 w-full space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-[8px] md:text-[9px] font-black text-neutral-600 uppercase tracking-widest px-2">CLIENT_IDENTIFIER</label>
                <div className="relative">
                   <Globe size={12} md:size={14} className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-neutral-700" />
                   <input 
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-xl md:rounded-2xl pl-10 md:pl-12 pr-4 md:pr-6 py-3 md:py-4 text-neutral-400 font-mono text-[10px] md:text-sm outline-none focus:border-blue-500/40 transition-all"
                    placeholder="xxxx.apps.googleusercontent.com"
                    value={localConfig.googleClientId} 
                    onChange={(e) => handleChange('googleClientId', e.target.value)} 
                   />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] md:text-[9px] font-black text-neutral-600 uppercase tracking-widest px-2">SECRET_AUTHENTICATOR</label>
                <div className="relative">
                   <Lock size={12} md:size={14} className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-neutral-700" />
                   <input 
                    type={showSecrets ? 'text' : 'password'}
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-xl md:rounded-2xl pl-10 md:pl-12 pr-4 md:pr-6 py-3 md:py-4 text-neutral-400 font-mono text-[10px] md:text-sm outline-none focus:border-blue-500/40 transition-all"
                    placeholder="GOCSPX-xxxx"
                    value={localConfig.googleClientSecret} 
                    onChange={(e) => handleChange('googleClientSecret', e.target.value)} 
                   />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Facebook Terminal Card */}
        <div className="group relative bg-[#0c0c0c]/80 rounded-[2rem] md:rounded-[3rem] border-2 border-neutral-800/60 p-6 md:p-10 scanline-effect hover:border-[#1877F2]/40 transition-all flex flex-col lg:flex-row items-center gap-8 md:gap-12">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1877F2] shadow-[2px_0_15px_rgba(24,119,242,0.3)]" />
          
          {/* Identity Node */}
          <div className="flex items-center gap-6 md:gap-8 shrink-0 w-full lg:w-auto lg:min-w-[300px]">
            <div className="w-16 h-16 md:w-24 md:h-24 bg-black border-2 border-neutral-800 rounded-2xl md:rounded-[2rem] flex items-center justify-center grayscale group-hover:grayscale-0 transition-all group-hover:border-[#1877F2]/50 text-[#1877F2] shrink-0">
              <Facebook size={28} md:size={40} fill="currentColor" />
            </div>
            <div>
              <span className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest block mb-1">AUTH_NODE_02</span>
              <h3 className="text-xl md:text-3xl font-black text-white italic tracking-tighter uppercase font-futuristic leading-tight">META_HANDSHAKE</h3>
              <div className="flex items-center gap-4 mt-3 md:mt-4">
                 <button 
                  onClick={() => handleToggle('facebookEnabled')} 
                  className={`px-3 md:px-4 py-1 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${
                    localConfig.facebookEnabled ? 'bg-[#1877F2]/10 border-[#1877F2]/30 text-[#1877F2]' : 'bg-red-500/10 border-red-500/30 text-red-400'
                  }`}
                 >
                   {localConfig.facebookEnabled ? 'OPERATIONAL' : 'OFFLINE'}
                 </button>
              </div>
            </div>
          </div>

          {/* Configuration Node */}
          <div className="flex-1 w-full space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-[8px] md:text-[9px] font-black text-neutral-600 uppercase tracking-widest px-2">APP_IDENTIFIER</label>
                <div className="relative">
                   <Activity size={12} md:size={14} className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-neutral-700" />
                   <input 
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-xl md:rounded-2xl pl-10 md:pl-12 pr-4 md:pr-6 py-3 md:py-4 text-neutral-400 font-mono text-[10px] md:text-sm outline-none focus:border-[#1877F2]/40 transition-all"
                    placeholder="Enter Meta App ID"
                    value={localConfig.facebookAppId} 
                    onChange={(e) => handleChange('facebookAppId', e.target.value)} 
                   />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[8px] md:text-[9px] font-black text-neutral-600 uppercase tracking-widest px-2">GRAPH_SECRET_TOKEN</label>
                <div className="relative">
                   <ShieldCheck size={12} md:size={14} className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-neutral-700" />
                   <input 
                    type={showSecrets ? 'text' : 'password'}
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-xl md:rounded-2xl pl-10 md:pl-12 pr-4 md:pr-6 py-3 md:py-4 text-neutral-400 font-mono text-[10px] md:text-sm outline-none focus:border-[#1877F2]/40 transition-all"
                    placeholder="Enter Meta App Secret"
                    value={localConfig.facebookAppSecret} 
                    onChange={(e) => handleChange('facebookAppSecret', e.target.value)} 
                   />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DISCLOSURE NODES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-[#0f0f0f] border-2 border-neutral-900 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] flex items-start gap-4 md:gap-6 shadow-xl">
          <Terminal className="text-purple-500 shrink-0" size={20} md:size={24} />
          <div>
             <h4 className="text-[9px] md:text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1">PROTO_SYNC</h4>
             <p className="text-[8px] md:text-[10px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
               Manual provisioning requires secret tokens. Incomplete handshakes will result in sync lockout.
             </p>
          </div>
        </div>
        <div className="bg-[#0f0f0f] border-2 border-neutral-900 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] flex items-start gap-4 md:gap-6 shadow-xl">
          <Lock className="text-blue-500 shrink-0" size={20} md:size={24} />
          <div>
             <h4 className="text-[9px] md:text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1">AUDIT_LOG</h4>
             <p className="text-[8px] md:text-[10px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
               All commits are signature-verified. Identity segments use 256-bit encryption during sync.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOAuthSettings;
