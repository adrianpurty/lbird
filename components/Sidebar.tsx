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
  FileText,
  Activity
} from 'lucide-react';
import { UserRole, User } from '../types.ts';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  role: UserRole;
  onLogout: () => void;
  hasInbox?: boolean;
  users?: User[];
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, role, onLogout, hasInbox }) => {
  const menuItems = [
    { id: 'market', icon: LayoutDashboard, label: 'SALES_FLOOR', roles: ['admin', 'user'] },
    { id: 'action-center', icon: Activity, label: 'ACTION_CENTER', roles: ['admin', 'user'] },
    { id: 'profile', icon: UserIcon, label: 'IDENTITY_NODE', roles: ['admin', 'user'] },
    { id: 'wishlist', icon: Heart, label: 'SAVED_ASSETS', roles: ['admin', 'user'] },
    { id: 'create', icon: PlusCircle, label: 'ASSET_PROVISION', roles: ['admin', 'user'] },
    { id: 'bids', icon: Gavel, label: 'PORTFOLIO_NODE', roles: ['admin', 'user'] },
    { id: 'ledger', icon: FileText, label: 'FINANCE_LEDGER', roles: ['admin', 'user'] },
    { id: 'inbox', icon: Inbox, label: 'AUDIT_LEDGER', roles: ['admin'], indicator: hasInbox },
    { id: 'admin', icon: ShieldCheck, label: 'CONTROL_CENTER', roles: ['admin'] },
    { id: 'payment-config', icon: CreditCard, label: 'GATEWAY_CONFIG', roles: ['admin'] },
    { id: 'auth-config', icon: Lock, label: 'AUTH_INFRA', roles: ['admin'] },
    { id: 'settings', icon: Wallet, label: 'VAULT_API', roles: ['admin', 'user'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-60 bg-[#050505] border-r-2 border-neutral-900 flex flex-col h-screen theme-transition backdrop-blur-3xl overflow-hidden">
      <div className="p-6 flex items-center gap-4 group cursor-default border-b-2 border-neutral-900/50">
        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border-2 border-white/10 shadow-2xl shrink-0">
          <Zap className="text-white fill-white/10" size={20} />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-xl font-futuristic text-white leading-none text-glow tracking-tighter truncate">
            LEAD<span className="text-neutral-500">BID</span>
          </span>
          <span className="text-[8px] text-neutral-600 font-bold uppercase tracking-[0.4em] mt-1.5 truncate">
            {role === 'admin' ? 'ROOT_ACCESS' : 'TRADER_NODE'}
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 py-4 overflow-y-auto scrollbar-hide">
        {visibleItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group relative border-2 ${
              activeTab === item.id 
                ? 'bg-white/10 text-white border-white/30' 
                : 'text-neutral-500 border-transparent hover:text-white'
            }`}
          >
            <item.icon size={18} className="shrink-0" />
            <span className={`text-[10px] tracking-[0.15em] uppercase font-normal truncate`}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <div className="p-3 border-t-2 border-neutral-900 mt-auto">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-neutral-600 hover:text-red-500 rounded-lg transition-all"
        >
          <LogOut size={18} className="shrink-0" />
          <span className="font-bold text-[9px] uppercase tracking-[0.3em]">SECURE_EXIT</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;