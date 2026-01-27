import React, { useState, useMemo, memo, useDeferredValue } from 'react';
import { Lead, UserRole } from '../types.ts';
import { 
  BriefcaseBusiness, PlaneTakeoff, Ship, Hotel, Building2, 
  Coins, ListFilter, Stethoscope, Shield, CheckCircle2, 
  Heart, ChevronLeft, ChevronRight, ChevronDown, 
  Cpu, Target, Database, Activity, MapPin, Gauge, ArrowRight,
  Fingerprint, Clock, Star, Zap, ShieldAlert, Layers, XCircle,
  Settings as GearIcon, Edit3
} from 'lucide-react';
import { soundService } from '../services/soundService.ts';

interface LeadGridProps {
  leads: Lead[];
  onBid: (id: string) => void;
  onEdit?: (lead: Lead) => void;
  onAdminApprove?: (id: string) => void;
  onAdminReject?: (id: string) => void;
  onBulkApprove?: (ids: string[]) => void;
  onBulkReject?: (ids: string[]) => void;
  onDelete?: (id: string) => void;
  onToggleWishlist?: (id: string) => void;
  userRole: UserRole;
  currentUserId: string;
  activeBids?: string[];
  wishlist?: string[];
}

const MemoizedLeadCard = memo(({ 
  lead, 
  isUserEngaged, 
  isInWishlist, 
  isOwner, 
  userRole, 
  onBid, 
  onEdit, 
  onToggleWishlist,
  onAdminApprove,
  onAdminReject,
  isSelected,
  onToggleSelect
}: any) => {
  const isAdmin = userRole === 'admin';
  const canEdit = isAdmin || isOwner;

  const getIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('flight')) return <PlaneTakeoff size={32} />;
    if (cat.includes('cruise')) return <Ship size={32} />;
    if (cat.includes('hotel')) return <Hotel size={32} />;
    if (cat.includes('real estate')) return <Building2 size={32} />;
    if (cat.includes('crypto')) return <Coins size={32} />;
    if (cat.includes('insurance')) return <Shield size={32} />;
    if (cat.includes('medical')) return <Stethoscope size={32} />;
    return <BriefcaseBusiness size={32} />;
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'approved': return 'text-emerald-500 border-emerald-500/20';
      case 'rejected': return 'text-red-500 border-red-500/20';
      default: return 'text-cyan-400 border-cyan-400/20';
    }
  };

  return (
    <div 
      className={`group relative bg-[#0c0c0c] border-2 rounded-[2rem] transition-all duration-500 overflow-hidden cursor-pointer flex flex-col shadow-2xl hover:-translate-y-2 scanline-effect ${
        isSelected ? 'border-white ring-4 ring-white/10 scale-[1.02]' : 
        isUserEngaged ? 'border-[#00e5ff] active-border-pulse' : 'border-neutral-900 hover:border-neutral-700'
      }`}
      onClick={() => canEdit ? onEdit?.(lead) : onBid(lead.id)}
    >
      {/* CARD HEADER: ID STRIPE */}
      <div className="bg-neutral-900/50 p-4 border-b border-neutral-800/50 flex justify-between items-center relative overflow-hidden">
        <div className="flex items-center gap-2 relative z-10">
           <Cpu size={14} className="text-neutral-600" />
           <span className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.2em] font-futuristic">Market_Protocol_Identity</span>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          {isAdmin && (
            <div className="flex items-center gap-2 mr-2 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 animate-pulse">
               <Edit3 size={10} className="text-white/40" />
               <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">ROOT_EDIT</span>
            </div>
          )}
          <div className="w-6 h-4 bg-gradient-to-br from-yellow-600 to-yellow-900 rounded-sm border border-yellow-500/30 opacity-60 shadow-[0_0_10px_rgba(234,179,8,0.1)]" title="Cryptographic Chip" />
          <span className="text-[9px] font-mono text-neutral-700 font-bold">#{lead.id.split('_')[1]?.toUpperCase() || lead.id.slice(-4).toUpperCase()}</span>
        </div>
        {/* Holographic background sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full duration-[2000ms] transition-transform" />
      </div>

      {/* CARD BODY: IDENTITY PROFILE */}
      <div className="p-6 space-y-6">
        
        {/* PHOTO ID SECTOR */}
        <div className="flex gap-5">
           <div className="w-24 h-24 rounded-2xl bg-black border-2 border-neutral-800 flex items-center justify-center relative overflow-hidden shrink-0 group-hover:border-[#00e5ff]/40 transition-all">
              <div className="absolute inset-0 bg-[#00e5ff]/5 animate-pulse" />
              <div className="text-neutral-700 group-hover:text-[#00e5ff] transition-colors relative z-10 drop-shadow-[0_0_10px_currentColor]">
                {getIcon(lead.category)}
              </div>
              {/* Corner deco */}
              <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-neutral-700" />
              <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-neutral-700" />
           </div>
           
           <div className="flex-1 space-y-3 min-w-0">
              <div className="space-y-1">
                 <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest block">Asset_Name</span>
                 <h3 className="text-sm font-black text-white uppercase tracking-wider truncate group-hover:text-[#00e5ff] transition-colors font-futuristic leading-tight">
                    {lead.title}
                 </h3>
              </div>
              <div className="space-y-1">
                 <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest block">Sector_ID</span>
                 <p className="text-[10px] font-bold text-neutral-400 uppercase italic truncate">{lead.category}</p>
              </div>
              <div className="space-y-1">
                 <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest block">Origin_Node</span>
                 <div className="flex items-center gap-1.5">
                    <MapPin size={10} className="text-red-500/60" />
                    <span className="text-[10px] font-black text-neutral-300 uppercase tracking-widest">{lead.countryCode} // {lead.region || 'Global'}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* DESCRIPTION FIELD */}
        <div className="bg-black/40 border border-neutral-800/40 rounded-xl p-3 relative">
           <span className="absolute -top-2 left-3 px-2 bg-[#0c0c0c] text-[6px] font-black text-neutral-600 uppercase tracking-[0.3em]">Manifest_Brief</span>
           <p className="text-[10px] text-neutral-500 leading-relaxed font-rajdhani line-clamp-2 italic">
              {lead.description || "No manifest provisioned for this asset node."}
           </p>
        </div>

        {/* TECHNICAL GAUGES */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-black border border-neutral-800 flex items-center justify-center text-emerald-500/80">
                 <Gauge size={14} />
              </div>
              <div>
                 <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest block mb-0.5">Integrity</span>
                 <span className="text-xs font-black text-emerald-500 italic font-tactical leading-none">{lead.qualityScore}%</span>
              </div>
           </div>
           <div className="bg-neutral-900/30 border border-neutral-800/50 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-black border border-neutral-800 flex items-center justify-center text-yellow-500/80">
                 <Star size={14} />
              </div>
              <div>
                 <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest block mb-0.5">Reputation</span>
                 <span className="text-xs font-black text-yellow-500 italic font-tactical leading-none">{lead.sellerRating}</span>
              </div>
           </div>
        </div>

        {/* TIME REMAINING HUD */}
        <div className="flex items-center justify-between px-2 text-neutral-600">
           <div className="flex items-center gap-2">
              <Clock size={10} />
              <span className="text-[8px] font-black uppercase tracking-widest">Expiration_Window</span>
           </div>
           <span className="text-[9px] font-mono font-bold text-neutral-400 group-hover:text-cyan-400 transition-colors">{lead.timeLeft || '24:00:00'}</span>
        </div>
      </div>

      {/* FOOTER: SETTLEMENT STRIPE */}
      <div className="mt-auto bg-black p-5 border-t-2 border-neutral-900 flex items-center justify-between group-hover:bg-[#080808] transition-colors relative">
        <div className="space-y-1">
          <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block">Live_Valuation</span>
          <div className={`text-3xl font-black italic tracking-tighter font-tactical leading-none transition-all ${isAdmin ? 'text-[#00e5ff] group-hover:text-white' : 'text-white group-hover:text-glow-neon'}`}>
            ${lead.currentBid.toLocaleString()}
          </div>
          {isAdmin && (
             <span className="text-[6px] font-black text-[#00e5ff]/60 uppercase tracking-[0.3em] block animate-pulse">OVERRIDE_ENABLED</span>
          )}
        </div>
        
        <div className="text-right space-y-1">
           <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block">Active_Nodes</span>
           <div className="flex items-center justify-end gap-2">
              <Layers size={12} className="text-[#00e5ff]/40" />
              <span className="text-lg font-black text-neutral-400 italic font-tactical leading-none">{lead.bidCount}</span>
           </div>
        </div>

        {/* HOLOGRAPHIC STATUS SEAL */}
        <div className={`absolute top-0 right-8 -translate-y-1/2 px-4 py-1.5 rounded-full border-2 bg-black text-[9px] font-black uppercase tracking-[0.2em] italic shadow-2xl z-20 transition-all group-hover:scale-110 ${getStatusColor(lead.status)}`}>
           {lead.status === 'approved' && <Shield size={10} className="inline mr-2" />}
           {lead.status === 'rejected' && <ShieldAlert size={10} className="inline mr-2" />}
           {lead.status}
        </div>

        {/* Admin Quick Entry Icon */}
        {isAdmin && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#00e5ff] text-black p-2 rounded-full shadow-[0_0_15px_rgba(0,229,255,0.4)]">
             <GearIcon size={14} className="animate-spin-slow" />
          </div>
        )}
      </div>

      {/* OVERLAY ACTIONS: TRIGGERED BY HOVER ON MOBILE/DESKTOP */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-8 gap-4 z-30">
         <div className="w-16 h-px bg-white/20 mb-2" />
         
         {isAdmin ? (
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit?.(lead); }}
              className="w-full bg-white text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <Cpu size={16} /> REVISE_ASSET_NODE
            </button>
         ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); onBid(lead.id); }}
              className="w-full bg-[#00e5ff] text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(0,229,255,0.4)]"
            >
              <Zap size={16} fill="currentColor" /> Initialize_Acquisition
            </button>
         )}
         
         {isAdmin ? (
            <div className="flex gap-3 w-full">
              <button 
                onClick={(e) => { e.stopPropagation(); soundService.playClick(true); onAdminApprove?.(lead.id); }}
                className="flex-1 bg-emerald-600/20 border-2 border-emerald-500/40 text-emerald-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={14} /> AUTHORIZE
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); soundService.playClick(true); onAdminReject?.(lead.id); }}
                className="flex-1 bg-red-600/20 border-2 border-red-500/40 text-red-500 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <XCircle size={14} /> REVOKE
              </button>
            </div>
         ) : (
            <div className="flex gap-3 w-full">
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleWishlist?.(lead.id); }}
                  className={`flex-1 p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest ${
                    isInWishlist ? 'bg-red-500/10 border-red-500/40 text-red-500' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  <Heart size={14} fill={isInWishlist ? "currentColor" : "none"} /> {isInWishlist ? 'Saved' : 'Vault'}
                </button>
            </div>
         )}

         {isAdmin && (
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleSelect?.(lead.id); }}
              className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-widest ${
                isSelected ? 'bg-white border-white text-black' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <CheckCircle2 size={16} /> {isSelected ? 'BATCH_SELECTED' : 'SELECT_FOR_BATCH'}
            </button>
         )}

         <div className="w-16 h-px bg-white/20 mt-2" />
         <p className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.4em] italic mt-4">
            {isAdmin ? 'ROOT_SECURITY_OVERRIDE_ENABLED' : 'Security_Clearance_Active'}
         </p>
      </div>
    </div>
  );
});

const LeadGrid: React.FC<LeadGridProps> = ({ 
  leads, onBid, onEdit, onAdminApprove, onAdminReject, onBulkApprove, onBulkReject, onDelete, onToggleWishlist, userRole, currentUserId, activeBids = [], wishlist = []
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const deferredCategory = useDeferredValue(selectedCategory);
  const ITEMS_PER_PAGE = 6; 

  const categories = useMemo(() => Array.from(new Set(leads.map(l => l.category))).sort(), [leads]);
  
  const filteredLeads = useMemo(() => {
    let result = userRole === 'admin' ? leads : leads.filter(l => l.status === 'approved' || l.ownerId === currentUserId);
    if (deferredCategory) result = result.filter(l => l.category === deferredCategory);
    return result;
  }, [leads, userRole, currentUserId, deferredCategory]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const currentLeads = filteredLeads.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkApprove = () => {
    soundService.playClick(true);
    onBulkApprove?.(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  const handleBulkReject = () => {
    soundService.playClick(true);
    onBulkReject?.(Array.from(selectedIds));
    setSelectedIds(new Set());
  };

  return (
    <div className="space-y-8">
      {/* FILTER HUD */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-2">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative group w-full sm:w-[280px]">
             <ListFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-hover:text-[#00e5ff] transition-colors" size={14} />
             <select 
               value={selectedCategory}
               onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
               className="w-full bg-[#0a0a0a] border-2 border-neutral-800 rounded-2xl pl-12 pr-10 py-3.5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 outline-none focus:border-[#00e5ff]/40 transition-all appearance-none cursor-pointer"
             >
               <option value="">Filter_Sector_Nodes</option>
               {categories.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
             </select>
             <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-700 pointer-events-none" />
          </div>

          {selectedIds.size > 0 && userRole === 'admin' && (
            <div className="flex items-center gap-3 animate-in slide-in-from-left duration-300">
              <button 
                onClick={handleBulkApprove}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all"
              >
                BULK_AUTHORIZE ({selectedIds.size})
              </button>
              <button 
                onClick={handleBulkReject}
                className="bg-red-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-red-500 transition-all"
              >
                BULK_REVOKE
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-6">
           <span className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.4em]">{filteredLeads.length} Nodes_Synchronized</span>
        </div>
      </div>

      {/* ID CARD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
              onAdminApprove={onAdminApprove}
              onAdminReject={onAdminReject}
              onDelete={onDelete}
              onToggleWishlist={onToggleWishlist}
              isSelected={selectedIds.has(lead.id)}
              onToggleSelect={toggleSelect}
            />
          ))
        ) : (
          <div className="col-span-full py-32 text-center bg-[#050505] border-2 border-neutral-800/40 border-dashed rounded-[3rem]">
            <Database className="mx-auto text-neutral-900 mb-8 opacity-20" size={100} />
            <h4 className="text-neutral-700 font-futuristic text-2xl uppercase tracking-[0.5em]">No_Active_Manifests</h4>
            <p className="text-neutral-800 text-[10px] font-black uppercase tracking-widest mt-4">Protocol Idle // Awaiting Asset Stream</p>
          </div>
        )}
      </div>

      {/* PAGINATION HUD */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-8 pt-12 border-t border-neutral-900">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(currentPage - 1)} 
            className="w-12 h-12 rounded-2xl border-2 border-neutral-800 text-neutral-600 hover:text-[#00e5ff] hover:border-[#00e5ff]/40 transition-all disabled:opacity-20 flex items-center justify-center bg-black/40"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-xl text-[10px] font-black transition-all border-2 ${
                      currentPage === i + 1 
                        ? 'bg-[#00e5ff] text-black border-[#00e5ff] shadow-[0_0_20px_rgba(0,229,255,0.3)]' 
                        : 'bg-transparent text-neutral-700 border-neutral-900 hover:border-neutral-700 hover:text-neutral-400'
                    }`}
                  >
                    {i + 1}
                  </button>
            ))}
          </div>
          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(currentPage + 1)} 
            className="w-12 h-12 rounded-2xl border-2 border-neutral-800 text-neutral-600 hover:text-[#00e5ff] hover:border-[#00e5ff]/40 transition-all disabled:opacity-20 flex items-center justify-center bg-black/40"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default LeadGrid;