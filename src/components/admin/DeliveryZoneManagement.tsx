import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { DeliveryZone } from '../../types';
import { MapPin, Plus, Trash2, Edit2, X, Clock, Globe } from 'lucide-react';

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
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<DeliveryZone>>({
    name: '',
    communities: [],
    fee: 5,
    minDeliveryTimeHours: 2,
    maxDeliveryTimeHours: 4,
    freeAboveThreshold: storeSettings.freeDeliveryThreshold,
  });

  const [communityDraft, setCommunityDraft] = useState('');

  const handleOpenAdd = () => {
    setEditingZone(null);
    setFormData({
      name: '',
      communities: [],
      fee: 5,
      minDeliveryTimeHours: 2,
      maxDeliveryTimeHours: 4,
      freeAboveThreshold: storeSettings.freeDeliveryThreshold,
    });
    setCommunityDraft('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (z: DeliveryZone) => {
    setEditingZone(z);
    setFormData({ ...z });
    setCommunityDraft('');
    setIsModalOpen(true);
  };

  const handleAddCommunities = (raw: string) => {
    const incoming = raw
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    if (incoming.length === 0) return;

    setFormData((prev) => ({
      ...prev,
      communities: Array.from(new Set([...(prev.communities || []), ...incoming])),
    }));
    setCommunityDraft('');
  };

  const handleRemoveCommunity = (target: string) => {
    setFormData((prev) => ({
      ...prev,
      communities: (prev.communities || []).filter((c) => c !== target),
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showToast('Delivery zone name is required.', 'error');
      return;
    }

    const pendingExtras = communityDraft
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);
    const commArray = Array.from(
      new Set([...(formData.communities || []), ...pendingExtras])
    );

    const minH = Math.max(1, Number(formData.minDeliveryTimeHours || 1));
    const maxH = Math.max(minH, Number(formData.maxDeliveryTimeHours || minH));

    const payload = {
      name: formData.name.trim(),
      communities: commArray,
      fee: Math.max(0, Number(formData.fee || 0)),
      minDeliveryTimeHours: minH,
      maxDeliveryTimeHours: maxH,
      freeAboveThreshold:
        formData.freeAboveThreshold && Number(formData.freeAboveThreshold) > 0
          ? Number(formData.freeAboveThreshold)
          : undefined,
    };

    if (editingZone) {
      updateDeliveryZone({
        ...editingZone,
        ...payload,
      });
    } else {
      addDeliveryZone(payload);
    }

    setIsModalOpen(false);
  };

  const handleAddPreset = (presetType: 'local' | 'nationwide' | 'export') => {
    if (presetType === 'local') {
      addDeliveryZone({
        name: 'Local Express Hub — Same Day',
        communities: ['Downtown', 'Central District', 'Westside', 'Northside'],
        fee: 4.99,
        minDeliveryTimeHours: 2,
        maxDeliveryTimeHours: 4,
        freeAboveThreshold: storeSettings.freeDeliveryThreshold,
      });
    } else if (presetType === 'nationwide') {
      addDeliveryZone({
        name: 'Nationwide Standard Courier',
        communities: ['Major Cities', 'Regional Hubs', 'Suburban Postcodes'],
        fee: 9.99,
        minDeliveryTimeHours: 24,
        maxDeliveryTimeHours: 48,
        freeAboveThreshold: storeSettings.freeDeliveryThreshold * 2,
      });
    } else {
      addDeliveryZone({
        name: 'International Air Freight',
        communities: ['Europe', 'North America', 'Middle East', 'Worldwide'],
        fee: 24.99,
        minDeliveryTimeHours: 48,
        maxDeliveryTimeHours: 96,
        freeAboveThreshold: storeSettings.freeDeliveryThreshold * 4,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold text-stone-950">
            Delivery Zones, Pricing & Speed
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Define neighborhoods, delivery fees, estimated delivery hours, and free-shipping thresholds.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleAddPreset('local')}
            className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
          >
            + Local Preset
          </button>
          <button
            type="button"
            onClick={() => handleAddPreset('export')}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>+ Export Preset</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Delivery Zone</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deliveryZones.map((z) => {
          const isConfirming = confirmDeleteId === z.id;
          return (
            <div
              key={z.id}
              className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-3 hover:border-emerald-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display font-bold text-sm text-stone-950 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{z.name}</span>
                  </h3>
                  <span className="font-mono font-bold text-sm text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg tabular-nums shrink-0">
                    {storeSettings.currencySymbol}
                    {z.fee.toLocaleString()}
                  </span>
                </div>

                <div className="text-xs text-stone-600 flex flex-wrap items-center gap-x-4 gap-y-1 tabular-nums">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    {z.minDeliveryTimeHours}–{z.maxDeliveryTimeHours} hours
                  </span>
                  {z.freeAboveThreshold && (
                    <span className="text-amber-700 font-semibold">
                      Free over {storeSettings.currencySymbol}
                      {z.freeAboveThreshold.toLocaleString()}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-stone-400 block mb-1.5">
                    Communities Covered ({z.communities.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {z.communities.map((c, idx) => (
                      <span
                        key={idx}
                        className="bg-stone-100 text-stone-700 text-[11px] font-medium px-2.5 py-1 rounded-lg"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(z)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                {isConfirming ? (
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => {
                        deleteDeliveryZone(z.id);
                        setConfirmDeleteId(null);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-600 text-white text-[11px] font-semibold"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(null)}
                      className="px-2 py-1.5 rounded-lg bg-stone-100 text-stone-700 text-[11px] font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmDeleteId(z.id)}
                    className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Zone"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white p-6 rounded-2xl max-w-lg w-full space-y-4 border border-stone-200 shadow-xl">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-display font-bold text-base text-stone-950">
                {editingZone ? 'Edit Delivery Zone' : 'Add Delivery Zone'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Zone Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Central & South Hub"
                  className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Delivery Fee ({storeSettings.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    required
                    value={formData.fee ?? ''}
                    onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold tabular-nums"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Free Above ({storeSettings.currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={formData.freeAboveThreshold ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        freeAboveThreshold: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold tabular-nums"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Min Hours *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.minDeliveryTimeHours ?? 2}
                    onChange={(e) =>
                      setFormData({ ...formData, minDeliveryTimeHours: Number(e.target.value) })
                    }
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold tabular-nums"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Max Hours *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.maxDeliveryTimeHours ?? 4}
                    onChange={(e) =>
                      setFormData({ ...formData, maxDeliveryTimeHours: Number(e.target.value) })
                    }
                    className="w-full bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-semibold tabular-nums"
                  />
                </div>
              </div>

              {/* Interactive Communities Tag Builder */}
              <div className="space-y-2">
                <label className="font-semibold text-stone-700 block">
                  Communities / Areas Covered
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={communityDraft}
                    onChange={(e) => setCommunityDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ',') {
                        e.preventDefault();
                        handleAddCommunities(communityDraft);
                      }
                    }}
                    placeholder="Type neighborhoods (comma separated or press Enter)"
                    className="flex-1 bg-stone-50 border border-stone-200 p-2.5 rounded-xl font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddCommunities(communityDraft)}
                    className="bg-stone-900 hover:bg-black text-white font-semibold px-3.5 rounded-xl"
                  >
                    Add
                  </button>
                </div>

                {(formData.communities || []).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1 max-h-28 overflow-y-auto">
                    {(formData.communities || []).map((comm) => (
                      <span
                        key={comm}
                        className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-1 rounded-lg text-[11px] font-medium"
                      >
                        <span>{comm}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCommunity(comm)}
                          className="text-emerald-700 hover:text-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-4 py-2 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-2 rounded-xl"
                >
                  {editingZone ? 'Save Changes' : 'Save Zone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
