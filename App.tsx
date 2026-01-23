import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
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
}

const App: React.FC = () => {
  const [authView, setAuthView] = useState<'login' | 'signup' | 'app'>('login');
  const [activeTab, setActiveTab] = useState<'market' | 'profile' | 'create' | 'settings' | 'bids' | 'admin' | 'inbox' | 'auth-config' | 'payment-config' | 'wishlist' | 'ledger'>('market');
  
  // Unified market data state to prevent render storms
  const [marketData, setMarketData] = useState<AppMarketData>({
    leads: [],
    purchaseRequests: [],
    invoices: [],
    notifications: [],
    analytics: null,
    authConfig: { googleEnabled: false, googleClientId: '', googleClientSecret: '', facebookEnabled: false, facebookAppId: '', facebookAppSecret: '' },
    gateways: []
  });

  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('lb-theme') as 'light' | 'dark') || 'dark';
    } catch {
      return 'dark';
    }
  });

  const [selectedLeadForBid, setSelectedLeadForBid] = useState<Lead | null>(null);
  const [selectedLeadForAdminEdit, setSelectedLeadForAdminEdit] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const userRef = useRef<User | null>(null);
  useEffect(() => { userRef.current = user; }, [user]);

  useEffect(() => {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-theme', isDark);
    try { localStorage.setItem('lb-theme', theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const fetchAppData = useCallback(async () => {
    try {
      const data = await apiService.getData();
      
      // Batch update market data in a single render cycle
      setMarketData(prev => {
        const newData = {
          leads: data.leads || [],
          purchaseRequests: data.purchaseRequests || [],
          invoices: data.invoices || [],
          notifications: data.notifications || [],
          analytics: data.analytics || null,
          authConfig: data.authConfig || prev.authConfig,
          gateways: data.gateways || prev.gateways
        };
        // Quick deep compare to avoid useless renders
        if (JSON.stringify(prev) === JSON.stringify(newData)) return prev;
        return newData;
      });

      const savedUserId = localStorage.getItem(SESSION_KEY);
      const activeId = savedUserId || userRef.current?.id;
      
      if (activeId) {
        const currentUser = data.users?.find((u: User) => u.id === activeId);
        if (currentUser) {
          setUser(prev => {
            if (JSON.stringify(prev) === JSON.stringify(currentUser)) return prev;
            return currentUser;
          });
          setAuthView(prev => prev !== 'app' ? 'app' : prev);
        } else if (savedUserId) {
          localStorage.removeItem(SESSION_KEY);
        }
      }
    } catch (error) {
      console.error('Ledger Sync Error:', error);
      showToast("Node sync failed.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => { 
    fetchAppData();
    const interval = setInterval(fetchAppData, 15000);
    return () => clearInterval(interval);
  }, [fetchAppData]);

  // Derived state memoization to prevent expensive Admin re-renders
  const wishlistLeads = useMemo(() => 
    marketData.leads.filter(l => user?.wishlist?.includes(l.id)), 
    [marketData.leads, user?.wishlist]
  );

  const activeBidIds = useMemo(() => 
    marketData.purchaseRequests.filter(pr => pr.userId === user?.id).map(pr => pr.leadId),
    [marketData.purchaseRequests, user?.id]
  );

  const userInvoices = useMemo(() => 
    user?.role === 'admin' ? marketData.invoices : marketData.invoices.filter(inv => inv.userId === user?.id),
    [marketData.invoices, user?.id, user?.role]
  );

  const handleLogin = (loggedUser: User) => {
    try { localStorage.setItem(SESSION_KEY, loggedUser.id); } catch {}
    setUser(loggedUser);
    setAuthView('app');
    setActiveTab('market');
    showToast(`Welcome, ${loggedUser.name}`);
  };

  const handleSignup = async (newUser: User) => {
    try { localStorage.setItem(SESSION_KEY, newUser.id); } catch {}
    setUser(newUser);
    setAuthView('app');
    setActiveTab('market');
    showToast("Provisioning successful.");
  };

  const handleLogout = () => { 
    try { localStorage.removeItem(SESSION_KEY); } catch {}
    setUser(null); 
    setAuthView('login'); 
    showToast("Session terminated.", "info");
  };

  const handleBidSubmit = async (bidData: BiddingFormData) => {
    if (!user || !selectedLeadForBid) return;
    try {
      await apiService.placeBid({ userId: user.id, leadId: selectedLeadForBid.id, ...bidData });
      showToast("Buy order finalized.");
      setSelectedLeadForBid(null);
      fetchAppData();
    } catch (error: any) {
      showToast(error.message || "Transaction error.", "error");
    }
  };

  const handleUpdateLeadStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await apiService.updateLead(id, { status });
      showToast(`Protocol ${status}`);
      fetchAppData();
    } catch (error) { showToast("Status update failed.", "error"); }
  };

  const handleUpdateLeadDetails = async (updates: Partial<Lead>) => {
    if (!updates.id) return;
    try {
      await apiService.updateLead(updates.id, updates);
      showToast("Asset synchronized.");
      setSelectedLeadForAdminEdit(null);
      fetchAppData();
    } catch (error) { showToast("Sync failed.", "error"); }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Purge asset from global ledger?")) return;
    try {
      await apiService.deleteLead(id);
      showToast("Asset purged.", "info");
      setSelectedLeadForAdminEdit(null);
      fetchAppData();
    } catch (error) { showToast("Purge failed.", "error"); }
  };

  const handleToggleWishlist = async (leadId: string) => {
    if (!user) return;
    try {
      await apiService.toggleWishlist(user.id, leadId);
      fetchAppData();
    } catch (error) { showToast("Wishlist error.", "error"); }
  };

  const handleCreateLead = async (lead: Partial<Lead>) => {
    if (!user) return;
    try {
      await apiService.createLead({ ...lead, ownerId: user.id });
      showToast("Asset pending verification.");
      setActiveTab('market'); 
      fetchAppData();
    } catch (error) { showToast("Submission failed.", "error"); }
  };

  const handleDeposit = async (amount: number) => {
    if (!user) return;
    try {
      await apiService.deposit(user.id, amount);
      showToast(`Settled: $${amount}`);
      fetchAppData();
    } catch (error) { showToast("Deposit error.", "error"); }
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-[var(--bg-platform)]">
      <div className="flex flex-col items-center gap-6">
        <Activity className="text-[var(--text-accent)] animate-spin" size={48} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500">Node Syncing...</p>
      </div>
    </div>
  );

  if (authView === 'login') return <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} />;
  if (authView === 'signup') return <Signup onSignup={handleSignup} onSwitchToLogin={() => setAuthView('login')} />;
  if (!user) return null;

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[var(--bg-platform)] text-[var(--text-main)] overflow-hidden theme-transition">
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 animate-in slide-in-from-top-4 ${
          toast.type === 'error' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-[var(--text-accent)]/10 border-[var(--text-accent)] text-[var(--text-accent)]'
        }`}>
          {toast.type === 'error' ? <XCircle size={18} /> : <CheckCircle size={18} />}
          <span className="text-[11px] font-black uppercase tracking-widest">{toast.message}</span>
        </div>
      )}

      <div className="hidden lg:flex">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} role={user.role} onLogout={handleLogout} hasInbox={marketData.notifications.some(n => !n.read)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        <Header user={user} notifications={marketData.notifications} onClearNotifications={() => apiService.clearNotifications().then(fetchAppData)} theme={theme} onToggleTheme={toggleTheme} />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 space-y-8 pb-32 lg:pb-10 scroll-smooth">
          {activeTab === 'market' && (
            <div className="space-y-8">
               <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] italic uppercase flex items-center gap-3"><TrendingUp className="text-[var(--text-accent)]" /> Market Floor</h2>
               <DashboardStats leads={marketData.leads} user={user} />
               <LeadGrid 
                leads={marketData.leads} 
                onBid={(id) => setSelectedLeadForBid(marketData.leads.find(l => l.id === id) || null)} 
                onAdminEdit={(lead) => setSelectedLeadForAdminEdit(lead)}
                onAdminApprove={(id) => handleUpdateLeadStatus(id, 'approved')}
                onAdminReject={(id) => handleUpdateLeadStatus(id, 'rejected')}
                onDelete={handleDeleteLead}
                onToggleWishlist={handleToggleWishlist}
                userRole={user.role} 
                currentUserId={user.id}
                wishlist={user.wishlist}
                activeBids={activeBidIds}
               />
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-8">
               <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] italic uppercase flex items-center gap-3"><Heart className="text-red-500" /> Saved Assets</h2>
               {wishlistLeads.length === 0 ? (
                 <div className="bg-[var(--bg-card)] p-20 rounded-[3rem] border border-[var(--border-main)] text-center space-y-4">
                    <Heart className="text-neutral-300 mx-auto" size={48} />
                    <p className="text-neutral-500 text-xs font-black uppercase tracking-widest">Wishlist Empty.</p>
                 </div>
               ) : (
                <LeadGrid 
                  leads={wishlistLeads} 
                  onBid={(id) => setSelectedLeadForBid(marketData.leads.find(l => l.id === id) || null)} 
                  onToggleWishlist={handleToggleWishlist}
                  userRole={user.role} 
                  currentUserId={user.id}
                  wishlist={user.wishlist}
                  activeBids={activeBidIds}
                />
               )}
            </div>
          )}

          {activeTab === 'ledger' && <InvoiceLedger invoices={userInvoices} />}

          {activeTab === 'admin' && user.role === 'admin' && (
             <div className="max-w-7xl mx-auto space-y-12">
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] italic uppercase flex items-center gap-3"><ShieldAlert className="text-[var(--text-accent)]" /> Global Control</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-main)]">
                        <BarChart3 className="text-emerald-500 mb-4" size={24} />
                        <p className="text-[9px] text-neutral-600 font-black uppercase tracking-widest">Total Throughput</p>
                        <p className="text-xl font-black text-[var(--text-main)]">${marketData.analytics?.totalVolume.toLocaleString()}</p>
                    </div>
                    <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-main)]">
                        <Target className="text-[var(--text-accent)] mb-4" size={24} />
                        <p className="text-[9px] text-neutral-600 font-black uppercase tracking-widest">Inventory Size</p>
                        <p className="text-xl font-black text-[var(--text-main)]">{marketData.leads.length} Nodes</p>
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    {marketData.analytics?.revenueHistory && <RevenueChart history={marketData.analytics.revenueHistory} />}
                  </div>
                </div>
                <LeadGrid 
                  leads={marketData.leads} 
                  onBid={() => {}} 
                  onAdminEdit={setSelectedLeadForAdminEdit}
                  onAdminApprove={(id) => handleUpdateLeadStatus(id, 'approved')}
                  onAdminReject={(id) => handleUpdateLeadStatus(id, 'rejected')}
                  onDelete={handleDeleteLead}
                  userRole={user.role} 
                  currentUserId={user.id}
                />
             </div>
          )}

          {activeTab === 'auth-config' && user.role === 'admin' && <AdminOAuthSettings config={marketData.authConfig} onConfigChange={(cfg) => apiService.updateLead('config', cfg).then(fetchAppData)} />}
          {activeTab === 'payment-config' && user.role === 'admin' && <AdminPaymentSettings gateways={marketData.gateways} onGatewaysChange={(gws) => apiService.updateLead('gateways', gws).then(fetchAppData)} onDeploy={fetchAppData} />}
          {activeTab === 'create' && <LeadSubmissionForm onSubmit={handleCreateLead} />}
          {activeTab === 'profile' && <ProfileSettings user={user} onUpdate={(u) => apiService.updateLead(user.id, u).then(fetchAppData)} />}
          {activeTab === 'settings' && <WalletSettings stripeConnected={user.stripeConnected} onConnect={() => {}} balance={user.balance} onDeposit={handleDeposit} gateways={marketData.gateways} />}
        </main>
        
        <div className="lg:hidden">
          <MobileNav activeTab={activeTab} onTabChange={setActiveTab} role={user.role} />
        </div>
      </div>

      {selectedLeadForBid && <BiddingModal lead={selectedLeadForBid} userBalance={user.balance} onClose={() => setSelectedLeadForBid(null)} onSubmit={handleBidSubmit} onRefill={() => setActiveTab('settings')} />}
      {selectedLeadForAdminEdit && <AdminLeadActionsModal lead={selectedLeadForAdminEdit} onClose={() => setSelectedLeadForAdminEdit(null)} onSave={handleUpdateLeadDetails} onDelete={handleDeleteLead} />}
    </div>
  );
};

export default App;