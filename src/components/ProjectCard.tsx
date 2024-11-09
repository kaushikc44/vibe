// src/components/ProjectCard.tsx
'use client';

import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useIDOProgram } from '@/hooks/useIDOProgram';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PublicKey } from '@solana/web3.js';

interface ProjectCardProps {
    address: string;
    pool: {
        authority: PublicKey;
        tokenMint: PublicKey;
        tokenVault: PublicKey;
        treasury: PublicKey;
        totalAllocation: number;
        remainingAllocation: number;  // This is what we'll use for progress
        tokenPrice: number;
        minAllocation: number;
        maxAllocation: number;
        startTime: number;
        endTime: number;
        paused: boolean;
        finalized: boolean;
    };
}

export const ProjectCard: FC<ProjectCardProps> = ({ address, pool }) => {
    const { connected } = useWallet();
    const { participate } = useIDOProgram();
    const [amount, setAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate progress using remainingAllocation
    const progress = ((pool.totalAllocation - pool.remainingAllocation) / pool.totalAllocation) * 100;
    const timeLeft = Math.max(0, Math.floor((pool.endTime - Date.now()) / (1000 * 60 * 60 * 24)));

    const handleParticipate = async () => {
        if (!amount) return;
        setError(null);
        setLoading(true);

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

    return (
        <div className="card w-full bg-base-100 shadow-xl">
            <div className="card-body">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <h2 className="card-title">
                        Pool: {pool.tokenMint.toString().slice(0, 8)}...
                    </h2>
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
                        <div className="stat-value text-lg">
                            {pool.tokenPrice / 1e9} SOL
                        </div>
                    </div>
                    
                    <div className="stat bg-base-200 rounded-box p-4">
                        <div className="stat-title">Allocation</div>
                        <div className="stat-value text-lg">
                            {pool.minAllocation} - {pool.maxAllocation}
                        </div>
                    </div>
                    
                    <div className="stat bg-base-200 rounded-box p-4">
                        <div className="stat-title">Time Left</div>
                        <div className="stat-value text-lg">
                            {timeLeft} days
                        </div>
                    </div>
                </div>

                {/* Progress Bar */}
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
                        <span>{pool.totalAllocation - pool.remainingAllocation} sold</span>
                        <span>{pool.totalAllocation} total</span>
                    </div>
                </div>

                {/* Participation Form */}
                {!pool.finalized && !pool.paused && (
                    <div className="flex gap-4 mt-4">
                        <input 
                            type="number" 
                            placeholder="Enter amount" 
                            className="input input-bordered flex-1"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min={pool.minAllocation}
                            max={pool.maxAllocation}
                        />
                        {connected ? (
                            <button 
                                className={`btn btn-primary ${loading && 'loading'}`}
                                onClick={handleParticipate}
                                disabled={loading || !amount}
                            >
                                Participate
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