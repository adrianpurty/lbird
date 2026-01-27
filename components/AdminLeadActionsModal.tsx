
import React, { useState } from 'react';
import { X, Save, Trash2, ShieldCheck, AlertCircle, Globe, DollarSign, Target, Sparkles, Terminal, Loader2, Zap, MapPin, Activity, Database, TrendingUp, Phone } from 'lucide-react';
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
  const [formData, setFormData] = useState<Partial<Lead>>({ ...lead });
  const [aiPrompt, setAiPrompt] = useState('');
  const [isApplyingAi, setIsApplyingAi] = useState(false);

  const isAdmin = user.role === 'admin';

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
      }
    } finally {
      setIsApplyingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-black border border-[#1A1A1A] rounded-[3rem] shadow-[0_50px_150px_rgba(0,0,0,1)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500 max-h-[90vh]">
        <div className="flex justify-between items-center p-10 border-b border-[#1A1A1A] bg-[#1A1A1A]/10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#1A1A1A] rounded-2xl flex items-center justify-center text-[#FACC15] border border-[#FACC15]/20">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic leading-none">
                OVERRIDE <span className="text-[#FACC15]">CMD</span>
              </h2>
              <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.4em] mt-3">TARGET_NODE: {lead.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-white/5 rounded-full transition-colors text-neutral-600 hover:text-white">
            <X size={32} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
          <div className="bg-[#1A1A1A] p-8 rounded-[2rem] border border-white/5 space-y-6 relative overflow-hidden group">
            <div className="flex items-center gap-4 text-[#FACC15]">
              <Terminal size={18} />
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">AI_TACTICAL_INJECT</h3>
            </div>
            <textarea 
              rows={2}
              placeholder="INPUT_COMMAND: Optimize lead description for high-intent traders..."
              className="w-full bg-black border border-[#1A1A1A] rounded-2xl px-6 py-5 text-neutral-400 font-bold outline-none focus:border-[#FACC15]/40 transition-all italic text-sm"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
            />
            <button 
              onClick={handleAiOverride}
              disabled={isApplyingAi || !aiPrompt.trim()}
              className="w-full py-4 bg-black hover:bg-white hover:text-black rounded-2xl font-black text-[11px] uppercase tracking-widest text-neutral-400 flex items-center justify-center gap-3 transition-all border border-[#1A1A1A]"
            >
              {isApplyingAi ? <Loader2 className="animate-spin" size={14} /> : <Zap size={14} className="text-[#FACC15]" />}
              EXECUTE_INJECTION
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2">NODE_ID_LABEL</label>
                <input 
                  className="w-full bg-[#1A1A1A]/40 border border-[#1A1A1A] rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#FACC15]/40"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2">PROTO_CATEGORY</label>
                <input 
                  className="w-full bg-[#1A1A1A]/40 border border-[#1A1A1A] rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#FACC15]/40"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2 flex items-center gap-2">
                <Phone size={14} className="text-[#FACC15]" /> VOICE_RELAY_ENDPOINT
              </label>
              <input 
                className="w-full bg-[#1A1A1A]/40 border border-[#1A1A1A] rounded-2xl px-6 py-4 text-white font-mono outline-none focus:border-[#FACC15]/40"
                placeholder="+1-800-000-0000"
                value={formData.tollFreeNumber || ''}
                onChange={e => setFormData({...formData, tollFreeNumber: e.target.value})}
              />
            </div>

            <div className="bg-[#1A1A1A] p-8 rounded-[2.5rem] border border-white/5 grid grid-cols-2 md:grid-cols-3 gap-8">
              <div className="space-y-2">
                 <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-2">FLOOR_VAL ($)</span>
                 <input type="number" className="bg-transparent border-none text-3xl font-black text-white outline-none w-full font-tactical tracking-widest italic" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value)})} />
              </div>
              <div className="space-y-2">
                 <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-2">INTEGRITY_SCORE</span>
                 <input type="number" className="bg-transparent border-none text-3xl font-black text-[#FACC15] outline-none w-full font-tactical tracking-widest italic" value={formData.qualityScore} onChange={e => setFormData({...formData, qualityScore: parseInt(e.target.value)})} />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                 <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-2">SYNC_STATUS</span>
                 <select className="bg-transparent border-none text-sm font-black text-white outline-none w-full uppercase tracking-widest italic" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                    <option value="pending" className="bg-black">WAITING</option>
                    <option value="approved" className="bg-black">AUTHED</option>
                    <option value="rejected" className="bg-black">DENIED</option>
                 </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 pt-10 border-t border-[#1A1A1A]">
               <button type="submit" className="flex-1 bg-[#FACC15] text-black py-8 rounded-[2.5rem] font-black text-2xl uppercase italic tracking-widest transition-all border-b-8 border-yellow-800 active:border-b-0 active:translate-y-2 shadow-2xl hover:bg-white font-tactical">
                  COMMIT_SYNC
               </button>
               <button 
                  type="button"
                  onClick={() => onDelete(lead.id!)}
                  className="px-10 bg-[#1A1A1A] text-neutral-500 hover:text-white py-8 rounded-[2.5rem] font-black text-[12px] uppercase tracking-widest transition-all border border-white/5"
               >
                  PURGE_NODE
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLeadActionsModal;
