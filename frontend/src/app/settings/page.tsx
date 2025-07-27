'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { api } from '@/lib/api'
import { 
  UserIcon, 
  ShieldCheckIcon, 
  BellIcon, 
  CogIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'

interface UserProfile {
  id: number
  user: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
  }
  middle_name: string
  phone_number: string
  date_of_birth: string
  gender: string
  marital_status: string
  nationality: string
  address: string
  city: string
  state: string
  postal_code: string
  country: string
  id_type: string
  id_number: string
  employer_name: string
  job_title: string
  employment_type: string
  monthly_income: string
  work_address: string
  emergency_contact_name: string
  emergency_contact_phone: string
  emergency_contact_relationship: string
  customer_tier: string
  account_officer: string
  preferred_branch: string
  email_notifications: boolean
  sms_notifications: boolean
  statement_delivery: string
}

interface NotificationSettings {
  email_notifications: boolean
  sms_notifications: boolean
  statement_delivery: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showTransferPinModal, setShowTransferPinModal] = useState(false)
  const [hasTransferPin, setHasTransferPin] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  // Form states
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [transferPinForm, setTransferPinForm] = useState({
    pin: '',
    confirm_pin: ''
  })
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    sms_notifications: true,
    statement_delivery: 'email'
  })

  useEffect(() => {
    loadProfile()
    checkTransferPin()
  }, [])

  const loadProfile = async () => {
    try {
      const data = await api.getProfile()
      setProfile(data)
      setNotificationSettings({
        email_notifications: data.email_notifications,
        sms_notifications: data.sms_notifications,
        statement_delivery: data.statement_delivery
      })
    } catch (error) {
      console.error('Failed to load profile:', error)
      setNotification({type: 'error', message: 'Failed to load profile data'})
    } finally {
      setLoading(false)
    }
  }

  const checkTransferPin = async () => {
    try {
      const response = await api.checkTransferPin()
      setHasTransferPin(response.hasPin)
    } catch (error) {
      console.error('Failed to check transfer PIN:', error)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setNotification({type: 'error', message: 'New passwords do not match'})
      return
    }

    try {
      await api.changePassword({
        currentPassword: passwordForm.current_password,
        newPassword: passwordForm.new_password
      })
      setNotification({type: 'success', message: 'Password changed successfully'})
      setShowPasswordModal(false)
      setPasswordForm({current_password: '', new_password: '', confirm_password: ''})
    } catch (error: any) {
      setNotification({type: 'error', message: error.message || 'Failed to change password'})
    }
  }

  const handleTransferPinSet = async (e: React.FormEvent) => {
    e.preventDefault()
    if (transferPinForm.pin !== transferPinForm.confirm_pin) {
      setNotification({type: 'error', message: 'PINs do not match'})
      return
    }

    if (transferPinForm.pin.length !== 4 || !/^\d{4}$/.test(transferPinForm.pin)) {
      setNotification({type: 'error', message: 'PIN must be exactly 4 digits'})
      return
    }

    try {
      await api.setTransferPin({
        newPin: transferPinForm.pin
      })
      setNotification({type: 'success', message: 'Transfer PIN set successfully'})
      setShowTransferPinModal(false)
      setTransferPinForm({pin: '', confirm_pin: ''})
      setHasTransferPin(true)
    } catch (error: any) {
      setNotification({type: 'error', message: error.message || 'Failed to set transfer PIN'})
    }
  }

  const handleNotificationUpdate = async (setting: keyof NotificationSettings, value: boolean | string) => {
    try {
      const updatedSettings = { ...notificationSettings, [setting]: value }
      
      if (setting === 'email_notifications' || setting === 'sms_notifications') {
        await api.updateNotificationSettings({
          email_notifications: updatedSettings.email_notifications,
          sms_notifications: updatedSettings.sms_notifications
        })
      } else if (setting === 'statement_delivery') {
        // For statement_delivery, use updateProfile
        await api.updateProfile({ statement_delivery: value as string })
      }
      
      setNotificationSettings(updatedSettings)
      setNotification({type: 'success', message: 'Notification settings updated'})
    } catch (error: any) {
      setNotification({type: 'error', message: error.message || 'Failed to update settings'})
    }
  }

  const handleProfileUpdate = async (field: string, value: any) => {
    if (!profile) return

    try {
      const updatedData = { [field]: value }
      await api.updateProfile(updatedData)
      setProfile({ ...profile, [field]: value })
      setNotification({type: 'success', message: 'Profile updated successfully'})
    } catch (error: any) {
      setNotification({type: 'error', message: error.message || 'Failed to update profile'})
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'security', label: 'Security', icon: ShieldCheckIcon },
    { id: 'notifications', label: 'Notifications', icon: BellIcon },
    { id: 'preferences', label: 'Preferences', icon: CogIcon }
  ]

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-6 space-y-6 pb-24 lg:pb-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground mt-2">Manage your account settings and preferences</p>
          </div>

          {/* Notification Toast */}
          {notification && (
            <Card className={`mb-6 ${
              notification.type === 'success' ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/50 bg-red-500/10'
            }`}>
              <div className="flex items-center">
                <span className={`mr-3 text-lg ${notification.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                  {notification.type === 'success' ? '✓' : '⚠'}
                </span>
                <span className={notification.type === 'success' ? 'text-green-400' : 'text-red-400'}>
                  {notification.message}
                </span>
                <button 
                  onClick={() => setNotification(null)}
                  className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>
            </Card>
          )}

          {/* Tab Navigation */}
          <div className="border-b border-border mb-8">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <Card className="p-0">
            {activeTab === 'profile' && (
              <div className="p-6 space-y-6">
                <h2 className="text-xl font-semibold mb-4 text-foreground">Profile Information</h2>
                
                {profile && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">First Name</label>
                      <input
                        type="text"
                        value={profile.user.first_name}
                        onChange={(e) => handleProfileUpdate('user.first_name', e.target.value)}
                        className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profile.user.last_name}
                        onChange={(e) => handleProfileUpdate('user.last_name', e.target.value)}
                        className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Middle Name</label>
                      <input
                        type="text"
                        value={profile.middle_name}
                        onChange={(e) => handleProfileUpdate('middle_name', e.target.value)}
                        className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                      <input
                        type="email"
                        value={profile.user.email}
                        onChange={(e) => handleProfileUpdate('user.email', e.target.value)}
                        className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={profile.phone_number}
                        onChange={(e) => handleProfileUpdate('phone_number', e.target.value)}
                        className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={profile.date_of_birth}
                        onChange={(e) => handleProfileUpdate('date_of_birth', e.target.value)}
                        className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">Address</label>
                      <textarea
                        value={profile.address}
                        onChange={(e) => handleProfileUpdate('address', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">City</label>
                      <input
                        type="text"
                        value={profile.city}
                        onChange={(e) => handleProfileUpdate('city', e.target.value)}
                        className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">State</label>
                      <input
                        type="text"
                        value={profile.state}
                        onChange={(e) => handleProfileUpdate('state', e.target.value)}
                        className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div className="p-6 space-y-6">
                <h2 className="text-xl font-semibold mb-4 text-foreground">Security Settings</h2>
                
                <div className="space-y-4">
                  {/* Password Change */}
                  <Card variant="elevated" className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <LockClosedIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">Password</h3>
                          <p className="text-sm text-muted-foreground">Change your account password</p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowPasswordModal(true)}
                        variant="outline"
                        size="sm"
                      >
                        Change Password
                      </Button>
                    </div>
                  </Card>

                  {/* Transfer PIN */}
                  <Card variant="elevated" className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                          <KeyIcon className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">Transfer PIN</h3>
                          <p className="text-sm text-muted-foreground">
                            {hasTransferPin ? 'Your 4-digit PIN for secure transfers' : 'Set up a 4-digit PIN for secure transfers'}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => setShowTransferPinModal(true)}
                        variant={hasTransferPin ? "outline" : "primary"}
                        size="sm"
                      >
                        {hasTransferPin ? 'Change PIN' : 'Set PIN'}
                      </Button>
                    </div>
                  </Card>

                  {/* Two-Factor Authentication */}
                  <Card variant="elevated" className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                          <ShieldCheckIcon className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">Two-Factor Authentication</h3>
                          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-muted-foreground">Coming Soon</span>
                        <div className="relative inline-block w-10 h-6 bg-muted rounded-full cursor-not-allowed opacity-50">
                          <div className="absolute left-1 top-1 w-4 h-4 bg-card rounded-full transition-transform duration-200"></div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="p-6 space-y-6">
                <h2 className="text-xl font-semibold mb-4 text-foreground">Notification Preferences</h2>
                
                <div className="space-y-4">
                  {/* Email Notifications */}
                  <Card variant="elevated" className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <BellIcon className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">Email Notifications</h3>
                          <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.email_notifications}
                          onChange={(e) => handleNotificationUpdate('email_notifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </Card>

                  {/* SMS Notifications */}
                  <Card variant="elevated" className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                          <BellIcon className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">SMS Notifications</h3>
                          <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.sms_notifications}
                          onChange={(e) => handleNotificationUpdate('sms_notifications', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </Card>

                  {/* Statement Delivery */}
                  <Card variant="elevated" className="p-4">
                    <div>
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                          <BellIcon className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">Statement Delivery</h3>
                          <p className="text-sm text-muted-foreground">How would you like to receive your statements?</p>
                        </div>
                      </div>
                      <select
                        value={notificationSettings.statement_delivery}
                        onChange={(e) => handleNotificationUpdate('statement_delivery', e.target.value)}
                        className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="email">Email Only</option>
                        <option value="postal">Postal Mail Only</option>
                        <option value="both">Both Email and Postal</option>
                      </select>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="p-6 space-y-6">
                <h2 className="text-xl font-semibold mb-4 text-foreground">Account Preferences</h2>
                
                <div className="space-y-4">
                  {/* Customer Tier */}
                  <Card variant="elevated" className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                        <CogIcon className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">Customer Tier</h3>
                        <p className="text-sm text-primary font-medium">{profile?.customer_tier || 'Standard'}</p>
                      </div>
                    </div>
                  </Card>

                  {/* Preferred Branch */}
                  <Card variant="elevated" className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                          <CogIcon className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">Preferred Branch</h3>
                          <p className="text-sm text-muted-foreground">Select your preferred banking branch</p>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={profile?.preferred_branch || ''}
                        onChange={(e) => handleProfileUpdate('preferred_branch', e.target.value)}
                        placeholder="Enter your preferred branch"
                        className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      />
                    </div>
                  </Card>

                  {/* Account Officer */}
                  <Card variant="elevated" className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">Account Officer</h3>
                        <p className="text-sm text-muted-foreground">{profile?.account_officer || 'Not assigned'}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Change Password</h3>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordForm.current_password}
                      onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                      className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordForm.new_password}
                      onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                      className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordForm.confirm_password}
                      onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                      className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                    >
                      Change Password
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowPasswordModal(false)
                        setPasswordForm({current_password: '', new_password: '', confirm_password: ''})
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}

        {/* Transfer PIN Modal */}
        {showTransferPinModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <Card className="max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-4 text-foreground">{hasTransferPin ? 'Change' : 'Set'} Transfer PIN</h3>
                <form onSubmit={handleTransferPinSet} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">4-Digit PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={transferPinForm.pin}
                      onChange={(e) => setTransferPinForm({...transferPinForm, pin: e.target.value.replace(/\D/g, '')})}
                      className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Confirm PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={transferPinForm.confirm_pin}
                      onChange={(e) => setTransferPinForm({...transferPinForm, confirm_pin: e.target.value.replace(/\D/g, '')})}
                      className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="••••"
                      required
                    />
                  </div>
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    <p>Your PIN will be used to authorize transfers and other secure transactions.</p>
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                    >
                      {hasTransferPin ? 'Change PIN' : 'Set PIN'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowTransferPinModal(false)
                        setTransferPinForm({pin: '', confirm_pin: ''})
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>
        )}
      </DashboardLayout>
    </ProtectedRoute>
  )
}
