'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  CheckIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const CheckingAccountsPage: React.FC = () => {
  const accountTypes = [
    {
      name: 'Essential Checking',
      monthlyFee: '$0',
      minBalance: '$0',
      description: 'Perfect for everyday banking with no monthly fees',
      features: [
        'No monthly maintenance fee',
        'Free online and mobile banking',
        'Free debit card',
        'ATM fee reimbursement up to $10/month',
        'Mobile check deposit',
        'Overdraft protection available'
      ],
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      popular: false
    },
    {
      name: 'Premium Checking',
      monthlyFee: '$0',
      minBalance: '$2,500',
      description: 'Enhanced features for active banking customers',
      features: [
        'All Essential Checking features',
        'Unlimited ATM fee reimbursement',
        'Free wire transfers (domestic)',
        'Free cashier\'s checks',
        'Priority customer service',
        'Higher daily limits',
        'Free safe deposit box'
      ],
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      popular: true
    },
    {
      name: 'Business Checking',
      monthlyFee: '$0',
      minBalance: '$1,000',
      description: 'Tailored for small business banking needs',
      features: [
        'No monthly fee with minimum balance',
        'Free business debit card',
        'Online banking with business tools',
        'Free mobile deposits',
        'Integration with accounting software',
        'Business customer support',
        'Merchant services available'
      ],
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      popular: false
    }
  ];

  const benefits = [
    {
      icon: ClockIcon,
      title: '24/7 Online Banking',
      description: 'Access your account anytime, anywhere with our secure online and mobile banking platform.'
    },
    {
      icon: CreditCardIcon,
      title: 'Free Debit Card',
      description: 'Get a free contactless debit card with every checking account, accepted worldwide.'
    },
    {
      icon: DevicePhoneMobileIcon,
      title: 'Mobile Deposits',
      description: 'Deposit checks instantly using your smartphone camera - no need to visit a branch.'
    },
    {
      icon: BanknotesIcon,
      title: 'ATM Network',
      description: 'Access over 55,000 ATMs nationwide with fee reimbursement options.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Fraud Protection',
      description: 'Advanced security features and real-time fraud monitoring protect your account.'
    },
    {
      icon: StarIcon,
      title: 'Overdraft Protection',
      description: 'Link your savings account to avoid overdraft fees and declined transactions.'
    }
  ];

  const faqs = [
    {
      question: 'Are there any monthly fees?',
      answer: 'Our Essential Checking account has no monthly maintenance fee. Premium Checking is also free with a $2,500 minimum balance.'
    },
    {
      question: 'How do I open a checking account?',
      answer: 'You can open an account online in just 5 minutes. You\'ll need a valid ID, Social Security number, and initial deposit.'
    },
    {
      question: 'What ATMs can I use?',
      answer: 'You can use any ATM in our network of 55,000+ locations. We also reimburse ATM fees up to $10-15 per month depending on your account type.'
    },
    {
      question: 'Is my money insured?',
      answer: 'Yes, all deposits are FDIC insured up to $250,000 per depositor, per bank, per ownership category.'
    },
    {
      question: 'Can I set up direct deposit?',
      answer: 'Absolutely! Direct deposit is free and available for all checking accounts. You can set it up through online banking or by providing your employer with our routing and account numbers.'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 hero-bg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Checking Accounts
                <br />
                <span className="text-primary">Built for your life</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Experience hassle-free banking with our checking accounts designed for modern life. 
                No monthly fees, advanced security, and all the features you need.
              </p>
              <Button size="lg">
                Open Account Today
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Account Types */}
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
                Choose Your Perfect Account
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Whether you're just starting out or managing complex finances, we have the right checking account for you.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {accountTypes.map((account, index) => (
                <motion.div
                  key={account.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {account.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <Card 
                    variant={account.popular ? "gradient" : "elevated"} 
                    hover={true}
                    className={`h-full ${account.popular ? 'text-white' : ''}`}
                  >
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className={`w-16 h-16 ${account.popular ? 'bg-white/20' : account.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                          <CreditCardIcon className={`h-8 w-8 ${account.popular ? 'text-white' : account.color}`} />
                        </div>
                        <h3 className={`text-2xl font-bold mb-2 ${account.popular ? 'text-white' : 'text-foreground'}`}>
                          {account.name}
                        </h3>
                        <p className={`text-sm mb-4 ${account.popular ? 'text-white/90' : 'text-muted-foreground'}`}>
                          {account.description}
                        </p>
                        <div className="space-y-2">
                          <div className={`text-3xl font-bold ${account.popular ? 'text-white' : 'text-foreground'}`}>
                            {account.monthlyFee}
                          </div>
                          <div className={`text-sm ${account.popular ? 'text-white/80' : 'text-muted-foreground'}`}>
                            Monthly Fee
                          </div>
                          <div className={`text-sm ${account.popular ? 'text-white/80' : 'text-muted-foreground'}`}>
                            {account.minBalance} minimum balance
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {account.features.map((feature) => (
                          <div key={feature} className="flex items-start space-x-3">
                            <CheckIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${account.popular ? 'text-white' : 'text-primary'}`} />
                            <span className={`text-sm ${account.popular ? 'text-white/90' : 'text-muted-foreground'}`}>
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Button 
                        variant={account.popular ? "secondary" : "primary"}
                        size="lg" 
                        className={`w-full ${account.popular ? 'bg-white !text-green-600 hover:bg-white/90' : ''}`}
                      >
                        Open {account.name}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
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
                Why Choose Dominion Trust Capital Checking?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Get more from your checking account with features designed for modern banking.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card variant="elevated" hover={true} className="h-full">
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {benefit.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
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
                Frequently Asked Questions
              </h2>
            </motion.div>

            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq.question}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card variant="elevated">
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {faq.question}
                      </h3>
                      <p className="text-muted-foreground">
                        {faq.answer}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-secondary/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card variant="gradient" className="p-12 text-white">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to start banking better?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Open your Dominion Trust Capital checking account today and experience 
                  the difference of fee-free banking.
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
                    Compare Accounts
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

export default CheckingAccountsPage; 