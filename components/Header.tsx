import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  Wallet, 
  UserCircle, 
  Activity, 
  ChevronDown, 
  Zap, 
  LayoutGrid, 
  Heart, 
  PlusCircle, 
  ShieldAlert, 
  Settings, 
  Lock, 
  Database,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { User, Notification, UserRole } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface HeaderProps {
  user: User;
  notifications: Notification[];
  onClearNotifications: () => void;
  onLogout: () => void;
  onProfileClick: () => void;
  activeTab: string;
  onTabChange: (tab: any) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  user, 
  notifications, 
  onClearNotifications, 
  onLogout, 
  onProfileClick,
  activeTab,
  onTabChange
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const notificationMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const menuItems = [
    { id: 'market', icon: LayoutGrid, label: 'SALES_FLOOR', roles: ['admin', 'user'] },
    { id: 'action-center', icon: Activity, label: 'ACTION_CENTER', roles: ['admin', 'user'] },
    { id: 'wishlist', icon: Heart, label: 'SAVED_ASSETS', roles: ['admin', 'user'] },
    { id: 'create', icon: PlusCircle, label: 'ASSET_PROVISION', roles: ['admin', 'user'] },
    { id: 'admin', icon: ShieldAlert, label: 'CONTROL_CENTER', roles: ['admin'] },
    { id: 'payment-config', icon: Settings, label: 'GATEWAY_CONFIG', roles: ['admin'] },
    { id: 'auth-config', icon: Lock, label: 'AUTH_INFRA', roles: ['admin'] },
    { id: 'settings', icon: Database, label: 'VAULT_API', roles: ['admin', 'user'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(user?.role));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 border-b border-bright bg-surface/80 backdrop-blur-xl sticky top-0 z-50 w-full flex items-center transition-all">
      <div className="w-full px-3 md:px-6 flex items-center justify-between gap-2 md:gap-8">
        
        {/* BRANDING NODE */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0 cursor-pointer group" onClick={() => onTabChange('market')}>
          <div className="w-7 h-7 bg-main rounded flex items-center justify-center shadow-lg shrink-0 transition-colors">
            <Zap className="text-surface" size={14} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="text-base md:text-lg font-futuristic text-main leading-none tracking-tighter uppercase">
              LEAD<span className="text-dim">BID</span>
            </span>
            <span className="hidden md:block text-[6px] text-dim font-black uppercase tracking-[0.4em] mt-0.5 italic">
              ROOT_ACCESS
            </span>
          </div>
        </div>

        {/* HORIZONTAL MENU - HIDDEN ON MOBILE */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-1 overflow-x-auto scrollbar-hide">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => { soundService.playClick(); onTabChange(item.id); }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded transition-all duration-200 group relative border border-transparent ${
                activeTab === item.id 
                  ? 'text-main' 
                  : 'text-dim hover:text-main'
              }`}
            >
              <item.icon size={13} className={`${activeTab === item.id ? (item.id.includes('admin') || item.id.includes('config') ? 'text-red-500' : 'text-accent') : 'text-dim group-hover:text-main'}`} />
              <span className="text-[10px] tracking-[0.1em] font-semibold uppercase whitespace-nowrap">
                {item.label}
              </span>
              {activeTab === item.id && (
                <div className={`absolute -bottom-[18px] left-0 right-0 h-0.5 shadow-[0_0_10px_currentColor] ${item.id.includes('admin') || item.id.includes('config') ? 'bg-red-500' : 'bg-accent'}`} />
              )}
            </button>
          ))}
        </nav>

        {/* UTILITY ACTIONS Cluster */}
        <div className="flex items-center gap-1.5 md:gap-4 shrink-0">
          <button 
            onClick={() => { soundService.playClick(); onTabChange('settings'); }}
            className="flex items-center bg-card rounded-lg px-2 md:px-3 py-1.5 border border-bright gap-1.5 md:gap-3 hover:border-accent/40 hover:bg-surface transition-all cursor-pointer group"
          >
            <Wallet size={12} className="text-dim group-hover:text-accent transition-colors" />
            <span className="font-tactical text-base md:text-lg text-main tracking-widest leading-none group-hover:text-glow">
              ${user.balance?.toLocaleString() || '0'}
            </span>
          </button>
          
          <div className="relative" ref={notificationMenuRef}>
            <button onClick={() => { soundService.playClick(); setShowNotifications(!showNotifications); }} className="p-1.5 md:p-2 text-dim hover:text-main relative">
              <Bell size={18} />
              {unreadCount > 0 && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full border border-surface" />}
            </button>

            {showNotifications && (
              <div className="absolute right-[-40px] md:right-0 mt-4 w-72 bg-card border border-bright rounded-xl shadow-2xl overflow-hidden z-50 animate-in zoom-in-95 glass-panel">
                <div className="p-4 border-b border-bright bg-surface/40 flex justify-between items-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-dim">TELEMETRY_LOG</span>
                  <button onClick={onClearNotifications} className="text-[8px] font-black text-dim hover:text-main uppercase">Clear</button>
                </div>
                <div className="max-h-64 overflow-y-auto scrollbar-hide">
                  {notifications.length === 0 ? (
                    <p className="p-8 text-center text-[9px] text-dim uppercase italic">Nodes Silent</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-3 border-b border-bright hover:bg-surface transition-colors">
                        <p className="text-[10px] text-main leading-tight">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="relative" ref={profileMenuRef}>
            <div 
              className="flex items-center gap-1.5 md:gap-3 border-l border-bright pl-1.5 md:pl-4 group transition-all cursor-pointer" 
              onClick={() => { soundService.playClick(); setShowProfileMenu(!showProfileMenu); }}
            >
              <div className="w-7 h-7 md:w-8 md:h-8 rounded border border-bright overflow-hidden bg-card flex items-center justify-center group-hover:border-accent/50 transition-all shrink-0">
                 {user.profileImage ? <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" /> : <UserCircle size={20} className="text-dim" />}
              </div>
              <ChevronDown size={12} className={`hidden sm:block text-dim group-hover:text-main transition-all ${showProfileMenu ? 'rotate-180' : ''}`} />
            </div>

            {showProfileMenu && (
              <div className="absolute right-0 mt-4 w-56 bg-card border border-bright rounded-xl shadow-2xl overflow-hidden z-50 animate-in zoom-in-95 glass-panel">
                <div className="p-4 border-b border-bright bg-surface/40">
                  <p className="text-[10px] font-black uppercase tracking-widest text-main truncate">{user.name}</p>
                  <p className="text-[8px] font-bold text-dim uppercase tracking-tighter mt-1">{user.role?.toUpperCase() || 'USER'}_ACCESS</p>
                </div>
                <div className="p-1">
                  <button 
                    onClick={() => { soundService.playClick(); onTabChange('profile'); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-main hover:text-accent hover:bg-surface rounded-lg transition-all group"
                  >
                    <UserIcon size={14} className="text-dim group-hover:text-accent" />
                    <span className="text-[10px] font-black uppercase tracking-widest">IDENTITY_NODE</span>
                  </button>
                  <button 
                    onClick={() => { soundService.playClick(); onLogout(); setShowProfileMenu(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-main hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-all group"
                  >
                    <LogOut size={14} className="text-dim group-hover:text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest">SECURE_EXIT</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;