const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface UserProfile {
  id: number;
  user: User;
  middle_name: string;
  phone_number: string;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  nationality: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  id_type: string;
  id_number: string;
  employer_name: string;
  job_title: string;
  employment_type: string;
  monthly_income: string;
  work_address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  customer_tier: string;
  account_officer: string;
  preferred_branch: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  statement_delivery: string;
  kyc_status: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankAccount {
  id: string;
  user: User;
  account_number: string;
  account_name: string;
  account_type: string;
  balance: number;
  available_balance: number;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string; // Allow any string type from backend
  is_read: boolean;
  created_at: string;
  read_at?: string;
  priority?: number;
}

export interface Transaction {
  id: number;
  reference: string;
  transaction_type: string;
  amount: string;
  currency: string;
  status: string;
  description?: string;
  narration?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
  completed_at?: string;
  failed_at?: string;
  expected_completion_date?: string;
  failure_reason?: string;
  fee?: number;
  total_amount?: number;
  
  // Account information
  from_account?: BankAccount;
  to_account?: BankAccount;
  
  // Deposit specific fields
  deposit_source?: string;
  deposit_reference?: string;
  depositor_name?: string;
  depositor_account_number?: string;
  depositor_bank_name?: string;
  
  // Processing details
  channel?: string;
  auto_confirm?: boolean;
  confirmation_delay_hours?: number;
  confirmed_at?: string;
  
  // Balance tracking (if included by serializer)
  from_balance_before?: number;
  from_balance_after?: number;
  to_balance_before?: number;
  to_balance_after?: number;
  
  // External transfer and recipient details
  recipient_name?: string;
  recipient_account_number?: string;
  recipient_bank_name?: string;
  routing_number?: string;
  swift_code?: string;
  
  // Additional transaction context
  external_reference?: string;
  purpose_code?: string;
  
  // Card-related information
  card_last_four?: string;
  card_brand?: string;
  
  // Status messaging
  status_message?: string;
  
  // Additional metadata
  user?: number;
}export interface TransferRequest {
  id: string;
  from_account: BankAccount;
  to_account_number: string;
  to_account?: BankAccount;
  to_bank_name?: string;
  to_routing_number?: string;
  to_swift_code?: string;
  beneficiary_name?: string;
  beneficiary_address?: string;
  amount: number;
  transfer_type: 'internal' | 'domestic_external' | 'international';
  description?: string;
  // Status is computed from the associated transaction
  status?: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed' | 'processing';
  transaction?: Transaction;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface TransferFormData {
  from_account_id: string;
  to_account_number: string;
  amount: number;
  transfer_type: 'internal' | 'domestic_external' | 'international';
  description?: string;
  beneficiary_name?: string;
  to_bank_name?: string;
  to_routing_number?: string;
  to_swift_code?: string;
  beneficiary_address?: string;
}

export interface TransferFeeResponse {
  transfer_type: string;
  amount: number;
  fee: number;
  total_amount: number;
  fee_breakdown: {
    base_fee: number;
    processing_fee: number;
    currency_conversion_fee: number;
  };
}

export interface AccountValidationResponse {
  valid: boolean;
  account_name?: string;
  account_holder?: string;
  bank_name?: string;
  error?: string;
}

export interface RoutingValidationResponse {
  valid: boolean;
  bank_name?: string;
  supported?: boolean;
  error?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
  kyc_required: boolean;
  next_step: string;
}

export interface RegisterData {
  // User fields
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  
  // Profile fields
  middle_name?: string;
  phone_number: string;
  phone_country?: string;
  alternative_phone?: string;
  date_of_birth: string;
  gender: string;
  marital_status: string;
  nationality?: string;
  
  // Address
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
  
  // Employment (optional)
  employer_name?: string;
  job_title?: string;
  employment_type?: string;
  monthly_income?: number;
  work_address?: string;
  
  // Emergency contact (optional)
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
  
  // Preferences
  email_notifications?: boolean;
  sms_notifications?: boolean;
  statement_delivery?: string;
  
  // Account preferences
  account_type?: string;
  preferred_branch?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface DashboardData {
  user: User;
  profile: UserProfile;
  accounts: BankAccount[];
  financial_summary: {
    total_balance: number;
    total_available: number;
    currency: string;
  };
  account_statistics: {
    total_accounts: number;
    active_accounts: number;
    savings_accounts: number;
    current_accounts: number;
  };
  kyc_information: {
    status: string;
    completion_percentage: number;
    has_required_documents: boolean;
    is_verified: boolean;
  };
  recent_transactions: Transaction[];
  verification_required: boolean;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.token) {
      headers.Authorization = `Token ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      headers,
      body: options.body ? (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : undefined
    });

    try {
      const response = await fetch(url, config);
      
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('API Error Data:', errorData);
        throw new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      const responseData = await response.json();
      console.log('API Response Data:', responseData);
      return responseData;
    } catch (error) {
      console.error('API Request Failed:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Network error', 0, { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }

  // Authentication endpoints
  async login(data: LoginData): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    this.setToken(response.token);
    return response;
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    const response = await this.request<LoginResponse>('/api/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    this.setToken(response.token);
    return response;
  }

  // Resend verification email
  async resendVerification(email: string): Promise<any> {
    return await this.request('/api/auth/resend-verification/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async logout(): Promise<void> {
    await this.request('/api/auth/logout/', {
      method: 'POST',
    });
    this.setToken(null);
  }

  // User profile endpoints
  async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>('/api/auth/profile/');
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.request<UserProfile>('/api/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Dashboard endpoint
  async getDashboard(): Promise<DashboardData> {
    return this.request<DashboardData>('/api/auth/dashboard/');
  }

  // Profile completion endpoints
  async getProfileCompletion(): Promise<any> {
    return await this.request('/api/auth/profile/complete/', {
      method: 'GET',
    });
  }

  async checkProfileCompletion(): Promise<{ requiresCompletion: boolean; nextStep: string }> {
    try {
      const response = await this.getProfileCompletion();
      return {
        requiresCompletion: response.requires_completion,
        nextStep: response.requires_completion ? 'complete_profile' : 'dashboard'
      };
    } catch (error) {
      return { requiresCompletion: false, nextStep: 'dashboard' };
    }
  }

  async completeProfile(data: any): Promise<any> {
    return await this.request('/api/auth/profile/complete/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // KYC endpoints
  async getKYCStatus(): Promise<any> {
    return await this.request('/api/auth/kyc/status/', {
      method: 'GET',
    });
  }

  async uploadKYCDocument(formData: FormData): Promise<any> {
    return await this.request('/api/auth/kyc/documents/upload/', {
      method: 'POST',
      body: formData,
    });
  }

  async getKYCDocuments(): Promise<any> {
    return await this.request('/api/auth/kyc/documents/', {
      method: 'GET',
    });
  }

  async getKYCDocument(documentId: string): Promise<any> {
    return await this.request(`/api/auth/kyc/documents/${documentId}/`, {
      method: 'GET',
    });
  }

  // Account endpoints
  async getAccounts(): Promise<BankAccount[]> {
    return this.request<BankAccount[]>('/api/auth/accounts/');
  }

  async getAccount(id: string): Promise<BankAccount> {
    return this.request<BankAccount>(`/api/auth/accounts/${id}/`);
  }

  async createAccount(data: Partial<BankAccount>): Promise<BankAccount> {
    return this.request<BankAccount>('/api/auth/accounts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Transaction endpoints
  async getTransactions(): Promise<Transaction[]> {
    return this.request<Transaction[]>('/api/banking/transactions/');
  }

  async getTransaction(id: string): Promise<Transaction> {
    return this.request<Transaction>(`/api/banking/transactions/${id}/`);
  }

  async createTransaction(data: any): Promise<Transaction> {
    return this.request<Transaction>('/api/banking/transactions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async depositFunds(data: { amount: number; description?: string }): Promise<Transaction> {
    return this.request<Transaction>('/api/banking/deposit/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async withdrawFunds(data: { amount: number; description?: string }): Promise<Transaction> {
    return this.request<Transaction>('/api/banking/withdraw/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Transfer Request endpoints (New Enhanced API)
  async getTransferRequests(page?: number): Promise<{ results: TransferRequest[]; count: number; next?: string; previous?: string }> {
    const url = page ? `/api/banking/transfer-requests/?page=${page}` : '/api/banking/transfer-requests/';
    return this.request(url);
  }

  async createTransferRequest(data: TransferFormData): Promise<{ 
    message: string; 
    transfer_request: TransferRequest; 
    completion_message: string;
    transfer_fee?: number;
    processing_info?: any;
  }> {
    return this.request('/api/banking/transfer-requests/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTransferRequest(id: string): Promise<TransferRequest> {
    return this.request(`/api/banking/transfer-requests/${id}/`);
  }

  async updateTransferRequest(id: string, data: { description?: string }): Promise<{
    message: string;
    transfer_request: TransferRequest;
  }> {
    return this.request(`/api/banking/transfer-requests/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async cancelTransferRequest(id: string): Promise<{ message: string }> {
    return this.request(`/api/banking/transfer-requests/${id}/`, {
      method: 'DELETE',
    });
  }

  async getTransferFees(amount: number, transferType: string): Promise<TransferFeeResponse> {
    return this.request(`/api/banking/transfer-fees/?amount=${amount}&type=${transferType}`);
  }

  async validateAccountNumber(accountNumber: string): Promise<AccountValidationResponse> {
    return this.request('/api/banking/validate-account/', {
      method: 'POST',
      body: JSON.stringify({ account_number: accountNumber }),
    });
  }

  async validateRoutingNumber(routingNumber: string): Promise<RoutingValidationResponse> {
    return this.request('/api/banking/validate-routing/', {
      method: 'POST',
      body: JSON.stringify({ routing_number: routingNumber }),
    });
  }

  // Transfer endpoints (Legacy - keep for backward compatibility)
  async createTransfer(data: any): Promise<any> {
    return this.request('/api/banking/transfers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createTransferWithPin(data: { transfer: any; pin: string }): Promise<any> {
    console.log('API: Creating transfer with PIN, data:', data);
    console.log('API: Endpoint URL:', `${this.baseURL}/api/banking/transfer-with-pin/`);
    
    try {
      const response = await this.request('/api/banking/transfer-with-pin/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      console.log('API: Transfer with PIN successful, response:', response);
      return response;
    } catch (error) {
      console.error('API: Transfer with PIN failed, error:', error);
      throw error;
    }
  }

  async getTransfers(): Promise<any[]> {
    return this.request<any[]>('/api/banking/transfers/');
  }

  // Cards endpoints
  async getCards(): Promise<any[]> {
    return this.request<any[]>('/api/banking/cards/');
  }

  async createCard(data: any): Promise<any> {
    return this.request('/api/banking/cards/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notifications endpoints
  async getNotifications(limit?: number): Promise<Notification[]> {
    const params = limit ? `?page_size=${limit}` : '';
    const response = await this.request<{
      notifications: Notification[];
      pagination?: any;
    }>(`/api/notifications${params}`);
    return response.notifications || [];
  }

  async getRecentNotifications(): Promise<Notification[]> {
    const response = await this.request<{
      notifications: Notification[];
      unread_count?: number;
    }>('/api/notifications/recent/');
    return response.notifications || [];
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await this.request(`/api/notifications/${id}/read/`, {
      method: 'POST',
    });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.request('/api/notifications/mark-all-read/', {
      method: 'POST',
    });
  }

  // Security endpoints
  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    await this.request('/api/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify({
        current_password: data.currentPassword,
        new_password: data.newPassword,
      }),
    });
  }

  async setTransferPin(data: { currentPin?: string; newPin: string }): Promise<void> {
    await this.request('/api/auth/transfer-pin/', {
      method: 'POST',
      body: JSON.stringify({
        current_pin: data.currentPin,
        new_pin: data.newPin,
      }),
    });
  }

  async checkTransferPin(): Promise<{ hasPin: boolean }> {
    return this.request('/api/auth/transfer-pin/check/');
  }

  async verifyTransferPin(data: { pin: string }): Promise<{ valid: boolean; message?: string }> {
    return this.request('/api/auth/transfer-pin/verify/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateNotificationSettings(data: { email_notifications: boolean; sms_notifications: boolean }): Promise<UserProfile> {
    return this.request<UserProfile>('/api/auth/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }
}

// Create a singleton instance
export const api = new ApiClient(API_BASE_URL);

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!api.getToken();
};

// Helper function to get current user from token (if needed)
export const getCurrentUser = async (): Promise<User | null> => {
  if (!isAuthenticated()) return null;
  
  try {
    const dashboard = await api.getDashboard();
    return dashboard.user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

export default api;