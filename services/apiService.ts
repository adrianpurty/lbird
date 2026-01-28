
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
    const adminId = "admin_1";
    await setDoc(doc(db, "users", adminId), {
      id: adminId,
      name: "ROOT_ADMIN",
      email: "admin@leadbid.pro",
      balance: 1000000.0,
      role: 'admin',
      status: 'active',
      stripeConnected: true,
      wishlist: [],
      totalSpend: 0,
      biometricEnabled: false
    });

    const sampleLeads = [
      {
        title: "HIGH_INTENT_SOLAR_TX",
        category: "Real Estate",
        description: "Verified solar installation prospects from high-conversion landing pages in TZ region.",
        businessUrl: "https://solar-hub.io",
        targetLeadUrl: "https://leads.solar-hub.io/endpoint",
        basePrice: 75,
        currentBid: 82,
        bidCount: 12,
        qualityScore: 94,
        countryCode: "TZ",
        ownerId: adminId,
        status: 'approved',
        timeLeft: '24h 0m',
        sellerRating: 5.0,
        deliveryDate: new Date().toISOString().split('T')[0],
        leadCapacity: 500
      },
      {
        title: "CRYPTO_WHALE_ALERTS",
        category: "Finance",
        description: "High-net-worth individuals interested in institutional-grade crypto arbitrage tools.",
        businessUrl: "https://alpha-capital.com",
        targetLeadUrl: "https://alpha-capital.com/leads/ingest",
        basePrice: 150,
        currentBid: 210,
        bidCount: 45,
        qualityScore: 88,
        countryCode: "AE",
        ownerId: adminId,
        status: 'approved',
        timeLeft: '24h 0m',
        sellerRating: 5.0,
        deliveryDate: new Date().toISOString().split('T')[0],
        leadCapacity: 1200
      }
    ];

    for (const lead of sampleLeads) {
      await addDoc(collection(db, "leads"), {
        ...lead,
        timestamp: serverTimestamp()
      });
    }

    await setDoc(doc(db, "config", "auth_config"), {
      googleEnabled: true,
      googleClientId: "",
      googleClientSecret: "",
      facebookEnabled: false,
      facebookAppId: "",
      facebookAppSecret: ""
    });

    const defaultGateways: Partial<GatewayAPI>[] = [
      { id: 'gw_stripe', provider: 'stripe', name: 'STRIPE_MASTER_NODE', publicKey: '', secretKey: '', fee: '2.5', status: 'active' },
      { id: 'gw_binance', provider: 'binance', name: 'BINANCE_SMART_NODE', publicKey: '', secretKey: '', fee: '1.0', status: 'active' },
      { id: 'gw_upi', provider: 'upi', name: 'UPI_REALTIME_NODE', publicKey: '', secretKey: '', fee: '0.0', status: 'active' },
      { id: 'gw_crypto', provider: 'crypto', name: 'DECENTRALIZED_VAULT', publicKey: '', secretKey: '', fee: '0.5', status: 'active' }
    ];

    for (const g of defaultGateways) {
      await setDoc(doc(db, "api_nodes", g.id!), g);
    }
  }

  async getData(): Promise<any> {
    try {
      const leadsSnap = await getDocs(collection(db, "leads"));
      if (leadsSnap.empty) {
        await this.seedInitialData();
        return this.getData();
      }
      const usersSnap = await getDocs(collection(db, "users"));
      const bidsSnap = await getDocs(query(collection(db, "bids"), orderBy("timestamp", "desc")));
      const walletSnap = await getDocs(query(collection(db, "wallet_activities"), orderBy("timestamp", "desc")));
      const notifSnap = await getDocs(query(collection(db, "notifications"), orderBy("timestamp", "desc"), limit(100)));
      const gatewaySnap = await getDocs(collection(db, "api_nodes"));
      const configSnap = await getDoc(doc(db, "config", "auth_config"));
      const invoicesSnap = await getDocs(collection(db, "invoices"));

      return {
        metadata: { version: '5.4.0-LOGISTICS', last_updated: new Date().toISOString() },
        leads: leadsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        users: usersSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        purchaseRequests: bidsSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        walletActivities: walletSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        notifications: notifSnap.docs.map(d => ({ id: d.id, ...d.data() })),
        gateways: gatewaySnap.docs.map(d => ({ id: d.id, ...d.data() })),
        authConfig: configSnap.exists() ? configSnap.data() : { googleEnabled: true },
        invoices: invoicesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      };
    } catch (e) {
      console.error("Firestore Sync Failed", e);
      throw e;
    }
  }

  async getUserProfile(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } as User : null;
    } catch (e) {
      return null;
    }
  }

  async initUserProfile(uid: string, data: Partial<User>): Promise<User> {
    const newUser: User = {
      id: uid,
      name: data.name || '',
      email: data.email || '',
      balance: 1000.0,
      role: (data.email?.toLowerCase().includes('admin') || uid === 'admin_1') ? 'admin' : 'user',
      status: 'active',
      stripeConnected: false,
      wishlist: [],
      profileImage: data.profileImage || '',
      biometricEnabled: false,
      ...data
    };
    await setDoc(doc(db, "users", uid), newUser);
    return newUser;
  }

  async createLead(leadData: Partial<Lead>): Promise<any> {
    const docRef = await addDoc(collection(db, "leads"), {
      ...leadData,
      bidCount: 0,
      currentBid: leadData.basePrice || 50,
      status: 'approved',
      timeLeft: '24h 0m',
      sellerRating: 5.0,
      timestamp: serverTimestamp()
    });
    return { id: docRef.id };
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<any> {
    await updateDoc(doc(db, "leads", id), updates);
  }

  async deleteLead(id: string): Promise<any> {
    await deleteDoc(doc(db, "leads", id));
  }

  async updateUser(id: string, updates: Partial<User>): Promise<any> {
    await updateDoc(doc(db, "users", id), updates);
    if (updates.biometricEnabled) {
      localStorage.setItem('leadbid_biometric_uid', id);
    }
  }

  async placeBid(bidData: any): Promise<any> {
    return runTransaction(db, async (transaction) => {
      const userRef = doc(db, "users", bidData.userId);
      const leadRef = doc(db, "leads", bidData.leadId);
      const adminRef = doc(db, "users", "admin_1");
      
      const userSnap = await transaction.get(userRef);
      const leadSnap = await transaction.get(leadRef);
      const adminSnap = await transaction.get(adminRef);

      if (!userSnap.exists() || !leadSnap.exists()) throw "DOC_ERR";

      const user = userSnap.data() as User;
      const lead = leadSnap.data() as Lead;
      if (user.balance < bidData.totalDailyCost) throw "LOW_FUNDS";

      transaction.update(leadRef, {
        currentBid: bidData.bidAmount,
        bidCount: (leadSnap.data().bidCount || 0) + 1
      });

      transaction.update(userRef, {
        balance: user.balance - bidData.totalDailyCost,
        totalSpend: (user.totalSpend || 0) + bidData.totalDailyCost
      });

      if (adminSnap.exists()) {
        const adminData = adminSnap.data() as User;
        transaction.update(adminRef, {
          balance: adminData.balance + bidData.totalDailyCost
        });
      }

      transaction.set(doc(collection(db, "bids")), {
        ...bidData,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });

      transaction.set(doc(collection(db, "wallet_activities")), {
        userId: bidData.userId,
        type: 'withdrawal',
        amount: bidData.totalDailyCost,
        provider: 'MARKET_ACQUISITION_STAKE',
        timestamp: new Date().toISOString(),
        status: 'completed'
      });

      transaction.set(doc(collection(db, "wallet_activities")), {
        userId: 'admin_1',
        type: 'deposit',
        amount: bidData.totalDailyCost,
        provider: `ORDER_REVENUE_${bidData.userId}`,
        timestamp: new Date().toISOString(),
        status: 'completed'
      });
    });
  }

  async updateBidStatus(bidId: string, status: 'approved' | 'rejected'): Promise<void> {
    await updateDoc(doc(db, "bids", bidId), { status });
  }

  async deposit(userId: string, amount: number, provider?: string): Promise<any> {
    const userRef = doc(db, "users", userId);
    const adminRef = doc(db, "users", "admin_1");

    return runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      const adminSnap = await transaction.get(adminRef);

      if (!userSnap.exists()) return;

      const currentBalance = userSnap.data().balance || 0;
      transaction.update(userRef, {
        balance: currentBalance + amount
      });

      if (amount < 0 && adminSnap.exists()) {
        const adminBalance = adminSnap.data().balance || 0;
        transaction.update(adminRef, {
          balance: adminBalance + Math.abs(amount)
        });

        transaction.set(doc(collection(db, "wallet_activities")), {
          userId: 'admin_1',
          type: 'deposit',
          amount: Math.abs(amount),
          provider: `PLATFORM_YIELD_${userId}`,
          timestamp: new Date().toISOString(),
          status: 'completed'
        });
      }

      transaction.set(doc(collection(db, "wallet_activities")), {
        userId,
        type: amount > 0 ? 'deposit' : 'withdrawal',
        amount: Math.abs(amount),
        provider: provider || 'VAULT_INTERNAL_SYNC',
        timestamp: new Date().toISOString(),
        status: 'completed',
        gateway_protocol: 'OIDC_SIGNED'
      });
    });
  }

  async toggleWishlist(userId: string, leadId: string): Promise<any> {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;
    const currentWishlist = userSnap.data().wishlist || [];
    const newWishlist = currentWishlist.includes(leadId)
      ? currentWishlist.filter((id: string) => id !== leadId)
      : [...currentWishlist, leadId];
    await updateDoc(userRef, { wishlist: newWishlist });
  }

  async getCategories() { return NICHE_PROTOCOLS; }

  async logNotification(userId: string, message: string, type: 'buy' | 'sell' | 'system' | 'approval') {
    await addDoc(collection(db, "notifications"), {
      userId, message, type, timestamp: new Date().toISOString(), read: false
    });
  }

  async clearNotifications() {
    const snap = await getDocs(collection(db, "notifications"));
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
  }

  async updateAuthConfig(config: OAuthConfig) {
    await setDoc(doc(db, "config", "auth_config"), config);
  }

  async updateGateways(gateways: GatewayAPI[]) {
    const snap = await getDocs(collection(db, "api_nodes"));
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    for (const g of gateways) {
       await setDoc(doc(db, "api_nodes", g.id), g);
    }
  }

  async triggerManualSeed() {
    const leadsSnap = await getDocs(collection(db, "leads"));
    if (leadsSnap.empty) {
      await this.seedInitialData();
    }
  }
}

export const apiService = new ApiService();
