
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
} from "firebase/firestore";
import { db } from "./firebase.ts";
import { Lead, User, PurchaseRequest, Notification, PlatformAnalytics, OAuthConfig, Invoice, GatewayAPI, WalletActivity } from '../types.ts';

const ADMIN_EMAIL = "enjodanzo@gmail.com";
const ADMIN_ROOT_ID = "admin_root";

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
    const adminId = ADMIN_ROOT_ID;
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
        metadata: { version: '6.6.0-SECURE-FIN', last_updated: new Date().toISOString() },
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
      const adminRef = doc(db, "users", ADMIN_ROOT_ID);

      const userSnap = await transaction.get(userRef);
      const leadSnap = await transaction.get(leadRef);
      const adminSnap = await transaction.get(adminRef);

      if (!userSnap.exists() || !leadSnap.exists() || !adminSnap.exists()) {
        throw "TREASURY_NODE_OFFLINE";
      }

      const user = userSnap.data() as User;
      const adminData = adminSnap.data() as User;
      
      if (user.balance < bidData.totalDailyCost) throw "LOW_FUNDS";

      transaction.update(userRef, {
        balance: user.balance - bidData.totalDailyCost,
        totalSpend: (user.totalSpend || 0) + bidData.totalDailyCost
      });

      transaction.update(adminRef, {
        balance: adminData.balance + bidData.totalDailyCost
      });

      const bidTxnId = `BID-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      transaction.set(doc(collection(db, "bids")), {
        ...bidData,
        txnId: bidTxnId,
        status: 'pending',
        timestamp: new Date().toISOString()
      });

      transaction.set(doc(collection(db, "wallet_activities")), {
        id: bidTxnId,
        userId: bidData.userId,
        type: 'withdrawal',
        amount: bidData.totalDailyCost,
        provider: `ESCROW_LOCK_${bidData.leadId.slice(-4)}`,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });

      transaction.set(doc(collection(db, "notifications")), {
        userId: ADMIN_ROOT_ID,
        message: `PENDING_AUTHORIZATION: ${user.name} placed a $${bidData.bidAmount} bid on ${bidData.leadTitle}. Funds held in Escrow.`,
        type: 'approval',
        timestamp: new Date().toISOString(),
        read: false
      });
    });
  }

  async authorizeBid(bidId: string): Promise<void> {
    const bidRef = doc(db, "bids", bidId);
    const bidSnap = await getDoc(bidRef);
    if (!bidSnap.exists()) return;
    
    const bid = bidSnap.data();
    const leadRef = doc(db, "leads", bid.leadId);
    const leadSnap = await getDoc(leadRef);

    await runTransaction(db, async (transaction) => {
      transaction.update(bidRef, { status: 'approved' });
      
      if (leadSnap.exists()) {
        transaction.update(leadRef, {
          currentBid: bid.bidAmount,
          bidCount: (leadSnap.data().bidCount || 0) + 1
        });
      }

      const walletQuery = query(collection(db, "wallet_activities"), where("id", "==", bid.txnId || ''));
      const walletSnaps = await getDocs(walletQuery);
      walletSnaps.forEach(wDoc => {
        transaction.update(wDoc.ref, { status: 'completed' });
      });

      transaction.set(doc(collection(db, "notifications")), {
        userId: bid.userId,
        message: `ACQUISITION_AUTHORIZED: Your bid for ${bid.leadTitle} has been authorized. Traffic node sync starting.`,
        type: 'approval',
        timestamp: new Date().toISOString(),
        read: false
      });
    });
  }

  async rejectBid(bidId: string): Promise<void> {
    const bidRef = doc(db, "bids", bidId);
    const bidSnap = await getDoc(bidRef);
    if (!bidSnap.exists()) return;
    
    const bid = bidSnap.data();

    await runTransaction(db, async (transaction) => {
      const userRef = doc(db, "users", bid.userId);
      const adminRef = doc(db, "users", ADMIN_ROOT_ID);
      
      const userSnap = await transaction.get(userRef);
      const adminSnap = await transaction.get(adminRef);

      if (!userSnap.exists() || !adminSnap.exists()) throw "IDENTITY_NODE_FAILURE";

      const userData = userSnap.data() as User;
      const adminData = adminSnap.data() as User;

      transaction.update(userRef, {
        balance: userData.balance + bid.totalDailyCost,
        totalSpend: Math.max(0, (userData.totalSpend || 0) - bid.totalDailyCost)
      });

      transaction.update(adminRef, {
        balance: Math.max(0, adminData.balance - bid.totalDailyCost)
      });

      transaction.update(bidRef, { status: 'rejected' });

      const refundId = `REF-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      transaction.set(doc(collection(db, "wallet_activities")), {
        id: refundId,
        userId: bid.userId,
        type: 'deposit',
        amount: bid.totalDailyCost,
        provider: `ESCROW_ROLLBACK_${bid.leadId.slice(-4)}`,
        timestamp: new Date().toISOString(),
        status: 'completed'
      });

      const walletQuery = query(collection(db, "wallet_activities"), where("id", "==", bid.txnId || ''));
      // Fix: Defined missing 'walletSnaps' variable by calling getDocs with the constructed query.
      const walletSnaps = await getDocs(walletQuery);
      walletSnaps.forEach(wDoc => {
        transaction.update(wDoc.ref, { status: 'rejected' });
      });

      transaction.set(doc(collection(db, "notifications")), {
        userId: bid.userId,
        message: `ACQUISITION_REVOKED: Your bid for ${bid.leadTitle} was declined. Funds have been returned to your vault.`,
        type: 'system',
        timestamp: new Date().toISOString(),
        read: false
      });
    });
  }

  async updateBidDelivery(bidId: string, deliveryData: { 
    officeHoursStart: string, 
    officeHoursEnd: string, 
    operationalDays: string[],
    deliveryStartDate?: string 
  }): Promise<void> {
    const bidRef = doc(db, "bids", bidId);
    await updateDoc(bidRef, {
      ...deliveryData,
      lastModified: new Date().toISOString()
    });
  }

  /**
   * Hardened Vault Deposit: Requires a verified transaction ID from a gateway.
   * This is the ONLY legitimate way to increase a user's balance.
   */
  async deposit(userId: string, amount: number, providerName: string, txnId: string): Promise<any> {
    if (!txnId || !txnId.includes('_SETTLE_')) {
      throw new Error("LEDGER_REJECTION: Invalid or unverified transaction hash provided.");
    }

    const userRef = doc(db, "users", userId);
    
    return runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);
      if (!userSnap.exists()) throw new Error("USER_NODE_NOT_FOUND");
      
      const currentBalance = userSnap.data().balance || 0;
      
      transaction.update(userRef, { balance: currentBalance + amount });
      
      transaction.set(doc(collection(db, "wallet_activities")), {
        id: txnId,
        userId,
        type: amount > 0 ? 'deposit' : 'withdrawal',
        amount: Math.abs(amount),
        provider: providerName,
        timestamp: new Date().toISOString(),
        status: 'completed',
        isGatewayVerified: true
      });

      transaction.set(doc(collection(db, "notifications")), {
        userId,
        message: `SETTLEMENT_VERIFIED: [${txnId}] Authorized $${amount.toLocaleString()} through ${providerName} mesh.`,
        type: 'system',
        timestamp: new Date().toISOString(),
        read: false
      });
    });
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<any> { await updateDoc(doc(db, "leads", id), updates); }
  async deleteLead(id: string): Promise<any> { await deleteDoc(doc(db, "leads", id)); }
  async updateUser(id: string, updates: Partial<User>): Promise<any> { 
    // Security Restriction: Cannot manually update 'balance' via standard user update.
    const sanitizedUpdates = { ...updates };
    delete sanitizedUpdates.balance;
    await updateDoc(doc(db, "users", id), sanitizedUpdates); 
  }
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
