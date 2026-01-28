import React, { useState, useMemo } from 'react';
import { Lead } from '../types.ts';
import { apiService, NICHE_PROTOCOLS } from '../services/apiService.ts';
import { 
  Zap, Target, Cpu, Activity, Database, ArrowRight, ShieldCheck, Radar,
  ListFilter, Calendar, Hash, Truck, ChevronUp, ChevronDown
} from 'lucide-react';
import { soundService } from '../services/soundService.ts';

interface LeadSubmissionFormProps {
  onSubmit: (lead: Partial<Lead>) => void;
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

const getCurrentWeek = () => {
  const now = new Date();
  const oneJan = new Date(now.getFullYear(), 0, 1);
  const numberOfDays = Math.floor((now.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
  return Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
};

const LeadSubmissionForm: React.FC<LeadSubmissionFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    businessUrl: '',
    targetLeadUrl: '',
    basePrice: 50,
    countryCode: 'US',
    region: 'Remote',
    qualityScore: 90,
    deliveryWeek: getCurrentWeek(),
    deliveryYear: new Date().getFullYear(),
    leadCapacity: 1000
  });

  const weekRange = useMemo(() => 
    getWeekRange(formData.deliveryWeek, formData.deliveryYear), 
    [formData.deliveryWeek, formData.deliveryYear]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) return;
    soundService.playClick(true);
    // Transform week selection into a standardized deliveryDate string for the database
    const payload = {
      ...formData,
      deliveryDate: `WK-${formData.deliveryWeek.toString().padStart(2, '0')}-${formData.deliveryYear}`
    };
    onSubmit(payload);
  };

  const adjustWeek = (delta: number) => {
    soundService.playClick();
    setFormData(prev => {
      let newWeek = prev.deliveryWeek + delta;
      if (newWeek > 53) return { ...prev, deliveryWeek: 1, deliveryYear: prev.deliveryYear + 1 };
      if (newWeek < 1) return { ...prev, deliveryWeek: 53, deliveryYear: prev.deliveryYear - 1 };
      return { ...prev, deliveryWeek: newWeek };
    });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 font-rajdhani">
      <div className="flex items-center justify-between border-b border-bright pb-3">
        <h2 className="text-lg font-futuristic text-main italic uppercase leading-none tracking-tight">ASSET <span className="text-dim">PROVISION</span></h2>
        <Cpu size={12} className="text-accent" />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-surface border border-bright rounded-[2rem] p-8 shadow-2xl space-y-8 transition-colors">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                 <label className="text-[8px] font-black text-dim uppercase tracking-widest italic">NODE_LABEL</label>
                 <input required className="w-full bg-input border border-bright rounded-xl px-4 py-3 text-[11px] text-main outline-none focus:border-accent/40 transition-all font-bold" placeholder="CAMPAIGN_NODE_ID" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[8px] font-black text-dim uppercase tracking-widest italic">SECTOR_PROTOCOL</label>
                 <select required className="w-full bg-input border border-bright rounded-xl px-4 py-3 text-[11px] text-main outline-none focus:border-accent/40 transition-all uppercase font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="" disabled className="bg-surface">SELECT_SEGMENT</option>
                    {Object.keys(NICHE_PROTOCOLS).map(cat => <option key={cat} value={cat} className="bg-surface">{cat}</option>)}
                 </select>
              </div>
           </div>

           <div className="space-y-1.5">
              <label className="text-[8px] font-black text-dim uppercase tracking-widest italic">MANIFEST_DESCRIPTION</label>
              <textarea required rows={4} className="w-full bg-input border border-bright rounded-xl px-4 py-3 text-[10px] text-main/80 outline-none focus:border-accent/40 transition-all resize-none italic leading-relaxed" placeholder="Document node performance and integrity parameters..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
           </div>

           {/* Logistics Section - Enhanced Week Feature */}
           <div className="bg-main/[0.02] border border-bright rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Truck size={14} className="text-accent" />
                    <h3 className="text-[10px] font-black text-main uppercase tracking-[0.3em] italic">Logistics_Protocol</h3>
                 </div>
                 <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 px-3 py-1 rounded-lg">
                    <span className="text-[8px] font-black text-accent uppercase tracking-widest">Selected: {weekRange.start} — {weekRange.end}</span>
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <label className="text-[8px] font-black text-dim uppercase tracking-widest italic flex items-center gap-2 px-2">
                     <Calendar size={10} /> Delivery_Week_Allocation
                   </label>
                   <div className="flex items-center gap-4 bg-input border border-bright rounded-2xl p-2 px-6 justify-between group focus-within:border-accent/40 transition-all">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-dim uppercase">Week</span>
                        <span className="text-2xl font-tactical font-black text-main italic">#{formData.deliveryWeek.toString().padStart(2, '0')}</span>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => adjustWeek(-1)} className="w-10 h-10 bg-surface border border-bright rounded-xl flex items-center justify-center text-dim hover:text-white hover:border-accent/40 transition-all active:scale-90"><ChevronDown size={18} /></button>
                        <button type="button" onClick={() => adjustWeek(1)} className="w-10 h-10 bg-surface border border-bright rounded-xl flex items-center justify-center text-dim hover:text-white hover:border-accent/40 transition-all active:scale-90"><ChevronUp size={18} /></button>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-dim uppercase">Year</span>
                        <select 
                          className="bg-transparent text-lg font-tactical font-black text-main italic outline-none cursor-pointer"
                          value={formData.deliveryYear}
                          onChange={e => setFormData({...formData, deliveryYear: parseInt(e.target.value)})}
                        >
                          <option value={2024}>2024</option>
                          <option value={2025}>2025</option>
                          <option value={2026}>2026</option>
                        </select>
                      </div>
                   </div>
                </div>
                <div className="space-y-1.5">
                   <label className="text-[8px] font-black text-dim uppercase tracking-widest italic flex items-center gap-2 px-2">
                     <Hash size={10} /> Unit_Inventory_Total
                   </label>
                   <div className="relative group">
                     <input required type="number" className="w-full bg-input border border-bright rounded-xl px-4 py-3 h-[60px] text-xl font-tactical font-black text-main outline-none focus:border-accent/40 transition-all italic tracking-widest" placeholder="0000" value={formData.leadCapacity} onChange={e => setFormData({...formData, leadCapacity: parseInt(e.target.value) || 0})} />
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-black text-dim uppercase">Units</span>
                   </div>
                </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-1.5">
                 <label className="text-[8px] font-black text-dim uppercase tracking-widest italic">Origin_URI</label>
                 <input required type="url" className="w-full bg-input border border-bright rounded-xl px-4 py-3 text-[9px] text-dim font-mono outline-none focus:border-accent/40" placeholder="HTTPS://ORIGIN.IO" value={formData.businessUrl} onChange={e => setFormData({...formData, businessUrl: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                 <label className="text-[8px] font-black text-dim uppercase tracking-widest italic">Terminal_Endpoint</label>
                 <input required type="url" className="w-full bg-input border border-bright rounded-xl px-4 py-3 text-[9px] text-dim font-mono outline-none focus:border-accent/40" placeholder="HTTPS://DELIVERY.ENDPOINT" value={formData.targetLeadUrl} onChange={e => setFormData({...formData, targetLeadUrl: e.target.value})} />
              </div>
           </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <div className="bg-surface border border-bright rounded-[2rem] p-8 shadow-2xl text-center space-y-8 flex flex-col items-center justify-center h-full transition-colors relative overflow-hidden group">
              <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <Radar size={64} className="text-dim/20 animate-pulse relative z-10" />
              <div className="space-y-2 relative z-10">
                 <span className="text-[8px] font-black text-dim uppercase tracking-widest block italic">BID_FLOOR_SETTLEMENT</span>
                 <div className="relative inline-block">
                    <span className="absolute left-[-15px] top-1/2 -translate-y-1/2 text-dim font-tactical text-xl">$</span>
                    <input type="number" className="bg-transparent border-none text-5xl font-tactical font-black text-main italic tracking-widest text-center outline-none w-32" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: parseInt(e.target.value)})} />
                 </div>
              </div>
              <button type="submit" className="w-full py-6 bg-main text-surface rounded-2xl font-black text-xl italic font-tactical tracking-widest border-b-[8px] border-dim hover:bg-main/90 active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-4 shadow-xl relative z-10">
                 BROADCAST_NODE <ArrowRight size={24} />
              </button>
           </div>
        </div>
      </form>
    </div>
  );
};

export default LeadSubmissionForm;