
import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { 
  ShieldAlert, Activity, Database, Server, Loader2, Inbox, CheckCircle, BarChart3, Terminal, MapPin, Globe, UserCircle, Activity as ActivityIcon, Monitor, Fingerprint, Eye, FileText, Gavel, Heart, PlusCircle, User as UserIcon, Zap, History, ArrowDownLeft, ArrowUpRight, ShieldCheck, Target, TrendingUp, Cpu, ArrowRight
} from 'lucide-react';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import LeadGrid from './components/LeadGrid.tsx';
import LeadSubmissionForm from './components/LeadSubmissionForm.tsx';
import WalletSettings from './components/WalletSettings.tsx';
import ProfileSettings from './components/ProfileSettings.tsx';
import DashboardStats from './components/DashboardStats.tsx';
import MobileNav from './components/MobileNav.tsx';
import Login from './components/Login.tsx';
import Signup from './components/Signup.tsx';
import BiddingModal from './components/BiddingModal.tsx';
import AdminLeadActionsModal from './components/AdminLeadActionsModal.tsx';
import AdminOAuthSettings from './components/AdminOAuthSettings.tsx';
import AdminPaymentSettings from './components/AdminPaymentSettings.tsx';
import RevenueChart from './components/RevenueChart.tsx';
import InvoiceLedger from './components/InvoiceLedger.tsx';
import LogInspectionModal from './components/LogInspectionModal.tsx';
import WorldMarketMap from './components/WorldMarketMap.tsx';
import UserManagement from './components/UserManagement.tsx';
import { Lead, User, PurchaseRequest, Notification, PlatformAnalytics, OAuthConfig, Invoice, GatewayAPI } from './types.ts';
import { apiService } from './services/apiService.ts';
import { soundService } from './services/soundService.ts';

const SESSION_KEY = 'lb_session_v3';
const USER_DATA_KEY = 'lb_user_v3';
const AUTH_VIEW_KEY = 'lb_auth_view_v3';
const LAST_KNOWN_LOCATION_KEY = 'lb_last_known_loc';

const MemoizedSidebar = memo(Sidebar);
const MemoizedHeader = memo(Header);
const MemoizedLeadGrid = memo(LeadGrid);

const App: React.FC = () => {
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, input, select, textarea');
      soundService.playClick(!!isInteractive);
    };

    window.addEventListener('mousedown', handleGlobalClick);
    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  const [authView, setAuthView] = useState<'login' | 'signup' | 'app'>(() => {
    try {
      const savedView = localStorage.getItem(AUTH_VIEW_KEY);
      const sessionExists = localStorage.getItem(SESSION_KEY);
      if (sessionExists) return 'app';
      return (savedView as any) || 'login';
    } catch {
      return 'login';
    }
  });

  const [activeTab, setActiveTab] = useState<'market' | 'profile' | 'create' | 'settings' | 'bids' | 'admin' | 'inbox' | 'auth-config' | 'payment-config' | 'wishlist' | 'ledger'>('market');
  
  const [marketData, setMarketData] = useState<{
    leads: Lead[];
    purchaseRequests: PurchaseRequest[];
    invoices: Invoice[];
    notifications: Notification[];
    analytics: PlatformAnalytics | null;
    authConfig: OAuthConfig;
    gateways: GatewayAPI[];
    users: User[];
    lastUpdate?: string;
    db_size?: number;
  }>({
    leads: [],
    purchaseRequests: [],
    invoices: [],
    notifications: [],
    analytics: null,
    authConfig: { googleEnabled: false, googleClientId: '', googleClientSecret: '', facebookEnabled: false, facebookAppId: '', facebookAppSecret: '' },
    gateways: [],
    users: [],
    lastUpdate: ''
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem(USER_DATA_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { return (localStorage.getItem('lb-theme') as 'light' | 'dark') || 'dark'; } catch { return 'dark'; }
  });

  const [selectedLeadForBid, setSelectedLeadForBid] = useState<Lead | null>(null);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState<Lead | null>(null);
  const [selectedLogForInspection, setSelectedLogForInspection] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const isSyncing = useRef(false);
  const userRef = useRef<User | null>(null);
  useEffect(() => { 
    userRef.current = user;
    if (user) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_DATA_KEY);
    }
  }, [user]);

  const fetchAppData = useCallback(async () => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    try {
      const data = await apiService.getData();
      setMarketData(prev => ({
        leads: data.leads || [],
        purchaseRequests: data.purchaseRequests || [],
        invoices: data.invoices || [],
        notifications: data.notifications || [],
        analytics: data.analytics || null,
        authConfig: data.authConfig || prev.authConfig,
        gateways: data.gateways || prev.gateways,
        users: data.users || [],
        lastUpdate: data.metadata?.last_updated,
        db_size: data.metadata?.db_size
      }));

      const activeId = localStorage.getItem(SESSION_KEY) || userRef.current?.id;
      if (activeId) {
        const currentUser = data.users?.find((u: User) => u.id === activeId);
        if (currentUser) setUser(currentUser);
      }
    } catch (error) { 
      console.warn('Sync Failed'); 
    } finally { 
      isSyncing.current = false; 
      setIsLoading(false); 
    }
  }, []);

  useEffect(() => { 
    fetchAppData();
    const interval = setInterval(fetchAppData, 15000);
    return () => clearInterval(interval);
  }, [fetchAppData]);

  const toggleTheme = useCallback(() => setTheme(prev => prev === 'dark' ? 'light' : 'dark'), []);
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleLogin = (loggedUser: User) => {
    localStorage.setItem(SESSION_KEY, loggedUser.id);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(loggedUser));
    localStorage.setItem(AUTH_VIEW_KEY, 'app');
    setUser(loggedUser);
    setAuthView('app');
    setActiveTab('market');
    showToast(`SESSION_AUTHORIZED: ${loggedUser.name.toUpperCase()}`);
  };

  const handleLogout = useCallback(() => { 
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.setItem(AUTH_VIEW_KEY, 'login');
    setUser(null); 
    setAuthView('login'); 
  }, []);

  const activeBidIds = useMemo(() => 
    marketData.purchaseRequests
      .filter(pr => pr.userId === user?.id)
      .map(pr => pr.leadId),
    [marketData.purchaseRequests, user?.id]
  );

  const wishlistLeads = useMemo(() => 
    marketData.leads.filter(l => user?.wishlist?.includes(l.id)),
    [marketData.leads, user?.wishlist]
  );

  const portfolioLeads = useMemo(() => 
    marketData.leads.filter(l => activeBidIds.includes(l.id)),
    [marketData.leads, activeBidIds]
  );

  const userInvoices = useMemo(() => 
    marketData.invoices.filter(inv => inv.userId === user?.id),
    [marketData.invoices, user?.id]
  );

  if (isLoading && !user) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-10">
        <Server className="text-cyan-500 animate-pulse" size={100} />
        <p className="text-[16px] font-futuristic uppercase tracking-[1em] text-cyan-400 text-glow animate-pulse">BOOTING_CORE...</p>
      </div>
    </div>
  );

  if (authView === 'login') return <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} authConfig={marketData.authConfig} />;
  if (authView === 'signup') return <Signup onSignup={handleLogin} onSwitchToLogin={() => setAuthView('login')} authConfig={marketData.authConfig} />;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-black text-white overflow-hidden theme-transition">
      {isSubmitting && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-3xl flex items-center justify-center">
           <div className="flex flex-col items-center gap-12">
              <Database className="text-[#00e5ff] animate-spin" size={120} />
              <p className="text-[#00e5ff] font-futuristic text-[20px] uppercase tracking-[1em] text-glow">REPLICATING_LEDGER...</p>
           </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-6 md:top-12 left-1/2 -translate-x-1/2 z-[200] px-6 md:px-12 py-4 md:py-6 rounded-2xl border-2 bg-black border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)] flex items-center gap-4 md:gap-6 animate-in slide-in-from-top-12">
          <div className="w-2.5 h-2.5 bg-[#00e5ff] rounded-full animate-pulse shadow-[0_0_10px_#00e5ff]" />
          <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-white text-glow">{toast.message}</span>
        </div>
      )}

      <div className="hidden lg:flex">
        <MemoizedSidebar activeTab={activeTab} onTabChange={setActiveTab} role={user!.role} onLogout={handleLogout} hasInbox={marketData.notifications.some(n => !n.read)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        <MemoizedHeader 
          user={user!} 
          notifications={marketData.notifications} 
          onClearNotifications={() => apiService.clearNotifications().then(fetchAppData)} 
          theme={theme} 
          onToggleTheme={toggleTheme} 
          onNavigateToProfile={() => setActiveTab('profile')}
          onNavigateToWallet={() => setActiveTab('settings')}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 space-y-4 md:space-y-6 pb-32 lg:pb-12 scroll-smooth scrollbar-hide">
          {activeTab === 'market' && (
            <div className="max-w-[1400px] mx-auto space-y-4 md:space-y-6 animate-in fade-in duration-700">
               {/* Landscape Header Section - Vault Style */}
               <div className="flex flex-col gap-4 md:gap-6">
                 <div className="px-1">
                    <h2 className="text-3xl md:text-5xl font-futuristic font-black text-white italic uppercase tracking-tighter leading-none text-glow">
                      SALES <span className="text-neutral-600">FLOOR</span>
                    </h2>
                    <p className="text-[7px] md:text-[10px] text-neutral-600 font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] mt-1.5 italic">LIVE_MARKET_STREAM // NODES_SYNCED</p>
                 </div>
                 
                 <DashboardStats leads={marketData.leads} user={user!} />
               </div>

               {/* Split Content - Landscape Architecture */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                 
                 {/* Main Market Feed (Col 8) */}
                 <div className="lg:col-span-8 space-y-4 order-2 lg:order-1">
                   <div className="bg-[#0c0c0c]/90 rounded-[1.5rem] md:rounded-[2rem] border border-neutral-800/50 p-3 md:p-6 shadow-2xl">
                     <MemoizedLeadGrid 
                      leads={marketData.leads} 
                      onBid={(id) => setSelectedLeadForBid(marketData.leads.find(l => l.id === id) || null)} 
                      onEdit={setSelectedLeadForEdit} 
                      onAdminApprove={(id) => apiService.updateLead(id, { status: 'approved' }).then(fetchAppData)} 
                      onAdminReject={(id) => apiService.updateLead(id, { status: 'rejected' }).then(fetchAppData)} 
                      onBulkApprove={(ids) => Promise.all(ids.map(id => apiService.updateLead(id, { status: 'approved' }))).then(fetchAppData)}
                      onBulkReject={(ids) => Promise.all(ids.map(id => apiService.updateLead(id, { status: 'rejected' }))).then(fetchAppData)}
                      onDelete={(id) => apiService.deleteLead(id).then(fetchAppData)} 
                      onToggleWishlist={(id) => apiService.toggleWishlist(user!.id, id).then(fetchAppData)} 
                      userRole={user!.role} 
                      currentUserId={user!.id} 
                      wishlist={user!.wishlist || []} 
                      activeBids={activeBidIds} 
                     />
                   </div>
                 </div>

                 {/* Side Telemetry / Recent Activity (Col 4) */}
                 <div className="lg:col-span-4 h-full order-1 lg:order-2">
                    <div className="bg-[#0f0f0f] p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-neutral-800/40 h-full flex flex-col shadow-xl">
                      <div className="flex justify-between items-center border-b border-neutral-800/30 pb-3 md:pb-4 mb-3 md:mb-4">
                         <h4 className="text-[8px] md:text-[9px] font-black text-neutral-500 uppercase tracking-widest flex items-center gap-2 font-futuristic">
                            <History size={10} className="text-[#00e5ff]/50" /> Market Ledger
                         </h4>
                         <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                      </div>
                      
                      <div className="flex-1 space-y-2 md:space-y-3 overflow-y-auto pr-1 scrollbar-hide max-h-[240px] md:max-h-[600px]">
                         {marketData.notifications.length > 0 ? (
                           marketData.notifications.map((n, idx) => (
                             <div key={idx} className="bg-black/30 p-3 md:p-4 rounded-xl border border-neutral-800/20 flex items-center justify-between group hover:border-[#00e5ff]/30 transition-all">
                                <div className="flex items-center gap-3">
                                   <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center ${n.type === 'buy' ? 'bg-emerald-900/10 text-emerald-500/80' : 'bg-blue-900/10 text-blue-500/80'}`}>
                                      {n.type === 'buy' ? <ArrowDownLeft size={10} md:size={12} /> : <ArrowUpRight size={10} md:size={12} />}
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-[9px] md:text-[10px] text-neutral-200 font-black uppercase tracking-tight truncate leading-tight">{n.message}</p>
                                      <p className="text-[6px] md:text-[7px] text-neutral-700 font-bold uppercase mt-0.5">{n.timestamp} ago</p>
                                   </div>
                                </div>
                             </div>
                           ))
                         ) : (
                           <div className="py-12 md:py-20 text-center">
                              <History size={24} className="mx-auto text-neutral-800 mb-3 opacity-20" />
                              <p className="text-[7px] text-neutral-700 font-black uppercase tracking-widest">Awaiting Nodes</p>
                           </div>
                         )}
                      </div>

                      <button onClick={() => setActiveTab('inbox')} className="w-full mt-4 py-2 text-[7px] md:text-[8px] font-black text-neutral-700 uppercase tracking-[0.3em] hover:text-[#00e5ff]/60 border border-neutral-800/40 rounded-lg transition-all">
                        Full Audit Log
                      </button>
                    </div>
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
               {/* ROOT CONTROL HEADER */}
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b-2 border-neutral-900 pb-8 md:pb-12">
                  <div className="relative">
                    <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-4 h-12 md:h-24 bg-red-600 rounded-full blur-xl opacity-20" />
                    <h2 className="text-4xl sm:text-7xl lg:text-8xl font-futuristic font-black text-white italic uppercase tracking-tighter leading-none flex items-center gap-4 md:gap-10 text-glow">
                      ROOT <span className="text-neutral-600">CONTROL</span>
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4 md:mt-6">
                      <div className="px-3 md:px-4 py-1.5 bg-red-600/10 border border-red-600/30 rounded-full text-[8px] md:text-[10px] font-black text-red-500 uppercase tracking-[0.3em] md:tracking-[0.4em]">MASTER_COMMAND_CENTER</div>
                      <span className="text-[10px] md:text-[12px] text-neutral-600 font-bold uppercase tracking-[0.4em] md:tracking-[0.6em] italic shrink-0">GLOBAL_OVERRIDE_ACTIVE // v4.2</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
                    <div className="flex-1 md:flex-none p-4 md:p-6 bg-[#0f0f0f] border-2 border-neutral-900 rounded-[1.5rem] md:rounded-3xl shadow-2xl flex items-center gap-4 md:gap-6 group hover:border-red-600/50 transition-all cursor-default">
                      <div className="w-10 h-10 md:w-14 md:h-14 bg-red-600/10 rounded-xl md:rounded-2xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                        <Terminal size={24} className="md:w-7 md:h-7" />
                      </div>
                      <div>
                        <span className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest block mb-1">SYSTEM_AUTH</span>
                        <span className="text-xl md:text-3xl font-tactical text-white tracking-widest leading-none text-glow">ROOT_LEVEL</span>
                      </div>
                    </div>
                  </div>
               </div>

               {/* ADMIN TELEMETRY BAR */}
               <div className="bg-[#0f0f0f] border border-neutral-800/60 rounded-[1.5rem] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 shadow-xl overflow-hidden">
                 <div className="flex items-center gap-8 md:gap-12 overflow-x-auto scrollbar-hide w-full">
                    <div className="flex flex-col shrink-0">
                      <span className="text-neutral-700 font-black uppercase text-[8px] tracking-[0.3em] mb-1">Platform Revenue</span>
                      <div className="text-3xl md:text-4xl font-black text-white italic tracking-tighter flex items-baseline gap-1.5 font-tactical">
                        <span className="text-sm text-red-500/50">$</span>{(marketData.analytics?.totalVolume || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="hidden md:block h-10 w-px bg-neutral-800 shrink-0" />
                    <div className="flex items-center gap-8 md:gap-10 shrink-0">
                       <div>
                          <span className="text-neutral-700 font-black uppercase text-[8px] tracking-[0.3em] mb-1">Identities</span>
                          <div className="text-sm md:text-lg font-black text-white italic flex items-center gap-2 md:gap-3 font-tactical tracking-widest">
                             <UserCircle size={14} className="text-red-500" /> {marketData.users.length}
                          </div>
                       </div>
                       <div>
                          <span className="text-neutral-700 font-black uppercase text-[8px] tracking-[0.3em] mb-1">Success</span>
                          <div className="text-sm md:text-lg font-black text-emerald-500 italic flex items-center gap-2 md:gap-3 font-tactical tracking-widest">
                             <CheckCircle size={14} /> 94.2%
                          </div>
                       </div>
                       <div>
                          <span className="text-neutral-700 font-black uppercase text-[8px] tracking-[0.3em] mb-1">Gateways</span>
                          <div className="text-sm md:text-lg font-black text-cyan-400 italic flex items-center gap-2 md:gap-3 font-tactical tracking-widest">
                             <Zap size={14} /> {marketData.gateways.length}
                          </div>
                       </div>
                    </div>
                 </div>
               </div>

               {/* IDENTITY MANAGEMENT SECTION */}
               <div className="bg-[#0c0c0c]/90 rounded-[2rem] md:rounded-[3rem] border-2 border-neutral-900 p-4 md:p-8 shadow-2xl space-y-6 md:space-y-8">
                  <div className="flex items-center gap-4 border-b border-neutral-900 pb-4 md:pb-6">
                    <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center text-red-500 border border-red-900/30">
                       <UserIcon size={20} />
                    </div>
                    <div>
                       <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-tight italic">Identity Registry</h3>
                       <p className="text-[8px] md:text-[9px] text-neutral-700 font-black uppercase tracking-widest mt-1">Manage network access & node integrity</p>
                    </div>
                  </div>
                  
                  <UserManagement users={marketData.users} onUpdateUser={(id, updates) => apiService.updateUser(id, updates).then(fetchAppData)} />
               </div>

               {/* LANDSCAPE ADMIN SPLIT */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left: Global Market Intelligence */}
                  <div className="lg:col-span-8 space-y-6 md:space-y-8">
                     <div className="bg-[#0c0c0c]/90 rounded-[2rem] md:rounded-[3rem] border-2 border-neutral-900 p-2 shadow-2xl relative overflow-hidden group">
                        <WorldMarketMap leads={marketData.leads} users={marketData.users} onSelectCountry={() => {}} selectedCountry={null} />
                     </div>
                     <RevenueChart history={marketData.analytics?.revenueHistory || []} />
                  </div>
                  {/* Right: Master Audit Ledger */}
                  <div className="lg:col-span-4 h-full">
                     <div className="bg-[#0f0f0f] p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-2 border-neutral-900 h-full flex flex-col shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                           <ActivityIcon size={120} />
                        </div>
                        <div className="flex justify-between items-center border-b border-neutral-800/40 pb-6 mb-6 md:mb-8 relative z-10">
                           <h4 className="text-[10px] md:text-[11px] font-black text-neutral-500 uppercase tracking-[0.3em] md:tracking-[0.4em] flex items-center gap-3 font-futuristic">
                              <ShieldAlert size={16} className="text-red-500" /> MASTER_AUDIT
                           </h4>
                           <div className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_12px_#dc2626]" />
                        </div>
                        
                        <div className="flex-1 space-y-4 overflow-y-auto pr-1 md:pr-2 scrollbar-hide relative z-10 max-h-[400px] md:max-h-[800px]">
                           {marketData.notifications.map((n, idx) => (
                             <div 
                              key={idx} 
                              onClick={() => setSelectedLogForInspection(n)}
                              className="bg-black/40 p-4 md:p-6 rounded-2xl border border-neutral-800/40 flex items-center justify-between group/log hover:border-red-600/30 transition-all cursor-pointer"
                             >
                                <div className="flex items-center gap-4 md:gap-5">
                                   <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center ${n.type === 'buy' ? 'bg-emerald-900/10 text-emerald-500' : 'bg-blue-900/10 text-blue-500'}`}>
                                      {n.type === 'buy' ? <TrendingUp size={14} className="md:w-4 md:h-4" /> : <Zap size={14} className="md:w-4 md:h-4" />}
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-[10px] md:text-[11px] text-neutral-200 font-black uppercase tracking-tight truncate max-w-[140px] md:max-w-[180px]">{n.message}</p>
                                      <p className="text-[7px] md:text-[8px] text-neutral-700 font-bold uppercase mt-1">{n.timestamp}</p>
                                   </div>
                                </div>
                                <ArrowRight size={14} className="text-neutral-800 group-hover/log:translate-x-1 group-hover/log:text-red-600 transition-all shrink-0" />
                             </div>
                           ))}
                        </div>

                        <div className="mt-6 md:mt-8 pt-6 md:pt-8 border-t border-neutral-800/40 relative z-10">
                           <button onClick={() => setActiveTab('inbox')} className="w-full bg-red-600 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.3em] md:tracking-[0.4em] border-b-4 border-red-900 hover:bg-red-500 transition-all shadow-xl shadow-red-900/10 active:translate-y-1 active:border-b-0">
                             INITIALIZE_FULL_AUDIT
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'payment-config' && <AdminPaymentSettings gateways={marketData.gateways} onGatewaysChange={(gw) => apiService.updateGateways(gw).then(fetchAppData)} onDeploy={() => {}} />}
          {activeTab === 'auth-config' && <AdminOAuthSettings config={marketData.authConfig} onConfigChange={(cfg) => apiService.updateAuthConfig(cfg).then(fetchAppData)} />}

          {activeTab === 'inbox' && (
            <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-600">
               <h2 className="text-3xl md:text-4xl font-futuristic text-white italic uppercase flex items-center gap-4 md:gap-8 text-glow">AUDIT <span className="text-red-500 font-normal">LEDGER</span></h2>
               <div className="bg-[#0c0c0c]/90 rounded-[2rem] border border-neutral-800/50 p-4 md:p-6 shadow-2xl">
                 <div className="space-y-3">
                   {marketData.notifications.map((n, idx) => (
                     <div key={idx} onClick={() => setSelectedLogForInspection(n)} className="bg-black/30 p-4 md:p-6 rounded-2xl border border-neutral-800/20 flex items-center justify-between group hover:border-red-600/30 transition-all cursor-pointer">
                        <div className="flex items-center gap-4 md:gap-6">
                           <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${n.type === 'buy' ? 'bg-emerald-900/10 text-emerald-500/80' : 'bg-blue-900/10 text-blue-500/80'}`}>
                              {n.type === 'buy' ? <ArrowDownLeft size={16} md:size={20} /> : <ArrowUpRight size={16} md:size={20} />}
                           </div>
                           <div className="min-w-0">
                              <p className="text-xs md:text-sm text-neutral-200 font-black uppercase tracking-tight truncate max-w-[160px] md:max-w-none">{n.message}</p>
                              <p className="text-[8px] md:text-[10px] text-neutral-700 font-bold uppercase mt-1">TS // {n.timestamp} ago</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-4 md:gap-6 shrink-0">
                           <span className={`text-[9px] md:text-xs font-black italic hidden sm:inline ${n.type === 'buy' ? 'text-emerald-500/80' : 'text-blue-500/80'}`}>{n.type.toUpperCase()}</span>
                           <ArrowRight className="text-neutral-800 group-hover:text-white transition-all w-4 h-4 md:w-5 md:h-5" />
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-600">
               <h2 className="text-3xl md:text-4xl font-futuristic text-white italic uppercase flex items-center gap-4 md:gap-8 text-glow">SAVED <span className="text-[#00e5ff] font-normal">NODES</span></h2>
               <div className="bg-[#0c0c0c]/90 rounded-[2rem] border border-neutral-800/50 p-4 md:p-6 shadow-2xl">
                <MemoizedLeadGrid leads={wishlistLeads} onBid={(id) => setSelectedLeadForBid(marketData.leads.find(l => l.id === id) || null)} onEdit={setSelectedLeadForEdit} onToggleWishlist={(id) => apiService.toggleWishlist(user!.id, id).then(fetchAppData)} userRole={user!.role} currentUserId={user!.id} wishlist={user!.wishlist || []} activeBids={activeBidIds} />
               </div>
            </div>
          )}

          {activeTab === 'bids' && (
            <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-600">
               <h2 className="text-3xl md:text-4xl font-futuristic text-white italic uppercase flex items-center gap-4 md:gap-8 text-glow">ACTIVE <span className="text-emerald-500 font-normal">PORTFOLIO</span></h2>
               <div className="bg-[#0c0c0c]/90 rounded-[2rem] border border-neutral-800/50 p-4 md:p-6 shadow-2xl">
                 <MemoizedLeadGrid leads={portfolioLeads} onBid={(id) => setSelectedLeadForBid(marketData.leads.find(l => l.id === id) || null)} onEdit={setSelectedLeadForEdit} onToggleWishlist={(id) => apiService.toggleWishlist(user!.id, id).then(fetchAppData)} userRole={user!.role} currentUserId={user!.id} wishlist={user!.wishlist || []} activeBids={activeBidIds} />
               </div>
            </div>
          )}

          {activeTab === 'ledger' && <InvoiceLedger invoices={userInvoices} />}
          {activeTab === 'profile' && <ProfileSettings user={user!} onUpdate={(u) => apiService.updateUser(user!.id, u).then(fetchAppData)} />}
          {activeTab === 'settings' && <WalletSettings stripeConnected={user!.stripeConnected} onConnect={() => {}} balance={user!.balance} onDeposit={(amt) => apiService.deposit(user!.id, amt).then(fetchAppData)} gateways={marketData.gateways} />}
          {activeTab === 'create' && <LeadSubmissionForm onSubmit={(l) => { setIsSubmitting(true); apiService.createLead({...l, ownerId: user!.id}).then(() => { fetchAppData(); setActiveTab('market'); showToast("NODE_PROVISIONED"); setIsSubmitting(false); }); }} />}
          
        </main>
        <div className="lg:hidden">
          <MobileNav activeTab={activeTab} onTabChange={setActiveTab} role={user!.role} />
        </div>
      </div>

      {selectedLeadForBid && <BiddingModal lead={selectedLeadForBid} user={user!} onClose={() => setSelectedLeadForBid(null)} onSubmit={(d) => { setIsSubmitting(true); apiService.placeBid({ userId: user!.id, leadId: selectedLeadForBid.id, ...d }).then(() => { fetchAppData(); setSelectedLeadForBid(null); setIsSubmitting(false); showToast("BID_COMMITTED"); }); }} onRefill={() => { setSelectedLeadForBid(null); setActiveTab('settings'); }} />}
      {selectedLeadForEdit && (
        <AdminLeadActionsModal 
          lead={selectedLeadForEdit} 
          user={user!} 
          onClose={() => setSelectedLeadForEdit(null)} 
          onSave={(u) => {
            apiService.updateLead(u.id!, u).then(() => {
              fetchAppData();
              setSelectedLeadForEdit(null);
              setActiveTab('market');
              showToast("NODE_MODIFIED");
            });
          }} 
          onDelete={(id) => {
            apiService.deleteLead(id).then(() => {
              fetchAppData();
              setSelectedLeadForEdit(null);
              setActiveTab('market');
              showToast("NODE_PURGED", "error");
            });
          }} 
        />
      )}
      {selectedLogForInspection && <LogInspectionModal notification={selectedLogForInspection} subjectUser={marketData.users.find(u => u.id === selectedLogForInspection.userId)} onClose={() => setSelectedLogForInspection(null)} />}
    </div>
  );
};

export default App;
