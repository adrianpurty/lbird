import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Lead } from '../types.ts';

interface AdminSetPriceModalProps {
  lead: Lead;
  onClose: () => void;
  onSave: (newPrice: number) => void;
}

const AdminSetPriceModal: React.FC<AdminSetPriceModalProps> = ({ lead, onClose, onSave }) => {
  const [price, setPrice] = useState<number>(lead.currentBid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(price);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0d111a] border border-red-500/20 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-red-500/5">
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Admin Price Override</h2>
            <p className="text-neutral-400 text-[10px] font-black uppercase tracking-widest mt-1">Modifying: {lead.title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-neutral-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="bg-red-500/10 p-4 rounded-xl border border-red-500/20 flex items-start gap-3">
            <AlertCircle className="text-red-500 shrink-0" size={20} />
            <p className="text-[11px] text-neutral-300 leading-relaxed font-medium">
              You are manually setting the marketplace floor price. This will update the lead's cost for all future bidders instantly.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Market Floor Price ($)</label>
            <input 
              required
              type="number"
              step="0.01"
              min="0"
              autoFocus
              className="w-full bg-black border border-white/10 rounded-2xl px-6 py-5 text-4xl font-black text-[#facc15] text-center outline-none focus:border-[#facc15] transition-all"
              value={price}
              onChange={e => setPrice(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              className="w-full bg-[#facc15] text-black py-5 rounded-2xl font-black text-lg hover:bg-[#eab308] transition-all flex items-center justify-center gap-2 shadow-xl shadow-yellow-400/10 active:scale-[0.98]"
            >
              <Save size={20} /> APPLY SYSTEM OVERRIDE
            </button>
            <button 
              type="button"
              onClick={onClose}
              className="w-full mt-3 text-neutral-500 hover:text-white py-2 text-xs font-black uppercase tracking-widest transition-colors"
            >
              Cancel Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminSetPriceModal;