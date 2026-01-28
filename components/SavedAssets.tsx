import React from 'react';
import { Heart, Layers, Radar, ShieldCheck, Database, ArrowRight } from 'lucide-react';
import { Lead } from '../types.ts';
import { TacticalLeadCard } from './LeadGrid.tsx';
import { soundService } from '../services/soundService.ts';

interface SavedAssetsProps {
  leads: Lead[];
  onBid: (id: string) => void;
  onRemove: (id: string) => void;
}

const SavedAssets: React.FC<SavedAssetsProps> = ({ leads, onBid, onRemove }) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10">
        <h1 className="text-4xl md:text-6xl font-futuristic italic font-black uppercase tracking-tighter">
          SAVED <span className="text-transparent" style={{ WebkitTextStroke: '2px #ffffff', opacity: 0.3 }}>ASSETS</span>
        </h1>
        <div className="bg-[#0c0c0c] border border-white/10 p-4 md:p-6 rounded-[2rem] flex items-center gap-6 shadow-2xl">
          <ShieldCheck size={24} className="text-[#00e5ff]" />
          <div>
            <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-1">VAULT_DENSITY</span>
            <span className="text-3xl font-tactical text-white tracking-widest leading-none">{leads.length} NODES</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {leads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leads.map(lead => (
              <TacticalLeadCard 
                key={lead.id}
                lead={lead}
                userRole="user"
                onBid={onBid}
                onQuickBid={() => {}}
                onEdit={() => {}}
                nicheCount={1}
                isWishlisted={true}
                onToggleWishlist={() => { soundService.playClick(); onRemove(lead.id); }}
                compact
              />
            ))}
          </div>
        ) : (
          <div className="bg-black/40 border border-dashed border-white/10 rounded-[3rem] p-20 text-center flex flex-col items-center gap-8 shadow-2xl">
             <Radar size={80} className="text-neutral-900 animate-spin" strokeWidth={1} />
             <div className="space-y-4">
                <h4 className="text-neutral-700 font-futuristic text-xl uppercase tracking-[0.4em]">VAULT_EMPTY</h4>
                <p className="text-neutral-800 text-[10px] font-black uppercase tracking-widest italic">MONITOR THE SALES FLOOR TO SECURE HIGH-INTENSITY ASSETS</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedAssets;