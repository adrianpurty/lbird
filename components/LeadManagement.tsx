
import React, { useState, useMemo } from 'react';
import { 
  Lead, 
  Search, 
  FilterX, 
  Trash2, 
  Edit3, 
  Zap, 
  MapPin, 
  Activity, 
  ShieldCheck, 
  ShieldAlert, 
  Trophy,
  Database,
  Tag
} from 'lucide-react';
import { soundService } from '../services/soundService.ts';

interface LeadManagementProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
}

const getGrade = (score: number) => {
  if (score >= 95) return { label: 'S', color: 'text-rose-500', bg: 'bg-rose-500/10' };
  if (score >= 85) return { label: 'A', color: 'text-teal-500', bg: 'bg-teal-500/10' };
  if (score >= 70) return { label: 'B', color: 'text-blue-500', bg: 'bg-blue-500/10' };
  return { label: 'C', color: 'text-neutral-500', bg: 'bg-neutral-500/10' };
};

const LeadManagement: React.FC<LeadManagementProps> = ({ leads, onEditLead, onDeleteLead }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending' | 'rejected'>('all');

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            l.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filter === 'all' || l.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [leads, searchTerm, filter]);

  const handleDelete = (id: string) => {
    if (confirm('PURGE_NODE: Confirm immutable asset deletion from global ledger?')) {
      soundService.playClick(true);
      onDeleteLead(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* HUD CONTROLS */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative group flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600 group-focus-within:text-[#2DD4BF] transition-colors" size={16} />
            <input 
              type="text"
              placeholder="SEARCH_ASSET_STREAM..."
              className="w-full bg-[#0c0c0c] border-2 border-neutral-800 rounded-2xl pl-12 pr-6 py-3.5 text-[11px] font-black uppercase tracking-widest text-neutral-200 outline-none focus:border-[#2DD4BF]/40 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex bg-neutral-900/50 p-1 rounded-2xl border border-neutral-800">
            {(['all', 'approved', 'pending', 'rejected'] as const).map((f) => (
              <button
                key={f}
                onClick={() => { soundService.playClick(); setFilter(f); }}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  filter === f ? 'bg-[#2DD4BF] text-black shadow-lg shadow-teal-500/10' : 'text-neutral-500 hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6">
           <span className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.3em]">{filteredLeads.length} ASSETS_LOCATED</span>
           <button onClick={() => { setSearchTerm(''); setFilter('all'); }} className="p-3 text-neutral-600 hover:text-white transition-colors">
              <FilterX size={18} />
           </button>
        </div>
      </div>

      {/* LEAD LIST - TACTICAL CARDS */}
      <div className="grid grid-cols-1 gap-4">
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead) => {
            const grade = getGrade(lead.qualityScore);
            return (
              <div 
                key={lead.id} 
                className={`group relative bg-[#0a0a0a]/80 rounded-[2rem] border-2 transition-all duration-500 flex flex-col lg:flex-row items-center p-6 gap-8 overflow-hidden ${
                  lead.status === 'rejected' ? 'border-red-900/20 opacity-60' : 'border-neutral-800/60 hover:border-neutral-700'
                }`}
              >
                {/* Visual Status Indicator */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  lead.status === 'approved' ? 'bg-[#2DD4BF]' : 
                  lead.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                }`} />

                {/* Identity & Grade */}
                <div className="flex items-center gap-6 shrink-0 min-w-[320px]">
                  <div className={`w-16 h-16 rounded-3xl border-2 border-neutral-800 flex items-center justify-center font-black text-xl italic transition-all group-hover:border-[#2DD4BF]/40 ${grade.bg} ${grade.color}`}>
                    {grade.label}
                  </div>
                  <div className="min-w-0">
                     <h4 className="text-lg font-black text-white italic leading-none group-hover:text-[#2DD4BF] transition-colors truncate w-full">{lead.title}</h4>
                     <div className="flex items-center gap-2 mt-2">
                        <Tag size={12} className="text-neutral-700" />
                        <span className="text-[10px] text-neutral-500 font-black uppercase tracking-widest">{lead.category}</span>
                     </div>
                  </div>
                </div>

                {/* Telemetry Block */}
                <div className="hidden xl:flex items-center gap-12 px-8 border-x border-neutral-800/40 flex-1">
                   <div className="text-center">
                      <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">VALUATION</span>
                      <div className="text-xl font-black text-white italic font-tactical tracking-widest">
                         ${lead.currentBid.toLocaleString()}
                      </div>
                   </div>
                   <div className="text-center">
                      <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">INTEGRITY</span>
                      <div className="flex items-center gap-2 text-[12px] font-black text-[#2DD4BF] font-tactical">
                         <Activity size={12} className="animate-pulse" /> {lead.qualityScore}%
                      </div>
                   </div>
                   <div className="text-center">
                      <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">ORIGIN</span>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 font-mono">
                         <MapPin size={12} className="text-neutral-700" /> {lead.countryCode}
                      </div>
                   </div>
                </div>

                {/* Command Actions */}
                <div className="flex items-center gap-4 shrink-0 lg:pl-6">
                   <div className="flex flex-col items-end mr-4">
                      <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">NODE_STATUS</span>
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border ${
                        lead.status === 'approved' ? 'bg-[#2DD4BF]/10 border-[#2DD4BF]/30 text-[#2DD4BF]' : 
                        lead.status === 'pending' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 
                        'bg-red-500/10 border-red-500/30 text-red-500'
                      }`}>
                        {lead.status}
                      </span>
                   </div>
                   
                   <button 
                    onClick={() => onEditLead(lead)}
                    className="p-4 bg-neutral-900 border-2 border-neutral-800 rounded-2xl text-neutral-500 hover:text-white hover:border-[#2DD4BF]/40 transition-all active:scale-90"
                   >
                    <Edit3 size={18} />
                   </button>
                   
                   <button 
                    onClick={() => handleDelete(lead.id)}
                    className="p-4 bg-neutral-900 border-2 border-neutral-800 rounded-2xl text-neutral-700 hover:text-red-500 hover:border-red-900/40 transition-all active:scale-90"
                   >
                    <Trash2 size={18} />
                   </button>
                </div>

                {/* Status Visual Accent */}
                <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-[60px] opacity-[0.03] pointer-events-none ${
                  lead.status === 'approved' ? 'bg-[#2DD4BF]' : 
                  lead.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                }`} />
              </div>
            );
          })
        ) : (
          <div className="py-24 text-center bg-[#050505] border-2 border-neutral-800/40 border-dashed rounded-[3rem]">
             <Database size={64} className="mx-auto text-neutral-900 mb-6" />
             <h4 className="text-neutral-700 font-futuristic text-xl uppercase tracking-[0.5em]">NO_ASSET_NODES_DETACHED</h4>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadManagement;
