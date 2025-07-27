'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowsRightLeftIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronRightIcon,
  BanknotesIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  ReceiptRefundIcon,
  CalendarIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { api, Transaction } from '../../lib/api';

// Enhanced transaction interface with additional display information
interface EnhancedTransaction extends Transaction {
  from_account_name?: string;
  to_account_name?: string;
  from_account_number?: string;
  to_account_number?: string;
}

const statusIcons = {
  pending: ClockIcon,
  processing: ClockIcon,
  completed: CheckCircleIcon,
  failed: XCircleIcon,
  cancelled: XCircleIcon,
  approved: CheckCircleIcon,
  rejected: XCircleIcon
};

const statusColors = {
  pending: 'text-yellow-500 bg-yellow-50 border-yellow-200',
  processing: 'text-blue-500 bg-blue-50 border-blue-200',
  completed: 'text-green-500 bg-green-50 border-green-200',
  failed: 'text-red-500 bg-red-50 border-red-200',
  cancelled: 'text-gray-500 bg-gray-50 border-gray-200',
  approved: 'text-green-500 bg-green-50 border-green-200',
  rejected: 'text-red-500 bg-red-50 border-red-200'
};

const transactionIcons = {
  deposit: ArrowDownIcon,
  withdrawal: ArrowUpIcon,
  transfer: ArrowsRightLeftIcon,
  payment: CreditCardIcon,
  fee: BanknotesIcon,
  charge: BanknotesIcon,
  interest: CurrencyDollarIcon,
  reversal: ReceiptRefundIcon,
};

function HistoryPageContent() {
  const router = useRouter();
  const [transactions, setTransactions] = useState<EnhancedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch only transactions (no transfer requests)
      const transactionsResponse = await api.getTransactions();
      setTransactions(transactionsResponse);
    } catch (err) {
      console.error('Failed to fetch history:', err);
      setError('Failed to load transaction history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter transactions
  const getFilteredHistory = (): EnhancedTransaction[] => {
    let filteredTransactions = [...transactions];

    // Apply filters
    if (searchTerm) {
      filteredTransactions = filteredTransactions.filter(transaction => {
        const searchFields = [
          transaction.description || '',
          transaction.reference || '',
          transaction.narration || '',
          transaction.from_account_name || '',
          transaction.to_account_name || '',
          transaction.from_account_number || '',
          transaction.to_account_number || '',
          transaction.depositor_name || '',
          transaction.depositor_bank_name || ''
        ];
        return searchFields.some(field => 
          field.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    if (statusFilter !== 'all') {
      filteredTransactions = filteredTransactions.filter(transaction => 
        (transaction.status || 'pending') === statusFilter
      );
    }

    if (typeFilter !== 'all') {
      filteredTransactions = filteredTransactions.filter(transaction => 
        transaction.transaction_type === typeFilter
      );
    }

    // Sort by created date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return filteredTransactions;
  };

  const getItemIcon = (transaction: EnhancedTransaction) => {
    return transactionIcons[transaction.transaction_type as keyof typeof transactionIcons] || ClockIcon;
  };

  const getItemAmount = (transaction: EnhancedTransaction) => {
    const amount = parseFloat(String(transaction.amount));
    const fee = parseFloat(String(transaction.fee || 0));
    const totalAmount = parseFloat(String(transaction.total_amount || amount + fee));
    
    const isOutgoing = ['withdrawal', 'transfer', 'payment', 'fee', 'charge'].includes(transaction.transaction_type);
    
    return {
      amount,
      fee,
      totalAmount,
      isOutgoing,
      display: `${isOutgoing ? '-' : '+'}$${amount.toFixed(2)}`,
      totalDisplay: `${isOutgoing ? '-' : '+'}$${totalAmount.toFixed(2)}`,
      feeDisplay: fee > 0 ? `$${fee.toFixed(2)}` : null
    };
  };

  const getItemTitle = (transaction: EnhancedTransaction) => {
    const typeNames = {
      deposit: 'Deposit',
      withdrawal: 'Withdrawal', 
      transfer: 'Transfer',
      payment: 'Payment',
      fee: 'Fee',
      charge: 'Charge',
      interest: 'Interest',
      reversal: 'Reversal'
    };
    return typeNames[transaction.transaction_type as keyof typeof typeNames] || 
           transaction.transaction_type.charAt(0).toUpperCase() + transaction.transaction_type.slice(1);
  };

  const getItemSubtitle = (transaction: EnhancedTransaction) => {
    switch (transaction.transaction_type) {
      case 'deposit':
        if (transaction.depositor_name) {
          return `From: ${transaction.depositor_name}${transaction.depositor_bank_name ? ` (${transaction.depositor_bank_name})` : ''}`;
        }
        return transaction.description || 'Deposit to account';
        
      case 'withdrawal':
        return transaction.description || 'Withdrawal from account';
        
      case 'transfer':
        if (transaction.to_account?.account_name || transaction.to_account?.account_number) {
          return `To: ${transaction.to_account?.account_name || transaction.to_account?.account_number}`;
        }
        return transaction.description || 'Transfer';
        
      case 'payment':
        return transaction.description || 'Payment processed';
        
      case 'fee':
      case 'charge':
        return transaction.description || 'Service charge';
        
      case 'interest':
        return transaction.description || 'Interest earned';
        
      case 'reversal':
        return transaction.description || 'Transaction reversal';
        
      default:
        return transaction.description || transaction.narration || '';
    }
  };

  const getAccountInfo = (transaction: EnhancedTransaction) => {
    switch (transaction.transaction_type) {
      case 'deposit':
        return {
          label: 'Deposited to',
          value: transaction.to_account?.account_name || transaction.to_account?.account_number || 'Your account'
        };
        
      case 'withdrawal':
        return {
          label: 'Withdrawn from', 
          value: transaction.from_account?.account_name || transaction.from_account?.account_number || 'Your account'
        };
        
      case 'transfer':
        return {
          label: 'Transfer to',
          value: transaction.to_account?.account_name || transaction.to_account?.account_number || 'External account'
        };
        
      default:
        return null;
    }
  };

  const handleItemClick = (transaction: EnhancedTransaction) => {
    router.push(`/history/transaction/${transaction.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return `Today, ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday, ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      return date.toLocaleDateString(undefined, { 
        weekday: 'long', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };

  const filteredHistory = getFilteredHistory();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading transaction history...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Transaction History</h1>
            <p className="text-muted-foreground">Track all your banking activities and transfers</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button variant="outline" size="sm" onClick={fetchHistory}>
              <ClockIcon className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Card variant="elevated" className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border bg-input border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>

                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-3 py-2 rounded-lg border bg-input border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Types</option>
                    <option value="transfer">Transfers</option>
                    <option value="deposit">Deposits</option>
                    <option value="withdrawal">Withdrawals</option>
                    <option value="payment">Payments</option>
                    <option value="fee">Fees</option>
                    <option value="interest">Interest</option>
                    <option value="reversal">Reversals</option>
                  </select>

                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setTypeFilter('all');
                      }}
                      className="flex-1"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Desktop Filters - Always Visible */}
        <div className="hidden lg:block">
          <Card variant="elevated" className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border bg-input border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 rounded-lg border bg-input border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="transfer">Transfers</option>
                <option value="deposit">Deposits</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="payment">Payments</option>
                <option value="fee">Fees</option>
                <option value="interest">Interest</option>
                <option value="reversal">Reversals</option>
              </select>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                  className="flex-1"
                >
                  Clear
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <Card variant="default" className="p-4 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800/50">
            <div className="flex items-center space-x-2">
              <ExclamationCircleIcon className="h-5 w-5 text-orange-500" />
              <p className="text-orange-600 dark:text-orange-400">{error}</p>
            </div>
          </Card>
        )}

        {/* Summary Stats */}
        {filteredHistory.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="default" className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">{filteredHistory.length}</p>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
              </div>
            </Card>
            <Card variant="default" className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">
                  {filteredHistory.filter(transaction => (transaction.status || 'pending') === 'completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </Card>
            <Card variant="default" className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-500">
                  {filteredHistory.filter(transaction => (transaction.status || 'pending') === 'pending').length}
                </p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </Card>
            <Card variant="default" className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-500">
                  {filteredHistory.filter(transaction => (transaction.status || 'pending') === 'failed').length}
                </p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </div>
            </Card>
          </div>
        )}

        {/* History List */}
        <div className="space-y-3">
          {filteredHistory.length === 0 ? (
            <Card variant="elevated" className="p-8 text-center">
              <ClockIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No transactions found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Try adjusting your filters to see more results.'
                  : 'Your transaction history will appear here once you start banking with us.'
                }
              </p>
            </Card>
          ) : (
            filteredHistory.map((transaction, index) => {
              const Icon = getItemIcon(transaction);
              const StatusIcon = statusIcons[transaction.status as keyof typeof statusIcons] || ClockIcon;
              const { amount, fee, totalAmount, isOutgoing, display, totalDisplay, feeDisplay } = getItemAmount(transaction);
              const title = getItemTitle(transaction);
              const subtitle = getItemSubtitle(transaction);
              const accountInfo = getAccountInfo(transaction);
              const statusColorClass = statusColors[(transaction.status || 'pending') as keyof typeof statusColors] || statusColors.pending;

              return (
                <motion.div
                  key={`transaction-${transaction.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    variant="default" 
                    className="p-4 hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/20 group"
                    onClick={() => handleItemClick(transaction)}
                  >
                    {/* Mobile Layout */}
                    <div className="lg:hidden">
                      <div className="flex items-start space-x-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          isOutgoing ? 'bg-red-50 group-hover:bg-red-100' : 'bg-green-50 group-hover:bg-green-100'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            isOutgoing ? 'text-red-500' : 'text-green-500'
                          }`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {title}
                            </h3>
                            <div className="text-right">
                              <p className={`font-bold text-lg ${
                                isOutgoing ? 'text-red-500' : 'text-green-500'
                              }`}>
                                {display}
                              </p>
                              {feeDisplay && (
                                <p className="text-xs text-orange-600">+ {feeDisplay} fee</p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 mb-2">
                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColorClass}`}>
                              <StatusIcon className="w-3 h-3" />
                              <span className="capitalize">{transaction.status || 'pending'}</span>
                            </div>
                            {transaction.reference && (
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-mono">
                                {transaction.reference}
                              </span>
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground truncate mb-1">{subtitle}</p>
                          {accountInfo && (
                            <p className="text-xs text-muted-foreground mb-1">
                              <span className="font-medium">{accountInfo.label}:</span> {accountInfo.value}
                            </p>
                          )}
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              {formatDate(transaction.created_at)}
                            </p>
                            {feeDisplay && totalAmount !== amount && (
                              <p className="text-xs text-muted-foreground">
                                Total: {totalDisplay}
                              </p>
                            )}
                            <ChevronRightIcon className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden lg:block">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                          isOutgoing ? 'bg-red-50 group-hover:bg-red-100' : 'bg-green-50 group-hover:bg-green-100'
                        }`}>
                          <Icon className={`w-6 h-6 ${
                            isOutgoing ? 'text-red-500' : 'text-green-500'
                          }`} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                              {title}
                            </h3>
                            <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${statusColorClass}`}>
                              <StatusIcon className="w-3 h-3" />
                              <span className="capitalize">{transaction.status || 'pending'}</span>
                            </div>
                            {transaction.reference && (
                              <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-mono">
                                {transaction.reference}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
                          {accountInfo && (
                            <p className="text-xs text-muted-foreground">
                              <span className="font-medium">{accountInfo.label}:</span> {accountInfo.value}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(transaction.created_at)}
                          </p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-right">
                            <p className={`font-bold text-lg ${
                              isOutgoing ? 'text-red-500' : 'text-green-500'
                            }`}>
                              {display}
                            </p>
                            {feeDisplay && (
                              <p className="text-xs text-orange-600">+ {feeDisplay} fee</p>
                            )}
                            {feeDisplay && totalAmount !== amount && (
                              <p className="text-xs text-muted-foreground">
                                Total: {totalDisplay}
                              </p>
                            )}
                          </div>
                          <ChevronRightIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Load More Button */}
        {filteredHistory.length > 0 && (
          <div className="text-center">
            <Button variant="outline" onClick={fetchHistory}>
              Load More Transactions
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default function HistoryPage() {
  return (
    <ProtectedRoute>
      <HistoryPageContent />
    </ProtectedRoute>
  );
}
