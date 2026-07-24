import React, { useState } from 'react';
import { Product, UnitType } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, ShoppingBag, Star, Eye, Zap, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const {
    addToCart,
    cart,
    toggleWishlist,
    isInWishlist,
    setViewingProduct,
    setIsCheckoutOpen,
    storeSettings,
  } = useStore();

  const [selectedUnit, setSelectedUnit] = useState<UnitType>(product.unit);

  const inWishlist = isInWishlist(product.id);

  // Determine pricing based on unit selection
  let currentPrice = product.price;
  let currentDiscountPrice = product.discountPrice;

  if (product.availableUnits && product.availableUnits.length > 0) {
    const matchedUnit = product.availableUnits.find((u) => u.unit === selectedUnit);
    if (matchedUnit) {
      currentPrice = matchedUnit.price;
      currentDiscountPrice = matchedUnit.discountPrice;
    }
  }

  const effectivePrice = currentDiscountPrice || currentPrice;
  const hasDiscount = currentDiscountPrice && currentDiscountPrice < currentPrice;
  const discountPercent = hasDiscount
    ? Math.round(((currentPrice - currentDiscountPrice) / currentPrice) * 100)
    : 0;

  // Check if item is in cart
  const itemInCart = cart.find(
    (item) => item.product.id === product.id && item.selectedUnit === selectedUnit
  );

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock <= 0;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1, selectedUnit);
    setIsCheckoutOpen(true);
  };

  return (
    <div
      onClick={() => setViewingProduct(product)}
      className="group relative bg-white rounded-3xl border border-gray-100 shadow-xs hover:shadow-xl hover:border-green-200 transition-all duration-300 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Top Image Container */}
      <div className="relative aspect-4/3 overflow-hidden bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {(product.category === 'Diaspora & Export Packages' || product.tags?.includes('diaspora') || product.tags?.includes('export')) && (
            <span className="bg-emerald-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              ✈️ Export Parcel
            </span>
          )}
          {hasDiscount && (
            <span className="bg-red-500 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Save {discountPercent}%
            </span>
          )}
          {product.isBestSeller && (
            <span className="bg-amber-400 text-gray-900 font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Best Seller
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 ${
            inWishlist
              ? 'bg-red-50 text-red-500 border border-red-200 shadow-sm'
              : 'bg-white/80 hover:bg-white text-gray-600 shadow-sm'
          }`}
          title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-red-500' : ''}`} />
        </button>

        {/* Stock Status Pill */}
        <div className="absolute bottom-3 left-3 z-10">
          {isOutOfStock ? (
            <span className="bg-gray-900/80 text-white font-bold text-[10px] px-2.5 py-1 rounded-full backdrop-blur-md">
              Out of Stock
            </span>
          ) : isLowStock ? (
            <span className="bg-amber-500/90 text-white font-bold text-[10px] px-2.5 py-1 rounded-full backdrop-blur-md animate-pulse">
              Only {product.stock} left
            </span>
          ) : (
            <span className="bg-emerald-600/90 text-white font-medium text-[10px] px-2.5 py-1 rounded-full backdrop-blur-md">
              In Stock
            </span>
          )}
        </div>

        {/* Quick View Hover Button */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/90 text-gray-900 font-bold text-xs px-3.5 py-2 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
            <Eye className="w-4 h-4 text-green-600" />
            Quick View
          </span>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
            <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded-md">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-gray-400">({product.reviewsCount})</span>
            </div>
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-green-700 transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Origin / Weight subtitle */}
          <p className="text-[11px] text-gray-400 font-medium truncate">
            {product.origin ? `Origin: ${product.origin}` : product.weight || 'Fresh Quality'}
          </p>

          {/* Available Units Selection (if multiple) */}
          {product.availableUnits && product.availableUnits.length > 1 && (
            <div
              className="pt-1 flex flex-wrap gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {product.availableUnits.map((u) => (
                <button
                  key={u.unit}
                  onClick={() => setSelectedUnit(u.unit)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-colors border ${
                    selectedUnit === u.unit
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {u.unit}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pricing & Actions */}
        <div className="pt-2 border-t border-gray-100 space-y-2">
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-black text-gray-900">
                {storeSettings.currencySymbol}
                {effectivePrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs font-semibold text-gray-400 line-through">
                  {storeSettings.currencySymbol}
                  {currentPrice.toLocaleString()}
                </span>
              )}
            </div>

            <span className="text-[10px] font-bold text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded-md">
              {selectedUnit}
            </span>
          </div>

          {/* Buttons Row */}
          <div className="grid grid-cols-2 gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
            <button
              disabled={isOutOfStock}
              onClick={() => addToCart(product, 1, selectedUnit)}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : itemInCart
                  ? 'bg-green-100 text-green-800 border border-green-300'
                  : 'bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-sm shadow-green-600/20'
              }`}
            >
              {itemInCart ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-700" />
                  <span>Added ({itemInCart.quantity})</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Add Cart</span>
                </>
              )}
            </button>

            <button
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className={`flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-amber-400 text-gray-900 hover:bg-amber-500 active:scale-95 shadow-xs'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-gray-900" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
