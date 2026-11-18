import React, { useState } from 'react';
import { X, Lock, Mail, ShieldAlert, ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { storeSettings, subscription, setIsAdminAuthenticated, showToast } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const expectedEmail = storeSettings.adminCredentials?.email || 'admin@freshmarketglobal.com';
  const expectedPassword = storeSettings.adminCredentials?.passwordHash || 'admin12345';
  const isUsingFactoryDefaults =
    !subscription.setupCompleted &&
    expectedEmail.toLowerCase() === 'admin@freshmarketglobal.com' &&
    expectedPassword === 'admin12345';

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both admin email and password.');
      return;
    }

    setIsAuthenticating(true);

    let serverOk: boolean | null = null;
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.serverManaged) {
          serverOk = Boolean(data.ok);
        }
      }
    } catch {
      // Static mode fallback
    }

    const localOk =
      email.trim().toLowerCase() === expectedEmail.toLowerCase() &&
      password.trim() === expectedPassword;

    setIsAuthenticating(false);

    if (serverOk === true || (serverOk === null && localOk)) {
      setIsAdminAuthenticated(true);
      showToast('Business Owner Access Granted!', 'success');
      onSuccess();
      onClose();
      setPassword('');
    } else {
      setErrorMsg('Invalid admin credentials. Please verify your email & password.');
      showToast('Authentication failed. Check credentials.', 'error');
    }
  };

  const handleAutoFillDemo = () => {
    if (!isUsingFactoryDefaults) return;
    setEmail(expectedEmail);
    setPassword(expectedPassword);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Header */}
        <div className="bg-stone-950 text-white p-6 flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-white tracking-tight">
                Store Owner Portal
              </h3>
              <p className="text-xs text-stone-400">Protected Admin Console Sign-In</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close admin login"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {isUsingFactoryDefaults ? (
            <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-xs space-y-1.5">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5 text-amber-900">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Default Demo Credentials</span>
                </span>
                <button
                  type="button"
                  onClick={handleAutoFillDemo}
                  className="text-[11px] bg-amber-200 hover:bg-amber-300 text-amber-950 px-2.5 py-0.5 rounded-lg font-bold transition-colors"
                >
                  Auto-fill
                </button>
              </div>
              <p className="font-mono text-[11px] text-amber-900">
                Email: <strong>{expectedEmail}</strong>
                <br />
                Password: <strong>{expectedPassword}</strong>
              </p>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 text-xs flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                Custom store owner credentials are active. Sign in with your configured admin email and password.
              </span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 text-xs font-medium flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Owner Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@yourstore.com"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Security Password *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-amber-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isAuthenticating ? (
                <span>Verifying Credentials...</span>
              ) : (
                <>
                  <span>Unlock Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-amber-300" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
