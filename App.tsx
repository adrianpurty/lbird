import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { 
  ShieldAlert, Activity, Database, Server, Loader2, Inbox, CheckCircle, BarChart3, Terminal, MapPin, Globe, UserCircle, Activity as ActivityIcon, Monitor, Fingerprint, Eye, FileText, Gavel, Heart, PlusCircle, User as UserIcon, Zap, History, ArrowDownLeft, ArrowUpRight, ShieldCheck, Target, TrendingUp, Cpu, ArrowRight, Gauge, AlertTriangle, Trash2, RefreshCw, Layers
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
import ActionCenter from './components/ActionCenter.tsx';
import AdminOAuthSettings from './components/AdminOAuthSettings.tsx';
import AdminPaymentSettings from './components/AdminPaymentSettings.tsx';
import AdminLeadActionsModal from './components/AdminLeadActionsModal.tsx';
import InvoiceLedger from './components/InvoiceLedger.tsx';
import LogInspectionModal from './components/LogInspectionModal.tsx';
import WorldMarketMap from './components/WorldMarketMap.tsx';
import UserManagement from './components/UserManagement.tsx';
import { Lead, User, PurchaseRequest, Notification, PlatformAnalytics, OAuthConfig, Invoice, GatewayAPI, WalletActivity } from './types.ts';
import { apiService } from './services/apiService.ts';
import { soundService } from './services/soundService.ts';

const SESSION_KEY = 'lb_session_v3';
const USER_DATA_KEY = 'lb_user_v3';
const AUTH_VIEW_KEY = 'lb_auth_view_v3';

const MemoizedSidebar = memo(Sidebar);
const MemoizedHeader = memo(Header);
const MemoizedLeadGrid = memo(LeadGrid);

const App: React.FC = () => {
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

  const [activeTab, setActiveTab] = useState<'market' | 'profile' | 'create' | 'settings' | 'bids' | 'admin' | 'inbox' | 'auth-config' | 'payment-config' | 'wishlist' | 'ledger' | 'action-center'>('market');
  
  const [marketData, setMarketData] = useState<{
    leads: Lead[];
    purchaseRequests: PurchaseRequest[];
    invoices: Invoice[];
    walletActivities: WalletActivity[];
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
    walletActivities: [],
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

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchAppData = useCallback(async () => {
    if (isSyncing.current) return;
    isSyncing.current = true;
    try {
      const data = await apiService.getData();
      setMarketData({
        leads: data.leads || [],
        purchaseRequests: data.purchaseRequests || [],
        invoices: data.invoices || [],
        walletActivities: data.walletActivities || [],
        notifications: data.notifications || [],
        analytics: data.analytics || null,
        authConfig: data.authConfig || { googleEnabled: false, googleClientId: '', googleClientSecret: '', facebookEnabled: false, facebookAppId: '', facebookAppSecret: '' },
        gateways: data.gateways || [],
        users: data.users || [],
        lastUpdate: data.metadata?.last_updated,
        db_size: data.metadata?.db_size
      });

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
    const interval = setInterval(fetchAppData, 30000); 
    return () => clearInterval(interval);
  }, [fetchAppData]);

  const toggleTheme = useCallback(() => setTheme(prev => prev === 'dark' ? 'light' : 'dark'), []);

  const handleLogin = (loggedUser: User) => {
    localStorage.setItem(SESSION_KEY, loggedUser.id);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(loggedUser));
    localStorage.setItem(AUTH_VIEW_KEY, 'app');
    setUser(loggedUser);
    setAuthView('app');
    setActiveTab('market');
    fetchAppData();
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

  const userWalletActivities = useMemo(() =>
    marketData.walletActivities.filter(wa => wa.userId === user?.id),
    [marketData.walletActivities, user?.id]
  );

  const userPurchaseRequests = useMemo(() =>
    marketData.purchaseRequests.filter(pr => pr.userId === user?.id),
    [marketData.purchaseRequests, user?.id]
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
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_10px_currentColor] ${toast.type === 'info' ? 'bg-cyan-400 text-cyan-400' : 'bg-emerald-400 text-emerald-400'}`} />
          <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-white text-glow">{toast.message}</span>
        </div>
      )}

      <div className="hidden lg:flex">
        <MemoizedSidebar activeTab={activeTab} onTabChange={setActiveTab} role={user!.role} onLogout={handleLogout} hasInbox={marketData.notifications.some(n => !n.read)} users={marketData.users} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        <MemoizedHeader 
          user={user!} 
          notifications={marketData.notifications} 
          onClearNotifications={() => apiService.clearNotifications().then(() => fetchAppData())} 
          theme={theme} 
          onToggleTheme={toggleTheme} 
          onNavigateToProfile={() => setActiveTab('profile')}
          onNavigateToWallet={() => setActiveTab('settings')}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 space-y-4 md:space-y-6 pb-32 lg:pb-12 scroll-smooth scrollbar-hide">
          {activeTab === 'market' && (
            <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-700">
               <div className="flex flex-col gap-6 md:gap-10">
                 <div className="px-1 flex justify-between items-end">
                    <div>
                      <h2 className="text-4xl md:text-5xl font-futuristic text-white italic uppercase flex items-center gap-4 md:gap-8 text-glow">
                        SALES <span className="text-neutral-600 font-normal">FLOOR</span>
                      </h2>
                      <p className="text-[10px] md:text-[12px] text-neutral-600 font-bold uppercase tracking-[0.4em] mt-3">Tactical_Lead_Acquisition_Environment</p>
                    </div>
                 </div>
                 
                 <DashboardStats leads={marketData.leads} user={user!} />
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
                 <div className="lg:col-span-12 space-y-10 order-2 lg:order-1">
                   <div className="bg-[#0c0c0c]/40 rounded-[2.5rem] md:rounded-[3.5rem] border border-neutral-900/50 p-4 md:p-10 shadow-2xl">
                     <MemoizedLeadGrid 
                      leads={marketData.leads} 
                      onBid={(id) => setSelectedLeadForBid(marketData.leads.find(l => l.id === id) || null)} 
                      onEdit={setSelectedLeadForEdit} 
                      onAdminApprove={(id) => apiService.updateLead(id, { status: 'approved' }).then(() => { fetchAppData(); showToast("NODE_AUTHORIZED"); })} 
                      onAdminReject={(id) => apiService.updateLead(id, { status: 'rejected' }).then(() => { fetchAppData(); showToast("NODE_REVOKED", "error"); })} 
                      onBulkApprove={(ids) => Promise.all(ids.map(id => apiService.updateLead(id, { status: 'approved' }))).then(() => { fetchAppData(); showToast("BATCH_AUTHORIZED"); })}
                      onBulkReject={(ids) => Promise.all(ids.map(id => apiService.updateLead(id, { status: 'rejected' }))).then(() => { fetchAppData(); showToast("BATCH_REVOKED", "error"); })}
                      onDelete={(id) => apiService.deleteLead(id).then(() => { fetchAppData(); showToast("NODE_PURGED", "error"); })} 
                      onToggleWishlist={(id) => apiService.toggleWishlist(user!.id, id).then(() => fetchAppData())} 
                      userRole={user!.role} 
                      currentUserId={user!.id} 
                      wishlist={user!.wishlist || []} 
                      activeBids={activeBidIds} 
                     />
                   </div>
                 </div>
               </div>

               <div className="bg-[#0f0f0f] p-8 md:p-12 rounded-[2.5rem] md:rounded-[3.5rem] border border-neutral-900/50 shadow-xl overflow-hidden relative group">
                  <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity"><History size={120} /></div>
                  <div className="flex justify-between items-center border-b border-neutral-800/30 pb-6 mb-8 relative z-10">
                     <h4 className="text-xs font-black text-neutral-500 uppercase tracking-[0.3em] flex items-center gap-3 font-futuristic">
                        <History size={16} className="text-[#00e5ff]" /> Live_Market_Ledger
                     </h4>
                     <button onClick={() => setActiveTab('inbox')} className="text-[10px] font-black text-neutral-700 uppercase tracking-widest hover:text-white transition-colors">Full_Audit_Trail</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                     {marketData.notifications.slice(0, 3).map((n, idx) => (
                       <div key={idx} className="bg-black/30 p-5 rounded-2xl border border-neutral-800/40 flex items-center gap-5 group/item hover:border-[#00e5ff]/30 transition-all">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.type === 'buy' ? 'bg-emerald-900/10 text-emerald-500' : 'bg-yellow-900/10 text-yellow-500'}`}>
                             {n.type === 'buy' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                          </div>
                          <div className="min-w-0">
                             <p className="text-[10px] text-neutral-200 font-black uppercase truncate leading-tight">{n.message}</p>
                             <p className="text-[8px] text-neutral-700 font-bold uppercase mt-1">{n.timestamp}</p>
                          </div>
                       </div>
                     ))}
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'action-center' && <ActionCenter requests={userPurchaseRequests} />}

          {activeTab === 'admin' && (
            <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-700">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b-2 border-neutral-900 pb-8 md:pb-12">
                  <div className="relative">
                    <h2 className="text-3xl md:text-4xl font-futuristic text-white italic uppercase flex items-center gap-4 md:gap-8 text-glow">
                      ROOT <span className="text-neutral-600 font-normal">CONTROL</span>
                    </h2>
                  </div>
               </div>
               <UserManagement users={marketData.users} onUpdateUser={(id, updates) => apiService.updateUser(id, updates).then(() => fetchAppData())} />
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8">
                     <WorldMarketMap leads={marketData.leads} users={marketData.users} onSelectCountry={() => {}} selectedCountry={null} />
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'payment-config' && <AdminPaymentSettings gateways={marketData.gateways} onGatewaysChange={(gw) => apiService.updateGateways(gw).then(() => fetchAppData())} onDeploy={() => {}} />}
          {activeTab === 'auth-config' && <AdminOAuthSettings config={marketData.authConfig} onConfigChange={(cfg) => apiService.updateAuthConfig(cfg).then(() => fetchAppData())} />}

          {activeTab === 'inbox' && (
            <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-10 animate-in fade-in duration-600 pb-32">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b-2 border-neutral-900 pb-8 md:pb-12">
                  <div className="relative">
                    <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-4 h-12 md:h-24 bg-red-600 rounded-full blur-xl opacity-20" />
                    <h2 className="text-3xl md:text-4xl font-futuristic text-white italic uppercase flex items-center gap-4 md:gap-8 text-glow">
                      AUDIT <span className="text-neutral-600 font-normal">LEDGER</span>
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4 md:mt-6">
                      <div className="px-3 md:px-4 py-1.5 bg-red-600/10 border border-red-600/30 rounded-full text-[8px] md:text-[10px] font-black text-red-500 uppercase tracking-widest">SYSTEM_FORENSICS_CENTER</div>
                      <span className="text-[10px] md:text-[12px] text-neutral-600 font-bold uppercase tracking-widest italic shrink-0">ENHANCED_TELEMETRY_ACTIVE</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => { if(confirm('PURGE_AUDIT_STREAM: Permanent destruction of log nodes?')) apiService.clearNotifications().then(() => fetchAppData()); }}
                    className="bg-black text-white px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest border-b-4 border-neutral-800 hover:bg-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.8)] active:translate-y-1 active:border-b-0 transition-all flex items-center gap-3 shrink-0"
                  >
                    <Trash2 size={14} /> PURGE_AUDIT_STREAM
                  </button>
               </div>

               <div className="bg-[#0f0f0f] border border-neutral-800/60 rounded-[1.5rem] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl overflow-hidden">
                 <div className="flex items-center gap-8 md:gap-12 overflow-x-auto scrollbar-hide w-full">
                    <div className="flex flex-col shrink-0">
                      <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Total Network Events</span>
                      <div className="text-3xl md:text-4xl font-black text-white italic tracking-tighter flex items-baseline gap-1.5 font-tactical">
                        {marketData.notifications.length} <span className="text-xs text-neutral-600 uppercase italic">Nodes</span>
                      </div>
                    </div>
                    <div className="hidden md:block h-10 w-px bg-neutral-800 shrink-0" />
                    <div className="flex items-center gap-8 md:gap-10 shrink-0">
                       <div>
                          <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Acquisitions (Buy)</span>
                          <div className="text-sm md:text-lg font-black text-cyan-400 italic flex items-center gap-2 md:gap-3 font-tactical tracking-widest">
                             <TrendingUp size={14} /> {marketData.notifications.filter(n => n.type === 'buy').length}
                          </div>
                       </div>
                       <div>
                          <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Provisions (Sell)</span>
                          <div className="text-sm md:text-lg font-black text-yellow-500 italic flex items-center gap-2 md:gap-3 font-tactical tracking-widest">
                             <Zap size={14} /> {marketData.notifications.filter(n => n.type === 'sell').length}
                          </div>
                       </div>
                    </div>
                 </div>
               </div>

               <div className="grid grid-cols-1 gap-3">
                   {marketData.notifications.length === 0 ? (
                      <div className="py-32 text-center bg-[#050505] border-2 border-neutral-800/40 border-dashed rounded-[3rem]">
                        <Inbox className="text-neutral-900 mx-auto mb-6" size={80} />
                        <h4 className="text-neutral-700 font-futuristic text-xl uppercase tracking-widest">LEDGER_NODE_EMPTY</h4>
                        <p className="text-neutral-800 text-[10px] font-black uppercase tracking-widest mt-4">Awaiting marketplace activity to initialize stream...</p>
                      </div>
                   ) : (
                     marketData.notifications.map((n, idx) => (
                       <div 
                        key={idx} 
                        onClick={() => setSelectedLogForInspection(n)} 
                        className="group relative bg-[#0a0a0a]/80 rounded-[1.5rem] md:rounded-[2rem] border border-neutral-800/40 transition-all duration-300 overflow-hidden flex flex-col md:flex-row items-center p-4 md:p-6 gap-4 md:gap-8 scanline-effect hover:border-red-600/30 cursor-pointer"
                       >
                          <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500 group-hover:w-2 ${
                            n.type === 'buy' ? 'bg-cyan-500 shadow-[2px_0_15px_rgba(34,211,238,0.3)]' :
                            n.type === 'sell' ? 'bg-yellow-500 shadow-[2px_0_15px_rgba(250,204,21,0.3)]' :
                            'bg-neutral-800'
                          }`} />
                          
                          <div className="flex items-center gap-4 w-full md:w-auto md:min-w-[320px]">
                             <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center border-2 bg-black transition-all shrink-0 ${
                               n.type === 'buy' ? 'border-cyan-900/40 text-cyan-400 group-hover:border-cyan-400/40' :
                               n.type === 'sell' ? 'border-yellow-900/40 text-yellow-400 group-hover:border-yellow-400/40' :
                               'border-neutral-800 text-neutral-700'
                             }`}>
                                {n.type === 'buy' ? <TrendingUp size={24} /> : <Zap size={24} />}
                             </div>
                             <div className="min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                   <Fingerprint size={10} className="text-neutral-700" />
                                   <span className="text-[8px] md:text-[10px] font-black text-neutral-600 uppercase tracking-widest font-mono truncate">{n.id}</span>
                                </div>
                                <h3 className="text-sm md:text-base font-black text-white italic truncate group-hover:text-glow-neon transition-colors uppercase leading-none">{n.message}</h3>
                             </div>
                          </div>

                          <div className="hidden lg:flex items-center gap-10 px-8 border-x border-neutral-800/30 flex-1 justify-center">
                            <div className="text-center">
                              <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-1">Type</span>
                              <span className={`text-[10px] font-black italic font-tactical tracking-widest uppercase ${n.type === 'buy' ? 'text-cyan-400' : 'text-yellow-400'}`}>{n.type} node</span>
                            </div>
                            <div className="text-center">
                              <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-1">Identity</span>
                              <span className="text-[10px] font-black text-neutral-400 italic font-tactical tracking-widest uppercase">Verified</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between md:justify-end gap-6 md:gap-10 w-full md:w-auto border-t md:border-t-0 border-neutral-900/50 pt-4 md:pt-0">
                            <div className="text-left md:text-right">
                              <span className="text-[7px] font-black text-neutral-700 uppercase tracking-widest block mb-1">Timestamp</span>
                              <div className="text-sm md:text-base font-black text-neutral-400 italic tracking-widest font-mono leading-none">
                                {n.timestamp}
                              </div>
                            </div>
                            <div className="p-2 text-neutral-800 group-hover:text-white group-hover:translate-x-1 transition-all">
                               <ArrowRight size={20} />
                            </div>
                          </div>
                       </div>
                     ))
                   )}
               </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-700">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-10 border-b-2 border-neutral-900 pb-8 md:pb-12">
                  <div className="relative">
                    <div className="absolute -left-4 md:-left-12 top-1/2 -translate-y-1/2 w-4 h-12 md:h-24 bg-[#00e5ff] rounded-full blur-xl opacity-20" />
                    <h2 className="text-3xl md:text-4xl font-futuristic text-white italic uppercase flex items-center gap-4 md:gap-8 text-glow">
                      PERSONAL <span className="text-neutral-600 font-normal">VAULT</span>
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 md:gap-6 mt-4 md:mt-6">
                      <div className="px-3 md:px-4 py-1.5 bg-[#00e5ff]/10 border border-[#00e5ff]/30 rounded-full text-[8px] md:text-[10px] font-black text-[#00e5ff] uppercase tracking-widest">PERSONAL_LEDGER_SYNC</div>
                      <span className="text-[10px] md:text-[12px] text-neutral-600 font-bold uppercase tracking-widest italic shrink-0">DATA_RELIABILITY: OPTIMAL</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <button 
                      onClick={() => setActiveTab('market')}
                      className="flex-1 md:flex-none px-6 md:px-10 py-4 md:py-5 rounded-xl md:rounded-2xl bg-neutral-900 border-2 border-neutral-800 text-white font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:border-[#00e5ff]/50 transition-all flex items-center justify-center gap-3"
                    >
                      <Layers size={16} /> BRIDGE_TO_MARKET
                    </button>
                  </div>
               </div>

               <div className="bg-[#0f0f0f] border border-neutral-800/60 rounded-[1.5rem] p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e5ff]/5 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />
                 
                 <div className="flex items-center gap-8 md:gap-16 overflow-x-auto scrollbar-hide w-full">
                   <div className="flex flex-col shrink-0">
                     <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Asset Retention</span>
                     <div className="text-2xl md:text-4xl font-black text-white italic tracking-tighter flex items-baseline gap-2 font-tactical leading-none">
                       {wishlistLeads.length} <span className="text-[10px] text-neutral-600 opacity-40 not-italic uppercase tracking-widest">Nodes</span>
                     </div>
                   </div>
                   <div className="hidden md:block h-12 w-px bg-neutral-800 shrink-0" />
                   <div className="flex flex-col shrink-0">
                     <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Vault Valuation</span>
                     <div className="text-2xl md:text-4xl font-black text-cyan-400 italic flex items-center gap-2 md:gap-3 font-tactical tracking-widest leading-none">
                        <span className="text-[10px] text-neutral-600 not-italic uppercase tracking-widest">$</span>
                        {wishlistLeads.reduce((acc, lead) => acc + lead.currentBid, 0).toLocaleString()}
                     </div>
                   </div>
                   <div className="hidden md:block h-12 w-px bg-neutral-800 shrink-0" />
                   <div className="flex flex-col shrink-0">
                     <span className="text-neutral-700 font-black uppercase text-[8px] tracking-widest mb-1">Sync Protocol</span>
                     <div className="text-2xl md:text-4xl font-black text-emerald-500/80 italic flex items-center gap-2 md:gap-3 font-tactical tracking-widest leading-none">
                       <ShieldCheck size={18} className="animate-pulse" /> STABLE
                     </div>
                   </div>
                 </div>

                 <button 
                  onClick={() => { if(confirm('PURGE_VAULT: Disconnect all saved nodes?')) Promise.all(user!.wishlist!.map(id => apiService.toggleWishlist(user!.id, id))).then(() => fetchAppData()); }}
                  className="px-6 py-3 bg-black/40 border border-neutral-800/40 rounded-xl text-[8px] font-black text-neutral-700 uppercase tracking-widest hover:text-red-500 hover:border-red-900/30 transition-all flex items-center gap-2 shrink-0"
                 >
                    <Trash2 size={12} /> PURGE_VAULT
                 </button>
               </div>

               <div className="bg-[#0c0c0c]/40 rounded-[3.5rem] border border-neutral-900/50 p-4 md:p-10 shadow-2xl">
                <MemoizedLeadGrid 
                  leads={wishlistLeads} 
                  onBid={(id) => setSelectedLeadForBid(marketData.leads.find(l => l.id === id) || null)} 
                  onEdit={setSelectedLeadForEdit} 
                  onToggleWishlist={(id) => apiService.toggleWishlist(user!.id, id).then(() => fetchAppData())} 
                  userRole={user!.role} 
                  currentUserId={user!.id} 
                  wishlist={user!.wishlist || []} 
                  activeBids={activeBidIds} 
                />
               </div>
            </div>
          )}

          {activeTab === 'bids' && (
            <div className="max-w-[1400px] mx-auto space-y-8 md:space-y-12 animate-in fade-in duration-600">
               <h2 className="text-3xl md:text-4xl font-futuristic text-white italic uppercase flex items-center gap-4 md:gap-8 text-glow">ACTIVE <span className="text-emerald-500 font-normal">PORTFOLIO</span></h2>
               <div className="bg-[#0c0c0c]/40 rounded-[3.5rem] border border-neutral-900/50 p-4 md:p-10 shadow-2xl">
                 <MemoizedLeadGrid leads={portfolioLeads} onBid={(id) => setSelectedLeadForBid(marketData.leads.find(l => l.id === id) || null)} onEdit={setSelectedLeadForEdit} onToggleWishlist={(id) => apiService.toggleWishlist(user!.id, id).then(() => fetchAppData())} userRole={user!.role} currentUserId={user!.id} wishlist={user!.wishlist || []} activeBids={activeBidIds} />
               </div>
            </div>
          )}

          {activeTab === 'ledger' && <InvoiceLedger invoices={userInvoices} walletActivities={userWalletActivities} />}
          {activeTab === 'profile' && <ProfileSettings user={user!} onUpdate={(u) => apiService.updateUser(user!.id, u).then(() => fetchAppData())} />}
          {activeTab === 'settings' && <WalletSettings stripeConnected={user!.stripeConnected} onConnect={() => {}} balance={user!.balance} onDeposit={(amt, provider) => apiService.deposit(user!.id, amt, provider).then(() => fetchAppData())} gateways={marketData.gateways} />}
          {activeTab === 'create' && <LeadSubmissionForm onSubmit={(l) => { setIsSubmitting(true); apiService.createLead({...l, ownerId: user!.id}).then(() => { fetchAppData(); setActiveTab('market'); showToast("NODE_PROVISIONED"); setIsSubmitting(false); }); }} />}
          
        </main>
        <div className="lg:hidden">
          <MobileNav activeTab={activeTab} onTabChange={setActiveTab} role={user!.role} />
        </div>
      </div>

      {selectedLeadForBid && <BiddingModal lead={selectedLeadForBid} user={user!} onClose={() => setSelectedLeadForBid(null)} onSubmit={(d) => { 
        setIsSubmitting(true); 
        apiService.placeBid({ userId: user!.id, leadId: selectedLeadForBid.id, leadTitle: selectedLeadForBid.title, ...d }).then(() => { 
          fetchAppData(); 
          setSelectedLeadForBid(null); 
          setIsSubmitting(false); 
          showToast("ACQUISITION_INITIALIZED"); 
          setActiveTab('action-center'); 
        }); 
      }} onRefill={() => { setSelectedLeadForBid(null); setActiveTab('settings'); }} />}

      {selectedLeadForEdit && (
        <AdminLeadActionsModal 
          lead={selectedLeadForEdit} 
          user={user!} 
          onClose={() => setSelectedLeadForEdit(null)} 
          onSave={(updates) => {
            setIsSubmitting(true);
            apiService.updateLead(selectedLeadForEdit.id, updates).then(() => {
              fetchAppData();
              setSelectedLeadForEdit(null);
              setIsSubmitting(false);
              showToast("NODE_RECONFIGURED");
            });
          }}
          onDelete={(id) => {
            setIsSubmitting(true);
            apiService.deleteLead(id).then(() => {
              fetchAppData();
              setSelectedLeadForEdit(null);
              setIsSubmitting(false);
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