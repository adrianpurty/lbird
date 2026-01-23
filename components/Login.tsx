import React, { useState } from 'react';
import { Zap, ShieldCheck, Lock, User as UserIcon, Loader2, Cpu, Globe, AlertTriangle } from 'lucide-react';
import { User, OAuthConfig } from '../types';

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

  const fetchIpAddress = async (): Promise<string> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const response = await fetch('https://api.ipify.org?format=json', { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await response.json();
      return data.ip || '0.0.0.0';
    } catch (err) {
      return 'Restricted Node';
    }
  };

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
    
    const ip = await fetchIpAddress();
    const deviceInfo = getDeviceInfo();

    if (username === 'admin' && password === '1234') {
      onLogin({
        id: 'admin_1',
        name: 'System Administrator',
        email: 'admin@leadbid.pro',
        balance: 1000000,
        stripeConnected: true,
        role: 'admin',
        ipAddress: ip,
        deviceInfo: deviceInfo,
        wishlist: []
      });
    } else if (username === 'user' && password === 'user') {
       onLogin({
        id: 'user_mock',
        name: 'Standard Trader',
        email: 'user@example.com',
        balance: 5000,
        stripeConnected: false,
        role: 'user',
        ipAddress: ip,
        deviceInfo: deviceInfo,
        wishlist: []
      });
    } else {
      setError('Access Denied: Invalid Terminal Credentials');
    }
    setIsSyncing(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    // LINK TO ADMIN OAUTH SETUP: Validate if setup properly before allowing
    if (authConfig) {
      if (provider === 'google' && (!authConfig.googleEnabled || !authConfig.googleClientId)) {
        setError('Google Node Offline: Admin configuration required.');
        return;
      }
      if (provider === 'facebook' && (!authConfig.facebookEnabled || !authConfig.facebookAppId)) {
        setError('Facebook Node Offline: Admin configuration required.');
        return;
      }
    }

    setIsSyncing(true);
    setError('');
    const ip = await fetchIpAddress();
    onLogin({
      id: `social_${Math.random().toString(36).substr(2, 9)}`,
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Trader`,
      email: `${provider}@global-network.net`,
      balance: 1000,
      stripeConnected: false,
      role: 'user',
      ipAddress: ip,
      deviceInfo: getDeviceInfo(),
      wishlist: []
    });
    setIsSyncing(false);
  };

  const isGoogleDown = authConfig && (!authConfig.googleEnabled || !authConfig.googleClientId);
  const isFacebookDown = authConfig && (!authConfig.facebookEnabled || !authConfig.facebookAppId);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050810] p-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#facc15] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-[#0a0a0a] rounded-[3rem] border border-neutral-900 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="p-10 pb-6 text-center">
          <div className="inline-flex p-4 bg-[#facc15]/10 rounded-3xl border border-[#facc15]/20 mb-6 group hover:scale-110 transition-transform duration-500">
            <Zap className="text-[#facc15] fill-[#facc15] w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
            LEAD<span className="text-[#facc15]">BID</span><span className="text-neutral-700 not-italic ml-1">PRO</span>
          </h1>
          <p className="text-neutral-500 text-[9px] mt-3 font-black uppercase tracking-[0.5em] opacity-40 italic">Identity Verification Required</p>
        </div>

        <div className="px-10">
          <div className="flex bg-black border border-neutral-800 rounded-2xl p-1.5 mb-8">
            <button onClick={() => { setActiveMode('trader'); setError(''); }} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeMode === 'trader' ? 'bg-[#facc15] text-black shadow-lg shadow-yellow-400/10' : 'text-neutral-500 hover:text-white'}`}><UserIcon size={14} /> Trader</button>
            <button onClick={() => { setActiveMode('admin'); setError(''); }} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeMode === 'admin' ? 'bg-red-600 text-white shadow-lg shadow-red-600/10' : 'text-neutral-500 hover:text-white'}`}><Cpu size={14} /> Operator</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Access Terminal</label>
              <input required className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-[#facc15] transition-all font-bold placeholder:text-neutral-800" placeholder={activeMode === 'admin' ? "Operator ID" : "Username"} value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Secret Token</label>
              <input required type="password" className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-[#facc15] transition-all font-bold placeholder:text-neutral-800" placeholder="••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 justify-center">
                <AlertTriangle size={14} className="text-red-500" />
                <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>
              </div>
            )}

            <button type="submit" disabled={isSyncing} className={`w-full py-5 rounded-2xl font-black text-sm transition-all transform active:scale-95 shadow-xl disabled:opacity-50 border-b-[5px] ${activeMode === 'admin' ? 'bg-red-600 text-white hover:bg-red-500 border-red-800' : 'bg-[#facc15] text-black hover:bg-[#eab308] border-yellow-600'}`}>
              {isSyncing ? <Loader2 className="animate-spin mx-auto" size={20} /> : 'AUTHENTICATE SESSION'}
            </button>
          </form>

          {activeMode === 'trader' && (
            <div className="mt-8 space-y-4">
              <div className="relative flex items-center gap-4">
                <div className="flex-1 h-[1px] bg-neutral-900" />
                <span className="text-[9px] font-black text-neutral-700 uppercase tracking-widest">Network Nodes</span>
                <div className="flex-1 h-[1px] bg-neutral-900" />
              </div>

              <div className="grid grid-cols-2 gap-4 pb-8">
                <button onClick={() => handleSocialLogin('google')} className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all text-[10px] uppercase tracking-widest group ${isGoogleDown ? 'bg-neutral-950 text-neutral-800 border-neutral-900 cursor-not-allowed grayscale' : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-800'}`}>
                  <Globe size={12} className={isGoogleDown ? '' : 'group-hover:text-[#facc15]'} /> {isGoogleDown ? 'LOCK' : 'Google'}
                </button>
                <button onClick={() => handleSocialLogin('facebook')} className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all text-[10px] uppercase tracking-widest group ${isFacebookDown ? 'bg-neutral-950 text-neutral-800 border-neutral-900 cursor-not-allowed grayscale' : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white hover:bg-neutral-800'}`}>
                  <ShieldCheck size={12} className={isFacebookDown ? '' : 'group-hover:text-[#facc15]'} /> {isFacebookDown ? 'LOCK' : 'Facebook'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-10 pt-8 text-center bg-neutral-900/20">
          <button onClick={onSwitchToSignup} className="text-neutral-600 text-[10px] font-black uppercase hover:text-[#facc15] transition-colors flex items-center justify-center gap-2 mx-auto">New Node? Provision Credentials</button>
        </div>
      </div>
    </div>
  );
};

export default Login;