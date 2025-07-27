'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { countries, Country, getCountryByCode } from '../../lib/countries';

interface PhoneInputProps {
  value: string;
  onChange: (phone: string) => void;
  countryCode: string;
  onCountryChange: (countryCode: string) => void;
  error?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

export default function PhoneInput({
  value,
  onChange,
  countryCode,
  onCountryChange,
  error,
  label,
  placeholder = "Enter phone number",
  required = false
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCountry = getCountryByCode(countryCode) || countries[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country: Country) => {
    onCountryChange(country.code);
    setIsOpen(false);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
    onChange(inputValue);
  };

  const formatDisplayPhone = (phone: string) => {
    if (!phone) return '';
    
    // Format based on country
    if (countryCode === 'US' || countryCode === 'CA') {
      // Format as (XXX) XXX-XXXX
      const cleaned = phone.replace(/\D/g, '');
      const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
      }
      if (cleaned.length >= 6) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
      }
      if (cleaned.length >= 3) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
      }
      return cleaned;
    }
    
    // Default formatting for other countries
    return phone.replace(/(\d{3})/g, '$1 ').trim();
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-foreground">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="flex">
        {/* Country Code Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center px-3 py-2 border border-r-0 rounded-l-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background transition-colors ${
              error ? 'border-red-500' : 'border-border hover:border-primary'
            }`}
          >
            <span className="text-lg mr-1">{selectedCountry.flag}</span>
            <span className="text-sm text-foreground mr-1">{selectedCountry.phoneCode}</span>
            <ChevronDownIcon className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          {isOpen && (
            <div className="absolute z-50 left-0 mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto min-w-[200px]">
              {countries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className={`w-full px-3 py-2 text-left hover:bg-secondary transition-colors flex items-center space-x-2 ${
                    country.code === countryCode ? 'bg-primary/10 text-primary' : 'text-foreground'
                  }`}
                >
                  <span className="text-lg">{country.flag}</span>
                  <span className="text-sm">{country.phoneCode}</span>
                  <span className="text-xs text-muted-foreground truncate">{country.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Phone Number Input */}
        <div className="flex-1 relative">
          <input
            type="tel"
            value={formatDisplayPhone(value)}
            onChange={handlePhoneChange}
            placeholder={placeholder}
            className={`w-full px-3 py-2 border rounded-r-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground ${
              error ? 'border-red-500' : 'border-border'
            }`}
          />
          <PhoneIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Full Phone Number Display */}
      {value && (
        <div className="text-xs text-muted-foreground">
          Full number: {selectedCountry.phoneCode}{value}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
} 