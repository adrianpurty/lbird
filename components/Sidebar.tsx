
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
  User as UserIcon,
  Heart,
  FileText,
  Briefcase
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
    { id: 'market', icon: LayoutDashboard, label: 'Sales Floor', roles: ['admin', 'user'] },
    { id: 'profile', icon: UserIcon, label: 'My Identity', roles: ['admin', 'user'] },
    { id: 'create', icon: PlusCircle, label: 'Sell Assets', roles: ['admin', 'user'] },
    { id: 'ledger', icon: Briefcase, label: 'Market Portfolio', roles: ['admin', 'user'] },
    { id: 'settings', icon: Wallet, label: 'Wallet', roles: ['admin', 'user'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-black border-r border-[#1A1A1A] flex flex-col h-screen overflow-hidden">
      <div className="p-8 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FACC15] rounded-lg flex items-center justify-center">
            <Zap className="text-black fill-current" size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-logo text-white leading-none tracking-tighter uppercase">
              LEAD<span className="text-white">BID</span>
            </span>
            <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest">
              PREMIUM TRADER
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-4">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
              activeTab === item.id 
                ? 'bg-[#FACC15] text-black shadow-lg' 
                : 'text-neutral-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon 
              size={18} 
              className={`transition-colors ${
                activeTab === item.id ? 'text-black' : 'text-neutral-500 group-hover:text-white'
              }`} 
            />
            <span className={`text-sm font-semibold ${activeTab === item.id ? 'text-black' : ''}`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-[#1A1A1A]">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-4 py-3 text-neutral-500 hover:text-white transition-all"
        >
          <LogOut size={18} />
          <span className="font-semibold text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
