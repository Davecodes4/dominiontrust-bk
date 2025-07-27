'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
  GlobeAmericasIcon,
  ClockIcon,
  UserGroupIcon,
  LockClosedIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';

const Features: React.FC = () => {
  const features = [
    {
      icon: CreditCardIcon,
      title: 'Smart Debit Cards',
      description: 'Get instant access to your money with contactless payments, international transactions, and real-time spending notifications.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: BanknotesIcon,
      title: 'Instant Transfers',
      description: 'Send money to friends and family instantly with no fees. External transfers processed in 1-3 business days.',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Bank-Level Security',
      description: 'Your money is FDIC insured up to $250,000. Advanced encryption and fraud monitoring keep your account safe.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: ChartBarIcon,
      title: 'Smart Insights',
      description: 'Track your spending with detailed analytics, budgeting tools, and personalized financial insights.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Mobile Banking',
      description: 'Full-featured mobile app with biometric login, mobile check deposits, and 24/7 account access.',
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10'
    },
    {
      icon: GlobeAmericasIcon,
      title: 'Global Access',
      description: 'Access your money anywhere in the world with international ATM access and multi-currency support.',
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10'
    }
  ];

  const additionalFeatures = [
    {
      icon: ClockIcon,
      title: '24/7 Support',
      description: 'Get help whenever you need it'
    },
    {
      icon: UserGroupIcon,
      title: 'Joint Accounts',
      description: 'Share accounts with family members'
    },
    {
      icon: LockClosedIcon,
      title: 'Privacy First',
      description: 'We never sell your personal data'
    },
    {
      icon: ArrowTrendingUpIcon,
      title: 'High Yield Savings',
      description: 'Earn competitive interest rates'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'No Hidden Fees',
      description: 'Transparent pricing with no surprises'
    },
    {
      icon: DocumentChartBarIcon,
      title: 'Digital Statements',
      description: 'Paperless statements and reports'
    }
  ];

  return (
    <section id="features" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Everything you need to
            <br />
            <span className="text-primary">manage your money</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience banking built for the modern world. No fees, no hassle, 
            just powerful tools to help you save, spend, and grow your money.
          </p>
        </motion.div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                variant="elevated"
                hover={true}
                className="h-full"
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center`}>
                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Additional Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            And so much more...
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {additionalFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex items-center space-x-4 p-4 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors duration-200"
              >
                <div className="flex-shrink-0">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-foreground">
                    {feature.title}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card
            variant="gradient"
            className="max-w-4xl mx-auto"
          >
            <div className="text-center space-y-6">
              <h3 className="text-2xl md:text-3xl font-bold text-white">
                Ready to experience modern banking?
              </h3>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Join thousands who've already switched to Dominion Trust Capital. 
                Open your account in just 5 minutes.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white !text-green-600 hover:bg-white/90"
                >
                  Open Account Now
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:!text-green-600"
                >
                  Schedule a Demo
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default Features; 