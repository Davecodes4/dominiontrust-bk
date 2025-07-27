'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DocumentTextIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Button from './ui/Button';
import Card from './ui/Card';
import { api } from '../lib/api';

interface KYCStatus {
  kyc_status: string;
  kyc_status_display: string;
  kyc_completion_percentage: number;
  has_required_documents: boolean;
  is_verified: boolean;
  required_documents: {
    type: string;
    name: string;
    uploaded: boolean;
    approved: boolean;
  }[];
  uploaded_documents: any[];
  rejection_reason: string;
  last_reviewed: string | null;
}

interface KYCStatusCardProps {
  onStatusUpdate?: () => void;
}

export default function KYCStatusCard({ onStatusUpdate }: KYCStatusCardProps) {
  const router = useRouter();
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadKYCStatus();
  }, []);

  const loadKYCStatus = async () => {
    try {
      setIsLoading(true);
      const status = await api.getKYCStatus();
      setKycStatus(status);
      onStatusUpdate?.();
    } catch (error) {
      console.error('Failed to load KYC status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!kycStatus) return null;
    
    switch (kycStatus.kyc_status) {
      case 'approved':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-6 w-6 text-red-500" />;
      case 'under_review':
        return <ClockIcon className="h-6 w-6 text-blue-500" />;
      case 'documents_required':
        return <DocumentTextIcon className="h-6 w-6 text-orange-500" />;
      default:
        return <ArrowPathIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    if (!kycStatus) return 'bg-gray-50 border-gray-200';
    
    switch (kycStatus.kyc_status) {
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
      case 'under_review':
        return 'bg-blue-50 border-blue-200';
      case 'documents_required':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getActionButton = () => {
    if (!kycStatus) return null;

    switch (kycStatus.kyc_status) {
      case 'approved':
        return (
          <div className="flex items-center space-x-2 text-green-700">
            <CheckCircleIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Verification Complete</span>
          </div>
        );
      case 'documents_required':
        return (
          <Button 
            size="sm" 
            onClick={() => router.push('/kyc-documents')}
          >
            Upload Documents
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Button>
        );
      case 'under_review':
        return (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/kyc-documents')}
          >
            View Status
            <ArrowRightIcon className="ml-1 h-4 w-4" />
          </Button>
        );
      case 'rejected':
        return (
          <Button 
            size="sm" 
            onClick={() => router.push('/kyc-documents')}
          >
            Resubmit Documents
            <ArrowPathIcon className="ml-1 h-4 w-4" />
          </Button>
        );
      default:
        return (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/kyc-documents')}
          >
            Continue Verification
          </Button>
        );
    }
  };

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-sm text-muted-foreground">Loading verification status...</span>
        </div>
      </Card>
    );
  }

  if (!kycStatus) {
    return null;
  }

  return (
    <Card className={`p-4 border-2 ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-semibold text-foreground">Identity Verification</h3>
            <p className="text-sm text-muted-foreground">
              {kycStatus.kyc_status_display}
            </p>
          </div>
        </div>
        {getActionButton()}
      </div>

      {/* Progress Bar */}
      {kycStatus.kyc_status !== 'approved' && (
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Progress</span>
            <span>{Math.round(kycStatus.kyc_completion_percentage)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${kycStatus.kyc_completion_percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Document Status */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {kycStatus.required_documents.map((doc) => (
          <div key={doc.type} className="flex items-center space-x-2">
            {doc.approved ? (
              <CheckCircleIcon className="h-3 w-3 text-green-500" />
            ) : doc.uploaded ? (
              <ClockIcon className="h-3 w-3 text-blue-500" />
            ) : (
              <XCircleIcon className="h-3 w-3 text-gray-400" />
            )}
            <span className={`truncate ${
              doc.approved ? 'text-green-700' : 
              doc.uploaded ? 'text-blue-700' : 
              'text-gray-500'
            }`}>
              {doc.name}
            </span>
          </div>
        ))}
      </div>

      {/* Rejection Reason */}
      {kycStatus.rejection_reason && (
        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-800">
          <div className="flex items-start space-x-1">
            <ExclamationTriangleIcon className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>{kycStatus.rejection_reason}</span>
          </div>
        </div>
      )}

      {/* Status Messages */}
      {kycStatus.kyc_status === 'under_review' && (
        <div className="mt-3 text-xs text-blue-700">
          <ClockIcon className="h-3 w-3 inline mr-1" />
          Review typically takes 1-2 business days
        </div>
      )}
    </Card>
  );
} 