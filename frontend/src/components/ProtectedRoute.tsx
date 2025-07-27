'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireProfileCompletion?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  requireProfileCompletion = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, checkProfileCompletion } = useAuth();
  const router = useRouter();
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      // Wait for auth to load
      if (isLoading) return;

      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push('/signin');
        return;
      }

      // If we need to check profile completion and haven't checked yet
      if (requireProfileCompletion && !profileChecked && !isCheckingProfile) {
        setIsCheckingProfile(true);
        
        try {
          const profileCheck = await checkProfileCompletion();
          
          if (profileCheck.requiresCompletion) {
            router.push('/complete-profile');
            return;
          }
        } catch (error) {
          console.error('Error checking profile completion:', error);
        } finally {
          setIsCheckingProfile(false);
          setProfileChecked(true);
        }
      }
    };

    checkAuthAndProfile();
  }, [isAuthenticated, isLoading, requireProfileCompletion, profileChecked, isCheckingProfile, router, checkProfileCompletion]);

  // Show loading while checking authentication or profile
  if (isLoading || (requireProfileCompletion && isCheckingProfile)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isLoading ? 'Loading...' : 'Checking profile...'}
          </p>
        </div>
      </div>
    );
  }

  // Don't render children until authenticated and profile checked (if required)
  if (!isAuthenticated || (requireProfileCompletion && !profileChecked)) {
    return null;
  }

  return <>{children}</>;
} 
 