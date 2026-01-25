
import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  User as UserIcon, 
  Loader2, 
  Fingerprint, 
  ShieldCheck, 
  Activity, 
  Terminal, 
  Lock, 
  ChevronRight,
  Facebook,
  Chrome,
  ShieldAlert,
  Globe
} from 'lucide-react';
import { User, OAuthConfig } from '../types.ts';
import { apiService } from '../services/apiService.ts';
import { soundService } from '../services/soundService.ts';

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

  // Initialize Social SDKs
  useEffect(() => {
    // 1. Google Identity Services
    if (authConfig?.googleEnabled && authConfig.googleClientId) {
      const initGoogle = () => {
        if ((window as any).google) {
          (window as any).google.accounts.id.initialize({
            client_id: authConfig.googleClientId,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true
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
      
      onLogin({ ...syncedUser, location: "NODE_GOOGLE_SYNC" } as User);
    } catch (err) {
      setError('SSO_SYNC_ERROR: GOOGLE_HANDSHAKE_FAILED');
    } finally {
      setIsSyncing(false);
    }
  };

  const triggerGoogleAuth = () => {
    soundService.playClick(true);
    if (!authConfig?.googleEnabled) {
      setError('PROTOCOL_DISABLED: GOOGLE_SSO_OFFLINE');
      return;
    }
    if ((window as any).google) {
      (window as any).google.accounts.id.prompt();
    } else {
      setError('NETWORK_ERROR: GOOGLE_SDK_NOT_LOADED');
    }
  };

  const triggerMetaAuth = () => {
    soundService.playClick(true);
    if (!authConfig?.facebookEnabled) {
      setError('PROTOCOL_DISABLED: META_SSO_OFFLINE');
      return;
    }
    
    if (!(window as any).FB) {
      // Fallback simulation if FB block is present
      setIsSyncing(true);
      setError('');
      setTimeout(async () => {
        try {
          const syncedUser = await apiService.socialSync({
            name: "Meta User",
            email: "social@meta.internal",
            profileImage: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
          });
          onLogin({ ...syncedUser, location: "NODE_META_SIM_SYNC" } as User);
        } catch (err) {
          setError('SSO_SYNC_ERROR: META_HANDSHAKE_FAILED');
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
            onLogin({ ...syncedUser, location: "NODE_META_LIVE_SYNC" } as User);
          } catch (err) {
            setError('SSO_SYNC_ERROR: META_DATA_RETRIEVAL_FAILED');
            setIsSyncing(false);
          }
        });
      } else {
        setError('AUTH_CANCELLED: META_HANDSHAKE_ABORTED');
      }
    }, { scope: 'public_profile,email' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSyncing) return;
    setIsSyncing(true);
    setError('');
    soundService.playClick(true);
    
    try {
      const user = await apiService.authenticateUser(username, password);
      if (user) {
        if (activeMode === 'admin' && user.role !== 'admin') {
          setError('CLEARANCE_ERROR: NODE_UNAUTHORIZED');
          setIsSyncing(false);
          return;
        }
        onLogin({ ...user, location: "AUTHENTICATED_TERMINAL" } as User);
      } else {
        setError('LEDGER_MISMATCH: INVALID_TOKEN');
      }
    } catch (err) {
      setError('NETWORK_LOCKOUT: OFFLINE');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#000000] flex flex-col items-center justify-start py-12 px-4 md:px-24 overflow-y-auto font-rajdhani">
      
      {/* 1. TOP SECTION: BRANDING & NODE ID */}
      <div className="w-full max-w-[1400px] flex flex-col md:flex-row justify-between items-start md:items-center mb-16">
        <div>
          <h1 className="text-6xl md:text-8xl font-logo italic text-white flex gap-4 items-baseline">
            ACCESS <span className="text-neutral-700">NODE</span>
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <span className="bg-[#2DD4BF]/10 border border-[#2DD4BF]/20 text-[#2DD4BF] text-[10px] font-black uppercase tracking-[0.4em] px-4 py-1.5 rounded-full">
              AUTHENTICATION_TERMINAL_V4
            </span>
            <span className="text-neutral-600 text-[10px] font-black uppercase tracking-[0.5em] italic">
              STABLE_CONNECTION // 12MS
            </span>
          </div>
        </div>

        <div className="mt-8 md:mt-0 bg-[#0A0A0A] border border-neutral-800 p-6 rounded-2xl flex items-center gap-6 shadow-2xl">
          <div className="w-12 h-12 bg-[#2DD4BF]/5 border border-[#2DD4BF]/20 rounded-xl flex items-center justify-center text-[#2DD4BF]">
            <Terminal size={24} />
          </div>
          <div>
            <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest block mb-1">NODE_ID</span>
            <span className="text-xl font-bold text-white tracking-widest font-futuristic uppercase">AUTH_HQ_01</span>
          </div>
        </div>
      </div>

      {/* 2. TELEMETRY HUD BAR */}
      <div className="w-full max-w-[1400px] bg-[#0A0A0A] border border-neutral-800/60 rounded-[1.5rem] p-6 mb-12 flex flex-wrap items-center justify-between gap-8 shadow-xl">
        <div className="flex items-center gap-12 overflow-x-auto scrollbar-hide">
          <div className="shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-[0.3em] block mb-1">ACTIVE SESSIONS</span>
            <div className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-2">
              <span className="text-[#2DD4BF]/40 text-xs">#</span> 14,204
            </div>
          </div>
          <div className="shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-[0.3em] block mb-1">INTEGRITY</span>
            <div className="text-2xl font-black text-[#2DD4BF] italic tracking-tighter flex items-center gap-2">
              <ShieldCheck size={14} className="opacity-50" /> 99.9%
            </div>
          </div>
          <div className="shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-[0.3em] block mb-1">AUTH NODES</span>
            <div className="text-2xl font-black text-white italic tracking-tighter">
              8 UNITS
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-[0.3em] block mb-1">SYSTEM PROTOCOL</span>
            <div className="text-xs font-black text-neutral-400 font-mono">V4.2.0_SECURE</div>
          </div>
          <div className="bg-[#2DD4BF]/5 border border-[#2DD4BF]/10 px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 bg-[#2DD4BF] rounded-full animate-pulse shadow-[0_0_8px_#2DD4BF]" />
            <span className="text-[9px] font-black text-[#2DD4BF] uppercase tracking-widest">HANDSHAKE_READY</span>
          </div>
        </div>
      </div>

      {/* 3. MAIN AUTH GRID */}
      <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: MAIN AUTH CARD */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="bg-[#0A0A0A] border border-neutral-800 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group shadow-2xl">
            {/* Background Fingerprint decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
              <Fingerprint size={400} className="text-[#2DD4BF]" />
            </div>

            <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
              {/* Mode Toggle */}
              <div className="flex justify-center">
                <div className="bg-black/50 border border-neutral-800 p-1 rounded-2xl flex w-full max-w-[280px]">
                  <button 
                    type="button"
                    onClick={() => setActiveMode('trader')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeMode === 'trader' ? 'bg-white text-black shadow-lg' : 'text-neutral-600 hover:text-white'}`}
                  >
                    <UserIcon size={12} /> TRADER
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveMode('admin')}
                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${activeMode === 'admin' ? 'bg-white text-black shadow-lg' : 'text-neutral-600 hover:text-white'}`}
                  >
                    <ShieldCheck size={12} /> ADMIN
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                {/* Identity Input */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] px-4 italic flex items-center gap-3">
                    <Zap size={12} className="text-[#2DD4BF]" /> IDENTITY_SIGNATURE
                  </label>
                  <div className="relative group">
                    <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-[#2DD4BF] transition-colors" size={20} />
                    <input 
                      required
                      type="text"
                      autoComplete="username"
                      className="w-full bg-[#EDF3FF] border-2 border-transparent rounded-2xl pl-16 pr-8 py-5 text-black font-bold outline-none focus:border-[#2DD4BF]/40 transition-all text-xl placeholder:text-neutral-400 shadow-inner"
                      placeholder={activeMode === 'trader' ? "PILOT_ID" : "ADMIN_KEY"}
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                    />
                  </div>
                </div>

                {/* Token Input */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] px-4 italic flex items-center gap-3">
                    <Lock size={12} className="text-[#2DD4BF]" /> AUTH_TOKEN
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-[#2DD4BF] transition-colors" size={20} />
                    <input 
                      required
                      type="password"
                      autoComplete="current-password"
                      className="w-full bg-[#EDF3FF] border-2 border-transparent rounded-2xl pl-16 pr-8 py-5 text-black font-bold outline-none focus:border-[#2DD4BF]/40 transition-all text-xl placeholder:text-neutral-400 shadow-inner"
                      placeholder="••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-4 p-5 bg-red-500/10 rounded-2xl border border-red-500/20">
                  <ShieldAlert className="text-red-500" size={20} />
                  <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">{error}</span>
                </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isSyncing}
                  className="w-full bg-black text-white py-7 rounded-[2rem] font-black text-3xl flex items-center justify-center gap-6 hover:bg-[#111] transition-all active:scale-95 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-neutral-800 group/btn font-futuristic italic tracking-widest"
                >
                  {isSyncing ? <Loader2 className="animate-spin" size={28} /> : (
                    <>
                      INITIALIZE_AUTH <ChevronRight size={32} className="group-hover/btn:translate-x-2 transition-transform" />
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-between items-center px-4">
                <button 
                  type="button" 
                  onClick={() => { soundService.playClick(); onSwitchToSignup(); }}
                  className="text-neutral-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  PROVISION NEW NODE
                </button>
                <button 
                  type="button" 
                  className="text-neutral-600 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                >
                  RECOVERY_SYNC
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT: SSO & PROTOCOL CARDS */}
        <div className="lg:col-span-5 space-y-8">
          {/* SSO Card */}
          <div className="bg-[#0A0A0A] border border-neutral-800 rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.4em] flex items-center gap-3">
                <Globe size={16} className="text-[#2DD4BF]" /> SSO_PROTOCOLS
              </h3>
              <div className="w-2 h-2 bg-[#2DD4BF] rounded-full animate-pulse shadow-[0_0_8px_#2DD4BF]" />
            </div>

            <div className="space-y-4">
              <button 
                type="button"
                onClick={triggerGoogleAuth}
                disabled={isSyncing}
                className="w-full bg-[#050505] border border-neutral-800 hover:border-[#2DD4BF]/40 p-6 rounded-2xl flex items-center justify-between transition-all group/item disabled:opacity-50"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-black rounded-xl border border-neutral-800 flex items-center justify-center group-hover/item:border-[#2DD4BF]/40">
                    <Chrome size={24} className="text-neutral-600 group-hover/item:text-white" />
                  </div>
                  <div className="text-left">
                    <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">AUTH_PROVIDER_01</span>
                    <span className="text-lg font-black text-neutral-400 group-hover/item:text-white italic uppercase tracking-tighter">GOOGLE_HANDSHAKE</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-neutral-800 group-hover/item:text-[#2DD4BF]" />
              </button>

              <button 
                type="button"
                onClick={triggerMetaAuth}
                disabled={isSyncing}
                className="w-full bg-[#050505] border border-neutral-800 hover:border-[#2DD4BF]/40 p-6 rounded-2xl flex items-center justify-between transition-all group/item disabled:opacity-50"
              >
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 bg-black rounded-xl border border-neutral-800 flex items-center justify-center group-hover/item:border-[#2DD4BF]/40">
                    <Facebook size={24} className="text-neutral-600 group-hover/item:text-white" />
                  </div>
                  <div className="text-left">
                    <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">AUTH_PROVIDER_02</span>
                    <span className="text-lg font-black text-neutral-400 group-hover/item:text-white italic uppercase tracking-tighter">META_IDENTITY</span>
                  </div>
                </div>
                <ChevronRight size={20} className="text-neutral-800 group-hover/item:text-[#2DD4BF]" />
              </button>
            </div>
          </div>

          {/* Ledger Protocol Card */}
          <div className="bg-[#0A0A0A] border border-neutral-800 rounded-[2rem] p-8 flex items-start gap-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <Activity size={100} className="text-neutral-100" />
            </div>
            <div className="w-12 h-12 bg-[#2DD4BF]/10 rounded-2xl flex items-center justify-center text-[#2DD4BF] shrink-0 border border-[#2DD4BF]/20">
              <ShieldCheck size={24} />
            </div>
            <div className="space-y-2">
              <h4 className="text-[10px] font-black text-white uppercase tracking-widest">LEDGER_PROTOCOL_ACTIVE</h4>
              <p className="text-[9px] text-neutral-600 leading-relaxed font-bold uppercase tracking-widest italic">
                Identity authentication is cryptographically verified against the marketplace root ledger. Unauthorized access attempts are automatically logged and routed to system auditing nodes for immediate IP isolation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER METADATA */}
      <div className="mt-16 w-full max-w-[1400px] flex justify-between items-center px-4 text-[8px] font-black text-neutral-700 uppercase tracking-[0.4em] italic">
        <div className="flex items-center gap-3">
          <Activity size={10} className="text-[#2DD4BF] animate-pulse" />
          <span>LINK_STABLE_V4</span>
        </div>
        <span>LEAD_BID_ENTERPRISE_NODE_HYB_22</span>
      </div>
    </div>
  );
};

export default Login;
