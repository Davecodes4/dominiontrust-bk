'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BanknotesIcon,
  CreditCardIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowTrendingUpIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon,
  ChatBubbleLeftEllipsisIcon,
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ProtectedRoute from '../../components/ProtectedRoute';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';

const DashboardPage: React.FC = () => {
  const [showBalance, setShowBalance] = useState(true);
  
  const { user, dashboardData } = useAuth();
  const router = useRouter();

  // Get data from authentication context
  const accountData = dashboardData ? {
    totalBalance: dashboardData.financial_summary.total_balance,
    availableBalance: dashboardData.financial_summary.total_available,
    recentTransactions: dashboardData.recent_transactions?.slice(0, 5) || [],
    accounts: dashboardData.accounts || [],
  } : {
    totalBalance: 0,
    availableBalance: 0,
    recentTransactions: [],
    accounts: [],
  };

  const handleAccountClick = (accountId: string) => {
    router.push(`/accounts#account-${accountId}`);
  };

  const handleTransactionClick = (transactionId: string) => {
    router.push(`/history/transaction/${transactionId}`);
  };

  const handleAddAccount = () => {
    router.push('/accounts');
  };

  const handleViewAllTransactions = () => {
    router.push('/history');
  };

  const handleToggleBalance = () => {
    setShowBalance(!showBalance);
  };

  const quickActions = [
    { 
      title: 'Send Money', 
      icon: ArrowUpIcon, 
      color: 'text-blue-500', 
      bgColor: 'bg-blue-500/10',
      action: () => router.push('/transfer')
    },
    { 
      title: 'Add Money', 
      icon: ArrowDownIcon, 
      color: 'text-green-500', 
      bgColor: 'bg-green-500/10',
      action: () => router.push('/accounts')
    },
    { 
      title: 'My Cards', 
      icon: CreditCardIcon, 
      color: 'text-purple-500', 
      bgColor: 'bg-purple-500/10',
      action: () => router.push('/cards')
    },
    { 
      title: 'Add Account', 
      icon: PlusIcon, 
      color: 'text-orange-500', 
      bgColor: 'bg-orange-500/10',
      action: () => router.push('/accounts')
    },
    { 
      title: 'View History', 
      icon: DocumentTextIcon, 
      color: 'text-indigo-500', 
      bgColor: 'bg-indigo-500/10',
      action: () => router.push('/history')
    },
    { 
      title: 'Support', 
      icon: ChatBubbleLeftEllipsisIcon, 
      color: 'text-teal-500', 
      bgColor: 'bg-teal-500/10',
      action: () => router.push('/support')
    }
  ];

  const getAccountTypeColor = (accountType: string) => {
    switch (accountType) {
      case 'savings':
        return 'from-green-500 to-green-600';
      case 'current':
        return 'from-blue-500 to-blue-600';
      case 'fixed_deposit':
        return 'from-purple-500 to-purple-600';
      case 'foreign_currency':
        return 'from-orange-500 to-orange-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType) {
      case 'savings':
        return <ArrowTrendingUpIcon className="h-5 w-5 text-green-100" />;
      case 'current':
        return <CreditCardIcon className="h-5 w-5 text-blue-100" />;
      case 'fixed_deposit':
        return <BanknotesIcon className="h-5 w-5 text-purple-100" />;
      case 'foreign_currency':
        return <CreditCardIcon className="h-5 w-5 text-orange-100" />;
      default:
        return <BanknotesIcon className="h-5 w-5 text-gray-100" />;
    }
  };

  const formatAccountType = (accountType: string) => {
    return accountType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTransactionIcon = (transaction_type: string) => {
    switch (transaction_type) {
      case 'deposit':
        return <ArrowDownIcon className="h-4 w-4 text-green-500" />;
      case 'transfer':
        return <ArrowsRightLeftIcon className="h-4 w-4 text-blue-500" />;
      case 'payment':
      case 'withdrawal':
        return <ArrowUpIcon className="h-4 w-4 text-red-500" />;
      default:
        return <BanknotesIcon className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 pb-24 lg:pb-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
          {/* Total Balance */}
          <Card variant="gradient" className="text-white lg:col-span-1 md:col-span-2 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10 p-6 lg:p-8">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <p className="text-white/90 text-sm lg:text-base font-medium">Total Balance</p>
                    <button
                      onClick={() => setShowBalance(!showBalance)}
                      className="text-white/70 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
                    >
                      {showBalance ? (
                        <EyeSlashIcon className="h-5 w-5" />
                      ) : (
                        <EyeIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-3xl lg:text-5xl font-bold mb-3 tracking-tight">
                    {showBalance ? formatCurrency(accountData.totalBalance) : '••••••••'}
                  </p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-sm lg:text-base text-white/80">
                      <span>Available Balance</span>
                    </div>
                    <div className="w-1 h-1 bg-white/40 rounded-full"></div>
                    <span className="text-sm lg:text-base text-white/80 font-medium">
                      {showBalance ? formatCurrency(accountData.availableBalance) : '••••••••'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                    <BanknotesIcon className="h-8 w-8 lg:h-10 lg:w-10 text-white" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-white/70">Active Accounts</p>
                    <p className="text-lg font-bold text-white">{accountData.accounts.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

          {/* Quick Actions */}
          <Card variant="elevated">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.title}
                    onClick={action.action}
                    className="flex flex-col items-center space-y-2 p-3 lg:p-4 rounded-lg hover:bg-secondary transition-colors group hover:scale-105 transform duration-200"
                  >
                    <div className={`w-10 h-10 lg:w-12 lg:h-12 ${action.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <action.icon className={`h-5 w-5 lg:h-6 lg:w-6 ${action.color}`} />
                    </div>
                    <span className="text-xs lg:text-sm font-medium text-foreground text-center leading-tight">{action.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
             {/* Main Content - Accounts & Transactions */}
             <div className="space-y-6 lg:space-y-6 space-y-4">
               {/* Account Cards - Desktop */}
               <Card variant="elevated" className="lg:block hidden">
                 <div className="p-6">
                   <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-semibold text-foreground">My Accounts</h3>
                     <Button variant="ghost" size="sm" onClick={handleAddAccount}>
                       Add Account
                     </Button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {accountData.accounts.map((account) => (
                       <div
                         key={account.id}
                         onClick={() => handleAccountClick(account.id)}
                         className={`p-4 bg-gradient-to-br ${getAccountTypeColor(account.account_type)} rounded-lg text-white cursor-pointer hover:scale-105 transition-transform`}
                       >
                         <div className="flex items-center justify-between mb-3">
                           <span className="text-sm text-white/80">{formatAccountType(account.account_type)}</span>
                           {getAccountTypeIcon(account.account_type)}
                         </div>
                         <p className="text-2xl font-bold mb-1">
                           {showBalance ? formatCurrency(account.balance) : '••••••••'}
                         </p>
                         <p className="text-sm text-white/80">Account #{account.account_number}</p>
                       </div>
                     ))}

                     {/* Add Account Button */}
                     <div 
                       onClick={handleAddAccount}
                       className="p-4 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-center hover:border-primary transition-colors cursor-pointer"
                     >
                       <PlusIcon className="h-8 w-8 text-muted-foreground mb-2" />
                       <span className="text-sm font-medium text-muted-foreground">Add Account</span>
                     </div>
                   </div>
                 </div>
               </Card>

               {/* Account Cards - Mobile Carousel */}
               <div className="lg:hidden">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-semibold text-foreground">My Accounts</h3>
                   <button onClick={handleAddAccount} className="text-sm text-primary font-medium">Add Account</button>
                 </div>
                 <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                   {accountData.accounts.map((account) => (
                     <div
                       key={account.id}
                       onClick={() => handleAccountClick(account.id)}
                       className={`min-w-[280px] p-5 bg-gradient-to-br ${getAccountTypeColor(account.account_type)} rounded-2xl text-white shadow-lg cursor-pointer`}
                     >
                       <div className="flex items-center justify-between mb-4">
                         <span className="text-sm text-white/80 font-medium">{formatAccountType(account.account_type)}</span>
                         {getAccountTypeIcon(account.account_type)}
                       </div>
                       <p className="text-3xl font-bold mb-2">
                         {showBalance ? formatCurrency(account.balance) : '••••••••'}
                       </p>
                       <p className="text-sm text-white/80 mb-3">Account #{account.account_number}</p>
                       <div className="flex items-center justify-between">
                         <span className="text-xs text-white/60">Available Balance</span>
                         <span className="text-xs text-white/60 font-medium">{account.status}</span>
                       </div>
                     </div>
                   ))}

                   {/* Add Account */}
                   <div 
                     onClick={handleAddAccount}
                     className="min-w-[280px] p-5 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center hover:border-primary transition-colors cursor-pointer bg-card"
                   >
                     <PlusIcon className="h-12 w-12 text-muted-foreground mb-3" />
                     <span className="text-sm font-medium text-muted-foreground mb-1">Add New Account</span>
                     <span className="text-xs text-muted-foreground">Open a new account</span>
                   </div>
                 </div>
               </div>

               {/* Recent Transactions - Desktop */}
               <Card variant="elevated" className="lg:block hidden">
                 <div className="p-6">
                   <div className="flex items-center justify-between mb-4">
                     <h3 className="text-lg font-semibold text-foreground">Recent Transactions</h3>
                     <Button variant="ghost" size="sm" onClick={handleViewAllTransactions}>
                       View All
                     </Button>
                   </div>
                   <div className="space-y-3">
                     {accountData.recentTransactions && accountData.recentTransactions.length > 0 ? (
                       accountData.recentTransactions.map((transaction) => (
                         <div
                           key={transaction.id}
                           onClick={() => handleTransactionClick(transaction.id)}
                           className="flex items-center justify-between p-3 hover:bg-secondary rounded-lg transition-colors cursor-pointer"
                         >
                           <div className="flex items-center space-x-3">
                             <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
                               {getTransactionIcon(transaction.transaction_type)}
                             </div>
                             <div>
                               <p className="font-medium text-foreground">{transaction.description}</p>
                               <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                                 <span>{transaction.reference}</span>
                                 <span>•</span>
                                 <span>{new Date(transaction.created_at).toLocaleDateString()}</span>
                               </div>
                             </div>
                           </div>
                           <div className="text-right">
                             <p className={`font-medium ${
                               transaction.transaction_type === 'deposit' ? 'text-green-500' : 'text-foreground'
                             }`}>
                               {transaction.transaction_type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                             </p>
                             <p className="text-sm text-muted-foreground">{transaction.status}</p>
                           </div>
                         </div>
                       ))
                     ) : (
                       <div className="text-center py-8">
                         <p className="text-muted-foreground">No recent transactions</p>
                       </div>
                     )}
                   </div>
                 </div>
               </Card>

               {/* Recent Transactions - Mobile */}
               <div className="lg:hidden">
                 <div className="flex justify-between items-center mb-4">
                   <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
                   <button onClick={handleViewAllTransactions} className="text-sm text-primary font-medium">See All</button>
                 </div>
                 <div className="space-y-2">
                   {accountData.recentTransactions && accountData.recentTransactions.length > 0 ? (
                     accountData.recentTransactions.map((transaction) => (
                       <div
                         key={transaction.id}
                         onClick={() => handleTransactionClick(transaction.id)}
                         className="flex items-center justify-between p-4 bg-card rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-border/50 cursor-pointer"
                       >
                         <div className="flex items-center space-x-3">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                             transaction.transaction_type === 'deposit' ? 'bg-green-500/10' :
                             transaction.transaction_type === 'payment' ? 'bg-red-500/10' :
                             'bg-blue-500/10'
                           }`}>
                             {getTransactionIcon(transaction.transaction_type)}
                           </div>
                           <div className="flex-1">
                             <p className="font-semibold text-foreground text-sm">{transaction.description}</p>
                             <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                               <span>{transaction.reference}</span>
                               <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                               <span>{new Date(transaction.created_at).toLocaleDateString('en-US', { 
                                 month: 'short', 
                                 day: 'numeric' 
                               })}</span>
                             </div>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className={`font-bold text-base ${
                             transaction.transaction_type === 'deposit' ? 'text-green-500' : 'text-foreground'
                           }`}>
                             {transaction.transaction_type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                           </p>
                           <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                             transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                             transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                             'bg-red-100 text-red-700'
                           }`}>
                             {transaction.status}
                           </div>
                         </div>
                       </div>
                     ))
                   ) : (
                     <div className="text-center py-8">
                       <p className="text-muted-foreground">No recent transactions</p>
                     </div>
                   )}
                 </div>
               </div>
            </div>
           </div>
         </div>
      {/* </div> */}
    </DashboardLayout>
  );
};

const ProtectedDashboardPage: React.FC = () => {
  return (
    <ProtectedRoute requireProfileCompletion={true}>
      <DashboardPage />
    </ProtectedRoute>
  );
};

export default ProtectedDashboardPage; 