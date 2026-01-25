import React, { useState, useEffect } from 'react';
import { Zap, ShieldCheck, Lock, User as UserIcon, Loader2, Cpu, Globe, AlertTriangle, Facebook } from 'lucide-react';
import { User, OAuthConfig } from '../types.ts';
import { apiService } from '../services/apiService.ts';

interface LoginProps {
  onLogin: (user: User) => void;
  onSwitchToSignup: () => void;
  authConfig?: OAuthConfig;
}

const LOCATION_REQUESTED_KEY = 'lb_location_requested_v1';
const LAST_KNOWN_LOCATION_KEY = 'lb_last_known_loc';

const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup, authConfig }) => {
  const [activeMode, setActiveMode] = useState<'trader' | 'admin'>('trader');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSdkLoaded, setIsSdkLoaded] = useState({ google: false, facebook: false });

  // Dynamically load Social SDKs
  useEffect(() => {
    if (authConfig?.googleEnabled && authConfig.googleClientId) {
      if (!document.getElementById('google-jssdk')) {
        const script = document.createElement('script');
        script.id = 'google-jssdk';
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          setIsSdkLoaded(prev => ({ ...prev, google: true }));
          (window as any).google?.accounts.id.initialize({
            client_id: authConfig.googleClientId,
            callback: handleGoogleResponse,
          });
        };
        document.head.appendChild(script);
      } else {
        (window as any).google?.accounts.id.initialize({
          client_id: authConfig.googleClientId,
          callback: handleGoogleResponse,
        });
      }
    }

    if (authConfig?.facebookEnabled && authConfig.facebookAppId) {
      if (!document.getElementById('facebook-jssdk')) {
        const script = document.createElement('script');
        script.id = 'facebook-jssdk';
        script.src = "https://connect.facebook.net/en_US/sdk.js";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          setIsSdkLoaded(prev => ({ ...prev, facebook: true }));
          (window as any).FB.init({
            appId: authConfig.facebookAppId,
            cookie: true,
            xfbml: true,
            version: 'v18.0'
          });
        };
        document.head.appendChild(script);
      } else {
        (window as any).FB?.init({
          appId: authConfig.facebookAppId,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
      }
    }
  }, [authConfig]);

  const handleGoogleResponse = async (response: any) => {
    setIsSyncing(true);
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));

      const syncedUser = await apiService.socialSync({
        name: payload.name,
        email: payload.email,
        profileImage: payload.picture
      });

      const location = await requestLocation();
      onLogin({ ...syncedUser, location, deviceInfo: getDeviceInfo() } as User);
    } catch (err) {
      setError('Google Sync Failed');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFacebookLogin = () => {
    if (!(window as any).FB) {
      setError('Meta SDK Not Ready');
      return;
    }

    setIsSyncing(true);
    (window as any).FB.login(async (response: any) => {
      if (response.authResponse) {
        (window as any).FB.api('/me', { fields: 'name,email,picture' }, async (userData: any) => {
          try {
            const syncedUser = await apiService.socialSync({
              name: userData.name,
              email: userData.email,
              profileImage: userData.picture?.data?.url
            });
            const location = await requestLocation();
            onLogin({ ...syncedUser, location, deviceInfo: getDeviceInfo() } as User);
          } catch (err) {
            setError('Meta Sync Failed');
            setIsSyncing(false);
          }
        });
      } else {
        setError('Meta Login Canceled');
        setIsSyncing(false);
      }
    }, { scope: 'public_profile,email' });
  };

  const handleGoogleClick = () => {
    if (!(window as any).google) {
      setError('Google SDK Not Ready');
      return;
    }
    (window as any).google.accounts.id.prompt();
  };

  const requestLocation = async (): Promise<string> => {
    return new Promise((resolve) => {
      const hasRequested = localStorage.getItem(LOCATION_REQUESTED_KEY);
      const cachedLoc = localStorage.getItem(LAST_KNOWN_LOCATION_KEY);
      
      if (hasRequested && cachedLoc) return resolve(cachedLoc);
      if (!("geolocation" in navigator)) return resolve("N/A");
      
      localStorage.setItem(LOCATION_REQUESTED_KEY, 'true');
      const timeout = setTimeout(() => resolve(cachedLoc || "Timeout"), 1000);
      
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          clearTimeout(timeout);
          const coords = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
          localStorage.setItem(LAST_KNOWN_LOCATION_KEY, coords);
          resolve(coords);
        },
        () => {
          clearTimeout(timeout);
          resolve(cachedLoc || "Denied");
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
          setError('Access Denied');
          setIsSyncing(false);
          return;
        }

        const location = await requestLocation();
        const deviceInfo = getDeviceInfo();
        onLogin({ ...user, location, deviceInfo } as User);
      } else {
        setError('Invalid Auth');
      }
    } catch (err) {
      setError('System Error');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4 font-sans relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <video 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover filter blur-[10px] scale-105 opacity-40"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-financial-data-on-a-monitor-screen-in-close-up-1738-large.mp4" type="video/mp4" />
        </video>
      </div>

      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none z-1">
        <div className="absolute top-1/4 left-1/4 w-[22rem] h-[22rem] bg-[#facc15] rounded-full blur-[100px] opacity-20" />
      </div>

      <div className="w-full max-w-[21rem] bg-[#0a0a0a]/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="p-8 pb-4 text-center">
          <div className="inline-flex p-3 bg-[#facc15]/10 rounded-2xl border border-[#facc15]/20 mb-4 group hover:scale-110 transition-transform duration-500">
            <Zap className="text-[#facc15] fill-[#facc15] w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic leading-none">
            LEAD<span className="text-[#facc15]">BID</span>
          </h1>
          <p className="text-neutral-500 text-[9px] mt-2 font-black uppercase tracking-[0.3em] italic opacity-60">Identity Node Required</p>
        </div>

        <div className="px-8">
          <div className="flex bg-black/40 border border-neutral-900 rounded-xl p-1 mb-6">
            <button type="button" onClick={() => setActiveMode('trader')} className={`flex-1 py-2 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all ${activeMode === 'trader' ? 'bg-[#facc15] text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}>Trader</button>
            <button type="button" onClick={() => setActiveMode('admin')} className={`flex-1 py-2 rounded-lg font-black text-[9px] uppercase tracking-wider transition-all ${activeMode === 'admin' ? 'bg-white text-black shadow-lg' : 'text-neutral-500 hover:text-white'}`}>Admin</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pb-2">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Identity</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={14} />
                <input required className="w-full bg-black/40 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-[#facc15] transition-all font-bold placeholder:text-neutral-800" placeholder="ID" value={username} onChange={e => setUsername(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-neutral-600 uppercase tracking-widest px-1">Token</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" size={14} />
                <input required type="password" className="w-full bg-black/40 border border-neutral-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white outline-none focus:border-[#facc15] transition-all font-bold placeholder:text-neutral-800" placeholder="••••" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 p-2 rounded-lg flex items-center gap-2 border border-red-500/20 animate-shake">
                <AlertTriangle size={12} className="text-red-500" />
                <p className="text-red-600 text-[8px] font-black uppercase tracking-wide">{error}</p>
              </div>
            )}

            <button type="submit" disabled={isSyncing} className={`w-full py-4 rounded-xl font-black text-xs transition-all transform active:scale-[0.98] shadow-xl disabled:opacity-50 border-b-4 mt-2 ${activeMode === 'admin' ? 'bg-white text-black border-neutral-300' : 'bg-[#facc15] text-black border-yellow-700'}`}>
              {isSyncing ? <Loader2 className="animate-spin mx-auto text-black" size={16} /> : 'INITIALIZE'}
            </button>
          </form>

          {activeMode === 'trader' && (
            <div className="mt-6 space-y-4 pb-10">
              <div className="relative flex items-center gap-4">
                <div className="flex-1 h-[1px] bg-neutral-900"></div>
                <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">SSO HANDSHAKE</span>
                <div className="flex-1 h-[1px] bg-neutral-900"></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={handleGoogleClick} 
                  disabled={!authConfig?.googleEnabled || isSyncing}
                  className="py-3 rounded-lg font-bold flex items-center justify-center gap-2 border border-neutral-900 text-white hover:bg-neutral-800/50 transition-all text-[9px] uppercase disabled:opacity-20"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-3 h-3" /> Google
                </button>
                <button 
                  onClick={handleFacebookLogin} 
                  disabled={!authConfig?.facebookEnabled || isSyncing}
                  className="py-3 rounded-lg font-bold flex items-center justify-center gap-2 border border-neutral-900 text-white hover:bg-neutral-800/50 transition-all text-[9px] uppercase disabled:opacity-20"
                >
                  <Facebook size={14} className="text-[#1877F2]" fill="currentColor" /> Meta
                </button>
              </div>
              <p className="text-center">
                 <button onClick={onSwitchToSignup} className="text-neutral-600 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">
                   <span className="text-[#facc15] underline">New Node Registration</span>
                 </button>
              </p>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </div>
  );
};

export default Login;