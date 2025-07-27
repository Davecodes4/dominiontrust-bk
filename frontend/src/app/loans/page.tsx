'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HomeIcon,
  TruckIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ShieldCheckIcon,
  CalculatorIcon,
  DocumentTextIcon,
  PhoneIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const Loans = () => {
  const [loanAmount, setLoanAmount] = useState('250000');
  const [loanTerm, setLoanTerm] = useState('30');

  const loanTypes = [
    {
      icon: HomeIcon,
      title: 'Home Loans',
      description: 'Competitive rates for purchasing or refinancing your home',
      rate: '6.25%',
      features: [
        'Fixed and adjustable rates',
        'First-time buyer programs',
        'Jumbo loan options',
        'No PMI options available'
      ],
      color: 'from-blue-500 to-indigo-600',
      popular: true
    },
    {
      icon: TruckIcon,
      title: 'Auto Loans',
      description: 'Finance your new or used vehicle with great rates',
      rate: '4.99%',
      features: [
        'New and used car financing',
        'Quick approval process',
        'Flexible payment terms',
        'Pre-approval available'
      ],
      color: 'from-green-500 to-emerald-600',
      popular: false
    },
    {
      icon: AcademicCapIcon,
      title: 'Student Loans',
      description: 'Invest in your education with affordable student loans',
      rate: '5.50%',
      features: [
        'Undergraduate and graduate loans',
        'Flexible repayment options',
        'No origination fees',
        'Interest rate discounts'
      ],
      color: 'from-purple-500 to-pink-600',
      popular: false
    },
    {
      icon: BuildingOfficeIcon,
      title: 'Business Loans',
      description: 'Grow your business with flexible commercial financing',
      rate: '7.25%',
      features: [
        'Working capital loans',
        'Equipment financing',
        'SBA loan programs',
        'Commercial real estate'
      ],
      color: 'from-orange-500 to-red-600',
      popular: false
    }
  ];

  const benefits = [
    {
      icon: ClockIcon,
      title: 'Quick Approval',
      description: 'Get pre-approved in minutes with our streamlined application process'
    },
    {
      icon: CurrencyDollarIcon,
      title: 'Competitive Rates',
      description: 'Enjoy some of the most competitive interest rates in the market'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Flexible Terms',
      description: 'Choose from various loan terms that fit your budget and timeline'
    },
    {
      icon: UserGroupIcon,
      title: 'Expert Support',
      description: 'Work with experienced loan specialists throughout the process'
    }
  ];

  const loanProcess = [
    {
      step: 1,
      title: 'Apply Online',
      description: 'Complete our secure online application in minutes'
    },
    {
      step: 2,
      title: 'Get Pre-Approved',
      description: 'Receive instant pre-approval decision and rate quote'
    },
    {
      step: 3,
      title: 'Submit Documents',
      description: 'Upload required documents through our secure portal'
    },
    {
      step: 4,
      title: 'Final Approval',
      description: 'Get final approval and schedule your closing'
    },
    {
      step: 5,
      title: 'Fund Your Loan',
      description: 'Receive your funds and start your journey'
    }
  ];

  const calculateMonthlyPayment = () => {
    const principal = parseFloat(loanAmount);
    const rate = 6.25 / 100 / 12; // Monthly interest rate
    const payments = parseFloat(loanTerm) * 12; // Total number of payments
    
    const monthlyPayment = (principal * rate * Math.pow(1 + rate, payments)) / (Math.pow(1 + rate, payments) - 1);
    return monthlyPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 via-blue-500/5 to-purple-500/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
                  Loans to Help You <span className="text-primary">Achieve More</span>
                </h1>
                <p className="text-xl text-muted-foreground mb-8">
                  Whether you're buying a home, car, funding education, or growing your business, 
                  we have competitive loan options to meet your needs.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg">
                    Apply Now
                  </Button>
                  <Button variant="outline" size="lg">
                    Check Rates
                  </Button>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-6 mt-12">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">4.99%</div>
                    <div className="text-sm text-muted-foreground">Starting APR</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">24hrs</div>
                    <div className="text-sm text-muted-foreground">Quick Approval</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">$1M+</div>
                    <div className="text-sm text-muted-foreground">Loan Amounts</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <Card className="p-8 bg-gradient-to-br from-primary/10 to-blue-500/10 border-primary/20">
                  <div className="flex items-center justify-center w-20 h-20 bg-primary rounded-full mx-auto mb-6">
                    <CalculatorIcon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-center text-foreground mb-6">
                    Loan Calculator
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Loan Amount
                      </label>
                      <input
                        type="text"
                        value={`$${parseInt(loanAmount).toLocaleString()}`}
                        onChange={(e) => setLoanAmount(e.target.value.replace(/[$,]/g, ''))}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Loan Term (Years)
                      </label>
                      <select
                        value={loanTerm}
                        onChange={(e) => setLoanTerm(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                      >
                        <option value="15">15 years</option>
                        <option value="20">20 years</option>
                        <option value="25">25 years</option>
                        <option value="30">30 years</option>
                      </select>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Monthly Payment:</span>
                        <span className="text-primary">{calculateMonthlyPayment()}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Loan Types */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Find the Perfect <span className="text-primary">Loan</span> for You
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our comprehensive range of loan products designed to meet your specific needs
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {loanTypes.map((loan, index) => (
                <motion.div
                  key={loan.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 * index }}
                  className="relative"
                >
                  {loan.popular && (
                    <div className="absolute -top-4 left-6 z-10">
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <Card className={`p-6 h-full ${loan.popular ? 'border-primary shadow-lg' : ''} hover:shadow-lg transition-all duration-300`}>
                    <div className={`w-16 h-16 bg-gradient-to-r ${loan.color} rounded-full flex items-center justify-center mb-6`}>
                      <loan.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-2">
                          {loan.title}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {loan.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {loan.rate}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Starting APR
                        </div>
                      </div>
                    </div>

                    <ul className="space-y-2 mb-6">
                      {loan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm">
                          <CheckCircleIcon className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className="w-full" 
                      variant={loan.popular ? 'primary' : 'outline'}
                    >
                      Learn More
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Why Choose <span className="text-primary">Dominion Trust Capital</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Experience the benefits of working with a trusted lending partner
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.1 * index }}
                >
                  <Card className="p-6 text-center h-full hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-3">
                      {benefit.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {benefit.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Loan Process */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Simple <span className="text-primary">Application Process</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get your loan approved in 5 easy steps
              </p>
            </motion.div>

            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-12 left-0 w-full h-0.5 bg-border hidden lg:block">
                <div className="h-full bg-primary w-4/5"></div>
              </div>

              <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
                {loanProcess.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1 * index }}
                    className="text-center relative"
                  >
                    <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 relative z-10">
                      <span className="text-2xl font-bold text-white">{step.step}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Requirements */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  What You'll <span className="text-primary">Need</span>
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Prepare these documents to speed up your application process
                </p>
                
                <div className="space-y-4">
                  {[
                    'Valid government-issued ID',
                    'Proof of income (pay stubs, tax returns)',
                    'Bank statements (last 2-3 months)',
                    'Employment verification',
                    'Credit history and score',
                    'Property information (for home loans)',
                    'Down payment documentation',
                    'Insurance information'
                  ].map((requirement, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <DocumentTextIcon className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-foreground">{requirement}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="p-8 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200/50">
                  <div className="flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mx-auto mb-6">
                    <PhoneIcon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-center text-foreground mb-4">
                    Need Help?
                  </h3>
                  <p className="text-center text-muted-foreground mb-6">
                    Our loan specialists are here to guide you through the application process
                  </p>
                  
                  <div className="space-y-4">
                    <Button className="w-full">
                      Call (800) DOMINION
                    </Button>
                    <Button variant="outline" className="w-full">
                      Schedule Consultation
                    </Button>
                    <Button variant="ghost" className="w-full">
                      Live Chat Support
                    </Button>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="p-12 bg-gradient-to-br from-primary/10 via-blue-500/5 to-purple-500/10 border-primary/20">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Ready to Get <span className="text-primary">Started</span>?
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Apply for your loan today and take the next step toward achieving your goals.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg">
                    Apply Now
                  </Button>
                  <Button variant="outline" size="lg">
                    Get Pre-Approved
                  </Button>
                </div>
                
                <div className="mt-8 text-sm text-muted-foreground">
                  <p>
                    Equal Housing Lender • Member FDIC • Contact us at support@dominiontrustcapital.com
                  </p>
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

export default Loans;
