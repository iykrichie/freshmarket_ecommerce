export type UnitType =
  | '50kg Bag'
  | '25kg Bag'
  | '20kg Bag'
  | '10kg Bag'
  | '5kg Bag'
  | 'Paint Rubber'
  | '5L Bottle'
  | '4L Bottle'
  | '1L Bottle'
  | 'Carton'
  | 'Crate'
  | '1kg Pack'
  | '1kg Box'
  | '500g Tub'
  | '5kg Box'
  | 'Case of 24'
  | 'Single Hen'
  | 'Tubers'
  | 'Basket'
  | 'Piece'
  | 'Bunch'
  | 'Diaspora Box'
  | 'Care Package'
  | 'Export Pack';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  discountPrice?: number;
  unit: UnitType;
  availableUnits?: { unit: UnitType; price: number; discountPrice?: number }[];
  weight?: string;
  description: string;
  stock: number;
  image: string;
  images: string[];
  rating: number;
  reviewsCount: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isDailyDeal?: boolean;
  dealEndsAt?: string; // ISO date string
  origin?: string;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  image: string;
  itemCount: number;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedUnit: UnitType;
  unitPrice: number;
}

export interface WishlistItem {
  product: Product;
  addedAt: string;
}

export interface DeliveryZone {
  id: string;
  name: string;
  communities: string[];
  fee: number;
  minDeliveryTimeHours: number;
  maxDeliveryTimeHours: number;
  freeAboveThreshold?: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  value: number; // e.g. 10 for 10% or 1000 for ₦1,000
  minOrderAmount: number;
  expiryDate: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
}

export type OrderStatus = 'pending' | 'confirmed' | 'packed' | 'out_for_delivery' | 'delivered' | 'cancelled';
export type PaymentMethod = 'cod' | 'bank_transfer' | 'paystack' | 'flutterwave';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface OrderCustomerInfo {
  name: string;
  phone: string;
  email?: string;
  deliveryAddress: string;
  community: string;
  landmark?: string;
  notes?: string;
  isCarePackage?: boolean;
  recipientName?: string;
  giftMessage?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  customerInfo: OrderCustomerInfo;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  estimatedDelivery: string;
  trackingCode: string;
  driverInfo?: {
    name: string;
    phone: string;
  };
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  community: string;
  address: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  isFrequent: boolean;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  verifiedPurchase: boolean;
}

export interface StoreSettings {
  storeName: string;
  currency: string;
  currencySymbol: string;
  supportPhone: string;
  whatsappNumber: string;
  email: string;
  facebookUrl?: string;
  instagramUrl?: string;
  freeDeliveryThreshold: number;
  address: string;
  operationalHours: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    sortCode?: string;
    accountName: string;
  };
  adminCredentials?: {
    email: string;
    passwordHash?: string;
  };
}

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  isPhoneVerified: boolean;
  address?: string;
  community?: string;
  createdAt: string;
}

export interface AdminUser {
  email: string;
  role: 'owner' | 'manager';
  loginTime: string;
}

