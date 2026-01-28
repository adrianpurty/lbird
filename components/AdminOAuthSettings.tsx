
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
  ArrowRight,
  Settings2
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
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("Config Save Failed", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-4 pb-24 animate-in fade-in duration-500 font-rajdhani px-3 md:px-0">
      
      {/* ULTRA-COMPACT HEADER */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-400 shadow-glow-sm">
            <Lock size={16} />
          </div>
          <div>
            <h2 className="text-lg font-futuristic text-white italic uppercase leading-none tracking-tight">AUTH <span className="text-neutral-500">INFRA</span></h2>
            <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest mt-0.5">OIDC_V4_READY</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => { soundService.playClick(); setShowSecrets(!showSecrets); }}
            className="p-1.5 bg-neutral-900/50 border border-neutral-800 rounded-md text-neutral-500 hover:text-white transition-all"
          >
            {showSecrets ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md font-black text-[9px] uppercase tracking-widest transition-all border-b-2 active:translate-y-0.5 active:border-b-0 ${
              saveSuccess 
                ? 'bg-emerald-600 text-white border-emerald-900' 
                : 'bg-white text-black border-neutral-300 hover:bg-neutral-100'
            }`}
          >
            {isSaving ? <RefreshCw className="animate-spin" size={12} /> : <Database size={12} />}
            {isSaving ? 'SYNC' : saveSuccess ? 'DONE' : 'COMMIT'}
          </button>
        </div>
      </div>

      {/* COMPACT NODES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* GOOGLE NODE */}
        <div className="group relative bg-[#0c0c0c] border border-neutral-800/40 rounded-2xl p-4 shadow-lg overflow-hidden transition-all hover:border-blue-500/20">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500/50" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black border border-neutral-800 rounded-lg flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white italic uppercase tracking-widest leading-none">GOOGLE_CORE</h3>
                  <p className="text-[7px] text-neutral-600 font-black uppercase mt-0.5">NODE_01</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggle('googleEnabled')}
                className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border transition-all ${
                  localConfig.googleEnabled ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'bg-red-500/10 border-red-500/30 text-red-400 opacity-40'
                }`}
              >
                {localConfig.googleEnabled ? 'ACTIVE' : 'OFFLINE'}
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-1 italic">CLIENT_ID</label>
                <input 
                  className="w-full bg-black/40 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-400 font-mono text-[9px] outline-none focus:border-blue-500/40 transition-all"
                  placeholder="G_CLIENT_ID"
                  value={localConfig.googleClientId}
                  onChange={(e) => handleChange('googleClientId', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-1 italic">SECRET_TOKEN</label>
                <input 
                  type={showSecrets ? "text" : "password"}
                  className="w-full bg-black/40 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-400 font-mono text-[9px] outline-none focus:border-blue-500/40 transition-all"
                  placeholder="••••••••"
                  value={localConfig.googleClientSecret}
                  onChange={(e) => handleChange('googleClientSecret', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* META NODE */}
        <div className="group relative bg-[#0c0c0c] border border-neutral-800/40 rounded-2xl p-4 shadow-lg overflow-hidden transition-all hover:border-blue-600/20">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600/50" />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-black border border-neutral-800 rounded-lg flex items-center justify-center grayscale group-hover:grayscale-0 transition-all text-blue-600">
                  <Facebook size={18} fill="currentColor" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white italic uppercase tracking-widest leading-none">META_SYNC</h3>
                  <p className="text-[7px] text-neutral-600 font-black uppercase mt-0.5">NODE_02</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggle('facebookEnabled')}
                className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-widest border transition-all ${
                  localConfig.facebookEnabled ? 'bg-blue-600/10 border-blue-600/30 text-blue-500' : 'bg-red-500/10 border-red-500/30 text-red-400 opacity-40'
                }`}
              >
                {localConfig.facebookEnabled ? 'ACTIVE' : 'OFFLINE'}
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-1 italic">APP_ID</label>
                <input 
                  className="w-full bg-black/40 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-400 font-mono text-[9px] outline-none focus:border-blue-500/40 transition-all"
                  placeholder="M_APP_ID"
                  value={localConfig.facebookAppId}
                  onChange={(e) => handleChange('facebookAppId', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-1 italic">GRAPH_SECRET</label>
                <input 
                  type={showSecrets ? "text" : "password"}
                  className="w-full bg-black/40 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-400 font-mono text-[9px] outline-none focus:border-blue-500/40 transition-all"
                  placeholder="••••••••"
                  value={localConfig.facebookAppSecret}
                  onChange={(e) => handleChange('facebookAppSecret', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DISCLOSURE FOOTER - ULTRA SMALL */}
      <div className="bg-[#0f0f0f] border border-neutral-900 p-3 rounded-xl flex items-center gap-3 shadow-sm">
        <ShieldCheck size={14} className="text-neutral-700 shrink-0" />
        <p className="text-[7px] text-neutral-600 font-medium leading-relaxed uppercase tracking-widest">
          Node provisioning requires valid OIDC signatures. Unauthorized identity sync will trigger a system lockout.
        </p>
      </div>

    </div>
  );
};

export default AdminOAuthSettings;
