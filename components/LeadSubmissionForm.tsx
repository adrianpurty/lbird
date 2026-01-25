
import React, { useState, useEffect } from 'react';
import { Lead, AIInsight } from '../types.ts';
import { analyzeLeadQuality } from '../services/geminiService.ts';
import { apiService, NICHE_PROTOCOLS } from '../services/apiService.ts';
import { 
  Sparkles, 
  Loader2, 
  Link as LinkIcon, 
  Globe, 
  DollarSign, 
  Target, 
  ChevronDown, 
  ListFilter, 
  MapPin,
  Cpu,
  Zap,
  Activity,
  Database,
  ArrowRight,
  ShieldCheck,
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
      alert("CRITICAL: SELECT TARGET NICHE PROTOCOL.");
      return;
    }
    soundService.playClick(true);
    onSubmit({
      ...formData,
      qualityScore: aiInsight?.relevance || 0
    });
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 pb-32 animate-in fade-in duration-700">
      {/* LANDSCAPE HEADER - HUD STYLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b-2 border-neutral-900 pb-8 md:pb-12">
        <div className="relative">
          <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-4 h-12 md:h-24 bg-[#facc15] rounded-full blur-xl opacity-20" />
          <h2 className="text-4xl sm:text-7xl lg:text-8xl font-futuristic font-black text-white italic uppercase tracking-tighter leading-none flex flex-wrap items-center gap-4 md:gap-10 text-glow">
            ASSET <span className="text-neutral-600">PROVISION</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4 md:mt-6">
            <div className="px-3 md:px-4 py-1.5 bg-[#facc15]/10 border border-[#facc15]/30 rounded-full text-[8px] md:text-[10px] font-black text-[#facc15] uppercase tracking-[0.3em] md:tracking-[0.4em]">PROVISIONING_NODE_v4</div>
            <span className="text-[10px] md:text-[12px] text-neutral-600 font-bold uppercase tracking-[0.4em] md:tracking-[0.6em] italic shrink-0">STABLE_CONNECTION // 12ms</span>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
          <div className="flex-1 md:flex-none p-4 md:p-6 bg-[#0f0f0f] border-2 border-neutral-900 rounded-[1.5rem] md:rounded-3xl shadow-2xl flex items-center gap-4 md:gap-6 group hover:border-[#facc15]/50 transition-all cursor-default">
            <div className="w-10 md:w-14 h-10 md:h-14 bg-[#facc15]/10 rounded-xl md:rounded-2xl flex items-center justify-center text-[#facc15] group-hover:scale-110 transition-transform shrink-0">
              <Cpu size={24} className="md:w-7 md:h-7" />
            </div>
            <div>
              <span className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest block mb-1">SYSTEM_RELIABILITY</span>
              <span className="text-xl md:text-3xl font-tactical text-white tracking-widest leading-none text-glow">99.8%</span>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        {/* LEFT COLUMN: PRIMARY IDENTITY NODES (Col 8) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#0c0c0c]/90 rounded-[2rem] md:rounded-[3rem] border-2 border-neutral-900 p-6 md:p-10 shadow-2xl relative overflow-hidden scanline-effect group">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              <Database size={120} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-6 md:mb-10">
              <div className="space-y-3">
                <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] md:tracking-[0.4em] px-2 italic flex items-center gap-2">
                  <Zap size={14} className="text-[#facc15]" /> CAMPAIGN_NODE
                </label>
                <input 
                  required
                  className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-4 md:px-6 py-4 md:py-5 text-neutral-200 font-bold outline-none focus:border-[#facc15]/60 transition-all placeholder:text-neutral-800 text-base md:text-lg tracking-tight"
                  placeholder="e.g. HIGH-TICKET SOLAR_IA_INBOUND"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="space-y-3 relative">
                <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] md:tracking-[0.4em] px-2 italic flex items-center gap-2">
                  <Target size={14} className="text-[#facc15]" /> SECTOR_PROTOCOL
                </label>
                <div className="relative group">
                  <select 
                    required
                    disabled={isLoadingCategories}
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-4 md:px-6 py-4 md:py-5 text-neutral-200 font-bold outline-none focus:border-[#facc15]/60 transition-all appearance-none cursor-pointer disabled:opacity-50 text-base md:text-lg tracking-tight uppercase"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="" disabled className="text-neutral-800">SELECT SEGMENT</option>
                    {Object.entries(categories).map(([group, items]) => (
                      <optgroup key={group} label={group.toUpperCase()} className="bg-[#0a0a0a] text-[#facc15] font-black uppercase text-[10px] tracking-widest italic py-4">
                        {(items as string[]).map(cat => (
                          <option key={cat} value={cat} className="bg-black text-neutral-400 py-2 normal-case font-bold italic not-italic text-sm">
                            {cat}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-[#facc15] transition-colors">
                    <ChevronDown size={24} className="text-neutral-700" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-6 md:mb-10">
              <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] md:tracking-[0.4em] px-2 italic flex items-center gap-2">
                <ListFilter size={14} className="text-[#facc15]" /> MANIFEST_DESCRIPTION
              </label>
              <textarea 
                required
                rows={4}
                className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl md:rounded-3xl px-6 md:px-8 py-4 md:py-6 text-neutral-300 outline-none focus:border-[#facc15]/60 transition-all resize-none italic placeholder:not-italic placeholder:text-neutral-800 text-base md:text-lg leading-relaxed font-rajdhani"
                placeholder="Document traffic integrity, intent signals, and verification layers..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-3">
                <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] md:tracking-[0.4em] px-2 italic flex items-center gap-2">
                  <Globe size={14} className="text-[#facc15]" /> IDENTITY_ORIGIN_URL
                </label>
                <input 
                  required
                  type="url"
                  className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-4 md:px-6 py-4 md:py-5 text-neutral-400 font-bold outline-none focus:border-[#facc15]/60 transition-all placeholder:text-neutral-800 font-mono text-xs md:text-sm"
                  placeholder="https://hq.provision.com"
                  value={formData.businessUrl}
                  onChange={e => setFormData({...formData, businessUrl: e.target.value})}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] md:tracking-[0.4em] px-2 italic flex items-center gap-2">
                  <Target size={14} className="text-[#facc15]" /> TRAFFIC_TERMINAL_URL
                </label>
                <input 
                  required
                  type="url"
                  className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-4 md:px-6 py-4 md:py-5 text-neutral-400 font-bold outline-none focus:border-[#facc15]/60 transition-all placeholder:text-neutral-800 font-mono text-xs md:text-sm"
                  placeholder="AD_NODE_DESTINATION"
                  value={formData.targetLeadUrl}
                  onChange={e => setFormData({...formData, targetLeadUrl: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#0f0f0f] border-2 border-neutral-900 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-6 md:gap-8 shadow-xl">
            <div className="w-full sm:w-1/3 space-y-3">
              <label className="text-[9px] md:text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] md:tracking-[0.4em] px-2 italic flex items-center gap-2">
                <DollarSign size={14} className="text-[#facc15]" /> NODE_VALUATION ($)
              </label>
              <div className="relative">
                <input 
                  required
                  type="number"
                  className="w-full bg-black border-2 border-neutral-800 rounded-xl md:rounded-[2rem] px-10 md:px-14 py-4 md:py-6 text-2xl md:text-4xl font-tactical text-white outline-none focus:border-[#facc15] transition-all"
                  placeholder="50"
                  value={formData.basePrice}
                  onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value) || 0})}
                />
                <span className="absolute left-4 md:left-7 top-1/2 -translate-y-1/2 text-neutral-700 font-black text-xl md:text-2xl italic font-tactical">$</span>
              </div>
            </div>
            
            <div className="flex-1 pt-0 sm:pt-8">
              <button 
                type="button"
                onClick={handleAnalyze}
                disabled={isAnalyzing || !formData.businessUrl || !formData.targetLeadUrl}
                className="w-full bg-[#1a1a1a] hover:bg-black border-4 border-neutral-800 text-neutral-100 py-5 md:py-7 rounded-xl md:rounded-[2.5rem] font-black text-[10px] md:text-[12px] uppercase tracking-[0.4em] md:tracking-[0.6em] flex items-center justify-center gap-4 md:gap-6 transition-all disabled:opacity-20 disabled:cursor-not-allowed group active:scale-[0.98] shadow-2xl relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#facc15]/0 via-[#facc15]/5 to-[#facc15]/0 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-full group-hover:translate-x-full duration-1000" />
                {isAnalyzing ? (
                  <Loader2 className="animate-spin text-[#facc15]" size={20} md:size={24} />
                ) : (
                  <Radar className="text-[#facc15] group-hover:scale-125 transition-transform" size={20} md:size={24} />
                )}
                {isAnalyzing ? 'RUNNING AI AUDIT...' : 'VALIDATE_TRAFFIC_NODE'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DIAGNOSTIC & TELEMETRY (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0f0f0f] p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-2 border-neutral-900 h-full flex flex-col shadow-2xl relative overflow-hidden">
            <div className="flex justify-between items-center border-b border-neutral-800/40 pb-4 md:pb-6 mb-6 md:mb-8">
               <h4 className="text-[10px] md:text-[11px] font-black text-neutral-500 uppercase tracking-[0.3em] md:tracking-[0.4em] flex items-center gap-3 font-futuristic">
                  <Activity size={16} className="text-[#facc15]" /> DIAGNOSTIC_NODE
               </h4>
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_#10b981]" />
            </div>

            <div className="flex-1 space-y-6 md:space-y-8">
              {aiInsight ? (
                <div className="space-y-6 md:space-y-8 animate-in zoom-in-95 duration-500">
                  <div className="flex items-center gap-4 md:gap-6 p-4 md:p-6 bg-black/40 rounded-2xl md:rounded-3xl border-2 border-[#facc15]/20 shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#facc15] shadow-[2px_0_10px_#facc15]" />
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl border-2 border-[#facc15]/40 flex items-center justify-center text-glow-neon shrink-0">
                      <span className="text-xl md:text-3xl font-tactical text-[#facc15]">{aiInsight.relevance}%</span>
                    </div>
                    <div>
                      <span className="text-[8px] md:text-[9px] font-black text-neutral-600 uppercase tracking-[0.3em] md:tracking-[0.4em] block mb-1">Q_INTEGRITY</span>
                      <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">AUTHORIZED_SYNC</span>
                    </div>
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    <div className="bg-black/40 p-4 md:p-6 rounded-2xl border border-neutral-800/60 group hover:border-[#facc15]/20 transition-all">
                      <span className="text-[9px] md:text-[10px] text-[#facc15] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] block mb-2 md:mb-3">CONVERSION_MATRIX</span>
                      <p className="text-neutral-400 text-[10px] md:text-[11px] leading-relaxed font-bold uppercase tracking-tight font-rajdhani">{aiInsight.conversionPotential}</p>
                    </div>
                    
                    <div className="bg-black/40 p-4 md:p-6 rounded-2xl border border-neutral-800/60 group hover:border-[#facc15]/20 transition-all">
                      <span className="text-[9px] md:text-[10px] text-[#facc15] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] block mb-2 md:mb-3">MARKET_FORECAST</span>
                      <p className="text-neutral-400 text-[10px] md:text-[11px] leading-relaxed font-bold uppercase tracking-tight font-rajdhani">{aiInsight.marketTrend}</p>
                    </div>
                  </div>

                  <div className="p-4 md:p-6 bg-neutral-900/40 rounded-2xl border border-neutral-800 italic">
                    <p className="text-neutral-500 text-[9px] md:text-[10px] font-medium leading-relaxed uppercase tracking-widest md:tracking-[0.1em]">// {aiInsight.summary}</p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 md:space-y-6 opacity-30">
                  <Radar size={60} className="md:w-20 md:h-20 text-neutral-800 animate-pulse" />
                  <div>
                    <p className="text-[9px] md:text-[11px] font-black text-neutral-600 uppercase tracking-[0.4em] md:tracking-[0.5em]">AWAITING_INPUT_SCAN</p>
                    <p className="text-[8px] md:text-[9px] text-neutral-800 font-bold mt-2 uppercase">PROVIDE URLS TO INITIALIZE AUDIT</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 md:mt-8 space-y-4 md:space-y-6 pt-6 md:pt-8 border-t border-neutral-800/40">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] md:text-[9px] font-black text-neutral-700 uppercase tracking-widest px-1">REGION_ID</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 text-neutral-700" size={12} md:size={14} />
                    <input 
                      className="w-full bg-black/40 border border-neutral-800 rounded-lg md:rounded-xl pl-8 md:pl-10 pr-3 md:pr-4 py-2 md:py-3 text-neutral-400 font-bold text-[9px] md:text-[10px] uppercase outline-none focus:border-[#facc15]/40"
                      placeholder="e.g. US_NW"
                      value={formData.region}
                      onChange={e => setFormData({...formData, region: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] md:text-[9px] font-black text-neutral-700 uppercase tracking-widest px-1">COUNTRY_CODE</label>
                  <input 
                    className="w-full bg-black/40 border border-neutral-800 rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-neutral-400 font-bold text-[9px] md:text-[10px] uppercase outline-none focus:border-[#facc15]/40 text-center"
                    placeholder="US"
                    maxLength={2}
                    value={formData.countryCode}
                    onChange={e => setFormData({...formData, countryCode: e.target.value.toUpperCase()})}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#facc15] text-black py-4 md:py-6 rounded-xl md:rounded-[2rem] font-black text-xl md:text-2xl hover:bg-yellow-500 transition-all transform hover:-translate-y-1 shadow-[0_15px_40px_-10px_rgba(250,204,21,0.4)] border-b-[6px] md:border-b-[8px] border-yellow-700 active:scale-[0.98] active:translate-y-0 flex items-center justify-center gap-4 md:gap-6 font-tactical tracking-widest italic"
              >
                BROADCAST_ASSET <ArrowRight size={24} md:size={28} />
              </button>
            </div>
          </div>
        </div>
      </form>
      
      {/* FOOTER - INTEGRITY DISCLOSURE */}
      <div className="bg-[#0f0f0f] border-2 border-neutral-900 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] flex items-start gap-4 md:gap-6 shadow-xl max-w-4xl mx-auto mt-8 md:mt-12">
        <ShieldCheck className="text-emerald-500 shrink-0" size={20} md:size={24} />
        <div>
           <h4 className="text-[9px] md:text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1">PROVISIONING_INTEGRITY_HANDSHAKE</h4>
           <p className="text-[8px] md:text-[10px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
             By broadcasting this asset, you certify that the traffic nodes are verified and the manifest is compliant with marketplace transparency protocols. High-integrity assets receive priority sync in the global distribution waterfall.
           </p>
        </div>
      </div>
    </div>
  );
};

export default LeadSubmissionForm;
