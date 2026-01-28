
import React, { useState } from 'react';
import { Fingerprint, ShieldCheck, X, ArrowRight, Loader2, Zap } from 'lucide-react';
import { soundService } from '../services/soundService.ts';

interface BiometricPromptProps {
  onEnable: () => Promise<void>;
  onSkip: () => void;
}

const BiometricPrompt: React.FC<BiometricPromptProps> = ({ onEnable, onSkip }) => {
  const [isActivating, setIsActivating] = useState(false);

  const handleEnable = async () => {
    setIsActivating(true);
    soundService.playClick(true);
    try {
      await onEnable();
    } catch (error) {
      console.error("Biometric Setup Failed", error);
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="w-full max-w-lg bg-[#0c0c0c] border-2 border-neutral-800 rounded-[3rem] shadow-2xl p-10 space-y-10 animate-in zoom-in-95 duration-500 relative overflow-hidden">
        {/* Background Visuals */}
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Fingerprint size={200} className="text-white" />
        </div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#00e5ff]/10 rounded-full blur-[100px]" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.15)] border-4 border-black">
            <Fingerprint size={48} className="text-black" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-futuristic font-black text-white italic uppercase tracking-tighter">BIOMETRIC_SYNC</h2>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.4em] max-w-xs mx-auto leading-relaxed">
              ENCRYPT_ACCESS_VIA_ROOT_IDENTITY_PROTOCOL
            </p>
          </div>

          <div className="bg-neutral-900/40 border border-neutral-800 p-6 rounded-3xl w-full text-left space-y-4">
            <div className="flex items-start gap-4">
              <ShieldCheck className="text-emerald-500 shrink-0" size={18} />
              <div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Enhanced Node Protection</h4>
                <p className="text-[9px] text-neutral-500 leading-relaxed uppercase mt-1">Bypass credential strings with hardware-level identity verification.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Zap className="text-[#00e5ff] shrink-0" size={18} />
              <div>
                <h4 className="text-[11px] font-black text-white uppercase tracking-widest">Instant Handshake</h4>
                <p className="text-[9px] text-neutral-500 leading-relaxed uppercase mt-1">Access the Sales Floor in &lt;100ms using system-level biometrics.</p>
              </div>
            </div>
          </div>

          <div className="w-full space-y-4 pt-4">
            <button 
              disabled={isActivating}
              onClick={handleEnable}
              className="w-full py-5 bg-white text-black rounded-[2rem] font-black text-lg uppercase italic tracking-widest border-b-[8px] border-neutral-300 active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-6 group disabled:opacity-50"
            >
              {isActivating ? <Loader2 className="animate-spin" size={24} /> : (
                <>SECURE_IDENTITY <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
            
            <button 
              disabled={isActivating}
              onClick={() => { soundService.playClick(); onSkip(); }}
              className="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] hover:text-white transition-colors py-2"
            >
              Skip for now // Maintain Manual Auth
            </button>
          </div>
        </div>

        {/* Footer Integrity Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#00e5ff]/40 to-transparent" />
      </div>
    </div>
  );
};

export default BiometricPrompt;
