'use client';

import { FC, useState, useEffect } from 'react';
import { useIDOProgram } from '@/hooks/useIDOProgram';
import { PublicKey } from '@solana/web3.js';

export const AdminPoolList: FC = () => {
    const { program } = useIDOProgram();
    const [pools, setPools] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPools = async () => {
            if (!program) return;
            
            try {
                // Fetch all pools using the program
                const allPools = await program.account.idoPool.all();
                setPools(allPools);
            } catch (error) {
                console.error('Error fetching pools:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPools();
    }, [program]);

    const handlePausePool = async (poolAddress: PublicKey) => {
        try {
            await program.methods
                .setPoolStatus(true)
                .accounts({
                    pool: poolAddress,
                })
                .rpc();
        } catch (error) {
            console.error('Error pausing pool:', error);
        }
    };

    const handleFinalizePool = async (poolAddress: PublicKey) => {
        try {
            await program.methods
                .finalizePool()
                .accounts({
                    pool: poolAddress,
                })
                .rpc();
        } catch (error) {
            console.error('Error finalizing pool:', error);
        }
    };

    if (loading) {
        return <div className="loading loading-lg"></div>;
    }

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title mb-4">Active IDO Pools</h2>

                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Token Mint</th>
                                <th>Total Allocation</th>
                                <th>Progress</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pools.map((pool) => (
                                <tr key={pool.publicKey.toString()}>
                                    <td>{pool.account.tokenMint.toString()}</td>
                                    <td>{pool.account.totalAllocation.toString()}</td>
                                    <td>
                                        <progress 
                                            className="progress progress-primary w-full" 
                                            value={(pool.account.totalAllocation - pool.account.remainingAllocation) / pool.account.totalAllocation * 100} 
                                            max="100"
                                        ></progress>
                                    </td>
                                    <td>
                                        {pool.account.finalized ? (
                                            <span className="badge badge-success">Finalized</span>
                                        ) : pool.account.paused ? (
                                            <span className="badge badge-warning">Paused</span>
                                        ) : (
                                            <span className="badge badge-primary">Active</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className="flex gap-2">
                                            <button 
                                                className="btn btn-sm btn-warning"
                                                onClick={() => handlePausePool(pool.publicKey)}
                                                disabled={pool.account.finalized}
                                            >
                                                Pause
                                            </button>
                                            <button 
                                                className="btn btn-sm btn-error"
                                                onClick={() => handleFinalizePool(pool.publicKey)}
                                                disabled={pool.account.finalized}
                                            >
                                                Finalize
                                            </button>
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