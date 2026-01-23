import React, { useState, useMemo, memo, useDeferredValue } from 'react';
import { Lead, UserRole } from '../types.ts';
import { 
  Timer, Zap, Settings2, Heart, ChevronLeft, ChevronRight, 
  BriefcaseBusiness, PlaneTakeoff, Ship, Hotel, Building2, 
  Coins, ListFilter, Stethoscope, Shield, Info
} from 'lucide-react';

// Define the missing LeadGridProps interface to fix line 129 error
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

// Fixed: Made children optional to resolve "children missing" errors on lines 100 and 131
interface TooltipProps {
  children?: React.ReactNode;
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

// Informative Tooltip Component for reusable UI guidance
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
          {/* Fixed: Tooltip correctly wraps its children to resolve line 77 error */}
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
          {/* Fixed: Tooltip correctly wraps its children to resolve line 107 error */}
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
  const ITEMS_PER_PAGE = 8;

  const categories = useMemo(() => Array.from(new Set(leads.map(l => l.category))).sort(), [leads]);
  
  const filteredLeads = useMemo(() => {
    let result = userRole === 'admin' ? leads : leads.filter(l => l.status === 'approved' || l.ownerId === currentUserId);
    if (deferredCategory) result = result.filter(l => l.category === deferredCategory);
    return result;
  }, [leads, userRole, currentUserId, deferredCategory]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const currentLeads = filteredLeads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
        <div className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">{filteredLeads.length} Available</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {currentLeads.map((lead) => (
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
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 disabled:opacity-30 transition-opacity"><ChevronLeft size={20} /></button>
          <span className="text-[10px] font-black uppercase text-neutral-600 tracking-[0.2em]">Page {currentPage} / {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 disabled:opacity-30 transition-opacity"><ChevronRight size={20} /></button>
        </div>
      )}
    </div>
  );
};

export default LeadGrid;