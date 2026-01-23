
import React from 'react';
import { CreditCard, CheckCircle, ExternalLink, ShieldCheck, Wallet, ArrowRight } from 'lucide-react';

interface StripeSettingsProps {
  stripeConnected: boolean;
  onConnect: () => void;
  balance: number;
}

const StripeSettings: React.FC<StripeSettingsProps> = ({ stripeConnected, onConnect, balance }) => {
  return (
    <div className="space-y-8">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-[#161616] to-black p-8 rounded-3xl border border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <span className="text-neutral-600 font-black uppercase text-[10px] tracking-widest">Available Funds</span>
          <div className="text-5xl font-black text-white mt-1">${balance.toLocaleString()}</div>
          <p className="text-neutral-500 text-sm mt-2">Verified via Secure Lead-Escrow v3</p>
        </div>
        <button className="bg-[#facc15] text-black px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:scale-105 transition-transform border-b-4 border-yellow-600">
          <Wallet size={18} /> WITHDRAW TO BANK
        </button>
      </div>

      {/* Stripe Integration */}
      <div className="bg-[#121212] p-8 rounded-3xl border border-neutral-900 shadow-xl space-y-6">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${stripeConnected ? 'bg-emerald-500/10' : 'bg-neutral-800'}`}>
            <CreditCard size={32} className={stripeConnected ? 'text-emerald-500' : 'text-neutral-600'} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white">Stripe Marketplace Connection</h3>
            <p className="text-neutral-500 text-sm">Automate your lead sales and purchases with industry-standard security.</p>
          </div>
        </div>

        {stripeConnected ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle size={24} className="text-emerald-500" />
              <div>
                <span className="text-white font-bold block leading-none">Account Verified</span>
                <span className="text-[10px] text-emerald-500 uppercase font-black tracking-tighter">Instant Payouts Enabled</span>
              </div>
            </div>
            <button className="text-neutral-500 hover:text-white transition-colors flex items-center gap-1 text-sm font-bold">
              View Stripe Dashboard <ExternalLink size={14} />
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black p-4 rounded-xl border border-neutral-800">
                <ShieldCheck size={20} className="text-[#facc15] mb-2" />
                <h4 className="text-white font-bold text-sm">PCI Compliant</h4>
                <p className="text-neutral-600 text-xs mt-1">Maximum data security for transactions.</p>
              </div>
              <div className="bg-black p-4 rounded-xl border border-neutral-800">
                <ArrowRight size={20} className="text-[#facc15] mb-2" />
                <h4 className="text-white font-bold text-sm">Low 2% Fee</h4>
                <p className="text-neutral-600 text-xs mt-1">Competitive rates for lead generation.</p>
              </div>
              <div className="bg-black p-4 rounded-xl border border-neutral-800">
                <Wallet size={20} className="text-[#facc15] mb-2" />
                <h4 className="text-white font-bold text-sm">Fast Payouts</h4>
                <p className="text-neutral-600 text-xs mt-1">Funds available within 48 hours.</p>
              </div>
            </div>
            <button 
              onClick={onConnect}
              className="w-full bg-[#635bff] text-white py-5 rounded-2xl font-black text-lg hover:bg-[#534be5] transition-all flex items-center justify-center gap-3 shadow-xl"
            >
              <CreditCard size={24} /> CONNECT WITH STRIPE
            </button>
            <p className="text-center text-[10px] text-neutral-600 font-bold uppercase tracking-widest">
              Secured by SSL and Stripe. Billing documentation: <a href="https://ai.google.dev/gemini-api/docs/billing" className="text-[#facc15] underline">ai.google.dev/gemini-api/docs/billing</a>
            </p>
          </div>
        )}
      </div>

      {/* Transaction History Mock */}
      <div className="space-y-4">
        <h4 className="text-lg font-bold text-white px-2 uppercase tracking-tighter">Recent Movements</h4>
        <div className="bg-[#121212] rounded-3xl border border-neutral-900 overflow-hidden">
          {[
            { id: 1, type: 'Sale', amount: '+ $745.00', status: 'Completed', date: '2 hours ago' },
            { id: 2, type: 'Bid Stake', amount: '- $50.00', status: 'Pending', date: '5 hours ago' },
            { id: 3, type: 'Withdrawal', amount: '- $1,200.00', status: 'Completed', date: 'Yesterday' },
          ].map((tx) => (
            <div key={tx.id} className="p-5 flex items-center justify-between border-b border-neutral-900 last:border-0 hover:bg-neutral-800/20 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${tx.amount.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                   {tx.amount.startsWith('+') ? '↑' : '↓'}
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{tx.type}</div>
                  <div className="text-[10px] text-neutral-600 font-black uppercase">{tx.date}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-black text-lg ${tx.amount.startsWith('+') ? 'text-emerald-500' : 'text-white'}`}>{tx.amount}</div>
                <div className="text-[10px] text-neutral-600 font-black uppercase">{tx.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StripeSettings;
