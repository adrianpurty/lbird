
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  runTransaction,
  serverTimestamp,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { db } from "./firebase.ts";
import { Lead, User, PurchaseRequest, Notification, PlatformAnalytics, OAuthConfig, Invoice, GatewayAPI, WalletActivity } from '../types.ts';

const ADMIN_EMAIL = "enjodanzo@gmail.com";

export const NICHE_PROTOCOLS = {
  "Finance": ["Crypto Trading", "High-Ticket Insurance", "Mortgage Leads", "Debt Settlement", "Asset Management", "Venture Capital"],
  "Real Estate": ["Commercial Property", "Residential Leads", "Solar Energy", "Luxury Development", "Property Management"],
  "Technology": ["SaaS Enterprise", "Cybersecurity Audit", "AI/ML Solutions", "Cloud Infrastructure", "FinTech Systems"],
  "Health & Medical": ["Medical Aesthetics", "Dental Care", "Health Insurance", "Biotech Research", "Telehealth", "Surgical Leads"],
  "Legal": ["Personal Injury", "Corporate Law", "Immigration Leads", "Intellectual Property", "Class Action"],
  "Home Services": ["HVAC Maintenance", "Roofing Contracts", "Plumbing Pros", "Solar Deployment", "Smart Home Install"],
  "Education": ["Higher Ed Enrollment", "EdTech Licensing", "Corporate Training", "Language Learning", "STEM Programs"],
  "Marketing & Ads": ["SEO Services", "PPC Management", "Content Strategy", "Influencer Outreach", "Public Relations"],
  "E-commerce": ["DTC Retail", "B2B Wholesalers", "Subscription Models", "Marketplace Sellers", "Dropshipping"],
  "Automotive": ["Vehicle Acquisition", "Auto Finance", "Insurance Recovery", "Electric Vehicle Fleet"],
  "Manufacturing": ["Industrial Supply", "Chemical Sourcing", "Logistics Optimization", "Heavy Machinery"],
  "Logistics & Supply": ["Freight Forwarding", "Warehouse Tech", "Last-Mile Delivery", "Cold Chain Logistics"],
  "Human Resources": ["Talent Acquisition", "Payroll Systems", "Employee Benefits", "HR Tech Solutions"],
  "Energy & Utilities": ["Renewable Grid", "Power Utility", "Natural Gas", "Water Management"],
  "Telecommunications": ["Fiber Network", "VoIP Solutions", "Satellite Comms", "5G Infrastructure"],
  "Food & Beverage": ["Franchise Opps", "Restaurant Supply", "Consumer Packaged Goods", "AgriTech"],
  "Insurance": ["Life & Wellness", "General Liability", "Workers Comp", "Specialty Risk"],
  "Travel & Tourism": ["Luxury Cruises", "International Flights", "Resort Bookings", "Boutique Stays"],
  "Security": ["Physical Security", "Surveillance Tech", "Access Control", "Risk Mitigation"],
  "Non-Profit": ["High-Value Fundraising", "Grant Matching", "Advocacy Campaign"]
};

class ApiService {
  async seedInitialData(): Promise<void> {
    const adminId = "admin_root";
    await setDoc(doc(db, "users", adminId), {
      id: adminId,
      name: "MASTER_TREASURY",
      email: ADMIN_EMAIL,
      username: "admin_treasury",
      balance: 0.0,
      role: 'admin',
      status: 'active',
      stripeConnected: true,
      wishlist: [],
      totalSpend: 0,
      biometricEnabled: false,
      phone: "+1 (888) LEAD-BID",
      defaultBusinessUrl: "https://leadbid.pro",
      defaultTargetUrl: "https://api.leadbid.pro/v1/ingest",
      industryFocus: "Treasury Management",
      preferredContact: "email",
      last_active_at: new Date().toISOString(),
      current_page: "Marketplace"
    });

    const sampleLeads = [
      {
        title: "ENTERPRISE_REAL_ESTATE_2026",
        category: "Real Estate",
        description: "Verified high-intent luxury property leads for 2026 cycle.",
        businessUrl: "https://prop-flow.io",
        targetLeadUrl: "https://leads.prop-flow.io/webhook",
        basePrice: 120,
        currentBid: 120,
        bidCount: 0,
        qualityScore: 98,
        countryCode: "US",
        region: "Global",
        ownerId: adminId,
        status: 'approved',
        deliveryDate: "WK-01-2026",
        leadCapacity: 5000
      }
    ];

    for (const lead of sampleLeads) {
      await addDoc(collection(db, "leads"), { ...lead, timestamp: serverTimestamp() });
    }

    await setDoc(doc(db, "config", "auth_config"), {
      googleEnabled: true, googleClientId: "", googleClientSecret: "",
      facebookEnabled: false, facebookAppId: "", facebookAppSecret: ""
    });

    const defaultGateways: Partial<GatewayAPI>[] = [
      { id: 'gw_stripe', provider: 'stripe', name: 'STRIPE_MASTER_NODE', publicKey: '', secretKey: '', fee: '2.5', status: 'inactive' },
      { id: 'gw_binance', provider: 'binance', name: 'BINANCE_SMART_NODE', publicKey: '', secretKey: '', fee: '1.0', status: 'inactive' },
      { id: 'gw_upi', provider: 'upi', name: 'UPI_REALTIME_NODE', publicKey: '', secretKey: '', fee: '0.0', status: 'inactive' },
      { id: 'gw_crypto', provider: 'crypto', name: 'DECENTRALIZED_VAULT', publicKey: '', secretKey: '', fee: '0.5', status: 'inactive' }
    ];
    for (const g of defaultGateways) { await setDoc(doc(db, "api_nodes", g.id!), g); }
  }

  async getData(): Promise<any> {
    try {
      const leadsSnap = await getDocs(collection(db, "leads"));
      if (leadsSnap.empty) { await this.seedInitialData(); return this.getData(); }
      const usersSnap = await getDocs(collection(db, "users"));
      const bidsSnap = await getDocs(query(collection(db, "bids"), orderBy("timestamp", "desc")));
      const walletSnap = await getDocs(query(collection(db, "wallet_activities"), orderBy("timestamp", "desc")));
      const notifSnap = await getDocs(query(collection(db, "notifications"), orderBy("timestamp", "desc"), limit(100)));
      const gatewaySnap = await getDocs(collection(db, "api_nodes"));
      const configSnap = await getDoc(doc(db, "config", "auth_config"));

      return {
        metadata: { version: '6.2.0-GATEWAY-SYNCED', last_updated: new Date().toISOString() },
        leads: leadsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        users: usersSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        purchaseRequests: bidsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        walletActivities: walletSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        notifications: notifSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        gateways: gatewaySnap.docs.map(d => ({ id: d.id, ...d.data() })),
        authConfig: configSnap.exists() ? configSnap.data() : { googleEnabled: true }
      };
    } catch (e) {
      console.error("Firestore Sync Failed", e);
      throw e;
    }
  }

  async getUserProfile(uid: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } as User : null;
  }

  async initUserProfile(uid: string, data: Partial<User>): Promise<User> {
    const isMasterAdmin = data.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
    const newUser: User = {
      id: uid,
      name: data.name || '',
      email: data.email || '',
      username: data.username || (data.email?.split('@')[0] || 'user') + Math.floor(Math.random() * 1000),
      balance: 0.0,
      role: isMasterAdmin ? 'admin' : 'user',
      status: 'active',
      stripeConnected: false,
      wishlist: [],
      totalSpend: 0,
      profileImage: data.profileImage || '',
      biometricEnabled: false,
      last_active_at: new Date().toISOString(),
      ...data
    };
    await setDoc(doc(db, "users", uid), newUser);
    return newUser;
  }

  async createLead(leadData: Partial<Lead>): Promise<any> {
    const docRef = await addDoc(collection(db, "leads"), {
      ...leadData,
      bidCount: 0,
      qualityScore: leadData.qualityScore || 90,
      status: 'approved',
      timestamp: serverTimestamp()
    });
    return { id: docRef.id };
  }

  async placeBid(bidData: any): Promise<any> {
    return runTransaction(db, async (transaction) => {
      const userRef = doc(db, "users", bidData.userId);
      const leadRef = doc(db, "leads", bidData.leadId);
      const adminQuery = query(collection(db, "users"), where("email", "==", ADMIN_EMAIL));
      const adminSnaps = await getDocs(adminQuery);
      if (adminSnaps.empty) throw "TREASURY_NODE_OFFLINE";
      const adminRef = doc(db, "users", adminSnaps.docs[0].id);

      const userSnap = await transaction.get(userRef);
      const leadSnap = await transaction.get(leadRef);
      const adminSnap = await transaction.get(adminRef);

      if (!userSnap.exists() || !leadSnap.exists()) throw "DATA_NODE_ERROR";

      const user = userSnap.data() as User;
      const isBidderAdmin = user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      if (user.balance < bidData.totalDailyCost) throw "LOW_FUNDS";

      transaction.update(leadRef, {
        currentBid: bidData.bidAmount,
        bidCount: (leadSnap.data().bidCount || 0) + 1
      });

      transaction.update(userRef, {
        balance: user.balance - bidData.totalDailyCost,
        totalSpend: (user.totalSpend || 0) + bidData.totalDailyCost
      });

      if (!isBidderAdmin) {
        const adminData = adminSnap.data() as User;
        transaction.update(adminRef, {
          balance: adminData.balance + bidData.totalDailyCost
        });
      }

      const bidTxnId = `BID-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      transaction.set(doc(collection(db, "bids")), {
        ...bidData,
        txnId: bidTxnId,
        status: 'approved',
        timestamp: new Date().toISOString()
      });

      transaction.set(doc(collection(db, "wallet_activities")), {
        id: bidTxnId,
        userId: bidData.userId,
        type: 'withdrawal',
        amount: bidData.totalDailyCost,
        provider: `TREASURY_CLEARANCE_${bidData.leadId.slice(-4)}`,
        timestamp: new Date().toISOString(),
        status: 'completed'
      });
    });
  }

  async deposit(userId: string, amount: number, provider?: string): Promise<any> {
    // Rule 3: STRICT KEY VALIDATION
    const gatewaySnap = await getDocs(collection(db, "api_nodes"));
    const activeGateways = gatewaySnap.docs
      .map(d => d.data() as GatewayAPI)
      .filter(g => g.status === 'active' && (g.publicKey?.length || 0) > 5 && (g.secretKey?.length || 0) > 5);

    const targetNode = activeGateways.find(g => g.name === provider);
    if (!targetNode) {
      throw new Error("GATEWAY_NODE_ERROR: Targeted node is offline or lacks administrative authorization (Missing Keys).");
    }

    const userRef = doc(db, "users", userId);
    return runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) return;
      const currentBalance = userSnap.data().balance || 0;
      
      const txnId = `SYNC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      transaction.update(userRef, { balance: currentBalance + amount });
      transaction.set(doc(collection(db, "wallet_activities")), {
        id: txnId,
        userId,
        type: amount > 0 ? 'deposit' : 'withdrawal',
        amount: Math.abs(amount),
        provider: provider || 'VAULT_SYNC',
        timestamp: new Date().toISOString(),
        status: 'completed'
      });

      transaction.set(doc(collection(db, "notifications")), {
        userId,
        message: `VAULT_SYNC_SUCCESS: [${txnId}] Authorized $${amount.toLocaleString()} settlement via ${provider}`,
        type: 'system',
        timestamp: new Date().toISOString(),
        read: false
      });
    });
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<any> { await updateDoc(doc(db, "leads", id), updates); }
  async deleteLead(id: string): Promise<any> { await deleteDoc(doc(db, "leads", id)); }
  async updateUser(id: string, updates: Partial<User>): Promise<any> { await updateDoc(doc(db, "users", id), updates); }
  async updateBidStatus(bidId: string, status: 'approved' | 'rejected'): Promise<void> { await updateDoc(doc(db, "bids", bidId), { status }); }
  async toggleWishlist(userId: string, leadId: string): Promise<any> {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    const wishlist = userSnap.data().wishlist || [];
    const newWishlist = wishlist.includes(leadId) ? wishlist.filter((id: string) => id !== leadId) : [...wishlist, leadId];
    await updateDoc(userRef, { wishlist: newWishlist });
  }
  async clearNotifications() {
    const snap = await getDocs(collection(db, "notifications"));
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  }
  async updateAuthConfig(config: OAuthConfig) { await setDoc(doc(db, "config", "auth_config"), config); }
  async updateGateways(gateways: GatewayAPI[]) {
    const snap = await getDocs(collection(db, "api_nodes"));
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    for (const g of gateways) { await setDoc(doc(db, "api_nodes", g.id), g); }
  }
  async triggerManualSeed() {
    const leadsSnap = await getDocs(collection(db, "leads"));
    if (leadsSnap.empty) { await this.seedInitialData(); }
  }
}

export const apiService = new ApiService();
