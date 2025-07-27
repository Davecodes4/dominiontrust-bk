'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  PhoneIcon, 
  GlobeAltIcon,
  BriefcaseIcon,
  UserPlusIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  IdentificationIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import CountrySelect from '../../components/ui/CountrySelect';
import PhoneInput from '../../components/ui/PhoneInput';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../lib/api';
import { countries, formatPhoneNumber } from '../../lib/countries';

interface ProfileCompletionData {
  username: string;
  middle_name: string;
  phone_number: string;
  phone_country: string;
  nationality: string;
  country: string;
  // Personal details
  date_of_birth: string;
  gender: string;
  marital_status: string;
  // Address information
  address: string;
  city: string;
  state: string;
  postal_code: string;
  // Identification
  id_type: string;
  id_number: string;
  // Employment
  job_title: string;
  employment_type: string;
  work_address: string;
  // Alternative Contact (optional)
  alternative_phone?: string;
  // Emergency Contact (optional)
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  // Preferences
  preferred_branch: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  statement_delivery: string;
  language?: string;
}

interface CompletionField {
  field: string;
  label: string;
  current: string;
}

interface ProfileCompletionResponse {
  requires_completion: boolean;
  current_data: ProfileCompletionData;
  completion_fields: {
    username: {
      required: boolean;
      current: string;
      auto_generated: boolean;
    };
    optional_fields: CompletionField[];
  };
}

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [formData, setFormData] = useState<ProfileCompletionData>({
    username: '',
    middle_name: '',
    phone_number: '',
    phone_country: 'US',
    nationality: '',
    country: '',
    // Personal details
    date_of_birth: '',
    gender: '',
    marital_status: '',
    // Address information
    address: '',
    city: '',
    state: '',
    postal_code: '',
    // Identification
    id_type: '',
    id_number: '',
    // Employment
    job_title: '',
    employment_type: '',
    work_address: '',
    // Optional fields
    alternative_phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relationship: '',
    // Preferences
    preferred_branch: '',
    email_notifications: true,
    sms_notifications: true,
    statement_delivery: 'email',
    language: '',
  });
  
  const [completionInfo, setCompletionInfo] = useState<ProfileCompletionResponse | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const totalSteps = 3;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/signin');
      return;
    }
    
    if (isAuthenticated) {
      loadProfileCompletion();
    }
  }, [isAuthenticated, isLoading, router]);

  const loadProfileCompletion = async () => {
    try {
      const response = await api.getProfileCompletion();
      setCompletionInfo(response);
      
      // Pre-fill form with current data
      setFormData({
        ...formData,
        ...response.current_data
      });
      
      // If profile doesn't require completion, redirect to dashboard
      if (!response.requires_completion) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Failed to load profile completion info:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : false;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      // Personal Information
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      if (!formData.middle_name.trim()) newErrors.middle_name = 'Middle name is required';
      if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required';
      if (!formData.phone_country.trim()) newErrors.phone_country = 'Phone country is required';
      if (!formData.nationality.trim()) newErrors.nationality = 'Nationality is required';
      if (!formData.country.trim()) newErrors.country = 'Country is required';
      if (!formData.date_of_birth.trim()) newErrors.date_of_birth = 'Date of birth is required';
      if (!formData.gender.trim()) newErrors.gender = 'Gender is required';
      if (!formData.marital_status.trim()) newErrors.marital_status = 'Marital status is required';
      // Address Information
      if (!formData.address.trim()) newErrors.address = 'Address is required';
      if (!formData.city.trim()) newErrors.city = 'City is required';
      if (!formData.state.trim()) newErrors.state = 'State is required';
      if (!formData.postal_code.trim()) newErrors.postal_code = 'Postal code is required';
      // Identification
      if (!formData.id_type.trim()) newErrors.id_type = 'ID type is required';
      if (!formData.id_number.trim()) newErrors.id_number = 'ID number is required';
    }
    if (step === 2) {
      // Employment Information
      if (!formData.job_title.trim()) newErrors.job_title = 'Job title is required';
      if (!formData.employment_type.trim()) newErrors.employment_type = 'Employment type is required';
      if (!formData.work_address.trim()) newErrors.work_address = 'Work address is required';
      // Alternative and emergency contact are optional
    }
    if (step === 3) {
      // Preferences
      if (!formData.preferred_branch.trim()) newErrors.preferred_branch = 'Preferred branch is required';
      if (!formData.statement_delivery.trim()) newErrors.statement_delivery = 'Statement delivery is required';
      // language is optional
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only submit when on the final step
    if (currentStep !== totalSteps) {
      handleNext();
      return;
    }
    
    // Validate all steps before final submission
    let allValid = true;
    for (let step = 1; step <= totalSteps; step++) {
      if (!validateStep(step)) {
        allValid = false;
        setCurrentStep(step); // Go to the first invalid step
        break;
      }
    }
    
    if (!allValid) return;

    setIsSubmitting(true);
    setErrors({});
    
    try {
      // Clean up the form data before sending - ensure all required fields are present and valid
      const cleanedFormData = {
        ...formData,
        // Ensure optional fields are properly handled
        alternative_phone: formData.alternative_phone?.trim() || '',
        emergency_contact_name: formData.emergency_contact_name?.trim() || '',
        emergency_contact_phone: formData.emergency_contact_phone?.trim() || '',
        emergency_contact_relationship: formData.emergency_contact_relationship?.trim() || '',
        language: formData.language?.trim() || '',
        // Ensure all required fields are trimmed but not empty
        username: formData.username.trim(),
        middle_name: formData.middle_name.trim(),
        phone_number: formData.phone_number.trim(),
        phone_country: formData.phone_country.trim(),
        nationality: formData.nationality.trim(),
        country: formData.country.trim(),
        date_of_birth: formData.date_of_birth.trim(),
        gender: formData.gender.trim(),
        marital_status: formData.marital_status.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        postal_code: formData.postal_code.trim(),
        id_type: formData.id_type.trim(),
        id_number: formData.id_number.trim(),
        job_title: formData.job_title.trim(),
        employment_type: formData.employment_type.trim(),
        work_address: formData.work_address.trim(),
        preferred_branch: formData.preferred_branch.trim(),
      };
      
      console.log('Submitting form data:', cleanedFormData);
      
      const response = await api.completeProfile(cleanedFormData);
      
      // Redirect based on next step
      if (response.next_step === 'document_upload') {
        router.push('/kyc-documents');
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Profile completion error:', error);
      
      if (error.status === 400 && error.data?.errors) {
        console.log('Backend validation errors:', error.data.errors);
        setErrors(error.data.errors);
      } else {
        setErrors({ general: error.message || 'Failed to complete profile. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <UserIcon className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Personal Information
        </h2>
        <p className="text-muted-foreground">
          Complete your basic profile information
        </p>
      </div>

      <div className="space-y-4">
        <Input
          name="username"
          type="text"
          label="Username *"
          placeholder="Enter your preferred username"
          value={formData.username ?? ''}
          onChange={handleInputChange}
          error={errors.username}
          leftIcon={<UserIcon className="h-5 w-5" />}
          variant="filled"
          required
        />
        
        {completionInfo?.completion_fields.username.auto_generated && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <CheckCircleIcon className="h-4 w-4 inline mr-1" />
              We've generated a temporary username for you. Please change it to something more memorable.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="middle_name"
            type="text"
            label="Middle Name *"
            placeholder="Enter your middle name"
            value={formData.middle_name ?? ''}
            onChange={handleInputChange}
            error={errors.middle_name}
            variant="filled"
            required
          />

          <Input
            name="date_of_birth"
            type="date"
            label="Date of Birth *"
            value={formData.date_of_birth ?? ''}
            onChange={handleInputChange}
            error={errors.date_of_birth}
            variant="filled"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Gender *
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              required
            >
              <option value="">Select gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
            {errors.gender && (
              <p className="text-sm text-red-500 mt-1">{errors.gender}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              Marital Status *
            </label>
            <select
              name="marital_status"
              value={formData.marital_status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              required
            >
              <option value="">Select marital status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
            {errors.marital_status && (
              <p className="text-sm text-red-500 mt-1">{errors.marital_status}</p>
            )}
          </div>
        </div>

        <PhoneInput
          value={formData.phone_number ?? ''}
          onChange={(phone) => setFormData(prev => ({ ...prev, phone_number: phone ?? '' }))}
          countryCode={formData.phone_country ?? 'US'}
          onCountryChange={(countryCode) => setFormData(prev => ({ ...prev, phone_country: countryCode ?? 'US' }))}
          error={errors.phone_number}
          label="Phone Number *"
          placeholder="Enter your phone number"
          required
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="nationality"
            type="text"
            label="Nationality *"
            placeholder="Enter your nationality (e.g., American, British)"
            value={formData.nationality ?? ''}
            onChange={handleInputChange}
            error={errors.nationality}
            leftIcon={<GlobeAltIcon className="h-5 w-5" />}
            variant="filled"
            required
          />

          <Input
            name="country"
            type="text"
            label="Country *"
            placeholder="Enter your country of residence"
            value={formData.country ?? ''}
            onChange={handleInputChange}
            error={errors.country}
            leftIcon={<GlobeAltIcon className="h-5 w-5" />}
            variant="filled"
            required
          />
        </div>

        {/* Address Section */}
        <div className="border-t border-border pt-4">
          <h3 className="text-lg font-semibold text-foreground mb-3">Address Information</h3>
          
          <Input
            name="address"
            type="text"
            label="Address *"
            placeholder="Enter your full address"
            value={formData.address ?? ''}
            onChange={handleInputChange}
            error={errors.address}
            variant="filled"
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Input
              name="city"
              type="text"
              label="City *"
              placeholder="Enter your city"
              value={formData.city ?? ''}
              onChange={handleInputChange}
              error={errors.city}
              variant="filled"
              required
            />

            <Input
              name="state"
              type="text"
              label="State *"
              placeholder="Enter your state"
              value={formData.state ?? ''}
              onChange={handleInputChange}
              error={errors.state}
              variant="filled"
              required
            />

            <Input
              name="postal_code"
              type="text"
              label="Postal Code *"
              placeholder="Enter your postal code"
              value={formData.postal_code ?? ''}
              onChange={handleInputChange}
              error={errors.postal_code}
              variant="filled"
              required
            />
          </div>
        </div>

        {/* Identification Section */}
        <div className="border-t border-border pt-4">
          <h3 className="text-lg font-semibold text-foreground mb-3">Identification Information</h3>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">
              ID Type *
            </label>
            <select
              name="id_type"
              value={formData.id_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
              required
            >
              <option value="">Select ID type</option>
              <option value="national_id">National ID</option>
              <option value="passport">International Passport</option>
              <option value="drivers_license">Driver's License</option>
              <option value="voters_card">Voter's Card</option>
            </select>
            {errors.id_type && (
              <p className="text-sm text-red-500 mt-1">{errors.id_type}</p>
            )}
          </div>

          <Input
            name="id_number"
            type="text"
            label="ID Number *"
            placeholder="Enter your ID number"
            value={formData.id_number ?? ''}
            onChange={handleInputChange}
            error={errors.id_number}
            leftIcon={<IdentificationIcon className="h-5 w-5" />}
            variant="filled"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <PhoneIcon className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Employment & Alternative Contact
        </h2>
        <p className="text-muted-foreground">
          Provide your employment and alternative contact information
        </p>
      </div>

      <div className="space-y-4">
        <Input
          name="job_title"
          type="text"
          label="Job Title *"
          placeholder="Enter your job title"
          value={formData.job_title ?? ''}
          onChange={handleInputChange}
          error={errors.job_title}
          leftIcon={<BriefcaseIcon className="h-5 w-5" />}
          variant="filled"
          required
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground">
            Employment Type *
          </label>
          <select
            name="employment_type"
            value={formData.employment_type}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground"
            required
          >
            <option value="">Select employment type</option>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="self_employed">Self-employed</option>
            <option value="freelancer">Freelancer</option>
            <option value="contract">Contract</option>
            <option value="unemployed">Unemployed</option>
            <option value="student">Student</option>
            <option value="retired">Retired</option>
            <option value="other">Other</option>
          </select>
          {errors.employment_type && (
            <p className="text-sm text-red-500 mt-1">{errors.employment_type}</p>
          )}
        </div>

        <Input
          name="work_address"
          type="text"
          label="Work Address *"
          placeholder="Enter your work address"
          value={formData.work_address ?? ''}
          onChange={handleInputChange}
          error={errors.work_address}
          variant="filled"
          required
        />

        <Input
          name="alternative_phone"
          type="tel"
          label="Alternative Phone"
          placeholder="Enter alternative phone number"
          value={formData.alternative_phone ?? ''}
          onChange={handleInputChange}
          error={errors.alternative_phone}
          leftIcon={<PhoneIcon className="h-5 w-5" />}
          variant="filled"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            name="emergency_contact_name"
            type="text"
            label="Emergency Contact Name"
            placeholder="Enter emergency contact name"
            value={formData.emergency_contact_name ?? ''}
            onChange={handleInputChange}
            error={errors.emergency_contact_name}
            leftIcon={<UserPlusIcon className="h-5 w-5" />}
            variant="filled"
          />

          <Input
            name="emergency_contact_phone"
            type="tel"
            label="Emergency Contact Phone"
            placeholder="Enter emergency contact phone"
            value={formData.emergency_contact_phone ?? ''}
            onChange={handleInputChange}
            error={errors.emergency_contact_phone}
            leftIcon={<PhoneIcon className="h-5 w-5" />}
            variant="filled"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Relationship to Emergency Contact
          </label>
          <select
            name="emergency_contact_relationship"
            value={formData.emergency_contact_relationship}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select relationship</option>
            <option value="spouse">Spouse</option>
            <option value="parent">Parent</option>
            <option value="child">Child</option>
            <option value="sibling">Sibling</option>
            <option value="friend">Friend</option>
            <option value="colleague">Colleague</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircleIcon className="h-12 w-12 text-primary mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Preferences
        </h2>
        <p className="text-muted-foreground">
          Set your account preferences
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Preferred Branch *
          </label>
          <select
            name="preferred_branch"
            value={formData.preferred_branch}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            <option value="">Select preferred branch</option>
            <option value="downtown">Downtown Branch</option>
            <option value="uptown">Uptown Branch</option>
            <option value="westside">Westside Branch</option>
            <option value="eastside">Eastside Branch</option>
            <option value="suburban">Suburban Branch</option>
            <option value="online">Online Only</option>
            <option value="none">No Preference</option>
          </select>
          {errors.preferred_branch && (
            <p className="text-sm text-destructive mt-1">{errors.preferred_branch}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Statement Delivery *
          </label>
          <select
            name="statement_delivery"
            value={formData.statement_delivery}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            required
          >
            <option value="email">Email</option>
            <option value="postal">Postal Mail</option>
            <option value="both">Both Email and Postal</option>
          </select>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-foreground">
            Notification Preferences
          </label>
          
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="email_notifications"
                checked={formData.email_notifications}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-background"
              />
              <span className="text-sm text-foreground">Email notifications</span>
            </label>
            
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="sms_notifications"
                checked={formData.sms_notifications}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary focus:ring-offset-background"
              />
              <span className="text-sm text-foreground">SMS notifications</span>
            </label>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">📋 Profile Completion</h4>
          <p className="text-xs text-blue-800">
            All fields marked with * are required to complete your profile and access your dashboard.
          </p>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!completionInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading profile information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">
                  Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm text-muted-foreground">
                  {Math.round((currentStep / totalSteps) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* General Error */}
            {errors.general && (
              <Card variant="default" className="p-4 mb-6 bg-destructive/10 border-destructive/20">
                <p className="text-sm text-destructive">{errors.general}</p>
              </Card>
            )}

            <form onSubmit={handleSubmit}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className={currentStep === 1 ? 'invisible' : ''}
                >
                  Previous
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    type="button"
                    onClick={handleNext}
                  >
                    Next
                    <ArrowRightIcon className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    loading={isSubmitting}
                  >
                    {isSubmitting ? 'Completing Profile...' : 'Complete Profile'}
                    <CheckCircleIcon className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}