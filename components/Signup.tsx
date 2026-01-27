import React, { useState } from 'react';
import { 
  Zap, 
  Mail, 
  User as UserIcon, 
  Lock, 
  Loader2, 
  ShieldCheck, 
  Terminal,
  Cpu,
  Activity,
  Fingerprint
} from 'lucide-react';
import { User, OAuthConfig } from '../types.ts';
import { authService } from '../services/authService.ts';

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

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let device = "Desktop";
    if (/Mobi|Android/i.test(ua)) device = "Mobile";
    return `${device} | ${navigator.platform}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setError('');

    const deviceInfo = getDeviceInfo();

    try {
      const newUser = await authService.signUp(
        formData.email, 
        formData.password, 
        formData.name
      );
      onSignup({ ...newUser, deviceInfo } as User);
    } catch (err: any) {
      setError(err.message || "PROVISION_FAILED: CHECK_NETWORK_PROTOCOLS");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 md:p-12 relative overflow-hidden theme-transition font-rajdhani">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#000] z-10 opacity-60" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-[1100px] mx-auto z-10 flex flex-col gap-6 md:gap-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* BRAND IDENTITY BAR */}
        <div className="flex items-center gap-4 mb-2 animate-in slide-in-from-left duration-700">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border-2 border-purple-400/40 shadow-[0_0_20px_rgba(192,132,252,0.2)] shrink-0">
            <Zap className="text-purple-400 fill-purple-400/10" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl md:text-3xl font-futuristic text-white leading-none text-glow tracking-tighter">
              LEADBID<span className="text-purple-400">PRO</span>
            </span>
            <span className="text-[8px] text-neutral-600 font-black uppercase tracking-[0.6em] mt-1 italic">Enterprise_Market_Node</span>
          </div>
        </div>

        {/* LANDSCAPE HEADER - SALES FLOOR STYLE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b-2 border-neutral-900 pb-8 md:pb-12">
          <div className="relative">
            <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-4 h-12 md:h-24 bg-purple-400 rounded-full blur-xl opacity-20" />
            <h2 className="text-3xl md:text-4xl font-futuristic text-white italic uppercase flex items-center gap-4 md:gap-8 text-glow">
              IDENTITY <span className="text-neutral-600 font-normal">PROVISION</span>
            </h2>
            <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4 md:mt-6">
              <div className="px-3 md:px-4 py-1.5 bg-purple-400/10 border border-purple-400/30 rounded-full text-[8px] md:text-[10px] font-black text-purple-400 uppercase tracking-widest">REGISTRATION_TERMINAL_V4</div>
              <span className="text-[10px] md:text-[12px] text-neutral-600 font-bold uppercase tracking-widest italic shrink-0">AWAITING_HANDSHAKE // 8ms</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
            <div className="flex-1 md:flex-none p-4 md:p-6 bg-[#0f0f0f] border-2 border-neutral-900 rounded-[1.5rem] md:rounded-3xl shadow-2xl flex items-center gap-4 md:gap-6 group transition-all cursor-default overflow-hidden">
              <div className="w-10 md:w-14 h-10 md:h-14 bg-purple-400/10 rounded-xl md:rounded-2xl flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform shrink-0">
                <Cpu size={24} className="md:w-7 md:h-7" />
              </div>
              <div>
                <span className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest block mb-1">CAPACITY</span>
                <span className="text-xl md:text-3xl font-tactical text-white tracking-widest leading-none text-glow">99.2%_FREE</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-neutral-800/60 rounded-[1.5rem] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-8 md:gap-12 overflow-x-auto scrollbar-hide w-full">
            <div className="flex flex-col shrink-0">
              <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Global Nodes</span>
              <div className="text-3xl md:text-4xl font-black text-white italic tracking-tighter flex items-baseline gap-2 font-tactical">
                <span className="text-sm text-purple-400 opacity-40">#</span>42,891
              </div>
            </div>
            <div className="hidden md:block h-10 w-px bg-neutral-800" />
            <div className="flex items-center gap-6 md:gap-8 shrink-0">
              <div>
                <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Network Reliability</span>
                <div className="text-base md:text-lg font-black text-emerald-500/80 italic flex items-center gap-2 md:gap-3 font-tactical tracking-widest">
                  <Activity size={12} md:size={14} className="animate-pulse" /> 99.9%
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#0c0c0c]/90 rounded-[2.5rem] border-2 border-neutral-900 p-8 md:p-12 shadow-2xl relative overflow-hidden scanline-effect group">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <Fingerprint size={120} />
              </div>

              <div className="flex bg-black/40 border border-neutral-900 rounded-2xl p-4 mb-10 w-full text-center">
                 <h3 className="w-full text-[10px] md:text-[12px] font-black text-white uppercase tracking-widest italic">Initializing_Personal_Identity_Sector</h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2 italic flex items-center gap-2">
                      <UserIcon size={14} className="text-purple-400" /> Full_Name
                    </label>
                    <input 
                      required
                      className="w-full bg-black border-2 border-neutral-800 rounded-xl md:rounded-2xl px-6 py-4 text-neutral-200 font-bold outline-none focus:border-purple-400 transition-all font-tactical tracking-widest placeholder:text-neutral-900" 
                      placeholder="IDENTITY_STRING" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2 italic flex items-center gap-2">
                      <Mail size={14} className="text-purple-400" /> Contact_Vector (Email)
                    </label>
                    <input 
                      required 
                      type="email"
                      className="w-full bg-black border-2 border-neutral-800 rounded-xl md:rounded-2xl px-6 py-4 text-neutral-200 font-bold outline-none focus:border-purple-400 transition-all font-tactical tracking-widest placeholder:text-neutral-900" 
                      placeholder="EMAIL@DOMAIN.NET" 
                      value={formData.email} 
                      onChange={e => setFormData({...formData, email: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2 italic flex items-center gap-2">
                    <Lock size={14} className="text-purple-400" /> Security_Token (Password)
                  </label>
                  <input 
                    required 
                    type="password" 
                    className="w-full bg-black border-2 border-neutral-800 rounded-xl md:rounded-2xl px-6 py-4 text-neutral-200 font-bold outline-none focus:border-purple-400 transition-all font-tactical tracking-widest placeholder:text-neutral-900" 
                    placeholder="••••••••" 
                    value={formData.password} 
                    onChange={e => setFormData({...formData, password: e.target.value})} 
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 p-4 rounded-2xl flex items-center gap-4 border border-red-500/20 animate-shake">
                    <Activity size={18} className="text-red-500" />
                    <p className="text-red-600 text-[10px] font-black uppercase tracking-widest">{error}</p>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSyncing} 
                  className={`w-full py-6 md:py-8 rounded-2xl md:rounded-[2.5rem] font-black text-xl md:text-3xl transition-all transform active:scale-[0.98] disabled:opacity-50 border-b-8 md:border-b-[12px] font-tactical italic tracking-widest bg-black text-white border-neutral-800 hover:bg-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.8)]`}
                >
                  {isSyncing ? <Loader2 className="animate-spin mx-auto text-white" size={28} /> : 'INITIALIZE_PROVISION'}
                </button>
              </form>

              <div className="mt-10 text-center">
                 <button onClick={onSwitchToLogin} className="group text-neutral-600 text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:text-white transition-all">
                   ALREADY_PROVISIONED? <span className="text-white group-hover:underline">MOUNT_EXISTING_NODE</span>
                 </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="bg-[#0f0f0f] border-2 border-neutral-900 p-8 rounded-[2.5rem] flex items-start gap-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <ShieldCheck size={80} />
              </div>
              <ShieldCheck className="text-purple-500 shrink-0" size={28} />
              <div className="relative z-10">
                 <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 font-futuristic">DATA_VERACITY_CONSENT</h4>
                 <p className="text-[9px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
                   Identity creation establishes a permanent cryptographic leaf in the LeadBid ecosystem. By provisionally mounting this node, you consent to automated integrity auditing and behavioral telemetry routing for market transparency.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;