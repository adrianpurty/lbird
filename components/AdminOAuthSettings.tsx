
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Facebook, 
  Lock,
  Eye,
  EyeOff,
  Globe,
  Database,
  Terminal,
  Zap,
  Cpu,
  ArrowRight
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
    <div className="max-w-[1200px] mx-auto space-y-6 pb-20 animate-in fade-in duration-500 font-rajdhani px-4 md:px-0">
      
      {/* COMPACT HEADER */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 shadow-glow-sm">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-xl font-futuristic text-white italic uppercase leading-none tracking-tight">AUTH <span className="text-neutral-500 font-normal">INFRA</span></h2>
            <p className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em] mt-1">OIDC_PROTOCOLS_READY</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { soundService.playClick(); setShowSecrets(!showSecrets); }}
            className="p-2.5 bg-neutral-900/50 border border-neutral-800 rounded-lg text-neutral-500 hover:text-white transition-all"
          >
            {showSecrets ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all border-b-4 active:translate-y-1 active:border-b-0 ${
              saveSuccess 
                ? 'bg-emerald-600 text-white border-emerald-900' 
                : 'bg-white text-black border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <Database size={14} />}
            {isSaving ? 'SYNCING...' : saveSuccess ? 'DEPLOYED' : 'COMMIT_INFRA'}
          </button>
        </div>
      </div>

      {/* AUTH NODES GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* GOOGLE NODE */}
        <div className="group relative bg-[#0c0c0c] border border-neutral-800/60 rounded-[2rem] p-6 shadow-xl overflow-hidden transition-all hover:border-blue-500/30">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[2px_0_15px_rgba(59,130,246,0.3)]" />
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black border border-neutral-800 rounded-xl flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white italic uppercase tracking-widest leading-none">GOOGLE_CORE</h3>
                  <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest mt-1">NODE_IDENTIFIER_01</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggle('googleEnabled')}
                className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border transition-all ${
                  localConfig.googleEnabled ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-red-500/10 border-red-500/30 text-red-400 opacity-40'
                }`}
              >
                {localConfig.googleEnabled ? 'OPERATIONAL' : 'OFFLINE'}
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-700 uppercase tracking-widest px-1 italic">CLIENT_IDENTIFIER</label>
                <div className="relative group/input">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within/input:text-blue-400 transition-colors" size={14} />
                  <input 
                    className="w-full bg-black/40 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-neutral-400 font-mono text-[10px] outline-none focus:border-blue-500/40 transition-all"
                    placeholder="G_CLIENT_ID_STRING"
                    value={localConfig.googleClientId}
                    onChange={(e) => handleChange('googleClientId', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-700 uppercase tracking-widest px-1 italic">SECRET_AUTHENTICATOR</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within/input:text-blue-400 transition-colors" size={14} />
                  <input 
                    type={showSecrets ? "text" : "password"}
                    className="w-full bg-black/40 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-neutral-400 font-mono text-[10px] outline-none focus:border-blue-500/40 transition-all"
                    placeholder="••••••••••••••••"
                    value={localConfig.googleClientSecret}
                    onChange={(e) => handleChange('googleClientSecret', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* META NODE */}
        <div className="group relative bg-[#0c0c0c] border border-neutral-800/60 rounded-[2rem] p-6 shadow-xl overflow-hidden transition-all hover:border-blue-600/30">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 shadow-[2px_0_15px_rgba(37,99,235,0.3)]" />
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-black border border-neutral-800 rounded-xl flex items-center justify-center grayscale group-hover:grayscale-0 transition-all text-blue-600">
                  <Facebook size={24} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white italic uppercase tracking-widest leading-none">META_HANDSHAKE</h3>
                  <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest mt-1">NODE_IDENTIFIER_02</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggle('facebookEnabled')}
                className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border transition-all ${
                  localConfig.facebookEnabled ? 'bg-blue-600/10 border-blue-600/30 text-blue-500' : 'bg-red-500/10 border-red-500/30 text-red-400 opacity-40'
                }`}
              >
                {localConfig.facebookEnabled ? 'OPERATIONAL' : 'OFFLINE'}
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-700 uppercase tracking-widest px-1 italic">APP_IDENTIFIER</label>
                <div className="relative group/input">
                  <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within/input:text-blue-500 transition-colors" size={14} />
                  <input 
                    className="w-full bg-black/40 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-neutral-400 font-mono text-[10px] outline-none focus:border-blue-500/40 transition-all"
                    placeholder="M_APP_ID_STRING"
                    value={localConfig.facebookAppId}
                    onChange={(e) => handleChange('facebookAppId', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-700 uppercase tracking-widest px-1 italic">GRAPH_SECRET_TOKEN</label>
                <div className="relative group/input">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within/input:text-blue-500 transition-colors" size={14} />
                  <input 
                    type={showSecrets ? "text" : "password"}
                    className="w-full bg-black/40 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-neutral-400 font-mono text-[10px] outline-none focus:border-blue-500/40 transition-all"
                    placeholder="••••••••••••••••"
                    value={localConfig.facebookAppSecret}
                    onChange={(e) => handleChange('facebookAppSecret', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DISCLOSURE FOOTER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0f0f0f] border border-neutral-900 p-4 rounded-2xl flex items-start gap-4 shadow-sm group hover:bg-neutral-900/40 transition-all">
          <div className="w-10 h-10 bg-purple-500/5 rounded-xl flex items-center justify-center border border-purple-500/20 text-purple-500 shrink-0 group-hover:scale-110 transition-transform">
            <Terminal size={18} />
          </div>
          <div className="space-y-1">
             <h4 className="text-[10px] font-black text-white italic uppercase tracking-[0.1em] font-futuristic">PROTO_SYNC</h4>
             <p className="text-[9px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
               Manual provisioning requires valid secret tokens. Incomplete handshakes trigger nodal lockout.
             </p>
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-neutral-900 p-4 rounded-2xl flex items-start gap-4 shadow-sm group hover:bg-neutral-900/40 transition-all">
          <div className="w-10 h-10 bg-blue-500/5 rounded-xl flex items-center justify-center border border-blue-500/20 text-blue-500 shrink-0 group-hover:scale-110 transition-transform">
            <ShieldCheck size={18} />
          </div>
          <div className="space-y-1">
             <h4 className="text-[10px] font-black text-white italic uppercase tracking-[0.1em] font-futuristic">AUDIT_LOG</h4>
             <p className="text-[9px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
               All commits are signature-verified. Identity segments use 256-bit encryption during sync.
             </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AdminOAuthSettings;
