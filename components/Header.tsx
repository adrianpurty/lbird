
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Wallet, UserCircle, X, Info, CheckCircle, AlertTriangle, Sun, Moon, LogOut, User as UserIcon, ChevronDown, Activity, Settings, Shield, Zap } from 'lucide-react';
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
  const [pulseColor, setPulseColor] = useState('text-[#FACC15]/60');
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseColor('text-[#FACC15]');
      setTimeout(() => setPulseColor('text-[#FACC15]/50'), 150);
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
    <header className="h-20 border-b border-[#1A1A1A] flex items-center justify-between px-4 md:px-8 bg-black/80 backdrop-blur-xl sticky top-0 z-40 w-full theme-transition shadow-lg">
      <div className="flex items-center gap-4">
        <div className="md:hidden w-8 h-8 bg-[#FACC15]/10 rounded-lg flex items-center justify-center border border-[#FACC15]/20">
           <span className="text-[#FACC15] font-black text-xs">LB</span>
        </div>
        <div className="hidden md:flex flex-col">
          <span className="text-neutral-600 text-[10px] font-black uppercase tracking-widest">Network_Core</span>
          <div className="flex items-center gap-2">
            <Activity size={10} className={`${pulseColor} transition-colors duration-500`} />
            <span className="text-[#FACC15]/80 font-mono text-[10px] tracking-widest font-black uppercase">SYNC_ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button 
          onClick={onNavigateToWallet}
          className="flex items-center gap-2 bg-[#1A1A1A] rounded-full px-3 md:px-5 py-1.5 md:py-2 border border-[#FACC15]/10 hover:border-[#FACC15]/40 transition-all active:scale-95 group"
        >
          <Wallet size={14} className="text-[#FACC15] group-hover:scale-110 transition-transform" />
          <span className="font-black text-xs md:text-sm text-white tracking-tighter">${user.balance.toLocaleString()}</span>
        </button>
        
        <div className="relative" ref={notificationMenuRef}>
          <button 
            onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
            }}
            className={`p-2.5 rounded-xl border transition-all active:scale-90 ${showNotifications ? 'bg-[#FACC15] border-[#FACC15] text-black' : 'border-[#1A1A1A] text-neutral-500 hover:text-white hover:bg-[#1A1A1A]'}`}
          >
            <Bell size={18} />
            {unreadCount > 0 && !showNotifications && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FACC15] text-black text-[9px] font-black flex items-center justify-center rounded-full border border-black shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-[360px] bg-black border border-[#1A1A1A] rounded-[2rem] shadow-2xl overflow-hidden z-50 animate-in zoom-in-95 slide-in-from-top-6 duration-300 backdrop-blur-2xl origin-top-right">
              <div className="p-6 border-b border-[#1A1A1A] flex justify-between items-center bg-[#1A1A1A]/20">
                <div className="flex items-center gap-3">
                  <Bell size={16} className="text-[#FACC15]" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white">Event Log</span>
                </div>
                <button onClick={onClearNotifications} className="text-[9px] font-black uppercase text-neutral-600 hover:text-white transition-colors tracking-widest">Wipe Log</button>
              </div>
              <div className="max-h-[480px] overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="p-16 text-center space-y-4">
                    <Shield size={32} className="mx-auto text-neutral-900" />
                    <p className="text-neutral-700 text-xs font-black uppercase tracking-widest">Hub_Silent</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-5 border-b border-[#1A1A1A]/40 flex gap-4 hover:bg-[#1A1A1A] transition-all cursor-default ${!n.read ? 'bg-[#FACC15]/5' : ''}`}>
                      <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${
                        !n.read ? 'bg-[#FACC15]/10 border-[#FACC15]/20 text-[#FACC15]' : 'bg-[#1A1A1A] border-[#1A1A1A] text-neutral-600'
                      }`}>
                         <Zap size={16} />
                      </div>
                      <div className="flex-1">
                        <p className="text-neutral-400 text-xs leading-relaxed font-bold uppercase tracking-tight">{n.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-[8px] text-neutral-700 font-black uppercase tracking-widest">{n.timestamp}</span>
                           <span className="w-0.5 h-0.5 bg-neutral-800 rounded-full" />
                           <span className="text-[8px] text-neutral-600 font-black uppercase tracking-widest">HUB_EVT</span>
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
            className={`flex items-center gap-3 border-l border-[#1A1A1A] pl-4 md:pl-6 group transition-all outline-none ${showProfileMenu ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-black text-white leading-none group-hover:text-[#FACC15] transition-colors tracking-tight">{user.name}</p>
              <p className="text-[9px] text-neutral-600 uppercase font-black tracking-[0.2em] mt-1.5">{user.role}</p>
            </div>
            <div className={`w-10 h-10 rounded-2xl border-2 transition-all overflow-hidden bg-[#1A1A1A] flex items-center justify-center relative shadow-xl ${showProfileMenu ? 'border-[#FACC15] scale-110' : 'border-[#1A1A1A] group-hover:border-white/20'}`}>
               {user.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" />
               ) : (
                  <UserCircle size={24} className="text-neutral-600 group-hover:text-[#FACC15] transition-colors" />
               )}
            </div>
            <ChevronDown size={14} className={`text-neutral-800 transition-transform duration-500 ${showProfileMenu ? 'rotate-180 text-[#FACC15]' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-4 w-64 bg-black border border-[#1A1A1A] rounded-[1.5rem] shadow-2xl overflow-hidden z-50 animate-in zoom-in-95 slide-in-from-top-6 duration-300 backdrop-blur-2xl origin-top-right py-2">
              <div className="px-6 py-4 border-b border-[#1A1A1A] mb-2">
                <p className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-1">Identity_Synced</p>
                <p className="text-xs font-black text-white truncate">{user.email}</p>
              </div>
              
              <div className="px-2 space-y-1">
                <button 
                  onClick={() => {
                    onNavigateToProfile?.();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 text-neutral-500 hover:text-[#FACC15] hover:bg-[#1A1A1A] rounded-xl transition-all text-left group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center group-hover/item:bg-[#FACC15] group-hover/item:text-black transition-all">
                    <UserIcon size={16} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">My_Identity</span>
                </button>

                <button 
                  onClick={() => {
                    onNavigateToWallet?.();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 text-neutral-500 hover:text-[#FACC15] hover:bg-[#1A1A1A] rounded-xl transition-all text-left group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center group-hover/item:bg-[#FACC15] group-hover/item:text-black transition-all">
                    <Wallet size={16} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">Vault_Access</span>
                </button>
              </div>

              <div className="border-t border-[#1A1A1A] my-2 mx-4"></div>

              <div className="px-2">
                <button 
                  onClick={() => {
                    onLogout();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 text-neutral-700 hover:text-white hover:bg-white/5 rounded-xl transition-all text-left group/item"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] flex items-center justify-center group-hover/item:bg-white group-hover/item:text-black transition-all">
                    <LogOut size={16} />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest">Terminate</span>
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
