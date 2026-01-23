import { Lead, User, PurchaseRequest, Notification, PlatformAnalytics, OAuthConfig, Invoice } from '../types.ts';

const DB_KEY = 'leadbid_db_v2';

const INITIAL_DATA = {
  metadata: { version: '2.0.0', last_updated: new Date().toISOString() },
  leads: [
    {
      id: 'lead_it_1',
      title: 'Managed Cybersecurity SaaS Inbound',
      category: 'Cybersecurity SaaS',
      description: 'High-intent B2B inquiries looking for endpoint protection. Average deal size $15k ARR.',
      businessUrl: 'https://saas-it-leads.com',
      targetLeadUrl: 'https://ads.google.com/campaign/cybersecurity',
      basePrice: 125,
      currentBid: 145,
      bidCount: 12,
      timeLeft: '18h 45m',
      qualityScore: 94,
      sellerRating: 4.9,
      status: 'approved',
      countryCode: 'US',
      region: 'Global',
      ownerId: 'admin_1'
    }
  ],
  users: [
    {
      id: 'admin_1',
      name: 'System Administrator',
      email: 'admin@leadbid.pro',
      balance: 1000000,
      stripeConnected: true,
      role: 'admin',
      wishlist: []
    }
  ],
  purchaseRequests: [],
  invoices: [],
  notifications: [],
  analytics: {
    totalVolume: 2450000,
    activeTraders: 1850,
    avgCPA: 145,
    successRate: 98,
    revenueHistory: [
      { date: 'Mon', value: 12500 }, { date: 'Tue', value: 15000 }, { date: 'Wed', value: 11000 },
      { date: 'Thu', value: 18500 }, { date: 'Fri', value: 22000 }, { date: 'Sat', value: 14000 },
      { date: 'Sun', value: 9500 }
    ]
  },
  authConfig: { 
    googleEnabled: false, googleClientId: '', googleClientSecret: '', 
    facebookEnabled: false, facebookAppId: '', facebookAppSecret: '' 
  },
  gateways: [
    {
      id: 'gw_stripe_primary',
      name: 'Stripe Master Node',
      provider: 'stripe',
      publicKey: 'pk_test_sample',
      secretKey: 'sk_test_sample',
      fee: '2.5',
      status: 'active'
    }
  ]
};

class ApiService {
  private getDb() {
    try {
      const data = localStorage.getItem(DB_KEY);
      return data ? JSON.parse(data) : INITIAL_DATA;
    } catch (e) {
      return INITIAL_DATA;
    }
  }

  private saveDb(db: any) {
    try {
      db.metadata.last_updated = new Date().toISOString();
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (e) {
      console.error("Critical Storage Error", e);
    }
  }

  async getData() { return this.getDb(); }

  async getCategories() {
    const db = this.getDb();
    const cats = new Set(db.leads.map((l: any) => l.category));
    return Array.from(cats).sort();
  }

  async updateAuthConfig(config: OAuthConfig) {
    const db = this.getDb();
    db.authConfig = config;
    this.saveDb(db);
    return { status: 'success' };
  }

  async updateGateways(gateways: any[]) {
    const db = this.getDb();
    db.gateways = gateways;
    this.saveDb(db);
    return { status: 'success' };
  }

  async placeBid(input: any) {
    const db = this.getDb();
    const { userId, leadId, bidAmount, totalDailyCost, leadsPerDay, buyerBusinessUrl, buyerTargetLeadUrl } = input;
    const user = db.users.find((u: any) => u.id === userId);
    const lead = db.leads.find((l: any) => l.id === leadId);
    
    if (!user || !lead) throw new Error('Target Node Offline');
    
    user.balance -= totalDailyCost;
    lead.currentBid = bidAmount;
    lead.bidCount++;
    
    const requestId = `req_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();
    
    db.purchaseRequests.push({ 
      id: requestId, userId, leadId, bidAmount, leadsPerDay, 
      totalDailyCost, timestamp, status: 'approved',
      buyerBusinessUrl, buyerTargetLeadUrl
    });
    
    db.invoices.push({ 
      id: `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`, 
      purchaseRequestId: requestId, userId, userName: user.name, 
      leadTitle: lead.title, category: lead.category, unitPrice: bidAmount, 
      dailyVolume: leadsPerDay, totalSettlement: totalDailyCost, timestamp, status: 'paid' 
    });
    
    this.saveDb(db);
    return { status: 'success' };
  }

  async createLead(leadData: any) {
    const db = this.getDb();
    const newLead = { 
      ...leadData, 
      id: `lead_${Math.random().toString(36).substr(2, 9)}`, 
      status: 'pending', bidCount: 0, 
      currentBid: leadData.basePrice || 50, 
      timeLeft: '24h 0m', sellerRating: 5.0, 
      countryCode: leadData.countryCode || 'US' 
    };
    db.leads.push(newLead);
    this.saveDb(db);
    return { status: 'success', lead: newLead };
  }

  async updateLead(id: string, updates: any) {
    const db = this.getDb();
    const index = db.leads.findIndex((l: any) => l.id === id);
    if (index !== -1) {
      db.leads[index] = { ...db.leads[index], ...updates };
      this.saveDb(db);
    }
    return { status: 'success' };
  }

  async deleteLead(id: string) {
    const db = this.getDb();
    db.leads = db.leads.filter((l: any) => l.id !== id);
    this.saveDb(db);
    return { status: 'success' };
  }

  async deposit(userId: string, amount: number) {
    const db = this.getDb();
    const user = db.users.find((u: any) => u.id === userId);
    if (user) { user.balance += amount; this.saveDb(db); }
    return { status: 'success' };
  }

  async toggleWishlist(userId: string, leadId: string) {
    const db = this.getDb();
    const user = db.users.find((u: any) => u.id === userId);
    if (user) {
      user.wishlist = user.wishlist || [];
      const idx = user.wishlist.indexOf(leadId);
      if (idx !== -1) user.wishlist.splice(idx, 1);
      else user.wishlist.push(leadId);
      this.saveDb(db);
    }
    return { status: 'success' };
  }

  async clearNotifications() {
    const db = this.getDb();
    db.notifications.forEach((n: any) => n.read = true);
    this.saveDb(db);
    return { status: 'success' };
  }
}

export const apiService = new ApiService();