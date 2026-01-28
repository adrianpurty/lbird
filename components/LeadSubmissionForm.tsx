import React, { useState, useEffect } from 'react';
import { Lead } from '../types.ts';
import { apiService, NICHE_PROTOCOLS } from '../services/apiService.ts';
import { 
  Zap, 
  Target, 
  Globe, 
  Cpu, 
  Activity, 
  Database, 
  ArrowRight, 
  ShieldCheck, 
  Radar,
  ListFilter,
  DollarSign,
  MapPin,
  RefreshCw
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.category) {
      alert("CRITICAL: SELECT TARGET NICHE PROTOCOL.");
      return;
    }
    soundService.playClick(true);
    onSubmit(formData);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-10 pb-32 animate-in fade-in duration-700 font-rajdhani">
      
      {/* HEADER HUD */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-neutral-900/60 pb-10">
        <div className="space-y-6">
          <h1 className="text-6xl font-futuristic italic font-black uppercase tracking-tighter">
            ASSET <span className="text-transparent" style={{ WebkitTextStroke: '2px #ffffff', opacity: 0.3 }}>PROVISION</span>
          </h1>
          <div className="flex items-center gap-6">
            <div className="px-4 py-1.5 bg-[#00e5ff]/10 border border-[#00e5ff]/40 rounded-lg shadow-[0_0_15px_rgba(0,229,255,0.1)]">
              <span className="text-[10px] font-black text-[#00e5ff] uppercase tracking-[0.2em]">PROVISIONING_NODE_V4</span>
            </div>
            <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-[0.3em] italic">STABLE_CONNECTION // 12MS</span>
          </div>
        </div>

        {/* SYSTEM RELIABILITY WIDGET */}
        <div className="bg-[#0c0c0c] border-2 border-neutral-800 p-4 md:p-6 rounded-[2rem] flex items-center gap-6 shadow-2xl group hover:border-[#00e5ff]/30 transition-all cursor-default">
          <div className="w-12 h-12 bg-[#00e5ff]/10 rounded-xl flex items-center justify-center text-[#00e5ff] shrink-0 group-hover:scale-110 transition-transform">
            <Cpu size={24} />
          </div>
          <div>
            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-1">SYSTEM_RELIABILITY</span>
            <span className="text-3xl font-tactical text-white tracking-widest leading-none">99.8%</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* LEFT COLUMN: DATA INPUT */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <Database size={120} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2 flex items-center gap-3">
                    <Zap size={14} className="text-[#00e5ff]" /> CAMPAIGN_NODE
                  </label>
                  <input 
                    required
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-5 text-neutral-200 font-bold outline-none focus:border-[#00e5ff]/60 transition-all placeholder:text-neutral-900"
                    placeholder="E.G. HIGH-TICKET SOLAR_IA_INBOUND"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2 flex items-center gap-3">
                    <Target size={14} className="text-[#00e5ff]" /> SECTOR_PROTOCOL
                  </label>
                  <select 
                    required
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-2xl px-6 py-5 text-white font-bold outline-none focus:border-[#00e5ff]/60 transition-all appearance-none cursor-pointer uppercase text-sm tracking-widest"
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

              <div className="space-y-4 mb-10">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2 flex items-center gap-3">
                  <ListFilter size={14} className="text-[#00e5ff]" /> MANIFEST_DESCRIPTION
                </label>
                <textarea 
                  required
                  rows={5}
                  className="w-full bg-black/40 border-2 border-neutral-800 rounded-3xl px-8 py-6 text-neutral-300 outline-none focus:border-[#00e5ff]/60 transition-all resize-none italic placeholder:text-neutral-900 text-lg leading-relaxed"
                  placeholder="Document traffic integrity, intent signals, and verification layers..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2 flex items-center gap-3">
                    <Globe size={14} className="text-[#00e5ff]" /> IDENTITY_ORIGIN_URL
                  </label>
                  <input 
                    required
                    type="url"
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-xl px-6 py-4 text-neutral-400 font-mono text-xs outline-none focus:border-[#00e5ff]/60 transition-all"
                    placeholder="HTTPS://HQ.PROVISION.COM"
                    value={formData.businessUrl}
                    onChange={e => setFormData({...formData, businessUrl: e.target.value})}
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-neutral-700 uppercase tracking-widest px-2 flex items-center gap-3">
                    <Target size={14} className="text-[#00e5ff]" /> TRAFFIC_TERMINAL_URL
                  </label>
                  <input 
                    required
                    type="url"
                    className="w-full bg-black/40 border-2 border-neutral-800 rounded-xl px-6 py-4 text-neutral-400 font-mono text-xs outline-none focus:border-[#00e5ff]/60 transition-all"
                    placeholder="AD_NODE_DESTINATION"
                    value={formData.targetLeadUrl}
                    onChange={e => setFormData({...formData, targetLeadUrl: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* VALUATION ROW */}
            <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-10 shadow-xl">
              <div className="space-y-4 w-full md:w-80">
                <label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-2 flex items-center gap-3">
                  <DollarSign size={16} className="text-[#00e5ff]" /> NODE_VALUATION ($)
                </label>
                <div className="relative">
                  <input 
                    type="number"
                    className="w-full bg-black border-2 border-neutral-800 rounded-2xl px-12 py-5 text-4xl font-black text-white outline-none focus:border-[#00e5ff] transition-all font-tactical tracking-widest"
                    value={formData.basePrice}
                    onChange={e => setFormData({...formData, basePrice: parseInt(e.target.value)})}
                  />
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700 font-black text-2xl italic font-tactical">$</span>
                </div>
              </div>
              
              <div className="flex-1 flex items-center justify-center border-2 border-neutral-900 border-dashed rounded-[2rem] p-10 group cursor-pointer hover:border-[#00e5ff]/20 transition-colors">
                <div className="flex items-center gap-4 text-neutral-700 group-hover:text-neutral-500 transition-colors">
                  <ShieldCheck size={20} />
                  <span className="text-[11px] font-black uppercase tracking-[0.3em]">VALIDATE_TRAFFIC_NODE</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: DIAGNOSTICS */}
          <div className="lg:col-span-4 space-y-8 h-full">
            <div className="bg-[#0c0c0c] border border-neutral-800/40 rounded-[3rem] p-10 h-full flex flex-col shadow-2xl relative overflow-hidden group">
              <div className="flex items-center gap-4 mb-16">
                 <Activity size={18} className="text-[#00e5ff]" />
                 <h3 className="text-sm font-black text-white italic uppercase tracking-[0.3em]">DIAGNOSTIC_NODE</h3>
                 <div className="ml-auto w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]" />
              </div>

              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-20">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#00e5ff]/5 rounded-full blur-3xl animate-pulse" />
                  <Radar size={120} className="text-neutral-900 relative z-10 animate-spin-slow" strokeWidth={0.5} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black text-neutral-700 uppercase tracking-[0.4em]">AWAITING_INPUT_SCAN</h4>
                  <p className="text-[8px] text-neutral-800 font-black uppercase tracking-widest">PROVIDE URLS TO INITIALIZE AUDIT</p>
                </div>
              </div>

              <div className="space-y-10 mt-auto">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">REGION_ID</span>
                    <div className="bg-black/60 border border-neutral-800 p-4 rounded-xl flex items-center gap-3">
                      <MapPin size={12} className="text-neutral-700" />
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">REMOTE</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest block mb-1">COUNTRY_CODE</span>
                    <div className="bg-black/60 border border-neutral-800 p-4 rounded-xl text-center">
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">US</span>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-black text-white rounded-[2rem] py-8 md:py-10 flex flex-col items-center justify-center gap-4 transition-all group/btn border-b-[12px] border-neutral-950 shadow-2xl hover:bg-neutral-900 active:translate-y-1 active:border-b-4 overflow-hidden relative"
                >
                  <div className="flex items-center gap-6 relative z-10">
                    <span className="text-3xl font-black italic tracking-widest uppercase font-tactical">BROADCAST_ASSET</span>
                    <ArrowRight size={32} className="group-hover/btn:translate-x-2 transition-transform" />
                  </div>
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* INTEGRITY FOOTER */}
        <div className="bg-[#0f0f0f] border-2 border-neutral-900 p-8 rounded-[3rem] shadow-xl flex items-start gap-8 max-w-5xl mx-auto group hover:border-[#00e5ff]/20 transition-all">
          <div className="w-14 h-14 bg-[#00e5ff]/5 border border-[#00e5ff]/20 rounded-2xl flex items-center justify-center text-[#00e5ff] shrink-0 group-hover:scale-110 transition-transform">
            <ShieldCheck size={28} />
          </div>
          <div>
             <h4 className="text-xs font-black text-white italic uppercase tracking-[0.3em] mb-3 font-futuristic">PROVISIONING_INTEGRITY_HANDSHAKE</h4>
             <p className="text-[9px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
               By broadcasting this asset, you certify that the traffic nodes are verified and the manifest is compliant with marketplace transparency protocols. High-integrity assets receive priority sync in the global distribution waterfall.
             </p>
          </div>
        </div>
      </form>

      <style>{`
        .animate-spin-slow {
          animation: spin 15s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
};

export default LeadSubmissionForm;