
import React, { useState, useEffect } from 'react';
import { Lead, AIInsight } from '../types.ts';
import { analyzeLeadQuality } from '../services/geminiService.ts';
import { apiService, NICHE_PROTOCOLS } from '../services/apiService.ts';
import { 
  Sparkles, 
  Loader2, 
  Globe, 
  DollarSign, 
  Target, 
  ChevronDown, 
  ListFilter, 
  Cpu,
  Zap,
  Activity,
  Database,
  ArrowRight,
  Radar
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
    buyNowPrice: 150,
    countryCode: 'US',
    region: 'Remote'
  });
  const [categories, setCategories] = useState<Record<string, string[]>>({});
  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await apiService.getCategories();
        setCategories(cats as any);
      } catch (error) {
        setCategories(NICHE_PROTOCOLS);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleAnalyze = async () => {
    if (!formData.businessUrl || !formData.targetLeadUrl) return;
    setIsAnalyzing(true);
    soundService.playClick(true);
    const result = await analyzeLeadQuality(formData.businessUrl, formData.targetLeadUrl);
    setAiInsight(result);
    setIsAnalyzing(false);
    soundService.playClick(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      alert("ERROR: SELECT LEAD NICHE");
      return;
    }
    soundService.playClick(true);
    onSubmit({
      ...formData,
      qualityScore: aiInsight?.relevance || 0
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-10 pb-32 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 border-b border-[#1A1A1A] pb-12">
        <div>
          <h2 className="text-3xl md:text-5xl font-futuristic font-black text-white italic uppercase tracking-tighter leading-none">
            LEAD <span className="text-[#FACC15]">PROVISION</span>
          </h2>
          <p className="text-[10px] md:text-[12px] text-neutral-600 font-bold uppercase tracking-[0.6em] mt-4 italic">STABLE_CONNECTION // AI_AUDIT_ENABLED</p>
        </div>
        
        <div className="flex items-center gap-6 bg-black border border-[#1A1A1A] rounded-3xl p-6 shadow-2xl">
          <div className="w-12 h-12 bg-[#1A1A1A] rounded-2xl flex items-center justify-center text-[#FACC15]">
            <Cpu size={28} />
          </div>
          <div>
            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-1">SYSTEM_HEALTH</span>
            <span className="text-2xl font-tactical text-white tracking-widest leading-none">99.8%_ACTIVE</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-[#1A1A1A] rounded-[2.5rem] border border-white/5 p-10 shadow-2xl space-y-10 relative overflow-hidden group">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] px-2 italic flex items-center gap-2">
                  <Zap size={14} className="text-[#FACC15]" /> Campaign Node
                </label>
                <input 
                  required
                  className="w-full bg-black border border-[#1A1A1A] rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-[#FACC15]/50 transition-all placeholder:text-neutral-800 text-lg"
                  placeholder="e.g. SOLAR_INBOUND_V4"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-3 relative">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] px-2 italic flex items-center gap-2">
                  <Target size={14} className="text-[#FACC15]" /> Sector Protocol
                </label>
                <div className="relative">
                  <select 
                    required
                    className="w-full bg-black border border-[#1A1A1A] rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-[#FACC15]/50 transition-all appearance-none cursor-pointer uppercase text-sm tracking-widest"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">SELECT SEGMENT</option>
                    {Object.entries(categories).map(([group, items]) => (
                      <optgroup key={group} label={group.toUpperCase()} className="bg-black text-[#FACC15]">
                        {(items as string[]).map(cat => (
                          <option key={cat} value={cat} className="text-white">{cat}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-neutral-700 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] px-2 italic flex items-center gap-2">
                <ListFilter size={14} className="text-[#FACC15]" /> Data Manifest
              </label>
              <textarea 
                required
                rows={4}
                className="w-full bg-black border border-[#1A1A1A] rounded-[2rem] px-8 py-6 text-neutral-300 outline-none focus:border-[#FACC15]/50 transition-all resize-none italic text-lg"
                placeholder="Detail verification layers and intent signals..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] px-2 italic">Source URL</label>
                <input 
                  required
                  type="url"
                  className="w-full bg-black border border-[#1A1A1A] rounded-2xl px-6 py-5 text-[#FACC15] font-mono text-sm outline-none focus:border-[#FACC15]/50 transition-all"
                  placeholder="https://origin-node.com"
                  value={formData.businessUrl}
                  onChange={e => setFormData({...formData, businessUrl: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] px-2 italic">Target API</label>
                <input 
                  required
                  type="url"
                  className="w-full bg-black border border-[#1A1A1A] rounded-2xl px-6 py-5 text-[#FACC15] font-mono text-sm outline-none focus:border-[#FACC15]/50 transition-all"
                  placeholder="https://delivery-endpoint.net"
                  value={formData.targetLeadUrl}
                  onChange={e => setFormData({...formData, targetLeadUrl: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#1A1A1A] border border-white/5 rounded-[2.5rem] p-10 grid grid-cols-1 md:grid-cols-2 gap-10 shadow-xl">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] px-2 italic flex items-center gap-2">
                <DollarSign size={14} className="text-[#FACC15]" /> Floor Price ($/EA)
              </label>
              <div className="relative">
                <input 
                  required
                  type="number"
                  className="w-full bg-black border border-[#1A1A1A] rounded-2xl px-12 py-6 text-4xl font-tactical text-white outline-none focus:border-[#FACC15] transition-all"
                  value={formData.basePrice}
                  onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value) || 0})}
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-800 font-black text-2xl italic font-tactical">$</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.4em] px-2 italic flex items-center gap-2">
                <Zap size={14} className="text-[#FACC15]" /> Buy Now Price ($/EA)
              </label>
              <div className="relative">
                <input 
                  required
                  type="number"
                  className="w-full bg-black border border-[#1A1A1A] rounded-2xl px-12 py-6 text-4xl font-tactical text-[#FACC15] outline-none focus:border-[#FACC15] transition-all"
                  value={formData.buyNowPrice}
                  onChange={e => setFormData({...formData, buyNowPrice: parseFloat(e.target.value) || 0})}
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-800 font-black text-2xl italic font-tactical">$</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-10">
          <div className="bg-[#1A1A1A] p-10 rounded-[3rem] border border-white/5 h-full flex flex-col shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-6 mb-10">
               <h4 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.4em] flex items-center gap-3">
                  <Activity size={16} className="text-[#FACC15]" /> Audit Engine
               </h4>
               <div className="w-2 h-2 bg-[#FACC15] rounded-full animate-pulse shadow-[0_0_12px_#FACC15]" />
            </div>

            <div className="flex-1 space-y-10">
              {aiInsight ? (
                <div className="space-y-10 animate-in zoom-in-95 duration-500">
                  <div className="flex items-center gap-6 p-6 bg-black rounded-[2rem] border border-[#FACC15]/20 shadow-xl relative overflow-hidden">
                    <div className="w-16 h-16 rounded-2xl border border-[#FACC15]/40 flex items-center justify-center text-glow-brand">
                      <span className="text-3xl font-tactical text-[#FACC15]">{aiInsight.relevance}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] block mb-1">LEAD_INTEGRITY</span>
                      <span className="text-[11px] font-black text-[#FACC15] uppercase tracking-widest">VERIFIED_PROTOCOL</span>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-black/40 p-6 rounded-2xl border border-[#1A1A1A] group hover:border-[#FACC15]/30 transition-all">
                      <span className="text-[10px] text-[#FACC15] font-black uppercase tracking-[0.4em] block mb-3">CONVERSION_NODE</span>
                      <p className="text-neutral-400 text-[11px] leading-relaxed font-bold uppercase tracking-tight">{aiInsight.conversionPotential}</p>
                    </div>
                    
                    <div className="bg-black/40 p-6 rounded-2xl border border-[#1A1A1A] group hover:border-[#FACC15]/30 transition-all">
                      <span className="text-[10px] text-[#FACC15] font-black uppercase tracking-[0.4em] block mb-3">CPL_INSIGHT</span>
                      <p className="text-neutral-400 text-[11px] leading-relaxed font-bold uppercase tracking-tight">{aiInsight.marketTrend}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-30">
                  <Radar size={80} className="text-[#FACC15] animate-pulse" />
                  <div>
                    <p className="text-[11px] font-black text-neutral-600 uppercase tracking-[0.5em]">AWAITING_SCAN</p>
                    <p className="text-[9px] text-neutral-800 font-bold mt-2 uppercase">Input URLs for integrity audit</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-10 space-y-6 pt-10 border-t border-[#1A1A1A]">
              <button 
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !formData.businessUrl || !formData.targetLeadUrl}
                className="w-full bg-[#1A1A1A] hover:bg-black border border-white/10 text-white py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all disabled:opacity-20 shadow-2xl"
              >
                {isAnalyzing ? <Loader2 className="animate-spin text-[#FACC15]" size={20} /> : <Radar className="text-[#FACC15]" size={20} />}
                {isAnalyzing ? 'AUDITING...' : 'VALIDATE_NODE'}
              </button>

              <button 
                type="submit"
                className="w-full bg-[#FACC15] text-black py-6 rounded-[2rem] font-black text-2xl hover:bg-white transition-all transform active:scale-[0.98] shadow-[0_20px_50px_-10px_rgba(250,204,21,0.4)] border-b-8 border-yellow-700 active:border-b-0 active:translate-y-2 flex items-center justify-center gap-6 font-tactical tracking-widest italic"
              >
                BROADCAST_ASSET <ArrowRight size={28} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LeadSubmissionForm;
