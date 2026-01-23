import React, { useState, useEffect } from 'react';
import { Lead, AIInsight } from '../types.ts';
import { analyzeLeadQuality } from '../services/geminiService.ts';
import { apiService } from '../services/apiService.ts';
import { Sparkles, Loader2, Link as LinkIcon, Globe, DollarSign, Target, ChevronDown, ListFilter } from 'lucide-react';

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
    basePrice: 50
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
        console.error("Failed to fetch categories:", error);
        setCategories({});
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleAnalyze = async () => {
    if (!formData.businessUrl || !formData.targetLeadUrl) return;
    setIsAnalyzing(true);
    const result = await analyzeLeadQuality(formData.businessUrl, formData.targetLeadUrl);
    setAiInsight(result);
    setIsAnalyzing(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      alert("Please select a target niche protocol.");
      return;
    }
    onSubmit({
      ...formData,
      qualityScore: aiInsight?.relevance || 0
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-[#121212] p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-neutral-900 shadow-2xl space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#facc15]/5 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <div className="flex items-center gap-4 border-b border-neutral-800 pb-6 mb-2">
           <div className="w-12 h-12 bg-[#facc15]/10 rounded-2xl flex items-center justify-center border border-[#facc15]/30">
              <ListFilter className="text-[#facc15]" size={24} />
           </div>
           <div>
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter italic">Asset Provisioning</h2>
              <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest mt-0.5">Initialize Global Ledger Entry</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Campaign Node Name</label>
            <input 
              required
              className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#facc15] transition-all placeholder:text-neutral-800"
              placeholder="e.g. Premium Solar Inbound SoCal"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="space-y-2 relative">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Target Niche Protocol</label>
            <div className="relative group">
              <select 
                required
                disabled={isLoadingCategories}
                className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#facc15] transition-all appearance-none cursor-pointer disabled:opacity-50"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="" disabled className="text-neutral-800">Select Industry Niche</option>
                {Object.entries(categories).map(([group, items]) => (
                  <optgroup key={group} label={group} className="bg-[#0a0a0a] text-[#facc15] font-black uppercase text-[10px] tracking-widest italic py-4">
                    {/* Fixed: Cast items to string[] to resolve "Property map does not exist on type unknown" error */}
                    {(items as string[]).map(cat => (
                      <option key={cat} value={cat} className="bg-black text-white py-2 normal-case font-bold italic not-italic text-sm">
                        {cat}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-[#facc15] transition-colors">
                <ChevronDown size={20} className="text-neutral-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Inventory Intelligence (Description)</label>
          <textarea 
            required
            rows={4}
            className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#facc15] transition-all resize-none italic placeholder:not-italic placeholder:text-neutral-800"
            placeholder="Describe lead source, intent triggers, and verification layers..."
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1 flex items-center gap-2">
              <Globe size={14} className="text-[#facc15]" /> Identity HQ (Business URL)
            </label>
            <input 
              required
              type="url"
              className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#facc15] transition-all placeholder:text-neutral-800"
              placeholder="https://yourleads-hq.com"
              value={formData.businessUrl}
              onChange={e => setFormData({...formData, businessUrl: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1 flex items-center gap-2">
              <Target size={14} className="text-[#facc15]" /> Traffic Node (Landing/Ad URL)
            </label>
            <input 
              required
              type="url"
              className="w-full bg-black border border-neutral-800 rounded-2xl px-6 py-4 text-white font-bold outline-none focus:border-[#facc15] transition-all placeholder:text-neutral-800"
              placeholder="Google Ads / FB Ads Destination"
              value={formData.targetLeadUrl}
              onChange={e => setFormData({...formData, targetLeadUrl: e.target.value})}
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
           <div className="w-full md:w-1/3 space-y-2">
            <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1 flex items-center gap-2">
              <DollarSign size={14} className="text-[#facc15]" /> Global Floor Price ($)
            </label>
            <div className="relative">
              <input 
                required
                type="number"
                className="w-full bg-black border border-neutral-800 rounded-2xl px-12 py-5 text-2xl font-black text-white outline-none focus:border-[#facc15] transition-all"
                placeholder="50"
                value={formData.basePrice}
                onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value) || 0})}
              />
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700 font-black text-xl">$</span>
            </div>
          </div>
          
          <div className="flex-1 w-full pt-6">
            <button 
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !formData.businessUrl || !formData.targetLeadUrl}
              className="w-full bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group active:scale-95"
            >
              {isAnalyzing ? (
                <Loader2 className="animate-spin text-[#facc15]" />
              ) : (
                <Sparkles className="text-[#facc15] group-hover:scale-110 transition-transform" />
              )}
              {isAnalyzing ? 'SYNCHRONIZING AI MODELS...' : 'VALIDATE TRAFFIC INTEGRITY'}
            </button>
          </div>
        </div>
      </div>

      {aiInsight && (
        <div className="bg-gradient-to-br from-[#facc15]/10 to-transparent border border-[#facc15]/20 rounded-[2rem] p-8 sm:p-10 space-y-8 animate-in zoom-in-95 duration-500">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full border-4 border-[#facc15] flex items-center justify-center shadow-[0_0_25px_rgba(250,204,21,0.3)] bg-black/50">
              <span className="text-3xl font-black text-[#facc15] italic">{aiInsight.relevance}%</span>
            </div>
            <div>
              <h4 className="text-white font-black text-2xl uppercase tracking-tighter italic leading-none">AI Market Forecast</h4>
              <p className="text-[#facc15] text-[10px] font-black uppercase tracking-[0.3em] mt-2">{aiInsight.marketTrend}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-black/60 p-6 rounded-2xl border border-neutral-900 group hover:border-[#facc15]/30 transition-colors">
              <span className="text-[9px] text-neutral-600 font-black uppercase tracking-widest block mb-2">Conversion Probability</span>
              <p className="text-white text-sm leading-relaxed">{aiInsight.conversionPotential}</p>
            </div>
            <div className="bg-black/60 p-6 rounded-2xl border border-neutral-900 group hover:border-[#facc15]/30 transition-colors">
              <span className="text-[9px] text-neutral-600 font-black uppercase tracking-widest block mb-2">Security Compliance Summary</span>
              <p className="text-white text-sm leading-relaxed">{aiInsight.summary}</p>
            </div>
          </div>
        </div>
      )}

      <button 
        type="submit"
        className="w-full bg-[#facc15] text-black py-8 rounded-[2rem] sm:rounded-[3rem] font-black text-xl sm:text-2xl hover:bg-[#eab308] transition-all transform hover:-translate-y-1 shadow-2xl shadow-yellow-400/10 border-b-[8px] border-[#ca8a04] active:scale-[0.98] flex items-center justify-center gap-4"
      >
        BROADCAST TO SALES FLOOR <ChevronDown size={32} className="-rotate-90" />
      </button>
    </form>
  );
};

export default LeadSubmissionForm;