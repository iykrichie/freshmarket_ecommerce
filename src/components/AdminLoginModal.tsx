import React, { useState } from 'react';
import { X, Lock, Mail, ShieldAlert, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC = ({ isOpen, onClose, onSuccess }) => {
  const { storeSettings, setIsAdminAuthenticated, showToast } = useStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  if (!isOpen) return null;

  const expectedEmail = storeSettings.adminCredentials?.email || 'admin@freshmarketglobal.com';
  const expectedPassword = storeSettings.adminCredentials?.passwordHash || 'admin12345';

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both admin email and password.');
      return;
    }

    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);

      if (
        email.trim().toLowerCase() === expectedEmail.toLowerCase() &&
        password.trim() === expectedPassword
      ) {
        setIsAdminAuthenticated(true);
        showToast('Business Owner Access Granted!', 'success');
        onSuccess();
        onClose();
        // Clear sensitive inputs
        setPassword('');
      } else {
        setErrorMsg('Invalid admin credentials. Please verify your email & password.');
        showToast('Authentication failed. Check credentials.', 'error');
      }
    }, 700);
  };

  const handleAutoFillTest = () => {
    setEmail(expectedEmail);
    setPassword(expectedPassword);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white tracking-tight">Business Owner Portal</h3>
              <p className="text-xs text-slate-400">Secure Admin Dashboard Authentication</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Default Credentials Badge */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 text-xs space-y-1.5">
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1 text-amber-900">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Default Owner Credentials</span>
              </span>
              <button
                type="button"
                onClick={handleAutoFillTest}
                className="text-[10px] bg-amber-200 hover:bg-amber-300 text-amber-900 px-2 py-0.5 rounded-full font-black uppercase transition-colors"
              >
                Auto-fill
              </button>
            </div>
            <p className="font-mono text-[11px] text-amber-900">
              Email: <strong>{expectedEmail}</strong><br />
              Password: <strong>{expectedPassword}</strong>
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-200 text-xs font-medium flex items-center gap-2 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">
                Owner Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@freshmarketglobal.com"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-700 block mb-1">
                Security Password *
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isAuthenticating ? (
                <span>Verifying Security Key...</span>
              ) : (
                <>
                  <span>Unlock Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
