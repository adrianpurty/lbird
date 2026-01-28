import React, { useState, useEffect } from 'react';
import { Fingerprint, ShieldCheck, Loader2, Zap, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { soundService } from '../services/soundService.ts';

interface BiometricVerifyModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const BiometricVerifyModal: React.FC<BiometricVerifyModalProps> = ({ onSuccess, onCancel }) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [status, setStatus] = useState<'IDLE' | 'SCANNING' | 'MATCH_FOUND' | 'ERROR'>('IDLE');

  useEffect(() => {
    soundService.playClick(true);
    setStatus('SCANNING');
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus('MATCH_FOUND');
          soundService.playClick(false);
          setTimeout(() => onSuccess(), 1000);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [onSuccess]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-[#0c0c0c] border-2 border-neutral-800 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,1)] p-10 space-y-10 animate-in zoom-in-95 duration-500 relative overflow-hidden">
        
        {/* Background Visuals */}
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
          <Fingerprint size={200} className="text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-8">
          <div className="relative group">
            <div className={`absolute inset-0 blur-3xl opacity-20 transition-all duration-500 ${status === 'MATCH_FOUND' ? 'bg-emerald-500' : 'bg-[#00e5ff]'}`} />
            
            <div className={`w-32 h-32 rounded-[2.5rem] bg-black border-2 flex items-center justify-center relative z-10 transition-all duration-500 overflow-hidden ${
              status === 'MATCH_FOUND' ? 'border-emerald-500 text-emerald-500' : 'border-neutral-800 text-neutral-600'
            }`}>
              {status === 'SCANNING' && (
                <div className="absolute top-0 left-0 w-full h-1 bg-[#00e5ff] shadow-[0_0_15px_#00e5ff] animate-scanline z-20" />
              )}
              
              {status === 'MATCH_FOUND' ? (
                <CheckCircle2 size={56} className="animate-in zoom-in duration-300" />
              ) : (
                <Fingerprint size={56} className={`${status === 'SCANNING' ? 'text-[#00e5ff] animate-pulse' : ''}`} />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-futuristic font-black text-white italic uppercase tracking-tighter">
              {status === 'SCANNING' ? 'SCANNING_IDENTITY' : status === 'MATCH_FOUND' ? 'MATCH_FOUND' : 'ERROR_DETECTED'}
            </h2>
            <div className="flex items-center justify-center gap-3">
               <span className="text-[9px] font-black text-neutral-600 uppercase tracking-[0.4em] font-mono">
                 {status === 'SCANNING' ? `VERIFYING_BIT_STREAM... ${Math.floor(scanProgress)}%` : 'HANDSHAKE_ESTABLISHED'}
               </span>
            </div>
          </div>

          <div className="w-full space-y-6">
            <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
              <div 
                className={`h-full transition-all duration-300 ease-out ${status === 'MATCH_FOUND' ? 'bg-emerald-500' : 'bg-[#00e5ff]'}`} 
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            <div className="bg-neutral-900/40 border border-neutral-800 p-5 rounded-2xl text-left flex items-start gap-4">
              <ShieldCheck className={`shrink-0 mt-0.5 ${status === 'MATCH_FOUND' ? 'text-emerald-500' : 'text-neutral-700'}`} size={16} />
              <p className="text-[8px] text-neutral-500 leading-relaxed uppercase font-bold tracking-widest italic">
                Hardware-level authentication request sent to Root Identity Node. Awaiting secure response.
              </p>
            </div>
          </div>

          <button 
            onClick={onCancel}
            className="text-[9px] font-black text-neutral-700 uppercase tracking-[0.3em] hover:text-white transition-colors flex items-center gap-2 group"
          >
            <X size={14} className="group-hover:rotate-90 transition-transform" /> 
            Terminate_Handshake
          </button>
        </div>

        {/* Dynamic Edge Accents */}
        <div className={`absolute bottom-0 left-0 right-0 h-1 transition-all duration-1000 ${status === 'MATCH_FOUND' ? 'bg-emerald-500' : 'bg-[#00e5ff]/20'}`} />
      </div>

      <style>{`
        @keyframes scan {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(128px); opacity: 0; }
        }
        .animate-scanline {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default BiometricVerifyModal;