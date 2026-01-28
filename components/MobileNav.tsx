import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Settings, 
  Gavel, 
  ShieldCheck,
  Wallet,
  CreditCard,
  User as UserIcon,
  Globe,
  Activity
} from 'lucide-react';
import { UserRole } from '../types.ts';

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  role: UserRole;
}

const MobileNav: React.FC<MobileNavProps> = ({ activeTab, onTabChange, role }) => {
  const menuItems = [
    { id: 'market', icon: LayoutDashboard, label: 'Market', roles: ['admin', 'user'] },
    { id: 'action-center', icon: Activity, label: 'Status', roles: ['admin', 'user'] },
    { id: 'profile', icon: UserIcon, label: 'Me', roles: ['admin', 'user'] },
    { id: 'create', icon: PlusCircle, label: 'Sell', roles: ['admin', 'user'] },
    { id: 'admin', icon: ShieldCheck, label: 'Admin', roles: ['admin'] },
    { id: 'settings', icon: Wallet, label: 'Bank', roles: ['admin', 'user'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur-xl border-t border-neutral-900 px-4 py-3 flex justify-between items-center z-50">
      {visibleItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onTabChange(item.id)}
          className={`flex flex-col items-center gap-1 transition-all duration-300 min-w-[50px] ${
            activeTab === item.id ? 'text-[#00e5ff]' : 'text-neutral-500'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition-all ${
            activeTab === item.id ? 'bg-[#00e5ff]/10 scale-110' : ''
          }`}>
            <item.icon size={22} strokeWidth={activeTab === item.id ? 2.5 : 2} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-tighter leading-none">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default MobileNav;