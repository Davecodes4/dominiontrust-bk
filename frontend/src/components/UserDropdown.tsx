'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCircleIcon,
  CogIcon,
  KeyIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export const UserDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleProfileSettings = () => {
    setIsOpen(false);
    router.push('/settings');
  };

  const handleChangePassword = () => {
    setIsOpen(false);
    router.push('/settings?tab=security');
  };

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
    router.push('/auth/login');
  };

  const userInitials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : 'U';

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="flex items-center space-x-2 p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
      >
        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
          {user && (user.first_name || user.last_name) ? (
            <span className="text-sm font-medium text-primary">{userInitials}</span>
          ) : (
            <UserCircleIcon className="w-5 h-5 text-primary" />
          )}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-foreground">
            {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User' : 'User'}
          </p>
          <p className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</p>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {user && (user.first_name || user.last_name) ? (
                      <span className="text-sm font-medium text-primary">{userInitials}</span>
                    ) : (
                      <UserIcon className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User' : 'User'}
                    </p>
                    <p className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={handleProfileSettings}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-secondary transition-colors"
                >
                  <CogIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">Profile Settings</span>
                </button>

                <button
                  onClick={handleChangePassword}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-secondary transition-colors"
                >
                  <KeyIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm text-foreground">Change Password</span>
                </button>

                <hr className="my-2 border-border" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-red-600">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
