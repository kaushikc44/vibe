'use client';

import { FC, useState, useEffect } from 'react';
import { useIDOProgram } from '@/hooks/useIDOProgram';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

export const AdminPoolList: FC = () => {
    const { program, finalizePool } = useIDOProgram();
    const { publicKey } = useWallet();
    const [pools, setPools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPools = async () => {
        if (!program) return;
        
        try {
            setLoading(true);
            const allPools = await program.account.idoPool.all();
            setPools(allPools);
        } catch (error) {
            console.error('Error fetching pools:', error);
            setError('Failed to fetch pools');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPools();
    }, [program]);

    const handlePausePool = async (poolAddress: PublicKey) => {
        try {
            setLoading(true);
            await program.methods
                .setPoolStatus(true)
                .accounts({
                    pool: poolAddress,
                    authority: publicKey
                })
                .rpc();
            await fetchPools(); // Refresh the list
        } catch (error) {
            console.error('Error pausing pool:', error);
            setError('Failed to pause pool');
        } finally {
            setLoading(false);
        }
    };

    const handleFinalizePool = async (poolAddress: PublicKey) => {
        try {
            setLoading(true);
            const poolAccount = await program.account.idoPool.fetch(poolAddress);
            
            // Get the authority token account
            const authorityTokenAccount = await getAssociatedTokenAddress(
                poolAccount.tokenMint,
                publicKey
            );

            await program.methods
                .finalizePool()
                .accounts({
                    pool: poolAddress,
                    authority: publicKey,
                    tokenVault: poolAccount.tokenVault,
                    authorityTokenAccount: authorityTokenAccount,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .rpc();
            
            await fetchPools(); // Refresh the list
        } catch (error) {
            console.error('Error finalizing pool:', error);
            setError('Failed to finalize pool');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading loading-lg"></div>;
    }

    const canFinalize = (pool: any) => {
        const now = Math.floor(Date.now() / 1000);
        return !pool.account.finalized && pool.account.endTime < now;
    };

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="card-title">Active IDO Pools</h2>
                    <button 
                        className="btn btn-outline btn-sm"
                        onClick={fetchPools}
                        disabled={loading}
                    >
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="alert alert-error mb-4">
                        <span>{error}</span>
                        <button 
                            className="btn btn-sm btn-ghost"
                            onClick={() => setError(null)}
                        >
                            Dismiss
                        </button>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Token Mint</th>
                                <th>Total Allocation</th>
                                <th>Progress</th>
                                <th>Status</th>
                                <th>End Time</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pools.map((pool) => (
                                <tr key={pool.publicKey.toString()}>
                                    <td>{pool.account.tokenMint.toString()}</td>
                                    <td>{pool.account.totalAllocation.toString()}</td>
                                    <td>
                                        <div>
                                            <progress 
                                                className="progress progress-primary w-full" 
                                                value={(pool.account.totalAllocation - pool.account.remainingAllocation) / pool.account.totalAllocation * 100} 
                                                max="100"
                                            ></progress>
                                            <div className="text-xs mt-1">
                                                {pool.account.remainingAllocation.toString()} remaining
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {pool.account.finalized ? (
                                            <span className="badge badge-error">Finalized</span>
                                        ) : pool.account.paused ? (
                                            <span className="badge badge-warning">Paused</span>
                                        ) : (
                                            <span className="badge badge-success">Active</span>
                                        )}
                                    </td>
                                    <td>
                                        {new Date(pool.account.endTime * 1000).toLocaleDateString()}
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            {!pool.account.finalized && (
                                                <button 
                                                    className="btn btn-sm btn-warning"
                                                    onClick={() => handlePausePool(pool.publicKey)}
                                                    disabled={loading}
                                                >
                                                    {pool.account.paused ? 'Unpause' : 'Pause'}
                                                </button>
                                            )}
                                            {canFinalize(pool) && (
                                                <button 
                                                    className="btn btn-sm btn-error"
                                                    onClick={() => handleFinalizePool(pool.publicKey)}
                                                    disabled={loading || pool.account.finalized}
                                                    title={pool.account.finalized ? 'Already finalized' : ''}
                                                >
                                                    Finalize
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};