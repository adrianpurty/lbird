
import React, { useState, useMemo, memo, useRef, useEffect } from 'react';
import { Lead, UserRole } from '../types.ts';
import { 
  Zap, Heart, ChevronLeft, ChevronRight, 
  Search, FilterX, ShieldAlert, Target,
  ArrowUpRight, Activity, LayoutGrid, Database, Star,
  MoveHorizontal, Clock, Globe, Plane, Home, Car, Palmtree, Briefcase
} from 'lucide-react';
import { soundService } from '../services/soundService.ts';

interface LeadGridProps {
  leads: Lead[];
  onBid: (id: string) => void;
  onEdit?: (lead: Lead) => void;
  onToggleWishlist?: (id: string) => void;
  userRole: UserRole;
  currentUserId: string;
  activeBids?: string[];
  wishlist?: string[];
}

const getCategoryIcon = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('flight')) return <Plane size={24} className="text-[#2DD4BF]" />;
  if (cat.includes('resort') || cat.includes('safari') || cat.includes('cruise')) return <Palmtree size={24} className="text-[#2DD4BF]" />;
  if (cat.includes('hotel')) return <Home size={24} className="text-[#2DD4BF]" />;
  if (cat.includes('car')) return <Car size={24} className="text-[#2DD4BF]" />;
  if (cat.includes('professional') || cat.includes('support')) return <Briefcase size={24} className="text-[#2DD4BF]" />;
  return <Target size={24} className="text-[#2DD4BF]" />;
};

const MemoizedLeadCard = memo(({ 
  lead, isUserEngaged, isInWishlist, isOwner, userRole, onBid, onEdit, onToggleWishlist 
}: any) => {
  const isAdmin = userRole === 'admin';
  const canEdit = isAdmin || isOwner;

  return (
    <div 
      className="group relative bg-[#0D0D0D] rounded-2xl border border-white/5 overflow-hidden flex flex-col p-6 h-full transition-all hover:border-white/20"
      onClick={() => canEdit ? onEdit?.(lead) : onBid(lead.id)}
    >
      {/* Top Header Row */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex flex-col">
          <div className="bg-[#1A1608] px-2.5 py-1 rounded text-[10px] font-black text-[#FACC15] uppercase tracking-widest mb-2 inline-block">
            {lead.category.replace('Bookings', '').replace('Inquiries', '').toUpperCase()}
          </div>
          <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest">VERIFIED GLOBAL SOURCE</span>
        </div>
        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-1 rounded-lg">
          <Star size={12} className="text-[#FACC15] fill-current" />
          <span className="text-[11px] font-bold text-white">{lead.sellerRating.toFixed(1)}</span>
        </div>
      </div>

      {/* Title & Description */}
      <div className="mb-6 flex gap-4">
        <div className="shrink-0 w-12 h-12 bg-black/40 rounded-xl flex items-center justify-center border border-white/5">
          {getCategoryIcon(lead.category)}
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-white leading-snug mb-2 group-hover:text-[#FACC15] transition-colors truncate">
            {lead.title}
          </h3>
          <p className="text-[11px] text-neutral-500 font-medium leading-relaxed line-clamp-2">
            "{lead.description}"
          </p>
        </div>
      </div>

      {/* Stat Boxes */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <div className="bg-black/60 p-3 rounded-xl border border-white/5">
           <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest block mb-1">INTENT SCORE</span>
           <div className="flex items-center gap-2">
              <Zap size={10} className="text-[#FACC15] fill-current" />
              <span className="text-xs font-bold text-white tracking-tighter">{lead.qualityScore}%</span>
           </div>
        </div>
        <div className="bg-black/60 p-3 rounded-xl border border-white/5">
           <span className="text-[8px] font-bold text-neutral-600 uppercase tracking-widest block mb-1">MARKET SCOPE</span>
           <span className="text-xs font-bold text-white tracking-tighter truncate block">Global / Web</span>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex justify-between items-end mb-6 px-1">
        <div>
           <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest block mb-1">FLOOR PRICE / CPA</span>
           <div className="text-2xl font-black text-white italic tracking-tighter font-tactical">${lead.currentBid.toLocaleString()}</div>
        </div>
        <div className="text-right">
           <span className="text-[9px] font-bold text-neutral-600 uppercase tracking-widest block mb-1 flex items-center justify-end gap-1.5">
             <Clock size={10} /> AUCTION END
           </span>
           <div className="text-sm font-black text-red-500 font-mono tracking-widest">{lead.timeLeft.toUpperCase()}</div>
        </div>
      </div>

      {/* Large Yellow Action Button */}
      <button 
        className="w-full bg-[#FACC15] hover:bg-white text-black py-4 rounded-xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-lg group/btn"
      >
        <Zap size={16} fill="currentColor" className="group-hover/btn:scale-110 transition-transform" />
        BUY / PLACE BID
      </button>

      {/* Hover Wishlist Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(lead.id); }}
        className={`absolute top-4 right-4 w-8 h-8 rounded-full border transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 ${isInWishlist ? 'bg-rose-600 border-rose-500 text-white' : 'bg-black/40 border-white/10 text-neutral-500 hover:text-white'}`}
      >
        <Heart size={14} fill={isInWishlist ? "currentColor" : "none"} />
      </button>
    </div>
  );
});

const LeadGrid: React.FC<LeadGridProps> = ({ 
  leads, onBid, onEdit, onToggleWishlist, userRole, currentUserId, activeBids = [], wishlist = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 8; 
  
  const filteredLeads = useMemo(() => {
    return leads.filter(l => 
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      l.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [leads, searchTerm]);

  const currentLeads = useMemo(() => filteredLeads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE), [filteredLeads, currentPage]);
  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-12">
      {/* Simplified Search Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-[#1A1608] w-6 h-6 rounded-md flex items-center justify-center">
          <Database size={14} className="text-[#FACC15]" />
        </div>
        <h2 className="text-sm font-black text-white uppercase tracking-widest">ALL LIVE ASSETS</h2>
      </div>

      {/* MODULE GRID */}
      <div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
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
              onToggleWishlist={onToggleWishlist}
            />
          ))
        ) : (
          <div className="col-span-full py-40 text-center bg-[#030303] border-2 border-neutral-800/40 border-dashed rounded-[4rem] w-full">
             <ShieldAlert size={80} className="mx-auto text-neutral-800 mb-8 opacity-20" />
             <h4 className="text-neutral-500 font-futuristic text-2xl uppercase tracking-[0.5em]">Inventory Empty</h4>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-12 pt-16 pb-10 border-t border-white/5">
          <button 
            disabled={currentPage === 1} 
            onClick={() => { soundService.playClick(); setCurrentPage(prev => prev - 1); }}
            className="flex items-center gap-4 text-neutral-600 hover:text-yellow-500 disabled:opacity-20 transition-all font-black text-[10px] uppercase tracking-[0.4em]"
          >
            <div className="w-12 h-12 rounded-xl border border-neutral-800 flex items-center justify-center bg-[#080808]">
              <ChevronLeft size={24} />
            </div>
          </button>

          <div className="flex items-center gap-4">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => { soundService.playClick(true); setCurrentPage(i + 1); }}
                className={`w-2.5 h-2.5 rounded-full transition-all border ${currentPage === i + 1 ? 'bg-[#FACC15] border-[#FACC15]' : 'bg-neutral-800 border-transparent'}`}
              />
            ))}
          </div>

          <button 
            disabled={currentPage === totalPages} 
            onClick={() => { soundService.playClick(); setCurrentPage(prev => prev + 1); }}
            className="flex items-center gap-4 text-neutral-600 hover:text-yellow-500 disabled:opacity-20 transition-all font-black text-[10px] uppercase tracking-[0.4em]"
          >
            <div className="w-12 h-12 rounded-xl border border-neutral-800 flex items-center justify-center bg-[#080808]">
              <ChevronRight size={24} />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadGrid;
