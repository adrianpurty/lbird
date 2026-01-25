import React, { useState, useEffect, useCallback, useRef, useMemo, memo, useDeferredValue } from 'react';
import { 
  TrendingUp, Settings, ShieldAlert, Package, 
  Inbox, CheckCircle, Activity, User as UserIcon, 
  BarChart3, Target, Info, XCircle, Heart, FileText, Database, Server,
  Loader2, Gavel, Loader, Eye, Fingerprint, Terminal, UserCircle, Globe, Monitor, MapPin
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
import { Lead, User, PurchaseRequest, Notification, PlatformAnalytics, OAuthConfig, Invoice, GatewayAPI } from './types.ts';
import { apiService } from './services/apiService.ts';
import { soundService } from './services/soundService.ts';

const SESSION_KEY = 'lb_session_v3';
const USER_DATA_KEY = 'lb_user_v3';
const AUTH_VIEW_KEY = 'lb_auth_view_v3';
const LAST_KNOWN_LOCATION_KEY = 'lb_last_known_loc';

interface AppMarketData {
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
}

const MemoizedSidebar = memo(Sidebar);
const MemoizedHeader = memo(Header);
const MemoizedLeadGrid = memo(LeadGrid);

const UserPresenceTable = ({ users, currentUserId }: { users: User[], currentUserId: string }) => {
  const getTabLabel = (tabId: string) => {
    const mapping: Record<string, string> = {
      market: 'Sales Floor',
      profile: 'Identity Node',
      wishlist: 'Saved Assets',
      create: 'Asset Provisioning',
      bids: 'Active Portfolio',
      ledger: 'Financial Ledger',
      inbox: 'Audit Logs',
      admin: 'Control Room',
      'payment-config': 'Gateway Config',
      'auth-config': 'Identity Infrastructure',
      settings: 'Vault & API'
    };
    return mapping[tabId] || tabId;
  };

  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
        const aTime = a.last_active_at ? new Date(a.last_active_at).getTime() : 0;
        const bTime = b.last_active_at ? new Date(b.last_active_at).getTime() : 0;
        return bTime - aTime;
    });
  }, [users]);

  return (
    <div className="bg-[#111111]/40 border border-neutral-800/30 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-md">
       <div className="p-6 border-b border-neutral-800/40 bg-black/20 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <Activity className="text-[#facc15]" size={16} />
             <span className="text-[11px] font-black uppercase tracking-[0.2em] text-neutral-300">Active Node Presence</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-[#facc15]/5 border border-[#facc15]/20 rounded-lg">
             <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
             <span className="text-[9px] font-black text-neutral-400 uppercase">{users.length} Sync'd</span>
          </div>
       </div>
       <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead>
                <tr className="border-b border-neutral-800/20">
                   <th className="px-6 py-4 text-[9px] font-black text-neutral-600 uppercase tracking-widest">Trader Identity</th>
                   <th className="px-6 py-4 text-[9px] font-black text-neutral-600 uppercase tracking-widest">Active Node</th>
                   <th className="px-6 py-4 text-[9px] font-black text-neutral-600 uppercase tracking-widest">Global Location</th>
                   <th className="px-6 py-4 text-[9px] font-black text-neutral-600 uppercase tracking-widest">Status / Last Sync</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-neutral-800/10">
                {sortedUsers.map(u => {
                   const isOnline = u.last_active_at && (Date.now() - new Date(u.last_active_at).getTime() < 60000);
                   return (
                      <tr key={u.id} className={`group hover:bg-white/[0.02] transition-colors ${u.id === currentUserId ? 'bg-[#facc15]/[0.03]' : ''}`}>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center group-hover:border-[#facc15]/30 transition-all">
                                  {u.profileImage ? <img src={u.profileImage} className="w-full h-full object-cover" /> : <UserCircle size={16} className="text-neutral-700" />}
                               </div>
                               <div>
                                  <p className="text-xs font-bold text-neutral-300 group-hover:text-white transition-colors">{u.name}</p>
                                  <p className="text-[9px] text-neutral-600 font-black uppercase tracking-tighter">{u.email}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                               <Terminal size={12} className="text-neutral-700" />
                               <span className="text-[10px] font-black text-[#facc15]/60 uppercase italic tracking-widest">{getTabLabel(u.current_page || 'Unknown')}</span>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                               <div className="flex items-center gap-2 text-[9px] text-neutral-400 font-bold uppercase">
                                  <MapPin size={10} className="text-red-900/60" /> {u.location || 'HIDDEN'}
                               </div>
                               <div className="flex items-center gap-2 text-[8px] text-neutral-600 font-black tracking-tighter">
                                  <Globe size={10} /> {u.ipAddress || '0.0.0.0'}
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                               <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-800'}`} />
                               <div>
                                  <p className={`text-[10px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-500/80' : 'text-neutral-700'}`}>
                                     {isOnline ? 'CONNECTED' : 'DISCONNECTED'}
                                  </p>
                                  <p className="text-[8px] text-neutral-700 font-mono italic">
                                     {u.last_active_at ? new Date(u.last_active_at).toLocaleTimeString() : 'N/A'}
                                  </p>
                               </div>
                            </div>
                         </td>
                      </tr>
                   );
                })}
             </tbody>
          </table>
       </div>
    </div>
  );
};

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
  
  const [marketData, setMarketData] = useState<AppMarketData>({
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
  const [selectedLeadForAdminEdit, setSelectedLeadForAdminEdit] = useState<Lead | null>(null);
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

  // Presence Tracking (Heartbeat) with location reveal
  useEffect(() => {
    if (!user || authView !== 'app') return;
    
    const sendHeartbeat = async () => {
        let ip = '0.0.0.0';
        try { 
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            ip = data.ip;
        } catch {}

        const loc = localStorage.getItem(LAST_KNOWN_LOCATION_KEY) || 'Unknown';
        const device = `${navigator.platform} | ${navigator.userAgent.substring(0, 30)}...`;

        apiService.updateHeartbeat(user.id, activeTab, {
            location: loc,
            ipAddress: ip,
            deviceInfo: device
        }).catch(() => {});
    };

    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 25000); // Pulse every 25s
    return () => clearInterval(interval);
  }, [user, activeTab, authView]);

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
          users: data.users || [],
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
    const interval = setInterval(fetchAppData, 10000);
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
      fetchAppData(); 
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
      fetchAppData();
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
  if (authView === 'signup') return <Signup onSignup={handleLogin} onSwitchToLogin={() => setAuthView('login')} authConfig={marketData.authConfig} />;
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
        <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-150">
           <div className="flex flex-col items-center gap-4">
              <Database className="text-[#facc15]/60 animate-pulse" size={48} />
              <p className="text-neutral-400 font-black text-[10px] uppercase tracking-[0.4em] italic">COMMITTING NODE...</p>
           </div>
        </div>
      )}

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-xl shadow-xl border bg-neutral-900/60 border-neutral-800/40 backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-top-2">
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
                <div className="flex justify-between items-center">
                   <h2 className="text-xl font-black text-neutral-400 italic uppercase flex items-center gap-3"><ShieldAlert className="text-[#facc15]/40" /> Control Room</h2>
                   <div className="flex items-center gap-4">
                      <div className="px-4 py-2 bg-black/40 border border-neutral-800 rounded-xl flex items-center gap-3">
                         <Activity size={14} className="text-emerald-500 animate-pulse" />
                         <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Global Telemetry Active</span>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-[#121212]/40 p-6 rounded-2xl border border-neutral-800/30 shadow-sm flex flex-col justify-center">
                      <BarChart3 className="text-emerald-900/40 mb-2" size={20} />
                      <p className="text-[9px] text-neutral-700 font-black uppercase tracking-widest">Global Volume</p>
                      <p className="text-lg font-black text-neutral-300 italic">${marketData.analytics?.totalVolume.toLocaleString()}</p>
                  </div>
                  {marketData.analytics && <RevenueChart history={marketData.analytics.revenueHistory} />}
                </div>

                {/* Live Node Distribution Reveal */}
                <div className="space-y-6">
                   <div className="flex items-center gap-4 border-b border-neutral-800/20 pb-2">
                      <Globe size={14} className="text-[#facc15]/60" />
                      <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest italic">Live Geographic Node Distribution</h3>
                   </div>
                   <WorldMarketMap 
                     leads={[]} // No leads here, purely for user visual distribution
                     onSelectCountry={() => {}} 
                     selectedCountry={null}
                   />
                </div>

                <div className="space-y-6">
                   <div className="flex items-center gap-4 border-b border-neutral-800/20 pb-2">
                      <UserIcon size={14} className="text-[#facc15]/60" />
                      <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-widest italic">User Telemetry Grid</h3>
                   </div>
                   <UserPresenceTable users={marketData.users} currentUserId={user!.id} />
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
          {activeTab === 'create' && <LeadSubmissionForm onSubmit={(l) => { 
            setIsSubmitting(true); 
            apiService.createLead({...l, ownerId: user!.id}).then(async () => { 
              await fetchAppData(); 
              setActiveTab('market'); 
              showToast("Asset Provisioned Successfully"); 
              setIsSubmitting(false); 
            }).catch(() => {
              setIsSubmitting(false);
              showToast("Provisioning Failed", "error");
            }); 
          }} />}
          {activeTab === 'inbox' && (
             <div className="space-y-6 animate-in fade-in duration-200 max-w-5xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black text-neutral-400 italic uppercase flex items-center gap-3"><Inbox className="text-[#facc15]/40" /> System Audit Ledger</h2>
                  {user!.role === 'admin' && marketData.notifications.length > 0 && (
                    <button onClick={() => apiService.clearNotifications().then(fetchAppData)} className="text-[10px] font-black uppercase text-red-500/60 hover:text-red-500 transition-colors tracking-widest px-4 py-2 border border-red-900/20 rounded-xl hover:bg-red-950/10">Purge Logs</button>
                  )}
                </div>
                
                <div className="bg-[#111111]/40 border border-neutral-800/30 rounded-[2rem] overflow-hidden shadow-2xl backdrop-blur-md">
                   {marketData.notifications.length === 0 ? (
                      <div className="p-32 text-center">
                        <Terminal className="mx-auto text-neutral-800 mb-6" size={48} />
                        <p className="text-neutral-700 text-xs font-black uppercase tracking-[0.4em]">Zero Active Logs in Stream</p>
                      </div>
                   ) : (
                      marketData.notifications.map(n => {
                        const subjectUser = marketData.users.find(u => u.id === n.userId);
                        return (
                          <div 
                            key={n.id} 
                            onClick={() => user!.role === 'admin' && setSelectedLogForInspection(n)}
                            className={`p-6 border-b border-neutral-800/20 flex items-center justify-between hover:bg-white/[0.02] transition-all cursor-pointer group ${!n.read ? 'bg-[#facc15]/[0.02]' : ''}`}
                          >
                             <div className="flex items-center gap-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                                  n.type === 'buy' ? 'bg-blue-900/10 text-blue-500' : 
                                  n.type === 'sell' ? 'bg-yellow-900/10 text-yellow-500' :
                                  n.type === 'approval' ? 'bg-emerald-900/10 text-emerald-500' : 'bg-neutral-800 text-neutral-600'
                                } border border-transparent group-hover:border-current/20`}>
                                   {n.type === 'approval' ? <CheckCircle size={20} /> : <Database size={20} />}
                                </div>
                                <div>
                                   <div className="flex items-center gap-3">
                                      <p className="text-sm text-neutral-300 font-bold group-hover:text-white transition-colors">{n.message}</p>
                                      {user!.role === 'admin' && (
                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-black/40 border border-neutral-800 rounded-md">
                                          <Fingerprint size={10} className="text-[#facc15]/60" />
                                          <span className="text-[8px] font-mono text-neutral-500">{subjectUser?.username || n.userId.substring(0, 8)}</span>
                                        </div>
                                      )}
                                   </div>
                                   <div className="flex items-center gap-3 mt-1.5">
                                      <span className="text-[9px] text-neutral-600 font-black uppercase tracking-widest">{n.timestamp}</span>
                                      <span className="w-1 h-1 bg-neutral-800 rounded-full" />
                                      <span className="text-[9px] text-neutral-700 font-black uppercase tracking-tighter">NODE_ID: {n.id}</span>
                                   </div>
                                </div>
                             </div>
                             <div className="flex items-center gap-4">
                               <span className={`text-[8px] px-3 py-1 rounded-lg border font-black uppercase tracking-[0.2em] ${
                                  n.type === 'buy' ? 'border-blue-900/30 text-blue-600' : 
                                  n.type === 'sell' ? 'border-yellow-900/30 text-yellow-600' :
                                  n.type === 'approval' ? 'border-emerald-900/30 text-emerald-600' : 'border-neutral-800 text-neutral-600'
                               }`}>{n.type}</span>
                               {user!.role === 'admin' && <Eye size={16} className="text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity" />}
                             </div>
                          </div>
                        );
                      })
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
      {selectedLogForInspection && (
        <LogInspectionModal 
          notification={selectedLogForInspection} 
          subjectUser={marketData.users.find(u => u.id === selectedLogForInspection.userId)}
          onClose={() => setSelectedLogForInspection(null)} 
        />
      )}
    </div>
  );
};

export default App;