
import React from 'react';
import { ShieldCheck, FileText, Scale, ArrowLeft, Lock, Database, Globe } from 'lucide-react';
import { soundService } from '../services/soundService.ts';

interface LegalPageProps {
  onBack?: () => void;
}

export const PrivacyPolicy: React.FC<LegalPageProps> = ({ onBack }) => (
  <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-8 animate-in fade-in duration-500">
    {onBack && (
      <button onClick={() => { soundService.playClick(); onBack(); }} className="flex items-center gap-2 text-dim hover:text-main transition-colors text-[10px] font-black uppercase tracking-widest mb-6">
        <ArrowLeft size={16} /> RETURN_TO_TERMINAL
      </button>
    )}
    <div className="flex items-center gap-4 border-b border-bright pb-6">
      <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-glow-sm">
        <Lock size={24} />
      </div>
      <div>
        <h1 className="text-3xl font-futuristic text-main italic uppercase leading-none tracking-tight">PRIVACY_MANIFEST</h1>
        <p className="text-[10px] text-dim font-black uppercase tracking-[0.3em] mt-2">DATA_ENCRYPTION_PROTOCOL_v4.2</p>
      </div>
    </div>

    <div className="bg-surface border border-bright rounded-[2.5rem] p-8 md:p-12 space-y-10 text-neutral-300 font-clean leading-relaxed shadow-2xl">
      <section className="space-y-4">
        <h3 className="text-lg font-black text-main uppercase tracking-widest italic flex items-center gap-3">
          <Database size={18} className="text-accent" /> 01. CORE_DATA_HARVESTING
        </h3>
        <p>LeadBid Pro collects telemetry and identity strings strictly for the purpose of maintaining a high-fidelity marketplace. This includes but is not limited to: IP address hashes, biometric signatures (if enabled), and business origin URIs. Your data is your equity; we act only as an encrypted vault.</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-black text-main uppercase tracking-widest italic flex items-center gap-3">
          <Globe size={18} className="text-accent" /> 02. ARBITRAGE_NEUTRALITY
        </h3>
        <p>We do not broker your private metadata to third-party arbitrageurs. Internal analytics are used exclusively to improve lead-flow synergistic matching and to prevent network latency in bid broadcasts.</p>
      </section>

      <section className="space-y-4 border-t border-bright pt-8">
        <div className="flex items-start gap-4 bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/20">
          <ShieldCheck className="text-emerald-500 shrink-0" size={24} />
          <p className="text-[10px] text-neutral-500 uppercase font-bold tracking-widest leading-relaxed italic">
            ALL DATA TRANSMISSIONS ARE AES-256 ENCRYPTED AND LOGGED TO THE IMMUTABLE AUDIT LEDGER. BY ACCESSING THE SALES FLOOR, YOU CONSENT TO CONTINUOUS BEHAVIORAL TELEMETRY.
          </p>
        </div>
      </section>
    </div>
  </div>
);

export const TermsConditions: React.FC<LegalPageProps> = ({ onBack }) => (
  <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-8 animate-in fade-in duration-500">
    {onBack && (
      <button onClick={() => { soundService.playClick(); onBack(); }} className="flex items-center gap-2 text-dim hover:text-main transition-colors text-[10px] font-black uppercase tracking-widest mb-6">
        <ArrowLeft size={16} /> RETURN_TO_TERMINAL
      </button>
    )}
    <div className="flex items-center gap-4 border-b border-bright pb-6">
      <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center text-accent border border-accent/20 shadow-glow-sm">
        <Scale size={24} />
      </div>
      <div>
        <h1 className="text-3xl font-futuristic text-main italic uppercase leading-none tracking-tight">TERMS_OF_ENGAGEMENT</h1>
        <p className="text-[10px] text-dim font-black uppercase tracking-[0.3em] mt-2">NETWORK_CONSENSUS_PROTOCOL_v2.0</p>
      </div>
    </div>

    <div className="bg-surface border border-bright rounded-[2.5rem] p-8 md:p-12 space-y-10 text-neutral-300 font-clean leading-relaxed shadow-2xl">
      <section className="space-y-4">
        <h3 className="text-lg font-black text-main uppercase tracking-widest italic flex items-center gap-3">
          <ShieldCheck size={18} className="text-accent" /> 01. BID_FINALITY
        </h3>
        <p>All bids placed on the Sales Floor represent a binding fiscal commitment. Once an acquisition handshake is established between a Buyer and a Lead Node, the vault deduction is immutable and non-revocable except under catastrophic node failure.</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-black text-main uppercase tracking-widest italic flex items-center gap-3">
          <Lock size={18} className="text-accent" /> 02. PROHIBITED_ARBITRAGE
        </h3>
        <p>Attempting to bypass the marketplace settlement layers or reverse-engineering lead origin URLs will result in immediate identity blacklisting and asset seizure. We maintain a zero-tolerance policy for network spoofing.</p>
      </section>

      <section className="space-y-4 italic opacity-50 border-t border-bright pt-8 text-[11px] uppercase tracking-tighter">
        <p>LeadBid Pro is a tactical intermediary. We do not guarantee lead conversion ratios but guarantee the secure delivery of bit-streams from established nodes to your terminal endpoints.</p>
      </section>
    </div>
  </div>
);

export const RefundPolicy: React.FC<LegalPageProps> = ({ onBack }) => (
  <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-8 animate-in fade-in duration-500">
    {onBack && (
      <button onClick={() => { soundService.playClick(); onBack(); }} className="flex items-center gap-2 text-dim hover:text-main transition-colors text-[10px] font-black uppercase tracking-widest mb-6">
        <ArrowLeft size={16} /> RETURN_TO_TERMINAL
      </button>
    )}
    <div className="flex items-center gap-4 border-b border-bright pb-6">
      <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20 shadow-glow-sm">
        <FileText size={24} />
      </div>
      <div>
        <h1 className="text-3xl font-futuristic text-main italic uppercase leading-none tracking-tight">REFUND_SETTLEMENT</h1>
        <p className="text-[10px] text-dim font-black uppercase tracking-[0.3em] mt-2">FISCAL_RECONCILIATION_V1.1</p>
      </div>
    </div>

    <div className="bg-surface border border-bright rounded-[2.5rem] p-8 md:p-12 space-y-10 text-neutral-300 font-clean leading-relaxed shadow-2xl">
      <section className="space-y-4">
        <h3 className="text-lg font-black text-main uppercase tracking-widest italic flex items-center gap-3">
          <Database size={18} className="text-accent" /> 01. VAULT_LOCK_RULES
        </h3>
        <p>Due to the high-intensity nature of lead generation, all digital asset acquisitions are non-refundable once the data node begins broadcasting to your terminal. This ensures liquidity stability for our network of lead providers.</p>
      </section>

      <section className="space-y-4">
        <h3 className="text-lg font-black text-main uppercase tracking-widest italic flex items-center gap-3">
          <ShieldCheck size={18} className="text-accent" /> 02. EXCEPTION_PROTOCOLS
        </h3>
        <p>Fiscal reconciliation is only permitted if a Lead Node remains offline for >48 hours post-acquisition or if delivery telemetry shows a >50% transmission failure rate. Admin audit is required for all claims.</p>
      </section>
    </div>
  </div>
);
