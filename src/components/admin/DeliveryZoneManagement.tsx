import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { DeliveryZone } from '../../types';
import { MapPin, Plus, Trash2, Edit2, X } from 'lucide-react';

export const DeliveryZoneManagement: React.FC = () => {
  const {
    deliveryZones,
    addDeliveryZone,
    updateDeliveryZone,
    deleteDeliveryZone,
    storeSettings,
    showToast,
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);

  const [formData, setFormData] = useState<Partial<DeliveryZone>>({
    name: '',
    communities: [],
    fee: 2000,
    minDeliveryTimeHours: 2,
    maxDeliveryTimeHours: 4,
    freeAboveThreshold: 25000,
  });

  const [communitiesInput, setCommunitiesInput] = useState('');

  const handleOpenAdd = () => {
    setEditingZone(null);
    setFormData({
      name: '',
      communities: [],
      fee: 2000,
      minDeliveryTimeHours: 2,
      maxDeliveryTimeHours: 4,
      freeAboveThreshold: 25000,
    });
    setCommunitiesInput('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (z: DeliveryZone) => {
    setEditingZone(z);
    setFormData(z);
    setCommunitiesInput(z.communities.join(', '));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const commArray = communitiesInput
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    if (editingZone) {
      updateDeliveryZone({
        ...editingZone,
        name: formData.name.trim(),
        communities: commArray,
        fee: Number(formData.fee),
        minDeliveryTimeHours: Number(formData.minDeliveryTimeHours),
        maxDeliveryTimeHours: Number(formData.maxDeliveryTimeHours),
        freeAboveThreshold: Number(formData.freeAboveThreshold),
      });
    } else {
      addDeliveryZone({
        name: formData.name.trim(),
        communities: commArray,
        fee: Number(formData.fee),
        minDeliveryTimeHours: Number(formData.minDeliveryTimeHours),
        maxDeliveryTimeHours: Number(formData.maxDeliveryTimeHours),
        freeAboveThreshold: Number(formData.freeAboveThreshold),
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-gray-900">Regional Delivery Zones & Fees</h2>
          <p className="text-xs text-gray-500">
            Define local communities, set pricing per delivery zone, and configure free delivery thresholds.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Add Delivery Zone</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deliveryZones.map((z) => (
          <div
            key={z.id}
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-3 hover:border-green-200 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span>{z.name}</span>
                </h3>
                <span className="font-black text-sm text-green-700 bg-green-50 px-3 py-1 rounded-xl">
                  {storeSettings.currencySymbol}
                  {z.fee.toLocaleString()}
                </span>
              </div>

              <div className="text-xs text-gray-600 space-y-1">
                <p>
                  <strong>Est. Delivery Time:</strong> {z.minDeliveryTimeHours} -{' '}
                  {z.maxDeliveryTimeHours} hours
                </p>
                {z.freeAboveThreshold && (
                  <p className="text-amber-700 font-bold">
                    Free Delivery over: {storeSettings.currencySymbol}
                    {z.freeAboveThreshold.toLocaleString()}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                  Communities Included:
                </span>
                <div className="flex flex-wrap gap-1">
                  {z.communities.map((c, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2.5 py-1 rounded-lg"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
              <button
                onClick={() => handleOpenEdit(z)}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => deleteDeliveryZone(z.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-3xl max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-black text-base text-gray-900">
                {editingZone ? 'Edit Delivery Zone' : 'Add Delivery Zone'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Zone Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Lekki & Island Axis"
                  className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Communities (comma separated)
                </label>
                <input
                  type="text"
                  value={communitiesInput}
                  onChange={(e) => setCommunitiesInput(e.target.value)}
                  placeholder="Lekki Phase 1, Ikoyi, Victoria Island"
                  className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Delivery Fee (₦) *</label>
                  <input
                    type="number"
                    required
                    value={formData.fee || ''}
                    onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                    className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700 block mb-1">Free Delivery Above (₦)</label>
                  <input
                    type="number"
                    value={formData.freeAboveThreshold || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, freeAboveThreshold: Number(e.target.value) })
                    }
                    className="w-full bg-gray-50 border p-2.5 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-100 text-gray-700 font-bold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white font-bold px-5 py-2 rounded-xl shadow-md"
                >
                  Save Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
