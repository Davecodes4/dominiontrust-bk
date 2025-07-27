'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ProtectedRoute from '../../components/ProtectedRoute';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import { api, BankAccount, UserProfile } from '../../lib/api';
import { 
  PlusIcon, 
  BanknotesIcon, 
  CreditCardIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  GlobeAltIcon,
  BuildingLibraryIcon,
  XMarkIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline';

const ACCOUNT_TYPES = [
  { value: 'savings', label: 'Savings Account', icon: ArrowTrendingUpIcon, description: 'Earn interest on your deposits' },
  { value: 'current', label: 'Current Account', icon: BanknotesIcon, description: 'For daily transactions and business' },
  { value: 'fixed_deposit', label: 'Fixed Deposit', icon: ClockIcon, description: 'Higher interest with fixed term' },
  { value: 'foreign_currency', label: 'Foreign Currency', icon: GlobeAltIcon, description: 'Multi-currency account' },
  { value: 'joint', label: 'Joint Account', icon: CreditCardIcon, description: 'Shared account for multiple users' },
  { value: 'corporate', label: 'Corporate Account', icon: BuildingLibraryIcon, description: 'For business and corporate needs' }
];

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
];

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [showBalances, setShowBalances] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const [newAccount, setNewAccount] = useState({
    account_name: '',
    account_type: 'savings',
    currency: 'USD',
    purpose_of_account: '',
    source_of_funds: '',
    minimum_balance: '100.00',
    is_joint_account: false,
    allow_online_transactions: true,
    allow_international_transactions: false
  });

  useEffect(() => {
    fetchAccounts();
    fetchUserProfile();
  }, []);

  const fetchAccounts = async () => {
    try {
      const data = await api.getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      setError('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const data = await api.getProfile();
      setUserProfile(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingAccount(true);
    setError(null);

    try {
      const createdAccount = await api.createAccount(newAccount);
      setAccounts(prev => [...prev, createdAccount]);
      setShowCreateModal(false);
      setNewAccount({
        account_name: '',
        account_type: 'savings',
        currency: 'USD',
        purpose_of_account: '',
        source_of_funds: '',
        minimum_balance: '100.00',
        is_joint_account: false,
        allow_online_transactions: true,
        allow_international_transactions: false
      });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setCreatingAccount(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatAccountNumber = (accountNumber: string) => {
    return accountNumber.replace(/(.{4})/g, '$1 ').trim();
  };

  const copyAccountNumber = async (accountNumber: string) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      setCopiedAccount(accountNumber);
      setTimeout(() => setCopiedAccount(null), 2000);
    } catch (error) {
      console.error('Failed to copy account number:', error);
    }
  };

  const getAccountTypeIcon = (type: string) => {
    const accountType = ACCOUNT_TYPES.find(t => t.value === type);
    return accountType?.icon || BanknotesIcon;
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles] || statusStyles.inactive}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTierLimits = (tier: string) => {
    const limits = {
      standard: 2,
      premium: 5,
      vip: 10,
      corporate: 20
    };
    return limits[tier as keyof typeof limits] || 1;
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">My Accounts</h1>
                <p className="mt-2 text-muted-foreground">
                  Manage your bank accounts and create new ones
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex items-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowBalances(!showBalances)}
                  className="flex items-center"
                >
                  {showBalances ? (
                    <>
                      <EyeSlashIcon className="h-4 w-4 mr-2" />
                      Hide Balances
                    </>
                  ) : (
                    <>
                      <EyeIcon className="h-4 w-4 mr-2" />
                      Show Balances
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  New Account
                </Button>
              </div>
            </div>

            {/* Account Summary */}
            {userProfile && (
              <div className="mt-6 bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Customer Tier:</span> {userProfile.customer_tier?.toUpperCase() || 'STANDARD'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You can have up to {getTierLimits(userProfile.customer_tier || 'standard')} accounts
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">Accounts:</span> {accounts.length} / {getTierLimits(userProfile.customer_tier || 'standard')}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      KYC Status: {userProfile.kyc_status?.toUpperCase() || 'PENDING'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-lg p-4 dark:bg-orange-950/30 dark:border-orange-800/50">
              <p className="text-orange-600 dark:text-orange-400">{error}</p>
            </div>
          )}

          {/* Accounts Grid */}
          {accounts.length === 0 ? (
            <div className="text-center py-12">
              <BanknotesIcon className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-medium text-foreground">No accounts</h3>
              <p className="mt-1 text-sm text-muted-foreground">Get started by creating your first account.</p>
              <div className="mt-6">
                <Button onClick={() => setShowCreateModal(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Account
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {accounts.map((account, index) => {
                const IconComponent = getAccountTypeIcon(account.account_type);
                
                return (
                  <motion.div
                    key={account.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="p-6 hover:shadow-lg transition-shadow duration-300">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-lg font-semibold text-foreground">
                              {account.account_name || 'My Account'}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {ACCOUNT_TYPES.find(t => t.value === account.account_type)?.label || account.account_type}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(account.status)}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Account Number</p>
                          <div className="flex items-center space-x-2">
                            <p className="font-mono text-sm font-medium text-foreground">
                              {formatAccountNumber(account.account_number)}
                            </p>
                            <button
                              onClick={() => copyAccountNumber(account.account_number)}
                              className="p-1 text-muted-foreground hover:text-foreground transition-colors rounded"
                              title="Copy account number"
                            >
                              <ClipboardDocumentIcon className="h-4 w-4" />
                            </button>
                            {copiedAccount === account.account_number && (
                              <span className="text-xs text-green-600 font-medium">Copied!</span>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">Balance</p>
                          <p className="text-2xl font-bold text-foreground">
                            {showBalances 
                              ? formatCurrency(account.balance, account.currency)
                              : '••••••'
                            }
                          </p>
                        </div>

                        {showBalances && (
                          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                            <div>
                              <p className="text-xs text-muted-foreground">Available</p>
                              <p className="text-sm font-medium text-foreground">
                                {formatCurrency(account.available_balance, account.currency)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Status</p>
                              <p className="text-sm font-medium capitalize text-foreground">{account.status}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <span className="text-xs text-muted-foreground">
                            Created {new Date(account.created_at).toLocaleDateString()}
                          </span>
                          <div className="text-xs text-muted-foreground">
                            {account.account_type.charAt(0).toUpperCase() + account.account_type.slice(1)} Account
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Create Account Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground">Create New Account</h3>
                    <button
                      onClick={() => setShowCreateModal(false)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateAccount} className="space-y-4">
                    <Input
                      label="Account Name"
                      type="text"
                      value={newAccount.account_name}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, account_name: e.target.value }))}
                      placeholder="e.g., My Savings Account"
                      required
                    />

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Account Type
                      </label>
                      <select
                        value={newAccount.account_type}
                        onChange={(e) => setNewAccount(prev => ({ ...prev, account_type: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        required
                      >
                        {ACCOUNT_TYPES.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {ACCOUNT_TYPES.find(t => t.value === newAccount.account_type)?.description}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Currency
                      </label>
                      <select
                        value={newAccount.currency}
                        onChange={(e) => setNewAccount(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        required
                      >
                        {CURRENCIES.map(currency => (
                          <option key={currency.value} value={currency.value}>
                            {currency.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Purpose of Account"
                      type="text"
                      value={newAccount.purpose_of_account}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, purpose_of_account: e.target.value }))}
                      placeholder="e.g., Personal savings, Business operations"
                      required
                    />

                    <Input
                      label="Source of Funds"
                      type="text"
                      value={newAccount.source_of_funds}
                      onChange={(e) => setNewAccount(prev => ({ ...prev, source_of_funds: e.target.value }))}
                      placeholder="e.g., Salary, Business income"
                      required
                    />

                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newAccount.allow_online_transactions}
                          onChange={(e) => setNewAccount(prev => ({ ...prev, allow_online_transactions: e.target.checked }))}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-foreground">Allow online transactions</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newAccount.allow_international_transactions}
                          onChange={(e) => setNewAccount(prev => ({ ...prev, allow_international_transactions: e.target.checked }))}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-foreground">Allow international transactions</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newAccount.is_joint_account}
                          onChange={(e) => setNewAccount(prev => ({ ...prev, is_joint_account: e.target.checked }))}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-foreground">Joint account</span>
                      </label>
                    </div>

                    {error && (
                      <div className="text-orange-600 dark:text-orange-400 text-sm">{error}</div>
                    )}

                    <div className="flex space-x-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowCreateModal(false)}
                        className="flex-1"
                        disabled={creatingAccount}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={creatingAccount}
                      >
                        {creatingAccount ? 'Creating...' : 'Create Account'}
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
