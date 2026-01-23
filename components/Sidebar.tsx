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
import { UserRole } from '../types';

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
    <aside className="w-64 bg-[var(--sidebar-bg)] border-r border-[var(--border-main)] flex flex-col theme-transition">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-[var(--text-accent)] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.15)]">
          <Zap className="text-black fill-current" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-black tracking-tighter text-[var(--text-main)] leading-none">
            LEAD<span className="text-[var(--text-accent)]">BID</span>
          </span>
          <span className="text-[9px] text-neutral-600 font-black uppercase tracking-widest mt-1">
            {role === 'admin' ? 'SYSTEM OPERATOR' : 'PREMIUM TRADER'}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 py-6">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
              activeTab === item.id 
                ? 'bg-[var(--text-accent)] text-black shadow-lg shadow-yellow-400/10' 
                : 'text-neutral-500 hover:text-[var(--text-main)] hover:bg-neutral-100 dark:hover:bg-neutral-900'
            }`}
          >
            <item.icon size={20} className={activeTab === item.id ? 'stroke-current' : 'group-hover:text-[var(--text-accent)]'} />
            <span className="font-semibold text-sm">{item.label}</span>
            {item.indicator && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--border-main)]">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-neutral-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-semibold text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;