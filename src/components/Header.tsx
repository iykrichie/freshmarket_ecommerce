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
import { ResilientImage } from './ResilientImage';

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

  const searchResults = searchQuery.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 6)
    : [];

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80">
      {/* Slim Announcement & Contact Strip */}
      <div className="bg-emerald-900 text-emerald-50 text-xs py-1.5 px-4">
        <div className="max-w-[1440px] mx-auto px-0 sm:px-2 lg:px-6 flex items-center justify-between gap-4">
          <p className="font-medium truncate">
            {storeSettings.announcementText ||
              'Same-day local doorstep delivery & international air export parcels worldwide!'}
          </p>

          <div className="flex items-center gap-3 shrink-0">
            {(storeSettings.facebookUrl ||
              storeSettings.instagramUrl ||
              storeSettings.twitterUrl ||
              storeSettings.tiktokUrl) && (
              <div className="hidden sm:flex items-center gap-2 border-r border-emerald-700/80 pr-3">
                {storeSettings.facebookUrl && (
                  <a
                    href={storeSettings.facebookUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white text-emerald-200 transition-colors"
                    title={`Follow ${storeSettings.storeName} on Facebook`}
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}

                {storeSettings.instagramUrl && (
                  <a
                    href={storeSettings.instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white text-emerald-200 transition-colors"
                    title={`Follow ${storeSettings.storeName} on Instagram`}
                  >
                    <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </a>
                )}

                {storeSettings.twitterUrl && (
                  <a
                    href={storeSettings.twitterUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white text-emerald-200 transition-colors text-[11px] font-bold"
                    title={`Follow ${storeSettings.storeName} on X`}
                  >
                    𝕏
                  </a>
                )}

                {storeSettings.tiktokUrl && (
                  <a
                    href={storeSettings.tiktokUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white text-emerald-200 transition-colors text-[11px] font-bold"
                    title={`Follow ${storeSettings.storeName} on TikTok`}
                  >
                    TikTok
                  </a>
                )}
              </div>
            )}

            <a
              href={`https://wa.me/${storeSettings.whatsappNumber}?text=${encodeURIComponent(
                `Hello ${storeSettings.storeName}! I would like to inquire about an order.`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-white transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-300" />
              <span>WhatsApp</span>
            </a>

            <a
              href={`tel:${storeSettings.supportPhone}`}
              className="hidden md:flex items-center gap-1 hover:text-white transition-colors whitespace-nowrap tabular-nums"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-300" />
              <span>{storeSettings.supportPhone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-stone-700 p-2 hover:bg-stone-100 rounded-xl"
              aria-label="Toggle mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={() => setViewMode('storefront')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white font-bold shadow-2xs group-hover:bg-emerald-800 transition-colors overflow-hidden shrink-0">
                {storeSettings.logoUrl ? (
                  <img
                    src={storeSettings.logoUrl}
                    alt={storeSettings.storeName}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover bg-white"
                  />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
              </div>
              <span className="font-display text-lg font-extrabold text-stone-950 tracking-tight whitespace-nowrap">
                {storeSettings.storeName}
              </span>
            </button>
          </div>

          {/* Location Delivery Zone Selector */}
          <div className="hidden md:flex items-center relative shrink-0">
            <button
              onClick={() => setIsZoneDropdownOpen(!isZoneDropdownOpen)}
              className="flex items-center gap-2 bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 px-3 py-2 rounded-xl text-xs font-medium transition-colors"
            >
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-semibold text-stone-900 truncate max-w-[140px]">
                {selectedZone ? selectedZone.name : 'Select Region'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-stone-500 shrink-0" />
            </button>

            {isZoneDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200 p-3 z-50">
                <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider px-2 mb-2">
                  Select Delivery Region
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
                          ? 'bg-emerald-700 text-white'
                          : 'hover:bg-stone-50 text-stone-800'
                      }`}
                    >
                      <span className="font-semibold">{zone.name}</span>
                      <span
                        className={`text-[11px] tabular-nums ${
                          selectedZone?.id === zone.id ? 'text-emerald-100' : 'text-stone-500'
                        }`}
                      >
                        {storeSettings.currencySymbol}
                        {zone.fee.toLocaleString()} · {zone.minDeliveryTimeHours}–
                        {zone.maxDeliveryTimeHours} hrs
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:block flex-1 max-w-md xl:max-w-lg relative">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rice, garri, palm oil, spices..."
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-9 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-700 focus:bg-white transition-colors"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50">
                <div className="text-[11px] font-bold text-stone-400 uppercase px-3 py-1.5">
                  Matching Items
                </div>
                {searchResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setViewingProduct(item);
                      setSearchQuery('');
                    }}
                    className="w-full text-left flex items-center gap-3 p-2 hover:bg-stone-50 rounded-xl transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-stone-100 shrink-0">
                      <ResilientImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-stone-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-stone-500">
                        {item.unit} · {item.category}
                      </p>
                    </div>
                    <span className="text-xs font-bold font-mono tabular-nums text-emerald-800 shrink-0">
                      {storeSettings.currencySymbol}
                      {(item.discountPrice || item.price).toLocaleString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Controls Right */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden p-2 text-stone-700 hover:bg-stone-100 rounded-xl"
              aria-label="Search store"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsTrackingOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 hover:bg-stone-100 border border-stone-200 transition-colors whitespace-nowrap shrink-0"
            >
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>Track Order</span>
            </button>

            <button
              onClick={() => setIsUserAuthOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 border ${
                currentUser
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-white text-stone-800 hover:bg-stone-50 border-stone-200'
              }`}
              title={currentUser ? `Signed in as ${currentUser.fullName}` : 'Sign In or Register'}
            >
              {currentUser ? (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-700" />
                  <span className="hidden md:inline max-w-[90px] truncate">
                    {currentUser.fullName.split(' ')[0]}
                  </span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-stone-600" />
                  <span className="hidden md:inline">Account</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-stone-700 hover:bg-stone-100 rounded-xl transition-colors hidden sm:inline-flex"
              aria-label="Wishlist"
              title="Saved Wishlist"
            >
              <Heart className="w-5 h-5 text-stone-600" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs transition-colors whitespace-nowrap shrink-0"
            >
              <div className="relative">
                <ShoppingBag className="w-4 h-4" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-stone-950 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center tabular-nums">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <span className="hidden xs:inline tabular-nums">
                {cartSubtotal > 0
                  ? `${storeSettings.currencySymbol}${cartSubtotal.toLocaleString()}`
                  : 'Cart'}
              </span>
            </button>

            <button
              onClick={() => {
                if (viewMode === 'admin') {
                  setViewMode('storefront');
                } else if (isAdminAuthenticated) {
                  setViewMode('admin');
                } else {
                  setIsAdminLoginOpen(true);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                viewMode === 'admin'
                  ? 'bg-stone-900 text-amber-300'
                  : 'bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100'
              }`}
              title="Owner Admin Portal"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">
                {viewMode === 'admin' ? 'Store View' : 'Admin'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {isSearchOpen && (
        <div className="lg:hidden p-3 bg-stone-50 border-t border-stone-200">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rice, garri, oil, tomatoes..."
              className="w-full bg-white border border-stone-300 rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <button
              onClick={() => {
                setIsSearchOpen(false);
                setSearchQuery('');
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400"
              aria-label="Close search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-stone-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-stone-100">
            <span className="text-xs font-semibold text-stone-500">Delivery Area</span>
            <span className="text-xs font-bold text-emerald-800">{selectedZone?.name}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setIsTrackingOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 p-2.5 bg-stone-50 rounded-xl text-xs font-semibold text-stone-800"
            >
              <Truck className="w-4 h-4 text-emerald-700" />
              <span>Track Order</span>
            </button>

            <button
              onClick={() => {
                if (isAdminAuthenticated) {
                  setViewMode('admin');
                } else {
                  setIsAdminLoginOpen(true);
                }
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-2 p-2.5 bg-amber-50 rounded-xl text-xs font-semibold text-amber-900"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Admin Portal</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
