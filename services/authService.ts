import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import { auth } from "./firebase.ts";
import { User } from "../types.ts";

export const authService = {
  async signIn(email: string, token: string): Promise<User> {
    try {
      const result = await signInWithEmailAndPassword(auth, email, token);
      return this.mapFirebaseUserToAppUser(result.user);
    } catch (error: any) {
      throw new Error("Email or password is incorrect");
    }
  },

  async signUp(email: string, token: string, name?: string): Promise<User> {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, token);
      return this.mapFirebaseUserToAppUser(result.user, name);
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error("User already exists. Please sign in");
      }
      throw new Error(error.message || "Signup failed");
    }
  },

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  },

  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback(this.mapFirebaseUserToAppUser(firebaseUser));
      } else {
        callback(null);
      }
    });
  },

  mapFirebaseUserToAppUser(firebaseUser: FirebaseUser, name?: string): User {
    // Note: Per requirements, we are NOT saving user profile data yet.
    // We return a mock application User object based on the Firebase account.
    return {
      id: firebaseUser.uid,
      name: name || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || "Trader",
      email: firebaseUser.email || "",
      balance: 1000, // Default mock balance
      stripeConnected: false,
      role: firebaseUser.email === 'admin@leadbid.pro' ? 'admin' : 'user',
      status: 'active'
    };
  }
};