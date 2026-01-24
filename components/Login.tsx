import React, { useState } from 'react';
import { Zap, ShieldCheck, Lock, User as UserIcon, Loader2, Cpu, Globe, AlertTriangle } from 'lucide-react';
import { User, OAuthConfig } from '../types';
import { apiService } from '../services/apiService';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToSignup: () => void;
  authConfig?: OAuthConfig;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup, authConfig }) => {
  const [activeMode, setActiveMode] = useState<'trader' | 'admin'>('trader');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const requestLocation = async (): Promise<string> => {
    return new Promise((resolve) => {
      if (!("geolocation" in navigator)) return resolve("N/A");
      const timeout = setTimeout(() => resolve("Timeout"), 1000); // Reduced to 1s for snappier login
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeout);
          resolve(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => {
          clearTimeout(timeout);
          resolve("Denied");
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
      const user = await apiService.authenticateUser(username, password);
      
      if (user) {
        if (activeMode === 'admin' && user.role !== 'admin') {
          setError('Access Denied: Admin Role Required');
          setIsSyncing(false);
          return;
        }

        const location = await requestLocation();
        const deviceInfo = getDeviceInfo();
        onLogin({ ...user, location, deviceInfo } as User);
      } else {
        setError('Invalid Credentials');
      }
    } catch (err) {
      setError('System Error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    if (authConfig) {
      if (provider === 'google' && (!authConfig.googleEnabled || !authConfig.googleClientId)) {
        setError('Google Provider Offline'); return;
      }
      if (provider === 'facebook' && (!authConfig.facebookEnabled || !authConfig.facebookAppId)) {
        setError('Facebook Provider Offline'); return;
      }
    }

    setIsSyncing(true);
    setError('');
    
    try {
      const user = await apiService.authenticateUser(`${provider}@social.node`, 'social-token');
      if (user) { onLogin(user as User); } 
      else {
        const newUser = await apiService.registerUser({
          name: `${provider} Trader`, email: `${provider}@social.node`,
          username: provider + Math.floor(Math.random() * 1000), password: 'social-token'
        });
        onLogin(newUser as User);
      }
    } catch (err) {
      setError('Social Login Failed');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050810] p-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#facc15] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-[#0a0a0a] rounded-[3rem] border border-neutral-900 shadow-2xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="p-10 pb-6 text-center">
          <div className="inline-flex p-4 bg-[#facc15]/10 rounded-3xl border border-[#facc15]/20 mb-6 group hover:scale-110 transition-transform duration-500">
            <Zap className="text-[#facc15] fill-[#facc15] w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
            LEAD<span className="text-[#facc15]">BID</span><span className="text-neutral-700 not-italic ml-1">PRO</span>
          </h1>
          <p className="text-neutral-500 text-[9px] mt-3 font-black uppercase tracking-[0.5em] opacity-40 italic">Handshake Required</p>
        </div>

        <div className="px-10">
          <div className="flex bg-black border border-neutral-800 rounded-2xl p-1.5 mb-8">
            <button type="button" onClick={() => setActiveMode('trader')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${activeMode === 'trader' ? 'bg-[#facc15] text-black shadow-lg shadow-yellow-400/10' : 'text-neutral-500'}`}>Trader</button>
            <button type="button" onClick={() => setActiveMode('admin')} className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${activeMode === 'admin' ? 'bg-red-600 text-white shadow-lg' : 'text-neutral-500'}`}>Admin</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Access ID</label>
              <input required className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-[#facc15] transition-all font-bold placeholder:text-neutral-800" placeholder={activeMode === 'admin' ? "admin" : "User / Email"} value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Token</label>
              <input required type="password" className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-[#facc15] transition-all font-bold placeholder:text-neutral-800" placeholder="••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 justify-center animate-shake">
                <AlertTriangle size={14} className="text-red-500" />
                <p className="text-red-500 text-[10px] font-black uppercase">{error}</p>
              </div>
            )}

            <button type="submit" disabled={isSyncing} className={`w-full py-5 rounded-2xl font-black text-sm transition-all transform active:scale-95 shadow-xl disabled:opacity-50 border-b-[5px] ${activeMode === 'admin' ? 'bg-red-600 text-white border-red-800' : 'bg-[#facc15] text-black border-yellow-600'}`}>
              {isSyncing ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'AUTHENTICATE'}
            </button>
          </form>

          {activeMode === 'trader' && (
            <div className="mt-8 space-y-4">
              <div className="relative flex items-center gap-4">
                <div className="flex-1 h-[1px] bg-neutral-900" />
                <span className="text-[9px] font-black text-neutral-700 uppercase">OAuth Nodes</span>
                <div className="flex-1 h-[1px] bg-neutral-900" />
              </div>
              <div className="grid grid-cols-2 gap-4 pb-8">
                <button onClick={() => handleSocialLogin('google')} className="py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-neutral-800 hover:text-white hover:bg-neutral-800 text-[10px] uppercase transition-all">Google</button>
                <button onClick={() => handleSocialLogin('facebook')} className="py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-neutral-800 hover:text-white hover:bg-neutral-800 text-[10px] uppercase transition-all">Facebook</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;