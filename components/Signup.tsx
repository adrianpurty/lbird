import React, { useState } from 'react';
import { Zap, Mail, User as UserIcon, Lock, Phone, Globe, Loader2, ShieldCheck } from 'lucide-react';
import { User } from '../types';
import { apiService } from '../services/apiService';

interface SignupProps {
  onSignup: (user: User) => void;
  onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    phone: ''
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchIpAddress = async (): Promise<string> => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip || '0.0.0.0';
    } catch (err) {
      return '127.0.0.1';
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

    const ip = await fetchIpAddress();
    const deviceInfo = getDeviceInfo();

    try {
      const newUser = await apiService.registerUser({
        name: formData.name,
        email: formData.email,
        username: formData.username,
        password: formData.password,
        phone: formData.phone,
        ipAddress: ip,
        deviceInfo: deviceInfo
      });
      onSignup(newUser as User);
    } catch (error) {
      alert("Registration failed. Please check network protocols.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSocialSignup = async (provider: 'google' | 'facebook') => {
    setIsSyncing(true);
    const ip = await fetchIpAddress();

    try {
      const newUser = await apiService.registerUser({
        name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Explorer`,
        email: `${provider}@social.net`,
        username: `${provider}_${Math.random().toString(36).substr(2, 5)}`,
        password: 'social-auth-token',
        phone: '+1 555-000-0000',
        ipAddress: ip,
        deviceInfo: getDeviceInfo()
      });
      onSignup(newUser as User);
    } catch (error) {
      alert("Social registration failed.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 font-sans relative">
      <div className="w-full max-w-md bg-[#121212] rounded-[3rem] border border-neutral-900 shadow-2xl overflow-hidden p-10 animate-in fade-in zoom-in-95 duration-500">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#facc15] rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-yellow-400/20">
            <Zap className="text-black fill-current w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">Node Initialization</h1>
          <p className="text-neutral-500 text-[10px] mt-1 text-center font-black uppercase tracking-widest opacity-60">Provision your marketplace identity</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button 
            onClick={() => handleSocialSignup('google')}
            disabled={isSyncing}
            className="bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-neutral-800 hover:bg-neutral-900 transition-all text-[10px] uppercase tracking-widest disabled:opacity-50 group"
          >
            <Globe size={14} className="group-hover:text-[#facc15]" /> Google
          </button>
          <button 
            onClick={() => handleSocialSignup('facebook')}
            disabled={isSyncing}
            className="bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-neutral-800 hover:bg-neutral-900 transition-all text-[10px] uppercase tracking-widest disabled:opacity-50 group"
          >
            <ShieldCheck size={14} className="group-hover:text-[#facc15]" /> Facebook
          </button>
        </div>

        <div className="relative flex items-center gap-4 mb-8">
          <div className="flex-1 h-[1px] bg-neutral-800"></div>
          <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">or manual provision</span>
          <div className="flex-1 h-[1px] bg-neutral-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Full Name</label>
            <input 
              required
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#facc15] transition-all font-bold"
              placeholder="John Doe"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Email</label>
              <input 
                required
                type="email"
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#facc15] transition-all font-bold"
                placeholder="john@example.com"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" size={14} />
                <input 
                  required
                  type="tel"
                  className="w-full bg-black border border-neutral-800 rounded-xl pl-9 pr-4 py-3 text-white outline-none focus:border-[#facc15] transition-all font-bold"
                  placeholder="+1 234 567"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Username</label>
              <input 
                required
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#facc15] transition-all font-bold"
                placeholder="johndoe"
                value={formData.username}
                onChange={e => setFormData({...formData, username: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Password</label>
              <input 
                required
                type="password"
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#facc15] transition-all font-bold"
                placeholder="••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSyncing}
            className="w-full bg-[#facc15] text-black py-4 rounded-xl font-black text-sm hover:bg-[#eab308] transition-all mt-4 flex items-center justify-center gap-2 shadow-xl border-b-4 border-yellow-600 active:scale-95 disabled:opacity-50"
          >
            {isSyncing ? <Loader2 className="animate-spin" size={20} /> : 'INITIALIZE NODE'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={onSwitchToLogin}
            className="text-neutral-500 text-[10px] font-black uppercase tracking-widest hover:text-[#facc15] transition-colors"
          >
            Already Provisioned? <span className="font-bold underline">Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;