
import React, { useState } from 'react';
import { X, Save, Trash2, ShieldCheck, AlertCircle, Globe, DollarSign, Target, Sparkles, Terminal, Loader2, Zap, MapPin, Activity, Database, TrendingUp } from 'lucide-react';
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
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-[#0d111a] border border-[#facc15]/30 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 md:p-8 border-b border-white/5 bg-black/40 shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-[#facc15] rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="text-black" size={24} md:size={28} />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter italic leading-none">
                {isAdmin ? 'System_Lead_Override' : 'Refine_Asset_Node'}
              </h2>
              <p className="text-neutral-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-1">Node_UID: {lead.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-neutral-600 hover:text-white active:scale-90">
            <X size={24} md:size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scrollbar-hide">
          {/* AI COMMAND INTERFACE */}
          <div className="bg-[#facc15]/5 border border-[#facc15]/20 rounded-2xl md:rounded-3xl p-4 md:p-6 space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles size={32} md:size={40} className="text-[#facc15]" />
            </div>
            
            <div className="flex items-center gap-3">
              <Terminal size={14} md:size={16} className="text-[#facc15]" />
              <h3 className="text-[8px] md:text-[10px] font-black text-[#facc15] uppercase tracking-[0.2em]">AI_TACTICAL_INJECTOR</h3>
            </div>
            
            <div className="space-y-3">
              <textarea 
                rows={2}
                placeholder="INPUT COMMAND: e.g. 'Boost quality score and optimize description for high-intent traders'"
                className="w-full bg-black/40 border border-[#facc15]/20 rounded-xl px-4 py-3 text-[11px] md:text-xs text-neutral-400 outline-none focus:border-[#facc15]/50 transition-all resize-none italic placeholder:not-italic"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
              />
              <button 
                type="button"
                onClick={handleAiOverride}
                disabled={isApplyingAi || !aiPrompt.trim()}
                className="w-full py-2.5 md:py-3 bg-[#facc15]/10 hover:bg-[#facc15]/20 border border-[#facc15]/30 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest text-[#facc15] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-30"
              >
                {isApplyingAi ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} fill="currentColor" />}
                {isApplyingAi ? 'PROCESSING...' : 'EXECUTE_OVERRIDE'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 pb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Campaign_Title</label>
                <input 
                  required
                  className="w-full bg-black border border-neutral-800 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-neutral-300 font-bold outline-none focus:border-[#facc15] transition-all text-sm md:text-base"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Niche_Protocol</label>
                <input 
                  required
                  className="w-full bg-black border border-neutral-800 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-neutral-300 font-bold outline-none focus:border-[#facc15] transition-all text-sm md:text-base"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Lead_Manifest_Description</label>
              <textarea 
                required
                rows={3}
                className="w-full bg-black border border-neutral-800 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-neutral-400 outline-none focus:border-[#facc15] transition-all resize-none italic text-xs md:text-sm leading-relaxed"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            {/* URL NODES - CRITICAL FOR ADMIN AUDIT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1 flex items-center gap-2">
                  <Globe size={12} className="text-blue-500" /> Origin_URL
                </label>
                <input 
                  required
                  type="url"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 md:px-6 py-3 text-neutral-500 font-mono text-[10px] md:text-xs outline-none focus:border-[#facc15]"
                  value={formData.businessUrl}
                  onChange={e => setFormData({...formData, businessUrl: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1 flex items-center gap-2">
                  <Target size={12} className="text-red-500" /> Landing_Node
                </label>
                <input 
                  required
                  type="url"
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 md:px-6 py-3 text-neutral-500 font-mono text-[10px] md:text-xs outline-none focus:border-[#facc15]"
                  value={formData.targetLeadUrl}
                  onChange={e => setFormData({...formData, targetLeadUrl: e.target.value})}
                />
              </div>
            </div>

            {/* FINANCIALS & STATUS - EXPANDED FOR ADMIN */}
            <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 bg-black/20 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] border border-neutral-800/40`}>
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1 flex items-center gap-2">
                  <DollarSign size={12} className="text-[#facc15]" /> Node_Floor ($)
                </label>
                <div className="relative">
                  <input 
                    required
                    type="number"
                    step="0.01"
                    className="w-full bg-black border border-neutral-800 rounded-xl md:rounded-2xl px-8 md:px-10 py-3 md:py-4 text-white font-black outline-none focus:border-[#facc15] text-lg md:text-xl font-tactical tracking-widest"
                    value={formData.basePrice}
                    onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value)})}
                  />
                  <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-neutral-700 font-bold text-sm">$</span>
                </div>
              </div>

              {isAdmin && (
                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1 flex items-center gap-2">
                    <TrendingUp size={12} className="text-blue-400" /> Current_High_Bid ($)
                  </label>
                  <div className="relative">
                    <input 
                      required
                      type="number"
                      step="0.01"
                      className="w-full bg-black border border-neutral-800 rounded-xl md:rounded-2xl px-8 md:px-10 py-3 md:py-4 text-white font-black outline-none focus:border-[#facc15] text-lg md:text-xl font-tactical tracking-widest"
                      value={formData.currentBid}
                      onChange={e => setFormData({...formData, currentBid: parseFloat(e.target.value)})}
                    />
                    <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-neutral-700 font-bold text-sm">$</span>
                  </div>
                </div>
              )}
              
              {isAdmin && (
                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1 flex items-center gap-2">
                    <ShieldCheck size={12} className="text-emerald-500" /> Integrity_Q
                  </label>
                  <div className="relative">
                      <input 
                      required
                      type="number"
                      max="100"
                      min="0"
                      className="w-full bg-black border border-neutral-800 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-emerald-500 font-black outline-none focus:border-[#facc15] text-lg md:text-xl font-tactical tracking-widest"
                      value={formData.qualityScore}
                      onChange={e => setFormData({...formData, qualityScore: parseInt(e.target.value)})}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-900 font-bold text-sm">%</span>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Network_Status</label>
                <div className="relative">
                  <select 
                    className="w-full bg-black border border-neutral-800 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-neutral-300 font-black outline-none focus:border-[#facc15] appearance-none cursor-pointer uppercase text-xs md:text-sm tracking-widest italic"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="pending">PENDING_SYNC</option>
                    <option value="approved">AUTHORIZED</option>
                    <option value="rejected">REVOKED</option>
                  </select>
                  <Activity size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-700 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* GEOGRAPHIC NODES */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1 flex items-center gap-2">
                  <MapPin size={12} className="text-[#facc15]" /> Region_ID
                </label>
                <input 
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 md:px-6 py-3 text-neutral-400 font-bold outline-none focus:border-[#facc15] text-xs uppercase"
                  value={formData.region}
                  onChange={e => setFormData({...formData, region: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Country_ISO</label>
                <input 
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 md:px-6 py-3 text-neutral-400 font-bold outline-none focus:border-[#facc15] text-center text-xs uppercase"
                  maxLength={2}
                  value={formData.countryCode}
                  onChange={e => setFormData({...formData, countryCode: e.target.value.toUpperCase()})}
                />
              </div>
            </div>

            {/* ACTION FOOTER */}
            <div className="pt-8 border-t border-neutral-800/40 flex flex-col sm:flex-row gap-4">
               <button 
                  type="submit"
                  className="flex-1 bg-[#facc15] text-black py-4 md:py-6 rounded-2xl md:rounded-[2.5rem] font-black text-lg md:text-xl hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-yellow-400/10 border-b-8 border-yellow-700 active:scale-[0.98] active:translate-y-1 active:border-b-4 font-tactical italic tracking-widest"
               >
                  <Save size={20} md:size={24} /> COMMIT_SYSTEM_CHANGES
               </button>
               <button 
                  type="button"
                  onClick={() => {
                    if (confirm('CRITICAL_WARNING: Immediate node deletion. This will purge all associated bids. Proceed?')) {
                      onDelete(lead.id!);
                    }
                  }}
                  className="px-6 md:px-8 bg-neutral-900 hover:bg-red-950/20 text-neutral-500 hover:text-red-500 py-4 md:py-6 rounded-2xl md:rounded-[2.5rem] font-black text-[10px] md:text-xs flex items-center justify-center gap-2 transition-all border-2 border-neutral-800 hover:border-red-900/50 uppercase tracking-widest"
               >
                  <Trash2 size={16} md:size={20} /> PURGE_NODE
               </button>
            </div>
          </form>
        </div>

        <div className="bg-black/80 border-t border-white/5 p-4 md:p-6 flex items-start gap-4 shrink-0">
          <AlertCircle className="text-[#facc15]/40 shrink-0" size={18} md:size={20} />
          <p className="text-[8px] md:text-[9px] text-neutral-600 font-medium uppercase tracking-widest leading-relaxed italic">
            Root_Auth_Protocol: {isAdmin ? 'Administrative overrides bypass standard consensus layers.' : 'All modifications are subject to automatic re-validation by the AI Auditor node.'} Integrity metrics will be recalculated upon state commit.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLeadActionsModal;
