
import React, { useState, useMemo, memo } from 'react';
import { Lead, UserRole } from '../types.ts';
import { 
  Zap, MapPin, Heart, CheckCircle2, ChevronLeft, ChevronRight, 
  Search, FilterX, Star, ShieldAlert, Trophy, Target, Cpu
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

const getGrade = (score: number) => {
  if (score >= 95) return { label: 'S-TIER', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/40 shadow-rose-500/20' };
  if (score >= 85) return { label: 'A-TIER', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/40 shadow-amber-500/20' };
  if (score >= 70) return { label: 'B-TIER', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/40 shadow-blue-500/20' };
  return { label: 'C-TIER', color: 'text-neutral-500', bg: 'bg-neutral-500/10', border: 'border-neutral-500/40' };
};

const MemoizedLeadCard = memo(({ 
  lead, isUserEngaged, isInWishlist, isOwner, userRole, onBid, onEdit, onToggleWishlist 
}: any) => {
  const grade = getGrade(lead.qualityScore);
  const isAdmin = userRole === 'admin';
  const canEdit = isAdmin || isOwner;

  return (
    <div 
      className={`group relative bg-[#0A0A0A] rounded-[2rem] border-2 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col hover:-translate-y-2 hover:border-white/40 shadow-2xl ${
        isUserEngaged ? 'border-[#FACC15] active-border-pulse' : 'border-neutral-900'
      }`}
      onClick={() => canEdit ? onEdit?.(lead) : onBid(lead.id)}
    >
      {/* Grade Badge */}
      <div className={`absolute top-6 left-6 z-20 px-4 py-1.5 rounded-xl border-2 backdrop-blur-md font-black text-[10px] tracking-[0.2em] flex items-center gap-2 ${grade.bg} ${grade.color} ${grade.border}`}>
        <Trophy size={12} /> {grade.label}
      </div>

      {/* Hero Image Area (Console Style) */}
      <div className="h-48 w-full bg-[#111] relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
        <div className="absolute inset-0 flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity">
           <Zap size={140} className={grade.color} />
        </div>
        <div className="z-20 text-center px-6 mt-12">
          <span className="text-[9px] font-black text-[#FACC15] uppercase tracking-[0.4em] mb-2 block">{lead.category}</span>
          <h3 className="text-xl font-futuristic text-white uppercase tracking-tighter leading-tight group-hover:scale-105 transition-transform truncate w-full">
            {lead.title}
          </h3>
        </div>
      </div>

      {/* Stats HUD Area */}
      <div className="p-8 space-y-6 bg-black relative">
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-[#111] p-3 rounded-2xl border border-white/5">
              <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest block mb-1">Integrity</span>
              <div className="flex items-center gap-2">
                 <div className="h-1.5 flex-1 bg-neutral-800 rounded-full overflow-hidden">
                    <div className={`h-full ${grade.color.replace('text', 'bg')}`} style={{ width: `${lead.qualityScore}%` }} />
                 </div>
                 <span className={`text-[10px] font-black ${grade.color}`}>{lead.qualityScore}%</span>
              </div>
           </div>
           <div className="bg-[#111] p-3 rounded-2xl border border-white/5">
              <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest block mb-1">Location</span>
              <div className="flex items-center gap-2 text-white font-black text-[10px]">
                 <MapPin size={12} className="text-[#FACC15]" /> {lead.countryCode}
              </div>
           </div>
        </div>

        <div className="flex items-end justify-between">
           <div>
              <span className="text-[8px] font-black text-neutral-700 uppercase tracking-[0.4em] block mb-1">VALUATION</span>
              <div className="text-3xl font-black text-white italic font-tactical leading-none tracking-widest group-hover:text-[#FACC15] transition-colors">
                ${lead.currentBid.toLocaleString()}
              </div>
           </div>
           <div className="flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(lead.id); }}
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${isInWishlist ? 'bg-[#FACC15] border-[#FACC15] text-black shadow-lg' : 'bg-[#111] border-white/5 text-neutral-700 hover:text-white'}`}
              >
                <Heart size={20} fill={isInWishlist ? "currentColor" : "none"} />
              </button>
           </div>
        </div>
      </div>

      {/* Hover Overlay Button */}
      <div className="absolute inset-x-0 bottom-0 p-8 translate-y-full group-hover:translate-y-0 transition-transform bg-gradient-to-t from-black to-transparent z-30 pointer-events-none">
         <div className="w-full bg-[#FACC15] text-black py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl">
            {canEdit ? 'ENTER_COMMAND' : 'INITIALIZE_BID'} <Zap size={14} />
         </div>
      </div>
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
              placeholder="Filter leads..."
              className="w-full bg-[#0C0C0C] border-2 border-neutral-800 rounded-[1.5rem] pl-16 pr-8 py-4 text-sm font-black uppercase tracking-widest text-neutral-200 outline-none focus:border-[#FACC15]/40 transition-all placeholder:text-neutral-800"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          
          <div className="hidden sm:flex bg-neutral-900/40 p-1.5 rounded-[1.5rem] border border-neutral-800">
             <button className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-[#FACC15] text-black shadow-lg">Library</button>
             <button className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-all">Collections</button>
          </div>
        </div>

        <div className="flex items-center gap-8">
           <div className="flex items-center gap-3">
             <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_#10b981]" />
             <span className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.3em] font-tactical">{filteredLeads.length} ITEMS FOUND</span>
           </div>
           <button onClick={() => { soundService.playClick(); setSearchTerm(''); }} className="w-12 h-12 flex items-center justify-center bg-neutral-900 rounded-2xl text-neutral-600 hover:text-white transition-colors border border-neutral-800">
              <FilterX size={20} />
           </button>
        </div>
      </div>

      {/* CONSOLE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
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
          <div className="col-span-full py-40 text-center bg-[#050505] border-2 border-neutral-800/40 border-dashed rounded-[4rem]">
             <ShieldAlert size={80} className="mx-auto text-neutral-900 mb-8 opacity-20" />
             <h4 className="text-neutral-700 font-futuristic text-2xl uppercase tracking-[0.5em]">Inventory Empty</h4>
             <p className="text-neutral-800 text-[10px] font-black uppercase tracking-widest mt-4">Try adjusting your node parameters</p>
          </div>
        )}
      </div>

      {/* CONSOLE STYLE PAGINATION */}
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
            <span>Prev_Node</span>
          </button>

          <div className="flex items-center gap-4">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => { soundService.playClick(); setCurrentPage(i + 1); }}
                className={`w-4 h-4 rounded-full transition-all border-2 ${currentPage === i + 1 ? 'bg-[#FACC15] border-[#FACC15] scale-150 shadow-[0_0_15px_rgba(250,204,21,0.4)]' : 'bg-transparent border-neutral-800 hover:border-white/40'}`}
              />
            ))}
          </div>

          <button 
            disabled={currentPage === totalPages} 
            onClick={() => { soundService.playClick(); setCurrentPage(prev => prev + 1); }}
            className="flex items-center gap-4 text-neutral-600 hover:text-[#FACC15] disabled:opacity-20 transition-all font-black text-[10px] uppercase tracking-[0.4em]"
          >
            <span>Next_Node</span>
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
