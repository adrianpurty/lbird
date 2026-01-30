
import React, { useState, useMemo } from 'react';
import { 
  X, Save, Trash2, ShieldCheck, AlertCircle, Globe, DollarSign, 
  Target, Sparkles, Terminal, Loader2, Zap, MapPin, Activity, 
  Database, TrendingUp, Cpu, Gauge, ArrowRight, CheckCircle2, XCircle, Gavel,
  Calendar, Hash, ChevronUp, ChevronDown, ShieldAlert, AlertTriangle, Info
} from 'lucide-react';
import { Lead, User } from '../types.ts';
import { applyAiOverride } from '../services/geminiService.ts';
import { soundService } from '../services/soundService.ts';

interface AdminLeadActionsModalProps {
  lead: Lead;
  user: User;
  onClose: () => void;
  onSave: (updatedLead: Partial<Lead>) => void;
  onDelete: (id: string) => void;
  onBid?: (id: string) => void;
}

const getWeekRange = (week: number, year: number) => {
  const firstDayOfYear = new Date(year, 0, 1);
  const days = (week - 1) * 7;
  const start = new Date(year, 0, 1 + days);
  const end = new Date(year, 0, 1 + days + 6);
  return {
    start: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    end: end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  };
};

const parseWeekString = (weekStr?: string) => {
  if (!weekStr || !weekStr.startsWith('WK-')) {
    const now = new Date();
    return { week: 1, year: now.getFullYear() };
  }
  const parts = weekStr.split('-');
  return { week: parseInt(parts[1]) || 1, year: parseInt(parts[2]) || new Date().getFullYear() };
};

const AdminLeadActionsModal: React.FC<AdminLeadActionsModalProps> = ({ lead, user, onClose, onSave, onDelete, onBid }) => {
  const initialLogistics = useMemo(() => parseWeekString(lead.deliveryDate), [lead.deliveryDate]);
  
  const [formData, setFormData] = useState<Partial<Lead>>({
    ...lead
  });
  
  const [logistics, setLogistics] = useState(initialLogistics);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isApplyingAi, setIsApplyingAi] = useState(false);

  const isAdmin = user.role === 'admin';
  const isOwner = lead.ownerId === user.id;
  const canEdit = isAdmin || isOwner;
  const isPending = lead.status === 'pending';

  const weekRange = useMemo(() => 
    getWeekRange(logistics.week, logistics.year), 
    [logistics]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    soundService.playClick(true);
    
    const finalPayload = {
      ...formData,
      deliveryDate: `WK-${logistics.week.toString().padStart(2, '0')}-${logistics.year}`
    };
    onSave(finalPayload);
  };

  const adjustWeek = (delta: number) => {
    if (!canEdit) return;
    soundService.playClick();
    setLogistics(prev => {
      let newWeek = prev.week + delta;
      if (newWeek > 53) return { ...prev, week: 1, year: prev.year + 1 };
      if (newWeek < 1) return { ...prev, week: 53, year: prev.year - 1 };
      return { ...prev, week: newWeek };
    });
  };

  const handleDecision = (status: 'approved' | 'rejected') => {
    if (!isAdmin) return;
    soundService.playClick(true);
    onSave({ ...formData, status });
  };

  const handleAiOverride = async () => {
    if (!aiPrompt.trim() || !canEdit) return;
    
    setIsApplyingAi(true);
    soundService.playClick(true);
    
    try {
      const result = await applyAiOverride(formData, aiPrompt);
      if (result) {
        setFormData(prev => ({
          ...prev,
          title: result.title || prev.title,
          description: result.description || prev.description,
          qualityScore: isAdmin ? (result.qualityScore ?? prev.qualityScore) : prev.qualityScore
        }));
        setAiPrompt('');
        soundService.playClick(false);
      }
    } catch (error) {
      console.error("Smart Override Failed", error);
    } finally {
      setIsApplyingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-2 md:p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00e5ff]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[1100px] max-h-[95vh] bg-[#080808] border-2 border-neutral-900 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_50px_150px_-20px_rgba(0,0,0,1)] flex flex-col relative z-10 animate-in zoom-in-95 duration-500 overflow-hidden">
        
        {/* Admin High-Priority Review Prompt */}
        {isAdmin && isPending && (
          <div className="bg-amber-600/10 border-b border-amber-600/20 p-6 md:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
             <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-amber-600 text-black rounded-2xl flex items-center justify-center shadow-lg">
                   <AlertTriangle size={32} />
                </div>
                <div className="space-y-1">
                   <h3 className="text-xl font-black text-amber-500 italic uppercase tracking-tighter leading-none">ACTION_REQUIRED: ASSET_REVIEW</h3>
                   <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none">Awaiting manual handshake verification and endpoint audit.</p>
                </div>
             </div>
             <div className="flex items-center gap-4 w-full sm:w-auto">
                <button 
                  onClick={() => handleDecision('rejected')}
                  className="flex-1 sm:flex-none px-8 py-3 bg-red-950/20 text-red-500 hover:bg-red-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest border border-red-900/40 transition-all active:scale-95"
                >
                  Reject Node
                </button>
                <button 
                  onClick={() => handleDecision('approved')}
                  className="flex-1 sm:flex-none px-12 py-3 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest border-b-4 border-emerald-800 hover:bg-emerald-500 transition-all active:translate-y-1 active:border-b-0 shadow-lg flex items-center justify-center gap-3"
                >
                  <CheckCircle2 size={16} /> Authorize Sync
                </button>
             </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 p-6 md:p-12 border-b-2 border-neutral-900 bg-black/40">
          <div className="relative">
            <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-4 h-12 md:h-24 bg-[#00e5ff] rounded-full blur-xl opacity-20" />
            <h2 className="text-3xl md:text-4xl font-futuristic text-white italic uppercase flex items-center gap-4 md:gap-8 text-glow">
              {canEdit ? (isAdmin ? 'SYSTEM OVERRIDE' : 'ASSET REFINERY') : 'ASSET MANIFEST'}
            </h2>
            <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4 md:mt-6">
              <div className="px-3 md:px-4 py-1.5 bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-full text-[8px] md:text-[10px] font-black text-[#00e5ff] uppercase tracking-widest">NODE_IDENTIFIER: {lead?.id?.toUpperCase() || 'UNKNOWN'}</div>
              {isOwner && <span className="px-3 md:px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[8px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest">OWNER_ACCESS_GRIP</span>}
              <span className="text-[10px] md:text-[12px] text-neutral-600 font-bold uppercase tracking-widest italic shrink-0">ROOT_CONSENSUS_ACTIVE</span>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
            <div className="flex-1 md:flex-none p-4 bg-[#0f0f0f] border-2 border-neutral-900 rounded-2xl md:rounded-3xl flex items-center gap-4 group hover:border-[#00e5ff]/50 transition-all cursor-default">
              <div className="w-10 h-10 bg-[#00e5ff]/10 rounded-xl flex items-center justify-center text-[#00e5ff] shrink-0">
                <Gauge size={20} />
              </div>
              <div>
                <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest block mb-1">INTEGRITY_Q</span>
                <span className="text-xl font-tactical text-white tracking-widest leading-none text-glow">{formData.qualityScore}%</span>
              </div>
            </div>
            <button onClick={onClose} className="p-4 bg-neutral-950 hover:bg-neutral-900 border-2 border-neutral-800 rounded-2xl md:rounded-3xl text-neutral-600 hover:text-white transition-all shrink-0 active:scale-90">
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 md:space-y-12 scrollbar-hide">
          {canEdit && (
            <div className="bg-[#0c0c0c]/90 rounded-[2rem] border-2 border-[#00e5ff]/20 p-6 md:p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <Sparkles size={120} />
              </div>
              <div className="flex items-center gap-3 mb-6">
                <Terminal size={16} className="text-[#00e5ff]" />
                <h3 className="text-[10px] font-black text-[#00e5ff] uppercase tracking-widest">Sector_00 // AI_Command_Core</h3>
              </div>
              <div className="space-y-4">
                <textarea 
                  rows={2}
                  placeholder="INPUT COMMAND: e.g. 'Optimize title for crypto-enthusiasts and harden verification manifest'"
                  className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-4 text-sm md:text-base text-neutral-300 outline-none focus:border-[#00e5ff]/40 transition-all resize-none italic placeholder:not-italic font-rajdhani"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={handleAiOverride}
                  disabled={isApplyingAi || !aiPrompt.trim()}
                  className="w-full py-4 bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 border-2 border-[#00e5ff]/30 rounded-2xl font-black text-[10px] md:text-[12px] uppercase tracking-widest text-[#00e5ff] flex items-center justify-center gap-4 transition-all active:scale-[0.98] disabled:opacity-20"
                >
                  {isApplyingAi ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                  {isApplyingAi ? 'PROCESSING_INJECTION...' : 'EXECUTE_SMART_OVERRIDE'}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
            <div className="bg-[#0c0c0c]/90 rounded-[2rem] md:rounded-[3rem] border-2 border-neutral-900 p-6 md:p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <Database size={120} />
              </div>
              <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-8 md:mb-10 flex items-center gap-3">
                <Cpu size={14} className="text-[#00e5ff]" /> Sector_01 // Asset_Manifest
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10">
                <div className="space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">CAMPAIGN_NODE_LABEL</label>
                  <input 
                    required
                    readOnly={!canEdit}
                    className={`w-full bg-black/40 border-2 border-neutral-800 rounded-xl md:rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#00e5ff]/60 transition-all text-sm md:text-base ${!canEdit ? 'cursor-default border-transparent' : ''}`}
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">SECTOR_PROTOCOL_ID</label>
                  <input 
                    required
                    readOnly={!canEdit}
                    className={`w-full bg-black/40 border-2 border-neutral-800 rounded-xl md:rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#00e5ff]/60 transition-all text-sm md:text-base ${!canEdit ? 'cursor-default border-transparent' : ''}`}
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  />
                </div>
              </div>

              {/* Refinery Logistical Controls - Week Feature Integration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-10 p-8 bg-main/[0.02] border border-bright rounded-[2.5rem]">
                 <div className="space-y-3">
                    <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic flex items-center justify-between">
                       <div className="flex items-center gap-2"><Calendar size={14} className="text-[#00e5ff]" /> LOGISTICS_WEEK_PROTOCOL</div>
                       <span className="text-[8px] text-[#00e5ff]/60">{weekRange.start} — {weekRange.end}</span>
                    </label>
                    <div className="flex items-center gap-6 bg-black/40 border-2 border-neutral-800 rounded-2xl p-4 px-8 justify-between group focus-within:border-[#00e5ff]/40 transition-all">
                       <div className="flex flex-col">
                          <span className="text-[8px] font-black text-neutral-600 uppercase">Week_Num</span>
                          <span className="text-3xl font-tactical font-black text-white italic tracking-widest leading-none">#{logistics.week.toString().padStart(2, '0')}</span>
                       </div>
                       <div className="flex gap-2">
                          <button type="button" disabled={!canEdit} onClick={() => adjustWeek(-1)} className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-500 hover:text-white hover:border-[#00e5ff]/40 transition-all active:scale-90 disabled:opacity-20"><ChevronDown size={20} /></button>
                          <button type="button" disabled={!canEdit} onClick={() => adjustWeek(1)} className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center text-neutral-500 hover:text-white hover:border-[#00e5ff]/40 transition-all active:scale-90 disabled:opacity-20"><ChevronUp size={20} /></button>
                       </div>
                       <div className="flex flex-col items-end">
                          <span className="text-[8px] font-black text-neutral-600 uppercase">Year</span>
                          <select 
                            disabled={!canEdit}
                            className="bg-transparent text-xl font-tactical font-black text-white italic outline-none cursor-pointer appearance-none text-right"
                            value={logistics.year}
                            onChange={e => setLogistics({...logistics, year: parseInt(e.target.value)})}
                          >
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                          </select>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic flex items-center gap-2">
                       <Hash size={14} className="text-[#00e5ff]" /> DELIVERABLE_UNITS
                    </label>
                    <div className="relative">
                      <input 
                        required
                        type="number"
                        readOnly={!canEdit}
                        className={`w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 h-[72px] text-white font-black outline-none focus:border-[#00e5ff]/60 transition-all text-2xl font-tactical tracking-[0.2em] ${!canEdit ? 'cursor-default border-transparent' : ''}`}
                        value={formData.leadCapacity || 0}
                        onChange={e => setFormData({...formData, leadCapacity: parseInt(e.target.value) || 0})}
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] font-black text-neutral-700 uppercase">Unit_Load</span>
                    </div>
                 </div>
              </div>

              <div className="space-y-3 mb-8 md:mb-10">
                <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">MANIFEST_DESCRIPTION_STRING</label>
                <textarea 
                  required
                  rows={6}
                  readOnly={!canEdit}
                  className={`w-full bg-black/40 border-2 border-neutral-800 rounded-2xl md:rounded-3xl px-6 md:px-8 py-4 md:py-6 text-neutral-300 outline-none focus:border-[#00e5ff]/60 transition-all resize-none italic text-base md:text-lg leading-relaxed font-rajdhani ${!canEdit ? 'cursor-default border-transparent' : ''}`}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic flex items-center gap-2">
                    <Globe size={14} className="text-[#00e5ff]" /> IDENTITY_ORIGIN_URL
                  </label>
                  <input 
                    required
                    type="url"
                    readOnly={!canEdit}
                    className={`w-full bg-black/40 border-2 border-neutral-800 rounded-xl md:rounded-2xl px-6 py-4 text-neutral-500 font-mono text-[10px] md:text-xs outline-none focus:border-[#00e5ff]/60 ${!canEdit ? 'cursor-default border-transparent' : ''}`}
                    value={formData.businessUrl}
                    onChange={e => setFormData({...formData, businessUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic flex items-center gap-2">
                    <Target size={14} className="text-[#00e5ff]" /> TRAFFIC_ENDPOINT_NODE
                  </label>
                  <input 
                    required
                    type="url"
                    readOnly={!canEdit}
                    className={`w-full bg-black/40 border-2 border-neutral-800 rounded-xl md:rounded-2xl px-6 py-4 text-neutral-500 font-mono text-[10px] md:text-xs outline-none focus:border-[#00e5ff]/60 ${!canEdit ? 'cursor-default border-transparent' : ''}`}
                    value={formData.targetLeadUrl}
                    onChange={e => setFormData({...formData, targetLeadUrl: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#0f0f0f] border-2 border-neutral-900 rounded-[2.5rem] p-6 md:p-10 shadow-xl relative overflow-hidden group">
              <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-8 md:mb-10 flex items-center gap-3">
                <DollarSign size={14} className="text-[#00e5ff]" /> Sector_02 // Financial_Logic
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">NODE_FLOOR ($)</label>
                  <div className="relative">
                    <input 
                      required
                      type="number"
                      step="0.01"
                      readOnly={!canEdit}
                      className={`w-full bg-black border-2 border-neutral-800 rounded-xl md:rounded-2xl px-12 py-4 text-white font-black outline-none focus:border-[#00e5ff] text-2xl font-tactical tracking-widest ${!canEdit ? 'cursor-not-allowed border-transparent' : ''}`}
                      value={formData.basePrice}
                      onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value)})}
                    />
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-700 font-black text-xl italic font-tactical">$</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">LIVE_VALUATION ($)</label>
                  <div className="relative">
                    <input 
                      required
                      type="number"
                      step="0.01"
                      readOnly={!isAdmin}
                      className={`w-full bg-black border-2 border-neutral-800 rounded-xl md:rounded-2xl px-12 py-4 text-white font-black outline-none focus:border-[#00e5ff] text-2xl font-tactical tracking-widest ${!isAdmin ? 'cursor-default border-transparent text-emerald-500' : ''}`}
                      value={formData.currentBid}
                      onChange={e => setFormData({...formData, currentBid: parseFloat(e.target.value)})}
                    />
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-700 font-black text-xl italic font-tactical">$</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">NETWORK_STATE</label>
                  <div className="relative">
                    <select 
                      disabled={!isAdmin}
                      className={`w-full bg-black border-2 border-neutral-800 rounded-xl md:rounded-2xl px-6 py-4 text-white font-black outline-none focus:border-[#00e5ff] appearance-none cursor-pointer uppercase text-xs tracking-widest italic ${!isAdmin ? 'cursor-default border-transparent opacity-50' : ''}`}
                      value={formData.status}
                      onChange={e => setFormData({...formData, status: e.target.value as any})}
                    >
                      <option value="pending">PENDING_SYNC</option>
                      <option value="approved">AUTHORIZED</option>
                      <option value="rejected">REVOKED</option>
                    </select>
                    <Activity size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-700 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              {canEdit ? (
                <div className="flex flex-col md:flex-row gap-6">
                  <button 
                    type="submit"
                    className="flex-[2] py-6 md:py-8 rounded-2xl md:rounded-[2.5rem] font-black text-xl md:text-3xl transition-all transform active:scale-[0.98] border-b-8 md:border-b-[12px] font-tactical italic tracking-widest bg-black text-white border-neutral-800 hover:bg-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-center gap-6"
                  >
                    COMMIT_SYSTEM_CHANGES <Save size={28} />
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      if (confirm('CRITICAL_WARNING: Immediate node deletion. This will purge all associated bids. Proceed?')) {
                        onDelete(lead.id!);
                      }
                    }}
                    className="flex-1 px-8 md:px-12 bg-neutral-950 hover:bg-red-950/20 text-neutral-600 hover:text-red-500 py-6 md:py-8 rounded-2xl md:rounded-[2.5rem] font-black text-[10px] md:text-xs flex items-center justify-center gap-3 transition-all border-2 border-neutral-900 hover:border-red-900/50 uppercase tracking-widest"
                  >
                    <Trash2 size={18} /> PURGE_NODE
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  <button 
                    type="button"
                    onClick={() => { soundService.playClick(); onBid?.(lead.id); }}
                    className="w-full py-6 md:py-8 rounded-2xl md:rounded-[2.5rem] font-black text-xl md:text-3xl transition-all transform active:scale-[0.98] border-b-8 md:border-b-[12px] font-tactical italic tracking-widest bg-white text-black border-neutral-300 hover:bg-neutral-100 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-center gap-6"
                  >
                    INITIATE_ACQUISITION_HANDSHAKE <Gavel size={28} />
                  </button>
                </div>
              )}
            </div>
          </form>

          <div className="bg-[#0f0f0f] border-2 border-neutral-900 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] flex items-start gap-4 md:gap-6 shadow-xl max-w-4xl mx-auto">
            <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
            <div>
               <h4 className="text-[9px] md:text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1 font-futuristic">SYSTEM_AUDIT_HANDSHAKE</h4>
               <p className="text-[8px] md:text-[10px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
                 Administrative overrides and owner modifications bypass standard consensus layers. All state transitions are logged to the immutable global audit ledger and subject to behavioral telemetry verification by secondary auditing nodes.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLeadActionsModal;
