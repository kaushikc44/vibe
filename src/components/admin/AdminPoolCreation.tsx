// src/components/admin/AdminPoolCreation.tsx
'use client';

import { FC, useState } from 'react';
import { useIDOProgram } from '@/hooks/useIDOProgram';
import { PublicKey } from '@solana/web3.js';

export const AdminPoolCreation: FC = () => {
    const { initializePool } = useIDOProgram();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        tokenMint: '',
        treasury: '',
        totalAllocation: '',
        tokenPrice: '',
        minAllocation: '',
        maxAllocation: '',
        startTime: '',
        endTime: ''
    });
    const isValidPublicKey = (key: string): boolean => {
        try {
            new PublicKey(key);
            return true;
        } catch {
            return false;
        }
    };
    
    const validateInput = () => {
        if (!isValidPublicKey(formData.tokenMint)) {
            throw new Error('Invalid Token Mint Address');
        }
        if (!isValidPublicKey(formData.treasury)) {
            throw new Error('Invalid Treasury Address');
        }
        if (Number(formData.totalAllocation) <= 0) {
            throw new Error('Total allocation must be greater than 0');
        }
        if (Number(formData.tokenPrice) <= 0) {
            throw new Error('Token price must be greater than 0');
        }
        if (Number(formData.minAllocation) <= 0) {
            throw new Error('Min allocation must be greater than 0');
        }
        if (Number(formData.maxAllocation) <= Number(formData.minAllocation)) {
            throw new Error('Max allocation must be greater than min allocation');
        }
    };
    

    // src/components/admin/AdminPoolCreation.tsx

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
    
        try {
            console.log("Form Data:", formData); // Debug log
    
            const startTimestamp = Math.floor(new Date(formData.startTime).getTime() / 1000);
            const endTimestamp = Math.floor(new Date(formData.endTime).getTime() / 1000);
    
            await initializePool(
                {
                    tokenMint: formData.tokenMint.toString(),
                    treasury: formData.treasury.toString(),
                },
                {
                    totalAllocation: Number(formData.totalAllocation),
                    tokenPrice: Number(formData.tokenPrice),
                    minAllocation: Number(formData.minAllocation),
                    maxAllocation: Number(formData.maxAllocation),
                    startTime: startTimestamp,
                    endTime: endTimestamp,
                }
            );
    
            // Reset form
            setFormData({
                tokenMint: '',
                treasury: '',
                totalAllocation: '',
                tokenPrice: '',
                minAllocation: '',
                maxAllocation: '',
                startTime: '',
                endTime: ''
            });
    
        } catch (err) {
            console.error('Error creating pool:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <h2 className="card-title mb-4">Create New IDO Pool</h2>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Token Mint Address</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered"
                                value={formData.tokenMint}
                                onChange={(e) => setFormData({ ...formData, tokenMint: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Treasury Address</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered"
                                value={formData.treasury}
                                onChange={(e) => setFormData({ ...formData, treasury: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Total Allocation</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered"
                                value={formData.totalAllocation}
                                onChange={(e) => setFormData({ ...formData, totalAllocation: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Token Price (in SOL)</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered"
                                value={formData.tokenPrice}
                                onChange={(e) => setFormData({ ...formData, tokenPrice: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Min Allocation</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered"
                                value={formData.minAllocation}
                                onChange={(e) => setFormData({ ...formData, minAllocation: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Max Allocation</span>
                            </label>
                            <input
                                type="number"
                                className="input input-bordered"
                                value={formData.maxAllocation}
                                onChange={(e) => setFormData({ ...formData, maxAllocation: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Start Time</span>
                            </label>
                            <input
                                type="datetime-local"
                                className="input input-bordered"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">End Time</span>
                            </label>
                            <input
                                type="datetime-local"
                                className="input input-bordered"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-error mt-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="mt-6">
                        <button 
                            type="submit" 
                            className={`btn btn-primary w-full ${loading && 'loading'}`}
                            disabled={loading}
                        >
                            {loading ? 'Creating Pool...' : 'Create Pool'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};