'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCardIcon,
  StarIcon,
  ShieldCheckIcon,
  GiftIcon,
  CheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const CreditCardsPage: React.FC = () => {
  const cards = [
    {
      name: 'Dominion Trust Capital Cashback',
      type: 'Cashback',
      annualFee: '$0',
      introAPR: '0% for 12 months',
      regularAPR: '15.99% - 25.99%',
      cashback: '2% on all purchases',
      features: [
        '2% cashback on all purchases',
        'No annual fee',
        '0% intro APR for 12 months',
        'No foreign transaction fees',
        'Contactless payments',
        'Extended warranty protection'
      ],
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      popular: true
    },
    {
      name: 'Dominion Trust Capital Travel',
      type: 'Travel Rewards',
      annualFee: '$95',
      introAPR: '0% for 15 months',
      regularAPR: '16.99% - 26.99%',
      cashback: '3X points on travel',
      features: [
        '3X points on travel and dining',
        '1X points on all other purchases',
        'Global entry/TSA PreCheck credit',
        'Travel insurance included',
        'No foreign transaction fees',
        'Priority boarding benefits'
      ],
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      popular: false
    },
    {
      name: 'Dominion Trust Capital Business',
      type: 'Business',
      annualFee: '$0',
      introAPR: '0% for 12 months',
      regularAPR: '15.99% - 24.99%',
      cashback: '1.5% on all purchases',
      features: [
        '1.5% cashback on all purchases',
        'No annual fee',
        'Expense tracking tools',
        'Employee cards at no cost',
        'QuickBooks integration',
        'Higher credit limits'
      ],
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      popular: false
    }
  ];

  const benefits = [
    {
      icon: GiftIcon,
      title: 'Reward Programs',
      description: 'Earn cashback and points on every purchase with our competitive reward programs.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Fraud Protection',
      description: 'Advanced security features and zero liability protection for unauthorized transactions.'
    },
    {
      icon: CreditCardIcon,
      title: 'Contactless Payments',
      description: 'Tap to pay with secure contactless technology for fast, convenient transactions.'
    },
    {
      icon: StarIcon,
      title: 'Premium Benefits',
      description: 'Enjoy exclusive perks like travel insurance, extended warranties, and purchase protection.'
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
                Credit Cards
                <br />
                <span className="text-primary">Designed for you</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                Discover credit cards that reward your spending with no annual fees, 
                competitive rates, and premium benefits.
              </p>
              <Button size="lg">
                Apply Now
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Credit Cards */}
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
                Find Your Perfect Card
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Choose from our selection of reward credit cards designed for different lifestyles.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {cards.map((card, index) => (
                <motion.div
                  key={card.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  {card.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                      <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <Card 
                    variant={card.popular ? "gradient" : "elevated"} 
                    hover={true}
                    className={`h-full ${card.popular ? 'text-white' : ''}`}
                  >
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className={`w-16 h-16 ${card.popular ? 'bg-white/20' : card.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                          <CreditCardIcon className={`h-8 w-8 ${card.popular ? 'text-white' : card.color}`} />
                        </div>
                        <h3 className={`text-2xl font-bold mb-2 ${card.popular ? 'text-white' : 'text-foreground'}`}>
                          {card.name}
                        </h3>
                        <p className={`text-sm mb-4 ${card.popular ? 'text-white/90' : 'text-muted-foreground'}`}>
                          {card.type}
                        </p>
                        
                        <div className="space-y-2">
                          <div className={`text-3xl font-bold ${card.popular ? 'text-white' : 'text-foreground'}`}>
                            {card.cashback}
                          </div>
                          <div className={`text-sm ${card.popular ? 'text-white/80' : 'text-muted-foreground'}`}>
                            {card.annualFee} annual fee
                          </div>
                          <div className={`text-sm ${card.popular ? 'text-white/80' : 'text-muted-foreground'}`}>
                            {card.introAPR}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {card.features.map((feature) => (
                          <div key={feature} className="flex items-start space-x-3">
                            <CheckIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${card.popular ? 'text-white' : 'text-primary'}`} />
                            <span className={`text-sm ${card.popular ? 'text-white/90' : 'text-muted-foreground'}`}>
                              {feature}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Button 
                        variant={card.popular ? "secondary" : "primary"}
                        size="lg" 
                        className={`w-full ${card.popular ? 'bg-white !text-green-600 hover:bg-white/90' : ''}`}
                      >
                        Apply for {card.name}
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
                Credit Card Benefits
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Enjoy premium features and protection with every Dominion Trust Capital credit card.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card variant="elevated" hover={true} className="h-full text-center">
                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
                        <benefit.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {benefit.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {benefit.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card variant="gradient" className="p-12 text-white">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to apply?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Get approved instantly and start earning rewards on your first purchase.
                </p>
                <Button
                  variant="secondary"
                  size="lg"
                  className="bg-white !text-green-600 hover:bg-white/90"
                >
                  Apply for Credit Card
                </Button>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default CreditCardsPage; 