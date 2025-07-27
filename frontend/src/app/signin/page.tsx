'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  EnvelopeIcon, 
  ShieldCheckIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { processApiError } from '../../lib/errorUtils';

const SignInPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username) {
      newErrors.username = 'Username or email is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await login({
        username: formData.username,
        password: formData.password
      });
      
      // Always redirect to dashboard - ProtectedRoute will handle profile completion check
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Sign in error:', error);
      const processedError = processApiError(error);
      setErrors({ general: processedError.general || 'Invalid credentials. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-blue-500/10 to-purple-500/20 relative">
        <div className="flex flex-col justify-center px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-12 h-12 flex items-center justify-center">
                <img src="/logo.png" alt="Dominion Trust Capital" className="w-12 h-12 object-contain" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                Dominion<span className="text-primary">Trust</span>
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Welcome back to
              <br />
              <span className="text-primary">secure banking</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-md">
              Access your account with bank-level security and 
              manage your finances with confidence.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-muted-foreground">256-bit SSL encryption</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-muted-foreground">FDIC insured up to $250,000</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-muted-foreground">24/7 fraud monitoring</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-blue-500/5 to-purple-500/10" />
        <div className="absolute top-20 right-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
      </div>

      {/* Right Side - Sign In Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src="/logo.png" alt="Dominion Trust Capital" className="w-10 h-10 object-contain" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Dominion<span className="text-primary">Trust</span>
            </span>
          </div>

          <Card variant="elevated" className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Sign in to your account
                </h2>
                <p className="text-muted-foreground">
                  Welcome back! Please enter your details.
                </p>
              </div>

              {errors.general && (
                <Card variant="default" className="p-4 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800/50">
                  <div className="flex items-start space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-600 dark:text-orange-400">{errors.general}</p>
                  </div>
                </Card>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  name="username"
                  type="text"
                  label="Username or Email"
                  placeholder="Enter your username or email"
                  value={formData.username}
                  onChange={handleInputChange}
                  error={errors.username}
                  leftIcon={<EnvelopeIcon className="h-5 w-5" />}
                  variant="filled"
                  required
                />

                <Input
                  name="password"
                  type="password"
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  variant="filled"
                  required
                />

                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-background"
                    />
                    <span className="text-sm text-muted-foreground">Remember me</span>
                  </label>
                  
                  <Link 
                    href="/forgot-password" 
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  loading={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                  {!isLoading && <ArrowRightIcon className="ml-2 h-4 w-4" />}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link 
                    href="/signup" 
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Sign up for free
                  </Link>
                </p>
              </div>

              {/* Security Notice */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <ShieldCheckIcon className="h-4 w-4 text-primary" />
                  <span>Your connection is secured with 256-bit SSL encryption</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Help Link */}
          <div className="mt-6 text-center">
            <Link 
              href="/help" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Need help? Contact support
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignInPage; 