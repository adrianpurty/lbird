import { Lead, User, PurchaseRequest, Notification, PlatformAnalytics, OAuthConfig, Invoice } from '../types';

const DB_KEY = 'leadbid_db_v1';

const INITIAL_CATEGORIES = [
  'Flight Tickets (International)', 'Flight Tickets (Domestic)', 'Luxury Cruise Packages', 
  'Hotel & Resort Bookings', 'Car Rental Inquiries', 'Vacation Rental Bookings', 
  'Timeshare Exit / Relief', 'Adventure Travel Tours', 'Destination Weddings',
  'Residential Home Sales', 'Residential Rentals', 'Commercial Real Estate Leasing', 
  'Property Management', 'Airbnb Arbitrage Opportunities', 'Real Estate Investing (Fix/Flip)',
  'New Construction Homes', 'Foreclosure Leads', 'Mortgage Refinance',
  'Business Loans (MCA)', 'SBA Loan Inquiries', 'Crypto Investment Leads', 'Stock Market Trading',
  'Gold & Silver IRA', 'Debt Settlement', 'Credit Repair', 'Tax Debt Relief', 'Student Loan Relief',
  'Personal Injury (MVA)', 'Mass Tort (Camp Lejeune)', 'Mass Tort (Talcum Powder)', 'Divorce & Family Law',
  'Immigration Legal Services', 'Worker\'s Comp Inquiries', 'Social Security Disability', 'Bankruptcy Filings',
  'Solar Energy (Residential)', 'Solar Energy (Commercial)', 'HVAC Repair/Replace', 'Roofing Services',
  'Plumbing & Drain', 'Water Damage Restoration', 'Pest Control', 'Home Security Systems',
  'Moving & Storage', 'Kitchen & Bath Remodeling', 'Landscape Design',
  'Managed IT Services (MSP)', 'Cybersecurity SaaS', 'CRM / ERP Software Inquiries', 'Cloud Infrastructure',
  'Digital Marketing / SEO', 'HR & Payroll Services', 'Logistics & Freight Shipping', 'VOIP / PBX Systems',
  'Dental Implants', 'Weight Loss (GLP-1/Ozempic)', 'Medical Tourism', 'Mental Health / Therapy',
  'Senior In-Home Care', 'Addiction Rehab / Recovery', 'Hearing Aid Leads', 'Plastic Surgery Inquiries',
  'Online Degree Programs', 'Trade School / Vocational', 'Coding Bootcamps', 'CDL Driver Training',
  'Nursing & Healthcare Training'
];

const INITIAL_DATA = {
  metadata: { version: '1.9.1', last_updated: new Date().toISOString() },
  categories: INITIAL_CATEGORIES,
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
    },
    {
      id: 'lead_travel_maldives',
      title: 'Direct Maldives Villa Booking Leads',
      category: 'Hotel & Resort Bookings',
      description: 'High-intent honeymooners and luxury travelers looking for overwater villas in the Maldives. Average spend $12k+.',
      businessUrl: 'https://maldives-luxe.travel',
      targetLeadUrl: 'https://ads.google.com/maldives-resorts',
      basePrice: 65,
      currentBid: 78,
      bidCount: 15,
      timeLeft: '12h 10m',
      qualityScore: 96,
      sellerRating: 5.0,
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
    },
    {
      id: 'user_mock',
      name: 'Standard Trader',
      email: 'user@example.com',
      balance: 5000,
      stripeConnected: false,
      role: 'user',
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
      { date: 'Mon', value: 12500 },
      { date: 'Tue', value: 15000 },
      { date: 'Wed', value: 11000 },
      { date: 'Thu', value: 18500 },
      { date: 'Fri', value: 22000 },
      { date: 'Sat', value: 14000 },
      { date: 'Sun', value: 9500 }
    ]
  },
  authConfig: { 
    googleEnabled: false, 
    googleClientId: '', 
    googleClientSecret: '', 
    facebookEnabled: false, 
    facebookAppId: '', 
    facebookAppSecret: '' 
  },
  gateways: []
};

class ApiService {
  private getDb() {
    try {
      const data = localStorage.getItem(DB_KEY);
      if (!data) {
        localStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DATA));
        return INITIAL_DATA;
      }
      return JSON.parse(data);
    } catch (e) {
      console.warn('LocalStorage unavailable, using initial data state', e);
      return INITIAL_DATA;
    }
  }

  private saveDb(db: any) {
    try {
      db.metadata.last_updated = new Date().toISOString();
      localStorage.setItem(DB_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to save to LocalStorage', e);
    }
  }

  async getData() {
    return this.getDb();
  }

  async getCategories() {
    const db = this.getDb();
    return (db.categories || []).sort();
  }

  async placeBid(input: any) {
    const db = this.getDb();
    const { userId, leadId, bidAmount, totalDailyCost, leadsPerDay } = input;

    const user = db.users.find((u: any) => u.id === userId);
    const lead = db.leads.find((l: any) => l.id === leadId);

    if (!user || !lead) throw new Error('Node not found');
    if (user.balance < totalDailyCost) throw new Error('Insufficient node credits');
    if (bidAmount <= lead.currentBid) throw new Error('Bid must exceed floor price');

    const requestId = `req_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = new Date().toISOString();

    user.balance -= totalDailyCost;
    lead.currentBid = bidAmount;
    lead.bidCount++;

    db.purchaseRequests.push({
      id: requestId,
      userId,
      leadId,
      bidAmount,
      leadsPerDay: leadsPerDay || 1,
      totalDailyCost,
      timestamp,
      status: 'approved'
    });

    db.invoices.push({
      id: `INV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      purchaseRequestId: requestId,
      userId,
      userName: user.name,
      leadTitle: lead.title,
      category: lead.category,
      unitPrice: bidAmount,
      dailyVolume: leadsPerDay || 1,
      totalSettlement: totalDailyCost,
      timestamp,
      status: 'paid'
    });

    db.notifications.push({
      id: `notif_${Math.random().toString(36).substr(2, 9)}`,
      userId: lead.ownerId || 'admin_1',
      message: `Order Secured & Invoiced: $${bidAmount}/unit bid on '${lead.title}'`,
      type: 'buy',
      timestamp: 'Just now',
      read: false
    });

    this.saveDb(db);
    return { status: 'success' };
  }

  async createLead(leadData: any) {
    const db = this.getDb();
    const newLead = {
      ...leadData,
      id: `lead_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      bidCount: 0,
      currentBid: leadData.basePrice || 50,
      timeLeft: '24h 0m',
      sellerRating: 5.0,
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
    if (user) {
      user.balance += amount;
      this.saveDb(db);
    }
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