'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon,
  BanknotesIcon,
  UserGroupIcon,
  ChartBarIcon,
  HeartIcon,
  GlobeAmericasIcon,
  ArrowLeftIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const AboutPage: React.FC = () => {
  const stats = [
    { value: '50,000+', label: 'Happy Customers', icon: UserGroupIcon },
    { value: '$2B+', label: 'Assets Protected', icon: BanknotesIcon },
    { value: '99.9%', label: 'Uptime Guarantee', icon: ShieldCheckIcon },
    { value: '24/7', label: 'Customer Support', icon: HeartIcon }
  ];

  const values = [
    {
      icon: ShieldCheckIcon,
      title: 'Security First',
      description: 'Your financial security is our top priority. We use bank-level encryption and fraud monitoring to keep your money safe.',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: UserGroupIcon,
      title: 'Customer Focused',
      description: 'Every decision we make puts our customers first. We listen, we care, and we deliver exceptional banking experiences.',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: ChartBarIcon,
      title: 'Innovation Driven',
      description: 'We embrace technology to make banking simple, fast, and accessible for everyone, everywhere.',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: GlobeAmericasIcon,
      title: 'Global Reach',
      description: 'From local communities to international markets, we connect you to opportunities worldwide.',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ];

  const timeline = [
    {
      year: '2020',
      title: 'Foundation',
      description: 'Dominion Trust Capital was founded with a mission to revolutionize digital banking.'
    },
    {
      year: '2021',
      title: 'First 10,000 Customers',
      description: 'Reached our first major milestone with 10,000 satisfied customers.'
    },
    {
      year: '2022',
      title: 'International Expansion',
      description: 'Launched international transfers and multi-currency support.'
    },
    {
      year: '2023',
      title: 'Mobile Innovation',
      description: 'Released award-winning mobile app with biometric security.'
    },
    {
      year: '2025',
      title: 'AI-Powered Banking',
      description: 'Introduced AI-powered financial insights and fraud detection.'
    }
  ];

  const features = [
    'FDIC Insured up to $250,000',
    'No monthly maintenance fees',
    'Free domestic transfers',
    'Real-time transaction notifications',
    'Mobile check deposits',
    '24/7 customer support',
    'Advanced security features',
    'International banking',
    'High-yield savings accounts',
    'Digital-first experience'
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
                Banking built for
                <br />
                <span className="text-primary">the modern world</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
                We're on a mission to make banking simple, secure, and accessible for everyone. 
                Join thousands who've already discovered a better way to manage their money.
              </p>
              <Button size="lg">
                Open Your Account Today
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Our Mission
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  At Dominion Trust Capital, we believe banking should be transparent, accessible, and 
                  built around your needs. We're committed to providing innovative financial 
                  solutions that help you achieve your goals.
                </p>
                <p className="text-lg text-muted-foreground mb-8">
                  From the moment you open your account to every transaction you make, 
                  we're here to support your financial journey with cutting-edge technology 
                  and unparalleled security.
                </p>
                <Button variant="outline" size="lg">
                  Learn More About Our Services
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="relative"
              >
                <Card variant="gradient" className="p-8 text-white">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <BanknotesIcon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-2">$0 Monthly Fees</h3>
                      <p className="text-white/90">No hidden charges, ever</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-white">2.5%</div>
                        <div className="text-sm text-white/80">APY on Savings</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-white">Instant</div>
                        <div className="text-sm text-white/80">Transfers</div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
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
                Our Values
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                These core principles guide everything we do and shape the way we serve our customers.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card variant="elevated" hover={true} className="h-full">
                    <div className="space-y-4">
                      <div className={`w-12 h-12 ${value.bgColor} rounded-lg flex items-center justify-center`}>
                        <value.icon className={`h-6 w-6 ${value.color}`} />
                      </div>
                      <h3 className="text-xl font-semibold text-foreground">
                        {value.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {value.description}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
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
                Our Journey
              </h2>
              <p className="text-xl text-muted-foreground">
                From startup to trusted financial partner
              </p>
            </motion.div>

            <div className="space-y-8">
              {timeline.map((item, index) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-6"
                >
                  <div className="flex-shrink-0 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">{item.year}</span>
                  </div>
                  <Card variant="elevated" className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {item.description}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
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
                Why Choose Dominion Trust Capital?
              </h2>
              <p className="text-xl text-muted-foreground">
                Everything you need in a modern banking experience
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center space-x-3 p-4 rounded-lg bg-card hover:bg-card/80 transition-colors"
                >
                  <CheckIcon className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
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
                  Ready to join the future of banking?
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                  Open your Dominion Trust Capital account today and experience banking 
                  that works for you, not against you.
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
                    Contact Sales
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

export default AboutPage; 