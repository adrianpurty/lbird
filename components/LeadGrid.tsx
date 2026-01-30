
import React, { useState, useMemo, memo, useEffect } from 'react';
import { Lead, UserRole } from '../types.ts';
import { 
  PlaneTakeoff, Coins, Building2, Cpu, HeartPulse, Scale, Wrench, GraduationCap, 
  Megaphone, ShoppingBag, Car, Factory, Truck, Users, Zap, Radio, Utensils, 
  ShieldCheck, HeartHandshake, ShieldAlert, BriefcaseBusiness, ListFilter, 
  Activity, Edit3, Target, Heart, ShoppingCart, Gavel, TrendingUp, Search,
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Filter, Info,
  Calendar, Hash
} from 'lucide-react';
import { soundService } from '../services/soundService.ts';

interface LeadGridProps {
  leads: Lead[];
  onBid: (id: string, initialBid?: number) => void;
  onQuickBid: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  userRole: UserRole;
  currentUserId: string;
  activeBids?: string[];
  wishlist: string[];
  onToggleWishlist: (id: string) => void;
  lastBidLeadId?: string | null;
}

const ITEMS_PER_PAGE = 8;

const getIndustryTheme = (category: string) => {
  const cat = category.toLowerCase();
  if (cat.includes('finance') || cat.includes('crypto')) return { icon: <Coins size={22} />, hex: '#10b981' };
  if (cat.includes('real estate') || cat.includes('property')) return { icon: <Building2 size={22} />, hex: '#3b82f6' };
  if (cat.includes('tech') || cat.includes('software')) return { icon: <Cpu size={22} />, hex: '#06b6d4' };
  if (cat.includes('medical') || cat.includes('health')) return { icon: <HeartPulse size={22} />, hex: '#f43f5e' };
  if (cat.includes('legal')) return { icon: <Scale size={22} />, hex: '#8b5cf6' };
  if (cat.includes('home services') || cat.includes('hvac')) return { icon: <Wrench size={22} />, hex: '#f59e0b' };
  if (cat.includes('education')) return { icon: <GraduationCap size={22} />, hex: '#0ea5e9' };
  if (cat.includes('marketing') || cat.includes('ads')) return { icon: <Megaphone size={22} />, hex: '#f97316' };
  if (cat.includes('e-commerce') || cat.includes('retail')) return { icon: <ShoppingBag size={22} />, hex: '#6366f1' };
  if (cat.includes('automotive')) return { icon: <Car size={22} />, hex: '#ef4444' };
  if (cat.includes('manufacturing')) return { icon: <Factory size={22} />, hex: '#71717a' };
  if (cat.includes('logistics') || cat.includes('supply')) return { icon: <Truck size={22} />, hex: '#84cc16' };
  if (cat.includes('human resources') || cat.includes('talent')) return { icon: <Users size={22} />, hex: '#ec4899' };
  if (cat.includes('energy') || cat.includes('solar')) return { icon: <Zap size={22} />, hex: '#eab308' };
  if (cat.includes('telecom')) return { icon: <Radio size={22} />, hex: '#14b8a6' };
  if (cat.includes('food') || cat.includes('beverage')) return { icon: <Utensils size={22} />, hex: '#c2410c' };
  if (cat.includes('insurance')) return { icon: <ShieldCheck size={22} />, hex: '#1e3a8a' };
  if (cat.includes('travel') || cat.includes('cruises')) return { icon: <PlaneTakeoff size={22} />, hex: '#7dd3fc' };
  if (cat.includes('security')) return { icon: <ShieldAlert size={22} />, hex: '#991b1b' };
  if (cat.includes('non-profit') || cat.includes('fundraising')) return { icon: <HeartHandshake size={22} />, hex: '#2dd4bf' };
  return { icon: <BriefcaseBusiness size={22} />, hex: '#4b5563' };
};

const formatDeliveryLabel = (deliveryStr?: string) => {
  if (!deliveryStr) return 'REALTIME';
  if (deliveryStr.startsWith('WK-')) {
    const parts = deliveryStr.split('-');
    return `WK ${parts[1]} // ${parts[2]}`;
  }
  try {
    return new Date(deliveryStr).toLocaleDateString();
  } catch {
    return 'REALTIME';
  }
};

export const TacticalLeadCard = memo(({ lead, userRole, currentUserId, onBid, onEdit, isWishlisted, onToggleWishlist, isRecentlyBid }: any) => {
  const isOwner = lead.ownerId === currentUserId;
  const theme = getIndustryTheme(lead.category);
  const integrityColor = lead.qualityScore > 80 ? 'text-emerald-400' : lead.qualityScore > 50 ? 'text-amber-400' : 'text-red-400';

  return (
    <div 
      className={`group relative bg-surface/80 backdrop-blur-md border rounded-[2rem] overflow-hidden hover:bg-card transition-all duration-500 flex flex-col min-h-[250px] shadow-2xl cursor-pointer font-clean ${
        isRecentlyBid ? 'ring-2 ring-emerald-500/40' : ''
      }`}
      style={{ 
        borderColor: isRecentlyBid ? '#10b981' : isWishlisted ? 'var(--accent-primary)' : `${theme.hex}66`,
        boxShadow: `0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 10px -5px ${theme.hex}22`
      }}
      onClick={() => { soundService.playClick(); onEdit(lead); }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-main/[0.02] to-transparent pointer-events-none" />
      
      <div className={`flex justify-between items-center px-6 py-4 border-b border-bright shrink-0 relative z-10 ${isRecentlyBid ? 'mt-6' : ''}`}>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-main/20 uppercase tracking-[0.2em] font-mono">LB_{lead.id.slice(-4).toUpperCase()}</span>
        </div>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 px-2.5 py-1 bg-main/[0.03] border border-bright rounded-lg">
              <span className="text-[8px] font-black text-dim uppercase tracking-widest">Trust_Q</span>
              <span className={`text-[10px] font-bold italic ${integrityColor}`}>{lead.qualityScore}%</span>
           </div>
           <button onClick={(e) => { e.stopPropagation(); onToggleWishlist(lead.id); }} className={`p-1.5 rounded-full transition-all hover:bg-main/[0.05] ${isWishlisted ? 'text-accent' : 'text-dim hover:text-main'}`}>
             <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} strokeWidth={2} />
           </button>
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col gap-6 relative z-10">
        <div className="flex items-start gap-5">
           <div className="w-16 h-16 rounded-2xl bg-card border border-bright flex items-center justify-center transition-all duration-500 shadow-2xl group-hover:scale-105" style={{ color: theme.hex, borderColor: `${theme.hex}33` }}>
             {theme.icon}
           </div>
           <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-main tracking-tight leading-snug mb-1 group-hover:text-accent transition-all">
                {lead.title}
              </h3>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40 italic" style={{ color: theme.hex }}>{lead.category}</p>
           </div>
        </div>

        <div className="flex gap-4 items-center">
           <div className="flex items-center gap-2 bg-main/[0.03] border border-bright px-3 py-1.5 rounded-xl">
              <Calendar size={10} className="text-dim" />
              <span className="text-[8px] font-black text-neutral-400 uppercase tracking-tighter">DELIVERY: {formatDeliveryLabel(lead.deliveryDate)}</span>
           </div>
           <div className="flex items-center gap-2 bg-main/[0.03] border border-bright px-3 py-1.5 rounded-xl">
              <Hash size={10} className="text-dim" />
              <span className="text-[8px] font-black text-neutral-400 uppercase tracking-tighter">CAP: {lead.leadCapacity?.toLocaleString() || '∞'} UNITS</span>
           </div>
        </div>

        <p className="text-[11px] text-dim leading-relaxed line-clamp-3 font-medium px-1">{lead.description}</p>
        
        <div className="mt-auto pt-6 flex items-end justify-between border-t border-bright">
           <div className="flex flex-col">
              <span className="text-[8px] font-black text-dim uppercase tracking-[0.2em] mb-1">Asset_Floor</span>
              <div className="flex items-baseline gap-1.5">
                 <span className="text-2xl font-bold text-main tracking-tighter leading-none">${lead.currentBid}</span>
                 <TrendingUp size={12} className="text-emerald-500" />
              </div>
           </div>
           <div className="flex items-center gap-2 bg-card/40 px-3 py-2 rounded-xl border border-bright">
              <Activity size={12} className="text-accent animate-pulse" />
              <span className="text-[9px] font-bold text-dim uppercase font-mono tracking-tighter">{lead.bidCount} OPS</span>
           </div>
        </div>
      </div>

      <div className="p-2 shrink-0 relative z-10 bg-main/[0.02] border-t border-bright">
        <div className="flex items-center gap-1">
          {!isOwner ? (
            <>
              <button onClick={(e) => { e.stopPropagation(); onBid(lead.id, lead.currentBid); }} className="flex-1 bg-main text-surface py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-accent transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95">
                <ShoppingCart size={14} /> Buy_Floor
              </button>
              <button onClick={(e) => { e.stopPropagation(); onBid(lead.id); }} className="flex-1 bg-card text-main py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-surface transition-all flex items-center justify-center gap-2 active:scale-95">
                <Gavel size={14} className="text-accent" /> Set_Bid
              </button>
            </>
          ) : (
             <button onClick={(e) => { e.stopPropagation(); onEdit(lead); }} className="w-full bg-card text-main py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-surface transition-all flex items-center justify-center gap-2">
               <Edit3 size={14} /> Asset_Refinery
             </button>
          )}
        </div>
      </div>
      <div className="h-1 w-full bg-main/[0.03] relative">
        <div className="absolute h-full transition-all duration-1000 ease-out" style={{ width: `${lead.qualityScore}%`, backgroundColor: isRecentlyBid ? '#10b981' : theme.hex }} />
      </div>
    </div>
  );
});

const LeadGrid: React.FC<LeadGridProps> = ({ leads, onBid, onEdit, userRole, currentUserId, wishlist, onToggleWishlist, lastBidLeadId }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const categories = useMemo(() => Array.from(new Set(leads.map(l => l.category))), [leads]);

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const categoryMatch = !selectedCategory || l.category === selectedCategory;
      const searchMatch = !searchTerm || 
        l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        l.description.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [leads, selectedCategory, searchTerm]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredLeads.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredLeads, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchTerm]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    soundService.playClick();
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-10 font-clean">
      {/* Tactical Intelligence Bar */}
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6 border-b border-bright pb-8">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
          {/* Search Module */}
          <div className="relative group w-full md:w-[400px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-dim group-focus-within:text-accent transition-colors" size={18} />
            <input 
              type="text"
              placeholder="SEARCH_INTEL_STREAM..."
              className="w-full bg-main/[0.03] border border-bright rounded-2xl pl-14 pr-6 py-4 text-[11px] font-black uppercase tracking-[0.15em] text-main outline-none focus:border-accent/40 transition-all placeholder:text-dim/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filter Module */}
          <div className="bg-main/[0.03] border border-bright rounded-2xl px-6 py-4 flex items-center gap-4 w-full md:w-auto">
            <ListFilter size={18} className="text-dim" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-[11px] font-black uppercase tracking-[0.15em] text-main outline-none appearance-none pr-8 cursor-pointer flex-1"
            >
              <option value="" className="bg-surface">All_Sectors</option>
              {categories.map(c => <option key={c} value={c} className="bg-surface">{c.toUpperCase()}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-8 shrink-0">
          <div className="text-[10px] font-bold text-dim uppercase tracking-[0.4em] flex items-center gap-3">
             <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
             {filteredLeads.length} ASSETS_IDENTIFIED
          </div>
          <div className="h-6 w-px bg-bright hidden md:block" />
          <div className="hidden md:flex items-center gap-2 text-[10px] font-black text-neutral-600 uppercase tracking-widest">
            <Activity size={14} className="text-emerald-500" />
            MARKET_LOAD: {Math.floor(Math.random() * 20 + 80)}%
          </div>
        </div>
      </div>

      {/* Sales Floor Grid */}
      {paginatedLeads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8 animate-in fade-in duration-700">
          {paginatedLeads.map(lead => (
            <TacticalLeadCard 
              key={lead.id}
              lead={lead}
              userRole={userRole}
              currentUserId={currentUserId}
              onBid={onBid}
              onEdit={onEdit}
              isWishlisted={wishlist.includes(lead.id)}
              onToggleWishlist={onToggleWishlist}
              isRecentlyBid={lastBidLeadId === lead.id}
            />
          ))}
        </div>
      ) : (
        <div className="py-32 text-center bg-black/20 border border-dashed border-bright rounded-[3rem]">
           <Target size={64} className="mx-auto text-dim opacity-20 mb-6" />
           <h3 className="text-xl font-futuristic text-dim uppercase tracking-[0.5em]">No Data Nodes Found</h3>
           <p className="text-[9px] text-neutral-700 font-black uppercase tracking-[0.3em] mt-4">REVISE_SEARCH_PARAMETERS</p>
        </div>
      )}

      {/* Tactical Pagination HUD - Mobile Optimized & Yellow Theme */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center justify-center gap-6 pt-10 border-t border-bright w-full max-w-full overflow-hidden">
           <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-[#facc15]/80">
              <span className="text-[#facc15]">CYCLE {currentPage}</span>
              <span className="opacity-20 text-white">/</span>
              <span className="text-dim">{totalPages} NODES</span>
           </div>

           <div className="flex items-center justify-center gap-2 w-full flex-wrap max-w-full px-2">
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => handlePageChange(1)} 
                  disabled={currentPage === 1}
                  className="p-2.5 bg-card border border-bright rounded-lg text-neutral-600 hover:text-[#facc15] disabled:opacity-10 transition-all active:scale-90"
                  title="First Cycle"
                >
                  <ChevronsLeft size={14} />
                </button>
                <button 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                  className="p-2.5 bg-card border border-bright rounded-lg text-neutral-600 hover:text-[#facc15] disabled:opacity-10 transition-all active:scale-90"
                  title="Previous Cycle"
                >
                  <ChevronLeft size={14} />
                </button>
              </div>
              
              <div className="flex items-center gap-1.5 justify-center">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => {
                    // Optimized for various mobile widths: 1 window on mobile, 2 on tablet
                    const isMobile = typeof window !== 'undefined' && window.innerWidth < 480;
                    const windowSize = isMobile ? 0 : 1;
                    return p === 1 || p === totalPages || Math.abs(p - currentPage) <= windowSize;
                  })
                  .map((p, i, arr) => {
                    const showEllipsis = i > 0 && p - arr[i-1] > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && <span className="text-neutral-800 text-[10px] font-black px-0.5">..</span>}
                        <button 
                          onClick={() => handlePageChange(p)}
                          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg font-black text-[11px] transition-all border ${
                            currentPage === p 
                              ? 'bg-[#facc15] border-[#eab308] text-black shadow-[0_0_20px_rgba(250,204,21,0.3)] scale-110 z-10' 
                              : 'bg-black/40 text-neutral-500 hover:text-[#facc15] border-bright hover:border-[#facc15]/30'
                          }`}
                        >
                          {p.toString().padStart(2, '0')}
                        </button>
                      </React.Fragment>
                    );
                  })
                }
              </div>

              <div className="flex items-center gap-1.5">
                <button 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === totalPages}
                  className="p-2.5 bg-card border border-bright rounded-lg text-neutral-600 hover:text-[#facc15] disabled:opacity-10 transition-all active:scale-90"
                  title="Next Cycle"
                >
                  <ChevronRight size={14} />
                </button>
                <button 
                  onClick={() => handlePageChange(totalPages)} 
                  disabled={currentPage === totalPages}
                  className="p-2.5 bg-card border border-bright rounded-lg text-neutral-600 hover:text-[#facc15] disabled:opacity-10 transition-all active:scale-90"
                  title="Last Cycle"
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
           </div>

           <div className="bg-[#facc15]/5 border border-[#facc15]/20 px-6 py-2.5 rounded-2xl flex items-center gap-3 w-fit mx-auto">
              <div className="w-1.5 h-1.5 rounded-full bg-[#facc15] animate-pulse shadow-[0_0_8px_#facc15]" />
              <span className="text-[8px] font-black text-[#facc15] uppercase tracking-widest leading-none">Market Stream Verified // Node Sync Active</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default LeadGrid;
