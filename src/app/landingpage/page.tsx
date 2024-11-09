// src/app/page.tsx
'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const floatAnimation = {
  y: [0, -8, 0],
  transition: {
    duration: 2.5,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut"
  }
};

const iconFloat = {
  y: [0, -5, 0],
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatType: "reverse",
    ease: "easeInOut"
  }
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// Feature card data
const features = [
  {
    title: "Secure & Decentralized",
    description: "Built on Solana for maximum security and true decentralization",
    icon: "🛡️"
  },
  {
    title: "Fair Launch",
    description: "Equal opportunity for all participants with transparent allocation",
    icon: "⚖️"
  },
  {
    title: "Easy to Use",
    description: "Simple interface for both project creators and participants",
    icon: "🚀"
  }
];

// Stats card data
const stats = [
  {
    title: "Total Value Locked",
    value: "$120M+",
    desc: "↗︎ 400 (22%)"
  },
  {
    title: "Successful IDOs",
    value: "150+",
    desc: "Last 30 days"
  },
  {
    title: "Active Users",
    value: "50K+",
    desc: "↗︎ 1,200 (12%)"
  }
];

export default function Home() {
  const [isHoveredCard, setIsHoveredCard] = useState<number | null>(null);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

  const StatCard = ({ title, value, desc }: { title: string; value: string; desc: string }) => (
    <motion.div 
      variants={fadeIn}
      whileHover={{ scale: 1.02 }}
      className="stat bg-secondary/50 rounded-xl transform transition-all duration-300 hover:shadow-lg"
    >
      <div className="stat-title text-gray-400">{title}</div>
      <motion.div 
        className="stat-value text-primary"
        animate={floatAnimation}
      >
        {value}
      </motion.div>
      <div className="stat-desc text-gray-400">{desc}</div>
    </motion.div>
  );

  const FeatureCard = ({ feature, index }: { feature: typeof features[0]; index: number }) => (
    <motion.div
      variants={fadeIn}
      whileHover={{ scale: 1.02 }}
      className={`card bg-secondary/50 shadow-xl transition-all duration-300 ${
        isHoveredCard === index ? 'ring-2 ring-primary' : ''
      }`}
      onHoverStart={() => setIsHoveredCard(index)}
      onHoverEnd={() => setIsHoveredCard(null)}
    >
      <div className="card-body">
        <motion.div
          animate={iconFloat}
          className="text-4xl mb-4 inline-block"
        >
          {feature.icon}
        </motion.div>
        <h3 className="card-title text-white">{feature.title}</h3>
        <p className="text-gray-400">{feature.description}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-neutral">
      {/* Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="fixed top-0 w-full bg-secondary/80 backdrop-blur-sm z-50"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image 
                src="/arise.png" 
                alt="Logo" 
                width={40} 
                height={40}
                className="rounded-full"
              />
              <span className="text-white text-xl font-bold">SOON ARISE</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-white hover:text-primary transition-colors">
                Admin
              </Link>
              <WalletMultiButton className="btn btn-primary" />
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
            className="flex flex-col items-center text-center"
          >
            <motion.div
              animate={floatAnimation}
              className="hover:scale-105 transition-transform duration-300"
            >
              <Image 
                src="/arise.png" 
                alt="Hero Logo" 
                width={200} 
                height={200}
                className="mb-8 drop-shadow-2xl"
              />
            </motion.div>

            <motion.h1 
              variants={fadeIn}
              className="text-5xl font-bold text-white mb-6"
            >
              Welcome to SOON ARISE
            </motion.h1>

            <motion.p 
              variants={fadeIn}
              className="text-xl text-gray-300 max-w-2xl mb-8"
            >
              Launch your token with confidence on the most secure and decentralized platform
            </motion.p>

            <motion.div 
              variants={fadeIn}
              className="flex gap-4"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/admin" className="btn btn-primary btn-lg">
                  Launch Token
                </Link>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-outline btn-lg text-white hover:bg-primary"
              >
                Explore IDOs
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-secondary/50">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerChildren}
          className="container mx-auto px-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-20" ref={ref}>
        <motion.div 
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          variants={staggerChildren}
          className="container mx-auto px-4"
        >
          <motion.h2 
            variants={fadeIn}
            className="text-3xl font-bold text-center text-white mb-12"
          >
            Why Choose Our Platform
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} index={index} />
            ))}
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-secondary/80 py-8"
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Image 
                src="/arise.png" 
                alt="Logo" 
                width={30} 
                height={30}
                className="rounded-full"
              />
              <span className="text-white">© 2024 SOON ARISE</span>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-primary">Terms</a>
              <a href="#" className="text-gray-400 hover:text-primary">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-primary">Docs</a>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}