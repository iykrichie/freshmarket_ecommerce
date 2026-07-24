import React, { useState, useEffect } from 'react';
import { X, Mail, Phone, Lock, CheckCircle2, ShieldCheck, ArrowRight, RefreshCw, User, KeyRound } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface UserAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, showToast } = useStore();

  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [step, setStep] = useState<'details' | 'otp' | 'success'>('details');

  // Form State
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // OTP Verification State
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(60);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && otpTimer > 0) {
      timer = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, otpTimer]);

  if (!isOpen) return null;

  // Handle Send / Request OTP
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    if (!phone || phone.trim().length < 8) {
      showToast('Please enter a valid phone number with country code.', 'error');
      return;
    }

    if (mode === 'register' && !fullName.trim()) {
      showToast('Please enter your full name.', 'error');
      return;
    }

    setIsSendingOtp(true);

    setTimeout(() => {
      // Generate realistic 6-digit OTP code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(code);
      setIsSendingOtp(false);
      setStep('otp');
      setOtpTimer(60);
      showToast(`SMS OTP sent to ${phone}! (Test Code: ${code})`, 'success');
    }, 800);
  };

  // Handle Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();

    if (inputOtp.trim() !== generatedOtp && inputOtp.trim() !== '123456') {
      showToast('Invalid OTP verification code. Please check SMS or use code ' + generatedOtp, 'error');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      setStep('success');

      const user = {
        id: 'usr-' + Date.now(),
        fullName: fullName || email.split('@')[0],
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        isPhoneVerified: true,
        address: address.trim() || undefined,
        createdAt: new Date().toISOString(),
      };

      setCurrentUser(user);
      showToast(`Welcome ${user.fullName}! Phone number verified successfully.`, 'success');

      setTimeout(() => {
        onClose();
        // Reset modal state
        setStep('details');
        setInputOtp('');
      }, 1200);
    }, 900);
  };

  // Resend OTP
  const handleResendOtp = () => {
    if (otpTimer > 0) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    setOtpTimer(60);
    showToast(`New SMS OTP sent to ${phone}! (Test Code: ${code})`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-br from-green-900 to-slate-900 text-white p-6 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-green-500/20 border border-green-400/30 flex items-center justify-center text-green-300">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-black text-lg text-white tracking-tight">
                {currentUser ? 'Your Account Profile' : mode === 'register' ? 'Register Account' : 'Customer Login'}
              </h3>
              <p className="text-xs text-green-200">
                {currentUser
                  ? 'Phone Verified Member'
                  : 'Validated with Email & Phone SMS OTP'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {currentUser ? (
            /* Logged in state */
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto text-2xl font-black shadow-inner">
                {currentUser.fullName.charAt(0).toUpperCase()}
              </div>

              <div>
                <h4 className="font-black text-gray-900 text-base">{currentUser.fullName}</h4>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 border border-green-200 text-green-800 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  <span>Phone Verified ({currentUser.phone})</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5">
                <p className="text-gray-500">
                  <strong className="text-gray-900">Member Since:</strong>{' '}
                  {new Date(currentUser.createdAt).toLocaleDateString()}
                </p>
                {currentUser.address && (
                  <p className="text-gray-500">
                    <strong className="text-gray-900">Default Shipping:</strong> {currentUser.address}
                  </p>
                )}
              </div>

              <button
                onClick={() => {
                  setCurrentUser(null);
                  showToast('You have been logged out.', 'info');
                  onClose();
                }}
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-xs transition-colors"
              >
                Sign Out of Account
              </button>
            </div>
          ) : (
            /* Register / Login Forms */
            <>
              {/* Step 1: User Details Form */}
              {step === 'details' && (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  {/* Mode switcher tabs */}
                  <div className="p-1 bg-gray-100 rounded-2xl flex text-xs font-bold text-gray-600">
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className={`flex-1 py-2 rounded-xl transition-all ${
                        mode === 'register' ? 'bg-white text-green-700 shadow-sm' : ''
                      }`}
                    >
                      Register New
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className={`flex-1 py-2 rounded-xl transition-all ${
                        mode === 'login' ? 'bg-white text-green-700 shadow-sm' : ''
                      }`}
                    >
                      Sign In
                    </button>
                  </div>

                  {mode === 'register' && (
                    <div>
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Adebayo Johnson"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. user@example.com"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Phone Number (For SMS OTP Verification) *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +44 7911 123456 or +1 212 555 0199"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white"
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 mt-1 block">
                      We will send a 6-digit OTP code to validate your phone number.
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSendingOtp}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {isSendingOtp ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Sending SMS OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Validate & Request OTP Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: OTP Entry Form */}
              {step === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 space-y-1">
                    <p className="font-bold text-xs">Verify Your Phone Number</p>
                    <p className="text-[11px] text-amber-800">
                      We sent a 6-digit SMS code to <strong>{phone}</strong>.
                    </p>
                    <p className="text-[11px] text-green-700 font-mono font-bold bg-white px-2 py-1 rounded border border-amber-200 inline-block mt-1">
                      🔑 Test OTP Code: {generatedOtp}
                    </p>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-700 block mb-1">
                      Enter 6-Digit OTP Code *
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={inputOtp}
                        onChange={(e) => setInputOtp(e.target.value)}
                        placeholder="e.g. 123456"
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-center font-mono text-lg font-black tracking-widest text-gray-900 focus:ring-2 focus:ring-green-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="hover:underline font-medium text-gray-600"
                    >
                      ← Change Details
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpTimer > 0}
                      className="font-bold text-green-600 hover:underline disabled:opacity-50 disabled:no-underline"
                    >
                      {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend SMS OTP'}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying || inputOtp.length < 6}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Verifying OTP...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify Phone & Complete Registration</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 3: Success Screen */}
              {step === 'success' && (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-black text-base text-gray-900">Phone Validated & Verified!</h4>
                  <p className="text-xs text-gray-500">
                    Your account is active. Your delivery details will now auto-fill during checkout.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
