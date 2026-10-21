import React, { useState } from 'react';
import { UserProfile } from '../../types';
import { authService } from '../../services/authService';
import { 
  User, Lock, Mail, Phone, Car, ArrowRight, X, AlertCircle, 
  CheckCircle2, Sparkles, KeyRound, ShieldCheck, Smartphone 
} from 'lucide-react';

interface UserAuthModalProps {
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
}

export const UserAuthModal: React.FC<UserAuthModalProps> = ({
  initialMode = 'login',
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'otp' | 'forgot'>(initialMode);
  
  // Login Form
  const [loginIdentifier, setLoginIdentifier] = useState('aarav.sharma@example.com');
  const [loginPassword, setLoginPassword] = useState('••••••••••');
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Signup Form
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPlate, setSignupPlate] = useState('');
  const [signupMake, setSignupMake] = useState('');

  // Status
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim()) {
      setError('Please provide your email address or mobile number.');
      return;
    }

    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      setIsLoading(false);
      const res = authService.login(loginIdentifier, loginPassword);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setError(res.message || 'Unable to log in with provided credentials.');
      }
    }, 600);
  };

  const handleSendOtp = () => {
    if (!loginIdentifier.trim()) {
      setError('Please enter your mobile phone number first.');
      return;
    }
    setOtpSent(true);
    setOtpCode('1234');
    setSuccessNotice('Demo verification code 1234 generated and auto-filled.');
    setTimeout(() => setSuccessNotice(null), 4000);
  };

  const handleOtpLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 4) {
      setError('Please enter a 4-digit verification OTP (Enter 1234 for demo).');
      return;
    }

    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      setIsLoading(false);
      const res = authService.loginWithOtp(loginIdentifier, otpCode);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setError(res.message || 'Invalid verification code.');
      }
    }, 600);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim() || !signupPhone.trim()) {
      setError('Please fill in your name, email, and phone number.');
      return;
    }

    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      setIsLoading(false);
      const res = authService.signUp({
        name: signupName,
        email: signupEmail,
        phone: signupPhone,
        vehiclePlate: signupPlate,
        vehicleMake: signupMake,
      });

      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setError('Could not complete registration. Please try again.');
      }
    }, 700);
  };

  const handleDemoDriverFill = () => {
    setLoginIdentifier('aarav.sharma@example.com');
    setLoginPassword('••••••••••');
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const res = authService.login('aarav.sharma@example.com');
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 relative">
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-xs">
              UP
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              UrbanPark Account Access
            </span>
          </div>

          <h3 className="text-xl font-bold tracking-tight mt-2">
            {mode === 'signup' ? 'Create Your UrbanPark Account' : 'Welcome to UrbanPark'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'signup'
              ? 'Find, reserve, and park seamlessly with live ANPR gate access.'
              : 'Sign in to access your saved spots, vehicles, and booking passes.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 flex gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`pb-2 border-b-2 transition-all ${
              mode === 'login' || mode === 'otp' || mode === 'forgot'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`pb-2 border-b-2 transition-all ${
              mode === 'signup'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* MODE: LOGIN (Password or OTP) */}
          {(mode === 'login' || mode === 'otp') && (
            <form onSubmit={isOtpLogin ? handleOtpLoginSubmit : handleLoginSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Email Address or Mobile Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    placeholder="name@example.com or +91 98201 44521"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {!isOtpLogin ? (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setIsOtpLogin(true)}
                      className="text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      Login via OTP instead
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">
                      4-Digit OTP Code
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsOtpLogin(false)}
                      className="text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      Use Password
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      placeholder="1234"
                      className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-center text-sm font-mono tracking-widest font-bold focus:outline-none focus:ring-1 focus:ring-blue-600"
                    />
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      {otpSent ? 'Resend' : 'Send Code'}
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Enter <strong className="font-mono text-slate-800">1234</strong> for quick demo authorization.
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition-colors disabled:opacity-60"
              >
                {isLoading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Sign In to UrbanPark</span>
                  </>
                )}
              </button>

              {/* Demo Account Shortcut */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDemoDriverFill}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>One-Click Login as Aarav Sharma (Demo Driver)</span>
                </button>
              </div>
            </form>
          )}

          {/* MODE: SIGN UP */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              {/* Welcome Bonus pill */}
              <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-2 text-xs text-blue-900 font-medium">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Get 150 ParkPoints (₹75 free credits) upon sign up!</span>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={e => setSignupName(e.target.value)}
                    placeholder="e.g. Priya Patil"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={e => setSignupEmail(e.target.value)}
                    placeholder="priya@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Mobile Phone *</label>
                  <input
                    type="tel"
                    required
                    value={signupPhone}
                    onChange={e => setSignupPhone(e.target.value)}
                    placeholder="+91 98200 99881"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Create Password *</label>
                <input
                  type="password"
                  required
                  value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Vehicle Plate (Optional)</label>
                  <input
                    type="text"
                    value={signupPlate}
                    onChange={e => setSignupPlate(e.target.value.toUpperCase())}
                    placeholder="MH 02 AB 1234"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs uppercase font-mono tracking-wider focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Car Make / Model</label>
                  <input
                    type="text"
                    value={signupMake}
                    onChange={e => setSignupMake(e.target.value)}
                    placeholder="e.g. Honda City / EV"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-60"
              >
                {isLoading ? <span>Registering...</span> : <span>Create Account & Start Parking</span>}
              </button>
            </form>
          )}

          <div className="text-center pt-2 text-[11px] text-slate-500">
            By continuing, you agree to UrbanPark’s{' '}
            <span className="text-slate-800 underline">Terms of Service</span> &{' '}
            <span className="text-slate-800 underline">Privacy Policy</span>.
          </div>
        </div>
      </div>
    </div>
  );
};
