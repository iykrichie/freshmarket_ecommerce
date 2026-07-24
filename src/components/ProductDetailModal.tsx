import React, { useState } from 'react';
import { UnitType, ProductReview } from '../types';
import { useStore } from '../context/StoreContext';
import {
  X,
  Star,
  Plus,
  Minus,
  ShoppingBag,
  Zap,
  Heart,
  Truck,
  ShieldCheck,
  Check,
  MessageCircle,
  ThumbsUp,
} from 'lucide-react';
import { INITIAL_REVIEWS } from '../data/mockData';

export const ProductDetailModal: React.FC = () => {
  const {
    viewingProduct,
    setViewingProduct,
    addToCart,
    toggleWishlist,
    isInWishlist,
    setIsCheckoutOpen,
    products,
    selectedZone,
    storeSettings,
    showToast,
  } = useStore();

  if (!viewingProduct) return null;

  const [activeImage, setActiveImage] = useState<string>(
    viewingProduct.image || viewingProduct.images[0]
  );
  const [selectedUnit, setSelectedUnit] = useState<UnitType>(viewingProduct.unit);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews'>('details');

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>(
    INITIAL_REVIEWS.filter((r) => r.productId === viewingProduct.id)
  );
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');

  const inWishlist = isInWishlist(viewingProduct.id);

  // Pricing based on selected unit
  let currentPrice = viewingProduct.price;
  let currentDiscountPrice = viewingProduct.discountPrice;

  if (viewingProduct.availableUnits && viewingProduct.availableUnits.length > 0) {
    const matched = viewingProduct.availableUnits.find((u) => u.unit === selectedUnit);
    if (matched) {
      currentPrice = matched.price;
      currentDiscountPrice = matched.discountPrice;
    }
  }

  const effectivePrice = currentDiscountPrice || currentPrice;
  const hasDiscount = currentDiscountPrice && currentDiscountPrice < currentPrice;

  const relatedProducts = products
    .filter((p) => p.category === viewingProduct.category && p.id !== viewingProduct.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addToCart(viewingProduct, quantity, selectedUnit);
  };

  const handleBuyNow = () => {
    addToCart(viewingProduct, quantity, selectedUnit);
    setViewingProduct(null);
    setIsCheckoutOpen(true);
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewComment.trim()) return;

    const newRev: ProductReview = {
      id: 'rev-' + Date.now(),
      productId: viewingProduct.id,
      customerName: newReviewName.trim(),
      rating: newReviewRating,
      comment: newReviewComment.trim(),
      date: new Date().toISOString().split('T')[0],
      verifiedPurchase: true,
    };

    setReviews([newRev, ...reviews]);
    setNewReviewName('');
    setNewReviewComment('');
    showToast('Thank you for reviewing this foodstuff item!', 'success');
  };

  const whatsappInquiryUrl = `https://wa.me/${storeSettings.whatsappNumber}?text=${encodeURIComponent(
    `Hello FreshMarket! I am interested in buying: ${viewingProduct.name} (${selectedUnit}). Current price: ${storeSettings.currencySymbol}${effectivePrice.toLocaleString()}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Modal Close Button */}
        <button
          onClick={() => setViewingProduct(null)}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-white/80 hover:bg-white text-gray-700 shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="overflow-y-auto p-6 lg:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Product Images */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-xs">
                <img
                  src={activeImage}
                  alt={viewingProduct.name}
                  className="w-full h-full object-cover"
                />
                {hasDiscount && (
                  <span className="absolute top-3 left-3 bg-red-500 text-white font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                    Discount
                  </span>
                )}
              </div>

              {/* Thumbnails */}
              {viewingProduct.images && viewingProduct.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {viewingProduct.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        activeImage === img
                          ? 'border-green-600 ring-2 ring-green-600/30'
                          : 'border-gray-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl text-green-900 border border-green-100">
                  <ShieldCheck className="w-5 h-5 text-green-600 shrink-0" />
                  <div className="text-[11px]">
                    <span className="font-bold block">100% Guaranteed</span>
                    <span className="text-green-700">Stone-free & Fresh</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl text-amber-900 border border-amber-100">
                  <Truck className="w-5 h-5 text-amber-600 shrink-0" />
                  <div className="text-[11px]">
                    <span className="font-bold block">
                      {selectedZone ? selectedZone.name : 'Regional Zone'}
                    </span>
                    <span className="text-amber-800">Fast delivery</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Info & Controls */}
            <div className="space-y-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                    {viewingProduct.category}
                  </span>

                  <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{viewingProduct.rating.toFixed(1)}</span>
                    <span className="text-gray-400">({viewingProduct.reviewsCount} reviews)</span>
                  </div>
                </div>

                <h1 className="text-2xl font-black text-gray-900 leading-snug">
                  {viewingProduct.name}
                </h1>

                {viewingProduct.origin && (
                  <p className="text-xs text-gray-500 font-medium">
                    Origin: <span className="font-bold text-gray-800">{viewingProduct.origin}</span>
                  </p>
                )}

                {/* Price Display */}
                <div className="flex items-baseline gap-3 pt-1">
                  <span className="text-3xl font-black text-gray-900">
                    {storeSettings.currencySymbol}
                    {effectivePrice.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <span className="text-base font-bold text-gray-400 line-through">
                      {storeSettings.currencySymbol}
                      {currentPrice.toLocaleString()}
                    </span>
                  )}
                  <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-md ml-auto">
                    Per {selectedUnit}
                  </span>
                </div>

                {/* Available Unit Switcher */}
                {viewingProduct.availableUnits && viewingProduct.availableUnits.length > 1 && (
                  <div className="space-y-1.5 pt-2">
                    <label className="text-xs font-bold text-gray-700 block">
                      Select Bag / Unit Size:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {viewingProduct.availableUnits.map((u) => (
                        <button
                          key={u.unit}
                          onClick={() => setSelectedUnit(u.unit)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                            selectedUnit === u.unit
                              ? 'bg-green-600 text-white border-green-600 shadow-sm'
                              : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {u.unit} - {storeSettings.currencySymbol}
                          {(u.discountPrice || u.price).toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity Controls */}
                <div className="flex items-center gap-4 pt-3">
                  <span className="text-xs font-bold text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 p-1">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-1.5 hover:bg-white rounded-lg text-gray-600 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-bold text-sm text-gray-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1.5 hover:bg-white rounded-lg text-gray-600 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-xs text-gray-500 font-medium">
                    Subtotal:{' '}
                    <strong className="text-gray-900">
                      {storeSettings.currencySymbol}
                      {(effectivePrice * quantity).toLocaleString()}
                    </strong>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-sm shrink-0">
                    ✈️
                  </div>
                  <div className="text-xs">
                    <p className="font-bold text-amber-950">Diaspora & Export Service Available</p>
                    <p className="text-[11px] text-amber-800">
                      Send as a care package to relatives in London, UK nationwide, Europe, or USA with custom gift notes.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-bold text-sm shadow-md shadow-green-600/20 transition-all active:scale-95"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    onClick={handleBuyNow}
                    className="flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 text-gray-900 py-3 px-4 rounded-xl font-bold text-sm shadow-sm transition-all active:scale-95"
                  >
                    <Zap className="w-4 h-4 fill-gray-900" />
                    <span>Buy Now</span>
                  </button>
                </div>

                <div className="flex gap-2">
                  <a
                    href={whatsappInquiryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 py-2.5 px-3 rounded-xl font-bold text-xs border border-emerald-200 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Ask Store Owner on WhatsApp</span>
                  </a>

                  <button
                    onClick={() => toggleWishlist(viewingProduct)}
                    className={`p-2.5 rounded-xl border transition-colors ${
                      inWishlist
                        ? 'bg-red-50 text-red-500 border-red-200'
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${inWishlist ? 'fill-red-500' : ''}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description & Reviews Tabs */}
          <div className="border-t border-gray-100 pt-6">
            <div className="flex border-b border-gray-100 mb-4 gap-6">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Product Description & Specs
              </button>

              <button
                onClick={() => setActiveTab('reviews')}
                className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                  activeTab === 'reviews'
                    ? 'border-green-600 text-green-700'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                Customer Reviews ({reviews.length})
              </button>
            </div>

            {activeTab === 'details' ? (
              <div className="text-sm text-gray-600 leading-relaxed space-y-3">
                <p>{viewingProduct.description}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs">
                  <div>
                    <span className="text-gray-400 block font-semibold">Packaging Unit</span>
                    <span className="font-bold text-gray-800">{selectedUnit}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Stock Availability</span>
                    <span className="font-bold text-gray-800">{viewingProduct.stock} items available</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-semibold">Quality Level</span>
                    <span className="font-bold text-green-700">100% Grade A Selected</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Existing Reviews */}
                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">
                      No reviews yet for this product. Be the first customer to leave a review!
                    </p>
                  ) : (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-gray-900">{rev.customerName}</span>
                          <span className="text-[10px] text-gray-400">{rev.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Review Form */}
                <form
                  onSubmit={handleAddReview}
                  className="p-4 bg-green-50/50 rounded-2xl border border-green-100 space-y-3"
                >
                  <h4 className="font-bold text-xs text-green-900">Leave a Product Review</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={newReviewName}
                      onChange={(e) => setNewReviewName(e.target.value)}
                      required
                      className="bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />

                    <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2">
                      <span className="text-xs text-gray-500 font-semibold">Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReviewRating(star)}
                            className="p-0.5"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                star <= newReviewRating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <textarea
                    placeholder="Describe your experience with this foodstuff item..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    rows={2}
                    required
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />

                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors"
                  >
                    Submit Review
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Related Foodstuff Products */}
          {relatedProducts.length > 0 && (
            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold text-sm text-gray-900 mb-3">
                Frequently Bought Together
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      setViewingProduct(rel);
                      setActiveImage(rel.image);
                    }}
                    className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:border-green-300 transition-all text-center group"
                  >
                    <img
                      src={rel.image}
                      alt={rel.name}
                      className="w-full h-20 object-cover rounded-xl mb-2 group-hover:scale-105 transition-transform"
                    />
                    <p className="text-xs font-bold text-gray-900 line-clamp-1">{rel.name}</p>
                    <p className="text-[11px] font-black text-green-700 mt-0.5">
                      {storeSettings.currencySymbol}
                      {(rel.discountPrice || rel.price).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
