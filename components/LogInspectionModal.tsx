import React from 'react';
import { X, Fingerprint, ShieldAlert, MonitorSmartphone, Globe, Database, Terminal, Cpu, Info, User as UserIcon, Activity, MapPin, Clock } from 'lucide-react';
import { Notification, User } from '../types.ts';

interface LogInspectionModalProps {
  notification: Notification;
  subjectUser?: User;
  onClose: () => void;
}

const LogInspectionModal: React.FC<LogInspectionModalProps> = ({ notification, subjectUser, onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="w-full max-w-5xl bg-[#080808] border border-neutral-800/60 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col animate-in zoom-in-95 duration-500">
        
        {/* Header - Terminal Style */}
        <div className="flex justify-between items-center p-8 bg-[#0a0a0a] border-b border-neutral-800/40 shrink-0">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-[#facc15]/10 rounded-2xl flex items-center justify-center border border-[#facc15]/30 shadow-lg shadow-yellow-400/5">
              <Terminal className="text-[#facc15]" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">System Audit Inspector</h2>
              <div className="flex items-center gap-3 mt-2">
                 <div className="flex items-center gap-1.5">
                    <Fingerprint size={12} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Transaction Hash: {notification.id}</span>
                 </div>
                 <span className="w-1 h-1 bg-neutral-800 rounded-full" />
                 <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">SECURE_LEDGER_V4</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors text-neutral-600 hover:text-white">
            <X size={28} />
          </button>
        </div>

        {/* Landscape Content Layout */}
        <div className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 overflow-y-auto scrollbar-hide">
          
          {/* LEFT: User Identity Prompt (Subject Details) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#111111]/40 border border-neutral-800/40 rounded-[2.5rem] p-8 space-y-8 h-full relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-48 h-48 bg-[#facc15]/[0.02] rounded-full blur-[80px] -mr-24 -mt-24" />
               
               <div className="flex items-center gap-6 border-b border-neutral-800/30 pb-6 relative z-10">
                  <div className="w-20 h-20 rounded-3xl border-2 border-neutral-800 overflow-hidden bg-neutral-900/60 flex items-center justify-center text-neutral-700 shadow-xl group-hover:border-[#facc15]/30 transition-all">
                     {subjectUser?.profileImage ? (
                        <img src={subjectUser.profileImage} className="w-full h-full object-cover" alt="Subject" />
                     ) : (
                        <UserIcon size={32} />
                     )}
                  </div>
                  <div>
                     <h3 className="text-xl font-black text-white italic">{subjectUser?.name || 'Unknown Node'}</h3>
                     <p className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                        <Activity size={10} className="text-emerald-500" /> {subjectUser?.role || 'UNAUTHORIZED'} IDENTITY
                     </p>
                  </div>
               </div>

               <div className="space-y-5 relative z-10">
                  <div className="flex items-center justify-between p-4 bg-black/40 rounded-2xl border border-neutral-800/30">
                     <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest flex items-center gap-2"><Globe size={12} /> Network ID</span>
                     <span className="text-xs font-mono font-bold text-neutral-300">{subjectUser?.username || 'N/A'}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-4 bg-black/40 rounded-2xl border border-neutral-800/30">
                        <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-2">Location Node</span>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-400">
                           <MapPin size={12} className="text-red-900/60" /> {subjectUser?.location || 'RESTRICTED'}
                        </div>
                     </div>
                     <div className="p-4 bg-black/40 rounded-2xl border border-neutral-800/30">
                        <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest block mb-2">Device Signature</span>
                        <div className="flex items-center gap-2 text-[11px] font-bold text-neutral-400">
                           <MonitorSmartphone size={12} className="text-[#facc15]/40" /> {subjectUser?.deviceInfo?.split('|')[0] || 'ANALYZING...'}
                        </div>
                     </div>
                  </div>

                  <div className="p-5 bg-black/60 rounded-2xl border border-neutral-800/30 space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Email Hash</span>
                        <span className="text-[10px] font-bold text-neutral-400 italic">{subjectUser?.email || 'masked@node.internal'}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Account ID</span>
                        <span className="text-[10px] font-mono text-neutral-500">{subjectUser?.id || notification.userId}</span>
                     </div>
                  </div>
               </div>

               <div className="pt-4 opacity-40 italic">
                  <p className="text-[9px] text-neutral-700 leading-relaxed font-medium uppercase tracking-widest">
                    Identity verified via SHA-256 Auth Node. Last heartbeat detected at terminal HQ.
                  </p>
               </div>
            </div>
          </div>

          {/* RIGHT: Payload Details (Entry Content) */}
          <div className="lg:col-span-7 space-y-6">
             <div className="bg-[#0f0f0f] border border-neutral-800/40 rounded-[2.5rem] p-8 flex flex-col h-full shadow-lg">
                <div className="flex justify-between items-center border-b border-neutral-800/40 pb-6 mb-8">
                   <h4 className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-3">
                      <Database size={16} className="text-[#facc15]" /> Event Payload
                   </h4>
                   <div className="flex items-center gap-2 px-3 py-1 bg-[#facc15]/5 border border-[#facc15]/20 rounded-lg">
                      <Clock size={12} className="text-[#facc15]/60" />
                      <span className="text-[9px] font-black text-[#facc15]/80 uppercase">{notification.timestamp}</span>
                   </div>
                </div>

                <div className="flex-1 space-y-8">
                   <div className="p-8 bg-black/40 rounded-3xl border border-neutral-800/40 border-dashed relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[#facc15]/40" />
                      <p className="text-xl sm:text-2xl font-black text-neutral-100 italic leading-snug">
                         "{notification.message}"
                      </p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                         <span className="text-[9px] font-black text-neutral-700 uppercase tracking-widest block px-1">Log Category</span>
                         <div className="flex items-center gap-3 p-4 bg-black/20 rounded-2xl border border-neutral-800/40">
                            <Cpu size={14} className="text-neutral-600" />
                            <span className="text-xs font-black text-neutral-300 uppercase tracking-widest">{notification.type}</span>
                         </div>
                      </div>
                      <div className="space-y-3">
                         <span className="text-[9px] font-black text-neutral-700 uppercase tracking-widest block px-1">Integrity Status</span>
                         <div className="flex items-center gap-3 p-4 bg-emerald-950/10 rounded-2xl border border-emerald-900/20">
                            <ShieldAlert size={14} className="text-emerald-500" />
                            <span className="text-xs font-black text-emerald-500 uppercase tracking-widest">VERIFIED_LOG</span>
                         </div>
                      </div>
                   </div>

                   <div className="bg-black/40 rounded-3xl p-6 border border-neutral-800/40 flex items-start gap-4">
                      <Info className="text-[#facc15]/40 shrink-0" size={20} />
                      <div className="space-y-1">
                         <h5 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Admin Disclosure</h5>
                         <p className="text-[10px] text-neutral-600 leading-relaxed font-medium uppercase tracking-tighter italic">
                           This log entry represents a finalized state transition in the LeadBid Pro Global Ledger. Any attempt to modify this identity signature will trigger an immediate system isolation event.
                         </p>
                      </div>
                   </div>
                </div>

                <div className="mt-8 pt-6 border-t border-neutral-800/40 flex justify-end">
                   <button 
                    onClick={onClose}
                    className="px-10 py-4 bg-[#facc15] text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-yellow-400/5 hover:bg-yellow-500 transition-all border-b-4 border-yellow-700 active:scale-95"
                   >
                     Acknowledge & Close Node
                   </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogInspectionModal;