'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { StarIcon } from '@heroicons/react/24/solid';
import Card from '../ui/Card';

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      location: 'San Francisco, CA',
      rating: 5,
      content: 'Dominion Trust Capital has completely transformed how I manage my business finances. The instant transfers and real-time notifications keep me always in control.',
      avatar: '/api/placeholder/40/40',
      company: 'Johnson & Co.'
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Software Engineer',
      location: 'Austin, TX',
      rating: 5,
      content: 'Finally, a bank that understands technology. The mobile app is incredibly intuitive and the security features give me peace of mind.',
      avatar: '/api/placeholder/40/40',
      company: 'Tech Solutions Inc.'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      role: 'Freelance Designer',
      location: 'New York, NY',
      rating: 5,
      content: 'No more hidden fees or confusing terms. Dominion Trust Capital is transparent, reliable, and their customer service is outstanding.',
      avatar: '/api/placeholder/40/40',
      company: 'Creative Studio'
    },
    {
      id: 4,
      name: 'David Thompson',
      role: 'Consultant',
      location: 'Chicago, IL',
      rating: 5,
      content: 'The international banking features are a game-changer for my business. Sending money overseas has never been this easy.',
      avatar: '/api/placeholder/40/40',
      company: 'Global Consulting'
    },
    {
      id: 5,
      name: 'Jessica Park',
      role: 'Marketing Director',
      location: 'Los Angeles, CA',
      rating: 5,
      content: 'I love the spending insights and budgeting tools. Dominion Trust Capital helps me stay on top of my financial goals effortlessly.',
      avatar: '/api/placeholder/40/40',
      company: 'Marketing Plus'
    },
    {
      id: 6,
      name: 'Robert Wilson',
      role: 'Architect',
      location: 'Seattle, WA',
      rating: 5,
      content: 'The security features are top-notch. I feel confident knowing my money is protected with bank-level encryption.',
      avatar: '/api/placeholder/40/40',
      company: 'Wilson Architecture'
    }
  ];

  const stats = [
    { value: '50,000+', label: 'Happy Customers' },
    { value: '4.9/5', label: 'Average Rating' },
    { value: '99.9%', label: 'Uptime' },
    { value: '$2B+', label: 'Assets Protected' }
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section id="testimonials" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Trusted by thousands of
            <br />
            <span className="text-primary">satisfied customers</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it. Here's what our customers are saying 
            about their experience with Dominion Trust Capital.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <div key={stat.label} className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            </div>
          ))}
        </motion.div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                variant="elevated"
                hover={true}
                className="h-full"
              >
                <div className="space-y-4">
                  {/* Quote Icon */}
                  <div className="flex justify-between items-start">
                    <svg className="h-8 w-8 text-primary/30" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-10zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
                    </svg>
                    <div className="flex space-x-1">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-muted-foreground italic">
                    "{testimonial.content}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center space-x-3 pt-4 border-t border-border">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role} • {testimonial.location}
                      </p>
                    </div>
                  </div>
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
          <Card
            variant="glass"
            className="max-w-2xl mx-auto"
          >
            <div className="text-center space-y-4">
              <div className="flex justify-center space-x-1 mb-4">
                {renderStars(5)}
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground">
                Join thousands of satisfied customers
              </h3>
              <p className="text-muted-foreground">
                Experience the difference with Dominion Trust Capital. 
                Open your account today and see why customers love banking with us.
              </p>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials; 