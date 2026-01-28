import React, { useState, useMemo, memo } from 'react';
import { Lead, UserRole } from '../types.ts';
import { 
  PlaneTakeoff, Ship, Hotel, Building2, Coins, Shield, Stethoscope, BriefcaseBusiness,
  ListFilter, Activity, Edit3, Target, Globe, Star, Info, Database, Gavel, Layers, Heart, CheckCircle, Eye
} from 'lucide-react';
import { soundService } from '../services/soundService.ts';

interface LeadGridProps {
  leads: Lead[];
  onBid: (id: string) => void;
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
  onBid: (id: string) => void;
  onEdit: (lead: Lead) => void;
  nicheCount: number;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  compact?: boolean;
  isRecentlyBid?: boolean;
}

// Named export for direct access
export const TacticalLeadCard = memo(({ lead, userRole, currentUserId, onBid, onEdit, nicheCount, isWishlisted, onToggleWishlist, compact, isRecentlyBid }: TacticalCardProps) => {
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
      className={`group relative bg-[#0a0a0a] border rounded-2xl overflow-hidden hover:bg-white/[0.03] transition-all duration-500 flex flex-col h-[200px] shadow-2xl cursor-pointer ${
        isRecentlyBid ? 'border-emerald-500 ring-4 ring-emerald-500/20 animate-pulse' : 
        isWishlisted ? 'border-[#00e5ff]/40 shadow-[#00e5ff]/5' : 'border-white/15'
      }`}
      onClick={() => { soundService.playClick(); onEdit(lead); }}
    >
      {/* Dynamic Background Accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-16 -mt-16 transition-all ${
        isRecentlyBid ? 'bg-emerald-500/20' : isWishlisted ? 'bg-[#00e5ff]/10' : 'bg-white/[0.02] group-hover:bg-white/[0.05]'
      }`} />

      {/* RECENT BID CELEBRATION OVERLAY */}
      {isRecentlyBid && (
        <div className="absolute top-0 left-0 right-0 bg-emerald-500 py-1 flex items-center justify-center gap-2 z-20 animate-in slide-in-from-top duration-500">
           <CheckCircle size={10} className="text-white" />
           <span className="text-[8px] font-black text-white uppercase tracking-[0.3em]">BID_SECURED_SYNC_ACTIVE</span>
        </div>
      )}
      
      {/* TOP STRIPE: ID & ADMIN */}
      <div className={`flex justify-between items-center px-5 py-2.5 border-b border-white/15 shrink-0 ${isRecentlyBid ? 'mt-4' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isRecentlyBid ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : isWishlisted ? 'bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`} />
            <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] font-mono">NODE_{lead.id.slice(-4).toUpperCase()}</span>
          </div>
          {lead.ownerId && (
            <span className="text-[7px] font-black text-white/10 uppercase tracking-[0.1em] font-mono border-l border-white/5 pl-3 hidden sm:inline-block">
              OWNER:{lead.ownerId.slice(-6).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
           {/* NICHE CAPACITY INDICATOR */}
           <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/[0.03] border border-white/15 rounded">
              <Layers size={8} className="text-white/20" />
              <span className="text-[7px] font-black text-white/40 uppercase tracking-widest whitespace-nowrap">
                CAPACITY: <span className="text-white">{nicheCount}</span>
              </span>
           </div>
           
           <button 
             onClick={(e) => { e.stopPropagation(); onToggleWishlist(lead.id); }}
             className={`p-1.5 rounded transition-all ${isWishlisted ? 'text-[#00e5ff]' : 'text-white/20 hover:text-white/60'}`}
           >
             <Heart size={12} fill={isWishlisted ? "currentColor" : "none"} />
           </button>

           {canEdit ? (
            <button 
                onClick={(e) => { e.stopPropagation(); onEdit(lead); }} 
                className="p-1.5 hover:bg-white/10 rounded transition-all text-white/40 hover:text-white"
            >
                <Edit3 size={12} />
            </button>
           ) : (
            <button className="p-1.5 hover:bg-white/10 rounded transition-all text-white/40 hover:text-white">
                <Eye size={12} />
            </button>
           )}
        </div>
      </div>

      {/* MAIN BODY: HORIZONTAL CONTENT */}
      <div className="flex-1 p-5 flex gap-5 overflow-hidden items-center">
        {/* Left Aspect: Icon & Score */}
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div className={`w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/15 flex items-center justify-center text-white/60 shadow-inner transition-all duration-500 ${isRecentlyBid ? 'border-emerald-500/50 scale-105' : 'group-hover:scale-105 group-hover:border-white/20'}`}>
            {getIcon(lead.category)}
          </div>
          <div className="text-center">
            <span className="text-[7px] font-black text-white/20 uppercase tracking-widest block">Integrity</span>
            <span className={`text-[10px] font-black italic ${integrityColor}`}>{lead.qualityScore}%</span>
          </div>
        </div>

        {/* Center Aspect: Title & Category */}
        <div className="flex-1 min-w-0 space-y-2">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-tight truncate font-futuristic leading-none mb-1 group-hover:text-white transition-colors">
              {lead.title}
            </h3>
            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest truncate">
              {lead.category}
            </p>
          </div>
          <p className="text-[10px] text-white/25 leading-relaxed italic line-clamp-2 pr-2">
            {lead.description}
          </p>
        </div>

        {/* Right Aspect: Price & Action */}
        <div className="flex flex-col items-end justify-between shrink-0 h-full border-l border-white/15 pl-5">
          <div className="text-right">
            <span className="text-[7px] font-black text-white/20 uppercase tracking-widest block mb-1">Valuation</span>
            <div className="text-2xl font-black text-white italic tracking-tighter leading-none font-tactical">
              ${lead.currentBid}
            </div>
            <div className="flex items-center gap-1 justify-end mt-1 text-white/40">
              <Activity size={8} />
              <span className="text-[8px] font-mono">{lead.bidCount}</span>
            </div>
          </div>
          
          <button 
            onClick={(e) => { e.stopPropagation(); onBid(lead.id); }}
            className={`px-4 py-2 rounded-lg font-black text-[9px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg ${
              isRecentlyBid ? 'bg-emerald-500 text-white' : isWishlisted ? 'bg-[#00e5ff] text-black' : 'bg-white text-black'
            }`}
          >
            {isRecentlyBid ? 'SECURED' : isOwner ? 'VIEW' : 'BID'}
          </button>
        </div>
      </div>

      {/* BOTTOM DECORATION */}
      <div className="h-0.5 w-full bg-white/15 relative">
        <div 
          className={`absolute h-full transition-all duration-1000 ease-out ${isRecentlyBid ? 'bg-emerald-400' : isWishlisted ? 'bg-[#00e5ff]/50' : 'bg-white/20'}`} 
          style={{ width: `${lead.qualityScore}%` }}
        />
      </div>
    </div>
  );
});

// Fix: Define a custom type for LeadGrid that includes the TacticalLeadCard property to satisfy TypeScript
interface LeadGridComponent extends React.FC<LeadGridProps> {
  TacticalLeadCard: typeof TacticalLeadCard;
}

const LeadGrid: LeadGridComponent = ({ leads, onBid, onEdit, userRole, currentUserId, wishlist, onToggleWishlist, lastBidLeadId }) => {
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
      {/* FILTER HUD */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/15 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 flex items-center gap-3">
            <ListFilter size={14} className="text-white/40" />
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-[0.1em] text-white/60 outline-none appearance-none pr-6 cursor-pointer"
            >
              <option value="" className="bg-[#0c0c0c]">ALL_SECTORS</option>
              {categories.map(c => <option key={c} value={c} className="bg-[#0c0c0c]">{c.toUpperCase()}</option>)}
            </select>
          </div>
        </div>
        <div className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em]">
           {filtered.length} ACTIVE_NODES
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