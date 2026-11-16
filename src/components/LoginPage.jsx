import React, { useState } from 'react';
import { Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { loginUser } from '../services/api.js';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('cogniwide@aischennai.org');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser(email);
      if (res?.success && res?.user) {
        localStorage.setItem('raptor360_user', JSON.stringify(res.user));
        onLoginSuccess(res.user);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'Email not found in AISC staff directory.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#f8fafc] text-slate-800 p-4 select-none">
      <div className="w-full max-w-[420px]">
        {/* Main Clean Card */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-lg shadow-slate-200/60">
          {/* AISC Official Logo Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <img
              src="/aisc-logo.png"
              alt="American International School Chennai"
              className="h-16 w-auto object-contain mb-5"
            />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Sign In
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              to continue to Raptor360 Analytics
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@aischennai.org"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50/70 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#1e40af] hover:bg-[#1d4ed8] text-white font-semibold text-xs shadow-sm transition disabled:opacity-60 cursor-pointer mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Minimal Footer */}
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          American International School Chennai
        </p>
      </div>
    </div>
  );
}
