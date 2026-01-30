
import React from 'react';
import { ShieldCheck, MessageSquare, FileText, Scale, Zap } from 'lucide-react';
import { soundService } from '../services/soundService.ts';

interface FooterProps {
  onNav: (tab: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNav }) => {
  const footerLinks = [
    { id: 'privacy', icon: ShieldCheck, label: 'PRIVACY_MANIFEST' },
    { id: 'terms', icon: Scale, label: 'ENGAGEMENT_TERMS' },
    { id: 'refund', icon: FileText, label: 'FISCAL_POLICY' },
    { id: 'contact', icon: MessageSquare, label: 'HQ_UPLINK' },
  ];

  return (
    <footer className="mt-auto border-t border-bright bg-black/80 backdrop-blur-xl p-6 md:p-10 shrink-0">
      <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
        
        {/* BRANDING NODE */}
        <div className="flex items-center gap-4 group">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
            <Zap className="text-black" size={20} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-futuristic text-main italic leading-none tracking-tighter uppercase">
              LEAD<span className="text-dim">BID</span> PRO
            </span>
            <span className="text-[7px] text-dim font-black uppercase tracking-[0.4em] mt-1 italic">
              GLOBAL_MARKET_PROTOCOL_v4.5
            </span>
          </div>
        </div>

        {/* LEGAL_MENU */}
        <nav className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {footerLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => { soundService.playClick(); onNav(link.id); }}
              className="flex items-center gap-3 text-neutral-600 hover:text-[#00e5ff] transition-all group active:scale-95"
            >
              <link.icon size={14} className="opacity-40 group-hover:opacity-100 transition-opacity" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">{link.label}</span>
            </button>
          ))}
        </nav>

        {/* STATUS NODE */}
        <div className="hidden lg:flex items-center gap-4 bg-emerald-500/5 border border-emerald-500/10 px-6 py-3 rounded-full">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">CONSENSUS_STABLE_v6.2.0</span>
        </div>

      </div>
      
      <div className="max-w-[1600px] mx-auto mt-10 pt-8 border-t border-neutral-900 text-center">
         <p className="text-[7px] text-neutral-800 font-bold uppercase tracking-[0.5em] italic">
           All Rights Reserved // LeadBid Pro Marketplace Infrastructure // Encrypted End-to-End
         </p>
      </div>
    </footer>
  );
};

export default Footer;
