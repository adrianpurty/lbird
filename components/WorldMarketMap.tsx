import React from 'react';
import { Lead, User } from '../types.ts';
import { Globe, MapPin, TrendingUp, FilterX, Activity } from 'lucide-react';

interface WorldMarketMapProps {
  leads: Lead[];
  users?: User[];
  onSelectCountry: (countryCode: string | null) => void;
  selectedCountry: string | null;
}

const WorldMarketMap: React.FC<WorldMarketMapProps> = ({ leads, users = [], onSelectCountry, selectedCountry }) => {
  // Group leads by countryCode
  const leadsByCountry = leads.reduce((acc, lead) => {
    if (!acc[lead.countryCode]) acc[lead.countryCode] = [];
    acc[lead.countryCode].push(lead);
    return acc;
  }, {} as Record<string, Lead[]>);

  const countriesWithLeads = Object.keys(leadsByCountry);

  // Filter users by location to show on map (mocked/simplified logic for display)
  // In a real app, we'd map "California, US" to specific coordinates.
  const activeUserHotspots = users.filter(u => u.last_active_at && (Date.now() - new Date(u.last_active_at).getTime() < 60000));

  // Accurate coordinates based on the background map projection (approximate Equirectangular)
  const countryCoords: Record<string, { x: string; y: string; name: string }> = {
    'US': { x: '18%', y: '35%', name: 'United States' },
    'TZ': { x: '58%', y: '68%', name: 'Tanzania' },
    'AE': { x: '61%', y: '46%', name: 'UAE' },
    'FR': { x: '49%', y: '30%', name: 'France' },
    'ES': { x: '47%', y: '34%', name: 'Spain' },
    'ID': { x: '82%', y: '65%', name: 'Indonesia' },
    'UK': { x: '48%', y: '26%', name: 'United Kingdom' },
    'JP': { x: '89%', y: '36%', name: 'Japan' },
  };

  return (
    <div className="relative w-full h-[500px] bg-[#020408] rounded-[3rem] border border-neutral-800/50 overflow-hidden shadow-2xl group transition-all duration-700 hover:border-[#facc15]/20">
      
      {/* BACKGROUND LAYER: Actual World Map Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop" 
          alt="World Map" 
          className="w-full h-full object-cover opacity-40 mix-blend-luminosity grayscale contrast-125 scale-105"
        />
        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020408] via-transparent to-[#020408] opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020408] via-transparent to-[#020408] opacity-80" />
      </div>

      {/* GRID LAYER: Tactical Overlay */}
      <div className="absolute inset-0 z-10 pointer-events-none opacity-20">
        <svg viewBox="0 0 1000 500" className="w-full h-full">
           <g stroke="#facc15" strokeWidth="0.5">
             {Array.from({ length: 41 }).map((_, i) => (
               <line key={`v-${i}`} x1={i * 25} y1="0" x2={i * 25} y2="500" />
             ))}
             {Array.from({ length: 21 }).map((_, i) => (
               <line key={`h-${i}`} x1="0" y1={i * 25} x2="1000" y2={i * 25} />
             ))}
           </g>
        </svg>
      </div>

      {/* DATA LAYER: Pulsing Hotspots */}
      <div className="absolute inset-0 z-20">
        {countriesWithLeads.map((code) => (
          <button
            key={code}
            onClick={() => onSelectCountry(selectedCountry === code ? null : code)}
            className={`absolute group/node transition-all duration-500 ${selectedCountry === code ? 'scale-150' : 'hover:scale-125'}`}
            style={{ left: countryCoords[code]?.x, top: countryCoords[code]?.y }}
          >
            <div className="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2">
               <div className={`absolute w-12 h-12 bg-[#facc15]/10 rounded-full ${selectedCountry === code ? 'animate-ping' : ''}`} />
               <div className={`w-4 h-4 rounded-full border-2 border-black transition-all ${selectedCountry === code ? 'bg-white shadow-[0_0_20px_#fff]' : 'bg-[#facc15] shadow-[0_0_15px_rgba(250,204,21,0.6)]'}`} />
            </div>
            <div className={`absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/90 backdrop-blur-xl px-4 py-2 rounded-xl border border-neutral-700 transition-all shadow-2xl ${selectedCountry === code ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 group-hover/node:opacity-100 group-hover/node:translate-y-0'}`}>
              <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-3">
                {countryCoords[code]?.name}
                <span className="bg-[#facc15] text-black text-[9px] px-1.5 rounded-md leading-none py-1">{leadsByCountry[code].length}</span>
              </span>
            </div>
          </button>
        ))}

        {/* User Presence Visualization (Mocked random spray for visualization if no direct coords) */}
        {activeUserHotspots.length > 0 && !selectedCountry && (
          <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md border border-emerald-900/30 px-4 py-2 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in duration-500">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
             <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">{activeUserHotspots.length} Nodes Synchronized</span>
          </div>
        )}
      </div>

      {/* TOP LEFT: Global Command Header */}
      <div className="absolute top-10 left-10 flex flex-col z-30 pointer-events-none">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-[#facc15]/5 rounded-3xl flex items-center justify-center border border-[#facc15]/20 shadow-2xl backdrop-blur-md">
            <Globe className="text-[#facc15] animate-spin-slow" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none drop-shadow-lg">Global Presence Node</h2>
            <p className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.5em] mt-2">Tactical Market Intelligence Overlay</p>
          </div>
        </div>
      </div>

      {/* TOP RIGHT: Map Controls */}
      <div className="absolute top-10 right-10 z-30">
        {selectedCountry ? (
          <button 
            onClick={() => onSelectCountry(null)}
            className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-right duration-300 border-b-4 border-red-800 active:scale-95"
          >
            <FilterX size={16} /> Reset Geographic Filter
          </button>
        ) : (
          <div className="flex items-center gap-6 bg-black/80 backdrop-blur-2xl border border-neutral-700/50 px-8 py-4 rounded-2xl shadow-2xl">
            <div className="flex items-center gap-3">
              <Activity className="text-emerald-500" size={14} />
              <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">Network Status</span>
            </div>
            <span className="w-px h-5 bg-neutral-700" />
            <span className="text-[10px] text-[#facc15] font-black uppercase tracking-[0.2em]">OPERATIONAL</span>
          </div>
        )}
      </div>

      {/* BOTTOM LEFT: Global Stats */}
      <div className="absolute bottom-10 left-10 z-30">
        <div className="bg-black/80 backdrop-blur-2xl border border-neutral-700/50 px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-6 group/stat hover:border-[#facc15]/30 transition-all">
           <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center border border-emerald-500/20 group-hover/stat:scale-110 transition-transform">
              <TrendingUp size={24} />
           </div>
           <div>
             <span className="text-neutral-600 text-[9px] font-black uppercase tracking-widest block mb-1">Global Node Throughput</span>
             <span className="text-white font-black text-2xl italic tracking-tighter">
               ${leads.reduce((a, b) => a + b.currentBid, 0).toLocaleString()}
             </span>
           </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default WorldMarketMap;