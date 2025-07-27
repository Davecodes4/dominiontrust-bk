'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon, 
  BanknotesIcon, 
  ChartBarIcon,
  ClockIcon,
  StarIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';
import Card from '../ui/Card';

const Hero: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center hero-bg pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2"
            >
              <StarIcon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                FDIC Insured • Award-Winning Mobile App • 4.75% APY Savings
              </span>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-4"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                The bank that
                <br />
                <span className="text-primary">rewards your trust</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-lg">
                Experience premium banking with industry-leading interest rates, no hidden fees, 
                and award-winning customer service. Over 100,000 customers trust us with their financial future.
              </p>
            </motion.div>

            {/* Key Benefits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            >
              <div className="flex items-center space-x-2">
                <BanknotesIcon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">No Monthly Fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">4.75% APY Savings</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">FDIC Insured</span>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <a href="/signup">
                <Button size="lg" className="flex items-center space-x-2 w-full sm:w-auto">
                  <span>Open Account Today</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </Button>
              </a>
              <a href="/accounts">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Compare Accounts
                </Button>
              </a>
            </motion.div>
          </motion.div>

          {/* Right Column - Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10">
              {/* Main Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="float-animation"
              >
                <Card
                  variant="elevated"
                  className="bg-card/90 backdrop-blur-sm border-white/10 shadow-2xl max-w-sm mx-auto"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Available Balance</p>
                        <p className="text-2xl font-bold text-foreground">$24,847.32</p>
                        <p className="text-sm text-green-600 font-medium">+$1,247 this month</p>
                      </div>
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <BanknotesIcon className="h-6 w-6 text-primary" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <ArrowRightIcon className="h-4 w-4 text-white rotate-180" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Payroll Deposit</p>
                            <p className="text-sm text-muted-foreground">Tech Corp • Today</p>
                          </div>
                        </div>
                        <p className="font-bold text-green-600">+$3,200.00</p>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <ChartBarIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Interest Earned</p>
                            <p className="text-sm text-muted-foreground">High-Yield Savings</p>
                          </div>
                        </div>
                        <p className="font-bold text-blue-500">+$94.73</p>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                            <StarIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Rewards Earned</p>
                            <p className="text-sm text-muted-foreground">Cashback Card</p>
                          </div>
                        </div>
                        <p className="font-bold text-purple-500">+$47.25</p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Credit Score</span>
                        <span className="font-bold text-green-600">Excellent (785)</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Floating Feature Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="absolute -top-4 -right-4 z-20"
              >
                <Card
                  variant="glass"
                  padding="sm"
                  className="flex items-center space-x-2 backdrop-blur-md"
                >
                  <ShieldCheckIcon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Bank-Level Security</span>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute -bottom-4 -left-4 z-20"
              >
                <Card
                  variant="glass"
                  padding="sm"
                  className="flex items-center space-x-2 backdrop-blur-md"
                >
                  <ClockIcon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">Instant Transfers</span>
                </Card>
              </motion.div>
            </div>

            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-blue-500/10 to-purple-500/20 rounded-3xl blur-3xl transform -rotate-6 scale-110" />
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center"
        >
          <div className="w-1 h-3 bg-muted-foreground rounded-full mt-2" />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero; 