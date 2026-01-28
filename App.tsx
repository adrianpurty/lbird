
import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { 
  Server, Database, Clock, Zap, Activity, Heart, Globe, Layers
} from 'lucide-react';
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
import AdminLeadActionsModal from './components/AdminLeadActionsModal.tsx';
import AdminPaymentSettings from './components/AdminPaymentSettings.tsx';
import AdminOAuthSettings from './components/AdminOAuthSettings.tsx';
import AdminControlCenter from './components/AdminControlCenter.tsx';
import SavedAssets from './components/SavedAssets.tsx';
import { Lead, User, PurchaseRequest, Notification, PlatformAnalytics, OAuthConfig, Invoice, GatewayAPI, WalletActivity } from './types.ts';
import { apiService } from './services/apiService.ts';
import { authService } from './services/authService.ts';
import { soundService } from './services/soundService.ts';

const MemoizedHeader = memo(Header);
const MemoizedLeadGrid = memo(LeadGrid);

const App: React.FC = () => {
  const [authView, setAuthView] = useState<'login' | 'signup' | 'app'>('login');
  const [activeTab, setActiveTab] = useState<'market' | 'profile' | 'create' | 'settings' | 'admin' | 'inbox' | 'auth-config' | 'payment-config' | 'wishlist' | 'action-center'>('market');
  
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

  const [user, setUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => 'dark');

  const [selectedLeadForBid, setSelectedLeadForBid] = useState<Lead | null>(null);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState<Lead | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const isSyncing = useRef(false);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((appUser) => {
      setUser(appUser);
      if (appUser) {
        setAuthView('app');
      } else {
        setAuthView(prev => prev === 'app' ? 'login' : prev);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
    } catch (error) { 
      console.warn('Sync Failed'); 
    } finally { 
      isSyncing.current = false; 
    }
  }, []);

  useEffect(() => { 
    if (user) {
      fetchAppData();
      const interval = setInterval(fetchAppData, 30000); 
      return () => clearInterval(interval);
    }
  }, [fetchAppData, user]);

  const toggleWishlist = useCallback(async (leadId: string) => {
    if (!user) return;
    soundService.playClick(true);
    try {
      await apiService.toggleWishlist(user.id, leadId);
      const updatedWishlist = user.wishlist?.includes(leadId)
        ? user.wishlist.filter(id => id !== leadId)
        : [...(user.wishlist || []), leadId];
      
      setUser({ ...user, wishlist: updatedWishlist });
      showToast(user.wishlist?.includes(leadId) ? "ASSET_REMOVED" : "ASSET_SECURED", "info");
    } catch (error) {
      showToast("WISHLIST_SYNC_FAILED", "error");
    }
  }, [user, showToast]);

  const toggleTheme = useCallback(() => setTheme(prev => prev === 'dark' ? 'light' : 'dark'), []);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    setAuthView('app');
    setActiveTab('market');
    fetchAppData();
    showToast(`AUTHORIZED: ${loggedUser.name.toUpperCase()}`);
  };

  const handleLogout = useCallback(async () => { 
    try {
      await authService.signOut();
      setUser(null); 
      setAuthView('login'); 
      showToast("SESSION_TERMINATED", "info");
    } catch (error) {
      showToast("LOGOUT_FAILED", "error");
    }
  }, [showToast]);

  const savedLeads = useMemo(() => {
    return marketData.leads.filter(l => user?.wishlist?.includes(l.id));
  }, [marketData.leads, user?.wishlist]);

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <Server className="text-white/40 animate-pulse" size={100} />
    </div>
  );

  if (!user && authView === 'login') return <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} authConfig={marketData.authConfig} />;
  if (!user && authView === 'signup') return <Signup onSignup={handleLogin} onSwitchToLogin={() => setAuthView('login')} authConfig={marketData.authConfig} />;

  return (
    <div className="flex flex-col h-screen bg-[#050505] text-white overflow-hidden font-rajdhani">
      <MemoizedHeader 
        user={user!} 
        notifications={marketData.notifications} 
        onClearNotifications={() => apiService.clearNotifications().then(() => fetchAppData())} 
        theme={theme} 
        onToggleTheme={toggleTheme} 
        onLogout={handleLogout}
        onProfileClick={() => setActiveTab('profile')}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 min-w-0 h-full relative overflow-hidden">
        <main className="h-full overflow-y-auto p-6 lg:p-12 scroll-smooth scrollbar-hide">
          <div className="max-w-[1600px] mx-auto w-full pb-20">
            {activeTab === 'market' && (
              <div className="space-y-12 animate-in fade-in duration-700">
                {/* HERO HEADER */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h1 className="text-7xl font-futuristic italic font-black uppercase tracking-tighter">
                      SALES <span className="text-transparent" style={{ WebkitTextStroke: '2px #ffffff', opacity: 0.3 }}>FLOOR</span>
                    </h1>
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]" />
                  </div>
                  <div className="flex items-center gap-8">
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-[0.4em]">TACTICAL_LEAD_MARKETPLACE_V4.2</p>
                    <div className="h-px flex-1 bg-gradient-to-r from-neutral-900 to-transparent" />
                  </div>
                </div>

                <DashboardStats leads={marketData.leads} user={user!} />

                {/* SAVED ASSETS SECTION (CAROUSEL STYLE) */}
                {savedLeads.length > 0 && (
                  <section className="space-y-6 animate-in slide-in-from-left duration-500">
                    <div className="flex items-center gap-3">
                      <Heart size={16} className="text-[#00e5ff]" fill="#00e5ff" />
                      <h3 className="text-sm font-black text-white italic uppercase tracking-[0.3em]">BOOKMARKED_NODES</h3>
                      <span className="text-[10px] text-neutral-700 font-mono">({savedLeads.length})</span>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                      {savedLeads.map(lead => (
                        <div key={lead.id} className="min-w-[400px] max-w-[400px]">
                           <LeadGrid.TacticalLeadCard 
                             lead={lead}
                             userRole={user!.role}
                             onBid={(id) => setSelectedLeadForBid(marketData.leads.find(l => l.id === id) || null)}
                             onEdit={setSelectedLeadForEdit}
                             nicheCount={marketData.leads.filter(l => l.category === lead.category).length}
                             isWishlisted={true}
                             onToggleWishlist={() => toggleWishlist(lead.id)}
                             compact
                           />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* MAIN MARKETPLACE SECTION */}
                <section className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Layers size={16} className="text-neutral-500" />
                    <h3 className="text-sm font-black text-white italic uppercase tracking-[0.3em]">GLOBAL_LIQUIDITY_POOL</h3>
                  </div>
                  <div className="bg-[#0c0c0c] rounded-[3rem] border border-neutral-800/40 p-10 shadow-2xl relative">
                    <MemoizedLeadGrid 
                      leads={marketData.leads} 
                      onBid={(id) => setSelectedLeadForBid(marketData.leads.find(l => l.id === id) || null)} 
                      onEdit={setSelectedLeadForEdit} 
                      userRole={user!.role} 
                      currentUserId={user!.id} 
                      wishlist={user!.wishlist || []} 
                      onToggleWishlist={toggleWishlist}
                    />
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <SavedAssets 
                leads={savedLeads} 
                onBid={(id) => setSelectedLeadForBid(marketData.leads.find(l => l.id === id) || null)} 
                onRemove={toggleWishlist} 
              />
            )}
            
            {activeTab === 'admin' && user!.role === 'admin' && (
              <AdminControlCenter 
                leads={marketData.leads}
                users={marketData.users}
                bids={marketData.purchaseRequests}
                walletActivities={marketData.walletActivities}
                onUpdateLead={setSelectedLeadForEdit}
                onDeleteLead={(id) => apiService.deleteLead(id).then(() => fetchAppData())}
                onUpdateUser={(id, u) => apiService.updateUser(id, u).then(() => fetchAppData())}
                onUpdateFinancial={() => {}}
              />
            )}

            {activeTab === 'action-center' && <ActionCenter requests={marketData.purchaseRequests.filter(pr => pr.userId === user?.id)} />}
            {activeTab === 'profile' && <ProfileSettings user={user!} onUpdate={(u) => apiService.updateUser(user!.id, u).then(() => fetchAppData())} />}
            {activeTab === 'create' && <LeadSubmissionForm onSubmit={(l) => apiService.createLead({...l, ownerId: user!.id}).then(() => { fetchAppData(); setActiveTab('market'); })} />}
            {activeTab === 'settings' && <WalletSettings balance={user!.balance} onDeposit={(amt, provider) => apiService.deposit(user!.id, amt, provider).then(() => fetchAppData())} gateways={marketData.gateways} stripeConnected={user!.stripeConnected} onConnect={() => {}} />}
            
            {activeTab === 'payment-config' && user!.role === 'admin' && (
              <AdminPaymentSettings 
                gateways={marketData.gateways} 
                onGatewaysChange={(g) => apiService.updateGateways(g).then(() => fetchAppData())} 
                onDeploy={(g) => apiService.updateGateways(g).then(() => fetchAppData())} 
              />
            )}
            {activeTab === 'auth-config' && user!.role === 'admin' && (
              <AdminOAuthSettings 
                config={marketData.authConfig} 
                onConfigChange={(c) => apiService.updateAuthConfig(c).then(() => fetchAppData())} 
              />
            )}
          </div>
        </main>
      </div>

      {selectedLeadForBid && <BiddingModal lead={selectedLeadForBid} user={user!} gateways={marketData.gateways} onClose={() => setSelectedLeadForBid(null)} onSubmit={(d) => apiService.placeBid({ userId: user!.id, leadId: selectedLeadForBid.id, leadTitle: selectedLeadForBid.title, ...d }).then(() => { fetchAppData(); setSelectedLeadForBid(null); setActiveTab('action-center'); })} onRefill={() => { setSelectedLeadForBid(null); setActiveTab('settings'); }} />}
      {selectedLeadForEdit && <AdminLeadActionsModal lead={selectedLeadForEdit} user={user!} onClose={() => setSelectedLeadForEdit(null)} onSave={(u) => apiService.updateLead(selectedLeadForEdit.id, u).then(() => { fetchAppData(); setSelectedLeadForEdit(null); })} onDelete={(id) => apiService.deleteLead(id).then(() => { fetchAppData(); setSelectedLeadForEdit(null); })} />}
      
      {toast && (
        <div className="fixed bottom-10 right-10 z-[1000] animate-in slide-in-from-right duration-500">
           <div className={`px-8 py-4 rounded-2xl border-2 flex items-center gap-4 ${
             toast.type === 'error' ? 'bg-red-950/20 border-red-900/40 text-red-500' : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-500'
           }`}>
             <Zap size={20} />
             <span className="font-black uppercase tracking-widest text-[11px]">{toast.message}</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
