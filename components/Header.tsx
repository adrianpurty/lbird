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
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

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
    <header className={`h-20 border-b border-neutral-800/40 flex items-center justify-between px-4 md:px-8 bg-black/80 backdrop-blur-xl sticky top-0 z-40 w-full theme-transition shadow-lg`}>
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col">
          <span className="text-neutral-600 text-[10px] font-light uppercase tracking-widest">Market Integrity Node</span>
          <div className="flex items-center gap-2">
            <Activity size={10} className="text-emerald-500/60" />
            <span className="text-emerald-500/60 font-mono text-[10px] tracking-widest font-light uppercase">SYNC_STABLE</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button 
          onClick={onToggleTheme}
          className="p-2.5 bg-black/20 border border-neutral-800/40 text-neutral-500 hover:text-neutral-200 rounded-xl transition-all"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button 
          onClick={onNavigateToWallet}
          className="flex items-center gap-2 bg-black/40 rounded-full px-3 md:px-4 py-1.5 md:py-2 border border-neutral-800/40 hover:border-yellow-200/20 transition-all"
        >
          <Wallet size={14} className="text-yellow-200/60" />
          <span className="font-light text-xs md:text-sm text-neutral-200">${user.balance.toLocaleString()}</span>
        </button>
        
        <div className="relative" ref={notificationMenuRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2.5 rounded-xl border transition-all ${showNotifications ? 'bg-neutral-900/60 border-yellow-200/20 text-neutral-100' : 'border-neutral-800/40 text-neutral-500 hover:text-neutral-200'}`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-200 text-black text-[9px] font-medium flex items-center justify-center rounded-full border border-black shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-[360px] bg-[#080808] border border-neutral-800/60 rounded-[2rem] shadow-2xl overflow-hidden z-50 animate-in zoom-in-95 slide-in-from-top-6">
              <div className="p-6 border-b border-neutral-800/20 flex justify-between items-center bg-black/20">
                <span className="text-[11px] font-light uppercase tracking-[0.2em] text-neutral-400">Live Telemetry</span>
                <button onClick={onClearNotifications} className="text-[9px] font-light uppercase text-neutral-600 hover:text-neutral-200">Purge Logs</button>
              </div>
              <div className="max-h-[480px] overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="p-16 text-center">
                    <p className="text-neutral-700 text-xs font-light uppercase tracking-widest italic">Node Silence</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className="p-5 border-b border-neutral-800/10 flex gap-4 hover:bg-white/[0.01]">
                      <div className="flex-1">
                        <p className="text-neutral-400 text-xs leading-relaxed font-light">{n.message}</p>
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
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 border-l border-neutral-800/40 pl-4 md:pl-6 group transition-all"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-light text-neutral-200 leading-none group-hover:text-yellow-200/70 italic">{user.name}</p>
              <p className="text-[9px] text-neutral-600 uppercase font-light tracking-[0.2em] mt-1.5">{user.role}</p>
            </div>
            <div className={`w-10 h-10 rounded-2xl border-2 transition-all overflow-hidden bg-neutral-900/40 flex items-center justify-center`}>
               {user.profileImage ? <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" /> : <UserCircle size={24} className="text-neutral-700" />}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;