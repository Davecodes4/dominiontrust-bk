'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon,
  LockClosedIcon,
  EyeSlashIcon,
  KeyIcon,
  CheckBadgeIcon,
  BanknotesIcon,
  UserIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';

const Security: React.FC = () => {
  const securityFeatures = [
    {
      icon: ShieldCheckIcon,
      title: 'FDIC Insured',
      description: 'Your deposits are protected up to $250,000 by the Federal Deposit Insurance Corporation.',
      badge: 'FDIC'
    },
    {
      icon: LockClosedIcon,
      title: '256-bit SSL Encryption',
      description: 'Bank-level encryption protects your data in transit and at rest with industry-standard security.',
      badge: 'SSL'
    },
    {
      icon: EyeSlashIcon,
      title: 'Privacy Protection',
      description: 'We never sell your personal data. Your information stays private and secure.',
      badge: 'PRIVATE'
    },
    {
      icon: KeyIcon,
      title: 'Multi-Factor Authentication',
      description: 'Advanced authentication including biometrics, SMS, and email verification.',
      badge: 'MFA'
    },
    {
      icon: CheckBadgeIcon,
      title: 'Real-time Monitoring',
      description: '24/7 fraud detection and monitoring to protect your account from suspicious activity.',
      badge: 'MONITORED'
    },
    {
      icon: UserIcon,
      title: 'Identity Verification',
      description: 'Comprehensive KYC (Know Your Customer) process ensures account security.',
      badge: 'KYC'
    }
  ];

  return (
    <section id="security" className="py-20 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6"
          >
            <ShieldCheckIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Bank-Level Security
            </span>
          </motion.div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Your money is
            <br />
            <span className="text-primary">safe and secure</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            We use the same security measures as the world's largest banks 
            to protect your money and personal information.
          </p>
        </motion.div>

        {/* Security Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => (
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
                className="h-full relative overflow-hidden"
              >
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                    {feature.badge}
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
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

        {/* Security Guarantees */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <Card
            variant="elevated"
            className="max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BanknotesIcon className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Zero Liability Protection
                </h3>
                <p className="text-muted-foreground">
                  You're not responsible for unauthorized transactions when you report them promptly.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCardIcon className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Instant Notifications
                </h3>
                <p className="text-muted-foreground">
                  Get real-time alerts for all transactions and account activity via SMS and email.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckBadgeIcon className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Account Monitoring
                </h3>
                <p className="text-muted-foreground">
                  Advanced AI monitors your account 24/7 for suspicious activity and fraud.
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
            Trusted by security experts
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <ShieldCheckIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-medium">SOC 2 Type II</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <LockClosedIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-medium">PCI DSS Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <CheckBadgeIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-medium">ISO 27001</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <BanknotesIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-medium">FDIC Insured</span>
            </div>
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
          <div className="max-w-2xl mx-auto space-y-6">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground">
              Ready to bank with confidence?
            </h3>
            <p className="text-xl text-muted-foreground">
              Join thousands who trust Dominion Trust Capital with their financial security.
            </p>
            <Button size="lg" className="inline-flex items-center space-x-2">
              <ShieldCheckIcon className="h-5 w-5" />
              <span>Open Secure Account</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Security; 