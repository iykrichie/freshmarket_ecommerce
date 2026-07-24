import React, { createContext, useContext, useState, useEffect } from 'react';
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
  OrderStatus,
  UnitType,
  UserAccount,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_DELIVERY_ZONES,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
  INITIAL_CUSTOMERS,
  DEFAULT_STORE_SETTINGS,
} from '../data/mockData';

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
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  viewingProduct: Product | null;
  setViewingProduct: (p: Product | null) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;

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

  // Customers & Settings
  customers: Customer[];
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: StoreSettings) => void;

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

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from LocalStorage with defaults
  const [viewMode, setViewMode] = useState<'storefront' | 'admin'>('storefront');
  const [activeAdminTab, setActiveAdminTab] = useState<string>('overview');

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('fm_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories] = useState<Category[]>(INITIAL_CATEGORIES);

  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(() => {
    const saved = localStorage.getItem('fm_zones');
    return saved ? JSON.parse(saved) : INITIAL_DELIVERY_ZONES;
  });

  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(() => deliveryZones[0] || null);

  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    const saved = localStorage.getItem('fm_coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('fm_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('fm_customers');
    return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
  });

  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('fm_settings');
    return saved ? JSON.parse(saved) : DEFAULT_STORE_SETTINGS;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('fm_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => {
    const saved = localStorage.getItem('fm_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

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
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('fm_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isUserAuthOpen, setIsUserAuthOpen] = useState(false);

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    const saved = sessionStorage.getItem('fm_admin_auth') || localStorage.getItem('fm_admin_auth');
    return saved === 'true';
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  // LocalStorage Synching
  useEffect(() => {
    localStorage.setItem('fm_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('fm_zones', JSON.stringify(deliveryZones));
  }, [deliveryZones]);

  useEffect(() => {
    localStorage.setItem('fm_coupons', JSON.stringify(coupons));
  }, [coupons]);

  useEffect(() => {
    localStorage.setItem('fm_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('fm_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('fm_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem('fm_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('fm_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('fm_user');
    }
  }, [currentUser]);

  useEffect(() => {
    sessionStorage.setItem('fm_admin_auth', isAdminAuthenticated ? 'true' : 'false');
    localStorage.setItem('fm_admin_auth', isAdminAuthenticated ? 'true' : 'false');
  }, [isAdminAuthenticated]);

  // Toast Function
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    setNotifications((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Product CRUD
  const addProduct = (newProd: Omit<Product, 'id'>) => {
    const id = 'prod-' + Date.now();
    const fullProduct: Product = { ...newProd, id, rating: 5.0, reviewsCount: 0 };
    setProducts((prev) => [fullProduct, ...prev]);
    showToast(`Added "${fullProduct.name}" to store catalog!`, 'success');
  };

  const updateProduct = (updatedProd: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
    showToast(`Updated "${updatedProd.name}"!`, 'info');
  };

  const deleteProduct = (id: string) => {
    const prod = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    showToast(`Deleted "${prod?.name || 'Product'}"`, 'info');
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1, selectedUnit?: UnitType) => {
    const unitToUse = selectedUnit || product.unit;

    // Calculate effective price based on selected unit
    let unitPrice = product.discountPrice || product.price;
    if (selectedUnit && product.availableUnits) {
      const match = product.availableUnits.find((u) => u.unit === selectedUnit);
      if (match) {
        unitPrice = match.discountPrice || match.price;
      }
    }

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedUnit === unitToUse
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prevCart, { product, quantity, selectedUnit: unitToUse, unitPrice }];
      }
    });

    showToast(`Added ${quantity}x ${product.name} (${unitToUse}) to cart!`, 'success');
  };

  const updateCartQuantity = (productId: string, unit: UnitType, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, unit);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId && item.selectedUnit === unit
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: string, unit: UnitType) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.product.id === productId && item.selectedUnit === unit))
    );
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Wishlist
  const toggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.product.id === product.id);
      if (exists) {
        showToast(`Removed "${product.name}" from wishlist`, 'info');
        return prev.filter((item) => item.product.id !== product.id);
      } else {
        showToast(`Added "${product.name}" to wishlist`, 'success');
        return [...prev, { product, addedAt: new Date().toISOString() }];
      }
    });
  };

  const isInWishlist = (productId: string) => wishlist.some((item) => item.product.id === productId);

  // Delivery Zones
  const addDeliveryZone = (zone: Omit<DeliveryZone, 'id'>) => {
    const id = 'zone-' + Date.now();
    const newZone = { ...zone, id };
    setDeliveryZones((prev) => [...prev, newZone]);
    showToast(`Added delivery zone: ${newZone.name}`, 'success');
  };

  const updateDeliveryZone = (updatedZone: DeliveryZone) => {
    setDeliveryZones((prev) => prev.map((z) => (z.id === updatedZone.id ? updatedZone : z)));
    showToast(`Updated delivery zone: ${updatedZone.name}`, 'info');
  };

  const deleteDeliveryZone = (id: string) => {
    setDeliveryZones((prev) => prev.filter((z) => z.id !== id));
    showToast('Delivery zone removed', 'info');
  };

  // Coupon handling
  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    const coupon = coupons.find((c) => c.code === cleanCode && c.isActive);

    if (!coupon) {
      return { success: false, message: 'Invalid or expired coupon code' };
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
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon removed', 'info');
  };

  const addCoupon = (newCoupon: Omit<Coupon, 'id' | 'usageCount'>) => {
    const id = 'coup-' + Date.now();
    setCoupons((prev) => [{ ...newCoupon, id, usageCount: 0 }, ...prev]);
    showToast(`Created promo code ${newCoupon.code}`, 'success');
  };

  const toggleCouponActive = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c))
    );
  };

  // Computations
  const cartSubtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  const cartDeliveryFee =
    selectedZone && cartSubtotal > 0
      ? selectedZone.freeAboveThreshold && cartSubtotal >= selectedZone.freeAboveThreshold
        ? 0
        : selectedZone.fee
      : 0;

  let cartDiscount = 0;
  if (appliedCoupon && cartSubtotal >= appliedCoupon.minOrderAmount) {
    if (appliedCoupon.discountType === 'percentage') {
      cartDiscount = Math.round((cartSubtotal * appliedCoupon.value) / 100);
    } else {
      cartDiscount = appliedCoupon.value;
    }
  }

  const cartTotal = Math.max(0, cartSubtotal + cartDeliveryFee - cartDiscount);

  // Orders
  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'trackingCode'>): Order => {
    const orderNum = 'FM-' + Math.floor(1000 + Math.random() * 9000);
    const tracking = 'TRK-FM-' + Math.floor(10000 + Math.random() * 90000);
    const id = 'order-' + Date.now();

    const newOrder: Order = {
      ...orderData,
      id,
      orderNumber: orderNum,
      createdAt: new Date().toISOString(),
      trackingCode: tracking,
    };

    // Save order
    setOrders((prev) => [newOrder, ...prev]);

    // Update stock levels
    setProducts((prevProds) =>
      prevProds.map((p) => {
        const itemInOrder = orderData.items.find((i) => i.product.id === p.id);
        if (itemInOrder) {
          const newStock = Math.max(0, p.stock - itemInOrder.quantity);
          return { ...p, stock: newStock };
        }
        return p;
      })
    );

    // Update customer history or create customer
    setCustomers((prevCusts) => {
      const existingIndex = prevCusts.findIndex(
        (c) => c.phone === orderData.customerInfo.phone || (c.email && c.email === orderData.customerInfo.email)
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
      } else {
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
      }
    });

    clearCart();
    showToast(`Order ${orderNum} placed successfully!`, 'success');
    return newOrder;
  };

  const updateOrderStatus = (
    orderId: string,
    status: OrderStatus,
    driverInfo?: { name: string; phone: string }
  ) => {
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
    showToast(`Updated Order ${orderId} status to ${status.toUpperCase().replace('_', ' ')}`, 'info');
  };

  const updateStoreSettings = (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    showToast('Store settings updated!', 'success');
  };

  return (
    <StoreContext.Provider
      value={{
        viewMode,
        setViewMode,
        activeAdminTab,
        setActiveAdminTab,

        products,
        categories,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        viewingProduct,
        setViewingProduct,
        addProduct,
        updateProduct,
        deleteProduct,

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

        notifications,
        showToast,
        removeToast,

        cartSubtotal,
        cartDeliveryFee,
        cartDiscount,
        cartTotal,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
