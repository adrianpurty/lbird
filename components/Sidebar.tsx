
import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Settings, 
  Gavel, 
  Zap,
  LogOut,
  ShieldCheck,
  CreditCard,
  Wallet,
  Inbox,
  Lock,
  User as UserIcon,
  Globe,
  Heart,
  FileText
} from 'lucide-react';
import { UserRole } from '../types.ts';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  role: UserRole;
  onLogout: () => void;
  hasInbox?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, role, onLogout, hasInbox }) => {
  const menuItems = [
    { id: 'market', icon: LayoutDashboard, label: 'MARKET_FLOOR', roles: ['admin', 'user'] },
    { id: 'profile', icon: UserIcon, label: 'IDENTITY', roles: ['admin', 'user'] },
    { id: 'wishlist', icon: Heart, label: 'FAVORITES', roles: ['admin', 'user'] },
    { id: 'create', icon: PlusCircle, label: 'PROVISION', roles: ['admin', 'user'] },
    { id: 'ledger', icon: FileText, label: 'LEDGER', roles: ['admin', 'user'] },
    { id: 'admin', icon: ShieldCheck, label: 'COMMAND', roles: ['admin'] },
    { id: 'payment-config', icon: CreditCard, label: 'GATEWAYS', roles: ['admin'] },
    { id: 'auth-config', icon: Lock, label: 'AUTH_INFRA', roles: ['admin'] },
    { id: 'settings', icon: Wallet, label: 'VAULT_API', roles: ['admin', 'user'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-black border-r border-[#1A1A1A] flex flex-col h-screen theme-transition overflow-hidden">
      <div className="p-8 border-b border-[#1A1A1A]">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="w-10 h-10 bg-[#FACC15]/5 rounded-xl flex items-center justify-center border border-[#FACC15]/10 group-hover:border-[#FACC15]/50 transition-all">
            <Zap className="text-[#FACC15] group-hover:text-white transition-colors" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-futuristic text-white leading-none tracking-tighter">
              LEAD<span className="text-[#FACC15]">BID</span>
            </span>
            <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-[0.4em] mt-1.5">
              {role === 'admin' ? 'ROOT_CMD' : 'TRADER'}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 py-8 overflow-y-auto scrollbar-hide">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative border ${
              activeTab === item.id 
                ? 'bg-[#1A1A1A] text-white border-[#FACC15]/30 shadow-[0_0_20px_rgba(250,204,21,0.05)]' 
                : 'text-neutral-500 border-transparent hover:text-white hover:bg-[#1A1A1A]'
            }`}
          >
            <item.icon 
              size={18} 
              className={`transition-colors ${
                activeTab === item.id ? 'text-[#FACC15]' : 'text-neutral-700 group-hover:text-white'
              }`} 
            />
            <span className={`text-[10px] tracking-[0.2em] uppercase font-black ${activeTab === item.id ? 'text-white' : ''}`}>
              {item.label}
            </span>
            
            {/* Replaced undefined variable 'Thompson' with 'item.id' to correctly identify active tab */}
            {activeTab === item.id ? (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#FACC15] rounded-l-full shadow-[0_0_10px_#FACC15]" />
            ) : null}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-[#1A1A1A]">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 text-neutral-600 hover:text-white hover:bg-[#1A1A1A] rounded-xl transition-all border border-transparent hover:border-white/10"
        >
          <LogOut size={18} />
          <span className="font-black text-[9px] uppercase tracking-[0.3em]">HALT_SESSION</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
