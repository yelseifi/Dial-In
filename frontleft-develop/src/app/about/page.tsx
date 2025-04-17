'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-black py-12 font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Hero section with fade-in animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="bg-gradient-to-r from-blue-950 to-purple-950 rounded-2xl p-10 mb-12 border border-blue-800/30 shadow-xl shadow-blue-900/10"
        >
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"
          >
            About Dial In
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="text-xl text-blue-100 leading-relaxed"
          >
            Connecting electronic music producers with rave-goers through memorable moments.
          </motion.p>
        </motion.div>

        {/* Main content with animations triggered on scroll */}
        <div className="space-y-12">
          <AnimatedSection>
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-10 border border-blue-900/20 shadow-lg hover:shadow-blue-900/10 transition-all duration-300">
              <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Dial In is a platform that bridges the gap between music producers and the dance floor. We believe that hearing your track played by a DJ is one of the most exciting moments for any producer, and we want to help capture these special moments.
              </p>
              <p className="text-gray-300 leading-relaxed">
                By connecting producers with fans who are dialed in to the dance floor, we create a community that celebrates and documents these accomplishments.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-10 border border-blue-900/20 shadow-lg hover:shadow-blue-900/10 transition-all duration-300">
              <h2 className="text-3xl font-bold text-white mb-6">How It Works</h2>
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="bg-blue-950/30 rounded-xl p-6 border border-blue-900/30"
                >
                  <h3 className="text-xl font-semibold text-blue-400 mb-3">For Producers</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Post bounties for your tracks, set rewards, and get video proof when DJs play your music. Whether you're an established artist or just starting out, Dial In helps you track your music's journey through the club scene.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="bg-purple-950/30 rounded-xl p-6 border border-purple-900/30"
                >
                  <h3 className="text-xl font-semibold text-purple-400 mb-3">For Fans</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Earn rewards by capturing and sharing moments when DJs play tracked songs. Be part of the producer's journey and help document their wins while enjoying the music you love.
                  </p>
                </motion.div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-2xl p-10 border border-blue-900/20 shadow-lg hover:shadow-blue-900/10 transition-all duration-300">
              <div className="flex items-center mb-8">
                <h2 className="text-3xl font-bold text-white">Why Dial In?</h2>
                <div className="h-px flex-grow bg-gradient-to-r from-blue-500/30 to-transparent ml-6"></div>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <FeatureItem 
                    delay={0.2}
                    icon={
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    }
                    title="Instant Rewards"
                    description="Get paid for capturing and sharing special moments in electronic music."
                  />
                  <FeatureItem 
                    delay={0.3}
                    icon={
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    }
                    title="Community Driven"
                    description="Built by and for people who love electronic music culture."
                  />
                </div>
                <div className="space-y-8">
                  <FeatureItem 
                    delay={0.4}
                    icon={
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    }
                    title="Track Progress"
                    description="See where and when your music is being played in real venues."
                  />
                  <FeatureItem 
                    delay={0.5}
                    icon={
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    }
                    title="Real-time Updates"
                    description="Get notified when your tracks are played and captured."
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection>
            <div className="bg-gradient-to-r from-blue-950 to-purple-950 rounded-2xl p-10 border border-blue-800/30 shadow-xl shadow-blue-900/10 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-8">Ready to Get Started?</h2>
                <div className="flex flex-wrap gap-5">
                  <motion.a
                    href="/bounties/new"
                    className="inline-flex items-center px-8 py-3 text-white bg-blue-600 rounded-xl font-semibold hover:bg-blue-500 transition-all duration-300 shadow-lg shadow-blue-600/20 transform hover:-translate-y-0.5"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Post Your First Bounty
                  </motion.a>
                  <motion.a
                    href="/"
                    className="inline-flex items-center px-8 py-3 border border-blue-400/30 text-white bg-transparent rounded-xl font-semibold hover:bg-white/10 backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-0.5"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Browse Active Bounties
                  </motion.a>
                </div>
              </div>
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              />
              <motion.div 
                className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-blue-600/10 blur-3xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.5, 0.3],
                }}
                transition={{ 
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              <motion.div 
                className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl"
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  opacity: [0.4, 0.2, 0.4],
                }}
                transition={{ 
                  duration: 10,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </main>
  );
}

// Component for animated sections that trigger when scrolled into view
function AnimatedSection({ children }: { children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

// Component for individual feature items with icons
function FeatureItem({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
  return (
    <motion.div 
      className="flex items-start"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <motion.div 
        className="flex-shrink-0"
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.2, duration: 0.3, type: "spring" }}
      >
        <div className="flex items-center justify-center h-14 w-14 rounded-xl bg-blue-900/30 text-blue-300 border border-blue-800/40">
          {icon}
        </div>
      </motion.div>
      <div className="ml-5">
        <h3 className="text-lg font-medium text-white">{title}</h3>
        <p className="mt-2 text-gray-300 leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}