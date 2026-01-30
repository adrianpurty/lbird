
import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Lock, 
  Loader2, 
  Fingerprint,
  ArrowRight,
  AlertTriangle,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { User, OAuthConfig } from '../types.ts';
import { authService } from '../services/authService.ts';
import { soundService } from '../services/soundService.ts';
import BiometricVerifyModal from './BiometricVerifyModal.tsx';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToSignup: () => void;
  authConfig?: OAuthConfig;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup, authConfig }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  useEffect(() => {
    if (window.PublicKeyCredential) {
      setIsBiometricAvailable(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSyncing) return;
    soundService.playClick(true);
    setIsSyncing(true);
    setError('');
    
    try {
      const user = await authService.signIn(email, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Authentication Error');
    } finally {
      setIsSyncing(false);
    }
  };

  const executeBiometricAuth = async () => {
    setIsSyncing(true);
    setError('');
    setShowVerifyModal(false);

    try {
      const user = await authService.signInWithBiometrics();
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "Biometric authentication failed. Use manual credentials.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleBiometricClick = () => {
    if (isSyncing) return;
    soundService.playClick(true);
    setShowVerifyModal(true);
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    if (isSyncing) return;
    soundService.playClick(true);
    setIsSyncing(true);
    setError('');
    try {
      const user = await authService.signInWithSocial(provider);
      onLogin(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden grid-bg bg-platform">
      <div className="w-full max-w-[440px] mx-auto z-10 animate-in fade-in zoom-in-95 duration-700 py-20">
        
        {/* BRANDING HUB */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-4 transition-transform hover:scale-105 duration-500">
            <Zap className="text-black fill-black" size={28} />
          </div>
          <h1 className="text-2xl font-futuristic text-white tracking-[0.3em] uppercase italic">
            LEAD<span className="text-dim">BID</span> PRO
          </h1>
          <p className="text-[7px] text-dim font-black uppercase tracking-[0.5em] mt-2 italic">ESTABLISHING_SECURE_HANDSHAKE</p>
        </div>

        {/* ACCESS TERMINAL */}
        <div className="bg-surface border border-bright rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity text-white">
            <ShieldCheck size={80} />
          </div>

          <div className="mb-8 flex items-center justify-between border-b border-bright pb-4">
            <div>
              <h2 className="text-xl font-black text-white uppercase italic tracking-widest leading-none">SIGN_IN</h2>
              <p className="text-[8px] text-dim font-black uppercase tracking-widest mt-1.5 flex items-center gap-2">
                <Cpu size={10} className="text-accent" /> Terminal_Auth_v4.2
              </p>
            </div>
            <div className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_10px_var(--accent-primary)]" />
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.2em] px-1 italic">IDENTIFIER_ENTRY</label>
                <div className="relative group/input">
                  <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within/input:text-accent transition-colors" size={14} />
                  <input 
                    required 
                    type="text"
                    className="w-full bg-black border border-neutral-800 rounded-xl pl-12 pr-6 py-3.5 text-white text-xs outline-none focus:border-accent transition-all font-bold placeholder:text-neutral-700" 
                    placeholder="EMAIL_OR_USERNAME" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.2em] px-1 italic">CRYPTOGRAPHIC_TOKEN</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within/input:text-accent transition-colors" size={14} />
                  <input 
                    required 
                    type="password" 
                    className="w-full bg-black border border-neutral-800 rounded-xl pl-12 pr-6 py-3.5 text-white text-xs outline-none focus:border-accent transition-all font-bold placeholder:text-neutral-700" 
                    placeholder="PASSWORD_STRING" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 text-red-500 bg-red-500/5 p-4 rounded-xl border border-red-500/20 animate-in shake duration-300">
                <AlertTriangle size={14} className="shrink-0" />
                <p className="text-[9px] font-black uppercase tracking-widest leading-relaxed">{error}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 mt-2">
              <button 
                type="submit" 
                disabled={isSyncing} 
                className="w-full py-4 rounded-xl font-black text-xs uppercase italic tracking-[0.3em] transition-all border-b-4 active:translate-y-1 active:border-b-0 bg-white text-black border-neutral-300 hover:bg-[#00e5ff] flex items-center justify-center gap-3 shadow-xl font-tactical"
              >
                {isSyncing ? <Loader2 className="animate-spin" size={18} /> : (
                  <>INIT_AUTHORIZATION <ArrowRight size={14} /></>
                )}
              </button>

              {isBiometricAvailable && (
                <button 
                  type="button"
                  onClick={handleBiometricClick}
                  disabled={isSyncing}
                  className="w-full py-3.5 rounded-xl font-black text-[9px] uppercase tracking-[0.4em] transition-all border border-bright bg-black text-accent hover:bg-accent/5 flex items-center justify-center gap-3 shadow-lg font-futuristic italic"
                >
                  <Fingerprint size={16} /> SIGN_IN_WITH_BIOMETRICS
                </button>
              )}
            </div>
          </form>

          {/* SOCIAL HANDSHAKE */}
          <div className="mt-8 pt-6 border-t border-neutral-800/40 space-y-4">
            <p className="text-center text-[7px] text-dim font-black uppercase tracking-[0.4em]">Alternative_Identity_Sync</p>
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => handleSocialAuth('google')}
                className="w-12 h-12 rounded-xl bg-black border border-neutral-800 flex items-center justify-center hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group"
              >
                <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
              </button>
              <button 
                onClick={() => handleSocialAuth('facebook')}
                className="w-12 h-12 rounded-xl bg-black border border-neutral-800 flex items-center justify-center hover:border-blue-600/40 hover:bg-blue-600/5 transition-all group"
              >
                <Lock size={18} className="text-neutral-600 group-hover:text-blue-500 group-hover:opacity-100 transition-all" fill="currentColor" />
              </button>
            </div>
          </div>

          <div className="mt-8 text-center">
             <button onClick={onSwitchToSignup} className="text-dim text-[9px] font-black uppercase tracking-[0.2em] hover:text-white transition-all">
               New Node Detection // Create Account
             </button>
          </div>
        </div>
      </div>

      {showVerifyModal && (
        <BiometricVerifyModal 
          onSuccess={executeBiometricAuth}
          onCancel={() => setShowVerifyModal(false)}
        />
      )}
    </div>
  );
};

export default Login;
