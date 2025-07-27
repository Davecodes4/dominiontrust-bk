'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  HomeIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  CreditCardIcon,
  ClockIcon,
  BellIcon,
  DocumentTextIcon,
  CogIcon,
  PhoneIcon,
  BuildingLibraryIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationDropdown } from '../NotificationDropdown';
import { UserDropdown } from '../UserDropdown';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title, subtitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const sidebarItems = [
    { name: 'Dashboard', icon: HomeIcon, href: '/dashboard' },
    { name: 'Accounts', icon: BanknotesIcon, href: '/accounts' },
    { name: 'Transfers', icon: ArrowsRightLeftIcon, href: '/transfer' },
    { name: 'History', icon: ClockIcon, href: '/history' },
    { name: 'Cards', icon: CreditCardIcon, href: '/cards' },
    { name: 'Notifications', icon: BellIcon, href: '/notifications' },
    { name: 'KYC Documents', icon: DocumentTextIcon, href: '/kyc-documents' },
    { name: 'Settings', icon: CogIcon, href: '/settings' },
    { name: 'Support', icon: PhoneIcon, href: '/support' },
  ];

  const mobileNavItems = [
    { name: 'Home', icon: HomeIcon, href: '/dashboard' },
    { name: 'Accounts', icon: BanknotesIcon, href: '/accounts' },
    { name: 'Transfer', icon: ArrowsRightLeftIcon, href: '/transfer' },
    { name: 'Cards', icon: CreditCardIcon, href: '/cards' },
  ];

  const getPageTitle = () => {
    if (title) return title;
    
    const currentItem = sidebarItems.find(item => item.href === pathname);
    return currentItem?.name || 'Dashboard';
  };

  const getPageSubtitle = () => {
    if (subtitle) return subtitle;
    
    const defaultSubtitles: { [key: string]: string } = {
      '/dashboard': `Welcome back, ${user?.first_name || 'User'}!`,
      '/accounts': 'Manage your bank accounts',
      '/transfer': 'Send and receive money',
      '/history': 'View transaction history',
      '/cards': 'Manage your cards',
      '/notifications': 'Stay updated with alerts',
      '/kyc-documents': 'Manage your documents',
      '/settings': 'Account preferences',
      '/support': 'Get help and support',
    };

    return defaultSubtitles[pathname] || '';
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-border flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center">
              <img src="/logo.png" alt="Dominion Trust Capital" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-lg font-bold text-foreground">
              Dominion<span className="text-primary">Trust</span>
            </span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Sidebar Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-6">
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user ? `${user.first_name} ${user.last_name}` : 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
            <button
              onClick={() => logout()}
              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
              title="Logout"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 flex flex-col h-screen">
        {/* Desktop Header */}
        <header className="bg-card border-b border-border fixed top-0 right-0 z-40 hidden lg:block lg:left-64">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-muted-foreground hover:text-foreground"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-foreground">{getPageTitle()}</h1>
                <p className="text-sm text-muted-foreground">{getPageSubtitle()}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationDropdown />
              <UserDropdown />
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="bg-card border-b border-border fixed top-0 left-0 right-0 z-40 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{getPageTitle()}</p>
                <p className="text-xs text-muted-foreground">{user ? `${user.first_name} ${user.last_name}` : 'User'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <NotificationDropdown />
              <UserDropdown />
            </div>
          </div>
        </header>

        {/* Page Content - Scrollable */}
        <main className="flex-1 overflow-y-auto pt-16 pb-20 lg:pb-0">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around py-2">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <item.icon className="h-6 w-6" />
                <span className="text-xs font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export { DashboardLayout };
export default DashboardLayout;
