import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { StoreSettings } from '../../types';
import { Settings, Save, Check } from 'lucide-react';

export const SettingsSection: React.FC = () => {
  const { storeSettings, updateStoreSettings } = useStore();

  const [formData, setFormData] = useState<StoreSettings>(storeSettings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreSettings(formData);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-900">Store Settings & Configuration</h2>
          <p className="text-xs text-gray-500">
            Configure store contact info, WhatsApp number, free delivery thresholds, and bank payment accounts.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-6 text-xs">
        <div className="space-y-3">
          <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider">
            1. General Store Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Store Name *</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Currency Symbol *</label>
              <input
                type="text"
                required
                value={formData.currencySymbol}
                onChange={(e) => setFormData({ ...formData, currencySymbol: e.target.value })}
                className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Support Phone *</label>
              <input
                type="text"
                required
                value={formData.supportPhone}
                onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
                className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">WhatsApp Number (No +) *</label>
              <input
                type="text"
                required
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Support Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">
              Default Free Delivery Threshold ({formData.currencySymbol}) *
            </label>
            <input
              type="number"
              required
              value={formData.freeDeliveryThreshold}
              onChange={(e) =>
                setFormData({ ...formData, freeDeliveryThreshold: Number(e.target.value) })
              }
              className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold max-w-xs"
            />
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider">
            2. Bank Account Details (for Bank Transfer Checkout)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Bank Name *</label>
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
                className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Account Number *</label>
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
                className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Account Name *</label>
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
                className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Social Media Links */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider">
            3. Social Media Launchers
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Facebook Page URL</label>
              <input
                type="url"
                value={formData.facebookUrl || ''}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                placeholder="https://facebook.com/yourpagename"
                className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Instagram Profile URL</label>
              <input
                type="url"
                value={formData.instagramUrl || ''}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/yourhandle"
                className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Owner Security Credentials */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <h3 className="font-black text-sm text-gray-900 uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
            <span>4. Business Owner Security Credentials</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <label className="font-bold text-gray-700 block mb-1">Owner Admin Email *</label>
              <input
                type="email"
                required
                value={formData.adminCredentials?.email || 'admin@freshmarketglobal.com'}
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
                className="w-full bg-white border p-2.5 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-gray-700 block mb-1">Owner Password *</label>
              <input
                type="password"
                required
                value={formData.adminCredentials?.passwordHash || 'admin12345'}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    adminCredentials: {
                      ...formData.adminCredentials,
                      email: formData.adminCredentials?.email || 'admin@freshmarketglobal.com',
                      passwordHash: e.target.value,
                    },
                  })
                }
                className="w-full bg-white border p-2.5 rounded-xl font-bold font-mono"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
