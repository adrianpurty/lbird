import { Lead, User, PurchaseRequest, Notification, PlatformAnalytics, OAuthConfig, Invoice } from '../types.ts';

// Explicit relative path to the PHP AI Data Node
const API_ENDPOINT = './api.php';

// Added NICHE_PROTOCOLS to resolve import error in ProfileSettings.tsx
export const NICHE_PROTOCOLS = {
  "Finance": ["Crypto Trading", "High-Ticket Insurance", "Mortgage Leads", "Debt Settlement"],
  "Travel": ["Luxury Cruises", "International Flights", "Resort Bookings"],
  "Real Estate": ["Commercial Property", "Residential Leads", "Solar Energy"],
  "Health": ["Medical Aesthetics", "Dental Care", "Health Insurance"],
  "Legal": ["Personal Injury", "Corporate Law", "Immigration Leads"]
};

class ApiService {
  private async request(action: string, method: 'GET' | 'POST' = 'GET', body?: any) {
    const url = `${API_ENDPOINT}?action=${action}`;
    const options: RequestInit = {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    };
    
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        console.error(`API Node Failure [${action}]: Status ${response.status}`);
        throw new Error(`Node Error: ${response.status}`);
      }
      return response.json();
    } catch (err) {
      console.error(`Request Exception [${action}]:`, err);
      throw err;
    }
  }

  async getData() {
    return this.request('get_data');
  }

  // Added getCategories method to resolve property missing error in LeadSubmissionForm.tsx
  async getCategories() {
    try {
      return await this.request('get_categories');
    } catch (error) {
      // Graceful fallback to local protocols if the network node is unavailable
      return NICHE_PROTOCOLS;
    }
  }

  async registerUser(userData: Partial<User>) {
    const response = await this.request('register_user', 'POST', userData);
    if (response.status === 'error') throw new Error(response.message);
    return response.user;
  }

  async authenticateUser(username: string, token: string) {
    // Admin Hard-bypass (Optional, recommended to use DB eventually)
    if (username === 'admin' && token === '1234') {
      return {
        id: 'admin_1',
        name: 'System Administrator',
        username: 'admin',
        email: 'admin@leadbid.pro',
        balance: 1000000,
        stripeConnected: true,
        role: 'admin' as const,
        wishlist: []
      };
    }

    try {
      const response = await this.request('authenticate_user', 'POST', { username, token });
      return response.user || null;
    } catch (error) {
      throw error;
    }
  }

  async updateAuthConfig(config: OAuthConfig) {
    return this.request('update_auth_config', 'POST', config);
  }

  async updateGateways(gateways: any[]) {
    return this.request('update_gateways', 'POST', { gateways });
  }

  async updateUser(id: string, updates: Partial<User>) {
    return this.request('update_user', 'POST', { id, ...updates });
  }

  async placeBid(input: any) {
    const response = await this.request('place_bid', 'POST', input);
    if (response.status === 'error') throw new Error(response.message);
    return response;
  }

  async createLead(leadData: any) {
    const response = await this.request('create_lead', 'POST', leadData);
    if (response.status === 'error') throw new Error(response.message);
    return response;
  }

  async updateLead(id: string, updates: any) {
    return this.request('update_lead', 'POST', { id, ...updates });
  }

  async deleteLead(id: string) {
    return this.request('delete_lead', 'POST', { id });
  }

  async deposit(userId: string, amount: number) {
    return this.request('deposit', 'POST', { userId, amount });
  }

  async toggleWishlist(userId: string, leadId: string) {
    return this.request('toggle_wishlist', 'POST', { userId, leadId });
  }

  async clearNotifications() {
    return this.request('clear_notifications', 'POST');
  }
}

export const apiService = new ApiService();