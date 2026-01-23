import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const App: React.FC = () => {
  const [authView, setAuthView] = useState<'login' | 'signup' | 'app'>('login');
  const [activeTab, setActiveTab] = useState<'market' | 'profile' | 'create' | 'settings' | 'bids' | 'admin' | 'inbox' | 'auth-config' | 'payment-config' | 'wishlist' | 'ledger'>('market');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      return (localStorage.getItem('lb-theme') as 'light' | 'dark') || 'dark';
    } catch {
      return 'dark';
    }
  });
  const [authConfig, setAuthConfig] = useState<OAuthConfig>({
    googleEnabled: false, googleClientId: '', googleClientSecret: '', facebookEnabled: false, facebookAppId: '', facebookAppSecret: ''
  });
  const [gateways, setGateways] = useState<GatewayAPI[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [selectedLeadForBid, setSelectedLeadForBid] = useState<Lead | null>(null);
  const [selectedLeadForAdminEdit, setSelectedLeadForAdminEdit] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  // Use a ref to store current user to avoid infinite loops in fetchAppData dependencies
  const userRef = useRef<User | null>(null);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    try {
      localStorage.setItem('lb-theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const updateStateIfChanged = useCallback(<T,>(setter: React.Dispatch<React.SetStateAction<T>>, current: T, next: T) => {
    if (JSON.stringify(current) !== JSON.stringify(next)) {
      setter(next);
    }
  }, []);

  const fetchAppData = useCallback(async () => {
    try {
      const data = await apiService.getData();
      
      // Gate all state updates with equality checks to stop re-render storms
      setLeads(prev => {
        if (JSON.stringify(prev) === JSON.stringify(data.leads)) return prev;
        return data.leads || [];
      });
      setPurchaseRequests(prev => {
        if (JSON.stringify(prev) === JSON.stringify(data.purchaseRequests)) return prev;
        return data.purchaseRequests || [];
      });
      setInvoices(prev => {
        if (JSON.stringify(prev) === JSON.stringify(data.invoices)) return prev;
        return data.invoices || [];
      });
      setNotifications(prev => {
        if (JSON.stringify(prev) === JSON.stringify(data.notifications)) return prev;
        return data.notifications || [];
      });
      setAnalytics(prev => {
        if (JSON.stringify(prev) === JSON.stringify(data.analytics)) return prev;
        return data.analytics || null;
      });
      
      if (data.authConfig) {
        setAuthConfig(prev => {
          if (JSON.stringify(prev) === JSON.stringify(data.authConfig)) return prev;
          return data.authConfig;
        });
      }
      
      if (data.gateways) {
        setGateways(prev => {
          if (JSON.stringify(prev) === JSON.stringify(data.gateways)) return prev;
          return data.gateways;
        });
      }
      
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
      console.error('Data retrieval error:', error);
      showToast("Critical: Failed to sync with node ledger.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Handle periodic data sync
  useEffect(() => { 
    fetchAppData();
    const interval = setInterval(fetchAppData, 15000); // Sync every 15 seconds
    return () => clearInterval(interval);
  }, [fetchAppData]);

  const handleLogin = (loggedUser: User) => {
    try {
      localStorage.setItem(SESSION_KEY, loggedUser.id);
    } catch {}
    setUser(loggedUser);
    setAuthView('app');
    setActiveTab('market');
    showToast(`Welcome back, ${loggedUser.name}`);
  };

  const handleSignup = async (newUser: User) => {
    try {
      localStorage.setItem(SESSION_KEY, newUser.id);
    } catch {}
    setUser(newUser);
    setAuthView('app');
    setActiveTab('market');
    showToast("Account created successfully.");
  };

  const handleLogout = () => { 
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    setUser(null); 
    setAuthView('login'); 
    showToast("Logged out.", "info");
  };

  const handleBidSubmit = async (bidData: BiddingFormData) => {
    if (!user || !selectedLeadForBid) return;

    try {
      await apiService.placeBid({
        userId: user.id,
        leadId: selectedLeadForBid.id,
        bidAmount: bidData.bidAmount,
        totalDailyCost: bidData.totalDailyCost,
        leadsPerDay: bidData.leadsPerDay,
        ...bidData
      });

      showToast("Buy order locked & Invoice generated.");
      setSelectedLeadForBid(null);
      fetchAppData();
    } catch (error: any) {
      showToast(error.message || "Transaction failed.", "error");
    }
  };

  const handleUpdateLeadStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await apiService.updateLead(id, { status });
      showToast(`Lead ${status === 'approved' ? 'Approved' : 'Rejected'}`);
      fetchAppData();
    } catch (error) { showToast("Action failed.", "error"); }
  };

  const handleUpdateLeadDetails = async (updates: Partial<Lead>) => {
    if (!updates.id) return;
    try {
      await apiService.updateLead(updates.id, updates);
      showToast("System override successful.");
      setSelectedLeadForAdminEdit(null);
      fetchAppData();
    } catch (error) { showToast("Override failed.", "error"); }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Are you sure you want to purge this lead from the global ledger?")) return;
    try {
      await apiService.deleteLead(id);
      showToast("Lead purged successfully.", "info");
      setSelectedLeadForAdminEdit(null);
      fetchAppData();
    } catch (error) { showToast("Purge failed.", "error"); }
  };

  const handleToggleWishlist = async (leadId: string) => {
    if (!user) return;
    try {
      await apiService.toggleWishlist(user.id, leadId);
      fetchAppData();
    } catch (error) {
      showToast("Failed to update wishlist", "error");
    }
  };

  const handleCreateLead = async (lead: Partial<Lead>) => {
    if (!user) return;
    try {
      await apiService.createLead({ ...lead, ownerId: user.id });
      showToast("Lead submitted for approval.");
      setActiveTab('market'); 
      fetchAppData();
    } catch (error) { showToast("Submission failed.", "error"); }
  };

  const handleDeposit = async (amount: number) => {
    if (!user) return;
    try {
      await apiService.deposit(user.id, amount);
      showToast(`Deposit confirmed: $${amount}`);
      fetchAppData();
    } catch (error) { showToast("Deposit failed.", "error"); }
  };

  const handleClearNotifications = async () => {
    try {
      await apiService.clearNotifications();
      fetchAppData();
    } catch (error) {}
  };

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-[var(--bg-platform)]">
      <div className="flex flex-col items-center gap-6">
        <Activity className="text-[var(--text-accent)] animate-spin" size={48} />
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 animate-pulse">Syncing Node Ledger...</p>
        </div>
      </div>
    </div>
  );

  if (authView === 'login') return <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} />;
  if (authView === 'signup') return <Signup onSignup={handleSignup} onSwitchToLogin={() => setAuthView('login')} />;
  if (!user) return null;

  const wishlistLeads = leads.filter(l => user.wishlist?.includes(l.id));
  const activeBidIds = purchaseRequests.filter(pr => pr.userId === user.id).map(pr => pr.leadId);
  const userInvoices = user.role === 'admin' ? invoices : invoices.filter(inv => inv.userId === user.id);

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
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} role={user.role} onLogout={handleLogout} hasInbox={notifications.some(n => !n.read)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-full relative overflow-hidden">
        <Header 
          user={user} 
          notifications={notifications} 
          onClearNotifications={handleClearNotifications} 
          theme={theme}
          onToggleTheme={toggleTheme}
        />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 space-y-8 pb-32 lg:pb-10 scroll-smooth">
          {activeTab === 'market' && (
            <div className="space-y-8">
               <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] italic uppercase flex items-center gap-3"><TrendingUp className="text-[var(--text-accent)]" /> Sales Floor</h2>
               <DashboardStats leads={leads} user={user} />
               <LeadGrid 
                leads={leads} 
                onBid={(id) => setSelectedLeadForBid(leads.find(l => l.id === id) || null)} 
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
                 <div className="bg-[var(--bg-card)] p-12 sm:p-20 rounded-[2rem] sm:rounded-[3rem] border border-[var(--border-main)] text-center space-y-4">
                    <Heart className="text-neutral-300 dark:text-neutral-800 mx-auto" size={48} />
                    <p className="text-neutral-500 text-xs sm:text-sm font-medium uppercase tracking-widest">No assets saved to your node yet.</p>
                 </div>
               ) : (
                <LeadGrid 
                  leads={wishlistLeads} 
                  onBid={(id) => setSelectedLeadForBid(leads.find(l => l.id === id) || null)} 
                  onToggleWishlist={handleToggleWishlist}
                  userRole={user.role} 
                  currentUserId={user.id}
                  wishlist={user.wishlist}
                  activeBids={activeBidIds}
                />
               )}
            </div>
          )}

          {activeTab === 'ledger' && (
            <div className="space-y-8">
               <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] italic uppercase flex items-center gap-3"><FileText className="text-[var(--text-accent)]" /> Transaction Ledger</h2>
               <InvoiceLedger invoices={userInvoices} />
            </div>
          )}

          {activeTab === 'admin' && user.role === 'admin' && (
             <div className="max-w-7xl mx-auto space-y-12">
                <h2 className="text-xl sm:text-2xl font-black text-[var(--text-main)] italic uppercase flex items-center gap-3"><ShieldAlert className="text-[var(--text-accent)]" /> Market Control</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-main)]">
                        <BarChart3 className="text-emerald-500 mb-4" size={24} />
                        <p className="text-[9px] text-neutral-600 font-black uppercase tracking-widest">Aggregate Throughput</p>
                        <p className="text-xl font-black text-[var(--text-main)]">${analytics?.totalVolume.toLocaleString()}</p>
                    </div>
                    <div className="bg-[var(--bg-card)] p-6 rounded-3xl border border-[var(--border-main)]">
                        <Target className="text-[var(--text-accent)] mb-4" size={24} />
                        <p className="text-[9px] text-neutral-600 font-black uppercase tracking-widest">Active Inventory</p>
                        <p className="text-xl font-black text-[var(--text-main)]">{leads.length} Units</p>
                    </div>
                  </div>
                  <div className="overflow-hidden">
                    {analytics?.revenueHistory && (
                      <RevenueChart history={analytics.revenueHistory} />
                    )}
                  </div>
                </div>
                <div className="space-y-6 pt-4">
                  <h3 className="text-xs font-black text-neutral-500 uppercase tracking-widest px-1">Master Lead Ledger</h3>
                  <LeadGrid 
                    leads={leads} 
                    onBid={() => {}} 
                    onAdminEdit={(lead) => setSelectedLeadForAdminEdit(lead)}
                    onAdminApprove={(id) => handleUpdateLeadStatus(id, 'approved')}
                    onAdminReject={(id) => handleUpdateLeadStatus(id, 'rejected')}
                    onDelete={handleDeleteLead}
                    userRole={user.role} 
                    currentUserId={user.id}
                  />
                </div>
             </div>
          )}

          {activeTab === 'auth-config' && user.role === 'admin' && (
            <div className="max-w-4xl mx-auto">
              <AdminOAuthSettings config={authConfig} onConfigChange={setAuthConfig} />
            </div>
          )}

          {activeTab === 'payment-config' && user.role === 'admin' && (
            <div className="max-w-4xl mx-auto">
              <AdminPaymentSettings gateways={gateways} onGatewaysChange={setGateways} onDeploy={setGateways} />
            </div>
          )}

          {activeTab === 'create' && <div className="max-w-3xl mx-auto"><LeadSubmissionForm onSubmit={handleCreateLead} /></div>}
          {activeTab === 'profile' && <div className="max-w-4xl mx-auto"><ProfileSettings user={user} onUpdate={(updates) => {
            setUser(prev => prev ? {...prev, ...updates} : null);
            showToast("Identity updated on the ledger.");
          }} /></div>}
          {activeTab === 'settings' && <div className="max-w-5xl mx-auto"><WalletSettings stripeConnected={user.stripeConnected} onConnect={() => {}} balance={user.balance} onDeposit={handleDeposit} gateways={gateways} /></div>}
        </main>
        
        <div className="lg:hidden">
          <MobileNav activeTab={activeTab} onTabChange={setActiveTab} role={user.role} />
        </div>
      </div>

      {selectedLeadForBid && (
        <BiddingModal 
          lead={selectedLeadForBid} 
          userBalance={user.balance}
          onClose={() => setSelectedLeadForBid(null)} 
          onSubmit={handleBidSubmit} 
          onRefill={() => setActiveTab('settings')}
        />
      )}

      {selectedLeadForAdminEdit && (
        <AdminLeadActionsModal
          lead={selectedLeadForAdminEdit}
          onClose={() => setSelectedLeadForAdminEdit(null)}
          onSave={handleUpdateLeadDetails}
          onDelete={handleDeleteLead}
        />
      )}
    </div>
  );
};

export default App;