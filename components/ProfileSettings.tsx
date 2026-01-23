
import React, { useState, useRef } from 'react';
import { ShieldCheck, Mail, User as UserIcon, Lock, Camera, Save, RefreshCw, FileText } from 'lucide-react';
import { User } from '../types';

interface ProfileSettingsProps {
  user: User;
  onUpdate: (updatedUser: Partial<User>) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    bio: user.bio || '',
    profileImage: user.profileImage || '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024 * 2) {
        alert("IMAGE TOO LARGE: Maximum size is 2MB.");
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
      alert("ERROR: Passwords do not match.");
      return;
    }

    setIsSaving(true);
    
    const updates: Partial<User> = {
      name: formData.name,
      email: formData.email,
      bio: formData.bio,
      profileImage: formData.profileImage
    };
    
    if (formData.newPassword) {
      updates.password = formData.newPassword;
    }

    // Pass updates to parent which handles backend persistence
    onUpdate(updates);
    
    // Simulate short delay for UI feedback
    setTimeout(() => {
      setIsSaving(false);
      alert("IDENTITY SYNCHRONIZED: Your credentials have been committed to the secure ledger.");
      setFormData(prev => ({ ...prev, newPassword: '', confirmPassword: '' }));
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
            <UserIcon className="text-[#facc15]" /> Identity Management
          </h2>
          <p className="text-neutral-500 text-sm font-medium mt-1">Configure your public profile and account security protocols.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Identity Section */}
          <div className="bg-[#121212] p-8 rounded-[2.5rem] border border-neutral-900 shadow-2xl space-y-6">
            <h3 className="text-xs font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#facc15]" /> General Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Display Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={16} />
                  <input 
                    className="w-full bg-black border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[#facc15] outline-none transition-all"
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
                    className="w-full bg-black border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[#facc15] outline-none transition-all"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
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
                  className="w-full bg-black border border-neutral-800 rounded-xl pl-12 pr-4 py-3 text-white focus:border-[#facc15] outline-none transition-all resize-none"
                  placeholder="Tell other traders about your business..."
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-[#121212] p-8 rounded-[2.5rem] border border-neutral-900 shadow-2xl space-y-6">
            <h3 className="text-xs font-black text-neutral-600 uppercase tracking-[0.3em] flex items-center gap-2">
              <Lock size={14} className="text-red-500" /> Security Protocol
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">New Password</label>
                <input 
                  type="password"
                  autoComplete="new-password"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-red-500/50 outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.newPassword}
                  onChange={e => setFormData({...formData, newPassword: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Confirm New Password</label>
                <input 
                  type="password"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:border-red-500/50 outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>
            <p className="text-[9px] text-neutral-600 font-black uppercase tracking-widest italic">
              Leave password fields empty if you do not wish to change your current credentials.
            </p>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#121212] p-8 rounded-[2.5rem] border border-neutral-900 shadow-2xl text-center space-y-6">
            <div 
              className="relative inline-block group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-32 h-32 rounded-full border-4 border-neutral-800 overflow-hidden bg-neutral-900 flex items-center justify-center text-neutral-700 group-hover:border-[#facc15]/50 transition-all">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt={formData.name} className="w-full h-full object-cover" />
                ) : (
                  <UserIcon size={48} />
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-[#facc15] text-black p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                <Camera size={16} />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleImageUpload}
              />
            </div>
            <div>
              <h4 className="text-white font-black text-lg">{formData.name || 'Trader Identity'}</h4>
              <p className="text-[9px] text-neutral-600 font-black uppercase tracking-[0.2em]">{user.role} Account</p>
            </div>
            <div className="pt-4 border-t border-neutral-800/50">
               <button 
                type="submit"
                disabled={isSaving}
                className="w-full bg-[#facc15] text-black py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-xl shadow-yellow-400/10 border-b-4 border-yellow-600 disabled:opacity-50"
              >
                {isSaving ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                {isSaving ? 'SYNCING...' : 'COMMIT CHANGES'}
              </button>
            </div>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 p-6 rounded-3xl space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest">Account Status</h4>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500 text-[10px] font-black uppercase">Verified</span>
              <span className="text-emerald-500 font-bold text-[10px]">YES</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500 text-[10px] font-black uppercase">Escrow Enabled</span>
              <span className="text-emerald-500 font-bold text-[10px]">ACTIVE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-500 text-[10px] font-black uppercase">2FA Gateway</span>
              <span className="text-[#facc15] font-bold text-[10px]">CONFIGURED</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
