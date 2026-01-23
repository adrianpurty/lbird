
import React from 'react';
import { Invoice } from '../types';
import { Download, FileText, CheckCircle, Zap, ShieldCheck, Printer } from 'lucide-react';

interface InvoiceLedgerProps {
  invoices: Invoice[];
}

const InvoiceLedger: React.FC<InvoiceLedgerProps> = ({ invoices }) => {
  const handlePrint = (invoice: Invoice) => {
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
    <div className="space-y-6">
      <div className="bg-[#0a0a0a] border border-neutral-900 p-6 rounded-[2rem] flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#facc15]/10 rounded-2xl flex items-center justify-center border border-[#facc15]/20">
               <ShieldCheck className="text-[#facc15]" size={24} />
            </div>
            <div>
               <h3 className="text-white font-black text-sm uppercase tracking-widest">Audit Ledger</h3>
               <p className="text-[10px] text-neutral-600 font-black uppercase tracking-tighter">Verified Daily Settlement History</p>
            </div>
         </div>
         <div className="text-right">
            <span className="text-[9px] text-neutral-600 font-black uppercase tracking-widest block mb-1">Total Records</span>
            <span className="text-white font-black text-xl italic">{invoices.length}</span>
         </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {invoices.length === 0 ? (
          <div className="bg-[#111] p-20 rounded-[3rem] border border-neutral-900 text-center space-y-4">
            <FileText className="text-neutral-800 mx-auto" size={48} />
            <p className="text-neutral-500 text-xs font-black uppercase tracking-[0.2em]">No financial records found in the current node.</p>
          </div>
        ) : (
          invoices.map((inv) => (
            <div key={inv.id} className="bg-[#111] p-6 sm:p-8 rounded-[2rem] border border-neutral-900 group hover:border-[#facc15]/40 transition-all flex flex-col md:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center border border-neutral-800 group-hover:border-[#facc15]/20 transition-all">
                     <FileText className="text-neutral-500 group-hover:text-[#facc15]" size={24} />
                  </div>
                  <div className="flex-1">
                     <div className="flex items-center gap-3">
                        <h4 className="text-white font-black text-sm italic">{inv.id}</h4>
                        <span className="bg-emerald-500/10 text-emerald-500 text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                           <CheckCircle size={8} /> Settled
                        </span>
                     </div>
                     <p className="text-neutral-400 text-[11px] font-bold mt-1">{inv.leadTitle}</p>
                     <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] text-neutral-600 font-black uppercase">{new Date(inv.timestamp).toLocaleDateString()}</span>
                        <span className="text-neutral-800">•</span>
                        <span className="text-[9px] text-neutral-600 font-black uppercase">{inv.category}</span>
                     </div>
                  </div>
               </div>

               <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                  <div className="text-right">
                     <span className="text-[9px] text-neutral-600 font-black uppercase tracking-widest block mb-1">Settlement</span>
                     <span className="text-white font-black text-xl italic">${inv.totalSettlement.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => handlePrint(inv)}
                    className="p-4 bg-black border border-neutral-800 rounded-2xl text-neutral-400 hover:text-[#facc15] hover:border-[#facc15]/30 transition-all group/btn flex items-center gap-3 shadow-xl"
                  >
                    <Download size={18} className="group-hover/btn:scale-110 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Download Invoice</span>
                  </button>
               </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InvoiceLedger;
