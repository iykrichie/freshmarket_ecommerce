import React, { useState, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { compressImageFile, matchFilenameToProduct } from '../../utils/imageProcessor';
import {
  X,
  Images,
  Upload,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface BulkImageItem {
  id: string;
  filename: string;
  dataUrl: string;
  targetProductId: string;
  mode: 'primary' | 'gallery';
  autoMatched: boolean;
}

interface BulkImageManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkImageManagerModal: React.FC<BulkImageManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { products, bulkUpsertInventory, showToast } = useStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<BulkImageItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    setIsProcessing(true);
    const nextItems: BulkImageItem[] = [];

    for (const file of Array.from(fileList)) {
      if (!file.type.startsWith('image/')) continue;
      try {
        const compressed = await compressImageFile(file);
        const matched = matchFilenameToProduct(file.name, products);
        nextItems.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          filename: file.name,
          dataUrl: compressed,
          targetProductId: matched?.id || '',
          mode: 'primary',
          autoMatched: Boolean(matched),
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : `Failed to load ${file.name}`;
        showToast(msg, 'error');
      }
    }

    setItems((prev) => [...prev, ...nextItems]);
    setIsProcessing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpdateTarget = (itemId: string, productId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, targetProductId: productId, autoMatched: false }
          : item
      )
    );
  };

  const handleUpdateMode = (itemId: string, mode: 'primary' | 'gallery') => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, mode } : item))
    );
  };

  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const matchedCount = items.filter((i) => i.targetProductId !== '').length;
  const unmatchedCount = items.length - matchedCount;

  const handleApplyImages = () => {
    const productMap = new Map<string, Product>();

    for (const item of items) {
      if (!item.targetProductId) continue;
      const base =
        productMap.get(item.targetProductId) ||
        products.find((p) => p.id === item.targetProductId);
      if (!base) continue;

      const existingGallery = base.images && base.images.length > 0 ? base.images : [base.image];

      if (item.mode === 'primary') {
        const updatedGallery = Array.from(
          new Set([item.dataUrl, ...existingGallery.filter((u) => u !== item.dataUrl)])
        );
        productMap.set(base.id, {
          ...base,
          image: item.dataUrl,
          images: updatedGallery,
        });
      } else {
        const updatedGallery = Array.from(new Set([...existingGallery, item.dataUrl]));
        productMap.set(base.id, {
          ...base,
          images: updatedGallery,
        });
      }
    }

    const updatedProducts = Array.from(productMap.values());
    if (updatedProducts.length === 0) {
      showToast('Assign at least one image to a product before applying.', 'info');
      return;
    }

    bulkUpsertInventory(updatedProducts, []);
    showToast(`Updated images for ${updatedProducts.length} product(s)!`, 'success');
    setItems([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-emerald-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Images className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base sm:text-lg text-gray-900">
                Bulk Product Image Uploader
              </h3>
              <p className="text-xs text-gray-500">
                Upload multiple product photos at once. Name files with product IDs or names (e.g.{' '}
                <code className="bg-emerald-100 px-1 rounded">prod-1.jpg</code> or{' '}
                <code className="bg-emerald-100 px-1 rounded">ijebu-garri.png</code>) to auto-match.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-xl transition-colors"
            aria-label="Close bulk image uploader"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-emerald-600 bg-emerald-50'
                : 'border-gray-300 hover:border-emerald-500 hover:bg-gray-50/80'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2.5">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-sm font-black text-gray-900">
              {isProcessing
                ? 'Optimizing & matching images...'
                : 'Drop multiple product images here, or click to select'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Supports JPG, PNG, WebP — automatically resized and compressed for fast store loading.
            </p>
          </div>

          {/* Mapping List */}
          {items.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    {matchedCount} Assigned
                  </span>
                  {unmatchedCount > 0 && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      {unmatchedCount} Unassigned
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setItems([])}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  Clear All
                </button>
              </div>

              <div className="border border-gray-200 rounded-2xl divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 flex flex-col sm:flex-row sm:items-center gap-3 bg-white hover:bg-gray-50/70"
                  >
                    <img
                      src={item.dataUrl}
                      alt={item.filename}
                      className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0"
                    />

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900 truncate">
                          {item.filename}
                        </span>
                        {item.autoMatched && (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">
                            <Sparkles className="w-3 h-3" />
                            Auto-matched
                          </span>
                        )}
                      </div>

                      <select
                        value={item.targetProductId}
                        onChange={(e) => handleUpdateTarget(item.id, e.target.value)}
                        className={`w-full border rounded-xl px-3 py-1.5 text-xs font-bold ${
                          item.targetProductId
                            ? 'bg-white border-gray-200 text-gray-900'
                            : 'bg-amber-50 border-amber-300 text-amber-900'
                        }`}
                      >
                        <option value="">-- Select target product --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.id})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={item.mode}
                        onChange={(e) =>
                          handleUpdateMode(item.id, e.target.value as 'primary' | 'gallery')
                        }
                        className="bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-gray-800"
                      >
                        <option value="primary">Set as Primary Cover</option>
                        <option value="gallery">Add to Gallery</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50/70 flex items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            {matchedCount > 0
              ? `Ready to update images for ${matchedCount} photo assignment(s).`
              : 'Upload photos and assign them to products.'}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-bold px-4 py-2.5 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={matchedCount === 0 || isProcessing}
              onClick={handleApplyImages}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md"
            >
              Apply Product Images
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
