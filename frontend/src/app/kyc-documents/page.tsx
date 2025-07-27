'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  DocumentTextIcon, 
  ArrowRightIcon,
  ExclamationTriangleIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  EyeIcon,
  TrashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';

interface DocumentRequirement {
  title: string;
  description: string;
  examples: string[];
  maxSize: string;
  formats: string[];
  category: string;
  required: boolean;
  countrySpecific?: 'US' | 'NON_US';
}

interface KYCDocument {
  id: string;
  document_type: string;
  document_type_display: string;
  document_name: string;
  document_file: string;
  document_url: string;
  file_size: number;
  file_size_display: string;
  verification_status: string;
  verification_status_display: string;
  is_approved: boolean;
  rejection_reason: string;
  reviewer_notes: string;
  uploaded_at: string;
  reviewed_at: string | null;
}

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
  uploaded_documents: KYCDocument[];
  rejection_reason: string;
  last_reviewed: string | null;
}

const DOCUMENT_REQUIREMENTS: Record<string, DocumentRequirement> = {
  // Government-issued identity documents (Choose ONE)
  government_id_us_drivers_license: {
    title: 'U.S. Driver\'s License',
    description: 'Valid U.S. state-issued driver\'s license',
    examples: ['State Driver\'s License', 'Enhanced Driver\'s License'],
    maxSize: '10MB',
    formats: ['PDF', 'JPG', 'JPEG', 'PNG'],
    category: 'Government ID',
    required: true,
    countrySpecific: 'US'
  },
  government_id_us_state_id: {
    title: 'U.S. State ID',
    description: 'Valid U.S. state-issued identification card',
    examples: ['State ID Card', 'Enhanced State ID'],
    maxSize: '10MB',
    formats: ['PDF', 'JPG', 'JPEG', 'PNG'],
    category: 'Government ID',
    required: true,
    countrySpecific: 'US'
  },
  government_id_us_passport: {
    title: 'U.S. Passport',
    description: 'Valid U.S. passport',
    examples: ['U.S. Passport Book', 'U.S. Passport Card'],
    maxSize: '10MB',
    formats: ['PDF', 'JPG', 'JPEG', 'PNG'],
    category: 'Government ID',
    required: true,
    countrySpecific: 'US'
  },
  government_id_passport: {
    title: 'International Passport',
    description: 'Valid passport from any country',
    examples: ['National Passport', 'Diplomatic Passport'],
    maxSize: '10MB',
    formats: ['PDF', 'JPG', 'JPEG', 'PNG'],
    category: 'Government ID',
    required: true
  },
  government_id_national_id: {
    title: 'National ID Card',
    description: 'Government-issued national identification card',
    examples: ['National ID Card', 'Citizen ID', 'Resident ID'],
    maxSize: '10MB',
    formats: ['PDF', 'JPG', 'JPEG', 'PNG'],
    category: 'Government ID',
    required: true
  },
  government_id_drivers_license: {
    title: 'Driver\'s License (Non-U.S.)',
    description: 'Valid driver\'s license from outside the U.S.',
    examples: ['Provincial License', 'International License'],
    maxSize: '10MB',
    formats: ['PDF', 'JPG', 'JPEG', 'PNG'],
    category: 'Government ID',
    required: true,
    countrySpecific: 'NON_US'
  },
  
  // Proof of address documents (Choose ONE)
  proof_address_utility_bill: {
    title: 'Utility Bill',
    description: 'Recent utility bill within 3 months',
    examples: ['Electric Bill', 'Gas Bill', 'Water Bill', 'Internet Bill'],
    maxSize: '10MB',
    formats: ['PDF', 'JPG', 'JPEG', 'PNG'],
    category: 'Proof of Address',
    required: true
  },
  proof_address_bank_statement: {
    title: 'Bank Statement',
    description: 'Recent bank statement within 3 months',
    examples: ['Monthly Statement', 'Account Summary'],
    maxSize: '10MB',
    formats: ['PDF', 'JPG', 'JPEG', 'PNG'],
    category: 'Proof of Address',
    required: true
  },
  proof_address_lease_agreement: {
    title: 'Lease Agreement',
    description: 'Current rental or lease agreement',
    examples: ['Rental Agreement', 'Lease Contract'],
    maxSize: '10MB',
    formats: ['PDF', 'JPG', 'JPEG', 'PNG'],
    category: 'Proof of Address',
    required: true
  },
  
  // U.S.-specific tax documents (SSN Card ONLY - for U.S. residents only)
  us_ssn_card: {
    title: 'Social Security Card',
    description: 'Official Social Security Administration card (required for U.S. residents)',
    examples: ['Social Security Card', 'SSA Replacement Card'],
    maxSize: '10MB',
    formats: ['PDF', 'JPG', 'JPEG', 'PNG'],
    category: 'U.S. Tax Documents',
    required: true,
    countrySpecific: 'US'
  },
  
  // Verification selfie (required for all clients)
  selfie_with_id: {
    title: 'Verification Selfie',
    description: 'Clear photo of yourself holding your ID next to your face',
    examples: ['Selfie with Driver\'s License', 'Selfie with Passport'],
    maxSize: '10MB',
    formats: ['JPG', 'JPEG', 'PNG'],
    category: 'Identity Verification',
    required: true
  }
};

export default function KYCDocumentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [kycStatus, setKycStatus] = useState<KYCStatus | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File | null>>({});
  const [selectedDocumentTypes, setSelectedDocumentTypes] = useState<Record<string, string>>({});

  useEffect(() => {
    loadUserData();
  }, []);

  // Auto-select single document types when data is loaded
  useEffect(() => {
    if (userProfile && kycStatus) {
      const categories = getDocumentsByCategory();
      const autoSelections: Record<string, string> = {};
      
      Object.entries(categories).forEach(([categoryName, documents]) => {
        if (documents.length === 1 && !selectedDocumentTypes[categoryName]) {
          autoSelections[categoryName] = documents[0][0];
        }
      });
      
      if (Object.keys(autoSelections).length > 0) {
        setSelectedDocumentTypes(prev => ({ ...prev, ...autoSelections }));
      }
    }
  }, [userProfile, kycStatus, selectedDocumentTypes]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      // Load both KYC status and user profile
      const [status, profile] = await Promise.all([
        api.getKYCStatus(),
        api.getProfile()
      ]);
      setKycStatus(status);
      setUserProfile(profile);
    } catch (error) {
      console.error('Failed to load user data:', error);
      setErrors({ general: 'Failed to load KYC information' });
    } finally {
      setIsLoading(false);
    }
  };

  // Determine if user is U.S. resident based on profile
  const isUSResident = () => {
    if (!userProfile) return false;
    
    const nationality = userProfile.nationality?.toLowerCase() || '';
    const country = userProfile.country?.toLowerCase() || '';
    
    return (
      nationality.includes('united states') || 
      nationality.includes('american') ||
      country.includes('united states') ||
      country.includes('usa') ||
      country === 'us' ||
      country === 'usa' ||
      country.includes('america')
    );
  };

  // Filter documents based on user's residency
  const getApplicableDocuments = () => {
    const isUS = isUSResident();
    
    return Object.entries(DOCUMENT_REQUIREMENTS).filter(([docType, requirement]) => {
      if (!requirement.countrySpecific) return true;
      if (requirement.countrySpecific === 'US' && isUS) return true;
      if (requirement.countrySpecific === 'NON_US' && !isUS) return true;
      return false;
    });
  };

  // Group documents by category
  const getDocumentsByCategory = () => {
    const applicableDocuments = getApplicableDocuments();
    const categories: Record<string, Array<[string, any]>> = {};
    
    applicableDocuments.forEach(([docType, requirement]) => {
      const category = requirement.category;
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push([docType, requirement]);
    });
    
    return categories;
  };

  const getStatusIcon = (document: KYCDocument) => {
    switch (document.verification_status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'requires_resubmission':
        return <ArrowPathIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-700 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-700 bg-red-50 border-red-200';
      case 'requires_resubmission': return 'text-orange-700 bg-orange-50 border-orange-200';
      default: return 'text-blue-700 bg-blue-50 border-blue-200';
    }
  };

  const renderDocumentCategory = (categoryName: string, documents: Array<[string, DocumentRequirement]>) => {
    const selectedDocType = selectedDocumentTypes[categoryName];
    const hasUploadedDoc = documents.some(([docType]) => 
      kycStatus?.uploaded_documents.find(doc => doc.document_type === docType)
    );
    
    // Find existing uploaded document in this category
    const existingDoc = documents.reduce((found: KYCDocument | null, [docType]) => {
      if (found) return found;
      return kycStatus?.uploaded_documents.find(doc => doc.document_type === docType) || null;
    }, null);

    const handleDocumentTypeSelection = (docType: string) => {
      setSelectedDocumentTypes(prev => ({ ...prev, [categoryName]: docType }));
      setSelectedFiles(prev => ({ ...prev, [categoryName]: null }));
      setErrors(prev => ({ ...prev, [categoryName]: '' }));
    };

    const handleFileSelect = (file: File | null) => {
      if (!file) return;

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ [categoryName]: 'File size cannot exceed 10MB' });
        return;
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({ [categoryName]: 'Only PDF, JPG, JPEG, and PNG files are allowed' });
        return;
      }

      setSelectedFiles(prev => ({ ...prev, [categoryName]: file }));
      setErrors(prev => ({ ...prev, [categoryName]: '' }));
    };

    const uploadDocument = async () => {
      const file = selectedFiles[categoryName];
      const docType = selectedDocumentTypes[categoryName] || (documents.length === 1 ? documents[0][0] : null);
      
      if (!file || !docType) return;

      setUploadingFiles(prev => ({ ...prev, [categoryName]: true }));
      setUploadProgress(prev => ({ ...prev, [categoryName]: 0 }));
      setErrors(prev => ({ ...prev, [categoryName]: '' }));

      try {
        const formData = new FormData();
        formData.append('document_type', docType);
        formData.append('document_file', file);

        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [categoryName]: Math.min((prev[categoryName] || 0) + 10, 90)
          }));
        }, 200);

        const response = await api.uploadKYCDocument(formData);
        
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [categoryName]: 100 }));

        // Clear selected file and reload status
        setSelectedFiles(prev => ({ ...prev, [categoryName]: null }));
        setSelectedDocumentTypes(prev => ({ ...prev, [categoryName]: '' }));
        await loadUserData();

        // Show success message
        setTimeout(() => {
          setUploadProgress(prev => ({ ...prev, [categoryName]: 0 }));
        }, 2000);

      } catch (error: any) {
        console.error('Upload failed:', error);
        setErrors({ [categoryName]: error.message || 'Upload failed. Please try again.' });
      } finally {
        setUploadingFiles(prev => ({ ...prev, [categoryName]: false }));
      }
    };

    const isUploading = uploadingFiles[categoryName];
    const progress = uploadProgress[categoryName] || 0;
    const selectedFile = selectedFiles[categoryName];
    
    // Get the selected requirement - either from selection or single document
    const selectedRequirement = documents.length === 1 
      ? documents[0][1] 
      : documents.find(([docType]) => docType === selectedDocType)?.[1];

    return (
      <Card key={categoryName} className="p-6 mb-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-semibold text-foreground">{categoryName}</h2>
            {existingDoc && (
              <div className="flex items-center space-x-2">
                {getStatusIcon(existingDoc)}
                <span className="text-sm text-muted-foreground">
                  {existingDoc.verification_status_display}
                </span>
              </div>
            )}
          </div>
          <div className="h-1 w-20 bg-primary rounded"></div>
          <p className="text-sm text-muted-foreground mt-2">
            {categoryName === 'Government ID' && 'Choose one form of government-issued identification'}
            {categoryName === 'Proof of Address' && 'Choose one document that shows your current address'}
            {categoryName === 'U.S. Tax Documents' && 'Social Security card is required for U.S. residents'}
            {categoryName === 'Identity Verification' && 'Upload a selfie holding your ID next to your face'}
          </p>
        </div>

        {/* Show existing uploaded document */}
        {existingDoc && (
          <div className={`mb-4 p-3 border rounded-lg ${getStatusColor(existingDoc.verification_status)}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{existingDoc.document_name}</p>
                <p className="text-sm">
                  {existingDoc.verification_status_display} • {existingDoc.file_size_display} • 
                  Uploaded {new Date(existingDoc.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/kyc-documents/view/${existingDoc.id}`)}
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  View
                </Button>
              </div>
            </div>
            
            {existingDoc.rejection_reason && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                <strong>Rejection Reason:</strong> {existingDoc.rejection_reason}
              </div>
            )}
          </div>
        )}

        {/* Document type selection */}
        {!hasUploadedDoc && (
          <div className="space-y-4">
            {/* Only show selection if there are multiple document types */}
            {documents.length > 1 ? (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Select Document Type:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {documents.map(([docType, requirement]) => (
                    <div
                      key={docType}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors hover:border-primary ${
                        selectedDocType === docType
                          ? 'border-primary bg-primary/5'
                          : 'border-border'
                      }`}
                      onClick={() => handleDocumentTypeSelection(docType)}
                    >
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name={`doc-type-${categoryName}`}
                          value={docType}
                          checked={selectedDocType === docType}
                          onChange={() => handleDocumentTypeSelection(docType)}
                          className="text-primary"
                        />
                        <div>
                          <p className="font-medium text-sm">{requirement.title}</p>
                          <p className="text-xs text-muted-foreground">{requirement.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              // Auto-select the single document type
              (() => {
                const [singleDocType, singleRequirement] = documents[0];
                if (!selectedDocType) {
                  handleDocumentTypeSelection(singleDocType);
                }
                return null;
              })()
            )}

            {/* File upload section - show when document type is selected or there's only one option */}
            {(selectedDocType || documents.length === 1) && selectedRequirement && (
              <div className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <h4 className="text-sm font-medium text-foreground mb-2">Requirements for {selectedRequirement.title}:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div>
                      <strong>Examples:</strong> {selectedRequirement.examples.join(', ')}
                    </div>
                    <div>
                      <strong>Formats:</strong> {selectedRequirement.formats.join(', ')} • <strong>Max:</strong> {selectedRequirement.maxSize}
                    </div>
                  </div>
                </div>

                <div>
                  <input
                    type="file"
                    id={`file-${categoryName}`}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label
                    htmlFor={`file-${categoryName}`}
                    className="flex items-center justify-center w-full p-4 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors"
                  >
                    <div className="text-center">
                      <CloudArrowUpIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-foreground">
                        {selectedFile ? selectedFile.name : 'Click to select file or drag and drop'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedRequirement.formats.join(', ')} up to {selectedRequirement.maxSize}
                      </p>
                    </div>
                  </label>
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Uploading...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {errors[categoryName] && (
                  <div className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400">
                    <ExclamationTriangleIcon className="h-4 w-4" />
                    <span>{errors[categoryName]}</span>
                  </div>
                )}

                {/* Upload Button */}
                {selectedFile && !isUploading && (
                  <Button
                    onClick={uploadDocument}
                    className="w-full"
                    disabled={isUploading}
                  >
                    <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                    Upload {selectedRequirement.title}
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Replace document button for existing documents */}
        {hasUploadedDoc && (
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                // Reset state to allow re-upload
                setSelectedDocumentTypes(prev => ({ ...prev, [categoryName]: '' }));
                setSelectedFiles(prev => ({ ...prev, [categoryName]: null }));
                setErrors(prev => ({ ...prev, [categoryName]: '' }));
              }}
              className="w-full"
            >
              Replace Document
            </Button>
          </div>
        )}
      </Card>
    );
  };

  if (isLoading) {
    return (
      <ProtectedRoute requireProfileCompletion={true}>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading KYC information...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireProfileCompletion={true}>
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <DocumentTextIcon className="h-16 w-16 text-primary mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Document Verification
              </h1>
              <p className="text-muted-foreground">
                Upload required documents to verify your identity and complete your account setup
              </p>
            </div>

            {/* KYC Status Overview */}
            {kycStatus && (
              <Card className="p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-foreground">Verification Status</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    kycStatus.kyc_status === 'approved' ? 'bg-green-100 text-green-800' :
                    kycStatus.kyc_status === 'rejected' ? 'bg-red-100 text-red-800' :
                    kycStatus.kyc_status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {kycStatus.kyc_status_display}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Completion Progress</span>
                    <span>{Math.round(kycStatus.kyc_completion_percentage)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${kycStatus.kyc_completion_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Status Messages */}
                {kycStatus.kyc_status === 'approved' && (
                  <div className="flex items-center space-x-2 text-green-700 bg-green-50 p-3 rounded-lg">
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Your documents have been verified! Your account is fully active.</span>
                  </div>
                )}

                {kycStatus.kyc_status === 'under_review' && (
                  <div className="flex items-center space-x-2 text-blue-700 bg-blue-50 p-3 rounded-lg">
                    <ClockIcon className="h-5 w-5" />
                    <span>Your documents are being reviewed. This usually takes 1-2 business days.</span>
                  </div>
                )}

                {kycStatus.rejection_reason && (
                  <div className="flex items-start space-x-2 text-red-700 bg-red-50 p-3 rounded-lg">
                    <ExclamationTriangleIcon className="h-5 w-5 mt-0.5" />
                    <div>
                      <p className="font-medium">Verification Rejected</p>
                      <p className="text-sm">{kycStatus.rejection_reason}</p>
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* General Error */}
            {errors.general && (
              <Card className="p-4 mb-6 bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800/50">
                <p className="text-sm text-orange-600 dark:text-orange-400">{errors.general}</p>
              </Card>
            )}

            {/* Document Upload Sections - Organized by Category */}
            <div className="mb-8">
              {userProfile && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Document Requirements for {isUSResident() ? 'U.S.' : 'International'} Residents
                  </h3>
                  <p className="text-sm text-blue-800">
                    Please provide one document from each required category below. 
                    {isUSResident() 
                      ? ' As a U.S. resident, you must also provide your Social Security card.'
                      : ' International clients only need to provide government ID, proof of address, and verification selfie.'
                    }
                  </p>
                </div>
              )}
              
              {Object.entries(getDocumentsByCategory()).map(([categoryName, documents]) => 
                renderDocumentCategory(categoryName, documents)
              )}
            </div>

            {/* Information Box */}
            <Card className="p-6 bg-blue-50 border-blue-200 mb-8">
              <div className="flex items-start space-x-3">
                <InformationCircleIcon className="h-6 w-6 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Required Documents:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• <strong>Government ID:</strong> Choose one form of official identification</li>
                        <li>• <strong>Proof of Address:</strong> Choose one document showing your current address</li>
                        <li>• <strong>Verification Selfie:</strong> Photo of yourself holding your ID</li>
                        {userProfile && isUSResident() && (
                          <li>• <strong>Social Security Card:</strong> Required for U.S. residents</li>
                        )}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Document Quality:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Clear, legible, and shows all four corners</li>
                        <li>• Well-lit photos with no glare or shadows</li>
                        <li>• Recent documents (within 3 months for address proof)</li>
                        <li>• Files must be under 10MB in PDF, JPG, or PNG format</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-300">
                    <p className="text-sm text-blue-900">
                      <strong>Review Process:</strong> Documents are typically reviewed within 1-2 business days. You'll receive email notifications about status changes.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {kycStatus?.has_required_documents ? (
                <Button
                  onClick={() => router.push('/dashboard')}
                  size="lg"
                >
                  Continue to Dashboard
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Please upload all required documents to continue
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                  >
                    Skip for Now (Limited Access)
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 