import React, { useState, useRef, useEffect } from 'react';
import { Bell, Wallet, UserCircle, X, Info, CheckCircle, AlertTriangle, Sun, Moon, LogOut, User as UserIcon, ChevronDown, Activity, Settings, Shield } from 'lucide-react';
import { User, Notification } from '../types.ts';

interface HeaderProps {
  user: User;
  notifications: Notification[];
  onClearNotifications: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToWallet?: () => void;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  notifications, 
  onClearNotifications, 
  onNavigateToProfile, 
  onNavigateToWallet,
  onLogout,
  theme, 
  onToggleTheme 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [pulseColor, setPulseColor] = useState('text-emerald-500');
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseColor('text-emerald-400');
      setTimeout(() => setPulseColor('text-emerald-600'), 150);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-20 border-b border-neutral-800 flex items-center justify-between px-4 md:px-8 bg-black/90 backdrop-blur-xl sticky top-0 z-40 w-full theme-transition shadow-2xl">
      <div className="flex items-center gap-4">
        <div className="md:hidden w-8 h-8 bg-[#facc15] rounded-lg flex items-center justify-center">
           <span className="text-black font-black text-xs">LB</span>
        </div>
        <div className="hidden md:flex flex-col">
          <span className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">AI Data Node</span>
          <div className="flex items-center gap-2">
            <Activity size={10} className={`${pulseColor} transition-colors duration-500 shadow-[0_0_8px_rgba(16,185,129,0.2)]`} />
            <span className="text-emerald-500 font-mono text-xs tracking-widest font-bold">SYNC_STABLE</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button 
          onClick={onToggleTheme}
          className="p-2.5 bg-black border border-neutral-800 text-neutral-400 hover:text-white rounded-xl transition-all hover:bg-neutral-900 active:scale-90"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button 
          onClick={onNavigateToWallet}
          className="flex items-center gap-2 bg-black rounded-full px-3 md:px-4 py-1.5 md:py-2 border border-neutral-800 hover:border-[#facc15]/30 transition-all active:scale-95 group shadow-lg"
          title="Open Wallet Settings"
        >
          <Wallet size={14} className="text-[#facc15] group-hover:scale-110 transition-transform" />
          <span className="font-black text-xs md:text-sm text-white">${user.balance.toLocaleString()}</span>
        </button>
        
        <div className="relative" ref={notificationMenuRef}>
          <button 
            onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
            }}
            className={`p-2.5 rounded-xl border transition-all active:scale-90 ${showNotifications ? 'bg-neutral-900 border-[#facc15]/30 text-white' : 'border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#facc15] text-black text-[10px] font-black flex items-center justify-center rounded-full border border-black shadow-lg animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-[360px] bg-[#050505] border border-neutral-800/60 rounded-[2rem] shadow-[0_25px_80px_-20px_rgba(0,0,0,1)] overflow-hidden z-50 animate-in zoom-in-95 slide-in-from-top-6 fade-in duration-300 backdrop-blur-2xl origin-top-right">
              <div className="p-6 border-b border-neutral-800/40 flex justify-between items-center bg-black/40">
                <div className="flex items-center gap-3">
                  <Bell size={16} className="text-[#facc15]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-300">Live Telemetry</span>
                </div>
                <button onClick={onClearNotifications} className="text-[9px] font-black uppercase text-neutral-600 hover:text-white transition-colors tracking-widest">Purge Logs</button>
              </div>
              <div className="max-h-[480px] overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="p-16 text-center space-y-4">
                    <Shield size={32} className="mx-auto text-neutral-800 opacity-20" />
                    <p className="text-neutral-600 text-xs font-black uppercase tracking-widest italic">Node Silence</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-5 border-b border-neutral-800/20 flex gap-4 hover:bg-white/[0.02] transition-all cursor-default ${!n.read ? 'bg-[#facc15]/[0.02]' : ''}`}>
                      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${
                        n.type === 'buy' ? 'bg-blue-950/10 border-blue-900/20 text-blue-500' : 
                        n.type === 'sell' ? 'bg-yellow-950/10 border-yellow-900/20 text-yellow-500' :
                        n.type === 'approval' ? 'bg-emerald-950/10 border-emerald-900/20 text-emerald-500' : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                      }`}>
                        {n.type === 'approval' ? <CheckCircle size={16} /> : n.type === 'buy' ? <Info size={16} /> : <AlertTriangle size={16} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-neutral-200 text-xs leading-relaxed font-medium">{n.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-[8px] text-neutral-600 font-black uppercase tracking-tighter">{n.timestamp}</span>
                           <span className="w-0.5 h-0.5 bg-neutral-800 rounded-full" />
                           <span className="text-[8px] text-neutral-700 font-bold uppercase tracking-widest">{n.type} node</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileMenuRef}>
          <button 
            onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
            }}
            className={`flex items-center gap-3 border-l border-neutral-800 pl-4 md:pl-6 group transition-all outline-none ${showProfileMenu ? 'opacity-100' : 'opacity-80 hover:opacity-100'}`}
            title="Account Menu"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-white leading-none group-hover:text-[#facc15] transition-colors italic tracking-tight">{user.name}</p>
              <p className="text-[9px] text-neutral-600 uppercase font-black tracking-[0.2em] mt-1.5">{user.role}</p>
            </div>
            <div className={`w-10 h-10 rounded-2xl border-2 transition-all overflow-hidden bg-neutral-900 flex items-center justify-center relative shadow-2xl ${showProfileMenu ? 'border-[#facc15] scale-110' : 'border-neutral-800 group-hover:border-neutral-700'}`}>
               {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                  <UserCircle size={24} className="text-neutral-600" />
               )}
            </div>
            <ChevronDown size={14} className={`text-neutral-600 transition-transform duration-500 ${showProfileMenu ? 'rotate-180 text-[#facc15]' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-4 w-64 bg-[#050505] border border-neutral-800/60 rounded-[1.5rem] shadow-[0_25px_80px_-20px_rgba(0,0,0,1)] overflow-hidden z-50 animate-in zoom-in-95 slide-in-from-top-6 fade-in duration-300 backdrop-blur-2xl origin-top-right py-2">
              <div className="px-6 py-4 border-b border-neutral-800/40 mb-2">
                <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-1">Authenticated As</p>
                <p className="text-xs font-bold text-neutral-200 truncate italic">{user.email}</p>
              </div>
              
              <div className="px-2 space-y-1">
                <button 
                  onClick={() => {
                    onNavigateToProfile?.();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 text-neutral-400 hover:text-[#facc15] hover:bg-[#facc15]/5 rounded-xl transition-all text-left group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center group-hover/item:bg-[#facc15]/10 transition-colors">
                    <UserIcon size={16} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">My Identity</span>
                </button>

                <button 
                  onClick={() => {
                    onNavigateToWallet?.();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 text-neutral-400 hover:text-[#facc15] hover:bg-[#facc15]/5 rounded-xl transition-all text-left group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center group-hover/item:bg-[#facc15]/10 transition-colors">
                    <Wallet size={16} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">Vault & API</span>
                </button>

                <button 
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full flex items-center gap-4 px-4 py-3 text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl transition-all text-left group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center group-hover/item:bg-white/5 transition-colors">
                    <Settings size={16} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">Nodes</span>
                </button>
              </div>

              <div className="border-t border-neutral-800/40 my-2 mx-4"></div>

              <div className="px-2">
                <button 
                  onClick={() => {
                    onLogout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 text-neutral-600 hover:text-red-500 hover:bg-red-950/10 rounded-xl transition-all text-left group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 flex items-center justify-center group-hover/item:bg-red-950/20 transition-colors">
                    <LogOut size={16} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">Disconnect</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;