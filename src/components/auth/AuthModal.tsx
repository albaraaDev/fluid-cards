'use client';

import { useAuth } from '@/hooks/useAuth';
import {
  Cloud,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  X
} from 'lucide-react';
import React, { useState } from 'react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
  const { signIn, signUp, loading, error } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('يرجى ملء جميع الحقول');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setFormError('كلمات المرور غير متطابقة');
      return;
    }

    if (password.length < 6) {
      setFormError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onClose();
    } catch (err) {
      // Error is handled by useAuth hook
    }
  };

  const displayError = formError || error;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
      <div className="bg-gray-800 rounded-3xl p-6 lg:p-8 max-w-md w-full border border-gray-700 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Cloud size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">
                {mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء حساب'}
              </h3>
              <p className="text-sm text-gray-400">
                {mode === 'signin' ? 'ادخل لحفظ بياناتك في السحابة' : 'أنشئ حساب لحفظ بياناتك'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <X className="text-gray-400" size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              البريد الإلكتروني
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 pl-12 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="example@email.com"
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              كلمة المرور
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 pl-12 pr-12 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password (Signup only) */}
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 pl-12 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {displayError && (
            <div className="bg-red-900/30 border border-red-800/50 rounded-xl p-3">
              <p className="text-red-400 text-sm">{displayError}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-all"
          >
            {loading ? 'جاري التحميل...' : mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
          </button>
        </form>

        {/* Mode Switch */}
        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm">
            {mode === 'signin' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}
            <button
              onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              className="text-blue-400 hover:text-blue-300 font-medium ml-2 transition-colors"
            >
              {mode === 'signin' ? 'إنشاء حساب' : 'تسجيل الدخول'}
            </button>
          </p>
        </div>

        {/* Info */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          بياناتك محمية ومشفرة. لن نرسل لك رسائل إعلانية.
        </div>
      </div>
    </div>
  );
}