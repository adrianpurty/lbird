
import React, { useState } from 'react';
import { Zap, ShieldCheck, Lock, User as UserIcon, Loader2, Cpu, Globe } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup }) => {
  const [activeMode, setActiveMode] = useState<'trader' | 'admin'>('trader');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchIpAddress = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || '0.0.0.0';
    } catch (err) {
      console.warn("IP tracking blocked by network protocol.");
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
        deviceInfo: deviceInfo
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
        deviceInfo: deviceInfo
      });
    } else {
      setError('Access Denied: Invalid Terminal Credentials');
    }
    setIsSyncing(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setIsSyncing(true);
    const ip = await fetchIpAddress();
    onLogin({
      id: `social_${Math.random().toString(36).substr(2, 9)}`,
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Trader`,
      email: `${provider}@global-network.net`,
      balance: 1000,
      stripeConnected: false,
      role: 'user',
      ipAddress: ip,
      deviceInfo: getDeviceInfo()
    });
    setIsSyncing(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050810] p-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#facc15] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md bg-[#0a0a0a] rounded-[3rem] border border-neutral-900 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="p-10 pb-6 text-center">
          <div className="inline-flex p-4 bg-[#facc15]/10 rounded-3xl border border-[#facc15]/20 mb-6 group hover:scale-110 transition-transform duration-500">
            <Zap className="text-[#facc15] fill-[#facc15] w-10 h-10 group-hover:animate-pulse" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic leading-none">
            LEAD<span className="text-[#facc15]">BID</span><span className="text-neutral-700 not-italic ml-1">PRO</span>
          </h1>
          <p className="text-neutral-500 text-[9px] mt-3 font-black uppercase tracking-[0.5em] opacity-40">High-Stakes Lead Exchange</p>
        </div>

        <div className="px-10">
          <div className="flex bg-black border border-neutral-800 rounded-2xl p-1.5 mb-8">
            <button 
              onClick={() => { setActiveMode('trader'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeMode === 'trader' ? 'bg-[#facc15] text-black shadow-lg shadow-yellow-400/10' : 'text-neutral-500 hover:text-white'}`}
            >
              <UserIcon size={14} /> Trader
            </button>
            <button 
              onClick={() => { setActiveMode('admin'); setError(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${activeMode === 'admin' ? 'bg-red-600 text-white shadow-lg shadow-red-600/10' : 'text-neutral-500 hover:text-white'}`}
            >
              <Cpu size={14} /> Operator
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">
                {activeMode === 'admin' ? 'Administration Login' : 'Trader Identity'}
              </label>
              <div className="relative">
                <input 
                  required
                  className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-[#facc15] transition-all font-bold placeholder:text-neutral-800"
                  placeholder={activeMode === 'admin' ? "Operator Username" : "Email or Operator ID"}
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">
                {activeMode === 'admin' ? 'Administration Password' : 'Secret Token'}
              </label>
              <div className="relative">
                <input 
                  required
                  type="password"
                  className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-white text-sm outline-none focus:border-[#facc15] transition-all font-bold placeholder:text-neutral-800"
                  placeholder="••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl animate-shake">
                <p className="text-red-500 text-[10px] font-black uppercase text-center">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isSyncing}
              className={`w-full py-5 rounded-2xl font-black text-sm transition-all transform active:scale-95 shadow-xl disabled:opacity-50 border-b-[5px] ${
                activeMode === 'admin' 
                ? 'bg-red-600 text-white hover:bg-red-500 border-red-800 shadow-red-500/5' 
                : 'bg-[#facc15] text-black hover:bg-[#eab308] border-yellow-600 shadow-yellow-400/5'
              }`}
            >
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
                <button 
                  onClick={() => handleSocialLogin('google')}
                  className="bg-neutral-900 text-neutral-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-neutral-800 hover:text-white hover:bg-neutral-800 transition-all text-[10px] uppercase tracking-widest group"
                >
                  <Globe size={12} className="group-hover:text-[#facc15]" /> Google
                </button>
                <button 
                  onClick={() => handleSocialLogin('facebook')}
                  className="bg-neutral-900 text-neutral-400 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-neutral-800 hover:text-white hover:bg-neutral-800 transition-all text-[10px] uppercase tracking-widest group"
                >
                  <ShieldCheck size={12} className="group-hover:text-[#facc15]" /> Facebook
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-10 pt-8 text-center bg-neutral-900/20">
          <button 
            onClick={onSwitchToSignup}
            className="text-neutral-600 text-[10px] font-black uppercase hover:text-[#facc15] transition-colors flex items-center justify-center gap-2 mx-auto"
          >
            {activeMode === 'admin' ? "Emergency System Override Only" : "New Node? Generate Credentials"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default Login;
