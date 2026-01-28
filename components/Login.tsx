import React, { useState } from 'react';
import { 
  Zap, 
  Lock, 
  Loader2, 
  Fingerprint,
  ArrowRight,
  AlertTriangle,
  Globe,
  Facebook
} from 'lucide-react';
import { User, OAuthConfig } from '../types.ts';
import { authService } from '../services/authService.ts';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSyncing) return;
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

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    if (isSyncing) return;
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
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* PS5 Dynamic Background */}
      <div className="ps5-bg">
        <div className="ps5-liquid" />
        <div className="ps5-liquid-2" />
      </div>

      <div className="w-full max-w-[480px] mx-auto z-10 animate-in fade-in zoom-in-95 duration-1000">
        
        {/* Logo Section */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full mx-auto flex items-center justify-center border border-white/20 mb-4">
            <Zap className="text-white fill-white" size={32} />
          </div>
          <h1 className="text-3xl font-futuristic text-white tracking-[0.2em] uppercase">
            LEAD<span className="opacity-40">BID</span> PRO
          </h1>
        </div>

        {/* Login Card */}
        <div className="glass-panel rounded-[2rem] p-10 md:p-12">
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-bold text-white tracking-tight mb-2">Sign In</h2>
            <p className="text-neutral-400 text-sm font-medium">Access your enterprise lead hub.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <input 
                  required 
                  type="text"
                  className="ps-input w-full rounded-2xl px-6 py-4 text-white text-lg outline-none placeholder:text-neutral-600" 
                  placeholder="ID / Email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                />
              </div>
              
              <div className="relative">
                <input 
                  required 
                  type="password" 
                  className="ps-input w-full rounded-2xl px-6 py-4 text-white text-lg outline-none placeholder:text-neutral-600" 
                  placeholder="Password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-3 text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20">
                <AlertTriangle size={16} />
                <p className="text-xs font-bold uppercase tracking-wider">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              disabled={isSyncing} 
              className="ps-button-primary w-full py-5 rounded-full font-black text-lg flex items-center justify-center gap-3"
            >
              {isSyncing ? <Loader2 className="animate-spin" size={24} /> : 'Sign In'}
            </button>
          </form>

          {/* Social Auth */}
          <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
            <p className="text-center text-[10px] text-neutral-500 font-black uppercase tracking-[0.2em]">Other sign in options</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => handleSocialAuth('google')}
                className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
              >
                <Globe size={20} className="text-neutral-300" />
              </button>
              <button 
                onClick={() => handleSocialAuth('facebook')}
                className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all"
              >
                <Facebook size={20} className="text-neutral-300" />
              </button>
            </div>
          </div>

          <div className="mt-10 text-center">
             <button onClick={onSwitchToSignup} className="text-neutral-400 text-sm font-bold hover:text-white transition-all underline underline-offset-8 decoration-white/10">
               New here? Create Account
             </button>
          </div>
        </div>

        {/* Footer Hint */}
        <div className="mt-8 text-center opacity-30">
          <p className="text-[10px] text-white font-bold uppercase tracking-[0.3em]">
            Press X to Sync // Admin: admin / 1234
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;