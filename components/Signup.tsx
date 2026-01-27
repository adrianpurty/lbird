
import React, { useState } from 'react';
import { 
  Zap, 
  Loader2, 
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  Mail,
  Lock
} from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase.ts';
import { soundService } from '../services/soundService.ts';

interface SignupProps {
  onSignup: (user: any) => void;
  onSwitchToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setError('');
    soundService.playClick(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      onSignup(userCredential.user);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('User already exists. Please sign in');
      } else {
        setError('Provisioning failed. Please check your credentials.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] flex flex-col items-center justify-start py-12 px-4 md:px-24 overflow-y-auto font-rajdhani">
      
      <div className="w-full max-w-[1400px] flex flex-col md:flex-row justify-between items-start md:items-center mb-16">
        <div>
          <h1 className="text-6xl md:text-8xl font-logo italic text-white flex gap-4 items-baseline">
            PROVISION <span className="text-neutral-700">NODE</span>
          </h1>
        </div>

        <button 
          onClick={onSwitchToLogin}
          className="mt-8 md:mt-0 bg-[#0A0A0A] border border-neutral-800 p-6 rounded-2xl flex items-center gap-6 shadow-2xl hover:border-[#2DD4BF]/40 transition-all group"
        >
          <div className="w-12 h-12 bg-black rounded-xl border border-neutral-800 flex items-center justify-center text-neutral-600 group-hover:text-white transition-colors">
            <ChevronLeft size={24} />
          </div>
          <div className="text-left">
            <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest block mb-1">TERMINATE_PROVISION</span>
            <span className="text-xl font-bold text-white tracking-widest font-futuristic uppercase">RETURN_TO_ACCESS</span>
          </div>
        </button>
      </div>

      <div className="w-full max-w-2xl">
        <form onSubmit={handleSignup} className="space-y-8">
           <div className="bg-[#0A0A0A] border border-neutral-800 rounded-[2.5rem] p-10 shadow-xl space-y-8">
              <div className="space-y-6">
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] px-4 italic flex items-center gap-2">
                       <Mail size={12} className="text-[#2DD4BF]" /> EMAIL_ENDPOINT
                    </label>
                    <input 
                      required
                      type="email"
                      className="w-full bg-[#EDF3FF] border-2 border-transparent rounded-2xl px-6 py-4 text-black font-bold outline-none focus:border-[#2DD4BF]/40 transition-all text-lg shadow-inner"
                      placeholder="pilot@node.net"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] px-4 italic flex items-center gap-2">
                       <Lock size={12} className="text-[#2DD4BF]" /> ACCESS_TOKEN
                    </label>
                    <input 
                      required
                      type="password"
                      className="w-full bg-[#EDF3FF] border-2 border-transparent rounded-2xl px-6 py-4 text-black font-bold outline-none focus:border-[#2DD4BF]/40 transition-all text-lg shadow-inner"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                 </div>
              </div>

              {error && (
                <div className="flex items-center gap-4 p-6 bg-red-500/10 rounded-2xl border border-red-500/20">
                    <ShieldAlert className="text-red-500" size={24} />
                    <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</span>
                </div>
              )}

              <button 
                type="submit"
                disabled={isSyncing}
                className="w-full bg-black text-white py-8 rounded-[2.5rem] font-black text-3xl flex items-center justify-center gap-6 hover:bg-[#111] transition-all active:scale-95 shadow-2xl border border-neutral-800 font-futuristic italic tracking-widest"
              >
                {isSyncing ? <Loader2 className="animate-spin" size={32} /> : (
                  <>
                    AUTHORIZE_PROVISION <ChevronRight size={32} />
                  </>
                )}
              </button>
           </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
