
import React, { useState, useRef, useEffect } from 'react';
import { Send, Terminal, Headphones, Loader2, User, Cpu, ShieldCheck, Activity, Zap } from 'lucide-react';
import { ChatMessage, User as UserType } from '../types.ts';
import { getHandlerResponse } from '../services/geminiService.ts';
import { soundService } from '../services/soundService.ts';

interface HandlerChatProps {
  user: UserType;
}

const HandlerChat: React.FC<HandlerChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: `HANDSHAKE_COMPLETE. Welcome, ${user.name.toUpperCase()}. I am Zephyr, the Master Handler. My node is synchronized to your trader identity. State your requirement.`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    soundService.playClick(true);

    const aiResponse = await getHandlerResponse(messages, input);
    
    const handlerMsg: ChatMessage = {
      role: 'model',
      text: aiResponse,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, handlerMsg]);
    setIsLoading(false);
    soundService.playClick(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-160px)] flex flex-col gap-6 animate-in fade-in duration-700">
      {/* HUD Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-2 border-[#1A1A1A] pb-8">
        <div className="relative">
          <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-4 h-12 md:h-24 bg-[#FACC15] rounded-full blur-xl opacity-10" />
          <h2 className="text-3xl md:text-5xl font-futuristic font-black text-white uppercase tracking-tighter leading-none">
            HANDLER <span className="text-[#FACC15]">NODE</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4">
            <div className="px-3 py-1.5 bg-[#FACC15]/10 border border-[#FACC15]/30 rounded-full text-[8px] md:text-[10px] font-black text-[#FACC15] uppercase tracking-[0.4em]">PROTO_ASSIST_v2</div>
            <span className="text-[10px] text-neutral-600 font-black uppercase tracking-[0.4em]">OPERATOR: ZEPHYR_CORE</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-[#1A1A1A] border-2 border-white/5 rounded-3xl p-4 md:p-6 shadow-2xl">
          <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-[#FACC15]">
            <ShieldCheck size={20} />
          </div>
          <div>
            <span className="text-[8px] font-black text-neutral-600 uppercase tracking-widest block mb-1">PROTOCOL_SYNC</span>
            <span className="text-lg font-tactical text-white tracking-widest leading-none">AES_256_ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Chat Terminal Area */}
      <div className="flex-1 flex flex-col bg-black rounded-[2.5rem] border-2 border-[#1A1A1A] shadow-2xl overflow-hidden relative scanline-effect">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none text-[#FACC15]">
          <Headphones size={200} />
        </div>

        {/* Messages Container */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 scrollbar-hide"
        >
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`max-w-[85%] md:max-w-[70%] p-6 rounded-3xl border-2 flex gap-4 ${
                msg.role === 'user' 
                  ? 'bg-[#1A1A1A] border-white/5 rounded-tr-none' 
                  : 'bg-black border-[#FACC15]/20 rounded-tl-none shadow-[0_0_20px_rgba(250,204,21,0.05)]'
              }`}>
                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-black text-neutral-600' : 'bg-[#FACC15]/10 text-[#FACC15]'
                }`}>
                  {msg.role === 'user' ? <User size={18} /> : <Zap size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${
                      msg.role === 'user' ? 'text-neutral-600' : 'text-[#FACC15]'
                    }`}>
                      {msg.role === 'user' ? 'CLIENT_INPUT' : 'HANDLER_OUT'}
                    </span>
                    <span className="text-[8px] text-neutral-800 font-black">{msg.timestamp}</span>
                  </div>
                  <p className={`text-sm md:text-base font-bold leading-relaxed ${
                    msg.role === 'user' ? 'text-neutral-300' : 'text-white'
                  }`}>
                    {msg.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-xl bg-[#FACC15]/10 flex items-center justify-center text-[#FACC15]">
                <Loader2 size={18} className="animate-spin" />
              </div>
              <div className="space-y-2">
                 <div className="h-4 w-32 bg-[#1A1A1A] rounded-full" />
                 <div className="h-4 w-64 bg-[#1A1A1A]/40 rounded-full" />
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-6 md:p-10 bg-[#1A1A1A]/20 border-t-2 border-[#1A1A1A]">
          <form onSubmit={handleSend} className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-neutral-700 group-focus-within:text-[#FACC15] transition-colors">
              <Terminal size={20} />
            </div>
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="INPUT_COMMAND_HERE..."
              className="w-full bg-black border-2 border-[#1A1A1A] rounded-[2rem] pl-16 pr-24 py-5 md:py-6 text-lg md:text-xl font-black text-white outline-none focus:border-[#FACC15]/60 transition-all font-tactical tracking-widest placeholder:text-neutral-900"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-4 top-1/2 -translate-y-1/2 px-6 py-3 bg-[#FACC15] text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all disabled:opacity-30 disabled:grayscale active:scale-95 flex items-center gap-2"
            >
              BROADCAST <Send size={14} />
            </button>
          </form>
          <div className="flex items-center justify-between mt-6 px-4">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                   <Activity size={10} className="text-[#FACC15] animate-pulse" />
                   <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">Handler_Link: OK</span>
                </div>
                <div className="w-px h-3 bg-[#1A1A1A]" />
                <div className="flex items-center gap-2">
                   <Cpu size={10} className="text-white" />
                   <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">Logic: Gemini_v3_Turbo</span>
                </div>
              </div>
             <p className="text-[8px] text-neutral-800 font-black uppercase tracking-widest">Node_Sync: Stable // 0.04ms</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HandlerChat;
