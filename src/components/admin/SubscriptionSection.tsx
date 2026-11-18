import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import {
  SUBSCRIPTION_PLANS,
  computeRenewalDate,
  generateLicenseKey,
  inferPlanFromLicenseKey,
} from '../../data/subscriptionPlans';
import { BillingCycle, SubscriptionPlanId } from '../../types';
import {
  Check,
  Copy,
  CreditCard,
  Download,
  KeyRound,
  RefreshCw,
  Rocket,
  Server,
  ShieldCheck,
  Terminal,
} from 'lucide-react';

export const SubscriptionSection: React.FC = () => {
  const {
    subscription,
    updateSubscription,
    products,
    deliveryZones,
    categories,
    coupons,
    storeSettings,
    setIsSetupWizardOpen,
    exportStoreSnapshot,
    showToast,
  } = useStore();

  const [licenseInput, setLicenseInput] = useState(subscription.licenseKey);
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>(subscription.billingCycle);
  const [isSyncing, setIsSyncing] = useState(false);

  const productUsagePct = Math.min(
    100,
    Math.round((products.length / Math.max(1, subscription.maxProducts)) * 100)
  );
  const zoneUsagePct = Math.min(
    100,
    Math.round((deliveryZones.length / Math.max(1, subscription.maxZones)) * 100)
  );

  const handleApplyLicense = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = licenseInput.trim().toUpperCase();
    if (!cleaned || cleaned.length < 6) {
      showToast('Please enter a valid subscription license key.', 'error');
      return;
    }

    const inferredPlan = inferPlanFromLicenseKey(cleaned) || subscription.planId;
    const planSpec =
      SUBSCRIPTION_PLANS.find((p) => p.id === inferredPlan) || SUBSCRIPTION_PLANS[1];

    updateSubscription({
      ...subscription,
      planId: planSpec.id,
      planName: planSpec.name,
      status: cleaned.includes('TRIAL') ? 'trial' : 'active',
      billingCycle: selectedCycle,
      licenseKey: cleaned,
      monthlyPrice:
        selectedCycle === 'annual' ? planSpec.annualMonthlyPrice : planSpec.monthlyPrice,
      maxProducts: planSpec.maxProducts,
      maxZones: planSpec.maxZones,
      renewsAt: computeRenewalDate(selectedCycle),
    });
  };

  const handleSelectPlan = (planId: SubscriptionPlanId) => {
    const spec = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
    if (!spec) return;
    const nextKey = generateLicenseKey(planId);
    setLicenseInput(nextKey);
    updateSubscription({
      ...subscription,
      planId: spec.id,
      planName: spec.name,
      status: 'active',
      billingCycle: selectedCycle,
      licenseKey: nextKey,
      monthlyPrice: selectedCycle === 'annual' ? spec.annualMonthlyPrice : spec.monthlyPrice,
      maxProducts: spec.maxProducts,
      maxZones: spec.maxZones,
      renewsAt: computeRenewalDate(selectedCycle),
    });
  };

  const handleServerSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/tenant/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auth: {
            email: storeSettings.adminCredentials?.email,
            password: storeSettings.adminCredentials?.passwordHash,
          },
          storeSettings,
          categories,
          products,
          deliveryZones,
          coupons,
          subscription,
        }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        showToast('Saved live storefront, catalog & subscription to server config!', 'success');
      } else {
        showToast(data.error || 'Server sync skipped — settings remain saved in browser.', 'info');
      }
    } catch {
      showToast('Server sync unavailable in static preview mode.', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadPackageBundle = () => {
    const snapshot = exportStoreSnapshot();
    const slug =
      storeSettings.storeName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_|_$/g, '') || 'store';
    const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug}_subscription_package.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded full white-label package bundle!', 'success');
  };

  const handleCopyCli = (command: string) => {
    navigator.clipboard.writeText(command);
    showToast('Command copied to clipboard!', 'info');
  };

  return (
    <div className="space-y-6 text-xs">
      {/* Top Status & Quick Actions Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="font-display text-lg font-bold text-stone-950">
                Subscription, License & Onboarding
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
                  subscription.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : subscription.status === 'trial'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {subscription.status}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  subscription.setupCompleted
                    ? 'bg-stone-100 text-stone-800'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {subscription.setupCompleted ? 'Initialized' : 'Setup Pending'}
              </span>
            </div>
            <p className="text-stone-500">
              Manage the buyer&apos;s subscription tier, license key, server persistence, and re-run the one-time setup wizard.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setIsSetupWizardOpen(true)}
              className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <Rocket className="w-4 h-4" />
              <span>
                {subscription.setupCompleted ? 'Re-run Setup Wizard' : 'Launch Setup Wizard'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleServerSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync to Server Config</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPackageBundle}
              className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Package (.json)</span>
            </button>
          </div>
        </div>

        {/* Active Plan Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
            <span className="text-[11px] font-semibold text-stone-500 uppercase">Current Plan</span>
            <p className="font-display text-base font-bold text-stone-950">
              {subscription.planName}
            </p>
            <p className="text-[11px] text-emerald-800 font-semibold font-mono tabular-nums">
              ${subscription.monthlyPrice}/mo · {subscription.billingCycle}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
            <span className="text-[11px] font-semibold text-stone-500 uppercase">License Key</span>
            <p className="font-mono text-sm font-bold text-stone-950 truncate">
              {subscription.licenseKey}
            </p>
            <p className="text-[11px] text-stone-500 truncate">
              Renews: {new Date(subscription.renewsAt).toLocaleDateString()}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-stone-500 uppercase">SKU Quota</span>
              <span className="font-mono font-bold text-stone-900 tabular-nums">
                {products.length} / {subscription.maxProducts >= 10000 ? '∞' : subscription.maxProducts}
              </span>
            </div>
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-700 rounded-full transition-all"
                style={{ width: `${productUsagePct}%` }}
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-stone-500 uppercase">
                Delivery Zones
              </span>
              <span className="font-mono font-bold text-stone-900 tabular-nums">
                {deliveryZones.length} / {subscription.maxZones >= 500 ? '∞' : subscription.maxZones}
              </span>
            </div>
            <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{ width: `${zoneUsagePct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Plan Tiers & License Activation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-stone-200/80 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-sm font-bold text-stone-950 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-700" />
                <span>Subscription Tiers</span>
              </h3>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Upgrade or switch the subscriber&apos;s plan limits instantly.
              </p>
            </div>

            <div className="inline-flex p-1 bg-stone-100 rounded-xl border border-stone-200">
              <button
                type="button"
                onClick={() => setSelectedCycle('monthly')}
                className={`px-3 py-1 rounded-lg font-semibold ${
                  selectedCycle === 'monthly' ? 'bg-white text-stone-950 shadow-2xs' : 'text-stone-500'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setSelectedCycle('annual')}
                className={`px-3 py-1 rounded-lg font-semibold ${
                  selectedCycle === 'annual' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-stone-500'
                }`}
              >
                Annual (-18%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isCurrent = subscription.planId === plan.id;
              const price =
                selectedCycle === 'annual' ? plan.annualMonthlyPrice : plan.monthlyPrice;
              return (
                <div
                  key={plan.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 ${
                    isCurrent
                      ? 'border-emerald-700 bg-emerald-50/50'
                      : 'border-stone-200 bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display font-bold text-sm text-stone-950">
                        {plan.name}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold bg-emerald-700 text-white px-2 py-0.5 rounded-md">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500">{plan.tagline}</p>
                    <p className="text-xl font-extrabold font-mono tabular-nums text-stone-950">
                      ${price}
                      <span className="text-[11px] font-normal text-stone-500">/mo</span>
                    </p>
                    <ul className="space-y-1.5 pt-2 border-t border-stone-100 text-[11px] text-stone-700">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan.id)}
                    className={`w-full py-2 rounded-xl font-semibold transition-colors ${
                      isCurrent
                        ? 'bg-emerald-700 text-white'
                        : 'bg-stone-900 hover:bg-stone-800 text-white'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : `Switch to ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* License Activation & Provisioning CLI Guide */}
        <div className="lg:col-span-4 space-y-6">
          <form
            onSubmit={handleApplyLicense}
            className="bg-white p-6 rounded-2xl border border-stone-200/80 space-y-4"
          >
            <h3 className="font-display text-sm font-bold text-stone-950 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-emerald-700" />
              <span>Activate / Rotate License Key</span>
            </h3>
            <p className="text-[11px] text-stone-500">
              Enter a buyer&apos;s subscription key (`FM-STR-...`, `FM-GRW-...`, `FM-ENT-...`) to activate or upgrade this instance.
            </p>
            <input
              type="text"
              value={licenseInput}
              onChange={(e) => setLicenseInput(e.target.value.toUpperCase())}
              placeholder="FM-GRW-XXXX-XXXX"
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 font-mono font-bold text-stone-900 uppercase"
            />
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Apply License Key</span>
            </button>
          </form>

          <div className="bg-stone-950 text-stone-100 p-6 rounded-2xl space-y-3">
            <h3 className="font-display text-sm font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>Ship & Provision New Subscriber</span>
            </h3>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Run one of these self-contained package commands when deploying a fresh subscriber server:
            </p>

            <div className="space-y-2">
              {[
                { label: 'Interactive CLI Setup', cmd: 'npm run init' },
                { label: 'Auto-Launch Browser Wizard', cmd: 'npm run init -- --web-wizard' },
                { label: 'Build & Start Production', cmd: 'npm run build && npm start' },
              ].map((item) => (
                <div
                  key={item.cmd}
                  className="bg-stone-900 border border-stone-800 rounded-xl p-2.5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <span className="text-[10px] text-stone-400 block">{item.label}</span>
                    <code className="text-[11px] font-mono text-emerald-300 truncate block">
                      {item.cmd}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyCli(item.cmd)}
                    className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 shrink-0"
                    title="Copy command"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-stone-400">
              <Server className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Config persists in data/tenant-config.json</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
