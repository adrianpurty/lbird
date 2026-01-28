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
  "Finance": ["Crypto Trading", "High-Ticket Insurance", "Mortgage Leads", "Debt Settlement"],
  "Travel": ["Luxury Cruises", "International Flights", "Resort Bookings"],
  "Real Estate": ["Commercial Property", "Residential Leads", "Solar Energy"],
  "Health": ["Medical Aesthetics", "Dental Care", "Health Insurance"],
  "Legal": ["Personal Injury", "Corporate Law", "Immigration Leads"]
};

class ApiService {
  /**
   * Fetches the entire platform state from Firestore.
   * Self-seeds on first empty detection.
   */
  async getData(): Promise<any> {
    try {
      const leadsSnap = await getDocs(collection(db, "leads"));
      
      if (leadsSnap.empty) {
        console.log("GENESIS_NODE_DETECTION: Provisioning Database...");
        await this.seedInitialData();
        return this.getData();
      }

      const usersSnap = await getDocs(collection(db, "users"));
      const bidsSnap = await getDocs(query(collection(db, "bids"), orderBy("timestamp", "desc")));
      const walletSnap = await getDocs(query(collection(db, "wallet_activities"), orderBy("timestamp", "desc")));
      const notifSnap = await getDocs(query(collection(db, "notifications"), orderBy("timestamp", "desc"), limit(100)));
      const gatewaySnap = await getDocs(collection(db, "api_nodes"));
      const configSnap = await getDoc(doc(db, "config", "auth_config"));

      return {
        metadata: { version: '5.3.0-STABLE', last_updated: new Date().toISOString() },
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
      username: data.username || '',
      balance: 1000.0,
      role: (data.email?.toLowerCase().includes('admin') || uid === 'admin_1') ? 'admin' : 'user',
      status: 'active',
      stripeConnected: false,
      wishlist: [],
      profileImage: data.profileImage || '',
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
  }

  async placeBid(bidData: any): Promise<any> {
    return runTransaction(db, async (transaction) => {
      const userRef = doc(db, "users", bidData.userId);
      const leadRef = doc(db, "leads", bidData.leadId);
      const userSnap = await transaction.get(userRef);
      const leadSnap = await transaction.get(leadRef);

      if (!userSnap.exists() || !leadSnap.exists()) throw "DOC_ERR";

      const user = userSnap.data() as User;
      if (user.balance < bidData.totalDailyCost) throw "LOW_FUNDS";

      transaction.update(leadRef, {
        currentBid: bidData.bidAmount,
        bidCount: (leadSnap.data().bidCount || 0) + 1
      });

      transaction.update(userRef, {
        balance: user.balance - bidData.totalDailyCost,
        totalSpend: (user.totalSpend || 0) + bidData.totalDailyCost
      });

      transaction.set(doc(collection(db, "bids")), {
        ...bidData,
        timestamp: new Date().toISOString(),
        status: 'approved'
      });

      transaction.set(doc(collection(db, "wallet_activities")), {
        userId: bidData.userId,
        type: 'withdrawal',
        amount: bidData.totalDailyCost,
        provider: 'MARKET_ACQUISITION',
        timestamp: new Date().toISOString(),
        status: 'completed'
      });
    });
  }

  async deposit(userId: string, amount: number, provider?: string): Promise<any> {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    await updateDoc(userRef, {
      balance: (userSnap.data().balance || 0) + amount
    });

    await addDoc(collection(db, "wallet_activities"), {
      userId,
      type: amount > 0 ? 'deposit' : 'withdrawal',
      amount: Math.abs(amount),
      provider: provider || 'MANUAL_OVERRIDE',
      timestamp: new Date().toISOString(),
      status: 'completed'
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
    await Promise.all(gateways.map(g => addDoc(collection(db, "api_nodes"), g)));
  }

  /**
   * Provison initial system state if blank.
   */
  private async seedInitialData() {
    // 1. Seed Super Admin Profile (For admin/1234 bypass)
    await setDoc(doc(db, "users", "admin_1"), {
      id: "admin_1",
      name: "Root Administrator",
      email: "admin@leadbid.pro",
      username: "admin",
      balance: 1000000.0,
      role: "admin",
      status: "active",
      stripeConnected: true,
      wishlist: []
    });

    // 2. Seed High-Value Market Leads
    const initialLeads = [
      { 
        title: 'Executive Solar Inbound (California)', 
        category: 'Solar Energy', 
        description: 'Verified homeowners with 750+ credit score requesting quotes for residential solar installations.', 
        businessUrl: 'https://solar-dynamics.io', 
        targetLeadUrl: 'https://webhook.site/solar-test', 
        basePrice: 85, 
        currentBid: 120, 
        bidCount: 4, 
        timeLeft: '24h 0m', 
        qualityScore: 94, 
        sellerRating: 5.0, 
        status: 'approved', 
        countryCode: 'US', 
        region: 'California', 
        ownerId: 'admin_1' 
      },
      { 
        title: 'Crypto Whale Inbound (UAE)', 
        category: 'Crypto Trading', 
        description: 'High-net-worth individuals in Dubai seeking private OTC desk referrals for 50+ BTC transactions.', 
        businessUrl: 'https://dubai-exchange.io', 
        targetLeadUrl: 'https://webhook.site/crypto-test', 
        basePrice: 500, 
        currentBid: 1250, 
        bidCount: 18, 
        timeLeft: '12h 30m', 
        qualityScore: 98, 
        sellerRating: 4.9, 
        status: 'approved', 
        countryCode: 'AE', 
        region: 'Dubai', 
        ownerId: 'admin_1' 
      },
      { 
        title: 'Personal Injury: Motor Vehicle (Florida)', 
        category: 'Personal Injury', 
        description: 'Live transfer calls from accident victims seeking legal representation. Screened for no-fault and policy limits.', 
        businessUrl: 'https://fl-justice.law', 
        targetLeadUrl: 'https://webhook.site/legal-test', 
        basePrice: 250, 
        currentBid: 420, 
        bidCount: 7, 
        timeLeft: '08h 45m', 
        qualityScore: 92, 
        sellerRating: 4.8, 
        status: 'approved', 
        countryCode: 'US', 
        region: 'Florida', 
        ownerId: 'admin_1' 
      }
    ];

    for (const lead of initialLeads) {
      await addDoc(collection(db, "leads"), lead);
    }

    // 3. System Config
    await setDoc(doc(db, "config", "auth_config"), { 
      googleEnabled: true, googleClientId: '', googleClientSecret: '', 
      facebookEnabled: false, facebookAppId: '', facebookAppSecret: '' 
    });

    // 4. Default Gateway
    await addDoc(collection(db, "api_nodes"), { 
      id: 'gw_stripe_primary', provider: 'stripe', name: 'Global Settlement Node', 
      publicKey: 'pk_test_sample', secretKey: 'sk_test_sample', fee: '2.5', status: 'active' 
    });

    // 5. Initial Notification
    await addDoc(collection(db, "notifications"), {
      userId: 'admin_1',
      message: 'SYSTEM_GENESIS: Network nodes activated and global ledger initialized.',
      type: 'system',
      timestamp: new Date().toISOString(),
      read: false
    });
  }
}

export const apiService = new ApiService();