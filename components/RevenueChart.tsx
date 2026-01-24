import React from 'react';
import { PlatformAnalytics } from '../types.ts';

interface RevenueChartProps {
  history: PlatformAnalytics['revenueHistory'];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ history }) => {
  if (!history || history.length === 0) return null;

  const maxValue = Math.max(...history.map(h => h.value));

  return (
    <div className="bg-[#121212]/40 p-8 rounded-[2.5rem] border border-neutral-800/30 shadow-lg space-y-8 theme-transition">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-xl font-black text-neutral-300 uppercase tracking-tight italic">Global Volume History</h3>
          <p className="text-[9px] text-neutral-700 font-black uppercase tracking-widest mt-1">Daily settlement throughput (USD)</p>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#facc15]/40" />
              <span className="text-[9px] text-neutral-700 font-black uppercase">Revenue Node</span>
           </div>
        </div>
      </div>

      <div className="h-64 flex items-end gap-2 sm:gap-4 px-2">
        {history.map((entry, index) => {
          const heightPercentage = (entry.value / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-3 group">
              <div className="relative w-full flex flex-col items-center">
                 {/* Tooltip on Hover */}
                 <div className="absolute -top-10 bg-neutral-800 text-neutral-400 px-2 py-1 rounded-md text-[9px] font-black opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-md border border-neutral-700/30">
                    ${entry.value.toLocaleString()}
                 </div>
                 
                 <div 
                   style={{ height: `${heightPercentage}%` }}
                   className="w-full bg-[#facc15]/10 border-t border-x border-neutral-800/30 rounded-t-xl group-hover:bg-[#facc15]/20 transition-all duration-500 relative overflow-hidden"
                 >
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-[#facc15]/30 shadow-[0_0_8px_rgba(250,204,21,0.2)]" />
                 </div>
              </div>
              <span className="text-[8px] font-black text-neutral-700 uppercase tracking-tighter group-hover:text-neutral-400 transition-colors">{entry.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RevenueChart;