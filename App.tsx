import React, { useState, useEffect, useCallback, useRef, useMemo, memo, useDeferredValue } from 'react';
import { 
  TrendingUp, Settings, ShieldAlert, Package, 
  Inbox, CheckCircle, Activity, User as UserIcon, 
  BarChart3, Target, Info, XCircle, Heart, FileText
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

const SESSION_KEY = 'lb_session_v1';

interface AppMarketData {
  leads: Lead[];
  purchaseRequests: PurchaseRequest[];
  invoices: Invoice[];
  notifications: Notification[];
  analytics: PlatformAnalytics | null;
  authConfig: OAuthConfig;
  gateways: GatewayAPI[];
  lastUpdate?: string;
}

const MemoizedSidebar = memo(Sidebar);
const MemoizedHeader = memo(Header);
const MemoizedLeadGrid = memo(LeadGrid);
const MemoizedDashboardStats = memo(DashboardStats);
const MemoizedRevenueChart = memo(RevenueChart);
const MemoizedInvoiceLedger = memo(InvoiceLedger);

const App: React.FC = () => {
  const [authView, setAuthView] = useState<'login' | 'signup' | 'app'>('login');
  const [activeTab, setActiveTab] = useState<'market' | 'profile' | 'create' | 'settings' | 'bids' | 'admin' | 'inbox' | 'auth-config' | 'payment-config' | 'wishlist' | 'ledger'>('market');
  
  const [marketData, setMarketData] = useState<AppMarketData>(() => Object.freeze({
    leads: [],
    purchaseRequests: [],
    invoices: [],
    notifications: [],
    analytics: null,
    authConfig: { googleEnabled: false, googleClientId: '', googleClientSecret: '', facebookEnabled: false, facebookAppId: '', facebookAppSecret: '' },
    gateways: [],
    lastUpdate: ''
  }));

  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { return (localStorage.getItem('lb-theme') as 'light' | 'dark') || 'dark'; } catch { return 'dark'; }
  });

  const [selectedLeadForBid, setSelectedLeadForBid] = useState<Lead | null>(null);
  const [selectedLeadForAdminEdit, setSelectedLeadForAdminEdit] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const isSyncing = useRef(false);
  const userRef = useRef<User | null>(null);
  useEffect(() => { userRef.current = user; }, [user]);

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
      if (marketData.lastUpdate !== data.metadata?.last_updated) {
        setMarketData(Object.freeze({
          leads: data.leads || [],
          purchaseRequests: data.purchaseRequests || [],
          invoices: data.invoices || [],
          notifications: data.notifications || [],
          analytics: data.analytics || null,
          authConfig: data.authConfig || marketData.authConfig,
          gateways: data.gateways || marketData.gateways,
          lastUpdate: data.metadata?.last_updated
        }));
      }
      const activeId = localStorage.getItem(SESSION_KEY) || userRef.current?.id;
      if (activeId) {
        const currentUser = data.users?.find((u: User) => u.id === activeId);
        if (currentUser && (userRef.current?.balance !== currentUser.balance || userRef.current?.id !== currentUser.id)) {
          setUser(currentUser);
          setAuthView(prev => prev !== 'app' ? 'app' : prev);
        }
      }
    } catch (error) { console.warn('Sync Failed'); } finally { isSyncing.current = false; setIsLoading(false); }
  }, [isTabVisible, marketData.lastUpdate, marketData.authConfig, marketData.gateways]);

  useEffect(() => { 
    fetchAppData();
    const interval = setInterval(fetchAppData, 30000);
    return () => clearInterval(interval);
  }, [fetchAppData]);

  const wishlistLeads = useMemo(() => marketData.leads.filter(l => user?.wishlist?.includes(l.id)), [marketData.leads, user?.wishlist]);
  const activeBidIds = useMemo(() => marketData.purchaseRequests.filter(pr => pr.userId === user?.id).map(pr => pr.leadId), [marketData.purchaseRequests, user?.id]);
  const userInvoices = useMemo(() => user?.role === 'admin' ? marketData.invoices : marketData.invoices.filter(inv => inv.userId === user?.id), [marketData.invoices, user?.id, user?.role]);

  const handleLogin = (loggedUser: User) => {
    localStorage.setItem(SESSION_KEY, loggedUser.id);
    setUser(loggedUser);
    setAuthView('app');
    setActiveTab('market');
    showToast(`Session Active: ${loggedUser.name}`);
  };

  const handleLogout = () => { 
    localStorage.removeItem(SESSION_KEY);
    setUser(null); 
    setAuthView('login'); 
    showToast("Session closed.", "info");
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-[var(--bg-platform)]">
      <div className="flex flex-col items-center gap-4">
        <Activity className="text-[var(--text-accent)] animate-spin" size={32} />
        <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 italic">Synchronizing Marketplace...</p>
      </div>
    </div>
  );

  if (authView === 'login') return <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} authConfig={marketData.authConfig} />;
  if (authView === 'signup') return <Signup onSignup={handleLogin} onSwitchToLogin={() => setAuthView('login')} />;
  if (!user) return null;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[var(--bg-platform)] text-[var(--text-main)] overflow-hidden theme-transition optimize-gpu contain-strict">
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl shadow-xl border bg-[var(--bg-surface)] border-[var(--border-main)] flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle className="text-[var(--text-accent)]" size={16} />
          <span className="text-[10px] font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      <div className="hidden lg:flex will-change-transform">
        <MemoizedSidebar activeTab={activeTab} onTabChange={setActiveTab} role={user.role} onLogout={handleLogout} hasInbox={marketData.notifications.some(n => !n.read)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden will-change-transform">
        <MemoizedHeader user={user} notifications={marketData.notifications} onClearNotifications={() => apiService.clearNotifications().then(fetchAppData)} theme={theme} onToggleTheme={toggleTheme} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 space-y-8 pb-32 lg:pb-10 scroll-smooth contain-layout">
          {activeTab === 'market' && (
            <div className="space-y-8 animate-in fade-in duration-200">
               <h2 className="text-xl font-black text-[var(--text-main)] italic uppercase flex items-center gap-3"><TrendingUp className="text-[var(--text-accent)]" /> Market Floor</h2>
               <MemoizedDashboardStats leads={marketData.leads} user={user} />
               <MemoizedLeadGrid leads={marketData.leads} onBid={(id) => setSelectedLeadForBid(marketData.leads.find(l => l.id === id) || null)} onAdminEdit={setSelectedLeadForAdminEdit} onAdminApprove={(id) => apiService.updateLead(id, { status: 'approved' }).then(fetchAppData)} onAdminReject={(id) => apiService.updateLead(id, { status: 'rejected' }).then(fetchAppData)} onDelete={(id) => apiService.deleteLead(id).then(fetchAppData)} onToggleWishlist={(id) => apiService.toggleWishlist(user.id, id).then(fetchAppData)} userRole={user.role} currentUserId={user.id} wishlist={user.wishlist} activeBids={activeBidIds} />
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-8 animate-in fade-in duration-200">
               <h2 className="text-xl font-black text-[var(--text-main)] italic uppercase flex items-center gap-3"><Heart className="text-red-500" /> Saved Nodes</h2>
               <MemoizedLeadGrid leads={wishlistLeads} onBid={(id) => setSelectedLeadForBid(marketData.leads.find(l => l.id === id) || null)} onToggleWishlist={(id) => apiService.toggleWishlist(user.id, id).then(fetchAppData)} userRole={user.role} currentUserId={user.id} wishlist={user.wishlist} activeBids={activeBidIds} />
            </div>
          )}

          {activeTab === 'ledger' && <MemoizedInvoiceLedger invoices={userInvoices} />}

          {activeTab === 'admin' && user.role === 'admin' && (
             <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-200">
                <h2 className="text-xl font-black text-[var(--text-main)] italic uppercase flex items-center gap-3"><ShieldAlert className="text-[var(--text-accent)]" /> Global Operator View</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-[var(--bg-card)] p-6 rounded-2xl border border-[var(--border-main)]">
                      <BarChart3 className="text-emerald-500 mb-2" size={20} />
                      <p className="text-[9px] text-neutral-500 font-black uppercase tracking-widest">Global Throughput</p>
                      <p className="text-lg font-black text-[var(--text-main)] italic">${marketData.analytics?.totalVolume.toLocaleString()}</p>
                  </div>
                  {marketData.analytics && <MemoizedRevenueChart history={marketData.analytics.revenueHistory} />}
                </div>
                <div className="space-y-6">
                   <h3 className="text-sm font-black text-neutral-500 uppercase tracking-widest italic border-b border-[var(--border-main)] pb-2">Full Inventory Oversight</h3>
                   <MemoizedLeadGrid leads={marketData.leads} onBid={() => {}} onAdminEdit={setSelectedLeadForAdminEdit} userRole={user.role} currentUserId={user.id} />
                </div>
             </div>
          )}

          {activeTab === 'auth-config' && user.role === 'admin' && <AdminOAuthSettings config={marketData.authConfig} onConfigChange={(cfg) => apiService.updateAuthConfig(cfg).then(() => { fetchAppData(); showToast("Identity Config Updated"); })} />}
          {activeTab === 'payment-config' && user.role === 'admin' && <AdminPaymentSettings gateways={marketData.gateways} onGatewaysChange={(gws) => apiService.updateGateways(gws).then(fetchAppData)} onDeploy={() => { fetchAppData(); showToast("Financial Nodes Deployed"); }} />}
          {activeTab === 'profile' && <ProfileSettings user={user} onUpdate={(u) => apiService.updateLead(user.id, u).then(fetchAppData)} />}
          {activeTab === 'settings' && <WalletSettings stripeConnected={user.stripeConnected} onConnect={() => {}} balance={user.balance} onDeposit={(amt) => apiService.deposit(user.id, amt).then(fetchAppData)} gateways={marketData.gateways} />}
          {activeTab === 'create' && <LeadSubmissionForm onSubmit={(l) => apiService.createLead({...l, ownerId: user.id}).then(() => { fetchAppData(); setActiveTab('market'); })} />}
        </main>
        <div className="lg:hidden">
          <MobileNav activeTab={activeTab} onTabChange={setActiveTab} role={user.role} />
        </div>
      </div>

      {selectedLeadForBid && <BiddingModal lead={selectedLeadForBid} userBalance={user.balance} onClose={() => setSelectedLeadForBid(null)} onSubmit={(d) => apiService.placeBid({ userId: user.id, leadId: selectedLeadForBid.id, ...d }).then(() => { fetchAppData(); setSelectedLeadForBid(null); })} onRefill={() => setActiveTab('settings')} />}
      {selectedLeadForAdminEdit && <AdminLeadActionsModal lead={selectedLeadForAdminEdit} onClose={() => setSelectedLeadForAdminEdit(null)} onSave={(u) => apiService.updateLead(u.id!, u).then(fetchAppData)} onDelete={(id) => apiService.deleteLead(id).then(fetchAppData)} />}
    </div>
  );
};

export default App;