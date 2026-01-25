
import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  User as UserIcon, 
  Loader2, 
  ShieldCheck, 
  Activity,
  Fingerprint,
  Monitor,
  Mail,
  ShieldAlert,
  Rocket,
  Cpu,
  ChevronRight,
  Chrome,
  Facebook,
  ChevronLeft,
  Globe,
  Terminal
} from 'lucide-react';
import { User, OAuthConfig } from '../types.ts';
import { apiService } from '../services/apiService.ts';
import { soundService } from '../services/soundService.ts';

interface SignupProps {
  onSignup: (user: User) => void;
  onSwitchToLogin: () => void;
  authConfig?: OAuthConfig;
}

const Signup: React.FC<SignupProps> = ({ onSignup, onSwitchToLogin, authConfig }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    phone: ''
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState('');

  // Initialize Social SDKs for Provisioning
  useEffect(() => {
    // 1. Google Identity Services
    if (authConfig?.googleEnabled && authConfig.googleClientId) {
      const initGoogle = () => {
        if ((window as any).google) {
          (window as any).google.accounts.id.initialize({
            client_id: authConfig.googleClientId,
            callback: handleGoogleResponse
          });
        }
      };

      if (!(window as any).google) {
        const script = document.createElement('script');
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initGoogle;
        document.head.appendChild(script);
      } else {
        initGoogle();
      }
    }

    // 2. Facebook SDK
    if (authConfig?.facebookEnabled && authConfig.facebookAppId) {
      (window as any).fbAsyncInit = function() {
        (window as any).FB.init({
          appId      : authConfig.facebookAppId,
          cookie     : true,
          xfbml      : true,
          version    : 'v18.0'
        });
      };

      if (!(window as any).FB) {
        const script = document.createElement('script');
        script.src = "https://connect.facebook.net/en_US/sdk.js";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    }
  }, [authConfig]);

  const handleGoogleResponse = async (response: any) => {
    setIsSyncing(true);
    soundService.playClick(true);
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      const syncedUser = await apiService.socialSync({
        name: payload.name,
        email: payload.email,
        profileImage: payload.picture
      });
      
      onSignup({ ...syncedUser, location: "NODE_PROVISION_GOOGLE" } as User);
    } catch (err) {
      setError('PROVISION_ERROR: GOOGLE_SYNC_FAILED');
    } finally {
      setIsSyncing(false);
    }
  };

  const triggerSocialAuth = (provider: 'google' | 'meta') => {
    soundService.playClick(true);
    if (provider === 'google') {
      if (!authConfig?.googleEnabled) {
        setError('PROTOCOL_DISABLED: GOOGLE_SSO_OFFLINE');
        return;
      }
      if ((window as any).google) {
        (window as any).google.accounts.id.prompt();
      } else {
        setError('NETWORK_ERROR: GOOGLE_SDK_OFFLINE');
      }
    } else {
      if (!authConfig?.facebookEnabled) {
        setError('PROTOCOL_DISABLED: META_SSO_OFFLINE');
        return;
      }
      
      if (!(window as any).FB) {
        // Simulation for Meta Handshake if script blocked
        setIsSyncing(true);
        setTimeout(async () => {
          try {
            const syncedUser = await apiService.socialSync({
              name: "Meta Explorer",
              email: "social.node@meta.internal",
              profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
            });
            onSignup({ ...syncedUser, location: "NODE_PROVISION_META_SIM" } as User);
          } catch (err) {
            setError('PROVISION_ERROR: META_SYNC_FAILED');
            setIsSyncing(false);
          }
        }, 1500);
        return;
      }

      (window as any).FB.login(async (response: any) => {
        if (response.authResponse) {
          setIsSyncing(true);
          (window as any).FB.api('/me', { fields: 'name,email,picture' }, async (userData: any) => {
            try {
              const syncedUser = await apiService.socialSync({
                name: userData.name,
                email: userData.email || `${userData.id}@meta.internal`,
                profileImage: userData.picture?.data?.url
              });
              onSignup({ ...syncedUser, location: "NODE_PROVISION_META_LIVE" } as User);
            } catch (err) {
              setError('PROVISION_ERROR: META_DATA_EXTRACT_FAILED');
              setIsSyncing(false);
            }
          });
        } else {
          setError('PROVISION_ABORTED: META_HANDSHAKE_CANCELLED');
        }
      }, { scope: 'public_profile,email' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSyncing(true);
    setError('');
    soundService.playClick(true);

    try {
      const newUser = await apiService.registerUser({
        ...formData,
        ipAddress: "PROVISION_NODE_AUTH",
        deviceInfo: "CMD_TERMINAL_v9"
      });
      onSignup(newUser as User);
    } catch (error) {
      setError("PROVISIONING_FAILED: NODE_CONFLICT");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] flex flex-col items-center justify-start py-12 px-4 md:px-24 overflow-y-auto font-rajdhani">
      
      {/* 1. TOP SECTION: BRANDING */}
      <div className="w-full max-w-[1400px] flex flex-col md:flex-row justify-between items-start md:items-center mb-16">
        <div>
          <h1 className="text-6xl md:text-8xl font-logo italic text-white flex gap-4 items-baseline">
            PROVISION <span className="text-neutral-700">NODE</span>
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <span className="bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] text-[10px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-full">
              IDENTITY_REGISTRATION_V4
            </span>
            <span className="text-neutral-600 text-[10px] font-black uppercase tracking-[0.5em] italic">
              AWAITING_PILOT_SIGNATURE
            </span>
          </div>
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

      {/* 2. MAIN REGISTRATION GRID */}
      <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* LEFT: REGISTRATION FORM */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-8">
           
           {/* Section 1: Personal Signature */}
           <div className="bg-[#0A0A0A] border border-neutral-800 rounded-[2.5rem] p-10 shadow-xl space-y-8">
              <div className="flex items-center gap-4 border-b border-neutral-800 pb-6">
                 <UserIcon className="text-[#2DD4BF]" size={20} />
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.4em]">Section_01: PERSONAL_SIGNATURE</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] px-4 italic">FULL_LEGAL_IDENTITY</label>
                    <input 
                      required
                      className="w-full bg-[#EDF3FF] border-2 border-transparent rounded-2xl px-6 py-4 text-black font-bold outline-none focus:border-[#2DD4BF]/40 transition-all text-lg shadow-inner"
                      placeholder="Enter Pilot Name"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] px-4 italic">COMM_RELAY (EMAIL)</label>
                    <input 
                      required
                      type="email"
                      className="w-full bg-[#EDF3FF] border-2 border-transparent rounded-2xl px-6 py-4 text-black font-bold outline-none focus:border-[#2DD4BF]/40 transition-all text-lg shadow-inner"
                      placeholder="pilot@node.net"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                 </div>
              </div>
           </div>

           {/* Section 2: Security & Callsign */}
           <div className="bg-[#0A0A0A] border border-neutral-800 rounded-[2.5rem] p-10 shadow-xl space-y-8">
              <div className="flex items-center gap-4 border-b border-neutral-800 pb-6">
                 <Terminal className="text-[#2DD4BF]" size={20} />
                 <h3 className="text-xs font-black text-white uppercase tracking-[0.4em]">Section_02: SECURITY_HANDSHAKE</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] px-4 italic">NETWORK_CALLSIGN</label>
                    <input 
                      required
                      className="w-full bg-[#EDF3FF] border-2 border-transparent rounded-2xl px-6 py-4 text-black font-bold outline-none focus:border-[#2DD4BF]/40 transition-all text-lg shadow-inner"
                      placeholder="Username_Node"
                      value={formData.username}
                      onChange={e => setFormData({...formData, username: e.target.value})}
                    />
                 </div>
                 <div className="space-y-3">
                    <label className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] px-4 italic">ACCESS_TOKEN</label>
                    <input 
                      required
                      type="password"
                      className="w-full bg-[#EDF3FF] border-2 border-transparent rounded-2xl px-6 py-4 text-black font-bold outline-none focus:border-[#2DD4BF]/40 transition-all text-lg shadow-inner"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                 </div>
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
        </form>

        {/* RIGHT: REQUIREMENTS & SSO */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-[#0A0A0A] border border-neutral-800 rounded-[2.5rem] p-8 shadow-xl">
            <h4 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.4em] mb-8 border-b border-neutral-800 pb-4">SSO_SYNC</h4>
            <div className="space-y-4">
              <button 
                type="button" 
                onClick={() => triggerSocialAuth('google')}
                disabled={isSyncing}
                className="w-full bg-black border border-neutral-800 p-5 rounded-2xl flex items-center gap-4 hover:border-[#2DD4BF]/40 transition-all text-neutral-500 hover:text-white disabled:opacity-50"
              >
                <Chrome size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Google_Link</span>
              </button>
              <button 
                type="button" 
                onClick={() => triggerSocialAuth('meta')}
                disabled={isSyncing}
                className="w-full bg-black border border-neutral-800 p-5 rounded-2xl flex items-center gap-4 hover:border-[#2DD4BF]/40 transition-all text-neutral-500 hover:text-white disabled:opacity-50"
              >
                <Facebook size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Meta_Link</span>
              </button>
            </div>
          </div>

          <div className="bg-[#0A0A0A] border border-neutral-800 rounded-[2rem] p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#2DD4BF]/10 rounded-2xl flex items-center justify-center text-[#2DD4BF] border border-[#2DD4BF]/20">
                <Cpu size={24} />
              </div>
              <span className="text-[10px] font-black text-white uppercase tracking-widest">NODE_REGULATIONS</span>
            </div>
            <p className="text-[9px] text-neutral-600 font-bold uppercase italic tracking-widest leading-relaxed">
              Provisioning a new node requires biometric validation or dual-protocol SSO handshake. Once provisioned, the identity is hashed into the marketplace root ledger for permanent record.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
