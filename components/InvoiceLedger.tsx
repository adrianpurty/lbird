
import React from 'react';
import { Invoice, WalletActivity } from '../types.ts';
import { 
  Download, 
  FileText, 
  CheckCircle, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Database, 
  Gauge, 
  Clock,
  DollarSign,
  Hash,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  History
} from 'lucide-react';
import { soundService } from '../services/soundService.ts';

interface InvoiceLedgerProps {
  invoices: Invoice[];
  walletActivities: WalletActivity[];
}

const InvoiceLedger: React.FC<InvoiceLedgerProps> = ({ invoices, walletActivities }) => {
  const totalSettlement = invoices.reduce((acc, inv) => acc + inv.totalSettlement, 0);

  const handlePrint = (invoice: Invoice) => {
    soundService.playClick(true);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Invoice - ${invoice.id}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 40px; }
            .brand { font-weight: 800; font-size: 24px; text-transform: uppercase; }
            .brand span { color: #eab308; }
            .details { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: #666; margin-bottom: 4px; }
            .value { font-size: 14px; font-weight: 600; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { text-align: left; padding: 12px; border-bottom: 1px solid #ddd; font-size: 10px; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #eee; font-size: 13px; }
            .total-row { background: #f9f9f9; font-weight: 800; }
            .stamp { color: #10b981; border: 3px solid #10b981; display: inline-block; padding: 10px 20px; border-radius: 8px; font-weight: 800; text-transform: uppercase; transform: rotate(-10deg); margin-top: 40px; }
            @media print { .no-print { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="brand">LEAD<span>BID</span> PRO</div>
            <div>
              <div class="label">Invoice ID</div>
              <div class="value">${invoice.id}</div>
            </div>
          </div>
          <div class="details">
            <div>
              <div class="label">Bill To</div>
              <div class="value">${invoice.userName}</div>
              <div class="value">Verified Marketplace Participant</div>
            </div>
            <div style="text-align: right;">
              <div class="label">Settlement Date</div>
              <div class="value">${new Date(invoice.timestamp).toLocaleDateString()}</div>
              <div class="value">${new Date(invoice.timestamp).toLocaleTimeString()}</div>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Asset Description</th>
                <th>Category</th>
                <th>Daily Vol</th>
                <th>Unit Bid</th>
                <th style="text-align: right;">Daily Settlement</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${invoice.leadTitle}</td>
                <td>${invoice.category}</td>
                <td>${invoice.dailyVolume}</td>
                <td>$${invoice.unitPrice.toLocaleString()}</td>
                <td style="text-align: right;">$${invoice.totalSettlement.toLocaleString()}</td>
              </tr>
              <tr class="total-row">
                <td colspan="4" style="text-align: right;">TOTAL SETTLEMENT AMOUNT</td>
                <td style="text-align: right;">$${invoice.totalSettlement.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          <div class="stamp">Transaction Cleared</div>
          <div style="margin-top: 60px; font-size: 10px; color: #999; text-align: center;">
            LeadBid Pro Marketplace • Secure Ledger Verified • LB-TXN-PROTOCOL-V1.9
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 md:space-y-10 pb-32 animate-in fade-in duration-700">
      
      {/* COMMAND HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b-2 border-neutral-900 pb-8 md:pb-12">
        <div className="relative">
          <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-4 h-12 md:h-24 bg-emerald-500 rounded-full blur-xl opacity-20" />
          <h2 className="text-3xl md:text-4xl font-futuristic text-white italic uppercase flex items-center gap-4 md:gap-8 text-glow">
            FINANCE <span className="text-neutral-600 font-normal">LEDGER</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4 md:mt-6">
            <div className="px-3 md:px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[8px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest">GLOBAL_SETTLEMENT_v4</div>
            <span className="text-[10px] md:text-[12px] text-neutral-600 font-bold uppercase tracking-widest italic shrink-0">STABLE_ESCROW // SECURE</span>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
          <div className="flex-1 md:flex-none p-4 md:p-6 bg-[#0f0f0f] border-2 border-neutral-900 rounded-[1.5rem] md:rounded-3xl shadow-2xl flex items-center gap-4 md:gap-6 group hover:border-emerald-500/50 transition-all cursor-default overflow-hidden">
            <div className="w-10 md:w-14 h-10 md:h-14 bg-emerald-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shrink-0">
              <Gauge size={24} className="md:w-7 md:h-7" />
            </div>
            <div>
              <span className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest block mb-1">THROUGHPUT</span>
              <span className="text-xl md:text-3xl font-tactical text-white tracking-widest leading-none text-glow">REAL_TIME</span>
            </div>
          </div>
        </div>
      </div>

      {/* FINANCE TELEMETRY HUD */}
      <div className="bg-[#0f0f0f] border border-neutral-800/60 rounded-[1.5rem] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-8 md:gap-12 overflow-x-auto scrollbar-hide w-full">
          <div className="flex flex-col shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Aggregate Volume</span>
            <div className="text-2xl md:text-3xl font-black text-white italic tracking-tighter flex items-baseline gap-2 font-tactical">
              <span className="text-sm text-emerald-500 opacity-40">$</span>{totalSettlement.toLocaleString()}
            </div>
          </div>
          <div className="hidden md:block h-10 w-px bg-neutral-800 shrink-0" />
          <div className="flex flex-col shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Total Clearances</span>
            <div className="text-lg md:text-xl font-black text-neutral-400 italic flex items-center gap-2 md:gap-3 font-tactical tracking-widest leading-none">
              <Database size={14} className="text-emerald-500/50" /> {invoices.length + walletActivities.length} UNITS
            </div>
          </div>
          <div className="hidden md:block h-10 w-px bg-neutral-800 shrink-0" />
          <div className="flex flex-col shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Uptime</span>
            <div className="text-lg md:text-xl font-black text-emerald-500/80 italic flex items-center gap-2 md:gap-3 font-tactical tracking-widest leading-none">
              <ShieldCheck size={14} className="animate-pulse" /> 99.9%
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-black/40 p-1.5 rounded-xl border border-neutral-800/40 shrink-0 w-full md:w-auto">
           <div className="flex flex-col items-end px-3 flex-1 md:flex-none">
             <span className="text-[7px] font-black text-neutral-600 uppercase tracking-widest">Protocol</span>
             <span className="text-[10px] font-bold text-neutral-400 font-mono uppercase tracking-widest leading-none">LB-TXN-V1.9</span>
           </div>
           <div className="h-6 w-px bg-neutral-800/60 hidden md:block" />
           <div className="px-3 flex items-center gap-2 flex-1 md:flex-none justify-center">
              <Activity size={14} className="text-emerald-500/40" />
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest font-tactical">ACTIVE_LEDGER</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        
        {/* SETTLEMENTS (Col 8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-3 mb-2 px-1">
             <div className="w-1.5 h-6 bg-white rounded-full shadow-[0_0_10px_#fff]" />
             <h3 className="text-lg md:text-xl font-black text-white italic uppercase tracking-tighter">Asset Settlements</h3>
             <span className="text-[8px] md:text-[10px] text-neutral-600 font-bold uppercase tracking-widest ml-auto italic">RECORDS_SYNCED</span>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {invoices.length === 0 ? (
              <div className="py-24 text-center bg-[#050505] border-2 border-neutral-800/40 border-dashed rounded-[2rem]">
                <FileText className="text-neutral-900 mx-auto mb-6" size={64} />
                <h4 className="text-neutral-700 font-futuristic text-xl uppercase tracking-widest">NO_SETTLEMENTS_IN_NODE</h4>
              </div>
            ) : (
              invoices.map((inv) => (
                <div 
                  key={inv.id} 
                  className="group relative bg-[#0c0c0c]/80 rounded-[1.5rem] md:rounded-[2rem] border border-neutral-800/60 transition-all duration-300 overflow-hidden flex flex-col md:flex-row items-center p-4 md:p-6 gap-4 md:gap-8 scanline-effect hover:border-emerald-500/30"
                  onClick={() => handlePrint(inv)}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 shadow-[2px_0_15px_rgba(16,185,129,0.3)] transition-all duration-500 group-hover:w-2" />

                  <div className="flex items-center gap-4 w-full md:w-auto md:min-w-[280px]">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-black border-2 border-neutral-800 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center text-neutral-700 group-hover:text-emerald-500 transition-all group-hover:border-emerald-500/40 shrink-0">
                      <FileText size={24} md:size={32} />
                    </div>
                    <div className="min-w-0">
                       <div className="flex items-center gap-2 mb-1">
                          <Hash size={10} className="text-neutral-700" />
                          <span className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest font-mono truncate">{inv.id}</span>
                       </div>
                       <h3 className="text-sm md:text-base font-black text-white italic truncate group-hover:text-emerald-400 transition-colors uppercase leading-none">{inv.leadTitle}</h3>
                    </div>
                  </div>

                  <div className="hidden lg:flex items-center gap-10 px-8 border-x border-neutral-800/30 flex-1 justify-center">
                    <div className="text-center">
                      <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-1">Vol</span>
                      <span className="text-[10px] font-black text-neutral-400 italic font-tactical tracking-widest">{inv.dailyVolume}U</span>
                    </div>
                    <div className="text-center">
                      <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-1">Bid</span>
                      <span className="text-[10px] font-black text-neutral-400 italic font-tactical tracking-widest">${inv.unitPrice}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10 w-full md:w-auto border-t md:border-t-0 border-neutral-900/50 pt-4 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-1">Clearance</span>
                      <div className="text-2xl md:text-3xl font-black text-white italic tracking-widest font-tactical leading-none">
                        ${inv.totalSettlement.toLocaleString()}
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePrint(inv); }}
                      className="bg-black text-white px-5 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest border-b-4 border-neutral-800 hover:bg-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.8)] active:translate-y-1 active:border-b-0 transition-all flex items-center gap-3 shrink-0"
                    >
                      <Download size={14} md:size={16} /> STATEMENT
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* VAULT ACTIVITY (Col 4) */}
        <div className="lg:col-span-4 h-full">
           <div className="bg-[#0f0f0f] p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-2 border-neutral-900 h-full flex flex-col shadow-2xl relative overflow-hidden group min-h-[500px]">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                <History size={120} />
              </div>

              <div className="flex justify-between items-center border-b border-neutral-800/40 pb-4 md:pb-6 mb-6 md:mb-8 relative z-10">
                 <h4 className="text-[10px] md:text-[11px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-3 font-futuristic">
                    <History size={16} className="text-[#00e5ff]" /> VAULT_ACTIVITY
                 </h4>
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_#10b981]" />
              </div>
              
              <div className="flex-1 space-y-4 overflow-y-auto pr-1 md:pr-2 scrollbar-hide relative z-10">
                 {walletActivities.length > 0 ? (
                   walletActivities.map((wa) => (
                     <div key={wa.id} className="bg-black/40 p-4 md:p-5 rounded-xl md:rounded-2xl border border-neutral-800/30 flex items-center justify-between group/tx hover:border-[#00e5ff]/30 transition-all cursor-default">
                        <div className="flex items-center gap-4 md:gap-5">
                           <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center ${wa.type === 'deposit' ? 'bg-emerald-900/10 text-emerald-500' : 'bg-red-900/10 text-red-500'}`}>
                              {wa.type === 'deposit' ? <ArrowDownLeft size={14} md:size={16} /> : <ArrowUpRight size={14} md:size={16} />}
                           </div>
                           <div className="min-w-0">
                              <p className="text-[10px] md:text-[11px] text-neutral-200 font-black uppercase tracking-tight font-futuristic truncate max-w-[120px]">{wa.provider}</p>
                              <p className="text-[7px] md:text-[8px] text-neutral-700 font-bold uppercase mt-1">{new Date(wa.timestamp).toLocaleDateString()} // {new Date(wa.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                           </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className={`text-base md:text-lg font-black italic font-tactical tracking-widest ${wa.type === 'deposit' ? 'text-emerald-500' : 'text-neutral-500'}`}>
                            {wa.type === 'deposit' ? '+' : '-'} ${wa.amount.toLocaleString()}
                          </span>
                        </div>
                     </div>
                   ))
                 ) : (
                   <div className="py-24 text-center opacity-20">
                      <RefreshCw size={32} className="mx-auto text-neutral-700 mb-4 animate-spin-slow" />
                      <p className="text-[9px] font-black text-neutral-700 uppercase tracking-widest">Awaiting Vault Sync</p>
                   </div>
                 )}
              </div>

              <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-neutral-800/40 relative z-10">
                 <button className="w-full bg-neutral-900 text-neutral-500 hover:text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase tracking-widest border-b-4 border-neutral-950 transition-all flex items-center justify-center gap-3 active:translate-y-1 active:border-b-0">
                   <RefreshCw size={14} /> EXPORT_AUDIT_LOG
                 </button>
              </div>
           </div>
        </div>
      </div>

    </div>
  );
};

export default InvoiceLedger;
