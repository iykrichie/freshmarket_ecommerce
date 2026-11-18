import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import {
  BillingCycle,
  DeliveryZone,
  PaymentMethod,
  StoreSettings,
  SubscriptionInfo,
  SubscriptionPlanId,
} from '../types';
import {
  SUBSCRIPTION_PLANS,
  REGIONAL_STARTER_TEMPLATES,
  computeRenewalDate,
  generateLicenseKey,
  inferPlanFromLicenseKey,
} from '../data/subscriptionPlans';
import { compressImageFile } from '../utils/imageProcessor';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Globe,
  ImagePlus,
  KeyRound,
  Lock,
  MapPin,
  Rocket,
  ShieldCheck,
  Sparkles,
  Store,
  X,
} from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Subscription & License', subtitle: 'Plan tier & license key', icon: KeyRound },
  { id: 2, title: 'Brand & Storefront', subtitle: 'Name, logo & hero copy', icon: Store },
  { id: 3, title: 'Contact & Currency', subtitle: 'Phone, WhatsApp & socials', icon: Globe },
  { id: 4, title: 'Payments & Bank', subtitle: 'Checkout methods & payout', icon: CreditCard },
  { id: 5, title: 'Zones & Catalog', subtitle: 'Delivery regions & stock', icon: MapPin },
  { id: 6, title: 'Owner Security & Launch', subtitle: 'Admin login & go live', icon: Lock },
] as const;

const CURRENCY_QUICK_PICKS = [
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'NGN', symbol: '₦', label: 'NGN (₦)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'CAD', symbol: 'C$', label: 'CAD (C$)' },
];

export const SetupWizard: React.FC = () => {
  const {
    isSetupWizardOpen,
    setIsSetupWizardOpen,
    storeSettings,
    subscription,
    deliveryZones,
    products,
    categories,
    coupons,
    completeStoreInitialization,
    showToast,
  } = useStore();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadSnapshotOnLaunch, setDownloadSnapshotOnLaunch] = useState(false);

  // Step 1: Subscription
  const [planId, setPlanId] = useState<SubscriptionPlanId>(subscription.planId || 'growth');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>(subscription.billingCycle || 'monthly');
  const [licenseKey, setLicenseKey] = useState(subscription.licenseKey || '');
  const [subscriberName, setSubscriberName] = useState(subscription.subscriberName || '');
  const [subscriberEmail, setSubscriberEmail] = useState(subscription.subscriberEmail || '');
  const [customDomain, setCustomDomain] = useState(subscription.customDomain || '');

  // Step 2-4 & 6: Store Settings draft
  const [draftSettings, setDraftSettings] = useState<StoreSettings>(storeSettings);
  const [confirmPassword, setConfirmPassword] = useState(
    storeSettings.adminCredentials?.passwordHash || 'admin12345'
  );

  // Step 5: Delivery Zones & Starter Catalog
  const [selectedPresetId, setSelectedPresetId] = useState<string>('keep');
  const [catalogMode, setCatalogMode] = useState<'starter' | 'clean'>('starter');

  // Sync draft when wizard opens
  useEffect(() => {
    if (isSetupWizardOpen) {
      setStep(1);
      setPlanId(subscription.planId || 'growth');
      setBillingCycle(subscription.billingCycle || 'monthly');
      setLicenseKey(subscription.licenseKey || generateLicenseKey(subscription.planId || 'growth'));
      setSubscriberName(subscription.subscriberName || storeSettings.storeName);
      setSubscriberEmail(subscription.subscriberEmail || storeSettings.email);
      setCustomDomain(subscription.customDomain || '');
      setDraftSettings({
        ...storeSettings,
        acceptedPaymentMethods:
          storeSettings.acceptedPaymentMethods && storeSettings.acceptedPaymentMethods.length > 0
            ? storeSettings.acceptedPaymentMethods
            : ['paystack', 'bank_transfer', 'flutterwave', 'cod'],
      });
      setConfirmPassword(storeSettings.adminCredentials?.passwordHash || 'admin12345');
    }
  }, [isSetupWizardOpen, storeSettings, subscription]);

  if (!isSetupWizardOpen) return null;

  const activePlan = SUBSCRIPTION_PLANS.find((p) => p.id === planId) || SUBSCRIPTION_PLANS[1];
  const effectiveMonthlyPrice =
    billingCycle === 'annual' ? activePlan.annualMonthlyPrice : activePlan.monthlyPrice;

  const handlePlanSelect = (nextPlanId: SubscriptionPlanId) => {
    setPlanId(nextPlanId);
    if (!licenseKey || licenseKey.includes('TRIAL') || inferPlanFromLicenseKey(licenseKey)) {
      setLicenseKey(generateLicenseKey(nextPlanId));
    }
  };

  const handleLicenseChange = (value: string) => {
    const upper = value.toUpperCase();
    setLicenseKey(upper);
    const inferred = inferPlanFromLicenseKey(upper);
    if (inferred) {
      setPlanId(inferred);
    }
  };

  const handleLogoUpload = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    try {
      const compressed = await compressImageFile(file, 400, 0.88);
      setDraftSettings((prev) => ({ ...prev, logoUrl: compressed }));
      showToast('Logo uploaded!', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Unable to process image', 'error');
    }
  };

  const togglePaymentMethod = (method: PaymentMethod) => {
    const current = draftSettings.acceptedPaymentMethods || [
      'paystack',
      'bank_transfer',
      'flutterwave',
      'cod',
    ];
    if (current.includes(method)) {
      if (current.length === 1) {
        showToast('At least one checkout payment method must remain active.', 'error');
        return;
      }
      setDraftSettings((prev) => ({
        ...prev,
        acceptedPaymentMethods: current.filter((m) => m !== method),
      }));
    } else {
      setDraftSettings((prev) => ({
        ...prev,
        acceptedPaymentMethods: [...current, method],
      }));
    }
  };

  const applyRegionalPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const preset = REGIONAL_STARTER_TEMPLATES.find((p) => p.id === presetId);
    if (!preset) return;
    setDraftSettings((prev) => ({
      ...prev,
      currency: preset.currency,
      currencySymbol: preset.currencySymbol,
      freeDeliveryThreshold: preset.freeDeliveryThreshold,
      announcementText: preset.announcementText,
      heroBadge: preset.heroBadge,
    }));
  };

  const validateCurrentStep = (): boolean => {
    if (step === 1) {
      if (!licenseKey.trim() || licenseKey.trim().length < 6) {
        showToast('Please enter or generate a valid subscription license key.', 'error');
        return false;
      }
      if (!subscriberEmail.trim() || !subscriberEmail.includes('@')) {
        showToast('Please enter a valid subscriber billing email.', 'error');
        return false;
      }
    }
    if (step === 2 && !draftSettings.storeName.trim()) {
      showToast('Please enter your storefront brand name.', 'error');
      return false;
    }
    if (step === 3) {
      if (!draftSettings.supportPhone.trim() || !draftSettings.whatsappNumber.trim()) {
        showToast('Support phone and WhatsApp number are required.', 'error');
        return false;
      }
      if (!draftSettings.currency.trim() || !draftSettings.currencySymbol.trim()) {
        showToast('Please specify a currency code and symbol.', 'error');
        return false;
      }
    }
    if (step === 4) {
      if (
        !draftSettings.bankDetails.bankName.trim() ||
        !draftSettings.bankDetails.accountNumber.trim()
      ) {
        showToast('Please enter bank transfer payout details.', 'error');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    setStep((s) => Math.min(STEPS.length, s + 1));
  };

  const handleBack = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleFinishSetup = async (openAdminAfter: boolean) => {
    const adminEmail = draftSettings.adminCredentials?.email?.trim() || '';
    const adminPassword = draftSettings.adminCredentials?.passwordHash || '';

    if (!adminEmail || !adminEmail.includes('@')) {
      showToast('Please enter a valid Owner Admin Email.', 'error');
      return;
    }
    if (adminPassword.length < 6) {
      showToast('Owner password must be at least 6 characters long.', 'error');
      return;
    }
    if (adminPassword !== confirmPassword) {
      showToast('Admin passwords do not match.', 'error');
      return;
    }

    setIsSubmitting(true);

    const now = new Date();
    const nextSubscription: SubscriptionInfo = {
      planId: activePlan.id,
      planName: activePlan.name,
      status: licenseKey.includes('TRIAL') ? 'trial' : 'active',
      billingCycle,
      licenseKey: licenseKey.trim().toUpperCase(),
      subscriberName: subscriberName.trim() || draftSettings.storeName.trim(),
      subscriberEmail: subscriberEmail.trim(),
      customDomain: customDomain.trim(),
      startedAt: subscription.startedAt || now.toISOString(),
      renewsAt: computeRenewalDate(billingCycle, now),
      monthlyPrice: effectiveMonthlyPrice,
      maxProducts: activePlan.maxProducts,
      maxZones: activePlan.maxZones,
      setupCompleted: true,
      setupCompletedAt: now.toISOString(),
    };

    const chosenPreset = REGIONAL_STARTER_TEMPLATES.find((p) => p.id === selectedPresetId);
    const nextZones: DeliveryZone[] = chosenPreset
      ? chosenPreset.zones.map((z, idx) => ({
          ...z,
          id: `zone-init-${Date.now()}-${idx}`,
        }))
      : deliveryZones;

    const nextProducts = catalogMode === 'clean' ? [] : products;

    const finalSettings: StoreSettings = {
      ...draftSettings,
      storeName: draftSettings.storeName.trim(),
      copyrightName: draftSettings.copyrightName?.trim() || draftSettings.storeName.trim(),
      whatsappNumber: draftSettings.whatsappNumber.replace(/\D/g, ''),
      adminCredentials: {
        email: adminEmail,
        passwordHash: adminPassword,
      },
    };

    if (downloadSnapshotOnLaunch) {
      const slug =
        finalSettings.storeName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_|_$/g, '') || 'store';
      const snapshot = {
        version: 1,
        exportedAt: now.toISOString(),
        storeSettings: finalSettings,
        categories,
        products: nextProducts,
        deliveryZones: nextZones,
        coupons,
        subscription: nextSubscription,
      };
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${slug}_initialized_bundle.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    await completeStoreInitialization({
      storeSettings: finalSettings,
      subscription: nextSubscription,
      categories,
      products: nextProducts,
      deliveryZones: nextZones,
      coupons,
      openAdminAfter,
    });

    setIsSubmitting(false);
  };

  const activeMethods = draftSettings.acceptedPaymentMethods || [
    'paystack',
    'bank_transfer',
    'flutterwave',
    'cod',
  ];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Modal Header */}
        <div className="px-6 py-4 bg-stone-950 text-white flex items-center justify-between gap-4 border-b border-stone-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-display text-base sm:text-lg font-bold text-white truncate">
                One-Time Store Initialization Wizard
              </h2>
              <p className="text-[11px] text-stone-400 truncate">
                Step {step} of {STEPS.length} — Configure subscription, branding, logistics & owner security
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsSetupWizardOpen(false)}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors shrink-0"
            title="Close wizard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Layout: Left Step Rail + Right Form Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Left Step Rail */}
          <aside className="md:w-64 bg-stone-50 border-b md:border-b-0 md:border-r border-stone-200 p-4 shrink-0 overflow-x-auto md:overflow-y-auto">
            <div className="flex md:flex-col gap-2 min-w-max md:min-w-0">
              {STEPS.map((s) => {
                const Icon = s.icon;
                const isActive = step === s.id;
                const isDone = step > s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      if (s.id < step) setStep(s.id);
                    }}
                    className={`flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : isDone
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                        : 'text-stone-500 bg-white border border-stone-200/70'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : isDone
                          ? 'bg-emerald-600 text-white'
                          : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">{s.title}</p>
                      <p
                        className={`text-[10px] truncate hidden md:block ${
                          isActive ? 'text-emerald-100' : 'text-stone-400'
                        }`}
                      >
                        {s.subtitle}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Step Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {/* STEP 1: SUBSCRIPTION & LICENSE */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-display text-base font-bold text-stone-950">
                      1. Activate Subscription Plan & License
                    </h3>
                    <p className="text-stone-500 mt-0.5">
                      Select the buyer&apos;s subscription tier and activate their deployment license key.
                    </p>
                  </div>

                  {/* Billing cycle switch */}
                  <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200 shrink-0">
                    <button
                      type="button"
                      onClick={() => setBillingCycle('monthly')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                        billingCycle === 'monthly'
                          ? 'bg-white text-stone-950 shadow-2xs'
                          : 'text-stone-500'
                      }`}
                    >
                      Monthly
                    </button>
                    <button
                      type="button"
                      onClick={() => setBillingCycle('annual')}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                        billingCycle === 'annual'
                          ? 'bg-emerald-700 text-white shadow-2xs'
                          : 'text-stone-500'
                      }`}
                    >
                      Annual (Save 18%)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {SUBSCRIPTION_PLANS.map((plan) => {
                    const selected = plan.id === planId;
                    const price =
                      billingCycle === 'annual' ? plan.annualMonthlyPrice : plan.monthlyPrice;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => handlePlanSelect(plan.id)}
                        className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                          selected
                            ? 'border-emerald-700 bg-emerald-50/70 ring-2 ring-emerald-700/20'
                            : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-display font-bold text-sm text-stone-950">
                              {plan.name}
                            </span>
                            {plan.recommended && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold">
                                Popular
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 leading-snug">{plan.tagline}</p>
                          <div className="pt-1">
                            <span className="text-xl font-extrabold font-mono tabular-nums text-stone-950">
                              ${price}
                            </span>
                            <span className="text-[11px] text-stone-500">/month</span>
                          </div>
                        </div>

                        <ul className="space-y-1 text-[11px] text-stone-700 border-t border-stone-200/70 pt-2.5">
                          {plan.features.map((f) => (
                            <li key={f} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </button>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      Subscription License Key *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={licenseKey}
                        onChange={(e) => handleLicenseChange(e.target.value)}
                        placeholder="FM-GRW-XXXX-XXXX"
                        className="flex-1 bg-white border border-stone-200 rounded-xl px-3 py-2 font-mono font-bold text-stone-900 uppercase"
                      />
                      <button
                        type="button"
                        onClick={() => setLicenseKey(generateLicenseKey(planId))}
                        className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold whitespace-nowrap"
                      >
                        Generate
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      Subscriber Billing Email *
                    </label>
                    <input
                      type="email"
                      value={subscriberEmail}
                      onChange={(e) => setSubscriberEmail(e.target.value)}
                      placeholder="owner@buyerdomain.com"
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      Subscriber / Company Name
                    </label>
                    <input
                      type="text"
                      value={subscriberName}
                      onChange={(e) => setSubscriberName(e.target.value)}
                      placeholder="e.g. Kola Foods UK Ltd"
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      Custom Store Domain (Optional)
                    </label>
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="e.g. shop.kolafoods.co.uk"
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 font-medium text-stone-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: BRAND & STOREFRONT */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-display text-base font-bold text-stone-950">
                    2. Storefront Brand Identity
                  </h3>
                  <p className="text-stone-500 mt-0.5">
                    Personalize the store name, logo, and homepage messaging for your customer&apos;s brand.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center overflow-hidden border border-stone-200 shrink-0">
                    {draftSettings.logoUrl ? (
                      <img
                        src={draftSettings.logoUrl}
                        alt={draftSettings.storeName}
                        className="w-full h-full object-cover bg-white"
                      />
                    ) : (
                      <Sparkles className="w-7 h-7" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-3.5 py-2 rounded-xl cursor-pointer transition-colors">
                        <ImagePlus className="w-4 h-4" />
                        <span>Upload Brand Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleLogoUpload(e.target.files)}
                          className="hidden"
                        />
                      </label>
                      {draftSettings.logoUrl && (
                        <button
                          type="button"
                          onClick={() => setDraftSettings((p) => ({ ...p, logoUrl: '' }))}
                          className="text-rose-600 font-semibold px-2 py-1"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={draftSettings.logoUrl || ''}
                      onChange={(e) => setDraftSettings((p) => ({ ...p, logoUrl: e.target.value }))}
                      placeholder="Or paste an HTTPS logo URL"
                      className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      Store / Brand Name *
                    </label>
                    <input
                      type="text"
                      value={draftSettings.storeName}
                      onChange={(e) =>
                        setDraftSettings((p) => ({ ...p, storeName: e.target.value }))
                      }
                      placeholder="e.g. MamaPut Groceries"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-semibold text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Store Tagline</label>
                    <input
                      type="text"
                      value={draftSettings.tagline || ''}
                      onChange={(e) => setDraftSettings((p) => ({ ...p, tagline: e.target.value }))}
                      placeholder="e.g. Authentic Foodstuff & Groceries"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-semibold text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Top Announcement Bar Message
                  </label>
                  <input
                    type="text"
                    value={draftSettings.announcementText || ''}
                    onChange={(e) =>
                      setDraftSettings((p) => ({ ...p, announcementText: e.target.value }))
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Homepage Hero Main Headline
                  </label>
                  <input
                    type="text"
                    value={draftSettings.heroTitle || ''}
                    onChange={(e) => setDraftSettings((p) => ({ ...p, heroTitle: e.target.value }))}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-semibold text-stone-900"
                  />
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">
                    Homepage Hero Subheadline
                  </label>
                  <textarea
                    rows={2}
                    value={draftSettings.heroSubtitle || ''}
                    onChange={(e) =>
                      setDraftSettings((p) => ({ ...p, heroSubtitle: e.target.value }))
                    }
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: CONTACT, CURRENCY & SOCIALS */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-display text-base font-bold text-stone-950">
                    3. Currency, Contact & Social Channels
                  </h3>
                  <p className="text-stone-500 mt-0.5">
                    Configure local currency, WhatsApp order routing, store hub address, and social links.
                  </p>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                  <label className="font-semibold text-stone-700 block">Quick Currency Presets</label>
                  <div className="flex flex-wrap gap-2">
                    {CURRENCY_QUICK_PICKS.map((cur) => {
                      const active =
                        draftSettings.currency === cur.code &&
                        draftSettings.currencySymbol === cur.symbol;
                      return (
                        <button
                          key={cur.code}
                          type="button"
                          onClick={() =>
                            setDraftSettings((p) => ({
                              ...p,
                              currency: cur.code,
                              currencySymbol: cur.symbol,
                            }))
                          }
                          className={`px-3 py-1.5 rounded-xl font-semibold border transition-colors ${
                            active
                              ? 'bg-emerald-700 text-white border-emerald-700'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {cur.label}
                        </button>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    <div>
                      <label className="font-semibold text-stone-700 block mb-1">Currency Code *</label>
                      <input
                        type="text"
                        value={draftSettings.currency}
                        onChange={(e) =>
                          setDraftSettings((p) => ({ ...p, currency: e.target.value.toUpperCase() }))
                        }
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900 uppercase"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-stone-700 block mb-1">Symbol *</label>
                      <input
                        type="text"
                        value={draftSettings.currencySymbol}
                        onChange={(e) =>
                          setDraftSettings((p) => ({ ...p, currencySymbol: e.target.value }))
                        }
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-stone-700 block mb-1">
                        Free Delivery Above ({draftSettings.currencySymbol})
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={draftSettings.freeDeliveryThreshold}
                        onChange={(e) =>
                          setDraftSettings((p) => ({
                            ...p,
                            freeDeliveryThreshold: Number(e.target.value) || 0,
                          }))
                        }
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 font-bold text-stone-900 tabular-nums"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Support Phone *</label>
                    <input
                      type="text"
                      value={draftSettings.supportPhone}
                      onChange={(e) =>
                        setDraftSettings((p) => ({ ...p, supportPhone: e.target.value }))
                      }
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-semibold text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      WhatsApp Number (digits) *
                    </label>
                    <input
                      type="text"
                      value={draftSettings.whatsappNumber}
                      onChange={(e) =>
                        setDraftSettings((p) => ({ ...p, whatsappNumber: e.target.value }))
                      }
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-semibold text-stone-900 tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Support Email *</label>
                    <input
                      type="email"
                      value={draftSettings.email}
                      onChange={(e) => setDraftSettings((p) => ({ ...p, email: e.target.value }))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-semibold text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      Store / Fulfillment Hub Address
                    </label>
                    <input
                      type="text"
                      value={draftSettings.address}
                      onChange={(e) => setDraftSettings((p) => ({ ...p, address: e.target.value }))}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">Operational Hours</label>
                    <input
                      type="text"
                      value={draftSettings.operationalHours}
                      onChange={(e) =>
                        setDraftSettings((p) => ({ ...p, operationalHours: e.target.value }))
                      }
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      Instagram URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={draftSettings.instagramUrl || ''}
                      onChange={(e) =>
                        setDraftSettings((p) => ({ ...p, instagramUrl: e.target.value }))
                      }
                      placeholder="https://instagram.com/yourstore"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-stone-700 block mb-1">
                      Facebook URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={draftSettings.facebookUrl || ''}
                      onChange={(e) =>
                        setDraftSettings((p) => ({ ...p, facebookUrl: e.target.value }))
                      }
                      placeholder="https://facebook.com/yourstore"
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: PAYMENTS & PAYOUT BANK */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-display text-base font-bold text-stone-950">
                    4. Checkout Payment Methods & Bank Payouts
                  </h3>
                  <p className="text-stone-500 mt-0.5">
                    Enable the payment options shown at checkout and configure direct bank transfer details.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    {
                      id: 'paystack' as PaymentMethod,
                      title: 'Credit / Debit Card',
                      desc: 'Visa, Mastercard & online card payments',
                    },
                    {
                      id: 'bank_transfer' as PaymentMethod,
                      title: 'Direct Bank Transfer',
                      desc: 'Customers transfer directly to your business bank',
                    },
                    {
                      id: 'flutterwave' as PaymentMethod,
                      title: 'Apple Pay / Google Pay',
                      desc: 'Express digital wallet checkout',
                    },
                    {
                      id: 'cod' as PaymentMethod,
                      title: 'Pay on Delivery',
                      desc: 'Card or cash collected by dispatch rider',
                    },
                  ].map((m) => {
                    const enabled = activeMethods.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => togglePaymentMethod(m.id)}
                        className={`p-3.5 rounded-2xl border text-left flex items-start justify-between gap-3 transition-colors ${
                          enabled
                            ? 'bg-emerald-50/70 border-emerald-700 text-stone-950'
                            : 'bg-white border-stone-200 text-stone-500'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs">{m.title}</p>
                          <p className="text-[11px] text-stone-500 mt-0.5">{m.desc}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${
                            enabled
                              ? 'bg-emerald-700 text-white'
                              : 'bg-stone-100 border border-stone-300'
                          }`}
                        >
                          {enabled && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                  <p className="font-bold text-stone-800">Business Bank Transfer Details</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-stone-700 block mb-1">Bank Name *</label>
                      <input
                        type="text"
                        value={draftSettings.bankDetails.bankName}
                        onChange={(e) =>
                          setDraftSettings((p) => ({
                            ...p,
                            bankDetails: { ...p.bankDetails, bankName: e.target.value },
                          }))
                        }
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-stone-700 block mb-1">
                        Account Name *
                      </label>
                      <input
                        type="text"
                        value={draftSettings.bankDetails.accountName}
                        onChange={(e) =>
                          setDraftSettings((p) => ({
                            ...p,
                            bankDetails: { ...p.bankDetails, accountName: e.target.value },
                          }))
                        }
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-stone-700 block mb-1">
                        Account Number *
                      </label>
                      <input
                        type="text"
                        value={draftSettings.bankDetails.accountNumber}
                        onChange={(e) =>
                          setDraftSettings((p) => ({
                            ...p,
                            bankDetails: { ...p.bankDetails, accountNumber: e.target.value },
                          }))
                        }
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900 tabular-nums"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-stone-700 block mb-1">
                        Sort / Routing Code
                      </label>
                      <input
                        type="text"
                        value={draftSettings.bankDetails.sortCode || ''}
                        onChange={(e) =>
                          setDraftSettings((p) => ({
                            ...p,
                            bankDetails: { ...p.bankDetails, sortCode: e.target.value },
                          }))
                        }
                        placeholder="Optional"
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900 tabular-nums"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: DELIVERY ZONES & STARTER CATALOG */}
            {step === 5 && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-display text-base font-bold text-stone-950">
                    5. Delivery Regions & Starter Catalog
                  </h3>
                  <p className="text-stone-500 mt-0.5">
                    Pick a localized delivery template or keep existing zones, and choose how to seed your inventory.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <label className="font-bold text-stone-800 block">
                    Regional Logistics & Currency Template
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedPresetId('keep')}
                      className={`p-3.5 rounded-2xl border text-left transition-colors ${
                        selectedPresetId === 'keep'
                          ? 'bg-emerald-50/70 border-emerald-700'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <p className="font-bold text-stone-950">Keep Current Delivery Zones</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Retains your existing {deliveryZones.length} configured regions without overwriting currency.
                      </p>
                    </button>

                    {REGIONAL_STARTER_TEMPLATES.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => applyRegionalPreset(preset.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-colors ${
                          selectedPresetId === preset.id
                            ? 'bg-emerald-50/70 border-emerald-700'
                            : 'bg-white border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-stone-950">{preset.label}</p>
                          <span className="font-mono text-[10px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md">
                            {preset.currency} ({preset.currencySymbol})
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5">{preset.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-stone-100">
                  <label className="font-bold text-stone-800 block">Initial Product Catalog</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCatalogMode('starter')}
                      className={`p-3.5 rounded-2xl border text-left transition-colors ${
                        catalogMode === 'starter'
                          ? 'bg-emerald-50/70 border-emerald-700'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <p className="font-bold text-stone-950">
                        Keep Curated Starter Catalog ({products.length} items)
                      </p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Launch immediately with ready-to-edit foodstuff staples, categories & pack pricing.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCatalogMode('clean')}
                      className={`p-3.5 rounded-2xl border text-left transition-colors ${
                        catalogMode === 'clean'
                          ? 'bg-emerald-50/70 border-emerald-700'
                          : 'bg-white border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <p className="font-bold text-stone-950">Start with Clean Product Slate</p>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Keeps your {categories.length} storefront categories and clears sample products for CSV/Excel import.
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: OWNER SECURITY & LAUNCH */}
            {step === 6 && (
              <div className="space-y-5">
                <div>
                  <h3 className="font-display text-base font-bold text-stone-950">
                    6. Lock Owner Credentials & Launch Store
                  </h3>
                  <p className="text-stone-500 mt-0.5">
                    Replace factory credentials with the store owner&apos;s private login and review your deployment summary.
                  </p>
                </div>

                <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-amber-950">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Protected Admin Console Credentials</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-semibold text-stone-700 block mb-1">
                        Owner Admin Email *
                      </label>
                      <input
                        type="email"
                        value={draftSettings.adminCredentials?.email || ''}
                        onChange={(e) =>
                          setDraftSettings((p) => ({
                            ...p,
                            adminCredentials: {
                              ...p.adminCredentials,
                              email: e.target.value,
                            },
                          }))
                        }
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 font-semibold text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-stone-700 block mb-1">
                        New Owner Password *
                      </label>
                      <input
                        type="password"
                        value={draftSettings.adminCredentials?.passwordHash || ''}
                        onChange={(e) =>
                          setDraftSettings((p) => ({
                            ...p,
                            adminCredentials: {
                              email: p.adminCredentials?.email || subscriberEmail,
                              passwordHash: e.target.value,
                            },
                          }))
                        }
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 font-mono text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-stone-700 block mb-1">
                        Confirm Password *
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 font-mono text-stone-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Launch Review Summary */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-2.5">
                  <p className="font-bold text-stone-900 uppercase tracking-wider text-[11px]">
                    Deployment Readiness Summary
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-[11px]">
                    <div>
                      <span className="text-stone-400 block">Store Brand</span>
                      <span className="font-bold text-stone-950">{draftSettings.storeName}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Subscription Plan</span>
                      <span className="font-bold text-emerald-800">
                        {activePlan.name} (${effectiveMonthlyPrice}/mo)
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">License Key</span>
                      <span className="font-mono font-bold text-stone-950">{licenseKey}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Currency</span>
                      <span className="font-bold text-stone-950">
                        {draftSettings.currency} ({draftSettings.currencySymbol})
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Payment Methods</span>
                      <span className="font-bold text-stone-950">
                        {activeMethods.length} enabled
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block">Initial Catalog</span>
                      <span className="font-bold text-stone-950">
                        {catalogMode === 'clean' ? '0 SKUs (Clean Import)' : `${products.length} SKUs Ready`}
                      </span>
                    </div>
                  </div>
                </div>

                <label className="flex items-center gap-2.5 cursor-pointer text-stone-700 font-medium">
                  <input
                    type="checkbox"
                    checked={downloadSnapshotOnLaunch}
                    onChange={(e) => setDownloadSnapshotOnLaunch(e.target.checked)}
                    className="w-4 h-4 text-emerald-700 rounded border-stone-300"
                  />
                  <span>Also download backup store bundle (.json) upon completion</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Footer Controls */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={step === 1 ? () => setIsSetupWizardOpen(false) : handleBack}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 font-semibold text-xs transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{step === 1 ? 'Cancel' : 'Previous Step'}</span>
          </button>

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors"
            >
              <span>Continue to Step {step + 1}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleFinishSetup(false)}
                className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Initializing...' : 'Launch Storefront'}
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleFinishSetup(true)}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors disabled:opacity-50"
              >
                <Rocket className="w-4 h-4" />
                <span>{isSubmitting ? 'Initializing...' : 'Launch & Open Admin'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
