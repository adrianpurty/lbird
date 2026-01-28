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
   */
  async getData(): Promise<any> {
    try {
      const leadsSnap = await getDocs(collection(db, "leads"));
      
      // Seed data if empty
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

      return {
        metadata: { version: '5.1.0-STABLE', last_updated: new Date().toISOString() },
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
    const newUser: User = {
      id: uid,
      name: data.name || '',
      email: data.email || '',
      username: data.username || '',
      balance: 1000.0,
      role: (data.email === 'admin@leadbid.pro' || data.email === 'admin') ? 'admin' : 'user',
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

    await this.logNotification(leadData.ownerId || 'system', 
      `ASSET_PROVISION: New node [${leadData.title}] deployed.`, 'sell');

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

      if (!userSnap.exists() || !leadSnap.exists()) throw "DOCUMENT_MISSING";

      const user = userSnap.data() as User;
      if (user.balance < bidData.totalDailyCost) throw "INSUFFICIENT_FUNDS";

      // Update lead
      transaction.update(leadRef, {
        currentBid: bidData.bidAmount,
        bidCount: (leadSnap.data().bidCount || 0) + 1
      });

      // Update user
      transaction.update(userRef, {
        balance: user.balance - bidData.totalDailyCost,
        totalSpend: (user.totalSpend || 0) + bidData.totalDailyCost
      });

      // Create bid doc
      const bidRef = doc(collection(db, "bids"));
      transaction.set(bidRef, {
        ...bidData,
        timestamp: new Date().toISOString(),
        status: 'approved'
      });

      // Create wallet activity
      const walletRef = doc(collection(db, "wallet_activities"));
      transaction.set(walletRef, {
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

  async getCategories() {
    return NICHE_PROTOCOLS;
  }

  async logNotification(userId: string, message: string, type: 'buy' | 'sell' | 'system' | 'approval') {
    await addDoc(collection(db, "notifications"), {
      userId,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    });
  }

  async clearNotifications() {
    const snap = await getDocs(collection(db, "notifications"));
    const deletePromises = snap.docs.map(d => deleteDoc(d.ref));
    await Promise.all(deletePromises);
  }

  async updateAuthConfig(config: OAuthConfig) {
    await setDoc(doc(db, "config", "auth_config"), config);
  }

  async updateGateways(gateways: GatewayAPI[]) {
    const snap = await getDocs(collection(db, "api_nodes"));
    await Promise.all(snap.docs.map(d => deleteDoc(d.ref)));
    await Promise.all(gateways.map(g => addDoc(collection(db, "api_nodes"), g)));
  }

  private async seedInitialData() {
    const initialLeads = [
      { title: 'First Class: NYC to London', category: 'International Flights', description: 'Executive travelers looking for last-minute first class bookings between JFK and LHR.', businessUrl: 'https://sky-luxury.com', targetLeadUrl: 'https://travel-ads.net/f-class', basePrice: 150, currentBid: 450, bidCount: 15, timeLeft: '10h 30m', qualityScore: 95, sellerRating: 4.9, status: 'approved', countryCode: 'US', region: 'New York', ownerId: 'admin_1' },
      { title: 'Private Overwater Villa (Maldives)', category: 'Resort Bookings', description: 'Honeymooners and luxury seekers looking for 7-night stays at premium Maldivian resorts.', businessUrl: 'https://maldives-escapes.io', targetLeadUrl: 'https://resort-leads.pro/villa', basePrice: 80, currentBid: 210, bidCount: 8, timeLeft: '14h 15m', qualityScore: 91, sellerRating: 4.7, status: 'approved', countryCode: 'MV', region: 'Male', ownerId: 'admin_1' },
      { title: 'Luxury Safari: Serengeti Plain', category: 'Resort Bookings', description: 'High-intent travelers requesting private guided safari experiences in Tanzania.', businessUrl: 'https://wild-safari.com', targetLeadUrl: 'https://travel-pro.net/safari', basePrice: 120, currentBid: 310, bidCount: 5, timeLeft: '18h 45m', qualityScore: 89, sellerRating: 4.8, status: 'approved', countryCode: 'TZ', region: 'Arusha', ownerId: 'admin_1' },
      { title: 'Mediterranean Yacht Charter', category: 'Luxury Cruises', description: 'Inbound requests for 100ft+ yacht charters across the French Riviera and Amalfi Coast.', businessUrl: 'https://yacht-masters.io', targetLeadUrl: 'https://luxury-leads.pro/yachts', basePrice: 200, currentBid: 550, bidCount: 22, timeLeft: '08h 12m', qualityScore: 97, sellerRating: 5.0, status: 'approved', countryCode: 'FR', region: 'Cannes', ownerId: 'admin_1' }
    ];

    for (const l of initialLeads) {
      await addDoc(collection(db, "leads"), l);
    }

    await setDoc(doc(db, "config", "auth_config"), { 
      googleEnabled: true, googleClientId: '', googleClientSecret: '', 
      facebookEnabled: false, facebookAppId: '', facebookAppSecret: '' 
    });

    await addDoc(collection(db, "api_nodes"), { 
      id: 'gw_stripe_primary', provider: 'stripe', name: 'Stripe Master Node', 
      publicKey: 'pk_test_sample', secretKey: 'sk_test_sample', fee: '2.5', status: 'active' 
    });
    
    // Seed at least one notification
    await addDoc(collection(db, "notifications"), {
      userId: 'system',
      message: 'SYSTEM_GENESIS: Global liquidity pool initialized successfully.',
      type: 'system',
      timestamp: new Date().toISOString(),
      read: false
    });
  }
}

export const apiService = new ApiService();