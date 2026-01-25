
import React, { useState, useMemo, memo } from 'react';
import { Lead, UserRole } from '../types.ts';
import { 
  Zap, MapPin, Heart, ChevronLeft, ChevronRight, 
  Search, FilterX, ShieldAlert, Target, Cpu,
  ArrowUpRight, Activity, Globe, Scale, Home, Plane, 
  HeartPulse, Coins, Layers, LayoutGrid, Database
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
      className={`group relative w-full rounded-[1.5rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col md:flex-row items-stretch bg-black ${industry.border} hover:border-white/40 shadow-2xl ${isUserEngaged ? 'active-border-pulse' : ''}`}
      onClick={() => canEdit ? onEdit?.(lead) : onBid(lead.id)}
    >
      {/* 1. ASSET SIGNATURE (LEFT) */}
      <div className={`w-full md:w-[120px] lg:w-[160px] flex md:flex-col items-center justify-center p-6 gap-4 border-b md:border-b-0 md:border-r ${industry.border} ${industry.bg} relative overflow-hidden`}>
         <industry.icon size={48} className={`${industry.color} relative z-10 opacity-80 group-hover:scale-110 transition-transform`} />
         <div className="md:rotate-[-90deg] md:whitespace-nowrap flex flex-col items-center md:items-start gap-1">
            <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${industry.color}`}>{lead.category}</span>
            <span className="text-[7px] font-mono text-neutral-600 uppercase tracking-widest hidden md:block">SECTOR_NODE_{lead.id.slice(-4)}</span>
         </div>
         {/* Background Watermark */}
         <industry.icon size={120} className={`absolute -bottom-10 -left-10 opacity-[0.03] ${industry.color} pointer-events-none`} />
      </div>

      {/* 2. LEAD IDENTITY (CENTER-LEFT) */}
      <div className="flex-1 p-8 flex flex-col justify-center space-y-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${grade.color}`}>
              {grade.label}
            </span>
            <div className="flex items-center gap-2">
              <Activity size={10} className={`${isUserEngaged ? 'text-emerald-500 animate-pulse' : 'text-neutral-700'}`} />
              <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest">{isUserEngaged ? 'STREAMS_ACTIVE' : 'NODE_IDLE'}</span>
            </div>
          </div>
          <h3 className="text-xl md:text-3xl font-futuristic text-white uppercase tracking-tight leading-tight group-hover:text-white transition-colors italic">
            {lead.title}
          </h3>
        </div>
        
        <div className="flex items-center gap-6">
           <div className="flex flex-col">
              <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">Expiration_Clock</span>
              <span className="text-xs font-tactical text-neutral-400">{lead.timeLeft}</span>
           </div>
           <div className="flex flex-col">
              <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">Origin_Hub</span>
              <span className="text-xs font-tactical text-neutral-400 flex items-center gap-1"><MapPin size={10} className={industry.color} /> {lead.countryCode}</span>
           </div>
           <div className="hidden lg:flex flex-col">
              <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">Integrity_Hash</span>
              <span className={`text-xs font-tactical font-black ${industry.color}`}>{lead.qualityScore}%_VERIFIED</span>
           </div>
        </div>
      </div>

      {/* 3. PERFORMANCE GRID (CENTER-RIGHT) */}
      <div className="hidden xl:flex items-center gap-10 px-8 border-x border-neutral-900/60 bg-white/[0.01]">
         <div className="grid grid-cols-2 gap-4">
            <div className="w-12 h-12 bg-neutral-900/50 rounded-xl border border-white/5 flex flex-col items-center justify-center">
               <span className="text-[7px] font-black text-neutral-700 uppercase">LVL</span>
               <span className="text-sm font-tactical text-white">0{Math.floor(lead.qualityScore / 10)}</span>
            </div>
            <div className="w-12 h-12 bg-neutral-900/50 rounded-xl border border-white/5 flex flex-col items-center justify-center">
               <span className="text-[7px] font-black text-neutral-700 uppercase">BIDS</span>
               <span className="text-sm font-tactical text-white">{lead.bidCount}</span>
            </div>
            <div className="w-12 h-12 bg-neutral-900/50 rounded-xl border border-white/5 flex flex-col items-center justify-center">
               <span className="text-[7px] font-black text-neutral-700 uppercase">RTG</span>
               <span className="text-sm font-tactical text-white">{lead.sellerRating}</span>
            </div>
            <div className="w-12 h-12 bg-neutral-900/50 rounded-xl border border-white/5 flex flex-col items-center justify-center">
               <span className="text-[7px] font-black text-neutral-700 uppercase">SRC</span>
               <Globe size={12} className="text-neutral-500 mt-0.5" />
            </div>
         </div>
      </div>

      {/* 4. LIQUIDITY CONTROL (RIGHT) */}
      <div className="w-full md:w-[240px] p-8 flex flex-col justify-center items-center md:items-end gap-6 bg-white/[0.02]">
        <div className="text-center md:text-right">
          <span className="text-[8px] font-black text-neutral-700 uppercase tracking-[0.4em] block mb-1">CURRENT_BID_VALUATION</span>
          <div className="text-4xl font-black text-white italic font-tactical leading-none tracking-tighter flex items-baseline gap-1 group-hover:text-white transition-colors">
            <span className={`text-sm opacity-40 ${industry.color}`}>$</span>{lead.currentBid.toLocaleString()}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full">
          <button
            onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(lead.id); }}
            className={`flex-1 h-12 rounded-xl border-2 flex items-center justify-center transition-all ${isInWishlist ? 'bg-rose-600 border-rose-600 text-white' : 'bg-black border-neutral-800 text-neutral-700 hover:text-white'}`}
          >
            <Heart size={18} fill={isInWishlist ? "currentColor" : "none"} />
          </button>
          <button 
            className={`flex-[3] h-12 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 border-b-4 ${
              canEdit 
                ? 'bg-white text-black border-neutral-300 hover:bg-[#FACC15]' 
                : `${industry.bg} ${industry.color} ${industry.border} border-b-${industry.accent}-800 hover:bg-white hover:text-black hover:border-white`
            }`}
          >
            {canEdit ? 'MANAGE_NODE' : 'ACCESS_LEADS'} <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Scanline / HUD Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
    </div>
  );
});

const LeadGrid: React.FC<LeadGridProps> = ({ 
  leads, onBid, onEdit, onToggleWishlist, userRole, currentUserId, activeBids = [], wishlist = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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
      {/* CONSOLE HUD CONTROLS */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-black/40 p-6 rounded-[2.5rem] border border-[#1A1A1A]">
        <div className="flex items-center gap-6 w-full lg:w-auto">
          <div className="relative group flex-1 lg:w-96">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-[#FACC15] transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Filter nodes by sector or ID..."
              className="w-full bg-[#0C0C0C] border-2 border-neutral-800 rounded-[1.5rem] pl-16 pr-8 py-4 text-sm font-black uppercase tracking-widest text-neutral-200 outline-none focus:border-[#FACC15]/40 transition-all placeholder:text-neutral-800"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <div className="hidden sm:flex bg-neutral-900/40 p-1.5 rounded-[1.5rem] border border-neutral-800">
             <button className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#FACC15] text-black shadow-lg flex items-center gap-2">
                <LayoutGrid size={12} /> Active_Nodes
             </button>
             <button className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-all flex items-center gap-2">
                <Database size={12} /> Archive
             </button>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 bg-[#FACC15] rounded-full animate-pulse shadow-[0_0_12px_#FACC15]" />
             <span className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.3em] font-tactical">{filteredLeads.length} ASSETS_SYNCHRONIZED</span>
           </div>
           <button onClick={() => { soundService.playClick(); setSearchTerm(''); }} className="w-12 h-12 flex items-center justify-center bg-neutral-900 rounded-2xl text-neutral-600 hover:text-white transition-colors border border-neutral-800">
              <FilterX size={20} />
           </button>
        </div>
      </div>

      {/* TACTICAL MODULE LIST */}
      <div className="grid grid-cols-1 gap-6">
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
          <div className="col-span-full py-40 text-center bg-[#050505] border-2 border-neutral-800/40 border-dashed rounded-[3rem]">
             <ShieldAlert size={80} className="mx-auto text-neutral-900 mb-8 opacity-20" />
             <h4 className="text-neutral-700 font-futuristic text-2xl uppercase tracking-[0.5em]">Inventory Empty</h4>
             <p className="text-neutral-800 text-[10px] font-black uppercase tracking-widest mt-4">No nodes matched your security parameters</p>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-12 pt-12 pb-8 border-t border-neutral-900/50">
          <button 
            disabled={currentPage === 1} 
            onClick={() => { soundService.playClick(); setCurrentPage(prev => prev - 1); }}
            className="flex items-center gap-4 text-neutral-600 hover:text-[#FACC15] disabled:opacity-20 transition-all font-black text-[10px] uppercase tracking-[0.4em]"
          >
            <div className="w-12 h-12 rounded-full border-2 border-neutral-800 flex items-center justify-center group-hover:border-[#FACC15]/40">
              <ChevronLeft size={24} />
            </div>
            <span>Prev_Cycle</span>
          </button>

          <div className="flex items-center gap-4">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => { soundService.playClick(); setCurrentPage(i + 1); }}
                className={`w-4 h-4 rounded-full transition-all border-2 ${currentPage === i + 1 ? 'bg-[#FACC15] border-[#FACC15] scale-125 shadow-[0_0_15px_rgba(250,204,21,0.4)]' : 'bg-transparent border-neutral-800 hover:border-white/40'}`}
              />
            ))}
          </div>

          <button 
            disabled={currentPage === totalPages} 
            onClick={() => { soundService.playClick(); setCurrentPage(prev => prev + 1); }}
            className="flex items-center gap-4 text-neutral-600 hover:text-[#FACC15] disabled:opacity-20 transition-all font-black text-[10px] uppercase tracking-[0.4em]"
          >
            <span>Next_Cycle</span>
            <div className="w-12 h-12 rounded-full border-2 border-neutral-800 flex items-center justify-center group-hover:border-[#FACC15]/40">
              <ChevronRight size={24} />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadGrid;
