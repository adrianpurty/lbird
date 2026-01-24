import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Mail, User as UserIcon, Lock, Camera, Save, RefreshCw, FileText, Globe, MonitorSmartphone, Briefcase, MessageSquare, Target, Phone } from 'lucide-react';
import { User } from '../types';
import { NICHE_PROTOCOLS } from '../services/apiService';

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
    preferredContact: user.preferredContact || 'email'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [telemetry, setTelemetry] = useState({
    ip: user.ipAddress || 'Detecting...',
    device: user.deviceInfo || 'Analyzing...'
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

      setTelemetry({ ip: currentIp, device: specs });
    };

    fetchIdentity();
  }, [user.ipAddress]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 1.5) {
        alert("PAYLOAD REJECTED: Image exceeds 1.5MB efficiency threshold.");
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
    setIsSaving(true);
    const updates: Partial<User> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      bio: formData.bio,
      profileImage: formData.profileImage,
      companyWebsite: formData.companyWebsite,
      industryFocus: formData.industryFocus,
      preferredContact: formData.preferredContact as any
    };
    if (formData.newPassword) updates.password = formData.newPassword;
    onUpdate(updates);
    setTimeout(() => {
      setIsSaving(false);
      setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 optimize-gpu">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-[var(--text-main)] uppercase tracking-tighter italic flex items-center gap-3">
            <UserIcon className="text-[var(--text-accent)]" /> Identity Management
          </h2>
          <p className="text-neutral-500 text-sm font-medium mt-1">Configure your public profile and account security protocols.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-main)] shadow-2xl space-y-6">
            <h3 className="text-xs font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <ShieldCheck size={14} className="text-[var(--text-accent)]" /> General Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Display Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={16} />
                  <input 
                    className="w-full bg-black/5 dark:bg-black border border-[var(--border-main)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-main)] focus:border-[var(--text-accent)] outline-none transition-all"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={16} />
                  <input 
                    type="email"
                    className="w-full bg-black/5 dark:bg-black border border-[var(--border-main)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-main)] focus:border-[var(--text-accent)] outline-none transition-all"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Contact Token (Phone)</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={16} />
                  <input 
                    type="tel"
                    className="w-full bg-black/5 dark:bg-black border border-[var(--border-main)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-main)] focus:border-[var(--text-accent)] outline-none transition-all"
                    placeholder="+1 555-000-0000"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Professional Bio</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 text-neutral-700" size={16} />
                <textarea 
                  rows={4}
                  className="w-full bg-black/5 dark:bg-black border border-[var(--border-main)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-main)] focus:border-[var(--text-accent)] outline-none transition-all resize-none"
                  placeholder="Describe your market footprint..."
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-main)] shadow-2xl space-y-6">
            <h3 className="text-xs font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <Briefcase size={14} className="text-[var(--text-accent)]" /> Business Intelligence
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Company Website</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={16} />
                  <input 
                    type="url"
                    placeholder="https://company.com"
                    className="w-full bg-black/5 dark:bg-black border border-[var(--border-main)] rounded-xl pl-12 pr-4 py-3 text-[var(--text-main)] focus:border-[var(--text-accent)] outline-none transition-all"
                    value={formData.companyWebsite}
                    onChange={e => setFormData({...formData, companyWebsite: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Industry Focus</label>
                <div className="relative">
                  <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={16} />
                  <select 
                    className="w-full bg-black/5 dark:bg-black border border-[var(--border-main)] rounded-xl pl-12 pr-4 py-3.5 text-[var(--text-main)] focus:border-[var(--text-accent)] outline-none transition-all appearance-none"
                    value={formData.industryFocus}
                    onChange={e => setFormData({...formData, industryFocus: e.target.value})}
                  >
                    <option value="">General Marketplace</option>
                    {Object.values(NICHE_PROTOCOLS).flat().sort().map(niche => (
                      <option key={niche} value={niche}>{niche}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Preferred Contact Method</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['email', 'phone', 'whatsapp', 'telegram'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setFormData({...formData, preferredContact: method})}
                    className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                      formData.preferredContact === method 
                        ? 'bg-[var(--text-accent)] text-black border-[var(--text-accent)]' 
                        : 'bg-black/5 dark:bg-black text-neutral-500 border-[var(--border-main)] hover:border-[var(--text-accent)]/40'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-main)] shadow-2xl space-y-6">
            <h3 className="text-xs font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <Lock size={14} className="text-red-500" /> Security Protocol
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">New Token</label>
                <input 
                  type="password"
                  autoComplete="new-password"
                  className="w-full bg-black/5 dark:bg-black border border-[var(--border-main)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:border-red-500/50 outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={e => setFormData({...formData, newPassword: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Verify Token</label>
                <input 
                  type="password"
                  className="w-full bg-black/5 dark:bg-black border border-[var(--border-main)] rounded-xl px-4 py-3 text-[var(--text-main)] focus:border-red-500/50 outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[var(--bg-card)] p-8 rounded-[2.5rem] border border-[var(--border-main)] shadow-2xl text-center space-y-6">
            <div 
              className="relative inline-block group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-32 h-32 rounded-full border-4 border-neutral-800 overflow-hidden bg-neutral-900 flex items-center justify-center text-neutral-700 group-hover:border-[var(--text-accent)]/50 transition-all">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt={formData.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={48} />
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-[var(--text-accent)] text-black p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                <Camera size={16} />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            </div>
            <div>
              <h4 className="text-[var(--text-main)] font-black text-lg italic">{formData.name || 'Trader Identity'}</h4>
              <p className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em]">{user.role} Authorization</p>
            </div>
            <div className="pt-4 border-t border-[var(--border-main)]">
               <button 
                type="submit"
                disabled={isSaving}
                className="w-full bg-[var(--text-accent)] text-black py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl shadow-yellow-400/10 border-b-4 border-[var(--text-accent)]/70 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                {isSaving ? 'SYNCING...' : 'COMMIT CHANGES'}
              </button>
            </div>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-3xl space-y-4">
            <h4 className="text-[var(--text-main)] font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <Globe size={14} className="text-blue-500" /> Identity Signature
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-neutral-500 text-[9px] font-black uppercase flex items-center gap-1.5">Node IP</span>
                <span className="text-emerald-500 font-black text-[10px] font-mono animate-in fade-in">{telemetry.ip}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-neutral-500 text-[9px] font-black uppercase flex items-center gap-1.5 whitespace-nowrap"><MonitorSmartphone size={10} /> Terminal</span>
                <span className="text-neutral-400 font-bold text-[9px] text-right break-words">{telemetry.device}</span>
              </div>
              <div className="pt-2 flex justify-between items-center border-t border-blue-500/10">
                <span className="text-neutral-500 text-[9px] font-black uppercase flex items-center gap-1.5"><ShieldCheck size={10} /> Status</span>
                <span className="text-emerald-500 font-bold text-[10px]">SECURE HANDSHAKE</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;