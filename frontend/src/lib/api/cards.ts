const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Card {
  id: string;
  account: string;
  account_number: string;
  card_number: string;
  masked_card_number: string;
  card_brand: 'visa' | 'mastercard' | 'verve';
  card_brand_display: string;
  card_type: 'debit' | 'credit' | 'prepaid';
  card_type_display: string;
  card_name: string;
  expiry_date: string;
  status: 'active' | 'inactive' | 'blocked' | 'expired' | 'damaged' | 'stolen';
  status_display: string;
  daily_limit: string;
  weekly_limit: string;
  monthly_limit: string;
  international_transactions: boolean;
  online_transactions: boolean;
  contactless_enabled: boolean;
  last_used_date: string | null;
  failed_attempts: number;
  created_at: string;
  updated_at: string;
  issued_date: string;
  is_expired: boolean;
}

export interface CreateCardRequest {
  card_type: 'debit' | 'credit' | 'prepaid';
  card_brand: 'visa' | 'mastercard' | 'verve';
  card_name?: string;
  daily_limit?: number;
  account_id?: string; // Account to charge the card creation fee from
}

export interface CardFees {
  fees: {
    visa: string;
    mastercard: string;
    verve: string;
  };
  currency: string;
}

export interface UpdateCardRequest {
  status?: 'active' | 'inactive' | 'blocked';
  card_name?: string;
  daily_limit?: number;
  weekly_limit?: number;
  monthly_limit?: number;
  international_transactions?: boolean;
  online_transactions?: boolean;
  contactless_enabled?: boolean;
}

class CardsAPI {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getHeaders() {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Token ${token}` }),
    };
  }

  async getCards(): Promise<Card[]> {
    const response = await fetch(`${API_BASE_URL}/api/banking/cards/`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cards');
    }

    return response.json();
  }

  async createCard(data: CreateCardRequest): Promise<{ 
    message: string; 
    card: Card; 
    fee_charged?: string;
    charged_from_account?: string;
    remaining_balance?: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/banking/cards/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create card');
    }

    return response.json();
  }

  async getCard(cardId: string): Promise<Card> {
    const response = await fetch(`${API_BASE_URL}/api/banking/cards/${cardId}/`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch card');
    }

    return response.json();
  }

  async updateCard(cardId: string, data: UpdateCardRequest): Promise<Card> {
    const response = await fetch(`${API_BASE_URL}/api/banking/cards/${cardId}/`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update card');
    }

    return response.json();
  }

  async deleteCard(cardId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/banking/cards/${cardId}/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete card');
    }
  }

  async blockCard(cardId: string): Promise<Card> {
    return this.updateCard(cardId, { status: 'blocked' });
  }

  async unblockCard(cardId: string): Promise<Card> {
    return this.updateCard(cardId, { status: 'active' });
  }

  async getCardFees(): Promise<CardFees> {
    const response = await fetch(`${API_BASE_URL}/api/banking/card-fees/`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch card fees');
    }

    return response.json();
  }
}

export const cardsAPI = new CardsAPI();
