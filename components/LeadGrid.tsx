import React, { useState, useMemo, memo, useRef, useEffect } from 'react';
import { Lead, UserRole } from '../types.ts';
import { 
  Zap, MapPin, Heart, ChevronLeft, ChevronRight, 
  Search, FilterX, ShieldAlert, Target, Cpu,
  ArrowUpRight, Activity, Globe, Scale, Home, Plane, 
  HeartPulse, Coins, Layers, LayoutGrid, Database, Star,
  MoveHorizontal
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

const getIndustryStyles = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('finance') || cat.includes('crypto')) {
    return { icon: Coins, color: 'text-emerald-400', glow: 'shadow-emerald-500/20', border: 'border-emerald-500/30', bg: 'bg-emerald-950/20', accent: 'emerald' };
  }
  if (cat.includes('legal') || cat.includes('law')) {
    return { icon: Scale, color: 'text-rose-400', glow: 'shadow-rose-500/20', border: 'border-rose-500/30', bg: 'bg-rose-950/20', accent: 'rose' };
  }
  if (cat.includes('real estate') || cat.includes('property') || cat.includes('solar')) {
    return { icon: Home, color: 'text-amber-400', glow: 'shadow-amber-500/20', border: 'border-amber-500/30', bg: 'bg-amber-950/20', accent: 'amber' };
  }
  if (cat.includes('health') || cat.includes('medical')) {
    return { icon: HeartPulse, color: 'text-cyan-400', glow: 'shadow-cyan-500/20', border: 'border-cyan-500/30', bg: 'bg-cyan-950/20', accent: 'cyan' };
  }
  if (cat.includes('travel') || cat.includes('flight')) {
    return { icon: Plane, color: 'text-blue-400', glow: 'shadow-blue-500/20', border: 'border-blue-500/30', bg: 'bg-blue-950/20', accent: 'blue' };
  }
  return { icon: Layers, color: 'text-[#FACC15]', glow: 'shadow-yellow-500/20', border: 'border-yellow-500/30', bg: 'bg-yellow-950/20', accent: 'yellow' };
};

const getGrade = (score: number) => {
  if (score >= 90) return { label: 'S-TIER', color: 'text-white bg-red-600' };
  if (score >= 80) return { label: 'A-RANK', color: 'text-black bg-[#FACC15]' };
  return { label: 'B-RANK', color: 'text-white bg-neutral-700' };
};

const MemoizedLeadCard = memo(({ 
  lead, isUserEngaged, isInWishlist, isOwner, userRole, onBid, onEdit, onToggleWishlist 
}: any) => {
  const industry = getIndustryStyles(lead.category);
  const grade = getGrade(lead.qualityScore);
  const isAdmin = userRole === 'admin';
  const canEdit = isAdmin || isOwner;

  return (
    <div 
      className={`group relative rounded-[2rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col bg-black ${industry.border} hover:border-white/40 shadow-2xl md:hover:-translate-y-2 ${isUserEngaged ? 'active-border-pulse' : ''} snap-center shrink-0 w-[88vw] md:w-auto`}
      onClick={() => canEdit ? onEdit?.(lead) : onBid(lead.id)}
    >
      {/* CARD HEADER: STATUS & RANK */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[7px] font-tactical font-black uppercase tracking-tighter ${grade.color}`}>
            {grade.label}
          </span>
          <span className="text-[7px] font-tactical text-neutral-600 uppercase tracking-widest">NODE_{lead.id.slice(-4)}</span>
        </div>
        <div className="flex items-center gap-2">
           <Activity size={10} className={`${isUserEngaged ? 'text-emerald-500 animate-pulse' : 'text-neutral-800'}`} />
           <div className={`w-1.5 h-1.5 rounded-full ${isUserEngaged ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-neutral-800'}`} />
        </div>
      </div>

      {/* VISUAL MODULE: ICON & INTEGRITY GAUGE */}
      <div className={`h-32 flex items-center justify-center relative overflow-hidden ${industry.bg}`}>
         <industry.icon size={56} className={`${industry.color} relative z-10 opacity-80 group-hover:scale-110 transition-transform`} />
         
         {/* Background Watermark */}
         <industry.icon size={120} className={`absolute -bottom-10 -left-10 opacity-[0.05] ${industry.color} pointer-events-none`} />
         
         {/* Integrity Radial Gauge (Top Right) */}
         <div className="absolute top-4 right-4 flex flex-col items-center">
            <div className="relative w-10 h-10">
               <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path className="text-neutral-800 stroke-current" strokeWidth="3" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className={`${industry.color} stroke-current`} strokeWidth="3" strokeDasharray={`${lead.qualityScore}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[7px] font-tactical font-black text-white">{lead.qualityScore}%</span>
               </div>
            </div>
            <span className="text-[5px] font-tactical text-neutral-600 uppercase mt-1">INTEGRITY</span>
         </div>
      </div>

      {/* IDENTITY MODULE */}
      <div className="p-5 flex-1 flex flex-col space-y-4">
        <div>
          <span className={`text-[8px] font-tactical font-black uppercase tracking-[0.2em] ${industry.color}`}>{lead.category}</span>
          <h3 className="text-sm md:text-base font-tactical font-black text-white uppercase tracking-tight leading-tight group-hover:text-white transition-colors mt-1">
            {lead.title}
          </h3>
          <p className="text-[9px] text-neutral-500 font-medium leading-relaxed line-clamp-2 mt-2 font-rajdhani">
            {lead.description}
          </p>
        </div>

        {/* TELEMETRY GRID */}
        <div className="grid grid-cols-2 gap-2">
           <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2 flex flex-col">
              <span className="text-[6px] font-tactical font-black text-neutral-600 uppercase">Latency_Clock</span>
              <span className="text-[9px] font-tactical text-neutral-300 mt-1">{lead.timeLeft}</span>
           </div>
           <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2 flex flex-col">
              <span className="text-[6px] font-tactical font-black text-neutral-600 uppercase">Regional_Hub</span>
              <span className="text-[9px] font-tactical text-neutral-300 mt-1 flex items-center gap-1">
                <MapPin size={8} className={industry.color} /> {lead.countryCode}
              </span>
           </div>
           <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2 flex flex-col">
              <span className="text-[6px] font-tactical font-black text-neutral-600 uppercase">Seller_Rep</span>
              <div className="flex items-center gap-1 mt-1">
                 <Star size={8} className="text-[#FACC15] fill-current" />
                 <span className="text-[9px] font-tactical text-white">{lead.sellerRating}</span>
              </div>
           </div>
           <div className="bg-white/[0.03] border border-white/5 rounded-xl p-2 flex flex-col">
              <span className="text-[6px] font-tactical font-black text-neutral-600 uppercase">Auction_Vol</span>
              <span className="text-[9px] font-tactical text-white mt-1">{lead.bidCount} Bids</span>
           </div>
        </div>
      </div>

      {/* LIQUIDITY MODULE */}
      <div className="p-5 border-t border-white/5 bg-white/[0.01] space-y-4">
        <div className="flex justify-between items-end">
          <div className="flex flex-col">
            <span className="text-[7px] font-tactical font-black text-neutral-700 uppercase tracking-[0.2em]">CURRENT_BID</span>
            <div className="text-2xl font-black text-white font-tactical tracking-tighter leading-none flex items-baseline gap-0.5 mt-1">
              <span className={`text-xs opacity-40 ${industry.color}`}>$</span>{lead.currentBid.toLocaleString()}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(lead.id); }}
            className={`w-8 h-8 rounded-lg border transition-all flex items-center justify-center ${isInWishlist ? 'bg-rose-600 border-rose-600 text-white' : 'bg-black border-neutral-800 text-neutral-700 hover:text-white'}`}
          >
            <Heart size={14} fill={isInWishlist ? "currentColor" : "none"} />
          </button>
        </div>

        <button 
          className={`w-full h-10 rounded-xl font-tactical font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 border-b-2 ${
            canEdit 
              ? 'bg-white text-black border-neutral-300 hover:bg-[#FACC15]' 
              : `${industry.bg} ${industry.color} ${industry.border} border-b-${industry.accent}-800 hover:bg-white hover:text-black hover:border-white shadow-lg`
          }`}
        >
          {canEdit ? 'MANAGE_NODE' : 'ACCESS_LEADS'} <ArrowUpRight size={12} />
        </button>
      </div>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
    </div>
  );
});

const LeadGrid: React.FC<LeadGridProps> = ({ 
  leads, onBid, onEdit, onToggleWishlist, userRole, currentUserId, activeBids = [], wishlist = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [scrollProgress, setScrollProgress] = useState(0);
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

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const progress = (scrollLeft / (scrollWidth - clientWidth)) * 100;
      setScrollProgress(isNaN(progress) ? 0 : progress);
    }
  };

  useEffect(() => {
    handleScroll();
  }, [currentLeads]);

  return (
    <div className="space-y-10">
      {/* CONSOLE HUD CONTROLS */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-black/40 p-5 rounded-[2rem] border border-[#1A1A1A]">
        <div className="flex items-center gap-5 w-full lg:w-auto">
          <div className="relative group flex-1 lg:w-80">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-[#FACC15] transition-colors" size={16} />
            <input 
              type="text"
              placeholder="FILTER_NODES..."
              className="w-full bg-[#0C0C0C] border border-neutral-800 rounded-xl pl-14 pr-6 py-3.5 text-[10px] font-tactical font-black uppercase tracking-widest text-neutral-200 outline-none focus:border-[#FACC15]/40 transition-all placeholder:text-neutral-800"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <div className="hidden sm:flex bg-neutral-900/40 p-1 rounded-xl border border-neutral-800">
             <button className="px-5 py-2 rounded-lg text-[8px] font-tactical font-black uppercase tracking-widest bg-[#FACC15] text-black shadow-lg flex items-center gap-2">
                <LayoutGrid size={10} /> Active_Nodes
             </button>
             <button className="px-5 py-2 rounded-lg text-[8px] font-tactical font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-all flex items-center gap-2">
                <Database size={10} /> Archive
             </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-[#FACC15] rounded-full animate-pulse shadow-[0_0_10px_#FACC15]" />
             <span className="text-[9px] font-tactical font-black text-neutral-500 uppercase tracking-[0.2em]">{filteredLeads.length} SYNCED</span>
           </div>
           <button onClick={() => { soundService.playClick(); setSearchTerm(''); }} className="w-10 h-10 flex items-center justify-center bg-neutral-900 rounded-xl text-neutral-600 hover:text-white transition-colors border border-neutral-800">
              <FilterX size={18} />
           </button>
        </div>
      </div>

      {/* MOBILE SWIPE INDICATOR */}
      <div className="flex md:hidden items-center justify-between px-2 mb-2">
         <div className="flex items-center gap-2 text-[8px] font-tactical font-black text-neutral-600 uppercase tracking-widest">
            <MoveHorizontal size={10} /> Swipe_Nodes
         </div>
         <div className="w-32 h-1 bg-neutral-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#FACC15] transition-all duration-200" 
              style={{ width: `${scrollProgress}%` }}
            />
         </div>
      </div>

      {/* TACTICAL MODULE GRID / MOBILE SWIPE TRACK */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-hide pb-4 md:pb-0 flex md:grid"
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
          <div className="col-span-full py-32 text-center bg-[#050505] border-2 border-neutral-800/40 border-dashed rounded-[3rem] w-full">
             <ShieldAlert size={64} className="mx-auto text-neutral-900 mb-6 opacity-20" />
             <h4 className="text-neutral-700 font-tactical text-xl uppercase tracking-[0.4em]">Inventory Empty</h4>
             <p className="text-neutral-800 text-[9px] font-tactical font-black uppercase tracking-widest mt-4">No nodes matched security parameters</p>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-10 pt-10 pb-6 border-t border-neutral-900/50">
          <button 
            disabled={currentPage === 1} 
            onClick={() => { soundService.playClick(); setCurrentPage(prev => prev - 1); }}
            className="flex items-center gap-3 text-neutral-600 hover:text-[#FACC15] disabled:opacity-20 transition-all font-tactical font-black text-[9px] uppercase tracking-[0.3em]"
          >
            <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center">
              <ChevronLeft size={20} />
            </div>
            <span className="hidden sm:inline">PREV_CYCLE</span>
          </button>

          <div className="flex items-center gap-3">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => { soundService.playClick(true); setCurrentPage(i + 1); }}
                className={`w-3 h-3 rounded-full transition-all border ${currentPage === i + 1 ? 'bg-[#FACC15] border-[#FACC15] scale-125' : 'bg-transparent border-neutral-800'}`}
              />
            ))}
          </div>

          <button 
            disabled={currentPage === totalPages} 
            onClick={() => { soundService.playClick(); setCurrentPage(prev => prev + 1); }}
            className="flex items-center gap-3 text-neutral-600 hover:text-[#FACC15] disabled:opacity-20 transition-all font-tactical font-black text-[9px] uppercase tracking-[0.3em]"
          >
            <span className="hidden sm:inline">NEXT_CYCLE</span>
            <div className="w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center">
              <ChevronRight size={20} />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadGrid;