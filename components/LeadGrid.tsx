
import React, { useState, useMemo, memo, useRef, useEffect } from 'react';
import { Lead, UserRole } from '../types.ts';
import { 
  Zap, Heart, ChevronLeft, ChevronRight, 
  Search, FilterX, ShieldAlert, Target,
  ArrowUpRight, Activity, LayoutGrid, Database, Star,
  MoveHorizontal, Clock, ShieldCheck, TrendingUp
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

const getTierStyles = (score: number) => {
  if (score >= 95) { // S-TIER / APEX
    return {
      bg: 'bg-[#030303]',
      border: 'border-yellow-500/30',
      accent: 'text-yellow-500',
      accentBg: 'bg-yellow-500',
      glow: 'shadow-[0_0_40px_rgba(234,179,8,0.07)]',
      label: 'APEX_DISTRIBUTION',
      gradient: 'from-yellow-500/20 via-transparent to-transparent'
    };
  }
  if (score >= 85) { // A-TIER / PRIME
    return {
      bg: 'bg-[#030303]',
      border: 'border-cyan-500/30',
      accent: 'text-cyan-400',
      accentBg: 'bg-cyan-500',
      glow: 'shadow-[0_0_40px_rgba(6,182,212,0.07)]',
      label: 'PRIME_MANIFEST',
      gradient: 'from-cyan-500/20 via-transparent to-transparent'
    };
  }
  return { // STANDARD / CORE
    bg: 'bg-[#030303]',
    border: 'border-violet-500/20',
    accent: 'text-violet-400',
    accentBg: 'bg-violet-500',
    glow: 'shadow-[0_0_40px_rgba(139,92,246,0.05)]',
    label: 'CORE_MANIFEST',
    gradient: 'from-violet-500/10 via-transparent to-transparent'
  };
};

const MemoizedLeadCard = memo(({ 
  lead, isUserEngaged, isInWishlist, isOwner, userRole, onBid, onEdit, onToggleWishlist 
}: any) => {
  const tier = getTierStyles(lead.qualityScore);
  const isAdmin = userRole === 'admin';
  const canEdit = isAdmin || isOwner;

  return (
    <div 
      className={`group relative min-h-[380px] h-full rounded-[2.5rem] border transition-all duration-700 cursor-pointer overflow-hidden flex flex-col ${tier.bg} ${tier.border} ${tier.glow} hover:border-white/40 shadow-2xl md:hover:-translate-y-3 snap-center shrink-0 w-[88vw] md:w-auto p-8 justify-between`}
      onClick={() => canEdit ? onEdit?.(lead) : onBid(lead.id)}
    >
      {/* PREMIUM ASSET OVERLAY */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} opacity-30 group-hover:opacity-50 transition-opacity duration-1000`} />
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
      
      {/* TACTICAL HUD ELEMENTS */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000" />

      {/* CARD HEADER: FULL TITLE DISPLAY */}
      <div className="relative z-10 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className={`w-2 h-2 rounded-full ${isUserEngaged ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]' : 'bg-neutral-800'}`} />
             <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${tier.accent}`}>{tier.label}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(lead.id); }}
            className={`w-11 h-11 rounded-2xl border transition-all flex items-center justify-center ${isInWishlist ? 'bg-rose-600 border-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]' : 'bg-white/5 border-white/5 text-neutral-600 hover:text-white hover:bg-white/10'}`}
          >
            <Heart size={18} fill={isInWishlist ? "currentColor" : "none"} />
          </button>
        </div>

        {/* COMPLETE LEAD NAME - NO TRUNCATION */}
        <h3 className="text-2xl md:text-3xl font-futuristic font-black text-white uppercase tracking-tight leading-[1.1] group-hover:text-white transition-colors">
          {lead.title}
        </h3>
      </div>

      {/* MID-SECTION: CATEGORY & DESCRIPTION */}
      <div className="relative z-10 space-y-6 py-4">
        <div className="flex flex-wrap gap-3">
          <div className="px-3.5 py-1.5 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2.5 backdrop-blur-md">
            <Target size={14} className={tier.accent} />
            <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">{lead.category}</span>
          </div>
          <div className="px-3.5 py-1.5 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2 backdrop-blur-md">
            <Star size={12} className="text-yellow-500" fill="currentColor" />
            <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{lead.sellerRating.toFixed(1)}</span>
          </div>
        </div>
        
        <p className="text-xs md:text-sm text-neutral-500 font-medium leading-relaxed uppercase tracking-tight italic border-l-2 border-neutral-800 pl-5 line-clamp-3 group-hover:text-neutral-400 transition-colors">
          {lead.description}
        </p>
      </div>

      {/* ANALYTICS HUD */}
      <div className="relative z-10 grid grid-cols-2 gap-8 border-y border-white/5 py-6">
        <div className="space-y-2">
          <span className="text-[8px] font-black text-neutral-700 uppercase tracking-[0.3em] flex items-center gap-2">
            <Activity size={10} /> ASSET_INTEGRITY
          </span>
          <div className="flex items-center gap-3">
            <span className={`text-xl font-black font-tactical ${tier.accent}`}>{lead.qualityScore}%</span>
            <div className="flex-1 h-1.5 bg-neutral-900 rounded-full overflow-hidden">
              <div className={`h-full ${tier.accentBg} shadow-[0_0_10px_currentColor]`} style={{ width: `${lead.qualityScore}%` }} />
            </div>
          </div>
        </div>
        <div className="text-right space-y-2">
          <span className="text-[8px] font-black text-neutral-700 uppercase tracking-[0.3em] flex items-center justify-end gap-2">
            <Clock size={10} /> EXPIRATION
          </span>
          <span className="text-xl font-black text-neutral-400 font-tactical italic">{lead.timeLeft.toUpperCase()}</span>
        </div>
      </div>

      {/* FOOTER: PRICE & CTA */}
      <div className="relative z-10 flex items-center justify-between pt-6">
        <div className="space-y-1">
          <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">UNIT_VALUATION</span>
          <div className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none italic font-tactical">
            <span className="text-sm text-yellow-500 opacity-60 mr-1">$</span>{lead.currentBid.toLocaleString()}
          </div>
        </div>
        
        <button 
          className={`h-14 px-8 ${tier.accentBg} text-black rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-white transition-all transform active:scale-95 shadow-2xl shadow-black group/btn overflow-hidden relative`}
        >
          <span className="relative z-10">{isUserEngaged ? 'RE_SYNC' : 'INITIALIZE'}</span>
          <ArrowUpRight size={18} className="relative z-10 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
          <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>
      </div>

      {/* ACCESS GRANTED GLOW */}
      {canEdit && (
        <div className="absolute top-8 right-16 bg-white/10 backdrop-blur-xl text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] border border-white/20 z-20">
          SYSTEM_ACCESS: OWNER
        </div>
      )}
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
    <div className="space-y-12">
      {/* HUD CONTROLS - REFINED PREMIUM LOOK */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-[#050505] p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
        <div className="flex items-center gap-6 w-full lg:w-auto">
          <div className="relative group flex-1 lg:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-yellow-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="SEARCH_MARKET_MANIFESTS..."
              className="w-full bg-[#080808] border border-neutral-800 rounded-2xl pl-16 pr-8 py-4 text-[11px] font-tactical font-black uppercase tracking-widest text-neutral-200 outline-none focus:border-yellow-500/40 transition-all placeholder:text-neutral-800 shadow-inner"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <div className="hidden sm:flex bg-[#0A0A0A] p-1.5 rounded-2xl border border-neutral-800 shadow-xl">
             <button className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-yellow-500 text-black shadow-[0_0_20px_rgba(234,179,8,0.2)] flex items-center gap-2.5">
                <LayoutGrid size={14} /> LIVE_NODES
             </button>
             <button className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 hover:text-white transition-all flex items-center gap-2.5">
                <Database size={14} /> ARCHIVE_LOGS
             </button>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="flex items-center gap-4 bg-black/40 px-6 py-2.5 rounded-full border border-white/5">
             <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full animate-pulse shadow-[0_0_12px_#eab308]" />
             <span className="text-[10px] font-tactical font-black text-neutral-400 uppercase tracking-[0.3em]">{filteredLeads.length} SYNCED_ASSETS</span>
           </div>
           <button onClick={() => { soundService.playClick(); setSearchTerm(''); }} className="w-12 h-12 flex items-center justify-center bg-[#0A0A0A] rounded-2xl text-neutral-600 hover:text-white transition-colors border border-neutral-800 hover:border-white/20">
              <FilterX size={20} />
           </button>
        </div>
      </div>

      {/* MOBILE SWIPE INDICATOR */}
      <div className="flex md:hidden items-center justify-between px-4 mb-4">
         <div className="flex items-center gap-2.5 text-[9px] font-black text-neutral-500 uppercase tracking-widest">
            <MoveHorizontal size={14} className="text-yellow-500" /> Swipe_Assets
         </div>
         <div className="w-40 h-1 bg-neutral-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-500 transition-all duration-300" 
              style={{ width: `${scrollProgress}%` }}
            />
         </div>
      </div>

      {/* MODULE GRID - FLEXIBLE HEIGHT FOR FULL TITLES */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory scrollbar-hide pb-8 md:pb-0 flex md:grid"
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
          <div className="col-span-full py-40 text-center bg-[#030303] border-2 border-neutral-800/40 border-dashed rounded-[4rem] w-full shadow-2xl">
             <ShieldAlert size={80} className="mx-auto text-neutral-800 mb-8 opacity-20" />
             <h4 className="text-neutral-500 font-futuristic text-2xl uppercase tracking-[0.5em]">Inventory Empty</h4>
             <p className="text-neutral-700 text-[11px] font-black uppercase tracking-[0.4em] mt-4">Zero assets matched your current clearance profile</p>
          </div>
        )}
      </div>

      {/* PAGINATION - REFINED CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-12 pt-16 pb-10 border-t border-white/5">
          <button 
            disabled={currentPage === 1} 
            onClick={() => { soundService.playClick(); setCurrentPage(prev => prev - 1); }}
            className="flex items-center gap-4 text-neutral-600 hover:text-yellow-500 disabled:opacity-20 transition-all font-black text-[10px] uppercase tracking-[0.4em]"
          >
            <div className="w-12 h-12 rounded-2xl border border-neutral-800 flex items-center justify-center bg-[#080808] hover:border-yellow-500/50">
              <ChevronLeft size={24} />
            </div>
            <span className="hidden sm:inline">PREVIOUS_CYCLE</span>
          </button>

          <div className="flex items-center gap-4">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => { soundService.playClick(true); setCurrentPage(i + 1); }}
                className={`w-3.5 h-3.5 rounded-full transition-all duration-500 border ${currentPage === i + 1 ? 'bg-yellow-500 border-yellow-500 scale-150 shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-transparent border-neutral-800 hover:border-neutral-600'}`}
              />
            ))}
          </div>

          <button 
            disabled={currentPage === totalPages} 
            onClick={() => { soundService.playClick(); setCurrentPage(prev => prev + 1); }}
            className="flex items-center gap-4 text-neutral-600 hover:text-yellow-500 disabled:opacity-20 transition-all font-black text-[10px] uppercase tracking-[0.4em]"
          >
            <span className="hidden sm:inline">NEXT_CYCLE</span>
            <div className="w-12 h-12 rounded-2xl border border-neutral-800 flex items-center justify-center bg-[#080808] hover:border-yellow-500/50">
              <ChevronRight size={24} />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadGrid;
