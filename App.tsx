import React, { useState, useEffect, useCallback, useRef, useMemo, memo, useDeferredValue } from 'react';
import { 
  TrendingUp, Settings, ShieldAlert, Package, 
  Inbox, CheckCircle, Activity, User as UserIcon, 
  BarChart3, Target, Info, XCircle, Heart, FileText, Database, Server,
  Loader2, Gavel
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
import BiddingModal, { BiddingFormData } from './components/BiddingModal.tsx';
import AdminLeadActionsModal from './components/AdminLeadActionsModal.tsx';
import AdminOAuthSettings from './components/AdminOAuthSettings.tsx';
import AdminPaymentSettings, { GatewayAPI } from './components/AdminPaymentSettings.tsx';
import RevenueChart from './components/RevenueChart.tsx';
import InvoiceLedger from './components/InvoiceLedger.tsx';
import { Lead, User, PurchaseRequest, Notification, PlatformAnalytics, OAuthConfig, Invoice } from './types.ts';
import { apiService } from './services/apiService.ts';
import { soundService } from './services/soundService.ts';

const SESSION_KEY = 'lb_session_v3';
const USER_DATA_KEY = 'lb_user_v3';
const AUTH_VIEW_KEY = 'lb_auth_view_v3';

interface AppMarketData {
  leads: Lead[];
  purchaseRequests: PurchaseRequest[];
  invoices: Invoice[];
  notifications: Notification[];
  analytics: PlatformAnalytics | null;
  authConfig: OAuthConfig;
  gateways: GatewayAPI[];
  lastUpdate?: string;
  db_size?: number;
}

const MemoizedSidebar = memo(Sidebar);
const MemoizedHeader = memo(Header);
const MemoizedLeadGrid = memo(LeadGrid);

const App: React.FC = () => {
  // Global click sound effect
  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, input, select, textarea');
      soundService.playClick(!!isInteractive);
    };

    window.addEventListener('mousedown', handleGlobalClick);
    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  // Persist Auth View state across refreshes
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
  
  const [marketData, setMarketData] = useState<AppMarketData>({
    leads: [],
    purchaseRequests: [],
    invoices: [],
    notifications: [],
    analytics: null,
    authConfig: { googleEnabled: false, googleClientId: '', googleClientSecret: '', facebookEnabled: false, facebookAppId: '', facebookAppSecret: '' },
    gateways: [],
    lastUpdate: ''
  });

  // Persist User object across refreshes for instant load
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
  const [selectedLeadForAdminEdit, setSelectedLeadForAdminEdit] = useState<Lead | null>(null);
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

  useEffect(() => {
    localStorage.setItem(AUTH_VIEW_KEY, authView);
  }, [authView]);

  const [isTabVisible, setIsTabVisible] = useState(true);
  useEffect(() => {
    const handleVisibility = () => setIsTabVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    try { localStorage.setItem('lb-theme', theme); } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => setTheme(prev => prev === 'dark' ? 'light' : 'dark'), []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchAppData = useCallback(async () => {
    if (isSyncing.current || !isTabVisible) return;
    isSyncing.current = true;
    try {
      const data = await apiService.getData();
      
      setMarketData(prev => {
        if (prev.lastUpdate === data.metadata?.last_updated) return prev;
        return {
          leads: data.leads || [],
          purchaseRequests: data.purchaseRequests || [],
          invoices: data.invoices || [],
          notifications: data.notifications || [],
          analytics: data.analytics || null,
          authConfig: data.authConfig || prev.authConfig,
          gateways: data.gateways || prev.gateways,
          lastUpdate: data.metadata?.last_updated,
          db_size: data.metadata?.db_size
        };
      });

      const activeId = localStorage.getItem(SESSION_KEY) || userRef.current?.id;
      if (activeId) {
        const currentUser = data.users?.find((u: User) => u.id === activeId);
        if (currentUser) {
          const hasChanged = JSON.stringify(userRef.current) !== JSON.stringify(currentUser);
          if (hasChanged) {
            setUser(currentUser);
            if (authView !== 'app') setAuthView('app');
          }
        } else if (!userRef.current) {
          // session exists logic
        }
      }
    } catch (error) { 
      console.warn('Sync Failed'); 
    } finally { 
      isSyncing.current = false; 
      setIsLoading(false); 
    }
  }, [isTabVisible, authView]);

  useEffect(() => { 
    fetchAppData();
    const interval = setInterval(fetchAppData, 30000);
    return () => clearInterval(interval);
  }, [fetchAppData]);

  const wishlistLeads = useMemo(() => marketData.leads.filter(l => user?.wishlist?.includes(l.id)), [marketData.leads, user?.wishlist]);
  const activeBidIds = useMemo(() => marketData.purchaseRequests.filter(pr => pr.userId === user?.id).map(pr => pr.leadId), [marketData.purchaseRequests, user?.id]);
  const portfolioLeads = useMemo(() => marketData.leads.filter(l => activeBidIds.includes(l.id)), [marketData.leads, activeBidIds]);
  const userInvoices = useMemo(() => user?.role === 'admin' ? marketData.invoices : marketData.invoices.filter(inv => inv.userId === user?.id), [marketData.invoices, user?.id, user?.role]);

  const handleLogin = (loggedUser: User) => {
    localStorage.setItem(SESSION_KEY, loggedUser.id);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(loggedUser));
    localStorage.setItem(AUTH_VIEW_KEY, 'app');
    setUser(loggedUser);
    setAuthView('app');
    setActiveTab('market');
    showToast(`Session Active: ${loggedUser.name}`);
  };

  const handleLogout = useCallback(() => { 
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    localStorage.setItem(AUTH_VIEW_KEY, 'login');
    setUser(null); 
    setAuthView('login'); 
    showToast("Session closed.", "info");
  }, [showToast]);

  const handleRefillFromModal = useCallback(() => {
    setSelectedLeadForBid(null);
    setActiveTab('settings');
  }, []);

  const handleBulkApprove = useCallback(async (ids: string[]) => {
    setIsSubmitting(true);
    try {
      await Promise.all(ids.map(id => apiService.updateLead(id, { status: 'approved' })));
      await fetchAppData();
      showToast(`Batch Protocol: ${ids.length} nodes approved.`);
    } catch (e) {
      showToast("Batch Error: Signal Interrupted.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchAppData, showToast]);

  const handleBulkReject = useCallback(async (ids: string[]) => {
    setIsSubmitting(true);
    try {
      await Promise.all(ids.map(id => apiService.updateLead(id, { status: 'rejected' })));
      await fetchAppData();
      showToast(`Batch Protocol: ${ids.length} nodes rejected.`);
    } catch (e) {
      showToast("Batch Error: Signal Interrupted.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }, [fetchAppData, showToast]);

  if (isLoading && !user) return (
    <div className="h-screen flex items-center justify-center bg-[var(--bg-platform)]">
      <div className="flex flex-col items-center gap-4">
        <Server className="text-neutral-800 animate-pulse" size={32} />
        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-700 italic">Syncing AI Database Node...</p>
      </div>
    </div>
  );

  if (authView === 'login') return <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} authConfig={marketData.authConfig} />;
  if (authView === 'signup') return <Signup onSignup={handleLogin} onSwitchToLogin={() => setAuthView('login')} />;
  if (!user && authView === 'app') {
     return (
        <div className="h-screen flex items-center justify-center bg-[var(--bg-platform)]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-neutral-800" size={32} />
            <p className="text-[9px] font-black uppercase tracking-widest text-neutral-700 italic">Restoring Session...</p>
          </div>
        </div>
     );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[var(--bg-platform)] text-[var(--text-main)] overflow-hidden theme-transition optimize-gpu contain-strict">
      {isSubmitting && (
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-md flex items-center justify-center animate-in fade-in duration-300">
           <div className="flex flex-col items-center gap-4">
              <Database className="text-neutral-500 animate-bounce" size={48} />
              <p className="text-neutral-400 font-black text-xs uppercase tracking-[0.3em]">Committing to Ledger...</p>
           </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl shadow-xl border bg-neutral-900/60 border-neutral-800/40 backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle className="text-[#facc15]/60" size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-300">{toast.message}</span>
        </div>
      )}

      <div className="hidden lg:flex will-change-transform">
        <MemoizedSidebar activeTab={activeTab} onTabChange={setActiveTab} role={user!.role} onLogout={handleLogout} hasInbox={marketData.notifications.some(n => !n.read)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden will-change-transform">
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
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 space-y-8 pb-32 lg:pb-10 scroll-smooth contain-layout">
          {activeTab === 'market' && (
            <div className="space-y-8 animate-in fade-in duration-200">
               <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black text-neutral-400 italic uppercase flex items-center gap-3"><TrendingUp className="text-[#facc15]/40" /> Market Floor</h2>
                  <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-black/20 border border-neutral-800/30 rounded-full shadow-sm">
                    <Database size={10} className="text-neutral-700" />
                    <span className="text-[8px] font-black text-neutral-700 uppercase tracking-widest">{marketData.db_size ? `${(marketData.db_size / 1024).toFixed(1)}KB` : 'SYNCING'}</span>
                  </div>
               </div>
               <DashboardStats leads={marketData.leads} user={user!} />
               <MemoizedLeadGrid 
                leads={marketData.leads} 
                onBid={(id) => setSelectedLeadForBid(marketData.leads.find(l => l.id === id) || null)} 
                onAdminEdit={setSelectedLeadForAdminEdit} 
                onAdminApprove={(id) => apiService.updateLead(id, { status: 'approved' }).then(fetchAppData)} 
                onAdminReject={(id) => apiService.updateLead(id, { status: 'rejected' }).then(fetchAppData)} 
                onBulkApprove={handleBulkApprove}
                onBulkReject={handleBulkReject}
                onDelete={(id) => apiService.deleteLead(id).then(fetchAppData)} 
                onToggleWishlist={(id) => apiService.toggleWishlist(user!.id, id).then(fetchAppData)} 
                userRole={user!.role} 
                currentUserId={user!.id} 
                wishlist={user!.wishlist || []} 
                activeBids={activeBidIds} 
               />
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-8 animate-in fade-in duration-200">
               <h2 className="text-xl font-black text-neutral-400 italic uppercase flex items-center gap-3"><Heart className="text-red-900/60" /> Saved Nodes</h2>
               <MemoizedLeadGrid leads={wishlistLeads} onBid={(id) => setSelectedLeadForBid(marketData.leads.find(l => l.id === id) || null)} onToggleWishlist={(id) => apiService.toggleWishlist(user!.id, id).then(fetchAppData)} userRole={user!.role} currentUserId={user!.id} wishlist={user!.wishlist || []} activeBids={activeBidIds} />
            </div>
          )}

          {activeTab === 'bids' && (
            <div className="space-y-8 animate-in fade-in duration-200">
               <h2 className="text-xl font-black text-neutral-400 italic uppercase flex items-center gap-3"><Gavel className="text-emerald-900/60" /> Active Portfolio</h2>
               <MemoizedLeadGrid leads={portfolioLeads} onBid={(id) => setSelectedLeadForBid(marketData.leads.find(l => l.id === id) || null)} onToggleWishlist={(id) => apiService.toggleWishlist(user!.id, id).then(fetchAppData)} userRole={user!.role} currentUserId={user!.id} wishlist={user!.wishlist || []} activeBids={activeBidIds} />
            </div>
          )}

          {activeTab === 'ledger' && <InvoiceLedger invoices={userInvoices} />}

          {activeTab === 'admin' && user!.role === 'admin' && (
             <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-200">
                <h2 className="text-xl font-black text-neutral-400 italic uppercase flex items-center gap-3"><ShieldAlert className="text-[#facc15]/40" /> Control Room</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-[#121212]/40 p-6 rounded-2xl border border-neutral-800/30 shadow-sm flex flex-col justify-center">
                      <BarChart3 className="text-emerald-900/40 mb-2" size={20} />
                      <p className="text-[9px] text-neutral-700 font-black uppercase tracking-widest">Global Volume</p>
                      <p className="text-lg font-black text-neutral-300 italic">${marketData.analytics?.totalVolume.toLocaleString()}</p>
                  </div>
                  {marketData.analytics && <RevenueChart history={marketData.analytics.revenueHistory} />}
                </div>
                <div className="space-y-6">
                   <h3 className="text-[10px] font-black text-neutral-700 uppercase tracking-widest italic border-b border-neutral-800/20 pb-2">Full Inventory Oversight</h3>
                   <MemoizedLeadGrid 
                    leads={marketData.leads} 
                    onBid={() => {}} 
                    onAdminEdit={setSelectedLeadForAdminEdit} 
                    onBulkApprove={handleBulkApprove}
                    onBulkReject={handleBulkReject}
                    userRole={user!.role} 
                    currentUserId={user!.id} 
                   />
                </div>
             </div>
          )}

          {activeTab === 'auth-config' && user!.role === 'admin' && <AdminOAuthSettings config={marketData.authConfig} onConfigChange={(cfg) => apiService.updateAuthConfig(cfg).then((res) => { fetchAppData(); showToast("Identity Node Updated"); return res; })} />}
          {activeTab === 'payment-config' && user!.role === 'admin' && <AdminPaymentSettings gateways={marketData.gateways} onGatewaysChange={(gws) => apiService.updateGateways(gws).then(fetchAppData)} onDeploy={() => { fetchAppData(); showToast("Gateways Deployed"); }} />}
          {activeTab === 'profile' && <ProfileSettings user={user!} onUpdate={(u) => apiService.updateUser(user!.id, u).then(fetchAppData)} />}
          {activeTab === 'settings' && <WalletSettings stripeConnected={user!.stripeConnected} onConnect={() => {}} balance={user!.balance} onDeposit={(amt) => apiService.deposit(user!.id, amt).then(fetchAppData)} gateways={marketData.gateways} />}
          {activeTab === 'create' && <LeadSubmissionForm onSubmit={(l) => { setIsSubmitting(true); apiService.createLead({...l, ownerId: user!.id}).then(() => { fetchAppData(); setActiveTab('market'); showToast("Lead Provisioned Successfully"); setIsSubmitting(false); }); }} />}
          {activeTab === 'inbox' && (
             <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl">
                <h2 className="text-xl font-black text-neutral-400 italic uppercase flex items-center gap-3"><Inbox className="text-[#facc15]/40" /> System Logs</h2>
                <div className="bg-[#111111]/40 border border-neutral-800/30 rounded-3xl overflow-hidden shadow-md">
                   {marketData.notifications.length === 0 ? (
                      <div className="p-20 text-center"><p className="text-neutral-700 text-xs font-black uppercase tracking-widest">No Incoming Logs</p></div>
                   ) : (
                      marketData.notifications.map(n => (
                        <div key={n.id} className="p-6 border-b border-neutral-800/10 flex items-center justify-between hover:bg-white/5 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center text-neutral-600"><Database size={14} /></div>
                              <div>
                                 <p className="text-xs text-neutral-400 font-bold">{n.message}</p>
                                 <span className="text-[9px] text-neutral-700 font-black uppercase">{n.timestamp}</span>
                              </div>
                           </div>
                           <span className="text-[8px] px-2 py-0.5 rounded-full bg-neutral-800/40 text-neutral-600 font-black uppercase tracking-widest">{n.type}</span>
                        </div>
                      ))
                   )}
                </div>
             </div>
          )}
        </main>
        <div className="lg:hidden">
          <MobileNav activeTab={activeTab} onTabChange={setActiveTab} role={user!.role} />
        </div>
      </div>

      {selectedLeadForBid && <BiddingModal lead={selectedLeadForBid} user={user!} onClose={() => setSelectedLeadForBid(null)} onSubmit={(d) => { setIsSubmitting(true); apiService.placeBid({ userId: user!.id, leadId: selectedLeadForBid.id, ...d }).then(() => { fetchAppData(); setSelectedLeadForBid(null); setIsSubmitting(false); showToast("Bid Committed to Ledger"); }); }} onRefill={handleRefillFromModal} />}
      {selectedLeadForAdminEdit && <AdminLeadActionsModal lead={selectedLeadForAdminEdit} onClose={() => setSelectedLeadForAdminEdit(null)} onSave={(u) => apiService.updateLead(u.id!, u).then(fetchAppData)} onDelete={(id) => apiService.deleteLead(id).then(fetchAppData)} />}
    </div>
  );
};

export default App;