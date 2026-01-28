
import React from 'react';
import { 
  LayoutGrid, 
  PlusCircle, 
  ShieldAlert,
  Wallet,
  User as UserIcon,
  Activity,
  Heart,
  Zap
} from 'lucide-react';
import { UserRole } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  role: UserRole;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange, role }) => {
  const menuItems = [
    { id: 'market', icon: LayoutGrid, label: 'MARKET', roles: ['admin', 'user'] },
    { id: 'action-center', icon: Activity, label: 'SYNC', roles: ['admin', 'user'] },
    { id: 'wishlist', icon: Heart, label: 'VAULT', roles: ['admin', 'user'] },
    { id: 'create', icon: PlusCircle, label: 'SELL', roles: ['admin', 'user'] },
    { id: 'admin', icon: ShieldAlert, label: 'CMD', roles: ['admin'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <nav className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-[90]">
      <div className="bg-[#0c0c0c]/80 backdrop-blur-2xl border border-neutral-800 rounded-[2rem] p-2 flex items-center justify-between shadow-[0_20px_50px_-10px_rgba(0,0,0,1)] ring-1 ring-white/5 overflow-hidden relative">
        {/* Scanning Line Decor */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/5 animate-pulse" />
        
        {visibleItems.map((item) => {
          const isActive = activeTab === item.id;
          const isSpecial = item.id === 'admin';
          
          return (
            <button
              key={item.id}
              onClick={() => { soundService.playClick(); onTabChange(item.id); }}
              className={`relative flex flex-col items-center gap-1.5 transition-all duration-500 py-3 flex-1 rounded-2xl ${
                isActive ? 'scale-105' : 'opacity-40'
              }`}
            >
              <div className="relative">
                <item.icon 
                  size={20} 
                  className={`transition-colors duration-500 ${
                    isActive 
                      ? (isSpecial ? 'text-red-500' : 'text-[#00e5ff]') 
                      : 'text-neutral-500'
                  }`} 
                />
                
                {isActive && (
                  <div className={`absolute inset-0 blur-md opacity-40 scale-150 transition-all ${
                    isSpecial ? 'bg-red-500' : 'bg-[#00e5ff]'
                  }`} />
                )}
              </div>
              
              <span className={`text-[8px] font-black uppercase tracking-widest leading-none font-futuristic transition-colors ${
                isActive ? 'text-white' : 'text-neutral-600'
              }`}>
                {item.label}
              </span>

              {isActive && (
                <div className={`absolute -bottom-1 w-1 h-1 rounded-full ${
                  isSpecial ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-[#00e5ff] shadow-[0_0_10px_#00e5ff]'
                }`} />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
