import React, { useEffect, useRef, useState } from 'react';
import { 
  X, ShieldCheck, Lock, CreditCard, RefreshCw, Smartphone, 
  Bitcoin, Scan, ArrowRight, Loader2, AlertTriangle, CheckCircle2,
  Server, Link2, ExternalLink, Info, Globe, Landmark
} from 'lucide-react';
import { GatewayAPI } from '../types.ts';
import { paymentService } from '../services/paymentService.ts';
import { soundService } from '../services/soundService.ts';

interface GatewayPortalProps {
  gateway: GatewayAPI;
  amount: number;
  userId: string;
  onSuccess: (txnId: string) => void;
  onCancel: () => void;
}

const GatewayPortal: React.FC<GatewayPortalProps> = ({ gateway, amount, userId, onSuccess, onCancel }) => {
  const [status, setStatus] = useState<'IDLE' | 'HANDSHAKE' | 'READY' | 'PROCESSING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [error, setError] = useState<string | null>(null);
  const [intentData, setIntentData] = useState<any>(null);
  
  const cardElementRef = useRef<HTMLDivElement>(null);
  const stripeElementsRef = useRef<any>(null);

  // Initialize Intent on Mount
  useEffect(() => {
    const initIntent = async () => {
      setStatus('HANDSHAKE');
      setError(null);
      try {
        const data = await paymentService.createIntent(userId, gateway.id, amount);
        if (data && data.error) {
          // Handle object or string error from backend
          const msg = typeof data.error === 'string' ? data.error : (data.error.message || JSON.stringify(data.error));
          throw new Error(msg);
        }
        setIntentData(data);
        setStatus('READY');
      } catch (e: any) {
        const finalMsg = e instanceof Error ? e.message : (typeof e === 'string' ? e : "INTENT_SYNC_FAILURE");
        setError(finalMsg);
        setStatus('ERROR');
      }
    };
    initIntent();
  }, [userId, gateway.id, amount]);

  // Mount Stripe Elements if provider is Stripe
  useEffect(() => {
    if (status === 'READY' && gateway.provider === 'stripe' && cardElementRef.current && !stripeElementsRef.current) {
      paymentService.getStripe(gateway.publicKey).then(stripe => {
        const elements = stripe.elements();
        const card = elements.create('card', {
          style: {
            base: {
              color: '#ffffff',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '16px',
              '::placeholder': { color: '#555555' },
              backgroundColor: 'transparent',
            },
            invalid: { color: '#ef4444', iconColor: '#ef4444' },
          },
        });
        card.mount(cardElementRef.current);
        stripeElementsRef.current = card;
      }).catch(e => {
        setError(e instanceof Error ? e.message : "STRIPE_LOAD_ERROR");
        setStatus('ERROR');
      });
    }
  }, [status, gateway.publicKey, gateway.provider]);

  const handleExecute = async () => {
    if (status === 'PROCESSING') return;
    setStatus('PROCESSING');
    setError(null);
    soundService.playClick(true);

    try {
      let finalTxnId = '';
      
      if (gateway.provider === 'stripe') {
        if (!stripeElementsRef.current) throw new Error("CARD_ELEMENT_NOT_READY");
        finalTxnId = await paymentService.confirmStripePayment(
          gateway.publicKey, 
          intentData.clientSecret, 
          stripeElementsRef.current
        );
      } else {
        // Simulated check for manual nodes
        await new Promise(r => setTimeout(r, 2500));
        finalTxnId = `TXN_MANUAL_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const isVerified = await paymentService.verifyManualSettlement(intentData.intentId, finalTxnId);
        if (!isVerified) throw new Error("SETTLEMENT_VERIFICATION_FAILED");
      }

      setStatus('SUCCESS');
      soundService.playClick(false);
      setTimeout(() => onSuccess(`${gateway.provider.toUpperCase()}_SETTLE_${finalTxnId}`), 2000);
      
    } catch (e: any) {
      const finalMsg = e instanceof Error ? e.message : (typeof e === 'string' ? e : "TRANSACTION_REJECTED");
      setError(finalMsg);
      setStatus('ERROR');
      // Revert to ready state after some time so user can try again
      setTimeout(() => {
        if (status !== 'SUCCESS') setStatus('READY');
      }, 4000);
    }
  };

  const getProviderIcon = () => {
    switch (gateway.provider) {
      case 'stripe': return <CreditCard size={48} />;
      case 'upi': return <Smartphone size={48} />;
      case 'crypto': return <Bitcoin size={48} />;
      case 'binance': return <Scan size={48} />;
      default: return <Landmark size={48} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl animate-in fade-in duration-500 font-rajdhani">
      <div className="absolute inset-0 grid-bg opacity-10 pointer-events-none" />
      
      <div className="w-full max-w-xl bg-[#080808] border-2 border-neutral-800 rounded-[3rem] shadow-[0_0_100px_rgba(124,58,237,0.15)] overflow-hidden flex flex-col relative animate-in zoom-in-95 duration-500">
        
        {/* SECURE HEADER */}
        <div className="flex justify-between items-center p-8 bg-black/40 border-b border-neutral-800 shrink-0">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-accent/10 border border-accent/30 rounded-2xl flex items-center justify-center text-accent">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-futuristic text-white italic uppercase tracking-tighter leading-none">Gateway Portal</h2>
              <p className="text-[10px] text-accent font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                <Lock size={10} /> Secure_TLS_V1.3
              </p>
            </div>
          </div>
          <button onClick={onCancel} className="p-3 hover:bg-neutral-800 rounded-full transition-all text-neutral-600 hover:text-white active:scale-90">
            <X size={28} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
          {status === 'HANDSHAKE' ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-8 animate-pulse">
               <RefreshCw size={64} className="text-neutral-800 animate-spin-slow" />
               <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.5em]">Establishing Handshake...</p>
            </div>
          ) : status === 'SUCCESS' ? (
            <div className="h-64 flex flex-col items-center justify-center space-y-8 animate-in zoom-in duration-700">
               <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center text-black shadow-glow">
                  <CheckCircle2 size={56} />
               </div>
               <div className="text-center space-y-3">
                  <h3 className="text-3xl font-futuristic text-emerald-500 italic uppercase">Settlement Verified</h3>
                  <p className="text-[10px] text-neutral-500 font-black uppercase tracking-[0.4em]">Ledger Update Initiated</p>
               </div>
            </div>
          ) : (
            <div className="space-y-10">
               {/* SETTLEMENT OVERVIEW */}
               <div className="bg-[#0c0c0c] border border-neutral-800 rounded-[2rem] p-6 grid grid-cols-2 gap-4">
                  <div className="text-left border-r border-neutral-800 pr-6">
                     <span className="text-[9px] font-black text-neutral-600 uppercase block mb-1">Payment Node</span>
                     <span className="text-sm font-bold text-white uppercase truncate block">{gateway.name}</span>
                  </div>
                  <div className="text-right pl-6">
                     <span className="text-[9px] font-black text-neutral-600 uppercase block mb-1">Vault Credit</span>
                     <span className="text-3xl font-tactical font-black text-white italic tracking-widest block leading-none">${amount}</span>
                  </div>
               </div>

               {/* INTERACTIVE INPUT AREA */}
               <div className="space-y-6">
                  {gateway.provider === 'stripe' ? (
                    <div className="space-y-6 animate-in slide-in-from-bottom-4">
                       <div className="bg-black border border-neutral-800 rounded-2xl p-6 shadow-inner focus-within:border-accent transition-all">
                          <div ref={cardElementRef} />
                       </div>
                       <div className="bg-accent/5 border border-accent/20 p-4 rounded-xl flex items-start gap-4">
                          <Info className="text-accent shrink-0 mt-0.5" size={16} />
                          <p className="text-[9px] text-neutral-500 uppercase leading-relaxed font-bold tracking-widest italic">
                            Bank-level interaction (3D Secure / OTP) may appear in a secondary secure popup if required by your financial institution.
                          </p>
                       </div>
                    </div>
                  ) : gateway.qrCode ? (
                    <div className="flex flex-col items-center gap-8 animate-in slide-in-from-bottom-4">
                       <div className="relative p-4 bg-white rounded-3xl shadow-2xl">
                          <img src={gateway.qrCode} className="w-48 h-48" alt="QR Link" />
                          <div className="absolute inset-0 border-4 border-black/5 rounded-3xl" />
                       </div>
                       <div className="text-center space-y-2">
                          <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest">Broadcast App-Level Intent</h4>
                          <p className="text-[9px] text-neutral-600 font-bold uppercase tracking-tighter">Scan QR and complete settlement in your provider app</p>
                       </div>
                    </div>
                  ) : (
                    <div className="bg-black/40 border border-neutral-800 rounded-[2rem] p-10 flex flex-col items-center gap-6">
                       <div className="text-accent/40">{getProviderIcon()}</div>
                       <div className="text-center space-y-3">
                          <span className="text-[10px] font-mono text-neutral-600 bg-neutral-900 px-4 py-1.5 rounded-lg border border-neutral-800">{gateway.publicKey?.slice(0, 16) || 'ADDR_HIDDEN'}...</span>
                          <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest max-w-xs leading-relaxed">
                            Verify settlement signature against the master address hash above.
                          </p>
                       </div>
                    </div>
                  )}
               </div>

               {error && (
                 <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl flex items-center gap-4 text-red-500 animate-in shake duration-300">
                    <AlertTriangle size={20} className="shrink-0" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{String(error)}</span>
                 </div>
               )}

               <button 
                 onClick={handleExecute}
                 disabled={status === 'PROCESSING' || status === 'HANDSHAKE'}
                 className={`w-full py-6 rounded-[2rem] font-black text-xl italic uppercase tracking-[0.2em] transition-all border-b-[8px] flex items-center justify-center gap-6 shadow-2xl active:translate-y-1 active:border-b-0 ${
                   status === 'PROCESSING' ? 'bg-neutral-900 text-neutral-700 border-neutral-950' : 'bg-white text-black border-neutral-300 hover:bg-accent hover:text-white hover:border-violet-900'
                 }`}
               >
                 {status === 'PROCESSING' ? <Loader2 className="animate-spin" size={24} /> : <>Initiate Settlement <ArrowRight size={24} /></>}
               </button>
            </div>
          )}
        </div>

        {/* TERMINAL LOG FOOTER */}
        <div className="p-6 bg-black/60 border-t border-neutral-800 flex items-center justify-between">
           <div className="flex items-center gap-4">
              <Server size={14} className="text-neutral-700" />
              <div className="flex flex-col">
                 <span className="text-[7px] font-black text-neutral-700 uppercase">Intent_Token</span>
                 <span className="text-[8px] font-mono text-neutral-500 uppercase">{intentData?.intentId || 'SYNC_AWAIT...'}</span>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <Globe size={14} className="text-emerald-500/40" />
              <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">GlobalMesh_Active</span>
           </div>
        </div>
      </div>

      <style>{`
        .shadow-glow { box-shadow: 0 0 50px rgba(16, 185, 129, 0.4); }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 12s linear infinite; }
      `}</style>
    </div>
  );
};

export default GatewayPortal;