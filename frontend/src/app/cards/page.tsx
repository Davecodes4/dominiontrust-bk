'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCardIcon,
  PlusIcon,
  CalendarIcon,
  XMarkIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { cardsAPI, Card as ApiCard, CreateCardRequest, CardFees } from '@/lib/api/cards';

const CardsPage: React.FC = () => {
  const { user, dashboardData } = useAuth();
  const [showCreateCardModal, setShowCreateCardModal] = useState(false);
  const [showCardDetails, setShowCardDetails] = useState<string | null>(null);
  const [cards, setCards] = useState<ApiCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createLoading, setCreateLoading] = useState(false);
  const [cardFees, setCardFees] = useState<CardFees | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch cards on component mount
  useEffect(() => {
    fetchCards();
    fetchCardFees();
  }, []);

  const fetchCards = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedCards = await cardsAPI.getCards();
      setCards(fetchedCards);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch cards');
    } finally {
      setLoading(false);
    }
  };

  const fetchCardFees = async () => {
    try {
      const fees = await cardsAPI.getCardFees();
      setCardFees(fees);
    } catch (error) {
      console.error('Failed to fetch card fees:', error);
    }
  };

  // Get data from authentication context
  const accountData = dashboardData ? {
    accounts: dashboardData.accounts || [],
  } : {
    accounts: [],
  };

  const formatAccountType = (accountType: string) => {
    return accountType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCardColor = (cardType: string, cardBrand: string) => {
    if (cardBrand === 'visa') return 'from-blue-600 to-blue-700';
    if (cardBrand === 'mastercard') return 'from-red-600 to-red-700';
    if (cardBrand === 'verve') return 'from-green-600 to-green-700';
    return cardType === 'credit' ? 'from-purple-600 to-purple-700' : 'from-gray-600 to-gray-700';
  };

  const handleCreateCard = async (cardData: CreateCardRequest) => {
    try {
      setCreateLoading(true);
      setError(null);
      const response = await cardsAPI.createCard(cardData);
      setCards(prev => [...prev, response.card]);
      setShowCreateCardModal(false);
      
      // Show success message with fee information
      if (response.fee_charged) {
        const accountInfo = response.charged_from_account ? 
          ` from account ending in ${response.charged_from_account.slice(-4)}` : '';
        setSuccessMessage(`Card created successfully! $${response.fee_charged} fee charged${accountInfo}.`);
        setTimeout(() => setSuccessMessage(null), 5000); // Clear after 5 seconds
      }
      
      // Refresh dashboard data to update account balances
      if (dashboardData) {
        window.location.reload(); // Simple refresh to update balances
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create card');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleBlockCard = async (cardId: string, currentStatus: string) => {
    try {
      const updatedCard = currentStatus === 'active' 
        ? await cardsAPI.blockCard(cardId)
        : await cardsAPI.unblockCard(cardId);
      
      setCards(prev => prev.map(card => 
        card.id === cardId ? updatedCard : card
      ));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update card status');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Are you sure you want to delete this card? This action cannot be undone.')) {
      return;
    }
    
    try {
      await cardsAPI.deleteCard(cardId);
      setCards(prev => prev.filter(card => card.id !== cardId));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete card');
    }
  };

  const CreateCardModal = () => {
    const [cardType, setCardType] = useState<'debit' | 'credit' | 'prepaid'>('debit');
    const [cardBrand, setCardBrand] = useState<'visa' | 'mastercard' | 'verve'>('verve');
    const [cardName, setCardName] = useState('');
    const [dailyLimit, setDailyLimit] = useState<number>(100000);
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');

    // Get user accounts from dashboardData
    const userAccounts = dashboardData?.accounts || [];
    
    // Filter accounts that have sufficient funds for card creation
    const getEligibleAccounts = () => {
      if (!cardFees) return userAccounts;
      const requiredAmount = parseFloat(cardFees.fees[cardBrand]);
      return userAccounts.filter(account => {
        const balance = account.available_balance;
        return balance >= requiredAmount && account.status === 'active';
      });
    };

    const eligibleAccounts = getEligibleAccounts();

    // Reset selected account if it's no longer eligible when card brand changes
    React.useEffect(() => {
      if (selectedAccountId && !eligibleAccounts.find(acc => acc.account_number === selectedAccountId)) {
        setSelectedAccountId('');
      }
    }, [cardBrand, selectedAccountId, eligibleAccounts]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!selectedAccountId) {
        alert('Please select an account to charge the card creation fee from.');
        return;
      }
      
      const cardData: CreateCardRequest = {
        card_type: cardType,
        card_brand: cardBrand,
        account_id: selectedAccountId,
        ...(cardName && { card_name: cardName }),
        daily_limit: dailyLimit
      };
      
      handleCreateCard(cardData);
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-card rounded-2xl w-full max-w-md">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Create New Card</h3>
            <button
              onClick={() => setShowCreateCardModal(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Card Type</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setCardType('debit')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    cardType === 'debit' 
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300' 
                      : 'border-border bg-background text-muted-foreground hover:border-primary'
                  }`}
                >
                  <CreditCardIcon className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-sm font-medium">Debit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCardType('credit')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    cardType === 'credit' 
                      ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300' 
                      : 'border-border bg-background text-muted-foreground hover:border-primary'
                  }`}
                >
                  <CreditCardIcon className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-sm font-medium">Credit Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCardType('prepaid')}
                  className={`p-3 rounded-lg border-2 transition-colors ${
                    cardType === 'prepaid' 
                      ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300' 
                      : 'border-border bg-background text-muted-foreground hover:border-primary'
                  }`}
                >
                  <CreditCardIcon className="h-6 w-6 mx-auto mb-1" />
                  <span className="text-sm font-medium">Prepaid Card</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Card Brand</label>
              <select
                value={cardBrand}
                onChange={(e) => setCardBrand(e.target.value as 'visa' | 'mastercard' | 'verve')}
                className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="verve">Verve {cardFees && `($${cardFees.fees.verve})`}</option>
                <option value="visa">Visa {cardFees && `($${cardFees.fees.visa})`}</option>
                <option value="mastercard">Mastercard {cardFees && `($${cardFees.fees.mastercard})`}</option>
              </select>
              {cardFees && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <span className="font-medium">Card Creation Fee: ${cardFees.fees[cardBrand]}</span>
                    {cardBrand === 'mastercard' && (
                      <span className="block text-xs mt-1">Premium card with enhanced benefits</span>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Charge Fee From Account
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
                className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              >
                <option value="">Select an account to charge fee from</option>
                {eligibleAccounts.map((account) => (
                  <option key={account.account_number} value={account.account_number}>
                    {account.account_name} (****{account.account_number.slice(-4)}) - 
                    ${account.available_balance.toLocaleString()}
                  </option>
                ))}
              </select>
              {eligibleAccounts.length === 0 && cardFees && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    <span className="font-medium">No eligible accounts found.</span>
                    <span className="block text-xs mt-1">
                      You need at least ${cardFees.fees[cardBrand]} in an active account to create this card.
                    </span>
                  </p>
                </div>
              )}
              {selectedAccountId && cardFees && (
                <div className="mt-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs text-green-700 dark:text-green-300">
                    ${cardFees.fees[cardBrand]} will be charged from the selected account.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Card Name (Optional)</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Enter custom name for your card"
                className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                maxLength={200}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Daily Limit</label>
              <input
                type="number"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(Number(e.target.value))}
                min={1000}
                max={1000000}
                className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-muted-foreground mt-1">Amount in USD ($)</p>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCreateCardModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={createLoading || !selectedAccountId || eligibleAccounts.length === 0}
              >
                {createLoading ? 'Creating...' : 
                 eligibleAccounts.length === 0 ? 'Insufficient Funds' : 
                 'Create Card'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Cards</h1>
              <p className="text-muted-foreground">Manage your debit and credit cards</p>
            </div>
            <Button
              onClick={() => setShowCreateCardModal(true)}
              className="flex items-center space-x-2"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Card</span>
            </Button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-green-700 dark:text-green-300 font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          {loading ? (
          <Card variant="elevated" className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your cards...</p>
            </div>
          </Card>
        ) : error ? (
          <Card variant="elevated" className="p-8">
            <div className="text-center">
              <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-3 w-fit mx-auto mb-4">
                <XMarkIcon className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Cards</h3>
              <p className="text-red-600 mb-6">{error}</p>
              <Button
                onClick={fetchCards}
                className="mx-auto"
              >
                Try Again
              </Button>
            </div>
          </Card>
        ) : cards.length === 0 ? (
            /* Empty State */
            <Card variant="elevated" className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CreditCardIcon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No Cards Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Get started by creating your first debit or credit card. Cards make it easy to spend and manage your money.
                </p>
                <Button
                  onClick={() => setShowCreateCardModal(true)}
                  className="flex items-center space-x-2 mx-auto"
                >
                  <PlusIcon className="h-4 w-4" />
                  <span>Create Your First Card</span>
                </Button>
              </div>
            </Card>
          ) : (
            /* Cards Grid */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cards.map((card) => (
                  <div key={card.id} className="space-y-4">
                    {/* Card Visual */}
                    <div
                      className={`relative p-6 bg-gradient-to-br ${getCardColor(card.card_type, card.card_brand)} rounded-2xl text-white cursor-pointer hover:scale-105 transition-transform min-h-[220px] flex flex-col justify-between`}
                      onClick={() => setShowCardDetails(showCardDetails === card.id ? null : card.id)}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm opacity-80 font-medium uppercase tracking-wider">{card.card_type_display}</p>
                          <p className="text-xs opacity-60 mt-1">{card.card_brand_display}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <CreditCardIcon className="h-5 w-5" />
                          </div>
                          <div className={`w-2 h-2 rounded-full ${
                            card.status === 'active' ? 'bg-green-400' : 
                            card.status === 'blocked' ? 'bg-red-400' : 
                            card.status === 'expired' ? 'bg-yellow-400' : 'bg-gray-400'
                          }`}></div>
                        </div>
                      </div>
                      
                      {/* Card Number */}
                      <div className="my-4">
                        <p className="text-2xl font-mono tracking-wider">
                          {showCardDetails === card.id && card.card_number 
                            ? card.card_number.replace(/(.{4})/g, '$1 ').trim() 
                            : card.masked_card_number || '**** **** **** ****'
                          }
                        </p>
                      </div>
                      
                      {/* Card Footer */}
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-xs opacity-60 uppercase tracking-wider">Cardholder</p>
                          <p className="text-sm font-medium">{card.card_name || 'CARDHOLDER'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs opacity-60 uppercase tracking-wider">Expires</p>
                          <p className="text-sm font-medium flex items-center space-x-1">
                            <CalendarIcon className="h-3 w-3" />
                            <span>
                              {new Date(card.expiry_date).toLocaleDateString('en-US', { month: '2-digit', year: '2-digit' })}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Info */}
                    <Card variant="elevated" className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <ShieldCheckIcon className={`h-5 w-5 ${
                            card.status === 'active' ? 'text-green-500' : 
                            card.status === 'blocked' ? 'text-red-500' : 
                            card.status === 'expired' ? 'text-yellow-500' : 'text-gray-500'
                          }`} />
                          <span className={`text-sm font-medium ${
                            card.status === 'active' ? 'text-green-700' : 
                            card.status === 'blocked' ? 'text-red-700' : 
                            card.status === 'expired' ? 'text-yellow-700' : 'text-gray-700'
                          }`}>
                            {card.status_display}
                          </span>
                        </div>
                        <button
                          onClick={() => setShowCardDetails(showCardDetails === card.id ? null : card.id)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {showCardDetails === card.id ? (
                            <EyeSlashIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>

                      {/* Card Limits */}
                      <div className="space-y-2 mb-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Daily Limit</span>
                          <span className="font-medium">${parseFloat(card.daily_limit).toLocaleString()}</span>
                        </div>
                        {card.card_type === 'credit' && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Weekly Limit</span>
                              <span className="font-medium">${parseFloat(card.weekly_limit).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Monthly Limit</span>
                              <span className="font-medium">${parseFloat(card.monthly_limit).toLocaleString()}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Card Features */}
                      <div className="space-y-1 mb-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">International</span>
                          <span className={card.international_transactions ? 'text-green-600' : 'text-red-600'}>
                            {card.international_transactions ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Online Transactions</span>
                          <span className={card.online_transactions ? 'text-green-600' : 'text-red-600'}>
                            {card.online_transactions ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Contactless</span>
                          <span className={card.contactless_enabled ? 'text-green-600' : 'text-red-600'}>
                            {card.contactless_enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleBlockCard(card.id, card.status)}
                          className="flex-1 flex items-center justify-center space-x-1"
                          disabled={card.status === 'expired'}
                        >
                          <LockClosedIcon className="h-3 w-3" />
                          <span>{card.status === 'active' ? 'Block' : 'Unblock'}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCard(card.id)}
                          className="flex-1 flex items-center justify-center space-x-1 text-red-600 hover:text-red-700"
                        >
                          <ClockIcon className="h-3 w-3" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </Card>
                  </div>
                ))}

                {/* Add Card Button */}
                <div 
                  onClick={() => setShowCreateCardModal(true)}
                  className="border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center hover:border-primary transition-colors cursor-pointer min-h-[220px] p-6"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-3">
                    <PlusIcon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Add New Card</p>
                  <p className="text-xs text-muted-foreground">Request a new debit or credit card</p>
                </div>
              </div>
            </div>
          )}

          {/* Create Card Modal */}
          {showCreateCardModal && <CreateCardModal />}
        </div>
      </div>
    </DashboardLayout>
  );
};

const ProtectedCardsPage: React.FC = () => {
  return (
    <ProtectedRoute requireProfileCompletion={true}>
      <CardsPage />
    </ProtectedRoute>
  );
};

export default ProtectedCardsPage;
