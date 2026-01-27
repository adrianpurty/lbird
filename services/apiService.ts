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
        this.useFallback = true;
        return this.fallbackRequest(action, method, body);
      }
      if (!response.ok) throw new Error(`Node Error: ${response.status}`);
      return response.json();
    } catch (err) {
      this.useFallback = true;
      return this.fallbackRequest(action, method, body);
    }
  }

  private getFallbackDB() {
    const data = localStorage.getItem(FALLBACK_KEY);
    if (data) return JSON.parse(data);

    const initialData = {
      leads: [
        { id: 'l1', title: 'First Class: NYC to London', category: 'International Flights', description: 'Executive travelers looking for last-minute first class bookings between JFK and LHR.', businessUrl: 'https://sky-luxury.com', targetLeadUrl: 'https://travel-ads.net/f-class', basePrice: 150, currentBid: 450, bidCount: 15, timeLeft: '10h 30m', qualityScore: 95, sellerRating: 4.9, status: 'approved', countryCode: 'US', region: 'New York', ownerId: 'admin_1' },
        { id: 'l2', title: 'Private Overwater Villa (Maldives)', category: 'Resort Bookings', description: 'Honeymooners and luxury seekers looking for 7-night stays at premium Maldivian resorts.', businessUrl: 'https://maldives-escapes.io', targetLeadUrl: 'https://resort-leads.pro/villa', basePrice: 80, currentBid: 210, bidCount: 8, timeLeft: '14h 15m', qualityScore: 91, sellerRating: 4.7, status: 'approved', countryCode: 'MV', region: 'Male', ownerId: 'admin_1' },
        // TRAVEL LEADS (10)
        { id: 'l3', title: 'Luxury Safari: Serengeti Plain', category: 'Resort Bookings', description: 'High-intent travelers requesting private guided safari experiences in Tanzania.', businessUrl: 'https://wild-safari.com', targetLeadUrl: 'https://travel-pro.net/safari', basePrice: 120, currentBid: 310, bidCount: 5, timeLeft: '18h 45m', qualityScore: 89, sellerRating: 4.8, status: 'approved', countryCode: 'TZ', region: 'Arusha', ownerId: 'admin_1' },
        { id: 'l4', title: 'Mediterranean Yacht Charter', category: 'Luxury Cruises', description: 'Inbound requests for 100ft+ yacht charters across the French Riviera and Amalfi Coast.', businessUrl: 'https://yacht-masters.io', targetLeadUrl: 'https://luxury-leads.pro/yachts', basePrice: 200, currentBid: 550, bidCount: 22, timeLeft: '08h 12m', qualityScore: 97, sellerRating: 5.0, status: 'approved', countryCode: 'FR', region: 'Cannes', ownerId: 'admin_1' },
        { id: 'l5', title: 'Business Class: Dubai to Singapore', category: 'International Flights', description: 'Corporate travelers seeking competitive business class fares for long-haul routes.', businessUrl: 'https://emirates-biz.com', targetLeadUrl: 'https://sky-leads.net/dxb-sin', basePrice: 90, currentBid: 180, bidCount: 12, timeLeft: '22h 30m', qualityScore: 92, sellerRating: 4.6, status: 'approved', countryCode: 'AE', region: 'Dubai', ownerId: 'admin_1' },
        { id: 'l6', title: 'Bali Wellness Retreat 2024', category: 'Resort Bookings', description: 'Wellness enthusiasts looking for all-inclusive spiritual and health retreats in Ubud.', businessUrl: 'https://bali-zen.io', targetLeadUrl: 'https://retreats.pro/bali', basePrice: 65, currentBid: 145, bidCount: 9, timeLeft: '15h 20m', qualityScore: 88, sellerRating: 4.5, status: 'approved', countryCode: 'ID', region: 'Ubud', ownerId: 'admin_1' },
        { id: 'l7', title: 'Tokyo Gourmet Adventure', category: 'Resort Bookings', description: 'Luxury travelers seeking Michelin-star culinary tours and premium hotel stays in Shinjuku.', businessUrl: 'https://japantravel.co', targetLeadUrl: 'https://foodie-leads.pro/tokyo', basePrice: 110, currentBid: 290, bidCount: 14, timeLeft: '11h 05m', qualityScore: 94, sellerRating: 4.9, status: 'approved', countryCode: 'JP', region: 'Tokyo', ownerId: 'admin_1' },
        { id: 'l8', title: 'Arctic Expedition Cruise', category: 'Luxury Cruises', description: 'Adventure seekers interested in luxury ice-breaker cruises to Svalbard and Greenland.', businessUrl: 'https://polar-voyage.com', targetLeadUrl: 'https://expedition-leads.net/arctic', basePrice: 180, currentBid: 420, bidCount: 11, timeLeft: '05h 45m', qualityScore: 93, sellerRating: 4.7, status: 'approved', countryCode: 'NO', region: 'Tromso', ownerId: 'admin_1' },
        { id: 'l9', title: 'Swiss Alps Ski Chalet', category: 'Resort Bookings', description: 'Family groups looking for exclusive ski-in/ski-out chalets in Zermatt for peak season.', businessUrl: 'https://alps-luxury.ch', targetLeadUrl: 'https://ski-leads.pro/zermatt', basePrice: 140, currentBid: 380, bidCount: 19, timeLeft: '02h 15m', qualityScore: 96, sellerRating: 5.0, status: 'approved', countryCode: 'CH', region: 'Zermatt', ownerId: 'admin_1' },
        { id: 'l10', title: 'Caribbean Private Island', category: 'Resort Bookings', description: 'High-net-worth inquiries for full private island buyouts in the British Virgin Islands.', businessUrl: 'https://island-hideaway.vg', targetLeadUrl: 'https://luxury-leads.pro/islands', basePrice: 300, currentBid: 850, bidCount: 6, timeLeft: '21h 10m', qualityScore: 98, sellerRating: 4.8, status: 'approved', countryCode: 'VG', region: 'Tortola', ownerId: 'admin_1' },
        { id: 'l11', title: 'Paris Fashion Week Suite', category: 'Resort Bookings', description: 'Fashion industry professionals seeking premium suites near Place Vendôme during event weeks.', businessUrl: 'https://paris-luxe.fr', targetLeadUrl: 'https://event-leads.net/fashion', basePrice: 125, currentBid: 410, bidCount: 31, timeLeft: '13h 40m', qualityScore: 95, sellerRating: 4.9, status: 'approved', countryCode: 'FR', region: 'Paris', ownerId: 'admin_1' },
        { id: 'l12', title: 'Australian Great Barrier Reef', category: 'Luxury Cruises', description: 'Inbound leads for luxury catamaran charters and diving expeditions on the reef.', businessUrl: 'https://reef-luxury.com.au', targetLeadUrl: 'https://ocean-leads.pro/reef', basePrice: 95, currentBid: 220, bidCount: 13, timeLeft: '19h 55m', qualityScore: 91, sellerRating: 4.6, status: 'approved', countryCode: 'AU', region: 'Cairns', ownerId: 'admin_1' },
        // HEALTH LEADS (10)
        { id: 'l13', title: 'Premium Dental Implants', category: 'Dental Care', description: 'Patients seeking high-end permanent dental restoration and implant surgery.', businessUrl: 'https://smile-perfect.com', targetLeadUrl: 'https://health-leads.pro/implants', basePrice: 50, currentBid: 125, bidCount: 25, timeLeft: '23h 10m', qualityScore: 94, sellerRating: 4.8, status: 'approved', countryCode: 'US', region: 'Miami', ownerId: 'admin_1' },
        { id: 'l14', title: 'Executive Health Checkup', category: 'Health Insurance', description: 'Inquiries for comprehensive full-body AI diagnostic scans and longevity screening.', businessUrl: 'https://longevity-hub.io', targetLeadUrl: 'https://wellness-leads.net/scan', basePrice: 75, currentBid: 195, bidCount: 18, timeLeft: '16h 25m', qualityScore: 96, sellerRating: 5.0, status: 'approved', countryCode: 'US', region: 'Palo Alto', ownerId: 'admin_1' },
        { id: 'l15', title: 'Cosmetic Rhinoplasty Package', category: 'Medical Aesthetics', description: 'Patients requesting consultations for advanced rhinoplasty procedures with top surgeons.', businessUrl: 'https://face-art.kr', targetLeadUrl: 'https://aesthetics.pro/rhino', basePrice: 100, currentBid: 320, bidCount: 14, timeLeft: '12h 15m', qualityScore: 92, sellerRating: 4.7, status: 'approved', countryCode: 'KR', region: 'Seoul', ownerId: 'admin_1' },
        { id: 'l16', title: 'Global Travel Health Policy', category: 'Health Insurance', description: 'Digital nomads seeking premium global health coverage including medical evacuation.', businessUrl: 'https://nomad-shield.com', targetLeadUrl: 'https://insure-leads.pro/global', basePrice: 40, currentBid: 95, bidCount: 42, timeLeft: '04h 50m', qualityScore: 89, sellerRating: 4.5, status: 'approved', countryCode: 'CH', region: 'Zurich', ownerId: 'admin_1' },
        { id: 'l17', title: 'Invisalign Network Leads', category: 'Dental Care', description: 'Adults looking for clear aligner treatments and orthodontic consultations.', businessUrl: 'https://straight-smile.io', targetLeadUrl: 'https://dental-leads.net/aligners', basePrice: 55, currentBid: 135, bidCount: 20, timeLeft: '17h 10m', qualityScore: 91, sellerRating: 4.6, status: 'approved', countryCode: 'US', region: 'Los Angeles', ownerId: 'admin_1' },
        { id: 'l18', title: 'Bio-Hacking Wellness Protocol', category: 'Medical Aesthetics', description: 'High-income individuals interested in NAD+ therapy and personalized longevity treatments.', businessUrl: 'https://bio-health.io', targetLeadUrl: 'https://wellness.pro/biohack', basePrice: 85, currentBid: 240, bidCount: 7, timeLeft: '09h 35m', qualityScore: 95, sellerRating: 4.9, status: 'approved', countryCode: 'US', region: 'New York', ownerId: 'admin_1' },
        { id: 'l19', title: 'Holistic Skin Rejuvenation', category: 'Medical Aesthetics', description: 'Leads for non-invasive laser treatments and stem-cell skin rejuvenation protocols.', businessUrl: 'https://skin-science.fr', targetLeadUrl: 'https://beauty-leads.pro/laser', basePrice: 60, currentBid: 165, bidCount: 12, timeLeft: '20h 40m', qualityScore: 90, sellerRating: 4.7, status: 'approved', countryCode: 'FR', region: 'Paris', ownerId: 'admin_1' },
        { id: 'l20', title: 'Pediatric Dental Specialists', category: 'Dental Care', description: 'Parents searching for specialized, high-care pediatric dental services for children.', businessUrl: 'https://kids-smile.ca', targetLeadUrl: 'https://health-leads.net/kids-dental', basePrice: 45, currentBid: 110, bidCount: 15, timeLeft: '21h 05m', qualityScore: 88, sellerRating: 4.8, status: 'approved', countryCode: 'CA', region: 'Toronto', ownerId: 'admin_1' },
        { id: 'l21', title: 'Med-Evac Insurance Inbound', category: 'Health Insurance', description: 'Expats and frequent travelers requesting information on emergency medical transport coverage.', businessUrl: 'https://secure-travel.uk', targetLeadUrl: 'https://insure-leads.pro/medevac', basePrice: 50, currentBid: 130, bidCount: 28, timeLeft: '06h 55m', qualityScore: 93, sellerRating: 4.6, status: 'approved', countryCode: 'UK', region: 'London', ownerId: 'admin_1' },
        { id: 'l22', title: 'Advanced Sleep Apnea Clinic', category: 'Medical Aesthetics', description: 'Patients looking for specialized treatments and surgical options for chronic sleep apnea.', businessUrl: 'https://sleep-well.de', targetLeadUrl: 'https://health-leads.pro/sleep', basePrice: 70, currentBid: 185, bidCount: 9, timeLeft: '10h 15m', qualityScore: 91, sellerRating: 4.7, status: 'approved', countryCode: 'DE', region: 'Berlin', ownerId: 'admin_1' }
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
        return { metadata: { version: '4.0.0-LOCAL' }, ...db };
      case 'get_categories':
        return NICHE_PROTOCOLS;
      case 'authenticate_user':
        const user = db.users.find((u: any) => (u.username === body.username || u.email === body.username) && u.password === body.token);
        return { status: 'success', user: user || null };
      case 'social_sync':
        const existing = db.users.find((u: any) => u.email === body.email);
        if (existing) return { status: 'success', user: existing };
        const socialUser = { id: 'u_' + Math.random().toString(36).substr(2, 5), name: body.name, email: body.email, balance: 1000, role: 'user', status: 'active', wishlist: [] };
        db.users.push(socialUser);
        this.saveFallbackDB(db);
        return { status: 'success', user: socialUser };
      case 'register_user':
        const newUser = { ...body, id: 'u_' + Math.random().toString(36).substr(2, 5), balance: 1000, role: 'user', status: 'active', wishlist: [] };
        db.users.push(newUser);
        this.saveFallbackDB(db);
        return { status: 'success', user: newUser };
      case 'create_lead':
        const newLead = { ...body, id: 'l_' + Math.random().toString(36).substr(2, 5), currentBid: body.basePrice, bidCount: 0, status: 'approved' };
        db.leads.push(newLead);
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
      case 'place_bid':
        db.purchaseRequests.push({ ...body, id: 'bid_' + Math.random().toString(36).substr(2, 5), timestamp: new Date().toISOString(), status: 'approved' });
        db.leads = db.leads.map((l: any) => l.id === body.leadId ? { ...l, currentBid: body.bidAmount, bidCount: l.bidCount + 1 } : l);
        this.saveFallbackDB(db);
        return { status: 'success' };
      case 'deposit':
        db.users = db.users.map((u: any) => u.id === body.userId ? { ...u, balance: u.balance + body.amount } : u);
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
      default:
        return { error: 'ACTION_NOT_FOUND' };
    }
  }

  async getData(): Promise<any> { return this.request('get_data'); }
  async getCategories(): Promise<any> { return this.request('get_categories'); }
  async authenticateUser(username: string, token: string): Promise<User | null> {
    const res = await this.request('authenticate_user', 'POST', { username, token });
    return res.user;
  }
  async socialSync(profile: { name: string, email: string, profileImage: string }): Promise<User> {
    const res = await this.request('social_sync', 'POST', profile);
    return res.user;
  }
  async registerUser(userData: Partial<User>): Promise<User> {
    const res = await this.request('register_user', 'POST', userData);
    return res.user;
  }
  async createLead(leadData: Partial<Lead>): Promise<any> { return this.request('create_lead', 'POST', leadData); }
  async updateLead(id: string, updates: Partial<Lead>): Promise<any> { return this.request('update_lead', 'POST', { id, ...updates }); }
  async deleteLead(id: string): Promise<any> { return this.request('delete_lead', 'POST', { id }); }
  async updateUser(id: string, updates: Partial<User>): Promise<any> { return this.request('update_user', 'POST', { id, ...updates }); }
  async placeBid(bidData: any): Promise<any> { return this.request('place_bid', 'POST', bidData); }
  async deposit(userId: string, amount: number, provider?: string): Promise<any> { return this.request('deposit', 'POST', { userId, amount, provider }); }
  async toggleWishlist(userId: string, leadId: string): Promise<any> { return this.request('toggle_wishlist', 'POST', { userId, leadId }); }
  async clearNotifications(): Promise<any> { return this.request('clear_notifications'); }
  async updateAuthConfig(config: OAuthConfig): Promise<any> { return this.request('update_auth_config', 'POST', config); }
  async updateGateways(gateways: GatewayAPI[]): Promise<any> { return this.request('update_gateways', 'POST', { gateways }); }
}

export const apiService = new ApiService();