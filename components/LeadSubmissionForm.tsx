
import React, { useState, useEffect } from 'react';
import { Lead } from '../types.ts';
import { apiService, NICHE_PROTOCOLS } from '../services/apiService.ts';
import { 
  Zap, Target, Globe, Cpu, Activity, Database, ArrowRight, ShieldCheck, Radar,
  ListFilter, DollarSign, MapPin, RefreshCw
} from 'lucide-react';
import { soundService } from '../services/soundService.ts';

interface LeadSubmissionFormProps {
  onSubmit: (lead: Partial<Lead>) => void;
}

const LeadSubmissionForm: React.FC<LeadSubmissionFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    businessUrl: '',
    targetLeadUrl: '',
    basePrice: 50,
    countryCode: 'US',
    region: 'Remote'
  });
  const [categories, setCategories] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await apiService.getCategories();
        setCategories(cats as any);
      } catch (error) {
        setCategories(NICHE_PROTOCOLS);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) return;
    soundService.playClick(true);
    onSubmit(formData);
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-4 pb-24 animate-in fade-in duration-500 font-rajdhani px-3 md:px-0">
      
      {/* COMPACT HEADER */}
      <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white shadow-glow-sm">
            <Zap size={16} fill="currentColor" />
          </div>
          <div>
            <h2 className="text-lg font-futuristic text-white italic uppercase leading-none tracking-tight">ASSET <span className="text-neutral-500">PROVISION</span></h2>
            <p className="text-[8px] text-neutral-600 font-black uppercase tracking-widest mt-0.5">DEPLOYMENT_READY</p>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-neutral-900/40 p-2 rounded-xl border border-neutral-800">
          <Cpu size={12} className="text-[#00e5ff]" />
          <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest leading-none">99.8% Reliability</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Form Fields */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-1 italic flex items-center gap-2">
                    <Zap size={10} className="text-[#00e5ff]" /> Node Label
                  </label>
                  <input 
                    required
                    className="w-full bg-black/40 border border-neutral-800 rounded-lg px-3 py-2 text-white font-bold outline-none focus:border-[#00e5ff]/40 transition-all text-xs"
                    placeholder="E.G. SOLAR_IA_INBOUND"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-1 italic flex items-center gap-2">
                    <Target size={10} className="text-[#00e5ff]" /> Sector
                  </label>
                  <select 
                    required
                    className="w-full bg-black/40 border border-neutral-800 rounded-lg px-3 py-2 text-white font-bold outline-none focus:border-[#00e5ff]/40 transition-all text-xs cursor-pointer uppercase"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="" disabled>SELECT SEGMENT</option>
                    {Object.entries(categories).map(([group, items]) => (
                      <optgroup key={group} label={group.toUpperCase()} className="bg-black">
                        {(items as string[]).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-1 italic flex items-center gap-2">
                  <ListFilter size={10} className="text-[#00e5ff]" /> Manifest
                </label>
                <textarea 
                  required
                  rows={3}
                  className="w-full bg-black/40 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-300 outline-none focus:border-[#00e5ff]/40 transition-all resize-none text-xs italic"
                  placeholder="Document traffic integrity..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-1 italic">Origin URL</label>
                  <input required type="url" className="w-full bg-black/40 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-500 font-mono text-[9px] outline-none focus:border-[#00e5ff]/40" placeholder="HTTPS://HQ.COM" value={formData.businessUrl} onChange={e => setFormData({...formData, businessUrl: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-1 italic">Terminal URL</label>
                  <input required type="url" className="w-full bg-black/40 border border-neutral-800 rounded-lg px-3 py-2 text-neutral-500 font-mono text-[9px] outline-none focus:border-[#00e5ff]/40" placeholder="HTTPS://ADS.COM" value={formData.targetLeadUrl} onChange={e => setFormData({...formData, targetLeadUrl: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="space-y-1 w-32">
                <label className="text-[8px] font-black text-neutral-700 uppercase tracking-widest px-1 italic">Floor ($)</label>
                <div className="relative">
                  <input type="number" className="w-full bg-black border border-neutral-800 rounded-lg px-7 py-2 text-xl font-black text-white outline-none focus:border-[#00e5ff]/40 font-tactical" value={formData.basePrice} onChange={e => setFormData({...formData, basePrice: parseInt(e.target.value)})} />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-700 font-black text-xs font-tactical">$</span>
                </div>
              </div>
              <div className="flex-1 border-l border-neutral-800 pl-4">
                 <p className="text-[8px] text-neutral-600 uppercase tracking-widest leading-relaxed">System will audit node for integrity before live broadcast.</p>
              </div>
            </div>
          </div>

          {/* Diagnostic Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-2xl p-5 h-full flex flex-col shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[10px] font-black text-white italic uppercase tracking-widest flex items-center gap-2">
                  <Activity size={12} className="text-[#00e5ff]" /> Diagnostic
                </h3>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
                 <Radar size={60} className="text-neutral-900 mb-4 animate-spin-slow" strokeWidth={1} />
                 <span className="text-[8px] text-neutral-700 font-black uppercase tracking-widest">Awaiting Sync</span>
              </div>

              <div className="space-y-4 mt-auto pt-4 border-t border-neutral-900">
                <button 
                  type="submit"
                  className="w-full bg-white text-black rounded-xl py-3 flex flex-col items-center justify-center transition-all border-b-4 border-neutral-300 active:translate-y-0.5 active:border-b-0"
                >
                  <span className="text-lg font-black italic tracking-widest uppercase font-tactical">Broadcast</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LeadSubmissionForm;
