'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheckIcon, EyeSlashIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const PrivacyPolicyPage: React.FC = () => {
  const lastUpdated = 'December 15, 2025';

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
                Privacy Policy
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                Your privacy is our priority. Learn how we protect and use your information.
              </p>
              <p className="text-sm text-muted-foreground">
                Last updated: {lastUpdated}
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">1. Information We Collect</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We collect information you provide directly to us, such as when you create an account, 
                    make a transaction, or contact our customer service. This includes:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Personal identification information (name, address, phone number, email)</li>
                    <li>Financial information (account numbers, transaction history, income)</li>
                    <li>Government-issued identification numbers (Social Security number, driver's license)</li>
                    <li>Employment information for account verification</li>
                    <li>Device information and usage data when you use our services</li>
                  </ul>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">2. How We Use Your Information</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>We use the information we collect to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide, maintain, and improve our banking services</li>
                    <li>Process transactions and send related information</li>
                    <li>Verify your identity and prevent fraud</li>
                    <li>Comply with legal and regulatory requirements</li>
                    <li>Communicate with you about your account and our services</li>
                    <li>Develop new products and services</li>
                  </ul>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">3. Information Sharing</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We do not sell, trade, or otherwise transfer your personal information to outside parties 
                    except as described in this policy. We may share your information in the following circumstances:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>With service providers who perform services on our behalf</li>
                    <li>For legal compliance and law enforcement purposes</li>
                    <li>To protect our rights, privacy, safety, or property</li>
                    <li>In connection with a merger, acquisition, or sale of assets</li>
                    <li>With your consent or at your direction</li>
                  </ul>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">4. Data Security</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We implement appropriate security measures to protect your personal information against 
                    unauthorized access, alteration, disclosure, or destruction:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>256-bit SSL encryption for all data transmissions</li>
                    <li>Multi-factor authentication for account access</li>
                    <li>Regular security assessments and monitoring</li>
                    <li>Secure data centers with restricted access</li>
                    <li>Employee training on data privacy and security</li>
                  </ul>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">5. Your Rights</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Access the personal information we hold about you</li>
                    <li>Request correction of inaccurate or incomplete information</li>
                    <li>Request deletion of your personal information (subject to legal requirements)</li>
                    <li>Opt-out of certain communications</li>
                    <li>Request a copy of your personal information</li>
                    <li>File a complaint with relevant authorities</li>
                  </ul>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">6. Cookies and Tracking</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We use cookies and similar tracking technologies to enhance your experience on our website 
                    and mobile applications. These technologies help us:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Remember your preferences and settings</li>
                    <li>Analyze website usage and performance</li>
                    <li>Provide personalized content and advertisements</li>
                    <li>Detect and prevent fraud</li>
                  </ul>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">7. Third-Party Services</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Our services may contain links to third-party websites or integrate with third-party services. 
                    We are not responsible for the privacy practices of these third parties. We encourage you to 
                    review their privacy policies before providing any personal information.
                  </p>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">8. Data Retention</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We retain your personal information for as long as necessary to provide our services and 
                    comply with legal obligations. Specific retention periods depend on the type of information 
                    and the purpose for which it was collected.
                  </p>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">9. International Transfers</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    If you are located outside the United States, your information may be transferred to and 
                    processed in the United States. We ensure appropriate safeguards are in place to protect 
                    your information in accordance with applicable laws.
                  </p>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">10. Changes to This Policy</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We may update this privacy policy from time to time. We will notify you of any material 
                    changes by posting the new policy on our website and updating the "last updated" date. 
                    We encourage you to review this policy periodically.
                  </p>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">11. Contact Us</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    If you have any questions about this privacy policy or our privacy practices, please contact us:
                  </p>
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <p><strong>Email:</strong> privacy@dominiontrustcapital.com</p>
                    <p><strong>Phone:</strong> 1-800-DOMINION</p>
                    <p><strong>Mail:</strong> Dominion Trust Capital, Privacy Department, 123 Banking Street, Financial District, NY 10001</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 bg-secondary/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card variant="elevated" className="text-center">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <ShieldCheckIcon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Bank-Level Security</h3>
                    <p className="text-sm text-muted-foreground">
                      Your data is protected with the same security standards used by major banks.
                    </p>
                  </div>
                </Card>
                
                <Card variant="elevated" className="text-center">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <EyeSlashIcon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Privacy First</h3>
                    <p className="text-sm text-muted-foreground">
                      We never sell your personal information to third parties.
                    </p>
                  </div>
                </Card>
                
                <Card variant="elevated" className="text-center">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <LockClosedIcon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">Your Control</h3>
                    <p className="text-sm text-muted-foreground">
                      You have full control over your personal information and privacy settings.
                    </p>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage; 