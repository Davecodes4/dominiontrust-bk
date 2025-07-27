'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon,
  BanknotesIcon,
  ChartBarIcon,
  TrophyIcon,
  ShieldCheckIcon,
  StarIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  PlusIcon,
  CurrencyDollarIcon,
  BuildingLibraryIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Link from 'next/link';

const BankingProducts: React.FC = () => {
  const accounts = [
    {
      name: "Premier Checking",
      type: "checking",
      featured: true,
      icon: BanknotesIcon,
      headline: "Banking without boundaries",
      description: "Experience premium banking with unlimited transactions, worldwide ATM access, and dedicated customer support.",
      rate: "0.50% APY",
      rateLabel: "Interest Rate",
      features: [
        "Unlimited check writing",
        "Free worldwide ATM access",
        "No minimum balance required",
        "Mobile check deposit",
        "Instant debit card",
        "24/7 premium support"
      ],
      benefits: [
        { icon: CurrencyDollarIcon, text: "No monthly fees" },
        { icon: ShieldCheckIcon, text: "FDIC insured up to $250,000" },
        { icon: BuildingLibraryIcon, text: "55,000+ fee-free ATMs" }
      ],
      ctaText: "Open Checking Account",
      ctaLink: "/accounts"
    },
    {
      name: "High-Yield Savings",
      type: "savings",
      featured: false,
      icon: ChartBarIcon,
      headline: "Grow your money faster",
      description: "Earn industry-leading interest rates with our high-yield savings account. Watch your money grow with compound interest.",
      rate: "4.75% APY",
      rateLabel: "Annual Percentage Yield",
      features: [
        "No minimum balance",
        "Compound interest daily",
        "6 free transfers per month",
        "Automatic savings tools",
        "Goal-based savings",
        "Round-up savings"
      ],
      benefits: [
        { icon: TrophyIcon, text: "Top-rated APY" },
        { icon: ChartBarIcon, text: "Automatic growth tracking" },
        { icon: LockClosedIcon, text: "Principal protected" }
      ],
      ctaText: "Start Saving Today",
      ctaLink: "/savings-accounts"
    }
  ];

  const creditCards = [
    {
      name: "Dominion Rewards Mastercard",
      type: "rewards",
      featured: true,
      headline: "Earn while you spend",
      description: "Get rewarded for every purchase with our premium rewards credit card. Earn points on everything you buy.",
      features: [
        "3% cash back on dining",
        "2% on groceries & gas",
        "1% on all other purchases",
        "No annual fee forever",
        "0% intro APR for 15 months",
        "No foreign transaction fees"
      ],
      benefits: [
        { icon: StarIcon, text: "Welcome bonus: $200 after spending $500" },
        { icon: ShieldCheckIcon, text: "Zero liability fraud protection" },
        { icon: CreditCardIcon, text: "Contactless payments" }
      ],
      ctaText: "Apply for Card",
      ctaLink: "/credit-cards"
    },
    {
      name: "Dominion Business Card",
      type: "business",
      featured: false,
      headline: "Built for business success",
      description: "Simplify business expenses with detailed reporting, employee cards, and exclusive business rewards.",
      features: [
        "5% back on office supplies",
        "3% on business services",
        "1% on all purchases",
        "Employee card management",
        "Expense categorization",
        "QuickBooks integration"
      ],
      benefits: [
        { icon: BuildingLibraryIcon, text: "Business credit building" },
        { icon: ChartBarIcon, text: "Detailed expense reports" },
        { icon: TrophyIcon, text: "Business rewards program" }
      ],
      ctaText: "Apply for Business Card",
      ctaLink: "/credit-cards"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banking Accounts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Banking Accounts That 
            <span className="text-primary"> Work Harder</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose from our premium banking accounts designed to help you save more, spend smarter, 
            and achieve your financial goals faster.
          </p>
        </motion.div>

        {/* Accounts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {accounts.map((account, index) => (
            <motion.div
              key={account.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {account.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <Card
                variant={account.featured ? "elevated" : "default"}
                className={`h-full ${account.featured ? 'ring-2 ring-primary/20 border-primary/30' : ''}`}
              >
                <div className="space-y-6">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${account.featured ? 'bg-primary/20' : 'bg-secondary'} rounded-lg flex items-center justify-center`}>
                        <account.icon className={`h-6 w-6 ${account.featured ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-foreground">{account.name}</h3>
                        <p className="text-sm text-muted-foreground">{account.headline}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{account.rate}</div>
                      <div className="text-xs text-muted-foreground">{account.rateLabel}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground">{account.description}</p>

                  {/* Features */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Key Features:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {account.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3">
                    {account.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
                        <benefit.icon className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium text-foreground">{benefit.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link href={account.ctaLink}>
                    <Button 
                      variant={account.featured ? "primary" : "outline"}
                      className="w-full flex items-center justify-center space-x-2"
                      size="lg"
                    >
                      <span>{account.ctaText}</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Credit Cards Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Credit Cards That 
            <span className="text-primary"> Reward You</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Earn rewards on every purchase with our premium credit cards. No annual fees, 
            competitive rates, and exclusive benefits.
          </p>
        </motion.div>

        {/* Credit Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {creditCards.map((card, index) => (
            <motion.div
              key={card.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {card.featured && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Best Value
                  </span>
                </div>
              )}
              
              <Card
                variant={card.featured ? "elevated" : "default"}
                className={`h-full ${card.featured ? 'ring-2 ring-yellow-400/20 border-yellow-400/30' : ''}`}
              >
                <div className="space-y-6">
                  {/* Header with Card Visual */}
                  <div className="relative">
                    <div className={`w-full h-32 ${card.featured ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gradient-to-r from-gray-600 to-gray-800'} rounded-lg p-4 text-white`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm opacity-80">Dominion Trust Capital</div>
                          <div className="text-lg font-bold mt-2">{card.name}</div>
                        </div>
                        <CreditCardIcon className="h-8 w-8 opacity-80" />
                      </div>
                      <div className="mt-4 text-sm opacity-80">•••• •••• •••• 1234</div>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-2">{card.headline}</h3>
                    <p className="text-muted-foreground">{card.description}</p>
                  </div>

                  {/* Features */}
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Rewards & Benefits:</h4>
                    <div className="space-y-2">
                      {card.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <StarIcon className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Benefits */}
                  <div className="space-y-3">
                    {card.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center space-x-3 p-3 bg-secondary/50 rounded-lg">
                        <benefit.icon className="h-5 w-5 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium text-foreground">{benefit.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link href={card.ctaLink}>
                    <Button 
                      variant={card.featured ? "primary" : "outline"}
                      className="w-full flex items-center justify-center space-x-2"
                      size="lg"
                    >
                      <span>{card.ctaText}</span>
                      <ArrowRightIcon className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Card variant="gradient" className="max-w-4xl mx-auto">
            <div className="text-center space-y-6">
              <h3 className="text-3xl font-bold text-white">
                Ready to switch to better banking?
              </h3>
              <p className="text-xl text-white/90 max-w-2xl mx-auto">
                Join over 100,000 customers who've already discovered the Dominion Trust Capital difference. 
                Open your account today and start earning more.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                <Link href="/signup">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white !text-primary hover:bg-white/90"
                  >
                    Open Account in 5 Minutes
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:!text-primary"
                  >
                    Speak with an Expert
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default BankingProducts;
