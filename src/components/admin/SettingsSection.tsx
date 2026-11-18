import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../context/StoreContext';
import { StoreSettings, StoreSnapshot } from '../../types';
import { DEFAULT_STORE_SETTINGS } from '../../data/mockData';
import { compressImageFile } from '../../utils/imageProcessor';
import {
  Save,
  Sparkles,
  ImagePlus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Globe,
  Phone,
  Building2,
  Share2,
  Lock,
  Archive,
} from 'lucide-react';

export const SettingsSection: React.FC = () => {
  const {
    storeSettings,
    updateStoreSettings,
    exportStoreSnapshot,
    importStoreSnapshot,
    resetAllStoreData,
    showToast,
  } = useStore();
  const [formData, setFormData] = useState<StoreSettings>(storeSettings);
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const importInputRef = useRef<HTMLInputElement>(null);
  const importSnapshotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormData(storeSettings);
  }, [storeSettings]);

  const storeSlug =
    formData.storeName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || 'store';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(formData);
  };

  const handleLogoUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 400, 0.88);
      setFormData((prev) => ({ ...prev, logoUrl: compressed }));
      showToast('Store logo uploaded! Click Save to apply.', 'info');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unable to load logo image.';
      showToast(msg, 'error');
    }
  };

  const handleExportConfig = () => {
    const blob = new Blob([JSON.stringify(formData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storeSlug}_whitelabel_config.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported white-label branding configuration!', 'success');
  };

  const handleImportConfig = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<StoreSettings> & Partial<StoreSnapshot>;
      if (parsed.products && parsed.categories && parsed.storeSettings) {
        importStoreSnapshot(parsed);
        return;
      }
      if (!parsed.storeName || !parsed.currencySymbol) {
        showToast('Invalid store configuration file.', 'error');
        return;
      }
      const merged: StoreSettings = {
        ...DEFAULT_STORE_SETTINGS,
        ...parsed,
        bankDetails: { ...DEFAULT_STORE_SETTINGS.bankDetails, ...(parsed.bankDetails || {}) },
        adminCredentials: {
          ...DEFAULT_STORE_SETTINGS.adminCredentials,
          ...(parsed.adminCredentials || {}),
        },
      };
      setFormData(merged);
      updateStoreSettings(merged);
      showToast(`Applied white-label profile for "${merged.storeName}"!`, 'success');
    } catch {
      showToast('Could not parse configuration JSON.', 'error');
    } finally {
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  const handleExportFullSnapshot = () => {
    const snapshot = exportStoreSnapshot();
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storeSlug}_full_store_bundle.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported complete store bundle (branding, categories, products, zones, coupons)!', 'success');
  };

  const handleImportFullSnapshot = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<StoreSnapshot>;
      const ok = importStoreSnapshot(parsed);
      if (!ok) {
        showToast('Invalid full store bundle JSON.', 'error');
      }
    } catch {
      showToast('Could not read store bundle file.', 'error');
    } finally {
      if (importSnapshotRef.current) importSnapshotRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header + White-Label & Full Store Snapshot Export/Import */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-stone-950">
              White-Label Branding & Store Settings
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Customize store identity, logo, storefront copy, contact details, social channels, currency, bank transfer account, and clone your entire store in 1 click.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportConfig}
              className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Branding</span>
            </button>

            <label className="flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>Import Branding</span>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                onChange={(e) => handleImportConfig(e.target.files)}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={handleExportFullSnapshot}
              className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-colors"
            >
              <Archive className="w-4 h-4" />
              <span>Export Full Store (.json)</span>
            </button>

            <label className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold text-xs px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              <span>Restore Store Bundle</span>
              <input
                ref={importSnapshotRef}
                type="file"
                accept="application/json,.json"
                onChange={(e) => handleImportFullSnapshot(e.target.files)}
                className="hidden"
              />
            </label>

            {confirmResetAll ? (
              <div className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    resetAllStoreData();
                    setConfirmResetAll(false);
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-3 py-2.5 rounded-xl"
                >
                  Confirm Full Reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmResetAll(false)}
                  className="bg-stone-100 text-stone-700 font-semibold text-xs px-3 py-2.5 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmResetAll(true)}
                className="flex items-center gap-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 font-semibold text-xs px-3.5 py-2.5 rounded-xl transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Factory Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-8 text-xs"
      >
        {/* 1. Brand Identity & Storefront Copy */}
        <div className="space-y-4">
          <h3 className="font-display font-bold text-sm text-stone-950 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <span>1. Brand Identity & Storefront Copy</span>
          </h3>

          {/* Logo Upload & Preview */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center overflow-hidden border border-stone-200 shrink-0">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt={formData.storeName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover bg-white"
                />
              ) : (
                <Sparkles className="w-7 h-7" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-3.5 py-2 rounded-xl cursor-pointer transition-colors">
                  <ImagePlus className="w-4 h-4" />
                  <span>Upload Store Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(e.target.files)}
                    className="hidden"
                  />
                </label>

                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, logoUrl: '' })}
                    className="inline-flex items-center gap-1 text-rose-600 hover:bg-rose-50 font-semibold text-xs px-3 py-2 rounded-xl"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Logo</span>
                  </button>
                )}
              </div>

              <input
                type="text"
                value={formData.logoUrl || ''}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="Or paste a direct logo image URL (https://...)"
                className="w-full bg-white border border-stone-200 rounded-xl p-2 text-xs text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Store / Brand Name *</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                placeholder="e.g. MamaPut Groceries"
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold text-stone-900"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Store Tagline</label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Foodstuff & Groceries"
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold text-stone-900"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Legal / Copyright Name</label>
              <input
                type="text"
                value={formData.copyrightName || ''}
                onChange={(e) => setFormData({ ...formData, copyrightName: e.target.value })}
                placeholder="e.g. Acme Foods Ltd"
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Top Bar Announcement Text
              </label>
              <input
                type="text"
                value={formData.announcementText || ''}
                onChange={(e) => setFormData({ ...formData, announcementText: e.target.value })}
                placeholder="Same-day local delivery & nationwide shipping!"
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-medium text-stone-900"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Hero Badge Label</label>
              <input
                type="text"
                value={formData.heroBadge || ''}
                onChange={(e) => setFormData({ ...formData, heroBadge: e.target.value })}
                placeholder="Local Doorstep Express & International Air Export"
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-medium text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-stone-700 block mb-1">Hero Main Headline</label>
            <input
              type="text"
              value={formData.heroTitle || ''}
              onChange={(e) => setFormData({ ...formData, heroTitle: e.target.value })}
              placeholder="Authentic Foodstuff — Local Delivery & Global Export"
              className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold text-stone-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Hero Subheadline</label>
              <textarea
                rows={2}
                value={formData.heroSubtitle || ''}
                onChange={(e) => setFormData({ ...formData, heroSubtitle: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl text-stone-900"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Footer About Text</label>
              <textarea
                rows={2}
                value={formData.footerDescription || ''}
                onChange={(e) => setFormData({ ...formData, footerDescription: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* 2. Contact, Location & Currency */}
        <div className="space-y-4 pt-6 border-t border-stone-100">
          <h3 className="font-display font-bold text-sm text-stone-950 uppercase tracking-wider flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-700" />
            <span>2. Contact, Location & Currency</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Support Phone *</label>
              <input
                type="text"
                required
                value={formData.supportPhone}
                onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold text-stone-900 tabular-nums"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                WhatsApp Number (Country code, no +) *
              </label>
              <input
                type="text"
                required
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                placeholder="e.g. 447911123456"
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold text-stone-900 tabular-nums"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Support Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Physical Store / Hub Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-medium text-stone-900"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Operational Hours *</label>
              <input
                type="text"
                required
                value={formData.operationalHours}
                onChange={(e) => setFormData({ ...formData, operationalHours: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-medium text-stone-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Currency Code *</label>
              <input
                type="text"
                required
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="GBP, USD, NGN, EUR"
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold text-stone-900 uppercase"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Currency Symbol *</label>
              <input
                type="text"
                required
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                placeholder="£, $, ₦, €"
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold text-stone-900"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">
                Free Delivery Threshold ({formData.currencySymbol}) *
              </label>
              <input
                type="number"
                required
                min={0}
                value={formData.freeDeliveryThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, freeDeliveryThreshold: Number(e.target.value) })
                }
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold text-stone-900 tabular-nums"
              />
            </div>
          </div>
        </div>

        {/* 3. Social Media Links */}
        <div className="space-y-4 pt-6 border-t border-stone-100">
          <div>
            <h3 className="font-display font-bold text-sm text-stone-950 uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-700" />
              <span>3. Social Media Channels</span>
            </h3>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Leave any channel blank to hide its icon from the storefront automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Facebook Page URL</label>
              <input
                type="url"
                value={formData.facebookUrl || ''}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/yourstore"
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-medium text-stone-900"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Instagram Profile URL</label>
              <input
                type="url"
                value={formData.instagramUrl || ''}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/yourstore"
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-medium text-stone-900"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">X / Twitter Profile URL</label>
              <input
                type="url"
                value={formData.twitterUrl || ''}
                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                placeholder="https://x.com/yourstore"
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-medium text-stone-900"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">TikTok Profile URL</label>
              <input
                type="url"
                value={formData.tiktokUrl || ''}
                onChange={(e) => setFormData({ ...formData, tiktokUrl: e.target.value })}
                placeholder="https://tiktok.com/@yourstore"
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-medium text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* 4. Bank Account Details */}
        <div className="space-y-4 pt-6 border-t border-stone-100">
          <h3 className="font-display font-bold text-sm text-stone-950 uppercase tracking-wider flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-700" />
            <span>4. Bank Account Details (Direct Transfer Checkout)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Bank Name *</label>
              <input
                type="text"
                required
                value={formData.bankDetails.bankName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, bankName: e.target.value },
                  })
                }
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold text-stone-900"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Account Number *</label>
              <input
                type="text"
                required
                value={formData.bankDetails.accountNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, accountNumber: e.target.value },
                  })
                }
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold text-stone-900 tabular-nums"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Sort / Routing Code</label>
              <input
                type="text"
                value={formData.bankDetails.sortCode || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, sortCode: e.target.value },
                  })
                }
                placeholder="Optional"
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold text-stone-900 tabular-nums"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Account Name *</label>
              <input
                type="text"
                required
                value={formData.bankDetails.accountName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, accountName: e.target.value },
                  })
                }
                className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* 5. Owner Security Credentials */}
        <div className="space-y-4 pt-6 border-t border-stone-100">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-amber-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>5. Business Owner Security Credentials</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <div>
              <label className="font-semibold text-stone-700 block mb-1">Owner Admin Email *</label>
              <input
                type="email"
                required
                value={formData.adminCredentials?.email || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    adminCredentials: {
                      ...formData.adminCredentials,
                      email: e.target.value,
                      passwordHash: formData.adminCredentials?.passwordHash || 'admin12345',
                    },
                  })
                }
                className="w-full bg-white border border-stone-200 p-2.5 rounded-xl font-semibold text-stone-900"
              />
            </div>

            <div>
              <label className="font-semibold text-stone-700 block mb-1">Owner Password *</label>
              <input
                type="password"
                required
                value={formData.adminCredentials?.passwordHash || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    adminCredentials: {
                      ...formData.adminCredentials,
                      email: formData.adminCredentials?.email || 'admin@store.com',
                      passwordHash: e.target.value,
                    },
                  })
                }
                className="w-full bg-white border border-stone-200 p-2.5 rounded-xl font-semibold font-mono text-stone-900"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-[11px] text-stone-500 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            Changes apply immediately across Header, Hero, Cart, Checkout, Receipts, and Footer.
          </span>
          <button
            type="submit"
            className="flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-6 py-3 rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            <Save className="w-4 h-4" />
            <span>Save White-Label Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
