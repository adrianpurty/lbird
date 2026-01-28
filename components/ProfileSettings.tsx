
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
  Target, 
  Phone, 
  Link as LinkIcon,
  Activity,
  Cpu,
  Database,
  Fingerprint,
  Zap,
  ArrowRight,
  ShieldAlert
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
  const [telemetry, setTelemetry] = useState({
    ip: user.ipAddress || 'Detecting...',
    device: user.deviceInfo || 'Analyzing...',
    integrity: 98.4
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchIdentity = async () => {
      let currentIp = user.ipAddress;
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
        clearTimeout(timeout);
        const data = await res.json();
        currentIp = data.ip;
      } catch (err) {
        currentIp = user.ipAddress || 'Restricted Node';
      }

      const ua = navigator.userAgent;
      let deviceType = "Desktop";
      if (/Mobi|Android/i.test(ua)) deviceType = "Mobile";
      const specs = `${deviceType} | ${navigator.platform}`;

      setTelemetry(prev => ({ ...prev, ip: currentIp, device: specs }));
    };

    fetchIdentity();
  }, [user.ipAddress]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 1.5) {
        alert("PAYLOAD REJECTED: Image exceeds 1.5MB threshold.");
        return;
      }
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
      alert("ERROR: Security tokens do not match.");
      return;
    }
    soundService.playClick(true);
    setIsSaving(true);
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
    
    onUpdate(updates);
    
    setTimeout(() => {
      setIsSaving(false);
      setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
    }, 500);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-10 pb-32 animate-in fade-in duration-700">
      
      {/* LANDSCAPE HEADER - SALES FLOOR STYLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b-2 border-neutral-900 pb-8 md:pb-12">
        <div className="relative">
          <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-4 h-12 md:h-24 bg-[#00e5ff] rounded-full blur-xl opacity-20" />
          <h2 className="text-3xl md:text-4xl font-futuristic text-white italic uppercase flex items-center gap-4 md:gap-8 text-glow">
            IDENTITY <span className="text-neutral-600 font-normal">NODE</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4 md:mt-6">
            <div className="px-3 md:px-4 py-1.5 bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-full text-[8px] md:text-[10px] font-black text-[#00e5ff] uppercase tracking-widest">AUTHENTICATED_TRADER_v4</div>
            <span className="text-[10px] md:text-[12px] text-neutral-600 font-bold uppercase tracking-widest italic shrink-0">STATE_IMMUTABLE // {user.role.toUpperCase()}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
          <div className="flex-1 md:flex-none p-4 md:p-6 bg-[#0f0f0f] border-2 border-neutral-900 rounded-[1.5rem] md:rounded-3xl shadow-2xl flex items-center gap-4 md:gap-6 group hover:border-[#00e5ff]/50 transition-all cursor-default">
            <div className="w-10 md:w-14 h-10 md:h-14 bg-[#00e5ff]/10 rounded-xl md:rounded-2xl flex items-center justify-center text-[#00e5ff] group-hover:scale-110 transition-transform shrink-0">
              {/* Fix: Removed non-existent md:size prop */}
              <ShieldCheck size={24} />
            </div>
            <div>
              <span className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest block mb-1">NODE_TRUST_Q</span>
              <span className="text-xl md:text-3xl font-tactical text-white tracking-widest leading-none text-glow">{telemetry.integrity}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* TELEMETRY HUD */}
      <div className="bg-[#0f0f0f] border border-neutral-800/60 rounded-[1.5rem] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-8 md:gap-12 overflow-x-auto scrollbar-hide w-full">
          <div className="flex flex-col shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Identity Health</span>
            <div className="text-lg md:text-xl font-black text-emerald-500/80 italic flex items-center gap-2 md:gap-3 font-tactical tracking-widest leading-none">
              <Activity size={14} className="animate-pulse" /> 100.0%_SYNC
            </div>
          </div>
          <div className="hidden md:block h-10 w-px bg-neutral-800 shrink-0" />
          <div className="flex flex-col shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Authorization</span>
            <div className="text-base md:text-lg font-black text-neutral-400 italic font-tactical tracking-widest uppercase leading-none">{user.role}</div>
          </div>
          <div className="hidden md:block h-10 w-px bg-neutral-800 shrink-0" />
          <div className="flex flex-col shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">IP_Origin</span>
            <div className="text-xs md:text-sm font-bold text-neutral-500 font-mono tracking-widest leading-none">{telemetry.ip}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-black/40 p-1.5 rounded-xl border border-neutral-800/40 shrink-0 w-full md:w-auto">
           <div className="flex flex-col items-end px-3 flex-1 md:flex-none">
             <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest">Protocol</span>
             <span className="text-[10px] font-bold text-neutral-400 font-mono uppercase tracking-widest leading-none">V4.2.0_SECURE</span>
           </div>
           <div className="h-6 w-px bg-neutral-800/60 hidden md:block" />
           <div className="px-3 flex items-center gap-2 flex-1 md:flex-none justify-center">
              <Fingerprint size={14} className="text-[#00e5ff]/40" />
              <span className="text-[10px] font-black text-[#00e5ff] uppercase tracking-widest font-tactical">ACTIVE_SESSION</span>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* LEFT COLUMN: IDENTITY & BI (Col 8) */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8 order-2 lg:order-1">
          
          {/* GENERAL INFO SECTOR */}
          <div className="bg-[#0c0c0c]/90 rounded-[2rem] md:rounded-[3rem] border-2 border-neutral-900 p-6 md:p-10 shadow-2xl relative overflow-hidden scanline-effect group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <UserIcon size={120} />
            </div>
            
            <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-8 md:mb-10 flex items-center gap-3">
              <Cpu size={14} className="text-[#00e5ff]" /> Sector_01 // Generic_Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
              <div className="space-y-3">
                <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">LEGAL_IDENTITY_STRING</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-[#00e5ff] transition-colors" size={16} />
                  <input 
                    required
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-xl md:rounded-2xl pl-12 pr-6 py-4 text-white font-bold outline-none focus:border-[#00e5ff]/60 transition-all placeholder:text-neutral-900"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">COMM_NODE_VECTOR (EMAIL)</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-[#00e5ff] transition-colors" size={16} />
                  <input 
                    type="email"
                    required
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-xl md:rounded-2xl pl-12 pr-6 py-4 text-white font-bold outline-none focus:border-[#00e5ff]/60 transition-all placeholder:text-neutral-900"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">BIOGRAPHICAL_MANIFEST</label>
              <div className="relative group">
                <FileText className="absolute left-4 top-5 text-neutral-700 group-focus-within:text-[#00e5ff] transition-colors" size={16} />
                <textarea 
                  rows={4}
                  className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl md:rounded-3xl pl-12 pr-6 py-4 text-neutral-300 outline-none focus:border-[#00e5ff]/60 transition-all resize-none italic text-sm md:text-base leading-relaxed"
                  placeholder="Document your professional market footprint..."
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* BUSINESS INTELLIGENCE SECTOR */}
          <div className="bg-[#0c0c0c]/90 rounded-[2rem] md:rounded-[3rem] border-2 border-neutral-900 p-6 md:p-10 shadow-2xl relative overflow-hidden group">
            <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-8 md:mb-10 flex items-center gap-3">
              <Briefcase size={14} className="text-[#00e5ff]" /> Sector_02 // Business_Intelligence
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
              <div className="space-y-3">
                <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">CORPORATE_ENDPOINT_URL</label>
                <div className="relative group">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-[#00e5ff] transition-colors" size={16} />
                  <input 
                    type="url"
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-xl md:rounded-2xl pl-12 pr-6 py-4 text-neutral-400 font-mono text-xs outline-none focus:border-[#00e5ff]/60 transition-all"
                    placeholder="https://hq.company.io"
                    value={formData.companyWebsite}
                    onChange={e => setFormData({...formData, companyWebsite: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">MARKET_SECTOR_FOCUS</label>
                <div className="relative group">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-[#00e5ff] transition-colors" size={16} />
                  <select 
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-xl md:rounded-2xl pl-12 pr-10 py-4 text-white font-bold outline-none focus:border-[#00e5ff]/60 transition-all appearance-none cursor-pointer uppercase text-xs tracking-widest"
                    value={formData.industryFocus}
                    onChange={e => setFormData({...formData, industryFocus: e.target.value})}
                  >
                    <option value="">GENERAL_MARKET</option>
                    {Object.values(NICHE_PROTOCOLS).flat().sort().map(niche => (
                      <option key={niche} value={niche}>{niche.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">COMM_HANDSHAKE_PROTOCOL</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Fix: Added as const to infer correct union type for method */}
                {(['email', 'phone', 'whatsapp', 'telegram'] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => { soundService.playClick(); setFormData({...formData, preferredContact: method}); }}
                    className={`py-4 rounded-xl md:rounded-2xl border-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                      formData.preferredContact === method 
                        ? 'bg-[#00e5ff] text-black border-[#00e5ff] shadow-lg shadow-[#00e5ff]/10' 
                        : 'bg-black/40 text-neutral-500 border-neutral-800 hover:border-neutral-700 hover:text-white'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SECURITY & SIGNATURE (Col 4) */}
        <div className="lg:col-span-4 space-y-6 md:space-y-8 order-1 lg:order-2">
          
          {/* PROFILE IMAGE SIGNATURE */}
          <div className="bg-[#0f0f0f] p-8 rounded-[2.5rem] border-2 border-neutral-900 text-center space-y-8 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <Zap size={80} />
            </div>
            
            <div 
              className="relative inline-block cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-4 border-neutral-800 overflow-hidden bg-black flex items-center justify-center text-neutral-700 group-hover:border-[#00e5ff]/40 transition-all shadow-2xl relative z-10">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt={formData.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={48} />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#00e5ff] text-black p-3 rounded-xl shadow-lg hover:scale-110 transition-transform z-20">
                <Camera size={18} />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
            
            <div className="relative z-10">
              <h4 className="text-xl md:text-2xl font-black text-white italic uppercase tracking-tighter leading-none">{formData.name || 'UNNAMED_NODE'}</h4>
              <p className="text-[9px] text-neutral-600 font-black uppercase tracking-widest mt-2">ACCESS_LEVEL: {user.role.toUpperCase()}</p>
            </div>

            <div className="pt-4 border-t border-neutral-800/40 relative z-10">
               <button 
                type="submit"
                disabled={isSaving}
                className="w-full py-6 md:py-8 rounded-xl md:rounded-[2.5rem] font-black text-xl md:text-2xl transition-all transform active:scale-[0.98] border-b-8 md:border-b-[12px] font-tactical italic tracking-widest bg-black text-white border-neutral-800 hover:bg-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-center gap-4"
              >
                {isSaving ? <RefreshCw className="animate-spin" size={24} /> : <Save size={24} />}
                {isSaving ? 'SYNCING...' : 'COMMIT_DATA'}
              </button>
            </div>
          </div>

          {/* SECURITY PROTOCOL SECTOR */}
          <div className="bg-[#0f0f0f] p-8 rounded-[2.5rem] border-2 border-neutral-900 space-y-6 shadow-xl">
            <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-widest flex items-center gap-3">
              <Lock size={14} className="text-red-500" /> Sector_03 // Security_Sync
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-700 uppercase tracking-widest px-1">NEW_SECURITY_TOKEN</label>
                <input 
                  type="password"
                  autoComplete="new-password"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-5 py-3 text-neutral-400 focus:border-red-500/40 outline-none transition-all placeholder:text-neutral-900"
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={e => setFormData({...formData, newPassword: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-700 uppercase tracking-widest px-1">VERIFY_TOKEN_SIGNATURE</label>
                <input 
                  type="password"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-5 py-3 text-neutral-400 focus:border-red-500/40 outline-none transition-all placeholder:text-neutral-900"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <div className="p-4 bg-red-950/10 border border-red-900/20 rounded-2xl flex items-start gap-3">
               <ShieldAlert size={14} className="text-red-500 shrink-0 mt-0.5" />
               <p className="text-[8px] text-red-900 font-bold uppercase tracking-widest leading-relaxed italic">
                 Modifying tokens triggers global logout of all secondary active nodes.
               </p>
            </div>
          </div>

          {/* PRESENCE SIGNATURE WIDGET */}
          <div className="bg-blue-500/5 border border-blue-500/10 p-6 md:p-8 rounded-[2rem] space-y-6 shadow-sm">
            <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest flex items-center gap-3 font-futuristic">
              <Globe size={14} className="text-blue-500" /> Identity_Signature
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center group/item">
                <span className="text-neutral-600 text-[9px] font-black uppercase tracking-widest">Node IP</span>
                <span className="text-emerald-500 font-black text-[10px] font-mono tracking-widest">{telemetry.ip}</span>
              </div>
              <div className="flex justify-between items-start gap-4 group/item">
                <span className="text-neutral-600 text-[9px] font-black uppercase tracking-widest whitespace-nowrap"><MonitorSmartphone size={10} /> Terminal</span>
                <span className="text-neutral-400 font-bold text-[9px] text-right break-words tracking-tighter">{telemetry.device}</span>
              </div>
              <div className="pt-3 flex justify-between items-center border-t border-blue-500/10">
                <span className="text-neutral-600 text-[9px] font-black uppercase tracking-widest">Status</span>
                <span className="text-emerald-500 font-black text-[10px] tracking-widest flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                  SECURE_HANDSHAKE
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* FOOTER DISCLOSURE */}
      <div className="bg-[#0f0f0f] border-2 border-neutral-900 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] flex items-start gap-4 md:gap-6 shadow-xl max-w-4xl mx-auto mt-8">
        {/* Fix: Removed non-existent md:size prop */}
        <Database className="text-neutral-700 shrink-0" size={20} />
        <div>
           <h4 className="text-[9px] md:text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1">DATA_PERSISTENCE_CONSENT</h4>
           <p className="text-[8px] md:text-[10px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
             By committing these updates, you certify that the identity signature is accurate and compliant with the LeadBid transparency framework. Profile metadata is indexed for market routing and behavioral telemetry auditing.
           </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
