import { Lead, User, PurchaseRequest, Notification, PlatformAnalytics, OAuthConfig, Invoice } from '../types.ts';

const DB_KEY = 'leadbid_db_v2';

export const NICHE_PROTOCOLS = {
  "Financial & Debt": [
    "Business Loans (MCA)", "SBA Loan Inquiries", "Crypto Investment Leads", 
    "Stock Market Trading", "Gold & Silver IRA", "Debt Settlement", 
    "Credit Repair", "Tax Debt Relief", "Student Loan Relief", "Mortgage Refinance"
  ],
  "Real Estate & Property": [
    "Residential Home Sales", "Residential Rentals", "Commercial Real Estate Leasing", 
    "Property Management", "Airbnb Arbitrage", "Real Estate Investing (Fix/Flip)", 
    "New Construction Homes", "Foreclosure Leads"
  ],
  "Legal & Mass Tort": [
    "Personal Injury (MVA)", "Mass Tort (Camp Lejeune)", "Mass Tort (Talcum Powder)", 
    "Divorce & Family Law", "Immigration Legal Services", "Worker's Comp Inquiries", 
    "Social Security Disability", "Bankruptcy Filings"
  ],
  "Home Services": [
    "Solar Energy (Residential)", "Solar Energy (Commercial)", "HVAC Repair/Replace", 
    "Roofing Services", "Plumbing & Drain", "Water Damage Restoration", 
    "Pest Control", "Home Security Systems", "Moving & Storage", 
    "Kitchen & Bath Remodeling", "Landscape Design"
  ],
  "Travel & Hospitality": [
    "Flight Tickets (International)", "Flight Tickets (Domestic)", "Luxury Cruise Packages", 
    "Hotel & Resort Bookings", "Car Rental Inquiries", "Vacation Rental Bookings", 
    "Timeshare Exit / Relief", "Adventure Travel Tours", "Destination Weddings"
  ],
  "B2B & Technology": [
    "Managed IT Services (MSP)", "Cybersecurity SaaS", "CRM / ERP Software Inquiries", 
    "Cloud Infrastructure", "Digital Marketing / SEO", "Logistics & Freight Shipping", 
    "VOIP / PBX Systems", "HR & Payroll Services"
  ],
  "Healthcare & Medical": [
    "Dental Implants", "Weight Loss (GLP-1/Ozempic)", "Medical Tourism", 
    "Mental Health / Therapy", "Senior In-Home Care", "Addiction Rehab / Recovery", 
    "Hearing Aid Leads", "Plastic Surgery Inquiries"
  ],
  "Education & Vocational": [
    "Online Degree Programs", "Trade School / Vocational", "Coding Bootcamps", 
    "CDL Driver Training", "Nursing & Healthcare Training"
  ]
};

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
      username: 'admin',
      password: '1234',
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
    return NICHE_PROTOCOLS;
  }

  async registerUser(userData: Partial<User>) {
    const db = this.getDb();
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      balance: 100, // Starting capital
      stripeConnected: false,
      role: 'user' as const,
      wishlist: [],
      ...userData
    };
    db.users.push(newUser);
    this.saveDb(db);
    return newUser;
  }

  async authenticateUser(username: string, token: string) {
    const db = this.getDb();
    const user = db.users.find((u: any) => 
      (u.username === username || u.email === username) && u.password === token
    );
    return user || null;
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

  async updateUser(id: string, updates: Partial<User>) {
    const db = this.getDb();
    const index = db.users.findIndex((u: any) => u.id === id);
    if (index !== -1) {
      db.users[index] = { ...db.users[index], ...updates };
      this.saveDb(db);
    }
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
      buyerBusinessUrl, buyerTargetLeadUrl,
      leadTitle: lead.title,
      userName: user.name
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