import React, { useState } from 'react';
import { Zap, ShieldCheck, Lock, User as UserIcon, Loader2 } from 'lucide-react';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  const requestLocation = async (): Promise<string> => {
    return new Promise((resolve) => {
      if (!("geolocation" in navigator)) return resolve("Geo Not Supported");
      
      const timeout = setTimeout(() => resolve("Geo Timeout"), 4000);
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeout);
          resolve(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
        },
        () => {
          clearTimeout(timeout);
          resolve("Geo Denied");
        },
        { timeout: 3500 }
      );
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setError('');
    
    // Explicit admin check requested
    if (username === 'admin' && password === '1234') {
      const location = await requestLocation();
      onLogin({
        id: 'admin_1',
        name: 'System Administrator',
        email: 'admin@leadbid.pro',
        balance: 1000000,
        stripeConnected: true,
        role: 'admin',
        location: location
      });
    } else if (username === 'user' && password === 'user') {
       const location = await requestLocation();
       onLogin({
        id: 'user_mock',
        name: 'Standard Trader',
        email: 'user@example.com',
        balance: 500,
        stripeConnected: false,
        role: 'user',
        location: location
      });
    } else {
      setError('Access Denied: Invalid Terminal Credentials');
    }
    setIsSyncing(false);
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setIsSyncing(true);
    const location = await requestLocation();
    onLogin({
      id: `social_${Math.random().toString(36).substr(2, 9)}`,
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Trader`,
      email: `${provider}@global-network.net`,
      phone: '+1 555-SOCIAL',
      location: location,
      balance: 100,
      stripeConnected: false,
      role: 'user'
    });
    setIsSyncing(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
      <div className="w-full max-w-md bg-[#121212] rounded-[2.5rem] border border-neutral-900 shadow-2xl overflow-hidden p-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-[#facc15] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-yellow-400/20">
            <Zap className="text-black fill-current w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase leading-none">
            LEAD<span className="text-[#facc15]">BID</span>
          </h1>
          <p className="text-neutral-500 text-xs mt-2 font-black uppercase tracking-widest opacity-60">Identity Verification</p>
        </div>

        <div className="space-y-4 mb-8">
          <button 
            onClick={() => handleSocialLogin('google')}
            disabled={isSyncing}
            className="w-full bg-white text-black py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 border border-neutral-200 hover:bg-neutral-100 transition-all text-xs disabled:opacity-50"
          >
            {isSyncing ? <Loader2 className="animate-spin" size={14} /> : <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />}
            Continue with Google
          </button>
          <button 
            onClick={() => handleSocialLogin('facebook')}
            disabled={isSyncing}
            className="w-full bg-[#1877F2] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#166fe5] transition-all text-xs disabled:opacity-50"
          >
            {isSyncing ? <Loader2 className="animate-spin" size={14} /> : <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
            Continue with Facebook
          </button>
        </div>

        <div className="relative flex items-center gap-4 mb-8">
          <div className="flex-1 h-[1px] bg-neutral-800"></div>
          <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Manual Node Login</span>
          <div className="flex-1 h-[1px] bg-neutral-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Access ID</label>
            <input 
              required
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#facc15] transition-all"
              placeholder="admin / user"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Secret Token</label>
            <input 
              required
              type="password"
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#facc15] transition-all"
              placeholder="••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-[10px] font-black uppercase text-center animate-pulse">{error}</p>}

          <button 
            type="submit"
            disabled={isSyncing}
            className="w-full bg-[#facc15] text-black py-4 rounded-xl font-black text-sm hover:bg-[#eab308] transition-all transform active:scale-95 shadow-xl shadow-yellow-400/5 disabled:opacity-50"
          >
            {isSyncing ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'AUTHENTICATE SESSION'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={onSwitchToSignup}
            className="text-neutral-600 text-[10px] font-black uppercase hover:text-[#facc15] transition-colors"
          >
            New Node Operator? <span className="underline ml-1">Generate Key</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;