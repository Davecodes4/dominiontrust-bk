'use client';

// Configure for Edge Runtime on Cloudflare Pages
export const runtime = 'edge';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon,
  DocumentDuplicateIcon,
  CalendarIcon,
  BuildingLibraryIcon,
  UserIcon,
  CurrencyDollarIcon,
  ExclamationCircleIcon,
  ShareIcon,
  GlobeAltIcon,
  MapPinIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import { DashboardLayout } from '../../../../components/layout/DashboardLayout';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import Card from '../../../../components/ui/Card';
import Button from '../../../../components/ui/Button';
import { api, TransferRequest } from '../../../../lib/api';

const statusIcons = {
  pending: ClockIcon,
  processing: ClockIcon,
  completed: CheckCircleIcon,
  failed: XCircleIcon,
  cancelled: XCircleIcon,
  approved: CheckCircleIcon,
  rejected: XCircleIcon,
};

const statusColors = {
  pending: 'text-yellow-500 bg-yellow-50 border-yellow-200',
  processing: 'text-blue-500 bg-blue-50 border-blue-200',
  completed: 'text-green-500 bg-green-50 border-green-200',
  failed: 'text-red-500 bg-red-50 border-red-200',
  cancelled: 'text-gray-500 bg-gray-50 border-gray-200',
  approved: 'text-green-500 bg-green-50 border-green-200',
  rejected: 'text-red-500 bg-red-50 border-red-200',
};

function TransferDetailContent() {
  const params = useParams();
  const router = useRouter();
  const [transfer, setTransfer] = useState<TransferRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTransferDetail();
  }, [params.id]);

  const fetchTransferDetail = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getTransferRequest(params.id as string);
      setTransfer(response);
    } catch (err) {
      console.error('Failed to fetch transfer detail:', err);
      setError('Failed to load transfer details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareTransfer = async () => {
    if (navigator.share && transfer) {
      try {
        await navigator.share({
          title: `Transfer ${transfer.reference}`,
          text: `Transfer details: ${transfer.transfer_type} of $${transfer.amount}`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      copyToClipboard(window.location.href);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const getTotalAmount = () => {
    if (!transfer) return 0;
    return transfer.amount + (transfer.fee || 0);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-6">
          <div className="flex items-center justify-center min-h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading transfer details...</p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !transfer) {
    return (
      <DashboardLayout>
        <div className="p-4 lg:p-6">
          <Card variant="default" className="p-8 text-center max-w-md mx-auto">
            <ExclamationCircleIcon className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Transfer Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error || 'The transfer you are looking for could not be found.'}
            </p>
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const StatusIcon = statusIcons[(transfer.status || 'pending') as keyof typeof statusIcons] || ClockIcon;
  const statusColorClass = statusColors[(transfer.status || 'pending') as keyof typeof statusColors] || statusColors.pending;
  const isInternational = transfer.transfer_type === 'international';

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
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
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">Transfer Details</h1>
              <p className="text-muted-foreground">Complete transfer information</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={shareTransfer} className="p-2">
            <ShareIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Main Transfer Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card variant="elevated" className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-6">
              {/* Left: Icon and Basic Info */}
              <div className="flex items-center space-x-4 mb-6 lg:mb-0">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
                  {isInternational ? (
                    <GlobeAltIcon className="w-8 h-8 text-blue-500" />
                  ) : (
                    <ArrowsRightLeftIcon className="w-8 h-8 text-blue-500" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground capitalize">
                    {transfer.transfer_type} Transfer
                  </h2>
                  <p className="text-muted-foreground">
                    {formatDate(transfer.created_at)}
                  </p>
                </div>
              </div>

              {/* Right: Amount and Status */}
              <div className="flex-1 lg:text-right">
                <div className="mb-4">
                  <p className="text-2xl lg:text-3xl font-bold text-blue-600">
                    {formatAmount(transfer.amount)}
                  </p>
                  {transfer.fee && transfer.fee > 0 && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Transfer fee: {formatAmount(transfer.fee)}</p>
                      <p className="font-medium">Total: {formatAmount(getTotalAmount())}</p>
                    </div>
                  )}
                </div>
                
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full border ${statusColorClass}`}>
                  <StatusIcon className="w-4 h-4" />
                  <span className="font-medium capitalize">{transfer.status || 'pending'}</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Transfer Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card variant="default" className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Transfer Reference</p>
                <p className="font-mono text-foreground font-medium">{transfer.reference}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(transfer.reference)}
                className="p-2"
              >
                <DocumentDuplicateIcon className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Transfer Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source Account */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card variant="default" className="p-6 h-full">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <BuildingLibraryIcon className="h-5 w-5 mr-2" />
                Source Account
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Account Number</p>
                  <p className="font-medium text-foreground">{transfer.from_account_id}</p>
                </div>
                {transfer.from_account_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Account Name</p>
                    <p className="font-medium text-foreground">{transfer.from_account_name}</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Destination */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card variant="default" className="p-6 h-full">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                {isInternational ? (
                  <GlobeAltIcon className="h-5 w-5 mr-2" />
                ) : (
                  <UserIcon className="h-5 w-5 mr-2" />
                )}
                Destination
              </h3>
              <div className="space-y-3">
                {isInternational ? (
                  <>
                    {transfer.to_bank_name && (
                      <div>
                        <p className="text-sm text-muted-foreground">Bank Name</p>
                        <p className="font-medium text-foreground">{transfer.to_bank_name}</p>
                      </div>
                    )}
                    {transfer.to_bank_swift && (
                      <div>
                        <p className="text-sm text-muted-foreground">SWIFT Code</p>
                        <p className="font-medium text-foreground font-mono">{transfer.to_bank_swift}</p>
                      </div>
                    )}
                    {transfer.to_account_number && (
                      <div>
                        <p className="text-sm text-muted-foreground">Account Number</p>
                        <p className="font-medium text-foreground">{transfer.to_account_number}</p>
                      </div>
                    )}
                    {transfer.to_bank_address && (
                      <div>
                        <p className="text-sm text-muted-foreground">Bank Address</p>
                        <p className="font-medium text-foreground">{transfer.to_bank_address}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Account Number</p>
                      <p className="font-medium text-foreground">{transfer.to_account_id}</p>
                    </div>
                    {transfer.to_account_name && (
                      <div>
                        <p className="text-sm text-muted-foreground">Account Name</p>
                        <p className="font-medium text-foreground">{transfer.to_account_name}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Recipient Information (International) */}
        {isInternational && (transfer.recipient_name || transfer.recipient_address) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card variant="default" className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                <IdentificationIcon className="h-5 w-5 mr-2" />
                Recipient Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transfer.recipient_name && (
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium text-foreground">{transfer.recipient_name}</p>
                  </div>
                )}
                {transfer.recipient_address && (
                  <div>
                    <p className="text-sm text-muted-foreground">Address</p>
                    <p className="font-medium text-foreground">{transfer.recipient_address}</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Transfer Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card variant="default" className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Transfer Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-foreground">Transfer Initiated</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(transfer.created_at)}
                  </p>
                </div>
              </div>
              
              {(transfer.status || 'pending') === 'completed' && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-foreground">Transfer Completed</p>
                    <p className="text-sm text-muted-foreground">
                      Successfully processed
                    </p>
                  </div>
                </div>
              )}
              
              {(transfer.status || 'pending') === 'failed' && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-foreground">Transfer Failed</p>
                    <p className="text-sm text-muted-foreground">
                      Processing unsuccessful
                    </p>
                  </div>
                </div>
              )}
              
              {['pending', 'processing'].includes(transfer.status || 'pending') && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 animate-pulse"></div>
                  <div>
                    <p className="font-medium text-foreground">Processing</p>
                    <p className="text-sm text-muted-foreground">
                      Transfer is being processed
                    </p>
                  </div>
                </div>
              )}

              {transfer.scheduled_date && new Date(transfer.scheduled_date) > new Date() && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium text-foreground">Scheduled For</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(transfer.scheduled_date)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Purpose/Description */}
        {transfer.purpose && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card variant="default" className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Transfer Purpose</h3>
              <p className="text-muted-foreground">{transfer.purpose}</p>
            </Card>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button variant="outline" onClick={() => router.back()} className="flex-1 sm:flex-none">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to History
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={() => copyToClipboard(transfer.reference)}
            className="flex-1 sm:flex-none"
          >
            <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
            Copy Reference
          </Button>

          {(transfer.status || 'pending') === 'pending' && (
            <Button 
              variant="destructive" 
              onClick={() => {
                // Handle cancel transfer
                console.log('Cancel transfer:', transfer.id);
              }}
              className="flex-1 sm:flex-none"
            >
              Cancel Transfer
            </Button>
          )}

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

export default function TransferDetailPage() {
  return (
    <ProtectedRoute>
      <TransferDetailContent />
    </ProtectedRoute>
  );
}
