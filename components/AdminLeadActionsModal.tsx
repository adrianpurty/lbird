import React, { useState } from 'react';
import { X, Save, Trash2, ShieldCheck, AlertCircle, Globe, DollarSign, Target, Sparkles, Terminal, Loader2, Zap } from 'lucide-react';
import { Lead } from '../types.ts';
import { applyAiOverride } from '../services/geminiService.ts';
import { soundService } from '../services/soundService.ts';

interface AdminLeadActionsModalProps {
  lead: Lead;
  onClose: () => void;
  onSave: (updatedLead: Partial<Lead>) => void;
  onDelete: (id: string) => void;
}

const AdminLeadActionsModal: React.FC<AdminLeadActionsModalProps> = ({ lead, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Lead>>({
    ...lead
  });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isApplyingAi, setIsApplyingAi] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
          qualityScore: result.qualityScore ?? prev.qualityScore
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
      <div className="w-full max-w-2xl bg-[#0d111a] border border-[#facc15]/30 rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-8 border-b border-white/5 bg-black/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#facc15] rounded-2xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="text-black" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none">System Override</h2>
              <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mt-1">Lead ID: {lead.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-neutral-500 hover:text-white">
            <X size={28} />
          </button>
        </div>

        <div className="p-8 sm:p-10 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
          {/* AI COMMAND INTERFACE */}
          <div className="bg-[#facc15]/5 border border-[#facc15]/20 rounded-3xl p-6 space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles size={40} className="text-[#facc15]" />
            </div>
            
            <div className="flex items-center gap-3">
              <Terminal size={16} className="text-[#facc15]" />
              <h3 className="text-[10px] font-black text-[#facc15] uppercase tracking-[0.2em]">Smart Tactical Override</h3>
            </div>
            
            <div className="space-y-3">
              <textarea 
                rows={2}
                placeholder="Enter natural language command (e.g. 'Make this sound more professional and double the quality score if verified')"
                className="w-full bg-black/40 border border-[#facc15]/20 rounded-xl px-4 py-3 text-xs text-neutral-400 outline-none focus:border-[#facc15]/50 transition-all resize-none italic"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
              />
              <button 
                type="button"
                onClick={handleAiOverride}
                disabled={isApplyingAi || !aiPrompt.trim()}
                className="w-full py-3 bg-[#facc15]/10 hover:bg-[#facc15]/20 border border-[#facc15]/30 rounded-xl font-black text-[10px] uppercase tracking-widest text-[#facc15] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-30"
              >
                {isApplyingAi ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Zap size={14} fill="currentColor" />
                )}
                {isApplyingAi ? 'PROCESSING OVERRIDE...' : 'EXECUTE SMART COMMAND'}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Campaign Node Name</label>
                <input 
                  required
                  className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-neutral-400 font-bold outline-none focus:border-[#facc15] transition-all"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Niche Protocol</label>
                <input 
                  required
                  className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-neutral-400 font-bold outline-none focus:border-[#facc15] transition-all"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Data Stream Description</label>
              <textarea 
                required
                rows={3}
                className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-neutral-400 outline-none focus:border-[#facc15] transition-all resize-none italic text-sm leading-relaxed"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1 flex items-center gap-2">
                  <DollarSign size={12} className="text-[#facc15]" /> Floor Price ($)
                </label>
                <input 
                  required
                  type="number"
                  className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-neutral-400 font-black outline-none focus:border-[#facc15]"
                  value={formData.basePrice}
                  onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1 flex items-center gap-2">
                  <ShieldCheck size={12} className="text-emerald-500" /> Integrity Score
                </label>
                <input 
                  required
                  type="number"
                  max="100"
                  min="0"
                  className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-emerald-500 font-black outline-none focus:border-[#facc15]"
                  value={formData.qualityScore}
                  onChange={e => setFormData({...formData, qualityScore: parseInt(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Node Status</label>
                <select 
                  className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-neutral-400 font-black outline-none focus:border-[#facc15] appearance-none cursor-pointer"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="pending">PENDING_SYNC</option>
                  <option value="approved">AUTHORIZED</option>
                  <option value="rejected">REVOKED</option>
                </select>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4">
               <button 
                  type="submit"
                  className="flex-1 bg-[#facc15] text-black py-6 rounded-[2rem] font-black text-lg hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 shadow-xl shadow-yellow-400/10 border-b-[6px] border-yellow-700 active:scale-[0.98]"
               >
                  <Save size={20} /> COMMIT FINAL HANDSHAKE
               </button>
               <button 
                  type="button"
                  onClick={() => {
                    if (confirm('CAUTION: Permanent node deletion requested. Proceed with purge?')) {
                      onDelete(lead.id);
                    }
                  }}
                  className="px-8 bg-neutral-900 hover:bg-red-950/20 text-neutral-500 hover:text-red-500 py-6 rounded-[2rem] font-black text-sm flex items-center justify-center gap-2 transition-all border border-neutral-800 hover:border-red-900/50"
               >
                  <Trash2 size={20} /> PURGE
               </button>
            </div>
          </form>
        </div>

        <div className="bg-black/60 border-t border-white/5 p-6 flex items-start gap-4">
          <AlertCircle className="text-[#facc15]/40 shrink-0" size={20} />
          <p className="text-[9px] text-neutral-600 font-medium uppercase tracking-widest leading-relaxed italic">
            Root Protocol: Administrative overrides bypass consensus layers. Every modification is logged with an immutable SHA-256 signature to the master audit ledger.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLeadActionsModal;