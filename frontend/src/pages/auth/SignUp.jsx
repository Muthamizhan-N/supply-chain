import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Building, AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';
import { AuthLayout } from '../../components/auth/AuthLayout';
import { PasswordInput } from '../../components/auth/PasswordInput';
import { AuthButton } from '../../components/auth/AuthButton';
import { Input } from '../../components/common/Input';
import { authService } from '../../services/authService';
import { useApp } from '../../context/AppContext';

export const SignUp = () => {
  const navigate = useNavigate();
  const { showToast, loginUser } = useApp();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Compute password strength score (0 to 4)
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: 'Too weak', color: 'bg-slate-200' };
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-blue-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(formData.password);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Work email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid business email address';
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must agree to the Terms of Service and Privacy Policy';
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
      const res = await authService.signUp({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        companyName: formData.companyName.trim(),
        password: formData.password,
      });

      loginUser(res.user, res.token, true);
      showToast(`Account created successfully! Welcome to TrackGPT, ${res.user?.fullName}.`, 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setBackendError(err.message || 'Failed to register account. Please check your inputs and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Heading */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-content-primary">
            Create your TrackGPT account
          </h2>
          <p className="mt-1.5 text-xs text-content-secondary leading-relaxed">
            Get started with intelligent inventory management and AI-powered supply chain insights.
          </p>
        </div>

        {/* Backend Error Banner */}
        {backendError && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span className="font-medium">{backendError}</span>
          </div>
        )}

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          {/* Full Name */}
          <Input
            label="Full name"
            id="signup-name"
            name="fullName"
            type="text"
            required
            autoComplete="name"
            placeholder="Subash Kumar"
            value={formData.fullName}
            onChange={(e) => {
              setFormData({ ...formData, fullName: e.target.value });
              if (errors.fullName) setErrors({ ...errors, fullName: null });
            }}
            error={errors.fullName}
            leftIcon={User}
          />

          {/* Work Email */}
          <Input
            label="Work email"
            id="signup-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="subash@enterprise.com"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: null });
            }}
            error={errors.email}
            leftIcon={Mail}
          />

          {/* Company Name */}
          <Input
            label="Company name"
            id="signup-company"
            name="companyName"
            type="text"
            required
            autoComplete="organization"
            placeholder="e.g. Subash Supply Chain Ltd."
            value={formData.companyName}
            onChange={(e) => {
              setFormData({ ...formData, companyName: e.target.value });
              if (errors.companyName) setErrors({ ...errors, companyName: null });
            }}
            error={errors.companyName}
            leftIcon={Building}
          />

          {/* Password (Independent visibility toggle) */}
          <div>
            <PasswordInput
              label="Password"
              id="signup-password"
              name="password"
              required
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={(e) => {
                setFormData({ ...formData, password: e.target.value });
                if (errors.password) setErrors({ ...errors, password: null });
              }}
              error={errors.password}
            />

            {/* Password strength meter */}
            {formData.password && (
              <div className="mt-2 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-content-secondary">Password strength:</span>
                  <span className="font-semibold text-content-primary">{strength.label}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 h-1.5">
                  <div className={`rounded-full ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`} />
                  <div className={`rounded-full ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`} />
                  <div className={`rounded-full ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`} />
                  <div className={`rounded-full ${strength.score >= 4 ? strength.color : 'bg-slate-200'}`} />
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password (Independent visibility toggle) */}
          <PasswordInput
            label="Confirm password"
            id="signup-confirm-password"
            name="confirmPassword"
            required
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={(e) => {
              setFormData({ ...formData, confirmPassword: e.target.value });
              if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
            }}
            error={errors.confirmPassword}
          />

          {/* Terms and conditions acceptance */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs select-none">
              <input
                type="checkbox"
                id="accept-terms"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={(e) => {
                  setFormData({ ...formData, acceptTerms: e.target.checked });
                  if (errors.acceptTerms) setErrors({ ...errors, acceptTerms: null });
                }}
                className="mt-0.5 rounded border-surface-border text-brand-600 focus:ring-brand-500 w-3.5 h-3.5 cursor-pointer"
              />
              <span className="text-content-secondary leading-normal">
                I agree to TrackGPT's{' '}
                <a href="#terms" onClick={(e) => e.preventDefault()} className="text-brand-600 font-semibold hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" onClick={(e) => e.preventDefault()} className="text-brand-600 font-semibold hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>
            {errors.acceptTerms && (
              <p className="mt-1 text-xs text-red-600 font-medium">{errors.acceptTerms}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <AuthButton type="submit" isLoading={isLoading} disabled={isLoading}>
              Create Account
            </AuthButton>
          </div>
        </form>

        {/* Footer Navigation Link */}
        <div className="pt-4 border-t border-surface-border text-center text-xs text-content-secondary">
          Already have an account?{' '}
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

