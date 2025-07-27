'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon,
  LockClosedIcon,
  EyeIcon,
  DevicePhoneMobileIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const SecurityPage: React.FC = () => {
  const securityFeatures = [
    {
      icon: ShieldCheckIcon,
      title: 'Bank-Level Encryption',
      description: 'All data is protected with 256-bit SSL encryption, the same standard used by major banks worldwide.',
      details: [
        'End-to-end encryption for all transactions',
        'Secure data transmission protocols',
        'Regular security audits and updates',
        'HTTPS everywhere policy'
      ]
    },
    {
      icon: LockClosedIcon,
      title: 'Multi-Factor Authentication',
      description: 'Add an extra layer of security with SMS, email, or authenticator app verification.',
      details: [
        'SMS text message verification',
        'Email confirmation codes',
        'Authenticator app integration',
        'Biometric authentication support'
      ]
    },
    {
      icon: EyeIcon,
      title: 'Real-Time Monitoring',
      description: 'Advanced fraud detection systems monitor your account 24/7 for suspicious activity.',
      details: [
        'AI-powered fraud detection',
        'Instant alerts for unusual activity',
        'Geographic location tracking',
        'Behavioral analysis patterns'
      ]
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Mobile Security',
      description: 'Our mobile app uses advanced security features to protect your banking on-the-go.',
      details: [
        'App-specific passwords',
        'Device registration and management',
        'Remote logout capabilities',
        'Secure push notifications'
      ]
    }
  ];

  const protections = [
    {
      title: 'FDIC Insurance',
      description: 'Your deposits are insured up to $250,000 per depositor, per bank.',
      icon: BanknotesIcon
    },
    {
      title: 'Zero Liability',
      description: 'You\'re not responsible for unauthorized transactions when reported promptly.',
      icon: CheckCircleIcon
    },
    {
      title: 'Identity Theft Protection',
      description: 'We monitor for identity theft and provide recovery assistance.',
      icon: UserIcon
    },
    {
      title: 'Secure Infrastructure',
      description: 'Our systems are hosted in secure, monitored data centers.',
      icon: ShieldCheckIcon
    }
  ];

  const securityTips = [
    'Never share your login credentials with anyone',
    'Always log out completely when finished banking',
    'Use strong, unique passwords for your accounts',
    'Enable two-factor authentication when available',
    'Keep your contact information up to date',
    'Monitor your accounts regularly for unauthorized activity',
    'Use secure networks for online banking, avoid public Wi-Fi',
    'Report suspicious activity immediately'
  ];

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
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheckIcon className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Your Security is Our Priority
              </h1>
              <p className="text-xl text-muted-foreground">
                Learn about the advanced security measures we use to protect your money and personal information.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Security Features */}
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
                Advanced Security Features
              </h2>
              <p className="text-xl text-muted-foreground">
                We use cutting-edge technology to keep your accounts safe
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {securityFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card variant="elevated" hover={true} className="h-full">
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <feature.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                      <ul className="space-y-2">
                        {feature.details.map((detail, i) => (
                          <li key={i} className="flex items-start space-x-2">
                            <CheckCircleIcon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-muted-foreground">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Protection Guarantees */}
        <section className="py-20 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Your Protection Guarantee
              </h2>
              <p className="text-xl text-muted-foreground">
                We stand behind our security with comprehensive protection
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {protections.map((protection, index) => (
                <motion.div
                  key={protection.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card variant="elevated" hover={true} className="h-full text-center">
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                        <protection.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {protection.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {protection.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Security Tips */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Security Best Practices
              </h2>
              <p className="text-xl text-muted-foreground">
                Follow these tips to keep your accounts secure
              </p>
            </motion.div>

            <Card variant="elevated" className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {securityTips.map((tip, index) => (
                  <motion.div
                    key={tip}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-3"
                  >
                    <CheckCircleIcon className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">{tip}</span>
                  </motion.div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* Warning Section */}
        <section className="py-20 bg-secondary/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card variant="elevated" className="bg-amber-50 border-amber-200 p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-amber-900">
                      Important Security Notice
                    </h3>
                    <div className="space-y-2 text-amber-800">
                      <p>
                        <strong>Dominion Trust Capital will never:</strong>
                      </p>
                      <ul className="list-disc pl-6 space-y-1">
                        <li>Ask for your password, PIN, or full account number via email or phone</li>
                        <li>Request sensitive information through unsecured channels</li>
                        <li>Ask you to transfer money to "verify" your account</li>
                        <li>Send you links to update your account information via email</li>
                      </ul>
                    </div>
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
                        Report Suspicious Activity
                      </Button>
                      <Button variant="outline" className="border-amber-300 text-amber-800 hover:bg-amber-100">
                        Learn About Scams
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card variant="gradient" className="p-12 text-white text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Questions About Security?
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  Our security experts are here to help you protect your accounts.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white !text-green-600 hover:bg-white/90"
                  >
                    Contact Security Team
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:!text-green-600"
                  >
                    Visit Help Center
                  </Button>
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

export default SecurityPage; 