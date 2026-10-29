import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { AuthButton } from '../../components/auth/AuthButton';
import { Input } from '../../components/common/Input';
import { authService } from '../../services/authService';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [backendError, setBackendError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setError('Email address is required');
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid registered email address');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError('');

    if (isLoading) return; // Prevent duplicate submissions
    if (!validate()) return;

    try {
      setIsLoading(true);
      await authService.requestPasswordReset(email.trim());
      setIsSubmitted(true);
    } catch (err) {
      setBackendError(err.message || 'Unable to process your password reset request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        {!isSubmitted ? (
          <>
            {/* Subtle Key Icon & Header */}
            <div>
              <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 mb-4 shadow-xs">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-content-primary">
                Forgot your password?
              </h2>
              <p className="mt-1.5 text-xs text-content-secondary leading-relaxed">
                Don't worry! Enter your email address, and we'll help you reset your TrackGPT password.
              </p>
            </div>

            {/* Error Banner */}
            {backendError && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="font-medium">{backendError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Email Address"
                id="forgot-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="Enter your registered email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                error={error}
                leftIcon={Mail}
              />

              <div className="pt-2">
                <AuthButton type="submit" isLoading={isLoading} disabled={isLoading}>
                  Send Reset Link
                </AuthButton>
              </div>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="text-center space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto shadow-xs">
              <Mail className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-2xl font-bold tracking-tight text-content-primary">
                Check your email
              </h2>
              <p className="mt-2 text-xs text-content-secondary leading-relaxed max-w-sm mx-auto">
                If an account exists for <strong className="text-content-primary">{email}</strong>, password reset instructions will be sent to it. Please check your inbox and spam folder.
              </p>
            </div>

            <div className="pt-2">
              <Link to="/signin" className="w-full block">
                <AuthButton type="button" leftIcon={ArrowLeft}>
                  Return to Sign In
                </AuthButton>
              </Link>
            </div>
          </div>
        )}

        {/* Footer Navigation Link */}
        <div className="pt-4 border-t border-surface-border text-center text-xs text-content-secondary">
          Remember your password?{' '}
          <Link
            to="/signin"
            className="font-bold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

