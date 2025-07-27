'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  CalculatorIcon,
  ChartBarIcon,
  CheckIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const SavingsAccountsPage: React.FC = () => {
  const accountTypes = [
    {
      name: 'High-Yield Savings',
      apy: '2.50%',
      minBalance: '$0',
      description: 'Earn more on your savings with our competitive interest rate',
      features: [
        '2.50% APY on all balances',
        'No minimum balance required',
        'No monthly maintenance fees',
        'FDIC insured up to $250,000',
        'Free online and mobile banking',
        'Unlimited transfers to linked accounts'
      ],
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      popular: true
    },
    {
      name: 'Premium Savings',
      apy: '3.00%',
      minBalance: '$10,000',
      description: 'Higher rates for larger balances with premium features',
      features: [
        '3.00% APY with $10,000 minimum',
        'Relationship banking benefits',
        'Priority customer service',
        'Free wire transfers',
        'Quarterly bonus interest opportunities',
        'Dedicated account manager'
      ],
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      popular: false
    },
    {
      name: 'Goal Savings',
      apy: '2.25%',
      minBalance: '$100',
      description: 'Save for specific goals with automated tools',
      features: [
        '2.25% APY on goal savings',
        'Multiple savings goals',
        'Automated round-up transfers',
        'Goal tracking and insights',
        'Milestone rewards',
        'Flexible contribution scheduling'
      ],
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      popular: false
    }
  ];

  const benefits = [
    {
      icon: ArrowTrendingUpIcon,
      title: 'High Interest Rates',
      description: 'Earn up to 3.00% APY - significantly higher than traditional banks.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'FDIC Protected',
      description: 'Your savings are fully insured up to $250,000 per depositor.'
    },
    {
      icon: CalculatorIcon,
      title: 'Compound Interest',
      description: 'Watch your money grow with daily compounding interest.'
    },
    {
      icon: ChartBarIcon,
      title: 'Savings Insights',
      description: 'Track your progress with detailed savings analytics and projections.'
    },
    {
      icon: BanknotesIcon,
      title: 'No Hidden Fees',
      description: 'No maintenance fees, no minimums, no surprises - just great rates.'
    },
    {
      icon: StarIcon,
      title: 'Easy Access',
      description: 'Access your money anytime with our mobile app and online banking.'
    }
  ];

  const compoundCalculator = {
    initialDeposit: 5000,
    monthlyContribution: 200,
    interestRate: 2.5,
    timeYears: 5,
    finalAmount: 18500
  };

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
                High-Yield Savings
                <br />
                <span className="text-primary">Watch your money grow</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Earn up to 3.00% APY with our competitive savings accounts. 
                No fees, no minimums, just exceptional rates to help your money work harder.
              </p>
              <Button size="lg">
                Start Saving Today
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Interest Rate Highlight */}
        <section className="py-16 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Card variant="gradient" className="max-w-4xl mx-auto p-12 text-white">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-4xl font-bold text-white mb-2">3.00%</div>
                    <div className="text-white/80">APY Premium Savings</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white mb-2">2.50%</div>
                    <div className="text-white/80">APY High-Yield Savings</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white mb-2">12x</div>
                    <div className="text-white/80">Higher than national average</div>
                  </div>
                </div>
              </Card>
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
                Choose Your Savings Strategy
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Find the perfect savings account to match your financial goals and lifestyle.
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
                          <ArrowTrendingUpIcon className={`h-8 w-8 ${account.popular ? 'text-white' : account.color}`} />
                        </div>
                        <h3 className={`text-2xl font-bold mb-2 ${account.popular ? 'text-white' : 'text-foreground'}`}>
                          {account.name}
                        </h3>
                        <p className={`text-sm mb-4 ${account.popular ? 'text-white/90' : 'text-muted-foreground'}`}>
                          {account.description}
                        </p>
                        <div className="space-y-2">
                          <div className={`text-4xl font-bold ${account.popular ? 'text-white' : 'text-foreground'}`}>
                            {account.apy}
                          </div>
                          <div className={`text-sm ${account.popular ? 'text-white/80' : 'text-muted-foreground'}`}>
                            Annual Percentage Yield
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
                Why Save with DominionTrust?
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Experience the difference of high-yield savings with modern banking features.
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

        {/* Compound Interest Calculator */}
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
                See Your Savings Grow
              </h2>
              <p className="text-xl text-muted-foreground">
                Calculate how much you could earn with compound interest
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card variant="elevated" className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-6">Savings Calculator</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Initial Deposit
                      </label>
                      <div className="text-2xl font-bold text-foreground">
                        ${compoundCalculator.initialDeposit.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Monthly Contribution
                      </label>
                      <div className="text-2xl font-bold text-foreground">
                        ${compoundCalculator.monthlyContribution.toLocaleString()}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Interest Rate (APY)
                      </label>
                      <div className="text-2xl font-bold text-primary">
                        {compoundCalculator.interestRate}%
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Time Period
                      </label>
                      <div className="text-2xl font-bold text-foreground">
                        {compoundCalculator.timeYears} years
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card variant="gradient" className="p-8 text-white">
                  <div className="text-center space-y-6">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto">
                      <CalculatorIcon className="h-10 w-10 text-white" />
                    </div>
                    
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">
                        Future Value
                      </h3>
                      <div className="text-5xl font-bold text-white mb-2">
                        ${compoundCalculator.finalAmount.toLocaleString()}
                      </div>
                      <p className="text-white/80 text-sm">
                        Total earnings: ${(compoundCalculator.finalAmount - compoundCalculator.initialDeposit - (compoundCalculator.monthlyContribution * 12 * compoundCalculator.timeYears)).toLocaleString()} in interest
                      </p>
                    </div>
                    
                    <Button 
                      variant="secondary" 
                      size="lg" 
                      className="bg-white !text-green-600 hover:bg-white/90"
                    >
                      Open Savings Account
                    </Button>
                  </div>
                </Card>
              </motion.div>
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
                  Start earning more today
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Join thousands who are already earning higher returns with DominionTrust savings accounts.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white !text-green-600 hover:bg-white/90"
                  >
                    Open Savings Account
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:!text-green-600"
                  >
                    Calculate Earnings
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

export default SavingsAccountsPage; 