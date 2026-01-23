
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Lead, UserRole } from '../types';
import { apiService } from '../services/apiService';
import { 
  Gavel, Star, Timer, PhoneIncoming, Plane, Zap, Settings2, Monitor, 
  ShieldAlert, Clock, XCircle, Compass, Bed, Car, Palmtree, Smartphone, Ticket, Trash2,
  Home, Stethoscope, Briefcase, Sun, Scale, Landmark, AlertCircle, Eye, ShieldCheck, Check, Heart,
  ChevronLeft, ChevronRight, Wrench, Shield, GraduationCap, Truck, DollarSign, Activity, ShoppingCart,
  Database, Server, Cloud, Code, UserCheck, BriefcaseBusiness, PlaneTakeoff, Ship, Hotel, Building2,
  TrendingUp, BarChart3, Coins, Filter, ChevronDown, ListFilter, Sparkles
} from 'lucide-react';

interface LeadGridProps {
  leads: Lead[];
  onBid: (id: string) => void;
  onAdminEdit?: (lead: Lead) => void;
  onAdminApprove?: (id: string) => void;
  onAdminReject?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleWishlist?: (id: string) => void;
  userRole?: UserRole;
  currentUserId?: string;
  activeBids?: string[];
  wishlist?: string[];
}

const QualityGauge: React.FC<{ score: number }> = ({ score }) => {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = (score: number) => {
    if (score >= 90) return '#10b981'; // Emerald
    if (score >= 80) return '#facc15'; // Yellow
    return '#f97316'; // Orange
  };

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke="currentColor"
          strokeWidth="3"
          fill="transparent"
          className="text-neutral-200 dark:text-neutral-800"
        />
        <circle
          cx="24"
          cy="24"
          r={radius}
          stroke={getColor(score)}
          strokeWidth="3"
          fill="transparent"
          strokeDasharray={circumference}
          style={{ strokeDashoffset: offset }}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <span className="absolute text-[10px] font-black text-[var(--text-main)]">{score}</span>
    </div>
  );
};

const ApprovalCelebration: React.FC = () => (
  <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-2xl">
    <div className="approval-flash" />
    <div className="approval-banner absolute top-0 left-0 right-0 bg-emerald-500 text-black py-2 flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30">
      <ShieldCheck size={14} />
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">Asset Verified & Active</span>
    </div>
    {[...Array(6)].map((_, i) => (
      <div 
        key={i} 
        className="sparkle-dot absolute text-emerald-400"
        style={{
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 0.5}s`
        }}
      >
        <Sparkles size={16} fill="currentColor" />
      </div>
    ))}
  </div>
);

const LeadGrid: React.FC<LeadGridProps> = ({ 
  leads, 
  onBid, 
  onAdminEdit, 
  onAdminApprove,
  onAdminReject,
  onDelete, 
  onToggleWishlist,
  userRole, 
  currentUserId, 
  activeBids = [],
  wishlist = []
}) => {
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [recentlyApprovedId, setRecentlyApprovedId] = useState<string | null>(null);

  const prevLeadsRef = useRef<Record<string, string>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await apiService.getCategories();
        setCategories(cats);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    leads.forEach(lead => {
      const prevStatus = prevLeadsRef.current[lead.id];
      if (prevStatus === 'pending' && lead.status === 'approved') {
        setRecentlyApprovedId(lead.id);
        setTimeout(() => setRecentlyApprovedId(null), 4000);
      }
      prevLeadsRef.current[lead.id] = lead.status;
    });
  }, [leads]);

  const getIcon = (category: string) => {
    const cat = category.toLowerCase();
    
    if (cat.includes('flight') || cat.includes('airline')) return <PlaneTakeoff size={18} className="text-sky-400" />;
    if (cat.includes('cruise')) return <Ship size={18} className="text-blue-300" />;
    if (cat.includes('hotel') || cat.includes('vacation rental') || cat.includes('airbnb')) return <Hotel size={18} className="text-orange-300" />;
    if (cat.includes('travel') || cat.includes('trip')) return <Ticket size={18} className="text-yellow-400" />;
    if (cat.includes('car rental')) return <Car size={18} className="text-neutral-400" />;

    if (cat.includes('real estate') || cat.includes('home sales') || cat.includes('construction')) return <Building2 size={18} className="text-emerald-400" />;
    if (cat.includes('rental') || cat.includes('leasing') || cat.includes('property management')) return <Bed size={18} className="text-indigo-300" />;
    if (cat.includes('mortgage') || cat.includes('home buyer')) return <Home size={18} className="text-orange-400" />;
    
    if (cat.includes('crypto') || cat.includes('stock') || cat.includes('trading')) return <Coins size={18} className="text-[var(--text-accent)]" />;
    if (cat.includes('debt') || cat.includes('credit') || cat.includes('loan') || cat.includes('tax debt') || cat.includes('ira')) return <Landmark size={18} className="text-emerald-500" />;
    
    if (cat.includes('insurance') || cat.includes('medicare') || cat.includes('aca')) return <Shield size={18} className="text-blue-500" />;
    if (cat.includes('solar') || cat.includes('energy')) return <Sun size={18} className="text-yellow-400" />;
    if (cat.includes('hvac') || cat.includes('plumbing') || cat.includes('roofing') || cat.includes('remodeling') || cat.includes('windows') || cat.includes('restoration') || cat.includes('pest') || cat.includes('landscape')) return <Wrench size={18} className="text-neutral-400" />;
    
    if (cat.includes('legal') || cat.includes('law') || cat.includes('tort') || cat.includes('lawsuit') || cat.includes('attorney')) return <Scale size={18} className="text-indigo-400" />;
    
    if (cat.includes('cybersecurity') || cat.includes('msp') || cat.includes('saas') || cat.includes('software') || cat.includes('crm') || cat.includes('voip') || cat.includes('it services')) return <Server size={18} className="text-blue-400" />;
    if (cat.includes('marketing') || cat.includes('seo') || cat.includes('digital')) return <Zap size={18} className="text-[var(--text-accent)]" />;
    if (cat.includes('staffing') || cat.includes('recruiting') || cat.includes('payroll') || cat.includes('hr')) return <UserCheck size={18} className="text-emerald-400" />;

    if (cat.includes('medical') || cat.includes('health') || cat.includes('dental') || cat.includes('senior') || cat.includes('rehab') || cat.includes('therapy') || cat.includes('weight loss')) return <Stethoscope size={18} className="text-red-400" />;
    if (cat.includes('education') || cat.includes('degree') || cat.includes('vocational') || cat.includes('school') || cat.includes('bootcamp') || cat.includes('training')) return <GraduationCap size={18} className="text-purple-400" />;
    if (cat.includes('logistics') || cat.includes('freight') || cat.includes('moving') || cat.includes('shipping')) return <Truck size={18} className="text-amber-600" />;

    return <BriefcaseBusiness size={18} className="text-neutral-500" />;
  };

  const isAdmin = userRole === 'admin';
  
  const filteredLeads = useMemo(() => {
    let result = isAdmin ? leads : leads.filter(l => l.status === 'approved' || l.ownerId === currentUserId);
    if (selectedCategory) {
      result = result.filter(l => l.category === selectedCategory);
    }
    return result;
  }, [leads, isAdmin, currentUserId, selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredLeads.length]);

  const totalPages = Math.ceil(filteredLeads.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentLeads = filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-8 theme-transition">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[var(--bg-surface)] border border-[var(--border-main)] p-4 sm:p-5 rounded-[2rem] shadow-xl">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-[var(--text-accent)]/10 rounded-xl flex items-center justify-center border border-[var(--text-accent)]/20">
            <ListFilter className="text-[var(--text-accent)]" size={20} />
          </div>
          <div>
            <h4 className="text-[var(--text-main)] font-black text-xs uppercase tracking-widest leading-none">Market Filter</h4>
            <p className="text-[9px] text-neutral-600 font-black uppercase tracking-tighter mt-1">Refine Global Leads</p>
          </div>
        </div>

        <div className="flex-1 max-w-md relative group">
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={isLoadingCategories}
            className="w-full bg-neutral-100 dark:bg-black border border-[var(--border-main)] rounded-2xl px-6 py-3 text-[var(--text-main)] text-xs font-bold outline-none focus:border-[var(--text-accent)] transition-all appearance-none cursor-pointer disabled:opacity-50"
          >
            <option value="">All Industry Niches</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[var(--bg-surface)] text-[var(--text-main)]">
                {cat}
              </option>
            ))}
          </select>
          <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-[var(--text-accent)] transition-colors">
            <ChevronDown size={18} className="text-neutral-600" />
          </div>
        </div>

        <div className="flex items-center gap-4 px-2">
           <div className="text-right">
              <span className="text-[9px] text-neutral-600 font-black uppercase tracking-widest block leading-none mb-1">Results</span>
              <span className="text-[var(--text-main)] font-black text-sm italic">{filteredLeads.length} <span className="text-[9px] not-italic text-neutral-500 font-black">Nodes</span></span>
           </div>
           {selectedCategory && (
             <button 
                onClick={() => setSelectedCategory('')}
                className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                title="Clear Filter"
             >
                <XCircle size={20} />
             </button>
           )}
        </div>
      </div>

      {filteredLeads.length === 0 ? (
        <div className="bg-[var(--bg-card)] p-20 rounded-[3rem] border border-[var(--border-main)] text-center space-y-6">
           <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mx-auto border border-[var(--border-main)]">
              <Compass className="text-neutral-400 dark:text-neutral-700 animate-pulse" size={40} />
           </div>
           <div>
              <p className="text-[var(--text-main)] font-black uppercase tracking-widest italic text-xl">No Matching Assets</p>
              <p className="text-neutral-600 text-[10px] font-black uppercase tracking-widest mt-2">Adjust your filter protocols or initialize a new provision</p>
           </div>
           <button 
             onClick={() => setSelectedCategory('')}
             className="text-[var(--text-accent)] font-black text-[10px] uppercase tracking-[0.3em] hover:underline"
           >
             RESET GLOBAL FILTER
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
          {currentLeads.map((lead, index) => {
            const isUserEngaged = activeBids.includes(lead.id);
            const isInWishlist = wishlist.includes(lead.id);
            const isOwner = lead.ownerId === currentUserId;
            const isPending = lead.status === 'pending';
            const isRejected = lead.status === 'rejected';
            const isRecentlyApproved = recentlyApprovedId === lead.id;
            
            return (
              <div 
                key={lead.id} 
                style={{ animationDelay: `${index * 80}ms` }}
                className={`bg-[var(--bg-card)] rounded-2xl border transition-all group flex flex-col relative overflow-hidden animate-card-pop ${
                  isUserEngaged ? 'border-[var(--text-accent)]/60 shadow-[0_0_20px_rgba(250,204,21,0.2)] animate-bid-glow' : 
                  isOwner ? 'border-blue-500/40' : 'border-[var(--border-main)]'
                } ${isPending ? 'opacity-90' : ''} ${isRejected ? 'border-red-500/30' : 'hover:border-[var(--text-accent)]/40 hover:-translate-y-1 shadow-lg'}`}
              >
                {isRecentlyApproved && <ApprovalCelebration />}

                <div className="absolute top-4 right-4 z-20 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist?.(lead.id);
                    }}
                    className={`p-1.5 rounded-full transition-all ${isInWishlist ? 'bg-red-500 text-white' : 'bg-black/20 dark:bg-black/50 text-neutral-500 hover:text-white hover:bg-black/80'}`}
                  >
                    <Heart size={14} fill={isInWishlist ? "currentColor" : "none"} />
                  </button>
                  {isPending && (
                    <span className="bg-orange-500 text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Pending Review</span>
                  )}
                </div>

                <div className="absolute top-4 left-4 z-10">
                  {getIcon(lead.category)}
                </div>
                
                <div className="p-5 sm:p-6 pt-12 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div className="max-w-[70%]">
                      <h3 className="text-[var(--text-main)] font-bold group-hover:text-[var(--text-accent)] transition-colors line-clamp-1 text-sm sm:text-base">{lead.title}</h3>
                      <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest mt-0.5">{lead.category}</p>
                    </div>
                    <QualityGauge score={lead.qualityScore} />
                  </div>

                  <p className="text-neutral-500 dark:text-neutral-400 text-[11px] sm:text-xs line-clamp-3 mb-6 flex-1 italic leading-relaxed">
                    {lead.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-6">
                    <div className="bg-neutral-50 dark:bg-black/50 p-2 sm:p-2.5 rounded-xl border border-[var(--border-main)]">
                      <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest">Floor</p>
                      <p className="text-[11px] sm:text-xs font-black text-[var(--text-main)] mt-0.5">${lead.currentBid.toLocaleString()}</p>
                    </div>
                    <div className="bg-neutral-50 dark:bg-black/50 p-2 sm:p-2.5 rounded-xl border border-[var(--border-main)]">
                      <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest">Clock</p>
                      <p className="text-[11px] sm:text-xs font-black text-[var(--text-accent)] mt-0.5 flex items-center gap-1">
                        <Timer size={10} /> {lead.timeLeft}
                      </p>
                    </div>
                  </div>

                  {isAdmin && isPending && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <button
                        onClick={() => onAdminApprove?.(lead.id)}
                        className="bg-emerald-500 hover:bg-emerald-400 text-black py-2 rounded-xl font-black text-[9px] uppercase flex items-center justify-center gap-1 transition-all"
                      >
                        <Check size={12} /> Approve
                      </button>
                      <button
                        onClick={() => onAdminReject?.(lead.id)}
                        className="bg-red-500 hover:bg-red-400 text-white py-2 rounded-xl font-black text-[9px] uppercase flex items-center justify-center gap-1 transition-all"
                      >
                        <XCircle size={12} /> Reject
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-3 pt-4 border-t border-[var(--border-main)]">
                    <div className="flex items-center gap-2">
                      <Star size={12} className="text-[var(--text-accent)] fill-current" />
                      <span className="text-[10px] font-black text-neutral-500 dark:text-neutral-400">{lead.sellerRating}</span>
                    </div>
                    <button
                      onClick={() => onBid(lead.id)}
                      disabled={isPending || isOwner || isRejected}
                      className={`flex-1 py-2 sm:py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                        isOwner 
                          ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' 
                          : isPending 
                            ? 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                            : isRejected
                              ? 'bg-neutral-300 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-700'
                              : 'bg-[var(--text-accent)] text-black hover:bg-yellow-600'
                      }`}
                    >
                      {isOwner ? 'OWNER' : isPending ? 'REVIEW' : isRejected ? 'UNAVAIL' : 'SECURE'}
                    </button>
                  </div>
                </div>

                {isAdmin && (
                  <div className="absolute bottom-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onAdminEdit?.(lead)}
                      className="p-2 bg-neutral-200 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 rounded-lg hover:text-[var(--text-accent)] transition-colors shadow-lg"
                    >
                      <Settings2 size={14} />
                    </button>
                    <button 
                      onClick={() => onDelete?.(lead.id)}
                      className="p-2 bg-neutral-200 dark:bg-neutral-800 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-4 sm:gap-6 pt-10 border-t border-[var(--border-main)]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-3 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl text-neutral-500 hover:text-[var(--text-accent)] hover:border-[var(--text-accent)]/50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="sm:flex hidden items-center gap-2 px-4">
               {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 rounded-xl font-black text-sm transition-all border ${
                      currentPage === (i + 1)
                        ? 'bg-[var(--text-accent)] text-black border-[var(--text-accent)]'
                        : 'bg-[var(--bg-surface)] text-neutral-500 border-[var(--border-main)] hover:border-neutral-600 dark:hover:border-neutral-400 hover:text-[var(--text-main)]'
                    }`}
                  >
                    {i + 1}
                  </button>
               ))}
            </div>
            <div className="sm:hidden px-4 text-xs font-black text-neutral-500 uppercase tracking-widest">
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-3 bg-[var(--bg-surface)] border border-[var(--border-main)] rounded-xl text-neutral-500 hover:text-[var(--text-accent)] hover:border-[var(--text-accent)]/50 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <p className="text-[9px] sm:text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] text-center">
            Protocol Node Page <span className="text-[var(--text-accent)] italic">{currentPage}</span> of <span className="text-[var(--text-main)] italic">{totalPages}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default LeadGrid;
