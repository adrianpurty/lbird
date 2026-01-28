
import React, { useState, useMemo } from 'react';
import { 
  User as UserIcon, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  MoreHorizontal, 
  Activity, 
  Globe, 
  MonitorSmartphone, 
  Wallet, 
  Ban, 
  CheckCircle2, 
  Trash2, 
  UserCircle,
  FilterX
} from 'lucide-react';
import { User } from '../types.ts';
import { soundService } from '../services/soundService.ts';

interface UserManagementProps {
  users: User[];
  onUpdateUser: (id: string, updates: Partial<User>) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onUpdateUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'restricted'>('all');

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || u.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [users, searchTerm, filter]);

  const handleToggleStatus = (user: User) => {
    soundService.playClick(true);
    const newStatus = user.status === 'restricted' ? 'active' : 'restricted';
    onUpdateUser(user.id, { status: newStatus });
  };

  return (
    <div className="space-y-6">
      {/* HUD CONTROLS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-2">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative group flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-[#facc15] transition-colors" size={16} />
            <input 
              type="text"
              placeholder="SEARCH_IDENTITY_STREAM..."
              className="w-full bg-[#0c0c0c] border-2 border-neutral-800 rounded-2xl pl-12 pr-6 py-3.5 text-[11px] font-black uppercase tracking-widest text-neutral-200 outline-none focus:border-[#facc15]/40 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex bg-neutral-900/50 p-1 rounded-2xl border border-neutral-800">
            {(['all', 'active', 'restricted'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { soundService.playClick(); setFilter(f); }}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-[#facc15] text-black shadow-lg shadow-yellow-500/10' : 'text-neutral-500 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
           <span className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.3em]">{filteredUsers.length} NODES_CONNECTED</span>
           <div className="h-5 w-px bg-neutral-800" />
           <button onClick={() => { setSearchTerm(''); setFilter('all'); }} className="p-3 text-neutral-600 hover:text-white transition-colors">
              <FilterX size={18} />
           </button>
        </div>
      </div>

      {/* USER LIST - LANDSCAPE CARDS */}
      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <div 
              key={user.id} 
              className={`group relative bg-[#0a0a0a]/80 rounded-[2rem] border-2 transition-all duration-500 flex flex-col lg:flex-row items-center p-6 gap-8 overflow-hidden scanline-effect ${
                user.status === 'restricted' ? 'border-red-900/20 opacity-60 grayscale' : 'border-neutral-800/60 hover:border-neutral-700'
              }`}
            >
              {/* Identity Node */}
              <div className="flex items-center gap-6 shrink-0 min-w-[280px]">
                <div className="relative">
                  <div className="w-16 h-16 rounded-3xl border-2 border-neutral-800 overflow-hidden bg-neutral-900 flex items-center justify-center text-neutral-700 group-hover:border-[#facc15]/30 transition-all shadow-xl">
                    {user.profileImage ? (
                      <img src={user.profileImage} className="w-full h-full object-cover" alt={user.name} />
                    ) : (
                      <UserCircle size={32} />
                    )}
                  </div>
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-black flex items-center justify-center ${
                    user.status === 'restricted' ? 'bg-red-600' : 'bg-emerald-500 animate-pulse'
                  }`}>
                    {user.status === 'restricted' ? <Ban size={10} className="text-white" /> : <CheckCircle2 size={10} className="text-white" />}
                  </div>
                </div>
                <div>
                   <h4 className="text-lg font-black text-white italic leading-none group-hover:text-[#facc15] transition-colors">{user.name}</h4>
                   <p className="text-[9px] text-neutral-600 font-black uppercase tracking-widest mt-1.5 font-mono">{user.id}</p>
                   <p className="text-[10px] text-neutral-500 font-bold italic mt-1">{user.email}</p>
                </div>
              </div>

              {/* Telemetry Block */}
              <div className="hidden xl:flex items-center gap-10 px-8 border-x border-neutral-800/40 flex-1">
                 <div className="text-center">
                    <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">Session_Node</span>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 font-mono">
                       <MonitorSmartphone size={12} className="text-neutral-700" /> {user.deviceInfo?.split('|')[0] || 'DESKTOP'}
                    </div>
                 </div>
                 <div className="text-center">
                    <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">Last_Known_Loc</span>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 font-mono">
                       <Globe size={12} className="text-neutral-700" /> {user.location || 'RESTRICTED'}
                    </div>
                 </div>
                 <div className="text-center">
                    <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">Liquidity_Buffer</span>
                    <div className="flex items-center gap-2 text-[12px] font-black text-emerald-500 font-tactical italic">
                       <Wallet size={12} /> ${user.balance.toLocaleString()}
                    </div>
                 </div>
              </div>

              {/* Command Actions */}
              <div className="flex items-center gap-4 shrink-0 lg:pl-6">
                {user.role !== 'admin' && (
                  <button 
                    onClick={() => handleToggleStatus(user)}
                    className={`px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border-b-4 active:scale-95 flex items-center gap-3 ${
                      user.status === 'restricted' 
                        ? 'bg-emerald-600 text-white border-emerald-900 hover:bg-emerald-500' 
                        : 'bg-red-900/20 text-red-500 border-red-900/40 hover:bg-red-600 hover:text-white'
                    }`}
                  >
                    {user.status === 'restricted' ? (
                      <><CheckCircle2 size={14} /> RESTORE_SYNC</>
                    ) : (
                      <><Ban size={14} /> ISOLATE_NODE</>
                    )}
                  </button>
                )}
                
                <button className="p-3 bg-neutral-900 border-2 border-neutral-800 rounded-2xl text-neutral-500 hover:text-white transition-all">
                  <Activity size={18} />
                </button>
                
                <button className="p-3 bg-neutral-900 border-2 border-neutral-800 rounded-2xl text-neutral-700 hover:text-red-500 transition-all">
                  <Trash2 size={18} />
                </button>
              </div>

              {/* Status Visual Accent */}
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-[60px] opacity-10 ${
                user.status === 'restricted' ? 'bg-red-600' : 'bg-emerald-500'
              }`} />
            </div>
          ))
        ) : (
          <div className="py-24 text-center bg-[#050505] border-2 border-neutral-800/40 border-dashed rounded-[3rem]">
             <Ban size={64} className="mx-auto text-neutral-900 mb-6" />
             <h4 className="text-neutral-700 font-futuristic text-xl uppercase tracking-[0.5em]">NO_IDENTITY_NODES_MATCH_QUERY</h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
