
import React, { useState } from 'react';
// Added missing Globe icon import to resolve "Cannot find name 'Globe'" error.
import { Send, ArrowLeft, MessageSquare, Target, Cpu, Loader2, CheckCircle2, Globe } from 'lucide-react';
import { soundService } from '../services/soundService.ts';

interface ContactUsProps {
  onBack?: () => void;
  onMessageSent?: () => void;
}

const ContactUs: React.FC<ContactUsProps> = ({ onBack, onMessageSent }) => {
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playClick(true);
    setIsSending(true);
    
    // Simulate API call
    await new Promise(r => setTimeout(r, 2000));
    
    setIsSending(false);
    setIsSuccess(true);
    soundService.playClick(false);
    
    setTimeout(() => {
      onMessageSent?.();
    }, 3000);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 md:p-12 space-y-8 animate-in fade-in duration-500">
      {onBack && (
        <button onClick={() => { soundService.playClick(); onBack(); }} className="flex items-center gap-2 text-dim hover:text-main transition-colors text-[10px] font-black uppercase tracking-widest mb-6">
          <ArrowLeft size={16} /> RETURN_TO_TERMINAL
        </button>
      )}

      <div className="flex items-center gap-4 border-b border-bright pb-6">
        <div className="w-12 h-12 bg-[#00e5ff]/10 rounded-xl flex items-center justify-center text-[#00e5ff] border border-[#00e5ff]/20 shadow-glow-sm">
          <MessageSquare size={24} />
        </div>
        <div>
          <h1 className="text-3xl font-futuristic text-main italic uppercase leading-none tracking-tight">CONTACT_HQ</h1>
          <p className="text-[10px] text-dim font-black uppercase tracking-[0.3em] mt-2">COMMUNICATION_UPLINK_SECURE</p>
        </div>
      </div>

      <div className="bg-surface border border-bright rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
        {isSuccess ? (
          <div className="text-center py-12 space-y-6 animate-in zoom-in-95">
             <div className="w-20 h-20 bg-emerald-500/10 rounded-full mx-auto flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <CheckCircle2 size={40} className="animate-pulse" />
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-black text-white uppercase tracking-widest italic">TRANSMISSION_COMPLETE</h3>
                <p className="text-[10px] text-dim font-bold uppercase tracking-[0.3em]">RECONNECTING_TO_TERMINAL...</p>
             </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest px-2 italic">IDENT_TAG</label>
                <input required className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-[#00e5ff] transition-all" placeholder="YOUR_NAME" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest px-2 italic">COMM_VECTOR</label>
                <input required type="email" className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-[#00e5ff] transition-all" placeholder="EMAIL@NODE.COM" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-neutral-500 uppercase tracking-widest px-2 italic">DATA_PAYLOAD</label>
              <textarea required rows={5} className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white text-xs font-bold outline-none focus:border-[#00e5ff] transition-all resize-none italic" placeholder="DOCUMENT_YOUR_INQUIRY..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} />
            </div>

            <button 
              type="submit" 
              disabled={isSending}
              className="w-full py-5 bg-white text-black rounded-2xl font-black text-xl uppercase italic tracking-widest border-b-[8px] border-neutral-300 hover:bg-[#00e5ff] active:translate-y-1 active:border-b-0 transition-all flex items-center justify-center gap-6 shadow-2xl"
            >
              {isSending ? <Loader2 className="animate-spin" size={24} /> : (
                <>EXECUTE_TRANSMISSION <Send size={24} /></>
              )}
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-40">
         <div className="p-6 bg-black/40 border border-neutral-800 rounded-2xl flex flex-col items-center gap-3">
            <Target size={20} className="text-dim" />
            <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">HQ_LATITUDE</span>
            <span className="text-[10px] font-mono text-neutral-400">37.7749° N</span>
         </div>
         <div className="p-6 bg-black/40 border border-neutral-800 rounded-2xl flex flex-col items-center gap-3">
            <Globe size={20} className="text-dim" />
            <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">HQ_LONGITUDE</span>
            <span className="text-[10px] font-mono text-neutral-400">122.4194° W</span>
         </div>
         <div className="p-6 bg-black/40 border border-neutral-800 rounded-2xl flex flex-col items-center gap-3">
            <Cpu size={20} className="text-dim" />
            <span className="text-[8px] font-black text-neutral-500 uppercase tracking-widest">NETWORK_STATE</span>
            <span className="text-[10px] font-mono text-emerald-500">OPTIMAL</span>
         </div>
      </div>
    </div>
  );
};

export default ContactUs;
