'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon,
  CreditCardIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  BuildingLibraryIcon,
  UserIcon,
  ReceiptRefundIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  ShareIcon,
  PrinterIcon,
  IdentificationIcon,
  InformationCircleIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ClipboardIcon
} from '@heroicons/react/24/outline';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import { api, Transaction } from '../../../../lib/api';

const statusIcons = {
  pending: ClockIcon,
  processing: ClockIcon,
  completed: CheckCircleIcon,
  failed: XCircleIcon,
  cancelled: XCircleIcon,
  rejected: XCircleIcon,
  approved: CheckCircleIcon,
};

const statusColors = {
  pending: 'text-amber-600 bg-amber-50 border-amber-200',
  processing: 'text-blue-600 bg-blue-50 border-blue-200',
  completed: 'text-green-600 bg-green-50 border-green-200',
  failed: 'text-red-600 bg-red-50 border-red-200',
  cancelled: 'text-gray-600 bg-gray-50 border-gray-200',
  rejected: 'text-red-600 bg-red-50 border-red-200',
  approved: 'text-green-600 bg-green-50 border-green-200',
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
  refund: ReceiptRefundIcon,
};

const getTransactionTypeDetails = (type: string) => {
  const types: Record<string, { name: string; description: string; icon: any }> = {
    deposit: {
      name: 'Deposit',
      description: 'Funds added to your account',
      icon: ArrowDownIcon,
    },
    withdrawal: {
      name: 'Withdrawal',
      description: 'Funds removed from your account',
      icon: ArrowUpIcon,
    },
    transfer: {
      name: 'Transfer',
      description: 'Funds transferred between accounts',
      icon: ArrowsRightLeftIcon,
    },
    payment: {
      name: 'Payment',
      description: 'Payment transaction',
      icon: CreditCardIcon,
    },
    fee: {
      name: 'Fee',
      description: 'Service fee charged',
      icon: BanknotesIcon,
    },
    charge: {
      name: 'Charge',
      description: 'Service charge applied',
      icon: BanknotesIcon,
    },
    interest: {
      name: 'Interest',
      description: 'Interest earned or charged',
      icon: CurrencyDollarIcon,
    },
    reversal: {
      name: 'Reversal',
      description: 'Transaction reversal',
      icon: ReceiptRefundIcon,
    },
    refund: {
      name: 'Refund',
      description: 'Refund processed',
      icon: ReceiptRefundIcon,
    },
  };
  
  return types[type] || {
    name: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
    description: 'Transaction processed',
    icon: CreditCardIcon,
  };
};

function TransactionDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransactionDetail();
  }, [params.id]);

  const fetchTransactionDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getTransaction(params.id as string);
      setTransaction(response);
    } catch (err) {
      console.error('Failed to fetch transaction detail:', err);
      setError('Failed to load transaction details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const printTransaction = () => {
    window.print();
  };

  const shareTransaction = async () => {
    if (navigator.share && transaction) {
      try {
        await navigator.share({
          title: `Transaction ${transaction.reference}`,
          text: `Transaction details: ${transaction.transaction_type} of $${transaction.amount}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to copy URL
      copyToClipboard(window.location.href);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  };

  const formatAmount = (amount: number | string, showSign: boolean = true) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (showSign) {
      return `$${numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${Math.abs(numericAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getTransactionDirection = (type: string) => {
    const outgoingTypes = ['withdrawal', 'transfer', 'payment', 'fee', 'charge'];
    return outgoingTypes.includes(type) ? 'outgoing' : 'incoming';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading transaction details...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !transaction) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-6">
          <Card variant="default" className="p-8 text-center max-w-md mx-auto">
            <ExclamationCircleIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Transaction Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error || 'The transaction you are looking for could not be found.'}
            </p>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const StatusIcon = statusIcons[transaction.status as keyof typeof statusIcons] || ClockIcon;
  const typeDetails = getTransactionTypeDetails(transaction.transaction_type);
  const TransactionIcon = typeDetails.icon;
  const direction = getTransactionDirection(transaction.transaction_type);
  const statusColorClass = statusColors[transaction.status as keyof typeof statusColors] || statusColors.pending;

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-5xl mx-auto space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="p-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Transaction Receipt</h1>
              <p className="text-muted-foreground">Official transaction record</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={printTransaction}>
              <PrinterIcon className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="ghost" size="sm" onClick={shareTransaction}>
              <ShareIcon className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Main Transaction Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card variant="elevated" className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
              {/* Left: Icon and Basic Info */}
              <div className="flex items-center space-x-4 mb-6 lg:mb-0">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  direction === 'outgoing' ? 'bg-red-50' : 'bg-green-50'
                }`}>
                  <TransactionIcon className={`w-8 h-8 ${
                    direction === 'outgoing' ? 'text-red-500' : 'text-green-500'
                  }`} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground capitalize">
                    {transaction.transaction_type.replace('_', ' ')}
                  </h2>
                  <p className="text-muted-foreground">
                    {formatDate(transaction.created_at)}
                  </p>
                </div>
              </div>

              {/* Right: Amount and Status */}
              <div className="flex-1 lg:text-right">
                <div className="mb-4">
                  <p className={`text-2xl lg:text-3xl font-bold ${
                    direction === 'outgoing' ? 'text-red-500' : 'text-green-500'
                  }`}>
                    {formatAmount(transaction.amount)}
                  </p>
                  {transaction.fee && parseFloat(String(transaction.fee)) > 0 && (
                    <p className="text-sm text-orange-600 mt-1">
                      + {formatAmount(transaction.fee)} fee
                    </p>
                  )}
                  {transaction.total_amount && 
                   parseFloat(String(transaction.total_amount)) !== parseFloat(String(transaction.amount)) && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Total: {formatAmount(transaction.total_amount)}
                    </p>
                  )}
                  {transaction.transaction_type === 'transfer' && !transaction.fee && (
                    <p className="text-sm text-muted-foreground">Amount excludes fees</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                    transaction.status === 'completed' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground'
                  }`}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    <span className="capitalize">{transaction.status}</span>
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Transaction Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card variant="default" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transaction Reference</p>
                <p className="font-mono text-foreground font-medium">{transaction.reference}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(transaction.reference)}
                className="p-2"
              >
                <DocumentDuplicateIcon className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Transaction Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Account Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card variant="default" className="p-6 h-full">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <BuildingLibraryIcon className="h-5 w-5 mr-2" />
                Account Information
              </h3>
              <div className="space-y-4">
                {transaction.from_account && (
                  <div className="p-3 border rounded-lg bg-muted/30">
                    <p className="text-sm font-medium text-foreground mb-1 flex items-center">
                      <ArrowUpIcon className="h-4 w-4 mr-1 text-red-500" />
                      From Account
                    </p>
                    <p className="font-mono text-sm text-foreground mb-1">
                      {transaction.from_account.account_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.from_account.account_name || transaction.from_account.account_type}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Type: {transaction.from_account.account_type} • Status: {transaction.from_account.status}
                    </p>
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Dominion Trust Capital</span> • 
                        Routing: 123456789 • 
                        Your Account
                      </p>
                    </div>
                  </div>
                )}
                
                {transaction.to_account && (
                  <div className="p-3 border rounded-lg bg-muted/30">
                    <p className="text-sm font-medium text-foreground mb-1 flex items-center">
                      <ArrowDownIcon className="h-4 w-4 mr-1 text-green-500" />
                      To Account
                    </p>
                    <p className="font-mono text-sm text-foreground mb-1">
                      {transaction.to_account.account_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.to_account.account_name || transaction.to_account.account_type}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Type: {transaction.to_account.account_type} • Status: {transaction.to_account.status}
                    </p>
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">Dominion Trust Capital</span> • 
                        Routing: 123456789 • 
                        Internal Transfer
                      </p>
                    </div>
                  </div>
                )}

                {/* Show external account info for transfers without to_account */}
                {!transaction.to_account && transaction.transaction_type === 'transfer' && (
                  <div className="p-3 border rounded-lg bg-muted/30">
                    <p className="text-sm font-medium text-foreground mb-1 flex items-center">
                      <ArrowDownIcon className="h-4 w-4 mr-1 text-green-500" />
                      To External Account
                    </p>
                    
                    {transaction.recipient_name && (
                      <p className="text-sm font-medium text-foreground mb-1">
                        {transaction.recipient_name}
                      </p>
                    )}
                    
                    {transaction.recipient_account_number && (
                      <p className="font-mono text-sm text-foreground mb-1">
                        Account: {transaction.recipient_account_number}
                      </p>
                    )}
                    
                    {transaction.recipient_bank_name && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {transaction.recipient_bank_name}
                      </p>
                    )}
                    
                    <div className="mt-2 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground space-y-1">
                        {transaction.routing_number && (
                          <span className="block">Routing: {transaction.routing_number}</span>
                        )}
                        {transaction.swift_code && (
                          <span className="block">SWIFT: {transaction.swift_code}</span>
                        )}
                        {!transaction.recipient_bank_name && (
                          <span className="block">External bank transfer</span>
                        )}
                      </p>
                    </div>
                  </div>
                )}

                {/* Deposit Source Information */}
                {transaction.transaction_type === 'deposit' && (
                  <div className="p-3 border rounded-lg bg-muted/30">
                    <p className="text-sm font-medium text-foreground mb-2 flex items-center">
                      <BanknotesIcon className="h-4 w-4 mr-1 text-blue-500" />
                      Deposit Information
                    </p>
                    {transaction.deposit_source && (
                      <p className="text-sm text-foreground mb-1">
                        <span className="text-muted-foreground">Source:</span> {transaction.deposit_source.replace('_', ' ').toUpperCase()}
                      </p>
                    )}
                    {transaction.depositor_name && (
                      <p className="text-sm text-foreground mb-1">
                        <span className="text-muted-foreground">Depositor:</span> {transaction.depositor_name}
                      </p>
                    )}
                    {transaction.depositor_bank_name && (
                      <p className="text-sm text-foreground mb-1">
                        <span className="text-muted-foreground">Bank:</span> {transaction.depositor_bank_name}
                      </p>
                    )}
                    {transaction.depositor_account_number && (
                      <p className="text-sm text-foreground mb-1">
                        <span className="text-muted-foreground">Account:</span> {transaction.depositor_account_number}
                      </p>
                    )}
                    {transaction.deposit_reference && (
                      <p className="text-sm text-foreground">
                        <span className="text-muted-foreground">Reference:</span> {transaction.deposit_reference}
                      </p>
                    )}
                  </div>
                )}

                {transaction.transaction_type === 'deposit' && !transaction.from_account && !transaction.depositor_bank_name && (
                  <div className="p-3 border rounded-lg bg-muted/30">
                    <p className="text-sm font-medium text-foreground flex items-center">
                      <BanknotesIcon className="h-4 w-4 mr-1 text-blue-500" />
                      Internal Deposit
                    </p>
                    <p className="text-sm text-muted-foreground">Cash or internal transfer</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Financial Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
          >
            <Card variant="default" className="p-6 h-full">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Financial Details
              </h3>
              <div className="space-y-4">
                <div className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Transaction Amount</span>
                    <span className={`text-lg font-bold ${
                      direction === 'outgoing' ? 'text-red-500' : 'text-green-500'
                    }`}>
                      {formatAmount(transaction.amount, false)}
                    </span>
                  </div>
                  
                  {transaction.fee && parseFloat(String(transaction.fee)) > 0 && (
                    <div className="flex justify-between items-center mb-2 pb-2 border-b">
                      <span className="text-sm text-muted-foreground">Processing Fee</span>
                      <span className="text-sm font-medium text-red-500">
                        {formatAmount(transaction.fee, false)}
                      </span>
                    </div>
                  )}
                  
                  {transaction.total_amount && parseFloat(String(transaction.total_amount)) !== parseFloat(String(transaction.amount)) && (
                    <div className="flex justify-between items-center pt-2 border-t bg-muted/30 px-2 py-1 rounded">
                      <span className="text-sm font-medium text-foreground">Total Impact</span>
                      <span className={`text-lg font-bold ${
                        direction === 'outgoing' ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {direction === 'outgoing' ? '-' : '+'}{formatAmount(transaction.total_amount, false)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-muted-foreground">
                  Currency: {transaction.currency || 'USD'} • Channel: {transaction.channel || 'Online'}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Processing & Status Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card variant="default" className="p-6 h-full">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                Processing Timeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-foreground">Transaction Initiated</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transaction.created_at)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Via {transaction.channel || 'Online Banking'}
                    </p>
                  </div>
                </div>

                {transaction.confirmed_at && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-foreground">Transaction Confirmed</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.confirmed_at)}
                      </p>
                    </div>
                  </div>
                )}

                {transaction.processed_at && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-foreground">Processing Started</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.processed_at)}
                      </p>
                    </div>
                  </div>
                )}
                
                {transaction.status === 'completed' && transaction.completed_at && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-foreground">Transaction Completed</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.completed_at)}
                      </p>
                      <p className="text-xs text-green-600 font-medium">Successfully processed</p>
                    </div>
                  </div>
                )}
                
                {transaction.status === 'failed' && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-foreground">Transaction Failed</p>
                      {transaction.failed_at && (
                        <p className="text-sm text-muted-foreground">
                          {formatDate(transaction.failed_at)}
                        </p>
                      )}
                      {transaction.failure_reason && (
                        <p className="text-xs text-red-600 mt-1">
                          Reason: {transaction.failure_reason}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                
                {transaction.status === 'pending' && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 animate-pulse"></div>
                    <div>
                      <p className="font-medium text-foreground">Awaiting Processing</p>
                      {transaction.expected_completion_date && (
                        <p className="text-sm text-muted-foreground">
                          Expected: {new Date(transaction.expected_completion_date).toLocaleDateString()}
                        </p>
                      )}
                      {transaction.expected_completion_date && (
                        <p className="text-xs text-yellow-600">
                          Expected: {new Date(transaction.expected_completion_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {transaction.status === 'processing' && (
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 animate-pulse"></div>
                    <div>
                      <p className="font-medium text-foreground">Currently Processing</p>
                      <p className="text-sm text-muted-foreground">
                        Processing your transaction...
                      </p>
                      {transaction.expected_completion_date && (
                        <p className="text-xs text-blue-600">
                          Expected: {new Date(transaction.expected_completion_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Auto-confirmation info */}
                {transaction.auto_confirm && transaction.status === 'pending' && (
                  <div className="mt-4 p-2 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-700">
                      ⚡ Auto-confirmation enabled
                      {transaction.confirmation_delay_hours && 
                        ` (${transaction.confirmation_delay_hours}h delay)`
                      }
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Description & Narration */}
          {(transaction.description || transaction.narration) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card variant="default" className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <InformationCircleIcon className="h-5 w-5 mr-2" />
                  Transaction Notes
                </h3>
                <div className="space-y-3">
                  {transaction.description && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Description</p>
                      <p className="text-foreground">{transaction.description}</p>
                    </div>
                  )}
                  {transaction.narration && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Bank Narration</p>
                      <p className="text-foreground font-mono text-sm">{transaction.narration}</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Card Information */}
          {(transaction.card_last_four || transaction.card_brand) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card variant="default" className="p-6 h-full">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Card Information
                </h3>
                <div className="space-y-3">
                  {transaction.card_brand && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Card Brand</p>
                      <p className="text-foreground capitalize">{transaction.card_brand}</p>
                    </div>
                  )}
                  {transaction.card_last_four && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Card Number</p>
                      <p className="text-foreground font-mono">****-****-****-{transaction.card_last_four}</p>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Status Message */}
          {transaction.status_message && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card variant="default" className="p-6 h-full">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <InformationCircleIcon className="h-5 w-5 mr-2" />
                  Status Information
                </h3>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-foreground">{transaction.status_message}</p>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Technical Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.45 }}
          >
            <Card variant="default" className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <IdentificationIcon className="h-5 w-5 mr-2" />
                Technical Details
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Transaction ID</p>
                    <p className="font-mono text-xs break-all">{transaction.id}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Reference</p>
                    <p className="font-mono">{transaction.reference}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Type</p>
                    <p className="capitalize">{transaction.transaction_type.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Status</p>
                    <p className="capitalize">{transaction.status}</p>
                  </div>
                  {transaction.currency && (
                    <div>
                      <p className="text-muted-foreground">Currency</p>
                      <p>{transaction.currency}</p>
                    </div>
                  )}
                  {transaction.channel && (
                    <div>
                      <p className="text-muted-foreground">Channel</p>
                      <p className="capitalize">{transaction.channel}</p>
                    </div>
                  )}
                  {transaction.external_reference && (
                    <div>
                      <p className="text-muted-foreground">External Reference</p>
                      <p className="font-mono text-sm">{transaction.external_reference}</p>
                    </div>
                  )}
                  {transaction.purpose_code && (
                    <div>
                      <p className="text-muted-foreground">Purpose Code</p>
                      <p className="font-mono">{transaction.purpose_code}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button variant="outline" onClick={() => router.back()} className="flex-1 sm:flex-none">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to History
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={() => copyToClipboard(transaction.reference)}
            className="flex-1 sm:flex-none"
          >
            <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
            Copy Reference
          </Button>

          <Button 
            variant="primary" 
            onClick={() => router.push('/transfer')}
            className="flex-1 sm:flex-none"
          >
            New Transfer
          </Button>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

export default function TransactionDetailPage() {
  return (
    <ProtectedRoute>
      <TransactionDetailContent />
    </ProtectedRoute>
  );
}
