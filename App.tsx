
import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { 
  ShieldAlert, Activity, Database, Server, Loader2, Inbox, CheckCircle, BarChart3, Terminal, MapPin, Globe, UserCircle, Activity as ActivityIcon, Monitor, Fingerprint, Eye, FileText, Gavel, Heart, PlusCircle, User as UserIcon, Zap, History, ArrowDownLeft, ArrowUpRight, ShieldCheck, Target, TrendingUp, Cpu, ArrowRight, Star, PlayCircle, Layers
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
import LeadManagement from './components/LeadManagement.tsx';
import UserActivityHub from './components/UserActivityHub.tsx';
import WelcomeModal from './components/WelcomeModal.tsx';
import PurchaseManifestModal from './components/PurchaseManifestModal.tsx';
import { Lead, User, PurchaseRequest, Notification, PlatformAnalytics, OAuthConfig, Invoice, GatewayAPI } from './types.ts';
import { apiService } from './services/apiService.ts';
import { soundService } from './services/soundService.ts';

const SESSION_KEY = 'lb_session_v3';
const USER_DATA_KEY = 'lb_user_v3';
const AUTH_VIEW_KEY = 'lb_auth_view_v3';
const WELCOME_SHOWN_KEY = 'lb_welcome_v1';

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
  }>({
    leads: [],
    purchaseRequests: [],
    invoices: [],
    notifications: [],
    analytics: null,
    authConfig: { googleEnabled: false, googleClientId: '', googleClientSecret: '', facebookEnabled: false, facebookAppId: '', facebookAppSecret: '' },
    gateways: [],
    users: []
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem(USER_DATA_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [showWelcome, setShowWelcome] = useState(false);
  const [theme] = useState<'light' | 'dark'>('dark');
  const [selectedLeadForBid, setSelectedLeadForBid] = useState<Lead | null>(null);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState<Lead | null>(null);
  const [selectedLogForInspection, setSelectedLogForInspection] = useState<Notification | null>(null);
  const [selectedPurchaseForManifest, setSelectedPurchaseForManifest] = useState<PurchaseRequest | null>(null);
  const [selectedPurchaseForEdit, setSelectedPurchaseForEdit] = useState<PurchaseRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'info' } | null>(null);

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
        lastUpdate: data.metadata?.last_updated
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

  const showToast = useCallback((message: string) => {
    setToast({ message, type: 'info' });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleLogin = (loggedUser: User) => {
    localStorage.setItem(SESSION_KEY, loggedUser.id);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(loggedUser));
    localStorage.setItem(AUTH_VIEW_KEY, 'app');
    
    setUser(loggedUser);
    setAuthView('app');
    setActiveTab('market');
    
    // Check if welcome modal was shown this session
    const shown = sessionStorage.getItem(WELCOME_SHOWN_KEY);
    if (!shown) {
      setShowWelcome(true);
      sessionStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    }
    
    showToast(`ACCESS_GRANTED: ${loggedUser.name.toUpperCase()}`);
  };

  const handleLogout = useCallback(() => { 
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.setItem(AUTH_VIEW_KEY, 'login');
    sessionStorage.removeItem(WELCOME_SHOWN_KEY);
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

  const featuredLead = useMemo(() => marketData.leads[0], [marketData.leads]);

  const userInvoices = useMemo(() => 
    marketData.invoices.filter(inv => inv.userId === user?.id),
    [marketData.invoices, user?.id]
  );

  const handlePurchaseUpdate = async (data: any) => {
    setIsSubmitting(true);
    try {
        await apiService.updatePurchaseRequest(data.id, data);
        await fetchAppData();
        setSelectedPurchaseForEdit(null);
        showToast("SYNC_RECONFIGURED");
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleNewPurchase = async (data: any) => {
    setIsSubmitting(true);
    try {
        await apiService.placeBid({ userId: user!.id, leadId: selectedLeadForBid!.id, ...data });
        await fetchAppData();
        setSelectedLeadForBid(null);
        showToast("BID_REGISTERED");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading && !user) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-10">
        <Server className="text-[#FACC15] animate-pulse" size={100} />
        <p className="text-[14px] font-tactical uppercase tracking-[1em] text-[#FACC15] animate-pulse">INIT_BOOT_CORE</p>
      </div>
    </div>
  );

  if (authView === 'login') return <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} authConfig={marketData.authConfig} />;
  if (authView === 'signup') return <Signup onSignup={handleLogin} onSwitchToLogin={() => setAuthView('login')} authConfig={marketData.authConfig} />;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-black text-white overflow-hidden theme-transition font-rajdhani">
      {isSubmitting && (
        <div className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-3xl flex items-center justify-center">
           <div className="flex flex-col items-center gap-12">
              <Database className="text-[#FACC15] animate-spin" size={120} />
              <p className="text-[#FACC15] font-tactical text-[18px] uppercase tracking-[0.8em]">SYNC_LEDGER</p>
           </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 rounded-xl border-2 bg-black border-[#FACC15]/40 shadow-[0_0_50px_rgba(250,204,21,0.2)] flex items-center gap-4 animate-in slide-in-from-top-12">
          <div className="w-2.5 h-2.5 bg-[#FACC15] rounded-full animate-pulse shadow-[0_0_10px_#FACC15]" />
          <span className="text-[10px] md:text-[11px] font-tactical uppercase tracking-[0.2em] text-white">{toast.message}</span>
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
          onToggleTheme={() => {}} 
          onNavigateToProfile={() => setActiveTab('profile')}
          onNavigateToWallet={() => setActiveTab('settings')}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 space-y-12 md:space-y-16 pb-32 lg:pb-12 scrollbar-hide">
          {activeTab === 'market' && (
            <div className="max-w-[1600px] mx-auto space-y-16 animate-in fade-in duration-700">
               
               {/* IMMERSIVE HERO STAGE (CONSOLE STYLE) */}
               {featuredLead && (
                 <div className="relative group rounded-[3rem] overflow-hidden border-2 border-white/5 shadow-2xl h-[380px] flex items-center">
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10" />
                    <div className="absolute inset-0 z-0">
                       <img src="https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover grayscale opacity-30 group-hover:scale-105 transition-transform duration-1000" />
                    </div>
                    
                    <div className="relative z-20 px-12 space-y-5 max-w-2xl">
                       <div className="flex items-center gap-4">
                          <div className="px-3 py-1 bg-[#FACC15] text-black font-tactical text-[9px] tracking-[0.2em] rounded-full flex items-center gap-2">
                             <Star size={10} fill="currentColor" /> FEATURED_ASSET
                          </div>
                          <span className="text-neutral-500 font-tactical text-[9px] uppercase tracking-widest">TIER: LEGENDARY</span>
                       </div>
                       
                       <h1 className="text-4xl md:text-5xl font-tactical font-black text-white uppercase tracking-tighter leading-none">
                          {featuredLead.title}
                       </h1>
                       
                       <p className="text-neutral-400 font-medium text-base leading-relaxed max-w-lg line-clamp-2">
                          {featuredLead.description}
                       </p>

                       <div className="flex items-center gap-6 pt-2">
                          <button 
                            onClick={() => setSelectedLeadForBid(featuredLead)}
                            className="px-8 py-4 bg-white text-black rounded-xl font-tactical text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 hover:bg-[#FACC15] transition-all transform active:scale-95 shadow-2xl"
                          >
                             <PlayCircle size={16} /> ENTER_AUCTION
                          </button>
                          <div className="flex flex-col">
                             <span className="text-[7px] font-tactical text-neutral-600 uppercase tracking-widest">CURRENT_PRICE</span>
                             <span className="text-xl font-tactical text-white tracking-widest">${featuredLead.currentBid.toLocaleString()}</span>
                          </div>
                       </div>
                    </div>

                    {/* Stats HUD Overlay */}
                    <div className="absolute top-10 right-12 z-20 hidden xl:block">
                       <DashboardStats leads={marketData.leads} user={user!} />
                    </div>
                 </div>
               )}

               {/* RECENT ASSETS SECTION (CONSOLE STYLE) */}
               <div className="space-y-10">
                  <div className="flex items-end justify-between px-4">
                     <div>
                        <h2 className="text-lg md:text-xl font-tactical font-black text-white uppercase tracking-tighter leading-none">
                           ASSET <span className="text-[#FACC15]">LIBRARY</span>
                        </h2>
                        <p className="text-[9px] text-neutral-600 font-tactical uppercase tracking-[0.4em] mt-2">Live Inventory Node // {marketData.leads.length} Assets</p>
                     </div>
                     <div className="flex items-center gap-4 text-neutral-700">
                        <span className="text-[9px] font-tactical uppercase tracking-widest">SORT: QUALITY</span>
                        <div className="w-px h-6 bg-neutral-900" />
                        <TrendingUp size={16} />
                     </div>
                  </div>

                  <MemoizedLeadGrid 
                    leads={marketData.leads} 
                    onBid={(id) => setSelectedLeadForBid(marketData.leads.find(l => l.id === id) || null)} 
                    onEdit={setSelectedLeadForEdit} 
                    onToggleWishlist={(id) => apiService.toggleWishlist(user!.id, id).then(fetchAppData)} 
                    userRole={user!.role} 
                    currentUserId={user!.id} 
                    wishlist={user!.wishlist || []} 
                    activeBids={activeBidIds} 
                  />
               </div>

               {/* DATA VISUALIZATION FOOTER */}
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-12 border-t border-neutral-900">
                  <div className="lg:col-span-8">
                     <div className="bg-[#050505] rounded-[3rem] border border-neutral-800/40 p-2 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-8 left-12 z-20">
                           <span className="text-[9px] font-tactical text-[#FACC15] uppercase tracking-[0.3em] bg-black/80 px-4 py-1.5 rounded-full border border-[#FACC15]/20 backdrop-blur-md">GLOBAL_COVERAGE</span>
                        </div>
                        <WorldMarketMap leads={marketData.leads} users={marketData.users} onSelectCountry={() => {}} selectedCountry={null} />
                     </div>
                  </div>
                  <div className="lg:col-span-4">
                     <div className="bg-[#050505] p-10 rounded-[3rem] border border-neutral-800/40 h-full flex flex-col shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FACC15]/5 rounded-full blur-[60px]" />
                        <div className="flex justify-between items-center border-b border-neutral-900 pb-6 mb-8 relative z-10">
                           <h4 className="text-[10px] font-tactical text-neutral-500 uppercase tracking-[0.3em] flex items-center gap-3">
                              <History size={16} className="text-[#FACC15]" /> BROADCAST_LOG
                           </h4>
                           <div className="w-2 h-2 bg-[#FACC15] rounded-full animate-pulse shadow-[0_0_12px_#FACC15]" />
                        </div>
                        
                        <div className="flex-1 space-y-4 overflow-y-auto scrollbar-hide max-h-[400px] relative z-10">
                           {marketData.notifications.length > 0 ? (
                             marketData.notifications.map((n, idx) => (
                               <div key={idx} className="bg-[#0A0A0A] p-6 rounded-2xl border border-neutral-900 flex items-center justify-between group/item hover:border-[#FACC15]/30 transition-all hover:-translate-x-1 duration-300">
                                  <div className="flex items-center gap-4">
                                     <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black border border-neutral-800 text-[#FACC15] group-hover/item:border-[#FACC15]/40 transition-colors">
                                        {n.type === 'buy' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                                     </div>
                                     <div className="min-w-0">
                                        <p className="text-[10px] text-neutral-200 font-tactical uppercase tracking-tight truncate max-w-[180px] group-hover/item:text-white">{n.message}</p>
                                        <p className="text-[7px] text-neutral-700 font-tactical uppercase mt-1">{n.timestamp}</p>
                                     </div>
                                  </div>
                               </div>
                             ))
                           ) : (
                             <div className="py-24 text-center opacity-20">
                                <History size={32} className="mx-auto text-neutral-900 mb-4" />
                                <p className="text-[8px] text-neutral-700 font-tactical uppercase tracking-[0.4em]">STREAM_OFFLINE</p>
                             </div>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'admin' && (
            <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
               <div className="px-1">
                  <h2 className="text-3xl md:text-5xl font-tactical font-black text-white uppercase tracking-tighter leading-none">
                    ROOT <span className="text-[#2DD4BF]">ACCESS</span>
                  </h2>
                  <p className="text-[7px] md:text-[10px] text-neutral-600 font-black uppercase tracking-[0.4em] mt-1.5 font-tactical">SYSTEM_OVERRIDE_ENABLED // v4.2</p>
               </div>

               {/* USER REGISTRY SECTION */}
               <div className="bg-[#000000] border border-[#1A1A1A] rounded-[2rem] p-8 shadow-2xl space-y-8">
                  <div className="flex items-center gap-4 border-b border-[#1A1A1A] pb-6">
                    <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-[#2DD4BF] border border-[#2DD4BF]/20">
                       <UserIcon size={20} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-white uppercase tracking-tight font-tactical">Node Registry</h3>
                       <p className="text-[9px] text-neutral-700 font-black uppercase tracking-widest mt-1 font-tactical">Manage global identity permissions</p>
                    </div>
                  </div>
                  
                  <UserManagement users={marketData.users} onUpdateUser={(id, updates) => apiService.updateUser(id, updates).then(fetchAppData)} />
               </div>

               {/* ASSET REGISTRY SECTION (LEAD MANAGEMENT) */}
               <div className="bg-[#000000] border border-[#1A1A1A] rounded-[2rem] p-8 shadow-2xl space-y-8">
                  <div className="flex items-center gap-4 border-b border-[#1A1A1A] pb-6">
                    <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-[#2DD4BF] border border-[#2DD4BF]/20">
                       <Layers size={20} />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-white uppercase tracking-tight font-tactical">Asset Registry</h3>
                       <p className="text-[9px] text-neutral-700 font-black uppercase tracking-widest mt-1 font-tactical">Manage global marketplace inventory</p>
                    </div>
                  </div>
                  
                  <LeadManagement 
                    leads={marketData.leads} 
                    onEditLead={setSelectedLeadForEdit} 
                    onDeleteLead={(id) => apiService.deleteLead(id).then(fetchAppData)} 
                  />
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-8">
                     <div className="bg-[#000000] rounded-[2.5rem] border border-[#1A1A1A] p-2 shadow-2xl relative overflow-hidden">
                        <WorldMarketMap leads={marketData.leads} users={marketData.users} onSelectCountry={() => {}} selectedCountry={null} />
                     </div>
                     <RevenueChart history={marketData.analytics?.revenueHistory || []} />
                  </div>
                  <div className="lg:col-span-4">
                     <div className="bg-[#000000] p-8 rounded-[2.5rem] border border-[#1A1A1A] h-full flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center border-b border-[#1A1A1A] pb-6 mb-6">
                           <h4 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.3em] flex items-center gap-3 font-tactical">
                              <ShieldAlert size={16} className="text-[#2DD4BF]" /> MASTER_AUDIT
                           </h4>
                           <div className="w-2.5 h-2.5 bg-[#2DD4BF] rounded-full animate-pulse shadow-[0_0_12px_#2DD4BF]" />
                        </div>
                        
                        <div className="flex-1 space-y-4 overflow-y-auto scrollbar-hide">
                           {marketData.notifications.map((n, idx) => (
                             <div 
                              key={idx} 
                              onClick={() => setSelectedLogForInspection(n)}
                              className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#1A1A1A] flex items-center justify-between group cursor-pointer hover:border-[#2DD4BF]/40 transition-all"
                             >
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-black text-[#2DD4BF]">
                                      <Zap size={14} />
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-[11px] text-neutral-200 font-black uppercase tracking-tight truncate max-w-[150px] font-tactical">{n.message}</p>
                                      <p className="text-[8px] text-neutral-700 font-bold uppercase mt-1 font-tactical">{n.timestamp}</p>
                                   </div>
                                </div>
                                <ArrowRight size={14} className="text-neutral-800 group-hover:text-[#2DD4BF] transition-all" />
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'payment-config' && <AdminPaymentSettings gateways={marketData.gateways} onGatewaysChange={(gw) => apiService.updateGateways(gw).then(fetchAppData)} onDeploy={() => {}} />}
          {activeTab === 'auth-config' && <AdminOAuthSettings config={marketData.authConfig} onConfigChange={(cfg) => apiService.updateAuthConfig(cfg).then(fetchAppData)} />}
          {activeTab === 'ledger' && (
            <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700">
               <div className="px-1">
                  <h2 className="text-3xl md:text-5xl font-tactical font-black text-white uppercase tracking-tighter leading-none">
                    AUDIT <span className="text-[#FACC15]">LEDGER</span>
                  </h2>
                  <p className="text-[7px] md:text-[10px] text-neutral-600 font-bold uppercase tracking-[0.4em] mt-1.5 font-tactical">IMMUTABLE_LOG // HUB_01</p>
               </div>
               
               <UserActivityHub 
                 userId={user!.id} 
                 purchaseRequests={marketData.purchaseRequests} 
                 notifications={marketData.notifications} 
                 leads={marketData.leads} 
                 onViewManifest={setSelectedPurchaseForManifest}
                 onEditSync={setSelectedPurchaseForEdit}
               />

               <div className="pt-8 border-t border-neutral-900">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-10 h-10 bg-[#FACC15]/10 rounded-xl flex items-center justify-center text-[#FACC15]">
                       <ShieldCheck size={20} />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tighter font-tactical">Settlement Ledger</h3>
                  </div>
                  <InvoiceLedger invoices={userInvoices} />
               </div>
            </div>
          )}
          {activeTab === 'profile' && <ProfileSettings user={user!} onUpdate={(u) => apiService.updateUser(user!.id, u).then(fetchAppData)} />}
          {activeTab === 'settings' && <WalletSettings stripeConnected={user!.stripeConnected} onConnect={() => {}} balance={user!.balance} onDeposit={(amt) => apiService.deposit(user!.id, amt).then(fetchAppData)} gateways={marketData.gateways} />}
          {activeTab === 'create' && <LeadSubmissionForm onSubmit={(l) => { setIsSubmitting(true); apiService.createLead({...l, ownerId: user!.id}).then(() => { fetchAppData(); setActiveTab('market'); showToast("PROVISIONED"); setIsSubmitting(false); }); }} />}
          {activeTab === 'wishlist' && (
            <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-600">
               <h2 className="text-3xl md:text-5xl font-tactical text-white uppercase tracking-tighter leading-none">
                 SAVED <span className="text-[#FACC15]">NODES</span>
               </h2>
               <div className="bg-[#000000] rounded-[2rem] border border-[#1A1A1A] p-6 shadow-2xl">
                <MemoizedLeadGrid leads={wishlistLeads} onBid={(id) => setSelectedLeadForBid(marketData.leads.find(l => l.id === id) || null)} onEdit={setSelectedLeadForEdit} onToggleWishlist={(id) => apiService.toggleWishlist(user!.id, id).then(fetchAppData)} userRole={user!.role} currentUserId={user!.id} wishlist={user!.wishlist || []} activeBids={activeBidIds} />
               </div>
            </div>
          )}
        </main>
        
        <div className="lg:hidden">
          <MobileNav activeTab={activeTab} onTabChange={setActiveTab} role={user!.role} />
        </div>
      </div>

      {showWelcome && user && (
        <WelcomeModal userName={user.name} onClose={() => setShowWelcome(false)} />
      )}

      {selectedLeadForBid && <BiddingModal lead={selectedLeadForBid} user={user!} onClose={() => setSelectedLeadForBid(null)} onSubmit={handleNewPurchase} onRefill={() => { setSelectedLeadForBid(null); setActiveTab('settings'); }} />}
      
      {selectedPurchaseForEdit && (
        <BiddingModal 
            lead={marketData.leads.find(l => l.id === selectedPurchaseForEdit.leadId) || featuredLead!} 
            user={user!} 
            existingPurchase={selectedPurchaseForEdit}
            onClose={() => setSelectedPurchaseForEdit(null)} 
            onSubmit={handlePurchaseUpdate} 
            onRefill={() => { setSelectedPurchaseForEdit(null); setActiveTab('settings'); }} 
        />
      )}

      {selectedLeadForEdit && (
        <AdminLeadActionsModal 
          lead={selectedLeadForEdit} 
          user={user!} 
          onClose={() => setSelectedLeadForEdit(null)} 
          onSave={(u) => {
            apiService.updateLead(u.id!, u).then(() => {
              fetchAppData();
              setSelectedLeadForEdit(null);
              // Do not force navigate back to market if we are in admin tab
              showToast("NODE_UPDATED");
            });
          }} 
          onDelete={(id) => {
            apiService.deleteLead(id).then(() => {
              fetchAppData();
              setSelectedLeadForEdit(null);
              showToast("NODE_PURGED");
            });
          }} 
        />
      )}
      {selectedLogForInspection && <LogInspectionModal notification={selectedLogForInspection} subjectUser={marketData.users.find(u => u.id === selectedLogForInspection.userId)} onClose={() => setSelectedLogForInspection(null)} />}
      {selectedPurchaseForManifest && (
        <PurchaseManifestModal 
          purchase={selectedPurchaseForManifest} 
          lead={marketData.leads.find(l => l.id === selectedPurchaseForManifest.leadId)} 
          onClose={() => setSelectedPurchaseForManifest(null)} 
        />
      )}
    </div>
  );
};

export default App;
