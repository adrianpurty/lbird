
import React, { useState } from 'react';
import { 
  X, Save, Trash2, ShieldCheck, AlertCircle, Globe, DollarSign, 
  Target, Sparkles, Terminal, Loader2, Zap, MapPin, Activity, 
  Database, TrendingUp, Cpu, Gauge, ArrowRight, CheckCircle2, XCircle
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
}

const AdminLeadActionsModal: React.FC<AdminLeadActionsModalProps> = ({ lead, user, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Lead>>({
    ...lead
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isApplyingAi, setIsApplyingAi] = useState(false);

  const isAdmin = user.role === 'admin';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playClick(true);
    onSave(formData);
  };

  const handleDecision = (status: 'approved' | 'rejected') => {
    soundService.playClick(true);
    onSave({ ...formData, status });
  };

  const handleAiOverride = async () => {
    if (!aiPrompt.trim()) return;
    
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
      {/* Background HUD Ambience */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00e5ff]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-[1100px] max-h-[95vh] bg-[#080808] border-2 border-neutral-900 rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_50px_150px_-20px_rgba(0,0,0,1)] flex flex-col relative z-10 animate-in zoom-in-95 duration-500 overflow-hidden">
        
        {/* LANDSCAPE HEADER - SALES FLOOR STYLE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 p-6 md:p-12 border-b-2 border-neutral-900 bg-black/40">
          <div className="relative">
            <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-4 h-12 md:h-24 bg-[#00e5ff] rounded-full blur-xl opacity-20" />
            <h2 className="text-3xl md:text-4xl font-futuristic text-white italic uppercase flex items-center gap-4 md:gap-8 text-glow">
              {isAdmin ? 'SYSTEM' : 'ASSET'} <span className="text-neutral-600 font-normal">{isAdmin ? 'OVERRIDE' : 'REFINERY'}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4 md:mt-6">
              <div className="px-3 md:px-4 py-1.5 bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-full text-[8px] md:text-[10px] font-black text-[#00e5ff] uppercase tracking-widest">NODE_IDENTIFIER: {lead.id.toUpperCase()}</div>
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

        {/* MODAL CONTENT SECTORS */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 md:space-y-12 scrollbar-hide">
          
          {/* SECTOR 00: AI TACTICAL INJECTOR */}
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

          <form onSubmit={handleSubmit} className="space-y-8 md:space-y-12">
            
            {/* SECTOR 01: ASSET MANIFEST */}
            <div className="bg-[#0c0c0c]/90 rounded-[2rem] md:rounded-[3rem] border-2 border-neutral-900 p-6 md:p-10 shadow-2xl relative overflow-hidden scanline-effect group">
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
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-xl md:rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#00e5ff]/60 transition-all text-sm md:text-base"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">SECTOR_PROTOCOL_ID</label>
                  <input 
                    required
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-xl md:rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#00e5ff]/60 transition-all text-sm md:text-base"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3 mb-8 md:mb-10">
                <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">MANIFEST_DESCRIPTION_STRING</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl md:rounded-3xl px-6 md:px-8 py-4 md:py-6 text-neutral-300 outline-none focus:border-[#00e5ff]/60 transition-all resize-none italic text-base md:text-lg leading-relaxed font-rajdhani"
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
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-xl md:rounded-2xl px-6 py-4 text-neutral-500 font-mono text-[10px] md:text-xs outline-none focus:border-[#00e5ff]/60"
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
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-xl md:rounded-2xl px-6 py-4 text-neutral-500 font-mono text-[10px] md:text-xs outline-none focus:border-[#00e5ff]/60"
                    value={formData.targetLeadUrl}
                    onChange={e => setFormData({...formData, targetLeadUrl: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* SECTOR 02: FINANCIAL & STATUS */}
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
                      className="w-full bg-black border-2 border-neutral-800 rounded-xl md:rounded-2xl px-12 py-4 text-white font-black outline-none focus:border-[#00e5ff] text-2xl font-tactical tracking-widest"
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
                      className="w-full bg-black border-2 border-neutral-800 rounded-xl md:rounded-2xl px-12 py-4 text-white font-black outline-none focus:border-[#00e5ff] text-2xl font-tactical tracking-widest"
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
                      className="w-full bg-black border-2 border-neutral-800 rounded-xl md:rounded-2xl px-6 py-4 text-white font-black outline-none focus:border-[#00e5ff] appearance-none cursor-pointer uppercase text-xs tracking-widest italic"
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

            {/* SECTOR 03: GEOGRAPHIC NODE */}
            <div className="bg-[#0f0f0f] border-2 border-neutral-900 rounded-[2.5rem] p-6 md:p-10 shadow-xl relative overflow-hidden group">
              <h3 className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mb-8 md:mb-10 flex items-center gap-3">
                <MapPin size={14} className="text-[#00e5ff]" /> Sector_03 // Geographic_Node
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">REGION_DESCRIPTOR</label>
                  <input 
                    className="w-full bg-black border-2 border-neutral-800 rounded-xl md:rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#00e5ff]/60 transition-all uppercase text-xs tracking-widest"
                    value={formData.region}
                    onChange={e => setFormData({...formData, region: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[9px] md:text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 italic">COUNTRY_ISO_NODE</label>
                  <input 
                    className="w-full bg-black border-2 border-neutral-800 rounded-xl md:rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#00e5ff]/60 transition-all text-center uppercase text-xs tracking-widest"
                    maxLength={2}
                    value={formData.countryCode}
                    onChange={e => setFormData({...formData, countryCode: e.target.value.toUpperCase()})}
                  />
                </div>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="space-y-6 pt-4">
              <div className="flex flex-col md:flex-row gap-6">
                <button 
                  type="submit"
                  className="flex-[2] py-6 md:py-8 rounded-2xl md:rounded-[2.5rem] font-black text-xl md:text-3xl transition-all transform active:scale-[0.98] border-b-8 md:border-b-[12px] font-tactical italic tracking-widest bg-black text-white border-neutral-800 hover:bg-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex items-center justify-center gap-6"
                >
                  {/* Fix: Removed non-existent md:size prop */}
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
                  {/* Fix: Removed non-existent md:size prop */}
                  <Trash2 size={18} /> PURGE_NODE
                </button>
              </div>

              {isAdmin && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-neutral-900/40 border-2 border-neutral-800 rounded-[2.5rem] animate-in slide-in-from-bottom-2">
                   <button 
                    type="button"
                    onClick={() => handleDecision('approved')}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-6 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-xl uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-xl shadow-emerald-900/10 border-b-4 border-emerald-800 active:translate-y-1"
                   >
                     <CheckCircle2 size={24} /> AUTHORIZE_NODE
                   </button>
                   <button 
                    type="button"
                    onClick={() => handleDecision('rejected')}
                    className="w-full bg-red-700 hover:bg-red-600 text-white py-6 rounded-2xl md:rounded-[2rem] font-black text-lg md:text-xl uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-xl shadow-red-900/10 border-b-4 border-red-900 active:translate-y-1"
                   >
                     <XCircle size={24} /> REJECT_NODE
                   </button>
                </div>
              )}
            </div>
          </form>

          {/* INTEGRITY DISCLOSURE */}
          <div className="bg-[#0f0f0f] border-2 border-neutral-900 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] flex items-start gap-4 md:gap-6 shadow-xl max-w-4xl mx-auto">
            {/* Fix: Removed non-existent md:size prop */}
            <ShieldCheck className="text-emerald-500 shrink-0" size={20} />
            <div>
               <h4 className="text-[9px] md:text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1 font-futuristic">SYSTEM_AUDIT_HANDSHAKE</h4>
               <p className="text-[8px] md:text-[10px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
                 Administrative overrides bypass standard consensus layers. All state transitions are logged to the immutable global audit ledger and subject to behavioral telemetry verification by secondary auditing nodes.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLeadActionsModal;
