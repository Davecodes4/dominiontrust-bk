/**
 * Utility functions for handling error messages and UI
 */

/**
 * Clean error message by removing HTML tags and extracting meaningful text
 * @param error - Error message that might contain HTML tags
 * @returns Clean error message without tags
 */
export function cleanErrorMessage(error: string): string {
  if (!error) return '';
  
  // Remove HTML tags
  let cleaned = error.replace(/<[^>]*>/g, '');
  
  // Handle common error patterns with multiple colons
  if (cleaned.includes(':')) {
    // For patterns like "Validation error: error: Insufficient balance. Available: $16525.00"
    // We want to extract "Insufficient balance. Available: $16525.00"
    
    // First, try to find the main error message part
    let messageStart = -1;
    const prefixPattern = /(validation\s*error|field\s*error|error|detail)\s*:\s*/gi;
    let match;
    
    // Find the last occurrence of a prefix pattern
    while ((match = prefixPattern.exec(cleaned)) !== null) {
      messageStart = match.index + match[0].length;
    }
    
    if (messageStart > -1) {
      cleaned = cleaned.substring(messageStart);
    } else {
      // Fallback: split and take meaningful parts
      const parts = cleaned.split(':');
      let bestPart = '';
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i].trim();
        // Skip common prefixes
        if (part && !part.toLowerCase().match(/^(error|validation\s*error|field\s*error|detail)$/i)) {
          // If this part looks like it contains the main message, use it
          if (part.length > bestPart.length || 
              (part.includes('Insufficient') || part.includes('balance') || part.includes('required'))) {
            bestPart = part;
          }
        }
      }
      if (bestPart) {
        cleaned = bestPart;
      }
    }
  }
  
  // Clean up common prefixes that might remain
  cleaned = cleaned
    .replace(/^error\s*:?\s*/i, '')
    .replace(/^validation\s*error\s*:?\s*/i, '')
    .replace(/^field\s*error\s*:?\s*/i, '')
    .replace(/^detail\s*:?\s*/i, '')
    .trim();
  
  // Ensure first letter is capitalized
  if (cleaned.length > 0) {
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }
  
  // Only add period if it doesn't end with punctuation and doesn't look incomplete
  if (cleaned.length > 0 && !/[.!?]$/.test(cleaned)) {
    // Don't add period if it looks like it was cut off (ends with incomplete phrase)
    if (!cleaned.match(/\s(Available|Required|Total|Amount|Balance)$/i)) {
      cleaned += '.';
    }
  }
  
  return cleaned || 'An error occurred. Please try again.';
}

/**
 * Extract field-specific error from Django REST framework error response
 * @param errorData - Error data from API response
 * @param fieldName - Specific field to extract error for
 * @returns Clean error message for the field
 */
export function extractFieldError(errorData: any, fieldName: string): string {
  if (!errorData || typeof errorData !== 'object') return '';
  
  const fieldError = errorData[fieldName];
  if (!fieldError) return '';
  
  if (Array.isArray(fieldError)) {
    return cleanErrorMessage(fieldError[0]);
  }
  
  return cleanErrorMessage(String(fieldError));
}

/**
 * Process API error response to extract user-friendly messages
 * @param error - Error object from API call
 * @returns Object with general message and field-specific errors
 */
export function processApiError(error: any): { general: string; fields: Record<string, string> } {
  const result = {
    general: '',
    fields: {} as Record<string, string>
  };
  
  if (!error) {
    result.general = 'An unexpected error occurred. Please try again.';
    return result;
  }
  
  // Extract error data
  const errorData = error.data || error.response?.data || error;
  const status = error.status || error.response?.status;
  
  // Handle different status codes
  if (status === 400) {
    if (errorData && typeof errorData === 'object') {
      // Check for direct error field first (most common)
      if (errorData.error) {
        result.general = cleanErrorMessage(errorData.error);
      } else if (errorData.detail) {
        result.general = cleanErrorMessage(errorData.detail);
      } else if (errorData.message) {
        result.general = cleanErrorMessage(errorData.message);
      } else if (errorData.non_field_errors) {
        result.general = cleanErrorMessage(
          Array.isArray(errorData.non_field_errors) 
            ? errorData.non_field_errors[0] 
            : errorData.non_field_errors
        );
      } else {
        // Extract field-specific errors
        const fieldErrors: Record<string, string> = {};
        let hasFieldErrors = false;
        
        Object.entries(errorData).forEach(([field, messages]) => {
          if (field !== 'non_field_errors') {
            const cleanMessage = extractFieldError(errorData, field);
            if (cleanMessage) {
              fieldErrors[field] = cleanMessage;
              hasFieldErrors = true;
            }
          }
        });
        
        result.fields = fieldErrors;
        
        if (!hasFieldErrors) {
          result.general = 'Please check your input and try again.';
        }
      }
    } else {
      result.general = 'Invalid request. Please check your input.';
    }
  } else if (status === 401) {
    // Handle authentication failures - often PIN-related
    if (errorData && (errorData.error || errorData.detail)) {
      const message = errorData.error || errorData.detail;
      result.general = cleanErrorMessage(message);
    } else {
      result.general = 'Authentication failed. Please check your PIN.';
    }
  } else if (status === 403) {
    result.general = 'Access denied. You may need to complete KYC verification.';
  } else if (status === 404) {
    result.general = 'The requested resource was not found.';
  } else if (status === 500) {
    result.general = 'Server error. Please try again later.';
  } else {
    result.general = cleanErrorMessage(
      error.message || errorData?.message || 'An error occurred. Please try again.'
    );
  }
  
  // Fallback if no message was set
  if (!result.general && Object.keys(result.fields).length === 0) {
    result.general = 'An unexpected error occurred. Please try again.';
  }
  
  return result;
}
