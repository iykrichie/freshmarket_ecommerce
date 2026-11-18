import React, { useState, useEffect, useMemo } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategorySidebar, QuickFilter } from './components/CategorySidebar';
import { ProductCard } from './components/ProductCard';
import { WhyShopWithUs } from './components/WhyShopWithUs';
import { Footer } from './components/Footer';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { UserAuthModal } from './components/UserAuthModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { WhatsAppOrderButton } from './components/WhatsAppOrderButton';
import { ToastContainer } from './components/ToastContainer';
import { AdminLayout } from './components/admin/AdminLayout';
import { SetupWizard } from './components/SetupWizard';
import { ArrowUpDown, Tag, PackageSearch, RotateCcw, Rocket, X } from 'lucide-react';

const DealCountdownBanner: React.FC<{
  dealCount: number;
  onViewDeals: () => void;
}> = React.memo(({ dealCount, onViewDeals }) => {
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-amber-50/90 border border-amber-200/80">
      <div className="flex items-center gap-3 min-w-0">
        <Tag className="w-4 h-4 text-amber-700 shrink-0" />
        <p className="text-xs sm:text-sm font-medium text-stone-800 truncate">
          <span className="font-bold text-stone-950">Flash Market Deals:</span>{' '}
          <span className="tabular-nums">{dealCount}</span> staple items on limited-time discount
        </p>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
        <span className="font-mono text-xs font-semibold text-amber-900 tabular-nums">
          Ends in {String(timeLeft.hours).padStart(2, '0')}h :{' '}
          {String(timeLeft.minutes).padStart(2, '0')}m :{' '}
          {String(timeLeft.seconds).padStart(2, '0')}s
        </span>
        <button
          onClick={onViewDeals}
          className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0"
        >
          View Deals
        </button>
      </div>
    </div>
  );
});

function StorefrontContent() {
  const {
    products,
    categories,
    selectedCategory,
    searchQuery,
    setSelectedCategory,
    setSearchQuery,
    isUserAuthOpen,
    setIsUserAuthOpen,
    subscription,
    setIsSetupWizardOpen,
    isSetupBannerDismissed,
    dismissSetupBanner,
  } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');

  const dealProductsCount = useMemo(
    () =>
      products.filter((p) => p.isDailyDeal || (p.discountPrice && p.discountPrice < p.price))
        .length,
    [products]
  );

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const list = products.filter((p) => {
      const matchesSearch =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query) ||
        p.tags?.some((t) => t.toLowerCase().includes(query));

      const matchesCat = !selectedCategory || p.category === selectedCategory;

      const matchesQuick =
        quickFilter === 'all'
          ? true
          : quickFilter === 'deals'
          ? Boolean(p.isDailyDeal || (p.discountPrice && p.discountPrice < p.price))
          : quickFilter === 'bestsellers'
          ? Boolean(p.isBestSeller)
          : p.stock > 0;

      return matchesSearch && matchesCat && matchesQuick;
    });

    return [...list].sort((a, b) => {
      if (sortBy === 'price-low') {
        return (a.discountPrice || a.price) - (b.discountPrice || b.price);
      }
      if (sortBy === 'price-high') {
        return (b.discountPrice || b.price) - (a.discountPrice || a.price);
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [products, searchQuery, selectedCategory, quickFilter, sortBy]);

  const activeCategoryObj = selectedCategory
    ? categories.find((c) => c.name === selectedCategory)
    : null;

  const catalogTitle = selectedCategory
    ? selectedCategory
    : quickFilter === 'deals'
    ? 'Flash Deals & Discounts'
    : quickFilter === 'bestsellers'
    ? 'Customer Best Sellers'
    : quickFilter === 'in_stock'
    ? 'In-Stock Ready Items'
    : 'All Foodstuff Items';

  const resetAllFilters = () => {
    setSelectedCategory(null);
    setQuickFilter('all');
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {!subscription.setupCompleted && !isSetupBannerDismissed && (
        <div className="bg-stone-950 text-stone-100 border-b border-stone-800 px-4 py-2 text-xs">
          <div className="max-w-[1440px] mx-auto px-0 sm:px-2 lg:px-6 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Rocket className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">
                <strong>New Store Package Ready:</strong> Complete the 1-time initialization wizard to customize your brand, license, currency, and admin login.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsSetupWizardOpen(true)}
                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors whitespace-nowrap"
              >
                Launch Setup Wizard
              </button>
              <button
                type="button"
                onClick={dismissSetupBanner}
                className="p-1 text-stone-400 hover:text-white"
                aria-label="Dismiss setup notice"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Header />

      <main className="flex-1">
        <HeroBanner />

        {/* Two-Column Storefront Workspace: Left Category Sidebar + Fluid Catalog Grid */}
        <section
          id="catalog"
          className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 lg:py-10"
        >
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <CategorySidebar quickFilter={quickFilter} setQuickFilter={setQuickFilter} />

            <div className="flex-1 min-w-0 w-full space-y-6">
              {dealProductsCount > 0 &&
                quickFilter !== 'deals' &&
                !selectedCategory &&
                !searchQuery && (
                  <DealCountdownBanner
                    dealCount={dealProductsCount}
                    onViewDeals={() => setQuickFilter('deals')}
                  />
                )}

              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200/80 pb-4">
                <div className="space-y-1 min-w-0">
                  <h2 className="font-display text-2xl font-bold text-stone-950 tracking-tight text-balance">
                    {catalogTitle}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500">
                    <span className="font-semibold text-stone-700 tabular-nums">
                      {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
                    </span>
                    <span aria-hidden="true"> · </span>
                    <span>
                      {searchQuery
                        ? `Search results for "${searchQuery}"`
                        : activeCategoryObj?.description ||
                          'Stone-free grains, unadulterated oils, peppers, tubers & export hampers'}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {(selectedCategory || quickFilter !== 'all' || searchQuery) && (
                    <button
                      onClick={resetAllFilters}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors whitespace-nowrap shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Clear Filters</span>
                    </button>
                  )}

                  <label className="inline-flex items-center gap-2 bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700">
                    <ArrowUpDown className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span className="sr-only">Sort products</span>
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(e.target.value as 'featured' | 'price-low' | 'price-high' | 'rating')
                      }
                      className="bg-transparent text-xs font-semibold text-stone-900 focus:outline-none cursor-pointer"
                    >
                      <option value="featured">Featured First</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                  </label>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-stone-200/80 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                    <PackageSearch className="w-7 h-7" />
                  </div>
                  <h3 className="font-display font-bold text-stone-900 text-base">
                    No foodstuff items match this view
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
                    Try another search term like "rice", "garri", or "palm oil", or reset your active category and filters.
                  </p>
                  <button
                    onClick={resetAllFilters}
                    className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Show All Items
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 xl:gap-6">
                  {filtered.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <WhyShopWithUs />
      </main>

      <Footer />

      <ProductDetailModal />
      <CartDrawer />
      <CheckoutModal />
      <OrderTrackingModal />
      <UserAuthModal isOpen={isUserAuthOpen} onClose={() => setIsUserAuthOpen(false)} />
      <WhatsAppOrderButton />
      <ToastContainer />
    </div>
  );
}

function MainApp() {
  const {
    viewMode,
    setViewMode,
    isAdminAuthenticated,
    isAdminLoginOpen,
    setIsAdminLoginOpen,
  } = useStore();

  if (viewMode === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <>
          <StorefrontContent />
          <AdminLoginModal
            isOpen={true}
            onClose={() => setViewMode('storefront')}
            onSuccess={() => {}}
          />
        </>
      );
    }
    return (
      <>
        <AdminLayout />
        <SetupWizard />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <StorefrontContent />
      <SetupWizard />
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={() => setViewMode('admin')}
      />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
