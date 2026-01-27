import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ShieldCheck, 
  Lock, 
  User as UserIcon, 
  Loader2, 
  Cpu, 
  Globe, 
  AlertTriangle, 
  Facebook, 
  Activity, 
  Terminal, 
  Fingerprint,
  TrendingUp,
  Shield
} from 'lucide-react';
import { User, OAuthConfig } from '../types.ts';
import { apiService } from '../services/apiService.ts';
import { authService } from '../services/authService.ts';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToSignup: () => void;
  authConfig?: OAuthConfig;
}

const LOCATION_REQUESTED_KEY = 'lb_location_requested_v1';
const LAST_KNOWN_LOCATION_KEY = 'lb_last_known_loc';

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup, authConfig }) => {
  const [activeMode, setActiveMode] = useState<'trader' | 'admin'>('trader');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const requestLocation = async (): Promise<string> => {
    return new Promise((resolve) => {
      const hasRequested = localStorage.getItem(LOCATION_REQUESTED_KEY);
      const cachedLoc = localStorage.getItem(LAST_KNOWN_LOCATION_KEY);
      if (hasRequested && cachedLoc) return resolve(cachedLoc);
      if (!("geolocation" in navigator)) return resolve("N/A");
      localStorage.setItem(LOCATION_REQUESTED_KEY, 'true');
      const timeout = setTimeout(() => resolve(cachedLoc || "Timeout"), 1000);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeout);
          const coords = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
          localStorage.setItem(LAST_KNOWN_LOCATION_KEY, coords);
          resolve(coords);
        },
        () => {
          clearTimeout(timeout);
          resolve(cachedLoc || "Denied");
        },
        { timeout: 900 }
      );
    });
  };

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let device = "Desktop";
    if (/Mobi|Android/i.test(ua)) device = "Mobile";
    return `${device} | ${navigator.platform}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSyncing) return;
    setIsSyncing(true);
    setError('');
    
    try {
      const user = await authService.signIn(email, password);
      const location = await requestLocation();
      const deviceInfo = getDeviceInfo();
      onLogin({ ...user, location, deviceInfo } as User);
    } catch (err: any) {
      setError(err.message || 'System Error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 md:p-12 relative overflow-hidden theme-transition">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#000] z-10 opacity-60" />
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-[1100px] mx-auto z-10 flex flex-col gap-6 md:gap-10 animate-in fade-in zoom-in-95 duration-700">
        
        {/* BRAND IDENTITY BAR */}
        <div className="flex items-center gap-4 mb-2 animate-in slide-in-from-left duration-700">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border-2 border-cyan-400/40 shadow-[0_0_20px_rgba(0,229,255,0.2)] shrink-0">
            <Zap className="text-cyan-400 fill-cyan-400/10" size={24} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl md:text-3xl font-futuristic text-white leading-none text-glow tracking-tighter">
              LEADBID<span className="text-cyan-400">PRO</span>
            </span>
            <span className="text-[8px] text-neutral-600 font-black uppercase tracking-[0.6em] mt-1 italic">Enterprise_Market_Node</span>
          </div>
        </div>

        {/* LANDSCAPE HEADER - SALES FLOOR STYLE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b-2 border-neutral-900 pb-8 md:pb-12">
          <div className="relative">
            <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-4 h-12 md:h-24 bg-cyan-400 rounded-full blur-xl opacity-20" />
            <h2 className="text-3xl md:text-4xl font-futuristic text-white italic uppercase flex items-center gap-4 md:gap-8 text-glow">
              ACCESS <span className="text-neutral-600 font-normal">NODE</span>
            </h2>
            <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4 md:mt-6">
              <div className="px-3 md:px-4 py-1.5 bg-cyan-400/10 border border-cyan-400/30 rounded-full text-[8px] md:text-[10px] font-black text-cyan-400 uppercase tracking-widest">AUTHENTICATION_TERMINAL_V4</div>
              <span className="text-[10px] md:text-[12px] text-neutral-600 font-bold uppercase tracking-widest italic shrink-0">STABLE_CONNECTION // 12ms</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
            <div className="flex-1 md:flex-none p-4 md:p-6 bg-[#0f0f0f] border-2 border-neutral-900 rounded-[1.5rem] md:rounded-3xl shadow-2xl flex items-center gap-4 md:gap-6 group transition-all cursor-default overflow-hidden">
              <div className="w-10 md:w-14 h-10 md:h-14 bg-cyan-400/10 rounded-xl md:rounded-2xl flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform shrink-0">
                <Terminal size={24} className="md:w-7 md:h-7" />
              </div>
              <div>
                <span className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest block mb-1">NODE_ID</span>
                <span className="text-xl md:text-3xl font-tactical text-white tracking-widest leading-none text-glow">AUTH_HQ_01</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#0f0f0f] border border-neutral-800/60 rounded-[1.5rem] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-8 md:gap-12 overflow-x-auto scrollbar-hide w-full">
            <div className="flex flex-col shrink-0">
              <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Active Sessions</span>
              <div className="text-3xl md:text-4xl font-black text-white italic tracking-tighter flex items-baseline gap-2 font-tactical">
                <span className="text-sm text-cyan-400 opacity-40">#</span>14,204
              </div>
            </div>
            <div className="hidden md:block h-10 w-px bg-neutral-800" />
            <div className="flex items-center gap-6 md:gap-8 shrink-0">
              <div>
                <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Integrity</span>
                <div className="text-base md:text-lg font-black text-emerald-500/80 italic flex items-center gap-2 md:gap-3 font-tactical tracking-widest">
                  <Shield size={12} md:size={14} className="animate-pulse" /> 99.9%
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Auth Nodes</span>
                <div className="text-base md:text-lg font-black text-neutral-400 italic font-tactical tracking-widest uppercase">8 Units</div>
              </div>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-4 bg-black/40 p-1.5 rounded-xl border border-neutral-800/40 shrink-0">
            <div className="flex flex-col items-end px-3">
              <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest">System Protocol</span>
              <span className="text-[10px] font-bold text-neutral-400 font-mono uppercase tracking-widest">V4.2.0_SECURE</span>
            </div>
            <div className="h-6 w-px bg-neutral-800/60" />
            <div className="px-3 flex items-center gap-2">
               <Cpu size={14} className="text-cyan-400/40" />
               <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest font-tactical">HANDSHAKE_READY</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-[#0c0c0c]/90 rounded-[2.5rem] border-2 border-neutral-900 p-8 md:p-12 shadow-2xl relative overflow-hidden scanline-effect group">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <Fingerprint size={120} />
              </div>

              <div className="flex bg-black/40 border border-neutral-900 rounded-2xl p-1 mb-10 w-full sm:w-[320px] mx-auto">
                <button 
                  type="button" 
                  onClick={() => setActiveMode('trader')} 
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeMode === 'trader' ? 'bg-white text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                >
                  <UserIcon size={14} /> Trader
                </button>
                <button 
                  type="button" 
                  onClick={() => setActiveMode('admin')} 
                  className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeMode === 'admin' ? 'bg-neutral-800 text-white shadow-lg' : 'text-neutral-500 hover:text-white'}`}
                >
                  <ShieldCheck size={14} /> Admin
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-[11px] font-black text-neutral-600 uppercase tracking-widest px-2 italic flex items-center gap-2">
                      <Fingerprint size={14} className="text-cyan-400" /> Identity_Signature (Email)
                    </label>
                    <div className="relative group">
                      <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-cyan-400 transition-colors" size={20} />
                      <input 
                        required 
                        type="email"
                        className="w-full bg-black border-2 border-neutral-800 rounded-2xl md:rounded-[2rem] pl-16 pr-8 py-5 md:py-6 text-xl md:text-2xl font-bold text-white outline-none focus:border-cyan-400 transition-all font-tactical tracking-widest placeholder:text-neutral-900" 
                        placeholder="EMAIL_ID@MARKET.IO" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] md:text-[11px] font-black text-neutral-600 uppercase tracking-widest px-2 italic flex items-center gap-2">
                      <Lock size={14} className="text-cyan-400" /> Auth_Token
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-cyan-400 transition-colors" size={20} />
                      <input 
                        required 
                        type="password" 
                        className="w-full bg-black border-2 border-neutral-800 rounded-2xl md:rounded-[2rem] pl-16 pr-8 py-5 md:py-6 text-xl md:text-2xl font-bold text-white outline-none focus:border-cyan-400 transition-all font-tactical tracking-widest placeholder:text-neutral-900" 
                        placeholder="••••••••" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-500/10 p-4 rounded-2xl flex items-center gap-4 border border-red-500/20 animate-shake">
                    <AlertTriangle size={18} className="text-red-500" />
                    <p className="text-red-600 text-[10px] font-black uppercase tracking-widest">{error}</p>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={isSyncing} 
                  className={`w-full py-6 md:py-8 rounded-2xl md:rounded-[2.5rem] font-black text-xl md:text-3xl transition-all transform active:scale-[0.98] disabled:opacity-50 border-b-8 md:border-b-[12px] font-tactical italic tracking-widest
                    ${activeMode === 'admin' 
                      ? 'bg-neutral-800 text-white border-neutral-900 hover:bg-neutral-700 shadow-[0_20px_50px_rgba(0,0,0,0.8)]' 
                      : 'bg-black text-white border-neutral-800 hover:bg-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
                    }`}
                >
                  {isSyncing ? <Loader2 className="animate-spin mx-auto text-white" size={28} /> : 'INITIALIZE_AUTH'}
                </button>
              </form>

              <div className="mt-12 text-center">
                 <button onClick={onSwitchToSignup} className="group text-neutral-600 text-[10px] md:text-[11px] font-black uppercase tracking-widest hover:text-white transition-all">
                   NOT_PROVISIONED? <span className="text-white group-hover:underline">OPEN_NEW_NODE</span>
                 </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-8">
            <div className="bg-[#0f0f0f] border-2 border-neutral-900 p-8 rounded-[2.5rem] flex items-start gap-6 shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <Activity size={80} />
              </div>
              <ShieldCheck className="text-emerald-500 shrink-0" size={28} />
              <div className="relative z-10">
                 <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 font-futuristic">LEDGER_PROTOCOL_ACTIVE</h4>
                 <p className="text-[9px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
                   Identity authentication is cryptographically verified against the marketplace root ledger. Unauthorized access attempts are automatically logged and routed to system auditing nodes for immediate IP isolation.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
};

export default Login;