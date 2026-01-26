
import React from 'react';
import { Invoice } from '../types.ts';
import { 
  Download, 
  FileText, 
  CheckCircle, 
  Zap, 
  ShieldCheck, 
  Printer, 
  Activity, 
  Database, 
  TrendingUp, 
  Cpu, 
  Gauge, 
  ArrowRight,
  Clock,
  DollarSign,
  Hash
} from 'lucide-react';
import { soundService } from '../services/soundService.ts';

interface InvoiceLedgerProps {
  invoices: Invoice[];
}

const InvoiceLedger: React.FC<InvoiceLedgerProps> = ({ invoices }) => {
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
      
      {/* LANDSCAPE HEADER - SALES FLOOR STYLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b-2 border-neutral-900 pb-8 md:pb-12">
        <div className="relative">
          <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-4 h-12 md:h-24 bg-emerald-500 rounded-full blur-xl opacity-20" />
          <h2 className="text-3xl md:text-4xl font-futuristic text-white italic uppercase flex items-center gap-4 md:gap-8 text-glow">
            FINANCE <span className="text-neutral-600 font-normal">LEDGER</span>
          </h2>
          <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4 md:mt-6">
            <div className="px-3 md:px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[8px] md:text-[10px] font-black text-emerald-400 uppercase tracking-widest">SETTLEMENT_NODE_v4</div>
            <span className="text-[10px] md:text-[12px] text-neutral-600 font-bold uppercase tracking-widest italic shrink-0">LEDGER_SYNC_ACTIVE // SECURE</span>
          </div>
        </div>
        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
          <div className="flex-1 md:flex-none p-4 md:p-6 bg-[#0f0f0f] border-2 border-neutral-900 rounded-[1.5rem] md:rounded-3xl shadow-2xl flex items-center gap-4 md:gap-6 group hover:border-emerald-500/50 transition-all cursor-default overflow-hidden">
            <div className="w-10 md:w-14 h-10 md:h-14 bg-emerald-500/10 rounded-xl md:rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform shrink-0">
              <Gauge size={24} className="md:w-7 md:h-7" />
            </div>
            <div>
              <span className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest block mb-1">THROUGHPUT</span>
              <span className="text-xl md:text-3xl font-tactical text-white tracking-widest leading-none text-glow">100%_STABLE</span>
            </div>
          </div>
        </div>
      </div>

      {/* FINANCE TELEMETRY HUD */}
      <div className="bg-[#0f0f0f] border border-neutral-800/60 rounded-[1.5rem] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-8 md:gap-12 overflow-x-auto scrollbar-hide w-full">
          <div className="flex flex-col shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Aggregate Clearing</span>
            <div className="text-2xl md:text-3xl font-black text-white italic tracking-tighter flex items-baseline gap-2 font-tactical">
              <span className="text-sm text-emerald-500 opacity-40">$</span>{totalSettlement.toLocaleString()}
            </div>
          </div>
          <div className="hidden md:block h-10 w-px bg-neutral-800 shrink-0" />
          <div className="flex flex-col shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Cleared Nodes</span>
            <div className="text-lg md:text-xl font-black text-neutral-400 italic flex items-center gap-2 md:gap-3 font-tactical tracking-widest leading-none">
              <Database size={14} className="text-emerald-500/50" /> {invoices.length} UNITS
            </div>
          </div>
          <div className="hidden md:block h-10 w-px bg-neutral-800 shrink-0" />
          <div className="flex flex-col shrink-0">
            <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">System Stability</span>
            <div className="text-lg md:text-xl font-black text-emerald-500/80 italic flex items-center gap-2 md:gap-3 font-tactical tracking-widest leading-none">
              <ShieldCheck size={14} className="animate-pulse" /> 99.9%_UP
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

      {/* LEDGER LIST - REDESIGNED AS TACTICAL CARDS */}
      <div className="grid grid-cols-1 gap-4">
        {invoices.length === 0 ? (
          <div className="py-24 text-center bg-[#050505] border-2 border-neutral-800/40 border-dashed rounded-[3rem]">
            <FileText className="text-neutral-900 mx-auto mb-6" size={64} />
            <h4 className="text-neutral-700 font-futuristic text-xl uppercase tracking-widest">NO_FINANCIAL_RECORDS_IN_NODE</h4>
          </div>
        ) : (
          invoices.map((inv) => (
            <div 
              key={inv.id} 
              className="group relative bg-[#0c0c0c]/80 rounded-[1.5rem] md:rounded-[2rem] border border-neutral-800/60 transition-all duration-300 overflow-hidden flex flex-col md:flex-row items-center p-4 md:p-6 gap-4 md:gap-8 scanline-effect hover:border-emerald-500/30"
              onClick={() => handlePrint(inv)}
            >
              {/* Left Status Bar */}
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 shadow-[2px_0_15px_rgba(16,185,129,0.3)] transition-all duration-500 group-hover:w-2" />

              {/* Identification Block */}
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
                   <div className="flex items-center gap-2 mt-2">
                      <span className="text-[7px] md:text-[8px] font-black text-neutral-700 uppercase tracking-widest">{inv.category}</span>
                   </div>
                </div>
              </div>

              {/* Mid Telemetry Block */}
              <div className="hidden lg:flex items-center gap-10 px-8 border-x border-neutral-800/30 flex-1 justify-center">
                <div className="text-center">
                  <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-1">Settlement_Date</span>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-neutral-400 font-mono">
                    <Clock size={12} className="text-neutral-700" /> {new Date(inv.timestamp).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-1">Daily_Vol</span>
                  <span className="text-[10px] font-black text-neutral-400 italic font-tactical tracking-widest">{inv.dailyVolume} UNITS</span>
                </div>
                <div className="text-center">
                  <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-1">Unit_Bid</span>
                  <span className="text-[10px] font-black text-neutral-400 italic font-tactical tracking-widest">${inv.unitPrice}</span>
                </div>
              </div>

              {/* Financial Outcome Block */}
              <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10 w-full md:w-auto border-t md:border-t-0 border-neutral-900/50 pt-4 md:pt-0">
                <div className="text-left md:text-right">
                  <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-1">Daily_Settlement</span>
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

      {/* DISCLOSURE FOOTER */}
      <div className="bg-[#0f0f0f] border-2 border-neutral-900 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] flex items-start gap-4 md:gap-6 shadow-xl max-w-4xl mx-auto mt-8">
        <ShieldCheck className="text-emerald-500 shrink-0" size={20} md:size={24} />
        <div>
           <h4 className="text-[9px] md:text-[11px] font-black text-neutral-400 uppercase tracking-widest mb-1">LEDGER_CERTIFICATION</h4>
           <p className="text-[8px] md:text-[10px] text-neutral-600 font-medium leading-relaxed uppercase italic tracking-tighter">
             All listed settlements are cryptographically signed and confirmed by the marketplace clearing node. Settlement funds are automatically released from escrow 24h post-handshake. Exported statements are legally binding verification of asset exchange.
           </p>
        </div>
      </div>

    </div>
  );
};

export default InvoiceLedger;
