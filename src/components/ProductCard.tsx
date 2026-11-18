import React, { useState } from 'react';
import { Product, UnitType } from '../types';
import { useStore } from '../context/StoreContext';
import { Heart, ShoppingBag, Star, Eye, Zap, Check } from 'lucide-react';
import { ResilientImage } from './ResilientImage';

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
  const hasDiscount = Boolean(currentDiscountPrice && currentDiscountPrice < currentPrice);
  const discountPercent = hasDiscount
    ? Math.round(((currentPrice - (currentDiscountPrice || 0)) / currentPrice) * 100)
    : 0;

  const itemInCart = cart.find(
    (item) => item.product.id === product.id && item.selectedUnit === selectedUnit
  );

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock <= 0;
  const isExport =
    product.category === 'Diaspora & Export Packages' ||
    product.tags?.includes('diaspora') ||
    product.tags?.includes('export');

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    addToCart(product, 1, selectedUnit);
    setIsCheckoutOpen(true);
  };

  // Show at most 1 concise top-left tag to avoid badge spam
  let cornerTag: { label: string; style: string } | null = null;
  if (isOutOfStock) {
    cornerTag = { label: 'Out of Stock', style: 'bg-stone-900/90 text-white' };
  } else if (hasDiscount && discountPercent > 0) {
    cornerTag = { label: `Save ${discountPercent}%`, style: 'bg-rose-600 text-white' };
  } else if (isExport) {
    cornerTag = { label: 'Export Ready', style: 'bg-emerald-800 text-white' };
  } else if (product.isBestSeller) {
    cornerTag = { label: 'Best Seller', style: 'bg-amber-400 text-stone-950' };
  }

  return (
    <article
      onClick={() => setViewingProduct(product)}
      className="group relative bg-white rounded-2xl border border-stone-200/80 hover:border-emerald-600/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Image Stage (4:3 neutral surface) */}
      <div className="relative aspect-4/3 overflow-hidden bg-stone-100">
        <ResilientImage
          src={product.image}
          alt={product.name}
          fallbackLabel={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
        />

        {/* Single Restraint Corner Tag */}
        {cornerTag && (
          <span
            className={`absolute top-3 left-3 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-tight shadow-2xs ${cornerTag.style}`}
          >
            {cornerTag.label}
          </span>
        )}

        {/* Wishlist Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-xs transition-colors ${
            inWishlist
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white/90 hover:bg-white text-stone-600 shadow-2xs'
          }`}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Subtle Quick View Affordance on Hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-end pointer-events-none">
          <span className="inline-flex items-center gap-1.5 bg-white/95 text-stone-900 font-semibold text-xs px-3 py-1.5 rounded-lg shadow-xs">
            <Eye className="w-3.5 h-3.5 text-emerald-700" />
            <span>Quick View</span>
          </span>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          {/* Unboxed Metadata Line */}
          <div className="flex items-center justify-between gap-2 text-xs text-stone-500">
            <span className="truncate font-medium text-emerald-800">{product.category}</span>
            <span className="inline-flex items-center gap-1 shrink-0 font-medium text-stone-600 tabular-nums">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-stone-400">({product.reviewsCount})</span>
            </span>
          </div>

          {/* Product Title */}
          <h3 className="font-display font-semibold text-[15px] text-stone-900 line-clamp-2 leading-snug group-hover:text-emerald-800 transition-colors">
            {product.name}
          </h3>

          {/* Origin & Stock State (Unboxed text with middot separator) */}
          <p className="text-xs text-stone-500 truncate">
            <span>{product.origin || product.weight || 'Fresh Quality'}</span>
            <span aria-hidden="true"> · </span>
            <span className={isOutOfStock ? 'text-rose-600 font-medium' : isLowStock ? 'text-amber-700 font-medium' : 'text-emerald-700 font-medium'}>
              {isOutOfStock
                ? 'Sold out'
                : isLowStock
                ? `Only ${product.stock} left`
                : 'In stock'}
            </span>
          </p>

          {/* Unit Selection Controls */}
          {product.availableUnits && product.availableUnits.length > 1 && (
            <div
              className="pt-1 flex flex-wrap gap-1.5"
              onClick={(e) => e.stopPropagation()}
            >
              {product.availableUnits.map((u) => (
                <button
                  key={u.unit}
                  onClick={() => setSelectedUnit(u.unit)}
                  className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-colors border whitespace-nowrap ${
                    selectedUnit === u.unit
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {u.unit}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price Baseline & Actions */}
        <div className="pt-3 border-t border-stone-100 space-y-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-lg font-bold text-stone-950 tabular-nums">
                {storeSettings.currencySymbol}
                {effectivePrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs text-stone-400 line-through tabular-nums">
                  {storeSettings.currencySymbol}
                  {currentPrice.toLocaleString()}
                </span>
              )}
            </div>
            <span className="text-xs font-medium text-stone-500 truncate max-w-[100px]">
              / {selectedUnit}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              disabled={isOutOfStock}
              onClick={() => addToCart(product, 1, selectedUnit)}
              className={`flex items-center justify-center gap-1.5 min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                isOutOfStock
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : itemInCart
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-emerald-700 text-white hover:bg-emerald-800'
              }`}
            >
              {itemInCart ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span>Added ({itemInCart.quantity})</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                  <span>Add Cart</span>
                </>
              )}
            </button>

            <button
              disabled={isOutOfStock}
              onClick={handleBuyNow}
              className={`flex items-center justify-center gap-1 min-h-[40px] px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                isOutOfStock
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-amber-400 text-stone-950 hover:bg-amber-500'
              }`}
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
