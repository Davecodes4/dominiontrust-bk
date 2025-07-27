'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  QuestionMarkCircleIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ClockIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const HelpCenterPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const supportOptions = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: 'Live Chat',
      description: 'Get instant help from our support team',
      availability: 'Available 24/7',
      action: 'Start Chat'
    },
    {
      icon: PhoneIcon,
      title: 'Phone Support',
      description: 'Speak directly with a customer service representative',
      availability: 'Mon-Fri 8AM-8PM EST',
      action: 'Call Now'
    },
    {
      icon: EnvelopeIcon,
      title: 'Email Support',
      description: 'Send us a detailed message about your issue',
      availability: 'Response within 24 hours',
      action: 'Send Email'
    }
  ];

  const faqCategories = [
    {
      title: 'Account & Banking',
      faqs: [
        {
          question: 'How do I open a new account?',
          answer: 'You can open an account online in just 5 minutes. Simply visit our signup page, provide your personal information, and make an initial deposit. You\'ll need a valid government-issued ID and Social Security number.'
        },
        {
          question: 'What are your account fees?',
          answer: 'We believe in transparent banking. Our Essential Checking account has no monthly fees, and our Premium Checking is free with a $2,500 minimum balance. We don\'t charge for standard transactions or online banking.'
        },
        {
          question: 'How do I reset my password?',
          answer: 'Click "Forgot Password" on the login page, enter your email address, and we\'ll send you a secure link to reset your password. The link expires in 24 hours for security.'
        }
      ]
    },
    {
      title: 'Transfers & Payments',
      faqs: [
        {
          question: 'How long do transfers take?',
          answer: 'Internal transfers are instant. External transfers typically take 1-3 business days for domestic transfers and 3-5 business days for international transfers.'
        },
        {
          question: 'What are the transfer limits?',
          answer: 'Daily transfer limits vary by account type. Essential Checking has a $5,000 daily limit, while Premium Checking has a $10,000 daily limit. Monthly limits are $50,000 and $100,000 respectively.'
        },
        {
          question: 'Are there fees for international transfers?',
          answer: 'International transfers via SWIFT have a $45 fee. We also offer competitive exchange rates with no hidden markups.'
        }
      ]
    },
    {
      title: 'Security & Privacy',
      faqs: [
        {
          question: 'How secure is my account?',
          answer: 'We use bank-level 256-bit SSL encryption, multi-factor authentication, and real-time fraud monitoring. Your deposits are FDIC insured up to $250,000.'
        },
        {
          question: 'What should I do if I suspect fraud?',
          answer: 'Contact us immediately at 1-800-DOMINION or through the app. We\'ll temporarily freeze your account and investigate any suspicious activity. You\'re protected by our zero liability policy.'
        },
        {
          question: 'How do I enable two-factor authentication?',
          answer: 'Go to Security Settings in your account, select "Enable 2FA," and follow the prompts to set up authentication via SMS, email, or authenticator app.'
        }
      ]
    }
  ];

  const quickLinks = [
    'Account Setup',
    'Mobile App',
    'Online Banking',
    'Debit Cards',
    'Direct Deposit',
    'Account Statements',
    'Overdraft Protection',
    'Savings Accounts'
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 hero-bg">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Help Center
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Find answers to your questions or get in touch with our support team
              </p>
              
              <div className="max-w-2xl mx-auto">
                <Input
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<MagnifyingGlassIcon className="h-5 w-5" />}
                  variant="filled"
                  className="text-lg"
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Support Options */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Get Support
              </h2>
              <p className="text-xl text-muted-foreground">
                Choose the support option that works best for you
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {supportOptions.map((option, index) => (
                <motion.div
                  key={option.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card variant="elevated" hover={true} className="h-full text-center">
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <option.icon className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {option.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {option.description}
                      </p>
                      <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                        <ClockIcon className="h-4 w-4" />
                        <span>{option.availability}</span>
                      </div>
                      <Button variant="primary" size="lg" className="w-full">
                        {option.action}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-secondary/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-muted-foreground">
                Find quick answers to common questions
              </p>
            </motion.div>

            <div className="space-y-8">
              {faqCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: categoryIndex * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-2xl font-bold text-foreground mb-6">
                    {category.title}
                  </h3>
                  <div className="space-y-4">
                    {category.faqs.map((faq, faqIndex) => {
                      const globalIndex = categoryIndex * 10 + faqIndex;
                      return (
                        <Card key={faq.question} variant="elevated">
                          <button
                            onClick={() => toggleFAQ(globalIndex)}
                            className="w-full text-left flex items-center justify-between p-2"
                          >
                            <h4 className="text-lg font-semibold text-foreground">
                              {faq.question}
                            </h4>
                            <ChevronDownIcon 
                              className={`h-5 w-5 text-muted-foreground transition-transform ${
                                expandedFAQ === globalIndex ? 'rotate-180' : ''
                              }`}
                            />
                          </button>
                          {expandedFAQ === globalIndex && (
                            <div className="pt-4 pb-2 px-2 border-t border-border">
                              <p className="text-muted-foreground">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Links */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Popular Help Topics
              </h2>
              <p className="text-xl text-muted-foreground">
                Quick access to commonly searched topics
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <motion.div
                  key={link}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Card variant="elevated" hover={true} className="cursor-pointer">
                    <div className="text-center p-4">
                      <span className="text-foreground font-medium">{link}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="py-20 bg-secondary/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card variant="elevated" className="bg-destructive/5 border-destructive/20">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheckIcon className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground">
                    Emergency Support
                  </h3>
                  <p className="text-muted-foreground">
                    If you suspect fraud or need immediate account assistance
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                    <Button variant="outline" size="lg" className="border-destructive text-destructive hover:bg-destructive hover:text-white">
                      Call Emergency Line
                    </Button>
                    <Button variant="outline" size="lg">
                      Report Fraud
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HelpCenterPage; 