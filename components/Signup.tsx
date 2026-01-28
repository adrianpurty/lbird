
import React, { useState } from 'react';
import { 
  Zap, 
  Mail, 
  User as UserIcon, 
  Lock, 
  Loader2, 
  Globe,
  Facebook,
  AlertTriangle,
  Fingerprint,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Database
} from 'lucide-react';
import { User, OAuthConfig } from '../types.ts';
import { authService } from '../services/authService.ts';
import { soundService } from '../services/soundService.ts';

interface SignupProps {
  onSignup: (user: User) => void;
  onSwitchToLogin: () => void;
  authConfig?: OAuthConfig;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onSwitchToLogin, authConfig }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playClick(true);
    setIsSyncing(true);
    setError('');
    try {
      const newUser = await authService.signUp(
        formData.email, 
        formData.password, 
        formData.name
      );
      onSignup(newUser);
    } catch (err: any) {
      setError(err.message || "Registration Failed");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden scanline grid-bg">
      <div className="ps5-bg">
        <div className="ps5-liquid" />
        <div className="ps5-liquid-2" />
      </div>

      <div className="w-full max-w-[440px] mx-auto z-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* BRANDING HUB */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] border border-white/20 mb-4 transition-transform hover:scale-105 duration-500">
            <Zap className="text-black fill-black" size={28} />
          </div>
          <h1 className="text-2xl font-futuristic text-white tracking-[0.3em] uppercase italic">
            LEAD<span className="text-neutral-500">BID</span> PRO
          </h1>
          <p className="text-[7px] text-neutral-600 font-black uppercase tracking-[0.5em] mt-2 italic">PROVISIONING_NEW_DATA_NODE</p>
        </div>

        {/* REGISTRATION TERMINAL */}
        <div className="bg-[#0c0c0c]/80 backdrop-blur-2xl border border-neutral-800 rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
            <ShieldCheck size={80} />
          </div>

          <div className="mb-8 flex items-center justify-between border-b border-neutral-900 pb-4">
            <div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-widest leading-none">SIGN_UP</h2>
              <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                <Cpu size={10} className="text-[#00e5ff]" /> Network_Entry_v4.2
              </p>
            </div>
            <div className="w-2 h-2 bg-[#00e5ff] rounded-full animate-pulse shadow-[0_0_10px_#00e5ff]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-neutral-700 uppercase tracking-[0.2em] px-1 italic">LEGAL_IDENTITY</label>
                <div className="relative group/input">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-800 group-focus-within/input:text-[#00e5ff] transition-colors" size={14} />
                  <input 
                    required
                    className="w-full bg-black/40 border border-neutral-800 rounded-xl pl-12 pr-6 py-3.5 text-white text-xs outline-none focus:border-[#00e5ff]/40 transition-all font-bold placeholder:text-neutral-800" 
                    placeholder="DISPLAY_NAME_OR_ORG" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-neutral-700 uppercase tracking-[0.2em] px-1 italic">COMM_VECTOR</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-800 group-focus-within/input:text-[#00e5ff] transition-colors" size={14} />
                  <input 
                    required 
                    type="email"
                    className="w-full bg-black/40 border border-neutral-800 rounded-xl pl-12 pr-6 py-3.5 text-white text-xs outline-none focus:border-[#00e5ff]/40 transition-all font-bold placeholder:text-neutral-800" 
                    placeholder="EMAIL_ADDRESS_HASH" 
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-neutral-700 uppercase tracking-[0.2em] px-1 italic">CRYPTOGRAPHIC_SALT</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-800 group-focus-within/input:text-[#00e5ff] transition-colors" size={14} />
                  <input 
                    required 
                    type="password" 
                    className="w-full bg-black/40 border border-neutral-800 rounded-xl pl-12 pr-6 py-3.5 text-white text-xs outline-none focus:border-[#00e5ff]/40 transition-all font-bold placeholder:text-neutral-800" 
                    placeholder="PASSWORD_STRING" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 text-red-500 bg-red-500/5 p-4 rounded-xl border border-red-500/20">
                <AlertTriangle size={14} className="shrink-0" />
                <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSyncing} 
              className="w-full py-4 rounded-xl font-black text-xs uppercase italic tracking-[0.3em] transition-all border-b-4 active:translate-y-1 active:border-b-0 bg-[#00e5ff] text-black border-[#009fb1] hover:bg-[#33ebff] flex items-center justify-center gap-3 mt-2 shadow-xl shadow-[#00e5ff]/5 font-tactical"
            >
              {isSyncing ? <Loader2 className="animate-spin" size={18} /> : (
                <>EXECUTE_PROVISIONING <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
             <button onClick={onSwitchToLogin} className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.2em] hover:text-white transition-all">
               Existing Member? Handshake Terminal
             </button>
          </div>
        </div>

        {/* SECURITY DISCLOSURE */}
        <div className="mt-6 flex items-center justify-center gap-4 opacity-30">
          <div className="flex items-center gap-2">
            <Database size={10} className="text-white" />
            <span className="text-[7px] text-white font-bold uppercase tracking-widest">SSL Enabled</span>
          </div>
          <div className="w-1 h-1 bg-neutral-800 rounded-full" />
          <p className="text-[7px] text-white font-bold uppercase tracking-widest">
            Protocol: SECURE_WSS_v4
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
