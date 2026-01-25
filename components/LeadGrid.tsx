
import React, { useState, useMemo, memo, useDeferredValue } from 'react';
import { Lead, UserRole } from '../types.ts';
import { 
  BriefcaseBusiness, PlaneTakeoff, Ship, Hotel, Building2, 
  Coins, ListFilter, Stethoscope, Shield, CheckCircle2, 
  Heart, ChevronLeft, ChevronRight, ChevronDown, 
  Cpu, Target, Database, Activity, MapPin, Gauge, ArrowRight
} from 'lucide-react';

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
  isSelected,
  onToggleSelect
}: any) => {
  const isAdmin = userRole === 'admin';
  const canEdit = isAdmin || isOwner;

  const getIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('flight')) return <PlaneTakeoff size={18} />;
    if (cat.includes('cruise')) return <Ship size={18} />;
    if (cat.includes('hotel')) return <Hotel size={18} />;
    if (cat.includes('real estate')) return <Building2 size={18} />;
    if (cat.includes('crypto')) return <Coins size={18} />;
    if (cat.includes('insurance')) return <Shield size={18} />;
    if (cat.includes('medical')) return <Stethoscope size={18} />;
    return <BriefcaseBusiness size={18} />;
  };

  return (
    <div 
      className={`group relative bg-[#0c0c0c]/80 rounded-[1rem] md:rounded-[1.2rem] border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col sm:flex-row items-center p-3 md:p-4 gap-3 md:gap-6 scanline-effect ${
        isSelected ? 'border-white ring-4 ring-white/10' : 
        isUserEngaged ? 'border-[#00e5ff] active-border-pulse shadow-[0_0_15px_rgba(0,229,255,0.05)]' : 'border-neutral-800/60 hover:border-neutral-600'
      }`}
      onClick={() => canEdit ? onEdit?.(lead) : onBid(lead.id)}
    >
      {/* Visual Accent - Full height on left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-500 ${
        lead.status === 'approved' ? 'bg-emerald-500 shadow-[2px_0_10px_rgba(16,185,129,0.2)]' :
        lead.status === 'rejected' ? 'bg-red-500 shadow-[2px_0_10px_rgba(239,68,68,0.2)]' :
        'bg-neutral-800'
      }`} />

      {/* Identity Row - Icon + Text (Always row on mobile) */}
      <div className="flex items-center gap-3 w-full sm:w-auto sm:flex-1 min-w-0">
        <div className="shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl bg-black/40 border border-neutral-800/40 flex items-center justify-center text-neutral-500 group-hover:text-[#00e5ff] transition-colors">
          {getIcon(lead.category)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[7px] md:text-[8px] font-black text-neutral-600 uppercase tracking-widest truncate max-w-[80px]">{lead.category}</span>
            <span className="text-neutral-800">•</span>
            <div className="flex items-center gap-1">
              <MapPin size={8} className="text-neutral-700" />
              <span className="text-[7px] md:text-[8px] font-black text-neutral-600 uppercase tracking-widest">{lead.countryCode}</span>
            </div>
          </div>
          <h3 className="text-xs md:text-sm font-futuristic text-white uppercase tracking-tight truncate group-hover:text-[#00e5ff] transition-colors leading-none">
            {lead.title}
          </h3>
        </div>
        
        {/* Status indicator for mobile only */}
        <div className="sm:hidden flex items-center gap-1.5">
           <div className={`w-1.5 h-1.5 rounded-full ${lead.status === 'approved' ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' : 'bg-neutral-800'}`} />
        </div>
      </div>

      {/* Mid Telemetry - Hidden on smallest mobile, flex row on tablet+ */}
      <div className="hidden md:flex items-center gap-6 px-6 border-x border-neutral-800/30">
        <div className="text-center">
          <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-0.5">Q_Score</span>
          <div className="flex items-center gap-1 text-[10px] font-black text-emerald-500 italic font-tactical leading-none">
            <Gauge size={10} /> {lead.qualityScore}%
          </div>
        </div>
        <div className="text-center">
          <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-0.5">Nodes</span>
          <span className="text-[10px] font-black text-neutral-400 italic font-tactical leading-none">{lead.bidCount}</span>
        </div>
      </div>

      {/* Financial Node - Aligns right on mobile, next to actions */}
      <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6 w-full sm:w-auto border-t sm:border-t-0 border-neutral-900/50 pt-3 sm:pt-0">
        <div className="text-left sm:text-right">
          <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-0.5 sm:mb-1">Valuation</span>
          <div className="text-xl md:text-2xl font-black text-white italic tracking-widest font-tactical group-hover:text-glow-neon transition-all leading-none">
            ${lead.currentBid.toLocaleString()}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(lead.id); }}
            className={`p-2 rounded-lg bg-black/40 border border-neutral-800 transition-all ${isInWishlist ? 'text-red-500 border-red-900/20' : 'text-neutral-600 hover:text-white'}`}
          >
            <Heart size={14} fill={isInWishlist ? "currentColor" : "none"} />
          </button>
          {isAdmin && (
             <button 
                onClick={(e) => { e.stopPropagation(); onToggleSelect?.(lead.id); }}
                className={`w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center ${
                  isSelected ? 'bg-white border-white text-black' : 'border-neutral-800 bg-black/40'
                }`}
             >
               {isSelected && <CheckCircle2 size={14} strokeWidth={4} />}
             </button>
          )}
          <div className="p-2 sm:hidden text-neutral-500">
             <ArrowRight size={16} className="group-hover:translate-x-1 group-hover:text-white transition-all" />
          </div>
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
  const ITEMS_PER_PAGE = 10;

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

  const isAdmin = userRole === 'admin';

  return (
    <div className="space-y-4">
      {/* Compact HUD Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-1">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative group w-full sm:w-auto">
             <ListFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600 group-hover:text-[#00e5ff] transition-colors" size={12} />
             <select 
               value={selectedCategory}
               onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
               className="w-full sm:w-auto bg-[#0f0f0f] border border-neutral-800/60 rounded-xl pl-9 pr-10 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 outline-none focus:border-[#00e5ff]/40 transition-all appearance-none cursor-pointer"
             >
               <option value="">ALL_SECTORS</option>
               {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
             </select>
             <ChevronDown size={10} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-700 pointer-events-none" />
          </div>
          
          {isAdmin && (
            <button 
              onClick={() => setSelectedIds(selectedIds.size === currentLeads.length ? new Set() : new Set(currentLeads.map(l => l.id)))}
              className="w-full sm:w-auto px-4 py-2 bg-[#0f0f0f] border border-neutral-800/60 rounded-xl text-[9px] font-black text-neutral-500 hover:text-white transition-all uppercase tracking-widest"
            >
              BATCH_SYNC
            </button>
          )}
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
           <span className="text-[9px] font-black text-neutral-700 uppercase tracking-widest">{filteredLeads.length} ASSETS</span>
           <div className="h-4 w-px bg-neutral-800 hidden sm:block" />
           <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-[#00e5ff] rounded-full animate-pulse shadow-[0_0_8px_#00e5ff]" />
              <span className="text-[8px] font-black text-[#00e5ff] uppercase tracking-widest">LIVE_FEED</span>
           </div>
        </div>
      </div>

      {/* List Feed - Optimized Card Container */}
      <div className="space-y-3">
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
          <div className="py-16 md:py-20 text-center bg-[#050505] border border-neutral-800/40 border-dashed rounded-[1.5rem] md:rounded-[2rem]">
            <Database className="mx-auto text-neutral-900 mb-4 md:mb-6" size={40} md:size={60} />
            <h4 className="text-neutral-600 font-futuristic text-sm md:text-lg uppercase tracking-[0.4em]">NO_NODES_DETACHED</h4>
          </div>
        )}
      </div>

      {/* Pagination - Scaled for Mobile */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 sm:gap-6 pt-6">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(currentPage - 1)} 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-neutral-800/60 text-neutral-600 hover:text-[#00e5ff] transition-all disabled:opacity-20 flex items-center justify-center"
          >
            <ChevronLeft size={16} md:size={20} />
          </button>
          
          <div className="flex items-center gap-1.5">
            {[...Array(totalPages)].map((_, i) => {
                // Show limited pages on mobile
                if (totalPages > 5 && Math.abs(i + 1 - currentPage) > 1 && i !== 0 && i !== totalPages - 1) {
                  if (i + 1 === 2 || i + 1 === totalPages - 1) return <span key={i} className="text-neutral-800">.</span>;
                  return null;
                }
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-[8px] md:text-[9px] font-black transition-all border ${
                      currentPage === i + 1 
                        ? 'bg-[#00e5ff] text-black border-[#00e5ff] shadow-[0_0_15px_rgba(0,229,255,0.3)]' 
                        : 'bg-transparent text-neutral-600 border-neutral-800/60 hover:border-neutral-700'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
            })}
          </div>
          
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(currentPage + 1)} 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-neutral-800/60 text-neutral-600 hover:text-[#00e5ff] transition-all disabled:opacity-20 flex items-center justify-center"
          >
            <ChevronRight size={16} md:size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadGrid;
