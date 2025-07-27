'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  CurrencyDollarIcon, 
  DevicePhoneMobileIcon,
  ClockIcon,
  GlobeAltIcon,
  ChartBarIcon,
  UserGroupIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';

const Features = () => {
  const features = [
    {
      icon: ShieldCheckIcon,
      title: 'Bank-Level Security',
      description: 'Your money and data are protected with military-grade encryption and advanced fraud detection.',
      highlight: '256-bit SSL encryption'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'No Hidden Fees',
      description: 'Transparent pricing with no monthly fees, no minimum balance requirements, and no surprise charges.',
      highlight: '$0 monthly fees'
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Mobile First',
      description: 'Full-featured mobile app with instant notifications, biometric login, and offline access.',
      highlight: '24/7 mobile banking'
    },
    {
      icon: ClockIcon,
      title: 'Instant Transfers',
      description: 'Send money instantly to friends, family, or businesses. Internal transfers happen in real-time.',
      highlight: 'Real-time processing'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Access',
      description: 'Access your account from anywhere in the world. International transfers to 200+ countries.',
      highlight: '200+ countries'
    },
    {
      icon: ChartBarIcon,
      title: 'Smart Analytics',
      description: 'Track your spending with AI-powered insights, budgeting tools, and financial goal tracking.',
      highlight: 'AI-powered insights'
    },
    {
      icon: UserGroupIcon,
      title: '24/7 Support',
      description: 'Get help when you need it with our round-the-clock customer support team and live chat.',
      highlight: 'Always available'
    },
    {
      icon: CreditCardIcon,
      title: 'Premium Cards',
      description: 'Multiple card options with cashback rewards, travel benefits, and contactless payments.',
      highlight: 'Up to 3% cashback'
    }
  ];

  const additionalFeatures = [
    {
      category: 'Account Management',
      items: [
        'Multiple account types (Checking, Savings, Business)',
        'Automatic savings with round-up features',
        'Joint accounts and family sharing',
        'Account alerts and notifications'
      ]
    },
    {
      category: 'Payments & Transfers',
      items: [
        'Instant internal transfers',
        'ACH and wire transfers',
        'International SWIFT transfers',
        'Bill pay and recurring payments'
      ]
    },
    {
      category: 'Digital Features',
      items: [
        'Mobile check deposit',
        'Digital wallet integration',
        'QR code payments',
        'Spending categorization'
      ]
    },
    {
      category: 'Investment & Savings',
      items: [
        'High-yield savings accounts',
        'Certificate of deposits (CDs)',
        'Investment portfolio tracking',
        'Retirement planning tools'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-blue-500/5 to-purple-500/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                Banking <span className="text-primary">Features</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                Discover the comprehensive suite of features that make Dominion Trust Capital 
                your perfect banking partner. From advanced security to innovative tools.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Features Grid */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Everything You Need
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform combines cutting-edge technology with traditional banking excellence
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 * index }}
                >
                  <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 group">
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <feature.icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                      <div className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                        {feature.highlight}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Features */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Complete Banking Solution
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our comprehensive feature set designed for modern banking needs
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {additionalFeatures.map((section, index) => (
                <motion.div
                  key={section.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 * index }}
                >
                  <Card className="p-8 h-full">
                    <h3 className="text-2xl font-bold text-foreground mb-6">
                      {section.category}
                    </h3>
                    <div className="space-y-4">
                      {section.items.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                          <span className="text-muted-foreground">{item}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <Card className="p-12 bg-gradient-to-br from-primary/10 via-blue-500/5 to-purple-500/10 border-primary/20">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Ready to Experience Modern Banking?
                </h2>
                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands who've already switched to Dominion Trust Capital. 
                  Open your account today and get access to all these features.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <motion.a
                    href="/signup"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Open Account
                  </motion.a>
                  <motion.a
                    href="/contact"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center justify-center px-8 py-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    Contact Sales
                  </motion.a>
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

export default Features;
