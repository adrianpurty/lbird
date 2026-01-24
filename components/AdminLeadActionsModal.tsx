import React, { useState } from 'react';
import { X, Save, Trash2, ShieldCheck, AlertCircle, Globe, DollarSign, Target } from 'lucide-react';
import { Lead } from '../types.ts';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">System Override</h2>
              <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mt-1">Lead ID: {lead.id}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-neutral-500 hover:text-white">
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Lead Title</label>
              <input 
                required
                className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#facc15] transition-all"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Category</label>
              <input 
                required
                className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#facc15] transition-all"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Description Override</label>
            <textarea 
              required
              rows={3}
              className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#facc15] transition-all resize-none italic"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1 flex items-center gap-2">
                <DollarSign size={12} className="text-[#facc15]" /> Base Price ($)
              </label>
              <input 
                required
                type="number"
                className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-[#facc15] font-black outline-none focus:border-[#facc15]"
                value={formData.basePrice}
                onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1 flex items-center gap-2">
                <ShieldCheck size={12} className="text-emerald-500" /> Quality Score
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
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Global Status</label>
              <select 
                className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-white font-black outline-none focus:border-[#facc15] appearance-none"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="pending">PENDING</option>
                <option value="approved">APPROVED</option>
                <option value="rejected">REJECTED</option>
              </select>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4">
             <button 
                type="submit"
                className="flex-1 bg-[#facc15] text-black py-6 rounded-[2rem] font-black text-lg hover:bg-yellow-500 transition-all flex items-center justify-center gap-2 shadow-xl shadow-yellow-400/5"
             >
                <Save size={20} /> COMMIT CHANGES
             </button>
             <button 
                type="button"
                onClick={() => onDelete(lead.id)}
                className="px-8 bg-red-600 hover:bg-red-500 text-white py-6 rounded-[2rem] font-black text-sm flex items-center justify-center gap-2 transition-colors border-b-4 border-red-800"
             >
                <Trash2 size={20} /> PURGE
             </button>
          </div>
        </form>

        <div className="bg-blue-500/10 border-t border-white/5 p-6 flex items-start gap-3">
          <AlertCircle className="text-blue-500 shrink-0" size={18} />
          <p className="text-[10px] text-neutral-500 font-medium uppercase tracking-widest leading-relaxed">
            Administrative overrides bypass normal marketplace consensus. All changes are logged to the master node ledger.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLeadActionsModal;