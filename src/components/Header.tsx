import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  ShoppingBag,
  Heart,
  Search,
  MapPin,
  Truck,
  ShieldCheck,
  ChevronDown,
  X,
  Phone,
  MessageCircle,
  Menu,
  Sparkles,
  User,
  UserCheck,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    cart,
    cartSubtotal,
    wishlist,
    deliveryZones,
    selectedZone,
    setSelectedZone,
    searchQuery,
    setSearchQuery,
    products,
    setViewingProduct,
    setIsCartOpen,
    setIsTrackingOpen,
    viewMode,
    setViewMode,
    storeSettings,
    currentUser,
    setIsUserAuthOpen,
    isAdminAuthenticated,
    setIsAdminLoginOpen,
  } = useStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isZoneDropdownOpen, setIsZoneDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Filtered search suggestions
  const searchResults = searchQuery.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 6)
    : [];

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      {/* Top Banner */}
      <div className="bg-green-700 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-amber-500 text-gray-900 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide">
              Local & ✈️ Global Shipping
            </span>
            <span className="font-medium">
              Same-day local doorstep delivery & international air export parcels worldwide!
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {/* Social Launchers */}
            <div className="flex items-center gap-2 border-r border-green-600/60 pr-3">
              <a
                href={storeSettings.facebookUrl || 'https://facebook.com/freshmarketglobal'}
                target="_blank"
                rel="noreferrer"
                className="w-6 h-6 rounded-full bg-green-800/80 hover:bg-white hover:text-blue-600 flex items-center justify-center transition-all text-white"
                title="Follow FreshMarket on Facebook"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>

              <a
                href={storeSettings.instagramUrl || 'https://instagram.com/freshmarketglobal'}
                target="_blank"
                rel="noreferrer"
                className="w-6 h-6 rounded-full bg-green-800/80 hover:bg-white hover:text-pink-600 flex items-center justify-center transition-all text-white"
                title="Follow FreshMarket on Instagram"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            </div>

            <a
              href={`https://wa.me/${storeSettings.whatsappNumber}?text=Hello%20FreshMarket!%20I%20would%20like%20to%20inquire%20about%20foodstuff%20delivery.`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-green-200 font-medium transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-green-300" />
              <span>WhatsApp</span>
            </a>

            <span className="hidden sm:inline text-green-500">•</span>

            <a
              href={`tel:${storeSettings.supportPhone}`}
              className="hidden sm:flex items-center gap-1.5 hover:text-green-200 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-green-300" />
              <span>{storeSettings.supportPhone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-gray-600 p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div
              onClick={() => setViewMode('storefront')}
              className="cursor-pointer flex items-center gap-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white font-bold shadow-md shadow-green-600/30 group-hover:bg-green-700 transition-colors">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-black text-gray-900 tracking-tight block leading-none">
                  FreshMarket
                </span>
                <span className="text-[11px] font-semibold text-green-600 uppercase tracking-wider block mt-1">
                  Foodstuff & Groceries
                </span>
              </div>
            </div>
          </div>

          {/* Location Delivery Zone Selector */}
          <div className="hidden md:flex items-center relative">
            <div
              onClick={() => setIsZoneDropdownOpen(!isZoneDropdownOpen)}
              className="flex items-center gap-2 bg-green-50 hover:bg-green-100 border border-green-200 text-green-900 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all"
            >
              <MapPin className="w-4 h-4 text-green-600 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] uppercase tracking-wide text-green-700 block font-bold">
                  Deliver To
                </span>
                <span className="font-bold text-gray-900 truncate max-w-[130px] block">
                  {selectedZone ? selectedZone.name : 'Select Region'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-green-600 ml-1" />
            </div>

            {/* Zone Dropdown Menu */}
            {isZoneDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 z-50">
                <div className="text-xs font-bold text-gray-500 uppercase px-2 mb-2">
                  Select Your Community Zone
                </div>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {deliveryZones.map((zone) => (
                    <button
                      key={zone.id}
                      onClick={() => {
                        setSelectedZone(zone);
                        setIsZoneDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex flex-col gap-0.5 transition-colors ${
                        selectedZone?.id === zone.id
                          ? 'bg-green-600 text-white'
                          : 'hover:bg-gray-50 text-gray-800'
                      }`}
                    >
                      <span className="font-bold">{zone.name}</span>
                      <span
                        className={`text-[10px] ${
                          selectedZone?.id === zone.id ? 'text-green-100' : 'text-gray-500'
                        }`}
                      >
                        Delivery fee: {storeSettings.currencySymbol}
                        {zone.fee.toLocaleString()} • Est: {zone.minDeliveryTimeHours}-
                        {zone.maxDeliveryTimeHours} hrs
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:block flex-1 max-w-lg relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search foodstuff (Rice, Garri, Palm oil, Tomatoes, Yam...)"
                className="w-full bg-gray-50 border border-gray-200 rounded-full pl-11 pr-10 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Instant Search Suggestions Box */}
            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50">
                <div className="text-[11px] font-bold text-gray-400 uppercase px-3 py-1.5">
                  Suggested Foodstuff Items
                </div>
                {searchResults.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setViewingProduct(item);
                      setSearchQuery('');
                    }}
                    className="flex items-center gap-3 p-2 hover:bg-green-50 rounded-xl cursor-pointer transition-colors"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-gray-500">
                        {item.unit} • {item.category}
                      </p>
                    </div>
                    <span className="text-xs font-black text-green-700">
                      {storeSettings.currencySymbol}
                      {(item.discountPrice || item.price).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Search Button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Order Tracking Button */}
            <button
              onClick={() => setIsTrackingOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 border border-gray-200 transition-colors"
            >
              <Truck className="w-4 h-4 text-green-600" />
              <span>Track Order</span>
            </button>

            {/* Customer Account Button (Phone & OTP Verified) */}
            <button
              onClick={() => setIsUserAuthOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                currentUser
                  ? 'bg-green-50 text-green-800 border border-green-200 hover:bg-green-100'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
              }`}
              title={currentUser ? `Logged in as ${currentUser.fullName}` : 'Register / Login with Phone OTP'}
            >
              {currentUser ? (
                <>
                  <UserCheck className="w-4 h-4 text-green-600" />
                  <span className="hidden md:inline font-black max-w-[90px] truncate">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-gray-600" />
                  <span className="hidden md:inline">Sign In / Register</span>
                </>
              )}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors hidden sm:block"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 text-gray-600" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md shadow-green-600/20 transition-all active:scale-95"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-gray-900 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-green-600">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="hidden xs:inline">
                {cartSubtotal > 0
                  ? `${storeSettings.currencySymbol}${cartSubtotal.toLocaleString()}`
                  : 'Cart'}
              </span>
            </button>

            {/* Business Owner Admin Switcher Toggle */}
            <button
              onClick={() => {
                if (viewMode === 'admin') {
                  setViewMode('storefront');
                } else {
                  if (isAdminAuthenticated) {
                    setViewMode('admin');
                  } else {
                    setIsAdminLoginOpen(true);
                  }
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'admin'
                  ? 'bg-slate-900 text-amber-400 ring-2 ring-slate-900 shadow-md'
                  : 'bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100'
              }`}
              title="Secured Owner Admin Dashboard"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">
                {viewMode === 'admin' ? 'Store View' : 'Owner Admin 🔒'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="lg:hidden p-4 bg-gray-50 border-t border-gray-100">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rice, garri, oil, tomatoes..."
              className="w-full bg-white border border-gray-300 rounded-full pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-400 uppercase">Selected Delivery Area</span>
            <span className="text-xs font-bold text-green-700">{selectedZone?.name}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setIsTrackingOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 p-2.5 bg-gray-50 rounded-xl text-xs font-bold text-gray-800"
            >
              <Truck className="w-4 h-4 text-green-600" />
              <span>Track My Order</span>
            </button>

            <button
              onClick={() => {
                setViewMode('admin');
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 p-2.5 bg-amber-50 rounded-xl text-xs font-bold text-amber-900"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Admin Dashboard</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
