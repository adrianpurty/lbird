
import React from 'react';
import { ShieldCheck, Zap, ArrowRight, TrendingUp, Cpu, Award } from 'lucide-react';
import { soundService } from '../services/soundService.ts';

interface WelcomeModalProps {
  userName: string;
  onClose: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ userName, onClose }) => {
  const handleAcknowledge = () => {
    soundService.playClick(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
      <div className="w-full max-w-2xl bg-[#080808] border-2 border-[#FACC15]/20 rounded-[3rem] shadow-[0_0_100px_rgba(250,204,21,0.1)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-700 relative">
        
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none text-[#FACC15]">
          <Award size={200} />
        </div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#FACC15]/5 rounded-full blur-[80px]" />

        {/* Header HUD */}
        <div className="p-10 border-b border-neutral-900 bg-[#FACC15]/5 relative z-10">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#FACC15] text-black rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.4)]">
              <Zap size={32} fill="currentColor" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none font-futuristic">
                NODE_<span className="text-[#FACC15]">ACTIVATED</span>
              </h2>
              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.4em] mt-3">Welcome, {userName.toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-10 md:p-12 space-y-8 relative z-10">
          <div className="space-y-6">
            <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tight leading-snug">
              "WELL DONE ON CHOOSING THE BEST MARKETING LEAD GENERATOR SYSTEM ON THE MARKET."
            </h3>
            
            <p className="text-neutral-400 text-lg font-medium leading-relaxed">
              We assure you that you have made the right choice. LeadBid Pro is engineered for one purpose: <span className="text-white font-black">UNSTOPPABLE ENTERPRISE GROWTH</span>.
            </p>

            <div className="bg-neutral-900/40 p-6 rounded-3xl border border-white/5 space-y-4">
              <div className="flex items-center gap-3 text-[#FACC15]">
                <ShieldCheck size={20} />
                <span className="text-[11px] font-black uppercase tracking-widest">Growth_Protocol_v4.2</span>
              </div>
              <p className="text-[12px] text-neutral-500 font-bold uppercase leading-relaxed tracking-wide">
                By following our established guidelines and marketplace protocols, you are now positioned to consistently scale your business operations. From here on, your growth trajectory is synchronized.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="flex items-center gap-3 p-4 bg-black border border-neutral-800 rounded-2xl">
                <TrendingUp size={18} className="text-emerald-500" />
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Scalability_Lock</span>
             </div>
             <div className="flex items-center gap-3 p-4 bg-black border border-neutral-800 rounded-2xl">
                <Cpu size={18} className="text-[#FACC15]" />
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Logic_Verified</span>
             </div>
          </div>

          <button 
            onClick={handleAcknowledge}
            className="w-full bg-[#FACC15] text-black py-7 rounded-[2.5rem] font-black text-xl uppercase tracking-[0.3em] flex items-center justify-center gap-6 hover:bg-white transition-all transform active:scale-95 shadow-[0_20px_50px_-10px_rgba(250,204,21,0.3)] border-b-8 border-yellow-700 font-tactical"
          >
            ACKNOWLEDGE & ENTER <ArrowRight size={24} />
          </button>
        </div>

        {/* Scanline Effect Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
      </div>
    </div>
  );
};

export default WelcomeModal;
