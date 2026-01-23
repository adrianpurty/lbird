
import React, { useState } from 'react';
import { Zap, Mail, User as UserIcon, Lock, Phone, MapPin, Loader2 } from 'lucide-react';
import { User } from '../types';

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
  const [isLocating, setIsLocating] = useState(false);

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let device = "Desktop";
    if (/Mobi|Android/i.test(ua)) device = "Mobile";
    if (/Tablet|iPad/i.test(ua)) device = "Tablet";
    return `${device} | ${navigator.platform} | ${navigator.language}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLocating(true);

    let location = 'Unknown';
    try {
      if ("geolocation" in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        location = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
      }
    } catch (err) {
      console.warn("Location access denied or unavailable.");
    }

    onSignup({
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      location: location,
      balance: 0,
      stripeConnected: false,
      role: 'user',
      deviceInfo: getDeviceInfo()
    });
    setIsLocating(false);
  };

  const handleSocialSignup = async (provider: 'google' | 'facebook') => {
    setIsLocating(true);
    let location = 'Unknown';
    try {
      if ("geolocation" in navigator) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        location = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`;
      }
    } catch (err) {}

    onSignup({
      id: `social_${Math.random().toString(36).substr(2, 9)}`,
      name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} Explorer`,
      email: `${provider}@social.net`,
      phone: '+1 555-000-0000',
      location: location,
      balance: 100,
      stripeConnected: false,
      role: 'user',
      deviceInfo: getDeviceInfo()
    });
    setIsLocating(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4">
      <div className="w-full max-w-md bg-[#121212] rounded-3xl border border-neutral-900 shadow-2xl overflow-hidden p-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-[#facc15] rounded-2xl flex items-center justify-center mb-4">
            <Zap className="text-black fill-current w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Join LeadBid</h1>
          <p className="text-neutral-500 text-sm mt-1 text-center px-4">Create your account to start bidding on verified leads.</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button 
            onClick={() => handleSocialSignup('google')}
            disabled={isLocating}
            className="bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-neutral-800 hover:bg-neutral-900 transition-all text-xs disabled:opacity-50 shadow-lg"
          >
            {isLocating ? <Loader2 className="animate-spin" size={14} /> : <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />}
            Google
          </button>
          <button 
            onClick={() => handleSocialSignup('facebook')}
            disabled={isLocating}
            className="bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 border border-neutral-800 hover:bg-neutral-900 transition-all text-xs disabled:opacity-50 shadow-lg"
          >
            {isLocating ? <Loader2 className="animate-spin" size={14} /> : <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>}
            Facebook
          </button>
        </div>

        <div className="relative flex items-center gap-4 mb-8">
          <div className="flex-1 h-[1px] bg-neutral-800"></div>
          <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">or manual signup</span>
          <div className="flex-1 h-[1px] bg-neutral-800"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Full Name</label>
            <input 
              required
              className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#facc15] transition-all"
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
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#facc15] transition-all"
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
                  className="w-full bg-black border border-neutral-800 rounded-xl pl-9 pr-4 py-3 text-white outline-none focus:border-[#facc15] transition-all"
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
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#facc15] transition-all"
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
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white outline-none focus:border-[#facc15] transition-all"
                placeholder="••••"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLocating}
            className="w-full bg-[#facc15] text-black py-4 rounded-xl font-black text-lg hover:bg-[#eab308] transition-all mt-4 flex items-center justify-center gap-2"
          >
            {isLocating ? <Loader2 className="animate-spin" size={20} /> : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={onSwitchToLogin}
            className="text-neutral-500 text-sm hover:text-[#facc15] transition-colors"
          >
            Already have an account? <span className="font-bold underline">Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signup;
