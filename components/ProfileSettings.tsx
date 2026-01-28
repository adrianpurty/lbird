import React, { useState, useRef } from 'react';
import { 
  ShieldCheck, User as UserIcon, Camera, Save, RefreshCw, Cpu, Activity, Fingerprint, 
  Zap, CheckCircle2, Circle, Phone, Mail, Briefcase, Lock, MessageSquare, Smartphone, 
  MessageCircle, Send, Radio, Scan
} from 'lucide-react';
import { User } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface ProfileSettingsProps {
  user: User;
  onUpdate: (updatedUser: Partial<User>) => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState<User>({ 
    ...user, 
    biometricEnabled: user.biometricEnabled || false,
    preferredContact: user.preferredContact || 'email',
    phone: user.phone || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playClick(true);
    setIsSaving(true);
    onUpdate(formData);
    setTimeout(() => setIsSaving(false), 1000);
  };

  const contactOptions = [
    { id: 'email', icon: Mail, label: 'EMAIL' },
    { id: 'phone', icon: Phone, label: 'VOICE' },
    { id: 'whatsapp', icon: MessageCircle, label: 'WHATSAPP' },
    { id: 'telegram', icon: Send, label: 'TELEGRAM' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* HUD HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-2 border-white/5 pb-10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="relative">
          <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-4 h-24 bg-emerald-500 rounded-full blur-xl opacity-20" />
          <h1 className="text-4xl md:text-6xl font-futuristic text-white italic uppercase tracking-tighter leading-none">
            IDENTITY <span className="text-neutral-500 font-normal">NODE</span>
          </h1>
          <div className="flex items-center gap-6 mt-4">
             <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                <Scan size={12} className="animate-pulse" /> AUTH_LEVEL_ROOT
             </div>
             <span className="text-[11px] text-neutral-600 font-bold uppercase tracking-widest italic">ENCRYPTED_ID_STREAM_v4.8</span>
          </div>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
           <div className="flex-1 md:flex-none bg-[#0c0c0c] border border-white/10 p-5 rounded-[2rem] flex items-center justify-between gap-10 shadow-2xl">
              <div>
                 <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-0.5">VAULT_BALANCE</span>
                 <span className="text-2xl font-tactical text-emerald-500 italic tracking-widest leading-none">${user.balance.toLocaleString()}</span>
              </div>
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                 <Activity size={20} className="animate-pulse" />
              </div>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT SECTOR: CORE & CONTACT */}
        <div className="lg:col-span-8 space-y-8">
           
           {/* CORE IDENTITY MODULE */}
           <div className="bg-gradient-to-br from-[#0f0f0f] via-black to-black border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                 <UserIcon size={180} />
              </div>
              <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em] mb-10 flex items-center gap-4 italic relative z-10">
                 <div className="w-1 h-4 bg-[#00e5ff] rounded-full" /> CORE_IDENTITY_MANIFEST
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">LEGAL_IDENTITY_STRING</label>
                    <div className="relative group/input">
                       <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within/input:text-[#00e5ff] transition-colors" size={16} />
                       <input 
                         required
                         className="w-full bg-black/60 border-2 border-neutral-900 rounded-2xl pl-12 pr-6 py-4 text-white text-sm font-bold outline-none focus:border-[#00e5ff]/40 transition-all shadow-inner" 
                         value={formData.name} 
                         onChange={e => setFormData({...formData, name: e.target.value})} 
                       />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">COMM_VECTOR_PRIMARY</label>
                    <div className="relative group/input">
                       <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within/input:text-[#00e5ff] transition-colors" size={16} />
                       <input 
                         required
                         className="w-full bg-black/60 border-2 border-neutral-900 rounded-2xl pl-12 pr-6 py-4 text-white text-sm font-bold outline-none focus:border-[#00e5ff]/40 transition-all shadow-inner" 
                         value={formData.email} 
                         onChange={e => setFormData({...formData, email: e.target.value})} 
                       />
                    </div>
                 </div>
              </div>
           </div>

           {/* CONTACT PROTOCOLS MODULE */}
           <div className="bg-gradient-to-br from-[#0f0f0f] via-black to-black border border-white/5 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
              <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em] mb-10 flex items-center gap-4 italic">
                 <div className="w-1 h-4 bg-emerald-500 rounded-full" /> COMMUNICATION_PROTOCOLS
              </h3>

              <div className="space-y-10">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">MOBILE_TERMINAL_NODE</label>
                       <div className="relative group/input">
                          <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within/input:text-emerald-500 transition-colors" size={16} />
                          <input 
                            placeholder="+1 (000) 000-0000"
                            className="w-full bg-black/60 border-2 border-neutral-900 rounded-2xl pl-12 pr-6 py-4 text-white text-sm font-bold outline-none focus:border-emerald-500/40 transition-all shadow-inner" 
                            value={formData.phone} 
                            onChange={e => setFormData({...formData, phone: e.target.value})} 
                          />
                       </div>
                    </div>
                    
                    <div className="space-y-3">
                       <label className="text-[9px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">PREHIBITED_SYNC_VECTOR</label>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {contactOptions.map(opt => (
                             <button
                               key={opt.id}
                               type="button"
                               onClick={() => { soundService.playClick(); setFormData({...formData, preferredContact: opt.id as any}); }}
                               className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all gap-2 active:scale-95 ${
                                 formData.preferredContact === opt.id 
                                   ? 'bg-emerald-500/10 border-emerald-500/60 text-emerald-400 shadow-glow-sm' 
                                   : 'bg-black border-neutral-900 text-neutral-600 hover:border-neutral-700'
                               }`}
                             >
                                <opt.icon size={16} />
                                <span className="text-[7px] font-black tracking-widest uppercase">{opt.label}</span>
                             </button>
                          ))}
                       </div>
                    </div>
                 </div>

                 <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl flex items-start gap-4">
                    <ShieldCheck className="text-emerald-500 shrink-0" size={18} />
                    <p className="text-[9px] text-neutral-500 leading-relaxed uppercase font-bold tracking-widest">
                       All automated lead notifications and system alerts will be broadcasted via the selected primary synchronization vector. Ensure the terminal node is active for real-time arbitrage updates.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        {/* RIGHT SECTOR: SECURITY & IMAGE */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* BIOMETRIC LOGIC MODULE (Touch optimized radio) */}
           <div className="bg-gradient-to-br from-[#0f0f0f] via-black to-black border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
              <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em] mb-10 flex items-center gap-4 italic relative z-10">
                 <div className="w-1 h-4 bg-red-500 rounded-full" /> SECURITY_VALVE
              </h3>

              <div className="flex flex-col items-center gap-8 relative z-10">
                 <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center transition-all duration-700 ${formData.biometricEnabled ? 'bg-emerald-500 text-black shadow-glow' : 'bg-neutral-900 text-neutral-700 shadow-inner border border-white/5'}`}>
                    <Fingerprint size={48} className={formData.biometricEnabled ? 'animate-pulse' : ''} />
                 </div>
                 
                 <div className="w-full space-y-6">
                    <div className="text-center">
                       <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">BIOMETRIC_HANDSHAKE</h4>
                       <p className="text-[8px] text-neutral-600 font-bold uppercase tracking-widest">Hardware-Level Node Access</p>
                    </div>

                    <div className="flex bg-black p-1.5 rounded-2xl border-2 border-neutral-900">
                       <button 
                         type="button"
                         onClick={() => { soundService.playClick(); setFormData({...formData, biometricEnabled: true}); }}
                         className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${formData.biometricEnabled ? 'bg-emerald-600 text-white shadow-lg' : 'text-neutral-700 hover:text-neutral-500'}`}
                       >
                          PROTOCOL_ON
                       </button>
                       <button 
                         type="button"
                         onClick={() => { soundService.playClick(); setFormData({...formData, biometricEnabled: false}); }}
                         className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${!formData.biometricEnabled ? 'bg-red-700 text-white shadow-lg' : 'text-neutral-700 hover:text-neutral-500'}`}
                       >
                          PROTOCOL_OFF
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           {/* IMAGE & COMMIT MODULE */}
           <div className="bg-gradient-to-br from-[#0f0f0f] via-black to-black border border-white/5 rounded-[3rem] p-10 shadow-2xl flex flex-col items-center space-y-10 relative overflow-hidden group">
              <div className="relative cursor-pointer group/avatar" onClick={() => fileInputRef.current?.click()}>
                 <div className="w-32 h-32 rounded-[3.5rem] border-4 border-neutral-900 bg-black overflow-hidden flex items-center justify-center text-neutral-800 shadow-2xl transition-all duration-500 group-hover/avatar:border-[#00e5ff]/50 group-hover/avatar:scale-105">
                    {formData.profileImage ? <img src={formData.profileImage} className="w-full h-full object-cover" alt="Identity" /> : <UserIcon size={48} />}
                 </div>
                 <div className="absolute -bottom-2 -right-2 bg-white text-black p-3 rounded-2xl shadow-2xl border-4 border-black group-hover/avatar:bg-[#00e5ff] transition-colors">
                    <Camera size={20} />
                 </div>
                 <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setFormData(p => ({ ...p, profileImage: reader.result as string }));
                      reader.readAsDataURL(file);
                    }
                 }} />
              </div>

              <div className="w-full space-y-4">
                 <button 
                   type="submit" 
                   disabled={isSaving} 
                   className="w-full py-6 bg-white text-black rounded-[2rem] font-black text-xl italic font-tactical tracking-widest border-b-[8px] border-neutral-300 hover:bg-[#00e5ff] active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-5 shadow-2xl group/btn"
                 >
                    {isSaving ? <RefreshCw size={24} className="animate-spin" /> : <Save size={24} className="group-hover/btn:scale-110 transition-transform" />} 
                    COMMIT_IDENTITY_SYNC
                 </button>
                 
                 <div className="text-center">
                    <span className="text-[7px] text-neutral-700 font-black uppercase tracking-[0.4em]">Node_State: Finalized_and_Ready</span>
                 </div>
              </div>
           </div>

        </div>
      </form>

      <style>{`
        .shadow-glow {
          box-shadow: 0 0 30px rgba(16, 185, 129, 0.4);
        }
        .shadow-glow-sm {
          box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
        }
        .font-tactical { font-family: 'Teko', sans-serif; }
      `}</style>
    </div>
  );
};

export default ProfileSettings;
