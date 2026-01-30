import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { 
  Server, Zap, Activity, Heart, Layers
} from 'lucide-react';
import Header from './components/Header';
import LeadGrid from './components/LeadGrid';
import LeadSubmissionForm from './components/LeadSubmissionForm';
import WalletSettings from './components/WalletSettings';
import ProfileSettings from './components/ProfileSettings';
import DashboardStats from './components/DashboardStats';
import MobileNav from './components/MobileNav';
import Login from './components/Login';
import Signup from './components/Signup';
import BiddingModal from './components/BiddingModal';
import ActionCenter from './components/ActionCenter';
import AdminLeadActionsModal from './components/AdminLeadActionsModal';
import AdminPaymentSettings from './components/AdminPaymentSettings';
import AdminOAuthSettings from './components/AdminOAuthSettings';
import AdminControlCenter from './components/AdminControlCenter';
import SavedAssets from './components/SavedAssets';
import BiometricPrompt from './components/BiometricPrompt';
import MyAssetsRegistry from './components/MyAssetsRegistry';
import Footer from './components/Footer';
import { PrivacyPolicy, TermsConditions, RefundPolicy } from './components/LegalPages';
import ContactUs from './components/ContactUs';
import { Lead, User, PurchaseRequest, Notification, PlatformAnalytics, OAuthConfig, Invoice, GatewayAPI, WalletActivity } from './types';
import { apiService } from './services/apiService';
import { authService } from './services/authService';
import { soundService } from './services/soundService';

const MemoizedHeader = memo(Header);
const MemoizedLeadGrid = memo(LeadGrid);

const App: React.FC = () => {
  const [authView, setAuthView] = useState<'login' | 'signup' | 'privacy' | 'terms' | 'refund' | 'contact' | 'app'>('login');
  const [activeTab, setActiveTab] = useState<'market' | 'profile' | 'create' | 'settings' | 'admin' | 'inbox' | 'auth-config' | 'payment-config' | 'wishlist' | 'action-center' | 'privacy' | 'terms' | 'refund' | 'contact'>('market');
  
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
  const [showBiometricPrompt, setShowBiometricPrompt] = useState(false);

  const [selectedLeadForBid, setSelectedLeadForBid] = useState<{ lead: Lead, initialBid?: number } | null>(null);
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState<Lead | null>(null);
  const [lastBidLeadId, setLastBidLeadId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const isSyncing = useRef(false);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((appUser) => {
      setUser(appUser);
      if (appUser) {
        setAuthView('app');
      } else {
        setAuthView(prev => ['privacy', 'terms', 'refund', 'contact'].includes(prev) ? prev : 'login');
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

  const handleQuickBid = useCallback(async (lead: Lead) => {
    if (!user) return;
    soundService.playClick(true);

    const bidAmount = lead.currentBid;
    const leadsPerDay = 50;
    const totalDailyCost = bidAmount * leadsPerDay;

    // Check if user has defaults configured for a truly instant purchase
    if (!user.defaultBusinessUrl || !user.defaultTargetUrl) {
      showToast("REFINERY_REQUIRED: SET PROFILE DEFAULTS", "info");
      setSelectedLeadForBid({ lead, initialBid: bidAmount });
      return;
    }

    // Check if user has enough balance
    if (user.balance < totalDailyCost) {
      showToast("LOW_VAULT_LIQUIDITY: OPENING BRIDGE", "error");
      setSelectedLeadForBid({ lead, initialBid: bidAmount });
      return;
    }

    try {
      await apiService.placeBid({
        userId: user.id,
        userName: user.name,
        leadId: lead.id,
        leadTitle: lead.title,
        buyerBusinessUrl: user.defaultBusinessUrl,
        buyerTargetLeadUrl: user.defaultTargetUrl,
        buyerTollFree: user.phone || '',
        leadsPerDay,
        bidAmount,
        totalDailyCost,
        officeHoursStart: '09:00',
        officeHoursEnd: '17:00',
        operationalDays: ['mon', 'tue', 'wed', 'thu', 'fri']
      });
      
      setLastBidLeadId(lead.id);
      setTimeout(() => setLastBidLeadId(null), 6000);
      fetchAppData();
      showToast("INSTANT_ACQUISITION_LOCKED", "success");
    } catch (error) {
      showToast("ACQUISITION_HANDSHAKE_FAILED", "error");
    }
  }, [user, showToast, fetchAppData]);

  const handleLogin = (loggedUser: User) => {
    setUser(loggedUser);
    setAuthView('app');
    setActiveTab('market');
    fetchAppData();
    
    if (!loggedUser.biometricEnabled && window.PublicKeyCredential) {
      setShowBiometricPrompt(true);
    }

    showToast(`AUTHORIZED: ${loggedUser.name.toUpperCase()}`);
  };

  const handleEnableBiometrics = async () => {
    if (!user) return;
    try {
      const simulatedKey = `bio_${Math.random().toString(36).substr(2, 9)}`;
      await apiService.updateUser(user.id, { 
        biometricEnabled: true, 
        biometricKey: simulatedKey 
      });
      setUser({ ...user, biometricEnabled: true, biometricKey: simulatedKey });
      setShowBiometricPrompt(false);
      showToast("BIOMETRICS_SYNCED", "success");
    } catch (error) {
      showToast("BIOMETRIC_SYNC_FAILED", "error");
    }
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

  const myLeads = useMemo(() => {
    return marketData.leads.filter(l => l.ownerId === user?.id);
  }, [marketData.leads, user?.id]);

  const userWalletActivities = useMemo(() => {
    return marketData.walletActivities
      .filter(wa => wa.userId === user?.id)
      .map(wa => ({
        ...wa,
        timestamp: new Date(wa.timestamp).toLocaleTimeString() + ' // ' + new Date(wa.timestamp).toLocaleDateString()
      }));
  }, [marketData.walletActivities, user?.id]);

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-platform">
      <Server className="text-accent/40 animate-pulse" size={100} />
    </div>
  );

  const renderPublicView = () => {
    switch (authView) {
      case 'signup': 
        return <Signup onSignup={handleLogin} onSwitchToLogin={() => setAuthView('login')} authConfig={marketData.authConfig} />;
      case 'privacy':
        return <PrivacyPolicy onBack={() => setAuthView('login')} />;
      case 'terms':
        return <TermsConditions onBack={() => setAuthView('login')} />;
      case 'refund':
        return <RefundPolicy onBack={() => setAuthView('login')} />;
      case 'contact':
        return <ContactUs onBack={() => setAuthView('login')} onMessageSent={() => setAuthView('login')} />;
      default:
        return <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} authConfig={marketData.authConfig} />;
    }
  };

  if (!user && authView !== 'app') return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">{renderPublicView()}</div>
      <Footer onNav={(tab) => setAuthView(tab as any)} />
    </div>
  );

  return (
    <div className="flex flex-col h-screen bg-platform text-main overflow-hidden font-rajdhani transition-colors duration-500">
      <MemoizedHeader 
        user={user!} 
        notifications={marketData.notifications} 
        onClearNotifications={() => apiService.clearNotifications().then(() => fetchAppData())} 
        onLogout={handleLogout}
        onProfileClick={() => setActiveTab('profile')}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 min-w-0 h-full relative overflow-hidden flex flex-col">
        <main className="flex-1 overflow-y-auto p-6 lg:p-12 scroll-smooth scrollbar-hide bg-platform">
          <div className="max-w-[1600px] mx-auto w-full pb-32 md:pb-20">
            {activeTab === 'market' && (
              <div className="space-y-12 animate-in fade-in duration-700">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <h1 className="text-4xl sm:text-7xl font-futuristic italic font-black uppercase tracking-tighter">
                      SALES <span className="text-transparent" style={{ WebkitTextStroke: '2px var(--text-main)', opacity: 0.1 }}>FLOOR</span>
                    </h1>
                    <div className="w-3 h-3 rounded-full bg-accent animate-pulse shadow-[0_0_15px_var(--accent-primary)]" />
                  </div>
                  <div className="flex items-center gap-8">
                    <p className="text-[10px] text-dim font-bold uppercase tracking-[0.4em]">TACTICAL_LEAD_MARKETPLACE_V4.2</p>
                    <div className="hidden sm:block h-px flex-1 bg-gradient-to-r from-border-main to-transparent" />
                  </div>
                </div>

                <DashboardStats leads={marketData.leads} user={user!} gateways={marketData.gateways} />

                {savedLeads.length > 0 && (
                  <section className="space-y-6 animate-in slide-in-from-left duration-500">
                    <div className="flex items-center gap-3">
                      <Heart size={16} className="text-accent" fill="currentColor" />
                      <h3 className="text-sm font-black text-main italic uppercase tracking-[0.3em]">BOOKMARKED_NODES</h3>
                      <span className="text-[10px] text-dim font-mono">({savedLeads.length})</span>
                    </div>
                    <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
                      {savedLeads.map(lead => (
                        <div key={lead.id} className="min-w-[300px] sm:min-w-[400px] max-w-[400px]">
                           <LeadGrid.TacticalLeadCard 
                             lead={lead}
                             userRole={user!.role}
                             currentUserId={user!.id}
                             user={user}
                             onBid={(id, initialBid) => setSelectedLeadForBid({ lead: marketData.leads.find(l => l.id === id)!, initialBid })}
                             onQuickBid={handleQuickBid}
                             onEdit={setSelectedLeadForDetail}
                             nicheCount={marketData.leads.filter(l => l.category === lead.category).length}
                             isWishlisted={true}
                             onToggleWishlist={() => toggleWishlist(lead.id)}
                             isRecentlyBid={lastBidLeadId === lead.id}
                             compact
                           />
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section className="space-y-8">
                  <div className="flex items-center gap-3">
                    <Layers size={16} className="text-dim" />
                    <h3 className="text-sm font-black text-main italic uppercase tracking-[0.3em]">GLOBAL_LEAD_POOLS</h3>
                  </div>
                  <div className="bg-surface rounded-[2rem] sm:rounded-[3rem] border border-bright p-4 sm:p-10 shadow-2xl relative">
                    <MemoizedLeadGrid 
                      leads={marketData.leads} 
                      user={user}
                      onBid={(id, initialBid) => setSelectedLeadForBid({ lead: marketData.leads.find(l => l.id === id)!, initialBid })} 
                      onQuickBid={handleQuickBid}
                      onEdit={setSelectedLeadForDetail} 
                      userRole={user!.role} 
                      currentUserId={user!.id} 
                      wishlist={user!.wishlist || []} 
                      onToggleWishlist={toggleWishlist}
                      lastBidLeadId={lastBidLeadId}
                    />
                  </div>
                </section>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <SavedAssets 
                leads={savedLeads} 
                onBid={(id) => setSelectedLeadForBid({ lead: marketData.leads.find(l => l.id === id)! })} 
                onRemove={toggleWishlist} 
              />
            )}
            
            {activeTab === 'admin' && user!.role === 'admin' && (
              <AdminControlCenter 
                leads={marketData.leads}
                users={marketData.users}
                bids={marketData.purchaseRequests}
                walletActivities={marketData.walletActivities}
                onUpdateLead={setSelectedLeadForDetail}
                onDeleteLead={(id) => apiService.deleteLead(id).then(() => fetchAppData())}
                onUpdateUser={(id, u) => apiService.updateUser(id, u).then(() => fetchAppData())}
                onUpdateFinancial={() => {}}
              />
            )}

            {activeTab === 'action-center' && (
              <ActionCenter 
                requests={marketData.purchaseRequests} 
                user={user!}
                leads={marketData.leads}
                allUsers={marketData.users}
                notifications={marketData.notifications}
                walletActivities={marketData.walletActivities}
                onEditLead={setSelectedLeadForDetail}
                onWalletUpdate={fetchAppData}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileSettings 
                user={user!} 
                onUpdate={(updates) => {
                  apiService.updateUser(user!.id, updates).then(() => {
                    setUser(prev => prev ? { ...prev, ...updates } : null);
                    fetchAppData();
                    showToast("PROFILE_SYNC_SUCCESS");
                  });
                }} 
              />
            )}
            
            {activeTab === 'create' && (
              <div className="space-y-16">
                <LeadSubmissionForm onSubmit={(l) => apiService.createLead({...l, ownerId: user!.id}).then(() => { fetchAppData(); showToast("ASSET_SUBMITTED_FOR_REVIEW"); })} />
                <MyAssetsRegistry leads={myLeads} onEdit={setSelectedLeadForDetail} />
              </div>
            )}

            {activeTab === 'settings' && (
              <WalletSettings 
                user={user!}
                balance={user!.balance} 
                onDeposit={(amt, provider, txnId) => apiService.deposit(user!.id, amt, provider, txnId).then(() => { fetchAppData(); showToast(amt > 0 ? "VAULT_SETTLEMENT_VERIFIED" : "VAULT_WITHDRAWAL_INITIATED"); })} 
                gateways={marketData.gateways} 
                onConnect={() => {}} 
                walletActivities={userWalletActivities}
              />
            )}
            
            {activeTab === 'payment-config' && user!.role === 'admin' && (
              <AdminPaymentSettings 
                gateways={marketData.gateways} 
                onGatewaysChange={(g) => apiService.updateGateways(g).then(() => fetchAppData())} 
              />
            )}

            {activeTab === 'auth-config' && user!.role === 'admin' && (
              <AdminOAuthSettings 
                config={marketData.authConfig} 
                onConfigChange={(c) => apiService.updateAuthConfig(c).then(() => fetchAppData())} 
              />
            )}

            {activeTab === 'privacy' && <PrivacyPolicy />}
            {activeTab === 'terms' && <TermsConditions />}
            {activeTab === 'refund' && <RefundPolicy />}
            {activeTab === 'contact' && <ContactUs onMessageSent={() => setActiveTab('market')} />}
          </div>
        </main>
      </div>

      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} role={user!.role} />

      {selectedLeadForBid && (
        <BiddingModal 
          lead={selectedLeadForBid.lead} 
          initialBid={selectedLeadForBid.initialBid}
          user={user!} 
          gateways={marketData.gateways} 
          onClose={() => setSelectedLeadForBid(null)} 
          onSubmit={async (d) => {
            await apiService.placeBid({ 
              userId: user!.id, 
              userName: user!.name,
              leadId: selectedLeadForBid.lead.id, 
              leadTitle: selectedLeadForBid.lead.title, 
              ...d 
            });
            fetchAppData();
            setLastBidLeadId(selectedLeadForBid.lead.id);
            setTimeout(() => setLastBidLeadId(null), 6000);
            showToast(selectedLeadForBid.initialBid ? "ACQUISITION_LOCKED" : "BID_BROADCAST_SUCCESS");
          }} 
          onRefill={() => { setSelectedLeadForBid(null); setActiveTab('settings'); }} 
          onRedirectToActionCenter={() => {
            setSelectedLeadForBid(null);
            setActiveTab('action-center');
            showToast("NAVIGATING_TO_ACTION_CENTER", "info");
          }}
        />
      )}
      
      {selectedLeadForDetail && <AdminLeadActionsModal lead={selectedLeadForDetail} user={user!} onClose={() => setSelectedLeadForDetail(null)} onSave={(u) => apiService.updateLead(selectedLeadForDetail.id, u).then(() => { fetchAppData(); setSelectedLeadForDetail(null); })} onDelete={(id) => apiService.deleteLead(id).then(() => { fetchAppData(); setSelectedLeadForDetail(null); })} onBid={(id) => { setSelectedLeadForDetail(null); setSelectedLeadForBid({ lead: marketData.leads.find(l => l.id === id)! }); }} />}
      
      {showBiometricPrompt && (
        <BiometricPrompt 
          onEnable={handleEnableBiometrics}
          onSkip={() => setShowBiometricPrompt(false)}
        />
      )}

      {toast && (
        <div className="fixed bottom-24 sm:bottom-10 right-4 sm:right-10 z-[1000] animate-in slide-in-from-right duration-500">
           <div className={`px-6 sm:px-8 py-3 sm:py-4 rounded-2xl border-2 flex items-center gap-4 ${
             toast.type === 'error' ? 'bg-red-50/5 border-red-200 text-red-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'
           }`}>
             <Zap size={16} />
             <span className="font-black uppercase tracking-widest text-[9px] sm:text-[11px]">{toast.message}</span>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;