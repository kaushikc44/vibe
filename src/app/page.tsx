// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { ProjectCard } from '@/components/ProjectCard';
import { useIDOProgram } from '@/hooks/useIDOProgram';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

interface Pool {
    address: string;
    data: {
        authority: PublicKey;
        tokenMint: PublicKey;
        tokenVault: PublicKey;
        treasury: PublicKey;
        totalAllocation: number;
        remainingAllocation: number;
        tokenPrice: number;
        minAllocation: number;
        maxAllocation: number;
        startTime: number;
        endTime: number;
        paused: boolean;
        finalized: boolean;
    };
}

export default function Home() {
    const { getAllPools } = useIDOProgram();
    const wallet = useWallet();
    const [pools, setPools] = useState<Pool[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPools = async () => {
            if (!wallet.connected) {
                setError("Please connect your wallet first");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                console.log("Starting to fetch pools...");
                const fetchedPools = await getAllPools();
                console.log("Fetched pools successfully:", fetchedPools);
                setPools(fetchedPools);
            } catch (err) {
                console.error("Error fetching pools:", err);
                setError(
                    err instanceof Error 
                        ? err.message 
                        : 'Failed to fetch pools. Please try again.'
                );
            } finally {
                setLoading(false);
            }
        };

        // Only fetch pools when wallet is connected
        if (wallet.connected) {
            fetchPools();
        }

    }, [getAllPools, wallet.connected]);

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
                <h1 className="text-3xl font-bold mb-8">Active IDO Pools</h1>
                
                {!wallet.connected ? (
                    <div className="text-center p-8">
                        <p className="text-gray-500 mb-4">Please connect your wallet to view pools</p>
                        <WalletMultiButton className="btn btn-primary" />
                    </div>
                ) : loading ? (
                    <div className="flex justify-center items-center p-8">
                        <div className="loading loading-spinner loading-lg"></div>
                    </div>
                ) : error ? (
                    <div className="alert alert-error">
                        <span>{error}</span>
                        <button 
                            onClick={() => window.location.reload()} 
                            className="btn btn-sm btn-outline ml-4"
                        >
                            Retry
                        </button>
                    </div>
                ) : pools.length === 0 ? (
                    <div className="text-center p-8">
                        <p className="text-gray-500">No active pools found</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {pools.map((pool) => (
                            <ProjectCard 
                                key={pool.address}
                                address={pool.address}
                                pool={pool.data}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}