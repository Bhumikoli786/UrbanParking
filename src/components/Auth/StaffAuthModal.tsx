import React, { useState } from 'react';
import { UserRole } from '../../types';
import { authService } from '../../services/authService';
import { ShieldCheck, Building2, Lock, ArrowRight, X, AlertCircle, KeyRound, Check } from 'lucide-react';

interface StaffAuthModalProps {
  onClose: () => void;
  onSuccess: (role: UserRole) => void;
}

export const StaffAuthModal: React.FC<StaffAuthModalProps> = ({ onClose, onSuccess }) => {
  const [selectedRole, setSelectedRole] = useState<'operator' | 'admin'>('operator');
  const [email, setEmail] = useState('rajesh.mehra@urbanpark.in');
  const [password, setPassword] = useState('••••••••••');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: 'operator' | 'admin') => {
    setSelectedRole(role);
    setError(null);
    if (role === 'operator') {
      setEmail('rajesh.mehra@urbanpark.in');
    } else {
      setEmail('devika.sen@urbanpark.in');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide an enterprise email address.');
      return;
    }

    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      setIsLoading(false);
      // Elevate role in authService
      authService.switchRole(selectedRole);
      onSuccess(selectedRole);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-200 relative">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Lock className="w-4 h-4" />
            <span>Restricted Staff & Partner Gateway</span>
          </div>

          <h3 className="text-xl font-extrabold tracking-tight">
            Commercial & Operations Portal
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Access reserved strictly for verified parking lot operators and UrbanPark system administrators.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Role selector tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => handleRoleSelect('operator')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedRole === 'operator'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Parking Operator</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                selectedRole === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Platform Admin</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Enterprise Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Security Password / Access Token
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-60"
            >
              {isLoading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>Authenticate as {selectedRole === 'operator' ? 'Operator' : 'Admin'}</span>
                </>
              )}
            </button>
          </form>

          {/* Demonstration Notice */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700">Pre-configured Demo Credentials:</div>
            <div>• <strong>Operator:</strong> rajesh.mehra@urbanpark.in (BKC Mobility Tower)</div>
            <div>• <strong>Admin:</strong> devika.sen@urbanpark.in (UrbanPark Platform HQ)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
