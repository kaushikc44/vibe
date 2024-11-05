// src/components/ProjectCard.tsx
'use client';

import { FC, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useIDOProgram } from '@/hooks/useIDOProgram';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface ProjectCardProps {
    project: {
        name: string;
        symbol: string;
        description: string;
        totalRaise: number;
        currentRaise: number;
        tokenPrice: number;
        startTime: number;
        endTime: number;
        minAllocation: number;
        maxAllocation: number;
        status: 'active' | 'upcoming' | 'ended';
    };
}

export const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
    const { connected } = useWallet();
    const { participate } = useIDOProgram();
    const [amount, setAmount] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const progress = (project.currentRaise / project.totalRaise) * 100;
    const timeLeft = Math.max(0, Math.floor((project.endTime - Date.now()) / (1000 * 60 * 60 * 24)));

    return (
        <div className="card bg-neutral text-neutral-content shadow-xl mb-6">
            <div className="card-body p-6">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="card-title text-xl">
                            {project.name} ({project.symbol})
                        </h2>
                        <p className="text-gray-400 mt-1">{project.description}</p>
                    </div>
                    <div className="badge badge-primary badge-lg">
                        {project.status.toUpperCase()}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mb-6">
                    <div className="bg-neutral-focus rounded-lg p-4">
                        <div className="text-sm text-gray-400">Price</div>
                        <div className="text-xl font-bold">${project.tokenPrice}</div>
                    </div>
                    
                    <div className="bg-neutral-focus rounded-lg p-4">
                        <div className="text-sm text-gray-400">Allocation</div>
                        <div className="text-xl font-bold">
                            ${project.minAllocation} - ${project.maxAllocation}
                        </div>
                    </div>
                    
                    <div className="bg-neutral-focus rounded-lg p-4">
                        <div className="text-sm text-gray-400">Time Left</div>
                        <div className="text-xl font-bold">{timeLeft} days</div>
                    </div>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between mb-2">
                        <span className="text-gray-400">Progress</span>
                        <span className="text-gray-400">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-neutral-focus rounded-full h-4">
                        <div 
                            className="bg-primary h-4 rounded-full" 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-400">
                        <span>${project.currentRaise.toLocaleString()}</span>
                        <span>${project.totalRaise.toLocaleString()}</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <input 
                        type="number" 
                        placeholder={`Enter amount between $${project.minAllocation} and $${project.maxAllocation}`}
                        className="input input-bordered flex-1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={project.minAllocation}
                        max={project.maxAllocation}
                        disabled={loading}
                    />
                    {connected ? (
                        <button 
                            className={`btn btn-primary min-w-[150px] ${loading && 'loading'}`}
                            onClick={() => participate(Number(amount))}
                            disabled={loading || !amount}
                        >
                            {loading ? 'Processing...' : 'Participate'}
                        </button>
                    ) : (
                        <WalletMultiButton className="btn btn-primary min-w-[150px]" />
                    )}
                </div>

                {error && (
                    <div className="alert alert-error mt-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                {amount === '' && !error && (
                    <div className="mt-4 text-sm text-gray-400">
                        Enter an amount between ${project.minAllocation} and ${project.maxAllocation}
                    </div>
                )}
            </div>
        </div>
    );
};