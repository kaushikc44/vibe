// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useIDOProgram } from '@/hooks/useIDOProgram';
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

const IDOPoolCard = ({ pool, address }: { pool: Pool['data']; address: string }) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { participate } = useIDOProgram();
    const { connected } = useWallet();

    const handleParticipate = async () => {
        if (!amount || !connected) return;
        setLoading(true);
        setError(null);

        try {
            const tx = await participate({
                poolAddress: address,
                amount: Number(amount)
            });
            console.log('Participation successful:', tx);
            setAmount('');
        } catch (err) {
            console.error('Error participating:', err);
            setError(err instanceof Error ? err.message : 'Failed to participate');
        } finally {
            setLoading(false);
        }
    };

    const soldAmount = pool.totalAllocation - pool.remainingAllocation;
    const progress = (soldAmount / pool.totalAllocation) * 100;
    const timeLeft = Math.max(0, Math.floor((pool.endTime - Date.now() / 1000) / (60 * 60 * 24)));
    const isActive = !pool.finalized && !pool.paused && timeLeft > 0;

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="card-title">Token: {pool.tokenMint.toString().slice(0, 8)}...</h2>
                        <p className="text-sm opacity-70">Pool: {address.slice(0, 8)}...</p>
                    </div>
                    <div className={`badge ${
                        pool.finalized ? 'badge-error' : 
                        pool.paused ? 'badge-warning' : 
                        'badge-success'
                    }`}>
                        {pool.finalized ? 'Ended' : pool.paused ? 'Paused' : 'Active'}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 my-4">
                    <div className="stat bg-base-200 rounded-box p-4">
                        <div className="stat-title">Price</div>
                        <div className="stat-value text-lg">{pool.tokenPrice / 1e9} SOL</div>
                    </div>
                    
                    <div className="stat bg-base-200 rounded-box p-4">
                        <div className="stat-title">Allocation</div>
                        <div className="stat-value text-lg">
                            {pool.minAllocation} - {pool.maxAllocation}
                        </div>
                    </div>
                    
                    <div className="stat bg-base-200 rounded-box p-4">
                        <div className="stat-title">Time Left</div>
                        <div className="stat-value text-lg">{timeLeft} days</div>
                    </div>
                </div>

                {/* Progress */}
                <div className="my-4">
                    <div className="flex justify-between mb-2">
                        <span>Progress</span>
                        <span>{progress.toFixed(1)}%</span>
                    </div>
                    <progress 
                        className="progress progress-primary w-full" 
                        value={progress} 
                        max="100"
                    />
                    <div className="flex justify-between mt-2 text-sm opacity-70">
                        <span>{soldAmount.toLocaleString()} sold</span>
                        <span>{pool.totalAllocation.toLocaleString()} total</span>
                    </div>
                </div>

                {/* Participation Form */}
                {isActive && (
                    <div className="flex gap-4 mt-4">
                        <input 
                            type="number" 
                            placeholder={`Enter amount (${pool.minAllocation}-${pool.maxAllocation})`}
                            className="input input-bordered flex-1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min={pool.minAllocation}
                            max={pool.maxAllocation}
                            disabled={loading || !connected}
                        />
                        {connected ? (
                            <button 
                                className={`btn btn-primary ${loading && 'loading'}`}
                                onClick={handleParticipate}
                                disabled={loading || !amount || 
                                    Number(amount) < pool.minAllocation || 
                                    Number(amount) > pool.maxAllocation}
                            >
                                {loading ? 'Processing...' : 'Participate'}
                            </button>
                        ) : (
                            <WalletMultiButton className="btn btn-primary" />
                        )}
                    </div>
                )}

                {error && (
                    <div className="alert alert-error mt-4">
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default function Home() {
    const { getAllPools } = useIDOProgram();
    const { connected } = useWallet();
    const [pools, setPools] = useState<Pool[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPools = async () => {
        if (!connected) return;

        try {
            setLoading(true);
            setError(null);
            const fetchedPools = await getAllPools();
            console.log('Fetched pools:', fetchedPools);
            setPools(fetchedPools);
        } catch (err) {
            console.error('Error fetching pools:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch pools');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let mounted = true;

        if (connected && mounted) {
            fetchPools();
        }

        return () => {
            mounted = false;
        };
    }, [connected]);

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
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Active IDO Pools</h1>
                    {connected && (
                        <button 
                            onClick={fetchPools}
                            className={`btn btn-outline ${loading ? 'loading' : ''}`}
                            disabled={loading}
                        >
                            Refresh Pools
                        </button>
                    )}
                </div>

                {!connected ? (
                    <div className="text-center p-8">
                        <p className="text-gray-500 mb-4">Connect your wallet to view and participate in IDO pools</p>
                        <WalletMultiButton className="btn btn-primary" />
                    </div>
                ) : loading && pools.length === 0 ? (
                    <div className="flex justify-center items-center p-8">
                        <div className="loading loading-spinner loading-lg"></div>
                    </div>
                ) : error ? (
                    <div className="alert alert-error">
                        <span>{error}</span>
                        <button 
                            onClick={fetchPools} 
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
                            <IDOPoolCard 
                                key={pool.address}
                                pool={pool.data}
                                address={pool.address}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}