import React, { useState, useMemo, memo, useDeferredValue } from 'react';
import { Lead, UserRole } from '../types.ts';
import { 
  BriefcaseBusiness, PlaneTakeoff, Ship, Hotel, Building2, 
  Coins, ListFilter, Stethoscope, Shield, CheckCircle2, 
  Heart, ChevronLeft, ChevronRight, ChevronDown, 
  Cpu, Target, Database, Activity, MapPin, Gauge, ArrowRight,
  Fingerprint, Clock, Star, Zap, ShieldAlert, Layers, XCircle,
  Settings as GearIcon, Edit3, Globe, BarChart3
} from 'lucide-react';
import { soundService } from '../services/soundService.ts';

interface LeadGridProps {
  leads: Lead[];
  onBid: (id: string) => void;
  onEdit?: (lead: Lead) => void;
  onAdminApprove?: (id: string) => void;
  onAdminReject?: (id: string) => void;
  onBulkApprove?: (ids: string[]) => void;
  onBulkReject?: (ids: string[]) => void;
  onDelete?: (id: string) => void;
  onToggleWishlist?: (id: string) => void;
  userRole: UserRole;
  currentUserId: string;
  activeBids?: string[];
  wishlist?: string[];
}

const MemoizedLeadCard = memo(({ 
  lead, 
  isUserEngaged, 
  isInWishlist, 
  isOwner, 
  userRole, 
  onBid, 
  onEdit, 
  onToggleWishlist,
  onAdminApprove,
  onAdminReject,
  isSelected,
  onToggleSelect
}: any) => {
  const isAdmin = userRole === 'admin';
  const canEdit = isAdmin || isOwner;

  const getIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('flight')) return <PlaneTakeoff size={14} />;
    if (cat.includes('cruise')) return <Ship size={14} />;
    if (cat.includes('hotel')) return <Hotel size={14} />;
    if (cat.includes('real estate')) return <Building2 size={14} />;
    if (cat.includes('crypto')) return <Coins size={14} />;
    if (cat.includes('insurance')) return <Shield size={14} />;
    if (cat.includes('medical')) return <Stethoscope size={14} />;
    return <BriefcaseBusiness size={14} />;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'bg-emerald-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-amber-400';
    }
  };

  // Helper for stylized country flag using emoji or stylized text
  const getFlag = (code: string) => {
    return (
      <div className="flex items-center gap-1.5 bg-neutral-900 px-1.5 py-0.5 rounded-md border border-neutral-800">
        <span className="text-[10px] grayscale opacity-70">🚩</span>
        <span className="text-[9px] font-mono font-black text-neutral-400">{code}</span>
      </div>
    );
  };

  return (
    <div 
      className={`group relative bg-[#0a0a0a] border-2 rounded-[1rem] transition-all duration-300 overflow-hidden cursor-pointer flex flex-col shadow-xl hover:border-amber-400/40 ${
        isSelected ? 'border-amber-400 ring-4 ring-amber-400/10 scale-[1.02]' : 
        isUserEngaged ? 'border-amber-400 active-border-pulse' : 'border-neutral-900/60 hover:bg-[#0c0c0c]'
      }`}
      onClick={() => canEdit ? onEdit?.(lead) : onBid(lead.id)}
    >
      {/* ID BADGE SIDE STRIP (MAG-STRIPE) */}
      <div className="absolute left-0 top-0 bottom-0 w-2.5 bg-neutral-900 flex flex-col items-center justify-between py-4 opacity-50 group-hover:opacity-100 transition-opacity">
        <div className="w-1 h-1 rounded-full bg-neutral-700" />
        <div className="w-1 h-12 bg-neutral-800 rounded-full" />
        <div className="w-1 h-1 rounded-full bg-neutral-700" />
      </div>

      <div className="pl-6 p-4 flex flex-col gap-4">
        {/* HEADER: ORIGIN & ID */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getFlag(lead.countryCode)}
            <span className="text-[8px] font-black text-neutral-600 uppercase tracking-tighter italic">L_SIGNATURE_{lead.id.slice(-4).toUpperCase()}</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${getStatusColor(lead.status)} shadow-[0_0_8px_currentColor]`} />
        </div>

        {/* CORE: IDENTITY TITLE */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
             <div className="p-1.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
               {getIcon(lead.category)}
             </div>
             <span className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.2em]">{lead.category}</span>
          </div>
          <h3 className="text-[13px] font-black text-white italic uppercase tracking-tighter leading-tight font-futuristic line-clamp-2 group-hover:text-amber-400 transition-colors">
            {lead.title}
          </h3>
        </div>

        {/* DATA BLOCK: BID & QUALITY */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-900">
           <div className="flex flex-col gap-0.5">
              <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest leading-none">NODE_VALUATION</span>
              <div className="text-xl font-black text-white italic tracking-tighter font-tactical leading-none">
                 <span className="text-[10px] text-amber-500/50 not-italic mr-0.5">$</span>{lead.currentBid.toLocaleString()}
              </div>
           </div>
           <div className="flex flex-col gap-1 text-right items-end">
              <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest leading-none">INTEGRITY_INDEX</span>
              <div className="flex items-center gap-1.5">
                 <div className="w-10 h-1 bg-neutral-900 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${lead.qualityScore}%` }} />
                 </div>
                 <span className="text-[10px] font-black text-emerald-500 font-tactical italic leading-none">{lead.qualityScore}%</span>
              </div>
           </div>
        </div>
      </div>

      {/* TACTICAL OVERLAY */}
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center p-6 gap-3 z-30">
        <div className="text-center space-y-1 mb-2">
           <p className="text-[8px] font-black text-amber-400 uppercase tracking-[0.4em] italic leading-none">ENCRYPTED_ASSET</p>
           <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest font-mono">READY_FOR_HANDSHAKE</p>
        </div>

        {isAdmin ? (
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit?.(lead); }}
            className="w-full py-2.5 bg-white text-black rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-400 transition-all active:scale-95"
          >
            <Edit3 size={14} /> RECONFIGURE
          </button>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); onBid(lead.id); }}
            className="w-full py-2.5 bg-amber-400 text-black rounded-lg font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:scale-105 active:scale-95 transition-all"
          >
            <Zap size={14} fill="currentColor" /> MOUNT_PIPELINE
          </button>
        )}

        <div className="flex gap-2 w-full">
           <button 
              onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(lead.id); }}
              className={`flex-1 p-2.5 rounded-lg border transition-all flex items-center justify-center ${
                 isInWishlist ? 'bg-red-500/10 border-red-500/40 text-red-500' : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-white'
              }`}
           >
              <Heart size={14} fill={isInWishlist ? "currentColor" : "none"} />
           </button>
           {isAdmin && (
             <button 
                onClick={(e) => { e.stopPropagation(); onToggleSelect?.(lead.id); }}
                className={`flex-1 p-2.5 rounded-lg border transition-all flex items-center justify-center ${
                   isSelected ? 'bg-amber-400 border-amber-400 text-black' : 'bg-neutral-900 border-neutral-800 text-neutral-500 hover:text-white'
                }`}
             >
                <CheckCircle2 size={14} />
             </button>
           )}
        </div>
      </div>
    </div>
  );
});

const LeadGrid: React.FC<LeadGridProps> = ({ 
  leads, onBid, onEdit, onAdminApprove, onAdminReject, onBulkApprove, onBulkReject, onDelete, onToggleWishlist, userRole, currentUserId, activeBids = [], wishlist = []
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const deferredCategory = useDeferredValue(selectedCategory);
  const ITEMS_PER_PAGE = 16; 

  const categories = useMemo(() => Array.from(new Set(leads.map(l => l.category))).sort(), [leads]);
  
  const filteredLeads = useMemo(() => {
    let result = userRole === 'admin' ? leads : leads.filter(l => l.status === 'approved' || l.ownerId === currentUserId);
    if (deferredCategory) result = result.filter(l => l.category === deferredCategory);
    return result;
  }, [leads, userRole, currentUserId, deferredCategory]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const currentLeads = filteredLeads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className="space-y-8">
      {/* FILTER HUD */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-neutral-900/40 rounded-2xl border border-neutral-800/60 backdrop-blur-md">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative group w-full sm:w-[220px]">
             <ListFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-hover:text-amber-400 transition-colors" size={14} />
             <select 
               value={selectedCategory}
               onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
               className="w-full bg-black border border-neutral-800 rounded-xl pl-10 pr-8 py-2.5 text-[10px] font-black uppercase tracking-widest text-neutral-400 outline-none focus:border-amber-400/40 transition-all appearance-none cursor-pointer"
             >
               <option value="">ALL_SECTORS</option>
               {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
             </select>
             <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-700 pointer-events-none" />
          </div>

          {selectedIds.size > 0 && userRole === 'admin' && (
            <div className="flex items-center gap-2 animate-in slide-in-from-left duration-300">
              <button 
                onClick={() => { onBulkApprove?.(Array.from(selectedIds)); setSelectedIds(new Set()); }}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all"
              >
                AUTH ({selectedIds.size})
              </button>
              <button 
                onClick={() => { onBulkReject?.(Array.from(selectedIds)); setSelectedIds(new Set()); }}
                className="bg-red-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 transition-all"
              >
                REVOKE
              </button>
            </div>
          )}
        </div>
        <div className="hidden md:flex items-center gap-6">
           <div className="flex items-center gap-2">
              <Activity size={12} className="text-emerald-500" />
              <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">{filteredLeads.length} NODES_ACTIVE</span>
           </div>
        </div>
      </div>

      {/* GRID: 4 PER ROW ON DESKTOP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {currentLeads.length > 0 ? (
          currentLeads.map((lead) => (
            <MemoizedLeadCard 
              key={lead.id}
              lead={lead}
              isUserEngaged={activeBids.includes(lead.id)}
              isInWishlist={wishlist.includes(lead.id)}
              isOwner={lead.ownerId === currentUserId}
              userRole={userRole}
              onBid={onBid}
              onEdit={onEdit}
              onAdminApprove={onAdminApprove}
              onAdminReject={onAdminReject}
              onDelete={onDelete}
              onToggleWishlist={onToggleWishlist}
              isSelected={selectedIds.has(lead.id)}
              onToggleSelect={toggleSelect}
            />
          ))
        ) : (
          <div className="col-span-full py-32 text-center bg-[#050505] border-2 border-neutral-900 border-dashed rounded-[3rem]">
            <Database className="mx-auto text-neutral-900 mb-6 opacity-20" size={64} />
            <h4 className="text-neutral-700 font-futuristic text-xl uppercase tracking-[0.3em]">NO_DATA_NODES_FOUND</h4>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-6 pt-10 border-t border-neutral-900/50">
          <button 
            disabled={currentPage === 1} 
            onClick={() => { soundService.playClick(); setCurrentPage(currentPage - 1); }} 
            className="w-12 h-12 rounded-2xl border border-neutral-800 text-neutral-600 hover:text-amber-400 hover:border-amber-400/40 transition-all disabled:opacity-20 flex items-center justify-center bg-neutral-900/40 shadow-xl"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => { soundService.playClick(); setCurrentPage(i + 1); }}
                className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all border ${
                  currentPage === i + 1 
                    ? 'bg-amber-400 text-black border-amber-400 shadow-[0_0_20px_rgba(250,204,21,0.2)]' 
                    : 'bg-transparent text-neutral-600 border-neutral-900 hover:border-neutral-700 hover:text-neutral-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => { soundService.playClick(); setCurrentPage(currentPage + 1); }} 
            className="w-12 h-12 rounded-2xl border border-neutral-800 text-neutral-600 hover:text-amber-400 hover:border-amber-400/40 transition-all disabled:opacity-20 flex items-center justify-center bg-neutral-900/40 shadow-xl"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadGrid;