
import { Lead, User, PurchaseRequest, Notification, PlatformAnalytics, OAuthConfig, Invoice, GatewayAPI, WalletActivity } from '../types.ts';

const API_ENDPOINT = './api.php';
const FALLBACK_KEY = 'leadbid_v4_local_db';

export const NICHE_PROTOCOLS = {
  "Finance": ["Crypto Trading", "High-Ticket Insurance", "Mortgage Leads", "Debt Settlement"],
  "Travel": ["Luxury Cruises", "International Flights", "Resort Bookings"],
  "Real Estate": ["Commercial Property", "Residential Leads", "Solar Energy"],
  "Health": ["Medical Aesthetics", "Dental Care", "Health Insurance"],
  "Legal": ["Personal Injury", "Corporate Law", "Immigration Leads"]
};

class ApiService {
  private useFallback = false;

  private async request(action: string, method: 'GET' | 'POST' = 'GET', body?: any) {
    if (this.useFallback) return this.fallbackRequest(action, method, body);

    const url = `${API_ENDPOINT}?action=${action}`;
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    };
    
    try {
      const response = await fetch(url, options);
      if (response.status === 404) {
        console.warn(`Node 404 detected for [${action}]. Switching to Virtual Ledger (Hybrid Mode).`);
        this.useFallback = true;
        return this.fallbackRequest(action, method, body);
      }
      if (!response.ok) throw new Error(`Node Error: ${response.status}`);
      return response.json();
    } catch (err) {
      console.warn(`Request Exception [${action}]. Activating Persistence Failover.`);
      this.useFallback = true;
      return this.fallbackRequest(action, method, body);
    }
  }

  private getFallbackDB() {
    const data = localStorage.getItem(FALLBACK_KEY);
    if (data) return JSON.parse(data);

    // Initial Seed for Fallback
    const initialData = {
      leads: [
        { id: 'l1', title: 'First Class: NYC to London', category: 'International Flights', description: 'Executive travelers looking for last-minute first class bookings between JFK and LHR.', businessUrl: 'https://sky-luxury.com', targetLeadUrl: 'https://travel-ads.net/f-class', basePrice: 150, currentBid: 450, bidCount: 15, timeLeft: '10h 30m', qualityScore: 95, sellerRating: 4.9, status: 'approved', countryCode: 'US', region: 'New York', ownerId: 'admin_1' },
        { id: 'l2', title: 'Private Overwater Villa (Maldives)', category: 'Resort Bookings', description: 'Honeymooners and luxury seekers looking for 7-night stays at premium Maldivian resorts.', businessUrl: 'https://maldives-escapes.io', targetLeadUrl: 'https://resort-leads.pro/villa', basePrice: 80, currentBid: 210, bidCount: 8, timeLeft: '14h 15m', qualityScore: 91, sellerRating: 4.7, status: 'approved', countryCode: 'MV', region: 'Male', ownerId: 'admin_1' }
      ],
      users: [
        { id: 'admin_1', name: 'System Administrator', username: 'admin', password: '1234', email: 'admin@leadbid.pro', balance: 1000000, role: 'admin', stripeConnected: true, wishlist: [] }
      ],
      purchaseRequests: [],
      invoices: [],
      walletActivities: [],
      notifications: [],
      authConfig: { googleEnabled: false, googleClientId: '', googleClientSecret: '', facebookEnabled: false, facebookAppId: '', facebookAppSecret: '' },
      gateways: [
        { id: 'gw_stripe_primary', provider: 'stripe', name: 'Stripe Master Node', publicKey: 'pk_test_sample', secretKey: 'sk_test_sample', fee: '2.5', status: 'active' }
      ]
    };
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(initialData));
    return initialData;
  }

  private saveFallbackDB(db: any) {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(db));
  }

  private fallbackRequest(action: string, method: 'GET' | 'POST', body?: any) {
    const db = this.getFallbackDB();
    
    switch (action) {
      case 'get_data':
        return {
          metadata: { version: '4.1.3-LOCAL', last_updated: new Date().toISOString(), db_size: JSON.stringify(db).length, status: 'VIRTUAL' },
          ...db,
          analytics: {
            totalVolume: db.invoices.reduce((acc: number, inv: any) => acc + inv.totalSettlement, 0),
            activeTraders: db.users.length,
            avgCPA: 145,
            revenueHistory: [{ date: 'Mon', value: 500 }, { date: 'Tue', value: 800 }, { date: 'Wed', value: 1200 }]
          }
        };

      case 'get_categories':
        return NICHE_PROTOCOLS;

      case 'heartbeat':
        db.users = db.users.map((u: any) => u.id === body.userId ? { 
          ...u, 
          last_active_at: new Date().toISOString(), 
          current_page: body.page,
          location: body.location || u.location,
          ipAddress: body.ipAddress || u.ipAddress,
          deviceInfo: body.deviceInfo || u.deviceInfo
        } : u);
        this.saveFallbackDB(db);
        return { status: 'success' };

      case 'authenticate_user':
        const user = db.users.find((u: any) => (u.username === body.username || u.email === body.username) && u.password === body.token);
        if (user) {
            user.last_active_at = new Date().toISOString();
            user.current_page = 'Authentication';
            this.saveFallbackDB(db);
        }
        return { status: 'success', user: user || null };

      case 'social_sync':
        const existing = db.users.find((u: any) => u.email === body.email);
        if (existing) {
            existing.last_active_at = new Date().toISOString();
            this.saveFallbackDB(db);
            return { status: 'success', user: existing };
        }
        
        const socialUser = { 
          id: 'u_' + Math.random().toString(36).substr(2, 5),
          name: body.name,
          email: body.email,
          username: body.email.split('@')[0],
          profileImage: body.profileImage,
          balance: 1000, 
          role: 'user', 
          stripeConnected: false, 
          wishlist: [],
          last_active_at: new Date().toISOString(),
          current_page: 'Social Marketplace'
        };
        db.users.push(socialUser);
        this.saveFallbackDB(db);
        return { status: 'success', user: socialUser };

      case 'register_user':
        const newUser = { ...body, id: 'u_' + Math.random().toString(36).substr(2, 5), balance: 1000, role: 'user', stripeConnected: false, wishlist: [], last_active_at: new Date().toISOString(), current_page: 'Onboarding' };
        db.users.push(newUser);
        this.saveFallbackDB(db);
        return { status: 'success', user: newUser };

      case 'create_lead':
        const newLead = { ...body, id: 'l_' + Math.random().toString(36).substr(2, 5), currentBid: body.basePrice, bidCount: 0, timeLeft: '24h 0m', sellerRating: 5.0, status: 'approved' };
        db.leads.push(newLead);
        db.notifications.push({ id: 'n_' + Math.random().toString(36).substr(2, 5), userId: body.ownerId, message: `Lead Provisioned: ${body.title}`, type: 'sell', timestamp: new Date().toISOString(), read: false });
        this.saveFallbackDB(db);
        return { status: 'success' };

      case 'update_lead':
        db.leads = db.leads.map((l: any) => l.id === body.id ? { ...l, ...body } : l);
        this.saveFallbackDB(db);
        return { status: 'success' };

      case 'delete_lead':
        db.leads = db.leads.filter((l: any) => l.id !== body.id);
        this.saveFallbackDB(db);
        return { status: 'success' };

      case 'update_user':
        db.users = db.users.map((u: any) => u.id === body.id ? { ...u, ...body } : u);
        this.saveFallbackDB(db);
        return { status: 'success' };

      case 'place_bid':
        const bidId = 'bid_' + Math.random().toString(36).substr(2, 5);
        db.purchaseRequests.push({ ...body, id: bidId, timestamp: new Date().toISOString(), status: 'approved' });
        db.leads = db.leads.map((l: any) => l.id === body.leadId ? { ...l, currentBid: body.bidAmount, bidCount: l.bidCount + 1 } : l);
        this.saveFallbackDB(db);
        return { status: 'success' };

      case 'deposit':
        db.users = db.users.map((u: any) => u.id === body.userId ? { ...u, balance: u.balance + body.amount } : u);
        const txId = 'tx_' + Math.random().toString(36).substr(2, 5);
        db.walletActivities.push({
            id: txId,
            userId: body.userId,
            type: body.amount >= 0 ? 'deposit' : 'withdrawal',
            amount: Math.abs(body.amount),
            provider: body.provider || 'SYSTEM_SYNC',
            timestamp: new Date().toISOString(),
            status: 'completed'
        });
        this.saveFallbackDB(db);
        return { status: 'success' };

      case 'toggle_wishlist':
        db.users = db.users.map((u: any) => {
          if (u.id === body.userId) {
            const list = u.wishlist || [];
            const idx = list.indexOf(body.leadId);
            if (idx > -1) list.splice(idx, 1);
            else list.push(body.leadId);
            return { ...u, wishlist: list };
          }
          return u;
        });
        this.saveFallbackDB(db);
        return { status: 'success' };

      case 'clear_notifications':
        db.notifications = [];
        this.saveFallbackDB(db);
        return { status: 'success' };

      case 'update_auth_config':
        db.authConfig = body;
        this.saveFallbackDB(db);
        return { status: 'success' };

      case 'update_gateways':
        db.gateways = body.gateways;
        this.saveFallbackDB(db);
        return { status: 'success' };

      default:
        return { error: 'ACTION_NOT_FOUND' };
    }
  }

  // Public API Methods
  async getData(): Promise<any> { return this.request('get_data'); }
  async getCategories(): Promise<any> { return this.request('get_categories'); }
  
  async authenticateUser(username: string, token: string): Promise<User | null> {
    const res = await this.request('authenticate_user', 'POST', { username, token });
    return res.user;
  }

  async updateHeartbeat(userId: string, page: string, telemetry?: { location?: string, ipAddress?: string, deviceInfo?: string }): Promise<any> {
    return this.request('heartbeat', 'POST', { userId, page, ...telemetry });
  }

  async socialSync(profile: { name: string, email: string, profileImage: string }): Promise<User> {
    const res = await this.request('social_sync', 'POST', profile);
    return res.user;
  }

  async registerUser(userData: Partial<User>): Promise<User> {
    const res = await this.request('register_user', 'POST', userData);
    return res.user;
  }

  async createLead(leadData: Partial<Lead>): Promise<any> {
    return this.request('create_lead', 'POST', leadData);
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<any> {
    return this.request('update_lead', 'POST', { id, ...updates });
  }

  async deleteLead(id: string): Promise<any> {
    return this.request('delete_lead', 'POST', { id });
  }

  async updateUser(id: string, updates: Partial<User>): Promise<any> {
    return this.request('update_user', 'POST', { id, ...updates });
  }

  async placeBid(bidData: any): Promise<any> {
    return this.request('place_bid', 'POST', bidData);
  }

  async deposit(userId: string, amount: number, provider?: string): Promise<any> {
    return this.request('deposit', 'POST', { userId, amount, provider });
  }

  async toggleWishlist(userId: string, leadId: string): Promise<any> {
    return this.request('toggle_wishlist', 'POST', { userId, leadId });
  }

  async clearNotifications(): Promise<any> {
    return this.request('clear_notifications');
  }

  async updateAuthConfig(config: OAuthConfig): Promise<any> {
    return this.request('update_auth_config', 'POST', config);
  }

  async updateGateways(gateways: GatewayAPI[]): Promise<any> {
    return this.request('update_gateways', 'POST', { gateways });
  }
}

export const apiService = new ApiService();
