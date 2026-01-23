
import React from 'react';
import { PlatformAnalytics } from '../types';

interface RevenueChartProps {
  history: PlatformAnalytics['revenueHistory'];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ history }) => {
  if (!history || history.length === 0) return null;

  const maxValue = Math.max(...history.map(h => h.value));

  return (
    <div className="bg-[#121212] p-8 rounded-[2.5rem] border border-neutral-900 shadow-2xl space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-xl font-black text-white uppercase tracking-tight italic">Global Volume History</h3>
          <p className="text-[9px] text-neutral-600 font-black uppercase tracking-widest mt-1">Daily settlement throughput (USD)</p>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#facc15]" />
              <span className="text-[9px] text-neutral-500 font-black uppercase">Revenue Node</span>
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
                 <div className="absolute -top-10 bg-[#facc15] text-black px-2 py-1 rounded-md text-[9px] font-black opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-xl">
                    ${entry.value.toLocaleString()}
                 </div>
                 
                 <div 
                   style={{ height: `${heightPercentage}%` }}
                   className="w-full bg-[#facc15]/20 border-t-2 border-x border-neutral-800 rounded-t-xl group-hover:bg-[#facc15]/40 transition-all duration-500 relative overflow-hidden"
                 >
                    <div className="absolute inset-x-0 top-0 h-1 bg-[#facc15] opacity-50 shadow-[0_0_10px_#facc15]" />
                 </div>
              </div>
              <span className="text-[8px] font-black text-neutral-600 uppercase tracking-tighter group-hover:text-white transition-colors">{entry.date}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RevenueChart;
