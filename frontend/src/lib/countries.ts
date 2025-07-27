export interface Country {
  code: string;
  name: string;
  phoneCode: string;
  flag: string;
}

export const countries: Country[] = [
  { code: 'US', name: 'United States', phoneCode: '+1', flag: '🇺🇸' },
  { code: 'CA', name: 'Canada', phoneCode: '+1', flag: '🇨🇦' },
  { code: 'GB', name: 'United Kingdom', phoneCode: '+44', flag: '🇬🇧' },
  { code: 'AU', name: 'Australia', phoneCode: '+61', flag: '🇦🇺' },
  { code: 'DE', name: 'Germany', phoneCode: '+49', flag: '🇩🇪' },
  { code: 'FR', name: 'France', phoneCode: '+33', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', phoneCode: '+39', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', phoneCode: '+34', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', phoneCode: '+31', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', phoneCode: '+32', flag: '🇧🇪' },
  { code: 'CH', name: 'Switzerland', phoneCode: '+41', flag: '🇨🇭' },
  { code: 'AT', name: 'Austria', phoneCode: '+43', flag: '🇦🇹' },
  { code: 'SE', name: 'Sweden', phoneCode: '+46', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', phoneCode: '+47', flag: '🇳🇴' },
  { code: 'DK', name: 'Denmark', phoneCode: '+45', flag: '🇩🇰' },
  { code: 'FI', name: 'Finland', phoneCode: '+358', flag: '🇫🇮' },
  { code: 'IE', name: 'Ireland', phoneCode: '+353', flag: '🇮🇪' },
  { code: 'PT', name: 'Portugal', phoneCode: '+351', flag: '🇵🇹' },
  { code: 'GR', name: 'Greece', phoneCode: '+30', flag: '🇬🇷' },
  { code: 'PL', name: 'Poland', phoneCode: '+48', flag: '🇵🇱' },
  { code: 'CZ', name: 'Czech Republic', phoneCode: '+420', flag: '🇨🇿' },
  { code: 'HU', name: 'Hungary', phoneCode: '+36', flag: '🇭🇺' },
  { code: 'SK', name: 'Slovakia', phoneCode: '+421', flag: '🇸🇰' },
  { code: 'SI', name: 'Slovenia', phoneCode: '+386', flag: '🇸🇮' },
  { code: 'HR', name: 'Croatia', phoneCode: '+385', flag: '🇭🇷' },
  { code: 'RO', name: 'Romania', phoneCode: '+40', flag: '🇷🇴' },
  { code: 'BG', name: 'Bulgaria', phoneCode: '+359', flag: '🇧🇬' },
  { code: 'LT', name: 'Lithuania', phoneCode: '+370', flag: '🇱🇹' },
  { code: 'LV', name: 'Latvia', phoneCode: '+371', flag: '🇱🇻' },
  { code: 'EE', name: 'Estonia', phoneCode: '+372', flag: '🇪🇪' },
  { code: 'MT', name: 'Malta', phoneCode: '+356', flag: '🇲🇹' },
  { code: 'CY', name: 'Cyprus', phoneCode: '+357', flag: '🇨🇾' },
  { code: 'LU', name: 'Luxembourg', phoneCode: '+352', flag: '🇱🇺' },
  { code: 'IS', name: 'Iceland', phoneCode: '+354', flag: '🇮🇸' },
  { code: 'JP', name: 'Japan', phoneCode: '+81', flag: '🇯🇵' },
  { code: 'KR', name: 'South Korea', phoneCode: '+82', flag: '🇰🇷' },
  { code: 'CN', name: 'China', phoneCode: '+86', flag: '🇨🇳' },
  { code: 'IN', name: 'India', phoneCode: '+91', flag: '🇮🇳' },
  { code: 'SG', name: 'Singapore', phoneCode: '+65', flag: '🇸🇬' },
  { code: 'HK', name: 'Hong Kong', phoneCode: '+852', flag: '🇭🇰' },
  { code: 'TW', name: 'Taiwan', phoneCode: '+886', flag: '🇹🇼' },
  { code: 'MY', name: 'Malaysia', phoneCode: '+60', flag: '🇲🇾' },
  { code: 'TH', name: 'Thailand', phoneCode: '+66', flag: '🇹🇭' },
  { code: 'ID', name: 'Indonesia', phoneCode: '+62', flag: '🇮🇩' },
  { code: 'PH', name: 'Philippines', phoneCode: '+63', flag: '🇵🇭' },
  { code: 'VN', name: 'Vietnam', phoneCode: '+84', flag: '🇻🇳' },
  { code: 'BR', name: 'Brazil', phoneCode: '+55', flag: '🇧🇷' },
  { code: 'MX', name: 'Mexico', phoneCode: '+52', flag: '🇲🇽' },
  { code: 'AR', name: 'Argentina', phoneCode: '+54', flag: '🇦🇷' },
  { code: 'CL', name: 'Chile', phoneCode: '+56', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', phoneCode: '+57', flag: '🇨🇴' },
  { code: 'PE', name: 'Peru', phoneCode: '+51', flag: '🇵🇪' },
  { code: 'VE', name: 'Venezuela', phoneCode: '+58', flag: '🇻🇪' },
  { code: 'UY', name: 'Uruguay', phoneCode: '+598', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguay', phoneCode: '+595', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolivia', phoneCode: '+591', flag: '🇧🇴' },
  { code: 'EC', name: 'Ecuador', phoneCode: '+593', flag: '🇪🇨' },
  { code: 'ZA', name: 'South Africa', phoneCode: '+27', flag: '🇿🇦' },
  { code: 'NG', name: 'Nigeria', phoneCode: '+234', flag: '🇳🇬' },
  { code: 'KE', name: 'Kenya', phoneCode: '+254', flag: '🇰🇪' },
  { code: 'GH', name: 'Ghana', phoneCode: '+233', flag: '🇬🇭' },
  { code: 'EG', name: 'Egypt', phoneCode: '+20', flag: '🇪🇬' },
  { code: 'MA', name: 'Morocco', phoneCode: '+212', flag: '🇲🇦' },
  { code: 'TN', name: 'Tunisia', phoneCode: '+216', flag: '🇹🇳' },
  { code: 'DZ', name: 'Algeria', phoneCode: '+213', flag: '🇩🇿' },
  { code: 'IL', name: 'Israel', phoneCode: '+972', flag: '🇮🇱' },
  { code: 'AE', name: 'United Arab Emirates', phoneCode: '+971', flag: '🇦🇪' },
  { code: 'SA', name: 'Saudi Arabia', phoneCode: '+966', flag: '🇸🇦' },
  { code: 'QA', name: 'Qatar', phoneCode: '+974', flag: '🇶🇦' },
  { code: 'KW', name: 'Kuwait', phoneCode: '+965', flag: '🇰🇼' },
  { code: 'BH', name: 'Bahrain', phoneCode: '+973', flag: '🇧🇭' },
  { code: 'OM', name: 'Oman', phoneCode: '+968', flag: '🇴🇲' },
  { code: 'JO', name: 'Jordan', phoneCode: '+962', flag: '🇯🇴' },
  { code: 'LB', name: 'Lebanon', phoneCode: '+961', flag: '🇱🇧' },
  { code: 'TR', name: 'Turkey', phoneCode: '+90', flag: '🇹🇷' },
  { code: 'RU', name: 'Russia', phoneCode: '+7', flag: '🇷🇺' },
  { code: 'UA', name: 'Ukraine', phoneCode: '+380', flag: '🇺🇦' },
  { code: 'BY', name: 'Belarus', phoneCode: '+375', flag: '🇧🇾' },
  { code: 'KZ', name: 'Kazakhstan', phoneCode: '+7', flag: '🇰🇿' },
  { code: 'UZ', name: 'Uzbekistan', phoneCode: '+998', flag: '🇺🇿' },
  { code: 'NZ', name: 'New Zealand', phoneCode: '+64', flag: '🇳🇿' },
];

export const getCountryByCode = (code: string): Country | undefined => {
  return countries.find(country => country.code === code);
};

export const getCountryByName = (name: string): Country | undefined => {
  return countries.find(country => country.name.toLowerCase() === name.toLowerCase());
};

export const getCountryByPhoneCode = (phoneCode: string): Country | undefined => {
  return countries.find(country => country.phoneCode === phoneCode);
};

export const formatPhoneNumber = (phone: string, countryCode: string): string => {
  const country = getCountryByCode(countryCode);
  if (!country) return phone;
  
  // Remove any existing country code
  const cleanPhone = phone.replace(/^\+?\d{1,4}/, '').replace(/\D/g, '');
  
  return `${country.phoneCode}${cleanPhone}`;
};

export const parsePhoneNumber = (phone: string): { countryCode: string; number: string } => {
  // Try to match country code from phone number
  for (const country of countries) {
    if (phone.startsWith(country.phoneCode)) {
      return {
        countryCode: country.code,
        number: phone.substring(country.phoneCode.length)
      };
    }
  }
  
  // Default to US if no match
  return {
    countryCode: 'US',
    number: phone.replace(/^\+?1/, '')
  };
}; 