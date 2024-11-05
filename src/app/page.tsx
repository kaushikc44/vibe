'use client';

import { useState } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

const sampleProjects = [
    {
        name: "Project Alpha",
        symbol: "ALPHA",
        description: "Next-gen DeFi protocol",
        totalRaise: 100000,
        currentRaise: 75000,
        tokenPrice: 0.1,
        startTime: Date.now() + 86400000,
        endTime: Date.now() + (7 * 86400000),
        minAllocation: 100,
        maxAllocation: 1000,
        status: "active" as const
    },
    {
        name: "Project Beta",
        symbol: "BETA",
        description: "Decentralized NFT marketplace",
        totalRaise: 200000,
        currentRaise: 50000,
        tokenPrice: 0.2,
        startTime: Date.now() - 86400000,
        endTime: Date.now() + (3 * 86400000),
        minAllocation: 200,
        maxAllocation: 2000,
        status: "active" as const
    }
];

export default function Home() {
    const [activeTab, setActiveTab] = useState('active');

    return (
        <div className="min-h-screen bg-base-200">
            <div className="navbar bg-base-100">
                <div className="flex-1">
                    <a className="btn btn-ghost text-xl">IDO Launchpad</a>
                </div>
                <div className="flex-none">
                    <WalletMultiButton className="btn btn-primary" />
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="tabs tabs-boxed mb-6">
                    <a 
                        className={`tab ${activeTab === 'active' && 'tab-active'}`}
                        onClick={() => setActiveTab('active')}
                    >
                        Active
                    </a>
                    <a 
                        className={`tab ${activeTab === 'upcoming' && 'tab-active'}`}
                        onClick={() => setActiveTab('upcoming')}
                    >
                        Upcoming
                    </a>
                    <a 
                        className={`tab ${activeTab === 'ended' && 'tab-active'}`}
                        onClick={() => setActiveTab('ended')}
                    >
                        Ended
                    </a>
                </div>

                <div className="space-y-6">
                    {sampleProjects
                        .filter(project => project.status === activeTab)
                        .map((project, index) => (
                            <ProjectCard 
                                key={index} 
                                project={project}
                            />
                        ))}
                </div>
            </div>
        </div>
    );
}