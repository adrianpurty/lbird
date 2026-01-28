import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { auth } from "./firebase.ts";
import { apiService } from "./apiService.ts";
import { User } from "../types.ts";

export const authService = {
  /**
   * Authenticate user via Firebase or Sudo Bypass
   */
  async signIn(email: string, token: string): Promise<User> {
    // SUPER ADMIN BYPASS: Username 'admin', Password '1234'
    if (email.toLowerCase() === 'admin' && token === '1234') {
       const profile = await apiService.getUserProfile('admin_1');
       if (profile) {
         localStorage.setItem('leadbid_sudo_session', 'true');
         return profile;
       }
       // If no seed exists yet, we force a sync which triggers the seed
       throw new Error("ADMIN_PROFILE_NOT_SEEDED: Initialize the database by clicking Sign In again.");
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, token);
      const firebaseUser = userCredential.user;
      
      const userProfile = await apiService.getUserProfile(firebaseUser.uid);
      if (!userProfile) throw new Error("USER_PROFILE_NOT_FOUND");
      
      return userProfile;
    } catch (error: any) {
      console.error("Auth Error:", error);
      throw new Error(error.message || "Authentication failed");
    }
  },

  async signUp(email: string, token: string, name?: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, token);
      const firebaseUser = userCredential.user;
      
      const newUser = await apiService.initUserProfile(firebaseUser.uid, {
        email,
        name: name || email.split('@')[0],
        username: email.split('@')[0] + Math.floor(Math.random() * 1000)
      });
      
      return newUser;
    } catch (error: any) {
      throw new Error(error.message || "Signup failed");
    }
  },

  async signInWithSocial(provider: 'google' | 'facebook'): Promise<User> {
    try {
      const authProvider = provider === 'google' ? new GoogleAuthProvider() : new FacebookAuthProvider();
      const result = await signInWithPopup(auth, authProvider);
      const firebaseUser = result.user;

      let profile = await apiService.getUserProfile(firebaseUser.uid);
      if (!profile) {
        profile = await apiService.initUserProfile(firebaseUser.uid, {
          email: firebaseUser.email || '',
          name: firebaseUser.displayName || 'Social User',
          profileImage: firebaseUser.photoURL || '',
          username: (firebaseUser.email?.split('@')[0] || 'user') + Math.floor(Math.random() * 1000)
        });
      }
      return profile;
    } catch (error: any) {
      throw new Error(`SOCIAL_SYNC_FAILED: ${error.message}`);
    }
  },

  async signOut(): Promise<void> {
    localStorage.removeItem('leadbid_sudo_session');
    await signOut(auth);
  },

  onAuthStateChanged(callback: (user: User | null) => void) {
    // Check for Sudo Session first (persists until logout)
    const isSudo = localStorage.getItem('leadbid_sudo_session');
    if (isSudo === 'true') {
        apiService.getUserProfile('admin_1').then(u => callback(u));
        return () => {}; // return dummy unsubscribe
    }

    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profile = await apiService.getUserProfile(firebaseUser.uid);
          callback(profile);
        } catch (e) {
          callback(null);
        }
      } else {
        callback(null);
      }
    });
  }
};