
import React from 'react';
import { Bell, Wallet, UserCircle, ChevronDown, Activity, Zap } from 'lucide-react';
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
  onNavigateToWallet,
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <header className="h-20 flex items-center justify-between px-8 bg-black/50 backdrop-blur-xl border-b border-[#1A1A1A] sticky top-0 z-40 w-full">
      <div className="flex items-center gap-8">
        <div className="flex flex-col">
          <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mb-1">PLATFORM STATUS</span>
          <div className="flex items-center gap-2">
            <span className="text-[#10B981] font-bold text-[11px] tracking-widest uppercase">GATEWAY_ACTIVE</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={onNavigateToWallet}
          className="flex items-center gap-2 bg-[#1A1A1A] rounded-lg px-4 py-2 border border-white/5 hover:border-white/10 transition-all group"
        >
          <Wallet size={14} className="text-[#FACC15]" />
          <span className="font-bold text-xs text-white">${user.balance.toLocaleString()}</span>
        </button>
        
        <div className="relative">
          <button className="p-2.5 rounded-xl text-neutral-400 hover:text-white relative">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-4 pl-4 border-l border-[#1A1A1A]">
          <div className="text-right">
            <p className="text-xs font-bold text-white tracking-tight leading-none mb-1">{user.name}</p>
            <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">USER</p>
          </div>
          <div className="w-10 h-10 rounded-full border-2 border-neutral-800 overflow-hidden bg-[#1A1A1A] flex items-center justify-center shadow-lg">
             {user.profileImage ? (
                <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
             ) : (
                <UserCircle size={24} className="text-neutral-600" />
             )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
