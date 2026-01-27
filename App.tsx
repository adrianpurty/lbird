
import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { 
  ShieldAlert, Activity, Database, Server, Inbox, CheckCircle, BarChart3, Terminal, MapPin, Globe, UserCircle, Monitor, Fingerprint, Eye, FileText, Gavel, Heart, PlusCircle, User as UserIcon, Zap, History, ArrowDownLeft, ArrowUpRight, ShieldCheck, Target, TrendingUp, Cpu, ArrowRight, Star, PlayCircle, Layers
} from 'lucide-react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './services/firebase.ts';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import LeadGrid from './components/LeadGrid.tsx';
import LeadSubmissionForm from './components/LeadSubmissionForm.tsx';
import WalletSettings from './components/WalletSettings.tsx';
import ProfileSettings from './components/ProfileSettings.tsx';
import MobileNav from './components/MobileNav.tsx';
import Login from './components/Login.tsx';
import Signup from './components/Signup.tsx';
import BiddingModal from './components/BiddingModal.tsx';
import AdminLeadActionsModal from './components/AdminLeadActionsModal.tsx';
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
import { Lead, User, PurchaseRequest, Notification, PlatformAnalytics, Invoice, GatewayAPI } from './types.ts';
import { apiService } from './services/apiService.ts';
import { soundService } from './services/soundService.ts';

const WELCOME_SHOWN_KEY = 'lb_welcome_v1';
const LOCAL_SESSION_KEY = 'lb_local_session';

const MemoizedSidebar = memo(Sidebar);
const MemoizedHeader = memo(Header);
const MemoizedLeadGrid = memo(LeadGrid);

const StatCard = ({ label, value }: { label: string, value: string }) => (
  <div className="bg-[#0D0D0D] border border-white/5 rounded-2xl p-6 flex flex-col justify-center">
    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">{label}</span>
    <span className="text-3xl font-black text-white tracking-tighter">{value}</span>
  </div>
);

const App: React.FC = () => {
  const [authView, setAuthView] = useState<'login' | 'signup' | 'app'>('login');
  const [activeTab, setActiveTab] = useState<'market' | 'profile' | 'create' | 'settings' | 'bids' | 'admin' | 'inbox' | 'payment-config' | 'wishlist' | 'ledger'>('market');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auth State Listener
  useEffect(() => {
    // Check for local Super Admin session first
    const savedLocalSession = localStorage.getItem(LOCAL_SESSION_KEY);
    if (savedLocalSession) {
      try {
        const localUser = JSON.parse(savedLocalSession);
        setUser(localUser);
        setAuthView('app');
        setIsLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem(LOCAL_SESSION_KEY);
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Map Firebase user to our User interface (simplified)
        const mappedUser: User = {
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Unknown',
          email: firebaseUser.email || '',
          balance: 1000, 
          stripeConnected: false,
          role: firebaseUser.email?.includes('admin') ? 'admin' : 'user',
          status: 'active',
          profileImage: firebaseUser.photoURL || undefined
        };
        setUser(mappedUser);
        setAuthView('app');
      } else {
        setUser(null);
        setAuthView('login');
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest('button, a, input, select, textarea');
      soundService.playClick(!!isInteractive);
    };

    window.addEventListener('mousedown', handleGlobalClick);
    return () => window.removeEventListener('mousedown', handleGlobalClick);
  }, []);

  const [marketData, setMarketData] = useState<{
    leads: Lead[];
    purchaseRequests: PurchaseRequest[];
    invoices: Invoice[];
    notifications: Notification[];
    analytics: PlatformAnalytics | null;
    gateways: GatewayAPI[];
    users: User[];
    lastUpdate?: string;
  }>({
    leads: [],
    purchaseRequests: [],
    invoices: [],
    notifications: [],
    analytics: null,
    gateways: [],
    users: []
  });

  const [showWelcome, setShowWelcome] = useState(false);
  const [theme] = useState<'light' | 'dark'>('dark');
  const [selectedLeadForBid, setSelectedLeadForBid] = useState<Lead | null>(null);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState<Lead | null>(null);
  const [selectedLogForInspection, setSelectedLogForInspection] = useState<Notification | null>(null);
  const [selectedPurchaseForManifest, setSelectedPurchaseForManifest] = useState<PurchaseRequest | null>(null);
  const [selectedPurchaseForEdit, setSelectedPurchaseForEdit] = useState<PurchaseRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'info' } | null>(null);

  const isSyncing = useRef(false);

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
        gateways: data.gateways || prev.gateways,
        users: data.users || [],
        lastUpdate: data.metadata?.last_updated
      }));
    } catch (error) { 
      console.warn('Sync Failed'); 
    } finally { 
      isSyncing.current = false; 
    }
  }, []);

  useEffect(() => { 
    if (user) {
      fetchAppData();
      const interval = setInterval(fetchAppData, 15000);
      return () => clearInterval(interval);
    }
  }, [fetchAppData, user]);

  const showToast = useCallback((message: string) => {
    setToast({ message, type: 'info' });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const handleLogin = (loggedUser: any) => {
    // If it's our Super Admin bypass (non-Firebase user object format)
    if (loggedUser.uid === 'super_admin_root') {
      const adminUser: User = {
        id: 'admin_root',
        name: 'ROOT_ADMIN',
        email: 'admin@leadbid.pro',
        balance: 9999999,
        stripeConnected: true,
        role: 'admin',
        status: 'active',
        username: 'admin'
      };
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(adminUser));
      setUser(adminUser);
      setAuthView('app');
      showToast("SUPER_ADMIN_SYNC_COMPLETE");
    }

    const shown = sessionStorage.getItem(WELCOME_SHOWN_KEY);
    if (!shown) {
      setShowWelcome(true);
      sessionStorage.setItem(WELCOME_SHOWN_KEY, 'true');
    }
  };

  const handleLogout = useCallback(async () => { 
    soundService.playClick(true);
    localStorage.removeItem(LOCAL_SESSION_KEY);
    await signOut(auth);
    setAuthView('login');
    setUser(null);
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

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-10">
        <Server className="text-[#FACC15] animate-pulse" size={100} />
        <p className="text-[14px] font-tactical uppercase tracking-[1em] text-[#FACC15] animate-pulse">INIT_BOOT_CORE</p>
      </div>
    </div>
  );

  if (authView === 'login') return <Login onLogin={handleLogin} onSwitchToSignup={() => setAuthView('signup')} />;
  if (authView === 'signup') return <Signup onSignup={handleLogin} onSwitchToLogin={() => setAuthView('login')} />;

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
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 space-y-12 pb-32 lg:pb-12 scrollbar-hide">
          {activeTab === 'market' && (
            <div className="max-w-[1600px] mx-auto space-y-12 animate-in fade-in duration-700">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <StatCard label="MARKET VOL" value={`$${(marketData.leads.reduce((a, b) => a + b.currentBid, 0) / 10).toLocaleString()}`} />
                  <StatCard label="LIVE LEADS" value={marketData.leads.length.toString()} />
                  <StatCard label="AVG QUALITY" value={`${Math.round(marketData.leads.reduce((a, b) => a + b.qualityScore, 0) / (marketData.leads.length || 1))}%`} />
                  <StatCard label="BIDDERS" value="1.2K" />
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
          )}

          {activeTab === 'admin' && (
            <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
               <div className="px-1">
                  <h2 className="text-3xl md:text-5xl font-tactical font-black text-white uppercase tracking-tighter leading-none">
                    ROOT <span className="text-[#2DD4BF]">ACCESS</span>
                  </h2>
                  <p className="text-[7px] md:text-[10px] text-neutral-600 font-black uppercase tracking-[0.4em] mt-1.5 font-tactical">SYSTEM_OVERRIDE_ENABLED // v4.2</p>
               </div>

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
                  <LeadManagement leads={marketData.leads} onEditLead={setSelectedLeadForEdit} onDeleteLead={(id) => apiService.deleteLead(id).then(fetchAppData)} />
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
                             <div key={idx} onClick={() => setSelectedLogForInspection(n)} className="bg-[#1A1A1A] p-5 rounded-2xl border border-[#1A1A1A] flex items-center justify-between group cursor-pointer hover:border-[#2DD4BF]/40 transition-all">
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
          {activeTab === 'ledger' && (
            <div className="max-w-[1400px] mx-auto space-y-12 animate-in fade-in duration-700">
               <div className="px-1">
                  <h2 className="text-3xl md:text-5xl font-tactical font-black text-white uppercase tracking-tighter leading-none">
                    AUDIT <span className="text-[#FACC15]">LEDGER</span>
                  </h2>
                  <p className="text-[7px] md:text-[10px] text-neutral-600 font-bold uppercase tracking-[0.4em] mt-1.5 font-tactical">IMMUTABLE_LOG // HUB_01</p>
               </div>
               
               <UserActivityHub userId={user!.id} purchaseRequests={marketData.purchaseRequests} notifications={marketData.notifications} leads={marketData.leads} onViewManifest={setSelectedPurchaseForManifest} onEditSync={setSelectedPurchaseForEdit} />

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
        <BiddingModal lead={marketData.leads.find(l => l.id === selectedPurchaseForEdit.leadId) || marketData.leads[0]!} user={user!} existingPurchase={selectedPurchaseForEdit} onClose={() => setSelectedPurchaseForEdit(null)} onSubmit={handlePurchaseUpdate} onRefill={() => { setSelectedPurchaseForEdit(null); setActiveTab('settings'); }} />
      )}

      {selectedLeadForEdit && (
        <AdminLeadActionsModal lead={selectedLeadForEdit} user={user!} onClose={() => setSelectedLeadForEdit(null)} onSave={(u) => { apiService.updateLead(u.id!, u).then(() => { fetchAppData(); setSelectedLeadForEdit(null); showToast("NODE_UPDATED"); }); }} onDelete={(id) => { apiService.deleteLead(id).then(() => { fetchAppData(); setSelectedLeadForEdit(null); showToast("NODE_PURGED"); }); }} />
      )}
      {selectedLogForInspection && <LogInspectionModal notification={selectedLogForInspection} subjectUser={marketData.users.find(u => u.id === selectedLogForInspection.userId)} onClose={() => setSelectedLogForInspection(null)} />}
      {selectedPurchaseForManifest && (
        <PurchaseManifestModal purchase={selectedPurchaseForManifest} lead={marketData.leads.find(l => l.id === selectedPurchaseForManifest.leadId)} onClose={() => setSelectedPurchaseForManifest(null)} />
      )}
    </div>
  );
};

export default App;
