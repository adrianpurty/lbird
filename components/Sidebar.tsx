
import React from 'react';
import { 
  PlusCircle, Zap, LogOut, Heart, Activity, 
  Lock, LayoutGrid, Database,
  Settings, UserCheck, ShieldAlert
} from 'lucide-react';
import { UserRole } from '../types.ts';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  role: UserRole;
  onLogout: () => void;
  hasInbox?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, role, onLogout }) => {
  const menuItems = [
    { id: 'market', icon: LayoutGrid, label: 'SALES_FLOOR', roles: ['admin', 'user'] },
    { id: 'action-center', icon: Activity, label: 'ACTION_CENTER', roles: ['admin', 'user'] },
    { id: 'profile', icon: UserCheck, label: 'IDENTITY_NODE', roles: ['admin', 'user'] },
    { id: 'wishlist', icon: Heart, label: 'SAVED_ASSETS', roles: ['admin', 'user'] },
    { id: 'create', icon: PlusCircle, label: 'ASSET_PROVISION', roles: ['admin', 'user'] },
    { id: 'admin', icon: ShieldAlert, label: 'CONTROL_CENTER', roles: ['admin'] },
    { id: 'payment-config', icon: Settings, label: 'GATEWAY_CONFIG', roles: ['admin'] },
    { id: 'auth-config', icon: Lock, label: 'AUTH_INFRA', roles: ['admin'] },
    { id: 'settings', icon: Database, label: 'VAULT_API', roles: ['admin', 'user'] },
  ];

  const visibleItems = menuItems.filter(item => item.roles.includes(role));

  return (
    <aside className="w-64 bg-black border-r border-neutral-900 flex flex-col h-screen sticky top-0 left-0 z-50 overflow-hidden">
      
      {/* BRANDING NODE */}
      <div className="p-6 flex items-center gap-3 group cursor-pointer border-b border-neutral-900/50 hover:bg-neutral-900/10 transition-all shrink-0" onClick={() => onTabChange('market')}>
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)] shrink-0">
          <Zap className="text-black" size={16} fill="currentColor" />
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-futuristic text-white leading-none tracking-tighter uppercase">
            LEAD<span className="text-neutral-600">BID</span>
          </span>
          <span className="text-[7px] text-neutral-600 font-black uppercase tracking-[0.4em] mt-1 italic">
            ROOT_ACCESS
          </span>
        </div>
      </div>

      {/* NAVIGATION STREAM */}
      <div className="flex-1 py-4 px-3 overflow-y-auto scrollbar-hide">
        <nav className="space-y-1">
          {visibleItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 relative group border-2 ${
                activeTab === item.id 
                  ? 'bg-neutral-900/40 text-white border-neutral-800 shadow-lg' 
                  : 'text-neutral-500 border-transparent hover:text-white hover:bg-neutral-900/10'
              }`}
            >
              <item.icon size={18} className={`shrink-0 transition-transform ${activeTab === item.id ? (item.id === 'admin' ? 'text-red-500' : 'text-[#00e5ff]') : ''}`} />
              <span className={`text-[10px] tracking-[0.15em] font-black uppercase font-futuristic truncate`}>
                {item.label}
              </span>
              {activeTab === item.id && (
                <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full shadow-[0_0_8px_#fff] ${item.id === 'admin' ? 'bg-red-500' : 'bg-[#00e5ff]'}`} />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* FOOTER TERMINATION */}
      <div className="p-4 border-t border-neutral-900/50 shrink-0">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-neutral-600 hover:text-red-500 rounded-lg transition-all hover:bg-red-500/5 group"
        >
          <LogOut size={18} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
          <span className="font-black text-[10px] uppercase tracking-[0.15em]">SECURE_EXIT</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
