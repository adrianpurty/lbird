import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, Mail, User as UserIcon, Lock, Camera, Save, RefreshCw, FileText, 
  Globe, MonitorSmartphone, Briefcase, Target, Activity, Cpu, Database, 
  Fingerprint, Zap, ArrowRight, ShieldAlert, Circle, CheckCircle2, Phone
} from 'lucide-react';
import { User } from '../types.ts';
import { NICHE_PROTOCOLS } from '../services/apiService.ts';
import { soundService } from '../services/soundService.ts';

interface ProfileSettingsProps {
  user: User;
  onUpdate: (updatedUser: Partial<User>) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    bio: user.bio || '',
    profileImage: user.profileImage || '',
    newPassword: '',
    confirmPassword: '',
    companyWebsite: user.companyWebsite || '',
    industryFocus: user.industryFocus || '',
    preferredContact: user.preferredContact || 'email',
    defaultBusinessUrl: user.defaultBusinessUrl || '',
    defaultTargetUrl: user.defaultTargetUrl || '',
    biometricEnabled: user.biometricEnabled || false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [telemetry, setTelemetry] = useState({
    ip: user.ipAddress || '...',
    device: user.deviceInfo || '...',
    integrity: 98.4
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playClick(true);
    setIsSaving(true);
    onUpdate({ ...formData });
    setTimeout(() => setIsSaving(false), 800);
  };

  const toggleBiometrics = (enabled: boolean) => {
    soundService.playClick();
    setFormData(prev => ({ ...prev, biometricEnabled: enabled }));
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-4 pb-24 animate-in fade-in duration-500 font-rajdhani px-3 md:px-0">
      
      {/* COMPACT HEADER */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#00e5ff]/10 rounded-lg flex items-center justify-center text-[#00e5ff] shadow-glow-sm">
            <UserIcon size={16} />
          </div>
          <div>
            <h2 className="text-lg font-futuristic text-white italic uppercase leading-none tracking-tight">IDENTITY <span className="text-neutral-500">NODE</span></h2>
            <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest mt-0.5">TRADER_v4_ACTIVE</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-neutral-900/40 p-1.5 rounded-lg border border-neutral-800">
          <div className="flex flex-col items-end">
            <span className="text-[7px] text-neutral-600 font-black uppercase">Trust Score</span>
            <span className="text-[10px] font-black text-white italic leading-none">{telemetry.integrity}%</span>
          </div>
          <Activity size={14} className="text-emerald-500 animate-pulse" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left Column (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-2xl p-4 shadow-lg space-y-4">
            <h3 className="text-[8px] font-black text-neutral-700 uppercase tracking-widest italic flex items-center gap-2">
              <Cpu size={10} className="text-[#00e5ff]" /> Generic_Identity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-1">Legal Name</label>
                <input required className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-[11px] text-white outline-none focus:border-[#00e5ff]/40" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-1">Comm Vector (Email)</label>
                <input required type="email" className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-[11px] text-white outline-none focus:border-[#00e5ff]/40" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-1 italic flex items-center gap-2">
                   <Phone size={10} className="text-emerald-500" /> Secure Line (Phone)
                </label>
                <input 
                  type="tel" 
                  className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-[11px] text-white outline-none focus:border-[#00e5ff]/40 font-mono" 
                  placeholder="+X XXX XXX XXXX"
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-1 italic flex items-center gap-2">
                   <Mail size={10} className="text-purple-500" /> Contact Preference
                </label>
                <select 
                  className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-[11px] text-white outline-none focus:border-[#00e5ff]/40"
                  value={formData.preferredContact}
                  onChange={e => setFormData({...formData, preferredContact: e.target.value as any})}
                >
                  <option value="email">EMAIL_ONLY</option>
                  <option value="phone">PHONE_CALL</option>
                  <option value="whatsapp">WHATSAPP</option>
                  <option value="telegram">TELEGRAM</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-1">Biographical Manifest</label>
              <textarea rows={2} className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-[10px] text-neutral-300 outline-none focus:border-[#00e5ff]/40 resize-none italic" value={formData.bio} onChange={e => setFormData({...formData, bio: e.target.value})} />
            </div>
          </div>

          <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-2xl p-4 shadow-lg space-y-4">
             <h3 className="text-[8px] font-black text-neutral-700 uppercase tracking-widest italic flex items-center gap-2">
               <Briefcase size={10} className="text-[#00e5ff]" /> Market_Intelligence
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-1">Corp URL</label>
                  <input type="url" className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-[10px] text-neutral-500 font-mono outline-none focus:border-[#00e5ff]/40" value={formData.companyWebsite} onChange={e => setFormData({...formData, companyWebsite: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-1">Sector Focus</label>
                  <select className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-[10px] text-white outline-none focus:border-[#00e5ff]/40" value={formData.industryFocus} onChange={e => setFormData({...formData, industryFocus: e.target.value})}>
                    <option value="">GENERAL_MARKET</option>
                    {Object.values(NICHE_PROTOCOLS).flat().map(n => <option key={n} value={n}>{n.toUpperCase()}</option>)}
                  </select>
                </div>
             </div>
          </div>

          {/* BIOMETRIC SECURITY NODE */}
          <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-2xl p-4 shadow-lg space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <Fingerprint size={80} />
            </div>
            
            <h3 className="text-[8px] font-black text-neutral-700 uppercase tracking-widest italic flex items-center gap-2">
              <ShieldCheck size={10} className="text-emerald-500" /> Secure_Access_Node
            </h3>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Fingerprint size={14} className="text-[#00e5ff]" /> Biometric Authentication
                </h4>
                <p className="text-[9px] text-neutral-600 uppercase tracking-tight max-w-xs italic">
                  Toggle hardware-level fingerprint verification for subsequent terminal sessions.
                </p>
              </div>

              <div className="flex bg-black/40 border border-neutral-800 p-1 rounded-xl shrink-0">
                <button 
                  type="button"
                  onClick={() => toggleBiometrics(false)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${!formData.biometricEnabled ? 'bg-red-950/20 text-red-500 border border-red-900/30' : 'text-neutral-600 hover:text-neutral-400'}`}
                >
                  {!formData.biometricEnabled ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                  Disabled
                </button>
                <button 
                  type="button"
                  onClick={() => toggleBiometrics(true)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${formData.biometricEnabled ? 'bg-emerald-950/20 text-emerald-500 border border-emerald-900/30' : 'text-neutral-600 hover:text-neutral-400'}`}
                >
                  {formData.biometricEnabled ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                  Enabled
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Col 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0f0f0f] border border-neutral-800/40 rounded-2xl p-5 text-center space-y-4 shadow-lg">
             <div className="relative inline-block" onClick={() => fileInputRef.current?.click()}>
                <div className="w-24 h-24 rounded-2xl border-2 border-neutral-800 overflow-hidden bg-black flex items-center justify-center text-neutral-700 relative">
                  {formData.profileImage ? <img src={formData.profileImage} className="w-full h-full object-cover" /> : <UserIcon size={32} />}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-[#00e5ff] text-black p-1.5 rounded-lg shadow-lg"><Camera size={12} /></div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setFormData(p => ({ ...p, profileImage: reader.result as string }));
                    reader.readAsDataURL(file);
                  }
                }} />
             </div>
             <div className="space-y-1">
                <h4 className="text-sm font-black text-white italic uppercase tracking-widest truncate">{formData.name || 'SYNC_ERROR'}</h4>
                <p className="text-[7px] text-neutral-600 font-black uppercase tracking-widest">ACCESS: {user.role}</p>
             </div>
             <button type="submit" disabled={isSaving} className="w-full bg-white text-black py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest border-b-4 border-neutral-300 active:translate-y-0.5 active:border-b-0 transition-all flex items-center justify-center gap-2">
                {isSaving ? <RefreshCw className="animate-spin" size={12} /> : <Save size={12} />}
                {isSaving ? 'SYNCING' : 'COMMIT'}
             </button>
          </div>

          <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-2xl p-4 shadow-lg space-y-3">
             <h3 className="text-[8px] font-black text-neutral-700 uppercase tracking-widest flex items-center gap-2"><Lock size={10} className="text-red-500" /> Security_Sync</h3>
             <input type="password" placeholder="NEW TOKEN" className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-[10px] text-neutral-400 outline-none focus:border-red-500/40" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} />
             <input type="password" placeholder="VERIFY SIGNATURE" className="w-full bg-black border border-neutral-800 rounded-lg px-3 py-2 text-[10px] text-neutral-400 outline-none focus:border-red-500/40" value={formData.confirmPassword} onChange={e => setFormData({...formData, confirmPassword: e.target.value})} />
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;