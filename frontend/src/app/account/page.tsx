'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  UserIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  DocumentTextIcon,
  BellIcon,
  KeyIcon,
  ArrowLeftIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import ProtectedRoute from '../../components/ProtectedRoute';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

const AccountPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
    phone: '+1 (555) 123-4567',
    address: '123 Main Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105'
  });

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'kyc', name: 'Verification', icon: CheckBadgeIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
  ];

  const kycStatus = {
    status: 'approved',
    completionPercentage: 100,
    documents: [
      { type: 'Identity Document', status: 'approved', uploadedDate: '2024-06-15' },
      { type: 'Proof of Address', status: 'approved', uploadedDate: '2024-06-15' },
      { type: 'Employment Verification', status: 'approved', uploadedDate: '2024-06-16' }
    ]
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    // TODO: API call to save profile
    setIsEditing(false);
  };

  const renderProfile = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Personal Information</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
        >
          <PencilIcon className="h-4 w-4 mr-2" />
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          name="firstName"
          label="First Name"
          value={profileData.firstName}
          onChange={handleInputChange}
          disabled={!isEditing}
          variant="filled"
        />
        <Input
          name="lastName"
          label="Last Name"
          value={profileData.lastName}
          onChange={handleInputChange}
          disabled={!isEditing}
          variant="filled"
        />
        <Input
          name="email"
          label="Email Address"
          type="email"
          value={profileData.email}
          onChange={handleInputChange}
          disabled={!isEditing}
          variant="filled"
        />
        <Input
          name="phone"
          label="Phone Number"
          value={profileData.phone}
          onChange={handleInputChange}
          disabled={!isEditing}
          variant="filled"
        />
        <div className="md:col-span-2">
          <Input
            name="address"
            label="Address"
            value={profileData.address}
            onChange={handleInputChange}
            disabled={!isEditing}
            variant="filled"
          />
        </div>
        <Input
          name="city"
          label="City"
          value={profileData.city}
          onChange={handleInputChange}
          disabled={!isEditing}
          variant="filled"
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="state"
            label="State"
            value={profileData.state}
            onChange={handleInputChange}
            disabled={!isEditing}
            variant="filled"
          />
          <Input
            name="zipCode"
            label="ZIP Code"
            value={profileData.zipCode}
            onChange={handleInputChange}
            disabled={!isEditing}
            variant="filled"
          />
        </div>
      </div>

      {isEditing && (
        <div className="flex space-x-4">
          <Button onClick={handleSaveProfile} className="flex-1">
            Save Changes
          </Button>
          <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
            Cancel
          </Button>
        </div>
      )}
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Security Settings</h2>

      <div className="space-y-4">
        <Card variant="elevated">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <KeyIcon className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground">Secure your account with 2FA</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-green-500 font-medium">Enabled</span>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Login Alerts</h3>
                <p className="text-sm text-muted-foreground">Get notified of new sign-ins</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-green-500 font-medium">Active</span>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
          </div>
        </Card>

        <Card variant="elevated">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                <CreditCardIcon className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">Card Controls</h3>
                <p className="text-sm text-muted-foreground">Manage card security settings</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Manage Cards</Button>
          </div>
        </Card>

        <Card variant="elevated">
          <h3 className="font-medium text-foreground mb-4">Password</h3>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Last changed: 30 days ago
            </p>
            <Button variant="outline" size="sm">Change Password</Button>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderKYC = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Account Verification</h2>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          kycStatus.status === 'approved' 
            ? 'bg-green-500/10 text-green-500' 
            : 'bg-orange-500/10 text-orange-500'
        }`}>
          {kycStatus.status === 'approved' ? 'Verified' : 'Pending'}
        </div>
      </div>

      <Card variant="elevated" className="bg-green-500/5 border-green-500/20">
        <div className="flex items-center space-x-3">
          <CheckBadgeIcon className="h-8 w-8 text-green-500" />
          <div>
            <h3 className="font-medium text-foreground">Account Fully Verified</h3>
            <p className="text-sm text-muted-foreground">
              All verification requirements have been completed successfully.
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="font-medium text-foreground">Verification Documents</h3>
        {kycStatus.documents.map((doc, index) => (
          <Card key={index} variant="elevated">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <DocumentTextIcon className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-medium text-foreground">{doc.type}</h4>
                  <p className="text-sm text-muted-foreground">
                    Uploaded: {new Date(doc.uploadedDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-sm text-green-500 font-medium">Approved</span>
                <CheckBadgeIcon className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card variant="elevated" className="bg-blue-500/5 border-blue-500/20">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
            <ShieldCheckIcon className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">Enhanced Security Level</h3>
            <p className="text-sm text-muted-foreground">
              Your account has the highest security clearance with full access to all features.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-foreground">Notification Preferences</h2>

      <div className="space-y-4">
        <Card variant="elevated">
          <h3 className="font-medium text-foreground mb-4">Transaction Alerts</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-foreground">Email notifications</span>
              <input type="checkbox" defaultChecked className="rounded border-border text-primary" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-foreground">SMS notifications</span>
              <input type="checkbox" defaultChecked className="rounded border-border text-primary" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-foreground">Push notifications</span>
              <input type="checkbox" defaultChecked className="rounded border-border text-primary" />
            </label>
          </div>
        </Card>

        <Card variant="elevated">
          <h3 className="font-medium text-foreground mb-4">Security Alerts</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-foreground">Login from new device</span>
              <input type="checkbox" defaultChecked className="rounded border-border text-primary" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-foreground">Failed login attempts</span>
              <input type="checkbox" defaultChecked className="rounded border-border text-primary" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-foreground">Large transactions</span>
              <input type="checkbox" defaultChecked className="rounded border-border text-primary" />
            </label>
          </div>
        </Card>

        <Card variant="elevated">
          <h3 className="font-medium text-foreground mb-4">Account Updates</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-foreground">Monthly statements</span>
              <input type="checkbox" defaultChecked className="rounded border-border text-primary" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-foreground">Product updates</span>
              <input type="checkbox" className="rounded border-border text-primary" />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-foreground">Marketing communications</span>
              <input type="checkbox" className="rounded border-border text-primary" />
            </label>
          </div>
        </Card>

        <Button className="w-full">Save Notification Preferences</Button>
      </div>
    </div>
  );

  return (
    <ProtectedRoute requireProfileCompletion={true}>
      <DashboardLayout>
        <div className="p-4 lg:p-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Account Settings</h1>
                  <p className="text-sm text-muted-foreground">Manage your profile and account preferences</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1">
                  <Card variant="elevated">
                    <div className="space-y-2">
                      {tabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                            activeTab === tab.id
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                          }`}
                        >
                          <tab.icon className="h-5 w-5" />
                          <span className="font-medium">{tab.name}</span>
                        </button>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card variant="elevated" className="p-6">
                      {activeTab === 'profile' && renderProfile()}
                      {activeTab === 'security' && renderSecurity()}
                      {activeTab === 'kyc' && renderKYC()}
                      {activeTab === 'notifications' && renderNotifications()}
                    </Card>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AccountPage; 