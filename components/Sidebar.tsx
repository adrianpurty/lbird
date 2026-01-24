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
    { id: 'market', icon: LayoutDashboard, label: 'Sales Floor', roles: ['admin', 'user'] },
    { id: 'profile', icon: UserIcon, label: 'My Identity', roles: ['admin', 'user'] },
    { id: 'wishlist', icon: Heart, label: 'Saved Assets', roles: ['admin', 'user'] },
    { id: 'create', icon: PlusCircle, label: 'Sell Assets', roles: ['admin', 'user'] },
    { id: 'bids', icon: Gavel, label: 'Portfolio', roles: ['admin', 'user'] },
    { id: 'ledger', icon: FileText, label: 'Ledger', roles: ['admin', 'user'] },
    { id: 'inbox', icon: Inbox, label: 'Admin Inbox', roles: ['admin'], indicator: hasInbox },
    { id: 'admin', icon: ShieldCheck, label: 'Control Room', roles: ['admin'] },
    { id: 'payment-config', icon: CreditCard, label: 'Gateways', roles: ['admin'] },
    { id: 'auth-config', icon: Lock, label: 'OAuth Setup', roles: ['admin'] },
    { id: 'settings', icon: Wallet, label: 'Wallet', roles: ['admin', 'user'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-[#0a0a0a]/40 border-r border-neutral-800/30 flex flex-col theme-transition backdrop-blur-md">
      <div className="p-8 flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
        <div className="w-10 h-10 bg-[#facc15]/10 rounded-xl flex items-center justify-center border border-[#facc15]/20 shadow-sm">
          <Zap className="text-[#facc15]/60 fill-[#facc15]/20" size={20} />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tighter text-neutral-300 leading-none">
            LEAD<span className="text-[#facc15]/50">BID</span>
          </span>
          <span className="text-[9px] text-neutral-600 font-black uppercase tracking-widest mt-1">
            {role === 'admin' ? 'SYSTEM OPERATOR' : 'PREMIUM TRADER'}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1 py-6">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative border ${
              activeTab === item.id 
                ? 'bg-[#facc15]/50 text-neutral-100 border-[#facc15]/30 shadow-md' 
                : 'text-neutral-600 border-transparent hover:text-neutral-400 hover:bg-white/5 hover:border-neutral-800/20'
            }`}
          >
            <item.icon 
              size={18} 
              className={`transition-colors ${
                activeTab === item.id ? 'text-white' : 'text-neutral-700 group-hover:text-[#facc15]/40'
              }`} 
            />
            <span className="font-bold text-xs tracking-tight uppercase tracking-widest">{item.label}</span>
            {item.indicator && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-red-900/60 rounded-full animate-pulse shadow-[0_0_8px_rgba(127,29,29,0.4)]" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-neutral-800/30">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-neutral-700 hover:text-red-900/70 hover:bg-red-950/10 rounded-xl transition-all border border-transparent hover:border-red-900/20"
        >
          <LogOut size={18} />
          <span className="font-black text-[10px] uppercase tracking-widest">Sign Out Session</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;