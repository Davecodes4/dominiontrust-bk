'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheckIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';
import Button from '../ui/Button';

const Footer: React.FC = () => {
  const footerLinks = {
    banking: [
      { name: 'Checking Accounts', href: '/checking-accounts' },
      { name: 'Savings Accounts', href: '/savings-accounts' },
      { name: 'Credit Cards', href: '/credit-cards' },
      { name: 'Loans', href: '/loans' },
      { name: 'International Banking', href: '/international-banking' },
    ],
    resources: [
      { name: 'Help Center', href: '/help-center' },
      { name: 'Security', href: '/security' },
      { name: 'API Documentation', href: '/api-documentation' },
      { name: 'Mobile Apps', href: '/mobile-apps' },
      { name: 'Blog', href: '/blog' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Investors', href: '/investors' },
      { name: 'Contact', href: '/contact' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy-policy' },
      { name: 'Terms of Service', href: '/terms-of-service' },
      { name: 'Cookie Policy', href: '/cookie-policy' },
      { name: 'Accessibility', href: '/accessibility' },
      { name: 'Disclosures', href: '/disclosures' },
    ],
  };

  const socialLinks = [
    { name: 'Twitter', href: '#', icon: 'twitter' },
    { name: 'LinkedIn', href: '#', icon: 'linkedin' },
    { name: 'Facebook', href: '#', icon: 'facebook' },
    { name: 'Instagram', href: '#', icon: 'instagram' },
  ];

  return (
    <footer className="bg-secondary/50 border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Logo and Description */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <ShieldCheckIcon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold text-foreground">
                    Dominion<span className="text-primary">Trust</span>
                  </span>
                </div>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Modern banking designed for your life. Experience seamless financial 
                  management with no hidden fees and industry-leading security.
                </p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">1-800-DOMINION</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <EnvelopeIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">support@dominiontrustcapital.com</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPinIcon className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Available nationwide</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Banking Links */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-foreground font-semibold mb-4">Banking</h3>
                <ul className="space-y-2">
                  {footerLinks.banking.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Resources Links */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-foreground font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  {footerLinks.resources.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Company Links */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h3 className="text-foreground font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>

            {/* Legal Links */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <h3 className="text-foreground font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  {footerLinks.legal.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Newsletter Signup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="py-8 border-t border-border"
        >
          <div className="max-w-md mx-auto text-center">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Stay updated with Dominion Trust Capital
            </h3>
            <p className="text-muted-foreground mb-4">
              Get the latest news and updates about our banking services.
            </p>
            <div className="flex space-x-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button size="md">
                Subscribe
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center md:text-left"
            >
              <p className="text-muted-foreground text-sm">
                © 2025 Dominion Trust Capital. All rights reserved.
              </p>
              <p className="text-muted-foreground text-xs mt-1">
                Member FDIC. Equal Housing Lender.
              </p>
            </motion.div>

            {/* Trust Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex items-center space-x-6"
            >
              <div className="flex items-center space-x-2">
                <BanknotesIcon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">FDIC Insured</span>
              </div>
              <div className="flex items-center space-x-2">
                <ShieldCheckIcon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Bank-Level Security</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 