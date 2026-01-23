import React, { useState } from 'react';
import { Bell, Wallet, UserCircle, X, Info, CheckCircle, AlertTriangle, Sun, Moon } from 'lucide-react';
import { User, Notification } from '../types';

interface HeaderProps {
  user: User;
  notifications: Notification[];
  onClearNotifications: () => void;
  onNavigateToProfile?: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, notifications, onClearNotifications, onNavigateToProfile, theme, onToggleTheme }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-20 border-b border-[var(--border-main)] flex items-center justify-between px-4 md:px-8 bg-[var(--bg-surface)] backdrop-blur-xl sticky top-0 z-40 w-full theme-transition">
      <div className="flex items-center gap-4">
        <div className="md:hidden w-8 h-8 bg-[var(--text-accent)] rounded-lg flex items-center justify-center">
           <span className="text-black font-black text-xs">LB</span>
        </div>
        <div className="hidden md:flex flex-col">
          <span className="text-neutral-600 text-[10px] font-black uppercase tracking-widest">Platform Status</span>
          <span className="text-emerald-500 font-mono text-xs tracking-widest">GATEWAY_ACTIVE</span>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <button 
          onClick={onToggleTheme}
          className="p-2.5 bg-neutral-100 dark:bg-neutral-900 text-neutral-500 hover:text-[var(--text-accent)] rounded-xl transition-all border border-[var(--border-main)]"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="flex items-center gap-2 bg-neutral-100 dark:bg-[#121212] rounded-full px-3 md:px-4 py-1.5 md:py-2 border border-[var(--border-main)]">
          <Wallet size={14} className="text-[var(--text-accent)]" />
          <span className="font-black text-xs md:text-sm text-[var(--text-main)]">${user.balance.toLocaleString()}</span>
        </div>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-neutral-500 hover:text-[var(--text-accent)] transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-4 w-80 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-3xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <div className="p-4 border-b border-[var(--border-main)] flex justify-between items-center bg-black/5 dark:bg-black/40">
                <span className="text-xs font-black uppercase tracking-widest text-[var(--text-accent)]">Activity Logs</span>
                <button onClick={onClearNotifications} className="text-[10px] font-black uppercase text-neutral-500 hover:text-[var(--text-main)]">Clear All</button>
              </div>
              <div className="max-h-96 overflow-y-auto scrollbar-hide">
                {notifications.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-neutral-600 text-xs italic">No activity logs yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div key={n.id} className={`p-4 border-b border-[var(--border-main)]/50 flex gap-3 hover:bg-black/5 transition-colors ${!n.read ? 'bg-black/5' : ''}`}>
                      <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        n.type === 'buy' ? 'bg-blue-500/10 text-blue-500' : 
                        n.type === 'sell' ? 'bg-yellow-500/10 text-yellow-500' :
                        n.type === 'approval' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-neutral-500/10 text-neutral-500'
                      }`}>
                        {n.type === 'approval' ? <CheckCircle size={14} /> : n.type === 'buy' ? <Info size={14} /> : <AlertTriangle size={14} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-[var(--text-main)] text-xs leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-neutral-600 font-bold uppercase mt-1 block">{n.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={onNavigateToProfile}
          className="flex items-center gap-3 border-l border-[var(--border-main)] pl-4 md:pl-6 group hover:opacity-80 transition-opacity text-left"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[var(--text-main)] leading-none group-hover:text-[var(--text-accent)] transition-colors">{user.name}</p>
            <p className="text-[10px] text-neutral-600 uppercase font-black tracking-tighter">{user.role}</p>
          </div>
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border border-[var(--border-main)] overflow-hidden bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center text-neutral-500 group-hover:border-[var(--text-accent)]/30 transition-colors">
             {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
             ) : (
                <UserCircle size={24} />
             )}
          </div>
        </button>
      </div>
    </header>
  );
};

export default Header;