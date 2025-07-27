'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  EnvelopeIcon, 
  UserIcon,
  PhoneIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import CountrySelect from '../../components/ui/CountrySelect';
import PhoneInput from '../../components/ui/PhoneInput';
import { api, RegisterData } from '../../lib/api';
import { countries, formatPhoneNumber } from '../../lib/countries';

interface FormData {
  // Step 1: Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneCountry: string;
  password: string;
  confirmPassword: string;
  
  // Step 2: Personal Details
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  nationality: string;
  nationalityCode: string;
  country: string;
  countryCode: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Step 2: Employment (optional)
  employer: string;
  monthlyIncome: string;
  
  // Agreement
  agreeToTerms: boolean;
  agreeToPrivacy: boolean;

  // ID fields for backend
  // idType: string;
  // idNumber: string;
}

export default function SignupPage() {
  console.log('SignupPage loaded - with fixes applied');
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    // Step 1: Basic Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    phoneCountry: 'US', // Default to US
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: 'M',
    maritalStatus: 'single',
    nationality: 'US', // Default to US
    nationalityCode: 'US',
    country: 'United States',
    countryCode: 'US',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    employer: '',
    monthlyIncome: '',
    agreeToTerms: false,
    agreeToPrivacy: false,
    // Remove ID fields for backend
    // idType: '',
    // idNumber: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = 2;

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
      if (!formData.firstName) newErrors.firstName = 'First name is required';
      if (!formData.lastName) newErrors.lastName = 'Last name is required';
      if (!formData.email) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      if (!formData.phone) newErrors.phone = 'Phone number is required';
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (step === 2) {
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.maritalStatus) newErrors.maritalStatus = 'Marital status is required';
      if (!formData.nationality) newErrors.nationality = 'Nationality is required';
      if (!formData.country) newErrors.country = 'Country of residence is required';
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.state) newErrors.state = 'State is required';
      if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';
      // Remove ID validation
      // if (!formData.idType) newErrors.idType = 'ID type is required';
      // if (!formData.idNumber) newErrors.idNumber = 'ID number is required';
      // Employer and monthly income are optional per backend requirements
      if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
      if (!formData.agreeToPrivacy) newErrors.agreeToPrivacy = 'You must agree to the privacy policy';
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
    
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    
    try {
      // Generate a simple username from email if not provided
      const username = formData.email.split('@')[0];
      
      // Map form data to backend format (without ID fields)
      const registerData: RegisterData = {
        username,
        email: formData.email,
        password: formData.password,
        password_confirm: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formatPhoneNumber(formData.phone, formData.phoneCountry),
        phone_country: formData.phoneCountry,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        marital_status: formData.maritalStatus,
        nationality: formData.nationality,
        country: formData.country,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        postal_code: formData.zipCode,
        employer_name: formData.employer,
        monthly_income: formData.monthlyIncome ? parseFloat(formData.monthlyIncome.replace(/[^0-9.-]/g, '')) : undefined,
        email_notifications: true,
        sms_notifications: true,
        statement_delivery: 'email',
        account_type: 'savings',
        // Remove id_type and id_number from payload
        // id_type: formData.idType,
        // id_number: formData.idNumber,
      };

      console.log('Registration data being sent:', JSON.stringify(registerData, null, 2));
      
      // Validate required fields before sending
      const requiredFields = ['first_name', 'last_name', 'email', 'password', 'phone_number', 'date_of_birth', 'gender', 'marital_status', 'address', 'city', 'state', 'postal_code'];
      const missingFields = requiredFields.filter(field => !registerData[field as keyof RegisterData]);
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        setErrors({ general: `Missing required fields: ${missingFields.join(', ')}` });
        return;
      }

      if (!registerData.first_name || !registerData.last_name || !registerData.email || 
          !registerData.password || !registerData.phone_number || !registerData.date_of_birth ||
          !registerData.gender || !registerData.marital_status || !registerData.address ||
          !registerData.city || !registerData.state || !registerData.postal_code) {
        throw new Error('Missing required fields');
      }
      
      const response = await api.register(registerData);
      console.log('Registration successful:', response);
      
      // Redirect to registration success page with email
      router.push(`/registration-success?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle ID conflict errors (500 status with integrity constraint)
      if (error.status === 500 && error.message && error.message.includes('UNIQUE constraint failed')) {
        // Retry with a new unique ID
        const newTimestamp = Date.now();
        const newRandomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        try {
          // Recreate registration data with new unique ID and username
          const retryTimestamp = Date.now().toString().slice(-6);
          const retryUsername = `${formData.email.split('@')[0]}_${retryTimestamp}`;
          
          const retryData: RegisterData = {
            username: retryUsername,
            email: formData.email,
            password: formData.password,
            password_confirm: formData.confirmPassword,
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone_number: formatPhoneNumber(formData.phone, formData.phoneCountry),
            phone_country: formData.phoneCountry,
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            marital_status: formData.maritalStatus,
            nationality: formData.nationality,
            country: formData.country,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postal_code: formData.zipCode,
            employer_name: formData.employer,
            monthly_income: formData.monthlyIncome ? parseFloat(formData.monthlyIncome.replace(/[^0-9.-]/g, '')) : undefined,
            email_notifications: true,
            sms_notifications: true,
            statement_delivery: 'email',
            account_type: 'savings',
            // Remove id_type and id_number from payload
            // id_type: formData.idType,
            // id_number: formData.idNumber,
          };
          
          console.log('Retrying with new ID:', newRandomSuffix);
          const response = await api.register(retryData);
          console.log('Registration successful on retry:', response);
          router.push('/dashboard');
          return;
        } catch (retryError: any) {
          console.error('Retry failed:', retryError);
          setErrors({ general: 'Registration failed due to system conflict. Please try again.' });
        }
      }
      // Handle validation errors from backend
      else if (error.status === 400 && error.data) {
        console.log('Backend validation errors:', JSON.stringify(error.data, null, 2));
        const backendErrors: Record<string, string> = {};
        
        // Map backend field errors to frontend form fields
        Object.keys(error.data).forEach(field => {
          const errorMessage = Array.isArray(error.data[field]) 
            ? error.data[field][0] 
            : error.data[field];
            
          // Map backend field names to frontend field names
          const fieldMap: Record<string, string> = {
            'first_name': 'firstName',
            'last_name': 'lastName',
            'phone_number': 'phone',
            'phone_country': 'phoneCountry',
            'date_of_birth': 'dateOfBirth',
            'marital_status': 'maritalStatus',
            'nationality': 'nationality',
            'country': 'country',
            'postal_code': 'zipCode',
            'employer_name': 'employer',
            'monthly_income': 'monthlyIncome',
            'password_confirm': 'confirmPassword'
          };
          
          const frontendField = fieldMap[field] || field;
          backendErrors[frontendField] = errorMessage;
        });
        
        setErrors(backendErrors);
      } else {
        console.log('Non-validation error:', error);
        setErrors({ general: error.message || 'Registration failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {[1, 2].map((step) => (
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
          {step < 2 && (
            <div className={`w-12 h-0.5 mx-2 transition-colors ${
              step < currentStep ? 'bg-primary' : 'bg-secondary'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          name="firstName"
          label="First Name"
          placeholder="Enter your first name"
          value={formData.firstName}
          onChange={handleInputChange}
          error={errors.firstName}
          variant="filled"
          required
        />
        <Input
          name="lastName"
          label="Last Name"
          placeholder="Enter your last name"
          value={formData.lastName}
          onChange={handleInputChange}
          error={errors.lastName}
          variant="filled"
          required
        />
      </div>

      <Input
        name="email"
        type="email"
        label="Email Address"
        placeholder="Enter your email"
        value={formData.email}
        onChange={handleInputChange}
        error={errors.email}
        leftIcon={<EnvelopeIcon className="h-5 w-5" />}
        variant="filled"
        required
      />

      <PhoneInput
        value={formData.phone}
        onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
        countryCode={formData.phoneCountry}
        onCountryChange={(countryCode) => setFormData(prev => ({ ...prev, phoneCountry: countryCode }))}
        error={errors.phone}
        label="Phone Number"
        placeholder="Enter your phone number"
        required
      />

      <Input
        name="password"
        type="password"
        label="Password"
        placeholder="Create a password"
        value={formData.password}
        onChange={handleInputChange}
        error={errors.password}
        variant="filled"
        helperText="Must be at least 8 characters long"
        required
      />

      <Input
        name="confirmPassword"
        type="password"
        label="Confirm Password"
        placeholder="Confirm your password"
        value={formData.confirmPassword}
        onChange={handleInputChange}
        error={errors.confirmPassword}
        variant="filled"
        required
      />
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <Input
        name="dateOfBirth"
        type="date"
        label="Date of Birth"
        value={formData.dateOfBirth}
        onChange={handleInputChange}
        error={errors.dateOfBirth}
        variant="filled"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Gender *
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border bg-input border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select gender</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
          {errors.gender && (
            <p className="text-sm text-destructive mt-1">{errors.gender}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Marital Status *
          </label>
          <select
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border bg-input border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            required
          >
            <option value="">Select marital status</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            <option value="divorced">Divorced</option>
            <option value="widowed">Widowed</option>
            <option value="separated">Separated</option>
          </select>
          {errors.maritalStatus && (
            <p className="text-sm text-destructive mt-1">{errors.maritalStatus}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CountrySelect
          value={formData.nationalityCode}
          onChange={(countryCode) => {
            const country = countries.find(c => c.code === countryCode);
            setFormData(prev => ({ 
              ...prev, 
              nationalityCode: countryCode,
              nationality: country?.name || ''
            }));
          }}
          label="Nationality"
          placeholder="Select your nationality"
          error={errors.nationality}
          required
        />
        
        <CountrySelect
          value={formData.countryCode}
          onChange={(countryCode) => {
            console.log('Country selection changed:', countryCode);
            const country = countries.find(c => c.code === countryCode);
            console.log('Found country:', country);
            setFormData(prev => ({ 
              ...prev, 
              countryCode: countryCode,
              country: country?.name || ''
            }));
          }}
          label="Country of Residence"
          placeholder="Select your country"
          error={errors.country}
          required
        />
      </div>

      <Input
        name="address"
        label="Street Address"
        placeholder="Enter your street address"
        value={formData.address}
        onChange={handleInputChange}
        error={errors.address}
        variant="filled"
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          name="city"
          label="City"
          placeholder="Enter your city"
          value={formData.city}
          onChange={handleInputChange}
          error={errors.city}
          variant="filled"
          required
        />
        <Input
          name="state"
          label="State"
          placeholder="Enter your state"
          value={formData.state}
          onChange={handleInputChange}
          error={errors.state}
          variant="filled"
          required
        />
      </div>

      <Input
        name="zipCode"
        label="ZIP Code"
        placeholder="Enter your ZIP code"
        value={formData.zipCode}
        onChange={handleInputChange}
        error={errors.zipCode}
        variant="filled"
        required
      />

      <div className="space-y-3 pt-4">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            className="w-4 h-4 mt-1 rounded border-border text-primary focus:ring-primary focus:ring-offset-background"
          />
          <span className="text-sm text-muted-foreground">
            I agree to the{' '}
            <Link href="/terms" className="text-primary hover:text-primary/80">
              Terms and Conditions
            </Link>
          </span>
        </label>
        {errors.agreeToTerms && (
          <p className="text-sm text-destructive">{errors.agreeToTerms}</p>
        )}

        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            name="agreeToPrivacy"
            checked={formData.agreeToPrivacy}
            onChange={handleInputChange}
            className="w-4 h-4 mt-1 rounded border-border text-primary focus:ring-primary focus:ring-offset-background"
          />
          <span className="text-sm text-muted-foreground">
            I agree to the{' '}
            <Link href="/privacy" className="text-primary hover:text-primary/80">
              Privacy Policy
            </Link>
          </span>
        </label>
        {errors.agreeToPrivacy && (
          <p className="text-sm text-destructive">{errors.agreeToPrivacy}</p>
        )}
      </div>
    </div>
  );

  const stepTitles = {
    1: 'Create your account',
    2: 'Personal information',
  };

  const stepDescriptions = {
    1: 'Enter your basic information to get started',
    2: 'We need some additional details for compliance',
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/20 via-blue-500/10 to-purple-500/20 relative">
        <div className="flex flex-col justify-center px-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center space-x-3 mb-8">
              <img 
                src="/logo.png" 
                alt="Dominion Trust Capital" 
                className="w-12 h-12 object-contain"
              />
              <span className="text-2xl font-bold text-foreground">
                Dominion<span className="text-primary">Trust</span>
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Join thousands who
              <br />
              <span className="text-primary">trust us with their money</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-md">
              Open your account in minutes and experience modern banking 
              with no hidden fees and top-tier security.
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-muted-foreground">No monthly fees</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-muted-foreground">FDIC insured up to $250,000</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                  <CheckIcon className="w-4 h-4 text-primary" />
                </div>
                <span className="text-muted-foreground">Instant money transfers</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-blue-500/5 to-purple-500/10" />
        <div className="absolute top-20 right-20 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-20 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center space-x-3 mb-8">
            <img 
              src="/logo.png" 
              alt="Dominion Trust Capital" 
              className="w-10 h-10 object-contain"
            />
            <span className="text-xl font-bold text-foreground">
              Dominion<span className="text-primary">Trust</span>
            </span>
          </div>

          <Card variant="elevated" className="p-8">
            <div className="space-y-6">
              {renderStepIndicator()}

              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {stepTitles[currentStep as keyof typeof stepTitles]}
                </h2>
                <p className="text-muted-foreground">
                  {stepDescriptions[currentStep as keyof typeof stepDescriptions]}
                </p>
              </div>

              {errors.general && (
                <Card variant="default" className="p-4 bg-destructive/10 border-destructive/20">
                  <div className="flex items-center space-x-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-destructive flex-shrink-0" />
                    <p className="text-sm text-destructive">{errors.general}</p>
                  </div>
                </Card>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}

                <div className="flex space-x-4">
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
                  
                  {currentStep < totalSteps ? (
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
                      type="submit"
                      size="lg"
                      loading={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  )}
                </div>
              </form>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link 
                    href="/signin" 
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>

              {/* Security Notice */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <ShieldCheckIcon className="h-4 w-4 text-primary" />
                  <span>Your information is protected with bank-level security</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};