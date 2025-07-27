'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  CheckCircleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { api } from '../../lib/api';

function RegistrationSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const resendVerification = async () => {
    if (!email) {
      setResendMessage('Email address not found');
      return;
    }

    setIsResending(true);
    setResendMessage('');
    
    try {
      await api.resendVerification(email);
      setResendMessage('Verification email sent successfully!');
    } catch (error: any) {
      setResendMessage(error.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
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
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Registration Successful!</h1>
            <p className="text-muted-foreground">
              We've sent a verification email to your inbox.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <EnvelopeIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-blue-700 font-medium">Check your email</p>
              <p className="text-xs text-blue-600 mt-1">
                {email ? `Sent to: ${email}` : 'Verification email sent'}
              </p>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">Next Steps:</h3>
              <ol className="text-sm text-muted-foreground space-y-1 text-left">
                <li>1. Check your email inbox (and spam folder)</li>
                <li>2. Click the verification link in the email</li>
                <li>3. Complete your account setup</li>
              </ol>
            </div>
            
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-3">
                Didn't receive the email?
              </p>
              <Button 
                onClick={resendVerification}
                disabled={isResending}
                variant="outline"
                className="w-full"
              >
                {isResending ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
              
              {resendMessage && (
                <p className={`text-sm mt-2 ${
                  resendMessage.includes('successfully') 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {resendMessage}
                </p>
              )}
            </div>
          </div>
          
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

export default function RegistrationSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegistrationSuccessContent />
    </Suspense>
  );
} 
 