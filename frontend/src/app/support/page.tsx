'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  VideoCameraIcon,
  ClockIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import ProtectedRoute from '../../components/ProtectedRoute';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

const SupportPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: '',
    message: ''
  });

  const supportChannels = [
    {
      id: 1,
      name: 'Live Chat',
      description: 'Chat with our support team',
      icon: ChatBubbleLeftRightIcon,
      contact: 'Available 24/7',
      hours: 'Instant response',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      name: 'Phone Support',
      description: 'Call our support hotline',
      icon: PhoneIcon,
      contact: '+1 (555) 123-4567',
      hours: 'Mon-Fri: 9AM-6PM EST',
      color: 'bg-green-500'
    },
    {
      id: 3,
      name: 'Email Support',
      description: 'Send us an email',
      icon: EnvelopeIcon,
      contact: 'support@dominiontrustcapital.com',
      hours: 'Response within 24h',
      color: 'bg-purple-500'
    },
    {
      id: 4,
      name: 'Video Call',
      description: 'Schedule a video consultation',
      icon: VideoCameraIcon,
      contact: 'Book appointment',
      hours: 'Mon-Fri: 10AM-4PM EST',
      color: 'bg-orange-500'
    }
  ];

  const faqData = [
    {
      id: 1,
      title: 'Account Management',
      description: 'Questions about your account',
      icon: DocumentTextIcon,
      questions: [
        {
          question: 'How do I change my password?',
          answer: 'Go to Account Settings > Security > Change Password. Enter your current password and choose a new one.'
        },
        {
          question: 'How can I update my personal information?',
          answer: 'Navigate to Account Settings > Profile to update your personal details like address, phone number, etc.'
        },
        {
          question: 'How do I enable two-factor authentication?',
          answer: 'Go to Account Settings > Security > Two-Factor Authentication and follow the setup instructions.'
        },
        {
          question: 'How do I view my account statements?',
          answer: 'Access your statements through Dashboard > Account History or download them from the Statements section.'
        },
        {
          question: 'How do I reset my password?',
          answer: 'Click "Forgot Password" on the login page and follow the instructions sent to your registered email address.'
        }
      ]
    }
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle ticket submission
    console.log('Ticket submitted:', ticketForm);
  };

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
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-foreground mb-2">Support Center</h1>
                <p className="text-muted-foreground">We're here to help you with any questions or issues</p>
              </div>

              <div className="space-y-6">
                {/* Search */}
                <Card variant="elevated">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-2">How can we help you?</h2>
                    <p className="text-muted-foreground">Search our knowledge base or contact support</p>
                  </div>
                  <div className="relative max-w-2xl mx-auto">
                    <Input
                      placeholder="Search for help articles, FAQs, or topics..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 text-lg"
                      leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
                    />
                  </div>
                </Card>

                {/* Support Channels */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {supportChannels.map((channel) => (
                    <Card key={channel.id} variant="elevated" hover={true}>
                      <div className="text-center">
                        <div className={`w-12 h-12 ${channel.color}/10 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                          <channel.icon className={`h-6 w-6 ${channel.color.replace('bg-', 'text-')}`} />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">{channel.name}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{channel.description}</p>
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-foreground">{channel.contact}</p>
                          <p className="text-xs text-muted-foreground">{channel.hours}</p>
                        </div>
                        <Button className="w-full mt-4">
                          Contact Now
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                {/* FAQ Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <Card variant="elevated">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-foreground">Frequently Asked Questions</h3>
                        <QuestionMarkCircleIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="space-y-4">
                        {faqData.slice(0, 1).map((category) => (
                          <div key={category.id}>
                            {category.questions.slice(0, 5).map((faq, index) => (
                              <div key={index} className="border-b border-border last:border-0 pb-4 last:pb-0">
                                <button
                                  onClick={() => toggleFAQ(index)}
                                  className="flex items-center justify-between w-full text-left py-2"
                                >
                                  <span className="font-medium text-foreground">{faq.question}</span>
                                  <ChevronDownIcon className={`h-4 w-4 transition-transform ${
                                    expandedFAQ === index ? 'rotate-180' : ''
                                  }`} />
                                </button>
                                {expandedFAQ === index && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <p className="text-muted-foreground mt-2">{faq.answer}</p>
                                  </motion.div>
                                )}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 pt-6 border-t border-border">
                        <Button variant="outline" className="w-full">
                          View All FAQs
                        </Button>
                      </div>
                    </Card>
                  </div>

                  {/* Contact Form */}
                  <div className="space-y-6">
                    <Card variant="elevated">
                      <h3 className="text-lg font-semibold text-foreground mb-6">Submit a Ticket</h3>
                      <form onSubmit={handleTicketSubmit} className="space-y-4">
                        <Input
                          placeholder="Subject"
                          value={ticketForm.subject}
                          onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                          required
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <select
                            value={ticketForm.category}
                            onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                            className="px-4 py-3 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          >
                            <option value="">Category</option>
                            <option value="account">Account Issues</option>
                            <option value="transactions">Transactions</option>
                            <option value="cards">Cards & Payments</option>
                            <option value="security">Security</option>
                            <option value="technical">Technical Support</option>
                            <option value="other">Other</option>
                          </select>
                          <select
                            value={ticketForm.priority}
                            onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                            className="px-4 py-3 rounded-lg border border-border bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                            required
                          >
                            <option value="">Priority</option>
                            <option value="low">Low</option>
                            <option value="normal">Normal</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                          </select>
                        </div>
                        <div>
                          <textarea
                            placeholder="Describe your issue in detail..."
                            value={ticketForm.message}
                            onChange={(e) => setTicketForm(prev => ({ ...prev, message: e.target.value }))}
                            className="w-full px-4 py-3 rounded-lg border border-border bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                            rows={4}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Submit Ticket
                        </Button>
                      </form>
                    </Card>
                  </div>
                </div>

                {/* Quick Links */}
                <Card variant="elevated">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Quick Links</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Link href="/account" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary transition-colors">
                      <ShieldCheckIcon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Account Security</p>
                        <p className="text-sm text-muted-foreground">Manage security settings</p>
                      </div>
                    </Link>
                    <Link href="/kyc-documents" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary transition-colors">
                      <DocumentTextIcon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Document Upload</p>
                        <p className="text-sm text-muted-foreground">Upload verification documents</p>
                      </div>
                    </Link>
                    <Link href="/transfer" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-secondary transition-colors">
                      <LightBulbIcon className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Transfer Guide</p>
                        <p className="text-sm text-muted-foreground">Learn how to send money</p>
                      </div>
                    </Link>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default SupportPage;
