'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  EnvelopeIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { api } from '../../lib/api';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setVerificationStatus('error');
      setMessage('Invalid verification link');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/auth/verify-email/${verificationToken}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setVerificationStatus('success');
        setMessage(data.message);
        setUserToken(data.token);
        
        // Store token and redirect after delay
        if (data.token) {
          localStorage.setItem('token', data.token);
          setTimeout(() => {
            if (data.next_step === 'complete_profile') {
              router.push('/complete-profile');
            } else if (data.next_step === 'document_upload') {
              router.push('/kyc-documents');
            } else {
              router.push('/dashboard');
            }
          }, 3000);
        }
      } else {
        if (data.expired) {
          setVerificationStatus('expired');
        } else {
          setVerificationStatus('error');
        }
        setMessage(data.error || 'Verification failed');
      }
    } catch (error) {
      setVerificationStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  const resendVerification = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      const response = await api.resendVerification(email);
      alert('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      alert(error.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  const renderContent = () => {
    switch (verificationStatus) {
      case 'loading':
        return (
          <div className="text-center">
            <ArrowPathIcon className="h-16 w-16 text-primary mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Verifying Your Email</h1>
            <p className="text-muted-foreground">Please wait while we verify your email address...</p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Email Verified!</h1>
            <p className="text-muted-foreground mb-4">{message}</p>
            <p className="text-sm text-muted-foreground">Redirecting to dashboard in 3 seconds...</p>
            <Button 
              onClick={() => router.push('/dashboard')}
              className="mt-4"
            >
              Go to Dashboard
            </Button>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <XCircleIcon className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Link Expired</h1>
            <p className="text-muted-foreground mb-4">{message}</p>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button 
                onClick={resendVerification}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            </div>
          </div>
        );

      case 'error':
      default:
        return (
          <div className="text-center">
            <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Verification Failed</h1>
            <p className="text-muted-foreground mb-4">{message}</p>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button 
                onClick={resendVerification}
                disabled={isResending}
                className="w-full"
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <EnvelopeIcon className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground">Email Verification</h2>
          </div>
          
          {renderContent()}
          
          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Need help? <a href="/contact" className="text-primary hover:underline">Contact Support</a>
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}