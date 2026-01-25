
import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  User as UserIcon, 
  Lock, 
  Camera, 
  Save, 
  RefreshCw, 
  FileText, 
  Globe, 
  MonitorSmartphone, 
  Briefcase, 
  MessageSquare, 
  Target, 
  Phone, 
  Link as LinkIcon,
  Activity,
  Zap,
  Fingerprint,
  Database,
  Cpu,
  ShieldAlert,
  ArrowRight
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
    defaultTargetUrl: user.defaultTargetUrl || ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [syncProgress, setSyncProgress] = useState(100);
  const [telemetry, setTelemetry] = useState({
    ip: user.ipAddress || '0.0.0.0',
    device: user.deviceInfo || 'ANALYZING...',
    reputation: 98.4
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const detectNode = async () => {
      let currentIp = user.ipAddress;
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        currentIp = data.ip;
      } catch (err) {
        currentIp = 'LOCAL_HOST';
      }
      
      const ua = navigator.userAgent;
      const platform = navigator.platform;
      setTelemetry(prev => ({ ...prev, ip: currentIp || '0.0.0.0', device: `${platform} // ${ua.split(') ')[0].split('(')[1]}` }));
    };
    detectNode();
  }, [user.ipAddress]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      soundService.playClick(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      soundService.playClick(false);
      alert("HANDSHAKE_ERROR: SECURITY_TOKENS_MISMATCH");
      return;
    }
    
    setIsSaving(true);
    setSyncProgress(20);
    soundService.playClick(true);
    
    const updates: Partial<User> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      profileImage: formData.profileImage,
      companyWebsite: formData.companyWebsite,
      industryFocus: formData.industryFocus,
      preferredContact: formData.preferredContact as any,
      defaultBusinessUrl: formData.defaultBusinessUrl,
      defaultTargetUrl: formData.defaultTargetUrl
    };
    
    if (formData.newPassword) updates.password = formData.newPassword;

    // Simulation of data commitment
    const timer = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          onUpdate(updates);
          setIsSaving(false);
          return 100;
        }
        return prev + 15;
      });
    }, 100);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-700 pb-32">
      
      {/* LANDSCAPE HEADER - TACTICAL HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-2 border-neutral-900 pb-8">
        <div className="relative">
          <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-4 h-12 md:h-24 bg-[#FACC15] rounded-full blur-xl opacity-10" />
          <h2 className="text-3xl md:text-5xl font-futuristic font-black text-white italic uppercase tracking-tighter leading-none">
            IDENTITY <span className="text-[#FACC15]">NODE</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4">
            <div className="px-3 py-1 bg-[#FACC15]/10 border border-[#FACC15]/30 rounded-full text-[8px] md:text-[10px] font-black text-[#FACC15] uppercase tracking-[0.4em]">PRO_ACCOUNT_V4</div>
            <span className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.4em] italic flex items-center gap-2">
              <Activity size={12} className="text-emerald-500 animate-pulse" /> SYNC_STABLE // 0.02ms
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-[#1A1A1A] border-2 border-white/5 rounded-3xl p-4 md:p-6 shadow-2xl">
          <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center text-[#FACC15]">
            <Fingerprint size={20} />
          </div>
          <div>
            <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest block mb-1">REPUTATION_SCORE</span>
            <div className="flex items-center gap-3">
              <span className="text-xl font-tactical text-white tracking-widest leading-none">{telemetry.reputation}%</span>
              <div className="w-24 h-1.5 bg-black rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: `${telemetry.reputation}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN: IDENTITY SIGNATURE (Col 3) */}
        <div className="lg:col-span-3 space-y-6 flex flex-col">
          <div className="bg-black p-8 rounded-[3rem] border border-[#1A1A1A] flex flex-col items-center text-center shadow-2xl relative overflow-hidden group flex-1">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <UserIcon size={120} />
            </div>

            <div 
              className="relative cursor-pointer group/avatar"
              onClick={() => { soundService.playClick(true); fileInputRef.current?.click(); }}
            >
              <div className="w-40 h-40 rounded-[2.5rem] border-4 border-neutral-800 p-2 overflow-hidden bg-black transition-all group-hover/avatar:border-[#FACC15]/50 group-hover/avatar:rotate-2 shadow-2xl">
                {formData.profileImage ? (
                  <img src={formData.profileImage} className="w-full h-full object-cover rounded-[1.8rem] grayscale group-hover/avatar:grayscale-0 transition-all" alt="Avatar" />
                ) : (
                  <div className="w-full h-full bg-[#1A1A1A] flex items-center justify-center text-neutral-800">
                    <UserIcon size={64} />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#FACC15] text-black p-3 rounded-2xl shadow-xl group-hover/avatar:scale-110 transition-transform border-4 border-black">
                <Camera size={20} />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>

            <div className="mt-8 space-y-2">
              <h3 className="text-2xl font-black text-white italic font-futuristic tracking-tighter">{formData.name || 'ANON_TRADER'}</h3>
              <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.3em]">NODE_IDENTIFIER: {user.id.slice(0, 8)}</p>
            </div>

            <div className="w-full mt-10 space-y-4 pt-8 border-t border-[#1A1A1A]">
               <div className="flex justify-between items-center px-2">
                  <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">NETWORK_SYNC</span>
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">{syncProgress}%</span>
               </div>
               <div className="w-full h-1 bg-neutral-900 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-500 ${isSaving ? 'bg-[#FACC15] animate-pulse' : 'bg-emerald-500'}`} style={{ width: `${syncProgress}%` }} />
               </div>
            </div>

            <div className="mt-auto pt-10 space-y-3 w-full">
              <div className="bg-[#1A1A1A]/40 p-4 rounded-2xl border border-white/5 flex items-center justify-between group/item hover:border-[#FACC15]/20 transition-all">
                <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest flex items-center gap-2">
                  <Globe size={12} className="text-[#FACC15]" /> Node_IP
                </span>
                <span className="text-[10px] font-mono text-neutral-400">{telemetry.ip}</span>
              </div>
              <div className="bg-[#1A1A1A]/40 p-4 rounded-2xl border border-white/5 flex flex-col gap-2 group/item hover:border-[#FACC15]/20 transition-all">
                <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest flex items-center gap-2">
                  <MonitorSmartphone size={12} className="text-[#FACC15]" /> Signature
                </span>
                <span className="text-[8px] font-mono text-neutral-500 text-left line-clamp-1">{telemetry.device}</span>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: DATA TERMINAL (Col 6) */}
        <div className="lg:col-span-6 space-y-8">
          <div className="bg-black rounded-[3rem] border-2 border-[#1A1A1A] p-8 md:p-12 shadow-2xl relative overflow-hidden scanline-effect group">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <Database size={120} />
            </div>

            <div className="space-y-10">
               <div className="flex items-center gap-4 border-b border-[#1A1A1A] pb-6">
                 <div className="w-10 h-10 bg-[#FACC15]/10 rounded-xl flex items-center justify-center text-[#FACC15]">
                   <UserIcon size={20} />
                 </div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tight italic">DATA_NODE_GENERAL</h3>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] px-2 italic">Legal_Entity_Name</label>
                     <input 
                      className="w-full bg-black border-2 border-neutral-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#FACC15]/40 transition-all placeholder:text-neutral-900"
                      value={formData.name}
                      onChange={e => { soundService.playClick(); setFormData({...formData, name: e.target.value}); }}
                     />
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] px-2 italic">Contact_Vector</label>
                     <input 
                      type="email"
                      className="w-full bg-black border-2 border-neutral-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#FACC15]/40 transition-all placeholder:text-neutral-900"
                      value={formData.email}
                      onChange={e => { soundService.playClick(); setFormData({...formData, email: e.target.value}); }}
                     />
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] px-2 italic flex items-center gap-2">
                    <MessageSquare size={14} className="text-[#FACC15]" /> Professional_Payload (Bio)
                  </label>
                  <textarea 
                    rows={4}
                    className="w-full bg-black border-2 border-neutral-800 rounded-[2rem] px-8 py-6 text-neutral-400 font-bold outline-none focus:border-[#FACC15]/40 transition-all resize-none italic"
                    placeholder="ESTABLISH MARKET FOOTPRINT..."
                    value={formData.bio}
                    onChange={e => { soundService.playClick(); setFormData({...formData, bio: e.target.value}); }}
                  />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] px-2 italic">Industry_Sector</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-black border-2 border-neutral-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#FACC15]/40 transition-all appearance-none cursor-pointer uppercase text-xs tracking-widest font-tactical"
                        value={formData.industryFocus}
                        onChange={e => { soundService.playClick(); setFormData({...formData, industryFocus: e.target.value}); }}
                      >
                        <option value="">SELECT_PROTOCOL</option>
                        {Object.values(NICHE_PROTOCOLS).flat().sort().map(niche => (
                          <option key={niche} value={niche}>{niche}</option>
                        ))}
                      </select>
                      <Target size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-700 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] px-2 italic">Comms_Node (Phone)</label>
                     <input 
                      className="w-full bg-black border-2 border-neutral-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#FACC15]/40 transition-all placeholder:text-neutral-900"
                      placeholder="+1 000 000 0000"
                      value={formData.phone}
                      onChange={e => { soundService.playClick(); setFormData({...formData, phone: e.target.value}); }}
                     />
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-[#1A1A1A] border border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-xl">
             <div className="flex items-center gap-4 mb-8">
               <div className="w-10 h-10 bg-black/40 rounded-xl flex items-center justify-center text-[#FACC15]">
                 <Briefcase size={20} />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tight italic">BUSINESS_LOGIC_DEFAULTS</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] px-2 italic">Origin_Business_URL</label>
                   <div className="relative">
                      <Globe size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700" />
                      <input 
                        type="url"
                        className="w-full bg-black border border-[#1A1A1A] rounded-2xl pl-12 pr-6 py-4 text-[#FACC15] font-mono text-xs outline-none focus:border-[#FACC15]/50 transition-all"
                        placeholder="https://hq.node.com"
                        value={formData.defaultBusinessUrl}
                        onChange={e => setFormData({...formData, defaultBusinessUrl: e.target.value})}
                      />
                   </div>
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] px-2 italic">Target_Provision_API</label>
                   <div className="relative">
                      <Target size={14} className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700" />
                      <input 
                        type="url"
                        className="w-full bg-black border border-[#1A1A1A] rounded-2xl pl-12 pr-6 py-4 text-[#FACC15] font-mono text-xs outline-none focus:border-[#FACC15]/50 transition-all"
                        placeholder="https://leads.crm-target.io"
                        value={formData.defaultTargetUrl}
                        onChange={e => setFormData({...formData, defaultTargetUrl: e.target.value})}
                      />
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SECURITY & COMMITS (Col 3) */}
        <div className="lg:col-span-3 space-y-8 flex flex-col">
          <div className="bg-black p-8 rounded-[3rem] border border-[#1A1A1A] shadow-2xl flex flex-col flex-1 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <Lock size={120} />
            </div>

            <div className="flex items-center gap-4 border-b border-[#1A1A1A] pb-6 mb-8">
               <div className="w-10 h-10 bg-red-950/20 rounded-xl flex items-center justify-center text-red-500">
                 <ShieldAlert size={20} />
               </div>
               <h3 className="text-xl font-black text-white uppercase tracking-tight italic">SECURITY_NODE</h3>
            </div>

            <div className="space-y-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2">New_Access_Token</label>
                  <input 
                    type="password"
                    className="w-full bg-black border-2 border-neutral-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-red-500/40 transition-all"
                    placeholder="••••••••"
                    value={formData.newPassword}
                    onChange={e => setFormData({...formData, newPassword: e.target.value})}
                  />
               </div>
               <div className="space-y-3">
                  <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2">Verify_Token</label>
                  <input 
                    type="password"
                    className="w-full bg-black border-2 border-neutral-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-red-500/40 transition-all"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  />
               </div>
            </div>

            <div className="mt-10 p-6 bg-[#1A1A1A]/40 rounded-[2rem] border border-white/5 space-y-4">
               <div className="flex items-center gap-3 text-emerald-500">
                  <ShieldCheck size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">ENCRYPTION_AES_256</span>
               </div>
               <p className="text-[9px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
                 ALL_IDENTITY_CHANGES_ARE_FINALIZED_ON_THE_GLOBAL_LEDGER. TRACE_LOGS_ENABLED.
               </p>
            </div>

            <div className="mt-auto pt-10">
               <button 
                type="submit"
                disabled={isSaving}
                className={`w-full py-6 rounded-[2rem] font-black text-2xl uppercase italic tracking-widest transition-all border-b-8 active:border-b-0 active:translate-y-2 shadow-2xl font-tactical flex items-center justify-center gap-4 ${
                  isSaving 
                    ? 'bg-neutral-800 text-neutral-600 border-black animate-pulse' 
                    : 'bg-[#FACC15] text-black border-yellow-800 hover:bg-white'
                }`}
              >
                {isSaving ? <LoaderIcon /> : <><Save size={24} /> COMMIT_SYNC</>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const LoaderIcon = () => (
  <div className="flex items-center gap-3">
    <RefreshCw size={24} className="animate-spin" />
    <span>SYNCING...</span>
  </div>
);

export default ProfileSettings;
