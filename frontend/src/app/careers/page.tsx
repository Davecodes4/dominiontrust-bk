'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BriefcaseIcon,
  UserGroupIcon,
  MapPinIcon,
  ClockIcon,
  ChevronRightIcon,
  HeartIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

const CareersPage: React.FC = () => {
  const jobOpenings = [
    {
      title: 'Senior Software Engineer',
      department: 'Technology',
      location: 'New York, NY',
      type: 'Full-time',
      description: 'Build and maintain our core banking platform and mobile applications.',
      requirements: ['5+ years experience', 'React/TypeScript', 'Node.js', 'AWS']
    },
    {
      title: 'Product Manager',
      department: 'Product',
      location: 'San Francisco, CA',
      type: 'Full-time',
      description: 'Drive product strategy and roadmap for our digital banking products.',
      requirements: ['3+ years PM experience', 'FinTech background', 'Data-driven mindset']
    },
    {
      title: 'Risk Analyst',
      department: 'Risk Management',
      location: 'Chicago, IL',
      type: 'Full-time',
      description: 'Analyze credit risk and develop risk assessment models.',
      requirements: ['Financial modeling', 'SQL/Python', 'Risk management experience']
    },
    {
      title: 'Customer Success Manager',
      department: 'Customer Experience',
      location: 'Remote',
      type: 'Full-time',
      description: 'Ensure customer satisfaction and drive retention initiatives.',
      requirements: ['3+ years CS experience', 'Banking knowledge', 'Excellent communication']
    },
    {
      title: 'UX Designer',
      department: 'Design',
      location: 'Los Angeles, CA',
      type: 'Full-time',
      description: 'Design intuitive user experiences for our banking applications.',
      requirements: ['4+ years UX design', 'Figma/Sketch', 'Mobile-first design']
    },
    {
      title: 'Data Scientist',
      department: 'Analytics',
      location: 'Austin, TX',
      type: 'Full-time',
      description: 'Develop machine learning models for fraud detection and personalization.',
      requirements: ['Python/R', 'Machine learning', 'Statistical analysis', 'PhD preferred']
    }
  ];

  const benefits = [
    {
      icon: HeartIcon,
      title: 'Health & Wellness',
      description: 'Comprehensive health insurance, mental health support, and wellness programs.'
    },
    {
      icon: AcademicCapIcon,
      title: 'Learning & Development',
      description: 'Continuous learning opportunities, conference attendance, and skill development.'
    },
    {
      icon: ClockIcon,
      title: 'Work-Life Balance',
      description: 'Flexible work arrangements, unlimited PTO, and family-friendly policies.'
    },
    {
      icon: GlobeAltIcon,
      title: 'Remote Work',
      description: 'Work from anywhere with full remote and hybrid options available.'
    }
  ];

  const values = [
    {
      title: 'Innovation First',
      description: 'We embrace new technologies and creative solutions to revolutionize banking.',
      color: 'bg-blue-500'
    },
    {
      title: 'Customer Obsessed',
      description: 'Every decision we make is centered around delivering exceptional customer experiences.',
      color: 'bg-green-500'
    },
    {
      title: 'Integrity Always',
      description: 'We operate with the highest ethical standards and complete transparency.',
      color: 'bg-purple-500'
    },
    {
      title: 'Growth Mindset',
      description: 'We believe in continuous learning and supporting each other\'s professional development.',
      color: 'bg-orange-500'
    }
  ];

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
                <BriefcaseIcon className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Join Our Mission
                <br />
                <span className="text-primary">Shape the Future of Banking</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Be part of a team that's revolutionizing financial services with innovation, 
                integrity, and a customer-first approach.
              </p>
              <Button size="lg">
                View Open Positions
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Company Stats */}
        <section className="py-16 bg-secondary/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card variant="gradient" className="p-12 text-white">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
                  <div>
                    <div className="text-4xl font-bold text-white mb-2">500+</div>
                    <div className="text-white/80">Team Members</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white mb-2">15+</div>
                    <div className="text-white/80">Office Locations</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white mb-2">95%</div>
                    <div className="text-white/80">Employee Satisfaction</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-white mb-2">$2M+</div>
                    <div className="text-white/80">Customers Served</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </section>

        {/* Company Values */}
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
                Our Values
              </h2>
              <p className="text-xl text-muted-foreground">
                The principles that guide everything we do
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
                    <div className="flex items-start space-x-4">
                      <div className={`w-3 h-3 rounded-full ${value.color} mt-2 flex-shrink-0`} />
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-foreground">
                          {value.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
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
                Why Work With Us?
              </h2>
              <p className="text-xl text-muted-foreground">
                We believe in taking care of our team members
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
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <benefit.icon className="h-8 w-8 text-primary" />
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

        {/* Job Openings */}
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
                Open Positions
              </h2>
              <p className="text-xl text-muted-foreground">
                Find your next opportunity with us
              </p>
            </motion.div>

            <div className="space-y-6">
              {jobOpenings.map((job, index) => (
                <motion.div
                  key={job.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card variant="elevated" hover={true} className="cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                              {job.title}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                              <span className="flex items-center space-x-1">
                                <UserGroupIcon className="h-4 w-4" />
                                <span>{job.department}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <MapPinIcon className="h-4 w-4" />
                                <span>{job.location}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <ClockIcon className="h-4 w-4" />
                                <span>{job.type}</span>
                              </span>
                            </div>
                          </div>
                          <ChevronRightIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        
                        <p className="text-muted-foreground">
                          {job.description}
                        </p>
                        
                        <div className="flex flex-wrap gap-2">
                          {job.requirements.map((req, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mt-12"
            >
              <p className="text-muted-foreground mb-6">
                Don't see a position that fits? We're always looking for talented individuals.
              </p>
              <Button variant="outline" size="lg">
                Send Us Your Resume
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Interview Process */}
        <section className="py-20 bg-secondary/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Our Interview Process
              </h2>
              <p className="text-xl text-muted-foreground">
                What to expect when you apply
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { step: '1', title: 'Application', description: 'Submit your resume and cover letter' },
                { step: '2', title: 'Phone Screen', description: 'Brief conversation with our recruiting team' },
                { step: '3', title: 'Technical Interview', description: 'Demonstrate your skills and expertise' },
                { step: '4', title: 'Final Interview', description: 'Meet the team and discuss culture fit' }
              ].map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary-foreground font-bold">{step.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Card variant="gradient" className="p-12 text-white text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Join Us?
                </h2>
                <p className="text-xl text-white/90 mb-8">
                  Take the next step in your career and help us build the future of banking.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="bg-white !text-green-600 hover:bg-white/90"
                  >
                    Browse Jobs
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white text-white hover:bg-white hover:!text-green-600"
                  >
                    Learn More About Us
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

export default CareersPage; 