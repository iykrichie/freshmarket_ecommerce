import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  Product,
  Category,
  CartItem,
  WishlistItem,
  DeliveryZone,
  Coupon,
  Order,
  Customer,
  StoreSettings,
  StoreSnapshot,
  SubscriptionInfo,
  OrderStatus,
  UnitType,
  UserAccount,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_DELIVERY_ZONES,
  INITIAL_COUPONS,
  DEFAULT_STORE_SETTINGS,
} from '../data/mockData';
import { DEFAULT_SUBSCRIPTION } from '../data/subscriptionPlans';
import {
  STORAGE_KEYS,
  StoreRepository,
  safeWriteStorage,
  sanitizeCategories,
  sanitizeDeliveryZones,
  sanitizeSnapshot,
  sanitizeStoreSettings,
  sanitizeSubscription,
} from '../data/repository';

interface NotificationState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface StoreContextType {
  // Navigation & View
  viewMode: 'storefront' | 'admin';
  setViewMode: (mode: 'storefront' | 'admin') => void;
  activeAdminTab: string;
  setActiveAdminTab: (tab: string) => void;

  // Products & Categories
  products: Product[];
  categories: Category[];
  addCategory: (category: Omit<Category, 'id' | 'itemCount' | 'slug'>) => void;
  updateCategory: (category: Category, previousName?: string) => void;
  deleteCategory: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  viewingProduct: Product | null;
  setViewingProduct: (p: Product | null) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (product: Product) => void;
  bulkUpsertInventory: (
    updatedProducts: Product[],
    newProducts: Omit<Product, 'id'>[]
  ) => { updatedCount: number; addedCount: number };

  // Cart
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedUnit?: UnitType) => void;
  updateCartQuantity: (productId: string, unit: UnitType, quantity: number) => void;
  removeFromCart: (productId: string, unit: UnitType) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Wishlist
  wishlist: WishlistItem[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;

  // Delivery & Zones
  deliveryZones: DeliveryZone[];
  selectedZone: DeliveryZone | null;
  setSelectedZone: (zone: DeliveryZone | null) => void;
  addDeliveryZone: (zone: Omit<DeliveryZone, 'id'>) => void;
  updateDeliveryZone: (zone: DeliveryZone) => void;
  deleteDeliveryZone: (id: string) => void;

  // Coupons
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Omit<Coupon, 'id' | 'usageCount'>) => void;
  updateCoupon: (coupon: Coupon) => void;
  deleteCoupon: (id: string) => void;
  toggleCouponActive: (id: string) => void;

  // Checkout & Orders
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'trackingCode'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, driverInfo?: { name: string; phone: string }) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  isTrackingOpen: boolean;
  setIsTrackingOpen: (open: boolean) => void;
  activeTrackingId: string | null;
  setActiveTrackingId: (id: string | null) => void;

  // Authentication State
  currentUser: UserAccount | null;
  setCurrentUser: (user: UserAccount | null) => void;
  isUserAuthOpen: boolean;
  setIsUserAuthOpen: (open: boolean) => void;

  isAdminAuthenticated: boolean;
  setIsAdminAuthenticated: (auth: boolean) => void;
  isAdminLoginOpen: boolean;
  setIsAdminLoginOpen: (open: boolean) => void;

  // Customers, Settings, Subscription & White-Label Snapshot
  customers: Customer[];
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: StoreSettings) => void;
  subscription: SubscriptionInfo;
  updateSubscription: (sub: SubscriptionInfo) => void;
  isSetupWizardOpen: boolean;
  setIsSetupWizardOpen: (open: boolean) => void;
  isSetupBannerDismissed: boolean;
  dismissSetupBanner: () => void;
  completeStoreInitialization: (payload: {
    storeSettings: StoreSettings;
    subscription: SubscriptionInfo;
    categories?: Category[];
    products?: Product[];
    deliveryZones?: DeliveryZone[];
    coupons?: Coupon[];
    openAdminAfter?: boolean;
  }) => Promise<boolean>;
  exportStoreSnapshot: () => StoreSnapshot;
  importStoreSnapshot: (snapshot: Partial<StoreSnapshot>) => boolean;
  resetAllStoreData: () => void;

  // Toast Notifications
  notifications: NotificationState[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;

  // Summary Computations
  cartSubtotal: number;
  cartDeliveryFee: number;
  cartDiscount: number;
  cartTotal: number;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'category'
  );
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialLocal = useMemo(() => StoreRepository.loadLocalState(), []);
  const hasMountedRef = useRef(false);

  const [viewMode, setViewMode] = useState<'storefront' | 'admin'>('storefront');
  const [activeAdminTab, setActiveAdminTab] = useState<string>('overview');

  const [products, setProducts] = useState<Product[]>(initialLocal.products);
  const [categories, setCategories] = useState<Category[]>(initialLocal.categories);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(initialLocal.deliveryZones);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(
    initialLocal.deliveryZones[0]?.id || null
  );

  const selectedZone = useMemo(
    () => deliveryZones.find((z) => z.id === selectedZoneId) || deliveryZones[0] || null,
    [deliveryZones, selectedZoneId]
  );

  const setSelectedZone = useCallback((zone: DeliveryZone | null) => {
    setSelectedZoneId(zone?.id || null);
  }, []);

  const [coupons, setCoupons] = useState<Coupon[]>(initialLocal.coupons);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [orders, setOrders] = useState<Order[]>(initialLocal.orders);
  const [customers, setCustomers] = useState<Customer[]>(initialLocal.customers);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(initialLocal.storeSettings);
  const [cart, setCart] = useState<CartItem[]>(initialLocal.cart);
  const [wishlist, setWishlist] = useState<WishlistItem[]>(initialLocal.wishlist);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [activeTrackingId, setActiveTrackingId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  // User & Admin Auth State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(initialLocal.currentUser);
  const [isUserAuthOpen, setIsUserAuthOpen] = useState(false);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      const saved =
        sessionStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) ||
        localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH);
      return saved === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // Subscription & One-Time Setup State
  const [subscription, setSubscription] = useState<SubscriptionInfo>(initialLocal.subscription);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState<boolean>(() => {
    try {
      return new URLSearchParams(window.location.search).get('setup') === '1';
    } catch {
      return false;
    }
  });
  const [isSetupBannerDismissed, setIsSetupBannerDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('fm_setup_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const dismissSetupBanner = useCallback(() => {
    setIsSetupBannerDismissed(true);
    try {
      sessionStorage.setItem('fm_setup_banner_dismissed', 'true');
    } catch {
      // Ignore storage error
    }
  }, []);

  // Toast Notifications
  const showToast = useCallback(
    (message: string, type: 'success' | 'info' | 'error' = 'success') => {
      const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
      setNotifications((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, 4000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // LocalStorage Syncing (skips redundant serialization on first mount)
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }
    const ok = safeWriteStorage(STORAGE_KEYS.PRODUCTS, products);
    if (!ok) {
      showToast('Storage quota nearly full — use compressed photos or image URLs.', 'error');
    }
  }, [products, showToast]);

  useEffect(() => {
    if (!hasMountedRef.current) return;
    safeWriteStorage(STORAGE_KEYS.CATEGORIES, categories);
  }, [categories]);

  useEffect(() => {
    if (!hasMountedRef.current) return;
    safeWriteStorage(STORAGE_KEYS.ZONES, deliveryZones);
  }, [deliveryZones]);

  useEffect(() => {
    if (!hasMountedRef.current) return;
    safeWriteStorage(STORAGE_KEYS.COUPONS, coupons);
  }, [coupons]);

  useEffect(() => {
    if (!hasMountedRef.current) return;
    safeWriteStorage(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    if (!hasMountedRef.current) return;
    safeWriteStorage(STORAGE_KEYS.CUSTOMERS, customers);
  }, [customers]);

  useEffect(() => {
    if (!hasMountedRef.current) return;
    safeWriteStorage(STORAGE_KEYS.CART, cart);
  }, [cart]);

  useEffect(() => {
    if (!hasMountedRef.current) return;
    safeWriteStorage(STORAGE_KEYS.WISHLIST, wishlist);
  }, [wishlist]);

  useEffect(() => {
    document.title = storeSettings.tagline
      ? `${storeSettings.storeName} — ${storeSettings.tagline}`
      : storeSettings.storeName;
    if (!hasMountedRef.current) return;
    safeWriteStorage(STORAGE_KEYS.SETTINGS, storeSettings);
  }, [storeSettings]);

  useEffect(() => {
    if (!hasMountedRef.current) return;
    safeWriteStorage(STORAGE_KEYS.SUBSCRIPTION, subscription);
  }, [subscription]);

  // Keep cart prices/metadata synced with catalog updates and drop deleted products
  useEffect(() => {
    setCart((prevCart) => {
      if (prevCart.length === 0) return prevCart;
      const productById = new Map<string, Product>(products.map((p) => [p.id, p]));
      let changed = false;
      const reconciled: CartItem[] = [];

      for (const item of prevCart) {
        const latest = productById.get(item.product.id);
        if (!latest || latest.stock <= 0) {
          changed = true;
          continue;
        }
        let latestUnitPrice = latest.discountPrice || latest.price;
        if (latest.availableUnits) {
          const matchedUnit = latest.availableUnits.find((u) => u.unit === item.selectedUnit);
          if (matchedUnit) {
            latestUnitPrice = matchedUnit.discountPrice || matchedUnit.price;
          }
        }
        const clampedQty = Math.min(item.quantity, latest.stock);
        if (
          latest !== item.product ||
          latestUnitPrice !== item.unitPrice ||
          clampedQty !== item.quantity
        ) {
          changed = true;
          reconciled.push({
            ...item,
            product: latest,
            unitPrice: latestUnitPrice,
            quantity: clampedQty,
          });
        } else {
          reconciled.push(item);
        }
      }
      return changed ? reconciled : prevCart;
    });
  }, [products]);

  // Bootstrap server-provisioned store config (from CLI `npm run init` or prior Setup Wizard)
  useEffect(() => {
    let cancelled = false;
    const bootstrapFromServer = async () => {
      const data = await StoreRepository.fetchBootstrap();
      if (!data || cancelled) return;

      const hasLocalSub = Boolean(localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION));

      if (data.initialized && data.config) {
        if (!hasLocalSub) {
          if (data.config.storeSettings) {
            setStoreSettings(sanitizeStoreSettings(data.config.storeSettings));
          }
          if (data.config.subscription) {
            setSubscription(
              sanitizeSubscription({
                ...data.config.subscription,
                setupCompleted: true,
              })
            );
          }
          if (Array.isArray(data.config.categories) && data.config.categories.length > 0) {
            setCategories(sanitizeCategories(data.config.categories));
          }
          if (Array.isArray(data.config.products)) {
            setProducts(data.config.products);
          }
          if (Array.isArray(data.config.deliveryZones) && data.config.deliveryZones.length > 0) {
            const cleanZones = sanitizeDeliveryZones(data.config.deliveryZones);
            setDeliveryZones(cleanZones);
            setSelectedZoneId(cleanZones[0].id);
          }
          if (Array.isArray(data.config.coupons)) {
            setCoupons(data.config.coupons);
          }
        }
      } else if (data.setupRequired && !hasLocalSub) {
        setIsSetupWizardOpen(true);
      }
    };
    bootstrapFromServer();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('fm_user', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('fm_user');
      }
    } catch {
      // Ignore storage error
    }
  }, [currentUser]);

  useEffect(() => {
    try {
      sessionStorage.setItem('fm_admin_auth', isAdminAuthenticated ? 'true' : 'false');
      localStorage.setItem('fm_admin_auth', isAdminAuthenticated ? 'true' : 'false');
    } catch {
      // Ignore storage error
    }
  }, [isAdminAuthenticated]);

  // Category CRUD
  const addCategory = useCallback(
    (catInput: Omit<Category, 'id' | 'itemCount' | 'slug'>) => {
      const trimmedName = catInput.name.trim();
      if (!trimmedName) return;
      const duplicate = categories.some(
        (c) => c.name.toLowerCase() === trimmedName.toLowerCase()
      );
      if (duplicate) {
        showToast(`Category "${trimmedName}" already exists.`, 'error');
        return;
      }
      const newCategory: Category = {
        ...catInput,
        name: trimmedName,
        id: 'cat-' + Date.now(),
        slug: slugify(trimmedName),
        itemCount: 0,
      };
      setCategories((prev) => [...prev, newCategory]);
      showToast(`Added category "${trimmedName}"!`, 'success');
    },
    [categories, showToast]
  );

  const updateCategory = useCallback(
    (updatedCat: Category, previousName?: string) => {
      const trimmedName = updatedCat.name.trim();
      if (!trimmedName) return;
      setCategories((prev) =>
        prev.map((c) =>
          c.id === updatedCat.id
            ? { ...updatedCat, name: trimmedName, slug: slugify(trimmedName) }
            : c
        )
      );

      if (previousName && previousName !== trimmedName) {
        setProducts((prev) =>
          prev.map((p) => (p.category === previousName ? { ...p, category: trimmedName } : p))
        );
        setSelectedCategory((curr) => (curr === previousName ? trimmedName : curr));
      }

      showToast(`Updated category "${trimmedName}"!`, 'info');
    },
    [showToast]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      const target = categories.find((c) => c.id === id);
      if (!target) return;
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSelectedCategory((curr) => (curr === target.name ? null : curr));
      showToast(`Removed category "${target.name}"`, 'info');
    },
    [categories, showToast]
  );

  // Product CRUD
  const addProduct = useCallback(
    (newProd: Omit<Product, 'id'>) => {
      const id = 'prod-' + Date.now();
      const fullProduct: Product = { ...newProd, id, rating: 5.0, reviewsCount: 0 };
      setProducts((prev) => [fullProduct, ...prev]);
      showToast(`Added "${fullProduct.name}" to store catalog!`, 'success');
    },
    [showToast]
  );

  const updateProduct = useCallback(
    (updatedProd: Product) => {
      setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
      showToast(`Updated "${updatedProd.name}"!`, 'info');
    },
    [showToast]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      setProducts((prev) => {
        const prod = prev.find((p) => p.id === id);
        if (prod) {
          showToast(`Deleted "${prod.name}"`, 'info');
        }
        return prev.filter((p) => p.id !== id);
      });
    },
    [showToast]
  );

  const duplicateProduct = useCallback(
    (source: Product) => {
      const id = 'prod-' + Date.now();
      const cloned: Product = {
        ...source,
        id,
        name: `${source.name} (Copy)`,
        rating: 5.0,
        reviewsCount: 0,
      };
      setProducts((prev) => [cloned, ...prev]);
      showToast(`Duplicated "${source.name}" — edit details anytime.`, 'success');
    },
    [showToast]
  );

  const bulkUpsertInventory = useCallback(
    (
      updatedProducts: Product[],
      newProducts: Omit<Product, 'id'>[]
    ): { updatedCount: number; addedCount: number } => {
      const updatedMap = new Map(updatedProducts.map((p) => [p.id, p]));
      const timestamp = Date.now();
      const createdProducts: Product[] = newProducts.map((p, index) => ({
        ...p,
        id: `prod-${timestamp}-${index}`,
        rating: p.rating ?? 5.0,
        reviewsCount: p.reviewsCount ?? 0,
      }));

      setProducts((prev) => {
        const mergedExisting = prev.map((existing) =>
          updatedMap.has(existing.id) ? updatedMap.get(existing.id)! : existing
        );
        return [...createdProducts, ...mergedExisting];
      });

      const updatedCount = updatedProducts.length;
      const addedCount = createdProducts.length;
      showToast(
        `Bulk sync complete: ${updatedCount} updated, ${addedCount} new added.`,
        'success'
      );

      return { updatedCount, addedCount };
    },
    [showToast]
  );

  // Cart operations (enforces available stock & positive integer quantities)
  const addToCart = useCallback(
    (product: Product, quantity = 1, selectedUnit?: UnitType) => {
      const liveProduct = products.find((p) => p.id === product.id) || product;
      if (liveProduct.stock <= 0) {
        showToast(`"${liveProduct.name}" is currently out of stock.`, 'error');
        return;
      }

      const qtyToAdd = Math.max(1, Math.round(quantity));
      const unitToUse = selectedUnit || liveProduct.unit;

      let unitPrice = liveProduct.discountPrice || liveProduct.price;
      if (selectedUnit && liveProduct.availableUnits) {
        const match = liveProduct.availableUnits.find((u) => u.unit === selectedUnit);
        if (match) {
          unitPrice = match.discountPrice || match.price;
        }
      }

      setCart((prevCart) => {
        const existingIndex = prevCart.findIndex(
          (item) => item.product.id === liveProduct.id && item.selectedUnit === unitToUse
        );

        if (existingIndex > -1) {
          const updated = [...prevCart];
          const nextQty = Math.min(liveProduct.stock, updated[existingIndex].quantity + qtyToAdd);
          updated[existingIndex] = {
            ...updated[existingIndex],
            product: liveProduct,
            unitPrice,
            quantity: nextQty,
          };
          return updated;
        }
        return [
          ...prevCart,
          {
            product: liveProduct,
            quantity: Math.min(liveProduct.stock, qtyToAdd),
            selectedUnit: unitToUse,
            unitPrice,
          },
        ];
      });

      showToast(`Added ${qtyToAdd}x ${liveProduct.name} (${unitToUse}) to cart!`, 'success');
    },
    [products, showToast]
  );

  const removeFromCart = useCallback(
    (productId: string, unit: UnitType) => {
      setCart((prevCart) =>
        prevCart.filter((item) => !(item.product.id === productId && item.selectedUnit === unit))
      );
      showToast('Item removed from cart', 'info');
    },
    [showToast]
  );

  const updateCartQuantity = useCallback(
    (productId: string, unit: UnitType, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId, unit);
        return;
      }
      const liveProduct = products.find((p) => p.id === productId);
      const maxStock = liveProduct ? liveProduct.stock : Infinity;
      const safeQty = Math.max(1, Math.min(maxStock, Math.round(quantity)));

      if (liveProduct && quantity > liveProduct.stock) {
        showToast(`Only ${liveProduct.stock} units available in stock.`, 'info');
      }

      setCart((prevCart) =>
        prevCart.map((item) =>
          item.product.id === productId && item.selectedUnit === unit
            ? { ...item, quantity: safeQty }
            : item
        )
      );
    },
    [products, removeFromCart, showToast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
  }, []);

  // Wishlist
  const toggleWishlist = useCallback(
    (product: Product) => {
      setWishlist((prev) => {
        const exists = prev.some((item) => item.product.id === product.id);
        if (exists) {
          showToast(`Removed "${product.name}" from wishlist`, 'info');
          return prev.filter((item) => item.product.id !== product.id);
        }
        showToast(`Added "${product.name}" to wishlist`, 'success');
        return [...prev, { product, addedAt: new Date().toISOString() }];
      });
    },
    [showToast]
  );

  const isInWishlist = useCallback(
    (productId: string) => wishlist.some((item) => item.product.id === productId),
    [wishlist]
  );

  // Delivery Zones
  const addDeliveryZone = useCallback(
    (zone: Omit<DeliveryZone, 'id'>) => {
      const id = 'zone-' + Date.now();
      const newZone = { ...zone, id };
      setDeliveryZones((prev) => [...prev, newZone]);
      showToast(`Added delivery zone: ${newZone.name}`, 'success');
    },
    [showToast]
  );

  const updateDeliveryZone = useCallback(
    (updatedZone: DeliveryZone) => {
      setDeliveryZones((prev) => prev.map((z) => (z.id === updatedZone.id ? updatedZone : z)));
      showToast(`Updated delivery zone: ${updatedZone.name}`, 'info');
    },
    [showToast]
  );

  const deleteDeliveryZone = useCallback(
    (id: string) => {
      setDeliveryZones((prev) => prev.filter((z) => z.id !== id));
      setSelectedZoneId((curr) => (curr === id ? null : curr));
      showToast('Delivery zone removed', 'info');
    },
    [showToast]
  );

  // Computations
  const cartSubtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [cart]
  );

  const cartDeliveryFee = useMemo(() => {
    if (!selectedZone || cartSubtotal <= 0) return 0;
    const threshold = selectedZone.freeAboveThreshold ?? storeSettings.freeDeliveryThreshold;
    if (threshold > 0 && cartSubtotal >= threshold) return 0;
    return selectedZone.fee;
  }, [selectedZone, cartSubtotal, storeSettings.freeDeliveryThreshold]);

  const cartDiscount = useMemo(() => {
    if (!appliedCoupon || cartSubtotal < appliedCoupon.minOrderAmount) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      return Math.round((cartSubtotal * appliedCoupon.value) / 100);
    }
    return Math.min(cartSubtotal, appliedCoupon.value);
  }, [appliedCoupon, cartSubtotal]);

  const cartTotal = useMemo(
    () => Math.max(0, cartSubtotal + cartDeliveryFee - cartDiscount),
    [cartSubtotal, cartDeliveryFee, cartDiscount]
  );

  // Coupon handling
  const applyCoupon = useCallback(
    (code: string) => {
      const cleanCode = code.trim().toUpperCase();
      const coupon = coupons.find((c) => c.code === cleanCode && c.isActive);

      if (!coupon) {
        return { success: false, message: 'Invalid or inactive coupon code' };
      }

      if (coupon.expiryDate && new Date(coupon.expiryDate + 'T23:59:59') < new Date()) {
        return { success: false, message: 'This coupon has expired' };
      }

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return { success: false, message: 'This coupon has reached its usage limit' };
      }

      if (cartSubtotal < coupon.minOrderAmount) {
        return {
          success: false,
          message: `Coupon requires a minimum order of ${storeSettings.currencySymbol}${coupon.minOrderAmount.toLocaleString()}`,
        };
      }

      setAppliedCoupon(coupon);
      showToast(`Applied coupon "${coupon.code}" successfully!`, 'success');
      return { success: true, message: 'Coupon applied successfully!' };
    },
    [coupons, cartSubtotal, storeSettings.currencySymbol, showToast]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  }, [showToast]);

  const addCoupon = useCallback(
    (newCoupon: Omit<Coupon, 'id' | 'usageCount'>) => {
      const cleanCode = newCoupon.code.trim().toUpperCase();
      if (coupons.some((c) => c.code === cleanCode)) {
        showToast(`Coupon "${cleanCode}" already exists.`, 'error');
        return;
      }
      const id = 'coup-' + Date.now();
      setCoupons((prev) => [{ ...newCoupon, code: cleanCode, id, usageCount: 0 }, ...prev]);
      showToast(`Created promo code ${cleanCode}`, 'success');
    },
    [coupons, showToast]
  );

  const updateCoupon = useCallback(
    (updated: Coupon) => {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === updated.id ? { ...updated, code: updated.code.trim().toUpperCase() } : c
        )
      );
      showToast(`Updated coupon "${updated.code.toUpperCase()}"!`, 'info');
    },
    [showToast]
  );

  const deleteCoupon = useCallback(
    (id: string) => {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      setAppliedCoupon((curr) => (curr?.id === id ? null : curr));
      showToast('Coupon deleted', 'info');
    },
    [showToast]
  );

  const toggleCouponActive = useCallback((id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  }, []);

  // Orders
  const createOrder = useCallback(
    (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'trackingCode'>): Order => {
      const prefix =
        storeSettings.storeName
          .replace(/[^A-Za-z]/g, '')
          .slice(0, 2)
          .toUpperCase() || 'ST';
      const orderNum = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
      const tracking = `TRK-${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;
      const id = 'order-' + Date.now();

      const newOrder: Order = {
        ...orderData,
        id,
        orderNumber: orderNum,
        createdAt: new Date().toISOString(),
        trackingCode: tracking,
      };

      setOrders((prev) => [newOrder, ...prev]);

      // Update stock levels
      setProducts((prevProds) =>
        prevProds.map((p) => {
          const orderedQty = orderData.items
            .filter((i) => i.product.id === p.id)
            .reduce((sum, i) => sum + i.quantity, 0);
          if (orderedQty > 0) {
            return { ...p, stock: Math.max(0, p.stock - orderedQty) };
          }
          return p;
        })
      );

      // Increment coupon usage count if coupon used
      if (orderData.couponCode) {
        setCoupons((prev) =>
          prev.map((c) =>
            c.code === orderData.couponCode ? { ...c, usageCount: c.usageCount + 1 } : c
          )
        );
      }

      // Update customer history
      setCustomers((prevCusts) => {
        const existingIndex = prevCusts.findIndex(
          (c) =>
            c.phone === orderData.customerInfo.phone ||
            (c.email && c.email === orderData.customerInfo.email)
        );

        if (existingIndex > -1) {
          const updated = [...prevCusts];
          const cust = updated[existingIndex];
          updated[existingIndex] = {
            ...cust,
            totalOrders: cust.totalOrders + 1,
            totalSpent: cust.totalSpent + orderData.totalAmount,
            lastOrderDate: new Date().toISOString().split('T')[0],
            isFrequent: cust.totalOrders + 1 >= 3,
          };
          return updated;
        }

        const newCust: Customer = {
          id: 'cust-' + Date.now(),
          name: orderData.customerInfo.name,
          phone: orderData.customerInfo.phone,
          email: orderData.customerInfo.email,
          community: orderData.customerInfo.community,
          address: orderData.customerInfo.deliveryAddress,
          totalOrders: 1,
          totalSpent: orderData.totalAmount,
          lastOrderDate: new Date().toISOString().split('T')[0],
          isFrequent: false,
        };
        return [newCust, ...prevCusts];
      });

      clearCart();
      void StoreRepository.createOrderOnServer(newOrder);
      showToast(`Order ${orderNum} placed successfully!`, 'success');
      return newOrder;
    },
    [storeSettings.storeName, clearCart, showToast]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: OrderStatus, driverInfo?: { name: string; phone: string }) => {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status,
                ...(driverInfo ? { driverInfo } : {}),
                ...(status === 'delivered' ? { paymentStatus: 'paid' as const } : {}),
              }
            : o
        )
      );
      void StoreRepository.updateOrderStatusOnServer(orderId, status, driverInfo, {
        email: storeSettings.adminCredentials?.email,
        password: storeSettings.adminCredentials?.passwordHash,
      });
      showToast(`Order status updated to ${status.toUpperCase().replace('_', ' ')}`, 'info');
    },
    [storeSettings.adminCredentials, showToast]
  );

  const updateStoreSettings = useCallback(
    (newSettings: StoreSettings) => {
      setStoreSettings(newSettings);
      showToast('Store settings updated!', 'success');
    },
    [showToast]
  );

  const updateSubscription = useCallback(
    (nextSub: SubscriptionInfo) => {
      setSubscription(nextSub);
      showToast(`Subscription plan updated to ${nextSub.planName}!`, 'success');
    },
    [showToast]
  );

  const completeStoreInitialization = useCallback(
    async (payload: {
      storeSettings: StoreSettings;
      subscription: SubscriptionInfo;
      categories?: Category[];
      products?: Product[];
      deliveryZones?: DeliveryZone[];
      coupons?: Coupon[];
      openAdminAfter?: boolean;
    }): Promise<boolean> => {
      const completedAt = new Date().toISOString();
      const finalSub: SubscriptionInfo = {
        ...payload.subscription,
        setupCompleted: true,
        setupCompletedAt: completedAt,
      };
      const nextCategories = payload.categories ?? categories;
      const nextProducts = payload.products ?? products;
      const nextZones = payload.deliveryZones ?? deliveryZones;
      const nextCoupons = payload.coupons ?? coupons;

      setStoreSettings(payload.storeSettings);
      setSubscription(finalSub);
      if (payload.categories) setCategories(payload.categories);
      if (payload.products) setProducts(payload.products);
      if (payload.deliveryZones && payload.deliveryZones.length > 0) {
        setDeliveryZones(payload.deliveryZones);
        setSelectedZoneId(payload.deliveryZones[0].id);
      }
      if (payload.coupons) setCoupons(payload.coupons);
      setSelectedCategory(null);

      await StoreRepository.initializeOnServer({
        storeSettings: payload.storeSettings,
        subscription: finalSub,
        categories: nextCategories,
        products: nextProducts,
        deliveryZones: nextZones,
        coupons: nextCoupons,
        auth: {
          email: storeSettings.adminCredentials?.email,
          password: storeSettings.adminCredentials?.passwordHash,
        },
      });

      setIsSetupWizardOpen(false);
      setIsAdminAuthenticated(true);
      if (payload.openAdminAfter) {
        setViewMode('admin');
        setActiveAdminTab('subscription');
      }
      showToast(
        `${payload.storeSettings.storeName} is initialized and live on ${finalSub.planName}!`,
        'success'
      );
      return true;
    },
    [categories, products, deliveryZones, coupons, storeSettings.adminCredentials, showToast]
  );

  const exportStoreSnapshot = useCallback((): StoreSnapshot => {
    return {
      version: 2,
      exportedAt: new Date().toISOString(),
      storeSettings,
      categories,
      products,
      deliveryZones,
      coupons,
      subscription,
    };
  }, [storeSettings, categories, products, deliveryZones, coupons, subscription]);

  const importStoreSnapshot = useCallback(
    (snapshot: Partial<StoreSnapshot>): boolean => {
      const clean = sanitizeSnapshot(snapshot);
      if (!clean) return false;
      if (clean.storeSettings) {
        setStoreSettings(clean.storeSettings);
      }
      if (clean.subscription) {
        setSubscription(clean.subscription);
      }
      if (clean.categories && clean.categories.length > 0) {
        setCategories(clean.categories);
      }
      if (Array.isArray(clean.products)) {
        setProducts(clean.products);
      }
      if (clean.deliveryZones && clean.deliveryZones.length > 0) {
        setDeliveryZones(clean.deliveryZones);
        setSelectedZoneId(clean.deliveryZones[0].id);
      }
      if (Array.isArray(clean.coupons)) {
        setCoupons(clean.coupons);
      }
      setSelectedCategory(null);
      showToast('Full store snapshot imported successfully!', 'success');
      return true;
    },
    [showToast]
  );

  const resetAllStoreData = useCallback(() => {
    setStoreSettings(DEFAULT_STORE_SETTINGS);
    setSubscription(DEFAULT_SUBSCRIPTION);
    setCategories(INITIAL_CATEGORIES);
    setProducts(INITIAL_PRODUCTS);
    setDeliveryZones(INITIAL_DELIVERY_ZONES);
    setSelectedZoneId(INITIAL_DELIVERY_ZONES[0]?.id || null);
    setCoupons(INITIAL_COUPONS);
    setSelectedCategory(null);
    showToast('Restored all catalog, categories, zones, and branding defaults.', 'info');
  }, [showToast]);

  const contextValue = useMemo<StoreContextType>(
    () => ({
      viewMode,
      setViewMode,
      activeAdminTab,
      setActiveAdminTab,

      products,
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      searchQuery,
      setSearchQuery,
      selectedCategory,
      setSelectedCategory,
      viewingProduct,
      setViewingProduct,
      addProduct,
      updateProduct,
      deleteProduct,
      duplicateProduct,
      bulkUpsertInventory,

      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      isCartOpen,
      setIsCartOpen,

      wishlist,
      toggleWishlist,
      isInWishlist,

      deliveryZones,
      selectedZone,
      setSelectedZone,
      addDeliveryZone,
      updateDeliveryZone,
      deleteDeliveryZone,

      coupons,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      toggleCouponActive,

      orders,
      createOrder,
      updateOrderStatus,
      isCheckoutOpen,
      setIsCheckoutOpen,
      isTrackingOpen,
      setIsTrackingOpen,
      activeTrackingId,
      setActiveTrackingId,

      currentUser,
      setCurrentUser,
      isUserAuthOpen,
      setIsUserAuthOpen,

      isAdminAuthenticated,
      setIsAdminAuthenticated,
      isAdminLoginOpen,
      setIsAdminLoginOpen,

      customers,
      storeSettings,
      updateStoreSettings,
      subscription,
      updateSubscription,
      isSetupWizardOpen,
      setIsSetupWizardOpen,
      isSetupBannerDismissed,
      dismissSetupBanner,
      completeStoreInitialization,
      exportStoreSnapshot,
      importStoreSnapshot,
      resetAllStoreData,

      notifications,
      showToast,
      removeToast,

      cartSubtotal,
      cartDeliveryFee,
      cartDiscount,
      cartTotal,
    }),
    [
      viewMode,
      activeAdminTab,
      products,
      categories,
      addCategory,
      updateCategory,
      deleteCategory,
      searchQuery,
      selectedCategory,
      viewingProduct,
      addProduct,
      updateProduct,
      deleteProduct,
      duplicateProduct,
      bulkUpsertInventory,
      cart,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      isCartOpen,
      wishlist,
      toggleWishlist,
      isInWishlist,
      deliveryZones,
      selectedZone,
      setSelectedZone,
      addDeliveryZone,
      updateDeliveryZone,
      deleteDeliveryZone,
      coupons,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      toggleCouponActive,
      orders,
      createOrder,
      updateOrderStatus,
      isCheckoutOpen,
      isTrackingOpen,
      activeTrackingId,
      currentUser,
      isUserAuthOpen,
      isAdminAuthenticated,
      isAdminLoginOpen,
      customers,
      storeSettings,
      updateStoreSettings,
      subscription,
      updateSubscription,
      isSetupWizardOpen,
      isSetupBannerDismissed,
      dismissSetupBanner,
      completeStoreInitialization,
      exportStoreSnapshot,
      importStoreSnapshot,
      resetAllStoreData,
      notifications,
      showToast,
      removeToast,
      cartSubtotal,
      cartDeliveryFee,
      cartDiscount,
      cartTotal,
    ]
  );

  return <StoreContext.Provider value={contextValue}>{children}</StoreContext.Provider>;
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
