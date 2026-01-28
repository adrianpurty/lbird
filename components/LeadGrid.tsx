import React, { useState, useMemo, memo } from 'react';
import { Lead, UserRole } from '../types.ts';
import { 
  PlaneTakeoff, Ship, Hotel, Building2, Coins, Shield, Stethoscope, BriefcaseBusiness,
  ListFilter, Activity, Edit3, Target, Globe, Star, Info, Database, Gavel, Layers, Heart, CheckCircle, Eye, Zap, Sparkles, TrendingUp, ShoppingCart
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

interface TacticalCardProps {
  lead: Lead;
  userRole: UserRole;
  currentUserId: string;
  onBid: (id: string, initialBid?: number) => void;
  onQuickBid: (lead: Lead) => void;
  onEdit: (lead: Lead) => void;
  nicheCount: number;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  compact?: boolean;
  isRecentlyBid?: boolean;
}

export const TacticalLeadCard = memo(({ lead, userRole, currentUserId, onBid, onQuickBid, onEdit, nicheCount, isWishlisted, onToggleWishlist, compact, isRecentlyBid }: TacticalCardProps) => {
  const isAdmin = userRole === 'admin';
  const isOwner = lead.ownerId === currentUserId;
  const canEdit = isAdmin || isOwner;
  
  const integrityColor = lead.qualityScore > 80 ? 'text-emerald-400' : lead.qualityScore > 50 ? 'text-amber-400' : 'text-red-400';

  const getIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('flight')) return <PlaneTakeoff size={20} />;
    if (cat.includes('cruise')) return <Ship size={20} />;
    if (cat.includes('hotel')) return <Hotel size={20} />;
    if (cat.includes('property')) return <Building2 size={20} />;
    if (cat.includes('crypto')) return <Coins size={20} />;
    return <BriefcaseBusiness size={20} />;
  };

  return (
    <div 
      className={`group relative bg-[#080d1a] border rounded-2xl overflow-hidden hover:bg-[#0c152a] transition-all duration-500 flex flex-col min-h-[220px] h-auto shadow-2xl cursor-pointer ${
        isRecentlyBid ? 'border-emerald-500 ring-4 ring-emerald-500/20 animate-success-card' : 
        isWishlisted ? 'border-[#00e5ff]/30 shadow-[#00e5ff]/5' : 'border-white/5'
      }`}
      onClick={() => { soundService.playClick(); onEdit(lead); }}
    >
      {/* Smooth Dark Navy Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-black/40 pointer-events-none" />

      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 transition-all ${
        isRecentlyBid ? 'bg-emerald-500/20' : isWishlisted ? 'bg-[#00e5ff]/10' : 'bg-blue-500/5 group-hover:bg-blue-400/10'
      }`} />

      {isRecentlyBid && (
        <div className="absolute top-0 left-0 right-0 bg-emerald-500 py-1 flex items-center justify-center gap-2 z-20 animate-in slide-in-from-top duration-500 shadow-[0_4px_15px_rgba(16,185,129,0.3)]">
           <Sparkles size={10} className="text-white animate-pulse" />
           <span className="text-[8px] font-black text-white uppercase tracking-[0.3em]">ACQUISITION_PROTOCOL_LOCKED</span>
        </div>
      )}
      
      <div className={`flex justify-between items-center px-4 md:px-5 py-2.5 border-b border-white/5 shrink-0 relative z-10 ${isRecentlyBid ? 'mt-4' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isRecentlyBid ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : isWishlisted ? 'bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
            <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] font-mono">NODE_{lead.id.slice(-4).toUpperCase()}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
           <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/[0.02] border border-white/5 rounded">
              <Layers size={8} className="text-white/20" />
              <span className="text-[7px] font-black text-white/40 uppercase tracking-widest whitespace-nowrap">
                CAPACITY: <span className="text-white">{nicheCount}</span>
              </span>
           </div>
           
           <button 
             onClick={(e) => { e.stopPropagation(); onToggleWishlist(lead.id); }}
             className={`p-1.5 rounded transition-all ${isWishlisted ? 'text-[#00e5ff]' : 'text-white/10 hover:text-white/60'}`}
           >
             <Heart size={12} fill={isWishlisted ? "currentColor" : "none"} />
           </button>

           {canEdit && (
            <button 
                onClick={(e) => { e.stopPropagation(); onEdit(lead); }} 
                className="p-1.5 hover:bg-white/5 rounded transition-all text-white/30 hover:text-white"
            >
                <Edit3 size={12} />
            </button>
           )}
        </div>
      </div>

      <div className="flex-1 p-4 md:p-5 flex flex-col md:flex-row gap-4 md:gap-5 relative z-10 overflow-visible">
        {/* Top Header Section on Mobile */}
        <div className="flex items-center gap-4 md:flex-col md:items-center md:gap-2 shrink-0">
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center text-white/50 shadow-inner transition-all duration-500 ${isRecentlyBid ? 'border-emerald-500/40 scale-105' : 'group-hover:scale-105 group-hover:border-white/10'}`}>
            {getIcon(lead.category)}
          </div>
          <div className="flex flex-col md:text-center">
            <span className="text-[7px] font-black text-white/10 uppercase tracking-widest block">Trust</span>
            <span className={`text-[10px] font-black italic ${integrityColor}`}>{lead.qualityScore}%</span>
          </div>
          {/* Visible only on mobile to balance space */}
          <div className="md:hidden ml-auto text-right">
            <span className="text-[7px] font-black text-white/20 uppercase tracking-widest block mb-1">Asset Floor</span>
            <div className={`text-xl font-black italic tracking-tighter leading-none font-tactical ${isRecentlyBid ? 'text-emerald-400' : 'text-white'}`}>
              ${lead.currentBid}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <h3 className="text-sm md:text-base font-black text-white uppercase tracking-tight truncate md:whitespace-normal md:line-clamp-1 font-futuristic leading-none mb-1 group-hover:text-[#00e5ff] transition-colors">
              {lead.title}
            </h3>
            <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest truncate">
              {lead.category}
            </p>
          </div>
          <p className="text-[10px] text-white/20 leading-relaxed italic line-clamp-3 md:line-clamp-2 pr-2">
            {lead.description}
          </p>
        </div>

        <div className="flex flex-row md:flex-col items-center md:items-end justify-between shrink-0 border-t md:border-t-0 md:border-l border-white/5 pt-4 md:pt-0 md:pl-5 mt-auto md:mt-0 gap-4">
          <div className="hidden md:block text-right">
            <span className="text-[7px] font-black text-white/20 uppercase tracking-widest block mb-1">Asset Floor</span>
            <div className={`text-2xl font-black italic tracking-tighter leading-none font-tactical transition-colors ${isRecentlyBid ? 'text-emerald-400' : 'text-white'}`}>
              ${lead.currentBid}
            </div>
            <div className="flex items-center gap-1 justify-end mt-1 text-white/30">
              <Activity size={8} />
              <span className="text-[8px] font-mono">{lead.bidCount} ops</span>
            </div>
          </div>
          
          <div className="flex-1 md:flex-none flex items-center gap-2 w-full md:w-auto">
            {!isOwner && (
              <>
                <button 
                  onClick={(e) => { e.stopPropagation(); onBid(lead.id, lead.currentBid); }}
                  title="Direct Buy at Floor Price"
                  className="flex-1 md:flex-none bg-white text-black px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-[#00e5ff] hover:text-black transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-white/5"
                >
                  <ShoppingCart size={12} /> BUY
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onBid(lead.id); }}
                  className="flex-1 md:flex-none bg-black/40 text-white border border-white/10 px-3 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:border-[#00e5ff]/50 transition-all flex items-center justify-center gap-1.5"
                >
                  <TrendingUp size={12} className="text-[#00e5ff]" /> BID
                </button>
              </>
            )}
            {isOwner && (
               <button 
                 onClick={(e) => { e.stopPropagation(); onEdit(lead); }}
                 className="w-full md:w-auto bg-white/5 text-white px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all text-center"
               >
                 MANAGE ASSET
               </button>
            )}
          </div>
        </div>
      </div>

      <div className="h-0.5 w-full bg-white/5 relative mt-auto">
        <div 
          className={`absolute h-full transition-all duration-1000 ease-out ${isRecentlyBid ? 'bg-emerald-400' : isWishlisted ? 'bg-[#00e5ff]/40' : 'bg-blue-600/30'}`} 
          style={{ width: `${lead.qualityScore}%` }}
        />
      </div>
    </div>
  );
});

interface LeadGridComponent extends React.FC<LeadGridProps> {
  TacticalLeadCard: typeof TacticalLeadCard;
}

const LeadGrid: LeadGridComponent = ({ leads, onBid, onQuickBid, onEdit, userRole, currentUserId, wishlist, onToggleWishlist, lastBidLeadId }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  const nicheCounts = useMemo(() => {
    return leads.reduce((acc, lead) => {
      acc[lead.category] = (acc[lead.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [leads]);

  const filtered = useMemo(() => selectedCategory ? leads.filter(l => l.category === selectedCategory) : leads, [leads, selectedCategory]);
  const categories = useMemo(() => Array.from(new Set(leads.map(l => l.category))), [leads]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/[0.03] border border-white/5 rounded-lg px-4 py-2 flex items-center gap-3">
            <ListFilter size={14} className="text-white/40" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-[0.1em] text-white/60 outline-none appearance-none pr-6 cursor-pointer"
            >
              <option value="" className="bg-black">ALL_SECTORS</option>
              {categories.map(c => <option key={c} value={c} className="bg-black">{c.toUpperCase()}</option>)}
            </select>
          </div>
        </div>
        <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
           {filtered.length} ACTIVE_LEAD_NODES
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(lead => (
          <TacticalLeadCard 
            key={lead.id}
            lead={lead}
            userRole={userRole}
            currentUserId={currentUserId}
            onBid={onBid}
            onQuickBid={onQuickBid}
            onEdit={onEdit}
            nicheCount={nicheCounts[lead.category] || 0}
            isWishlisted={wishlist.includes(lead.id)}
            onToggleWishlist={onToggleWishlist}
            isRecentlyBid={lastBidLeadId === lead.id}
          />
        ))}
      </div>
    </div>
  );
};

LeadGrid.TacticalLeadCard = TacticalLeadCard;

export default LeadGrid;