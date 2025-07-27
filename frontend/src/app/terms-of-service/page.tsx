'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DocumentTextIcon, ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Card from '../../components/ui/Card';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const TermsOfServicePage: React.FC = () => {
  const lastUpdated = 'December 15, 2025';
  const effectiveDate = 'January 1, 2025';

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
                <DocumentTextIcon className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Terms of Service
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                Please read these terms carefully before using our banking services.
              </p>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 justify-center text-sm text-muted-foreground">
                <span>Last updated: {lastUpdated}</span>
                <span>Effective: {effectiveDate}</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Important Notice */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card variant="elevated" className="bg-amber-50 border-amber-200 p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-amber-900">
                      Important Legal Notice
                    </h3>
                    <p className="text-amber-800 text-sm">
                      By using Dominion Trust Capital banking services, you agree to these terms. 
                      If you do not agree with any part of these terms, please do not use our services.
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">1. Acceptance of Terms</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    These Terms of Service ("Terms") govern your use of Dominion Trust Capital's services, 
                    including our website, mobile applications, and all banking products and services 
                    (collectively, the "Services").
                  </p>
                  <p>
                    By accessing or using our Services, you agree to be bound by these Terms and all 
                    applicable laws and regulations. These Terms constitute a legally binding agreement 
                    between you and Dominion Trust Capital.
                  </p>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">2. Account Opening and Eligibility</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>To open an account with Dominion Trust Capital, you must:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Be at least 18 years of age</li>
                    <li>Be a U.S. citizen or permanent resident</li>
                    <li>Provide valid identification and verification documents</li>
                    <li>Meet our account opening requirements and minimum deposit amounts</li>
                    <li>Not be listed on any prohibited person lists</li>
                  </ul>
                  <p>
                    We reserve the right to refuse service to anyone at our sole discretion. 
                    All applications are subject to verification and approval.
                  </p>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">3. Account Responsibilities</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>You are responsible for:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Maintaining the confidentiality of your account information</li>
                    <li>Notifying us immediately of any unauthorized access or suspicious activity</li>
                    <li>Providing accurate and current information</li>
                    <li>Complying with all applicable laws and regulations</li>
                    <li>Maintaining sufficient funds for transactions and fees</li>
                  </ul>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">4. Online and Mobile Banking</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Our online and mobile banking services are provided for your convenience. 
                    You agree to use these services only for lawful purposes and in accordance 
                    with these Terms.
                  </p>
                  <p>
                    You are responsible for ensuring the security of your device and internet 
                    connection. We recommend using secure networks and keeping your login 
                    credentials confidential.
                  </p>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">5. Fees and Charges</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Fee schedules are provided separately and may be updated from time to time. 
                    Common fees include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Monthly maintenance fees (where applicable)</li>
                    <li>Overdraft fees</li>
                    <li>Wire transfer fees</li>
                    <li>ATM fees for out-of-network usage</li>
                    <li>Stop payment fees</li>
                  </ul>
                  <p>
                    We will provide 30 days' notice for any fee changes that affect your account.
                  </p>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">6. Electronic Communications</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    By using our Services, you consent to receive electronic communications from us. 
                    These communications may include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Account statements and notices</li>
                    <li>Privacy policy updates</li>
                    <li>Marketing communications (with your consent)</li>
                    <li>Service announcements</li>
                  </ul>
                  <p>
                    You can opt out of marketing communications at any time through your account 
                    settings or by contacting customer service.
                  </p>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">7. Privacy and Data Protection</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Your privacy is important to us. Please review our Privacy Policy to understand 
                    how we collect, use, and protect your personal information.
                  </p>
                  <p>
                    We implement appropriate security measures to protect your data, but you also 
                    play a role in maintaining the security of your account information.
                  </p>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">8. Limitation of Liability</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    To the fullest extent permitted by law, Dominion Trust Capital shall not be liable 
                    for any indirect, incidental, special, consequential, or punitive damages 
                    arising out of or relating to your use of our Services.
                  </p>
                  <p>
                    Our total liability for any claim shall not exceed the amount of fees you 
                    have paid to us in the 12 months preceding the claim.
                  </p>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">9. Dispute Resolution</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Any disputes arising out of or relating to these Terms shall be resolved 
                    through binding arbitration in accordance with the rules of the American 
                    Arbitration Association.
                  </p>
                  <p>
                    You waive any right to participate in class-action lawsuits or class-wide 
                    arbitrations against Dominion Trust Capital.
                  </p>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">10. Changes to Terms</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    We may update these Terms from time to time. We will notify you of any 
                    material changes by posting the updated Terms on our website and sending 
                    you notice through your preferred communication method.
                  </p>
                  <p>
                    Continued use of our Services after such changes constitutes acceptance 
                    of the updated Terms.
                  </p>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">11. Termination</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    Either party may terminate this agreement at any time with proper notice. 
                    Upon termination:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>You must pay all outstanding fees and charges</li>
                    <li>We will close your accounts and return your funds</li>
                    <li>These Terms will continue to apply to past transactions</li>
                  </ul>
                </div>
              </Card>

              <Card variant="elevated" className="p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">12. Contact Information</h2>
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    If you have any questions about these Terms, please contact us:
                  </p>
                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <p><strong>Dominion Trust Capital</strong></p>
                    <p>Legal Department</p>
                    <p>123 Banking Street</p>
                    <p>Financial District, NY 10001</p>
                    <p><strong>Email:</strong> legal@dominiontrustcapital.com</p>
                    <p><strong>Phone:</strong> 1-800-DOMINION</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Bottom Notice */}
        <section className="py-20 bg-secondary/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card variant="elevated" className="bg-blue-50 border-blue-200 p-8">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <InformationCircleIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-blue-900">
                      Member FDIC
                    </h3>
                    <p className="text-blue-800 text-sm">
                      Dominion Trust Capital is a member of the Federal Deposit Insurance Corporation (FDIC). 
                      Your deposits are insured up to $250,000 per depositor, per bank, for each account 
                      ownership category.
                    </p>
                  </div>
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

export default TermsOfServicePage; 