'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ArrowRightIcon,
  ArrowLeftIcon,
  BanknotesIcon,
  UserIcon,
  GlobeAmericasIcon,
  ShieldCheckIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  LockClosedIcon,
  ExclamationCircleIcon,
  DocumentCheckIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import ProtectedRoute from '../../components/ProtectedRoute';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { api, BankAccount } from '../../lib/api';
import { processApiError, cleanErrorMessage } from '../../lib/errorUtils';

interface TransferFormData {
  transferType: 'internal' | 'domestic_external' | 'international';
  recipientType: 'new' | 'existing';
  
  // Account Selection
  fromAccountId: string;  // NEW: Which account to transfer from
  
  // Recipient Info
  recipientName: string;
  recipientEmail: string;
  
  // Internal Transfer
  toAccountNumber: string;
  
  // External Domestic (ACH)
  toRoutingNumber: string;
  toBankName: string;
  
  // International (SWIFT)
  toSwiftCode: string;
  toIban: string;
  toBankCountry: string;
  beneficiaryAddress: string;
  purposeCode: string;
  
  // Transfer Details
  amount: string;
  currency: string;
  description: string;
  
  // Scheduling
  transferDate: 'now' | 'later';
  scheduledDate: string;
}

interface UserProfile {
  kyc_status: string;
  is_verified: boolean;
}

const TransferPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { user } = useAuth();
  const [formData, setFormData] = useState<TransferFormData>({
    transferType: 'internal',
    recipientType: 'new',
    fromAccountId: '', // NEW: From account selection
    recipientName: '',
    recipientEmail: '',
    toAccountNumber: '',
    toRoutingNumber: '',
    toBankName: '',
    toSwiftCode: '',
    toIban: '',
    toBankCountry: '',
    beneficiaryAddress: '',
    purposeCode: 'GSD',
    amount: '',
    currency: 'USD',
    description: '',
    transferDate: 'now',
    scheduledDate: ''
  });
  
  // Existing states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [transferResult, setTransferResult] = useState<{
    success: boolean;
    message: string;
    reference?: string;
    estimatedCompletion?: string;
    transaction?: unknown;
  } | null>(null);
  
  // Security states
  const [hasTransferPin, setHasTransferPin] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showSetPinModal, setShowSetPinModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  
  // KYC states
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [kycCheckComplete, setKycCheckComplete] = useState(false);
  const [showKycWarning, setShowKycWarning] = useState(false);

  // Account states - NEW
  const [userAccounts, setUserAccounts] = useState<BankAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  
  // Fee calculation state
  const [calculatedFees, setCalculatedFees] = useState({
    baseFee: 0,
    networkFee: 0,
    totalFee: 0,
    totalCost: 0
  });
  const [loadingFees, setLoadingFees] = useState(false);

  const totalSteps = 4;

  // Recalculate fees when amount or transfer type changes
  useEffect(() => {
    const amount = parseFloat(formData.amount);
    if (amount > 0) {
      setLoadingFees(true);
      calculateFees().then(fees => {
        setCalculatedFees(fees);
        setLoadingFees(false);
      }).catch(error => {
        console.error('Fee calculation failed:', error);
        setLoadingFees(false);
      });
    }
  }, [formData.amount, formData.transferType]);

  // Initialize PIN and KYC checks
  useEffect(() => {
    const initializeSecurityChecks = async () => {
      try {
        // Check transfer PIN status
        const pinResponse = await api.checkTransferPin();
        setHasTransferPin(pinResponse.hasPin);

        // Check KYC status
        const profileResponse = await api.getProfile();
        setUserProfile(profileResponse);
        
        await api.getKYCStatus();
        // KYC response is used for validation checks
        
        // Load user accounts - NEW
        setLoadingAccounts(true);
        const accountsResponse = await api.getAccounts();
        console.log('🏦 Loaded user accounts:', accountsResponse);
        setUserAccounts(accountsResponse);
        
        // Set default from account to the account with the highest balance
        const activeAccounts = accountsResponse.filter(acc => acc.status === 'active');
        if (activeAccounts.length > 0) {
          // Sort by balance descending and pick the one with highest balance
          const accountWithFunds = activeAccounts.sort((a, b) => 
            parseFloat(String(b.balance || 0)) - parseFloat(String(a.balance || 0))
          )[0];
          console.log('💰 Selected default account:', accountWithFunds);
          setFormData(prev => ({ ...prev, fromAccountId: accountWithFunds.id }));
        }
        
        // Check if KYC is approved
        if (profileResponse.kyc_status !== 'approved' || !profileResponse.is_verified) {
          setShowKycWarning(true);
        }
        
        setKycCheckComplete(true);
      } catch (error) {
        console.error('Failed to initialize security checks:', error);
        setErrors({ general: 'Failed to load security information. Please try again.' });
      } finally {
        setLoadingAccounts(false);
      }
    };

    if (user) {
      initializeSecurityChecks();
    }
  }, [user]);

  // PIN verification functions
  const handleSetPin = async () => {
    if (newPin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }

    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setPinError('PIN must be exactly 4 digits');
      return;
    }

    try {
      setIsLoading(true);
      await api.setTransferPin({ newPin });
      setHasTransferPin(true);
      setShowSetPinModal(false);
      setNewPin('');
      setConfirmPin('');
      setPinError('');
      
      // Show success notification
      alert('Transfer PIN set successfully!');
    } catch (error: unknown) {
      setPinError(error instanceof Error ? cleanErrorMessage(error.message) : 'Failed to set PIN');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyPin = async () => {
    if (pin.length !== 4) {
      setPinError('Please enter your 4-digit PIN');
      return false;
    }

    try {
      const response = await api.verifyTransferPin({ pin });
      if (response.valid) {
        setPinError('');
        return true;
      } else {
        // Use the specific error message from the API if available
        setPinError(response.message || 'Invalid PIN. Please try again.');
        return false;
      }
    } catch (error: any) {
      // Handle API errors - for PIN verification, 401 is expected for invalid PIN
      if (error.status === 401 && error.data?.error) {
        setPinError(cleanErrorMessage(error.data.error));
        return false;
      }
      
      // For other errors, use processApiError
      const processedError = processApiError(error);
      setPinError(processedError.general || 'PIN verification failed');
      return false;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      // Transfer type validation is handled by radio buttons
    }

    if (step === 2) {
      // NEW: Validate from account selection
      if (!formData.fromAccountId) newErrors.fromAccountId = 'Please select an account to transfer from';
      
      if (!formData.recipientName) newErrors.recipientName = 'Recipient name is required';
      
      if (formData.transferType === 'internal') {
        if (!formData.toAccountNumber) newErrors.toAccountNumber = 'Account number is required';
      } else if (formData.transferType === 'domestic_external') {
        if (!formData.toAccountNumber) newErrors.toAccountNumber = 'Account number is required';
        if (!formData.toRoutingNumber) newErrors.toRoutingNumber = 'Routing number is required';
        if (!formData.toBankName) newErrors.toBankName = 'Bank name is required';
      } else if (formData.transferType === 'international') {
        if (!formData.toSwiftCode) newErrors.toSwiftCode = 'SWIFT code is required';
        if (!formData.toBankName) newErrors.toBankName = 'Bank name is required';
        if (!formData.toIban) newErrors.toIban = 'IBAN is required';
        if (!formData.toBankCountry) newErrors.toBankCountry = 'Country is required';
        if (!formData.beneficiaryAddress) newErrors.beneficiaryAddress = 'Beneficiary address is required';
      }
    }

    if (step === 3) {
      if (!formData.amount) {
        newErrors.amount = 'Amount is required';
      } else if (parseFloat(formData.amount) <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
      }
      if (!formData.description) newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const calculateFees = async () => {
    const amount = parseFloat(formData.amount) || 0;
    
    // Use the new API to calculate accurate fees
    try {
      const feeResponse = await api.calculateTransferFee({
        transfer_type: formData.transferType,
        amount: amount
      });
      
      return {
        baseFee: feeResponse.base_fee,
        networkFee: feeResponse.network_fee || 0,
        totalFee: feeResponse.total_fee,
        totalCost: amount + feeResponse.total_fee
      };
    } catch (error) {
      console.error('Failed to calculate fees:', error);
      // Fallback to static fees
      let baseFee = 0;
      let networkFee = 0;

      switch (formData.transferType) {
        case 'internal':
          baseFee = 0;
          break;
        case 'domestic_external':
          baseFee = 15;
          break;
        case 'international':
          baseFee = 45;
          networkFee = Math.random() * 20 + 10; // Random correspondent fee
          break;
      }

      return {
        baseFee,
        networkFee,
        totalFee: baseFee + networkFee,
        totalCost: amount + baseFee + networkFee
      };
    }
  };

  // Add validation functions for real-time feedback
  const validateAccountNumber = async (accountNumber: string) => {
    if (!accountNumber || formData.transferType !== 'internal') return;
    
    try {
      const result = await api.validateAccount(accountNumber);
      if (!result.valid) {
        setErrors(prev => ({ ...prev, toAccountNumber: cleanErrorMessage(result.message || 'Invalid account number') }));
      } else {
        setErrors(prev => ({ ...prev, toAccountNumber: '' }));
      }
    } catch (error) {
      console.error('Account validation error:', error);
    }
  };

  const validateRoutingNumber = async (routingNumber: string) => {
    if (!routingNumber || formData.transferType !== 'domestic_external') return;
    
    try {
      const result = await api.validateRouting(routingNumber);
      if (!result.valid) {
        setErrors(prev => ({ ...prev, toRoutingNumber: cleanErrorMessage(result.message || 'Invalid routing number') }));
      } else {
        setErrors(prev => ({ ...prev, toRoutingNumber: '' }));
        // If bank name is returned, auto-fill it
        if (result.bank_name) {
          setFormData(prev => ({ ...prev, toBankName: result.bank_name }));
        }
      }
    } catch (error) {
      console.error('Routing validation error:', error);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    // Check KYC status first
    if (!userProfile?.is_verified || userProfile?.kyc_status !== 'approved') {
      setErrors({ 
        general: 'Your account must be KYC verified to make transfers. Please complete your KYC verification first.' 
      });
      return;
    }

    // Check if user has transfer PIN
    if (!hasTransferPin) {
      setShowSetPinModal(true);
      return;
    }

    // Show PIN verification modal
    setShowPinModal(true);
  };

  const processTransfer = async () => {
    // Verify PIN first
    const pinValid = await verifyPin();
    if (!pinValid) return;

    setIsLoading(true);
    setShowPinModal(false);
    
    try {
      // For internal transfers, use simple structure
      // For external transfers, use external transfer endpoint
      let response;
      let accountNumber = '';
      
      // Determine the correct account number based on transfer type
      if (formData.transferType === 'internal' || formData.transferType === 'domestic_external') {
        accountNumber = formData.toAccountNumber;
      } else if (formData.transferType === 'international') {
        accountNumber = formData.toIban; // Use IBAN as account number for international
      }

      // Validate account number is not empty
      if (!accountNumber || accountNumber.trim() === '') {
        const fieldName = formData.transferType === 'international' ? 'IBAN' : 'Account Number';
        throw new Error(`${fieldName} is required`);
      }
      
      // Create transfer request using the new API
      const transferRequestData = {
        from_account_id: formData.fromAccountId,  // Changed from 'from_account' to 'from_account_id'
        to_account_number: accountNumber,
        amount: parseFloat(formData.amount),
        transfer_type: formData.transferType,
        description: formData.description,
        // External transfer fields
        ...(formData.transferType === 'domestic_external' && {
          to_bank_name: formData.toBankName,
          to_routing_number: formData.toRoutingNumber,
          beneficiary_name: formData.recipientName
        }),
        ...(formData.transferType === 'international' && {
          to_bank_name: formData.toBankName,
          to_swift_code: formData.toSwiftCode,
          beneficiary_name: formData.recipientName,
          beneficiary_address: formData.beneficiaryAddress
        })
      };

      console.log('🚀 Sending transfer request:', transferRequestData);
      console.log('📋 Selected from account ID:', formData.fromAccountId);
      console.log('🏦 Available accounts:', userAccounts.map(acc => `${acc.id} (${acc.account_name}) - $${acc.balance}`));
      
      response = await api.createTransferRequest(transferRequestData);
      
      setTransferResult({
        success: true,
        message: response.message || 'Transfer request created successfully',
        reference: response.transfer_request?.id || `TR${Date.now()}`,
        estimatedCompletion: response.completion_message || 'Processing...',
        transaction: response.transfer_request
      });
      
      setCurrentStep(4);
      setPin(''); // Clear PIN for security
      
      // Show success notification
      try {
        // Trigger notification creation on backend
        await fetch('/api/notifications/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Transfer Initiated',
            message: `Transfer of $${formData.amount} to ${formData.recipientName} has been initiated.`,
            type: 'transaction'
          })
        });
      } catch (notificationError) {
        console.warn('Failed to create notification:', notificationError);
      }
      
    } catch (error: unknown) {
      console.error('Transfer error details:', error);
      
      const processedError = processApiError(error);
      
      // Set field-specific errors if any
      if (Object.keys(processedError.fields).length > 0) {
        setErrors({ ...processedError.fields });
      }
      
      // Set general error if any
      if (processedError.general) {
        setErrors(prev => ({ ...prev, general: processedError.general }));
      }
      
      setPin(''); // Clear PIN on error
    } finally {
      setIsLoading(false);
    }
  };

  const transferTypes = [
    {
      type: 'internal',
      title: 'Internal Transfer',
      description: 'Send money to another Dominion Trust Capital account',
      icon: UserIcon,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      fee: '$0.00',
      time: 'Instant'
    },
    {
      type: 'domestic_external',
      title: 'Domestic Transfer',
      description: 'Send money to any US bank account',
      icon: BanknotesIcon,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      fee: '$15.00',
      time: '1-3 business days'
    },
    {
      type: 'international',
      title: 'International Transfer',
      description: 'Send money worldwide via SWIFT',
      icon: GlobeAmericasIcon,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      fee: '$45.00',
      time: '3-5 business days'
    }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
            step < currentStep 
              ? 'bg-primary text-primary-foreground' 
              : step === currentStep 
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-muted-foreground'
          }`}>
            {step < currentStep ? <CheckIcon className="w-4 h-4" /> : step}
          </div>
          {step < 4 && (
            <div className={`w-12 h-0.5 mx-2 transition-colors ${
              step < currentStep ? 'bg-primary' : 'bg-secondary'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Choose Transfer Type
        </h2>
        <p className="text-muted-foreground">
          Select how you&apos;d like to send money
        </p>
      </div>

      <div className="space-y-4">
        {transferTypes.map((type) => (
          <Card
            key={type.type}
            variant={formData.transferType === type.type ? 'elevated' : 'default'}
            className={`cursor-pointer transition-all duration-200 ${
              formData.transferType === type.type 
                ? 'ring-2 ring-primary border-primary' 
                : 'hover:border-primary/50'
            }`}
            onClick={() => setFormData(prev => ({ ...prev, transferType: type.type as 'internal' | 'domestic_external' | 'international' }))}
          >
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${type.bgColor} rounded-lg flex items-center justify-center`}>
                <type.icon className={`h-6 w-6 ${type.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{type.title}</h3>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">{type.fee}</p>
                <p className="text-xs text-muted-foreground">{type.time}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Transfer Details
        </h2>
        <p className="text-muted-foreground">
          Select accounts and recipient information
        </p>
      </div>

      <div className="space-y-4">
        {/* FROM Account Selection - NEW */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Transfer From Account
          </label>
          {loadingAccounts ? (
            <div className="p-3 bg-secondary/30 rounded-lg text-sm text-muted-foreground">
              Loading your accounts...
            </div>
          ) : userAccounts.length > 0 ? (
            <select
              name="fromAccountId"
              value={formData.fromAccountId}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border bg-input border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select account to transfer from</option>
              {userAccounts
                .filter(account => account.status === 'active')
                .sort((a, b) => parseFloat(String(b.balance || 0)) - parseFloat(String(a.balance || 0))) // Sort by balance descending
                .map(account => {
                  const balance = parseFloat(String(account.balance || 0));
                  const hasBalance = balance > 0;
                  return (
                    <option key={account.id} value={account.id}>
                      {account.account_name || account.account_type} - {account.account_number} 
                      (${balance.toFixed(2)}) {hasBalance ? '✓' : '⚠️ No funds'}
                    </option>
                  );
                })}
            </select>
          ) : (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
              No active accounts found. Please contact support.
            </div>
          )}
          {errors.fromAccountId && (
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">{errors.fromAccountId}</p>
          )}
        </div>

        <Input
          name="recipientName"
          label="Recipient Name"
          placeholder="Enter recipient's full name"
          value={formData.recipientName}
          onChange={handleInputChange}
          error={errors.recipientName}
          variant="filled"
          required
        />

        {formData.transferType === 'internal' && (
          <>
            <Input
              name="toAccountNumber"
              label="Dominion Trust Capital Account Number"
              placeholder="Enter account number"
              value={formData.toAccountNumber}
              onChange={handleInputChange}
              onBlur={() => validateAccountNumber(formData.toAccountNumber)}
              error={errors.toAccountNumber}
              variant="filled"
              required
            />
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-700">
              <strong>Available accounts to transfer to:</strong><br/>
              {userAccounts.filter(acc => acc.id !== formData.fromAccountId).map(acc => 
                acc.account_number + ' (' + (acc.account_name || acc.account_type) + ')'
              ).join(', ') || 'None (you can only transfer between your own accounts)'}
            </div>
          </>
        )}

        {formData.transferType === 'domestic_external' && (
          <>
            <Input
              name="toAccountNumber"
              label="Account Number"
              placeholder="Enter account number"
              value={formData.toAccountNumber}
              onChange={handleInputChange}
              error={errors.toAccountNumber}
              variant="filled"
              required
            />
            <Input
              name="toRoutingNumber"
              label="Routing Number"
              placeholder="Enter 9-digit routing number"
              value={formData.toRoutingNumber}
              onChange={handleInputChange}
              onBlur={() => validateRoutingNumber(formData.toRoutingNumber)}
              error={errors.toRoutingNumber}
              variant="filled"
              required
            />
            <Input
              name="toBankName"
              label="Bank Name"
              placeholder="Enter bank name"
              value={formData.toBankName}
              onChange={handleInputChange}
              error={errors.toBankName}
              variant="filled"
              required
            />
          </>
        )}

        {formData.transferType === 'international' && (
          <>
            <Input
              name="toSwiftCode"
              label="SWIFT Code"
              placeholder="Enter SWIFT/BIC code"
              value={formData.toSwiftCode}
              onChange={handleInputChange}
              error={errors.toSwiftCode}
              variant="filled"
              required
            />
            <Input
              name="toBankName"
              label="Bank Name"
              placeholder="Enter bank name"
              value={formData.toBankName}
              onChange={handleInputChange}
              error={errors.toBankName}
              variant="filled"
              required
            />
            <Input
              name="toIban"
              label="IBAN"
              placeholder="Enter International Bank Account Number"
              value={formData.toIban}
              onChange={handleInputChange}
              error={errors.toIban}
              variant="filled"
              required
            />
            <Input
              name="toBankCountry"
              label="Country"
              placeholder="Enter country"
              value={formData.toBankCountry}
              onChange={handleInputChange}
              error={errors.toBankCountry}
              variant="filled"
              required
            />
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Beneficiary Address
              </label>
              <textarea
                name="beneficiaryAddress"
                placeholder="Enter complete address"
                value={formData.beneficiaryAddress}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border bg-input border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
                required
              />
              {errors.beneficiaryAddress && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">{errors.beneficiaryAddress}</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => {
    const fees = calculatedFees;
    
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Transfer Amount
          </h2>
          <p className="text-muted-foreground">
            Enter the amount and details
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Input
                name="amount"
                type="number"
                label="Amount"
                placeholder="0.00"
                value={formData.amount}
                onChange={handleInputChange}
                error={errors.amount}
                variant="filled"
                step="0.01"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-lg border bg-input border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              name="description"
              placeholder="What's this transfer for?"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border bg-input border-border text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
              required
            />
            {errors.description && (
              <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Fee Summary */}
          {formData.amount && (
            <Card variant="elevated" className="bg-secondary/30">
              <h3 className="font-semibold text-foreground mb-3">Transfer Summary</h3>
              {loadingFees ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Calculating fees...</span>
                    <span className="text-muted-foreground">⏳</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transfer Amount</span>
                    <span className="text-foreground">${formData.amount}</span>
                  </div>
                  {fees.baseFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Transfer Fee</span>
                      <span className="text-foreground">${fees.baseFee.toFixed(2)}</span>
                    </div>
                  )}
                  {fees.networkFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network Fee</span>
                      <span className="text-foreground">${fees.networkFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-border pt-2 flex justify-between font-medium">
                    <span className="text-foreground">Total Cost</span>
                    <span className="text-foreground">${fees.totalCost.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    );
  };

  const renderKycWarning = () => (
    <Card variant="default" className="p-4 bg-yellow-500/10 border-yellow-500/20 mb-6">
      <div className="flex items-start space-x-3">
        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-foreground mb-1">KYC Verification Required</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Your account needs to be KYC verified before you can make transfers. 
            Please complete your verification process.
          </p>
          <div className="flex space-x-3">
            <Link href="/kyc">
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600">
                <DocumentCheckIcon className="w-4 h-4 mr-2" />
                Complete KYC
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowKycWarning(false)}
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderSetPinModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card variant="elevated" className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <LockClosedIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Set Transfer PIN</h3>
              <p className="text-sm text-muted-foreground">
                Create a 4-digit PIN to secure your transfers
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              type="password"
              label="New PIN"
              placeholder="Enter 4-digit PIN"
              value={newPin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setNewPin(value);
                setPinError('');
              }}
              variant="filled"
              maxLength={4}
            />
            
            <Input
              type="password"
              label="Confirm PIN"
              placeholder="Confirm your PIN"
              value={confirmPin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setConfirmPin(value);
                setPinError('');
              }}
              variant="filled"
              maxLength={4}
            />

            {pinError && (
              <div className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400">
                <ExclamationCircleIcon className="w-4 h-4" />
                <span>{pinError}</span>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowSetPinModal(false);
                  setNewPin('');
                  setConfirmPin('');
                  setPinError('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSetPin}
                loading={isLoading}
                disabled={!newPin || !confirmPin}
              >
                Set PIN
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderPinModal = () => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card variant="elevated" className="w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Verify Transfer PIN</h3>
              <p className="text-sm text-muted-foreground">
                Enter your 4-digit PIN to authorize this transfer
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Transfer Amount</p>
              <p className="text-2xl font-bold text-foreground">${formData.amount}</p>
              <p className="text-sm text-muted-foreground">to {formData.recipientName}</p>
            </div>

            <Input
              type="password"
              label="Transfer PIN"
              placeholder="Enter your 4-digit PIN"
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPin(value);
                setPinError('');
              }}
              variant="filled"
              maxLength={4}
              autoFocus
            />

            {pinError && (
              <div className="flex items-center space-x-2 text-sm text-orange-600 dark:text-orange-400">
                <ExclamationCircleIcon className="w-4 h-4" />
                <span>{pinError}</span>
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowPinModal(false);
                  setPin('');
                  setPinError('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={processTransfer}
                loading={isLoading}
                disabled={pin.length !== 4}
              >
                Confirm Transfer
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderStep4 = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
        <CheckIcon className="h-8 w-8 text-green-500" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Transfer Initiated Successfully!
        </h2>
        <p className="text-muted-foreground">
          Your transfer has been submitted and is being processed.
        </p>
      </div>

      {transferResult && (
        <Card variant="elevated">
          <div className="space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Reference Number</span>
              <span className="font-mono text-foreground">{transferResult.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount</span>
              <span className="text-foreground">${formData.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Recipient</span>
              <span className="text-foreground">{formData.recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estimated Completion</span>
              <span className="text-foreground">{transferResult.estimatedCompletion}</span>
            </div>
          </div>
        </Card>
      )}

      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
        <ClockIcon className="h-4 w-4" />
        <span>You&apos;ll receive updates via email and SMS</span>
      </div>

      <div className="flex space-x-4">
        <Button variant="outline" className="flex-1">
          View Transaction
        </Button>
        <Button className="flex-1" onClick={() => window.location.href = '/dashboard'}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );

  // Main render method
  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* KYC Warning */}
            {showKycWarning && !kycCheckComplete && renderKycWarning()}
            
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-foreground mb-2">Transfer Money</h1>
              <p className="text-muted-foreground">Send money securely and instantly</p>
            </div>

            <Card variant="elevated" className="p-8">
              {renderStepIndicator()}

              {errors.general && (
                <Card variant="default" className="p-4 bg-orange-50 border-orange-200 mb-6 dark:bg-orange-950/30 dark:border-orange-800/50">
                  <div className="flex items-start space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-orange-600 dark:text-orange-400">{errors.general}</p>
                  </div>
                </Card>
              )}

              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}

              {currentStep < 4 && (
                <div className="flex space-x-4 mt-8">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="lg"
                      onClick={handlePrevious}
                      className="flex-1"
                    >
                      <ArrowLeftIcon className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                  )}
                  
                  {currentStep < 3 ? (
                    <Button
                      type="button"
                      size="lg"
                      onClick={handleNext}
                      className="flex-1"
                    >
                      Next
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="lg"
                      loading={isLoading}
                      onClick={handleSubmit}
                      className="flex-1"
                    >
                      {isLoading ? 'Processing...' : 'Send Transfer'}
                      <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
            </Card>

            {/* Security Notice */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <ShieldCheckIcon className="h-4 w-4 text-primary" />
                <span>Your transfer is protected with bank-level security</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      {showSetPinModal && renderSetPinModal()}
      {showPinModal && renderPinModal()}
    </DashboardLayout>
  );
};

const ProtectedTransferPage: React.FC = () => {
  return (
    <ProtectedRoute requireProfileCompletion={true}>
      <TransferPage />
    </ProtectedRoute>
  );
};

export default ProtectedTransferPage; 