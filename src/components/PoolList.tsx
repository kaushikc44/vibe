// src/components/PoolList.tsx
'use client';

import { FC, useEffect, useState } from 'react';
import { useIDOProgram } from '@/hooks/useIDOProgram';
import { ProjectCard } from "../components/ProjectCard"
import { PublicKey } from '@solana/web3.js';

interface IDOPool {
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
}

export const PoolList: FC = () => {
    const { program, getPoolInfo } = useIDOProgram();
    const [pools, setPools] = useState<{ address: string; data: IDOPool }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPools = async () => {
            if (!program) return;
            try {
                // Fetch all pool accounts
                const poolAccounts = await program.account.idoPool.all();
                const poolsData = await Promise.all(
                    poolAccounts.map(async (account) => ({
                        address: account.publicKey.toString(),
                        data: account.account as unknown as IDOPool
                    }))
                );
                setPools(poolsData);
            } catch (error) {
                console.error('Error fetching pools:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPools();
    }, [program]);

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            {pools.map((pool) => (
                <ProjectCard 
                    key={pool.address} 
                    address={pool.address}
                    pool={pool.data}
                />
            ))}
            {pools.length === 0 && (
                <div className="text-center p-8">
                    <p className="text-gray-500">No active pools found</p>
                </div>
            )}
        </div>
    );
};