// src/app/page.tsx
'use client';

import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Image from 'next/image';
import Link from 'next/link';

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
  const StatCard = ({ title, value, desc }: { title: string; value: string; desc: string }) => (
    <div className="stat bg-secondary/50 rounded-xl transform transition-all duration-300 hover:shadow-lg hover:scale-102">
      <div className="stat-title text-gray-400">{title}</div>
      <div className="stat-value text-primary">
        {value}
      </div>
      <div className="stat-desc text-gray-400">{desc}</div>
    </div>
  );

  const FeatureCard = ({ feature }: { feature: typeof features[0] }) => (
    <div className="card bg-secondary/50 shadow-xl transition-all duration-300 hover:scale-102">
      <div className="card-body">
        <div className="text-4xl mb-4 inline-block">
          {feature.icon}
        </div>
        <h3 className="card-title text-white">{feature.title}</h3>
        <p className="text-gray-400">{feature.description}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary to-neutral">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-secondary/80 backdrop-blur-sm z-50">
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
              <Link href="/idotoken" className="text-white hover:text-primary transition-colors">
                IDO Token
              </Link>
              <WalletMultiButton className="btn btn-primary" />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <div className="hover:scale-105 transition-transform duration-300">
              <Image 
                src="/arise.png" 
                alt="Hero Logo" 
                width={200} 
                height={200}
                className="mb-8 drop-shadow-2xl"
              />
            </div>

            <h1 className="text-5xl font-bold text-white mb-6">
              Welcome to SOON ARISE
            </h1>

            <p className="text-xl text-gray-300 max-w-2xl mb-8">
              Launch your token with confidence on the most secure and decentralized platform
            </p>

            <div className="flex gap-4">
              <Link href="/admin" className="btn btn-primary btn-lg hover:scale-105 transition-transform">
                Launch Token
              </Link>
              <Link href="/idotoken" className="btn btn-outline btn-lg text-white hover:bg-primary hover:scale-105 transition-transform">
                Explore IDOs
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Why Choose Our Platform
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-secondary/80 py-8">
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
      </footer>
    </div>
  );
}