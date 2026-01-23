
import React, { useState } from 'react';
import { Lead } from '../types';
import { Globe, MapPin, Zap, TrendingUp, Gavel, X, FilterX } from 'lucide-react';

interface WorldMarketMapProps {
  leads: Lead[];
  onSelectCountry: (countryCode: string | null) => void;
  selectedCountry: string | null;
}

const WorldMarketMap: React.FC<WorldMarketMapProps> = ({ leads, onSelectCountry, selectedCountry }) => {
  // Group leads by countryCode
  const leadsByCountry = leads.reduce((acc, lead) => {
    if (!acc[lead.countryCode]) acc[lead.countryCode] = [];
    acc[lead.countryCode].push(lead);
    return acc;
  }, {} as Record<string, Lead[]>);

  const countriesWithLeads = Object.keys(leadsByCountry);

  // Accurate coordinates based on a 1000x500 map projection
  const countryCoords: Record<string, { x: string; y: string; name: string }> = {
    'US': { x: '16%', y: '32%', name: 'United States' },
    'TZ': { x: '58%', y: '68%', name: 'Tanzania' },
    'AE': { x: '61%', y: '46%', name: 'UAE' },
    'FR': { x: '49%', y: '30%', name: 'France' },
    'ES': { x: '47%', y: '34%', name: 'Spain' },
    'ID': { x: '82%', y: '65%', name: 'Indonesia' },
    'UK': { x: '48%', y: '26%', name: 'United Kingdom' },
    'JP': { x: '89%', y: '36%', name: 'Japan' },
  };

  return (
    <div className="relative w-full h-[450px] bg-[#050810] rounded-[3rem] border border-neutral-900 overflow-hidden shadow-2xl group transition-all duration-700 hover:border-[#facc15]/30">
      {/* High Fidelity Accurate World Map Background - Yellow Highlighted */}
      <div className="absolute inset-0 opacity-50 pointer-events-none select-none">
        <svg viewBox="0 0 1000 500" className="w-full h-full fill-[#facc15] transition-all duration-1000">
           {/* Detailed Continent Paths */}
           <g fillOpacity="0.25">
             {/* North America */}
             <path d="M125,48 L155,48 L175,55 L210,65 L270,65 L290,120 L310,140 L340,150 L345,180 L310,230 L270,250 L250,295 L220,300 L180,270 L130,220 L90,190 L70,140 L85,100 Z" />
             {/* South America */}
             <path d="M285,305 L310,305 L350,320 L385,380 L370,440 L345,490 L300,480 L275,420 L265,360 Z" />
             {/* Europe & Asia */}
             <path d="M470,55 L520,55 L580,50 L640,45 L720,45 L820,55 L910,65 L940,110 L960,160 L940,240 L880,280 L840,320 L780,325 L730,285 L650,280 L580,250 L530,230 L480,210 L455,180 L460,120 L445,80 Z" />
             {/* Africa */}
             <path d="M465,235 L520,225 L585,225 L630,260 L635,330 L610,400 L590,460 L540,485 L490,460 L455,380 L445,300 L445,260 Z" />
             {/* Australia */}
             <path d="M785,385 L840,375 L910,385 L925,430 L880,475 L810,475 L775,440 Z" />
             {/* Greenland */}
             <path d="M370,20 L450,25 L440,75 L360,60 Z" />
             {/* Japan */}
             <path d="M895,145 L910,150 L915,185 L900,210 L885,190 Z" />
             {/* Indonesia / SE Asia Islands */}
             <path d="M790,325 L830,325 L850,360 L800,365 Z M860,320 L880,335 L870,360 Z" />
           </g>

           {/* Grid Lines Overlay - Prominent Light Yellow Grid */}
           <g stroke="#facc15" strokeWidth="0.5" className="opacity-30">
             {Array.from({ length: 41 }).map((_, i) => (
               <line key={`v-${i}`} x1={i * 25} y1="0" x2={i * 25} y2="500" />
             ))}
             {Array.from({ length: 21 }).map((_, i) => (
               <line key={`h-${i}`} x1="0" y1={i * 25} x2="1000" y2={i * 25} />
             ))}
           </g>

           {/* Decorative Elements */}
           <circle cx="500" cy="250" r="280" fill="none" stroke="#facc15" strokeWidth="0.5" strokeDasharray="12 12" className="opacity-10 animate-pulse" />
        </svg>
      </div>

      {/* Connection Network Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#facc15" stopOpacity="0" />
            <stop offset="50%" stopColor="#facc15" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#facc15" stopOpacity="0" />
          </linearGradient>
        </defs>
        {countriesWithLeads.map((code, idx) => {
          const next = countriesWithLeads[(idx + 1) % countriesWithLeads.length];
          return (
            <line 
              key={code} 
              x1={countryCoords[code]?.x} y1={countryCoords[code]?.y} 
              x2={countryCoords[next]?.x} y2={countryCoords[next]?.y} 
              stroke="url(#lineGrad)" strokeWidth="1"
              className="opacity-40"
            />
          );
        })}
      </svg>

      {/* Pulsing Hotspots */}
      {countriesWithLeads.map((code) => (
        <button
          key={code}
          onClick={() => onSelectCountry(selectedCountry === code ? null : code)}
          className={`absolute group/node z-20 transition-all duration-500 ${selectedCountry === code ? 'scale-150' : 'hover:scale-125'}`}
          style={{ left: countryCoords[code]?.x, top: countryCoords[code]?.y }}
        >
          <div className="relative flex items-center justify-center">
             <div className={`absolute w-12 h-12 bg-[#facc15]/10 rounded-full ${selectedCountry === code ? 'animate-ping' : ''}`} />
             <div className={`absolute w-8 h-8 bg-[#facc15]/20 rounded-full animate-pulse`} />
             <div className={`w-3.5 h-3.5 rounded-full border-2 border-black transition-all ${selectedCountry === code ? 'bg-white shadow-[0_0_20px_#fff]' : 'bg-[#facc15] shadow-[0_0_15px_rgba(250,204,21,0.6)]'}`} />
          </div>
          <div className={`absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/95 backdrop-blur-xl px-4 py-1.5 rounded-xl border border-neutral-800 transition-all shadow-2xl ${selectedCountry === code ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 group-hover/node:opacity-100 group-hover/node:translate-y-0'}`}>
            <span className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-3">
              {countryCoords[code]?.name}
              <span className="bg-[#facc15] text-black text-[9px] px-1.5 rounded-md leading-none py-1">{leadsByCountry[code].length}</span>
            </span>
          </div>
        </button>
      ))}

      {/* Top Left Branding */}
      <div className="absolute top-10 left-10 flex flex-col z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#facc15]/10 rounded-2xl flex items-center justify-center border border-[#facc15]/30 shadow-lg shadow-yellow-400/5">
            <Globe className="text-[#facc15] animate-spin-slow" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">Global Sales Floor</h2>
            <p className="text-neutral-500 text-[9px] font-black uppercase tracking-[0.5em] mt-2">Verified Real-Time Node Map</p>
          </div>
        </div>
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-10 right-10 z-20">
        {selectedCountry ? (
          <button 
            onClick={() => onSelectCountry(null)}
            className="bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-[11px] uppercase flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-right duration-300 border-b-4 border-red-800 active:scale-95"
          >
            <FilterX size={16} /> Reset Region Lock
          </button>
        ) : (
          <div className="flex items-center gap-5 bg-black/60 backdrop-blur-2xl border border-neutral-800/50 px-6 py-3 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">Network Online</span>
            </div>
            <span className="w-px h-4 bg-neutral-800" />
            <span className="text-[10px] text-[#facc15] font-black uppercase tracking-[0.2em]">{leads.length} Active Hotspots</span>
          </div>
        )}
      </div>

      {/* Bottom Floating Stats */}
      <div className="absolute bottom-10 left-10 flex items-center gap-6 z-20">
        <div className="flex items-center gap-5 bg-black/60 backdrop-blur-2xl border border-neutral-800/50 px-6 py-4 rounded-[1.5rem] shadow-2xl transition-all hover:border-[#facc15]/40 group/stat">
           <div className="w-10 h-10 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center border border-emerald-500/20 group-hover/stat:scale-110 transition-transform">
              <TrendingUp size={20} />
           </div>
           <div className="flex flex-col">
             <span className="text-neutral-600 text-[9px] font-black uppercase tracking-widest">Aggregate Market CPA</span>
             <span className="text-white font-black text-xl italic">${leads.reduce((a, b) => a + b.currentBid, 0).toLocaleString()}</span>
           </div>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default WorldMarketMap;
