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
    },
    {
      id: 'travel_1',
      title: 'NYC to London Business Class Inquiries',
      category: 'Flight Tickets (International)',
      description: 'High-net-worth travelers seeking corporate travel solutions for the NYC-LHR route.',
      businessUrl: 'https://sky-luxe-travel.com',
      targetLeadUrl: 'https://google.com/ads/intl-flights',
      basePrice: 85,
      currentBid: 110,
      bidCount: 22,
      timeLeft: '12h 10m',
      qualityScore: 91,
      sellerRating: 4.8,
      status: 'approved',
      countryCode: 'US',
      region: 'Global',
      ownerId: 'admin_1'
    },
    {
      id: 'travel_2',
      title: 'Serengeti Luxury Safari Group Leads',
      category: 'Adventure Travel Tours',
      description: 'Qualified groups of 4+ travelers looking for all-inclusive photographic safaris in Tanzania.',
      businessUrl: 'https://safari-gold.tz',
      targetLeadUrl: 'https://fb.com/ads/safari-tours',
      basePrice: 150,
      currentBid: 165,
      bidCount: 8,
      timeLeft: '14h 30m',
      qualityScore: 98,
      sellerRating: 5.0,
      status: 'approved',
      countryCode: 'TZ',
      region: 'Global',
      ownerId: 'admin_1'
    },
    {
      id: 'travel_3',
      title: 'Maldives Overwater Bungalow Bookings',
      category: 'Hotel & Resort Bookings',
      description: 'Honeymooners seeking high-ticket resort stays. Average booking value $14,000.',
      businessUrl: 'https://blue-lagoon-resorts.mv',
      targetLeadUrl: 'https://google.com/luxury-stays',
      basePrice: 200,
      currentBid: 245,
      bidCount: 15,
      timeLeft: '6h 45m',
      qualityScore: 95,
      sellerRating: 4.9,
      status: 'approved',
      countryCode: 'AE',
      region: 'Global',
      ownerId: 'admin_1'
    },
    {
      id: 'travel_4',
      title: 'Mediterranean 7-Night Cruise Leads',
      category: 'Luxury Cruise Packages',
      description: 'Premium cruise leads for Summer 2025 Mediterranean itineraries. Balcony suite preference.',
      businessUrl: 'https://ocean-majesty.co',
      targetLeadUrl: 'https://ads.bing.com/cruise-deals',
      basePrice: 95,
      currentBid: 115,
      bidCount: 31,
      timeLeft: '22h 15m',
      qualityScore: 89,
      sellerRating: 4.7,
      status: 'approved',
      countryCode: 'ES',
      region: 'Global',
      ownerId: 'admin_1'
    },
    {
      id: 'travel_5',
      title: 'Santorini Destination Wedding Inquiries',
      category: 'Destination Weddings',
      description: 'Couples planning high-budget weddings in Santorini for 50+ guests.',
      businessUrl: 'https://aegean-weddings.gr',
      targetLeadUrl: 'https://instagram.com/wedding-planner-ads',
      basePrice: 250,
      currentBid: 280,
      bidCount: 5,
      timeLeft: '19h 20m',
      qualityScore: 97,
      sellerRating: 5.0,
      status: 'approved',
      countryCode: 'FR',
      region: 'Global',
      ownerId: 'admin_1'
    },
    {
      id: 'travel_6',
      title: 'Miami Premium SUV Car Rentals',
      category: 'Car Rental Inquiries',
      description: 'Vacationers arriving at MIA seeking luxury SUV rentals (Escalade/Range Rover).',
      businessUrl: 'https://miami-drive-luxe.com',
      targetLeadUrl: 'https://google.com/rental-ads-mia',
      basePrice: 45,
      currentBid: 52,
      bidCount: 45,
      timeLeft: '8h 05m',
      qualityScore: 88,
      sellerRating: 4.5,
      status: 'approved',
      countryCode: 'US',
      region: 'Global',
      ownerId: 'admin_1'
    },
    {
      id: 'travel_7',
      title: 'Swiss Alps Luxury Chalet Bookings',
      category: 'Vacation Rental Bookings',
      description: 'Winter season ski-in/ski-out chalet inquiries for Zermatt and St. Moritz.',
      businessUrl: 'https://alpine-chalets.ch',
      targetLeadUrl: 'https://google.com/ski-vacation',
      basePrice: 180,
      currentBid: 195,
      bidCount: 12,
      timeLeft: '15h 10m',
      qualityScore: 93,
      sellerRating: 4.8,
      status: 'approved',
      countryCode: 'FR',
      region: 'Global',
      ownerId: 'admin_1'
    },
    {
      id: 'travel_8',
      title: 'Timeshare Exit Legal Consultation',
      category: 'Timeshare Exit / Relief',
      description: 'Owners seeking legitimate legal assistance to exit burdensome timeshare contracts.',
      businessUrl: 'https://timeshare-relief-group.com',
      targetLeadUrl: 'https://fb.com/legal-relief-ads',
      basePrice: 75,
      currentBid: 90,
      bidCount: 55,
      timeLeft: '10h 40m',
      qualityScore: 85,
      sellerRating: 4.4,
      status: 'approved',
      countryCode: 'US',
      region: 'Global',
      ownerId: 'admin_1'
    },
    {
      id: 'travel_9',
      title: 'Tokyo Cherry Blossom 2025 Tours',
      category: 'Adventure Travel Tours',
      description: 'Travelers seeking guided cultural tours in Japan for the upcoming Sakura season.',
      businessUrl: 'https://nihon-explorers.jp',
      targetLeadUrl: 'https://google.com/tokyo-tour-ads',
      basePrice: 110,
      currentBid: 130,
      bidCount: 18,
      timeLeft: '21h 55m',
      qualityScore: 92,
      sellerRating: 4.9,
      status: 'approved',
      countryCode: 'JP',
      region: 'Global',
      ownerId: 'admin_1'
    },
    {
      id: 'travel_10',
      title: 'Orlando Disney Family Package Inbound',
      category: 'Hotel & Resort Bookings',
      description: 'Families of 4+ seeking all-inclusive Disney World hotel and ticket bundles.',
      businessUrl: 'https://magic-stay-planner.com',
      targetLeadUrl: 'https://google.com/disney-deals',
      basePrice: 55,
      currentBid: 68,
      bidCount: 62,
      timeLeft: '4h 15m',
      qualityScore: 87,
      sellerRating: 4.6,
      status: 'approved',
      countryCode: 'US',
      region: 'Global',
      ownerId: 'admin_1'
    },
    {
      id: 'travel_11',
      title: 'Bali Group Wellness Retreat Leads',
      category: 'Adventure Travel Tours',
      description: 'Corporate and private group inquiries for yoga and wellness retreats in Ubud.',
      businessUrl: 'https://bali-spirit-retreats.io',
      targetLeadUrl: 'https://fb.com/wellness-bali-ads',
      basePrice: 135,
      currentBid: 155,
      bidCount: 9,
      timeLeft: '17h 25m',
      qualityScore: 96,
      sellerRating: 5.0,
      status: 'approved',
      countryCode: 'ID',
      region: 'Global',
      ownerId: 'admin_1'
    },
    {
      id: 'travel_12',
      title: 'Caribbean Private Yacht Charters',
      category: 'Luxury Cruise Packages',
      description: 'High-ticket leads for weekly private catamaran and yacht charters in the BVI.',
      businessUrl: 'https://azure-yachts.com',
      targetLeadUrl: 'https://google.com/yacht-charter',
      basePrice: 300,
      currentBid: 350,
      bidCount: 4,
      timeLeft: '23h 10m',
      qualityScore: 99,
      sellerRating: 5.0,
      status: 'approved',
      countryCode: 'AE',
      region: 'Global',
      ownerId: 'admin_1'
    },
    {
      id: 'travel_13',
      title: 'Domestic Flight Bundle (LAX-JFK)',
      category: 'Flight Tickets (Domestic)',
      description: 'Last-minute business travelers seeking reliable transcontinental flight solutions.',
      businessUrl: 'https://rapid-flight-deals.com',
      targetLeadUrl: 'https://ads.bing.com/domestic-flights',
      basePrice: 35,
      currentBid: 42,
      bidCount: 88,
      timeLeft: '3h 30m',
      qualityScore: 82,
      sellerRating: 4.3,
      status: 'approved',
      countryCode: 'US',
      region: 'Global',
      ownerId: 'admin_1'
    },
    {
      id: 'travel_14',
      title: 'Aspen Winter Private Jet Leads',
      category: 'Flight Tickets (International)',
      description: 'Empty leg and dedicated charter inquiries for travelers headed to ASE for ski season.',
      businessUrl: 'https://sky-private-jets.com',
      targetLeadUrl: 'https://google.com/aspen-jet-charter',
      basePrice: 450,
      currentBid: 520,
      bidCount: 3,
      timeLeft: '20h 15m',
      qualityScore: 97,
      sellerRating: 5.0,
      status: 'approved',
      countryCode: 'US',
      region: 'Global',
      ownerId: 'admin_1'
    },
    {
      id: 'travel_15',
      title: 'European River Cruise (Rhine/Danube)',
      category: 'Luxury Cruise Packages',
      description: 'Senior travelers seeking all-inclusive river cruise experiences with excursions.',
      businessUrl: 'https://river-majesty-cruises.eu',
      targetLeadUrl: 'https://google.com/river-cruise-ads',
      basePrice: 115,
      currentBid: 140,
      bidCount: 26,
      timeLeft: '16h 50m',
      qualityScore: 91,
      sellerRating: 4.8,
      status: 'approved',
      countryCode: 'FR',
      region: 'Global',
      ownerId: 'admin_1'
    },
    {
      id: 'travel_16',
      title: 'Everest Base Camp Trek Inquiries',
      category: 'Adventure Travel Tours',
      description: 'Highly motivated adventurers seeking fully supported trek packages in Nepal.',
      businessUrl: 'https://himalayan-peaks.travel',
      targetLeadUrl: 'https://fb.com/everest-trek-ads',
      basePrice: 160,
      currentBid: 185,
      bidCount: 7,
      timeLeft: '13h 10m',
      qualityScore: 94,
      sellerRating: 4.9,
      status: 'approved',
      countryCode: 'UK',
      region: 'Global',
      ownerId: 'admin_1'
    },
    {
      id: 'travel_17',
      title: 'Las Vegas Luxury Suite Inbound',
      category: 'Hotel & Resort Bookings',
      description: 'Bachelor/Bachelorette groups looking for high-end suites and nightlife VIP access.',
      businessUrl: 'https://vegas-vip-hosts.com',
      targetLeadUrl: 'https://google.com/las-vegas-suites',
      basePrice: 65,
      currentBid: 82,
      bidCount: 41,
      timeLeft: '9h 45m',
      qualityScore: 86,
      sellerRating: 4.5,
      status: 'approved',
      countryCode: 'US',
      region: 'Global',
      ownerId: 'admin_1'
    },
    {
      id: 'travel_18',
      title: 'Africa Wildlife Photographic Safari',
      category: 'Adventure Travel Tours',
      description: 'Professional and hobbyist photographers seeking specialized gear-friendly safari tours.',
      businessUrl: 'https://wild-lens-tours.za',
      targetLeadUrl: 'https://google.com/safari-photography',
      basePrice: 140,
      currentBid: 165,
      bidCount: 11,
      timeLeft: '18h 30m',
      qualityScore: 95,
      sellerRating: 5.0,
      status: 'approved',
      countryCode: 'TZ',
      region: 'Global',
      ownerId: 'admin_1'
    },
    {
      id: 'travel_19',
      title: 'Iceland Northern Lights Expedition',
      category: 'Adventure Travel Tours',
      description: 'Winter season travelers seeking 4x4 guided tours and aurora borealis viewing packages.',
      businessUrl: 'https://iceland-fire-ice.is',
      targetLeadUrl: 'https://fb.com/iceland-aurora-ads',
      basePrice: 125,
      currentBid: 150,
      bidCount: 14,
      timeLeft: '11h 20m',
      qualityScore: 92,
      sellerRating: 4.9,
      status: 'approved',
      countryCode: 'UK',
      region: 'Global',
      ownerId: 'admin_1'
    },
    {
      id: 'travel_20',
      title: 'South Pacific Island Hopping Cruise',
      category: 'Luxury Cruise Packages',
      description: 'Retirees seeking long-duration luxury cruises through Fiji and Tahiti.',
      businessUrl: 'https://pacific-dream-cruises.com',
      targetLeadUrl: 'https://google.com/south-pacific-cruises',
      basePrice: 110,
      currentBid: 135,
      bidCount: 19,
      timeLeft: '21h 10m',
      qualityScore: 90,
      sellerRating: 4.7,
      status: 'approved',
      countryCode: 'JP',
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
    return NICHE_PROTOCOLS;
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