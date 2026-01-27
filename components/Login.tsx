
import React, { useState } from 'react';
import { 
  Zap, 
  User as UserIcon, 
  Loader2, 
  Fingerprint, 
  ShieldCheck, 
  Activity, 
  Terminal, 
  Lock, 
  ChevronRight,
  ShieldAlert,
  Facebook
} from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../services/firebase.ts';
import { soundService } from '../services/soundService.ts';

interface LoginProps {
  onLogin: (user: any) => void;
  onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup }) => {
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSyncing) return;
    setIsSyncing(true);
    setError('');
    soundService.playClick(true);
    
    // 1. SUPER ADMIN BYPASS CHECK
    if (identity.toLowerCase() === 'admin' && password === '123456') {
      const superAdminUser = {
        uid: 'super_admin_root',
        displayName: 'SUPER_ADMIN',
        email: 'admin@leadbid.pro',
        photoURL: null,
        isSuperAdmin: true // Custom flag for internal routing if needed
      };
      // Short delay to simulate auth handshake
      setTimeout(() => {
        onLogin(superAdminUser);
        setIsSyncing(false);
      }, 800);
      return;
    }

    // 2. STANDARD FIREBASE AUTH
    try {
      // If it's not a valid email format, Firebase will throw an error anyway
      const userCredential = await signInWithEmailAndPassword(auth, identity, password);
      onLogin(userCredential.user);
    } catch (err: any) {
      setError('Email or password is incorrect');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSocialLogin = async (provider: any) => {
    setIsSyncing(true);
    setError('');
    soundService.playClick(true);
    try {
      const result = await signInWithPopup(auth, provider);
      onLogin(result.user);
    } catch (err: any) {
      setError('Authentication failed. Please try again.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] flex flex-col items-center justify-start py-12 px-4 md:px-24 overflow-y-auto font-rajdhani">
      
      {/* TOP SECTION */}
      <div className="w-full max-w-[1400px] flex flex-col md:flex-row justify-between items-start md:items-center mb-16">
        <div>
          <h1 className="text-6xl md:text-8xl font-logo text-white flex gap-4 items-baseline">
            ACCESS <span className="text-neutral-700">NODE</span>
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <span className="bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] text-[10px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-full">
              AUTHENTICATION_TERMINAL_V4
            </span>
          </div>
        </div>

        <div className="mt-8 md:mt-0 bg-[#0A0A0A] border border-neutral-800 p-6 rounded-2xl flex items-center gap-6 shadow-2xl">
          <div className="w-12 h-12 bg-[#2DD4BF]/5 border border-[#2DD4BF]/20 rounded-xl flex items-center justify-center text-[#2DD4BF]">
            <Terminal size={24} />
          </div>
          <div>
            <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest block mb-1">NODE_ID</span>
            <span className="text-xl font-bold text-white tracking-widest font-futuristic uppercase">AUTH_HQ_01</span>
          </div>
        </div>
      </div>

      {/* MAIN AUTH CARD */}
      <div className="w-full max-w-2xl flex flex-col gap-8">
        <div className="bg-[#0A0A0A] border border-neutral-800 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
            <Fingerprint size={400} className="text-[#2DD4BF]" />
          </div>

          <form onSubmit={handleLoginSubmit} className="relative z-10 space-y-10">
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] px-4 flex items-center gap-3">
                  <Zap size={12} className="text-[#2DD4BF]" /> IDENTITY_SIGNATURE
                </label>
                <div className="relative group">
                  <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-[#2DD4BF] transition-colors" size={20} />
                  <input 
                    required
                    type="text"
                    className="w-full bg-[#EDF3FF] border-2 border-transparent rounded-2xl pl-16 pr-8 py-5 text-black font-bold outline-none focus:border-[#2DD4BF]/40 transition-all text-xl placeholder:text-neutral-400 shadow-inner"
                    placeholder="EMAIL_OR_USERNAME"
                    value={identity}
                    onChange={e => setIdentity(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] px-4 flex items-center gap-3">
                  <Lock size={12} className="text-[#2DD4BF]" /> AUTH_TOKEN
                </label>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-[#2DD4BF] transition-colors" size={20} />
                  <input 
                    required
                    type="password"
                    className="w-full bg-[#EDF3FF] border-2 border-transparent rounded-2xl pl-16 pr-8 py-5 text-black font-bold outline-none focus:border-[#2DD4BF]/40 transition-all text-xl placeholder:text-neutral-400 shadow-inner"
                    placeholder="••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-4 p-5 bg-red-500/10 rounded-2xl border border-red-500/20">
                <ShieldAlert className="text-red-500" size={20} />
                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={isSyncing}
              className="w-full bg-black text-white py-6 rounded-[2rem] font-black text-2xl flex items-center justify-center gap-6 hover:bg-[#111] transition-all active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-neutral-800 group/btn font-futuristic tracking-widest"
            >
              {isSyncing ? <Loader2 className="animate-spin" size={28} /> : (
                <>
                  INITIALIZE_AUTH <ChevronRight size={24} className="group-hover/btn:translate-x-2 transition-transform" />
                </>
              )}
            </button>

            {/* Social Logins */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="h-px flex-1 bg-neutral-800" />
                <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">OR CONNECT VIA</span>
                <div className="h-px flex-1 bg-neutral-800" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button"
                  onClick={() => handleSocialLogin(googleProvider)}
                  className="bg-white text-black py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all"
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" /> Google
                </button>
                <button 
                  type="button"
                  onClick={() => handleSocialLogin(facebookProvider)}
                  className="bg-[#1877F2] text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-[#166fe5] transition-all"
                >
                  <Facebook size={16} fill="white" /> Facebook
                </button>
              </div>
            </div>

            <div className="flex justify-center px-4">
              <button 
                type="button" 
                onClick={() => { soundService.playClick(); onSwitchToSignup(); }}
                className="text-neutral-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
              >
                PROVISION NEW NODE (SIGN UP)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
