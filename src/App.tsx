import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { CategoryGrid } from './components/CategoryGrid';
import { DailyDealsSection } from './components/DailyDealsSection';
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
import { Sparkles, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

function StorefrontContent() {
  const {
    products,
    selectedCategory,
    searchQuery,
    setSelectedCategory,
    isUserAuthOpen,
    setIsUserAuthOpen,
  } = useStore();

  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');

  // Filter products by search and category
  let filtered = products.filter((p) => {
    const matchesSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = !selectedCategory || p.category === selectedCategory;

    return matchesSearch && matchesCat;
  });

  // Sort products
  filtered = [...filtered].sort((a, b) => {
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

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col font-sans selection:bg-green-100 selection:text-green-900">
      <Header />

      <main className="flex-1">
        <HeroBanner />

        <CategoryGrid />

        <DailyDealsSection />

        {/* Catalog Grid Section */}
        <section id="catalog" className="my-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-4">
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                <span>{selectedCategory ? selectedCategory : 'Fresh Foodstuff Catalog'}</span>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-0.5 rounded-full">
                  {filtered.length} items
                </span>
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {searchQuery
                  ? `Showing search results for "${searchQuery}"`
                  : selectedCategory
                  ? `Showing fresh items under ${selectedCategory}`
                  : 'Stone-free grains, unadulterated oils, peppers, yams & frozen foods'}
              </p>
            </div>

            {/* Sort & Controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-green-600" />
                <span>Sort By:</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {filtered.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-xs space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-green-50 text-green-600 flex items-center justify-center mx-auto font-bold">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="font-black text-gray-900 text-base">No foodstuff items match your search</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Try searching for different terms like "rice", "garri", "palm oil", or clear your filter.
              </p>
              <button
                onClick={() => setSelectedCategory(null)}
                className="bg-green-600 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>

        <WhyShopWithUs />
      </main>

      <Footer />

      {/* Drawers & Modals */}
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
    isUserAuthOpen,
    setIsUserAuthOpen,
  } = useStore();

  if (viewMode === 'admin') {
    if (!isAdminAuthenticated) {
      return (
        <>
          <StorefrontContent />
          <AdminLoginModal
            isOpen={true}
            onClose={() => setViewMode('customer')}
            onSuccess={() => {}}
          />
        </>
      );
    }
    return (
      <>
        <AdminLayout />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <StorefrontContent />
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
