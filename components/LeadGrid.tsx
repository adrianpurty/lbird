import React, { useState, useMemo, memo, useDeferredValue, useEffect } from 'react';
import { Lead, UserRole } from '../types.ts';
import { 
  Timer, Zap, Settings2, Heart, ChevronLeft, ChevronRight, 
  BriefcaseBusiness, PlaneTakeoff, Ship, Hotel, Building2, 
  Coins, ListFilter, Stethoscope, Shield, Info
} from 'lucide-react';

interface LeadGridProps {
  leads: Lead[];
  onBid: (id: string) => void;
  onAdminEdit?: (lead: Lead) => void;
  onAdminApprove?: (id: string) => void;
  onAdminReject?: (id: string) => void;
  onDelete?: (id: string) => void;
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
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2'
  };

  return (
    <div className="relative group/tooltip inline-block w-full">
      {children}
      <div className={`absolute ${posClasses[position]} z-[100] scale-0 group-hover/tooltip:scale-100 transition-all duration-200 origin-center bg-black/90 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg border border-white/10 shadow-2xl w-48 pointer-events-none text-center leading-relaxed backdrop-blur-md`}>
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
  onToggleWishlist 
}: any) => {
  const getIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('flight')) return <PlaneTakeoff size={16} className="text-sky-400" />;
    if (cat.includes('cruise')) return <Ship size={16} className="text-blue-300" />;
    if (cat.includes('hotel')) return <Hotel size={16} className="text-orange-300" />;
    if (cat.includes('real estate')) return <Building2 size={16} className="text-emerald-400" />;
    if (cat.includes('crypto') || cat.includes('stock')) return <Coins size={16} className="text-[var(--text-accent)]" />;
    if (cat.includes('insurance')) return <Shield size={16} className="text-blue-500" />;
    if (cat.includes('medical')) return <Stethoscope size={16} className="text-red-400" />;
    return <BriefcaseBusiness size={16} className="text-neutral-500" />;
  };

  const isPending = lead.status === 'pending';
  const isAdmin = userRole === 'admin';

  return (
    <div className={`bg-[var(--bg-card)] rounded-xl border transition-all flex flex-col relative overflow-hidden animate-card-pop lead-card-render ${
      isUserEngaged ? 'border-[var(--text-accent)]/60 animate-bid-glow' : 'border-[var(--border-main)]'
    } hover:border-[var(--text-accent)]/40 hover:-translate-y-0.5 shadow-sm`}>
      <div className="absolute top-3 right-3 z-20 flex gap-2">
        <button
          onClick={() => onToggleWishlist?.(lead.id)}
          className={`p-1.5 rounded-full transition-all ${isInWishlist ? 'bg-red-500 text-white shadow-lg' : 'bg-black/10 text-neutral-400 hover:text-white'}`}
        >
          <Heart size={12} fill={isInWishlist ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-5 pt-10 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-3">
          <div className="max-w-[80%]">
            <div className="flex items-center gap-2 mb-1">
              {getIcon(lead.category)}
              <span className="text-[8px] text-neutral-600 font-black uppercase tracking-widest">{lead.category}</span>
            </div>
            <h3 className="text-[var(--text-main)] font-bold text-sm line-clamp-1">{lead.title}</h3>
          </div>
          <Tooltip text="AI Integrity Score (0-100). Higher scores indicate superior traffic quality and higher conversion probability.">
            <div className="text-[10px] font-black text-[var(--text-accent)] bg-[var(--text-accent)]/10 px-1.5 py-0.5 rounded cursor-help border border-[var(--text-accent)]/20">
              {lead.qualityScore}
            </div>
          </Tooltip>
        </div>

        <p className="text-neutral-500 text-[10px] line-clamp-2 mb-4 flex-1 italic leading-relaxed">
          {lead.description}
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-neutral-50 dark:bg-black/20 p-2 rounded-lg border border-[var(--border-main)]">
            <p className="text-[7px] text-neutral-600 font-black uppercase">Floor</p>
            <p className="text-xs font-black text-[var(--text-main)]">${lead.currentBid}</p>
          </div>
          <div className="bg-neutral-50 dark:bg-black/20 p-2 rounded-lg border border-[var(--border-main)]">
            <p className="text-[7px] text-neutral-600 font-black uppercase">Remaining</p>
            <p className="text-xs font-black text-[var(--text-accent)] flex items-center gap-1"><Timer size={8} /> {lead.timeLeft}</p>
          </div>
        </div>

        {isAdmin && isPending && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button onClick={() => onAdminApprove?.(lead.id)} className="bg-emerald-600 text-white py-1.5 rounded-lg font-black text-[8px] uppercase hover:bg-emerald-500 transition-colors">Approve</button>
            <button onClick={() => onAdminReject?.(lead.id)} className="bg-red-600 text-white py-1.5 rounded-lg font-black text-[8px] uppercase hover:bg-red-500 transition-colors">Reject</button>
          </div>
        )}

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-[var(--border-main)]/50">
          <Tooltip text={isOwner ? "You are the provider of this node" : "Secure your position in the lead flow by placing a bid."}>
            <button
              onClick={() => onBid(lead.id)}
              disabled={isPending || isOwner}
              className={`w-full py-2 rounded-lg font-black text-[9px] uppercase tracking-widest transition-all ${
                isOwner ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20' : 
                isPending ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400' : 
                'bg-[var(--text-accent)] text-black hover:brightness-110 active:scale-95'
              }`}
            >
              {isOwner ? 'OWNER' : isPending ? 'PENDING' : 'SECURE'}
            </button>
          </Tooltip>
          {isAdmin && (
            <button onClick={() => onAdminEdit?.(lead)} className="p-2 text-neutral-500 hover:text-[var(--text-accent)] transition-colors"><Settings2 size={14} /></button>
          )}
        </div>
      </div>
    </div>
  );
});

const LeadGrid: React.FC<LeadGridProps> = ({ 
  leads, onBid, onAdminEdit, onAdminApprove, onAdminReject, onDelete, onToggleWishlist, userRole, currentUserId, activeBids = [], wishlist = []
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const deferredCategory = useDeferredValue(selectedCategory);
  // Enhanced: Handling 20 leads per page as requested
  const ITEMS_PER_PAGE = 20;

  const categories = useMemo(() => Array.from(new Set(leads.map(l => l.category))).sort(), [leads]);
  
  const filteredLeads = useMemo(() => {
    let result = userRole === 'admin' ? leads : leads.filter(l => l.status === 'approved' || l.ownerId === currentUserId);
    if (deferredCategory) result = result.filter(l => l.category === deferredCategory);
    return result;
  }, [leads, userRole, currentUserId, deferredCategory]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const currentLeads = filteredLeads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // Auto-scroll to top when page changes for better UX
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
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
          className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all flex items-center justify-center border ${
            currentPage === i 
              ? 'bg-[var(--text-accent)] text-black border-[var(--text-accent)] shadow-lg shadow-yellow-400/10' 
              : 'bg-transparent text-neutral-500 border-neutral-800 hover:text-white hover:border-neutral-600'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className="space-y-6 will-change-transform">
      <div className="flex items-center justify-between gap-4 bg-[var(--bg-surface)] border border-[var(--border-main)] p-3 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 px-2">
          <ListFilter size={16} className="text-neutral-500" />
          <select 
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="bg-transparent text-xs font-bold text-[var(--text-main)] outline-none cursor-pointer"
          >
            <option value="">Full Marketplace</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">{filteredLeads.length} Available Nodes</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
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
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-[var(--bg-card)] border border-[var(--border-main)] rounded-2xl border-dashed">
            <Zap className="mx-auto text-neutral-700 mb-4" size={32} />
            <p className="text-[10px] font-black uppercase text-neutral-600 tracking-[0.2em]">Zero Leads Detected in current spectrum</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-[var(--border-main)]/30">
          <div className="text-[9px] font-black uppercase text-neutral-600 tracking-widest">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredLeads.length)} of {filteredLeads.length}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1} 
              onClick={() => handlePageChange(currentPage - 1)} 
              className="p-2 bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-neutral-800 rounded-lg disabled:opacity-30 transition-all hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              <ChevronLeft size={16} />
            </button>
            
            <div className="flex items-center gap-1.5 px-2">
              {renderPageNumbers()}
            </div>
            
            <button 
              disabled={currentPage === totalPages} 
              onClick={() => handlePageChange(currentPage + 1)} 
              className="p-2 bg-neutral-100 dark:bg-black/40 border border-neutral-200 dark:border-neutral-800 rounded-lg disabled:opacity-30 transition-all hover:bg-neutral-200 dark:hover:bg-neutral-800"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadGrid;