import React, { useState, useMemo, memo, useDeferredValue, useEffect, useRef } from 'react';
import { Lead, UserRole } from '../types.ts';
import { 
  Timer, Zap, Settings2, Heart, ChevronLeft, ChevronRight, 
  BriefcaseBusiness, PlaneTakeoff, Ship, Hotel, Building2, 
  Coins, ListFilter, Stethoscope, Shield, Info, CheckCircle2, XCircle, MousePointer2
} from 'lucide-react';

interface LeadGridProps {
  leads: Lead[];
  onBid: (id: string) => void;
  onAdminEdit?: (lead: Lead) => void;
  onAdminApprove?: (id: string) => void;
  onAdminReject?: (id: string) => void;
  onBulkApprove?: (ids: string[]) => void;
  onBulkReject?: (ids: string[]) => void;
  onDelete?: (id: string) => void;
  onDeleteLead?: (id: string) => void;
  onToggleWishlist?: (id: string) => void;
  userRole: UserRole;
  currentUserId: string;
  activeBids?: string[];
  wishlist?: string[];
}

interface TooltipProps {
  children?: React.ReactNode;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const Tooltip = ({ children, text, position = 'top' }: TooltipProps) => {
  const posClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-y-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative group/tooltip inline-block w-full">
      {children}
      <div className={`absolute ${posClasses[position]} z-[100] scale-0 group-hover/tooltip:scale-100 transition-all duration-200 origin-center bg-black/90 text-neutral-400 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg border border-neutral-800/40 shadow-2xl w-48 pointer-events-none text-center leading-relaxed backdrop-blur-md`}>
        {text}
      </div>
    </div>
  );
};

const MemoizedLeadCard = memo(({ 
  lead, 
  isUserEngaged, 
  isInWishlist, 
  isOwner, 
  userRole, 
  onBid, 
  onAdminEdit, 
  onAdminApprove, 
  onAdminReject, 
  onToggleWishlist,
  isSelected,
  onToggleSelect
}: any) => {
  const [successTrigger, setSuccessTrigger] = useState(false);
  const prevStatus = useRef(lead.status);
  const prevEngaged = useRef(isUserEngaged);

  useEffect(() => {
    if ((prevStatus.current !== 'approved' && lead.status === 'approved') || 
        (prevEngaged.current === false && isUserEngaged === true)) {
      setSuccessTrigger(true);
      const timer = setTimeout(() => setSuccessTrigger(false), 1000);
      return () => clearTimeout(timer);
    }
    prevStatus.current = lead.status;
    prevEngaged.current = isUserEngaged;
  }, [lead.status, isUserEngaged]);

  const getIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('flight')) return <PlaneTakeoff size={16} className="text-[#facc15]/50" />;
    if (cat.includes('cruise')) return <Ship size={16} className="text-[#facc15]/50" />;
    if (cat.includes('hotel')) return <Hotel size={16} className="text-[#facc15]/50" />;
    if (cat.includes('real estate')) return <Building2 size={16} className="text-[#facc15]/50" />;
    if (cat.includes('crypto') || cat.includes('stock')) return <Coins size={16} className="text-[#facc15]/50" />;
    if (cat.includes('insurance')) return <Shield size={16} className="text-[#facc15]/50" />;
    if (cat.includes('medical')) return <Stethoscope size={16} className="text-[#facc15]/50" />;
    return <BriefcaseBusiness size={16} className="text-neutral-700" />;
  };

  const isPending = lead.status === 'pending';
  const isAdmin = userRole === 'admin';

  return (
    <div className={`bg-[#121212]/40 rounded-2xl border transition-all flex flex-col relative overflow-hidden animate-card-pop ${
      successTrigger ? 'animate-success z-30' : ''
    } ${
      isSelected ? 'border-[#facc15]/60 ring-2 ring-[#facc15]/10 scale-[1.02] bg-[#facc15]/5' : 
      isUserEngaged ? 'border-[#facc15]/30 ring-1 ring-[#facc15]/5' : 'border-neutral-800/30'
    } hover:border-[#facc15]/20 group shadow-md`}>
      
      {/* Selection Interface for Admin */}
      {isAdmin && (
        <div className="absolute top-4 left-4 z-20">
          <button 
            onClick={() => onToggleSelect?.(lead.id)}
            className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${
              isSelected ? 'bg-[#facc15] border-[#facc15] text-black' : 'border-neutral-700 bg-black/40 hover:border-neutral-500'
            }`}
          >
            {isSelected && <CheckCircle2 size={14} strokeWidth={3} />}
          </button>
        </div>
      )}

      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => onToggleWishlist?.(lead.id)}
          className={`p-2 rounded-full transition-all ${isInWishlist ? 'bg-red-900/40 text-red-500 shadow-lg' : 'bg-neutral-900/40 text-neutral-700 hover:bg-neutral-800/60'}`}
        >
          <Heart size={14} fill={isInWishlist ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-6 pt-12 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div className="max-w-[80%]">
            <div className="flex items-center gap-2 mb-1.5">
              {getIcon(lead.category)}
              <span className="text-[10px] text-neutral-600 font-black uppercase tracking-widest">{lead.category}</span>
            </div>
            <h3 className="text-neutral-300 font-bold text-base leading-tight group-hover:text-neutral-100 transition-colors">{lead.title}</h3>
          </div>
          <Tooltip text="AI Integrity Score. Higher scores indicate superior traffic quality.">
            <div className="text-[11px] font-black text-[#facc15]/60 bg-[#facc15]/5 px-2 py-1 rounded-lg border border-[#facc15]/10">
              {lead.qualityScore}
            </div>
          </Tooltip>
        </div>

        <p className="text-neutral-600 text-xs line-clamp-2 mb-6 flex-1 italic leading-relaxed">
          {lead.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-black/30 p-3 rounded-xl border border-neutral-800/40">
            <p className="text-[8px] text-neutral-700 font-black uppercase tracking-wider mb-1">Market Floor</p>
            <p className="text-sm font-black text-neutral-400">${lead.currentBid}</p>
          </div>
          <div className="bg-black/30 p-3 rounded-xl border border-neutral-800/40">
            <p className="text-[8px] text-neutral-700 font-black uppercase tracking-wider mb-1">Remaining</p>
            <p className="text-sm font-black text-[#facc15]/50 flex items-center gap-1.5"><Timer size={14} /> {lead.timeLeft}</p>
          </div>
        </div>

        {isAdmin && isPending && !isSelected && (
          <div className="grid grid-cols-2 gap-3 mb-6 animate-in slide-in-from-top-1 duration-200">
            <button onClick={() => onAdminApprove?.(lead.id)} className="bg-emerald-900/40 text-emerald-600 py-2 rounded-xl font-black text-[10px] uppercase border border-emerald-900/20 hover:bg-emerald-800/40 transition-colors">Approve</button>
            <button onClick={() => onAdminReject?.(lead.id)} className="bg-red-900/40 text-red-600 py-2 rounded-xl font-black text-[10px] uppercase border border-red-900/20 hover:bg-red-800/40 transition-colors">Reject</button>
          </div>
        )}

        <div className="flex items-center justify-between gap-4 pt-4 border-t border-neutral-800/30">
          <button
            onClick={() => onBid(lead.id)}
            disabled={isPending || isOwner || isSelected}
            className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
              isSelected ? 'bg-neutral-800/50 text-neutral-600 border border-neutral-700' :
              isOwner ? 'bg-neutral-900/40 text-neutral-700' : 
              isPending ? 'bg-neutral-900/40 text-neutral-700' : 
              'bg-[#facc15]/60 text-black hover:bg-[#facc15]/80 active:scale-95 shadow-lg shadow-yellow-400/5'
            }`}
          >
            {isSelected ? 'LOCKED FOR BATCH' : isOwner ? 'OWNER' : isPending ? 'PENDING' : 'SECURE POSITION'}
          </button>
          {isAdmin && (
            <button onClick={() => onAdminEdit?.(lead)} className="p-2.5 text-neutral-700 hover:text-neutral-400 hover:bg-neutral-800/40 rounded-xl transition-all"><Settings2 size={18} /></button>
          )}
        </div>
      </div>
    </div>
  );
});

const LeadGrid: React.FC<LeadGridProps> = ({ 
  leads, onBid, onAdminEdit, onAdminApprove, onAdminReject, onBulkApprove, onBulkReject, onDelete, onToggleWishlist, userRole, currentUserId, activeBids = [], wishlist = []
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const deferredCategory = useDeferredValue(selectedCategory);
  const ITEMS_PER_PAGE = 20;

  const categories = useMemo(() => Array.from(new Set(leads.map(l => l.category))).sort(), [leads]);
  
  const filteredLeads = useMemo(() => {
    let result = userRole === 'admin' ? leads : leads.filter(l => l.status === 'approved' || l.ownerId === currentUserId);
    if (deferredCategory) result = result.filter(l => l.category === deferredCategory);
    return result;
  }, [leads, userRole, currentUserId, deferredCategory]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const currentLeads = filteredLeads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === currentLeads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(currentLeads.map(l => l.id)));
    }
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedIds(new Set()); // Clear selection on page change for safety
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`w-10 h-10 rounded-xl text-xs font-black transition-all flex items-center justify-center border ${
            currentPage === i 
              ? 'bg-[#facc15]/60 text-black border-[#facc15]/40 shadow-md' 
              : 'bg-black/20 text-neutral-600 border-neutral-800/40 hover:border-neutral-700 hover:text-neutral-400'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  const isAdmin = userRole === 'admin';

  return (
    <div className="space-y-8 will-change-transform relative">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-[#0a0a0a]/40 border border-neutral-800/30 p-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {isAdmin && (
            <button 
              onClick={toggleSelectAll}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 font-black text-[9px] uppercase tracking-widest ${
                selectedIds.size === currentLeads.length && currentLeads.length > 0
                  ? 'bg-[#facc15] text-black border-[#facc15]'
                  : 'bg-neutral-900/40 text-neutral-500 border-neutral-800/40'
              }`}
            >
              <MousePointer2 size={16} /> 
              <span className="hidden md:inline">{selectedIds.size === currentLeads.length ? 'Deselect All' : 'Select Page'}</span>
            </button>
          )}
          <div className="p-2.5 bg-neutral-900/40 rounded-xl text-neutral-700">
            <ListFilter size={20} />
          </div>
          <select 
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-sm font-bold text-neutral-400 outline-none cursor-pointer flex-1 sm:w-64"
          >
            <option value="" className="bg-black">Full Market Spectrum</option>
            {categories.map(c => <option key={c} value={c} className="bg-black">{c}</option>)}
          </select>
        </div>
        <div className="text-[11px] font-black text-neutral-700 uppercase tracking-[0.2em]">{filteredLeads.length} Operational Nodes</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
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
              onAdminEdit={onAdminEdit}
              onAdminApprove={onAdminApprove}
              onAdminReject={onAdminReject}
              onDelete={onDelete}
              onToggleWishlist={onToggleWishlist}
              isSelected={selectedIds.has(lead.id)}
              onToggleSelect={toggleSelect}
            />
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-[#0a0a0a]/20 border border-neutral-800/20 border-dashed rounded-[3rem]">
            <Zap className="mx-auto text-neutral-900 mb-6" size={64} />
            <h4 className="text-neutral-500 font-black text-xl uppercase tracking-tighter mb-2">Zero Nodes Detected</h4>
            <p className="text-neutral-700 text-xs font-medium max-w-xs mx-auto">The current frequency spectrum contains no active lead assets matching your filter.</p>
          </div>
        )}
      </div>

      {/* Floating Bulk Action Dock */}
      {isAdmin && selectedIds.size > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-8 duration-500 flex items-center gap-4 bg-black/80 backdrop-blur-2xl border border-neutral-700/50 p-4 rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)] px-8">
           <div className="flex items-center gap-4 border-r border-neutral-800 pr-6 mr-2">
              <div className="w-10 h-10 bg-[#facc15]/10 rounded-full flex items-center justify-center border border-[#facc15]/20">
                 <span className="text-[#facc15] font-black text-sm">{selectedIds.size}</span>
              </div>
              <div className="hidden md:block">
                 <p className="text-[9px] font-black text-neutral-500 uppercase tracking-widest leading-none">Selected</p>
                 <p className="text-[10px] font-bold text-neutral-300 uppercase mt-1">Batch Operations</p>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <button 
                onClick={() => {
                  onBulkApprove?.(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }}
                className="bg-emerald-900/60 hover:bg-emerald-800 transition-all text-emerald-500 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-emerald-900/40"
              >
                <CheckCircle2 size={16} /> Approve
              </button>
              <button 
                onClick={() => {
                  onBulkReject?.(Array.from(selectedIds));
                  setSelectedIds(new Set());
                }}
                className="bg-red-900/60 hover:bg-red-800 transition-all text-red-500 px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-red-900/40"
              >
                <XCircle size={16} /> Reject
              </button>
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="text-neutral-500 hover:text-neutral-300 font-black text-[9px] uppercase tracking-widest px-4"
              >
                Cancel
              </button>
           </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8 py-10 border-t border-neutral-800/20">
          <div className="text-[10px] font-black uppercase text-neutral-700 tracking-[0.3em]">
            Displaying {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredLeads.length)} of {filteredLeads.length}
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              disabled={currentPage === 1} 
              onClick={() => handlePageChange(currentPage - 1)} 
              className="p-3 bg-black/20 border border-neutral-800/40 rounded-xl text-neutral-700 disabled:opacity-30 transition-all hover:border-neutral-700 hover:text-neutral-400"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center gap-2">
              {renderPageNumbers()}
            </div>
            
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => handlePageChange(currentPage + 1)} 
              className="p-3 bg-black/20 border border-neutral-800/40 rounded-xl text-neutral-700 disabled:opacity-30 transition-all hover:border-neutral-700 hover:text-neutral-400"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadGrid;