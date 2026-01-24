import React, { useState, useRef, useEffect } from 'react';
import { Bell, Wallet, UserCircle, X, Info, CheckCircle, AlertTriangle, Sun, Moon, LogOut, User as UserIcon, ChevronDown, Activity } from 'lucide-react';
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
    <header className="h-20 border-b border-neutral-800 flex items-center justify-between px-4 md:px-8 bg-[#070707] sticky top-0 z-40 w-full theme-transition shadow-2xl">
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
          className="p-2.5 bg-neutral-900 text-neutral-300 hover:text-white rounded-xl transition-all border border-neutral-700"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button 
          onClick={onNavigateToWallet}
          className="flex items-center gap-2 bg-black rounded-full px-3 md:px-4 py-1.5 md:py-2 border border-neutral-700 hover:border-[#facc15]/50 transition-all active:scale-95 group shadow-lg"
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
            className="p-2 text-neutral-400 hover:text-white transition-colors relative"
            title="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white text-[10px] font-black flex items-center justify-center rounded-full border border-black shadow-lg">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-80 bg-[#0f0f0f] border border-neutral-700 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-neutral-800 flex justify-between items-center bg-black/40">
                <span className="text-xs font-black uppercase tracking-widest text-[#facc15]">Activity Logs</span>
                <button onClick={onClearNotifications} className="text-[10px] font-black uppercase text-neutral-500 hover:text-white">Clear All</button>
              </div>
              <div className="max-h-96 overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-neutral-500 text-xs italic">No activity logs yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-4 border-b border-neutral-800 flex gap-3 hover:bg-white/5 transition-colors ${!n.read ? 'bg-white/5' : ''}`}>
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        n.type === 'buy' ? 'bg-blue-600/20 text-blue-500' : 
                        n.type === 'sell' ? 'bg-yellow-600/20 text-yellow-500' :
                        n.type === 'approval' ? 'bg-emerald-600/20 text-emerald-500' : 'bg-neutral-700/20 text-neutral-400'
                      }`}>
                        {n.type === 'approval' ? <CheckCircle size={14} /> : n.type === 'buy' ? <Info size={14} /> : <AlertTriangle size={14} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-neutral-200 text-xs leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-neutral-500 font-bold uppercase mt-1 block">{n.timestamp}</span>
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
            className="flex items-center gap-3 border-l border-neutral-800 pl-4 md:pl-6 group hover:opacity-100 transition-all text-left outline-none"
            title="Account Menu"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-white leading-none group-hover:text-[#facc15] transition-colors">{user.name}</p>
              <p className="text-[10px] text-neutral-500 uppercase font-black tracking-tighter mt-1">{user.role}</p>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-neutral-700 overflow-hidden bg-neutral-800 flex items-center justify-center text-neutral-300 group-hover:border-[#facc15] transition-colors relative shadow-inner">
               {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                  <UserCircle size={24} />
               )}
            </div>
            <ChevronDown size={14} className={`text-neutral-500 transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-4 w-56 bg-[#0f0f0f] border border-neutral-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 py-2">
              <div className="px-4 py-3 border-b border-neutral-800 mb-1">
                <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Session Identity</p>
                <p className="text-xs font-bold text-white truncate mt-0.5">{user.email}</p>
              </div>
              
              <button 
                onClick={() => {
                  onNavigateToProfile?.();
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-neutral-300 hover:text-white hover:bg-white/5 transition-all text-left"
              >
                <UserIcon size={16} className="text-[#facc15]" />
                <span className="text-xs font-bold">My Identity</span>
              </button>

              <button 
                onClick={() => {
                  onNavigateToWallet?.();
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-neutral-300 hover:text-white hover:bg-white/5 transition-all text-left"
              >
                <Wallet size={16} className="text-[#facc15]" />
                <span className="text-xs font-bold">Wallet & Billing</span>
              </button>

              <div className="border-t border-neutral-800 my-1"></div>

              <button 
                onClick={() => {
                  onLogout();
                  setShowProfileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-950/30 transition-all text-left"
              >
                <LogOut size={16} />
                <span className="text-xs font-bold">Sign Out Session</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;