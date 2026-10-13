import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Download,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { db } from '../../lib/storage';
import { AuthUser } from '../../types';
import { AdalajLogo } from '../common/AdalajLogo';
import { triggerAutomaticJsonBackup } from '../../lib/backup';
import { useTheme } from '../../context/ThemeContext';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser, backupFilename?: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [autoBackupOnLogin, setAutoBackupOnLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please provide both your registered email address and password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = db.login(cleanEmail, cleanPassword);
      if (res.success && res.user) {
        let backupFilename: string | undefined;
        if (autoBackupOnLogin) {
          const backupRes = triggerAutomaticJsonBackup(res.user.name);
          if (backupRes.success) {
            backupFilename = backupRes.filename;
          }
        }
        onLoginSuccess(res.user, backupFilename);
      } else {
        setError(res.message || 'Invalid email or password. Access denied.');
        setLoading(false);
      }
    }, 200);
  };

  return (
    <div
      className={`min-h-screen flex flex-col justify-center items-center px-4 py-8 font-sans transition-colors duration-200 ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-[#FAF8F5] text-slate-900'
      }`}
    >
      <div className="w-full max-w-md mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center mb-2">
            <AdalajLogo variant="full" height={48} />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#9A2229]/10 text-[#9A2229] dark:bg-amber-500/10 dark:text-amber-300 border border-[#9A2229]/20 dark:border-amber-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Role-Based Operations ERP Gate</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Sarkhej-Gandhinagar Highway · Adalaj, Gujarat · Manufacturing & Financial Intelligence
          </p>
        </div>

        {/* Main Login Card */}
        <div
          className={`p-6 sm:p-8 rounded-2xl border shadow-xl transition-all ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 shadow-slate-950/50'
              : 'bg-white border-amber-900/10 shadow-slate-200/60'
          }`}
        >
          <div className="border-b pb-4 mb-6 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#9A2229] dark:text-amber-400" />
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Please enter your authorized corporate credentials to access your designated workspace.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form
            id="enterprise-login-form"
            name="login"
            method="post"
            action="#"
            autoComplete="on"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div>
              <label htmlFor="enterprise-email" className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="enterprise-email"
                  name="username"
                  type="email"
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@enterprise.com"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#9A2229]/30 ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50/70 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="enterprise-password" className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  id="enterprise-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#9A2229]/30 ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-slate-50/70 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Auto-backup download on login toggle */}
            <div
              className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                isDark
                  ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                  : 'bg-amber-50/60 border-amber-200/60 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div>
                  <div className="font-bold text-[11px]">Automatic Database JSON Backup</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Saves encrypted snapshot to disk upon login
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={autoBackupOnLogin}
                onChange={(e) => setAutoBackupOnLogin(e.target.checked)}
                className="w-4 h-4 text-[#9A2229] rounded cursor-pointer accent-[#9A2229]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#9A2229] hover:bg-[#851C22] shadow-md hover:shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating Credentials...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Security Notice */}
        <div className="text-center text-[11px] text-slate-400 space-y-1">
          <p>Adalaj Operations ERP · Integer Paise Precision & Non-Destructive Ledger</p>
          <p className="text-[10px] opacity-75">GSTIN: 24AAGCS9412F1Z4 · FoSCoS FSSAI #10724026000192</p>
        </div>
      </div>
    </div>
  );
};
