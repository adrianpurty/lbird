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
  XCircle
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
    
    const googleId = String(localConfig.googleClientId || '').trim();
    const facebookId = String(localConfig.facebookAppId || '').trim();

    const committedConfig: OAuthConfig = {
      ...localConfig,
      googleEnabled: localConfig.googleEnabled && googleId.length > 0,
      facebookEnabled: localConfig.facebookEnabled && facebookId.length > 0,
    };

    setLocalConfig(committedConfig);

    try {
      const response = await onConfigChange(committedConfig);
      
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 theme-transition">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-neutral-300 uppercase tracking-tighter italic flex items-center gap-3">
            <Lock className="text-[#facc15]/70" /> Identity Infrastructure
          </h2>
          <p className="text-neutral-600 text-sm font-medium mt-1 uppercase tracking-wider text-[10px]">Provision OAuth 2.0 gateways for secure social handshakes.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button 
            type="button"
            onClick={() => setShowSecrets(!showSecrets)} 
            className="flex-1 md:flex-none bg-neutral-900/50 text-neutral-400 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-neutral-800/40 transition-all hover:text-white active:scale-95"
          >
            {showSecrets ? <EyeOff size={14} /> : <Eye size={14} />} {showSecrets ? 'Mask' : 'Show'}
          </button>
          <button 
            type="button"
            onClick={handleSave} 
            disabled={isSaving} 
            className={`flex-1 md:flex-none px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 border-b-2 ${
              saveSuccess 
                ? 'bg-emerald-600/80 text-white border-emerald-900 shadow-lg shadow-emerald-900/20' 
                : saveError
                  ? 'bg-red-700/80 text-white border-red-950 animate-shake'
                  : 'bg-[#facc15]/70 text-black border-yellow-800/50 hover:bg-[#facc15]/80'
            }`}
          >
            {isSaving ? (
              <RefreshCw className="animate-spin" size={14} />
            ) : saveSuccess ? (
              <CheckCircle2 size={14} />
            ) : saveError ? (
              <XCircle size={14} />
            ) : (
              <Save size={14} />
            )} 
            {isSaving ? 'Syncing...' : saveSuccess ? 'Success' : saveError ? 'Error' : 'Commit'}
          </button>
        </div>
      </div>

      <div className="bg-neutral-900/30 border border-neutral-800/40 p-6 rounded-[2rem] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-neutral-800/50 rounded-xl flex items-center justify-center">
              <Lock className="text-neutral-500" size={18} />
            </div>
            <div>
              <span className="text-[9px] text-neutral-600 font-black uppercase tracking-widest block leading-none mb-1">Visibility Status</span>
              <p className="text-neutral-500 font-bold text-[10px] uppercase">{showSecrets ? 'Revealed' : 'Encrypted'}</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6 px-4">
             <div className="text-center">
                <span className="text-[9px] text-neutral-600 font-black uppercase tracking-widest block mb-1">Provisioned</span>
                <span className="text-neutral-400 font-black text-[10px]">2 Nodes</span>
             </div>
             <div className="w-px h-6 bg-neutral-800/40" />
             <div className="text-center">
                <span className="text-[9px] text-neutral-600 font-black uppercase tracking-widest block mb-1">Security</span>
                <span className="text-neutral-500 font-black text-[10px] uppercase">AES-256</span>
             </div>
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Google OAuth Panel */}
        <div className={`bg-neutral-900/40 p-8 rounded-[2.5rem] border transition-all flex flex-col group ${saveError ? 'border-red-900/50' : 'border-neutral-800/40'}`}>
          <div className="flex justify-between items-start">
             <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-neutral-100/10 rounded-3xl flex items-center justify-center grayscale opacity-60 group-hover:opacity-100 transition-all">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-300 uppercase tracking-tight italic">Google Core</h3>
                  <span className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em]">OIDC Identity Provider</span>
                </div>
             </div>
             <button 
               type="button"
               onClick={() => handleToggle('googleEnabled')} 
               className={`px-3 py-1.5 rounded-lg font-black text-[9px] transition-all border ${localConfig.googleEnabled ? 'bg-emerald-500/5 border-emerald-900/50 text-emerald-600' : 'bg-red-500/5 border-red-900/50 text-red-600'}`}
             >
               {localConfig.googleEnabled ? 'ENABLED' : 'DISABLED'}
             </button>
          </div>
          <div className="space-y-5 mt-8">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Client ID</label>
              <input 
                className="w-full bg-black/20 border border-neutral-800/30 rounded-xl px-4 py-3 text-neutral-400 font-mono text-[11px] focus:border-neutral-700 outline-none transition-all placeholder:text-neutral-800" 
                placeholder="xxxx.apps.googleusercontent.com"
                value={localConfig.googleClientId} 
                onChange={(e) => handleChange('googleClientId', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Client Secret</label>
              <input 
                type={showSecrets ? 'text' : 'password'} 
                className="w-full bg-black/20 border border-neutral-800/30 rounded-xl px-4 py-3 text-neutral-400 font-mono text-[11px] focus:border-neutral-700 outline-none transition-all placeholder:text-neutral-800" 
                placeholder="GOCSPX-xxxx"
                value={localConfig.googleClientSecret} 
                onChange={(e) => handleChange('googleClientSecret', e.target.value)} 
              />
            </div>
          </div>
        </div>

        {/* Facebook OAuth Panel */}
        <div className={`bg-neutral-900/40 p-8 rounded-[2.5rem] border transition-all flex flex-col group ${saveError ? 'border-red-900/50' : 'border-neutral-800/40'}`}>
          <div className="flex justify-between items-start">
             <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-neutral-100/10 rounded-3xl flex items-center justify-center text-neutral-600 grayscale opacity-60 group-hover:opacity-100 transition-all">
                  <Facebook size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-neutral-300 uppercase tracking-tight italic">Meta Node</h3>
                  <span className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em]">Graph API Integration</span>
                </div>
             </div>
             <button 
               type="button"
               onClick={() => handleToggle('facebookEnabled')} 
               className={`px-3 py-1.5 rounded-lg font-black text-[9px] transition-all border ${localConfig.facebookEnabled ? 'bg-emerald-500/5 border-emerald-900/50 text-emerald-600' : 'bg-red-500/5 border-red-900/50 text-red-600'}`}
             >
               {localConfig.facebookEnabled ? 'ENABLED' : 'DISABLED'}
             </button>
          </div>
          <div className="space-y-5 mt-8">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">App ID</label>
              <input 
                className="w-full bg-black/20 border border-neutral-800/30 rounded-xl px-4 py-3 text-neutral-400 font-mono text-[11px] focus:border-neutral-700 outline-none transition-all" 
                placeholder="Enter App ID"
                value={localConfig.facebookAppId} 
                onChange={(e) => handleChange('facebookAppId', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">App Secret</label>
              <input 
                type={showSecrets ? 'text' : 'password'} 
                className="w-full bg-black/20 border border-neutral-800/30 rounded-xl px-4 py-3 text-neutral-400 font-mono text-[11px] focus:border-neutral-700 outline-none transition-all" 
                placeholder="Enter App Secret"
                value={localConfig.facebookAppSecret} 
                onChange={(e) => handleChange('facebookAppSecret', e.target.value)} 
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-neutral-900/20 border border-neutral-800/30 p-8 rounded-[2rem] flex items-start gap-5">
        <ShieldCheck className="text-neutral-600 shrink-0" size={24} />
        <div>
           <h4 className="text-neutral-500 font-bold uppercase text-[10px] tracking-widest mb-1">Configuration Integrity Note</h4>
           <p className="text-neutral-600 text-[10px] italic leading-relaxed uppercase">Identity providers require valid production tokens to allow merchant handshake. Incomplete configuration will result in node lockout for traders. System logs will track all commits to this infrastructure segment.</p>
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-2px); }
          75% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default AdminOAuthSettings;