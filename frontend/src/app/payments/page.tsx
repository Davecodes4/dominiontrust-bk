'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  CreditCardIcon,
  BanknotesIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EyeIcon,
  EyeSlashIcon,
  ChevronRightIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  HomeIcon,
  ArrowsRightLeftIcon,
  CogIcon,
  ChartBarIcon,
  BuildingLibraryIcon,
  BellIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';

const PaymentsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [showNewPayment, setShowNewPayment] = useState(false);
  const [paymentType, setPaymentType] = useState('bill');

  // Mock data
  const payments = [
    {
      id: '1',
      type: 'bill',
      recipient: 'Electric Company',
      amount: 156.78,
      dueDate: '2024-07-20',
      status: 'scheduled',
      recurring: true,
      frequency: 'monthly',
      accountNumber: '1234567890',
      reference: 'PAY001',
      category: 'utilities'
    },
    {
      id: '2',
      type: 'bill',
      recipient: 'Internet Service Provider',
      amount: 89.99,
      dueDate: '2024-07-18',
      status: 'pending',
      recurring: true,
      frequency: 'monthly',
      accountNumber: '1234567890',
      reference: 'PAY002',
      category: 'utilities'
    },
    {
      id: '3',
      type: 'vendor',
      recipient: 'ABC Supplies Ltd',
      amount: 2500.00,
      dueDate: '2024-07-25',
      status: 'completed',
      recurring: false,
      accountNumber: '0987654321',
      reference: 'PAY003',
      category: 'business'
    },
    {
      id: '4',
      type: 'person',
      recipient: 'John Smith',
      amount: 250.00,
      dueDate: '2024-07-16',
      status: 'failed',
      recurring: false,
      accountNumber: '1234567890',
      reference: 'PAY004',
      category: 'personal'
    }
  ];

  const paymentCategories = [
    { id: 'utilities', name: 'Utilities', icon: BuildingOfficeIcon, color: 'bg-blue-500' },
    { id: 'business', name: 'Business', icon: BuildingOfficeIcon, color: 'bg-green-500' },
    { id: 'personal', name: 'Personal', icon: UserCircleIcon, color: 'bg-purple-500' },
    { id: 'subscription', name: 'Subscriptions', icon: CreditCardIcon, color: 'bg-orange-500' }
  ];

  const sidebarItems = [
    { name: 'Dashboard', icon: HomeIcon, href: '/dashboard', active: false },
    { name: 'Accounts', icon: BanknotesIcon, href: '/accounts', active: false },
    { name: 'Transfers', icon: ArrowsRightLeftIcon, href: '/transfer' },
    { name: 'Payments', icon: CreditCardIcon, href: '/payments', active: true },
    { name: 'History', icon: ClockIcon, href: '/history' },
    { name: 'Cards', icon: CreditCardIcon, href: '/cards' },
    { name: 'Settings', icon: CogIcon, href: '/settings' },
    { name: 'Support', icon: PhoneIcon, href: '/support' }
  ];

  const mobileNavItems = [
    { name: 'Home', icon: HomeIcon, href: '/dashboard', active: false },
    { name: 'Accounts', icon: BanknotesIcon, href: '/accounts', active: false },
    { name: 'Transfer', icon: ArrowsRightLeftIcon, href: '/transfer' },
    { name: 'More', icon: Bars3Icon, href: '/more' }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'scheduled':
        return <CalendarDaysIcon className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (activeTab === 'all') return true;
    return payment.status === activeTab;
  });

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BuildingLibraryIcon className="w-5 h-5 text-primary-foreground" />
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
        
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.active 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <UserCircleIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Sarah Johnson</p>
              <p className="text-xs text-muted-foreground truncate">sarah@example.com</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Desktop Header */}
        <header className="bg-card border-b border-border fixed top-0 right-0 z-40 hidden lg:block lg:left-64">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-xl font-bold text-foreground">Payments</h1>
                <p className="text-sm text-muted-foreground">Manage your payments and bills</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Input
                  placeholder="Search payments..."
                  className="w-64 pl-10"
                  leftIcon={<MagnifyingGlassIcon className="h-4 w-4" />}
                />
              </div>
              <button className="relative text-muted-foreground hover:text-foreground">
                <BellIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
              </button>
              <button className="text-muted-foreground hover:text-foreground">
                <UserCircleIcon className="h-8 w-8" />
              </button>
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
              <div>
                <h1 className="text-lg font-bold text-foreground">Payments</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="relative text-muted-foreground">
                <BellIcon className="h-6 w-6" />
                <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="text-muted-foreground">
                <MagnifyingGlassIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6 pb-24 pt-20 lg:pb-6 lg:pt-20">
          {/* Payment Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <Card variant="elevated" hover={true}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm mb-1">Total Payments</p>
                  <p className="text-2xl font-bold text-foreground mb-2">{payments.length}</p>
                  <p className="text-sm text-blue-600">This month</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <CreditCardIcon className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </Card>

            <Card variant="elevated" hover={true}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm mb-1">Pending</p>
                  <p className="text-2xl font-bold text-foreground mb-2">
                    {payments.filter(p => p.status === 'pending').length}
                  </p>
                  <p className="text-sm text-yellow-600">Awaiting approval</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                  <ClockIcon className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </Card>

            <Card variant="elevated" hover={true}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm mb-1">Scheduled</p>
                  <p className="text-2xl font-bold text-foreground mb-2">
                    {payments.filter(p => p.status === 'scheduled').length}
                  </p>
                  <p className="text-sm text-blue-600">Future payments</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <CalendarDaysIcon className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </Card>

            <Card variant="elevated" hover={true}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-muted-foreground text-sm mb-1">Amount</p>
                  <p className="text-2xl font-bold text-foreground mb-2">
                    {formatCurrency(payments.reduce((sum, p) => sum + p.amount, 0))}
                  </p>
                  <p className="text-sm text-green-600">Total value</p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <BanknotesIcon className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </Card>
          </div>

          {/* Payment Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={activeTab === 'all' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('all')}
              >
                All Payments
              </Button>
              <Button
                variant={activeTab === 'pending' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('pending')}
              >
                Pending
              </Button>
              <Button
                variant={activeTab === 'scheduled' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('scheduled')}
              >
                Scheduled
              </Button>
              <Button
                variant={activeTab === 'completed' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('completed')}
              >
                Completed
              </Button>
            </div>
            
            <Button className="flex items-center space-x-2" onClick={() => setShowNewPayment(true)}>
              <PlusIcon className="h-4 w-4" />
              <span>New Payment</span>
            </Button>
          </div>

          {/* Payments List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {filteredPayments.map((payment) => {
                  const daysUntilDue = getDaysUntilDue(payment.dueDate);
                  
                  return (
                    <Card key={payment.id} variant="elevated" hover={true}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <CreditCardIcon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-foreground">{payment.recipient}</h3>
                              {payment.recurring && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Recurring
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{payment.reference}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-xs text-muted-foreground">
                                Due: {payment.dueDate} 
                                {daysUntilDue > 0 && ` (${daysUntilDue} days)`}
                                {daysUntilDue === 0 && ' (Today)'}
                                {daysUntilDue < 0 && ` (${Math.abs(daysUntilDue)} days overdue)`}
                              </p>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(payment.status)}
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                                  {payment.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">{formatCurrency(payment.amount)}</p>
                          <p className="text-sm text-muted-foreground">{payment.accountNumber}</p>
                          <button className="text-muted-foreground hover:text-foreground mt-1">
                            <ChevronRightIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Payment Categories & Actions */}
            <div className="space-y-6">
              <Card variant="elevated">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Payment Categories</h3>
                </div>
                <div className="space-y-3">
                  {paymentCategories.map((category) => {
                    const categoryPayments = payments.filter(p => p.category === category.id);
                    return (
                      <div key={category.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 ${category.color}/10 rounded-lg flex items-center justify-center`}>
                            <category.icon className={`h-4 w-4 ${category.color.replace('bg-', 'text-')}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{category.name}</p>
                            <p className="text-xs text-muted-foreground">{categoryPayments.length} payments</p>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          {formatCurrency(categoryPayments.reduce((sum, p) => sum + p.amount, 0))}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </Card>

              <Card variant="elevated">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
                </div>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <CreditCardIcon className="h-4 w-4 mr-2" />
                    Pay Bills
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarDaysIcon className="h-4 w-4 mr-2" />
                    Schedule Payment
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                    Payment History
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CogIcon className="h-4 w-4 mr-2" />
                    Payment Settings
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex items-center justify-around py-2">
          {mobileNavItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center space-y-1 py-2 px-3 rounded-lg transition-colors ${
                item.active 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          ))}
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

export default PaymentsPage; 
 