import React, { useState } from 'react';
import { 
  Zap, 
  Mail, 
  User as UserIcon, 
  Lock, 
  Loader2, 
  Globe,
  Facebook,
  AlertTriangle
} from 'lucide-react';
import { User, OAuthConfig } from '../types.ts';
import { authService } from '../services/authService.ts';

interface SignupProps {
  onSignup: (user: User) => void;
  onSwitchToLogin: () => void;
  authConfig?: OAuthConfig;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onSwitchToLogin, authConfig }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setError('');
    try {
      const newUser = await authService.signUp(
        formData.email, 
        formData.password, 
        formData.name
      );
      onSignup(newUser);
    } catch (err: any) {
      setError(err.message || "Registration Failed");
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
        
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-full mx-auto flex items-center justify-center border border-white/20 mb-4">
            <Zap className="text-white fill-white" size={32} />
          </div>
          <h1 className="text-3xl font-futuristic text-white tracking-[0.2em] uppercase">
            LEAD<span className="opacity-40">BID</span> PRO
          </h1>
        </div>

        <div className="glass-panel rounded-[2rem] p-10 md:p-12">
          <div className="mb-10 text-center">
            <h2 className="text-4xl font-bold text-white tracking-tight mb-2">Sign Up</h2>
            <p className="text-neutral-400 text-sm font-medium">Join the high-stakes marketplace.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <input 
                required
                className="ps-input w-full rounded-2xl px-6 py-4 text-white text-lg outline-none placeholder:text-neutral-600" 
                placeholder="Display Name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
              
              <input 
                required 
                type="email"
                className="ps-input w-full rounded-2xl px-6 py-4 text-white text-lg outline-none placeholder:text-neutral-600" 
                placeholder="Email Address" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />

              <input 
                required 
                type="password" 
                className="ps-input w-full rounded-2xl px-6 py-4 text-white text-lg outline-none placeholder:text-neutral-600" 
                placeholder="Password" 
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
              />
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
              {isSyncing ? <Loader2 className="animate-spin" size={24} /> : 'Create Account'}
            </button>
          </form>

          <div className="mt-10 text-center">
             <button onClick={onSwitchToLogin} className="text-neutral-400 text-sm font-bold hover:text-white transition-all underline underline-offset-8 decoration-white/10">
               Existing Member? Sign In
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;