
export interface Lead {
  id: string;
  title: string;
  category: string;
  description: string;
  businessUrl: string;
  targetLeadUrl: string;
  basePrice: number;
  currentBid: number;
  bidCount: number;
  timeLeft: string;
  qualityScore: number;
  sellerRating: number;
  status: 'pending' | 'approved' | 'rejected';
  countryCode: string;
  region: string;
  ownerId?: string;
  deliveryDate?: string;
  leadCapacity?: number;
}

export interface PurchaseRequest {
  id: string;
  leadId: string;
  leadTitle: string;
  userId: string;
  userName: string;
  buyerBusinessUrl: string;
  buyerTargetLeadUrl: string;
  buyerTollFree?: string;
  bidAmount: number;
  leadsPerDay: number;
  totalDailyCost: number;
  status: 'pending' | 'approved' | 'rejected';
  timestamp: string;
  officeHoursStart?: string;
  officeHoursEnd?: string;
  operationalDays?: string[];
  deliveryStartDate?: string;
  deliveryStatus?: 'active' | 'paused';
  gatewayId?: string;
}

export interface Invoice {
  id: string;
  purchaseRequestId: string;
  userId: string;
  userName: string;
  leadTitle: string;
  category: string;
  unitPrice: number;
  dailyVolume: number;
  totalSettlement: number;
  timestamp: string;
  status: 'paid';
}

export interface WalletActivity {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  provider: string;
  timestamp: string;
  status: 'completed' | 'pending';
}

export interface PlatformAnalytics {
  totalVolume: number;
  activeTraders: number;
  avgCPA: number;
  successRate: number;
  revenueHistory: { date: string; value: number }[];
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: 'buy' | 'sell' | 'system' | 'approval';
  timestamp: string;
  read: boolean;
}

export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  stripeConnected: boolean;
  role: UserRole;
  status: 'active' | 'restricted'; 
  totalSpend?: number; 
  username?: string;
  bio?: string;
  profileImage?: string;
  phone?: string;
  password?: string;
  ipAddress?: string;
  deviceInfo?: string;
  location?: string;
  wishlist?: string[];
  companyWebsite?: string;
  industryFocus?: string;
  preferredContact?: 'email' | 'phone' | 'whatsapp' | 'telegram';
  defaultBusinessUrl?: string;
  defaultTargetUrl?: string;
  last_active_at?: string;
  current_page?: string;
  biometricEnabled?: boolean;
  biometricKey?: string;
}

export interface OAuthConfig {
  googleEnabled: boolean;
  googleClientId: string;
  googleClientSecret: string;
  facebookEnabled: boolean;
  facebookAppId: string;
  facebookAppSecret: string;
}

export interface AIInsight {
  relevance: number;
  conversionPotential: string;
  marketTrend: string;
  summary: string;
}

export interface GatewayAPI {
  id: string;
  name: string;
  provider: 
    | 'stripe' | 'paypal' | 'adyen' | 'braintree' | 'square' | 'authorize_net' 
    | 'razorpay' | 'mollie' | 'paystack' | 'crypto' | 'binance' | 'upi' 
    | 'skrill' | 'neteller' | 'klarna' | 'alipay' | 'wechat' | 'custom' | 'bank';
  publicKey: string;
  secretKey: string;
  fee: string;
  status: 'active' | 'inactive';
  qrCode?: string;
}
