import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Save, 
  RefreshCw, 
  Facebook, 
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { OAuthConfig } from '../types';

interface AdminOAuthSettingsProps {
  config: OAuthConfig;
  onConfigChange: (config: OAuthConfig) => void;
}

const AdminOAuthSettings: React.FC<AdminOAuthSettingsProps> = ({ config, onConfigChange }) => {
  const [showSecrets, setShowSecrets] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localConfig, setLocalConfig] = useState<OAuthConfig>({ ...config });

  const handleToggle = (key: keyof OAuthConfig) => {
    setLocalConfig(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key: keyof OAuthConfig, value: string | boolean) => {
    setLocalConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simple verification check
    if (localConfig.googleEnabled && localConfig.googleClientSecret && !localConfig.googleClientSecret.startsWith('GOCSPX-')) {
      alert("WARNING: Google Secret usually starts with GOCSPX-. Verify key integrity.");
    }
    await onConfigChange(localConfig);
    setTimeout(() => { setIsSaving(false); }, 1000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
            <Lock className="text-[#facc15]" /> Identity Infrastructure
          </h2>
          <p className="text-neutral-500 text-sm font-medium mt-1">Provision OAuth 2.0 gateways to link the Sales Floor with social identities.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <button onClick={() => setShowSecrets(!showSecrets)} className="flex-1 md:flex-none bg-neutral-900 text-white px-6 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 border border-neutral-800">{showSecrets ? <EyeOff size={16} /> : <Eye size={16} />} {showSecrets ? 'MASK' : 'SHOW'}</button>
          <button onClick={handleSave} disabled={isSaving} className="flex-1 md:flex-none bg-[#facc15] text-black px-8 py-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-xl shadow-yellow-400/10 border-b-4 border-yellow-600 active:scale-95 disabled:opacity-50">{isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} {isSaving ? 'UPDATING...' : 'COMMIT API KEYS'}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-[#121212] p-8 rounded-[2.5rem] border border-neutral-900 shadow-2xl space-y-8 relative hover:border-[#facc15]/20 transition-all flex flex-col group">
          <div className="flex justify-between items-start">
             <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg"><img src="https://www.google.com/favicon.ico" alt="Google" className="w-8 h-8" /></div>
                <div><h3 className="text-xl font-black text-white uppercase tracking-tight italic">Google Cloud Node</h3><span className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em]">OAuth 2.0 Identity Protocol</span></div>
             </div>
             <button onClick={() => handleToggle('googleEnabled')} className={`px-4 py-2 rounded-xl font-black text-[10px] transition-all border ${localConfig.googleEnabled ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>{localConfig.googleEnabled ? 'ACTIVE' : 'OFFLINE'}</button>
          </div>
          <div className="space-y-5">
            <div className="space-y-1.5"><label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest px-1">Google Client ID</label><input className="w-full bg-black border border-neutral-800 rounded-xl px-5 py-3 text-white font-mono text-xs focus:border-[#facc15] outline-none" value={localConfig.googleClientId} onChange={(e) => handleChange('googleClientId', e.target.value)} /></div>
            <div className="space-y-1.5"><label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest px-1">Google Client Secret</label><input type={showSecrets ? 'text' : 'password'} className="w-full bg-black border border-neutral-800 rounded-xl px-5 py-3 text-white font-mono text-xs focus:border-[#facc15] outline-none" value={localConfig.googleClientSecret} onChange={(e) => handleChange('googleClientSecret', e.target.value)} /></div>
          </div>
        </div>

        <div className="bg-[#121212] p-8 rounded-[2.5rem] border border-neutral-900 shadow-2xl space-y-8 relative hover:border-[#facc15]/20 transition-all flex flex-col group">
          <div className="flex justify-between items-start">
             <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-[#1877F2] rounded-3xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg"><Facebook size={32} /></div>
                <div><h3 className="text-xl font-black text-white uppercase tracking-tight italic">Meta Developer Node</h3><span className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em]">Identity Graph API</span></div>
             </div>
             <button onClick={() => handleToggle('facebookEnabled')} className={`px-4 py-2 rounded-xl font-black text-[10px] transition-all border ${localConfig.facebookEnabled ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-red-500/10 border-red-500 text-red-500'}`}>{localConfig.facebookEnabled ? 'ACTIVE' : 'OFFLINE'}</button>
          </div>
          <div className="space-y-5">
            <div className="space-y-1.5"><label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest px-1">Facebook App ID</label><input className="w-full bg-black border border-neutral-800 rounded-xl px-5 py-3 text-white font-mono text-xs focus:border-[#facc15] outline-none" value={localConfig.facebookAppId} onChange={(e) => handleChange('facebookAppId', e.target.value)} /></div>
            <div className="space-y-1.5"><label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest px-1">Facebook App Secret</label><input type={showSecrets ? 'text' : 'password'} className="w-full bg-black border border-neutral-800 rounded-xl px-5 py-3 text-white font-mono text-xs focus:border-[#facc15] outline-none" value={localConfig.facebookAppSecret} onChange={(e) => handleChange('facebookAppSecret', e.target.value)} /></div>
          </div>
        </div>
      </div>

      <div className="bg-[#facc15]/5 border border-[#facc15]/10 p-8 rounded-[2rem] flex items-start gap-5">
        <ShieldCheck className="text-[#facc15] shrink-0" size={28} />
        <div>
           <h4 className="text-white font-bold uppercase text-xs tracking-widest mb-1">Authorization Security Protocol</h4>
           <p className="text-neutral-500 text-xs italic leading-relaxed">Identity nodes must be provisioned with valid production keys to enable the Sales Floor login flow. Incomplete keys will lock the provider for traders.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminOAuthSettings;