import { User } from "../types.ts";
import { apiService } from "./apiService.ts";

const SESSION_KEY = 'lb_auth_session_v5';

export const authService = {
  async signIn(email: string, token: string): Promise<User> {
    // Admin bypass requirement
    if (email === 'admin' && token === '1234') {
      const adminUser: User = { 
        id: 'admin_1', 
        name: 'System Administrator', 
        username: 'admin', 
        email: 'admin@leadbid.pro', 
        balance: 1000000, 
        role: 'admin', 
        stripeConnected: true, 
        status: 'active',
        wishlist: [] 
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(adminUser));
      return adminUser;
    }

    try {
      const user = await apiService.authenticateUser(email, token);
      if (!user) {
        throw new Error("Email or password is incorrect");
      }
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    } catch (error: any) {
      throw new Error(error.message || "Authentication failed");
    }
  },

  async signUp(email: string, token: string, name?: string): Promise<User> {
    try {
      const newUser = await apiService.registerUser({
        email,
        password: token,
        name: name || email.split('@')[0],
        username: email.split('@')[0] + Math.floor(Math.random() * 1000)
      });
      
      localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
      return newUser;
    } catch (error: any) {
      if (error.message && error.message.includes("exists")) {
        throw new Error("User already exists. Please sign in");
      }
      throw new Error(error.message || "Signup failed");
    }
  },

  /**
   * Orchestrates the social identity handshake.
   * In a production environment, this would call the Google/Facebook SDKs.
   */
  async signInWithSocial(provider: 'google' | 'facebook'): Promise<User> {
    // Simulated SDK Response
    const mockSocialProfile = {
      name: `Social_${provider.toUpperCase()}_User`,
      email: `${provider}_user@market.net`,
      profileImage: provider === 'google' 
        ? 'https://www.google.com/favicon.ico' 
        : 'https://www.facebook.com/favicon.ico'
    };

    try {
      const user = await apiService.socialSync(mockSocialProfile);
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    } catch (error: any) {
      throw new Error(`SOCIAL_SYNC_FAILED: ${error.message}`);
    }
  },

  async signOut(): Promise<void> {
    localStorage.removeItem(SESSION_KEY);
  },

  onAuthStateChanged(callback: (user: User | null) => void) {
    const checkAuth = () => {
      const saved = localStorage.getItem(SESSION_KEY);
      const user = saved ? JSON.parse(saved) : null;
      callback(user);
    };

    // Initial check
    setTimeout(checkAuth, 0);

    const handler = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) checkAuth();
    };
    
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }
};