import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { Input } from '../../components/common/Input';
import { authService } from '../../services/authService';
import { useApp } from '../../context/AppContext';

export const SignIn = () => {
  const navigate = useNavigate();
  const { showToast, loginUser } = useApp();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validate form
  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError('');

    if (isLoading) return; // Prevent duplicate submissions
    if (!validate()) return;

    try {
      setIsLoading(true);
      const res = await authService.signIn({
        email: formData.email.trim(),
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      loginUser(res.user, res.token, formData.rememberMe);
      showToast(`Welcome back, ${res.user?.fullName || 'User'}!`, 'success');
      // Navigate to dashboard only after confirmed successful authentication
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setBackendError(err.message || 'Authentication failed. Please verify your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Autofill Helper
  const fillDemoCredentials = () => {
    setFormData({
      email: 'subash@trackgpt.enterprise.io',
      password: 'password123',
      rememberMe: true,
    });
    setErrors({});
    setBackendError('');
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-content-primary">
            Welcome back
          </h2>
          <p className="mt-1.5 text-xs text-content-secondary leading-relaxed">
            Sign in to TrackGPT to monitor your inventory, forecast demand, and manage your supply chain.
          </p>
        </div>

        {/* Demo Account Quick-Fill Pill */}
        <div className="p-3 bg-brand-50/70 border border-brand-200 rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-brand-900 font-medium">
            <Sparkles className="w-4 h-4 text-brand-600 shrink-0" />
            <span>Fast test with enterprise demo account</span>
          </div>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="text-xs font-bold text-brand-700 hover:text-brand-900 bg-white px-2.5 py-1 rounded-md border border-brand-200 shadow-xs hover:bg-brand-50 transition-colors"
          >
            Autofill
          </button>
        </div>

        {/* Backend Error Banner */}
        {backendError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="font-medium">{backendError}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Email field */}
          <Input
            label="Email address"
            id="signin-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="subash@company.com"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: null });
            }}
            error={errors.email}
            leftIcon={Mail}
          />

          {/* Password field with independent eye toggle */}
          <div>
            <PasswordInput
              label="Password"
              id="signin-password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              error={errors.password}
            />

            {/* Remember Me & Forgot Password Row */}
            <div className="mt-2.5 flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-content-secondary hover:text-content-primary select-none">
                <input
                  type="checkbox"
                  id="remember-me"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="rounded border-surface-border text-brand-600 focus:ring-brand-500 w-3.5 h-3.5 cursor-pointer"
                />
                <span>Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <AuthButton type="submit" isLoading={isLoading} disabled={isLoading}>
              Sign In
            </AuthButton>
          </div>
        </form>

        {/* Footer Navigation Link */}
        <div className="pt-4 border-t border-surface-border text-center text-xs text-content-secondary">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-bold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
};

