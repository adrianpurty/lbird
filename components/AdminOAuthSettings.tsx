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
  Terminal,
  Zap,
  Activity,
  Globe,
  Database
} from 'lucide-react';
import { OAuthConfig } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface AdminOAuthSettingsProps {
  config: OAuthConfig;
  onConfigChange: (config: OAuthConfig) => Promise<any>;
}

const AdminOAuthSettings: React.FC<AdminOAuthSettingsProps> = ({ config, onConfigChange }) => {
  const [showSecrets, setShowSecrets] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [localConfig, setLocalConfig] = useState<OAuthConfig>({ ...config });

  useEffect(() => {
    setLocalConfig({ ...config });
  }, [config]);

  const handleToggle = (key: keyof OAuthConfig) => {
    if (typeof localConfig[key] === 'boolean') {
      soundService.playClick(true);
      setLocalConfig(prev => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleChange = (key: keyof OAuthConfig, value: string | boolean) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (isSaving) return;
    soundService.playClick(true);
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      await onConfigChange(localConfig);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Config Save Failed", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto space-y-12 pb-32 animate-in fade-in duration-700 font-rajdhani">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-6">
          <div className="flex items-baseline gap-4">
            <h1 className="text-6xl font-futuristic italic font-black uppercase tracking-tighter">
              AUTH <span className="text-transparent" style={{ WebkitTextStroke: '2px #ffffff', opacity: 0.3 }}>INFRA</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-4 py-1.5 bg-purple-500/10 border border-purple-500/40 rounded-lg shadow-[0_0_15px_rgba(168,85,247,0.1)]">
              <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">IDENTITY_GATEWAY_V4</span>
            </div>
            <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-[0.3em] italic">OIDC_PROTOCOLS_ACTIVE</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => { soundService.playClick(); setShowSecrets(!showSecrets); }}
            className="p-4 bg-[#0c0c0c] border border-neutral-800 rounded-2xl text-neutral-500 hover:text-white transition-all hover:border-neutral-700 shadow-xl"
          >
            {showSecrets ? <EyeOff size={24} /> : <Eye size={24} />}
          </button>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-4 px-10 py-5 rounded-3xl font-black text-xs uppercase tracking-[0.3em] transition-all border-b-8 active:scale-[0.98] ${
              saveSuccess 
                ? 'bg-emerald-600 text-white border-emerald-900 shadow-[0_0_30px_rgba(16,185,129,0.2)]' 
                : 'bg-black text-white border-neutral-800 hover:bg-neutral-900 shadow-[0_30px_60px_rgba(0,0,0,0.5)]'
            }`}
          >
            {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Database size={18} />}
            {isSaving ? 'SYNCING...' : saveSuccess ? 'DEPLOYED' : 'COMMIT_INFRA'}
          </button>
        </div>
      </div>

      <div className="h-px w-full bg-neutral-900/50" />

      {/* AUTH NODES CONTAINER */}
      <div className="space-y-8">
        
        {/* GOOGLE NODE */}
        <div className="group relative bg-[#080808] border border-neutral-800/40 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-blue-500/20 shadow-2xl">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[2px_0_15px_rgba(59,130,246,0.3)]" />
          
          <div className="p-10 flex flex-col lg:flex-row items-center gap-12">
            {/* Branding Block */}
            <div className="flex items-center gap-8 shrink-0 min-w-[340px]">
              <div className="w-24 h-24 bg-black border-2 border-neutral-800 rounded-[2rem] flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-700 shadow-inner group-hover:border-blue-500/40">
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-10 h-10" />
              </div>
              <div>
                <span className="text-[10px] font-black text-neutral-700 uppercase tracking-widest block mb-2">AUTH_NODE_01</span>
                <h3 className="text-4xl font-futuristic font-black text-white italic tracking-tighter uppercase leading-none group-hover:text-blue-400 transition-colors">GOOGLE_CORE</h3>
                <div className="mt-4">
                  <button 
                    onClick={() => handleToggle('googleEnabled')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                      localConfig.googleEnabled ? 'bg-blue-500/10 border-blue-500/30 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]' : 'bg-red-500/10 border-red-500/30 text-red-400 opacity-40'
                    }`}
                  >
                    {localConfig.googleEnabled ? 'OPERATIONAL' : 'OFFLINE'}
                  </button>
                </div>
              </div>
            </div>

            {/* Inputs Block */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] px-2">CLIENT_IDENTIFIER</label>
                <div className="relative group/input">
                  <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within/input:text-blue-400 transition-colors" size={16} />
                  <input 
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl pl-14 pr-6 py-5 text-neutral-400 font-mono text-xs md:text-sm outline-none focus:border-blue-500/40 transition-all"
                    placeholder="81268171166-s5o4n1g9s69s4k5btk61dp7jipi71obt.apps."
                    value={localConfig.googleClientId}
                    onChange={(e) => handleChange('googleClientId', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] px-2">SECRET_AUTHENTICATOR</label>
                <div className="relative group/input">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within/input:text-blue-400 transition-colors" size={16} />
                  <input 
                    type={showSecrets ? "text" : "password"}
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl pl-14 pr-6 py-5 text-neutral-400 font-mono text-xs md:text-sm outline-none focus:border-blue-500/40 transition-all"
                    placeholder="••••••••••••••••••••••••••••••••"
                    value={localConfig.googleClientSecret}
                    onChange={(e) => handleChange('googleClientSecret', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* META NODE */}
        <div className="group relative bg-[#080808] border border-neutral-800/40 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:border-blue-600/20 shadow-2xl">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 shadow-[2px_0_15px_rgba(37,99,235,0.3)]" />
          
          <div className="p-10 flex flex-col lg:flex-row items-center gap-12">
            {/* Branding Block */}
            <div className="flex items-center gap-8 shrink-0 min-w-[340px]">
              <div className="w-24 h-24 bg-black border-2 border-neutral-800 rounded-[2rem] flex items-center justify-center grayscale group-hover:grayscale-0 transition-all duration-700 shadow-inner group-hover:border-blue-600/40 text-blue-600">
                <Facebook size={48} fill="currentColor" />
              </div>
              <div>
                <span className="text-[10px] font-black text-neutral-700 uppercase tracking-widest block mb-2">AUTH_NODE_02</span>
                <h3 className="text-4xl font-futuristic font-black text-white italic tracking-tighter uppercase leading-none group-hover:text-blue-500 transition-colors">META_HANDSHAKE</h3>
                <div className="mt-4">
                  <button 
                    onClick={() => handleToggle('facebookEnabled')}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${
                      localConfig.facebookEnabled ? 'bg-blue-600/10 border-blue-600/30 text-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.1)]' : 'bg-red-500/10 border-red-500/30 text-red-400 opacity-40'
                    }`}
                  >
                    {localConfig.facebookEnabled ? 'OPERATIONAL' : 'OFFLINE'}
                  </button>
                </div>
              </div>
            </div>

            {/* Inputs Block */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <div className="space-y-3">
                <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] px-2">APP_IDENTIFIER</label>
                <div className="relative group/input">
                  <Activity className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within/input:text-blue-500 transition-colors" size={16} />
                  <input 
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl pl-14 pr-6 py-5 text-neutral-400 font-mono text-xs md:text-sm outline-none focus:border-blue-600/40 transition-all"
                    placeholder="1980274969510625"
                    value={localConfig.facebookAppId}
                    onChange={(e) => handleChange('facebookAppId', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.2em] px-2">GRAPH_SECRET_TOKEN</label>
                <div className="relative group/input">
                  <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within/input:text-blue-500 transition-colors" size={16} />
                  <input 
                    type={showSecrets ? "text" : "password"}
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl pl-14 pr-6 py-5 text-neutral-400 font-mono text-xs md:text-sm outline-none focus:border-blue-600/40 transition-all"
                    placeholder="••••••••••••••••••••••••••••••••"
                    value={localConfig.facebookAppSecret}
                    onChange={(e) => handleChange('facebookAppSecret', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER INFO BLOCKS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
        <div className="bg-[#0f0f0f] border border-neutral-900 p-8 rounded-[2.5rem] flex items-start gap-8 shadow-xl hover:bg-neutral-900/40 transition-all group">
          <div className="w-14 h-14 bg-purple-500/5 rounded-2xl flex items-center justify-center border border-purple-500/20 text-purple-500 shrink-0 group-hover:scale-110 transition-transform">
            <Terminal size={24} />
          </div>
          <div>
             <h4 className="text-sm font-black text-white italic uppercase tracking-[0.2em] mb-2 font-futuristic">PROTO_SYNC</h4>
             <p className="text-[10px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
               Manual provisioning requires secret tokens. Incomplete handshakes will result in sync lockout.
             </p>
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-neutral-900 p-8 rounded-[2.5rem] flex items-start gap-8 shadow-xl hover:bg-neutral-900/40 transition-all group">
          <div className="w-14 h-14 bg-blue-500/5 rounded-2xl flex items-center justify-center border border-blue-500/20 text-blue-500 shrink-0 group-hover:scale-110 transition-transform">
            <Lock size={24} />
          </div>
          <div>
             <h4 className="text-sm font-black text-white italic uppercase tracking-[0.2em] mb-2 font-futuristic">AUDIT_LOG</h4>
             <p className="text-[10px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
               All commits are signature-verified. Identity segments use 256-bit encryption during sync.
             </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminOAuthSettings;